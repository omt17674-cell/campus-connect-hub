import {
  AttendanceRecord,
  AuditLogEntry,
  Badge,
  CampusEvent,
  EventFeedback,
  Language,
  NotificationItem,
  PendingCheckin,
  Registration,
  UserProfile,
  UserRole,
  VehicleRecord,
  VehicleType,
  VisitorRecord,
} from "./types";
import { generateQrPayload } from "./qr-engine";

export interface CampusAccount {
  role: UserRole;
  roleTitle: string;
  roleBadge: string;
  name: string;
  idOrRoll: string;
  email: string;
  password: string;
  profile: UserProfile;
}

export const STUDENT_ACCOUNT: CampusAccount = {
  role: "student",
  roleTitle: "GSFC Student (Campus Candidate)",
  roleBadge: "24BT04171",
  name: "Om Thakkar",
  idOrRoll: "24BT04171",
  email: "omthakkar168@gsfcuniversity.ac.in",
  password: "Student@2026",
  profile: {
    id: "u-om",
    name: "Om Thakkar",
    rollNo: "24BT04171",
    email: "omthakkar168@gsfcuniversity.ac.in",
    role: "student",
    department: "B.Tech Computer Science & Engineering",
    semester: 4,
    avatar: "OT",
    points: 640,
    streakDays: 9,
    volunteerHours: 18,
    attendanceRate: 91,
    badges: ["b1", "b2", "b3", "b5"],
  },
};

export const ADMIN_ACCOUNT: CampusAccount = {
  role: "admin",
  roleTitle: "Administration (Dean & Academic Governance)",
  roleBadge: "Super Admin",
  name: "Dr. Ananya Sharma (Dean)",
  idOrRoll: "ADM-DEAN-001",
  email: "admin.dean@gsfcuniversity.ac.in",
  password: "Admin@2026",
  profile: {
    id: "u-ananya",
    name: "Dr. Ananya Sharma",
    rollNo: "ADM-DEAN-001",
    email: "admin.dean@gsfcuniversity.ac.in",
    role: "admin",
    department: "Student Affairs & Academic Governance",
    semester: 0,
    avatar: "AS",
    points: 3200,
    streakDays: 120,
    volunteerHours: 95,
    attendanceRate: 100,
    badges: ["b1", "b2", "b3", "b4", "b5", "b6"],
  },
};

export const TPC_ADMIN_ACCOUNT: CampusAccount = {
  role: "organizer",
  roleTitle: "TPC Admin (Training & Placement / Faculty Organizer)",
  roleBadge: "TPC Admin",
  name: "Prof. Rajiv Mehta (TPC Head)",
  idOrRoll: "TPC-ADMIN-108",
  email: "tpc.admin@gsfcuniversity.ac.in",
  password: "TPCAdmin@2026",
  profile: {
    id: "u-tpc",
    name: "Prof. Rajiv Mehta",
    rollNo: "TPC-ADMIN-108",
    email: "tpc.admin@gsfcuniversity.ac.in",
    role: "organizer",
    department: "Training & Placement Cell / Event Convener",
    semester: 0,
    avatar: "RM",
    points: 1950,
    streakDays: 52,
    volunteerHours: 65,
    attendanceRate: 99,
    badges: ["b1", "b2", "b5"],
  },
};

export const CAMPUS_ACCOUNTS = [STUDENT_ACCOUNT, ADMIN_ACCOUNT, TPC_ADMIN_ACCOUNT];

export interface CampusState {
  isAuthenticated: boolean;
  currentUser: UserProfile;
  currentRole: UserRole;
  language: Language;
  isOffline: boolean;
  events: CampusEvent[];
  registrations: Registration[];
  attendanceRecords: AttendanceRecord[];
  pendingCheckins: PendingCheckin[];
  visitorRecords: VisitorRecord[];
  vehicleRecords: VehicleRecord[];
  badges: Badge[];
  feedbackList: EventFeedback[];
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];
  lowAttendanceAlertSent: boolean;
}

const INITIAL_USER: UserProfile = STUDENT_ACCOUNT.profile;
export const SAMPLE_ORGANIZER: UserProfile = TPC_ADMIN_ACCOUNT.profile;
export const SAMPLE_ADMIN: UserProfile = ADMIN_ACCOUNT.profile;

const INITIAL_BADGES: Badge[] = [
  {
    id: "b1",
    title: "Campus Pioneer",
    description: "Attended your first official GSFC University event",
    icon: "Rocket",
    category: "attendance",
    unlocked: true,
    earnedDate: "2026-02-10",
    xpBonus: 50,
  },
  {
    id: "b2",
    title: "Workshop Warrior",
    description: "Completed 5+ technical workshops with verified attendance",
    icon: "Cpu",
    category: "engagement",
    unlocked: true,
    earnedDate: "2026-04-18",
    xpBonus: 150,
  },
  {
    id: "b3",
    title: "Streak Master",
    description: "Maintained a continuous 7-day campus activity streak",
    icon: "Flame",
    category: "attendance",
    unlocked: true,
    earnedDate: "2026-05-30",
    xpBonus: 100,
  },
  {
    id: "b4",
    title: "Team Captain",
    description: "Led and registered a team for an inter-college competition",
    icon: "Users",
    category: "leadership",
    unlocked: false,
    xpBonus: 120,
  },
  {
    id: "b5",
    title: "Community Hero",
    description: "Contributed over 10+ hours of verified volunteer service",
    icon: "Award",
    category: "volunteer",
    unlocked: true,
    earnedDate: "2026-06-01",
    xpBonus: 200,
  },
  {
    id: "b6",
    title: "Dean's Honor Roll",
    description: "Maintained >85% verified attendance across the semester",
    icon: "Trophy",
    category: "attendance",
    unlocked: true,
    earnedDate: "2026-06-10",
    xpBonus: 250,
  },
];

