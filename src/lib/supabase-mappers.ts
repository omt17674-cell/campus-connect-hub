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
  // Supabase check constraint: [ 'upcoming', 'completed', 'cancelled', 'pending_approval', 'live' ]
  let normalizedStatus: string = event.status || "upcoming";
  if (normalizedStatus === "published") {
    normalizedStatus = "upcoming";
  }
  if (!["upcoming", "completed", "cancelled", "pending_approval", "live"].includes(normalizedStatus)) {
    normalizedStatus = "upcoming";
  }

  return {
    id: event.id,
    title: event.title,
    description: event.description || "",
    category: event.category,
    department: event.department,
    date: event.date,
    time: event.time,
    venue: event.venue,
    venue_latitude: event.venueLatitude ?? 22.3685,
    venue_longitude: event.venueLongitude ?? 73.1895,
    allowed_radius_meters: event.allowedRadiusMeters ?? 350,
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
    status: normalizedStatus,
    average_rating: event.averageRating ?? 5.0,
    review_count: event.reviewCount ?? 0,
  };
}

/**
 * Map camelCase Registration to snake_case Postgres columns
 */
export function serializeRegistrationForDb(reg: Partial<Registration>): any {
  // Supabase check constraint: [ 'confirmed', 'cancelled', 'waitlisted', 'attended' ]
  let regStatus = reg.status || "confirmed";
  if (!["confirmed", "cancelled", "waitlisted", "attended"].includes(regStatus)) {
    regStatus = "confirmed";
  }

  return {
    id: reg.id,
    event_id: reg.eventId,
    user_id: reg.userId,
    user_roll_no: reg.userRollNo,
    user_name: reg.userName,
    department: reg.department,
    registered_at: reg.registeredAt || new Date().toISOString(),
    status: regStatus,
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
    accuracy_meters: att.accuracyMeters || null,
    distance_from_venue_meters: att.distanceFromVenueMeters || null,
    location_verified: att.locationVerified ?? true,
    synced: true,
  };
}

/**
 * Map account object to exact columns supported by Supabase `accounts` table
 * (id, roll_no, email, password_hash, role, department, semester, mobile_number, avatar, is_verified, created_at, updated_at)
 */
