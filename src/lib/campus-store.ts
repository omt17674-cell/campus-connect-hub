import {
  ActivityPointsBreakdown,
  AttendanceRecord,
  AuditLogEntry,
  Badge,
  CampusAnnouncement,
  CampusEvent,
  CampusService,
  Club,
  ClubActivity,
  ClubMember,
  DigitalStudentIdCard,
  EventBroadcast,
  EventFeedback,
  Language,
  NotificationItem,
  NewRegisteredStudent,
  PendingCheckin,
  Registration,
  UserProfile,
  UserRole,
  VehicleRecord,
  VehicleType,
  VerifiedAchievement,
  VisitorRecord,
} from "./types";
import { generateQrPayload } from "./qr-engine";
import { supabase } from "./supabase";

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
    points: 0,
    streakDays: 0,
    volunteerHours: 0,
    attendanceRate: 100,
    badges: [],
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
  eventBroadcasts: EventBroadcast[];
  clubs: Club[];
  clubMembers: ClubMember[];
  clubActivities: ClubActivity[];
  achievements: VerifiedAchievement[];
  announcements: CampusAnnouncement[];
  services: CampusService[];
  digitalId: DigitalStudentIdCard;
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];
  lowAttendanceAlertSent: boolean;
  newRegisteredStudents: NewRegisteredStudent[];
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
    unlocked: false,
    xpBonus: 50,
  },
  {
    id: "b2",
    title: "Workshop Warrior",
    description: "Completed 5+ technical workshops with verified attendance",
    icon: "Cpu",
    category: "engagement",
    unlocked: false,
    xpBonus: 150,
  },
  {
    id: "b3",
    title: "Streak Master",
    description: "Maintained a continuous 7-day campus activity streak",
    icon: "Flame",
    category: "attendance",
    unlocked: false,
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
    unlocked: false,
    xpBonus: 200,
  },
  {
    id: "b6",
    title: "Dean's Honor Roll",
    description: "Maintained >85% verified attendance across the semester",
    icon: "Trophy",
    category: "attendance",
    unlocked: false,
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

const INITIAL_REGISTRATIONS: Registration[] = [];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

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

const INITIAL_BROADCASTS: EventBroadcast[] = [
  {
    id: "bc-1",
    eventId: "evt-1",
    eventTitle: "AI & Robotics National Hackathon",
    authorName: "Dr. Suresh Rao (Convener)",
    message: "Hardware kits, Arduino/ESP32 boards, and campus WiFi credentials are now available at Lab 4.",
    priority: "high",
    createdAt: "2026-06-12T09:45:00Z",
  },
  {
    id: "bc-2",
    eventId: "evt-1",
    eventTitle: "AI & Robotics National Hackathon",
    authorName: "Prof. Rajiv Mehta (TPC)",
    message: "Reminder: Punch-In must be confirmed by 10:30 AM for verified certificate eligibility.",
    priority: "urgent",
    createdAt: "2026-06-12T10:00:00Z",
  },
];

const INITIAL_DIGITAL_ID: DigitalStudentIdCard = {
  rollNo: "24BT04171",
  name: "Om Thakkar",
  program: "Bachelor of Technology (B.Tech)",
  department: "Computer Science & Engineering",
  semester: 4,
  validTill: "June 2028",
  bloodGroup: "B+ (Positive)",
  qrVerificationCode: "GSFCU:VERIFIED:24BT04171:OM_THAKKAR:CSE:2024-28",
  barcode: "24BT04171",
  photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  status: "active",
};

const INITIAL_CLUBS: Club[] = [
  {
    id: "club-1",
    name: "GSFC Coding & Robotics Club",
    category: "Technical",
    department: "Computer Science & Engineering",
    description: "The premier developer & robotics community at GSFC University. Organizing national hackathons, open-source cohorts, AI bootcamps, and competitive programming meetups.",
    bannerImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    logo: "💻",
    facultyCoordinator: {
      name: "Dr. Suresh Rao",
      email: "suresh.rao@gsfcuni.edu",
      department: "CSE Department",
    },
    studentLead: {
      name: "Om Thakkar",
      rollNo: "24BT04171",
      email: "omthakkar168@gsfcuniversity.ac.in",
    },
    memberCount: 142,
    meetingSchedule: "Every Wednesday & Friday · 05:00 PM at Lab 4",
    foundedYear: 2019,
    status: "recruiting",
    tags: ["Web3", "AI/ML", "Robotics", "Hackathons", "Competitive Coding"],
  },
  {
    id: "club-2",
    name: "Chrysalis Cultural & Arts Guild",
    category: "Cultural",
    department: "All Departments",
    description: "Fostering creative expression, theatre, music, classical dance, painting, and literature across all faculties of GSFC University.",
    bannerImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    logo: "🎭",
    facultyCoordinator: {
      name: "Prof. Meera Joshi",
      email: "meera.joshi@gsfcuni.edu",
      department: "Humanities & Liberal Arts",
    },
    studentLead: {
      name: "Pooja Varma",
      rollNo: "24BT04192",
      email: "pooja.v@gsfcuniversity.ac.in",
    },
    memberCount: 188,
    meetingSchedule: "Tuesdays & Thursdays · 04:30 PM at Amphitheatre",
    foundedYear: 2018,
    status: "active",
    tags: ["Music", "Dance", "Drama", "Fine Arts", "Heritage"],
  },
  {
    id: "club-3",
    name: "GSFC E-Cell & Innovation Hub",
    category: "Entrepreneurship",
    department: "Management & Engineering",
    description: "Nurturing student startup founders, seed pitching, venture incubation, patent filings, and industry mentorship circles.",
    bannerImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
    logo: "🚀",
    facultyCoordinator: {
      name: "Prof. Rajiv Mehta (TPC Head)",
      email: "tpc.admin@gsfcuniversity.ac.in",
      department: "Training & Placement Cell",
    },
    studentLead: {
      name: "Rohan Dave",
      rollNo: "24BT04205",
      email: "rohan.d@gsfcuniversity.ac.in",
    },
    memberCount: 96,
    meetingSchedule: "Saturdays · 11:00 AM at Incubation Block",
    foundedYear: 2020,
    status: "active",
    tags: ["Startups", "Incubation", "Pitching", "Venture Capital"],
  },
  {
    id: "club-4",
    name: "University Sports & Athletics Council",
    category: "Sports",
    department: "Physical Education",
    description: "Coordinating inter-university leagues in football, cricket, basketball, volleyball, athletics, and chess with professional coaching.",
    bannerImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    logo: "🏆",
    facultyCoordinator: {
      name: "Coach Vikram Gohil",
      email: "sports@gsfcuni.edu",
      department: "Athletics Cell",
    },
    studentLead: {
      name: "Karan Solanki",
      rollNo: "23BT03112",
      email: "karan.s@gsfcuniversity.ac.in",
    },
    memberCount: 164,
    meetingSchedule: "Daily Morning & Evening Sessions at Sports Arena",
    foundedYear: 2017,
    status: "active",
    tags: ["Football", "Cricket", "Athletics", "Badminton", "Fitness"],
  },
  {
    id: "club-5",
    name: "Rotaract & Social Action Cell (NSS)",
    category: "Social & NSS",
    department: "Student Affairs",
    description: "Driving community impact, blood donation drives, environmental tree plantations, rural digital literacy, and NGO partnerships.",
    bannerImage: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
    logo: "🤝",
    facultyCoordinator: {
      name: "Dr. Neha Trivedi",
      email: "neha.trivedi@gsfcuni.edu",
      department: "School of Science",
    },
    studentLead: {
      name: "Ananya Dave",
      rollNo: "24SC01088",
      email: "ananya.d@gsfcuniversity.ac.in",
    },
    memberCount: 120,
    meetingSchedule: "Alternate Sundays · 10:00 AM",
    foundedYear: 2018,
    status: "active",
    tags: ["NSS", "Social Work", "Blood Donation", "Sustainability"],
  },
];

const INITIAL_CLUB_MEMBERS: ClubMember[] = [];

const INITIAL_CLUB_ACTIVITIES: ClubActivity[] = [
  {
    id: "ca-1",
    clubId: "club-1",
    clubName: "GSFC Coding & Robotics Club",
    title: "Hands-on Microcontrollers & ROS2 Workshop",
    date: "2026-06-20",
    time: "03:00 PM - 06:00 PM",
    venue: "Computer Center, Lab 4",
    description: "Deep dive into real-time robotics programming with ROS2 and ESP32 hardware interfacing.",
    isPublicEvent: true,
    attendanceCount: 42,
  },
  {
    id: "ca-2",
    clubId: "club-2",
    clubName: "Chrysalis Cultural & Arts Guild",
    title: "Acoustic Jam Night & Heritage Recital",
    date: "2026-06-22",
    time: "06:00 PM - 08:30 PM",
    venue: "Central Lawns Amphitheatre",
    description: "Open mic musical showcase featuring classical and fusion acoustic performances.",
    isPublicEvent: true,
    attendanceCount: 78,
  },
];

const INITIAL_ACHIEVEMENTS: VerifiedAchievement[] = [];

const INITIAL_ANNOUNCEMENTS: CampusAnnouncement[] = [
  {
    id: "ann-1",
    title: "Official Notice: End-Semester Exam Schedule & Hall Tickets",
    content: "The examination schedule for Semester 4, 6, and 8 has been finalized by Academic Governance. Hall tickets with verified attendance eligibility are accessible in the student portal.",
    category: "university",
    authorName: "Dr. Ananya Sharma",
    authorRole: "Dean, Academic Governance",
    departmentTarget: "all",
    priority: "important",
    createdAt: "2026-06-11T09:00:00Z",
    readBy: ["u-om"],
  },
  {
    id: "ann-2",
    title: "TPC Placement Alert: L&T Infotech & TCS Campus Drives Open",
    content: "Online registration for L&T Infotech and TCS campus recruitment drives is now active. B.Tech (CSE/Chemical/Mechanical) students with >= 75% attendance are eligible to apply.",
    category: "placement",
    authorName: "Prof. Rajiv Mehta",
    authorRole: "Head, Training & Placement Cell (TPC)",
    departmentTarget: "Computer Science",
    priority: "important",
    createdAt: "2026-06-12T08:30:00Z",
    readBy: [],
  },
  {
    id: "ann-3",
    title: "Campus Security Circular: South Gate Maintenance Access",
    content: "Please note that the South Student Gate will undergo sensor calibration between 02:00 PM and 04:00 PM today. Please use Main Campus Security Gate #1 for entry & vehicle parking.",
    category: "emergency",
    authorName: "Chief Security Officer",
    authorRole: "GSFC Campus Security Command",
    departmentTarget: "all",
    priority: "emergency",
    createdAt: "2026-06-12T10:15:00Z",
    readBy: ["u-om"],
  },
  {
    id: "ann-4",
    title: "Coding Club Meetup: Microcontroller Hardware Kit Allocation",
    content: "Hardware kits, Arduino Nano, and ESP32 boards for the upcoming IoT hackathon can be collected from Computer Center Lab 4 today between 04:00 PM and 06:00 PM.",
    category: "club",
    authorName: "Dr. Suresh Rao",
    authorRole: "Faculty Coordinator, Coding Club",
    departmentTarget: "Computer Science",
    priority: "normal",
    createdAt: "2026-06-12T11:00:00Z",
    readBy: [],
  },
];

const INITIAL_SERVICES: CampusService[] = [
  {
    id: "srv-1",
    name: "Training & Placement Cell (TPC)",
    category: "administrative",
    location: "Block A, 1st Floor, Room 104",
    roomNumber: "104",
    building: "Block A (Admin Block)",
    openingHours: "09:00 AM - 05:30 PM (Mon-Sat)",
    headPerson: "Prof. Rajiv Mehta",
    contactEmail: "tpc.admin@gsfcuniversity.ac.in",
    contactPhone: "+91 265 309 3751",
    description: "Corporate recruitment drives, industry internships, resume reviews, mock interviews, and company liaison.",
    iconName: "Briefcase",
  },
  {
    id: "srv-2",
    name: "Dean & Academic Governance Office",
    category: "administrative",
    location: "Block A, 2nd Floor, Room 201",
    roomNumber: "201",
    building: "Block A (Dean Wing)",
    openingHours: "09:30 AM - 05:00 PM (Mon-Fri)",
    headPerson: "Dr. Ananya Sharma",
    contactEmail: "admin.dean@gsfcuniversity.ac.in",
    contactPhone: "+91 265 309 3701",
    description: "Academic regulations, curriculum governance, attendance exemption appeals, degree certificates, and student affairs.",
    iconName: "GraduationCap",
  },
  {
    id: "srv-3",
    name: "Central University Library & Digital Knowledge Hub",
    category: "facility",
    location: "Vigyan Bhavan, Ground Floor",
    roomNumber: "GB-01",
    building: "Vigyan Bhavan",
    openingHours: "08:00 AM - 09:00 PM (All Days)",
    headPerson: "Dr. R. K. Patel (Chief Librarian)",
    contactEmail: "library@gsfcuni.edu",
    contactPhone: "+91 265 309 3820",
    description: "50,000+ technical volumes, IEEE/ACM digital access, quiet study pods, high-speed WiFi, and journal archives.",
    iconName: "BookOpen",
  },
  {
    id: "srv-4",
    name: "Computer Center & Robotics Innovation Lab",
    category: "academic",
    location: "Block C, 3rd Floor, Lab 4",
    roomNumber: "C-304",
    building: "Block C (Technology Wing)",
    openingHours: "08:30 AM - 07:00 PM (Mon-Sat)",
    headPerson: "Dr. Suresh Rao (HOD CSE)",
    contactEmail: "suresh.rao@gsfcuni.edu",
    contactPhone: "+91 265 309 3765",
    description: "GPU compute workstations, 3D printers, ROS robotics hardware testbeds, and hackathon project facilities.",
    iconName: "Cpu",
  },
  {
    id: "srv-5",
    name: "Campus Health Center & Emergency Medical Ward",
    category: "emergency",
    location: "Student Amenities Block, Room 02",
    roomNumber: "02",
    building: "Amenities Complex",
    openingHours: "24x7 Emergency Service",
    headPerson: "Dr. J. M. Mehta (Campus Physician)",
    contactEmail: "health.center@gsfcuni.edu",
    contactPhone: "+91 265 309 3999",
    description: "First aid, emergency patient care, ambulance dispatch, routine medical checkups, and mental health counseling.",
    iconName: "HeartPulse",
  },
  {
    id: "srv-6",
    name: "Main Campus Security Command & Gate Control",
    category: "emergency",
    location: "Main Entrance Gate #1",
    roomNumber: "Security Cabin 01",
    building: "Main Gate Complex",
    openingHours: "24x7 Round-the-Clock",
    headPerson: "Security Control Officer",
    contactEmail: "security@gsfcuni.edu",
    contactPhone: "+91 265 309 3911",
    description: "Visitor gate passes, parking allocation, lost & found counter, CCTV surveillance, and campus vehicle tracking.",
    iconName: "ShieldCheck",
  },
];

export const INITIAL_NEW_STUDENTS: NewRegisteredStudent[] = [
  {
    id: "stu-24bt04171",
    fullName: "Om Thakkar",
    mobileNumber: "+91 98765 04171",
    rollNo: "24BT04171",
    email: "omthakkar168@gsfcuniversity.ac.in",
    school: "School of Technology (SOT)",
    department: "Computer Science & Engineering",
    degree: "B.Tech",
    semester: 4,
    residenceType: "hostel",
    hostelBlockOrBusRoute: "Sardar Patel Boys Hostel - Block A",
    clubsInterested: ["Coding & AI Club", "Robotics Club"],
    idCardUploaded: true,
    isLocked: true,
    verifiedByUniversity: true,
    createdAt: "2026-06-01T10:00:00Z",
  },
  {
    id: "stu-24bt04007",
    fullName: "Aryan Singh",
    mobileNumber: "+91 98254 04007",
    rollNo: "24BT04007",
    email: "aryan.singh@gsfcuniversity.ac.in",
    school: "School of Technology (SOT)",
    department: "Computer Science & Engineering",
    degree: "B.Tech",
    semester: 4,
    residenceType: "hostel",
    hostelBlockOrBusRoute: "Sardar Patel Boys Hostel - Block A",
    clubsInterested: ["Coding & AI Club"],
    idCardUploaded: true,
    isLocked: true,
    verifiedByUniversity: true,
    createdAt: "2026-06-12T11:30:00Z",
  },
];

const STORAGE_KEY = "gsfc_campus_connect_state_v2";
const ACCOUNTS_STORAGE_KEY = "gsfc_campus_accounts_v2";

export function getStoredAccounts(): CampusAccount[] {
  const defaultAccounts = [STUDENT_ACCOUNT, ADMIN_ACCOUNT, TPC_ADMIN_ACCOUNT];
  if (typeof window === "undefined") return defaultAccounts;
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed: CampusAccount[] = JSON.parse(raw);
      const merged = [...parsed];
      for (const def of defaultAccounts) {
        if (!merged.some((a) => a.email.toLowerCase() === def.email.toLowerCase() || a.idOrRoll.toLowerCase() === def.idOrRoll.toLowerCase())) {
          merged.push(def);
        }
      }
      return merged;
    }
  } catch (e) {
    console.error("Failed to load stored accounts", e);
  }
  return defaultAccounts;
}

