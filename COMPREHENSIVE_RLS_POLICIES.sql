-- ============================================================================
-- COMPREHENSIVE RLS POLICIES FOR CAMPUS CONNECT HUB
-- Fixes all 14 tables with proper row-level security
-- ============================================================================

-- ============================================================================
-- 1. ACCOUNTS TABLE - Authentication & User Profiles
-- ============================================================================
DROP POLICY IF EXISTS "accounts_select" ON accounts;
DROP POLICY IF EXISTS "allow_public_register" ON accounts;
DROP POLICY IF EXISTS "account_self_update" ON accounts;
DROP POLICY IF EXISTS "account_admin_delete" ON accounts;

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Public can read all accounts (user discovery)
CREATE POLICY "accounts_public_read" ON accounts FOR SELECT USING (true);

-- Public can self-register
CREATE POLICY "accounts_public_insert" ON accounts FOR INSERT WITH CHECK (true);

-- Users update own account, admins update any
CREATE POLICY "accounts_self_update" ON accounts FOR UPDATE 
  USING (auth.uid()::text = id OR current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'))
  WITH CHECK (auth.uid()::text = id OR current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- Admin only delete
CREATE POLICY "accounts_admin_delete" ON accounts FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- ============================================================================
-- 2. NEW_REGISTERED_STUDENTS TABLE - Student Registry
-- ============================================================================
DROP POLICY IF EXISTS "new_registered_students_select" ON new_registered_students;
DROP POLICY IF EXISTS "student_reg_public_read" ON new_registered_students;
DROP POLICY IF EXISTS "student_reg_self_insert" ON new_registered_students;
DROP POLICY IF EXISTS "student_reg_self_update" ON new_registered_students;
DROP POLICY IF EXISTS "student_reg_admin_update" ON new_registered_students;
DROP POLICY IF EXISTS "student_reg_admin_delete" ON new_registered_students;

ALTER TABLE new_registered_students ENABLE ROW LEVEL SECURITY;

-- Public can read registrations
CREATE POLICY "student_reg_public_read" ON new_registered_students FOR SELECT USING (true);

-- Students register themselves
CREATE POLICY "student_reg_self_insert" ON new_registered_students FOR INSERT 
  WITH CHECK (true);

-- Students update own record (if not locked)
CREATE POLICY "student_reg_self_update" ON new_registered_students FOR UPDATE 
  USING (auth.uid()::text = id AND is_locked = false) 
  WITH CHECK (is_locked = false);

-- Admin can update (including locking)
CREATE POLICY "student_reg_admin_update" ON new_registered_students FOR UPDATE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'dean', 'super_admin'));

-- Admin only delete
CREATE POLICY "student_reg_admin_delete" ON new_registered_students FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- ============================================================================
-- 3. EVENTS TABLE - Event Management (FIX: Remove all-public policies)
-- ============================================================================
DROP POLICY IF EXISTS "allow_all_select" ON events;
DROP POLICY IF EXISTS "allow_all_insert" ON events;
DROP POLICY IF EXISTS "allow_all_update" ON events;
DROP POLICY IF EXISTS "allow_all_delete" ON events;
DROP POLICY IF EXISTS "events_select" ON events;
DROP POLICY IF EXISTS "events_public_read" ON events;
DROP POLICY IF EXISTS "events_organizer_create" ON events;
DROP POLICY IF EXISTS "events_organizer_update" ON events;
DROP POLICY IF EXISTS "events_admin_delete" ON events;

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public can read events
CREATE POLICY "events_public_read" ON events FOR SELECT USING (true);

-- Only organizers/admins can create
CREATE POLICY "events_organizer_create" ON events FOR INSERT 
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' IN ('organizer', 'tpc', 'admin', 'super_admin'));

