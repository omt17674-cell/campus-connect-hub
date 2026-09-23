export type UserRole =
  | "student"
  | "faculty"
  | "faculty_mentor"
  | "internship_mentor"
  | "organizer"
  | "tpc"
  | "admin"
  | "dean"
  | "management"
  | "security"
  | "super_admin";

export type FacultyCapability = "faculty" | "faculty_mentor" | "internship_mentor";


export type Language = "en" | "gu" | "hi";

export interface UserProfile {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  role: UserRole;
  department: string;
  semester: number;
  avatar: string;
  points: number;
  streakDays: number;
  volunteerHours: number;
  attendanceRate: number; // percentage, e.g. 86
  badges: string[]; // Badge IDs
  isVerified?: boolean;
  mobileNumber?: string;
  school?: string;
  degree?: string;
  residenceType?: "hostel" | "dayscholar";
  hostelBlockOrBusRoute?: string;
  clubsInterested?: string[];
  bloodGroup?: string;
}

export type EventCategory = 
  | "Tech" 
  | "Culture" 
  | "Sports" 
  | "Leadership" 
  | "Academic" 
  | "Career" 
  | "Workshop";

export type EventStatus = "upcoming" | "live" | "completed" | "cancelled" | "pending_approval" | "rejected";

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  department: string; // e.g., "Computer Science", "All Departments"
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM - 01:00 PM"
  venue: string;
  organizerName: string;
  organizerEmail: string;
  capacity: number;
  registeredCount: number;
  waitlistCount: number;
  approvalRequired: boolean;
  isTeamEvent: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
  volunteerHoursReward?: number;
  bannerImage: string;
  status: EventStatus;
  currentQrToken?: string;
  qrExpiresAt?: number; // timestamp
  averageRating?: number;
  reviewCount?: number;
  rules?: string[];
  requireLiveLocation?: boolean;
  venueLatitude?: number; // GSFC University coordinates e.g. 22.3685
  venueLongitude?: number; // e.g. 73.1895
  allowedRadiusMeters?: number; // default 350m
  certificatesReleased?: boolean; // Admin release grant
}

export interface TeamMember {
  name: string;
  rollNo: string;
  email: string;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userRollNo: string;
  userName: string;
  department: string;
  registeredAt: string;
  status: "confirmed" | "waitlisted" | "pending_approval" | "rejected" | "attended" | "punched_in" | "punched_out";
  isTeam: boolean;
  teamName?: string;
  teamMembers?: TeamMember[];
  punchInTime?: string;
  punchOutTime?: string;
  punchInLocation?: { latitude: number; longitude: number; distanceMeters: number; verified: boolean };
  punchOutLocation?: { latitude: number; longitude: number; distanceMeters: number; verified: boolean };
  certificateUnlocked?: boolean;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userRollNo: string;
  department: string;
  timestamp: string;
  punchInTime?: string;
  punchOutTime?: string;
  verifiedMethod: "qr_scan" | "manual_admin" | "offline_sync" | "live_punch" | "unified_otp_barcode";
  tokenUsed: string;
  synced: boolean;
  certificateId?: string;
  certificateUnlocked?: boolean;
  userLatitude?: number;
  userLongitude?: number;
  accuracyMeters?: number;
  distanceFromVenueMeters?: number;
  locationVerified?: boolean;
  locationAddress?: string;
  mobileNumber?: string;
  otpVerified?: boolean;
  barcodeScanned?: boolean;
  barcodeValue?: string;
  vehicleId?: string;
  vehicleNumber?: string;
}

export type VehicleType = "2_wheeler" | "4_wheeler" | "ev" | "commercial";

export interface VehicleRecord {
  id: string;
  vehicleNumber: string; // e.g. GJ-06-AB-1234
  vehicleType: VehicleType;
  ownerType: "student" | "faculty" | "visitor";
  ownerName: string;
  ownerContact: string;
  ownerRollOrVisitorId: string;
  parkingBay: string; // e.g. "Zone A - South Gate", "Zone B - Student Parking", "VIP Bay - Admin Block"
  entryTime: string;
  exitTime?: string;
  status: "parked" | "exited";
  gatePassId: string;
  verifiedBy: string;
}

