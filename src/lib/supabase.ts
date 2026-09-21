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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});


