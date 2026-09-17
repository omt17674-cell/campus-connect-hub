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
};
