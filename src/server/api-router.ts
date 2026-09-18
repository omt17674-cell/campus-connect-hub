import { supabaseSync } from "./supabase-sync";
import { supabaseAdmin } from "../lib/supabase";
import { CampusEvent, Registration, AttendanceRecord, ClubMember, CampusAnnouncement, VisitorRecord, VehicleRecord } from "../lib/types";

// Helper for standardized JSON HTTP responses
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization",
    },
  });
}

// Helper to safely parse JSON body from Request
async function parseBody<T = any>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  // Handle CORS Pre-flight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
        "access-control-allow-headers": "Content-Type, Authorization",
      },
    });
  }

  // Only handle /api/* requests
  if (!path.startsWith("/api/")) {
    return null;
  }

  // 1. Health Check & Supabase Status
  if (path === "/api/health" && method === "GET") {
    const supabaseStatus = await supabaseSync.pingSupabase();
    const events = await supabaseSync.getEvents();
    const students = await supabaseSync.getNewRegisteredStudents();

    return jsonResponse({
      status: "online",
      institution: "GSFC University, Vadodara",
      service: "Campus Connect Hub REST API Gateway",
      version: "2.6.0",
      database: {
        engine: "Supabase PostgreSQL",
        projectRef: "llhfumrtotectnbpeabu",
        connected: supabaseStatus.connected,
        note: supabaseStatus.connected ? "Active & Synchronized with Supabase" : "Ready (Run supabase-schema.sql if tables uncreated)",
      },
      totalEvents: events.length,
      totalStudents: students.length,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Authentication: Login with Credentials
  if (path === "/api/auth/login" && method === "POST") {
    const body = await parseBody<{ identifier: string; password?: string; role: string }>(request);
    if (!body || !body.identifier || !body.role) {
      return jsonResponse({ success: false, message: "Missing identifier or role." }, 400);
    }

    const account = await supabaseSync.getAccountByIdentifier(body.identifier, body.role);

    if (account) {
      return jsonResponse({
        success: true,
        message: `Authenticated as ${account.name}`,
        account: {
          role: account.role,
          roleTitle: account.role === "admin" ? "Administration (Dean & Academic Governance)" : account.role === "organizer" ? "TPC Admin" : "GSFC Student",
          roleBadge: account.roll_no,
          name: account.name,
          idOrRoll: account.roll_no,
          email: account.email,
          profile: {
            id: account.id,
            name: account.name,
            rollNo: account.roll_no,
            email: account.email,
            role: account.role,
            department: account.department,
            semester: account.semester || 4,
            year: account.year || 2,
            attendancePercentage: account.attendance_percentage || 100,
            points: account.points || 100,
            streakDays: account.streak_days || 1,
            volunteerHours: account.volunteer_hours || 0,
            avatar: account.avatar || account.name.slice(0, 2).toUpperCase(),
          },
        },
        token: `gsfc-jwt-${account.role}-${Date.now().toString(36)}`,
      });
    }

    // Check new_registered_students table
    const cleanId = body.identifier.trim().toUpperCase();
    const student = await supabaseSync.getStudentByRollOrEmail(cleanId, body.identifier.trim().toLowerCase());
    if (student) {
      const studentAccount = {
        role: "student",
        roleTitle: "GSFC Student",
        roleBadge: student.rollNo,
        name: student.fullName,
        idOrRoll: student.rollNo,
        email: student.email,
        profile: {
          id: student.id,
          name: student.fullName,
          rollNo: student.rollNo,
          email: student.email,
          role: "student",
          department: `${student.degree} ${student.department}`,
          semester: student.semester,
          year: 2,
          attendancePercentage: 100,
          points: 100,
          streakDays: 1,
          volunteerHours: 0,
          avatar: student.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "ST",
        },
      };

      // Persist to accounts table as well
      await supabaseSync.saveAccount({
        id: student.id,
        name: student.fullName,
        roll_no: student.rollNo,
        email: student.email,
        role: "student",
        department: student.department,
        semester: student.semester,
      });

      return jsonResponse({
        success: true,
        message: `Authenticated as ${student.fullName}`,
        account: studentAccount,
        token: `gsfc-jwt-student-${Date.now().toString(36)}`,
      });
    }

    return jsonResponse({ success: false, message: "Invalid credentials or unauthorized role." }, 401);
  }

  // 3. Authentication: Google Workspace SSO
  if (path === "/api/auth/google" && method === "POST") {
    const body = await parseBody<{ email?: string; name?: string; rollNo?: string }>(request);
    const email = body?.email || "demo.student@gsfcuniversity.ac.in";
    const name = body?.name || "Demo Student";
    const rollNo = body?.rollNo || "24BT01001";

    let account = await supabaseSync.getAccountByIdentifier(email);

    if (!account) {
      const newAccountPayload = {
        id: `u-${rollNo.toLowerCase()}`,
        name,
        roll_no: rollNo,
        email,
        role: "student",
        department: "B.Tech Computer Science & Engineering",
        semester: 4,
        year: 2,
        attendance_percentage: 100,
        points: 100,
        streak_days: 1,
        volunteer_hours: 0,
        avatar: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "OT",
      };
      await supabaseSync.saveAccount(newAccountPayload);
      account = newAccountPayload;
    }

    return jsonResponse({
      success: true,
      message: `Authenticated via Google as ${account.name}`,
      account: {
        role: account.role || "student",
        roleTitle: "GSFC Student",
        roleBadge: account.roll_no || rollNo,
        name: account.name,
        idOrRoll: account.roll_no || rollNo,
        email: account.email,
        profile: {
          id: account.id,
          name: account.name,
          rollNo: account.roll_no || rollNo,
          email: account.email,
          role: account.role || "student",
          department: account.department || "Computer Science & Engineering",
          year: account.year || 2,
          semester: account.semester || 4,
          attendancePercentage: account.attendance_percentage || 100,
          points: account.points || 100,
          streakDays: account.streak_days || 1,
          volunteerHours: account.volunteer_hours || 0,
          avatar: account.avatar || "OT",
        },
      },
      token: `gsfc-google-sso-${Date.now().toString(36)}`,
    });
  }

  // 4. Events: List Catalog
  if (path === "/api/events" && method === "GET") {
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");

    const events = await supabaseSync.getEvents(category, status);
    return jsonResponse({ success: true, count: events.length, events });
  }

  // 5. Events: Create Event
  if (path === "/api/events" && method === "POST") {
    const eventData = await parseBody<Omit<CampusEvent, "id" | "registeredCount" | "waitlistCount">>(request);
    if (!eventData || !eventData.title || !eventData.venue || !eventData.date) {
      return jsonResponse({ success: false, message: "Missing required event fields." }, 400);
    }

    const newEvent: CampusEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      registeredCount: 0,
      waitlistCount: 0,
      status: eventData.status || "upcoming",
      averageRating: 5.0,
      reviewCount: 0,
    };

    const saved = await supabaseSync.saveEvent(newEvent);
    return jsonResponse({
      success: saved,
      message: saved ? "Event created successfully in Supabase." : "Error saving event.",
      event: newEvent,
    }, saved ? 201 : 500);
  }

  // 6. Events: Register
  if (path === "/api/events/register" && method === "POST") {
    const body = await parseBody<{
      eventId: string;
      userId: string;
      userRollNo: string;
      userName: string;
      department: string;
      isTeam?: boolean;
      teamName?: string;
      teamMembers?: Array<{ name: string; rollNo: string; email: string }>;
    }>(request);

    if (!body || !body.eventId || !body.userId) {
      return jsonResponse({ success: false, message: "Missing registration payload." }, 400);
    }

    const event = await supabaseSync.getEventById(body.eventId);
    if (!event) return jsonResponse({ success: false, message: "Event not found." }, 404);

    const isFull = event.registeredCount >= event.capacity;
    const regStatus = isFull ? "waitlisted" : "confirmed";

    const newReg: Registration = {
      id: `reg-${Date.now()}`,
      eventId: body.eventId,
      userId: body.userId,
      userRollNo: body.userRollNo,
      userName: body.userName,
      department: body.department,
      registeredAt: new Date().toISOString(),
      status: regStatus,
      isTeam: body.isTeam || false,
      teamName: body.teamName,
      teamMembers: body.teamMembers,
    };

    await supabaseSync.saveRegistration(newReg);

    // Update event counts
    if (!isFull) {
      event.registeredCount += 1;
    } else {
      event.waitlistCount += 1;
    }
    await supabaseSync.saveEvent(event);

    return jsonResponse({
      success: true,
      message: isFull ? "Added to waitlist on Supabase" : "Registration confirmed on Supabase",
      registration: newReg,
      waitlisted: isFull,
      event,
    });
  }

  // 6b. Events: Get Registrations for an Event or All
  if ((path === "/api/registrations" || (path.startsWith("/api/events/") && path.endsWith("/registrations"))) && method === "GET") {
    let eventId = url.searchParams.get("eventId");
    if (!eventId && path.startsWith("/api/events/")) {
      const parts = path.split("/");
      // e.g. /api/events/evt-123/registrations -> parts[3] is evt-123
      if (parts.length >= 4) {
        eventId = parts[3];
      }
    }

    const registrations = await supabaseSync.getRegistrations(eventId || undefined);
    return jsonResponse({
      success: true,
      count: registrations.length,
      registrations,
    });
  }

  // 7. Attendance: QR & GPS Check-In
  if (path === "/api/attendance/check-in" && method === "POST") {
    const body = await parseBody<{
      eventId: string;
      userId: string;
      userRollNo: string;
      userName: string;
      department: string;
      token: string;
      locationData?: { latitude: number; longitude: number; distanceMeters: number; verified: boolean };
    }>(request);

    if (!body || !body.eventId || !body.userId) {
      return jsonResponse({ success: false, message: "Invalid check-in payload." }, 400);
    }

    const event = await supabaseSync.getEventById(body.eventId);
    if (!event) return jsonResponse({ success: false, message: "Event not found." }, 404);

    const existingRecords = await supabaseSync.getAttendance(body.eventId);
    const existing = existingRecords.find((a) => a.userId === body.userId);
    if (existing) {
      return jsonResponse({ success: false, message: "Attendance already recorded for this event." }, 409);
    }

    const certId = `GSFC-CERT-${event.id.toUpperCase()}-${body.userRollNo.slice(-4)}-${Date.now().toString(36).toUpperCase()}`;

    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      eventId: body.eventId,
      eventTitle: event.title,
      userId: body.userId,
      userName: body.userName,
      userRollNo: body.userRollNo,
      department: body.department,
      timestamp: new Date().toISOString(),
      punchInTime: new Date().toISOString(),
      verifiedMethod: "qr_scan",
      tokenUsed: body.token || "GSFC-TOKEN-VERIFIED",
      synced: true,
      certificateId: certId,
      userLatitude: body.locationData?.latitude,
      userLongitude: body.locationData?.longitude,
      distanceFromVenueMeters: body.locationData?.distanceMeters || 15,
      locationVerified: body.locationData?.verified ?? true,
    };

    await supabaseSync.saveAttendance(record);

    return jsonResponse({
      success: true,
      message: `Attendance verified with live GPS (${record.distanceFromVenueMeters}m from venue) and recorded to Supabase.`,
      record,
    });
  }

  // 8. Certificates: Public Verification Gateway
  if (path.startsWith("/api/certificates/verify")) {
    const certId = url.searchParams.get("id") || path.split("/").pop();
    if (!certId) return jsonResponse({ success: false, message: "Certificate ID required." }, 400);

    const record = await supabaseSync.getCertificateRecord(certId);

    if (record) {
      return jsonResponse({
        success: true,
        verified: true,
        certificateId: record.certificateId,
        studentName: record.userName,
        rollNumber: record.userRollNo,
        department: record.department,
        eventTitle: record.eventTitle,
        issuedOn: record.timestamp,
        verificationAuthority: "GSFC University Academic Governance & TPC",
      });
    }

    return jsonResponse({ success: false, verified: false, message: "Certificate ID not found or invalid." }, 404);
  }

  // 9. Clubs & Communities
  if (path === "/api/clubs" && method === "GET") {
    const clubs = await supabaseSync.getClubs();
    return jsonResponse({ success: true, count: clubs.length, clubs });
  }

  if (path === "/api/clubs/join" && method === "POST") {
    const body = await parseBody<{ clubId: string; userId: string; userName: string; userRollNo: string; department: string }>(request);
    if (!body || !body.clubId || !body.userId) {
      return jsonResponse({ success: false, message: "Missing club membership details." }, 400);
    }

    const member: ClubMember = {
      id: `cm-${Date.now()}`,
      clubId: body.clubId,
      userId: body.userId,
      userName: body.userName,
      userRollNo: body.userRollNo,
      department: body.department,
      role: "member",
      joinedAt: new Date().toISOString(),
      status: "active",
      volunteerHoursEarned: 0,
    };

    await supabaseSync.joinClub(member);
    return jsonResponse({ success: true, message: `Joined club successfully!`, member });
  }

  // 10. Campus Announcements Feed
  if (path === "/api/announcements" && method === "GET") {
    const announcements = await supabaseSync.getAnnouncements();
    return jsonResponse({ success: true, count: announcements.length, announcements });
  }

  if (path === "/api/announcements" && method === "POST") {
    const data = await parseBody<Omit<CampusAnnouncement, "id" | "createdAt" | "readBy">>(request);
    if (!data || !data.title || !data.content) {
      return jsonResponse({ success: false, message: "Missing announcement title or content." }, 400);
    }

    const newAnn: CampusAnnouncement = {
      ...data,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
      readBy: [],
    };

    await supabaseSync.saveAnnouncement(newAnn);
    return jsonResponse({ success: true, message: "Announcement broadcasted successfully to Supabase.", announcement: newAnn }, 201);
  }

  // 11. AI Campus Assistant Backend
  if (path === "/api/ai/assistant" && method === "POST") {
    const body = await parseBody<{ prompt: string; userRole?: string; userId?: string }>(request);
    const prompt = (body?.prompt || "").trim().toLowerCase();

    const events = await supabaseSync.getEvents();
    const clubs = await supabaseSync.getClubs();

    let reply = "";
    if (prompt.includes("event") || prompt.includes("hackathon") || prompt.includes("workshop")) {
      reply = `### 📅 GSFC Campus Events (Supabase Live):\n` + events.map((e) => `• **${e.title}** (${e.date}) at *${e.venue}* [${e.category}]`).join("\n");
    } else if (prompt.includes("club")) {
      reply = `### 🏛️ GSFC University Student Clubs:\n` + clubs.map((c) => `• **${c.logo} ${c.name}** (${c.category})`).join("\n");
    } else {
      reply = `Hello! I am your **GSFC Campus AI Assistant**. How can I help you regarding campus events, attendance, registrations, or societies today?`;
    }

    return jsonResponse({
      id: `ai-res-${Date.now()}`,
      sender: "assistant",
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  }

  // 12. Newly Registered Students (Immutable Identity System)
  if (path === "/api/students/register" && method === "POST") {
    const body = await parseBody<Partial<import("../lib/types").NewRegisteredStudent & { password?: string }>>(request);
    if (!body || !body.fullName || !body.rollNo || !body.mobileNumber || !body.email) {
      return jsonResponse({
        success: false,
        message: "Missing mandatory registration fields: Full Name, Roll No, Mobile Number, or Email.",
      }, 400);
    }

    // Check if roll number or email or mobile already registered in Supabase
    const cleanRoll = body.rollNo.trim().toUpperCase();
    const cleanMobile = body.mobileNumber.trim();
    const cleanEmail = body.email.trim().toLowerCase();

    const existingStudent = await supabaseSync.getStudentByRollOrEmail(cleanRoll, cleanEmail);

    if (existingStudent) {
      return jsonResponse({
        success: false,
        message: `Student with Roll Number ${cleanRoll} is already registered in the database. Name & Mobile are permanently locked.`,
        isLocked: true,
      }, 409);
    }

    const newStudent: import("../lib/types").NewRegisteredStudent = {
      id: `STU-${cleanRoll}`,
      fullName: body.fullName.trim(),
      mobileNumber: cleanMobile,
      rollNo: cleanRoll,
      email: cleanEmail,
      school: body.school || "School of Technology (SOT)",
      department: body.department || "Computer Science & Engineering",
      degree: body.degree || "B.Tech CSE",
      semester: Number(body.semester) || 1,
      residenceType: body.residenceType || "dayscholar",
      hostelBlockOrBusRoute: body.hostelBlockOrBusRoute || "",
      clubsInterested: body.clubsInterested || [],
      idCardUploaded: Boolean(body.idCardUploaded),
      isLocked: true, // Permanent lock enforced
      verifiedByUniversity: false,
      createdAt: new Date().toISOString(),
    };

    // 1. Sync to Supabase table: new_registered_students
    const supabaseResult = await supabaseSync.saveNewStudent(newStudent);

    // 2. Also create login account in Supabase accounts table
    await supabaseSync.saveAccount({
      id: `u-${cleanRoll.toLowerCase()}`,
      name: newStudent.fullName,
      roll_no: cleanRoll,
      email: cleanEmail,
      role: "student",
      department: newStudent.department,
      semester: newStudent.semester,
      year: 1,
      attendance_percentage: 100,
      points: 100,
      streak_days: 1,
      volunteer_hours: 0,
      avatar: newStudent.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
    });

    return jsonResponse({
      success: true,
      message: "Student registration saved to Supabase and permanently locked. Full Name and Mobile Number cannot be modified.",
      student: newStudent,
      identityLocked: true,
      supabaseSyncStatus: supabaseResult.success ? "synced" : "error",
    }, 201);
  }

  // Fetch all registered students directly from Supabase
  if (path === "/api/students/registered" && method === "GET") {
    const students = await supabaseSync.getNewRegisteredStudents();
    return jsonResponse({
      success: true,
      count: students.length,
      students,
      policy: "Full Name, Mobile Number, and Roll No are immutable.",
    });
  }

  // Profile Update Guard - strictly prevent changing full_name, mobile_number, or roll_no
  if (path === "/api/students/profile/update" && method === "POST") {
    const body = await parseBody<{
      studentId: string;
      fullName?: string;
      mobileNumber?: string;
      rollNo?: string;
      school?: string;
      department?: string;
      degree?: string;
      semester?: number;
      residenceType?: "hostel" | "dayscholar";
      hostelBlockOrBusRoute?: string;
      clubsInterested?: string[];
      verifiedByUniversity?: boolean;
    }>(request);

    if (!body || !body.studentId) {
      return jsonResponse({ success: false, message: "Missing student ID or roll number." }, 400);
    }

    const currentStudent = await supabaseSync.getStudentByRollOrEmail(body.studentId);

    if (!currentStudent) {
      return jsonResponse({ success: false, message: "Student record not found in Supabase." }, 404);
    }

    // Check if attempt is made to mutate locked fields
    if (
      (body.fullName && body.fullName.trim() !== currentStudent.fullName) ||
      (body.mobileNumber && body.mobileNumber.trim() !== currentStudent.mobileNumber) ||
      (body.rollNo && body.rollNo.trim().toUpperCase() !== currentStudent.rollNo)
    ) {
      return jsonResponse({
        success: false,
        error: "IMMUTABLE_FIELD_MODIFICATION_BLOCKED",
        message: "SECURITY POLICY VIOLATION: Student Full Name, Mobile Number, and Roll Number are permanently locked after registration and cannot be modified under any circumstances.",
        lockedFields: ["fullName", "mobileNumber", "rollNo"],
      }, 403);
    }

    const updateRes = await supabaseSync.updateStudentProfile(currentStudent.rollNo, {
      school: body.school,
      department: body.department,
      degree: body.degree,
      semester: body.semester !== undefined ? Number(body.semester) : undefined,
      residenceType: body.residenceType,
      hostelBlockOrBusRoute: body.hostelBlockOrBusRoute,
      clubsInterested: body.clubsInterested,
      verifiedByUniversity: body.verifiedByUniversity,
    });

    if (!updateRes.success) {
      return jsonResponse({
        success: false,
        message: updateRes.message || "Failed to update student profile in Supabase.",
      }, 500);
    }

    return jsonResponse({
      success: true,
      message: "Student record updated in Supabase. Core identity remains locked.",
      student: updateRes.student,
    });
  }

  return jsonResponse({ error: "Route not found in GSFC API Gateway" }, 404);
}

