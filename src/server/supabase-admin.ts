import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Log for debugging (remove in production)
if (typeof window === 'undefined') {
  console.log('[Supabase Admin] Service role key configured:', !!serviceRoleKey);
}

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl && serviceRoleKey && serviceRoleKey !== "your-supabase-service-role-secret-key",
);

function createAdminClient(): SupabaseClient {
  // If service role key is missing, use regular anon key
  // This allows read/write to public tables (new_registered_students, accounts, etc)
  const keyToUse = serviceRoleKey || anonKey;
  
  if (!supabaseUrl || !keyToUse) {
    console.error(
      "[Supabase Admin] CRITICAL: Neither SUPABASE_URL nor any valid key is configured. Database operations will fail.",
    );
    throw new Error("Supabase configuration missing");
  }

  if (!serviceRoleKey) {
    console.warn(
      "[Supabase Admin] SERVICE_ROLE_KEY not configured. Using ANON_KEY for database operations. Make sure your Supabase tables have appropriate RLS policies.",
    );
  }

  return createClient(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabaseAdmin = createAdminClient();
