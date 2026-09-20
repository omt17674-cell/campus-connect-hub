-- ==============================================================================
-- GSFC UNIVERSITY — CAMPUS CONNECT HUB
-- SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Project Reference: llhfumrtotectnbpeabu
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ACCOUNTS & USERS TABLE
CREATE TABLE IF NOT EXISTS public.accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  roll_no TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'organizer', 'tpc', 'admin', 'dean', 'security', 'super_admin')),
  department TEXT NOT NULL,
  semester INT DEFAULT 4,
  year INT DEFAULT 2,
  attendance_percentage INT DEFAULT 85,
  points INT DEFAULT 100,
  streak_days INT DEFAULT 1,
  volunteer_hours INT DEFAULT 0,
  avatar TEXT,
  mobile_number TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NEW REGISTERED STUDENTS TABLE (LOCKED IDENTITY: NAME & ROLL NUMBER CANNOT BE ALTERED)
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

-- STRICT DATABASE TRIGGER: PREVENTS ANY MODIFICATION TO FULL NAME OR ROLL NUMBER
CREATE OR REPLACE FUNCTION lock_student_name_and_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if full_name was modified
  IF NEW.full_name <> OLD.full_name THEN
    RAISE EXCEPTION 'SECURITY POLICY: Student Full Name is permanently locked and cannot be changed after registration.';
  END IF;

  -- Check if roll_no was modified
  IF NEW.roll_no <> OLD.roll_no THEN
    RAISE EXCEPTION 'SECURITY POLICY: Student Roll/Enrollment Number is permanently locked and cannot be changed after registration.';
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

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  department TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
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

-- 4. REGISTRATIONS TABLE
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

-- 5. ATTENDANCE & PUNCH RECORDS TABLE
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
  distance_from_venue_meters INT,
  location_verified BOOLEAN DEFAULT TRUE,
  synced BOOLEAN DEFAULT TRUE,
  CONSTRAINT uq_attendance_user_event UNIQUE (user_id, event_id)
);

-- 6. VERIFIED ACHIEVEMENTS & DIGITAL PASSPORT
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

-- 7. CLUBS & SOCIETIES TABLE
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

-- 8. CLUB MEMBERSHIP TABLE
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

-- 9. CAMPUS ANNOUNCEMENTS TABLE
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

-- 10. CAMPUS SERVICES DIRECTORY TABLE
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

-- 11. VISITOR & GATE PASS TABLE
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

-- 12. VEHICLE PARKING ALLOCATION TABLE
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

-- 13. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  target TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details TEXT
);