export function serializeAccountForDb(acc: any): any {
  const cleanRoll = (acc.roll_no || acc.rollNo || acc.idOrRoll || "").trim().toUpperCase();
  const id = acc.id || (cleanRoll ? `u-${cleanRoll.toLowerCase()}` : `u-student-${Date.now()}`);
  return {
    id,
    roll_no: cleanRoll || "24BT04171",
    email: acc.email || (cleanRoll ? `${cleanRoll.toLowerCase()}@gsfcuniversity.ac.in` : "student@gsfcuniversity.ac.in"),
    password_hash: acc.password_hash || acc.passwordHash || "$2b$10$defaultHashPlaceholder",
    role: acc.role || "student",
    department: acc.department || "Computer Science & Engineering",
    semester: typeof acc.semester === "number" ? acc.semester : 4,
    mobile_number: acc.mobile_number || acc.mobileNumber || null,
    avatar: acc.avatar || (cleanRoll ? cleanRoll.slice(0, 2).toUpperCase() : "ST"),
    is_verified: acc.is_verified ?? acc.isVerified ?? true,
    created_at: acc.created_at || acc.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
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

/**
 * Internship System Mappers
 */
export function serializeInternshipForDb(intn: any): any {
  return {
    id: intn.id,
    title: intn.title,
    company_name: intn.companyName,
    description: intn.description,
    department: intn.department,
    skills_required: intn.skillsRequired || [],
    eligibility: intn.eligibility,
    positions: intn.positions ?? 1,
    location: intn.location,
    mode: intn.mode,
    start_date: intn.startDate,
    end_date: intn.endDate,
    duration: intn.duration,
    stipend: intn.stipend,
    working_hours: intn.workingHours,
    contact_person: intn.contactPerson,
    contact_email: intn.contactEmail,
    application_deadline: intn.applicationDeadline,
    required_documents: intn.requiredDocuments || [],
    status: intn.status || "open",
    created_by: intn.createdBy || null,
    created_at: intn.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function deserializeInternshipFromDb(d: any): any {
  return {
    id: d.id,
    title: d.title,
    companyName: d.company_name,
    description: d.description || "",
    department: d.department || "",
    skillsRequired: d.skills_required || [],
    eligibility: d.eligibility || "",
    positions: d.positions ?? 1,
    location: d.location || "",
    mode: d.mode || "On-site",
    startDate: d.start_date,
    endDate: d.end_date,
    duration: d.duration || "",
    stipend: d.stipend || "",
    workingHours: d.working_hours || "",
    contactPerson: d.contact_person || "",
    contactEmail: d.contact_email || "",
    applicationDeadline: d.application_deadline,
    requiredDocuments: d.required_documents || [],
    status: d.status || "open",
    createdBy: d.created_by,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export function serializeInternshipApplicationForDb(app: any): any {
  return {
    id: app.id,
    application_number: app.applicationNumber,
    internship_id: app.internshipId,
    student_id: app.studentId,
    full_name: app.fullName,
    enrollment_number: app.enrollmentNumber,
    email: app.email,
    phone: app.phone,
    course: app.course,
    branch: app.branch,
    semester: app.semester,
    cgpa: app.cgpa,
    tenth_percentage: app.tenthPercentage,
    twelfth_percentage: app.twelfthPercentage,
    backlogs: app.backlogs ?? 0,
    academic_details: app.academicDetails || {},
    address: app.address || {},
    skills: app.skills || [],
    projects: app.projects || "",
    experience: app.experience || "",
    why_internship: app.whyInternship || "",
    career_objective: app.careerObjective || "",
    cover_letter: app.coverLetter || "",
    resume_url: app.resumeUrl || null,
    college_id_url: app.collegeIdUrl || null,
    documents: app.documents || [],
    declaration_accepted: app.declarationAccepted ?? true,
    status: app.status || "ADMIN_REVIEW",
    admin_reviewed_by: app.adminReviewedBy || null,
    admin_reviewed_at: app.adminReviewedAt || null,
    admin_comment: app.adminComment || null,
    dean_reviewed_by: app.deanReviewedBy || null,
    dean_reviewed_at: app.deanReviewedAt || null,
    dean_comment: app.deanComment || null,
    approved_at: app.approvedAt || null,
    rejected_at: app.rejectedAt || null,
    rejection_reason: app.rejectionReason || null,
    created_at: app.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function deserializeInternshipApplicationFromDb(d: any): any {
  return {
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
    cgpa: Number(d.cgpa),
    tenthPercentage: d.tenth_percentage ? Number(d.tenth_percentage) : undefined,
    twelfthPercentage: d.twelfth_percentage ? Number(d.twelfth_percentage) : undefined,
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
    declarationAccepted: Boolean(d.declaration_accepted),
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
  };
}

export function serializeInternshipAttendanceForDb(att: any): any {
  return {
    id: att.id,
    application_id: att.applicationId,
    student_id: att.studentId,
    internship_id: att.internshipId,
    attendance_date: att.attendanceDate,
    punch_in_time: att.punchInTime,
    punch_in_latitude: att.punchInLatitude,
    punch_in_longitude: att.punchInLongitude,
    punch_in_accuracy: att.punchInAccuracy,
    punch_in_address: att.punchInAddress,
    punch_out_time: att.punchOutTime || null,
    punch_out_latitude: att.punchOutLatitude || null,
    punch_out_longitude: att.punchOutLongitude || null,
    punch_out_accuracy: att.punchOutAccuracy || null,
    punch_out_address: att.punchOutAddress || null,
    working_duration: att.workingDuration || null,
    status: att.status || "present",
    created_at: att.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function deserializeInternshipAttendanceFromDb(d: any): any {
  return {
    id: d.id,
    applicationId: d.application_id,
    studentId: d.student_id,
    internshipId: d.internship_id,
    attendanceDate: d.attendance_date,
    punchInTime: d.punch_in_time,
    punchInLatitude: Number(d.punch_in_latitude),
    punchInLongitude: Number(d.punch_in_longitude),
    punchInAccuracy: Number(d.punch_in_accuracy),
    punchInAddress: d.punch_in_address,
    punchOutTime: d.punch_out_time,
    punchOutLatitude: d.punch_out_latitude ? Number(d.punch_out_latitude) : undefined,
    punchOutLongitude: d.punch_out_longitude ? Number(d.punch_out_longitude) : undefined,
    punchOutAccuracy: d.punch_out_accuracy ? Number(d.punch_out_accuracy) : undefined,
    punchOutAddress: d.punch_out_address,
    workingDuration: d.working_duration,
    status: d.status,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

