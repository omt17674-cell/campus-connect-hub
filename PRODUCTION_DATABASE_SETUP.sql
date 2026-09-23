-- ============================================================================
-- CAMPUS CONNECT HUB - PRODUCTION DATABASE SETUP
-- ============================================================================
-- CANONICAL DATABASE INITIALIZATION SCRIPT FOR GSFC UNIVERSITY
-- Tables matched strictly to application code:
--   accounts, new_registered_students, events, registrations,
--   attendance, clubs, club_members, announcements, services,
--   visitors, vehicles, achievements, audit_logs, internships,
--   internship_applications, internship_attendance,
--   internship_approvals, internship_notifications
-- ============================================================================

-- First, ensure all tables are created by running supabase-schema.sql.
-- Then, apply the canonical RLS policies and indexes below:

-- ============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL CANONICAL TABLES
-- ============================================================================

ALTER TABLE IF EXISTS public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.new_registered_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.internship_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.internship_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.internship_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. DROP OBSOLETE & CONFLICTING POLICIES (CLEAN START)
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
  )
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;

-- ============================================================================
-- 3. PROPER ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Service-role bypasses RLS automatically.
-- The policies below restrict direct client (anon / authenticated) access:
-- - Publicly readable: public events, announcements, clubs, services.
-- - Authenticated users: can read own account, registrations, and attendance.
-- - Sensitive mutations: handled authoritatively through the server API.
-- ============================================================================

-- Events (Public can view upcoming and live events)
CREATE POLICY "Public can view published events" ON public.events
  FOR SELECT USING (status IN ('upcoming', 'live', 'completed'));

-- Announcements (Public / students can view notices)
CREATE POLICY "Public can view announcements" ON public.announcements
  FOR SELECT USING (true);

-- Clubs (Public can view clubs directory)
CREATE POLICY "Public can view clubs" ON public.clubs
  FOR SELECT USING (true);

-- Services (Public can view campus directory)
CREATE POLICY "Public can view services" ON public.services
  FOR SELECT USING (true);

-- Accounts (Users can view only their own account)
CREATE POLICY "Users can view own account" ON public.accounts
  FOR SELECT TO authenticated
  USING (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) OR
    id = auth.uid()::text
  );

-- Student Registry (Users can view only their own registration)
CREATE POLICY "Students can view own registration" ON public.new_registered_students
  FOR SELECT TO authenticated
  USING (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) OR
    id = auth.uid()::text
  );

-- Registrations (Users can view their own registrations)
CREATE POLICY "Users can view own event registrations" ON public.registrations
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()::text OR
    lower(coalesce(user_roll_no, '')) = lower(coalesce(auth.jwt() ->> 'roll_no', ''))
  );

-- Attendance (Users can view their own attendance)
CREATE POLICY "Users can view own attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()::text OR
    lower(coalesce(user_roll_no, '')) = lower(coalesce(auth.jwt() ->> 'roll_no', ''))
  );

-- Internships (Public can view open internships)
CREATE POLICY "Public can view open internships" ON public.internships
  FOR SELECT USING (status = 'open');

-- Internship Applications (Students can view own applications)
CREATE POLICY "Students can view own internship applications" ON public.internship_applications
  FOR SELECT TO authenticated
  USING (student_id = auth.uid()::text);

-- Internship Attendance (Students can view own internship attendance)
CREATE POLICY "Students can view own internship attendance" ON public.internship_attendance
  FOR SELECT TO authenticated
  USING (student_id = auth.uid()::text);

-- Internship Notifications (Students can view own notifications)
CREATE POLICY "Students can view own internship notifications" ON public.internship_notifications
  FOR SELECT TO authenticated
  USING (student_id = auth.uid()::text);

-- ============================================================================
-- 4. HIGH CONCURRENCY DATABASE INDEXES (100+ CONCURRENT USERS)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_accounts_email ON public.accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_roll ON public.accounts(roll_no);
CREATE INDEX IF NOT EXISTS idx_new_students_roll ON public.new_registered_students(roll_no);
CREATE INDEX IF NOT EXISTS idx_new_students_email ON public.new_registered_students(email);
CREATE INDEX IF NOT EXISTS idx_new_students_mobile ON public.new_registered_students(mobile_number);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_registrations_user_event ON public.registrations(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_event ON public.attendance(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_student ON public.internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_internship ON public.internship_applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_status ON public.internship_applications(status);
CREATE INDEX IF NOT EXISTS idx_internship_att_student ON public.internship_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_internship_att_date ON public.internship_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_internship_notif_student ON public.internship_notifications(student_id);

-- ============================================================================
-- 5. INITIAL MASTER DATA FOR GOVERNANCE ACCOUNTS
-- ============================================================================

INSERT INTO public.accounts (
  id, name, roll_no, email, role, department, semester, year, 
  attendance_percentage, points, streak_days, volunteer_hours, avatar
)
VALUES 
  ('u-admin-dean', 'Dr. Ananya Sharma', 'DEAN-001', 'admin.dean@gsfcuniversity.ac.in', 'admin', 'Student Affairs & Academic Governance', 4, 2, 100, 500, 30, 100, 'AS'),
  ('u-tpc-coord', 'Prof. Rajiv Mehta', 'TPC-001', 'tpc.admin@gsfcuniversity.ac.in', 'organizer', 'Training & Placement Cell', 4, 2, 100, 450, 25, 80, 'RM')
ON CONFLICT (email) DO UPDATE SET updated_at = NOW();

-- ============================================================================
-- 6. VERIFICATION QUERY
-- ============================================================================

SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