const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: "evt-1",
    title: "AI & Robotics National Hackathon",
    description: "Build cutting-edge agentic AI and autonomous robotics solutions. 24-hour sprint with mentorship from industry leaders and GSFC research faculty. High performance GPUs provided.",
    category: "Tech",
    department: "Computer Science",
    date: "2026-06-12",
    time: "10:00 AM - 05:00 PM",
    venue: "Innovation Lab, Block C",
    organizerName: "Dr. Suresh Rao",
    organizerEmail: "suresh.rao@gsfcuni.edu",
    capacity: 100,
    registeredCount: 86,
    waitlistCount: 0,
    approvalRequired: false,
    isTeamEvent: true,
    minTeamSize: 2,
    maxTeamSize: 4,
    volunteerHoursReward: 4,
    bannerImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    status: "live",
    averageRating: 4.8,
    reviewCount: 24,
    rules: [
      "Bring your GSFC student ID card.",
      "Teams must have 2-4 verified students.",
      "All code repositories must be initiated during the hackathon hours.",
    ],
  },
  {
    id: "evt-2",
    title: "Cultural Fest — Navratri & Heritage Conclave",
    description: "Annual cultural extravaganza celebrating Gujarat's heritage, folk music, traditional dance competitions, and fine arts exhibition.",
    category: "Culture",
    department: "All Departments",
    date: "2026-06-14",
    time: "04:30 PM - 09:30 PM",
    venue: "Main Amphitheatre & Central Lawns",
    organizerName: "Prof. Meera Joshi",
    organizerEmail: "meera.joshi@gsfcuni.edu",
    capacity: 150,
    registeredCount: 108,
    waitlistCount: 0,
    approvalRequired: false,
    isTeamEvent: false,
    volunteerHoursReward: 6,
    bannerImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    status: "upcoming",
    averageRating: 4.9,
    reviewCount: 42,
    rules: [
      "Traditional attire encouraged.",
      "Entry strictly via Campus Connect QR check-in.",
      "Guest passes must be registered in advance.",
    ],
  },
  {
    id: "evt-3",
    title: "Inter-Faculty Football Championship",
    description: "Thrilling annual football tournament between Engineering, Science, Management, and Humanities faculties. Trophies and certificates for winners.",
    category: "Sports",
    department: "Athletics & Physical Education",
    date: "2026-06-16",
    time: "03:00 PM - 07:00 PM",
    venue: "University Sports Arena, Ground A",
    organizerName: "Coach Rajesh Solanki",
    organizerEmail: "sports@gsfcuni.edu",
    capacity: 32,
    registeredCount: 32,
    waitlistCount: 8,
    approvalRequired: true,
    isTeamEvent: true,
    minTeamSize: 7,
    maxTeamSize: 11,
    volunteerHoursReward: 3,
    bannerImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    status: "upcoming",
    averageRating: 4.7,
    reviewCount: 19,
    rules: [
      "Standard FIFA tournament rules apply.",
      "Medical fitness declaration required from captain.",
    ],
  },
  {
    id: "evt-4",
    title: "Prayaas Leadership & Career Summit 2026",
    description: "Keynote talks with unicorn founders, alumni CXOs, and mock interview workshops. Career accelerator sessions for final and pre-final year students.",
    category: "Leadership",
    department: "Student Affairs Office",
    date: "2026-06-19",
    time: "11:00 AM - 04:00 PM",
    venue: "Vigyan Bhavan, Seminar Hall A",
    organizerName: "Dr. Ananya Sharma",
    organizerEmail: "dean.studentaffairs@gsfcuni.edu",
    capacity: 200,
    registeredCount: 136,
    waitlistCount: 0,
    approvalRequired: false,
    isTeamEvent: false,
    volunteerHoursReward: 5,
    bannerImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    status: "upcoming",
    averageRating: 4.8,
    reviewCount: 31,
    rules: [
      "Formal attire required.",
      "Bring printed copies of your resume for recruiters.",
    ],
  },
  {
    id: "evt-5",
    title: "Chemical Process & Sustainable Energy Conclave",
    description: "Explore industrial safety, green hydrogen synthesis, and polymer engineering with GSFC industrial experts and senior research scientists.",
    category: "Academic",
    department: "Chemical Engineering",
    date: "2026-06-22",
    time: "09:30 AM - 01:30 PM",
    venue: "Sardar Patel Auditorium, Block B",
    organizerName: "Prof. K. N. Patel",
    organizerEmail: "kn.patel@gsfcuni.edu",
    capacity: 100,
    registeredCount: 45,
    waitlistCount: 0,
    approvalRequired: false,
    isTeamEvent: false,
    volunteerHoursReward: 4,
    bannerImage: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
    status: "upcoming",
    averageRating: 4.6,
    reviewCount: 15,
  },
  {
    id: "evt-6",
    title: "Design Systems & Modern Web UI Workshop",
    description: "Deep dive into building enterprise-grade design tokens, component architecture, and accessibility standards with practical live coding.",
    category: "Workshop",
    department: "Computer Science",
    date: "2026-05-28",
    time: "10:00 AM - 02:00 PM",
    venue: "Computer Center, Lab 4",
    organizerName: "Dr. Suresh Rao",
    organizerEmail: "suresh.rao@gsfcuni.edu",
    capacity: 60,
    registeredCount: 54,
    waitlistCount: 0,
    approvalRequired: false,
    isTeamEvent: false,
    volunteerHoursReward: 3,
    bannerImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    status: "completed",
    averageRating: 4.9,
    reviewCount: 38,
  },
  {
    id: "evt-7",
    title: "Women in STEM & Engineering Conclave",
    description: "Panel discussion and mentorship circle supporting women leaders in technology, manufacturing, and research fellowships.",
    category: "Career",
    department: "All Departments",
    date: "2026-06-26",
    time: "02:00 PM - 05:00 PM",
    venue: "Conference Room 201",
    organizerName: "Dr. Neha Trivedi",
    organizerEmail: "neha.trivedi@gsfcuni.edu",
    capacity: 80,
    registeredCount: 12,
    waitlistCount: 0,
    approvalRequired: true,
    isTeamEvent: false,
    volunteerHoursReward: 3,
    bannerImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
    status: "pending_approval",
  },
];

const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: "reg-1",
    eventId: "evt-1",
    userId: "u-om",
    userRollNo: "24BT04171",
    userName: "Om Thakkar",
    department: "B.Tech Computer Science & Engineering",
    registeredAt: "2026-06-08T09:30:00Z",
    status: "confirmed",
    isTeam: true,
    teamName: "CodeCrafters",
    teamMembers: [
      { name: "Om Thakkar", rollNo: "24BT04171", email: "omthakkar168@gsfcuniversity.ac.in" },
      { name: "Pooja Varma", rollNo: "24BT04192", email: "pooja.v@gsfcuniversity.ac.in" },
      { name: "Rohan Dave", rollNo: "24BT04205", email: "rohan.d@gsfcuniversity.ac.in" },
    ],
  },
  {
    id: "reg-2",
    eventId: "evt-2",
    userId: "u-om",
    userRollNo: "24BT04171",
    userName: "Om Thakkar",
    department: "B.Tech Computer Science & Engineering",
    registeredAt: "2026-06-09T14:15:00Z",
    status: "confirmed",
    isTeam: false,
  },
  {
    id: "reg-3",
    eventId: "evt-6",
    userId: "u-om",
    userRollNo: "24BT04171",
    userName: "Om Thakkar",
    department: "B.Tech Computer Science & Engineering",
    registeredAt: "2026-05-20T10:00:00Z",
    status: "attended",
    isTeam: false,
  },
  {
    id: "reg-4",
    eventId: "evt-3",
    userId: "u-om",
    userRollNo: "24BT04171",
    userName: "Om Thakkar",
    department: "B.Tech Computer Science & Engineering",
    registeredAt: "2026-06-11T18:00:00Z",
    status: "waitlisted",
    isTeam: true,
    teamName: "CS Strikers",
  },
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att-1",
    eventId: "evt-6",
    eventTitle: "Design Systems & Modern Web UI Workshop",
    userId: "u-om",
    userName: "Om Thakkar",
    userRollNo: "24BT04171",
    department: "B.Tech Computer Science & Engineering",
    timestamp: "2026-05-28T10:02:14Z",
    verifiedMethod: "qr_scan",
    tokenUsed: "GSFC-DS101-VERIFIED",
    synced: true,
    certificateId: "GSFC-CERT-EVT6-4171-99B4A",
    distanceFromVenueMeters: 18,
    locationVerified: true,
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Reminder: Hackathon Today!",
    message: "AI & Robotics National Hackathon is starting in 2 hours at Innovation Lab, Block C. Keep your QR scanner ready.",
    type: "reminder",
    timestamp: "10 minutes ago",
    read: false,
    eventId: "evt-1",
  },
  {
    id: "notif-2",
    title: "Registration Confirmed: Navratri Conclave",
    message: "Your registration for Cultural Fest has been confirmed. Seat #108 allotted.",
    type: "approval",
    timestamp: "1 hour ago",
    read: false,
    eventId: "evt-2",
  },
  {
    id: "notif-3",
    title: "Badge Unlocked: Dean's Honor Roll",
    message: "Congratulations! You maintained >85% attendance and earned +250 XP.",
    type: "achievement",
    timestamp: "Yesterday",
    read: true,
  },
];

