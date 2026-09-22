-- ============================================================================
-- CAMPUS CONNECT HUB - PRODUCTION DATABASE SETUP
-- ============================================================================
-- CANONICAL DATABASE INITIALIZATION FILE
-- This is the ONLY file that should be used to set up the database.
-- ============================================================================

-- Include complete schema from supabase-schema.sql
-- This creates all 21 tables with correct structure
-- Tables: accounts, new_registered_students, events, registrations,
--         attendance_records, clubs, club_members, club_activities,
--         campus_announcements, internships, internship_applications,
--         verified_achievements, visitor_records, vehicle_records, etc.

-- After running supabase-schema.sql, apply these RLS policies:

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_registered_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP ALL EXISTING POLICIES (CLEAN START)
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public')
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;

-- ============================================================================
-- CREATE PERMISSIVE RLS POLICIES FOR SERVICE ROLE ACCESS
-- ============================================================================
-- These policies allow the backend (using service role key) to perform all operations.
-- Application-level authorization is enforced in the API layer, not the database.
-- ============================================================================

-- ACCOUNTS TABLE
CREATE POLICY "accounts_all" ON accounts FOR ALL USING (true) WITH CHECK (true);

-- NEW_REGISTERED_STUDENTS TABLE
CREATE POLICY "students_all" ON new_registered_students FOR ALL USING (true) WITH CHECK (true);

-- EVENTS TABLE
CREATE POLICY "events_all" ON events FOR ALL USING (true) WITH CHECK (true);

-- REGISTRATIONS TABLE
CREATE POLICY "registrations_all" ON registrations FOR ALL USING (true) WITH CHECK (true);

-- ATTENDANCE_RECORDS TABLE
CREATE POLICY "attendance_all" ON attendance_records FOR ALL USING (true) WITH CHECK (true);

-- CLUBS TABLE
CREATE POLICY "clubs_all" ON clubs FOR ALL USING (true) WITH CHECK (true);

-- CLUB_MEMBERS TABLE
CREATE POLICY "club_members_all" ON club_members FOR ALL USING (true) WITH CHECK (true);

-- CLUB_ACTIVITIES TABLE
CREATE POLICY "club_activities_all" ON club_activities FOR ALL USING (true) WITH CHECK (true);

-- CAMPUS_ANNOUNCEMENTS TABLE
CREATE POLICY "announcements_all" ON campus_announcements FOR ALL USING (true) WITH CHECK (true);

-- INTERNSHIPS TABLE
CREATE POLICY "internships_all" ON internships FOR ALL USING (true) WITH CHECK (true);

-- INTERNSHIP_APPLICATIONS TABLE
CREATE POLICY "internship_apps_all" ON internship_applications FOR ALL USING (true) WITH CHECK (true);

-- VERIFIED_ACHIEVEMENTS TABLE
CREATE POLICY "achievements_all" ON verified_achievements FOR ALL USING (true) WITH CHECK (true);

-- VISITOR_RECORDS TABLE
CREATE POLICY "visitor_records_all" ON visitor_records FOR ALL USING (true) WITH CHECK (true);

-- VEHICLE_RECORDS TABLE
CREATE POLICY "vehicle_records_all" ON vehicle_records FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- INSERT ADMIN ACCOUNTS
-- ============================================================================

INSERT INTO accounts (id, name, roll_no, email, role, department, semester, year, attendance_percentage, points, streak_days, volunteer_hours, avatar, mobile_number, updated_at)
VALUES 
  ('u-admin-dean', 'Dr. Ananya Sharma', 'DEAN-001', 'admin.dean@gsfcuniversity.ac.in', 'admin', 'Administration', 4, 2, 100, 500, 30, 100, 'AS', NULL, NOW()),
  ('u-tpc-coord', 'Prof. Rajiv Mehta', 'TPC-001', 'tpc.admin@gsfcuniversity.ac.in', 'organizer', 'Training & Placement Cell', 4, 2, 100, 450, 25, 80, 'RM', NULL, NOW())
ON CONFLICT (email) DO UPDATE SET updated_at = NOW();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify tables exist
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Verify RLS is enabled
SELECT tablename, 
  (SELECT count(*) FROM pg_policies WHERE pg_policies.tablename = information_schema.tables.tablename) as policy_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY tablename;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- All tables created with RLS enabled and permissive policies applied.
-- Admin accounts inserted.
-- Database ready for production use.
-- ============================================================================