export interface VisitorRecord {
  id: string; // e.g. VIS-2026-00125
  fullName: string;
  mobile: string;
  email?: string;
  organization: string; // e.g. "Tata Consultancy Services", "L&T Ltd.", "Guest Speaker"
  purpose: "Campus Event Attendance" | "Placement & Industry Meeting" | "Guest Lecture / Workshop" | "Official Campus Visit" | "Vendor / Contractor";
  personToMeet: string; // e.g. "Prof. Rajiv Mehta (TPC)", "Dr. Ananya Sharma (Dean)", "Dr. Suresh Rao"
  departmentToMeet: string;
  idProofType: "Aadhaar Card" | "Driving License" | "Voter ID / Gov ID" | "Corporate Work ID" | "Passport";
  idProofNumber?: string;
  otpVerified: boolean;
  otpVerifiedAt?: string;
  locationVerified: boolean;
  userLatitude?: number;
  userLongitude?: number;
  distanceMeters?: number;
  entryTime: string;
  exitTime?: string;
  status: "active" | "exited";
  hasVehicle: boolean;
  vehicleId?: string;
  vehicleNumber?: string;
  vehicleType?: VehicleType;
  qrPassCode: string;
  assignedEventId?: string;
  assignedEventTitle?: string;
}

export interface PendingCheckin {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userRollNo: string;
  userName: string;
  department: string;
  timestamp: string;
  token: string;
  retryCount: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "attendance" | "engagement" | "leadership" | "volunteer";
  unlocked: boolean;
  earnedDate?: string;
  xpBonus: number;
}

export interface EventFeedback {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userRollNo?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface EventBroadcast {
  id: string;
  eventId: string;
  eventTitle: string;
  authorName: string;
  message: string;
  priority: "high" | "normal" | "urgent";
  createdAt: string;
}

export interface ActivityPointsCategory {
  earned: number;
  max: number;
  color: string;
  label: string;
  iconName: string;
}

export interface ActivityPointsBreakdown {
  technical: ActivityPointsCategory;
  cultural: ActivityPointsCategory;
  sports: ActivityPointsCategory;
  social: ActivityPointsCategory;
  totalEarned: number;
  totalMax: number;
  percentage: number;
}

export interface NotificationItem {
  id: string;
  userId?: string; // empty means all or role-specific
  title: string;
  message: string;
  type: "reminder" | "approval" | "alert" | "achievement" | "sync";
  timestamp: string;
  read: boolean;
  eventId?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;
  target: string;
  timestamp: string;
  details: string;
}

// ==========================================
// CAMPUS PLATFORM 360 EXTENSIONS
// ==========================================

export type ClubCategory = "Technical" | "Cultural" | "Sports" | "Social & NSS" | "Entrepreneurship" | "Literary";

export interface Club {
  id: string;
  name: string;
  category: ClubCategory;
  department: string;
  description: string;
  bannerImage: string;
  logo: string;
  facultyCoordinator: {
    name: string;
    email: string;
    department: string;
  };
  studentLead: {
    name: string;
    rollNo: string;
    email: string;
  };
  memberCount: number;
  meetingSchedule: string;
  foundedYear: number;
  status: "active" | "recruiting" | "inactive";
  tags: string[];
}

export interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  userName: string;
  userRollNo: string;
  department: string;
  role: "member" | "committee" | "lead" | "coordinator";
  joinedAt: string;
  status: "active" | "pending_approval";
  volunteerHoursEarned: number;
}

export interface ClubActivity {
  id: string;
  clubId: string;
  clubName: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  isPublicEvent: boolean;
  attendanceCount: number;
}

export interface VerifiedAchievement {
  id: string;
  userId: string;
  userName: string;
  userRollNo: string;
  title: string;
  category: "technical" | "hackathon" | "cultural" | "sports" | "leadership" | "volunteering";
  eventOrActivityName: string;
  issuingAuthority: string;
  dateEarned: string;
  certificateId?: string;
  verificationHash: string;
  qrCodePayload: string;
  verifiedBy: string;
  badgeIcon: string;
  description: string;
}

