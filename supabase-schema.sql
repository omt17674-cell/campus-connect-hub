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
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'organizer')),
  department TEXT NOT NULL,
  semester INT DEFAULT 4,
  year INT DEFAULT 2,
  attendance_percentage INT DEFAULT 85,
  points INT DEFAULT 100,
  streak_days INT DEFAULT 1,
  volunteer_hours INT DEFAULT 0,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NEW REGISTERED STUDENTS TABLE (LOCKED IDENTITY: NAME & MOBILE CANNOT BE ALTERED)
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
  id_card_uploaded BOOLEAN DEFAULT TRUE,
  is_locked BOOLEAN DEFAULT TRUE,
  verified_by_university BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STRICT DATABASE TRIGGER: PREVENTS ANY MODIFICATION TO NAME, MOBILE NUMBER, OR ROLL NUMBER
CREATE OR REPLACE FUNCTION lock_student_name_and_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if full_name was modified
  IF NEW.full_name <> OLD.full_name THEN
    RAISE EXCEPTION 'SECURITY POLICY: Student Full Name is permanently locked and cannot be changed after registration.';
  END IF;

  -- Check if mobile_number was modified
  IF NEW.mobile_number <> OLD.mobile_number THEN
    RAISE EXCEPTION 'SECURITY POLICY: Student Mobile Number is permanently locked and cannot be changed after registration.';
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
  team_members JSONB
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
  synced BOOLEAN DEFAULT TRUE
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
-- INDEXES & ROW LEVEL SECURITY
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_new_students_roll ON public.new_registered_students(roll_no);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON public.attendance(user_id, event_id);

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
-- INITIAL SAMPLE DATA FOR NEW REGISTERED STUDENTS (LOCKED)
-- ==============================================================================
INSERT INTO public.new_registered_students (id, full_name, mobile_number, roll_no, email, school, department, degree, semester, residence_type, hostel_block_or_bus_route, clubs_interested, id_card_uploaded, is_locked, verified_by_university)
VALUES
  ('STU-OM4171', 'Om Thakkar', '+91 98765 04171', '24BT04171', 'omthakkar168@gsfcuniversity.ac.in', 'School of Technology (SOT)', 'Computer Science & Engineering', 'B.Tech', 4, 'hostel', 'Sardar Patel Boys Hostel - Block A', ARRAY['Coding & AI Club', 'Robotics Club'], true, true, true),
  ('STU-PV4192', 'Pooja Varma', '+91 98240 19283', '24BT04192', 'pooja.v@gsfcuniversity.ac.in', 'School of Technology (SOT)', 'Computer Science & Engineering', 'B.Tech', 4, 'dayscholar', 'Route 4 - Vadodara Alkapuri', ARRAY['Chrysalis Cultural Guild'], true, true, true),
  ('STU-RD4205', 'Rohan Dave', '+91 97250 88205', '24BT04205', 'rohan.d@gsfcuniversity.ac.in', 'School of Technology (SOT)', 'Chemical Engineering', 'B.Tech', 4, 'hostel', 'Sardar Patel Boys Hostel - Block A', ARRAY['GSFC E-Cell'], true, true, true)
ON CONFLICT (id) DO NOTHING;
