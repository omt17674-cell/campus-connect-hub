import { createClient } from "@supabase/supabase-js";

// Canonical environment variable configuration only
const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_URL : undefined) ||
  "";

const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_ANON_KEY : undefined) ||
  "";

// Fail loudly in browser if required environment variables are missing
if (typeof window !== "undefined") {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[Supabase Client] ❌ FATAL CONFIGURATION ERROR: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY environment variables are missing. " +
        "Ensure they are configured in your .env or deployment platform (Vercel) settings."
    );
  } else {
    console.info("[Supabase Client] Canonical Supabase endpoint configured:", supabaseUrl);
    
    // Quick connectivity check
    fetch(`${supabaseUrl}/rest/v1/`, {
      method: "HEAD",
      headers: { apikey: supabaseAnonKey },
    })
      .then((res) => {
        if (!res.ok) {
          console.error(
            `[Supabase Client] ❌ Database connectivity check returned HTTP ${res.status}. Check project status or API keys.`
          );
        } else {
          console.info("[Supabase Client] ✅ Supabase project connection verified.");
        }
      })
      .catch((err) => {
        console.error("[Supabase Client] ❌ Connection error:", err);
      });
  }
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