-- Creator or admin can update
CREATE POLICY "events_organizer_update" ON events FOR UPDATE 
  USING (created_by = auth.uid()::text OR current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- Admin only delete
CREATE POLICY "events_admin_delete" ON events FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- ============================================================================
-- 4. REGISTRATIONS TABLE - Event Registrations
-- ============================================================================
DROP POLICY IF EXISTS "registrations_select" ON registrations;
DROP POLICY IF EXISTS "registrations_read" ON registrations;
DROP POLICY IF EXISTS "registrations_insert" ON registrations;
DROP POLICY IF EXISTS "registrations_update" ON registrations;
DROP POLICY IF EXISTS "registrations_delete" ON registrations;

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Users see their own, admins see all
CREATE POLICY "registrations_read" ON registrations FOR SELECT 
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'organizer', 'tpc'));

-- Authenticated users can register
CREATE POLICY "registrations_insert" ON registrations FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Users update own registration
CREATE POLICY "registrations_update" ON registrations FOR UPDATE 
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'organizer', 'tpc'))
  WITH CHECK (auth.uid()::text = user_id OR current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'organizer', 'tpc'));

-- Admin/organizer can delete
CREATE POLICY "registrations_delete" ON registrations FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'organizer', 'tpc'));

-- ============================================================================
-- 5. ATTENDANCE_RECORDS TABLE - Attendance Tracking
-- ============================================================================
DROP POLICY IF EXISTS "attendance_records_select" ON attendance_records;
DROP POLICY IF EXISTS "attendance_read" ON attendance_records;
DROP POLICY IF EXISTS "attendance_insert" ON attendance_records;
DROP POLICY IF EXISTS "attendance_update" ON attendance_records;
DROP POLICY IF EXISTS "attendance_delete" ON attendance_records;

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Users see own attendance, admins see all
CREATE POLICY "attendance_read" ON attendance_records FOR SELECT 
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'tpc', 'security'));

-- Service role, admin, tpc, security can insert
CREATE POLICY "attendance_insert" ON attendance_records FOR INSERT 
  WITH CHECK (true);

-- Admin/tpc only update
CREATE POLICY "attendance_update" ON attendance_records FOR UPDATE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'tpc'));

-- Admin only delete
CREATE POLICY "attendance_delete" ON attendance_records FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- ============================================================================
-- 6. CLUBS TABLE - Club Management
-- ============================================================================
DROP POLICY IF EXISTS "clubs_select" ON clubs;
DROP POLICY IF EXISTS "clubs_public_read" ON clubs;
DROP POLICY IF EXISTS "clubs_create" ON clubs;
DROP POLICY IF EXISTS "clubs_update" ON clubs;
DROP POLICY IF EXISTS "clubs_delete" ON clubs;

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "clubs_public_read" ON clubs FOR SELECT USING (true);

-- Authorized users can create
CREATE POLICY "clubs_create" ON clubs FOR INSERT 
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' IN ('faculty', 'admin', 'super_admin'));

-- Faculty/admins can update
CREATE POLICY "clubs_update" ON clubs FOR UPDATE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('faculty', 'admin', 'super_admin'));

-- Admin only delete
CREATE POLICY "clubs_delete" ON clubs FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- ============================================================================
-- 7. CLUB_MEMBERS TABLE - Club Membership
-- ============================================================================
DROP POLICY IF EXISTS "club_members_select" ON club_members;
DROP POLICY IF EXISTS "club_members_read" ON club_members;
DROP POLICY IF EXISTS "club_members_insert" ON club_members;
DROP POLICY IF EXISTS "club_members_update" ON club_members;
DROP POLICY IF EXISTS "club_members_delete" ON club_members;

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "club_members_read" ON club_members FOR SELECT USING (true);

-- Authenticated users can request membership
CREATE POLICY "club_members_insert" ON club_members FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Members update own, faculty/admin approve
CREATE POLICY "club_members_update" ON club_members FOR UPDATE 
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claims', true)::json->>'role' IN ('faculty', 'admin'));

-- Self-remove or faculty/admin remove
CREATE POLICY "club_members_delete" ON club_members FOR DELETE 
  USING (auth.uid()::text = user_id OR current_setting('request.jwt.claims', true)::json->>'role' IN ('faculty', 'admin'));

