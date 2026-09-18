import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_URL : undefined) ||
  "";

const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_ANON_KEY : undefined) ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in environment variables.");
}

export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder-key", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Admin / Service Role client for backend server operations
const supabaseServiceKey =
  (typeof process !== "undefined" ? process.env?.SUPABASE_SERVICE_ROLE_KEY : undefined) ||
  supabaseAnonKey;

export const supabaseAdmin = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseServiceKey || supabaseAnonKey || "placeholder-key", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

