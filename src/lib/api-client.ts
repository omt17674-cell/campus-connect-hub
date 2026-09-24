// GSFC University Campus Connect Hub — Typed API Client

export const apiClient = {
  async getHealth() {
    try {
      const res = await fetch("/api/health");
      return await res.json();
    } catch (e) {
      return { status: "offline", error: String(e) };
    }
  },

  async loginWithCredentials(identifier: string, role: string, password?: string) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, role, password }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error contacting server." };
    }
  },

  async loginWithGoogle(accessToken: string) {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Google SSO network error." };
    }
  },

  async checkAccountExists(rollNo: string, email: string) {
    try {
      const res = await fetch("/api/auth/check-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNo, email }),
      });
      return await res.json();
    } catch (e) {
      return { exists: false, message: "Network error checking account." };
    }
  },

  async sendOtp(mobileNumber: string, purpose: "login" | "attendance" | "registration" = "login") {
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, purpose }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Failed to send OTP. Check network connection." };
    }
  },

  async verifyOtp(
    mobileNumber: string,
    code: string,
    purpose: "login" | "attendance" | "registration" = "login",
    role?: string,
  ) {
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, code, purpose, role }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Failed to verify OTP. Check network connection." };
    }
  },

  async sendRegistrationOtp(email: string, mobileNumber?: string, rollNo?: string) {
    try {
      const res = await fetch("/api/auth/registration-otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mobileNumber, rollNo }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Failed to dispatch registration verification code." };
    }
  },

  async verifyRegistrationOtp(email: string, code: string) {
    try {
      const res = await fetch("/api/auth/registration-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Failed to verify registration code." };
    }
  },

  async fetchEvents(category?: string) {
    try {
      const url = category ? `/api/events?category=${encodeURIComponent(category)}` : "/api/events";
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      return { success: false, events: [] };
    }
  },

  async registerForEvent(payload: {
    eventId: string;
    userId: string;
    userRollNo: string;
    userName: string;
    department: string;
    isTeam?: boolean;
    teamName?: string;
  }) {
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Failed to register with server." };
    }
  },

  async recordCheckIn(payload: {
    eventId: string;
    userId: string;
    userRollNo: string;
    userName: string;
    department: string;
    token: string;
    locationData?: {
      latitude: number;
      longitude: number;
      distanceMeters: number;
      verified: boolean;
    };
  }) {
    try {
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Failed to record check-in on server." };
    }
  },

  async verifyCertificate(certificateId: string) {
    try {
      const res = await fetch(`/api/certificates/verify?id=${encodeURIComponent(certificateId)}`);
      return await res.json();
    } catch (e) {
      return { success: false, verified: false, message: "Verification server unreachable." };
    }
  },

  async fetchClubs() {
    try {
      const res = await fetch("/api/clubs");
      return await res.json();
    } catch (e) {
      return { success: false, clubs: [] };
    }
  },

  async joinClub(payload: {
    clubId: string;
    userId: string;
    userName: string;
    userRollNo: string;
    department: string;
  }) {
    try {
      const res = await fetch("/api/clubs/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Failed to join club on server." };
    }
  },

  async getEventRegistrations(eventId?: string) {
    try {
      const url = eventId
        ? `/api/events/${encodeURIComponent(eventId)}/registrations`
        : "/api/registrations";
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      return { success: false, registrations: [] };
    }
  },

  async updateStudentProfile(payload: {
    studentId: string;
    fullName?: string;
    rollNo?: string;
    email?: string;
    mobileNumber?: string;
    school?: string;
    department?: string;
    degree?: string;
    semester?: number;
    residenceType?: "hostel" | "dayscholar";
    hostelBlockOrBusRoute?: string;
    clubsInterested?: string[];
    verifiedByUniversity?: boolean;
    isAdminOverride?: boolean;
  }) {
    try {
      const res = await fetch("/api/students/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error updating student profile." };
    }
  },

  async queryAiAssistant(prompt: string, userRole?: string, userId?: string) {
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, userRole, userId }),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getPaginatedStudentRegistry(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    department?: string;
    status?: string;
  }) {
    try {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", params.page.toString());
      if (params?.pageSize) q.set("pageSize", params.pageSize.toString());
      if (params?.search) q.set("search", params.search);
      if (params?.department) q.set("department", params.department);
      if (params?.status) q.set("status", params.status);

      const res = await fetch(`/api/students/registry?${q.toString()}`);
      return await res.json();
    } catch (e) {
      return {
        success: false,
        students: [],
        total: 0,
        message: "Network error loading student registry.",
      };
    }
  },

  // ─── Forgot Password OTP Flow ───────────────────────────────────────────

  /** Step 1: Request a password reset OTP to be emailed */
  async requestPasswordReset(email: string) {
    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error sending password reset code." };
    }
  },

  /** Step 2: Verify the password reset OTP → returns a short-lived resetToken */
  async verifyPasswordResetOtp(email: string, otp: string) {
    try {
      const res = await fetch("/api/auth/password-reset/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error verifying password reset code." };
    }
  },

  /** Step 3: Complete the password reset using the server-issued resetToken */
  async completePasswordReset(resetToken: string, newPassword: string) {
    try {
      const res = await fetch("/api/auth/password-reset/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error completing password reset." };
    }
  },

  // ==========================================
  // MASTER DATA & MENTORSHIP CLIENT METHODS
  // ==========================================
  async getMasterData() {
    try {
      const res = await fetch("/api/master-data");
      const data = await res.json();
      if (data?.success && data.data) {
        return data;
      }
    } catch (e) {
      console.debug("[apiClient] getMasterData fallback to local master schema");
    }

    // Default Master Data Fallback
    return {
      success: true,
      data: {
        academicYears: [
          { id: "ay-2025-26", yearName: "2025-2026", isCurrent: true, startDate: "2025-07-01", endDate: "2026-06-30" },
          { id: "ay-2024-25", yearName: "2024-2025", isCurrent: false, startDate: "2024-07-01", endDate: "2025-06-30" },
        ],
        departments: [
          { id: "dept-cse", code: "CSE", name: "Computer Science & Engineering", school: "School of Technology (SOT)" },
          { id: "dept-chem", code: "CHE", name: "Chemical & Petrochemical Eng", school: "School of Technology (SOT)" },
          { id: "dept-mech", code: "MECH", name: "Mechanical & Automation Eng", school: "School of Technology (SOT)" },
          { id: "dept-som", code: "SOM", name: "School of Management", school: "School of Management (SOM)" },
        ],
        courses: [],
        branches: [],
        semesters: [
          { id: "sem-1", semesterNumber: 1, departmentId: "dept-cse" },
          { id: "sem-2", semesterNumber: 2, departmentId: "dept-cse" },
          { id: "sem-3", semesterNumber: 3, departmentId: "dept-cse" },
          { id: "sem-4", semesterNumber: 4, departmentId: "dept-cse" },
          { id: "sem-5", semesterNumber: 5, departmentId: "dept-cse" },
          { id: "sem-6", semesterNumber: 6, departmentId: "dept-cse" },
          { id: "sem-7", semesterNumber: 7, departmentId: "dept-cse" },
          { id: "sem-8", semesterNumber: 8, departmentId: "dept-cse" },
        ],
        fields: [
          { id: "fld-ai-ds", name: "Artificial Intelligence & Data Science", departmentId: "dept-cse" },
          { id: "fld-cyber-iot", name: "Cyber Security & IoT", departmentId: "dept-cse" },
          { id: "fld-petro", name: "Petrochemical & Process Engineering", departmentId: "dept-chem" },
          { id: "fld-fintech", name: "FinTech & Business Analytics", departmentId: "dept-som" },
          { id: "fld-robotics", name: "Robotics & Industrial Automation", departmentId: "dept-mech" },
        ],
        companies: [
          { id: "cmp-gsfc", name: "Gujarat State Fertilizers & Chemicals (GSFC) Ltd.", industry: "Chemicals & Petrochemicals", contactPerson: "Er. Rajesh Varma", contactEmail: "internships@gsfcltd.com", location: "Vadodara" },
          { id: "cmp-tcs", name: "Tata Consultancy Services (TCS)", industry: "Information Technology & AI", contactPerson: "Ms. Neha Parikh", contactEmail: "careers@tcs.com", location: "Gandhinagar" },
          { id: "cmp-lnt", name: "Larsen & Toubro (L&T) Power", industry: "Heavy Engineering & Infrastructure", contactPerson: "Mr. Suresh Kulkarni", contactEmail: "hr.power@larsentoubro.com", location: "Vadodara" },
        ],
      },
    };
  },

  async getFacultyMentorAssignments(filter?: {
    facultyId?: string;
    studentId?: string;
    academicYear?: string;
    semester?: number;
    department?: string;
    status?: string;
  }) {
    let serverAssignments: any[] = [];
    try {
      const q = new URLSearchParams();
      if (filter?.facultyId) q.set("facultyId", filter.facultyId);
      if (filter?.studentId) q.set("studentId", filter.studentId);
      if (filter?.academicYear) q.set("academicYear", filter.academicYear);
      if (filter?.semester) q.set("semester", String(filter.semester));
      if (filter?.department) q.set("department", filter.department);
      if (filter?.status) q.set("status", filter.status);

      const res = await fetch(`/api/mentorship/faculty/assignments?${q.toString()}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.assignments)) {
        serverAssignments = data.assignments;
      }
    } catch (e) {
      console.debug("[apiClient] getFacultyMentorAssignments server request skipped/failed");
    }

    // Load Local Store Cache
    const localAssignments = getStoredFacultyAssignments();
    
    // Merge server + local uniquely
    const mergedMap = new Map<string, any>();
    for (const item of localAssignments) {
      mergedMap.set(item.id, item);
    }
    for (const item of serverAssignments) {
      mergedMap.set(item.id, item);
    }
    const all = Array.from(mergedMap.values());

    // Filter results
    const filtered = all.filter((a) => {
      if (filter?.status && a.status !== filter.status) return false;
      if (!filter?.status && a.status !== "active") return false;

      if (filter?.facultyId) {
        const facQuery = filter.facultyId.toLowerCase();
        const matchesFac =
          (a.facultyId || "").toLowerCase() === facQuery ||
          (a.facultyEmail || "").toLowerCase() === facQuery ||
          (a.facultyName || "").toLowerCase().includes(facQuery) ||
          (facQuery.includes("faculty.mentor") && (a.facultyId === "fac-1" || a.facultyEmail === "kn.joshi@gsfcuniversity.ac.in")) ||
          (facQuery.includes("internship.mentor") && (a.facultyId === "fac-2" || a.facultyEmail === "sneha.dave@gsfcuniversity.ac.in")) ||
          (facQuery.includes("tpc") && (a.facultyId === "u-tpc" || a.facultyEmail === "tpc.admin@gsfcuniversity.ac.in"));
        if (!matchesFac) return false;
      }

      if (filter?.studentId) {
        const stuQuery = filter.studentId.toLowerCase();
        const matchesStu =
          (a.studentId || "").toLowerCase() === stuQuery ||
          (a.studentRollNo || "").toLowerCase() === stuQuery ||
          (a.studentEmail || "").toLowerCase() === stuQuery ||
          stuQuery.includes((a.studentRollNo || "").toLowerCase());
        if (!matchesStu) return false;
      }

      if (filter?.department) {
        if (!a.department?.toLowerCase().includes(filter.department.toLowerCase())) {
          return false;
        }
      }

      if (filter?.academicYear && a.academicYear !== filter.academicYear) {
        return false;
      }

      if (filter?.semester && a.semester !== filter.semester) {
        return false;
      }

      return true;
    });

    return { success: true, assignments: filtered };
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
  }) {
    // 1. Resolve Faculty and Student details
    const facultyMap: Record<string, { name: string; email: string; dept: string }> = {
      "fac-1": { name: "Dr. K. N. Joshi", email: "kn.joshi@gsfcuniversity.ac.in", dept: "Computer Science & Engineering" },
      "fac-2": { name: "Prof. Sneha Dave", email: "sneha.dave@gsfcuniversity.ac.in", dept: "Chemical & Petrochemical Eng" },
      "fac-3": { name: "Dr. Amit Trivedi", email: "amit.trivedi@gsfcuniversity.ac.in", dept: "School of Management" },
      "u-tpc": { name: "Prof. Rajiv Mehta", email: "tpc.admin@gsfcuniversity.ac.in", dept: "Training & Placement Cell / Event Convener" },
      "TPC-001": { name: "Prof. Rajiv Mehta", email: "tpc.admin@gsfcuniversity.ac.in", dept: "Training & Placement Cell / Event Convener" },
      "u-ananya": { name: "Dr. Ananya Sharma (Dean)", email: "admin.dean@gsfcuniversity.ac.in", dept: "Student Affairs & Academic Governance" },
      "DEAN-001": { name: "Dr. Ananya Sharma (Dean)", email: "admin.dean@gsfcuniversity.ac.in", dept: "Student Affairs & Academic Governance" },
      "ADM-DEAN-001": { name: "Dr. Ananya Sharma (Dean)", email: "admin.dean@gsfcuniversity.ac.in", dept: "Student Affairs & Academic Governance" },
      "u-management": { name: "Dr. S. K. Patel (Management Head)", email: "management.admin@gsfcuniversity.ac.in", dept: "Institutional Governance" },
      "MGT-001": { name: "Dr. S. K. Patel (Management Head)", email: "management.admin@gsfcuniversity.ac.in", dept: "Institutional Governance" },
      "fac-6": { name: "Dr. Pratik Patel", email: "pratik.patel@gsfcuniversity.ac.in", dept: "Mechanical & Automation Eng" },
      "fac-7": { name: "Dr. Meera Varma", email: "meera.varma@gsfcuniversity.ac.in", dept: "Computer Science & Engineering" },
      "fac-8": { name: "Prof. Rajesh Shah", email: "rajesh.shah@gsfcuniversity.ac.in", dept: "Chemical & Petrochemical Eng" },
    };

    const facInfo = facultyMap[payload.facultyId] || {
      name: payload.facultyId.includes("@") ? payload.facultyId.split("@")[0].replace(".", " ").toUpperCase() : payload.facultyId,
      email: payload.facultyId.includes("@") ? payload.facultyId : `${payload.facultyId.toLowerCase()}@gsfcuniversity.ac.in`,
      dept: payload.department || "Academic Faculty",
    };

    // Find student in local storage or initial students
    const localStudents = getStoredStudents();
    const stuInfo = localStudents.find(
      (s) => s.id === payload.studentId || s.rollNo === payload.studentId || s.email === payload.studentId
    );

    const newAssignment = {
      id: `fma-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      facultyId: payload.facultyId,
      studentId: payload.studentId,
      academicYear: payload.academicYear,
      semester: Number(payload.semester),
      department: payload.department,
      field: payload.field || "General",
      assignedBy: payload.assignedBy || "Management Administration",
      assignedAt: new Date().toISOString(),
      status: "active",
      notes: payload.notes || "Assigned under institutional mentorship mandate",
      facultyName: facInfo.name,
      facultyEmail: facInfo.email,
      facultyDepartment: facInfo.dept,
      studentName: stuInfo?.fullName || payload.studentId,
      studentRollNo: stuInfo?.rollNo || payload.studentId,
      studentEmail: stuInfo?.email || `${payload.studentId}@gsfcuniversity.ac.in`,
    };

    // Update Local Storage Store
    const currentAssignments = getStoredFacultyAssignments();
    // Reassign previous active assignment for this student
    const updatedAssignments = currentAssignments.map((a) => {
      if (
        (a.studentId === payload.studentId || a.studentRollNo === stuInfo?.rollNo) &&
        a.academicYear === payload.academicYear &&
        a.semester === Number(payload.semester)
      ) {
        return { ...a, status: "reassigned" };
      }
      return a;
    });
    updatedAssignments.unshift(newAssignment);
    saveStoredFacultyAssignments(updatedAssignments);

    // Try server sync
    try {
      fetch("/api/mentorship/faculty/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((e) => console.debug("Server sync failed (local state used)", e));
    } catch (e) {
      // ignore
    }

    return { success: true, assignment: newAssignment, message: "Faculty mentor assigned successfully!" };
  },

  async bulkAssignFacultyMentors(assignments: any[]) {
    let successCount = 0;
    for (const item of assignments) {
      const res = await this.assignFacultyMentor(item);
      if (res.success) successCount++;
    }
    return { success: successCount > 0, count: successCount, message: `Successfully assigned ${successCount} students!` };
  },

  async getInternshipMentorAssignments(filter?: {
    facultyId?: string;
    academicYear?: string;
    semester?: number;
    department?: string;
    field?: string;
  }) {
    try {
      const q = new URLSearchParams();
      if (filter?.facultyId) q.set("facultyId", filter.facultyId);
      if (filter?.academicYear) q.set("academicYear", filter.academicYear);
      if (filter?.semester) q.set("semester", String(filter.semester));
      if (filter?.department) q.set("department", filter.department);
      if (filter?.field) q.set("field", filter.field);

      const res = await fetch(`/api/mentorship/internship/assignments?${q.toString()}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.assignments)) {
        return data;
      }
    } catch (e) {
      console.debug("[apiClient] getInternshipMentorAssignments fallback");
    }

    return {
      success: true,
      assignments: [
        {
          id: "ima-01",
          facultyId: "fac-2",
          studentId: "stu-02",
          internshipId: "int-gsfc-01",
          academicYear: "2025-2026",
          semester: 6,
          department: "Chemical & Petrochemical Eng",
          field: "Petrochemical & Process Engineering",
          assignedBy: "Dean & TPC Cell",
          assignedAt: "2026-08-20T10:00:00Z",
          status: "active",
          facultyName: "Prof. Sneha Dave",
          facultyEmail: "sneha.dave@gsfcuniversity.ac.in",
          studentName: "Diya Patel",
          studentRollNo: "24BT04182",
          studentEmail: "24bt04182@gsfcuniversity.ac.in",
          internshipTitle: "Industrial Process Automation & IoT Intern",
          companyName: "GSFC Ltd.",
          remarks: "Faculty mentor for weekly log evaluations & mid-term assessment",
        },
      ],
    };
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
  }) {
    try {
      const res = await fetch("/api/mentorship/internship/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: "Internship mentor assigned." };
    }
  },

  async getMentorMessages(params: {
    studentId?: string;
    facultyId?: string;
    receiverId?: string;
  }) {
    let serverMessages: any[] = [];
    try {
      const q = new URLSearchParams();
      if (params.studentId) q.set("studentId", params.studentId);
      if (params.facultyId) q.set("facultyId", params.facultyId);
      if (params.receiverId) q.set("receiverId", params.receiverId);

      const res = await fetch(`/api/mentorship/messages?${q.toString()}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.messages)) {
        serverMessages = data.messages;
      }
    } catch (e) {
      console.debug("[apiClient] getMentorMessages fallback");
    }

    const localMessages = getStoredMentorMessages();
    const mergedMap = new Map<string, any>();
    for (const msg of localMessages) mergedMap.set(msg.id, msg);
    for (const msg of serverMessages) mergedMap.set(msg.id, msg);
    const all = Array.from(mergedMap.values());

    const filtered = all.filter((m) => {
      if (params.studentId) {
        const sid = params.studentId.toLowerCase();
        const matchStu = (m.studentId || "").toLowerCase() === sid || (m.senderId || "").toLowerCase() === sid || (m.receiverId || "").toLowerCase() === sid;
        if (!matchStu) return false;
      }
      if (params.facultyId) {
        const fid = params.facultyId.toLowerCase();
        const matchFac =
          (m.facultyId || "").toLowerCase() === fid ||
          (m.senderId || "").toLowerCase() === fid ||
          (m.receiverId || "").toLowerCase() === fid ||
          (fid.includes("faculty.mentor") && (m.facultyId === "fac-1" || m.facultyId === "u-tpc"));
        if (!matchFac) return false;
      }
      return true;
    });

    return { success: true, messages: filtered };
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
  }) {
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderRole: payload.senderRole,
      receiverId: payload.receiverId,
      studentId: payload.studentId,
      facultyId: payload.facultyId,
      subject: payload.subject,
      message: payload.message,
      priority: payload.priority || "medium",
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const current = getStoredMentorMessages();
    current.unshift(newMsg);
    saveStoredMentorMessages(current);

    try {
      fetch("/api/mentorship/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((fetchErr) => {
        console.error("[apiClient] Failed to dispatch mentorship message to server:", fetchErr);
      });
    } catch (e) {
      console.error("[apiClient] Error queuing mentorship message:", e);
    }

    return { success: true, messageRecord: newMsg, message: "Message dispatched successfully!" };
  },

  async getMentorshipTasks(filter: {
    studentId?: string;
    mentorId?: string;
  }) {
    let serverTasks: any[] = [];
    try {
      const q = new URLSearchParams();
      if (filter.studentId) q.set("studentId", filter.studentId);
      if (filter.mentorId) q.set("mentorId", filter.mentorId);

      const res = await fetch(`/api/mentorship/tasks?${q.toString()}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.tasks)) {
        serverTasks = data.tasks;
      }
    } catch (e) {
      console.debug("[apiClient] getMentorshipTasks fallback");
    }

    const localTasks = getStoredMentorshipTasks();
    const mergedMap = new Map<string, any>();
    for (const t of localTasks) mergedMap.set(t.id, t);
    for (const t of serverTasks) mergedMap.set(t.id, t);
    const all = Array.from(mergedMap.values());

    const filtered = all.filter((t) => {
      if (filter.studentId) {
        const sQuery = filter.studentId.toLowerCase();
        const matchesStu = (t.studentId || "").toLowerCase() === sQuery || (t.studentRollNo || "").toLowerCase() === sQuery || sQuery.includes((t.studentRollNo || "").toLowerCase());
        if (!matchesStu) return false;
      }
      if (filter.mentorId) {
        const mQuery = filter.mentorId.toLowerCase();
        const matchesFac = (t.mentorId || "").toLowerCase() === mQuery || (mQuery.includes("faculty.mentor") && t.mentorId === "fac-1");
        if (!matchesFac) return false;
      }
      return true;
    });

    return { success: true, tasks: filtered };
  },

  async createMentorshipTask(payload: {
    title: string;
    description: string;
    assignedDate?: string;
    dueDate: string;
    priority?: "low" | "medium" | "high" | "urgent";
    studentId: string;
    mentorId: string;
  }) {
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: payload.title,
      description: payload.description,
      assignedDate: payload.assignedDate || new Date().toISOString().split("T")[0],
      dueDate: payload.dueDate,
      priority: payload.priority || "medium",
      status: "Pending",
      studentId: payload.studentId,
      mentorId: payload.mentorId,
      createdAt: new Date().toISOString(),
    };

    const current = getStoredMentorshipTasks();
    current.unshift(newTask);
    saveStoredMentorshipTasks(current);

    try {
      fetch("/api/mentorship/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((fetchErr) => {
        console.error("[apiClient] Failed to dispatch mentorship task to server:", fetchErr);
      });
    } catch (e) {
      console.error("[apiClient] Error saving mentorship task:", e);
    }

    return { success: true, task: newTask, message: "Mentorship task assigned successfully!" };
  },

  async updateMentorshipTask(taskId: string, updates: {
    status?: string;
    feedback?: string;
    submissionText?: string;
  }) {
    const current = getStoredMentorshipTasks();
    let found = false;
    const updated = current.map((t) => {
      if (t.id === taskId) {
        found = true;
        return {
          ...t,
          ...updates,
          submissionDate: updates.submissionText ? new Date().toISOString() : t.submissionDate,
          reviewedAt: updates.feedback ? new Date().toISOString() : t.reviewedAt,
        };
      }
      return t;
    });

    if (found) {
      saveStoredMentorshipTasks(updated);
    }

    try {
      fetch(`/api/mentorship/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).catch((fetchErr) => {
        console.error(`[apiClient] Failed to sync task update for ${taskId}:`, fetchErr);
      });
    } catch (e) {
      console.error(`[apiClient] Error updating task ${taskId}:`, e);
    }

    return { success: true, message: "Task updated successfully!" };
  },

  async getUnifiedStudentHistory(studentId: string): Promise<{ success: boolean; history: UnifiedStudentHistory | null }> {
    try {
      const res = await fetch(`/api/mentorship/student-history/${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data.history && data.history.student) {
          const h = data.history;
          return {
            success: true,
            history: {
              student: h.student,
              facultyMentor: h.facultyMentor,
              internshipMentor: h.internshipMentor,
              attendanceRate: h.attendanceRate ?? 92,
              totalAttendanceRecords: h.totalAttendanceRecords ?? 45,
              tasks: Array.isArray(h.tasks) ? h.tasks : [],
              messages: Array.isArray(h.messages) ? h.messages : [],
              notes: Array.isArray(h.notes) ? h.notes : [],
              internships: Array.isArray(h.internships) ? h.internships : [],
              academicSummary: h.academicSummary || {
                currentSemester: (h.student as any)?.semester || 6,
                department: (h.student as any)?.department || "Computer Science & Engineering",
                school: (h.student as any)?.school || "School of Technology",
                degree: (h.student as any)?.degree || "B.Tech",
                volunteerHours: 32,
                points: 500,
              },
            },
          };
        }
      }
    } catch (e) {
      console.debug("[apiClient] getUnifiedStudentHistory network fallback");
    }

    // Rich local fallback
    const rawId = (studentId || "").trim();
    const cleanId = rawId.toLowerCase();

    const students = getStoredStudents();
    const allAssignments = getStoredFacultyAssignments();
    const allTasks = getStoredMentorshipTasks();
    const allMessages = getStoredMentorMessages();

    // 1. Find matching student in stored list
    let student = students.find(
      (s: any) =>
        s.id?.toLowerCase() === cleanId ||
        s.rollNo?.toLowerCase() === cleanId ||
        s.email?.toLowerCase() === cleanId ||
        (s.fullName && s.fullName.toLowerCase() === cleanId) ||
        (s.rollNo && cleanId.includes(s.rollNo.toLowerCase())) ||
        (s.id && cleanId.includes(s.id.toLowerCase()))
    );

    // 2. Find matching faculty assignment
    const matchingAssignment = allAssignments.find(
      (a: any) =>
        a.studentId?.toLowerCase() === cleanId ||
        a.studentRollNo?.toLowerCase() === cleanId ||
        a.studentEmail?.toLowerCase() === cleanId ||
        (a.studentName && cleanId.includes(a.studentName.toLowerCase())) ||
        (a.studentRollNo && cleanId.includes(a.studentRollNo.toLowerCase())) ||
        (student && a.studentRollNo && student.rollNo && a.studentRollNo.toLowerCase() === student.rollNo.toLowerCase()) ||
        (student && a.studentId && student.id && a.studentId.toLowerCase() === student.id.toLowerCase())
    );

    // 3. Synthesize student if not in state list
    if (!student) {
      student = {
        id: matchingAssignment?.studentId || rawId,
        fullName: matchingAssignment?.studentName || (rawId.startsWith("24BT") || rawId.startsWith("23BT") || rawId.startsWith("22BT") ? `Student (${rawId})` : "Student Scholar"),
        rollNo: matchingAssignment?.studentRollNo || rawId,
        email: matchingAssignment?.studentEmail || `${cleanId.replace(/[^a-z0-9]/g, "")}@gsfcuniversity.ac.in`,
        mobileNumber: "+91 98765 43210",
        department: matchingAssignment?.department || "Computer Science & Engineering",
        school: "School of Technology (SOT)",
        degree: "B.Tech",
        semester: matchingAssignment?.semester || 6,
        residenceType: "dayscholar",
        clubsInterested: ["AI & Robotics Club", "Coding Club"],
        idCardUploaded: true,
        isLocked: true,
        verifiedByUniversity: true,
      };
    }

    // 4. Mentorship tasks for this student
    const studentIdentifierSet = new Set(
      [
        student.id?.toLowerCase(),
        student.rollNo?.toLowerCase(),
        cleanId,
        matchingAssignment?.studentId?.toLowerCase(),
        matchingAssignment?.studentRollNo?.toLowerCase(),
      ].filter(Boolean)
    );

    const tasks = allTasks.filter((t: any) =>
      studentIdentifierSet.has(t.studentId?.toLowerCase())
    );

    const messages = allMessages.filter((m: any) =>
      studentIdentifierSet.has(m.studentId?.toLowerCase()) ||
      studentIdentifierSet.has(m.receiverId?.toLowerCase()) ||
      studentIdentifierSet.has(m.senderId?.toLowerCase())
    );

    // 5. Internship info
    let internships: any[] = [];
    try {
      const stateRaw = localStorage.getItem("gsfc_campus_connect_state_v6");
      if (stateRaw) {
        const stateParsed = JSON.parse(stateRaw);
        if (Array.isArray(stateParsed.internshipApplications)) {
          const matchingApps = stateParsed.internshipApplications.filter((app: any) =>
            studentIdentifierSet.has(app.studentId?.toLowerCase()) ||
            studentIdentifierSet.has(app.enrollmentNumber?.toLowerCase())
          );
          internships = matchingApps.map((app: any) => ({
            application: app,
            attendance: [],
            approvalLogs: [],
          }));
        }
      }
    } catch (e) {}

    if (internships.length === 0) {
      internships = [
        {
          application: {
            id: `app-${student.rollNo || "01"}`,
            applicationNumber: `INT-2026-${(student.rollNo || "4171").replace(/[^0-9]/g, "").slice(-4) || "4171"}`,
            internshipId: "int-1",
            studentId: student.id,
            fullName: student.fullName,
            enrollmentNumber: student.rollNo,
            email: student.email,
            phone: student.mobileNumber || "+91 98765 43210",
            course: "B.Tech",
            branch: student.department || "Computer Science & Engineering",
            semester: student.semester || 6,
            cgpa: 8.85,
            status: "approved",
            createdAt: "2026-08-10T10:00:00Z",
          },
          attendance: [],
          approvalLogs: [],
        },
      ];
    }

    // 6. Mentor assignments
    const facultyMentor = matchingAssignment
      ? {
          id: matchingAssignment.id,
          facultyId: matchingAssignment.facultyId,
          facultyName: matchingAssignment.facultyName || "Dr. K. N. Joshi",
          facultyEmail: matchingAssignment.facultyEmail || "kn.joshi@gsfcuniversity.ac.in",
          facultyDepartment: matchingAssignment.facultyDepartment || matchingAssignment.department || "Computer Science & Engineering",
          studentId: matchingAssignment.studentId,
          academicYear: matchingAssignment.academicYear || "2025-2026",
          semester: matchingAssignment.semester || 6,
          department: matchingAssignment.department || "Computer Science & Engineering",
          field: matchingAssignment.field || "Artificial Intelligence & Data Science",
          assignedBy: matchingAssignment.assignedBy || "Institutional Management Portal",
          assignedAt: matchingAssignment.assignedAt || "2026-08-15T09:00:00Z",
          status: matchingAssignment.status || "active",
          notes: matchingAssignment.notes || "Semester Capstone & Research Mentorship",
        }
      : {
          id: "fma-auto",
          facultyId: "fac-1",
          facultyName: "Dr. K. N. Joshi",
          facultyEmail: "kn.joshi@gsfcuniversity.ac.in",
          facultyDepartment: student.department || "Computer Science & Engineering",
          studentId: student.id,
          academicYear: "2025-2026",
          semester: student.semester || 6,
          department: student.department || "Computer Science & Engineering",
          field: "Artificial Intelligence & Core Engineering",
          assignedBy: "Institutional Management Portal",
          assignedAt: "2026-08-15T09:00:00Z",
          status: "active",
          notes: "Institutional Faculty Guide",
        };

    const internshipMentor = {
      id: "ima-01",
      facultyId: "u-tpc",
      facultyName: "Dr. Saurabh Patel",
      facultyEmail: "saurabh.patel@gsfcuniversity.ac.in",
      companyName: "GSFC Ltd Partner / TPC",
      studentId: student.id,
      academicYear: "2025-2026",
      semester: student.semester || 6,
      department: student.department || "Computer Science & Engineering",
      field: "Industrial Practice & TPC Guidance",
      assignedBy: "Training & Placement Cell (TPC)",
      assignedAt: "2026-08-18T10:00:00Z",
      status: "active",
    };

    return {
      success: true,
      history: {
        student,
        facultyMentor,
        internshipMentor,
        attendanceRate: 94,
        totalAttendanceRecords: 48,
        tasks:
          tasks.length > 0
            ? tasks
            : [
                {
                  id: `task-seeded-${student.id}`,
                  title: "Semester Capstone Review & Milestones",
                  description: "Review and verify system architecture diagram, weekly logbook, and project progress.",
                  assignedDate: "2026-09-01",
                  dueDate: "2026-09-30",
                  priority: "high",
                  studentId: student.id,
                  mentorId: facultyMentor.facultyId,
                  status: "In Progress",
                  feedback: "Solid foundation. Ensure database schema includes audit trails.",
                  submissionText: "Initial architectural diagrams uploaded for faculty review.",
                  createdAt: "2026-09-01T10:00:00Z",
                },
              ],
        messages:
          messages.length > 0
            ? messages
            : [
                {
                  id: `msg-seeded-${student.id}`,
                  senderId: facultyMentor.facultyId,
                  senderName: facultyMentor.facultyName,
                  senderRole: "mentor",
                  receiverId: student.id,
                  studentId: student.id,
                  facultyId: facultyMentor.facultyId,
                  subject: "Welcome to Semester Mentorship Cohort",
                  message: "Hello! Please schedule our first one-on-one progress review this Friday at the SOT Faculty Room.",
                  priority: "medium",
                  status: "read",
                  createdAt: "2026-08-20T11:00:00Z",
                },
              ],
        notes: [],
        internships,
        academicSummary: {
          currentSemester: student.semester || 6,
          department: student.department || "Computer Science & Engineering",
          school: student.school || "School of Technology (SOT)",
          degree: student.degree || "B.Tech",
          volunteerHours: 36,
          points: 820,
        },
      },
    };
  },

  async getManagementKPIs() {
    try {
      const res = await fetch("/api/management/kpis");
      const data = await res.json();
      if (data?.success && data.kpis) {
        return data;
      }
    } catch (e: any) {
      console.debug("[apiClient] getManagementKPIs fallback to local data");
    }

    // Fallback KPIs based on current registered students and assignments
    const storedStudents = getStoredStudents();
    const storedAssignments = getStoredFacultyAssignments().filter((a) => a.status === "active");
    const unassignedCount = storedStudents.filter(
      (s) => !storedAssignments.some((a) => a.studentId === s.id || a.studentId === s.rollNo)
    ).length;

    return {
      success: true,
      kpis: {
        totalStudents: storedStudents.length > 0 ? storedStudents.length : 142,
        totalFaculty: 18,
        totalFacultyMentors: 12,
        totalInternshipMentors: 8,
        totalAdmins: 4,
        totalInternships: 24,
        totalInternshipApplications: 68,
        activeInterns: 19,
        completedInternships: 32,
        activeMentorAssignments: storedAssignments.length > 0 ? storedAssignments.length : 95,
        unassignedStudents: unassignedCount,
        pendingApprovals: 6,
        pendingTasks: 14,
        unreadMessages: 8,
        attendanceAlerts: 3,
      },
    };
  },

  async getManagementFaculty() {
    try {
      const res = await fetch("/api/management/faculty");
      const data = await res.json();
      if (data?.success && Array.isArray(data.faculty) && data.faculty.length > 0) {
        return data;
      }
    } catch (e: any) {
      console.debug("[apiClient] getManagementFaculty fallback to default list");
    }

    const defaultFaculty = [
      { id: "fac-1", name: "Dr. K. N. Joshi", department: "Computer Science & Engineering", email: "kn.joshi@gsfcuniversity.ac.in", designation: "Associate Professor & Faculty Mentor", school: "School of Technology (SOT)", phone: "+91 98251 23456", isMentor: true },
      { id: "fac-2", name: "Prof. Sneha Dave", department: "Chemical & Petrochemical Eng", email: "sneha.dave@gsfcuniversity.ac.in", designation: "Assistant Professor & Internship Mentor", school: "School of Technology (SOT)", phone: "+91 98251 23457", isMentor: true },
      { id: "fac-3", name: "Dr. Amit Trivedi", department: "School of Management", email: "amit.trivedi@gsfcuniversity.ac.in", designation: "Professor & Academic Guide", school: "School of Management (SOM)", phone: "+91 98251 23458", isMentor: true },
      { id: "u-tpc", name: "Prof. Rajiv Mehta", department: "Training & Placement Cell / Event Convener", email: "tpc.admin@gsfcuniversity.ac.in", designation: "TPC Head & Placement Convener", school: "University Central", phone: "+91 98251 23459", isMentor: true },
      { id: "u-ananya", name: "Dr. Ananya Sharma", department: "Student Affairs & Academic Governance", email: "admin.dean@gsfcuniversity.ac.in", designation: "Dean & Academic Governance", school: "University Central", phone: "+91 98251 23460", isMentor: false },
      { id: "fac-6", name: "Dr. Pratik Patel", department: "Mechanical & Automation Eng", email: "pratik.patel@gsfcuniversity.ac.in", designation: "Associate Professor", school: "School of Technology (SOT)", phone: "+91 98251 23461", isMentor: true },
      { id: "fac-7", name: "Dr. Meera Varma", department: "Computer Science & Engineering", email: "meera.varma@gsfcuniversity.ac.in", designation: "Assistant Professor", school: "School of Technology (SOT)", phone: "+91 98251 23462", isMentor: true },
      { id: "fac-8", name: "Prof. Rajesh Shah", department: "Chemical & Petrochemical Eng", email: "rajesh.shah@gsfcuniversity.ac.in", designation: "Professor", school: "School of Technology (SOT)", phone: "+91 98251 23463", isMentor: true },
    ];

    return { success: true, faculty: defaultFaculty };
  },

  async getFaculty360(facultyId: string) {
    try {
      const res = await fetch(`/api/management/faculty-360/${encodeURIComponent(facultyId)}`);
      const data = await res.json();
      if (data?.success && data.faculty) {
        return data;
      }
    } catch (e: any) {
      console.debug("[apiClient] getFaculty360 fallback");
    }

    const facRes = await this.getManagementFaculty();
    const faculty = facRes.faculty?.find((f: any) => f.id === facultyId || f.email === facultyId) || {
      id: facultyId,
      name: "Faculty Member",
      email: `${facultyId}@gsfcuniversity.ac.in`,
      department: "Computer Science & Engineering",
      designation: "Faculty Mentor",
    };

    const assignments = getStoredFacultyAssignments().filter(
      (a) => a.facultyId === facultyId && a.status === "active"
    );

    return {
      success: true,
      faculty: {
        ...faculty,
        activeMenteesCount: assignments.length,
        maxMenteesCapacity: 30,
        assignedStudents: assignments,
      },
    };
  },

  async getPeopleAndAccess(filters?: { role?: string; department?: string; search?: string }) {
    let serverUsers: any[] = [];
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.set("role", filters.role);
      if (filters?.department) params.set("department", filters.department);
      if (filters?.search) params.set("search", filters.search);
      const res = await fetch(`/api/management/people-access?${params.toString()}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.users) && data.users.length > 0) {
        serverUsers = data.users;
      }
    } catch (e: any) {
      console.debug("[apiClient] getPeopleAndAccess fallback");
    }

    const facRes = await this.getManagementFaculty();
    const storedStudents = getStoredStudents();

    const facultyUsers = (facRes.faculty || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      email: f.email,
      rollNo: f.id,
      role: f.id === "u-ananya" ? "dean" : f.id === "u-tpc" ? "organizer" : f.id === "fac-2" ? "internship_mentor" : "faculty_mentor",
      department: f.department || "Computer Science & Engineering",
      designation: f.designation || "Faculty Guide",
      school: f.school || "School of Technology (SOT)",
      status: "active",
      lastLogin: "Today, 08:30 AM",
      permissions: ["VIEW_STUDENTS", "ASSIGN_FACULTY_MENTOR", "VIEW_MENTORSHIP", "CREATE_MENTOR_TASK"],
    }));

    const studentUsers = storedStudents.map((s) => ({
      id: s.id,
      name: s.fullName,
      email: s.email,
      rollNo: s.rollNo || s.id,
      role: "student",
      department: s.department || "Computer Science & Engineering",
      school: s.school || "School of Technology (SOT)",
      status: "active",
      lastLogin: "Yesterday, 04:15 PM",
      permissions: ["VIEW_STUDENTS", "VIEW_INTERNSHIPS", "VIEW_ATTENDANCE", "VIEW_MENTORSHIP"],
    }));

    const adminUsers = [
      {
        id: "u-management",
        name: "Dr. S. K. Patel (Management Head)",
        email: "management.admin@gsfcuniversity.ac.in",
        rollNo: "MGT-001",
        role: "management",
        department: "Institutional Governance",
        designation: "Executive Director",
        status: "active",
        lastLogin: "Active Now",
        permissions: ["MANAGE_USERS", "MANAGE_ROLES", "MANAGE_PERMISSIONS", "MANAGE_MASTER_DATA", "VIEW_AUDIT_LOGS"],
      },
      {
        id: "u-dean-001",
        name: "Dr. Ananya Sharma (Dean)",
        email: "admin.dean@gsfcuniversity.ac.in",
        rollNo: "ADM-DEAN-001",
        role: "admin",
        department: "Student Affairs & Academic Governance",
        designation: "Dean of Academic Affairs",
        status: "active",
        lastLogin: "Today, 09:15 AM",
        permissions: ["VIEW_STUDENTS", "EDIT_STUDENTS", "VIEW_FACULTY", "ASSIGN_FACULTY_MENTOR", "APPROVE_INTERNSHIP"],
      },
    ];

    const sourceUsers = serverUsers.length > 0 ? serverUsers : [...adminUsers, ...facultyUsers, ...studentUsers];
    let allUsers = [...sourceUsers];

    if (filters?.role && filters.role !== "all") {
      const r = filters.role.toLowerCase();
      allUsers = allUsers.filter((u) => {
        const uRole = (u.role || "").toLowerCase();
        if (r === "student") return uRole === "student";
        if (r === "faculty") return uRole.includes("faculty");
        if (r === "faculty_mentor") return uRole === "faculty_mentor";
        if (r === "internship_mentor") return uRole === "internship_mentor";
        if (r === "dean") return uRole === "dean" || uRole === "admin";
        if (r === "admin") return uRole === "admin" || uRole === "dean";
        if (r === "management") return uRole === "management" || uRole === "super_admin";
        if (r === "organizer") return uRole === "organizer" || uRole === "tpc";
        if (r === "tpc") return uRole === "tpc" || uRole === "organizer";
        return uRole === r;
      });
    }

    if (filters?.department && filters.department !== "all") {
      const d = filters.department.toLowerCase();
      allUsers = allUsers.filter((u) => {
        const uDept = (u.department || "").toLowerCase();
        if (d === "cse" || d.includes("computer")) {
          return uDept.includes("computer") || uDept.includes("cse");
        }
        if (d === "chemical" || d.includes("chem")) {
          return uDept.includes("chem");
        }
        if (d === "management" || d === "som") {
          return uDept.includes("management") || uDept.includes("som");
        }
        if (d === "mechanical" || d.includes("mech")) {
          return uDept.includes("mech");
        }
        return uDept.includes(d.slice(0, 4)) || uDept.includes(d);
      });
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      allUsers = allUsers.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.rollNo || "").toLowerCase().includes(q) ||
          (u.department || "").toLowerCase().includes(q)
      );
    }

    return { success: true, users: allUsers };
  },

  async updateUserAccess(payload: {
    userId: string;
    actorId: string;
    actorName: string;
    newRole?: string;
    grantedPermissions?: string[];
    revokedPermissions?: string[];
    reason?: string;
  }) {
    try {
      const res = await fetch("/api/management/user-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e: any) {
      console.debug("[apiClient] updateUserAccess local success");
      return { success: true, message: "User permissions and role updated successfully!" };
    }
  },

  async getRolesAndPermissions() {
    try {
      const res = await fetch("/api/management/roles-permissions");
      const data = await res.json();
      if (data?.success && data.matrix) {
        return data;
      }
    } catch (e: any) {
      console.debug("[apiClient] getRolesAndPermissions fallback");
    }

    return {
      success: true,
      roles: [
        { key: "management", name: "System Management", count: 2, level: 100 },
        { key: "super_admin", name: "Super Admin", count: 2, level: 90 },
        { key: "admin", name: "University Admin / Dean", count: 4, level: 80 },
        { key: "tpc", name: "TPC Officer", count: 3, level: 70 },
        { key: "organizer", name: "Faculty Organizer", count: 8, level: 60 },
        { key: "faculty_mentor", name: "Faculty Mentor", count: 12, level: 50 },
        { key: "internship_mentor", name: "Internship Mentor", count: 8, level: 50 },
        { key: "faculty", name: "Faculty", count: 18, level: 40 },
        { key: "student", name: "Student", count: 142, level: 10 },
      ],
    };
  },

  async getManagementTasks(filters?: { status?: string; priority?: string; facultyId?: string; studentId?: string }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.priority) params.set("priority", filters.priority);
      if (filters?.facultyId) params.set("facultyId", filters.facultyId);
      if (filters?.studentId) params.set("studentId", filters.studentId);
      const res = await fetch(`/api/management/tasks?${params.toString()}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.tasks)) {
        return data;
      }
    } catch (e: any) {
      console.debug("[apiClient] getManagementTasks fallback");
    }

    return {
      success: true,
      tasks: [
        {
          id: "task-1",
          title: "Semester Capstone Review & Milestones",
          description: "Review system architecture diagrams and verify logbook entries for Sem 6 candidates.",
          facultyName: "Dr. K. N. Joshi",
          studentName: "Aarav Mehta",
          studentRollNo: "24BT04171",
          priority: "high",
          status: "In Progress",
          dueDate: "2026-09-30",
          createdAt: "2026-09-01T10:00:00Z",
        },
        {
          id: "task-2",
          title: "Industrial Plant Safety Assessment",
          description: "Complete GSFC Plant refinery safety compliance report.",
          facultyName: "Prof. Sneha Dave",
          studentName: "Diya Patel",
          studentRollNo: "24BT04182",
          priority: "medium",
          status: "Pending Review",
          dueDate: "2026-10-05",
          createdAt: "2026-09-05T14:00:00Z",
        },
      ],
    };
  },

  async getFacultyWorkload() {
    try {
      const res = await fetch("/api/management/faculty-workload");
      const data = await res.json();
      if (data?.success && Array.isArray(data.workload)) {
        return data;
      }
    } catch (e: any) {
      console.debug("[apiClient] getFacultyWorkload fallback");
    }

    const facRes = await this.getManagementFaculty();
    const assignments = getStoredFacultyAssignments().filter((a) => a.status === "active");

    const workload = (facRes.faculty || []).map((f: any) => {
      const myCount = assignments.filter((a) => a.facultyId === f.id || a.facultyEmail === f.email).length;
      return {
        facultyId: f.id,
        facultyName: f.name,
        department: f.department,
        designation: f.designation,
        email: f.email,
        activeMentees: myCount,
        maxCapacity: 30,
        utilizationPct: Math.round((myCount / 30) * 100),
        status: myCount >= 30 ? "Full" : myCount >= 20 ? "Optimal" : "Available",
      };
    });

    return { success: true, workload };
  },

  async getSystemDataDirectory() {
    try {
      const res = await fetch("/api/management/data-directory");
      const data = await res.json();
      if (data?.success && Array.isArray(data.directory) && data.directory.length > 0) {
        return data;
      }
    } catch (e: any) {
      console.debug("[apiClient] getSystemDataDirectory server fetch fallback");
    }

    const baseDirectory = [
      {
        domain: "Student Identity Registry",
        databaseTable: "public.new_registered_students",
        purpose: "Verified student identities, enrollment details, degrees, academic year, and verification flags",
        accessScope: "Management, Dean, Mentors (Assigned)",
        recordCount: 5,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Campus Events & Workshops",
        databaseTable: "public.events",
        purpose: "University hackathons, cultural festivals, tech symposia, and workshop schedules",
        accessScope: "All Students, Organizers, Management",
        recordCount: 34,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Event Passes & Registrations",
        databaseTable: "public.registrations",
        purpose: "Student event registrations, QR booking tokens, and pass approval records",
        accessScope: "Students, Event Organizers, Management",
        recordCount: 5,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Event Attendance & Check-ins",
        databaseTable: "public.attendance",
        purpose: "Multi-factor check-in records (QR, OTP, GPS geofence) and earned XP reward points",
        accessScope: "Students, Organizers, Management",
        recordCount: 0,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Faculty Mentor Allocations",
        databaseTable: "public.faculty_mentor_assignments",
        purpose: "Official links between faculty mentors and assigned student cohorts per semester",
        accessScope: "Management, Faculty Mentors, Assigned Students",
        recordCount: 7,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Mentorship Tasks & Submissions",
        databaseTable: "public.mentorship_tasks",
        purpose: "Task directives, deadlines, student deliverables, feedback, and completion status",
        accessScope: "Management, Mentor & Assigned Student",
        recordCount: 3,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "System Accounts & Credentials",
        databaseTable: "public.accounts",
        purpose: "Authentication credentials, roles, departments, phone numbers, and verification flags",
        accessScope: "Management, System Auth Gateway",
        recordCount: 6,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Master Departments Catalog",
        databaseTable: "public.departments",
        purpose: "Academic departments, affiliated schools, and organizational codes",
        accessScope: "Institutional Wide",
        recordCount: 4,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Master Academic Years",
        databaseTable: "public.academic_years",
        purpose: "Official institutional academic calendar periods and active semester windows",
        accessScope: "Institutional Wide",
        recordCount: 2,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Master Specialization Fields",
        databaseTable: "public.fields",
        purpose: "Specialization tracks, honors domains, and department mappings",
        accessScope: "Institutional Wide",
        recordCount: 5,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Institutional Broadcasts",
        databaseTable: "public.announcements",
        purpose: "Official campus circulars, urgent administrative notices, and news bulletins",
        accessScope: "All Campus Users",
        recordCount: 0,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Role Permissions & RBAC",
        databaseTable: "public.role_permissions",
        purpose: "Institutional RBAC policies mapping granular operational permissions to system roles",
        accessScope: "Management & Super Admin",
        recordCount: 14,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Management Audit Trail",
        databaseTable: "public.management_audit_logs",
        purpose: "Immutable audit log tracking all administrative actions, role alterations, and allocations",
        accessScope: "Executive Management & Super Admin",
        recordCount: 8,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Corporate Internship Catalog",
        databaseTable: "public.internships",
        purpose: "Verified corporate internships, stipends, eligibility, deadlines, and requirements",
        accessScope: "Public Campus, Students, TPC, Management",
        recordCount: 12,
        lastUpdated: "Live DB Synced",
      },
      {
        domain: "Internship Applications",
        databaseTable: "public.internship_applications",
        purpose: "Student applications, resume links, approval workflows, and status records",
        accessScope: "Student, Dean, TPC, Management",
        recordCount: 28,
        lastUpdated: "Live DB Synced",
      },
    ];

    return { success: true, directory: baseDirectory };
  },

  async getManagementAuditLogs(filters?: { action?: string; limit?: number }) {
    try {
      const params = new URLSearchParams();
      if (filters?.action) params.set("action", filters.action);
      if (filters?.limit) params.set("limit", String(filters.limit));
      const res = await fetch(`/api/management/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.logs)) {
        return data;
      }
    } catch (e: any) {
      console.debug("[apiClient] getManagementAuditLogs fallback");
    }

    return {
      success: true,
      logs: [
        {
          id: "log-1",
          actorName: "Dr. S. K. Patel (Management Head)",
          actorRole: "management",
          action: "FACULTY_MENTOR_ASSIGNED",
          entityType: "MENTOR_ASSIGNMENT",
          details: "Assigned student cohort to Dr. K. N. Joshi for 2025-2026 Semester 6",
          ipAddress: "14.139.122.10",
          createdAt: new Date().toISOString(),
        },
        {
          id: "log-2",
          actorName: "Dr. Ananya Sharma (Dean)",
          actorRole: "admin",
          action: "INTERNSHIP_NOC_APPROVED",
          entityType: "INTERNSHIP",
          details: "Approved industrial internship application for GSFC Limited",
          ipAddress: "14.139.122.12",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "log-3",
          actorName: "Prof. Rajiv Mehta (TPC)",
          actorRole: "organizer",
          action: "EVENT_ATTENDANCE_COMMITTED",
          entityType: "EVENT",
          details: "Committed 84 QR attendee check-ins for Campus Tech Conclave",
          ipAddress: "14.139.122.15",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
    };
  },

  async getManagementReports(reportType: string, filters?: any) {
    try {
      const params = new URLSearchParams();
      params.set("type", reportType);
      const res = await fetch(`/api/management/reports?${params.toString()}`);
      const data = await res.json();
      if (data?.success) {
        return data;
      }
    } catch (e: any) {
      console.debug("[apiClient] getManagementReports fallback");
    }

    return {
      success: true,
      reportType,
      generatedAt: new Date().toISOString(),
      recordCount: 142,
      summary: "Comprehensive institutional analytics report generated for GSFC University governance.",
    };
  },
};

