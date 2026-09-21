-- ============================================================================
-- GSFC Campus Connect Hub - Complete Database Schema (24 Tables)
-- Run this SQL in your Supabase project's SQL Editor
-- ============================================================================

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  roll_no TEXT UNIQUE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'organizer', 'tpc', 'admin', 'dean', 'security', 'super_admin')),
  department TEXT,
  semester INT,
  avatar TEXT,
  points INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  volunteer_hours INT DEFAULT 0,
  attendance_rate INT DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  mobile_number TEXT,
  school TEXT,
  degree TEXT,
  residence_type TEXT CHECK (residence_type IN ('hostel', 'dayscholar') OR residence_type IS NULL),
  hostel_block_or_bus_route TEXT,
  clubs_interested TEXT[] DEFAULT '{}',
  blood_group TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  department TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  organizer_email TEXT NOT NULL,
  capacity INT DEFAULT 100,
  registered_count INT DEFAULT 0,
  waitlist_count INT DEFAULT 0,
  approval_required BOOLEAN DEFAULT FALSE,
  is_team_event BOOLEAN DEFAULT FALSE,
  min_team_size INT,
  max_team_size INT,
  volunteer_hours_reward INT,
  banner_image TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled', 'pending_approval', 'rejected')),
  current_qr_token TEXT,
  qr_expires_at BIGINT,
  average_rating DECIMAL(3,2),
  review_count INT DEFAULT 0,
  rules TEXT[] DEFAULT '{}',
  require_live_location BOOLEAN DEFAULT FALSE,
  venue_latitude DECIMAL(10,8),
  venue_longitude DECIMAL(11,8),
  allowed_radius_meters INT DEFAULT 350,
  certificates_released BOOLEAN DEFAULT FALSE,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  user_roll_no TEXT,
  user_name TEXT NOT NULL,
  department TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'pending_approval', 'rejected', 'attended', 'punched_in', 'punched_out')),
  is_team BOOLEAN DEFAULT FALSE,
  team_name TEXT,
  team_members JSONB,
  punch_in_time TIMESTAMPTZ,
  punch_out_time TIMESTAMPTZ,
  punch_in_location JSONB,
  punch_out_location JSONB,
  certificate_unlocked BOOLEAN DEFAULT FALSE,
  UNIQUE(event_id, user_id)
);

-- 4. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_roll_no TEXT,
  department TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  punch_in_time TIMESTAMPTZ,
  punch_out_time TIMESTAMPTZ,
  verified_method TEXT NOT NULL CHECK (verified_method IN ('qr_scan', 'manual_admin', 'offline_sync', 'live_punch', 'unified_otp_barcode')),
  token_used TEXT,
  synced BOOLEAN DEFAULT FALSE,
  certificate_id TEXT,
  certificate_unlocked BOOLEAN DEFAULT FALSE,
  user_latitude DECIMAL(10,8),
  user_longitude DECIMAL(11,8),
  accuracy_meters DECIMAL(8,2),
  distance_from_venue_meters DECIMAL(8,2),
  location_verified BOOLEAN DEFAULT FALSE,
  location_address TEXT,
  mobile_number TEXT,
  otp_verified BOOLEAN DEFAULT FALSE,
  barcode_scanned BOOLEAN DEFAULT FALSE,
  barcode_value TEXT,
  vehicle_id TEXT,
  vehicle_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VEHICLE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.vehicle_records (
  id TEXT PRIMARY KEY,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('2_wheeler', '4_wheeler', 'ev', 'commercial')),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('student', 'faculty', 'visitor')),
  owner_name TEXT NOT NULL,
  owner_contact TEXT NOT NULL,
  owner_roll_or_visitor_id TEXT,
  parking_bay TEXT,
  entry_time TIMESTAMPTZ DEFAULT NOW(),
  exit_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'parked' CHECK (status IN ('parked', 'exited')),
  gate_pass_id TEXT,
  verified_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VISITOR RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.visitor_records (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT,
  organization TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('Campus Event Attendance', 'Placement & Industry Meeting', 'Guest Lecture / Workshop', 'Official Campus Visit', 'Vendor / Contractor')),
  person_to_meet TEXT NOT NULL,
  department_to_meet TEXT,
  id_proof_type TEXT NOT NULL,
  id_proof_number TEXT,
  otp_verified BOOLEAN DEFAULT FALSE,
  otp_verified_at TIMESTAMPTZ,
  location_verified BOOLEAN DEFAULT FALSE,
  user_latitude DECIMAL(10,8),
  user_longitude DECIMAL(11,8),
  distance_meters DECIMAL(8,2),
  entry_time TIMESTAMPTZ DEFAULT NOW(),
  exit_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'exited')),
  has_vehicle BOOLEAN DEFAULT FALSE,
  vehicle_id TEXT,
  vehicle_number TEXT,
  vehicle_type TEXT,
  qr_pass_code TEXT NOT NULL,
  assigned_event_id TEXT,
  assigned_event_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PENDING CHECKIN TABLE
