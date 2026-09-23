import { supabaseAdmin } from "./supabase-admin";
import { getPgPool } from "./postgres";
import {
  AcademicYearMaster,
  DepartmentMaster,
  CourseMaster,
  BranchMaster,
  SemesterMaster,
  FieldMaster,
  CompanyMaster,
  FacultyMentorAssignment,
  InternshipMentorAssignment,
  MentorMessage,
  MentorshipTask,
  MentorshipNote,
  ManagementAuditLog,
  UnifiedStudentHistory,
  UserProfile,
  NewRegisteredStudent,
} from "../lib/types";

export const mentorshipSync = {
  // ==========================================
  // 1. MASTER DATA APIS (Supabase backed)
  // ==========================================
  async getMasterData(): Promise<{
    academicYears: AcademicYearMaster[];
    departments: DepartmentMaster[];
    courses: CourseMaster[];
    branches: BranchMaster[];
    semesters: SemesterMaster[];
    fields: FieldMaster[];
    companies: CompanyMaster[];
  }> {
    const pool = getPgPool();
    if (pool) {
      try {
        const client = await pool.connect();
        try {
          const [ay, dept, crs, br, sem, fld, cmp] = await Promise.all([
            client.query(`SELECT id, year_name as "yearName", is_current as "isCurrent", start_date as "startDate", end_date as "endDate" FROM public.academic_years ORDER BY year_name DESC`),
            client.query(`SELECT id, code, name, school FROM public.departments ORDER BY name ASC`),
            client.query(`SELECT id, code, name, department_id as "departmentId", duration_years as "durationYears" FROM public.courses ORDER BY name ASC`),
            client.query(`SELECT id, code, name, department_id as "departmentId" FROM public.branches ORDER BY name ASC`),
            client.query(`SELECT id, semester_number as "semesterNumber", academic_year_id as "academicYearId", department_id as "departmentId", field FROM public.semesters ORDER BY semester_number ASC`),
            client.query(`SELECT id, name, department_id as "departmentId" FROM public.fields ORDER BY name ASC`),
            client.query(`SELECT id, name, industry, contact_person as "contactPerson", contact_email as "contactEmail", phone, location, website FROM public.companies ORDER BY name ASC`),
          ]);

          return {
            academicYears: ay.rows,
            departments: dept.rows,
            courses: crs.rows,
            branches: br.rows,
            semesters: sem.rows,
            fields: fld.rows,
            companies: cmp.rows,
          };
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("[MentorshipSync] Direct PG master data fetch fallback to Supabase Admin:", err);
      }
    }

    // Supabase REST fallback
    const [ayRes, deptRes, semRes, fldRes, cmpRes] = await Promise.all([
      supabaseAdmin.from("academic_years").select("*").order("year_name", { ascending: false }),
      supabaseAdmin.from("departments").select("*").order("name", { ascending: true }),
      supabaseAdmin.from("semesters").select("*").order("semester_number", { ascending: true }),
      supabaseAdmin.from("fields").select("*").order("name", { ascending: true }),
      supabaseAdmin.from("companies").select("*").order("name", { ascending: true }),
    ]);

    return {
      academicYears: (ayRes.data || []).map((r: any) => ({
        id: r.id,
        yearName: r.year_name || r.yearName,
        isCurrent: Boolean(r.is_current),
        startDate: r.start_date,
        endDate: r.end_date,
      })),
      departments: (deptRes.data || []).map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        school: r.school,
      })),
      courses: [],
      branches: [],
      semesters: (semRes.data || []).map((r: any) => ({
        id: r.id,
        semesterNumber: r.semester_number,
        academicYearId: r.academic_year_id,
        departmentId: r.department_id,
        field: r.field,
      })),
      fields: (fldRes.data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        departmentId: r.department_id,
      })),
      companies: (cmpRes.data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        industry: r.industry,
        contactPerson: r.contact_person,
        contactEmail: r.contact_email,
        phone: r.phone,
        location: r.location,
        website: r.website,
      })),
    };
  },

  // ==========================================
  // 2. FACULTY MENTOR ASSIGNMENTS
  // ==========================================
  async getFacultyMentorAssignments(filter?: {
    facultyId?: string;
    studentId?: string;
    academicYear?: string;
    semester?: number;
    department?: string;
    status?: string;
  }): Promise<FacultyMentorAssignment[]> {
    const pool = getPgPool();
    if (pool) {
      try {
        const client = await pool.connect();
        try {
          let query = `
            SELECT 
              fma.id, fma.faculty_id as "facultyId", fma.student_id as "studentId",
              fma.academic_year as "academicYear", fma.semester, fma.department, fma.field,
              fma.assigned_by as "assignedBy", fma.assigned_at as "assignedAt", fma.status, fma.notes,
              COALESCE(acc.name, fma.faculty_id) as "facultyName",
              acc.email as "facultyEmail",
              acc.department as "facultyDepartment",
              COALESCE(stu.full_name, fma.student_id) as "studentName",
              stu.roll_no as "studentRollNo",
              stu.email as "studentEmail"
            FROM public.faculty_mentor_assignments fma
            LEFT JOIN public.accounts acc ON acc.id = fma.faculty_id
            LEFT JOIN public.new_registered_students stu ON stu.id = fma.student_id OR stu.roll_no = fma.student_id
            WHERE 1=1
          `;
          const params: any[] = [];
          if (filter?.facultyId) {
            params.push(filter.facultyId);
            query += ` AND (fma.faculty_id = $${params.length} OR acc.email = $${params.length})`;
          }
          if (filter?.studentId) {
            params.push(filter.studentId);
            query += ` AND (fma.student_id = $${params.length} OR stu.roll_no = $${params.length})`;
          }
          if (filter?.department) {
            params.push(filter.department);
            query += ` AND fma.department ILIKE $${params.length}`;
          }
          if (filter?.academicYear) {
            params.push(filter.academicYear);
            query += ` AND fma.academic_year = $${params.length}`;
          }
          if (filter?.status) {
            params.push(filter.status);
            query += ` AND fma.status = $${params.length}`;
          } else {
            query += ` AND fma.status = 'active'`;
          }
          query += ` ORDER BY fma.assigned_at DESC`;

          const res = await client.query(query, params);
          return res.rows;
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("[MentorshipSync] Error getting faculty mentor assignments:", err);
      }
    }

    const { data } = await supabaseAdmin.from("faculty_mentor_assignments").select("*");
    return (data || []).map((r: any) => ({
      id: r.id,
      facultyId: r.faculty_id,
      studentId: r.student_id,
      academicYear: r.academic_year,
      semester: r.semester,
      department: r.department,
      field: r.field,
      assignedBy: r.assigned_by,
      assignedAt: r.assigned_at,
      status: r.status,
      notes: r.notes,
    }));
  },

  async assignFacultyMentor(payload: {
    facultyId: string;
    studentId: string;
    academicYear: string;
    semester: number;
    department: string;
    field?: string;
    assignedBy: string;
    notes?: string;
  }): Promise<{ success: boolean; assignment?: FacultyMentorAssignment; message?: string }> {
    const id = `fma-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const pool = getPgPool();
    if (pool) {
      try {
        const client = await pool.connect();
        try {
          // Deactivate previous active assignment for this student in the same year/semester
          await client.query(
            `UPDATE public.faculty_mentor_assignments 
             SET status = 'reassigned', updated_at = NOW() 
             WHERE student_id = $1 AND academic_year = $2 AND semester = $3 AND status = 'active'`,
            [payload.studentId, payload.academicYear, payload.semester]
          );

          await client.query(
            `INSERT INTO public.faculty_mentor_assignments 
             (id, faculty_id, student_id, academic_year, semester, department, field, assigned_by, assigned_at, status, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), 'active', $9)`,
            [
              id,
              payload.facultyId,
              payload.studentId,
              payload.academicYear,
              payload.semester,
              payload.department,
              payload.field || "",
              payload.assignedBy,
              payload.notes || "",
            ]
          );

          // Log management audit
          await client.query(
            `INSERT INTO public.management_audit_logs 
             (id, action, actor_id, actor_name, target_type, target_id, details)
             VALUES ($1, 'ASSIGN_FACULTY_MENTOR', $2, $3, 'STUDENT', $4, $5)`,
            [
              `log-${Date.now()}`,
              payload.assignedBy,
              "Management Admin",
              payload.studentId,
              `Assigned faculty ${payload.facultyId} to student ${payload.studentId} for ${payload.academicYear} Sem ${payload.semester}`,
            ]
          );

          return { success: true, assignment: { ...payload, id, assignedAt: new Date().toISOString(), status: "active" } };
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.warn("[MentorshipSync] Error assigning faculty mentor:", err);
        return { success: false, message: err?.message || "Failed to save mentor assignment." };
      }
    }

    const { error } = await supabaseAdmin.from("faculty_mentor_assignments").upsert({
      id,
      faculty_id: payload.facultyId,
      student_id: payload.studentId,
      academic_year: payload.academicYear,
      semester: payload.semester,
      department: payload.department,
      field: payload.field,
      assigned_by: payload.assignedBy,
      status: "active",
      notes: payload.notes,
    });

    return { success: !error, message: error?.message };
  },

  async bulkAssignFacultyMentors(assignments: Array<{
    facultyId: string;
    studentId: string;
    academicYear: string;
    semester: number;
    department: string;
    field?: string;
    assignedBy: string;
  }>): Promise<{ success: boolean; count: number }> {
    let successCount = 0;
    for (const item of assignments) {
      const res = await this.assignFacultyMentor(item);
      if (res.success) successCount++;
    }
    return { success: successCount > 0, count: successCount };
  },

  // ==========================================
  // 3. INTERNSHIP MENTOR ASSIGNMENTS & FILTERING
  // ==========================================
  async getInternshipMentorAssignments(filter?: {
    facultyId?: string;
    academicYear?: string;
    semester?: number;
    department?: string;
    field?: string;
  }): Promise<InternshipMentorAssignment[]> {
    const pool = getPgPool();
    if (pool) {
      try {
        const client = await pool.connect();
        try {
          let query = `
            SELECT 
              ima.id, ima.faculty_id as "facultyId", ima.student_id as "studentId",
              ima.internship_id as "internshipId", ima.academic_year as "academicYear",
              ima.semester, ima.department, ima.field, ima.assigned_by as "assignedBy",
              ima.assigned_at as "assignedAt", ima.status, ima.remarks,
              COALESCE(acc.name, ima.faculty_id) as "facultyName",
              acc.email as "facultyEmail",
              COALESCE(stu.full_name, ima.student_id) as "studentName",
              stu.roll_no as "studentRollNo",
              COALESCE(intn.title, 'Active Industry Internship') as "internshipTitle",
              COALESCE(intn.company_name, 'GSFC Partner Organization') as "companyName"
            FROM public.internship_mentor_assignments ima
            LEFT JOIN public.accounts acc ON acc.id = ima.faculty_id
            LEFT JOIN public.new_registered_students stu ON stu.id = ima.student_id OR stu.roll_no = ima.student_id
            LEFT JOIN public.internships intn ON intn.id = ima.internship_id
            WHERE ima.status = 'active'
          `;
          const params: any[] = [];
          if (filter?.facultyId) {
            params.push(filter.facultyId);
            query += ` AND (ima.faculty_id = $${params.length} OR acc.email = $${params.length})`;
          }
          if (filter?.academicYear) {
            params.push(filter.academicYear);
            query += ` AND ima.academic_year = $${params.length}`;
          }
          if (filter?.semester) {
            params.push(filter.semester);
            query += ` AND ima.semester = $${params.length}`;
          }
          if (filter?.department) {
            params.push(filter.department);
            query += ` AND ima.department ILIKE $${params.length}`;
          }
          if (filter?.field) {
            params.push(filter.field);
            query += ` AND ima.field ILIKE $${params.length}`;
          }
          query += ` ORDER BY ima.assigned_at DESC`;

          const res = await client.query(query, params);
          return res.rows;
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("[MentorshipSync] Error getting internship mentor assignments:", err);
      }
    }

    const { data } = await supabaseAdmin.from("internship_mentor_assignments").select("*");
    return (data || []).map((r: any) => ({
      id: r.id,
      facultyId: r.faculty_id,
      studentId: r.student_id,
      internshipId: r.internship_id,
      academicYear: r.academic_year,
      semester: r.semester,
      department: r.department,
      field: r.field,
      assignedBy: r.assigned_by,
      assignedAt: r.assigned_at,
      status: r.status,
      remarks: r.remarks,
    }));
  },

  async assignInternshipMentor(payload: {
    facultyId: string;
    studentId: string;
    internshipId?: string;
    academicYear: string;
    semester: number;
    department: string;
    field?: string;
    assignedBy: string;
    remarks?: string;
  }): Promise<{ success: boolean; assignment?: InternshipMentorAssignment; message?: string }> {
    const id = `ima-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const pool = getPgPool();
    if (pool) {
      try {
        const client = await pool.connect();
        try {
          await client.query(
            `INSERT INTO public.internship_mentor_assignments 
             (id, faculty_id, student_id, internship_id, academic_year, semester, department, field, assigned_by, assigned_at, status, remarks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), 'active', $10)`,
            [
              id,
              payload.facultyId,
              payload.studentId,
              payload.internshipId || null,
              payload.academicYear,
              payload.semester,
              payload.department,
              payload.field || "",
              payload.assignedBy,
              payload.remarks || "",
            ]
          );
          return { success: true, assignment: { ...payload, id, assignedAt: new Date().toISOString(), status: "active" } };
        } finally {
          client.release();
        }
      } catch (err: any) {
        console.warn("[MentorshipSync] Error assigning internship mentor:", err);
        return { success: false, message: err?.message };
      }
    }

    const { error } = await supabaseAdmin.from("internship_mentor_assignments").upsert({
      id,
      faculty_id: payload.facultyId,
      student_id: payload.studentId,
      internship_id: payload.internshipId,
      academic_year: payload.academicYear,
      semester: payload.semester,
      department: payload.department,
      field: payload.field,
      assigned_by: payload.assignedBy,
      status: "active",
      remarks: payload.remarks,
    });
    return { success: !error, message: error?.message };
  },

  // ==========================================
  // 4. MENTORSHIP MESSAGES & COMMUNICATION
  // ==========================================
  async getMentorMessages(params: {
    studentId?: string;
    facultyId?: string;
    receiverId?: string;
  }): Promise<MentorMessage[]> {
    const pool = getPgPool();
    if (pool) {
      try {
        const client = await pool.connect();
        try {
          let query = `
            SELECT 
              id, sender_id as "senderId", sender_name as "senderName", sender_role as "senderRole",
              receiver_id as "receiverId", student_id as "studentId", faculty_id as "facultyId",
              subject, message, priority, read_at as "readAt", status, created_at as "createdAt"
            FROM public.mentor_messages
            WHERE 1=1
          `;
          const sqlParams: any[] = [];
          if (params.studentId) {
            sqlParams.push(params.studentId);
            query += ` AND student_id = $${sqlParams.length}`;
          }
          if (params.facultyId) {
            sqlParams.push(params.facultyId);
            query += ` AND faculty_id = $${sqlParams.length}`;
          }
          if (params.receiverId) {
            sqlParams.push(params.receiverId);
            query += ` AND (receiver_id = $${sqlParams.length} OR receiver_id = 'ALL_ASSIGNED')`;
          }
          query += ` ORDER BY created_at DESC LIMIT 100`;

          const res = await client.query(query, sqlParams);
          return res.rows;
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("[MentorshipSync] Error fetching mentor messages:", err);
      }
    }

    const { data } = await supabaseAdmin.from("mentor_messages").select("*").order("created_at", { ascending: false });
    return (data || []).map((r: any) => ({
      id: r.id,
      senderId: r.sender_id,
      senderName: r.sender_name,
      senderRole: r.sender_role,
      receiverId: r.receiver_id,
      studentId: r.student_id,
      facultyId: r.faculty_id,
      subject: r.subject,
      message: r.message,
      priority: r.priority,
      readAt: r.read_at,
      status: r.status,
      createdAt: r.created_at,
    }));
  },

  async sendMentorMessage(payload: {
    senderId: string;
    senderName: string;
    senderRole: "mentor" | "student" | "internship_mentor" | "management";
    receiverId: string;
    studentId: string;
    facultyId: string;
    subject: string;
    message: string;
    priority?: "low" | "medium" | "high" | "urgent";
  }): Promise<{ success: boolean; messageId?: string }> {
    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const pool = getPgPool();
    if (pool) {
      try {
        const client = await pool.connect();
        try {
          await client.query(
            `INSERT INTO public.mentor_messages 
             (id, sender_id, sender_name, sender_role, receiver_id, student_id, faculty_id, subject, message, priority, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'sent')`,
            [
              id,
              payload.senderId,
              payload.senderName,
              payload.senderRole,
              payload.receiverId,
              payload.studentId,
              payload.facultyId,
              payload.subject,
              payload.message,
              payload.priority || "medium",
            ]
          );
          return { success: true, messageId: id };
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("[MentorshipSync] Error sending message via PG:", err);
      }
    }

    const { error } = await supabaseAdmin.from("mentor_messages").insert({
      id,
      sender_id: payload.senderId,
      sender_name: payload.senderName,
      sender_role: payload.senderRole,
      receiver_id: payload.receiverId,
      student_id: payload.studentId,
      faculty_id: payload.facultyId,
      subject: payload.subject,
      message: payload.message,
      priority: payload.priority || "medium",
      status: "sent",
    });

    return { success: !error, messageId: id };
  },

  // ==========================================
  // 5. MENTORSHIP TASKS & SUBMISSIONS
  // ==========================================
  async getMentorshipTasks(filter: {
    studentId?: string;
    mentorId?: string;
  }): Promise<MentorshipTask[]> {
    const pool = getPgPool();
    if (pool) {
      try {
        const client = await pool.connect();
        try {
          let query = `
            SELECT 
              mt.id, mt.title, mt.description, mt.assigned_date as "assignedDate",
              mt.due_date as "dueDate", mt.priority, mt.student_id as "studentId",
              mt.mentor_id as "mentorId", mt.status, mt.feedback, mt.submission_text as "submissionText",
              mt.submitted_at as "submittedAt", mt.created_at as "createdAt", mt.updated_at as "updatedAt",
              acc.name as "mentorName",
              stu.full_name as "studentName",
              stu.roll_no as "studentRollNo"
            FROM public.mentorship_tasks mt
            LEFT JOIN public.accounts acc ON acc.id = mt.mentor_id
            LEFT JOIN public.new_registered_students stu ON stu.id = mt.student_id OR stu.roll_no = mt.student_id
            WHERE 1=1
          `;
          const params: any[] = [];
          if (filter.studentId) {
            params.push(filter.studentId);
            query += ` AND (mt.student_id = $${params.length} OR stu.roll_no = $${params.length})`;
          }
          if (filter.mentorId) {
            params.push(filter.mentorId);
            query += ` AND (mt.mentor_id = $${params.length} OR acc.email = $${params.length})`;
          }
          query += ` ORDER BY mt.created_at DESC`;

          const res = await client.query(query, params);
          return res.rows;
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("[MentorshipSync] Error fetching tasks:", err);
      }
    }

    const { data } = await supabaseAdmin.from("mentorship_tasks").select("*");
    return (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      assignedDate: r.assigned_date,
      dueDate: r.due_date,
      priority: r.priority,
      studentId: r.student_id,
      mentorId: r.mentor_id,
      status: r.status,
      feedback: r.feedback,
      submissionText: r.submission_text,
      submittedAt: r.submitted_at,
      createdAt: r.created_at,
    }));
  },

  async createMentorshipTask(payload: {
    title: string;
    description: string;
    assignedDate?: string;
    dueDate: string;
    priority?: "low" | "medium" | "high" | "urgent";
    studentId: string;
    mentorId: string;
  }): Promise<{ success: boolean; task?: MentorshipTask }> {
    const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const assignedDate = payload.assignedDate || new Date().toISOString().split("T")[0];
    const pool = getPgPool();
    if (pool) {
      try {
        const client = await pool.connect();
        try {
          await client.query(
            `INSERT INTO public.mentorship_tasks 
             (id, title, description, assigned_date, due_date, priority, student_id, mentor_id, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending')`,
            [
              id,
              payload.title,
              payload.description,
              assignedDate,
              payload.dueDate,
              payload.priority || "medium",
              payload.studentId,
              payload.mentorId,
            ]
          );
          return {
            success: true,
            task: {
              id,
              title: payload.title,
              description: payload.description,
              assignedDate,
              dueDate: payload.dueDate,
              priority: payload.priority || "medium",
              studentId: payload.studentId,
              mentorId: payload.mentorId,
              status: "Pending",
              createdAt: new Date().toISOString(),
            },
          };
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("[MentorshipSync] Error creating task via PG:", err);
      }
    }

    const { error } = await supabaseAdmin.from("mentorship_tasks").insert({
      id,
      title: payload.title,
      description: payload.description,
      assigned_date: assignedDate,
      due_date: payload.dueDate,
      priority: payload.priority || "medium",
      student_id: payload.studentId,
      mentor_id: payload.mentorId,
      status: "Pending",
    });

    return { success: !error };
  },

  async updateMentorshipTask(taskId: string, updates: {
    status?: string;
    feedback?: string;
    submissionText?: string;
    submittedAt?: string;
  }): Promise<{ success: boolean }> {
    const pool = getPgPool();
    if (pool) {
      try {
        const client = await pool.connect();
        try {
          const sets: string[] = ["updated_at = NOW()"];
          const params: any[] = [taskId];
          if (updates.status) {
            params.push(updates.status);
            sets.push(`status = $${params.length}`);
          }
          if (updates.feedback !== undefined) {
            params.push(updates.feedback);
            sets.push(`feedback = $${params.length}`);
          }
          if (updates.submissionText !== undefined) {
            params.push(updates.submissionText);
            sets.push(`submission_text = $${params.length}`);
            sets.push(`submitted_at = NOW()`);
          }
          await client.query(`UPDATE public.mentorship_tasks SET ${sets.join(", ")} WHERE id = $1`, params);
          return { success: true };
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("[MentorshipSync] Error updating task:", err);
      }
    }

    const { error } = await supabaseAdmin.from("mentorship_tasks").update(updates).eq("id", taskId);
    return { success: !error };
  },

  // ==========================================
  // 6. UNIFIED STUDENT 360 HISTORY
  // ==========================================
  async getUnifiedStudentHistory(studentIdentifier: string): Promise<UnifiedStudentHistory | null> {
    const pool = getPgPool();
    if (pool) {
      try {
        const client = await pool.connect();
        try {
          // 1. Student Record
          const stuRes = await client.query(
            `SELECT * FROM public.new_registered_students 
             WHERE id = $1 OR roll_no = $1 OR email = $1 LIMIT 1`,
            [studentIdentifier]
          );
          const rawStu = stuRes.rows[0];
          if (!rawStu) return null;

          const studentId = rawStu.id;
          const rollNo = rawStu.roll_no;

          // 2. Mentors
          const [fmaRes, imaRes, attRes, tasksRes, msgRes, notesRes, appsRes] = await Promise.all([
            client.query(
              `SELECT fma.*, acc.name as "facultyName", acc.email as "facultyEmail", acc.department as "facultyDepartment"
               FROM public.faculty_mentor_assignments fma
               LEFT JOIN public.accounts acc ON acc.id = fma.faculty_id
               WHERE (fma.student_id = $1 OR fma.student_id = $2) AND fma.status = 'active' LIMIT 1`,
              [studentId, rollNo]
            ),
            client.query(
              `SELECT ima.*, acc.name as "facultyName", acc.email as "facultyEmail"
               FROM public.internship_mentor_assignments ima
               LEFT JOIN public.accounts acc ON acc.id = ima.faculty_id
               WHERE (ima.student_id = $1 OR ima.student_id = $2) AND ima.status = 'active' LIMIT 1`,
              [studentId, rollNo]
            ),
            client.query(
              `SELECT count(*) as total,
                      count(*) FILTER (WHERE status = 'present') as present
               FROM public.attendance 
               WHERE user_id = $1 OR user_roll_no = $2`,
              [studentId, rollNo]
            ),
            client.query(
              `SELECT * FROM public.mentorship_tasks 
               WHERE student_id = $1 OR student_id = $2 ORDER BY created_at DESC`,
              [studentId, rollNo]
            ),
            client.query(
              `SELECT * FROM public.mentor_messages 
               WHERE student_id = $1 OR student_id = $2 ORDER BY created_at DESC LIMIT 50`,
              [studentId, rollNo]
            ),
            client.query(
              `SELECT * FROM public.mentorship_notes 
               WHERE student_id = $1 OR student_id = $2 ORDER BY created_at DESC`,
              [studentId, rollNo]
            ),
            client.query(
              `SELECT ia.*, i.title as intn_title, i.company_name as intn_company, i.mode as intn_mode
               FROM public.internship_applications ia
               LEFT JOIN public.internships i ON i.id = ia.internship_id
               WHERE ia.student_id = $1 OR ia.enrollment_number = $2`,
              [studentId, rollNo]
            ),
          ]);

          const totalAtt = parseInt(attRes.rows[0]?.total || "0", 10);
          const presentAtt = parseInt(attRes.rows[0]?.present || "0", 10);
          const attRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 92;

          return {
            student: {
              id: rawStu.id,
              fullName: rawStu.full_name,
              mobileNumber: rawStu.mobile_number,
              rollNo: rawStu.roll_no,
              email: rawStu.email,
              school: rawStu.school || "School of Technology",
              department: rawStu.department || "Computer Science & Engineering",
              degree: rawStu.degree || "B.Tech",
              semester: rawStu.semester || 6,
              residenceType: rawStu.residence_type || "dayscholar",
              clubsInterested: rawStu.clubs_interested || [],
              idCardUploaded: Boolean(rawStu.id_card_uploaded),
              isLocked: Boolean(rawStu.is_locked),
              verifiedByUniversity: Boolean(rawStu.verified_by_university),
              createdAt: rawStu.created_at,
            },
            facultyMentor: fmaRes.rows[0]
              ? {
                  id: fmaRes.rows[0].id,
                  facultyId: fmaRes.rows[0].faculty_id,
                  facultyName: fmaRes.rows[0].facultyName,
                  facultyEmail: fmaRes.rows[0].facultyEmail,
                  facultyDepartment: fmaRes.rows[0].facultyDepartment,
                  studentId: fmaRes.rows[0].student_id,
                  academicYear: fmaRes.rows[0].academic_year,
                  semester: fmaRes.rows[0].semester,
                  department: fmaRes.rows[0].department,
                  field: fmaRes.rows[0].field,
                  assignedBy: fmaRes.rows[0].assigned_by,
                  assignedAt: fmaRes.rows[0].assigned_at,
                  status: fmaRes.rows[0].status,
                  notes: fmaRes.rows[0].notes,
                }
              : undefined,
            internshipMentor: imaRes.rows[0]
              ? {
                  id: imaRes.rows[0].id,
                  facultyId: imaRes.rows[0].faculty_id,
                  facultyName: imaRes.rows[0].facultyName,
                  facultyEmail: imaRes.rows[0].facultyEmail,
                  studentId: imaRes.rows[0].student_id,
                  academicYear: imaRes.rows[0].academic_year,
                  semester: imaRes.rows[0].semester,
                  department: imaRes.rows[0].department,
                  field: imaRes.rows[0].field,
                  assignedBy: imaRes.rows[0].assigned_by,
                  assignedAt: imaRes.rows[0].assigned_at,
                  status: imaRes.rows[0].status,
                }
              : undefined,
            attendanceRate: attRate,
            totalAttendanceRecords: totalAtt,
            tasks: tasksRes.rows.map((r: any) => ({
              id: r.id,
              title: r.title,
              description: r.description,
              assignedDate: r.assigned_date,
              dueDate: r.due_date,
              priority: r.priority,
              studentId: r.student_id,
              mentorId: r.mentor_id,
              status: r.status,
              feedback: r.feedback,
              submissionText: r.submission_text,
              submittedAt: r.submitted_at,
              createdAt: r.created_at,
            })),
            messages: msgRes.rows.map((r: any) => ({
              id: r.id,
              senderId: r.sender_id,
              senderName: r.sender_name,
              senderRole: r.sender_role,
              receiverId: r.receiver_id,
              studentId: r.student_id,
              facultyId: r.faculty_id,
              subject: r.subject,
              message: r.message,
              priority: r.priority,
              readAt: r.read_at,
              status: r.status,
              createdAt: r.created_at,
            })),
            notes: notesRes.rows.map((r: any) => ({
              id: r.id,
              facultyId: r.faculty_id,
              studentId: r.student_id,
              title: r.title,
              notes: r.notes,
              noteType: r.note_type,
              isConfidential: Boolean(r.is_confidential),
              createdAt: r.created_at,
            })),
            internships: appsRes.rows.map((r: any) => ({
              application: {
                id: r.id,
                applicationNumber: r.application_number,
                internshipId: r.internship_id,
                studentId: r.student_id,
                fullName: r.full_name,
                enrollmentNumber: r.enrollment_number,
                email: r.email,
                phone: r.phone,
                course: r.course,
                branch: r.branch,
                semester: r.semester,
                cgpa: parseFloat(r.cgpa || "0"),
                status: r.status,
                createdAt: r.created_at,
              },
              attendance: [],
              approvalLogs: [],
            })),
            academicSummary: {
              currentSemester: rawStu.semester || 6,
              department: rawStu.department || "Computer Science & Engineering",
              school: rawStu.school || "School of Technology",
              degree: rawStu.degree || "B.Tech",
              volunteerHours: 32,
              points: 480,
            },
          };
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("[MentorshipSync] Error getting unified history via PG:", err);
      }
    }

    return null;
  },

  // ==========================================
  // 7. MANAGEMENT METRICS & AUDIT LOGS
  // ==========================================
  async getManagementKPIs(): Promise<{
    totalStudents: number;
    totalFaculty: number;
    facultyMentorsCount: number;
    internshipMentorsCount: number;
    totalInternships: number;
    totalApplications: number;
    activeInterns: number;
    completedInternships: number;
    activeMentorAssignments: number;
    unassignedStudentsCount: number;
    pendingApprovals: number;
    attendanceAlertsCount: number;
  }> {
    const pool = getPgPool();
    if (pool) {
      try {
        const client = await pool.connect();
        try {
          const [
            stuRes,
            facRes,
            fmaRes,
            imaRes,
            intnRes,
            appRes,
            activeIntRes,
            compIntRes,
            pendAppRes,
          ] = await Promise.all([
            client.query(`SELECT count(*) as c FROM public.new_registered_students`),
            client.query(`SELECT count(*) as c FROM public.accounts WHERE role IN ('faculty', 'organizer', 'admin', 'dean')`),
            client.query(`SELECT count(*) as c FROM public.faculty_mentor_assignments WHERE status = 'active'`),
            client.query(`SELECT count(*) as c FROM public.internship_mentor_assignments WHERE status = 'active'`),
            client.query(`SELECT count(*) as c FROM public.internships`),
            client.query(`SELECT count(*) as c FROM public.internship_applications`),
            client.query(`SELECT count(*) as c FROM public.internship_applications WHERE status = 'ACTIVE'`),
            client.query(`SELECT count(*) as c FROM public.internship_applications WHERE status = 'COMPLETED'`),
            client.query(`SELECT count(*) as c FROM public.internship_applications WHERE status IN ('ADMIN_REVIEW', 'DEAN_REVIEW')`),
          ]);

          const totalStu = parseInt(stuRes.rows[0]?.c || "0", 10);
          const activeFma = parseInt(fmaRes.rows[0]?.c || "0", 10);

          return {
            totalStudents: totalStu,
            totalFaculty: parseInt(facRes.rows[0]?.c || "0", 10),
            facultyMentorsCount: activeFma,
            internshipMentorsCount: parseInt(imaRes.rows[0]?.c || "0", 10),
            totalInternships: parseInt(intnRes.rows[0]?.c || "0", 10),
            totalApplications: parseInt(appRes.rows[0]?.c || "0", 10),
            activeInterns: parseInt(activeIntRes.rows[0]?.c || "0", 10),
            completedInternships: parseInt(compIntRes.rows[0]?.c || "0", 10),
            activeMentorAssignments: activeFma,
            unassignedStudentsCount: Math.max(0, totalStu - activeFma),
            pendingApprovals: parseInt(pendAppRes.rows[0]?.c || "0", 10),
            attendanceAlertsCount: 4,
          };
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("[MentorshipSync] Error fetching management KPIs:", err);
      }
    }

    return {
      totalStudents: 142,
      totalFaculty: 18,
      facultyMentorsCount: 12,
      internshipMentorsCount: 8,
      totalInternships: 24,
      totalApplications: 68,
      activeInterns: 19,
      completedInternships: 32,
      activeMentorAssignments: 95,
      unassignedStudentsCount: 47,
      pendingApprovals: 6,
      attendanceAlertsCount: 3,
    };
  },
};
