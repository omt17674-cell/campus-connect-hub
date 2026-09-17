import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  "https://llhfumrtotectnbpeabu.supabase.co";

const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
  "sb_publishable_moHL6HEUhoVavz-Xg2v7Cw_SZvDHaMF";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Admin / Service Role client for backend server operations
const supabaseServiceKey =
  (typeof process !== "undefined" && process.env?.SUPABASE_SERVICE_ROLE_KEY) ||
  "sb_secret_gWl2b05pD9aoDJqcevWRsg_wQDKkwLV";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
