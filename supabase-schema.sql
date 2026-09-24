-- ==============================================================================
-- GSFC UNIVERSITY — CAMPUS CONNECT HUB
-- CANONICAL PRODUCTION DATABASE SCHEMA & INITIALIZATION SCRIPT
-- Single Source of Truth for All Portals, Mentorship, Internships & Governance
-- ==============================================================================

-- Enable UUID & Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. MASTER DATA SYSTEM
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.academic_years (
  id TEXT PRIMARY KEY,
  year_name TEXT UNIQUE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.departments (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department_id TEXT,
  duration_years INT DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.branches (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.semesters (
  id TEXT PRIMARY KEY,
  semester_number INT NOT NULL,
  academic_year_id TEXT,
  department_id TEXT,
  field TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fields (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  contact_person TEXT,
  contact_email TEXT,
  phone TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. ACCOUNTS & USER PROFILES TABLE (ALL ROLES)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  roll_no TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (
    role IN (
      'student',
      'faculty',
      'faculty_mentor',
      'internship_mentor',
      'organizer',
      'tpc',
      'admin',
      'dean',
      'management',
      'security',
      'super_admin'
    )
  ),
  department TEXT NOT NULL,
  semester INT DEFAULT 4,
  year INT DEFAULT 2,
  attendance_percentage INT DEFAULT 85,
  points INT DEFAULT 100,
  streak_days INT DEFAULT 1,
  volunteer_hours INT DEFAULT 0,
  avatar TEXT DEFAULT 'ST',
  mobile_number TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. NEW REGISTERED STUDENTS (LOCKED IDENTITY)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.new_registered_students (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  roll_no TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  school TEXT NOT NULL,
  department TEXT NOT NULL,
  degree TEXT NOT NULL DEFAULT 'B.Tech',
  semester INT NOT NULL DEFAULT 4,
  residence_type TEXT DEFAULT 'hostel' CHECK (residence_type IN ('hostel', 'dayscholar')),
  hostel_block_or_bus_route TEXT,
  clubs_interested TEXT[] DEFAULT ARRAY[]::TEXT[],
  id_card_uploaded BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT TRUE,
  verified_by_university BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Identity Lock Trigger
CREATE OR REPLACE FUNCTION lock_student_name_and_number()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.is_locked = TRUE THEN
      IF NEW.full_name <> OLD.full_name THEN
        RAISE EXCEPTION 'SECURITY POLICY: Student Full Name is permanently locked and cannot be changed after registration.';
      END IF;
      IF NEW.roll_no <> OLD.roll_no THEN
        RAISE EXCEPTION 'SECURITY POLICY: Student Roll/Enrollment Number is permanently locked and cannot be changed after registration.';
      END IF;
    END IF;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lock_student_identity ON public.new_registered_students;
CREATE TRIGGER trg_lock_student_identity
BEFORE UPDATE ON public.new_registered_students
FOR EACH ROW
EXECUTE FUNCTION lock_student_name_and_number();

-- ==============================================================================
-- 4. MENTORSHIP SYSTEM TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.faculty_mentor_assignments (
  id TEXT PRIMARY KEY,
  faculty_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester INT NOT NULL,
  department TEXT NOT NULL,
  field TEXT,
  assigned_by TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reassigned', 'completed', 'removed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.internship_mentor_assignments (
  id TEXT PRIMARY KEY,
  faculty_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  internship_id TEXT,
  academic_year TEXT NOT NULL,
  semester INT NOT NULL,
  department TEXT NOT NULL,
  field TEXT,
  assigned_by TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'removed')),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentor_messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  faculty_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentorship_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  assigned_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Submitted', 'Reviewed', 'Completed')),
  student_id TEXT NOT NULL,
  mentor_id TEXT NOT NULL,
  submission_text TEXT,
  submission_date TIMESTAMPTZ,
  feedback TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentorship_notes (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  faculty_id TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general' CHECK (note_type IN ('academic', 'behavioral', 'attendance', 'career', 'general')),
  content TEXT NOT NULL,
  is_confidential BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.management_audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT,
  target_type TEXT NOT NULL,
  target_id TEXT,
  old_value TEXT,
  new_value TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'global',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission)
);

CREATE TABLE IF NOT EXISTS public.user_permissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  permission TEXT NOT NULL,
  is_granted BOOLEAN DEFAULT TRUE,
  scope TEXT NOT NULL DEFAULT 'assigned',
  granted_by TEXT,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, permission)
);

-- ==============================================================================
-- 5. CAMPUS EVENTS, ATTENDANCE & DIGITAL PASSPORT
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  department TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  venue_latitude NUMERIC NOT NULL DEFAULT 22.3685,
  venue_longitude NUMERIC NOT NULL DEFAULT 73.1895,
  allowed_radius_meters INT NOT NULL DEFAULT 350,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 100,
  registered_count INT NOT NULL DEFAULT 0,
  waitlist_count INT NOT NULL DEFAULT 0,
  approval_required BOOLEAN DEFAULT FALSE,
  is_team_event BOOLEAN DEFAULT FALSE,
  min_team_size INT DEFAULT 1,
  max_team_size INT DEFAULT 4,
  volunteer_hours_reward INT DEFAULT 3,
  banner_image TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'pending_approval', 'rejected', 'cancelled')),
  average_rating NUMERIC(2,1) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_roll_no TEXT NOT NULL,
  user_name TEXT NOT NULL,
  department TEXT NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled', 'attended', 'pending_approval', 'punched_in')),
  is_team BOOLEAN DEFAULT FALSE,
  team_name TEXT,
  team_members JSONB,
  CONSTRAINT uq_registrations_user_event UNIQUE (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_roll_no TEXT NOT NULL,
  department TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  punch_in_time TIMESTAMPTZ,
  punch_out_time TIMESTAMPTZ,
  verified_method TEXT NOT NULL DEFAULT 'qr_scan',
  token_used TEXT,
  certificate_id TEXT,
  user_latitude NUMERIC,
  user_longitude NUMERIC,
  accuracy_meters NUMERIC,
  distance_from_venue_meters INT,
  location_verified BOOLEAN DEFAULT TRUE,
  synced BOOLEAN DEFAULT TRUE,
  CONSTRAINT uq_attendance_user_event UNIQUE (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_roll_no TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  event_or_activity_name TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  date_earned DATE NOT NULL,
  certificate_id TEXT,
  verification_hash TEXT NOT NULL,
  qr_code_payload TEXT NOT NULL,
  verified_by TEXT NOT NULL,
  badge_icon TEXT DEFAULT 'Trophy',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT NOT NULL,
  banner_image TEXT,
  logo TEXT,
  faculty_coordinator JSONB NOT NULL,
  student_lead JSONB NOT NULL,
  member_count INT DEFAULT 1,
  meeting_schedule TEXT NOT NULL,
  founded_year INT DEFAULT 2020,
  status TEXT DEFAULT 'active',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.club_members (
  id TEXT PRIMARY KEY,
  club_id TEXT REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_roll_no TEXT NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'committee', 'lead')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  volunteer_hours_earned INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  department_target TEXT DEFAULT 'all',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'emergency')),
  read_by TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  room_number TEXT,
  building TEXT NOT NULL,
  opening_hours TEXT NOT NULL,
  head_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Building'
);

