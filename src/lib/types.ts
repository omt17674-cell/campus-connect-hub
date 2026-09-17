export type UserRole = "student" | "organizer" | "admin";

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
  distanceFromVenueMeters?: number;
  locationVerified?: boolean;
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
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
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
