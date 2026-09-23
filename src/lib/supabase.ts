import { createClient } from "@supabase/supabase-js";

// Canonical project configuration
const CANONICAL_URL = "https://ebyhgllzwayrkhwwyvba.supabase.co";
const CANONICAL_ANON_KEY = "sb_publishable_dF4Lu5WtR5l1H6jmNFQl7A_Xw15G04Z";

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_URL : undefined) ||
  CANONICAL_URL;

const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== "undefined" ? process.env?.VITE_SUPABASE_ANON_KEY : undefined) ||
  CANONICAL_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