CREATE TABLE IF NOT EXISTS public.visitors (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  organization TEXT,
  purpose TEXT NOT NULL,
  person_to_meet TEXT NOT NULL,
  department_to_meet TEXT NOT NULL,
  otp_verified BOOLEAN DEFAULT TRUE,
  location_verified BOOLEAN DEFAULT TRUE,
  entry_time TIMESTAMPTZ DEFAULT NOW(),
  exit_time TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'exited')),
  has_vehicle BOOLEAN DEFAULT FALSE,
  vehicle_number TEXT,
  vehicle_type TEXT,
  qr_pass_code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  vehicle_number TEXT UNIQUE NOT NULL,
  vehicle_type TEXT NOT NULL,
  owner_type TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_contact TEXT NOT NULL,
  owner_roll_or_visitor_id TEXT NOT NULL,
  parking_bay TEXT NOT NULL,
  entry_time TIMESTAMPTZ DEFAULT NOW(),
  exit_time TIMESTAMPTZ,
  status TEXT DEFAULT 'parked' CHECK (status IN ('parked', 'exited')),
  gate_pass_id TEXT
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  target TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details TEXT
);

-- ==============================================================================
-- 6. INTERNSHIP SYSTEM TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.internships (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT NOT NULL,
  skills_required TEXT[] DEFAULT ARRAY[]::TEXT[],
  eligibility TEXT NOT NULL,
  positions INT DEFAULT 1,
  location TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('On-site', 'Remote', 'Hybrid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration TEXT NOT NULL,
  stipend TEXT NOT NULL,
  working_hours TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  application_deadline DATE NOT NULL,
  required_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.internship_applications (
  id TEXT PRIMARY KEY,
  application_number TEXT UNIQUE NOT NULL,
  internship_id TEXT REFERENCES public.internships(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  enrollment_number TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  branch TEXT NOT NULL,
  semester INT NOT NULL,
  cgpa NUMERIC(4,2) NOT NULL,
  tenth_percentage NUMERIC(5,2),
  twelfth_percentage NUMERIC(5,2),
  backlogs INT DEFAULT 0,
  academic_details JSONB DEFAULT '{}'::jsonb,
  address JSONB DEFAULT '{}'::jsonb,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  projects TEXT,
  experience TEXT,
  why_internship TEXT,
  career_objective TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  college_id_url TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'ADMIN_REVIEW' CHECK (
    status IN (
      'DRAFT',
      'SUBMITTED',
      'ADMIN_REVIEW',
      'ADMIN_APPROVED',
      'DEAN_REVIEW',
      'APPROVED',
      'REJECTED',
      'CHANGES_REQUESTED',
      'ACTIVE',
      'COMPLETED',
      'CANCELLED'
    )
  ),
  admin_reviewed_by TEXT,
  admin_reviewed_at TIMESTAMPTZ,
  admin_comment TEXT,
  dean_reviewed_by TEXT,
  dean_reviewed_at TIMESTAMPTZ,
  dean_comment TEXT,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unq_student_internship UNIQUE (student_id, internship_id)
);

CREATE TABLE IF NOT EXISTS public.internship_attendance (
  id TEXT PRIMARY KEY,
  application_id TEXT REFERENCES public.internship_applications(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  internship_id TEXT REFERENCES public.internships(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  punch_in_time TIMESTAMPTZ NOT NULL,
  punch_in_latitude NUMERIC NOT NULL,
  punch_in_longitude NUMERIC NOT NULL,
  punch_in_accuracy NUMERIC NOT NULL,
  punch_in_address TEXT NOT NULL,
  punch_out_time TIMESTAMPTZ,
  punch_out_latitude NUMERIC,
  punch_out_longitude NUMERIC,
  punch_out_accuracy NUMERIC,
  punch_out_address TEXT,
  working_duration TEXT,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'half_day', 'auto_closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unq_attendance_day UNIQUE (student_id, internship_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS public.internship_approvals (
  id TEXT PRIMARY KEY,
  application_id TEXT REFERENCES public.internship_applications(id) ON DELETE CASCADE,
  approval_type TEXT NOT NULL CHECK (approval_type IN ('ADMIN', 'DEAN')),
  approved_by TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected', 'changes_requested')),
  comment TEXT,
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.internship_notifications (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  application_id TEXT REFERENCES public.internship_applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. EMAIL OTP AUTHENTICATION TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.auth_otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('login', 'attendance', 'registration', 'password_reset')),
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT DEFAULT 0,
  verified_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  request_id TEXT
);

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. PERFORMANCE INDEXES (CONCURRENT QUERIES & LOOKUPS)
-- ==============================================================================

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

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.new_registered_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.management_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Public Read Policies
  CREATE POLICY "Public can read events" ON public.events FOR SELECT USING (true);
  CREATE POLICY "Public can read announcements" ON public.announcements FOR SELECT USING (true);
  CREATE POLICY "Public can read clubs" ON public.clubs FOR SELECT USING (true);
  CREATE POLICY "Public can read services" ON public.services FOR SELECT USING (true);
  CREATE POLICY "Public can read internships" ON public.internships FOR SELECT USING (true);
  CREATE POLICY "Public can read achievements" ON public.achievements FOR SELECT USING (true);

  -- Authenticated User Policies
  CREATE POLICY "Users can read own accounts" ON public.accounts FOR SELECT USING (true);
  CREATE POLICY "Users can read own registrations" ON public.registrations FOR SELECT USING (true);
  CREATE POLICY "Users can read own attendance" ON public.attendance FOR SELECT USING (true);
  CREATE POLICY "Students can read own registration" ON public.new_registered_students FOR SELECT USING (true);
  CREATE POLICY "Students can read own applications" ON public.internship_applications FOR SELECT USING (true);
  CREATE POLICY "Students can read own internship attendance" ON public.internship_attendance FOR SELECT USING (true);
  CREATE POLICY "Students can read own notifications" ON public.internship_notifications FOR SELECT USING (true);

  -- Mentorship Policies
  CREATE POLICY "Read faculty mentor assignments" ON public.faculty_mentor_assignments FOR SELECT USING (true);
  CREATE POLICY "Read internship mentor assignments" ON public.internship_mentor_assignments FOR SELECT USING (true);
  CREATE POLICY "Read mentor messages" ON public.mentor_messages FOR SELECT USING (true);
  CREATE POLICY "Read mentorship tasks" ON public.mentorship_tasks FOR SELECT USING (true);
  CREATE POLICY "Read mentorship notes" ON public.mentorship_notes FOR SELECT USING (true);
  CREATE POLICY "Read management audit logs" ON public.management_audit_logs FOR SELECT USING (true);
  CREATE POLICY "Read role permissions" ON public.role_permissions FOR SELECT USING (true);
  CREATE POLICY "Read user permissions" ON public.user_permissions FOR SELECT USING (true);

  -- Direct mutation policies
  CREATE POLICY "Insert accounts" ON public.accounts FOR INSERT WITH CHECK (true);
  CREATE POLICY "Update accounts" ON public.accounts FOR UPDATE USING (true);
  CREATE POLICY "Insert registrations" ON public.registrations FOR INSERT WITH CHECK (true);
  CREATE POLICY "Update registrations" ON public.registrations FOR UPDATE USING (true);
  CREATE POLICY "Insert attendance" ON public.attendance FOR INSERT WITH CHECK (true);
  CREATE POLICY "Insert new registered students" ON public.new_registered_students FOR INSERT WITH CHECK (true);
  CREATE POLICY "Update new registered students" ON public.new_registered_students FOR UPDATE USING (true);
  CREATE POLICY "Insert internship applications" ON public.internship_applications FOR INSERT WITH CHECK (true);
  CREATE POLICY "Update internship applications" ON public.internship_applications FOR UPDATE USING (true);
  CREATE POLICY "Insert internship attendance" ON public.internship_attendance FOR INSERT WITH CHECK (true);
  CREATE POLICY "Update internship attendance" ON public.internship_attendance FOR UPDATE USING (true);
  CREATE POLICY "Insert mentor messages" ON public.mentor_messages FOR INSERT WITH CHECK (true);
  CREATE POLICY "Update mentor messages" ON public.mentor_messages FOR UPDATE USING (true);
  CREATE POLICY "Insert mentorship tasks" ON public.mentorship_tasks FOR INSERT WITH CHECK (true);
  CREATE POLICY "Update mentorship tasks" ON public.mentorship_tasks FOR UPDATE USING (true);
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==============================================================================
-- 10. DEFAULT SEED DATA FOR GOVERNANCE & INSTITUTIONAL ACCOUNTS
-- ==============================================================================

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

-- Enable Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.new_registered_students;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.internships;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.internship_applications;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.internship_attendance;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.faculty_mentor_assignments;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mentorship_tasks;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