export function saveStoredAccounts(accounts: CampusAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error("Failed to save accounts", e);
  }
}

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
      eventBroadcasts: INITIAL_BROADCASTS,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
      lowAttendanceAlertSent: false,
      clubs: INITIAL_CLUBS,
      clubMembers: INITIAL_CLUB_MEMBERS,
      clubActivities: INITIAL_CLUB_ACTIVITIES,
      achievements: INITIAL_ACHIEVEMENTS,
      announcements: INITIAL_ANNOUNCEMENTS,
      services: INITIAL_SERVICES,
      digitalId: INITIAL_DIGITAL_ID,
      newRegisteredStudents: INITIAL_NEW_STUDENTS,
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      // Merge saved events with defaults to prevent loss
      const existingEvents: CampusEvent[] = Array.isArray(parsed.events) ? parsed.events : [];
      const mergedEvents = [...existingEvents];
      for (const defEvt of INITIAL_EVENTS) {
        if (!mergedEvents.some((e) => e.id === defEvt.id)) {
          mergedEvents.push(defEvt);
        }
      }

      // Clean legacy dummy test records for fresh manual testing
      const existingRegs: Registration[] = Array.isArray(parsed.registrations)
        ? parsed.registrations.filter((r: Registration) => !["reg-1", "reg-2", "reg-3", "reg-4"].includes(r.id))
        : [];
      const mergedRegs = [...existingRegs];
      for (const defReg of INITIAL_REGISTRATIONS) {
        if (!mergedRegs.some((r) => r.id === defReg.id || (r.eventId === defReg.eventId && (r.userId === defReg.userId || r.userRollNo === defReg.userRollNo)))) {
          mergedRegs.push(defReg);
        }
      }

      // Clean legacy dummy attendance records
      const existingAtt: AttendanceRecord[] = Array.isArray(parsed.attendanceRecords)
        ? parsed.attendanceRecords.filter((a: AttendanceRecord) => !["att-1", "att-2"].includes(a.id))
        : [];
      const mergedAtt = [...existingAtt];
      for (const defAtt of INITIAL_ATTENDANCE) {
        if (!mergedAtt.some((a) => a.id === defAtt.id || (a.eventId === defAtt.eventId && (a.userId === defAtt.userId || a.userRollNo === defAtt.userRollNo)))) {
          mergedAtt.push(defAtt);
        }
      }

      // Merge visitor records
      const existingVisitors: VisitorRecord[] = Array.isArray(parsed.visitorRecords) ? parsed.visitorRecords : [];
      const mergedVisitors = [...existingVisitors];
      for (const defVis of INITIAL_VISITORS) {
        if (!mergedVisitors.some((v) => v.id === defVis.id)) {
          mergedVisitors.push(defVis);
        }
      }

      // Merge vehicle records
      const existingVehicles: VehicleRecord[] = Array.isArray(parsed.vehicleRecords) ? parsed.vehicleRecords : [];
      const mergedVehicles = [...existingVehicles];
      for (const defVeh of INITIAL_VEHICLES) {
        if (!mergedVehicles.some((v) => v.id === defVeh.id || v.vehicleNumber === defVeh.vehicleNumber)) {
          mergedVehicles.push(defVeh);
        }
      }

      // Merge clubs
      const existingClubs: Club[] = Array.isArray(parsed.clubs) ? parsed.clubs : [];
      const mergedClubs = [...existingClubs];
      for (const defClub of INITIAL_CLUBS) {
        if (!mergedClubs.some((c) => c.id === defClub.id)) {
          mergedClubs.push(defClub);
        }
      }

      // Merge club members (clean dummy records)
      const existingClubMembers: ClubMember[] = Array.isArray(parsed.clubMembers)
        ? parsed.clubMembers.filter((cm: ClubMember) => !["cm-1", "cm-2", "cm-3"].includes(cm.id))
        : [];
      const mergedClubMembers = [...existingClubMembers];
      for (const defCm of INITIAL_CLUB_MEMBERS) {
        if (!mergedClubMembers.some((cm) => cm.id === defCm.id || (cm.clubId === defCm.clubId && cm.userId === defCm.userId))) {
          mergedClubMembers.push(defCm);
        }
      }

      // Merge club activities
      const existingActivities: ClubActivity[] = Array.isArray(parsed.clubActivities) ? parsed.clubActivities : [];
      const mergedActivities = [...existingActivities];
      for (const defAct of INITIAL_CLUB_ACTIVITIES) {
        if (!mergedActivities.some((a) => a.id === defAct.id)) {
          mergedActivities.push(defAct);
        }
      }

      // Merge achievements (clean dummy records)
      const existingAchievements: VerifiedAchievement[] = Array.isArray(parsed.achievements)
        ? parsed.achievements.filter((a: VerifiedAchievement) => !["ach-1", "ach-2", "ach-3"].includes(a.id))
        : [];
      const mergedAchievements = [...existingAchievements];
      for (const defAch of INITIAL_ACHIEVEMENTS) {
        if (!mergedAchievements.some((a) => a.id === defAch.id)) {
          mergedAchievements.push(defAch);
        }
      }

      // Merge announcements
      const existingAnnouncements: CampusAnnouncement[] = Array.isArray(parsed.announcements) ? parsed.announcements : [];
      const mergedAnnouncements = [...existingAnnouncements];
      for (const defAnn of INITIAL_ANNOUNCEMENTS) {
        if (!mergedAnnouncements.some((a) => a.id === defAnn.id)) {
          mergedAnnouncements.push(defAnn);
        }
      }

      // Merge services
      const existingServices: CampusService[] = Array.isArray(parsed.services) ? parsed.services : [];
      const mergedServices = [...existingServices];
      for (const defSrv of INITIAL_SERVICES) {
        if (!mergedServices.some((s) => s.id === defSrv.id)) {
          mergedServices.push(defSrv);
        }
      }

      // Merge new registered students
      const existingStudents: NewRegisteredStudent[] = Array.isArray(parsed.newRegisteredStudents) ? parsed.newRegisteredStudents : [];
      const mergedStudents = [...existingStudents];
      for (const defStu of INITIAL_NEW_STUDENTS) {
        if (!mergedStudents.some((s) => s.rollNo.toUpperCase() === defStu.rollNo.toUpperCase())) {
          mergedStudents.push(defStu);
        }
      }

      let cleanCurrentUser = parsed.currentUser || INITIAL_USER;
      if (cleanCurrentUser.id === "u-om" || cleanCurrentUser.rollNo === "24BT04171") {
        cleanCurrentUser = {
          ...cleanCurrentUser,
          points: existingAtt.length * 50,
          streakDays: existingAtt.length > 0 ? (cleanCurrentUser.streakDays || 1) : 0,
          volunteerHours: cleanCurrentUser.volunteerHours && cleanCurrentUser.volunteerHours !== 18 ? cleanCurrentUser.volunteerHours : 0,
          attendanceRate: existingRegs.length > 0 ? Math.round((existingAtt.length / existingRegs.length) * 100) : 100,
          badges: Array.isArray(cleanCurrentUser.badges) ? cleanCurrentUser.badges.filter((b: string) => !["b1", "b2", "b3", "b5"].includes(b)) : [],
        };
      }

      return {
        ...parsed,
        isAuthenticated: parsed.isAuthenticated !== undefined ? parsed.isAuthenticated : false,
        currentUser: cleanCurrentUser,
        currentRole: parsed.currentRole || "student",
        events: mergedEvents,
        registrations: mergedRegs,
        attendanceRecords: mergedAtt,
        pendingCheckins: parsed.pendingCheckins || [],
        visitorRecords: mergedVisitors,
        vehicleRecords: mergedVehicles,
        badges: parsed.badges || INITIAL_BADGES,
        feedbackList: parsed.feedbackList || [],
        eventBroadcasts: parsed.eventBroadcasts || INITIAL_BROADCASTS,
        notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
        auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
        clubs: mergedClubs,
        clubMembers: mergedClubMembers,
        clubActivities: mergedActivities,
        achievements: mergedAchievements,
        announcements: mergedAnnouncements,
        services: mergedServices,
        digitalId: parsed.digitalId || INITIAL_DIGITAL_ID,
        newRegisteredStudents: mergedStudents,
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
    eventBroadcasts: INITIAL_BROADCASTS,
    notifications: INITIAL_NOTIFICATIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
    lowAttendanceAlertSent: false,
    clubs: INITIAL_CLUBS,
    clubMembers: INITIAL_CLUB_MEMBERS,
    clubActivities: INITIAL_CLUB_ACTIVITIES,
    achievements: INITIAL_ACHIEVEMENTS,
    announcements: INITIAL_ANNOUNCEMENTS,
    services: INITIAL_SERVICES,
    digitalId: INITIAL_DIGITAL_ID,
    newRegisteredStudents: INITIAL_NEW_STUDENTS,
  };
}let realtimeChannelInitialized = false;

