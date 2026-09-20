-- GSFC University Campus Connect Hub - Internship Database Schema
-- This script creates the missing internship-related tables in Supabase

-- Table: internships
-- Stores all available internship opportunities posted by companies/university
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

-- Table: internship_applications
-- Stores student applications for internships
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
    status TEXT CHECK (status IN ('DRAFT', 'SUBMITTED', 'ADMIN_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'ACTIVE', 'COMPLETED', 'CANCELLED')) DEFAULT 'SUBMITTED',
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

-- Table: internship_attendance
-- Stores daily attendance records for approved internships
CREATE TABLE IF NOT EXISTS public.internship_attendance (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    application_id TEXT NOT NULL REFERENCES internship_applications(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    internship_id TEXT NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
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
    supervisor_rating INTEGER CHECK (supervisor_rating >= 1 AND supervisor_rating <= 5),
    supervisor_feedback TEXT,
    is_validated BOOLEAN DEFAULT false,
    validated_by TEXT,
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one record per student per day per internship
    UNIQUE(application_id, attendance_date)
);

-- Table: internship_approvals
-- Stores approval workflow history (admin/dean reviews)
CREATE TABLE IF NOT EXISTS public.internship_approvals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    application_id TEXT NOT NULL REFERENCES internship_applications(id) ON DELETE CASCADE,
    approval_type TEXT CHECK (approval_type IN ('ADMIN', 'DEAN')) NOT NULL,
    approved_by TEXT NOT NULL,
    status TEXT CHECK (status IN ('approved', 'rejected', 'changes_requested')) NOT NULL,
    comment TEXT,
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: internship_notifications
-- Stores notifications sent to students about their applications
CREATE TABLE IF NOT EXISTS public.internship_notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    student_id TEXT NOT NULL,
    application_id TEXT NOT NULL REFERENCES internship_applications(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('admin_approved', 'dean_approved', 'rejected', 'changes_requested', 'reminder')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_department ON internships(department);
CREATE INDEX IF NOT EXISTS idx_internships_deadline ON internships(application_deadline);
CREATE INDEX IF NOT EXISTS idx_internships_created_at ON internships(created_at);

CREATE INDEX IF NOT EXISTS idx_applications_status ON internship_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_internship_id ON internship_applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_enrollment ON internship_applications(enrollment_number);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON internship_applications(created_at);

CREATE INDEX IF NOT EXISTS idx_attendance_application_id ON internship_attendance(application_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON internship_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON internship_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_internship_id ON internship_attendance(internship_id);

CREATE INDEX IF NOT EXISTS idx_approvals_application_id ON internship_approvals(application_id);
CREATE INDEX IF NOT EXISTS idx_approvals_type ON internship_approvals(approval_type);

CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON internship_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON internship_notifications(is_read);

-- Row Level Security (RLS) Policies
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_notifications ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) to access all records
CREATE POLICY IF NOT EXISTS "Allow service role full access on internships" ON internships
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY IF NOT EXISTS "Allow service role full access on internship_applications" ON internship_applications
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY IF NOT EXISTS "Allow service role full access on internship_attendance" ON internship_attendance
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY IF NOT EXISTS "Allow service role full access on internship_approvals" ON internship_approvals
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY IF NOT EXISTS "Allow service role full access on internship_notifications" ON internship_notifications
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Functions to auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update timestamps
CREATE TRIGGER update_internships_updated_at BEFORE UPDATE ON internships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_internship_applications_updated_at BEFORE UPDATE ON internship_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- INSERT INTO internships (title, company_name, description, department, positions, start_date, end_date, application_deadline, contact_person, contact_email)
-- VALUES 
--   ('Full Stack Development Intern', 'TechCorp Solutions', 'Work on React and Node.js applications', 'Computer Science & Engineering', 2, '2026-01-15', '2026-07-15', '2025-12-30', 'Hr. Priya Shah', 'hr@techcorp.com'),
--   ('Data Science Intern', 'Analytics Pro', 'Machine learning and data analysis projects', 'Computer Science & Engineering', 1, '2026-02-01', '2026-08-01', '2026-01-15', 'Dr. Amit Kumar', 'careers@analyticspro.in');

-- Comments on tables
COMMENT ON TABLE internships IS 'Stores available internship opportunities posted by companies and university';
COMMENT ON TABLE internship_applications IS 'Stores student applications for internships with approval workflow';
COMMENT ON TABLE internship_attendance IS 'Daily GPS-verified attendance records for approved internships';
COMMENT ON TABLE internship_approvals IS 'Audit trail for application approvals by admin/dean';
COMMENT ON TABLE internship_notifications IS 'System notifications sent to students about their applications';