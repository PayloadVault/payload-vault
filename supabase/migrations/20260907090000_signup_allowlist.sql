-- ============================================================
-- Server-side enforcement of the registration allowlist.
--
-- The client previously checked the e-mail against a list bundled
-- into the browser JS (VITE_ALLOWED_EMAILS). That check is trivially
-- bypassed by calling GoTrue directly with the public anon key, so
-- anyone could create an account. Enforcement now lives in the
-- database and cannot be skipped by the client.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.signup_allowlist (
  pattern    TEXT PRIMARY KEY,
  note       TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  -- Either a full address ("name@example.com") or a whole domain ("@example.com").
  CONSTRAINT signup_allowlist_pattern_format CHECK (
    pattern = lower(pattern)
    AND length(pattern) BETWEEN 3 AND 320
    AND (pattern LIKE '@%' OR position('@' IN pattern) > 1)
  )
);

-- No policies are defined on purpose: the list is readable/writable only by
-- the table owner and service_role. The browser must never see it.
ALTER TABLE public.signup_allowlist ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.signup_allowlist FROM anon, authenticated;

-- Seed with the company domain used throughout the UI. REVIEW THIS before
-- go-live and add/remove entries as needed:
--   INSERT INTO public.signup_allowlist (pattern) VALUES ('person@example.com');
INSERT INTO public.signup_allowlist (pattern, note)
VALUES ('@pro-fina.de', 'Company domain — review before go-live')
ON CONFLICT (pattern) DO NOTHING;

CREATE OR REPLACE FUNCTION public.enforce_signup_allowlist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  normalized TEXT := lower(btrim(COALESCE(NEW.email, '')));
  email_domain TEXT;
BEGIN
  IF normalized = '' OR position('@' IN normalized) < 2 THEN
    RAISE EXCEPTION 'signup_not_allowed'
      USING ERRCODE = 'check_violation',
            HINT = 'This e-mail address is not approved for registration.';
  END IF;

  email_domain := '@' || split_part(normalized, '@', 2);

  IF EXISTS (
    SELECT 1
    FROM public.signup_allowlist
    WHERE pattern = normalized
       OR pattern = email_domain
  ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'signup_not_allowed'
    USING ERRCODE = 'check_violation',
          HINT = 'This e-mail address is not approved for registration.';
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_signup_allowlist() FROM PUBLIC;

DROP TRIGGER IF EXISTS enforce_signup_allowlist ON auth.users;
CREATE TRIGGER enforce_signup_allowlist
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_signup_allowlist();