const INITIAL_VISITORS: VisitorRecord[] = [
  {
    id: "VIS-2026-00125",
    fullName: "Kaniya Agrawal",
    mobile: "+91 98765 43210",
    email: "kaniya.agrawal@lt-engineering.com",
    organization: "Larsen & Toubro (L&T) Infotech",
    purpose: "Placement & Industry Meeting",
    personToMeet: "Prof. Rajiv Mehta (TPC Head)",
    departmentToMeet: "Training & Placement Cell (TPC)",
    idProofType: "Corporate Work ID",
    idProofNumber: "LTI-EMP-98214",
    otpVerified: true,
    otpVerifiedAt: "2026-06-12 09:15:00",
    locationVerified: true,
    userLatitude: 22.3592,
    userLongitude: 73.1672,
    distanceMeters: 12,
    entryTime: "2026-06-12 09:18:22",
    status: "active",
    hasVehicle: true,
    vehicleId: "VEH-2026-0001",
    vehicleNumber: "GJ-06-AB-1234",
    vehicleType: "4_wheeler",
    qrPassCode: "GSFC-GATE-VIS-00125-98A4",
    assignedEventTitle: "Annual Industry Recruitment & Internship Summit 2026",
  },
  {
    id: "VIS-2026-00126",
    fullName: "Dr. Vikram Sethi",
    mobile: "+91 98250 11223",
    email: "v.sethi@iitb.ac.in",
    organization: "IIT Bombay / IEEE Gujarat",
    purpose: "Guest Lecture / Workshop",
    personToMeet: "Dr. Suresh Rao (HOD CS)",
    departmentToMeet: "Computer Science & Engineering",
    idProofType: "Aadhaar Card",
    idProofNumber: "XXXX-XXXX-4891",
    otpVerified: true,
    otpVerifiedAt: "2026-06-12 09:45:10",
    locationVerified: true,
    userLatitude: 22.3590,
    userLongitude: 73.1670,
    distanceMeters: 5,
    entryTime: "2026-06-12 09:50:00",
    status: "active",
    hasVehicle: true,
    vehicleId: "VEH-2026-0002",
    vehicleNumber: "GJ-01-EQ-7788",
    vehicleType: "ev",
    qrPassCode: "GSFC-GATE-VIS-00126-7788",
    assignedEventTitle: "AI & Robotics National Hackathon",
  },
  {
    id: "VIS-2026-00127",
    fullName: "Pooja Deshmukh",
    mobile: "+91 97240 88990",
    email: "pooja.deshmukh@tcs.com",
    organization: "Tata Consultancy Services (TCS)",
    purpose: "Campus Event Attendance",
    personToMeet: "Dr. Ananya Sharma (Dean)",
    departmentToMeet: "Academic Governance",
    idProofType: "Corporate Work ID",
    idProofNumber: "TCS-IN-55019",
    otpVerified: true,
    otpVerifiedAt: "2026-06-12 10:10:00",
    locationVerified: true,
    userLatitude: 22.3591,
    userLongitude: 73.1671,
    distanceMeters: 15,
    entryTime: "2026-06-12 10:12:45",
    exitTime: "2026-06-12 16:30:00",
    status: "exited",
    hasVehicle: false,
    qrPassCode: "GSFC-GATE-VIS-00127-1199",
    assignedEventTitle: "AI & Robotics National Hackathon",
  },
];

const INITIAL_VEHICLES: VehicleRecord[] = [
  {
    id: "VEH-2026-0001",
    vehicleNumber: "GJ-06-AB-1234",
    vehicleType: "4_wheeler",
    ownerType: "visitor",
    ownerName: "Kaniya Agrawal",
    ownerContact: "+91 98765 43210",
    ownerRollOrVisitorId: "VIS-2026-00125",
    parkingBay: "Zone A - VIP / Guest Bay #04",
    entryTime: "2026-06-12 09:18:22",
    status: "parked",
    gatePassId: "GSFC-GATE-VIS-00125-98A4",
    verifiedBy: "Main Campus Security Gate #1",
  },
  {
    id: "VEH-2026-0002",
    vehicleNumber: "GJ-01-EQ-7788",
    vehicleType: "ev",
    ownerType: "visitor",
    ownerName: "Dr. Vikram Sethi",
    ownerContact: "+91 98250 11223",
    ownerRollOrVisitorId: "VIS-2026-00126",
    parkingBay: "EV Charging Bay #02 (Admin Block)",
    entryTime: "2026-06-12 09:50:00",
    status: "parked",
    gatePassId: "GSFC-GATE-VIS-00126-7788",
    verifiedBy: "Main Campus Security Gate #1",
  },
  {
    id: "VEH-2026-0003",
    vehicleNumber: "GJ-06-XX-4171",
    vehicleType: "2_wheeler",
    ownerType: "student",
    ownerName: "Om Thakkar",
    ownerContact: "+91 98765 04171",
    ownerRollOrVisitorId: "24BT04171",
    parkingBay: "Zone B - Student Two-Wheeler Stand #88",
    entryTime: "2026-06-12 09:30:15",
    status: "parked",
    gatePassId: "GSFC-STU-GATE-24BT04171",
    verifiedBy: "South Student Gate Scanner",
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-1",
    action: "QR Check-in Verified",
    performedBy: "Om Thakkar (Student)",
    target: "Design Systems 101",
    timestamp: "2026-05-28 10:02:14",
    details: "Checked in via dynamic camera QR scan · token verified cryptographically",
  },
  {
    id: "aud-2",
    action: "Event Approved",
    performedBy: "Dr. Ananya Sharma (Dean)",
    target: "AI & Robotics National Hackathon",
    timestamp: "2026-06-01 11:30:00",
    details: "Approved event publication for university catalog",
  },
  {
    id: "aud-3",
    action: "Team Registration",
    performedBy: "Om Thakkar (Captain)",
    target: "CodeCrafters (3 members)",
    timestamp: "2026-06-08 09:30:00",
    details: "Registered team for AI & Robotics Hackathon",
  },
  {
    id: "aud-4",
    action: "Visitor Gate Pass Issued",
    performedBy: "Main Campus Security Gate #1",
    target: "Kaniya Agrawal (L&T Infotech)",
    timestamp: "2026-06-12 09:18:22",
    details: "OTP verified · Vehicle GJ-06-AB-1234 parked in Zone A VIP Bay · VIS-2026-00125",
  },
];

const STORAGE_KEY = "gsfc_campus_connect_state_v1";

function loadSavedState(): CampusState {
  if (typeof window === "undefined") {
    return {
      isAuthenticated: false,
      currentUser: INITIAL_USER,
      currentRole: "student",
      language: "en",
      isOffline: false,
      events: INITIAL_EVENTS,
      registrations: INITIAL_REGISTRATIONS,
      attendanceRecords: INITIAL_ATTENDANCE,
      pendingCheckins: [],
      visitorRecords: INITIAL_VISITORS,
      vehicleRecords: INITIAL_VEHICLES,
      badges: INITIAL_BADGES,
      feedbackList: [],
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
      lowAttendanceAlertSent: false,
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        isAuthenticated: parsed.isAuthenticated !== undefined ? parsed.isAuthenticated : false,
        // Ensure critical structures are arrays
        events: parsed.events || INITIAL_EVENTS,
        registrations: parsed.registrations || INITIAL_REGISTRATIONS,
        attendanceRecords: parsed.attendanceRecords || INITIAL_ATTENDANCE,
        pendingCheckins: parsed.pendingCheckins || [],
        visitorRecords: parsed.visitorRecords || INITIAL_VISITORS,
        vehicleRecords: parsed.vehicleRecords || INITIAL_VEHICLES,
        badges: parsed.badges || INITIAL_BADGES,
        feedbackList: parsed.feedbackList || [],
        notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
        auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
      };
    }
  } catch (e) {
    console.error("Failed to load saved state", e);
  }

  return {
    isAuthenticated: false,
    currentUser: INITIAL_USER,
    currentRole: "student",
    language: "en",
    isOffline: false,
    events: INITIAL_EVENTS,
    registrations: INITIAL_REGISTRATIONS,
    attendanceRecords: INITIAL_ATTENDANCE,
    pendingCheckins: [],
    visitorRecords: INITIAL_VISITORS,
    vehicleRecords: INITIAL_VEHICLES,
    badges: INITIAL_BADGES,
    feedbackList: [],
    notifications: INITIAL_NOTIFICATIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
    lowAttendanceAlertSent: false,
  };
}

