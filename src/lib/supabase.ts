import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail loudly on a misconfigured build instead of shipping a client that
// silently throws on first use. Neither value is a secret (the anon key is
// designed to be public and is only useful together with RLS), so no secret
// material is revealed here.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase configuration missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at build time.",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // PKCE keeps confirmation/recovery links from carrying a usable access
    // token in the URL fragment (browser history, referrers, shared links).
    // The link only carries a one-time code that is worthless without the
    // verifier held in this browser.
    flowType: "pkce",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