export interface CampusAnnouncement {
  id: string;
  title: string;
  content: string;
  category: "university" | "department" | "club" | "placement" | "emergency";
  authorName: string;
  authorRole: string;
  departmentTarget?: string; // "all" or specific
  priority: "normal" | "important" | "emergency";
  createdAt: string;
  expiresAt?: string;
  readBy: string[]; // user IDs
}

export interface CampusService {
  id: string;
  name: string;
  category: "academic" | "administrative" | "facility" | "student_support" | "emergency";
  location: string;
  roomNumber: string;
  building: string;
  openingHours: string;
  headPerson: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  iconName: string;
}

export interface DigitalStudentIdCard {
  rollNo: string;
  name: string;
  program: string;
  department: string;
  semester: number;
  validTill: string;
  bloodGroup: string;
  qrVerificationCode: string;
  barcode: string;
  photoUrl: string;
  status: "active" | "suspended" | "expired";
}

export interface NewRegisteredStudent {
  id: string;
  fullName: string;
  mobileNumber: string;
  rollNo: string;
  email: string;
  school: string;
  department: string;
  degree: string;
  semester: number;
  residenceType: "hostel" | "dayscholar";
  hostelBlockOrBusRoute?: string;
  clubsInterested: string[];
  idCardUploaded: boolean;
  isLocked: boolean;
  verifiedByUniversity: boolean;
  isVerified?: boolean;
  createdAt: string;
}

export interface AssistantMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  suggestions?: string[];
  actionLink?: { label: string; view: string; eventId?: string };
}

// ==========================================
// INTERNSHIP SYSTEM TYPES
// ==========================================

export type InternshipMode = "On-site" | "Remote" | "Hybrid";

export type InternshipStatus = "open" | "closed" | "draft";