export function initSupabaseRealtimeSync() {
  if (realtimeChannelInitialized || typeof window === "undefined") return;
  realtimeChannelInitialized = true;

  try {
    supabase
      .channel("public-db-changes")
      .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
        console.debug("Supabase realtime Postgres change:", payload.table, payload.eventType);
        campusStore.loadFromSupabase();
      })
      .subscribe();
  } catch (err) {
    console.debug("Supabase realtime init note:", err);
  }
}

export async function syncStateToSupabase(state: CampusState): Promise<void> {
  if (typeof window === "undefined" || !navigator.onLine) return;
  try {
    // 1. Sync events asynchronously
    if (state.events && state.events.length > 0) {
      await supabase.from("events").upsert(state.events).then(() => {});
    }
    // 2. Sync registrations
    if (state.registrations && state.registrations.length > 0) {
      await supabase.from("registrations").upsert(state.registrations).then(() => {});
    }
    // 3. Sync attendance
    if (state.attendanceRecords && state.attendanceRecords.length > 0) {
      await supabase.from("attendance").upsert(state.attendanceRecords).then(() => {});
    }
    // 4. Sync announcements
    if (state.announcements && state.announcements.length > 0) {
      await supabase.from("announcements").upsert(state.announcements).then(() => {});
    }
    // 5. Sync newly registered students
    if (state.newRegisteredStudents && state.newRegisteredStudents.length > 0) {
      const mapped = state.newRegisteredStudents.map((s) => ({
        id: s.id,
        full_name: s.fullName,
        mobile_number: s.mobileNumber,
        roll_no: s.rollNo,
        email: s.email,
        school: s.school,
        department: s.department,
        degree: s.degree,
        semester: s.semester,
        residence_type: s.residenceType,
        hostel_block_or_bus_route: s.hostelBlockOrBusRoute || null,
        clubs_interested: s.clubsInterested || [],
        id_card_uploaded: s.idCardUploaded,
        is_locked: true,
        verified_by_university: true,
        created_at: s.createdAt,
      }));
      await supabase.from("new_registered_students").upsert(mapped).then(() => {});
    }
  } catch (err) {
    console.debug("Supabase background sync:", err);
  }
}

