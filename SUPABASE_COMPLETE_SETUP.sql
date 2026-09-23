-- ==============================================================================
-- GSFC UNIVERSITY CAMPUS CONNECT HUB — COMPLETE SUPABASE DATABASE SETUP
-- Includes All Core Modules, Internships, Mentorship System & Master Data
-- Run this entire script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================================

-- Ensure necessary extensions
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
-- 2. CORE ACCOUNTS & STUDENT REGISTRY
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.accounts (
  id TEXT PRIMARY KEY,
  roll_no TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  mobile_number TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'faculty_mentor', 'internship_mentor', 'organizer', 'tpc', 'admin', 'dean', 'management', 'security', 'super_admin')),
  department TEXT,
  semester INT DEFAULT 0,
  avatar TEXT DEFAULT 'ST',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
  residence_type TEXT DEFAULT 'dayscholar' CHECK (residence_type IN ('hostel', 'dayscholar')),
  hostel_block_or_bus_route TEXT,
  clubs_interested TEXT[] DEFAULT ARRAY[]::TEXT[],
  id_card_uploaded BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT TRUE,
  verified_by_university BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Identity lock trigger to prevent altering student name or roll number
CREATE OR REPLACE FUNCTION lock_student_name_and_number()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.full_name <> OLD.full_name THEN
      RAISE EXCEPTION 'SECURITY POLICY: Student Full Name is permanently locked and cannot be changed.';
    END IF;
    IF NEW.roll_no <> OLD.roll_no THEN
      RAISE EXCEPTION 'SECURITY POLICY: Student Roll Number is permanently locked and cannot be changed.';
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
-- 3. MENTORSHIP SYSTEM TABLES
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
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. CAMPUS EVENTS, ATTENDANCE & PASSPORT
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Tech', 'Culture', 'Sports', 'Leadership', 'Academic', 'Career', 'Workshop')),
  department TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INT NOT NULL,
  registered_count INT DEFAULT 0,
  attended_count INT DEFAULT 0,
  banner TEXT,
  qr_code_value TEXT NOT NULL,
  xp_points INT NOT NULL,
  organizer TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled', 'pending_approval', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_roll_no TEXT NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  qr_ticket_payload TEXT NOT NULL,
  attendance_status TEXT DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'cancelled', 'absent')),
  attended_at TIMESTAMPTZ,
  team_name TEXT,
  team_members TEXT[]
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_roll_no TEXT NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  verifier_role TEXT NOT NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('qr_scan', 'manual', 'nfc', 'biometric', 'self_checkin')),
  points_awarded INT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  is_flagged BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  student_roll_no TEXT NOT NULL,
  event_id TEXT REFERENCES public.events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  points INT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  pdf_certificate_url TEXT
);

