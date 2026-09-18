import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://llhfumrtotectnbpeabu.supabase.co";
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY = "sb_secret_gWl2b05pD9aoDJqcevWRsg_wQDKkwLV";

const supabaseUrl = process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

