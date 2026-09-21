import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://dfl4luw5tr5l1h6jmnfql7a.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_dF4Lu5WtR5l1H6jmNFQl7A_Xw15G04Z";

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_URL : undefined) ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_ANON_KEY : undefined) ||
  DEFAULT_SUPABASE_ANON_KEY;

// Startup diagnostics — log once so misconfigurations are caught immediately
if (typeof window !== "undefined") {
  const isUsingFallback =
    !import.meta.env?.VITE_SUPABASE_URL &&
    !(typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL);

  if (isUsingFallback) {
    console.warn(
      "[Supabase Client] ⚠️ VITE_SUPABASE_URL env var is not set — using hardcoded fallback.",
      "If this is a Vercel deployment, set the env var in Vercel → Project → Settings → Environment Variables.",
    );
  }

  console.info("[Supabase Client] Connecting to:", supabaseUrl);

  // Fire-and-forget connectivity check on page load
  fetch(`${supabaseUrl}/rest/v1/`, {
    method: "HEAD",
    headers: { apikey: supabaseAnonKey },
  })
    .then((res) => {
      if (!res.ok) {
        console.error(
          `[Supabase Client] ❌ Connectivity check failed (HTTP ${res.status}). ` +
            `The Supabase project may be paused, or the URL/key is wrong.`,
        );
      } else {
        console.info("[Supabase Client] ✅ Supabase project is reachable.");
      }
    })
    .catch((err) => {
      console.error(
        "[Supabase Client] ❌ Cannot reach Supabase at all — 'Failed to fetch'. " +
          "Possible causes: project paused, wrong URL, CORS block, or network issue.",
        err,
      );
    });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