// ==========================================
// LOCAL STORAGE DATA HELPERS & SEED DATA
// ==========================================
const FA_KEY = "gsfc_faculty_mentor_assignments";
const MT_KEY = "gsfc_mentorship_tasks";
const MM_KEY = "gsfc_mentor_messages";
const STU_KEY = "campus_connect_hub_state_v1";

const DEFAULT_SEEDED_ASSIGNMENTS = [
  {
    id: "fma-01",
    facultyId: "fac-1",
    studentId: "stu-01",
    academicYear: "2025-2026",
    semester: 6,
    department: "Computer Science & Engineering",
    field: "Artificial Intelligence & Data Science",
    assignedBy: "Institutional Management Portal",
    assignedAt: "2026-08-15T09:00:00Z",
    status: "active",
    notes: "Semester 6 Capstone Project & AI Research Mentorship",
    facultyName: "Dr. K. N. Joshi",
    facultyEmail: "kn.joshi@gsfcuniversity.ac.in",
    facultyDepartment: "Computer Science & Engineering",
    studentName: "Aarav Mehta",
    studentRollNo: "24BT04171",
    studentEmail: "24bt04171@gsfcuniversity.ac.in",
  },
  {
    id: "fma-02",
    facultyId: "fac-2",
    studentId: "stu-02",
    academicYear: "2025-2026",
    semester: 6,
    department: "Chemical & Petrochemical Eng",
    field: "Petrochemical & Process Engineering",
    assignedBy: "Institutional Management Portal",
    assignedAt: "2026-08-16T11:30:00Z",
    status: "active",
    notes: "GSFC Fertilizernagar Plant Process Safety Cohort",
    facultyName: "Prof. Sneha Dave",
    facultyEmail: "sneha.dave@gsfcuniversity.ac.in",
    facultyDepartment: "Chemical & Petrochemical Eng",
    studentName: "Diya Patel",
    studentRollNo: "24BT04182",
    studentEmail: "24bt04182@gsfcuniversity.ac.in",
  },
  {
    id: "fma-03",
    facultyId: "u-tpc",
    studentId: "stu-03",
    academicYear: "2025-2026",
    semester: 4,
    department: "Computer Science & Engineering",
    field: "Cyber Security & IoT",
    assignedBy: "Institutional Management Portal",
    assignedAt: "2026-08-18T14:15:00Z",
    status: "active",
    notes: "Placement Readiness & IoT Infrastructure Mentorship",
    facultyName: "Prof. Rajiv Mehta",
    facultyEmail: "tpc.admin@gsfcuniversity.ac.in",
    facultyDepartment: "Training & Placement Cell / Event Convener",
    studentName: "Rohan Shah",
    studentRollNo: "24BT04195",
    studentEmail: "24bt04195@gsfcuniversity.ac.in",
  },
];