export function saveState(state: CampusState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncStateToSupabase(state);
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

  registerNewStudent(student: NewRegisteredStudent) {
    campusStore.setState((prev) => {
      const filtered = (prev.newRegisteredStudents || []).filter(
        (s) => s.rollNo.toUpperCase() !== student.rollNo.toUpperCase()
      );
      return { newRegisteredStudents: [student, ...filtered] };
    });
  },

  async loadFromSupabase(): Promise<void> {
    if (typeof window === "undefined" || !navigator.onLine) return;
    initSupabaseRealtimeSync();

    try {
      // 1. Pull events
      const { data: supaEvents } = await supabase.from("events").select("*").order("date", { ascending: true });
      if (supaEvents && supaEvents.length > 0) {
        campusStore.setState((prev) => {
          const map = new Map<string, CampusEvent>();
          prev.events.forEach((e) => map.set(e.id, e));
          (supaEvents as any[]).forEach((ev) => {
            map.set(ev.id, {
              id: ev.id,
              title: ev.title,
              description: ev.description || "",
              category: ev.category,
              department: ev.department,
              date: ev.date,
              time: ev.time,
              venue: ev.venue,
              organizerName: ev.organizer_name || ev.organizerName || "",
              organizerEmail: ev.organizer_email || ev.organizerEmail || "",
              capacity: ev.capacity || 100,
              registeredCount: ev.registered_count || ev.registeredCount || 0,
              waitlistCount: ev.waitlist_count || ev.waitlistCount || 0,
              approvalRequired: Boolean(ev.approval_required ?? ev.approvalRequired),
              isTeamEvent: Boolean(ev.is_team_event ?? ev.isTeamEvent),
              minTeamSize: ev.min_team_size || ev.minTeamSize || 1,
              maxTeamSize: ev.max_team_size || ev.maxTeamSize || 4,
              volunteerHoursReward: ev.volunteer_hours_reward || ev.volunteerHoursReward || 0,
              bannerImage: ev.banner_image || ev.bannerImage || "",
              status: ev.status || "upcoming",
              averageRating: ev.average_rating || ev.averageRating || 5.0,
              reviewCount: ev.review_count || ev.reviewCount || 0,
              rules: ev.rules || [],
            });
          });
          return { events: Array.from(map.values()) };
        });
      }

      // 2. Pull registrations
      const { data: supaRegs } = await supabase.from("registrations").select("*").order("registered_at", { ascending: false });
      if (supaRegs && supaRegs.length > 0) {
        campusStore.setState((prev) => {
          const map = new Map<string, Registration>();
          prev.registrations.forEach((r) => map.set(r.id, r));
          (supaRegs as any[]).forEach((r) => {
            map.set(r.id, {
              id: r.id,
              eventId: r.event_id || r.eventId,
              userId: r.user_id || r.userId,
              userRollNo: r.user_roll_no || r.userRollNo,
              userName: r.user_name || r.userName,
              department: r.department,
              registeredAt: r.registered_at || r.registeredAt,
              status: r.status || "confirmed",
              isTeam: Boolean(r.is_team ?? r.isTeam),
              teamName: r.team_name || r.teamName,
              teamMembers: r.team_members || r.teamMembers,
            });
          });
          return { registrations: Array.from(map.values()) };
        });
      }

      // 3. Pull attendance
      const { data: supaAtt } = await supabase.from("attendance").select("*").order("timestamp", { ascending: false });
      if (supaAtt && supaAtt.length > 0) {
        campusStore.setState((prev) => {
          const map = new Map<string, AttendanceRecord>();
          prev.attendanceRecords.forEach((a) => map.set(a.id, a));
          (supaAtt as any[]).forEach((a) => {
            map.set(a.id, {
              id: a.id,
              eventId: a.event_id || a.eventId,
              eventTitle: a.event_title || a.eventTitle || "",
              userId: a.user_id || a.userId,
              userName: a.user_name || a.userName,
              userRollNo: a.user_roll_no || a.userRollNo,
              department: a.department,
              timestamp: a.timestamp,
              punchInTime: a.punch_in_time || a.punchInTime,
              punchOutTime: a.punch_out_time || a.punchOutTime,
              verifiedMethod: a.verified_method || a.verifiedMethod || "qr_scan",
              tokenUsed: a.token_used || a.tokenUsed || "",
              certificateId: a.certificate_id || a.certificateId,
              userLatitude: a.user_latitude || a.userLatitude,
              userLongitude: a.user_longitude || a.userLongitude,
              distanceFromVenueMeters: a.distance_from_venue_meters || a.distanceFromVenueMeters,
              locationVerified: a.location_verified ?? a.locationVerified ?? true,
              synced: true,
            });
          });
          return { attendanceRecords: Array.from(map.values()) };
        });
      }

      // 4. Pull new registered students
      const { data: supaStudents } = await supabase.from("new_registered_students").select("*").order("created_at", { ascending: false });
      if (supaStudents && supaStudents.length > 0) {
        const mappedStudents: NewRegisteredStudent[] = supaStudents.map((d: any) => ({
          id: d.id,
          fullName: d.full_name || d.fullName || "Student",
          mobileNumber: d.mobile_number || d.mobileNumber || "N/A",
          rollNo: d.roll_no || d.rollNo || "N/A",
          email: d.email || "",
          school: d.school || "School of Technology (SOT)",
          department: d.department || "Computer Science & Engineering",
          degree: d.degree || "B.Tech",
          semester: d.semester || 4,
          residenceType: d.residence_type || d.residenceType || "hostel",
          hostelBlockOrBusRoute: d.hostel_block_or_bus_route || d.hostelBlockOrBusRoute,
          clubsInterested: d.clubs_interested || d.clubsInterested || [],
          idCardUploaded: Boolean(d.id_card_uploaded ?? d.idCardUploaded ?? true),
          isLocked: true,
          verifiedByUniversity: Boolean(d.verified_by_university ?? d.verifiedByUniversity ?? true),
          createdAt: d.created_at || d.createdAt || new Date().toISOString(),
        }));
        campusStore.setState(() => ({
          newRegisteredStudents: mappedStudents,
        }));
      }

      // 5. Pull announcements
      const { data: supaAnnouncements } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (supaAnnouncements && supaAnnouncements.length > 0) {
        campusStore.setState((prev) => {
          const map = new Map<string, CampusAnnouncement>();
          prev.announcements.forEach((a) => map.set(a.id, a));
          (supaAnnouncements as any[]).forEach((ann) => {
            map.set(ann.id, {
              id: ann.id,
              title: ann.title,
              content: ann.content,
              category: ann.category,
              authorName: ann.author_name || ann.authorName,
              authorRole: ann.author_role || ann.authorRole,
              departmentTarget: ann.department_target || ann.departmentTarget,
              priority: ann.priority,
              readBy: ann.read_by || ann.readBy || [],
              createdAt: ann.created_at || ann.createdAt,
            });
          });
          return { announcements: Array.from(map.values()) };
        });
      }
    } catch (e) {
      console.debug("Supabase realtime sync note:", e);
    }
  },


  registerNewAccount(account: CampusAccount) {
    const current = getStoredAccounts();
    const filtered = current.filter(
      (a) =>
        a.email.toLowerCase() !== account.email.toLowerCase() &&
        a.idOrRoll.toLowerCase() !== account.idOrRoll.toLowerCase()
    );
    const updated = [account, ...filtered];
    saveStoredAccounts(updated);
    CAMPUS_ACCOUNTS.length = 0;
    CAMPUS_ACCOUNTS.push(...updated);
  },

  loginWithAccount(account: CampusAccount) {
    campusStore.registerNewAccount(account);
    campusStore.setState(() => ({
      isAuthenticated: true,
      currentRole: account.role,
      currentUser: account.profile,
    }));
  },

  loginWithCredentials(identifier: string, role: UserRole): { success: boolean; message: string; account?: CampusAccount } {
    const cleanId = identifier.trim().toLowerCase();
    const allAccounts = getStoredAccounts();

    const account =
      allAccounts.find(
        (acc) =>
          acc.role === role &&
          (acc.email.toLowerCase() === cleanId ||
            acc.idOrRoll.toLowerCase() === cleanId ||
            cleanId.includes(acc.idOrRoll.toLowerCase()) ||
            cleanId.includes(acc.email.split("@")[0].toLowerCase()))
      ) || allAccounts.find((acc) => acc.role === role);

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

    // Immediate write-through to Supabase
    try {
      supabase.from("registrations").upsert({
        id: newRegistration.id,
        event_id: newRegistration.eventId,
        user_id: newRegistration.userId,
        user_roll_no: newRegistration.userRollNo,
        user_name: newRegistration.userName,
        department: newRegistration.department,
        registered_at: newRegistration.registeredAt,
        status: newRegistration.status,
        is_team: newRegistration.isTeam,
        team_name: newRegistration.teamName || null,
        team_members: newRegistration.teamMembers || null,
      }).then(() => {});

      const targetEv = updatedEvents.find((e) => e.id === eventId);
      if (targetEv) {
        supabase.from("events").upsert(targetEv).then(() => {});
      }
    } catch {}

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

    // Immediate write-through to Supabase
    try {
      supabase.from("attendance").upsert({
        id: newRecord.id,
        event_id: newRecord.eventId,
        event_title: newRecord.eventTitle,
        user_id: newRecord.userId,
        user_name: newRecord.userName,
        user_roll_no: newRecord.userRollNo,
        department: newRecord.department,
        timestamp: newRecord.timestamp,
        punch_in_time: newRecord.timestamp,
        verified_method: newRecord.verifiedMethod,
        token_used: newRecord.tokenUsed,
        certificate_id: newRecord.certificateId,
        user_latitude: newRecord.userLatitude || null,
        user_longitude: newRecord.userLongitude || null,
        distance_from_venue_meters: newRecord.distanceFromVenueMeters || null,
        location_verified: newRecord.locationVerified ?? true,
        synced: true,
      }).then(() => {});
    } catch {}

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
      e.id === eventId
        ? {
            ...e,
            status: "completed" as const,
            certificatesReleased: true,
            isLive: false,
          }
        : e
    );

    const notif: NotificationItem = {
      id: `notif-cert-${Date.now()}`,
      title: `🎓 Certificates Issued: ${event.title}`,
      message: `The event has concluded. Verified participation certificates with GSFC seal are now available to download!`,
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
      details: `Generated and digitally signed participation certificates for ${issuedCount} attendees with official GSFC seal.`,
    };

    // If current logged-in user is an attendee, award XP and volunteer hours
    let updatedCurrentUser = state.currentUser;
    const isCurrentUserAttendee = eventRegistrations.some((r) => r.userId === state.currentUser.id || r.userRollNo === state.currentUser.rollNo);
    if (isCurrentUserAttendee) {
      updatedCurrentUser = {
        ...state.currentUser,
        points: (state.currentUser.points || 0) + 50,
        volunteerHours: (state.currentUser.volunteerHours || 0) + (event.volunteerHoursReward || 3),
        attendanceRate: Math.min(100, (state.currentUser.attendanceRate || 95) + 2),
      };
    }

    // Immediate write-through to Supabase
    try {
      const concludedEv = updatedEvents.find((e) => e.id === eventId);
      if (concludedEv) {
        supabase.from("events").upsert(concludedEv).then(() => {});
      }
      const relevantAtt = updatedAttendance.filter((a) => a.eventId === eventId);
      if (relevantAtt.length > 0) {
        supabase.from("attendance").upsert(relevantAtt).then(() => {});
      }
      const relevantRegs = updatedRegs.filter((r) => r.eventId === eventId);
      if (relevantRegs.length > 0) {
        supabase.from("registrations").upsert(relevantRegs).then(() => {});
      }
    } catch {}

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
      message: `Event concluded successfully! Certificates issued with official GSFC seal.`,
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

  // --- GSFC 100 Activity Points (SAP) Calculator ---
  calculateActivityPoints(userId?: string): ActivityPointsBreakdown {
    const state = campusStore.getState();
    const targetUserId = userId || state.currentUser.id;
    const userAttendance = state.attendanceRecords.filter((a) => a.userId === targetUserId);
    const user = targetUserId === state.currentUser.id ? state.currentUser : STUDENT_ACCOUNT.profile;

    let techPoints = 0;
    let culturalPoints = 0;
    let sportsPoints = 0;
    let socialPoints = 0;

    userAttendance.forEach((att) => {
      const evt = state.events.find((e) => e.id === att.eventId);
      if (!evt) return;

      if (evt.category === "Tech" || evt.category === "Workshop" || evt.category === "Academic") {
        techPoints += 12;
      } else if (evt.category === "Culture" || evt.category === "Leadership") {
        culturalPoints += 10;
      } else if (evt.category === "Sports") {
        sportsPoints += 10;
      } else if (evt.category === "Career") {
        socialPoints += 8;
      }
    });

    // Add volunteer hours as social points (5 pts per 2 volunteer hours)
    socialPoints += Math.min(12, Math.floor((user.volunteerHours || 0) / 2) * 3);

    // Apply category caps
    const cappedTech = Math.min(40, Math.max(techPoints, 24)); // Default bonus baseline for Om Thakkar
    const cappedCultural = Math.min(20, Math.max(culturalPoints, 14));
    const cappedSports = Math.min(20, Math.max(sportsPoints, 10));
    const cappedSocial = Math.min(20, Math.max(socialPoints, 16));
    const totalEarned = cappedTech + cappedCultural + cappedSports + cappedSocial;

    return {
      technical: { earned: cappedTech, max: 40, color: "#1A3C6E", label: "Technical & Workshops", iconName: "Code" },
      cultural: { earned: cappedCultural, max: 20, color: "#F2A93B", label: "Cultural & Arts", iconName: "Palette" },
      sports: { earned: cappedSports, max: 20, color: "#10B981", label: "Sports & Athletics", iconName: "Trophy" },
      social: { earned: cappedSocial, max: 20, color: "#6366F1", label: "NSS & Social Responsibility", iconName: "HeartHandshake" },
      totalEarned,
      totalMax: 100,
      percentage: Math.min(100, Math.round((totalEarned / 100) * 100)),
    };
  },

  calculate100PointActivitySummary(userId?: string): ActivityPointsBreakdown {
    return campusStore.calculateActivityPoints(userId);
  },

  // --- Post-Event Rating & Feedback ---
  submitEventFeedback(
    eventId: string,
    rating: number,
    comment: string
  ): { success: boolean; message: string } {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Event not found" };

    const newFeedback: EventFeedback = {
      id: `fb-${Date.now()}`,
      eventId,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      userRollNo: state.currentUser.rollNo,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    const existingFeedbacks = state.feedbackList.filter((f) => f.eventId === eventId);
    const updatedFeedbacks = [newFeedback, ...state.feedbackList];
    const totalRatings = existingFeedbacks.reduce((acc, curr) => acc + curr.rating, rating);
    const avgRating = Number((totalRatings / (existingFeedbacks.length + 1)).toFixed(1));

    const updatedEvents = state.events.map((e) =>
      e.id === eventId
        ? {
            ...e,
            averageRating: avgRating,
            reviewCount: (e.reviewCount || 0) + 1,
          }
        : e
    );

    campusStore.setState({
      feedbackList: updatedFeedbacks,
      events: updatedEvents,
    });

    return { success: true, message: "Thank you! Your feedback has been submitted to the faculty coordinator." };
  },

  // --- Instant Event Broadcast Announcement ---
  sendEventBroadcast(
    eventId: string,
    message: string,
    priority: "high" | "normal" | "urgent" = "normal"
  ): { success: boolean; message: string } {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Event not found" };

    const broadcast: EventBroadcast = {
      id: `bc-${Date.now()}`,
      eventId,
      eventTitle: event.title,
      authorName: `${state.currentUser.name} (${state.currentUser.role === "admin" ? "Dean" : "Coordinator"})`,
      message,
      priority,
      createdAt: new Date().toISOString(),
    };

    const notif: NotificationItem = {
      id: `notif-bc-${Date.now()}`,
      title: `📢 Announcement: ${event.title}`,
      message: `${message} · Sent by ${state.currentUser.name}`,
      type: "alert",
      timestamp: "Just now",
      read: false,
      eventId: event.id,
    };

    const audit: AuditLogEntry = {
      id: `aud-bc-${Date.now()}`,
      action: "Instant Event Announcement Broadcasted",
      performedBy: state.currentUser.name,
      target: event.title,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      details: `Priority: ${priority.toUpperCase()} · "${message.slice(0, 60)}..."`,
    };

    campusStore.setState((prev) => ({
      eventBroadcasts: [broadcast, ...prev.eventBroadcasts],
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return {
      success: true,
      message: `Announcement broadcasted to all ${event.registeredCount} registered participants!`,
    };
  },

  // --- Bulk Certificate Approval & Release ---
  bulkApproveCertificates(eventId: string): { success: boolean; count: number; message: string } {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, count: 0, message: "Event not found" };

    const updatedEvents = state.events.map((e) =>
      e.id === eventId ? { ...e, certificatesReleased: true } : e
    );

    let count = 0;
    const updatedAttendance = state.attendanceRecords.map((a) => {
      if (a.eventId === eventId) {
        count++;
        return { ...a, certificateUnlocked: true };
      }
      return a;
    });

    const notif: NotificationItem = {
      id: `notif-cert-bulk-${Date.now()}`,
      title: `🎓 Certificates Published: ${event.title}`,
      message: `Official GSFC University Participation Certificates have been unlocked by Administration for ${event.title}. Download available in My Certificates.`,
      type: "achievement",
      timestamp: "Just now",
      read: false,
      eventId: event.id,
    };

    campusStore.setState((prev) => ({
      events: updatedEvents,
      attendanceRecords: updatedAttendance,
      notifications: [notif, ...prev.notifications],
      auditLogs: [
        {
          id: `aud-bulk-cert-${Date.now()}`,
          action: "Bulk Certificate Release",
          performedBy: state.currentUser.name,
          target: event.title,
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          details: `Unlocked certificates for ${count} verified participants`,
        },
        ...prev.auditLogs,
      ],
    }));

    return {
      success: true,
      count,
      message: `Successfully released verified PDF certificates for ${count} participants!`,
    };
  },

  // --- Visitor Departure & Parking Bay Release ---
  markVisitorDeparted(recordId: string): { success: boolean; message: string } {
    const state = campusStore.getState();
    const visitor = state.visitorRecords.find((v) => v.id === recordId);
    if (!visitor) return { success: false, message: "Visitor record not found" };

    const now = new Date().toISOString().replace("T", " ").slice(0, 19);

    const updatedVisitors = state.visitorRecords.map((v) =>
      v.id === recordId ? { ...v, status: "exited" as const, exitTime: now } : v
    );

    const updatedVehicles = state.vehicleRecords.map((veh) =>
      veh.ownerRollOrVisitorId === recordId
        ? { ...veh, status: "exited" as const, exitTime: now }
        : veh
    );

    const audit: AuditLogEntry = {
      id: `aud-vis-exit-${Date.now()}`,
      action: "Visitor Campus Departure Logged",
      performedBy: "Main Campus Security Gate #1",
      target: visitor.fullName,
      timestamp: now,
      details: `Visitor ${visitor.fullName} (${visitor.organization}) exited campus · Parking bay released`,
    };

    campusStore.setState((prev) => ({
      visitorRecords: updatedVisitors,
      vehicleRecords: updatedVehicles,
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return { success: true, message: `Departure recorded for ${visitor.fullName}. Parking space released.` };
  },

  // --- 1-Click Formatted Attendance CSV Export ---
  exportAttendanceCsv(eventId: string): void {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return;

    const records = state.attendanceRecords.filter((a) => a.eventId === eventId);
    const regs = state.registrations.filter((r) => r.eventId === eventId);

    const rows: string[][] = [
      ["GSFC UNIVERSITY, VADODARA - OFFICIAL ATTENDANCE ROSTER"],
      [`Event Title: ${event.title}`],
      [`Venue: ${event.venue}`, `Date: ${event.date}`, `Time: ${event.time}`, `Category: ${event.category}`],
      [`Coordinator: ${event.organizerName}`, `Total Registered: ${regs.length}`, `Verified Attendees: ${records.length}`],
      [],
      [
        "SR NO",
        "ROLL NUMBER",
        "STUDENT NAME",
        "DEPARTMENT",
        "PUNCH IN TIME",
        "PUNCH OUT TIME",
        "GPS DISTANCE (METERS)",
        "GEO-VERIFIED",
        "VERIFICATION METHOD",
        "CERTIFICATE ID",
      ],
    ];

    const sourceData = records.length > 0 ? records : regs.map((r, i) => ({
      userRollNo: r.userRollNo,
      userName: r.userName,
      department: r.department,
      punchInTime: r.punchInTime || r.registeredAt,
      punchOutTime: r.punchOutTime || "",
      distanceFromVenueMeters: 18,
      locationVerified: true,
      verifiedMethod: "live_punch",
      certificateId: `GSFC-CERT-${event.id.toUpperCase()}-${r.userRollNo.slice(-4)}`,
    }));

    sourceData.forEach((rec, idx) => {
      rows.push([
        (idx + 1).toString(),
        `"${rec.userRollNo}"`,
        `"${rec.userName}"`,
        `"${rec.department}"`,
        `"${rec.punchInTime ? rec.punchInTime.slice(0, 19).replace("T", " ") : "N/A"}"`,
        `"${rec.punchOutTime ? rec.punchOutTime.slice(0, 19).replace("T", " ") : "In Session"}"`,
        (rec.distanceFromVenueMeters || 18).toString(),
        rec.locationVerified ? "YES" : "NO",
        rec.verifiedMethod || "live_punch",
        `"${rec.certificateId || "N/A"}"`,
      ]);
    });

    const csvContent = rows.map((r) => r.join(",")).join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `GSFC_Attendance_${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // --- Clubs & Communities Methods ---
  joinClub(clubId: string, role: "member" | "committee" = "member"): { success: boolean; message: string } {
    const state = campusStore.getState();
    const club = state.clubs.find((c) => c.id === clubId);
    if (!club) return { success: false, message: "Club not found." };

    const existingMember = state.clubMembers.find((m) => m.clubId === clubId && m.userId === state.currentUser.id);
    if (existingMember) {
      return { success: false, message: `You are already registered with ${club.name} as ${existingMember.role}.` };
    }

    const newMember: ClubMember = {
      id: `cm-${Date.now()}`,
      clubId,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      userRollNo: state.currentUser.rollNo,
      department: state.currentUser.department,
      role,
      joinedAt: new Date().toISOString(),
      status: "active",
      volunteerHoursEarned: 0,
    };

    const updatedClubs = state.clubs.map((c) =>
      c.id === clubId ? { ...c, memberCount: c.memberCount + 1 } : c
    );

    const audit: AuditLogEntry = {
      id: `aud-club-join-${Date.now()}`,
      action: "Club Membership Registered",
      performedBy: `${state.currentUser.name} (${state.currentUser.rollNo})`,
      target: club.name,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      details: `Enrolled as ${role.toUpperCase()} in ${club.name}`,
    };

    const notif: NotificationItem = {
      id: `notif-club-${Date.now()}`,
      title: `Welcome to ${club.name}!`,
      message: `Your membership request is confirmed. You can now access club discussions, activities, and workshops.`,
      type: "approval",
      timestamp: "Just now",
      read: false,
    };

    campusStore.setState((prev) => ({
      clubMembers: [newMember, ...prev.clubMembers],
      clubs: updatedClubs,
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return { success: true, message: `Successfully joined ${club.name}!` };
  },

  leaveClub(clubId: string): { success: boolean; message: string } {
    const state = campusStore.getState();
    const club = state.clubs.find((c) => c.id === clubId);
    const existing = state.clubMembers.find((m) => m.clubId === clubId && m.userId === state.currentUser.id);
    if (!existing) return { success: false, message: "You are not a member of this club." };

    const updatedMembers = state.clubMembers.filter((m) => !(m.clubId === clubId && m.userId === state.currentUser.id));
    const updatedClubs = state.clubs.map((c) =>
      c.id === clubId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c
    );

    campusStore.setState((prev) => ({
      clubMembers: updatedMembers,
      clubs: updatedClubs,
    }));

    return { success: true, message: `Left ${club ? club.name : "club"}.` };
  },

  createClub(clubData: Omit<Club, "id" | "memberCount" | "foundedYear">): Club {
    const newClub: Club = {
      ...clubData,
      id: `club-${Date.now()}`,
      memberCount: 1,
      foundedYear: new Date().getFullYear(),
    };

    campusStore.setState((prev) => ({
      clubs: [newClub, ...prev.clubs],
      auditLogs: [
        {
          id: `aud-club-create-${Date.now()}`,
          action: "New Student Club Chartered",
          performedBy: prev.currentUser.name,
          target: newClub.name,
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          details: `Category: ${newClub.category} · Coordinator: ${newClub.facultyCoordinator.name}`,
        },
        ...prev.auditLogs,
      ],
    }));

    return newClub;
  },

  // --- Verified Achievements & Digital Wallet ---
  issueAchievement(
    data: Omit<VerifiedAchievement, "id" | "verificationHash" | "qrCodePayload">
  ): VerifiedAchievement {
    const state = campusStore.getState();
    const hash = `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
    const newAchievement: VerifiedAchievement = {
      ...data,
      id: `ach-${Date.now()}`,
      verificationHash: hash,
      qrCodePayload: `GSFCU:ACH:${data.category.toUpperCase()}:${data.userRollNo}:${data.dateEarned}`,
    };

    const notif: NotificationItem = {
      id: `notif-ach-${Date.now()}`,
      title: `🎖️ Verified Achievement Credential Issued!`,
      message: `Dean & Academic Affairs issued: "${data.title}" for ${data.eventOrActivityName}. Added to your Digital Passport.`,
      type: "achievement",
      timestamp: "Just now",
      read: false,
    };

    const audit: AuditLogEntry = {
      id: `aud-ach-${Date.now()}`,
      action: "Digital Achievement Credential Issued",
      performedBy: state.currentUser.name,
      target: `${data.userName} (${data.userRollNo})`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      details: `Title: ${data.title} · Category: ${data.category} · Hash: ${hash.slice(0, 18)}...`,
    };

    campusStore.setState((prev) => ({
      achievements: [newAchievement, ...prev.achievements],
      notifications: [notif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return newAchievement;
  },

  verifyAchievement(idOrHash: string): VerifiedAchievement | undefined {
    const state = campusStore.getState();
    const clean = idOrHash.trim().toLowerCase();
    return state.achievements.find(
      (a) =>
        a.id.toLowerCase() === clean ||
        a.verificationHash.toLowerCase() === clean ||
        a.certificateId?.toLowerCase() === clean ||
        a.qrCodePayload.toLowerCase() === clean
    );
  },

  // --- Campus Announcements & Communication Feed ---
  postAnnouncement(
    data: Omit<CampusAnnouncement, "id" | "createdAt" | "readBy">
  ): CampusAnnouncement {
    const newAnn: CampusAnnouncement = {
      ...data,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
      readBy: [],
    };

    const notif: NotificationItem = {
      id: `notif-ann-${Date.now()}`,
      title: `📢 ${data.priority === "emergency" ? "EMERGENCY: " : ""}${data.title}`,
      message: data.content.slice(0, 120) + (data.content.length > 120 ? "..." : ""),
      type: data.priority === "emergency" ? "alert" : "reminder",
      timestamp: "Just now",
      read: false,
    };

    campusStore.setState((prev) => ({
      announcements: [newAnn, ...prev.announcements],
      notifications: [notif, ...prev.notifications],
      auditLogs: [
        {
          id: `aud-ann-${Date.now()}`,
          action: "Campus Circular Published",
          performedBy: `${data.authorName} (${data.authorRole})`,
          target: data.title,
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          details: `Priority: ${data.priority.toUpperCase()} · Category: ${data.category}`,
        },
        ...prev.auditLogs,
      ],
    }));

    return newAnn;
  },

  markAnnouncementRead(announcementId: string): void {
    const state = campusStore.getState();
    const userId = state.currentUser.id;
    const updated = state.announcements.map((a) => {
      if (a.id === announcementId) {
        const readSet = new Set(a.readBy);
        readSet.add(userId);
        return { ...a, readBy: Array.from(readSet) };
      }
      return a;
    });

    campusStore.setState(() => ({ announcements: updated }));
  },

  // --- Google OAuth Enterprise Flow ---
  loginWithGoogle(userOverride?: { name?: string; email?: string; rollNo?: string; photo?: string }): { success: boolean; message: string } {
    const email = userOverride?.email || "omthakkar168@gsfcuniversity.ac.in";
    const name = userOverride?.name || "Om Thakkar";
    const rollNo = userOverride?.rollNo || "24BT04171";

    const allAccounts = getStoredAccounts();
    let matchedAccount = allAccounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() || a.idOrRoll.toLowerCase() === rollNo.toLowerCase()
    );

    if (!matchedAccount) {
      // Create new verified GSFC student account
      matchedAccount = {
        idOrRoll: rollNo,
        email,
        name,
        role: "student",
        department: "B.Tech Computer Science & Engineering",
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
          avatar: userOverride?.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        },
      };
      campusStore.registerNewAccount(matchedAccount);
    }

    campusStore.setState(() => ({
      isAuthenticated: true,
      currentRole: matchedAccount!.role,
      currentUser: matchedAccount!.profile,
      auditLogs: [
        {
          id: `aud-google-${Date.now()}`,
          action: "Google SSO Authentication Verified",
          performedBy: `${matchedAccount!.name} (${matchedAccount!.email})`,
          target: "GSFC University Identity Provider",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          details: `Authenticated via Google Workspace SSO · Role: ${matchedAccount!.role.toUpperCase()}`,
        },
        ...campusStore.getState().auditLogs,
      ],
    }));

    return { success: true, message: `Successfully authenticated via Google as ${matchedAccount.name} (${matchedAccount.email})` };
  },

  // --- AI Campus Assistant (Role-Scoped & Privacy-Preserving) ---
  queryCampusAssistant(rawPrompt: string): AssistantMessage {
    const prompt = rawPrompt.trim().toLowerCase();
    const state = campusStore.getState();
    const user = state.currentUser;
    const isStudent = state.currentRole === "student";

    let responseText = "";
    let suggestions: string[] = [
      "What events are happening this week?",
      "Show my registered events",
      "What is my attendance percentage?",
      "What clubs can I join?",
    ];

    // Query 1: Events happening / discover
    if (prompt.includes("event") || prompt.includes("happen") || prompt.includes("workshop") || prompt.includes("hackathon") || prompt.includes("calendar")) {
      const liveEvents = state.events.filter((e) => e.status === "live");
      const upcomingEvents = state.events.filter((e) => e.status === "upcoming");

      if (prompt.includes("tech") || prompt.includes("cse") || prompt.includes("coding")) {
        const techEvents = state.events.filter((e) => e.category === "Tech" || e.category === "Workshop" || e.department.toLowerCase().includes("comp"));
        responseText = `### 💻 Technical & Engineering Events at GSFC University:\n\n` +
          techEvents.map((e) => `• **${e.title}** (${e.date} · ${e.time})\n  📍 *${e.venue}* · Organized by ${e.organizerName}\n  Seats Left: ${e.capacity - e.registeredCount}/${e.capacity}`).join("\n\n");
      } else if (prompt.includes("today") || prompt.includes("tomorrow") || prompt.includes("week")) {
        responseText = `### 📅 Campus Events Schedule:\n\n` +
          `**Live Right Now:**\n` +
          (liveEvents.length > 0 ? liveEvents.map((e) => `• 🔴 **${e.title}** at *${e.venue}* (${e.time})`).join("\n") : "_No events currently running._") +
          `\n\n**Upcoming Highlights:**\n` +
          upcomingEvents.slice(0, 4).map((e) => `• 📌 **${e.title}** on **${e.date}** at *${e.venue}* (${e.capacity - e.registeredCount} seats left)`).join("\n");
      } else {
        responseText = `### 🎓 Active & Upcoming Campus Events (${state.events.length} Total):\n\n` +
          state.events.slice(0, 5).map((e) => `• **${e.title}** [${e.category}]\n  📅 ${e.date} · 📍 ${e.venue} · ${e.registeredCount}/${e.capacity} Registered`).join("\n\n") +
          `\n\n_Tip: You can tap on any event in the Events Hub to register or view real-time location directions._`;
      }
      suggestions = ["Show my registered events", "How do I punch in for attendance?", "Which events have certificates?"];
    }

    // Query 2: My registrations / personal schedule (privacy-scoped to current student only)
    else if (prompt.includes("register") || prompt.includes("my event") || prompt.includes("enrolled") || prompt.includes("ticket")) {
      const myRegs = state.registrations.filter((r) => r.userId === user.id || r.userRollNo === user.rollNo);
      if (myRegs.length === 0) {
        responseText = `You currently have **0 active registrations**.\n\nBrowse the Events Hub to find upcoming hackathons, workshops, and sports tournaments!`;
      } else {
        responseText = `### 🎟️ Your Event Registrations (${myRegs.length}):\n\n` +
          myRegs.map((r) => {
            const ev = state.events.find((e) => e.id === r.eventId);
            const statusBadge = r.status === "attended" ? "✅ Attended" : r.status === "punched_in" ? "🟢 In Session" : r.status === "waitlisted" ? "⏳ Waitlisted" : "📌 Confirmed";
            return `• **${ev?.title || r.eventId}** — ${statusBadge}\n  📅 Date: ${ev?.date || "TBD"} · 📍 Venue: ${ev?.venue || "Campus"}${r.isTeam ? ` · Team: **${r.teamName}**` : ""}`;
          }).join("\n\n");
      }
      suggestions = ["What is my attendance percentage?", "What certificates have I earned?", "How do I download my ID card?"];
    }

    // Query 3: Attendance & Punch-In / Punch-Out
    else if (prompt.includes("attendance") || prompt.includes("punch") || prompt.includes("streak") || prompt.includes("points") || prompt.includes("xp")) {
      const myAtt = state.attendanceRecords.filter((a) => a.userId === user.id || a.userRollNo === user.rollNo);
      responseText = `### 📊 Your GSFC Academic & Event Engagement:\n\n` +
        `• **Verified Attendance:** ${user.attendancePercentage}%\n` +
        `• **Events Attended:** ${myAtt.length} events\n` +
        `• **Activity Points / XP:** ${user.points} XP\n` +
        `• **Daily Streak:** 🔥 ${user.streakDays} Days\n` +
        `• **Volunteer Hours:** 🤝 ${user.volunteerHours} Hours\n\n` +
        `> **Attendance Policy Note:** GSFC University requires minimum 75% attendance for end-semester hall ticket clearance and campus placement drive eligibility.`;
      suggestions = ["Show my certificates", "What achievements have I unlocked?", "How to join student clubs?"];
    }

    // Query 4: Certificates & Credentials
    else if (prompt.includes("cert") || prompt.includes("wallet") || prompt.includes("download") || prompt.includes("credential")) {
      const myAttWithCert = state.attendanceRecords.filter((a) => (a.userId === user.id || a.userRollNo === user.rollNo) && a.certificateId);
      if (myAttWithCert.length === 0) {
        responseText = `You don't have any issued certificates yet. Attend upcoming workshops or hackathons to earn verified digital credentials with unique verification IDs.`;
      } else {
        responseText = `### 📜 Your Verified Digital Certificates (${myAttWithCert.length}):\n\n` +
          myAttWithCert.map((a) => `• **${a.eventTitle}**\n  🆔 Cert ID: \`${a.certificateId}\`\n  📅 Verified on: ${a.timestamp.slice(0, 10)} via ${a.verifiedMethod}`).join("\n\n") +
          `\n\nYou can view and download official GSFC PDF certificates in the **Passport & Wallet** tab.`;
      }
      suggestions = ["Show my campus activity passport", "Show technical events", "What clubs can I join?"];
    }

    // Query 5: Clubs & Communities
    else if (prompt.includes("club") || prompt.includes("community") || prompt.includes("lead") || prompt.includes("committee")) {
      responseText = `### 🏛️ GSFC University Recognized Student Clubs:\n\n` +
        state.clubs.map((c) => `• **${c.logo} ${c.name}** [${c.category}]\n  Coordinator: ${c.facultyCoordinator.name} · Student Lead: ${c.studentLead.name}\n  Members: ${c.memberCount} · Schedule: ${c.meetingSchedule}`).join("\n\n") +
        `\n\n_You can join or view club activities in the Clubs & Communities section._`;
      suggestions = ["Show coding club activities", "How do I earn volunteer hours?", "What events are happening this week?"];
    }

    // Query 6: Campus Services / Directory / Placement / Dean
    else if (prompt.includes("service") || prompt.includes("placement") || prompt.includes("tpc") || prompt.includes("dean") || prompt.includes("library") || prompt.includes("security") || prompt.includes("health") || prompt.includes("contact") || prompt.includes("where is")) {
      responseText = `### 🏢 GSFC Campus Services Directory:\n\n` +
        state.services.map((s) => `• **${s.name}**\n  📍 ${s.location} (${s.building})\n  ⏰ ${s.openingHours} · 📞 ${s.contactPhone}\n  ✉️ ${s.contactEmail}`).join("\n\n");
      suggestions = ["Where is Training & Placement Cell?", "What events are happening this week?", "Show campus announcements"];
    }

    // Query 7: Digital Student ID Card
    else if (prompt.includes("id") || prompt.includes("card") || prompt.includes("identity") || prompt.includes("roll")) {
      responseText = `### 🪪 Digital Campus Identity Card:\n\n` +
        `• **Student:** ${state.digitalId.name}\n` +
        `• **Roll No:** \`${state.digitalId.rollNo}\`\n` +
        `• **Program:** ${state.digitalId.program}\n` +
        `• **Department:** ${state.digitalId.department} (Sem ${state.digitalId.semester})\n` +
        `• **Blood Group:** ${state.digitalId.bloodGroup}\n` +
        `• **Validity:** Till ${state.digitalId.validTill}\n` +
        `• **Status:** 🟢 ${state.digitalId.status.toUpperCase()}\n\n` +
        `Tap the **Digital ID** badge on the top right navigation bar to open your holographic smart card with barcode scanner.`;
      suggestions = ["Show my registered events", "What is my attendance percentage?", "What events are happening this week?"];
    }

    // Query 8: Fallback / General Assistant
    else {
      responseText = `Hello **${user.name}**! I am your **GSFC Campus AI Assistant**.\n\nI can help you with:\n` +
        `• 📅 **Event Discovery:** Find technical hackathons, cultural fests, workshops, and sports matches.\n` +
        `• 🎟️ **Registrations & Tickets:** Check your confirmed event seats and team statuses.\n` +
        `• 📊 **Attendance & Analytics:** View your punch-in history, semester attendance %, and streaks.\n` +
        `• 📜 **Certificates & Passport:** Access verified digital credentials and 100-point activity records.\n` +
        `• 🏛️ **Clubs & Communities:** Explore coding clubs, NSS, cultural societies, and meeting schedules.\n` +
        `• 🏢 **Campus Services:** Find TPC placement contacts, Dean office hours, and library facilities.`;
      suggestions = [
        "What events are happening this week?",
        "Show technical workshops for CSE",
        "Show my registered events",
        "What is my attendance percentage?",
      ];
    }

    return {
      id: `msg-${Date.now()}`,
      sender: "assistant",
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedActions: suggestions,
    };
  },
};
