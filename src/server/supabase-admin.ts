import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

// Service role key is strictly required for administrative server operations
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseAdminConfigured = Boolean(supabaseUrl && serviceRoleKey);

function createAdminClient(): SupabaseClient {
  if (!isSupabaseAdminConfigured) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[SupabaseAdmin] SUPABASE_SERVICE_ROLE_KEY is missing. Administrative operations require a service role key."
      );
    }
  }

  return createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    serviceRoleKey || "placeholder-service-key",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export const supabaseAdmin = createAdminClient();