export type InternshipApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "ADMIN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CHANGES_REQUESTED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export interface Internship {
  id: string;
  title: string;
  companyName: string;
  description: string;
  department: string;
  skillsRequired: string[];
  eligibility: string;
  positions: number;
  location: string;
  mode: InternshipMode;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  duration: string;
  stipend: string;
  workingHours: string;
  contactPerson: string;
  contactEmail: string;
  applicationDeadline: string;
  requiredDocuments: string[];
  status: InternshipStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InternshipApplication {
  id: string;
  applicationNumber: string; // e.g. INT-2026-000001
  internshipId: string;
  studentId: string;
  fullName: string;
  enrollmentNumber: string;
  email: string;
  phone: string;
  course: string;
  branch: string;
  semester: number;
  cgpa: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  backlogs?: number;
  academicDetails?: Record<string, any>;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  skills: string[];
  projects?: string;
  experience?: string;
  whyInternship?: string;
  careerObjective?: string;
  coverLetter?: string;
  resumeUrl?: string;
  collegeIdUrl?: string;
  documents?: Array<{ name: string; url: string; type: string }>;
  declarationAccepted: boolean;
  status: InternshipApplicationStatus;
  adminReviewedBy?: string;
  adminReviewedAt?: string;
  adminComment?: string;
  deanReviewedBy?: string;
  deanReviewedAt?: string;
  deanComment?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InternshipAttendanceRecord {
  id: string;
  applicationId: string;
  studentId: string;
  internshipId: string;
  attendanceDate: string; // YYYY-MM-DD
  punchInTime: string; // ISO string
  punchInLatitude: number;
  punchInLongitude: number;
  punchInAccuracy: number;
  punchInAddress: string;
  punchOutTime?: string; // ISO string
  punchOutLatitude?: number;
  punchOutLongitude?: number;
  punchOutAccuracy?: number;
  punchOutAddress?: string;
  workingDuration?: string; // e.g. "8h 09m"
  status: "present" | "half_day" | "auto_closed";
  createdAt: string;
  updatedAt?: string;
}

export interface InternshipApprovalRecord {
  id: string;
  applicationId: string;
  approvalType: "ADMIN" | "DEAN";
  approvedBy: string;
  status: "approved" | "rejected" | "changes_requested";
  comment?: string;
  approvedAt: string;
  createdAt: string;
}

export interface InternshipNotification {
  id: string;
  studentId: string;
  applicationId?: string;
  type: "submitted" | "admin_approved" | "dean_approved" | "rejected" | "changes_requested" | "active" | "punch";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ==========================================
// MASTER DATA SYSTEM TYPES
// ==========================================

export interface AcademicYearMaster {
  id: string;
  yearName: string; // e.g. "2025-2026"
  isCurrent: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

export interface DepartmentMaster {
  id: string;
  code: string; // e.g. "CSE", "CHE"
  name: string;
  school: string; // e.g. "School of Technology"
  createdAt?: string;
}

export interface CourseMaster {
  id: string;
  code: string; // e.g. "BTECH", "BBA"
  name: string;
  departmentId?: string;
  durationYears: number;
  createdAt?: string;
}

export interface BranchMaster {
  id: string;
  code: string;
  name: string;
  departmentId?: string;
  createdAt?: string;
}

export interface SemesterMaster {
  id: string;
  semesterNumber: number; // 1 to 8
  academicYearId?: string;
  departmentId?: string;
  field?: string;
  createdAt?: string;
}

export interface FieldMaster {
  id: string;
  name: string; // e.g. "Artificial Intelligence", "Process Engineering"
  departmentId?: string;
  createdAt?: string;
}

export interface CompanyMaster {
  id: string;
  name: string;
  industry: string;
  contactPerson?: string;
  contactEmail?: string;
  phone?: string;
  location?: string;
  website?: string;
  createdAt?: string;
}

// ==========================================
// FACULTY & INTERNSHIP MENTORSHIP TYPES
// ==========================================

export interface FacultyMentorAssignment {
  id: string;
  facultyId: string;
  facultyName?: string;
  facultyEmail?: string;
  facultyDepartment?: string;
  facultyDesignation?: string;
  studentId: string;
  studentName?: string;
  studentRollNo?: string;
  studentEmail?: string;
  academicYear: string;
  semester: number;
  department: string;
  field?: string;
  assignedBy: string;
  assignedAt: string;
  status: "active" | "reassigned" | "completed" | "removed";
  notes?: string;
}

export interface InternshipMentorAssignment {
  id: string;
  facultyId: string;
  facultyName?: string;
  facultyEmail?: string;
  studentId: string;
  studentName?: string;
  studentRollNo?: string;
  internshipId?: string;
  internshipTitle?: string;
  companyName?: string;
  academicYear: string;
  semester: number;
  department: string;
  field?: string;
  assignedBy: string;
  assignedAt: string;
  status: "active" | "completed" | "removed";
  remarks?: string;
}

export interface MentorMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "mentor" | "student" | "internship_mentor" | "management";
  receiverId: string;
  studentId: string;
  facultyId: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  readAt?: string;
  status: "sent" | "delivered" | "read";
}

export type MentorshipTaskStatus = "Pending" | "In Progress" | "Submitted" | "Completed" | "Overdue";

export interface MentorshipTask {
  id: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "urgent";
  studentId: string;
  mentorId: string;
  mentorName?: string;
  studentName?: string;
  studentRollNo?: string;
  status: MentorshipTaskStatus;
  feedback?: string;
  submissionText?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MentorshipNote {
  id: string;
  facultyId: string;
  studentId: string;
  title: string;
  notes: string;
  noteType: "general" | "academic" | "attendance" | "internship" | "disciplinary";
  isConfidential: boolean;
  createdAt: string;
}

export interface ManagementAuditLog {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole?: string;
  targetType: string;
  targetId?: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface UnifiedStudentHistory {
  student: NewRegisteredStudent | UserProfile;
  facultyMentor?: FacultyMentorAssignment;
  internshipMentor?: InternshipMentorAssignment;
  attendanceRate: number;
  totalAttendanceRecords: number;
  tasks: MentorshipTask[];
  messages: MentorMessage[];
  notes: MentorshipNote[];
  internships: {
    application?: InternshipApplication;
    internship?: Internship;
    attendance: InternshipAttendanceRecord[];
    approvalLogs: InternshipApprovalRecord[];
  }[];
  academicSummary: {
    currentSemester: number;
    department: string;
    school: string;
    degree: string;
    volunteerHours: number;
    points: number;
  };
}

// ==========================================
// INSTITUTIONAL GOVERNANCE & PERMISSIONS TYPES
// ==========================================

export type GranularPermission =
  | "VIEW_STUDENTS"
  | "EDIT_STUDENTS"
  | "VIEW_FACULTY"
  | "EDIT_FACULTY"
  | "ASSIGN_FACULTY_MENTOR"
  | "ASSIGN_INTERNSHIP_MENTOR"
  | "VIEW_INTERNSHIPS"
  | "CREATE_INTERNSHIP"
  | "EDIT_INTERNSHIP"
  | "APPROVE_INTERNSHIP"
  | "VIEW_ATTENDANCE"
  | "VIEW_INTERNSHIP_ATTENDANCE"
  | "VIEW_MENTORSHIP"
  | "CREATE_MENTOR_TASK"
  | "SEND_MENTOR_MESSAGE"
  | "VIEW_REPORTS"
  | "EXPORT_REPORTS"
  | "MANAGE_MASTER_DATA"
  | "MANAGE_USERS"
  | "MANAGE_ROLES"
  | "MANAGE_PERMISSIONS"
  | "VIEW_AUDIT_LOGS"
  | "MANAGE_SYSTEM_SETTINGS";

export type PermissionScope = "global" | "assigned" | "self" | "limited" | "none";

export interface RolePermissionDefinition {
  id: string;
  role: UserRole;
  permission: GranularPermission;
  scope: PermissionScope;
  createdAt?: string;
}

export interface UserPermissionOverride {
  id: string;
  userId: string;
  permission: GranularPermission;
  isGranted: boolean;
  scope: PermissionScope;
  grantedBy?: string;
  grantedAt?: string;
}

export interface ManagementKPIs {
  totalStudents: number;
  totalFaculty: number;
  facultyMentorsCount: number;
  internshipMentorsCount: number;
  administratorsCount: number;
  totalInternships: number;
  totalApplications: number;
  activeInterns: number;
  completedInternships: number;
  activeMentorAssignments: number;
  unassignedStudentsCount: number;
  pendingApprovals: number;
  pendingTasks: number;
  unreadMessages: number;
  attendanceAlertsCount: number;
  lastUpdated?: string;
}

export interface FacultyRecord {
  id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  department: string;
  designation: string;
  specialization?: string;
  status: "active" | "inactive" | "on_leave";
  isFacultyMentor: boolean;
  isInternshipMentor: boolean;
  assignedStudentCount: number;
  pendingTasks: number;
  activeTasks: number;
  roles?: UserRole[];
  permissions?: GranularPermission[];
}

export interface Faculty360Profile {
  faculty: FacultyRecord;
  roles: UserRole[];
  permissions: { permission: GranularPermission; scope: PermissionScope }[];
  assignedStudents: {
    id: string;
    studentId: string;
    studentName: string;
    studentRollNo: string;
    department: string;
    semester: number;
    academicYear: string;
    field?: string;
    type: "faculty_mentor" | "internship_mentor";
    assignedAt: string;
    status: string;
  }[];
  tasks: MentorshipTask[];
  tasksCompletedCount: number;
  tasksPendingCount: number;
  messages: MentorMessage[];
  supervisedInternships: {
    id: string;
    title: string;
    companyName: string;
    department: string;
    status: string;
    activeInternsCount: number;
  }[];
  mentorshipNotes: MentorshipNote[];
  activityLogs: ManagementAuditLog[];
}

export interface SystemDataDomain {
  domain: string;
  databaseTable: string;
  purpose: string;
  recordCount: number;
  lastUpdated: string;
  accessScope: string;
}

export interface FacultyWorkloadItem {
  facultyId: string;
  facultyName: string;
  department: string;
  designation: string;
  facultyMenteesCount: number;
  internshipMenteesCount: number;
  tasksAssignedCount: number;
  tasksPendingCount: number;
  tasksCompletedCount: number;
  messagesSentCount: number;
  activeInternshipsSupervisedCount: number;
}

export interface AccessMatrixItem {
  userId: string;
  userName: string;
  role: UserRole;
  department: string;
  module: string;
  permission: GranularPermission;
  scope: PermissionScope;
  status: "active" | "revoked" | "custom";
}