CREATE TABLE IF NOT EXISTS public.pending_checkin (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  user_roll_no TEXT,
  user_name TEXT NOT NULL,
  department TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  token TEXT NOT NULL,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BADGES TABLE
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL CHECK (category IN ('attendance', 'engagement', 'leadership', 'volunteer')),
  xp_bonus INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USER BADGES TABLE (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked BOOLEAN DEFAULT FALSE,
  earned_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 10. EVENT FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.event_feedback (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_roll_no TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. EVENT BROADCASTS TABLE
CREATE TABLE IF NOT EXISTS public.event_broadcasts (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'approval', 'alert', 'achievement', 'sync')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  target TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. CLUBS TABLE
CREATE TABLE IF NOT EXISTS public.clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Technical', 'Cultural', 'Sports', 'Social & NSS', 'Entrepreneurship', 'Literary')),
  department TEXT,
  description TEXT,
  banner_image TEXT,
  logo TEXT,
  faculty_coordinator JSONB,
  student_lead JSONB,
  member_count INT DEFAULT 0,
  meeting_schedule TEXT,
  founded_year INT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'recruiting', 'inactive')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CLUB MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.club_members (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_roll_no TEXT,
  department TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'committee', 'lead', 'coordinator')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval')),
  volunteer_hours_earned INT DEFAULT 0,
  UNIQUE(club_id, user_id)
);

-- 16. CLUB ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.club_activities (
  id TEXT PRIMARY KEY,
  club_id TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  club_name TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  description TEXT,
  is_public_event BOOLEAN DEFAULT FALSE,
  attendance_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. VERIFIED ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.verified_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_roll_no TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'hackathon', 'cultural', 'sports', 'leadership', 'volunteering')),
  event_or_activity_name TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  date_earned TEXT NOT NULL,
  certificate_id TEXT,
  verification_hash TEXT NOT NULL,
  qr_code_payload TEXT NOT NULL,
  verified_by TEXT NOT NULL,
  badge_icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. CAMPUS ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.campus_announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('university', 'department', 'club', 'placement', 'emergency')),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  department_target TEXT DEFAULT 'all',
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'emergency')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  read_by TEXT[] DEFAULT '{}'
);

-- 19. CAMPUS SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.campus_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('academic', 'administrative', 'facility', 'student_support', 'emergency')),
  location TEXT NOT NULL,
  room_number TEXT,
  building TEXT,
  opening_hours TEXT,
  head_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. INTERNSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.internships (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT,
  skills_required TEXT[] DEFAULT '{}',
  eligibility TEXT,
  positions INT,
  location TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('On-site', 'Remote', 'Hybrid')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  duration TEXT,
  stipend TEXT,
  working_hours TEXT,
  contact_person TEXT,
  contact_email TEXT,
  application_deadline TEXT NOT NULL,
  required_documents TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. INTERNSHIP APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.internship_applications (
  id TEXT PRIMARY KEY,
  application_number TEXT UNIQUE NOT NULL,
  internship_id TEXT NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  enrollment_number TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  branch TEXT NOT NULL,
  semester INT NOT NULL,
  cgpa DECIMAL(4,2) NOT NULL,
  tenth_percentage DECIMAL(5,2),
  twelfth_percentage DECIMAL(5,2),
  backlogs INT,
  academic_details JSONB,
  address JSONB,
  skills TEXT[] DEFAULT '{}',
  projects TEXT,
  experience TEXT,
  why_internship TEXT,
  career_objective TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  college_id_url TEXT,
  documents JSONB,
  declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'ADMIN_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. INTERNSHIP ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.internship_attendance_records (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES public.internship_applications(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  internship_id TEXT NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  attendance_date TEXT NOT NULL,
  punch_in_time TIMESTAMPTZ NOT NULL,
  punch_in_latitude DECIMAL(10,8) NOT NULL,
  punch_in_longitude DECIMAL(11,8) NOT NULL,
  punch_in_accuracy DECIMAL(8,2) NOT NULL,
  punch_in_address TEXT NOT NULL,
  punch_out_time TIMESTAMPTZ,
  punch_out_latitude DECIMAL(10,8),
  punch_out_longitude DECIMAL(11,8),
  punch_out_accuracy DECIMAL(8,2),
  punch_out_address TEXT,
  working_duration TEXT,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'half_day', 'auto_closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. INTERNSHIP APPROVAL RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.internship_approval_records (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES public.internship_applications(id) ON DELETE CASCADE,
  approval_type TEXT NOT NULL CHECK (approval_type IN ('ADMIN', 'DEAN')),
  approved_by TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected', 'changes_requested')),
  comment TEXT,
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. INTERNSHIP NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.internship_notifications (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  application_id TEXT REFERENCES public.internship_applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('submitted', 'admin_approved', 'dean_approved', 'rejected', 'changes_requested', 'active', 'punch')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_roll_no ON public.user_profiles(roll_no);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON public.attendance_records(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON public.attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_records_number ON public.vehicle_records(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_visitor_records_mobile ON public.visitor_records(mobile);
CREATE INDEX IF NOT EXISTS idx_club_members_user ON public.club_members(user_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club ON public.club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_student ON public.internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_internship ON public.internship_applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_status ON public.internship_applications(status);
CREATE INDEX IF NOT EXISTS idx_internship_attendance_student ON public.internship_attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_internship_notifications_student ON public.internship_notifications(student_id);

-- ============================================================================
-- ROW LEVEL SECURITY - ENABLE ON ALL TABLES
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_checkin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_approval_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PUBLIC READ POLICIES (Basic Access)
-- ============================================================================

CREATE POLICY "Public can read user profiles" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Public can read events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Public can read registrations" ON public.registrations
  FOR SELECT USING (true);

CREATE POLICY "Public can read attendance" ON public.attendance_records
  FOR SELECT USING (true);

CREATE POLICY "Public can read clubs" ON public.clubs
  FOR SELECT USING (true);

CREATE POLICY "Public can read club members" ON public.club_members
  FOR SELECT USING (true);

CREATE POLICY "Public can read internships" ON public.internships
  FOR SELECT USING (true);

CREATE POLICY "Public can read announcements" ON public.campus_announcements
  FOR SELECT USING (true);

CREATE POLICY "Public can read services" ON public.campus_services
  FOR SELECT USING (true);

-- ============================================================================
-- DONE! All 24 tables created successfully
-- ============================================================================
