import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPgPool(): pg.Pool | null {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

/**
 * Directly marks a user as confirmed in Supabase auth.users table.
 * Used when verifying via 6-digit OTP code to ensure Supabase Auth signInWithPassword works.
 */
export async function confirmUserEmailInAuth(email: string): Promise<boolean> {
  const p = getPgPool();
  if (!p) return false;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const res = await p.query(
      `UPDATE auth.users 
       SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()), 
           updated_at = NOW() 
       WHERE email ILIKE $1`,
      [cleanEmail]
    );
    return (res.rowCount ?? 0) > 0;
  } catch (err) {
    console.warn("[Postgres Direct Auth Confirm] Error:", err);
    return false;
  }
}
