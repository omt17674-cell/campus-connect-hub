import { supabaseAdmin } from "./supabase-admin";
import {
  CampusEvent,
  Registration,
  AttendanceRecord,
  NewRegisteredStudent,
  CampusAnnouncement,
  Club,
  ClubMember,
  Internship,
  InternshipApplication,
  InternshipAttendanceRecord,
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
      let query = supabaseAdmin
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });
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
          venueLatitude: d.venue_latitude ?? d.venueLatitude,
          venueLongitude: d.venue_longitude ?? d.venueLongitude,
          allowedRadiusMeters: d.allowed_radius_meters ?? d.allowedRadiusMeters ?? 350,
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
      const { data, error } = await supabaseAdmin
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();
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

  async saveEvent(event: CampusEvent): Promise<{
    success: boolean;
    data: CampusEvent | null;
    error: { message: string; code?: string; details?: string; hint?: string } | null;
  }> {
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

      console.log('[EVENT_CREATE] DB_WRITE_START', {
        eventId: event.id,
        title: event.title,
      });

      const { data, error } = await supabaseAdmin
        .from("events")
        .upsert(payload)
        .select()
        .single();

      if (error) {
        console.error('[EVENT_CREATE] DB_WRITE_ERROR', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return {
          success: false,
          data: null,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
        };
      }

      if (!data) {
        console.warn('[EVENT_CREATE] DB_WRITE_NO_DATA', { eventId: event.id });
        return {
          success: false,
          data: null,
          error: { message: 'No data returned from database' },
        };
      }

      console.log('[EVENT_CREATE] DB_WRITE_SUCCESS', { eventId: event.id });
      return {
        success: true,
        data: {
          id: data.id,
          title: data.title,
          description: data.description || "",
          category: data.category,
          department: data.department,
          date: data.date,
          time: data.time,
          venue: data.venue,
          venueLatitude: data.venue_latitude,
          venueLongitude: data.venue_longitude,
          allowedRadiusMeters: data.allowed_radius_meters,
          organizerName: data.organizer_name,
          organizerEmail: data.organizer_email,
          capacity: data.capacity,
          registeredCount: data.registered_count,
          waitlistCount: data.waitlist_count,
          approvalRequired: data.approval_required,
          isTeamEvent: data.is_team_event,
          minTeamSize: data.min_team_size,
          maxTeamSize: data.max_team_size,
          volunteerHoursReward: data.volunteer_hours_reward,
          bannerImage: data.banner_image,
          status: data.status,
          averageRating: data.average_rating,
          reviewCount: data.review_count,
        },
        error: null,
      };
    } catch (e: any) {
      console.error('[EVENT_CREATE] DB_WRITE_EXCEPTION', {
        message: e.message,
        name: e.name,
      });
      return {
        success: false,
        data: null,
        error: { message: e.message || 'Database exception' },
      };
    }
  },

  // 2. Registrations CRUD
  async getRegistrations(eventId?: string): Promise<Registration[]> {
    try {
      let query = supabaseAdmin
        .from("registrations")
        .select("*")
        .order("registered_at", { ascending: false });
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
      let query = supabaseAdmin
        .from("attendance")
        .select("*")
        .order("timestamp", { ascending: false });
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
            clean.includes(a.email.split("@")[0].toLowerCase()),
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
        mobile_number: account.mobile_number || account.mobileNumber || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabaseAdmin
        .from("accounts")
        .upsert(payload, { onConflict: "roll_no" });
      return !error;
    } catch (e) {
      console.warn("Supabase save account error:", e);
      return false;
    }
  },

  // 5. Newly Registered Students (Locked Identity)
  async saveNewStudent(
    student: NewRegisteredStudent,
  ): Promise<{ success: boolean; message?: string }> {
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
        verified_by_university: student.verifiedByUniversity ?? false,
        is_verified: student.isVerified ?? false,
        created_at: student.createdAt || new Date().toISOString(),
      };

      const { error } = await supabaseAdmin
        .from("new_registered_students")
        .upsert(payload, { onConflict: "roll_no" });
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true };
    } catch (e: any) {
      console.warn("Supabase save new registered student error:", e);
      return { success: false, message: e.message || String(e) };
    }
  },

  async deleteStudent(rollNo: string): Promise<boolean> {
    try {
      const cleanRoll = rollNo.trim().toUpperCase();
      await supabaseAdmin.from("new_registered_students").delete().eq("roll_no", cleanRoll);
      await supabaseAdmin.from("accounts").delete().eq("roll_no", cleanRoll);
      return true;
    } catch (e) {
      console.warn("Supabase delete student error:", e);
      return false;
    }
  },

  async getPaginatedStudents(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    department?: string;
    status?: string;
  }): Promise<{ students: NewRegisteredStudent[]; total: number; page: number; pageSize: number }> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 50));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      let query = supabaseAdmin
        .from("new_registered_students")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (params.department && params.department !== "all") {
        query = query.ilike("department", `%${params.department}%`);
      }

      if (params.search && params.search.trim()) {
        const q = params.search.trim();
        query = query.or(
          `full_name.ilike.%${q}%,roll_no.ilike.%${q}%,email.ilike.%${q}%,mobile_number.ilike.%${q}%`,
        );
      }

      const { data, count, error } = await query.range(from, to);

      if (!error && data) {
        const students = data.map((d: any) => ({
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
          verifiedByUniversity: Boolean(d.verified_by_university),
          isVerified: Boolean(d.is_verified),
          createdAt: d.created_at,
        }));
        return {
          students,
          total: count ?? students.length,
          page,
          pageSize,
        };
      }
    } catch (e) {
      console.warn("Supabase fetch paginated students error:", e);
    }
    return { students: [], total: 0, page, pageSize };
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
          verifiedByUniversity: Boolean(d.verified_by_university),
          isVerified: Boolean(d.is_verified),
          createdAt: d.created_at,
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch new registered students error:", e);
    }
    return [];
  },

  async getStudentByRollOrEmail(
    rollNo: string,
    email?: string,
  ): Promise<NewRegisteredStudent | null> {
    try {
      const cleanRoll = rollNo.trim().toUpperCase();
      const query = supabaseAdmin
        .from("new_registered_students")
        .select("*")
        .eq("roll_no", cleanRoll);
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
          isVerified: d.is_verified ?? true,
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
            isVerified: d.is_verified ?? true,
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
    },
  ): Promise<{ success: boolean; message?: string; student?: NewRegisteredStudent }> {
    try {
      const current = await this.getStudentByRollOrEmail(studentId);
      if (!current) {
        return { success: false, message: "Student not found in registry." };
      }

      const dbPayload: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.fullName !== undefined) dbPayload.full_name = updates.fullName;
      if (updates.rollNo !== undefined) dbPayload.roll_no = updates.rollNo;
      if (updates.email !== undefined) dbPayload.email = updates.email;
      if (updates.mobileNumber !== undefined) dbPayload.mobile_number = updates.mobileNumber;
      if (updates.school !== undefined) dbPayload.school = updates.school;
      if (updates.department !== undefined) dbPayload.department = updates.department;
      if (updates.degree !== undefined) dbPayload.degree = updates.degree;
      if (updates.semester !== undefined) dbPayload.semester = updates.semester;
      if (updates.residenceType !== undefined) dbPayload.residence_type = updates.residenceType;
      if (updates.hostelBlockOrBusRoute !== undefined)
        dbPayload.hostel_block_or_bus_route = updates.hostelBlockOrBusRoute;
      if (updates.clubsInterested !== undefined)
        dbPayload.clubs_interested = updates.clubsInterested;
      if (updates.verifiedByUniversity !== undefined)
        dbPayload.verified_by_university = updates.verifiedByUniversity;

      const { error } = await supabaseAdmin
        .from("new_registered_students")
        .update(dbPayload)
        .eq("roll_no", current.rollNo);

      if (error) {
        return { success: false, message: error.message };
      }

      // Also update accounts table if exists
      const accountUpdates: any = {};
      if (updates.fullName !== undefined) accountUpdates.name = updates.fullName;
      if (updates.rollNo !== undefined) accountUpdates.roll_no = updates.rollNo;
      if (updates.email !== undefined) accountUpdates.email = updates.email;
      if (updates.mobileNumber !== undefined) accountUpdates.mobile_number = updates.mobileNumber;
      if (updates.department !== undefined) accountUpdates.department = updates.department;
      if (updates.semester !== undefined) accountUpdates.semester = updates.semester;
      if (Object.keys(accountUpdates).length > 0) {
        await supabaseAdmin.from("accounts").update(accountUpdates).eq("roll_no", current.rollNo);
      }

      const updatedStudent: NewRegisteredStudent = {
        ...current,
        fullName: updates.fullName ?? current.fullName,
        rollNo: updates.rollNo ?? current.rollNo,
        email: updates.email ?? current.email,
        mobileNumber: updates.mobileNumber ?? current.mobileNumber,
        school: updates.school ?? current.school,
        department: updates.department ?? current.department,
        degree: updates.degree ?? current.degree,
        semester: updates.semester ?? current.semester,
        residenceType: updates.residenceType ?? current.residenceType,
        hostelBlockOrBusRoute: updates.hostelBlockOrBusRoute ?? current.hostelBlockOrBusRoute,
        clubsInterested: updates.clubsInterested ?? current.clubsInterested,
        verifiedByUniversity: updates.verifiedByUniversity ?? current.verifiedByUniversity,
      };

      return {
        success: true,
        message: "Student profile updated successfully in Supabase.",
        student: updatedStudent,
      };
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
      const { data, error } = await supabaseAdmin
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
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

  // 8. Internships CRUD
  async getInternships(): Promise<Internship[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("internships")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          title: d.title,
          companyName: d.company_name,
          description: d.description,
          department: d.department,
          skillsRequired: d.skills_required || [],
          eligibility: d.eligibility,
          positions: d.positions,
          location: d.location,
          mode: d.mode,
          startDate: d.start_date,
          endDate: d.end_date,
          duration: d.duration,
          stipend: d.stipend,
          workingHours: d.working_hours,
          contactPerson: d.contact_person,
          contactEmail: d.contact_email,
          applicationDeadline: d.application_deadline,
          requiredDocuments: d.required_documents || [],
          status: d.status,
          createdBy: d.created_by,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch internships error:", e);
    }
    return [];
  },

  async saveInternship(internship: Internship): Promise<boolean> {
    try {
      const payload = {
        id: internship.id,
        title: internship.title,
        company_name: internship.companyName,
        description: internship.description,
        department: internship.department,
        skills_required: internship.skillsRequired,
        eligibility: internship.eligibility,
        positions: internship.positions,
        location: internship.location,
        mode: internship.mode,
        start_date: internship.startDate,
        end_date: internship.endDate,
        duration: internship.duration,
        stipend: internship.stipend,
        working_hours: internship.workingHours,
        contact_person: internship.contactPerson,
        contact_email: internship.contactEmail,
        application_deadline: internship.applicationDeadline,
        required_documents: internship.requiredDocuments,
        status: internship.status,
        created_by: internship.createdBy,
        created_at: internship.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabaseAdmin.from("internships").upsert(payload);
      return !error;
    } catch (e) {
      console.warn("Supabase save internship error:", e);
      return false;
    }
  },

  // 9. Internship Applications CRUD
  async getInternshipApplications(): Promise<InternshipApplication[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("internship_applications")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          applicationNumber: d.application_number,
          internshipId: d.internship_id,
          studentId: d.student_id,
          fullName: d.full_name,
          enrollmentNumber: d.enrollment_number,
          email: d.email,
          phone: d.phone,
          course: d.course,
          branch: d.branch,
          semester: d.semester,
          cgpa: d.cgpa,
          tenthPercentage: d.tenth_percentage,
          twelfthPercentage: d.twelfth_percentage,
          backlogs: d.backlogs,
          academicDetails: d.academic_details,
          address: d.address,
          skills: d.skills || [],
          projects: d.projects,
          experience: d.experience,
          whyInternship: d.why_internship,
          careerObjective: d.career_objective,
          coverLetter: d.cover_letter,
          resumeUrl: d.resume_url,
          collegeIdUrl: d.college_id_url,
          documents: d.documents,
          declarationAccepted: d.declaration_accepted,
          status: d.status,
          adminReviewedBy: d.admin_reviewed_by,
          adminReviewedAt: d.admin_reviewed_at,
          adminComment: d.admin_comment,
          deanReviewedBy: d.dean_reviewed_by,
          deanReviewedAt: d.dean_reviewed_at,
          deanComment: d.dean_comment,
          approvedAt: d.approved_at,
          rejectedAt: d.rejected_at,
          rejectionReason: d.rejection_reason,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch internship applications error:", e);
    }
    return [];
  },

  async saveInternshipApplication(application: InternshipApplication): Promise<boolean> {
    try {
      const payload = {
        id: application.id,
        application_number: application.applicationNumber,
        internship_id: application.internshipId,
        student_id: application.studentId,
        full_name: application.fullName,
        enrollment_number: application.enrollmentNumber,
        email: application.email,
        phone: application.phone,
        course: application.course,
        branch: application.branch,
        semester: application.semester,
        cgpa: application.cgpa,
        tenth_percentage: application.tenthPercentage,
        twelfth_percentage: application.twelfthPercentage,
        backlogs: application.backlogs,
        academic_details: application.academicDetails,
        address: application.address,
        skills: application.skills,
        projects: application.projects,
        experience: application.experience,
        why_internship: application.whyInternship,
        career_objective: application.careerObjective,
        cover_letter: application.coverLetter,
        resume_url: application.resumeUrl,
        college_id_url: application.collegeIdUrl,
        documents: application.documents,
        declaration_accepted: application.declarationAccepted,
        status: application.status,
        admin_reviewed_by: application.adminReviewedBy,
        admin_reviewed_at: application.adminReviewedAt,
        admin_comment: application.adminComment,
        dean_reviewed_by: application.deanReviewedBy,
        dean_reviewed_at: application.deanReviewedAt,
        dean_comment: application.deanComment,
        approved_at: application.approvedAt,
        rejected_at: application.rejectedAt,
        rejection_reason: application.rejectionReason,
        created_at: application.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabaseAdmin.from("internship_applications").upsert(payload);
      return !error;
    } catch (e) {
      console.warn("Supabase save internship application error:", e);
      return false;
    }
  },

  // 10. Internship Attendance CRUD
  async getInternshipAttendance(): Promise<InternshipAttendanceRecord[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("internship_attendance")
        .select("*")
        .order("punch_in_time", { ascending: false });
      
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          applicationId: d.application_id,
          studentId: d.student_id,
          internshipId: d.internship_id,
          attendanceDate: d.attendance_date,
          punchInTime: d.punch_in_time,
          punchInLatitude: d.punch_in_latitude,
          punchInLongitude: d.punch_in_longitude,
          punchInAccuracy: d.punch_in_accuracy,
          punchInAddress: d.punch_in_address,
          punchOutTime: d.punch_out_time,
          punchOutLatitude: d.punch_out_latitude,
          punchOutLongitude: d.punch_out_longitude,
          punchOutAccuracy: d.punch_out_accuracy,
          punchOutAddress: d.punch_out_address,
          workingHours: d.working_hours,
          breakMinutes: d.break_minutes,
          tasksSummary: d.tasks_summary,
          notes: d.notes,
          supervisorRating: d.supervisor_rating,
          supervisorFeedback: d.supervisor_feedback,
          isValidated: d.is_validated,
          validatedBy: d.validated_by,
          validatedAt: d.validated_at,
          createdAt: d.created_at,
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch internship attendance error:", e);
    }
    return [];
  },

  async saveInternshipAttendance(attendance: InternshipAttendanceRecord): Promise<boolean> {
    try {
      const payload = {
        id: attendance.id,
        application_id: attendance.applicationId,
        student_id: attendance.studentId,
        internship_id: attendance.internshipId,
        attendance_date: attendance.attendanceDate,
        punch_in_time: attendance.punchInTime,
        punch_in_latitude: attendance.punchInLatitude,
        punch_in_longitude: attendance.punchInLongitude,
        punch_in_accuracy: attendance.punchInAccuracy,
        punch_in_address: attendance.punchInAddress,
        punch_out_time: attendance.punchOutTime,
        punch_out_latitude: attendance.punchOutLatitude,
        punch_out_longitude: attendance.punchOutLongitude,
        punch_out_accuracy: attendance.punchOutAccuracy,
        punch_out_address: attendance.punchOutAddress,
        working_hours: attendance.workingHours,
        break_minutes: attendance.breakMinutes,
        tasks_summary: attendance.tasksSummary,
        notes: attendance.notes,
        supervisor_rating: attendance.supervisorRating,
        supervisor_feedback: attendance.supervisorFeedback,
        is_validated: attendance.isValidated,
        validated_by: attendance.validatedBy,
        validated_at: attendance.validatedAt,
        created_at: attendance.createdAt || new Date().toISOString(),
      };
      const { error } = await supabaseAdmin.from("internship_attendance").upsert(payload);
      return !error;
    } catch (e) {
      console.warn("Supabase save internship attendance error:", e);
      return false;
    }
  },
};
