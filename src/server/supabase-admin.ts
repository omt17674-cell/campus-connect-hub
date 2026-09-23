import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Canonical project fallbacks to prevent SSR startup crashes
const CANONICAL_URL = "https://dfl4luw5tr5l1h6jmnfql7a.supabase.co";
const CANONICAL_ANON_KEY = "sb_publishable_dF4Lu5WtR5l1H6jmNFQl7A_Xw15G04Z";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  CANONICAL_URL;

const anonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  CANONICAL_ANON_KEY;

// Service role key is loaded strictly from environment variables
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl && (serviceRoleKey || anonKey)
);

function createAdminClient(): SupabaseClient {
  const keyToUse = serviceRoleKey || anonKey || CANONICAL_ANON_KEY;
  const effectiveUrl = supabaseUrl || CANONICAL_URL;

  return createClient(effectiveUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabaseAdmin = createAdminClient();
