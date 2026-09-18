import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://llhfumrtotectnbpeabu.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_moHL6HEUhoVavz-Xg2v7Cw_SZvDHaMF";

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


