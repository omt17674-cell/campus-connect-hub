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
  verifiedMethod: "qr_scan" | "manual_admin" | "offline_sync" | "live_punch";
  tokenUsed: string;
  synced: boolean;
  certificateId: string;
  userLatitude?: number;
  userLongitude?: number;
  distanceFromVenueMeters?: number;
  locationVerified?: boolean;
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
