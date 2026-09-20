import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl && serviceRoleKey && serviceRoleKey !== "your-supabase-service-role-secret-key",
);

function createAdminClient(): SupabaseClient {
  if (!isSupabaseAdminConfigured) {
    console.warn(
      "[Supabase Admin] WARNING: SUPABASE_SERVICE_ROLE_KEY is not configured. Privileged server operations will fail safely.",
    );
    // Return a dummy client that throws when accessed so operations fail safely without falling back to anon key
    return new Proxy({} as SupabaseClient, {
      get(_target, prop) {
        if (prop === "from" || prop === "auth") {
          return () => {
            throw new Error(
              "SECURITY CONFIGURATION ERROR: SUPABASE_SERVICE_ROLE_KEY is missing on server. Refusing to execute privileged operation with unprivileged keys.",
            );
          };
        }
        return undefined;
      },
    });
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabaseAdmin = createAdminClient();
