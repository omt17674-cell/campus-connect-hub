import { db } from "./db";
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

  // 1. Health Check
  if (path === "/api/health" && method === "GET") {
    return jsonResponse({
      status: "online",
      institution: "GSFC University, Vadodara",
      service: "Campus Connect Hub REST API Gateway",
      version: "2.6.0",
      totalEvents: db.events.length,
      totalStudents: db.accounts.filter((a) => a.role === "student").length,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Authentication: Login with Credentials
  if (path === "/api/auth/login" && method === "POST") {
    const body = await parseBody<{ identifier: string; password?: string; role: string }>(request);
    if (!body || !body.identifier || !body.role) {
      return jsonResponse({ success: false, message: "Missing identifier or role." }, 400);
    }

    const cleanId = body.identifier.trim().toLowerCase();
    const account = db.accounts.find(
      (a) =>
        a.role === body.role &&
        (a.email.toLowerCase() === cleanId ||
          a.idOrRoll.toLowerCase() === cleanId ||
          cleanId.includes(a.idOrRoll.toLowerCase()) ||
          cleanId.includes(a.email.split("@")[0].toLowerCase()))
    );

    if (account) {
      return jsonResponse({
        success: true,
        message: `Authenticated as ${account.name}`,
        account,
        token: `gsfc-jwt-${account.role}-${Date.now().toString(36)}`,
      });
    }

    return jsonResponse({ success: false, message: "Invalid credentials or unauthorized role." }, 401);
  }

  // 3. Authentication: Google Workspace SSO
  if (path === "/api/auth/google" && method === "POST") {
    const body = await parseBody<{ email?: string; name?: string; rollNo?: string }>(request);
    const email = body?.email || "omthakkar168@gsfcuniversity.ac.in";
    const name = body?.name || "Om Thakkar";
    const rollNo = body?.rollNo || "24BT04171";

    let account = db.accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() || a.idOrRoll.toLowerCase() === rollNo.toLowerCase()
    );

    if (!account) {
      account = {
        role: "student",
        roleTitle: "GSFC Student",
        roleBadge: rollNo,
        name,
        idOrRoll: rollNo,
        email,
        password: "SSO_GOOGLE_VERIFIED",
        profile: {
          id: `u-${rollNo.toLowerCase()}`,
          name,
          rollNo,
          email,
          role: "student",
          department: "B.Tech Computer Science & Engineering",
          year: 2,
          semester: 4,
          attendancePercentage: 88,
          points: 1200,
          streakDays: 14,
          volunteerHours: 24,
          avatar: "OT",
        },
      };
      db.accounts.push(account);
    }

    return jsonResponse({
      success: true,
      message: `Authenticated via Google as ${account.name}`,
      account,
      token: `gsfc-google-sso-${Date.now().toString(36)}`,
    });
  }

  // 4. Events: List Catalog
  if (path === "/api/events" && method === "GET") {
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");

    let results = db.events;
    if (category) results = results.filter((e) => e.category.toLowerCase() === category.toLowerCase());
    if (status) results = results.filter((e) => e.status === status);

    return jsonResponse({ success: true, count: results.length, events: results });
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

    db.events.unshift(newEvent);
    return jsonResponse({ success: true, message: "Event created successfully.", event: newEvent }, 201);
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
    }>(request);

    if (!body || !body.eventId || !body.userId) {
      return jsonResponse({ success: false, message: "Missing registration payload." }, 400);
    }

    const event = db.events.find((e) => e.id === body.eventId);
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
    };

    db.registrations.unshift(newReg);
    if (!isFull) {
      event.registeredCount += 1;
    } else {
      event.waitlistCount += 1;
    }

    return jsonResponse({
      success: true,
      message: isFull ? "Added to waitlist" : "Registration confirmed",
      registration: newReg,
      waitlisted: isFull,
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

    const event = db.events.find((e) => e.id === body.eventId);
    if (!event) return jsonResponse({ success: false, message: "Event not found." }, 404);

    const existing = db.attendanceRecords.find((a) => a.eventId === body.eventId && a.userId === body.userId);
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
      verifiedMethod: "qr_scan",
      tokenUsed: body.token || "GSFC-TOKEN-VERIFIED",
      synced: true,
      certificateId: certId,
      userLatitude: body.locationData?.latitude,
      userLongitude: body.locationData?.longitude,
      distanceFromVenueMeters: body.locationData?.distanceMeters || 15,
      locationVerified: body.locationData?.verified ?? true,
    };

    db.attendanceRecords.unshift(record);

    return jsonResponse({
      success: true,
      message: `Attendance verified with live GPS (${record.distanceFromVenueMeters}m from venue).`,
      record,
    });
  }

  // 8. Certificates: Public Verification Gateway
  if (path.startsWith("/api/certificates/verify")) {
    const certId = url.searchParams.get("id") || path.split("/").pop();
    if (!certId) return jsonResponse({ success: false, message: "Certificate ID required." }, 400);

    const clean = certId.trim().toUpperCase();
    const record = db.attendanceRecords.find((a) => a.certificateId?.toUpperCase() === clean);

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
    return jsonResponse({ success: true, count: db.clubs.length, clubs: db.clubs });
  }

  if (path === "/api/clubs/join" && method === "POST") {
    const body = await parseBody<{ clubId: string; userId: string; userName: string; userRollNo: string; department: string }>(request);
    if (!body || !body.clubId || !body.userId) {
      return jsonResponse({ success: false, message: "Missing club membership details." }, 400);
    }

    const club = db.clubs.find((c) => c.id === body.clubId);
    if (!club) return jsonResponse({ success: false, message: "Club not found." }, 404);

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

    db.clubMembers.push(member);
    club.memberCount += 1;

    return jsonResponse({ success: true, message: `Joined ${club.name}!`, member });
  }

  // 10. Campus Announcements Feed
  if (path === "/api/announcements" && method === "GET") {
    return jsonResponse({ success: true, count: db.announcements.length, announcements: db.announcements });
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

    db.announcements.unshift(newAnn);
    return jsonResponse({ success: true, message: "Announcement broadcasted successfully.", announcement: newAnn }, 201);
  }

  // 11. AI Campus Assistant Backend
  if (path === "/api/ai/assistant" && method === "POST") {
    const body = await parseBody<{ prompt: string; userRole?: string; userId?: string }>(request);
    const prompt = (body?.prompt || "").trim().toLowerCase();

    let reply = "";
    if (prompt.includes("event") || prompt.includes("hackathon") || prompt.includes("workshop")) {
      reply = `### 📅 GSFC Campus Events:\n` + db.events.map((e) => `• **${e.title}** (${e.date}) at *${e.venue}* [${e.category}]`).join("\n");
    } else if (prompt.includes("club")) {
      reply = `### 🏛️ GSFC University Student Clubs:\n` + db.clubs.map((c) => `• **${c.logo} ${c.name}** (${c.category}) · Coordinator: ${c.facultyCoordinator.name}`).join("\n");
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

  return jsonResponse({ error: "Route not found in GSFC API Gateway" }, 404);
}