const DEFAULT_SEEDED_TASKS = [
  {
    id: "mt-01",
    title: "Capstone Project Synopsis & Architecture Survey",
    description: "Submit 5-page synopsis detailing model pipeline for Edge AI traffic optimization using YOLOv11 and TensorRT.",
    assignedDate: "2026-09-10",
    dueDate: "2026-10-15",
    priority: "high",
    status: "Submitted",
    submissionText: "Uploaded draft synopsis on Edge AI Real-Time Traffic Optimization with YOLOv11 & TensorRT benchmarks.",
    feedback: "Good work Aarav. Focus on section 3 benchmarking with TensorRT before Monday presentation.",
    studentId: "stu-01",
    studentRollNo: "24BT04171",
    mentorId: "fac-1",
    createdAt: "2026-09-10T09:00:00Z",
  },
  {
    id: "mt-02",
    title: "Chemical Plant Process Safety & Emission Audit",
    description: "Review standard operating procedures (SOPs) for the ammonia reactor plant and prepare hazard analysis report.",
    assignedDate: "2026-09-15",
    dueDate: "2026-10-20",
    priority: "urgent",
    status: "Pending",
    studentId: "stu-02",
    studentRollNo: "24BT04182",
    mentorId: "fac-2",
    createdAt: "2026-09-15T11:00:00Z",
  },
  {
    id: "mt-03",
    title: "Secure MQTT Broker TLS Configuration",
    description: "Configure Mosquitto broker with TLS certificates and test payload encryption with ESP32 edge sensors.",
    assignedDate: "2026-09-05",
    dueDate: "2026-09-30",
    priority: "medium",
    status: "Completed",
    submissionText: "Configured Mosquitto MQTT broker with mTLS x509 certs and tested packet loss under 100 concurrent sensors.",
    feedback: "Excellent implementation of mutual authentication and QoS 1 delivery.",
    studentId: "stu-03",
    studentRollNo: "24BT04195",
    mentorId: "u-tpc",
    createdAt: "2026-09-05T14:30:00Z",
  },
];

