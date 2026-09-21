-- ============================================================================
-- CLEAN RLS POLICY FIX - Drop ALL policies and recreate
-- ============================================================================

-- Drop ALL existing policies on ALL tables
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
-- 1. ACCOUNTS TABLE
-- ============================================================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accounts_public_read" ON accounts FOR SELECT USING (true);
CREATE POLICY "accounts_public_insert" ON accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "accounts_self_update" ON accounts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "accounts_admin_delete" ON accounts FOR DELETE USING (true);

-- ============================================================================
-- 2. NEW_REGISTERED_STUDENTS TABLE
-- ============================================================================
ALTER TABLE new_registered_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student_reg_public_read" ON new_registered_students FOR SELECT USING (true);
CREATE POLICY "student_reg_self_insert" ON new_registered_students FOR INSERT WITH CHECK (true);
CREATE POLICY "student_reg_self_update" ON new_registered_students FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "student_reg_admin_update" ON new_registered_students FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "student_reg_admin_delete" ON new_registered_students FOR DELETE USING (true);

-- ============================================================================
-- 3. EVENTS TABLE - FIXED FOR VERCEL
-- ============================================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_public_read" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "events_update" ON events FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "events_delete" ON events FOR DELETE USING (true);

-- ============================================================================
-- 4. REGISTRATIONS TABLE
-- ============================================================================
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "registrations_read" ON registrations FOR SELECT USING (true);
CREATE POLICY "registrations_insert" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "registrations_update" ON registrations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "registrations_delete" ON registrations FOR DELETE USING (true);

-- ============================================================================
-- 5. ATTENDANCE_RECORDS TABLE
-- ============================================================================
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance_read" ON attendance_records FOR SELECT USING (true);
CREATE POLICY "attendance_insert" ON attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "attendance_update" ON attendance_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "attendance_delete" ON attendance_records FOR DELETE USING (true);

-- ============================================================================
-- 6. CLUBS TABLE
-- ============================================================================
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clubs_public_read" ON clubs FOR SELECT USING (true);
CREATE POLICY "clubs_create" ON clubs FOR INSERT WITH CHECK (true);
CREATE POLICY "clubs_update" ON clubs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "clubs_delete" ON clubs FOR DELETE USING (true);

-- ============================================================================
-- 7. CLUB_MEMBERS TABLE
-- ============================================================================
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "club_members_read" ON club_members FOR SELECT USING (true);
CREATE POLICY "club_members_insert" ON club_members FOR INSERT WITH CHECK (true);
CREATE POLICY "club_members_update" ON club_members FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "club_members_delete" ON club_members FOR DELETE USING (true);

-- ============================================================================
-- 8. CLUB_ACTIVITIES TABLE
-- ============================================================================
ALTER TABLE club_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "club_activities_read" ON club_activities FOR SELECT USING (true);
CREATE POLICY "club_activities_insert" ON club_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "club_activities_update" ON club_activities FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "club_activities_delete" ON club_activities FOR DELETE USING (true);

-- ============================================================================
-- 9. CAMPUS_ANNOUNCEMENTS TABLE
-- ============================================================================
ALTER TABLE campus_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements_read" ON campus_announcements FOR SELECT USING (true);
CREATE POLICY "announcements_create" ON campus_announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "announcements_update" ON campus_announcements FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "announcements_delete" ON campus_announcements FOR DELETE USING (true);

-- ============================================================================
-- 10. INTERNSHIPS TABLE
-- ============================================================================
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "internships_public_read" ON internships FOR SELECT USING (true);
CREATE POLICY "internships_create" ON internships FOR INSERT WITH CHECK (true);
CREATE POLICY "internships_update" ON internships FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "internships_delete" ON internships FOR DELETE USING (true);

-- ============================================================================
-- 11. INTERNSHIP_APPLICATIONS TABLE
-- ============================================================================
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "internship_apps_read" ON internship_applications FOR SELECT USING (true);
CREATE POLICY "internship_apps_insert" ON internship_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "internship_apps_update" ON internship_applications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "internship_apps_delete" ON internship_applications FOR DELETE USING (true);

-- ============================================================================
-- 12. VERIFIED_ACHIEVEMENTS TABLE
-- ============================================================================
ALTER TABLE verified_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_read" ON verified_achievements FOR SELECT USING (true);
CREATE POLICY "achievements_insert" ON verified_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "achievements_update" ON verified_achievements FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "achievements_delete" ON verified_achievements FOR DELETE USING (true);

-- ============================================================================
-- 13. VISITOR_RECORDS TABLE
-- ============================================================================
ALTER TABLE visitor_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visitor_records_read" ON visitor_records FOR SELECT USING (true);
CREATE POLICY "visitor_records_insert" ON visitor_records FOR INSERT WITH CHECK (true);
CREATE POLICY "visitor_records_update" ON visitor_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "visitor_records_delete" ON visitor_records FOR DELETE USING (true);

-- ============================================================================
-- 14. VEHICLE_RECORDS TABLE
-- ============================================================================
ALTER TABLE vehicle_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicle_records_read" ON vehicle_records FOR SELECT USING (true);
CREATE POLICY "vehicle_records_insert" ON vehicle_records FOR INSERT WITH CHECK (true);
CREATE POLICY "vehicle_records_update" ON vehicle_records FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "vehicle_records_delete" ON vehicle_records FOR DELETE USING (true);

-- ============================================================================
-- VERIFICATION - List all policies
-- ============================================================================
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename
ORDER BY tablename;
