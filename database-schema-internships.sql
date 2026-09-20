-- GSFC University - Internship Management System
-- Database Schema for Supabase PostgreSQL

-- ============================================
-- Table 1: internships
-- ============================================
CREATE TABLE IF NOT EXISTS public.internships (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    description TEXT,
    department TEXT DEFAULT 'Computer Science & Engineering',
    skills_required JSONB DEFAULT '[]'::jsonb,
    eligibility TEXT,
    positions INTEGER DEFAULT 1,
    location TEXT DEFAULT 'Vadodara, Gujarat',
    mode TEXT CHECK (mode IN ('On-site', 'Remote', 'Hybrid')) DEFAULT 'On-site',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration TEXT DEFAULT '6 Months',
    stipend TEXT DEFAULT '₹15,000 / month',
    working_hours TEXT DEFAULT '09:00 AM - 05:30 PM (Mon-Fri)',
    contact_person TEXT,
    contact_email TEXT,
    application_deadline DATE NOT NULL,
    required_documents JSONB DEFAULT '["Resume/CV", "College ID Card"]'::jsonb,
    status TEXT CHECK (status IN ('open', 'closed', 'draft')) DEFAULT 'open',
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table 2: internship_applications
-- ============================================
CREATE TABLE IF NOT EXISTS public.internship_applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    application_number TEXT UNIQUE NOT NULL,
    internship_id TEXT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    enrollment_number TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    course TEXT DEFAULT 'B.Tech',
    branch TEXT DEFAULT 'Computer Science & Engineering',
    semester INTEGER DEFAULT 6,
    cgpa DECIMAL(3,2),
    tenth_percentage DECIMAL(5,2),
    twelfth_percentage DECIMAL(5,2),
    backlogs INTEGER DEFAULT 0,
    academic_details JSONB DEFAULT '{}'::jsonb,
    address JSONB DEFAULT '{}'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    projects TEXT,
    experience TEXT,
    why_internship TEXT,
    career_objective TEXT,
    cover_letter TEXT,
    resume_url TEXT,
    college_id_url TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    declaration_accepted BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'SUBMITTED',
    admin_reviewed_by TEXT,
    admin_reviewed_at TIMESTAMPTZ,
    admin_comment TEXT,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table 3: internship_attendance
-- ============================================
CREATE TABLE IF NOT EXISTS public.internship_attendance (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    application_id TEXT NOT NULL REFERENCES internship_applications(id),
    student_id TEXT NOT NULL,
    internship_id TEXT NOT NULL REFERENCES internships(id),
    attendance_date DATE NOT NULL,
    punch_in_time TIMESTAMPTZ NOT NULL,
    punch_in_latitude DECIMAL(10, 8),
    punch_in_longitude DECIMAL(11, 8),
    punch_in_accuracy DECIMAL(10, 2),
    punch_in_address TEXT,
    punch_out_time TIMESTAMPTZ,
    punch_out_latitude DECIMAL(10, 8),
    punch_out_longitude DECIMAL(11, 8),
    punch_out_accuracy DECIMAL(10, 2),
    punch_out_address TEXT,
    working_hours DECIMAL(4, 2) DEFAULT 0.0,
    break_minutes INTEGER DEFAULT 0,
    tasks_summary TEXT,
    notes TEXT,
    supervisor_rating INTEGER,
    supervisor_feedback TEXT,
    is_validated BOOLEAN DEFAULT false,
    validated_by TEXT,
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(application_id, attendance_date)
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_deadline ON internships(application_deadline);
CREATE INDEX IF NOT EXISTS idx_applications_status ON internship_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_student ON internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON internship_attendance(attendance_date);

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_attendance ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies (Allow service role access)
-- ============================================
CREATE POLICY "Service role access" ON internships FOR ALL USING (true);
CREATE POLICY "Service role access" ON internship_applications FOR ALL USING (true);
CREATE POLICY "Service role access" ON internship_attendance FOR ALL USING (true);
