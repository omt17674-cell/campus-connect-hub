-- ============================================================================
-- CAMPUS CONNECT HUB - PRODUCTION DATABASE SETUP & RLS INITIALIZATION
-- ============================================================================
-- Apply this script to ensure all RLS policies, indexes, and real-time
-- subscriptions are active and synchronized with supabase-schema.sql.
-- ============================================================================

-- Ensure uuid & pgcrypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE IF EXISTS public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.new_registered_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.internship_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.internship_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.internship_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.faculty_mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.internship_mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mentor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mentorship_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mentorship_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.management_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.auth_otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- 2. HIGH-CONCURRENCY INDEXES (OPTIMIZED FOR 1,000+ USERS)
CREATE INDEX IF NOT EXISTS idx_accounts_email ON public.accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_roll ON public.accounts(roll_no);
CREATE INDEX IF NOT EXISTS idx_accounts_role ON public.accounts(role);
CREATE INDEX IF NOT EXISTS idx_new_students_roll ON public.new_registered_students(roll_no);
CREATE INDEX IF NOT EXISTS idx_new_students_email ON public.new_registered_students(email);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_registrations_user_event ON public.registrations(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_event ON public.attendance(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_faculty_mentors_fac ON public.faculty_mentor_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_faculty_mentors_stu ON public.faculty_mentor_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_msgs_stu ON public.mentor_messages(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_msgs_fac ON public.mentor_messages(faculty_id);
CREATE INDEX IF NOT EXISTS idx_mentor_tasks_stu ON public.mentorship_tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_student ON public.internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_status ON public.internship_applications(status);
CREATE INDEX IF NOT EXISTS idx_internship_att_student ON public.internship_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_otp_email_purpose ON public.auth_otp_verifications(email, purpose);

-- 3. SEED CORE GOVERNANCE USERS
INSERT INTO public.accounts (id, name, roll_no, email, role, department, semester, year, attendance_percentage, points, streak_days, volunteer_hours, avatar)
VALUES
  ('u-ananya', 'Dr. Ananya Sharma (Dean)', 'ADM-DEAN-001', 'admin.dean@gsfcuniversity.ac.in', 'admin', 'Student Affairs & Academic Governance', 0, 0, 100, 3200, 120, 95, 'AS'),
  ('u-tpc', 'Prof. Rajiv Mehta (TPC Head)', 'TPC-ADMIN-108', 'tpc.admin@gsfcuniversity.ac.in', 'organizer', 'Training & Placement Cell / Event Convener', 0, 0, 99, 1950, 52, 65, 'RM'),
  ('u-fac-joshi', 'Dr. K. N. Joshi (Faculty Mentor)', 'FAC-CSE-012', 'faculty.mentor@gsfcuniversity.ac.in', 'faculty_mentor', 'Computer Science & Engineering', 0, 0, 100, 1500, 30, 40, 'KJ'),
  ('u-fac-dave', 'Prof. Sneha Dave (Internship Mentor)', 'FAC-CHE-008', 'internship.mentor@gsfcuniversity.ac.in', 'internship_mentor', 'Chemical & Petrochemical Eng', 0, 0, 100, 1600, 45, 50, 'SD'),
  ('u-mgmt-patel', 'Dr. S. K. Patel (Management Head)', 'MGMT-DIR-001', 'management.admin@gsfcuniversity.ac.in', 'management', 'Institutional Governance & Quality Assurance', 0, 0, 100, 4000, 200, 120, 'SP')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  updated_at = NOW();

-- 4. VERIFY ACTIVE TABLES
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