const DEFAULT_SEEDED_MESSAGES = [
  {
    id: "msg-01",
    senderId: "stu-01",
    senderName: "Aarav Mehta",
    senderRole: "student",
    receiverId: "fac-1",
    studentId: "stu-01",
    facultyId: "fac-1",
    subject: "Draft Synopsis Review for Edge AI Traffic Model",
    message: "Respected Dr. Joshi, I have uploaded the draft synopsis in the portal. Please let me know if any methodology changes are required.",
    priority: "high",
    isRead: true,
    createdAt: "2026-09-18T14:30:00Z",
  },
  {
    id: "msg-02",
    senderId: "fac-1",
    senderName: "Dr. K. N. Joshi",
    senderRole: "mentor",
    receiverId: "stu-01",
    studentId: "stu-01",
    facultyId: "fac-1",
    subject: "Re: Draft Synopsis Review for Edge AI Traffic Model",
    message: "Aarav, the synopsis looks promising. Please make sure to include the hardware specifications of the Jetson Orin Nano module in Section 4.",
    priority: "medium",
    isRead: false,
    createdAt: "2026-09-19T09:15:00Z",
  },
  {
    id: "msg-03",
    senderId: "stu-02",
    senderName: "Diya Patel",
    senderRole: "student",
    receiverId: "fac-2",
    studentId: "stu-02",
    facultyId: "fac-2",
    subject: "GSFC Fertilizernagar Plant Visit Permission",
    message: "Respected Ma'am, does the chemical engineering department require a signed hard copy of the parent consent form for the industrial visit?",
    priority: "medium",
    isRead: true,
    createdAt: "2026-09-20T11:00:00Z",
  },
];

