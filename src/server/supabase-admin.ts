import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://llhfumrtotectnbpeabu.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_moHL6HEUhoVavz-Xg2v7Cw_SZvDHaMF";

const supabaseUrl = process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey =
  (serviceKey && serviceKey.startsWith("eyJ") ? serviceKey : null) ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