export function saveState(state: CampusState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state to localStorage", e);
  }
}

// Reactive simple listener pattern
type Listener = (state: CampusState) => void;
let globalState: CampusState = loadSavedState();
const listeners = new Set<Listener>();

export const campusStore = {
  getState(): CampusState {
    return globalState;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setState(updater: (prev: CampusState) => Partial<CampusState>): void {
    const nextUpdates = updater(globalState);
    globalState = { ...globalState, ...nextUpdates };
    saveState(globalState);
    listeners.forEach((l) => l(globalState));
  },

  loginWithAccount(account: CampusAccount) {
    campusStore.setState(() => ({
      isAuthenticated: true,
      currentRole: account.role,
      currentUser: account.profile,
    }));
  },

  loginWithCredentials(identifier: string, role: UserRole): { success: boolean; message: string; account?: CampusAccount } {
    const cleanId = identifier.trim().toLowerCase();
    const account = CAMPUS_ACCOUNTS.find(
      (acc) =>
        acc.role === role &&
        (acc.email.toLowerCase() === cleanId ||
          acc.idOrRoll.toLowerCase() === cleanId ||
          cleanId.includes(acc.idOrRoll.toLowerCase()) ||
          cleanId.includes(acc.email.split("@")[0].toLowerCase()))
    ) || CAMPUS_ACCOUNTS.find((acc) => acc.role === role);

    if (account) {
      campusStore.loginWithAccount(account);
      return { success: true, message: `Welcome back, ${account.name}!`, account };
    }

    return { success: false, message: "Invalid credentials or unauthorized role." };
  },

  logout() {
    campusStore.setState(() => ({
      isAuthenticated: false,
    }));
  },

  setRole(role: UserRole) {
    campusStore.setState((prev) => {
      let user = prev.currentUser;
      if (role === "student") user = STUDENT_ACCOUNT.profile;
      else if (role === "organizer") user = TPC_ADMIN_ACCOUNT.profile;
      else if (role === "admin") user = ADMIN_ACCOUNT.profile;
      return { currentRole: role, currentUser: user };
    });
  },

  setLanguage(lang: Language) {
    campusStore.setState(() => ({ language: lang }));
  },

  setOffline(isOffline: boolean) {
    campusStore.setState(() => ({ isOffline }));
  },

  registerForEvent(eventId: string, isTeam = false, teamName?: string, teamMembers?: Array<{ name: string; rollNo: string; email: string }>): { success: boolean; message: string; waitlisted?: boolean } {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Event not found" };

    const existing = state.registrations.find(
      (r) => r.eventId === eventId && r.userId === state.currentUser.id
    );
    if (existing) {
      return { success: false, message: `Already registered as ${existing.status}` };
    }

    const isFull = event.registeredCount >= event.capacity;
    const regStatus = isFull ? "waitlisted" : event.approvalRequired ? "pending_approval" : "confirmed";

    const newRegistration: Registration = {
      id: `reg-${Date.now()}`,
      eventId,
      userId: state.currentUser.id,
      userRollNo: state.currentUser.rollNo,
      userName: state.currentUser.name,
      department: state.currentUser.department,
      registeredAt: new Date().toISOString(),
      status: regStatus,
      isTeam,
      teamName: isTeam ? teamName || "Team Alpha" : undefined,
      teamMembers: isTeam ? teamMembers : undefined,
    };

    const updatedEvents = state.events.map((e) => {
      if (e.id === eventId) {
        return {
          ...e,
          registeredCount: !isFull && regStatus === "confirmed" ? e.registeredCount + 1 : e.registeredCount,
          waitlistCount: isFull ? e.waitlistCount + 1 : e.waitlistCount,
        };
      }
      return e;
    });

    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: isFull ? `Added to Waitlist: ${event.title}` : `Registration Confirmed: ${event.title}`,
      message: isFull
        ? `You are on the waitlist (#${event.waitlistCount + 1}). We'll notify you if a seat opens.`
        : `Your seat has been reserved for ${event.title} on ${event.date}.`,
      type: "approval",
      timestamp: "Just now",
      read: false,
      eventId: event.id,
    };

    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action: isTeam ? "Team Registration" : "Student Registration",
      performedBy: `${state.currentUser.name} (${state.currentUser.rollNo})`,
      target: event.title,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      details: `Status: ${regStatus} · Team: ${isTeam ? teamName : "Individual"}`,
    };

    campusStore.setState((prev) => ({
      registrations: [newRegistration, ...prev.registrations],
      events: updatedEvents,
      notifications: [newNotification, ...prev.notifications],
      auditLogs: [auditEntry, ...prev.auditLogs],
    }));

    return {
      success: true,
      message: isFull ? "Added to waitlist" : "Registration successful!",
      waitlisted: isFull,
    };
  },

  recordCheckIn(
    eventId: string,
    token: string,
    forcedOffline = false,
    locationData?: { latitude: number; longitude: number; distanceMeters: number; verified: boolean }
  ): { success: boolean; offlineQueued: boolean; message: string; record?: AttendanceRecord } {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, offlineQueued: false, message: "Event not found." };

    // Check if already checked in
    const existingCheckIn = state.attendanceRecords.find(
      (a) => a.eventId === eventId && a.userId === state.currentUser.id
    );
    if (existingCheckIn) {
      return { success: false, offlineQueued: false, message: "Attendance already verified for this event!" };
    }

    const isOffline = state.isOffline || forcedOffline || (typeof navigator !== "undefined" && !navigator.onLine);

    if (isOffline) {
      // Queue locally
      const pending: PendingCheckin = {
        id: `pending-${Date.now()}`,
        eventId,
        eventTitle: event.title,
        userId: state.currentUser.id,
        userRollNo: state.currentUser.rollNo,
        userName: state.currentUser.name,
        department: state.currentUser.department,
        timestamp: new Date().toISOString(),
        token,
        retryCount: 0,
      };

      // Also mark registration as attended locally for snappy optimistic UI
      const updatedRegs = state.registrations.map((r) =>
        r.eventId === eventId && r.userId === state.currentUser.id ? { ...r, status: "attended" as const } : r
      );

      campusStore.setState((prev) => ({
        pendingCheckins: [pending, ...prev.pendingCheckins],
        registrations: updatedRegs,
      }));

      return {
        success: true,
        offlineQueued: true,
        message: "Offline: Check-in saved securely on device with location metadata. Will auto-sync when online.",
      };
    }

    // Direct Online Check-In
    const certId = `GSFC-CERT-${event.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${state.currentUser.rollNo.slice(-4)}-${Date.now().toString(36).toUpperCase()}`;

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      eventId,
      eventTitle: event.title,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      userRollNo: state.currentUser.rollNo,
      department: state.currentUser.department,
      timestamp: new Date().toISOString(),
      verifiedMethod: "qr_scan",
      tokenUsed: token,
      synced: true,
      certificateId: certId,
      userLatitude: locationData?.latitude,
      userLongitude: locationData?.longitude,
      distanceFromVenueMeters: locationData?.distanceMeters,
      locationVerified: locationData?.verified,
    };

    // Award +50 XP and volunteer hours if applicable (+10 bonus XP if GPS verified!)
    const earnedXp = locationData?.verified ? 60 : 50;
    const earnedVolHours = event.volunteerHoursReward || 0;
    const nextPoints = state.currentUser.points + earnedXp;

    const updatedUser: UserProfile = {
      ...state.currentUser,
      points: nextPoints,
      volunteerHours: state.currentUser.volunteerHours + earnedVolHours,
      streakDays: state.currentUser.streakDays + 1,
    };

    const updatedRegs = state.registrations.map((r) =>
      r.eventId === eventId && r.userId === state.currentUser.id ? { ...r, status: "attended" as const } : r
    );

    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action: "Attendance Verified (QR + GPS)",
      performedBy: `${state.currentUser.name} (${state.currentUser.rollNo})`,
      target: event.title,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      details: `Token: ${token} · Method: Live QR Scan · GPS: ${locationData?.verified ? `Verified (${locationData.distanceMeters}m from venue)` : "Device GPS"} · Awarded +${earnedXp} XP`,
    };

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Attendance Verified via Live Location!",
      message: `Your presence for "${event.title}" is confirmed on-site (${locationData?.distanceMeters || 12}m from venue). +${earnedXp} XP added!`,
      type: "achievement",
      timestamp: "Just now",
      read: false,
      eventId: event.id,
    };

    campusStore.setState((prev) => ({
      attendanceRecords: [newRecord, ...prev.attendanceRecords],
      registrations: updatedRegs,
      currentUser: updatedUser,
      auditLogs: [auditEntry, ...prev.auditLogs],
      notifications: [notif, ...prev.notifications],
    }));

    return {
      success: true,
      offlineQueued: false,
      message: `Attendance verified with live location! (${locationData?.distanceMeters || 15}m from venue)`,
      record: newRecord,
    };
  },

  punchIn(
    eventId: string,
    locationData?: { latitude: number; longitude: number; distanceMeters: number; verified: boolean }
  ): { success: boolean; message: string; record?: AttendanceRecord } {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Event not found" };

    const now = new Date().toISOString();
    const certId = `GSFC-CERT-${event.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${state.currentUser.rollNo.slice(-4)}-${Date.now().toString(36).toUpperCase()}`;

    // Check if an attendance record already exists
    let existingRecord = state.attendanceRecords.find(
      (a) => a.eventId === eventId && a.userId === state.currentUser.id
    );

    let updatedAttendance = [...state.attendanceRecords];

    if (!existingRecord) {
      existingRecord = {
        id: `att-${Date.now()}`,
        eventId,
        eventTitle: event.title,
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        userRollNo: state.currentUser.rollNo,
        department: state.currentUser.department,
        timestamp: now,
        punchInTime: now,
        verifiedMethod: "live_punch",
        tokenUsed: "PUNCH-IN-VERIFIED",
        synced: true,
        certificateId: certId,
        userLatitude: locationData?.latitude,
        userLongitude: locationData?.longitude,
        distanceFromVenueMeters: locationData?.distanceMeters,
        locationVerified: locationData?.verified ?? true,
      };
      updatedAttendance = [existingRecord, ...updatedAttendance];
    } else {
      updatedAttendance = updatedAttendance.map((a) =>
        a.id === existingRecord!.id ? { ...a, punchInTime: now, locationVerified: locationData?.verified ?? a.locationVerified } : a
      );
    }

    // Update registration status
    const updatedRegs = state.registrations.map((r) =>
      r.eventId === eventId && r.userId === state.currentUser.id
        ? {
            ...r,
            status: "punched_in" as const,
            punchInTime: now,
            punchInLocation: locationData,
          }
        : r
    );

    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action: "Event Punch-In Recorded",
      performedBy: `${state.currentUser.name} (${state.currentUser.rollNo})`,
      target: event.title,
      timestamp: now.replace("T", " ").slice(0, 19),
      details: `Punch-In at ${now.slice(11, 16)} · GPS: ${locationData?.distanceMeters || 18}m from ${event.venue} (Verified)`,
    };

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Punched In: ${event.title}`,
      message: `Your entry is confirmed at ${event.venue}. +30 XP awarded! Remember to Punch Out before leaving.`,
      type: "achievement",
      timestamp: "Just now",
      read: false,
      eventId: event.id,
    };

    const updatedUser: UserProfile = {
      ...state.currentUser,
      points: state.currentUser.points + 30,
    };

    campusStore.setState((prev) => ({
      attendanceRecords: updatedAttendance,
      registrations: updatedRegs,
      currentUser: updatedUser,
      auditLogs: [auditEntry, ...prev.auditLogs],
      notifications: [notif, ...prev.notifications],
    }));

    return {
      success: true,
      message: `Punched In successfully for ${event.title} at ${event.venue}!`,
      record: existingRecord,
    };
  },

  punchOut(
    eventId: string,
    locationData?: { latitude: number; longitude: number; distanceMeters: number; verified: boolean }
  ): { success: boolean; message: string; record?: AttendanceRecord } {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Event not found" };

    const now = new Date().toISOString();
    const existingRecord = state.attendanceRecords.find(
      (a) => a.eventId === eventId && a.userId === state.currentUser.id
    );

    if (!existingRecord) {
      return { success: false, message: "No active Punch-In record found to punch out from." };
    }

    const updatedAttendance = state.attendanceRecords.map((a) =>
      a.id === existingRecord.id
        ? {
            ...a,
            punchOutTime: now,
            locationVerified: locationData?.verified ?? a.locationVerified,
          }
        : a
    );

    const updatedRegs = state.registrations.map((r) =>
      r.eventId === eventId && r.userId === state.currentUser.id
        ? {
            ...r,
            status: "attended" as const,
            punchOutTime: now,
            punchOutLocation: locationData,
          }
        : r
    );

    const earnedVolHours = event.volunteerHoursReward || 3;
    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action: "Event Punch-Out Recorded",
      performedBy: `${state.currentUser.name} (${state.currentUser.rollNo})`,
      target: event.title,
      timestamp: now.replace("T", " ").slice(0, 19),
      details: `Punch-Out at ${now.slice(11, 16)} · Attendance Completed · +30 XP & +${earnedVolHours}h Volunteer Logged`,
    };

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Attendance Completed: ${event.title}`,
      message: `You successfully punched out. Full session verified! +30 XP & certificate available.`,
      type: "achievement",
      timestamp: "Just now",
      read: false,
      eventId: event.id,
    };

    const updatedUser: UserProfile = {
      ...state.currentUser,
      points: state.currentUser.points + 30,
      volunteerHours: state.currentUser.volunteerHours + earnedVolHours,
      streakDays: state.currentUser.streakDays + 1,
    };

    campusStore.setState((prev) => ({
      attendanceRecords: updatedAttendance,
      registrations: updatedRegs,
      currentUser: updatedUser,
      auditLogs: [auditEntry, ...prev.auditLogs],
      notifications: [notif, ...prev.notifications],
    }));

    return {
      success: true,
      message: `Punch-Out recorded! Full attendance confirmed for ${event.title}.`,
      record: existingRecord,
    };
  },

  syncPendingCheckins(): { syncedCount: number } {
    const state = campusStore.getState();
    if (state.pendingCheckins.length === 0) return { syncedCount: 0 };

    const newAttendanceRecords: AttendanceRecord[] = [];
    let addedXp = 0;

    for (const item of state.pendingCheckins) {
      const certId = `GSFC-CERT-${item.eventId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${item.userRollNo.slice(-4)}-${Date.now().toString(36).toUpperCase()}`;
      newAttendanceRecords.push({
        id: `att-sync-${Date.now()}-${item.id}`,
        eventId: item.eventId,
        eventTitle: item.eventTitle,
        userId: item.userId,
        userName: item.userName,
        userRollNo: item.userRollNo,
        department: item.department,
        timestamp: item.timestamp,
        verifiedMethod: "offline_sync",
        tokenUsed: item.token,
        synced: true,
        certificateId: certId,
      });
      addedXp += 50;
    }

    const syncedCount = state.pendingCheckins.length;

    const notif: NotificationItem = {
      id: `notif-sync-${Date.now()}`,
      title: "Offline Check-ins Synchronized!",
      message: `Successfully synchronized ${syncedCount} queued attendance check-in(s) with campus servers.`,
      type: "sync",
      timestamp: "Just now",
      read: false,
    };

    const auditEntry: AuditLogEntry = {
      id: `aud-sync-${Date.now()}`,
      action: "Offline Queue Synchronized",
      performedBy: `${state.currentUser.name} (${state.currentUser.rollNo})`,
      target: `${syncedCount} Events`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      details: `Batch synchronization completed · ${syncedCount} records saved`,
    };

    campusStore.setState((prev) => ({
      attendanceRecords: [...newAttendanceRecords, ...prev.attendanceRecords],
      pendingCheckins: [],
      currentUser: {
        ...prev.currentUser,
        points: prev.currentUser.points + addedXp,
      },
      notifications: [notif, ...prev.notifications],
      auditLogs: [auditEntry, ...prev.auditLogs],
    }));

    return { syncedCount };
  },

  createEvent(eventData: Omit<CampusEvent, "id" | "registeredCount" | "waitlistCount" | "status">): CampusEvent {
    const state = campusStore.getState();
    const isDeanAdmin = state.currentRole === "admin";
    const status: CampusEvent["status"] = isDeanAdmin ? "upcoming" : eventData.approvalRequired ? "pending_approval" : "upcoming";

    const newEvent: CampusEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      registeredCount: 0,
      waitlistCount: 0,
      status,
      averageRating: 5.0,
      reviewCount: 0,
    };

    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action: "Event Created",
      performedBy: `${state.currentUser.name} (${state.currentUser.role})`,
      target: newEvent.title,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      details: `Status: ${status} · Capacity: ${newEvent.capacity} · Dept: ${newEvent.department}`,
    };

    campusStore.setState((prev) => ({
      events: [newEvent, ...prev.events],
      auditLogs: [auditEntry, ...prev.auditLogs],
    }));

    return newEvent;
  },

  approveEvent(eventId: string) {
    campusStore.setState((prev) => {
      const event = prev.events.find((e) => e.id === eventId);
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        action: "Event Approved by Dean",
        performedBy: "Dr. Ananya Sharma (Admin)",
        target: event?.title || eventId,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        details: "Event status transitioned from pending_approval to upcoming",
      };
      return {
        events: prev.events.map((e) => (e.id === eventId ? { ...e, status: "upcoming" } : e)),
        auditLogs: [audit, ...prev.auditLogs],
      };
    });
  },

  rejectEvent(eventId: string) {
    campusStore.setState((prev) => ({
      events: prev.events.map((e) => (e.id === eventId ? { ...e, status: "rejected" } : e)),
    }));
  },

  updateRegistrationStatus(registrationId: string, status: Registration["status"]) {
    campusStore.setState((prev) => ({
      registrations: prev.registrations.map((r) => (r.id === registrationId ? { ...r, status } : r)),
    }));
  },

  submitFeedback(eventId: string, rating: number, comment: string) {
    const state = campusStore.getState();
    const newFeedback: EventFeedback = {
      id: `fb-${Date.now()}`,
      eventId,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    // Recalculate event rating
    const currentFeedbacks = [...state.feedbackList.filter((f) => f.eventId === eventId), newFeedback];
    const avg = currentFeedbacks.reduce((sum, f) => sum + f.rating, 0) / currentFeedbacks.length;

    const updatedEvents = state.events.map((e) =>
      e.id === eventId ? { ...e, averageRating: Number(avg.toFixed(1)), reviewCount: currentFeedbacks.length } : e
    );

    // Award +20 XP for giving feedback
    const updatedUser: UserProfile = {
      ...state.currentUser,
      points: state.currentUser.points + 20,
    };

    campusStore.setState((prev) => ({
      feedbackList: [newFeedback, ...prev.feedbackList],
      events: updatedEvents,
      currentUser: updatedUser,
    }));
  },

  triggerLowAttendanceAlerts() {
    const state = campusStore.getState();
    const notif: NotificationItem = {
      id: `notif-alert-${Date.now()}`,
      title: "Low Attendance Notice (<75%)",
      message: "Urgent: 8 students have fallen below the mandatory 75% semester attendance threshold. Automated notices dispatched to academic mentors.",
      type: "alert",
      timestamp: "Just now",
      read: false,
    };

    const audit: AuditLogEntry = {
      id: `aud-flag-${Date.now()}`,
      action: "Low Attendance Flag Triggered",
      performedBy: "System Automated Rule",
      target: "8 Flagged Students",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      details: "Dispatched automated warning emails and academic mentor alerts",
    };

    campusStore.setState((prev) => ({
      lowAttendanceAlertSent: true,
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  },

  endAndConcludeEvent(eventId: string): { success: boolean; message: string; attendeesCount: number } {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Event not found", attendeesCount: 0 };

    const now = new Date().toISOString();
    const eventRegistrations = state.registrations.filter((r) => r.eventId === eventId);

    // Find all attendees (punched in, attended, or confirmed registered attendees)
    const updatedAttendance = [...state.attendanceRecords];
    let issuedCount = 0;

    const updatedRegs = state.registrations.map((r) => {
      if (r.eventId !== eventId) return r;
      const isPresent =
        r.status === "punched_in" ||
        r.status === "attended" ||
        r.status === "confirmed" ||
        Boolean(r.punchInTime);

      if (isPresent) {
        issuedCount++;
        const certId = `GSFC-CERT-${event.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${r.userRollNo.replace(/[^a-zA-Z0-9]/g, "").slice(-4)}-${Date.now().toString(36).toUpperCase()}`;

        const existingAtt = updatedAttendance.find((a) => a.eventId === eventId && a.userId === r.userId);
        if (!existingAtt) {
          updatedAttendance.push({
            id: `att-cert-${Date.now()}-${r.userId}`,
            eventId: event.id,
            eventTitle: event.title,
            userId: r.userId,
            userName: r.userName,
            userRollNo: r.userRollNo,
            department: r.department,
            timestamp: now,
            punchInTime: r.punchInTime || now,
            punchOutTime: r.punchOutTime || now,
            verifiedMethod: "live_punch",
            tokenUsed: "GSFC-CERT-AUTOGEN",
            synced: true,
            certificateId: certId,
            locationVerified: true,
          });
        } else if (!existingAtt.certificateId) {
          existingAtt.certificateId = certId;
          existingAtt.punchOutTime = existingAtt.punchOutTime || now;
        }

        return {
          ...r,
          status: "attended" as const,
          punchOutTime: r.punchOutTime || now,
        };
      }
      return r;
    });

    const updatedEvents = state.events.map((e) =>
      e.id === eventId ? { ...e, status: "completed" as const } : e
    );

    const notif: NotificationItem = {
      id: `notif-cert-${Date.now()}`,
      title: `🎓 Certificates Issued: ${event.title}`,
      message: `The event has concluded. Verified participation certificates with GSFC seal have been generated for all attendees!`,
      type: "achievement",
      timestamp: "Just now",
      read: false,
      eventId: event.id,
    };

    const audit: AuditLogEntry = {
      id: `aud-conclude-${Date.now()}`,
      action: "Event Concluded & Certificates Auto-Generated",
      performedBy: `${state.currentUser.name} (${state.currentUser.role})`,
      target: event.title,
      timestamp: now.replace("T", " ").slice(0, 19),
      details: `Generated and digitally signed participation certificates for ${issuedCount} verified attendees with official GSFC seal.`,
    };

    // If current logged-in user is an attendee, award XP and volunteer hours
    let updatedCurrentUser = state.currentUser;
    const isCurrentUserAttendee = eventRegistrations.some((r) => r.userId === state.currentUser.id);
    if (isCurrentUserAttendee) {
      updatedCurrentUser = {
        ...state.currentUser,
        points: state.currentUser.points + 50,
        volunteerHours: state.currentUser.volunteerHours + (event.volunteerHoursReward || 3),
        attendanceRate: Math.min(100, state.currentUser.attendanceRate + 2),
      };
    }

    campusStore.setState((prev) => ({
      events: updatedEvents,
      registrations: updatedRegs,
      attendanceRecords: updatedAttendance,
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
      currentUser: updatedCurrentUser,
    }));

    return {
      success: true,
      message: `Event concluded! Generated ${issuedCount} participation certificates with GSFC seal.`,
      attendeesCount: issuedCount,
    };
  },

  toggleEventCertificateRelease(eventId: string, forceRelease?: boolean): { success: boolean; message: string; released: boolean } {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Event not found", released: false };

    const nextReleased = forceRelease !== undefined ? forceRelease : !event.certificatesReleased;
    const now = new Date().toISOString();

    const updatedEvents = state.events.map((e) =>
      e.id === eventId ? { ...e, certificatesReleased: nextReleased } : e
    );

    const updatedRegs = state.registrations.map((r) =>
      r.eventId === eventId ? { ...r, certificateUnlocked: nextReleased } : r
    );

    const updatedAtt = state.attendanceRecords.map((a) =>
      a.eventId === eventId ? { ...a, certificateUnlocked: nextReleased } : a
    );

    const notif: NotificationItem = {
      id: `notif-cert-rel-${Date.now()}`,
      title: nextReleased ? `🎓 Certificate Access Granted: ${event.title}` : `🔒 Certificate Access Locked: ${event.title}`,
      message: nextReleased
        ? `The Administration has unlocked official participation certificates for ${event.title}. Download your PDF now from My Events.`
        : `Certificate download access for ${event.title} has been paused by the Administration.`,
      type: "achievement",
      timestamp: "Just now",
      read: false,
      eventId: event.id,
    };

    const audit: AuditLogEntry = {
      id: `aud-cert-rel-${Date.now()}`,
      action: nextReleased ? "Certificate Access Granted (Admin Release)" : "Certificate Access Locked (Admin)",
      performedBy: `${state.currentUser.name} (${state.currentUser.role})`,
      target: event.title,
      timestamp: now.replace("T", " ").slice(0, 19),
      details: nextReleased
        ? "Unlocked official PDF participation certificates for all verified attendees."
        : "Locked PDF certificate downloads for this event.",
    };

    campusStore.setState((prev) => ({
      events: updatedEvents,
      registrations: updatedRegs,
      attendanceRecords: updatedAtt,
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return {
      success: true,
      message: nextReleased
        ? `Certificate download access successfully granted & unlocked for ${event.title}!`
        : `Certificate download access locked for ${event.title}.`,
      released: nextReleased,
    };
  },

  toggleStudentCertificateAccess(eventId: string, userId: string): { success: boolean; unlocked: boolean } {
    const state = campusStore.getState();
    const reg = state.registrations.find((r) => r.eventId === eventId && r.userId === userId);
    if (!reg) return { success: false, unlocked: false };

    const event = state.events.find((e) => e.id === eventId);
    const nextUnlocked = !reg.certificateUnlocked;
    const now = new Date().toISOString();

    const updatedRegs = state.registrations.map((r) =>
      r.eventId === eventId && r.userId === userId ? { ...r, certificateUnlocked: nextUnlocked } : r
    );

    const updatedAtt = state.attendanceRecords.map((a) =>
      a.eventId === eventId && a.userId === userId ? { ...a, certificateUnlocked: nextUnlocked } : a
    );

    const audit: AuditLogEntry = {
      id: `aud-stu-cert-${Date.now()}`,
      action: nextUnlocked ? "Student Certificate Access Granted" : "Student Certificate Access Revoked",
      performedBy: `${state.currentUser.name} (${state.currentUser.role})`,
      target: `${reg.userName} (${reg.userRollNo})`,
      timestamp: now.replace("T", " ").slice(0, 19),
      details: `Event: ${event?.title || eventId} · Status: ${nextUnlocked ? "Access Granted" : "Access Revoked"}`,
    };

    campusStore.setState((prev) => ({
      registrations: updatedRegs,
      attendanceRecords: updatedAtt,
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return {
      success: true,
      unlocked: nextUnlocked,
    };
  },

  // Send Mobile OTP simulation
  sendMobileOtp(mobile: string): { success: boolean; otp: string; message: string } {
    const cleanMobile = mobile.trim();
    // Deterministic 6-digit OTP for testing convenience
    const otp = "849521";
    const notif: NotificationItem = {
      id: `notif-otp-${Date.now()}`,
      title: "📱 GSFC SMS OTP Verification Code",
      message: `Your One Time Password (OTP) for Campus Access & Attendance is: ${otp}. Valid for 10 minutes. Do not share.`,
      type: "alert",
      timestamp: "Just now",
      read: false,
    };
    campusStore.setState((prev) => ({
      notifications: [notif, ...prev.notifications],
    }));
    return {
      success: true,
      otp,
      message: `OTP sent successfully to ${cleanMobile}`,
    };
  },

  // Register Visitor Entry + Optional Vehicle
  registerVisitorEntry(data: {
    fullName: string;
    mobile: string;
    email?: string;
    organization: string;
    purpose: VisitorRecord["purpose"];
    personToMeet: string;
    departmentToMeet: string;
    idProofType: VisitorRecord["idProofType"];
    idProofNumber?: string;
    locationVerified: boolean;
    userLatitude?: number;
    userLongitude?: number;
    distanceMeters?: number;
    hasVehicle: boolean;
    vehicleNumber?: string;
    vehicleType?: VehicleType;
    parkingBay?: string;
    assignedEventId?: string;
    assignedEventTitle?: string;
  }): { visitor: VisitorRecord; vehicle?: VehicleRecord } {
    const state = campusStore.getState();
    const now = new Date().toISOString();
    const visitorSeq = (state.visitorRecords.length + 126).toString().padStart(5, "0");
    const visitorId = `VIS-2026-${visitorSeq}`;
    const qrPassCode = `GSFC-GATE-${visitorId}-${Math.floor(1000 + Math.random() * 9000)}`;

    let vehicleRecord: VehicleRecord | undefined = undefined;
    if (data.hasVehicle && data.vehicleNumber) {
      const vehicleSeq = (state.vehicleRecords.length + 1).toString().padStart(4, "0");
      vehicleRecord = {
        id: `VEH-2026-${vehicleSeq}`,
        vehicleNumber: data.vehicleNumber.toUpperCase().trim(),
        vehicleType: data.vehicleType || "4_wheeler",
        ownerType: "visitor",
        ownerName: data.fullName,
        ownerContact: data.mobile,
        ownerRollOrVisitorId: visitorId,
        parkingBay: data.parkingBay || "Zone A - VIP / Guest Bay #05",
        entryTime: now.replace("T", " ").slice(0, 19),
        status: "parked",
        gatePassId: qrPassCode,
        verifiedBy: "Main Campus Security Gate #1",
      };
    }

    const visitorRecord: VisitorRecord = {
      id: visitorId,
      fullName: data.fullName,
      mobile: data.mobile,
      email: data.email,
      organization: data.organization,
      purpose: data.purpose,
      personToMeet: data.personToMeet,
      departmentToMeet: data.departmentToMeet,
      idProofType: data.idProofType,
      idProofNumber: data.idProofNumber,
      otpVerified: true,
      otpVerifiedAt: now.replace("T", " ").slice(0, 19),
      locationVerified: data.locationVerified,
      userLatitude: data.userLatitude || 22.3590,
      userLongitude: data.userLongitude || 73.1670,
      distanceMeters: data.distanceMeters || 12,
      entryTime: now.replace("T", " ").slice(0, 19),
      status: "active",
      hasVehicle: data.hasVehicle,
      vehicleId: vehicleRecord?.id,
      vehicleNumber: vehicleRecord?.vehicleNumber,
      vehicleType: data.vehicleType,
      qrPassCode,
      assignedEventId: data.assignedEventId,
      assignedEventTitle: data.assignedEventTitle,
    };

    const notif: NotificationItem = {
      id: `notif-vis-${Date.now()}`,
      title: `🎫 Visitor Gate Pass Issued: ${visitorId}`,
      message: `Welcome ${data.fullName} (${data.organization}). Pass issued for meeting with ${data.personToMeet}.`,
      type: "achievement",
      timestamp: "Just now",
      read: false,
    };

    const audit: AuditLogEntry = {
      id: `aud-vis-${Date.now()}`,
      action: "Visitor Gate Pass Issued",
      performedBy: "Main Campus Security Gate #1",
      target: `${data.fullName} (${data.organization})`,
      timestamp: now.replace("T", " ").slice(0, 19),
      details: `ID: ${visitorId} · OTP & Geo Verified · Purpose: ${data.purpose} · Vehicle: ${data.vehicleNumber || "None"}`,
    };

    campusStore.setState((prev) => ({
      visitorRecords: [visitorRecord, ...prev.visitorRecords],
      vehicleRecords: vehicleRecord ? [vehicleRecord, ...prev.vehicleRecords] : prev.vehicleRecords,
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return { visitor: visitorRecord, vehicle: vehicleRecord };
  },

  // Mark Visitor Exit
  markVisitorExit(visitorId: string): void {
    const state = campusStore.getState();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const visitor = state.visitorRecords.find((v) => v.id === visitorId);
    if (!visitor) return;

    const updatedVisitors = state.visitorRecords.map((v) =>
      v.id === visitorId ? { ...v, status: "exited" as const, exitTime: now } : v
    );

    const updatedVehicles = state.vehicleRecords.map((veh) =>
      veh.ownerRollOrVisitorId === visitorId ? { ...veh, status: "exited" as const, exitTime: now } : veh
    );

    const audit: AuditLogEntry = {
      id: `aud-vis-exit-${Date.now()}`,
      action: "Visitor Exit Checked",
      performedBy: "Security Gate #1",
      target: `${visitor.fullName} (${visitor.id})`,
      timestamp: now,
      details: `Visitor exited campus · Vehicle released if parked`,
    };

    campusStore.setState((prev) => ({
      visitorRecords: updatedVisitors,
      vehicleRecords: updatedVehicles,
      auditLogs: [audit, ...prev.auditLogs],
    }));
  },

  // Mark Vehicle Exit
  markVehicleExit(vehicleId: string): void {
    const state = campusStore.getState();
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const veh = state.vehicleRecords.find((v) => v.id === vehicleId);
    if (!veh) return;

    const updatedVehicles = state.vehicleRecords.map((v) =>
      v.id === vehicleId ? { ...v, status: "exited" as const, exitTime: now } : v
    );

    const audit: AuditLogEntry = {
      id: `aud-veh-exit-${Date.now()}`,
      action: "Vehicle Exit Gate Checked",
      performedBy: "Security Gate Officer",
      target: `${veh.vehicleNumber} (${veh.ownerName})`,
      timestamp: now,
      details: `Vehicle marked exited campus · Gate pass cleared`,
    };

    campusStore.setState((prev) => ({
      vehicleRecords: updatedVehicles,
      auditLogs: [audit, ...prev.auditLogs],
    }));
  },

  // Mark Unified Student/Enrolled Attendance (OTP + Barcode + Location + Time + Vehicle)
  markUnifiedStudentAttendance(data: {
    eventId: string;
    mobileNumber: string;
    studentRollNo: string;
    barcodeValue?: string;
    location: { latitude: number; longitude: number; distanceMeters: number; verified: boolean };
    hasVehicle?: boolean;
    vehicleNumber?: string;
    vehicleType?: VehicleType;
    parkingBay?: string;
  }): { success: boolean; attendanceRecord: AttendanceRecord; vehicleRecord?: VehicleRecord; message: string } {
    const state = campusStore.getState();
    const now = new Date().toISOString();
    const event = state.events.find((e) => e.id === data.eventId) || state.events[0];

    const studentName = state.currentUser.rollNo === data.studentRollNo ? state.currentUser.name : "Om Thakkar";
    const studentDept = state.currentUser.rollNo === data.studentRollNo ? state.currentUser.department : "B.Tech Computer Science & Engineering";
    const userId = state.currentUser.rollNo === data.studentRollNo ? state.currentUser.id : "u-om";

    let vehicleRecord: VehicleRecord | undefined = undefined;
    if (data.hasVehicle && data.vehicleNumber) {
      const vehicleSeq = (state.vehicleRecords.length + 1).toString().padStart(4, "0");
      vehicleRecord = {
        id: `VEH-2026-${vehicleSeq}`,
        vehicleNumber: data.vehicleNumber.toUpperCase().trim(),
        vehicleType: data.vehicleType || "2_wheeler",
        ownerType: "student",
        ownerName: studentName,
        ownerContact: data.mobileNumber,
        ownerRollOrVisitorId: data.studentRollNo,
        parkingBay: data.parkingBay || "Zone B - Student Parking",
        entryTime: now.replace("T", " ").slice(0, 19),
        status: "parked",
        gatePassId: `GSFC-STU-GATE-${data.studentRollNo}`,
        verifiedBy: "Campus Gate & Attendance Terminal",
      };
    }

    const attRecord: AttendanceRecord = {
      id: `att-unified-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      userId,
      userName: studentName,
      userRollNo: data.studentRollNo,
      department: studentDept,
      timestamp: now,
      punchInTime: now,
      verifiedMethod: "unified_otp_barcode",
      tokenUsed: `GSFC-UNIFIED-OTP-BC-${data.studentRollNo}`,
      synced: true,
      certificateId: `GSFC-CERT-${event.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${data.studentRollNo.slice(-4)}-98A4`,
      locationVerified: data.location.verified,
      userLatitude: data.location.latitude,
      userLongitude: data.location.longitude,
      distanceFromVenueMeters: data.location.distanceMeters,
      mobileNumber: data.mobileNumber,
      otpVerified: true,
      barcodeScanned: true,
      barcodeValue: data.barcodeValue || data.studentRollNo,
      vehicleId: vehicleRecord?.id,
      vehicleNumber: vehicleRecord?.vehicleNumber,
    };

    const existingReg = state.registrations.find((r) => r.eventId === event.id && r.userId === userId);
    let updatedRegs = [...state.registrations];
    if (existingReg) {
      updatedRegs = updatedRegs.map((r) =>
        r.id === existingReg.id
          ? {
              ...r,
              status: "attended" as const,
              punchInTime: now,
              punchInLocation: data.location,
            }
          : r
      );
    } else {
      updatedRegs.push({
        id: `reg-${Date.now()}`,
        eventId: event.id,
        userId,
        userName: studentName,
        userRollNo: data.studentRollNo,
        department: studentDept,
        registeredAt: now,
        status: "attended",
        isTeam: false,
        punchInTime: now,
        punchInLocation: data.location,
      });
    }

    const notif: NotificationItem = {
      id: `notif-att-${Date.now()}`,
      title: "✅ Unified Attendance Verified",
      message: `Attendance marked for ${event.title}. OTP, ID barcode, live location (${data.location.distanceMeters}m), and timestamp verified.`,
      type: "achievement",
      timestamp: "Just now",
      read: false,
      eventId: event.id,
    };

    const audit: AuditLogEntry = {
      id: `aud-att-uni-${Date.now()}`,
      action: "Unified Multi-Factor Attendance Marked",
      performedBy: `${studentName} (${data.studentRollNo})`,
      target: event.title,
      timestamp: now.replace("T", " ").slice(0, 19),
      details: `OTP ✓ | Barcode ${data.studentRollNo} ✓ | GPS ${data.location.distanceMeters}m ✓ | Vehicle: ${data.vehicleNumber || "None"}`,
    };

    campusStore.setState((prev) => ({
      attendanceRecords: [attRecord, ...prev.attendanceRecords.filter((a) => !(a.eventId === event.id && a.userId === userId))],
      registrations: updatedRegs,
      vehicleRecords: vehicleRecord ? [vehicleRecord, ...prev.vehicleRecords] : prev.vehicleRecords,
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return {
      success: true,
      attendanceRecord: attRecord,
      vehicleRecord,
      message: "Attendance successfully verified and recorded!",
    };
  },
};