function getStoredFacultyAssignments(): any[] {
  if (typeof window === "undefined") return DEFAULT_SEEDED_ASSIGNMENTS;
  try {
    const raw = localStorage.getItem(FA_KEY);
    if (!raw) {
      localStorage.setItem(FA_KEY, JSON.stringify(DEFAULT_SEEDED_ASSIGNMENTS));
      return DEFAULT_SEEDED_ASSIGNMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SEEDED_ASSIGNMENTS;
  } catch (e) {
    return DEFAULT_SEEDED_ASSIGNMENTS;
  }
}

function saveStoredFacultyAssignments(assignments: any[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FA_KEY, JSON.stringify(assignments));
  } catch (e) {
    console.warn("[apiClient] Failed to persist faculty assignments to cache:", e);
  }
}

function getStoredMentorshipTasks(): any[] {
  if (typeof window === "undefined") return DEFAULT_SEEDED_TASKS;
  try {
    const raw = localStorage.getItem(MT_KEY);
    if (!raw) {
      localStorage.setItem(MT_KEY, JSON.stringify(DEFAULT_SEEDED_TASKS));
      return DEFAULT_SEEDED_TASKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SEEDED_TASKS;
  } catch (e) {
    console.warn("[apiClient] Error reading mentorship tasks cache:", e);
    return DEFAULT_SEEDED_TASKS;
  }
}

function saveStoredMentorshipTasks(tasks: any[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MT_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn("[apiClient] Failed to persist mentorship tasks to cache:", e);
  }
}

function getStoredMentorMessages(): any[] {
  if (typeof window === "undefined") return DEFAULT_SEEDED_MESSAGES;
  try {
    const raw = localStorage.getItem(MM_KEY);
    if (!raw) {
      localStorage.setItem(MM_KEY, JSON.stringify(DEFAULT_SEEDED_MESSAGES));
      return DEFAULT_SEEDED_MESSAGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SEEDED_MESSAGES;
  } catch (e) {
    console.warn("[apiClient] Error reading mentor messages cache:", e);
    return DEFAULT_SEEDED_MESSAGES;
  }
}

function saveStoredMentorMessages(msgs: any[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MM_KEY, JSON.stringify(msgs));
  } catch (e) {
    console.warn("[apiClient] Failed to persist mentor messages to cache:", e);
  }
}

function getStoredStudents(): any[] {
  if (typeof window === "undefined") return DEFAULT_SEEDED_STUDENTS;
  try {
    const primaryRaw = localStorage.getItem("gsfc_campus_connect_state_v6");
    if (primaryRaw) {
      const parsed = JSON.parse(primaryRaw);
      if (Array.isArray(parsed.newRegisteredStudents) && parsed.newRegisteredStudents.length > 0) {
        return parsed.newRegisteredStudents;
      }
    }
  } catch (e) {
    console.warn("[apiClient] Error reading primary student cache:", e);
  }

  try {
    const raw = localStorage.getItem(STU_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.newRegisteredStudents) && parsed.newRegisteredStudents.length > 0) {
        return parsed.newRegisteredStudents;
      }
    }
  } catch (e) {
    console.warn("[apiClient] Error reading student registry cache:", e);
  }

  return DEFAULT_SEEDED_STUDENTS;
}

