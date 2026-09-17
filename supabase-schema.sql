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

-- 2. EVENTS TABLE
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

-- 3. REGISTRATIONS TABLE
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

-- 4. ATTENDANCE & PUNCH RECORDS TABLE
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

-- 5. VERIFIED ACHIEVEMENTS & DIGITAL PASSPORT
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

-- 6. CLUBS & SOCIETIES TABLE
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

-- 7. CLUB MEMBERSHIP TABLE
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

-- 8. CAMPUS ANNOUNCEMENTS TABLE
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

-- 9. CAMPUS SERVICES DIRECTORY TABLE
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

-- 10. VISITOR & GATE PASS TABLE
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

-- 11. VEHICLE PARKING ALLOCATION TABLE
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

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  target TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details TEXT
);

-- ==============================================================================
-- INDEXES FOR ULTRA-FAST QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON public.attendance(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_cert ON public.attendance(certificate_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club ON public.club_members(club_id, user_id);

-- Disable Row Level Security (or allow public anonymous access for app demo)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
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

-- Allow read & write policies for public application
DO $$
BEGIN
  CREATE POLICY "Allow public read accounts" ON public.accounts FOR SELECT USING (true);
  CREATE POLICY "Allow public insert accounts" ON public.accounts FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow public update accounts" ON public.accounts FOR UPDATE USING (true);
  
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