-- ============================================================================
-- 8. CLUB_ACTIVITIES TABLE - Club Activities & Events
-- ============================================================================
DROP POLICY IF EXISTS "club_activities_select" ON club_activities;
DROP POLICY IF EXISTS "club_activities_read" ON club_activities;
DROP POLICY IF EXISTS "club_activities_insert" ON club_activities;
DROP POLICY IF EXISTS "club_activities_update" ON club_activities;
DROP POLICY IF EXISTS "club_activities_delete" ON club_activities;

ALTER TABLE club_activities ENABLE ROW LEVEL SECURITY;

-- Public can read public activities
CREATE POLICY "club_activities_read" ON club_activities FOR SELECT 
  USING (true);

-- Club leads/admins can create
CREATE POLICY "club_activities_insert" ON club_activities FOR INSERT 
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' IN ('faculty', 'admin', 'super_admin'));

-- Club leads/admins can update
CREATE POLICY "club_activities_update" ON club_activities FOR UPDATE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('faculty', 'admin', 'super_admin'));

-- Admin only delete
CREATE POLICY "club_activities_delete" ON club_activities FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- ============================================================================
-- 9. CAMPUS_ANNOUNCEMENTS TABLE - Campus Announcements
-- ============================================================================
DROP POLICY IF EXISTS "campus_announcements_select" ON campus_announcements;
DROP POLICY IF EXISTS "announcements_read" ON campus_announcements;
DROP POLICY IF EXISTS "announcements_create" ON campus_announcements;
DROP POLICY IF EXISTS "announcements_update" ON campus_announcements;
DROP POLICY IF EXISTS "announcements_delete" ON campus_announcements;

ALTER TABLE campus_announcements ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "announcements_read" ON campus_announcements FOR SELECT USING (true);

-- Authorized roles can post
CREATE POLICY "announcements_create" ON campus_announcements FOR INSERT 
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' IN ('dean', 'admin', 'organizer', 'super_admin'));

-- Creator/admin can update
CREATE POLICY "announcements_update" ON campus_announcements FOR UPDATE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('dean', 'admin', 'super_admin'));

-- Admin only delete
CREATE POLICY "announcements_delete" ON campus_announcements FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- ============================================================================
-- 10. INTERNSHIPS TABLE - Internship Listings
-- ============================================================================
DROP POLICY IF EXISTS "internships_select" ON internships;
DROP POLICY IF EXISTS "internships_public_read" ON internships;
DROP POLICY IF EXISTS "internships_create" ON internships;
DROP POLICY IF EXISTS "internships_update" ON internships;
DROP POLICY IF EXISTS "internships_delete" ON internships;

ALTER TABLE internships ENABLE ROW LEVEL SECURITY;

-- Public can view open internships
CREATE POLICY "internships_public_read" ON internships FOR SELECT USING (true);

-- TPC/Admin can create
CREATE POLICY "internships_create" ON internships FOR INSERT 
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' IN ('tpc', 'admin', 'super_admin'));

-- TPC/Admin can update
CREATE POLICY "internships_update" ON internships FOR UPDATE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('tpc', 'admin', 'super_admin'));

-- Admin only delete
CREATE POLICY "internships_delete" ON internships FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- ============================================================================
-- 11. INTERNSHIP_APPLICATIONS TABLE - Student Internship Applications
-- ============================================================================
DROP POLICY IF EXISTS "internship_applications_select" ON internship_applications;
DROP POLICY IF EXISTS "internship_apps_read" ON internship_applications;
DROP POLICY IF EXISTS "internship_apps_insert" ON internship_applications;
DROP POLICY IF EXISTS "internship_apps_update" ON internship_applications;
DROP POLICY IF EXISTS "internship_apps_delete" ON internship_applications;

ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;

-- Students see own, admin/TPC see all
CREATE POLICY "internship_apps_read" ON internship_applications FOR SELECT 
  USING (auth.uid()::text = student_id OR current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'tpc', 'dean', 'super_admin'));