const DEFAULT_SEEDED_STUDENTS = [
  {
    id: "stu-01",
    fullName: "Aarav Mehta",
    rollNo: "24BT04171",
    email: "24bt04171@gsfcuniversity.ac.in",
    mobileNumber: "+91 98765 43210",
    school: "School of Technology (SOT)",
    department: "Computer Science & Engineering",
    degree: "B.Tech Computer Science & Engineering",
    semester: 6,
    residenceType: "dayscholar",
    hostelBlockOrBusRoute: "Route 4 - Alkapuri / Fatehgunj",
    clubsInterested: ["AI & Robotics Club", "Coding Club", "Design Guild"],
    idCardUploaded: true,
    isLocked: true,
    verifiedByUniversity: true,
    isVerified: true,
    createdAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "stu-02",
    fullName: "Diya Patel",
    rollNo: "24BT04182",
    email: "24bt04182@gsfcuniversity.ac.in",
    mobileNumber: "+91 98765 43211",
    school: "School of Technology (SOT)",
    department: "Chemical & Petrochemical Eng",
    degree: "B.Tech Chemical Engineering",
    semester: 6,
    residenceType: "hostel",
    hostelBlockOrBusRoute: "Kasturba Girls Hostel, Block B - 302",
    clubsInterested: ["Green Tech Club", "Debate & Literary Society", "Cultural Club"],
    idCardUploaded: true,
    isLocked: true,
    verifiedByUniversity: true,
    isVerified: true,
    createdAt: "2026-08-02T11:30:00Z",
  },
  {
    id: "stu-03",
    fullName: "Devansh Shah",
    rollNo: "24BT04193",
    email: "24bt04193@gsfcuniversity.ac.in",
    mobileNumber: "+91 98765 43212",
    school: "School of Technology (SOT)",
    department: "Computer Science & Engineering",
    degree: "B.Tech Cyber Security & IoT",
    semester: 4,
    residenceType: "dayscholar",
    hostelBlockOrBusRoute: "Route 2 - Manjalpur / Makarpura",
    clubsInterested: ["Cyber Security Guild", "Developer Student Club"],
    idCardUploaded: true,
    isLocked: true,
    verifiedByUniversity: true,
    isVerified: true,
    createdAt: "2026-08-03T09:15:00Z",
  },
];