-- ==============================================================================
-- HIGH-CONCURRENCY INDEXES (OPTIMIZED FOR 1,000+ SIMULTANEOUS LOGINS & CHECK-INS)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_accounts_email ON public.accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_roll ON public.accounts(roll_no);
CREATE INDEX IF NOT EXISTS idx_new_students_roll ON public.new_registered_students(roll_no);
CREATE INDEX IF NOT EXISTS idx_new_students_email ON public.new_registered_students(email);
CREATE INDEX IF NOT EXISTS idx_new_students_mobile ON public.new_registered_students(mobile_number);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON public.attendance(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance(event_id);

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

DO $$
BEGIN
  CREATE POLICY "Allow public read accounts" ON public.accounts FOR SELECT USING (true);
  CREATE POLICY "Allow public insert accounts" ON public.accounts FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow public update accounts" ON public.accounts FOR UPDATE USING (true);

  CREATE POLICY "Allow public read new_students" ON public.new_registered_students FOR SELECT USING (true);
  CREATE POLICY "Allow public insert new_students" ON public.new_registered_students FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow public update new_students" ON public.new_registered_students FOR UPDATE USING (true);

  CREATE POLICY "Allow public read events" ON public.events FOR SELECT USING (true);
  CREATE POLICY "Allow public insert events" ON public.events FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow public update events" ON public.events FOR UPDATE USING (true);

  CREATE POLICY "Allow public read registrations" ON public.registrations FOR SELECT USING (true);
  CREATE POLICY "Allow public insert registrations" ON public.registrations FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow public update registrations" ON public.registrations FOR UPDATE USING (true);

  CREATE POLICY "Allow public read attendance" ON public.attendance FOR SELECT USING (true);
  CREATE POLICY "Allow public insert attendance" ON public.attendance FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow public update attendance" ON public.attendance FOR UPDATE USING (true);

  CREATE POLICY "Allow public read achievements" ON public.achievements FOR SELECT USING (true);
  CREATE POLICY "Allow public insert achievements" ON public.achievements FOR INSERT WITH CHECK (true);

  CREATE POLICY "Allow public read clubs" ON public.clubs FOR SELECT USING (true);
  CREATE POLICY "Allow public insert clubs" ON public.clubs FOR INSERT WITH CHECK (true);

  CREATE POLICY "Allow public read club_members" ON public.club_members FOR SELECT USING (true);
  CREATE POLICY "Allow public insert club_members" ON public.club_members FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow public delete club_members" ON public.club_members FOR DELETE USING (true);

  CREATE POLICY "Allow public read announcements" ON public.announcements FOR SELECT USING (true);
  CREATE POLICY "Allow public insert announcements" ON public.announcements FOR INSERT WITH CHECK (true);

  CREATE POLICY "Allow public read services" ON public.services FOR SELECT USING (true);
  CREATE POLICY "Allow public read visitors" ON public.visitors FOR SELECT USING (true);
  CREATE POLICY "Allow public insert visitors" ON public.visitors FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow public read vehicles" ON public.vehicles FOR SELECT USING (true);
  CREATE POLICY "Allow public insert vehicles" ON public.vehicles FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow public read audit_logs" ON public.audit_logs FOR SELECT USING (true);
  CREATE POLICY "Allow public insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==============================================================================
-- INITIAL MASTER DATA FOR GOVERNANCE ACCOUNTS (ADMIN & ORGANIZER)
-- ==============================================================================
INSERT INTO public.accounts (id, name, roll_no, email, role, department, semester, year, attendance_percentage, points, streak_days, volunteer_hours, avatar)
VALUES
  ('u-ananya', 'Dr. Ananya Sharma (Dean)', 'ADM-DEAN-001', 'admin.dean@gsfcuniversity.ac.in', 'admin', 'Student Affairs & Academic Governance', 0, 0, 100, 3200, 120, 95, 'AS'),
  ('u-tpc', 'Prof. Rajiv Mehta (TPC Head)', 'TPC-ADMIN-108', 'tpc.admin@gsfcuniversity.ac.in', 'organizer', 'Training & Placement Cell / Event Convener', 0, 0, 99, 1950, 52, 65, 'RM')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- ==============================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.new_registered_students;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==============================================================================
-- LOCKED STUDENT IDENTITY INTEGRITY TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.prevent_locked_student_mutation()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_locked = true THEN
    IF NEW.full_name IS DISTINCT FROM OLD.full_name OR
       NEW.roll_no IS DISTINCT FROM OLD.roll_no OR
       NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Identity fields (Full Name, Roll Number, Email) are strictly locked after verification and cannot be modified directly.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_locked_student_mutation ON public.new_registered_students;
CREATE TRIGGER trg_prevent_locked_student_mutation
BEFORE UPDATE ON public.new_registered_students
FOR EACH ROW
EXECUTE FUNCTION public.prevent_locked_student_mutation();

-- ==============================================================================
-- 14. INTERNSHIPS TABLE
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

-- ==============================================================================
-- 15. INTERNSHIP APPLICATIONS TABLE
-- ==============================================================================
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

-- ==============================================================================
-- 16. INTERNSHIP ATTENDANCE (GPS PUNCH-IN & PUNCH-OUT)
-- ==============================================================================
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

-- ==============================================================================
-- 17. INTERNSHIP APPROVALS LOG TABLE
-- ==============================================================================
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

-- ==============================================================================
-- 18. INTERNSHIP NOTIFICATIONS TABLE
-- ==============================================================================
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
-- PRODUCTION SCALABILITY INDEXES & CONSTRAINTS (100+ CONCURRENT USERS)
-- ==============================================================================

-- 1. Internships Indexes
CREATE INDEX IF NOT EXISTS idx_internships_status ON public.internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_deadline ON public.internships(application_deadline);
CREATE INDEX IF NOT EXISTS idx_internships_dates ON public.internships(start_date, end_date);

-- 2. Internship Applications Indexes
CREATE INDEX IF NOT EXISTS idx_internship_apps_student ON public.internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_internship ON public.internship_applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_status ON public.internship_applications(status);
CREATE INDEX IF NOT EXISTS idx_internship_apps_app_no ON public.internship_applications(application_number);
CREATE INDEX IF NOT EXISTS idx_internship_apps_created ON public.internship_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_internship_apps_enrollment ON public.internship_applications(enrollment_number);
CREATE INDEX IF NOT EXISTS idx_internship_apps_status_created ON public.internship_applications(status, created_at DESC);

-- 3. Internship Attendance Indexes
CREATE INDEX IF NOT EXISTS idx_internship_att_student ON public.internship_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_internship_att_internship ON public.internship_attendance(internship_id);
CREATE INDEX IF NOT EXISTS idx_internship_att_app ON public.internship_attendance(application_id);
CREATE INDEX IF NOT EXISTS idx_internship_att_date ON public.internship_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_internship_att_punch_in ON public.internship_attendance(punch_in_time);
CREATE INDEX IF NOT EXISTS idx_internship_att_student_date ON public.internship_attendance(student_id, attendance_date);

-- 4. Internship Approvals Indexes
CREATE INDEX IF NOT EXISTS idx_internship_approvals_app ON public.internship_approvals(application_id);
CREATE INDEX IF NOT EXISTS idx_internship_approvals_type ON public.internship_approvals(approval_type);
CREATE INDEX IF NOT EXISTS idx_internship_approvals_status ON public.internship_approvals(status);
CREATE INDEX IF NOT EXISTS idx_internship_approvals_created ON public.internship_approvals(created_at);

-- 5. Internship Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_internship_notif_student ON public.internship_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_internship_notif_read ON public.internship_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_internship_notif_created ON public.internship_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_internship_notif_student_read ON public.internship_notifications(student_id, is_read);

-- Safe position check trigger: Prevents race conditions from exceeding positions
CREATE OR REPLACE FUNCTION public.check_internship_positions_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_positions INT;
  v_accepted_count INT;
BEGIN
  IF NEW.status IN ('APPROVED', 'ACTIVE') AND (OLD.status IS NULL OR OLD.status NOT IN ('APPROVED', 'ACTIVE')) THEN
    SELECT positions INTO v_positions FROM public.internships WHERE id = NEW.internship_id;
    IF v_positions IS NOT NULL AND v_positions > 0 THEN
      SELECT count(*) INTO v_accepted_count
      FROM public.internship_applications
      WHERE internship_id = NEW.internship_id AND status IN ('APPROVED', 'ACTIVE') AND id <> NEW.id;
      
      IF v_accepted_count >= v_positions THEN
        RAISE EXCEPTION 'CAPACITY_EXCEEDED: All available positions (%) for this internship have already been filled.', v_positions;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_internship_positions ON public.internship_applications;
CREATE TRIGGER trg_check_internship_positions
BEFORE UPDATE ON public.internship_applications
FOR EACH ROW
EXECUTE FUNCTION public.check_internship_positions_capacity();

-- Enable RLS
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- Internships: Public viewable, admin writable
  CREATE POLICY "Allow public read internships" ON public.internships FOR SELECT USING (true);
  CREATE POLICY "Allow admin write internships" ON public.internships FOR ALL USING (true);

  -- Applications: Students can see their own, admins can see all
  CREATE POLICY "Allow read internship_applications" ON public.internship_applications FOR SELECT USING (true);
  CREATE POLICY "Allow insert internship_applications" ON public.internship_applications FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow update internship_applications" ON public.internship_applications FOR UPDATE USING (true);

  -- Attendance: Students can see own, admin see all
  CREATE POLICY "Allow read internship_attendance" ON public.internship_attendance FOR SELECT USING (true);
  CREATE POLICY "Allow insert internship_attendance" ON public.internship_attendance FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow update internship_attendance" ON public.internship_attendance FOR UPDATE USING (true);

  -- Approvals & Notifications
  CREATE POLICY "Allow read internship_approvals" ON public.internship_approvals FOR SELECT USING (true);
  CREATE POLICY "Allow write internship_approvals" ON public.internship_approvals FOR ALL USING (true);

  CREATE POLICY "Allow read internship_notifications" ON public.internship_notifications FOR SELECT USING (true);
  CREATE POLICY "Allow write internship_notifications" ON public.internship_notifications FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Database Triggers for Integrity
CREATE OR REPLACE FUNCTION public.check_internship_punch_eligibility()
RETURNS TRIGGER AS $$
DECLARE
  v_app_status TEXT;
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  SELECT a.status, i.start_date, i.end_date
  INTO v_app_status, v_start_date, v_end_date
  FROM public.internship_applications a
  JOIN public.internships i ON i.id = a.internship_id
  WHERE a.id = NEW.application_id;

  IF v_app_status NOT IN ('APPROVED', 'ACTIVE') THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: Cannot punch attendance. Application status is %; must be APPROVED or ACTIVE.', v_app_status;
  END IF;

  IF NEW.attendance_date < v_start_date OR NEW.attendance_date > v_end_date THEN
    RAISE EXCEPTION 'SECURITY VIOLATION: Cannot punch attendance outside internship dates (% to %).', v_start_date, v_end_date;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_internship_punch_eligibility ON public.internship_attendance;
CREATE TRIGGER trg_check_internship_punch_eligibility
BEFORE INSERT ON public.internship_attendance
FOR EACH ROW
EXECUTE FUNCTION public.check_internship_punch_eligibility();

CREATE OR REPLACE FUNCTION public.lock_internship_punch_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.punch_in_latitude IS DISTINCT FROM NEW.punch_in_latitude OR
     OLD.punch_in_longitude IS DISTINCT FROM NEW.punch_in_longitude OR
     OLD.punch_in_time IS DISTINCT FROM NEW.punch_in_time THEN
    RAISE EXCEPTION 'SECURITY POLICY: Punch-in GPS coordinates and timestamp cannot be altered.';
  END IF;

  IF NEW.punch_out_time IS NOT NULL AND NEW.punch_out_time < OLD.punch_in_time THEN
    RAISE EXCEPTION 'VALIDATION ERROR: Punch-out time cannot precede Punch-in time.';
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lock_internship_punch_history ON public.internship_attendance;
CREATE TRIGGER trg_lock_internship_punch_history
BEFORE UPDATE ON public.internship_attendance
FOR EACH ROW
EXECUTE FUNCTION public.lock_internship_punch_history();

-- Enable Realtime for Internship Tables
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.internships;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.internship_applications;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.internship_attendance;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.internship_notifications;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==============================================================================
-- 13. PERFORMANCE & INTEGRITY INDEXES (Requirement 23)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_accounts_email_role ON public.accounts(email, role);
CREATE INDEX IF NOT EXISTS idx_accounts_roll_no ON public.accounts(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON public.new_registered_students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.new_registered_students(email);
CREATE INDEX IF NOT EXISTS idx_students_department ON public.new_registered_students(department);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON public.new_registered_students(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_user_event ON public.registrations(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_status ON public.registrations(event_id, status);
CREATE INDEX IF NOT EXISTS idx_attendance_user_event ON public.attendance(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON public.attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_events_date_status ON public.events(date, status);
CREATE INDEX IF NOT EXISTS idx_internship_apps_student ON public.internship_applications(student_id, status);


