import {
  CampusEvent,
  Registration,
  AttendanceRecord,
  NewRegisteredStudent,
  CampusAnnouncement,
} from "./types";

/**
 * Standardized logging for any failed Supabase write or read
 */
export function logSupabaseError(
  action: string,
  table: string,
  error: any,
  context?: any
): string {
  const errMsg =
    error?.message ||
    error?.details ||
    error?.hint ||
    (typeof error === "string" ? error : JSON.stringify(error));

  console.error(`[Supabase Error] ❌ Table '${table}' [${action}] failed:`, {
    table,
    action,
    message: errMsg,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    context,
  });

  return errMsg;
}

/**
 * Map camelCase CampusEvent to snake_case Postgres columns
 */
export function serializeEventForDb(event: Partial<CampusEvent>): any {
  return {
    id: event.id,
    title: event.title,
    description: event.description || "",
    category: event.category,
    department: event.department,
    date: event.date,
    time: event.time,
    venue: event.venue,
    organizer_name: event.organizerName,
    organizer_email: event.organizerEmail,
    capacity: event.capacity ?? 100,
    registered_count: event.registeredCount ?? 0,
    waitlist_count: event.waitlistCount ?? 0,
    approval_required: Boolean(event.approvalRequired),
    is_team_event: Boolean(event.isTeamEvent),
    min_team_size: event.minTeamSize ?? 1,
    max_team_size: event.maxTeamSize ?? 4,
    volunteer_hours_reward: event.volunteerHoursReward ?? 0,
    banner_image: event.bannerImage || "",
    status: event.status || "upcoming",
    average_rating: event.averageRating ?? 5.0,
    review_count: event.reviewCount ?? 0,
  };
}

/**
 * Map camelCase Registration to snake_case Postgres columns
 */
export function serializeRegistrationForDb(reg: Partial<Registration>): any {
  return {
    id: reg.id,
    event_id: reg.eventId,
    user_id: reg.userId,
    user_roll_no: reg.userRollNo,
    user_name: reg.userName,
    department: reg.department,
    registered_at: reg.registeredAt || new Date().toISOString(),
    status: reg.status || "confirmed",
    is_team: Boolean(reg.isTeam),
    team_name: reg.teamName || null,
    team_members: reg.teamMembers || null,
  };
}

/**
 * Map camelCase AttendanceRecord to snake_case Postgres columns
 */
export function serializeAttendanceForDb(att: Partial<AttendanceRecord>): any {
  return {
    id: att.id,
    event_id: att.eventId,
    event_title: att.eventTitle,
    user_id: att.userId,
    user_name: att.userName,
    user_roll_no: att.userRollNo,
    department: att.department,
    timestamp: att.timestamp || new Date().toISOString(),
    punch_in_time: att.punchInTime || att.timestamp || new Date().toISOString(),
    punch_out_time: att.punchOutTime || null,
    verified_method: att.verifiedMethod || "qr_scan",
    token_used: att.tokenUsed || "GSFC-TOKEN-VERIFIED",
    certificate_id: att.certificateId || null,
    user_latitude: att.userLatitude || null,
    user_longitude: att.userLongitude || null,
    distance_from_venue_meters: att.distanceFromVenueMeters || null,
    location_verified: att.locationVerified ?? true,
    synced: true,
  };
}

/**
 * Map camelCase NewRegisteredStudent to snake_case Postgres columns
 */
export function serializeStudentForDb(student: Partial<NewRegisteredStudent>): any {
  return {
    id: student.id,
    full_name: student.fullName,
    mobile_number: student.mobileNumber,
    roll_no: student.rollNo,
    email: student.email,
    school: student.school,
    department: student.department,
    degree: student.degree || "B.Tech",
    semester: student.semester ?? 4,
    residence_type: student.residenceType || "dayscholar",
    hostel_block_or_bus_route: student.hostelBlockOrBusRoute || null,
    clubs_interested: student.clubsInterested || [],
    id_card_uploaded: student.idCardUploaded ?? true,
    is_locked: student.isLocked ?? true,
    verified_by_university: student.verifiedByUniversity ?? true,
    created_at: student.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Map camelCase CampusAnnouncement to snake_case Postgres columns
 */
export function serializeAnnouncementForDb(ann: Partial<CampusAnnouncement>): any {
  return {
    id: ann.id,
    title: ann.title,
    content: ann.content,
    category: ann.category,
    author_name: ann.authorName,
    author_role: ann.authorRole,
    department_target: ann.departmentTarget,
    priority: ann.priority || "normal",
    read_by: ann.readBy || [],
    created_at: ann.createdAt || new Date().toISOString(),
  };
}