CREATE TABLE IF NOT EXISTS public.clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  department TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  leader_email TEXT NOT NULL,
  member_count INT DEFAULT 0,
  avatar TEXT,
  banner TEXT,
  established_year INT DEFAULT 2024,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.club_members (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_roll_no TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  target_audience TEXT NOT NULL DEFAULT 'all',
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  opening_hours TEXT NOT NULL,
  head_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.visitors (
  id TEXT PRIMARY KEY,
  visitor_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  purpose TEXT NOT NULL,
  visiting_person TEXT NOT NULL,
  visiting_dept TEXT NOT NULL,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  gate_number TEXT NOT NULL,
  pass_number TEXT NOT NULL,
  vehicle_number TEXT,
  badge_status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  plate_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_role TEXT NOT NULL,
  owner_id_or_roll TEXT NOT NULL,
  parking_slot TEXT NOT NULL,
  entry_time TIMESTAMPTZ DEFAULT NOW(),
  exit_time TIMESTAMPTZ,
  gate_number TEXT NOT NULL,
  status TEXT DEFAULT 'parked'
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. INTERNSHIP GOVERNANCE TABLES
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
  mode TEXT NOT NULL DEFAULT 'On-site',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration TEXT NOT NULL,
  stipend TEXT NOT NULL,
  working_hours TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  application_deadline DATE NOT NULL,
  required_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.internship_applications (
  id TEXT PRIMARY KEY,
  internship_id TEXT NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  student_roll_no TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_department TEXT NOT NULL,
  student_semester INT NOT NULL,
  resume_url TEXT,
  cover_letter TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'SUBMITTED',
  dean_approval_status TEXT DEFAULT 'PENDING',
  dean_remarks TEXT,
  faculty_mentor_id TEXT,
  company_feedback TEXT
);

CREATE TABLE IF NOT EXISTS public.internship_attendance (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES public.internship_applications(id) ON DELETE CASCADE,
  student_roll_no TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'PRESENT',
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  tasks_summary TEXT,
  verified_by_mentor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.internship_approvals (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES public.internship_applications(id) ON DELETE CASCADE,
  approver_name TEXT NOT NULL,
  approver_role TEXT NOT NULL,
  action TEXT NOT NULL,
  remarks TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.internship_notifications (
  id TEXT PRIMARY KEY,
  recipient_roll_or_email TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.auth_otp_verifications (
  id TEXT PRIMARY KEY,
  mobile_number TEXT,
  email TEXT,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL,
  role TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.new_registered_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.management_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_attendance ENABLE ROW LEVEL SECURITY;

-- Permissive public read & manage policies for local/hybrid development
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public Read All" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Public Read All" ON public.%I FOR SELECT USING (true);', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public Insert All" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Public Insert All" ON public.%I FOR INSERT WITH CHECK (true);', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public Update All" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Public Update All" ON public.%I FOR UPDATE USING (true) WITH CHECK (true);', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public Delete All" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Public Delete All" ON public.%I FOR DELETE USING (true);', tbl);
  END LOOP;
END $$;

-- ==============================================================================
-- 7. PRE-SEEDED TEST DATA (MASTER DATA, FACULTY, STUDENTS & ASSIGNMENTS)
-- ==============================================================================

-- Master Data
INSERT INTO public.academic_years (id, year_name, is_current, start_date, end_date)
VALUES 
  ('ay-2025-26', '2025-2026', true, '2025-07-01', '2026-06-30'),
  ('ay-2024-25', '2024-2025', false, '2024-07-01', '2025-06-30')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.departments (id, code, name, school)
VALUES 
  ('dept-cse', 'CSE', 'Computer Science & Engineering', 'School of Technology (SOT)'),
  ('dept-chem', 'CHE', 'Chemical & Petrochemical Eng', 'School of Technology (SOT)'),
  ('dept-mech', 'MECH', 'Mechanical & Automation Eng', 'School of Technology (SOT)'),
  ('dept-som', 'SOM', 'School of Management', 'School of Management (SOM)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.fields (id, name, department_id)
VALUES 
  ('fld-ai-ds', 'Artificial Intelligence & Data Science', 'dept-cse'),
  ('fld-cyber-iot', 'Cyber Security & IoT', 'dept-cse'),
  ('fld-petro', 'Petrochemical & Process Engineering', 'dept-chem'),
  ('fld-fintech', 'FinTech & Business Analytics', 'dept-som'),
  ('fld-robotics', 'Robotics & Industrial Automation', 'dept-mech')
ON CONFLICT (id) DO NOTHING;

-- Official Accounts
INSERT INTO public.accounts (id, roll_no, email, password_hash, mobile_number, role, department, semester, avatar, is_verified)
VALUES
  ('u-ananya', 'DEAN-001', 'admin.dean@gsfcuniversity.ac.in', '9558413347@Om', '+91 95584 13347', 'admin', 'Student Affairs & Academic Governance', 0, 'AS', true),
  ('u-tpc', 'TPC-001', 'tpc.admin@gsfcuniversity.ac.in', '7043313347@Om', '+91 70433 13347', 'organizer', 'Training & Placement Cell / Event Convener', 0, 'RM', true),
  ('fac-1', 'FAC-001', 'faculty.mentor@gsfcuniversity.ac.in', '9558413347@Om', '+91 98765 00001', 'faculty_mentor', 'Computer Science & Engineering', 0, 'KJ', true),
  ('fac-2', 'FAC-002', 'internship.mentor@gsfcuniversity.ac.in', '9558413347@Om', '+91 98765 00002', 'internship_mentor', 'Chemical & Petrochemical Eng', 0, 'SD', true),
  ('u-management', 'MGT-001', 'management.admin@gsfcuniversity.ac.in', '9558413347@Om', '+91 98765 00003', 'management', 'Institutional Governance', 0, 'SP', true)
ON CONFLICT (id) DO NOTHING;

-- 5 Test Students
INSERT INTO public.new_registered_students (id, full_name, mobile_number, roll_no, email, school, department, degree, semester, residence_type, hostel_block_or_bus_route, clubs_interested, id_card_uploaded, is_locked, verified_by_university, is_verified)
VALUES
  ('stu-01', 'Aarav Mehta', '+91 98765 43210', '24BT04171', '24bt04171@gsfcuniversity.ac.in', 'School of Technology (SOT)', 'Computer Science & Engineering', 'B.Tech Computer Science & Engineering', 6, 'dayscholar', 'Route 4 - Alkapuri', ARRAY['AI & Robotics Club', 'Coding Club'], true, true, true, true),
  ('stu-02', 'Diya Patel', '+91 98765 43211', '24BT04182', '24bt04182@gsfcuniversity.ac.in', 'School of Technology (SOT)', 'Chemical & Petrochemical Eng', 'B.Tech Chemical Engineering', 6, 'hostel', 'Kasturba Girls Hostel Block B', ARRAY['Green Tech Club'], true, true, true, true),
  ('stu-03', 'Rohan Shah', '+91 98765 43212', '24BT04195', '24bt04195@gsfcuniversity.ac.in', 'School of Technology (SOT)', 'Computer Science & Engineering', 'B.Tech Computer Science & Engineering (IoT)', 4, 'dayscholar', 'Route 12 - Manjalpur', ARRAY['Cyber Security Cell'], true, true, true, true),
  ('stu-04', 'Ananya Joshi', '+91 98765 43213', '24BB01045', '24bb01045@gsfcuniversity.ac.in', 'School of Management (SOM)', 'School of Management', 'BBA (Finance & Data Analytics)', 4, 'dayscholar', 'Route 8 - Sama', ARRAY['Finance & FinTech Club'], true, true, true, true),
  ('stu-05', 'Harshil Trivedi', '+91 98765 43214', '24BT04210', '24bt04210@gsfcuniversity.ac.in', 'School of Technology (SOT)', 'Mechanical & Automation Eng', 'B.Tech Mechanical Engineering', 6, 'hostel', 'Vikram Sarabhai Boys Hostel Room 104', ARRAY['Robotics Club'], true, true, true, true)
ON CONFLICT (roll_no) DO NOTHING;

-- Initial Faculty Mentor Allocations
INSERT INTO public.faculty_mentor_assignments (id, faculty_id, student_id, academic_year, semester, department, field, assigned_by, status, notes)
VALUES
  ('fma-01', 'fac-1', 'stu-01', '2025-2026', 6, 'Computer Science & Engineering', 'Artificial Intelligence & Data Science', 'Institutional Management Portal', 'active', 'Semester 6 Capstone Project & AI Research Mentorship'),
  ('fma-02', 'fac-2', 'stu-02', '2025-2026', 6, 'Chemical & Petrochemical Eng', 'Petrochemical & Process Engineering', 'Institutional Management Portal', 'active', 'GSFC Fertilizernagar Plant Process Safety Cohort'),
  ('fma-03', 'u-tpc', 'stu-03', '2025-2026', 4, 'Computer Science & Engineering', 'Cyber Security & IoT', 'Institutional Management Portal', 'active', 'Placement Readiness & IoT Infrastructure Mentorship')
ON CONFLICT (id) DO NOTHING;

-- Initial Mentorship Tasks
INSERT INTO public.mentorship_tasks (id, title, description, assigned_date, due_date, priority, status, student_id, mentor_id, submission_text, feedback)
VALUES
  ('mt-01', 'Capstone Project Synopsis & Architecture Survey', 'Submit 5-page synopsis detailing model pipeline for Edge AI traffic optimization using YOLOv11 and TensorRT.', '2026-09-10', '2026-10-15', 'high', 'Submitted', 'stu-01', 'fac-1', 'Uploaded draft synopsis on Edge AI Real-Time Traffic Optimization with YOLOv11 & TensorRT benchmarks.', 'Good work Aarav. Focus on section 3 benchmarking with TensorRT before presentation.'),
  ('mt-02', 'Chemical Plant Process Safety & Emission Audit', 'Review standard operating procedures (SOPs) for the ammonia reactor plant and prepare hazard analysis report.', '2026-09-15', '2026-10-20', 'urgent', 'Pending', 'stu-02', 'fac-2', null, null),
  ('mt-03', 'Secure MQTT Broker TLS Configuration', 'Configure Mosquitto broker with TLS certificates and test payload encryption with ESP32 edge sensors.', '2026-09-05', '2026-09-30', 'medium', 'Completed', 'stu-03', 'u-tpc', 'Configured Mosquitto MQTT broker with mTLS x509 certs and tested packet loss.', 'Excellent implementation of mutual authentication.')
ON CONFLICT (id) DO NOTHING;

-- Initial Mentor Messages
INSERT INTO public.mentor_messages (id, sender_id, sender_name, sender_role, receiver_id, student_id, faculty_id, subject, message, priority, is_read)
VALUES
  ('msg-01', 'stu-01', 'Aarav Mehta', 'student', 'fac-1', 'stu-01', 'fac-1', 'Draft Synopsis Review for Edge AI Traffic Model', 'Respected Dr. Joshi, I have uploaded the draft synopsis in the portal. Please let me know if any methodology changes are required.', 'high', true),
  ('msg-02', 'fac-1', 'Dr. K. N. Joshi', 'mentor', 'stu-01', 'stu-01', 'fac-1', 'Re: Draft Synopsis Review for Edge AI Traffic Model', 'Aarav, the synopsis looks promising. Please make sure to include the hardware specifications of the Jetson Orin Nano module in Section 4.', 'medium', false),
  ('msg-03', 'stu-02', 'Diya Patel', 'student', 'fac-2', 'stu-02', 'fac-2', 'GSFC Fertilizernagar Plant Visit Permission', 'Respected Ma''am, does the chemical engineering department require a signed hard copy of the parent consent form for the industrial visit?', 'medium', true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- END OF SUPABASE COMPLETE SETUP
-- ==============================================================================
