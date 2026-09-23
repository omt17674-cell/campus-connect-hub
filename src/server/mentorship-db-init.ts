import { getPgPool } from "./postgres";
import { supabaseAdmin } from "./supabase-admin";

export async function ensureMentorshipSchema(): Promise<void> {
  const pool = getPgPool();
  if (!pool) {
    console.log("[Mentorship DB] No direct PG pool, using Supabase REST APIs");
    return;
  }

  try {
    const client = await pool.connect();
    try {
      // 1. Master Data Tables
      await client.query(`
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

        -- 2. Faculty & Mentorship Assignments
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

        -- 3. Mentorship Communication & Tasks
        CREATE TABLE IF NOT EXISTS public.mentor_messages (
          id TEXT PRIMARY KEY,
          sender_id TEXT NOT NULL,
          sender_name TEXT NOT NULL,
          sender_role TEXT NOT NULL CHECK (sender_role IN ('mentor', 'student', 'internship_mentor', 'management')),
          receiver_id TEXT NOT NULL,
          student_id TEXT NOT NULL,
          faculty_id TEXT NOT NULL,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          read_at TIMESTAMPTZ,
          status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.mentorship_tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          assigned_date DATE NOT NULL,
          due_date DATE NOT NULL,
          priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          student_id TEXT NOT NULL,
          mentor_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Submitted', 'Completed', 'Overdue')),
          feedback TEXT,
          submission_text TEXT,
          submitted_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.mentorship_notes (
          id TEXT PRIMARY KEY,
          faculty_id TEXT NOT NULL,
          student_id TEXT NOT NULL,
          title TEXT NOT NULL,
          notes TEXT NOT NULL,
          note_type TEXT NOT NULL DEFAULT 'general' CHECK (note_type IN ('general', 'academic', 'attendance', 'internship', 'disciplinary')),
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

        -- Indexes for 100+ concurrent users and performance
        CREATE INDEX IF NOT EXISTS idx_fma_faculty ON public.faculty_mentor_assignments(faculty_id, status);
        CREATE INDEX IF NOT EXISTS idx_fma_student ON public.faculty_mentor_assignments(student_id, status);
        CREATE INDEX IF NOT EXISTS idx_fma_filters ON public.faculty_mentor_assignments(academic_year, semester, department);
        
        CREATE INDEX IF NOT EXISTS idx_ima_faculty ON public.internship_mentor_assignments(faculty_id, status);
        CREATE INDEX IF NOT EXISTS idx_ima_student ON public.internship_mentor_assignments(student_id, status);
        CREATE INDEX IF NOT EXISTS idx_ima_filters ON public.internship_mentor_assignments(academic_year, semester, department, field);

        CREATE INDEX IF NOT EXISTS idx_mm_student ON public.mentor_messages(student_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_mm_faculty ON public.mentor_messages(faculty_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_mt_student ON public.mentorship_tasks(student_id, status);
        CREATE INDEX IF NOT EXISTS idx_mt_mentor ON public.mentorship_tasks(mentor_id, status);
        CREATE INDEX IF NOT EXISTS idx_audit_created ON public.management_audit_logs(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_role_perms ON public.role_permissions(role, permission);
        CREATE INDEX IF NOT EXISTS idx_user_perms ON public.user_permissions(user_id, permission);
      `);

      // Seed Default Role Permissions if empty
      const permCount = await client.query(`SELECT count(*) as count FROM public.role_permissions`);
      if (parseInt(permCount.rows[0]?.count || "0", 10) === 0) {
        const defaultRolePermissions = [
          // Management / Super Admin: Full Institutional Authority
          { role: 'management', perms: ['VIEW_STUDENTS', 'EDIT_STUDENTS', 'VIEW_FACULTY', 'EDIT_FACULTY', 'ASSIGN_FACULTY_MENTOR', 'ASSIGN_INTERNSHIP_MENTOR', 'VIEW_INTERNSHIPS', 'CREATE_INTERNSHIP', 'EDIT_INTERNSHIP', 'APPROVE_INTERNSHIP', 'VIEW_ATTENDANCE', 'VIEW_INTERNSHIP_ATTENDANCE', 'VIEW_MENTORSHIP', 'CREATE_MENTOR_TASK', 'SEND_MENTOR_MESSAGE', 'VIEW_REPORTS', 'EXPORT_REPORTS', 'MANAGE_MASTER_DATA', 'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_PERMISSIONS', 'VIEW_AUDIT_LOGS', 'MANAGE_SYSTEM_SETTINGS'], scope: 'global' },
          { role: 'super_admin', perms: ['VIEW_STUDENTS', 'EDIT_STUDENTS', 'VIEW_FACULTY', 'EDIT_FACULTY', 'ASSIGN_FACULTY_MENTOR', 'ASSIGN_INTERNSHIP_MENTOR', 'VIEW_INTERNSHIPS', 'CREATE_INTERNSHIP', 'EDIT_INTERNSHIP', 'APPROVE_INTERNSHIP', 'VIEW_ATTENDANCE', 'VIEW_INTERNSHIP_ATTENDANCE', 'VIEW_MENTORSHIP', 'CREATE_MENTOR_TASK', 'SEND_MENTOR_MESSAGE', 'VIEW_REPORTS', 'EXPORT_REPORTS', 'MANAGE_MASTER_DATA', 'MANAGE_USERS', 'MANAGE_ROLES', 'MANAGE_PERMISSIONS', 'VIEW_AUDIT_LOGS', 'MANAGE_SYSTEM_SETTINGS'], scope: 'global' },
          // Dean / Academic Affairs
          { role: 'dean', perms: ['VIEW_STUDENTS', 'VIEW_FACULTY', 'ASSIGN_FACULTY_MENTOR', 'ASSIGN_INTERNSHIP_MENTOR', 'VIEW_INTERNSHIPS', 'APPROVE_INTERNSHIP', 'VIEW_ATTENDANCE', 'VIEW_INTERNSHIP_ATTENDANCE', 'VIEW_MENTORSHIP', 'VIEW_REPORTS', 'EXPORT_REPORTS', 'VIEW_AUDIT_LOGS'], scope: 'global' },
          { role: 'admin', perms: ['VIEW_STUDENTS', 'EDIT_STUDENTS', 'VIEW_FACULTY', 'ASSIGN_FACULTY_MENTOR', 'ASSIGN_INTERNSHIP_MENTOR', 'VIEW_INTERNSHIPS', 'CREATE_INTERNSHIP', 'EDIT_INTERNSHIP', 'APPROVE_INTERNSHIP', 'VIEW_ATTENDANCE', 'VIEW_INTERNSHIP_ATTENDANCE', 'VIEW_MENTORSHIP', 'VIEW_REPORTS', 'EXPORT_REPORTS', 'MANAGE_USERS', 'VIEW_AUDIT_LOGS'], scope: 'global' },
          // Faculty Mentor
          { role: 'faculty_mentor', perms: ['VIEW_STUDENTS', 'VIEW_ATTENDANCE', 'VIEW_MENTORSHIP', 'CREATE_MENTOR_TASK', 'SEND_MENTOR_MESSAGE', 'VIEW_REPORTS'], scope: 'assigned' },
          // Faculty general
          { role: 'faculty', perms: ['VIEW_STUDENTS', 'VIEW_ATTENDANCE', 'VIEW_MENTORSHIP', 'SEND_MENTOR_MESSAGE'], scope: 'assigned' },
          // Internship Mentor
          { role: 'internship_mentor', perms: ['VIEW_STUDENTS', 'VIEW_INTERNSHIPS', 'VIEW_INTERNSHIP_ATTENDANCE', 'VIEW_MENTORSHIP', 'CREATE_MENTOR_TASK', 'SEND_MENTOR_MESSAGE', 'VIEW_REPORTS'], scope: 'assigned' },
          // TPC / Placement Officer
          { role: 'tpc', perms: ['VIEW_STUDENTS', 'VIEW_INTERNSHIPS', 'CREATE_INTERNSHIP', 'EDIT_INTERNSHIP', 'APPROVE_INTERNSHIP', 'VIEW_INTERNSHIP_ATTENDANCE', 'VIEW_REPORTS', 'EXPORT_REPORTS'], scope: 'global' },
          // Organizer
          { role: 'organizer', perms: ['VIEW_STUDENTS', 'VIEW_ATTENDANCE', 'VIEW_REPORTS'], scope: 'limited' },
          // Student
          { role: 'student', perms: ['VIEW_STUDENTS', 'VIEW_INTERNSHIPS', 'VIEW_ATTENDANCE', 'VIEW_INTERNSHIP_ATTENDANCE', 'VIEW_MENTORSHIP', 'SEND_MENTOR_MESSAGE'], scope: 'self' },
          // Security
          { role: 'security', perms: ['VIEW_ATTENDANCE'], scope: 'limited' },
        ];

        for (const grp of defaultRolePermissions) {
          for (const p of grp.perms) {
            const id = `rp-${grp.role}-${p.toLowerCase()}`;
            await client.query(`
              INSERT INTO public.role_permissions (id, role, permission, scope)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (role, permission) DO NOTHING;
            `, [id, grp.role, p, grp.scope]);
          }
        }
      }

      // 4. Seed Essential Master Data if empty
      const yearCount = await client.query(`SELECT count(*) as count FROM public.academic_years`);
      if (parseInt(yearCount.rows[0]?.count || "0", 10) === 0) {
        await client.query(`
          INSERT INTO public.academic_years (id, year_name, is_current, start_date, end_date) VALUES
          ('ay-2025-26', '2025-2026', TRUE, '2025-07-01', '2026-06-30'),
          ('ay-2024-25', '2024-2025', FALSE, '2024-07-01', '2025-06-30'),
          ('ay-2023-24', '2023-2024', FALSE, '2023-07-01', '2024-06-30')
          ON CONFLICT (year_name) DO NOTHING;

          INSERT INTO public.departments (id, code, name, school) VALUES
          ('dept-cse', 'CSE', 'Computer Science & Engineering', 'School of Technology'),
          ('dept-che', 'CHE', 'Chemical & Petrochemical Engineering', 'School of Technology'),
          ('dept-mgmt', 'SOM', 'School of Management', 'School of Management'),
          ('dept-sci', 'ASLT', 'Applied Sciences & Life Tech', 'School of Science'),
          ('dept-mech', 'MECH', 'Mechanical & Automation Engineering', 'School of Technology'),
          ('dept-hum', 'HSS', 'Humanities & Social Sciences', 'School of Liberal Arts')
          ON CONFLICT (code) DO NOTHING;

          INSERT INTO public.courses (id, code, name, department_id, duration_years) VALUES
          ('crs-btech-cse', 'BTECH-CSE', 'B.Tech in Computer Science & Engineering', 'dept-cse', 4),
          ('crs-btech-che', 'BTECH-CHE', 'B.Tech in Chemical Engineering', 'dept-che', 4),
          ('crs-bba', 'BBA', 'Bachelor of Business Administration', 'dept-mgmt', 3),
          ('crs-msc-chem', 'MSC-CHEM', 'M.Sc in Applied Chemistry', 'dept-sci', 2),
          ('crs-btech-mech', 'BTECH-MECH', 'B.Tech in Mechanical Engineering', 'dept-mech', 4)
          ON CONFLICT (code) DO NOTHING;

          INSERT INTO public.branches (id, code, name, department_id) VALUES
          ('br-ai-ml', 'CSE-AIML', 'Artificial Intelligence & Machine Learning', 'dept-cse'),
          ('br-cyber', 'CSE-CYBER', 'Cyber Security & Forensics', 'dept-cse'),
          ('br-petro', 'CHE-PETRO', 'Petrochemical & Polymer Tech', 'dept-che'),
          ('br-fin', 'BBA-FIN', 'Financial Analytics', 'dept-mgmt'),
          ('br-bio', 'ASLT-BIO', 'Biotechnology & Bioinformatics', 'dept-sci')
          ON CONFLICT (code) DO NOTHING;

          INSERT INTO public.fields (id, name, department_id) VALUES
          ('fld-ai', 'Artificial Intelligence & Data Science', 'dept-cse'),
          ('fld-cloud', 'Cloud Architecture & DevOps', 'dept-cse'),
          ('fld-iot', 'Industrial IoT & Automation', 'dept-mech'),
          ('fld-proc', 'Chemical Process Engineering', 'dept-che'),
          ('fld-fin', 'Corporate Finance & Valuation', 'dept-mgmt'),
          ('fld-bio', 'Industrial Biotechnology', 'dept-sci')
          ON CONFLICT DO NOTHING;

          INSERT INTO public.companies (id, name, industry, contact_person, contact_email, phone, location) VALUES
          ('cmp-gsfc', 'GSFC Limited', 'Chemical & Fertilizers', 'Dr. R. K. Patel', 'rpatel@gsfcltd.com', '+91 265 2240151', 'Vadodara, Gujarat'),
          ('cmp-lnt', 'L&T Technology Services', 'Engineering & IT', 'Meera Joshi', 'careers.ts@ltts.com', '+91 265 6789000', 'Vadodara / Knowledge City'),
          ('cmp-ril', 'Reliance Industries Ltd', 'Petrochemicals & Energy', 'Vikram Desai', 'recruitment.hazira@ril.com', '+91 261 6699000', 'Hazira / Vadodara'),
          ('cmp-tcs', 'Tata Consultancy Services', 'Information Technology', 'Ananya Sharma', 'campus.connect@tcs.com', '+91 265 6611000', 'Gandhinagar / Remote')
          ON CONFLICT DO NOTHING;
        `);

        // Generate Semesters 1 to 8 for departments
        for (let s = 1; s <= 8; s++) {
          await client.query(`
            INSERT INTO public.semesters (id, semester_number, academic_year_id, department_id, field) VALUES
            ('sem-${s}-cse', ${s}, 'ay-2025-26', 'dept-cse', 'Artificial Intelligence & Data Science'),
            ('sem-${s}-che', ${s}, 'ay-2025-26', 'dept-che', 'Chemical Process Engineering'),
            ('sem-${s}-mgmt', ${s}, 'ay-2025-26', 'dept-mgmt', 'Corporate Finance & Valuation')
            ON CONFLICT DO NOTHING;
          `);
        }
      }

      console.log("[Mentorship DB] Database tables, role permissions, and master data ensured successfully.");
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn("[Mentorship DB] Error ensuring schema:", err);
  }
}

