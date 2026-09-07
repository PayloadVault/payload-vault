-- ============================================================
-- Shared (database-backed) rate limiting for the Gemini-backed
-- receipt extraction edge function.
--
-- The edge function previously counted requests in a Map held by a
-- single warm isolate. Supabase runs many isolates concurrently and
-- recycles them, so that limit was effectively unenforced and the
-- Google API key could be burned by a single authenticated user.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_extraction_usage (
  user_id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  minute_window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  minute_count        INTEGER NOT NULL DEFAULT 0,
  day_window_start    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  day_count           INTEGER NOT NULL DEFAULT 0,
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Counters are infrastructure, not user data: no policies, no client access.
ALTER TABLE public.ai_extraction_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_extraction_usage FROM anon, authenticated;

-- Atomically records one usage and reports whether it stayed within budget.
-- The ON CONFLICT ... DO UPDATE row lock serialises concurrent invocations,
-- so parallel edge-function isolates cannot race past the limit.
CREATE OR REPLACE FUNCTION public.consume_ai_extraction_quota(
  p_user_id      UUID,
  p_minute_limit INTEGER DEFAULT 10,
  p_day_limit    INTEGER DEFAULT 200
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  now_utc TIMESTAMP WITH TIME ZONE := timezone('utc'::text, now());
  usage   public.ai_extraction_usage;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.ai_extraction_usage AS u (
    user_id, minute_window_start, minute_count, day_window_start, day_count, updated_at
  )
  VALUES (p_user_id, now_utc, 1, now_utc, 1, now_utc)
  ON CONFLICT (user_id) DO UPDATE SET
    minute_count = CASE
      WHEN now_utc - u.minute_window_start >= interval '1 minute' THEN 1
      ELSE u.minute_count + 1
    END,
    minute_window_start = CASE
      WHEN now_utc - u.minute_window_start >= interval '1 minute' THEN now_utc
      ELSE u.minute_window_start
    END,
    day_count = CASE
      WHEN now_utc - u.day_window_start >= interval '1 day' THEN 1
      ELSE u.day_count + 1
    END,
    day_window_start = CASE
      WHEN now_utc - u.day_window_start >= interval '1 day' THEN now_utc
      ELSE u.day_window_start
    END,
    updated_at = now_utc
  RETURNING * INTO usage;

  RETURN usage.minute_count <= greatest(p_minute_limit, 1)
     AND usage.day_count <= greatest(p_day_limit, 1);
END;
$$;

-- Only the edge function (service_role) may spend quota; end users must not be
-- able to call this and inflate or reset someone else's counters.
REVOKE ALL ON FUNCTION public.consume_ai_extraction_quota(UUID, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_ai_extraction_quota(UUID, INTEGER, INTEGER) TO service_role;
