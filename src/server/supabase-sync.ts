import { supabaseAdmin } from "../lib/supabase";
import {
  CampusEvent,
  Registration,
  AttendanceRecord,
  NewRegisteredStudent,
  CampusAnnouncement,
  Club,
  ClubMember,
} from "../lib/types";

export const supabaseSync = {
  // Check if Supabase tables are initialized and reachable
  async pingSupabase(): Promise<{ connected: boolean; error?: string }> {
    try {
      const { data, error } = await supabaseAdmin.from("events").select("id").limit(1);
      if (error) {
        return { connected: false, error: error.message };
      }
      return { connected: true };
    } catch (err) {
      return { connected: false, error: String(err) };
    }
  },

  // 1. Events CRUD
  async getEvents(category?: string | null, status?: string | null): Promise<CampusEvent[]> {
    try {
      let query = supabaseAdmin.from("events").select("*").order("created_at", { ascending: false });
      if (category) query = query.ilike("category", category);
      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          title: d.title,
          description: d.description || "",
          category: d.category,
          department: d.department,
          date: d.date,
          time: d.time,
          venue: d.venue,
          organizerName: d.organizer_name || d.organizerName || "",
          organizerEmail: d.organizer_email || d.organizerEmail || "",
          capacity: d.capacity || 100,
          registeredCount: d.registered_count || d.registeredCount || 0,
          waitlistCount: d.waitlist_count || d.waitlistCount || 0,
          approvalRequired: Boolean(d.approval_required ?? d.approvalRequired),
          isTeamEvent: Boolean(d.is_team_event ?? d.isTeamEvent),
          minTeamSize: d.min_team_size || d.minTeamSize || 1,
          maxTeamSize: d.max_team_size || d.maxTeamSize || 4,
          volunteerHoursReward: d.volunteer_hours_reward || d.volunteerHoursReward || 0,
          bannerImage: d.banner_image || d.bannerImage || "",
          status: d.status || "upcoming",
          averageRating: d.average_rating || d.averageRating || 5.0,
          reviewCount: d.review_count || d.reviewCount || 0,
          rules: d.rules || [],
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch events error:", e);
    }
    return [];
  },

  async getEventById(eventId: string): Promise<CampusEvent | null> {
    try {
      const { data, error } = await supabaseAdmin.from("events").select("*").eq("id", eventId).single();
      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          description: data.description || "",
          category: data.category,
          department: data.department,
          date: data.date,
          time: data.time,
          venue: data.venue,
          organizerName: data.organizer_name || data.organizerName || "",
          organizerEmail: data.organizer_email || data.organizerEmail || "",
          capacity: data.capacity || 100,
          registeredCount: data.registered_count || data.registeredCount || 0,
          waitlistCount: data.waitlist_count || data.waitlistCount || 0,
          approvalRequired: Boolean(data.approval_required ?? data.approvalRequired),
          isTeamEvent: Boolean(data.is_team_event ?? data.isTeamEvent),
          minTeamSize: data.min_team_size || data.minTeamSize || 1,
          maxTeamSize: data.max_team_size || data.maxTeamSize || 4,
          volunteerHoursReward: data.volunteer_hours_reward || data.volunteerHoursReward || 0,
          bannerImage: data.banner_image || data.bannerImage || "",
          status: data.status || "upcoming",
          averageRating: data.average_rating || data.averageRating || 5.0,
          reviewCount: data.review_count || data.reviewCount || 0,
        };
      }
    } catch (e) {
      console.warn("Supabase fetch event by ID error:", e);
    }
    return null;
  },

  async saveEvent(event: CampusEvent): Promise<boolean> {
    try {
      const payload = {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        department: event.department,
        date: event.date,
        time: event.time,
        venue: event.venue,
        organizer_name: event.organizerName,
        organizer_email: event.organizerEmail,
        capacity: event.capacity,
        registered_count: event.registeredCount,
        waitlist_count: event.waitlistCount,
        approval_required: event.approvalRequired,
        is_team_event: event.isTeamEvent,
        min_team_size: event.minTeamSize,
        max_team_size: event.maxTeamSize,
        volunteer_hours_reward: event.volunteerHoursReward,
        banner_image: event.bannerImage,
        status: event.status,
        average_rating: event.averageRating,
        review_count: event.reviewCount,
      };
      const { error } = await supabaseAdmin.from("events").upsert(payload);
      return !error;
    } catch (e) {
      console.warn("Supabase save event error:", e);
      return false;
    }
  },

  // 2. Registrations CRUD
  async getRegistrations(eventId?: string): Promise<Registration[]> {
    try {
      let query = supabaseAdmin.from("registrations").select("*").order("registered_at", { ascending: false });
      if (eventId) query = query.eq("event_id", eventId);

      const { data, error } = await query;
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          eventId: d.event_id || d.eventId,
          userId: d.user_id || d.userId,
          userRollNo: d.user_roll_no || d.userRollNo,
          userName: d.user_name || d.userName,
          department: d.department,
          registeredAt: d.registered_at || d.registeredAt,
          status: d.status || "confirmed",
          isTeam: d.is_team ?? d.isTeam ?? false,
          teamName: d.team_name || d.teamName,
          teamMembers: d.team_members || d.teamMembers,
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch registrations error:", e);
    }
    return [];
  },

  async saveRegistration(reg: Registration): Promise<boolean> {
    try {
      const payload = {
        id: reg.id,
        event_id: reg.eventId,
        user_id: reg.userId,
        user_roll_no: reg.userRollNo,
        user_name: reg.userName,
        department: reg.department,
        registered_at: reg.registeredAt || new Date().toISOString(),
        status: reg.status,
        is_team: reg.isTeam || false,
        team_name: reg.teamName || null,
        team_members: reg.teamMembers || null,
      };
      const { error } = await supabaseAdmin.from("registrations").upsert(payload);
      return !error;
    } catch (e) {
      console.warn("Supabase save registration error:", e);
      return false;
    }
  },

  // 3. Attendance CRUD
  async getAttendance(eventId?: string): Promise<AttendanceRecord[]> {
    try {
      let query = supabaseAdmin.from("attendance").select("*").order("timestamp", { ascending: false });
      if (eventId) query = query.eq("event_id", eventId);

      const { data, error } = await query;
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          eventId: d.event_id || d.eventId,
          eventTitle: d.event_title || d.eventTitle || "",
          userId: d.user_id || d.userId,
          userName: d.user_name || d.userName,
          userRollNo: d.user_roll_no || d.userRollNo,
          department: d.department,
          timestamp: d.timestamp,
          punchInTime: d.punch_in_time || d.punchInTime,
          punchOutTime: d.punch_out_time || d.punchOutTime,
          verifiedMethod: d.verified_method || d.verifiedMethod || "qr_scan",
          tokenUsed: d.token_used || d.tokenUsed || "",
          certificateId: d.certificate_id || d.certificateId,
          userLatitude: d.user_latitude || d.userLatitude,
          userLongitude: d.user_longitude || d.userLongitude,
          distanceFromVenueMeters: d.distance_from_venue_meters || d.distanceFromVenueMeters,
          locationVerified: d.location_verified ?? d.locationVerified ?? true,
          synced: true,
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch attendance error:", e);
    }
    return [];
  },

  async saveAttendance(att: AttendanceRecord): Promise<boolean> {
    try {
      const payload = {
        id: att.id,
        event_id: att.eventId,
        event_title: att.eventTitle,
        user_id: att.userId,
        user_name: att.userName,
        user_roll_no: att.userRollNo,
        department: att.department,
        timestamp: att.timestamp || new Date().toISOString(),
        punch_in_time: att.punchInTime || att.timestamp || new Date().toISOString(),
        verified_method: att.verifiedMethod || "qr_scan",
        token_used: att.tokenUsed || "GSFC-TOKEN-VERIFIED",
        certificate_id: att.certificateId || null,
        user_latitude: att.userLatitude || null,
        user_longitude: att.userLongitude || null,
        distance_from_venue_meters: att.distanceFromVenueMeters || null,
        location_verified: att.locationVerified ?? true,
        synced: true,
      };
      const { error } = await supabaseAdmin.from("attendance").upsert(payload);
      return !error;
    } catch (e) {
      console.warn("Supabase save attendance error:", e);
      return false;
    }
  },

  async getCertificateRecord(certId: string): Promise<AttendanceRecord | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from("attendance")
        .select("*")
        .ilike("certificate_id", certId.trim())
        .limit(1)
        .single();
      if (!error && data) {
        return {
          id: data.id,
          eventId: data.event_id,
          eventTitle: data.event_title,
          userId: data.user_id,
          userName: data.user_name,
          userRollNo: data.user_roll_no,
          department: data.department,
          timestamp: data.timestamp,
          verifiedMethod: data.verified_method,
          certificateId: data.certificate_id,
          synced: true,
        };
      }
    } catch (e) {
      console.warn("Supabase get certificate record error:", e);
    }
    return null;
  },

  // 4. Accounts CRUD
  async getAccounts(): Promise<any[]> {
    try {
      const { data, error } = await supabaseAdmin.from("accounts").select("*");
      if (!error && data) return data;
    } catch (e) {
      console.warn("Supabase fetch accounts error:", e);
    }
    return [];
  },

  async getAccountByIdentifier(identifier: string, role?: string): Promise<any | null> {
    try {
      const clean = identifier.trim().toLowerCase();
      let query = supabaseAdmin.from("accounts").select("*");
      if (role) query = query.eq("role", role);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const found = data.find(
          (a: any) =>
            a.email.toLowerCase() === clean ||
            a.roll_no.toLowerCase() === clean ||
            clean.includes(a.roll_no.toLowerCase()) ||
            clean.includes(a.email.split("@")[0].toLowerCase())
        );
        return found || null;
      }
    } catch (e) {
      console.warn("Supabase get account by identifier error:", e);
    }
    return null;
  },

  async saveAccount(account: any): Promise<boolean> {
    try {
      const payload = {
        id: account.id || `u-${account.roll_no?.toLowerCase() || Date.now()}`,
        name: account.name,
        roll_no: account.roll_no || account.idOrRoll,
        email: account.email,
        role: account.role || "student",
        department: account.department || "Computer Science & Engineering",
        semester: account.semester || 4,
        year: account.year || 2,
        attendance_percentage: account.attendance_percentage || account.attendanceRate || 100,
        points: account.points || 100,
        streak_days: account.streak_days || account.streakDays || 1,
        volunteer_hours: account.volunteer_hours || account.volunteerHours || 0,
        avatar: account.avatar || account.name?.slice(0, 2).toUpperCase() || "ST",
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabaseAdmin.from("accounts").upsert(payload);
      return !error;
    } catch (e) {
      console.warn("Supabase save account error:", e);
      return false;
    }
  },

  // 5. Newly Registered Students (Locked Identity)
  async saveNewStudent(student: NewRegisteredStudent): Promise<{ success: boolean; message?: string }> {
    try {
      const payload = {
        id: student.id,
        full_name: student.fullName,
        mobile_number: student.mobileNumber,
        roll_no: student.rollNo,
        email: student.email,
        school: student.school,
        department: student.department,
        degree: student.degree,
        semester: student.semester,
        residence_type: student.residenceType,
        hostel_block_or_bus_route: student.hostelBlockOrBusRoute || null,
        clubs_interested: student.clubsInterested || [],
        id_card_uploaded: student.idCardUploaded,
        is_locked: true,
        verified_by_university: student.verifiedByUniversity ?? true,
        created_at: student.createdAt || new Date().toISOString(),
      };

      const { error } = await supabaseAdmin.from("new_registered_students").insert(payload);
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true };
    } catch (e: any) {
      console.warn("Supabase save new registered student error:", e);
      return { success: false, message: e.message || String(e) };
    }
  },

  async getNewRegisteredStudents(): Promise<NewRegisteredStudent[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("new_registered_students")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          fullName: d.full_name,
          mobileNumber: d.mobile_number,
          rollNo: d.roll_no,
          email: d.email,
          school: d.school,
          department: d.department,
          degree: d.degree,
          semester: d.semester,
          residenceType: d.residence_type,
          hostelBlockOrBusRoute: d.hostel_block_or_bus_route,
          clubsInterested: d.clubs_interested || [],
          idCardUploaded: d.id_card_uploaded,
          isLocked: d.is_locked,
          verifiedByUniversity: d.verified_by_university,
          createdAt: d.created_at,
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch new registered students error:", e);
    }
    return [];
  },

  async getStudentByRollOrEmail(rollNo: string, email?: string): Promise<NewRegisteredStudent | null> {
    try {
      const cleanRoll = rollNo.trim().toUpperCase();
      let query = supabaseAdmin.from("new_registered_students").select("*").eq("roll_no", cleanRoll);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const d = data[0];
        return {
          id: d.id,
          fullName: d.full_name,
          mobileNumber: d.mobile_number,
          rollNo: d.roll_no,
          email: d.email,
          school: d.school,
          department: d.department,
          degree: d.degree,
          semester: d.semester,
          residenceType: d.residence_type,
          hostelBlockOrBusRoute: d.hostel_block_or_bus_route,
          clubsInterested: d.clubs_interested || [],
          idCardUploaded: d.id_card_uploaded,
          isLocked: d.is_locked,
          verifiedByUniversity: d.verified_by_university,
          createdAt: d.created_at,
        };
      }

      if (email) {
        const { data: emailData } = await supabaseAdmin
          .from("new_registered_students")
          .select("*")
          .eq("email", email.trim().toLowerCase());
        if (emailData && emailData.length > 0) {
          const d = emailData[0];
          return {
            id: d.id,
            fullName: d.full_name,
            mobileNumber: d.mobile_number,
            rollNo: d.roll_no,
            email: d.email,
            school: d.school,
            department: d.department,
            degree: d.degree,
            semester: d.semester,
            residenceType: d.residence_type,
            hostelBlockOrBusRoute: d.hostel_block_or_bus_route,
            clubsInterested: d.clubs_interested || [],
            idCardUploaded: d.id_card_uploaded,
            isLocked: d.is_locked,
            verifiedByUniversity: d.verified_by_university,
            createdAt: d.created_at,
          };
        }
      }
    } catch (e) {
      console.warn("Supabase get student by roll error:", e);
    }
    return null;
  },

  async updateStudentProfile(
    studentId: string,
    updates: {
      school?: string;
      department?: string;
      degree?: string;
      semester?: number;
      residenceType?: "hostel" | "dayscholar";
      hostelBlockOrBusRoute?: string;
      clubsInterested?: string[];
      verifiedByUniversity?: boolean;
    }
  ): Promise<{ success: boolean; message?: string; student?: NewRegisteredStudent }> {
    try {
      const current = await this.getStudentByRollOrEmail(studentId);
      if (!current) {
        return { success: false, message: "Student not found in registry." };
      }

      const dbPayload: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.school !== undefined) dbPayload.school = updates.school;
      if (updates.department !== undefined) dbPayload.department = updates.department;
      if (updates.degree !== undefined) dbPayload.degree = updates.degree;
      if (updates.semester !== undefined) dbPayload.semester = updates.semester;
      if (updates.residenceType !== undefined) dbPayload.residence_type = updates.residenceType;
      if (updates.hostelBlockOrBusRoute !== undefined) dbPayload.hostel_block_or_bus_route = updates.hostelBlockOrBusRoute;
      if (updates.clubsInterested !== undefined) dbPayload.clubs_interested = updates.clubsInterested;
      if (updates.verifiedByUniversity !== undefined) dbPayload.verified_by_university = updates.verifiedByUniversity;

      const { error } = await supabaseAdmin
        .from("new_registered_students")
        .update(dbPayload)
        .eq("roll_no", current.rollNo);

      if (error) {
        return { success: false, message: error.message };
      }

      // Also update accounts table if exists
      if (updates.department !== undefined || updates.semester !== undefined) {
        const accountUpdates: any = {};
        if (updates.department !== undefined) accountUpdates.department = updates.department;
        if (updates.semester !== undefined) accountUpdates.semester = updates.semester;
        await supabaseAdmin
          .from("accounts")
          .update(accountUpdates)
          .eq("roll_no", current.rollNo);
      }

      const updatedStudent: NewRegisteredStudent = {
        ...current,
        school: updates.school ?? current.school,
        department: updates.department ?? current.department,
        degree: updates.degree ?? current.degree,
        semester: updates.semester ?? current.semester,
        residenceType: updates.residenceType ?? current.residenceType,
        hostelBlockOrBusRoute: updates.hostelBlockOrBusRoute ?? current.hostelBlockOrBusRoute,
        clubsInterested: updates.clubsInterested ?? current.clubsInterested,
        verifiedByUniversity: updates.verifiedByUniversity ?? current.verifiedByUniversity,
      };

      return { success: true, message: "Student profile updated successfully in Supabase.", student: updatedStudent };
    } catch (e: any) {
      console.warn("Supabase update student profile error:", e);
      return { success: false, message: e.message || String(e) };
    }
  },

  // 6. Clubs CRUD
  async getClubs(): Promise<Club[]> {
    try {
      const { data, error } = await supabaseAdmin.from("clubs").select("*").order("name");
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          department: d.department,
          description: d.description,
          bannerImage: d.banner_image,
          logo: d.logo,
          facultyCoordinator: d.faculty_coordinator,
          studentLead: d.student_lead,
          memberCount: d.member_count,
          meetingSchedule: d.meeting_schedule,
          foundedYear: d.founded_year,
          status: d.status,
          tags: d.tags || [],
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch clubs error:", e);
    }
    return [];
  },

  async joinClub(member: ClubMember): Promise<boolean> {
    try {
      const payload = {
        id: member.id,
        club_id: member.clubId,
        user_id: member.userId,
        user_name: member.userName,
        user_roll_no: member.userRollNo,
        department: member.department,
        role: member.role || "member",
        joined_at: member.joinedAt || new Date().toISOString(),
        status: member.status || "active",
        volunteer_hours_earned: member.volunteerHoursEarned || 0,
      };
      const { error } = await supabaseAdmin.from("club_members").upsert(payload);
      return !error;
    } catch (e) {
      console.warn("Supabase join club error:", e);
      return false;
    }
  },

  // 7. Announcements CRUD
  async getAnnouncements(): Promise<CampusAnnouncement[]> {
    try {
      const { data, error } = await supabaseAdmin.from("announcements").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          category: d.category,
          authorName: d.author_name,
          authorRole: d.author_role,
          departmentTarget: d.department_target,
          priority: d.priority,
          readBy: d.read_by || [],
          createdAt: d.created_at,
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch announcements error:", e);
    }
    return [];
  },

  async saveAnnouncement(ann: CampusAnnouncement): Promise<boolean> {
    try {
      const payload = {
        id: ann.id,
        title: ann.title,
        content: ann.content,
        category: ann.category,
        author_name: ann.authorName,
        author_role: ann.authorRole,
        department_target: ann.departmentTarget,
        priority: ann.priority,
        read_by: ann.readBy || [],
        created_at: ann.createdAt || new Date().toISOString(),
      };
      const { error } = await supabaseAdmin.from("announcements").upsert(payload);
      return !error;
    } catch (e) {
      console.warn("Supabase save announcement error:", e);
      return false;
    }
  },
};

