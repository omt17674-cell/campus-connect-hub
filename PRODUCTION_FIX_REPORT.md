# Production Repair Report: Campus Connect Hub (GSFC University)

**Date**: September 23, 2026  
**Status**: ✅ All critical architecture, database, security, and authentication issues resolved. Build passing cleanly.

---

## 1. Bugs Found & Root Causes

1. **Conflicting & Hardcoded Supabase Project URLs**:
   - `src/lib/supabase.ts` had a hardcoded fallback pointing to `https://ebyhgllzwayrkhwwyvba.supabase.co`.
   - `src/server/supabase-admin.ts` had a hardcoded fallback pointing to `https://dfl4luw5tr5l1h6jmnfql7a.supabase.co`.
   - *Impact*: In any deployment where environment variables were not perfectly evaluated in both SSR and client, the frontend read/wrote to Project A while the backend read/wrote to Project B.
2. **Database Table Name Conflicts Across Setup SQL & Docs**:
   - `PRODUCTION_DATABASE_SETUP.sql` was referencing `attendance_records` and `campus_announcements`, while application code and `supabase-schema.sql` actively used `attendance`, `announcements`, and `registrations`.
   - `SUPABASE_SETUP.md` was referencing `event_registrations` instead of `registrations`.
3. **Attendance Crash & Insecure Roll Number Assumption**:
   - `api-router.ts` check-in handler executed `body.userRollNo.slice(-4)` even when `body.userRollNo` was not passed in the request body, causing an uncaught runtime TypeError.
   - Attendance identity was partly reliant on client request body rather than verified session tokens.
4. **Permissive RLS & Debug Data Exposure**:
   - Earlier SQL scripts used `USING (true) WITH CHECK (true)` indiscriminately.
   - Endpoints `/api/debug` and `/api/config` dumped server environment configuration and key lengths.
5. **Insecure & Unauthenticated Pass-Throughs**:
   - `/api/auth/login` granted authenticated sessions without verifying the supplied password against Supabase Auth.
   - Frontend `LoginPage.tsx` contained hardcoded admin credentials and a roll-number regex that bypassed real authentication in production.
   - `getAuthenticatedUser` had a fallback that returned an admin session if the user passed any unrecognized token.
6. **Fragile String Slicing in `campus-store.ts`**:
   - Several certificate ID generations invoked `.slice(-4)` on potentially undefined roll numbers.

---

## 2. Files Changed

- [`src/server/supabase-admin.ts`](file:///Users/omthakkar/Documents/GitHub/campus-connect-hub/src/server/supabase-admin.ts): Cleaned and hardened to use environment variables exclusively (`VITE_SUPABASE_URL`/`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`/`VITE_SUPABASE_ANON_KEY`). Removed all foreign fallback URLs.
- [`src/lib/supabase.ts`](file:///Users/omthakkar/Documents/GitHub/campus-connect-hub/src/lib/supabase.ts): Removed hardcoded project URL. Fails loudly with an explicit error in browser console if environment variables are missing.
- [`src/server/api-router.ts`](file:///Users/omthakkar/Documents/GitHub/campus-connect-hub/src/server/api-router.ts):
  - Fixed attendance check-in bug: derives roll number strictly from authenticated user/registration (`authUser.rollNo || userReg.userRollNo`), preventing runtime crashes.
  - Enforced server-side password authentication in `/api/auth/login` via `supabaseAdmin.auth.signInWithPassword`.
  - Hardened `getAuthenticatedUser` to require verified server sessions or valid Supabase JWT tokens via `supabaseAdmin.auth.getUser(token)`.
  - Removed information-leaking endpoints (`/api/debug`, `/api/config`).
  - Added safe, non-sensitive `/api/health` response.
- [`src/server/supabase-sync.ts`](file:///Users/omthakkar/Documents/GitHub/campus-connect-hub/src/server/supabase-sync.ts):
  - Expanded `pingSupabase()` to safely check canonical tables without leaking secrets.
- [`src/lib/campus-store.ts`](file:///Users/omthakkar/Documents/GitHub/campus-connect-hub/src/lib/campus-store.ts):
  - Added safe fallbacks for roll-number string operations across certificate generation, punch-in, and offline check-in syncing.
- [`src/components/auth/LoginPage.tsx`](file:///Users/omthakkar/Documents/GitHub/campus-connect-hub/src/components/auth/LoginPage.tsx):
  - Removed hardcoded production admin/TPC passwords.
  - Removed production roll-number regex demo authentication bypass.
- [`PRODUCTION_DATABASE_SETUP.sql`](file:///Users/omthakkar/Documents/GitHub/campus-connect-hub/PRODUCTION_DATABASE_SETUP.sql):
  - Harmonized table names strictly with application: `attendance`, `announcements`, `registrations`.
  - Replaced overly permissive policies with least-privilege RLS policies and high-concurrency indexes.
- [`README.md`](file:///Users/omthakkar/Documents/GitHub/campus-connect-hub/README.md) & [`SUPABASE_SETUP.md`](file:///Users/omthakkar/Documents/GitHub/campus-connect-hub/SUPABASE_SETUP.md):
  - Updated documentation to reference canonical schema files and marked conflicting legacy tables (`event_registrations`) as deprecated.

---

## 3. Database Changes

- **Canonical Table Names Enforced**:
  - `attendance` (not `attendance_records`)
  - `announcements` (not `campus_announcements`)
  - `registrations` (not `event_registrations`)
- **Row Level Security (RLS)**:
  - Enabled on all tables.
  - Public reads permitted only for public records (`events`, `announcements`, `clubs`, `services`, `internships`).
  - Private data (`accounts`, `new_registered_students`, `attendance`, `internship_applications`, `internship_attendance`) restricted to authenticated users matching their own IDs.
- **Indexes**: Added high-concurrency indexes for 100+ simultaneous users on roll numbers, emails, event dates, application status, and attendance timestamps.

---

## 4. Authentication & Security Changes

- **Password Verification**: Every login requires password verification via Supabase Auth.
- **Session Derivation**: Roll number, identity, and role are strictly derived from verified sessions on the server.
- **Zero Plaintext Credentials**: Removed frontend-stored passwords.
- **No Token Forgery**: Removed fallback that previously granted admin access on invalid tokens.

---

## 5. Build & Test Result

- **Client Build**: Built in 785ms.
- **SSR Server Build**: Built in 336ms.
- **Result**: `npm run build` completed with exit code `0` (Zero errors, zero missing exports).

---

## 6. Remaining Notes & Deployment Instructions

- In your Vercel or production hosting dashboard, ensure the following environment variables are set:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Run `PRODUCTION_DATABASE_SETUP.sql` in your Supabase SQL Editor if updating an existing deployment.
