import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Fallback credentials - will work with Vercel without env vars
const FALLBACK_URL = "https://dfl4luw5tr5l1h6jmnfql7a.supabase.co";
const FALLBACK_ANON_KEY = "sb_publishable_dF4Lu5WtR5l1H6jmNFQl7A_Xw15G04Z";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || FALLBACK_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (typeof window === 'undefined') {
  console.log('[Supabase] Using', serviceRoleKey ? 'service role' : 'anon key');
}

export const isSupabaseAdminConfigured = Boolean(supabaseUrl && anonKey);

function createAdminClient(): SupabaseClient {
  const keyToUse = serviceRoleKey || anonKey;
  
  if (!supabaseUrl || !keyToUse) {
    throw new Error("Supabase URL or key missing");
  }

  return createClient(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabaseAdmin = createAdminClient();