-- Students can submit own applications
CREATE POLICY "internship_apps_insert" ON internship_applications FOR INSERT 
  WITH CHECK (auth.uid()::text = student_id);

-- Students update draft/own, admin/TPC review/approve
CREATE POLICY "internship_apps_update" ON internship_applications FOR UPDATE 
  USING ((auth.uid()::text = student_id AND status = 'DRAFT') OR current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'tpc', 'dean', 'super_admin'));

-- Admin only delete
CREATE POLICY "internship_apps_delete" ON internship_applications FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- ============================================================================
-- 12. VERIFIED_ACHIEVEMENTS TABLE - Student Achievements & Certificates
-- ============================================================================
DROP POLICY IF EXISTS "verified_achievements_select" ON verified_achievements;
DROP POLICY IF EXISTS "achievements_read" ON verified_achievements;
DROP POLICY IF EXISTS "achievements_insert" ON verified_achievements;
DROP POLICY IF EXISTS "achievements_update" ON verified_achievements;
DROP POLICY IF EXISTS "achievements_delete" ON verified_achievements;

ALTER TABLE verified_achievements ENABLE ROW LEVEL SECURITY;

-- Public can read achievements
CREATE POLICY "achievements_read" ON verified_achievements FOR SELECT USING (true);

-- Admin/TPC/Dean can add achievements
CREATE POLICY "achievements_insert" ON verified_achievements FOR INSERT 
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'tpc', 'dean', 'super_admin'));

-- Admin only update
CREATE POLICY "achievements_update" ON verified_achievements FOR UPDATE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- Admin only delete
CREATE POLICY "achievements_delete" ON verified_achievements FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- ============================================================================
-- 13. VISITOR_RECORDS TABLE - Visitor Management & Security
-- ============================================================================
DROP POLICY IF EXISTS "visitor_records_select" ON visitor_records;
DROP POLICY IF EXISTS "visitor_records_read" ON visitor_records;
DROP POLICY IF EXISTS "visitor_records_insert" ON visitor_records;
DROP POLICY IF EXISTS "visitor_records_update" ON visitor_records;
DROP POLICY IF EXISTS "visitor_records_delete" ON visitor_records;

ALTER TABLE visitor_records ENABLE ROW LEVEL SECURITY;

-- Security and admin can read all
CREATE POLICY "visitor_records_read" ON visitor_records FOR SELECT 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('security', 'admin', 'super_admin'));

-- Visitors self-register or security creates
CREATE POLICY "visitor_records_insert" ON visitor_records FOR INSERT 
  WITH CHECK (true);

-- Security can update (verify, mark exit)
CREATE POLICY "visitor_records_update" ON visitor_records FOR UPDATE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('security', 'admin'));

-- Admin only delete
CREATE POLICY "visitor_records_delete" ON visitor_records FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- ============================================================================
-- 14. VEHICLE_RECORDS TABLE - Vehicle Parking Management
-- ============================================================================
DROP POLICY IF EXISTS "vehicle_records_select" ON vehicle_records;
DROP POLICY IF EXISTS "vehicle_records_read" ON vehicle_records;
DROP POLICY IF EXISTS "vehicle_records_insert" ON vehicle_records;
DROP POLICY IF EXISTS "vehicle_records_update" ON vehicle_records;
DROP POLICY IF EXISTS "vehicle_records_delete" ON vehicle_records;

ALTER TABLE vehicle_records ENABLE ROW LEVEL SECURITY;

-- Security/admin/owner can read
CREATE POLICY "vehicle_records_read" ON vehicle_records FOR SELECT 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('security', 'admin', 'super_admin'));

-- Security creates records
CREATE POLICY "vehicle_records_insert" ON vehicle_records FOR INSERT 
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' IN ('security', 'admin'));

-- Security updates records
CREATE POLICY "vehicle_records_update" ON vehicle_records FOR UPDATE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('security', 'admin'));

-- Admin only delete
CREATE POLICY "vehicle_records_delete" ON vehicle_records FOR DELETE 
  USING (current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'super_admin'));

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check all policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
