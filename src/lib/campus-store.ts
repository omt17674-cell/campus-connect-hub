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
  Internship,
  InternshipApplication,
  InternshipAttendanceRecord,
  InternshipApprovalRecord,
  InternshipNotification,
  InternshipMode,
  InternshipStatus,
  InternshipApplicationStatus,
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
import { toast } from "sonner";
import {
  serializeEventForDb,
  serializeRegistrationForDb,
  serializeAttendanceForDb,
  serializeStudentForDb,
  serializeAnnouncementForDb,
  serializeInternshipForDb,
  deserializeInternshipFromDb,
  serializeInternshipApplicationForDb,
  deserializeInternshipApplicationFromDb,
  serializeInternshipAttendanceForDb,
  deserializeInternshipAttendanceFromDb,
  logSupabaseError,
} from "./supabase-mappers";

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
  roleTitle: "GSFC Student",
  roleBadge: "Student",
  name: "GSFC Student",
  idOrRoll: "",
  email: "",
  password: "",
  profile: {
    id: "",
    name: "GSFC Student",
    rollNo: "",
    email: "",
    role: "student",
    department: "Computer Science & Engineering",
    semester: 1,
    avatar: "ST",
    points: 0,
    streakDays: 0,
    volunteerHours: 0,
    attendanceRate: 100,
    badges: [],
  },
};

export const ADMIN_ACCOUNT: CampusAccount = {
  role: "admin",
  roleTitle: "TPC Admin (Dean & Academic Governance)",
  roleBadge: "TPC Admin",
  name: "Dr. Ananya Sharma (Dean)",
  idOrRoll: "ADM-DEAN-001",
  email: "admin.dean@gsfcuniversity.ac.in",
  password: "",
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
  roleTitle: "Placement Faculty Coordinator (Training & Placement / Faculty Organizer)",
  roleBadge: "Placement Faculty Coordinator",
  name: "Prof. Rajiv Mehta (TPC Head)",
  idOrRoll: "TPC-ADMIN-108",
  email: "tpc.admin@gsfcuniversity.ac.in",
  password: "",
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

export const CAMPUS_ACCOUNTS = [ADMIN_ACCOUNT, TPC_ADMIN_ACCOUNT];

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
  internships: Internship[];
  internshipApplications: InternshipApplication[];
  internshipAttendance: InternshipAttendanceRecord[];
  internshipApprovals: InternshipApprovalRecord[];
  internshipNotifications: InternshipNotification[];
}

const INITIAL_USER: UserProfile = STUDENT_ACCOUNT.profile;
let serverSessionToken: string | null = null;
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

export const INITIAL_EVENTS: CampusEvent[] = [];

const INITIAL_REGISTRATIONS: Registration[] = [];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

const INITIAL_VISITORS: VisitorRecord[] = [];

const INITIAL_VEHICLES: VehicleRecord[] = [];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

const INITIAL_BROADCASTS: EventBroadcast[] = [];

const INITIAL_DIGITAL_ID: DigitalStudentIdCard = {
  rollNo: "",
  name: "GSFC Student",
  program: "Bachelor of Technology (B.Tech)",
  department: "Computer Science & Engineering",
  semester: 1,
  validTill: "June 2028",
  bloodGroup: "A+",
  qrVerificationCode: "GSFCU:DIGITAL_ID:STUDENT",
  barcode: "STUDENT",
  photoUrl: "",
  status: "active",
};

const INITIAL_CLUBS: Club[] = [
  {
    id: "club-1",
    name: "GSFC Coding & Robotics Club",
    category: "Technical",
    department: "Computer Science & Engineering",
    description:
      "The premier developer & robotics community at GSFC University. Organizing national hackathons, open-source cohorts, AI bootcamps, and competitive programming meetups.",
    bannerImage:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    logo: "💻",
    facultyCoordinator: {
      name: "Dr. Suresh Rao",
      email: "suresh.rao@gsfcuni.edu",
      department: "CSE Department",
    },
    studentLead: {
      name: "Aarav Patel",
      rollNo: "24BT01002",
      email: "aarav.patel@gsfcuniversity.ac.in",
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
    description:
      "Fostering creative expression, theatre, music, classical dance, painting, and literature across all faculties of GSFC University.",
    bannerImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
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
    description:
      "Nurturing student startup founders, seed pitching, venture incubation, patent filings, and industry mentorship circles.",
    bannerImage:
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
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
    description:
      "Coordinating inter-university leagues in football, cricket, basketball, volleyball, athletics, and chess with professional coaching.",
    bannerImage:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
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
    description:
      "Driving community impact, blood donation drives, environmental tree plantations, rural digital literacy, and NGO partnerships.",
    bannerImage:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
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
    description:
      "Deep dive into real-time robotics programming with ROS2 and ESP32 hardware interfacing.",
    isPublicEvent: true,
    attendanceCount: 0,
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
    attendanceCount: 0,
  },
];

const INITIAL_ACHIEVEMENTS: VerifiedAchievement[] = [];

const INITIAL_ANNOUNCEMENTS: CampusAnnouncement[] = [
  {
    id: "ann-1",
    title: "Official Notice: End-Semester Exam Schedule & Hall Tickets",
    content:
      "The examination schedule for Semester 4, 6, and 8 has been finalized by Academic Governance. Hall tickets with verified attendance eligibility are accessible in the student portal.",
    category: "university",
    authorName: "Dr. Ananya Sharma",
    authorRole: "Dean, Academic Governance",
    departmentTarget: "all",
    priority: "important",
    createdAt: "2026-06-11T09:00:00Z",
    readBy: [],
  },
  {
    id: "ann-2",
    title: "TPC Placement Alert: L&T Infotech & TCS Campus Drives Open",
    content:
      "Online registration for L&T Infotech and TCS campus recruitment drives is now active. B.Tech (CSE/Chemical/Mechanical) students with >= 75% attendance are eligible to apply.",
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
    content:
      "Please note that the South Student Gate will undergo sensor calibration between 02:00 PM and 04:00 PM today. Please use Main Campus Security Gate #1 for entry & vehicle parking.",
    category: "emergency",
    authorName: "Chief Security Officer",
    authorRole: "GSFC Campus Security Command",
    departmentTarget: "all",
    priority: "emergency",
    createdAt: "2026-06-12T10:15:00Z",
    readBy: [],
  },
  {
    id: "ann-4",
    title: "Coding Club Meetup: Microcontroller Hardware Kit Allocation",
    content:
      "Hardware kits, Arduino Nano, and ESP32 boards for the upcoming IoT hackathon can be collected from Computer Center Lab 4 today between 04:00 PM and 06:00 PM.",
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
    description:
      "Corporate recruitment drives, industry internships, resume reviews, mock interviews, and company liaison.",
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
    description:
      "Academic regulations, curriculum governance, attendance exemption appeals, degree certificates, and student affairs.",
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
    description:
      "50,000+ technical volumes, IEEE/ACM digital access, quiet study pods, high-speed WiFi, and journal archives.",
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
    description:
      "GPU compute workstations, 3D printers, ROS robotics hardware testbeds, and hackathon project facilities.",
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
    description:
      "First aid, emergency patient care, ambulance dispatch, routine medical checkups, and mental health counseling.",
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
    description:
      "Visitor gate passes, parking allocation, lost & found counter, CCTV surveillance, and campus vehicle tracking.",
    iconName: "ShieldCheck",
  },
];

export const INITIAL_NEW_STUDENTS: NewRegisteredStudent[] = [];

export const INITIAL_INTERNSHIPS: Internship[] = [
  {
    id: "int-gsfc-01",
    title: "Industrial Process Automation & IoT Intern",
    companyName: "Gujarat State Fertilizers & Chemicals (GSFC) Ltd.",
    description:
      "Work with the Central Instrumentation & IoT Department at GSFC Fertilizernagar complex. Build SCADA integration scripts, telemetry ingestion pipelines, and live predictive maintenance dashboards.",
    department: "Computer Science / Chemical / Mechanical",
    skillsRequired: ["Python", "Industrial IoT", "MQTT", "React", "PostgreSQL"],
    eligibility: "Min CGPA: 7.0, Semester 4 or 6, No active backlogs",
    positions: 4,
    location: "GSFC Fertilizernagar, Vadodara, Gujarat",
    mode: "On-site",
    startDate: "2026-09-01",
    endDate: "2027-02-28",
    duration: "6 Months",
    stipend: "₹25,000 / month",
    workingHours: "09:00 AM - 05:30 PM (Mon-Fri)",
    contactPerson: "Er. Rajesh Varma (Chief Technology Officer)",
    contactEmail: "internships@gsfcltd.com",
    applicationDeadline: "2026-10-31",
    requiredDocuments: ["Resume/CV", "College ID Card", "NOC from Dean"],
    status: "open",
    createdAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "int-tcs-02",
    title: "Full-Stack Cloud & AI Systems Intern",
    companyName: "Tata Consultancy Services (TCS)",
    description:
      "Participate in enterprise cloud modernization, fine-tuning retrieval-augmented generation (RAG) models, and containerized deployment with Kubernetes and Docker.",
    department: "Computer Science & Engineering / IT",
    skillsRequired: ["TypeScript", "Next.js", "Python", "Docker", "AWS / Azure"],
    eligibility: "Min CGPA: 7.5, Semester 6 or 8",
    positions: 6,
    location: "TCS Garima Park, Gandhinagar / Vadodara Sub-Center",
    mode: "Hybrid",
    startDate: "2026-09-15",
    endDate: "2027-03-15",
    duration: "6 Months",
    stipend: "₹30,000 / month",
    workingHours: "09:30 AM - 06:00 PM (Mon-Fri)",
    contactPerson: "Ms. Neha Parikh (Talent Acquisition Lead)",
    contactEmail: "campus.connect@tcs.com",
    applicationDeadline: "2026-11-15",
    requiredDocuments: ["Resume/CV", "Semester Grade Sheets", "College ID"],
    status: "open",
    createdAt: "2026-08-20T10:00:00Z",
  },
  {
    id: "int-ltts-03",
    title: "Smart Mobility & Embedded Edge Intern",
    companyName: "L&T Technology Services",
    description:
      "Design hardware-in-the-loop embedded software, CAN bus diagnostic telemetry, and real-time firmware verification for electric vehicle control units.",
    department: "Electrical / Electronics / Computer Science",
    skillsRequired: ["Embedded C/C++", "RTOS", "CAN Bus", "Microcontrollers"],
    eligibility: "Min CGPA: 6.8, Semester 6 or 8",
    positions: 3,
    location: "L&T Knowledge City, NH-8, Vadodara",
    mode: "On-site",
    startDate: "2026-10-01",
    endDate: "2027-04-01",
    duration: "6 Months",
    stipend: "₹22,000 / month",
    workingHours: "08:30 AM - 05:00 PM (Mon-Fri)",
    contactPerson: "Dr. K. S. Raman (Lead Embedded Systems Architect)",
    contactEmail: "ltts.careers@lnttechservices.com",
    applicationDeadline: "2026-10-25",
    requiredDocuments: ["Resume", "College ID", "Project Portfolio"],
    status: "open",
    createdAt: "2026-08-25T11:00:00Z",
  },
  {
    id: "int-vmc-04",
    title: "Urban Geospatial & Citizen Data Analytics Intern",
    companyName: "Vadodara Smart City Development Ltd.",
    description:
      "Analyze municipal GPS transit patterns, environmental sensors, and optimize smart traffic signal timings using GIS spatial data and dashboards.",
    department: "All Departments (Engineering & Sciences)",
    skillsRequired: ["Data Analytics", "GIS / Geoapify", "Python", "SQL"],
    eligibility: "Min CGPA: 6.5, Semester 4, 6 or 8",
    positions: 5,
    location: "Khanderao Market Complex, Vadodara",
    mode: "Hybrid",
    startDate: "2026-08-01",
    endDate: "2027-01-31",
    duration: "6 Months",
    stipend: "₹18,000 / month",
    workingHours: "10:00 AM - 05:00 PM (Mon-Fri)",
    contactPerson: "Shri Amit Shah (Municipal Analytics Director)",
    contactEmail: "smartcity.internships@vmc.gov.in",
    applicationDeadline: "2026-09-30",
    requiredDocuments: ["Resume", "College ID Card"],
    status: "open",
    createdAt: "2026-08-10T12:00:00Z",
  },
];

export const INITIAL_INTERNSHIP_APPLICATIONS: InternshipApplication[] = [
  {
    id: "app-int-001",
    applicationNumber: "INT-2026-000001",
    internshipId: "int-gsfc-01",
    studentId: "u-student-1",
    fullName: "Om Thakkar",
    enrollmentNumber: "STU-2024-001",
    email: "om.thakkar@gsfcuniversity.ac.in",
    phone: "+91 95584 13347",
    course: "B.Tech",
    branch: "Computer Science & Engineering",
    semester: 4,
    cgpa: 8.9,
    tenthPercentage: 92.4,
    twelfthPercentage: 89.6,
    backlogs: 0,
    academicDetails: { school: "School of Technology (SOT)", degree: "B.Tech CSE" },
    address: {
      street: "Kasturba Hostel - Block B, Room 204",
      city: "Vadodara",
      state: "Gujarat",
      pincode: "391750",
    },
    skills: ["Python", "IoT Systems", "React", "PostgreSQL", "MQTT"],
    projects: "Campus Connect Hub Geofencing Engine, SCADA Sensor Dashboard",
    experience: "Technical Committee Member at Coding & AI Club",
    whyInternship:
      "GSFC Ltd offers an outstanding industrial proving ground to deploy predictive maintenance models on live chemical plant telemetry.",
    careerObjective:
      "To specialize in intelligent industrial automation and high-reliability edge systems.",
    coverLetter:
      "Dear Hiring Team, I am thrilled to apply for the Industrial IoT Internship at GSFC Ltd...",
    declarationAccepted: true,
    status: "APPROVED",
    adminReviewedBy: "Prof. Rajiv Mehta (TPC Head)",
    adminReviewedAt: "2026-09-02T11:00:00Z",
    adminComment:
      "Verified eligibility (8.9 CGPA, 0 backlogs). Academic track record is exceptional. Recommended for Dean approval.",
    deanReviewedBy: "Dr. Ananya Sharma (Dean)",
    deanReviewedAt: "2026-09-03T14:30:00Z",
    deanComment:
      "Formally approved and sanctioned. Student is officially registered for GSFC Ltd industrial internship and granted attendance punch access.",
    approvedAt: "2026-09-03T14:30:00Z",
    createdAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-03T14:30:00Z",
  },
  {
    id: "app-int-002",
    applicationNumber: "INT-2026-000002",
    internshipId: "int-tcs-02",
    studentId: "u-student-2",
    fullName: "Priya Patel",
    enrollmentNumber: "STU-2024-002",
    email: "priya.patel@gsfcuniversity.ac.in",
    phone: "+91 98765 43210",
    course: "B.Tech",
    branch: "Computer Science & Engineering",
    semester: 6,
    cgpa: 8.4,
    tenthPercentage: 88.5,
    twelfthPercentage: 86.2,
    backlogs: 0,
    skills: ["TypeScript", "Next.js", "Docker", "Python"],
    whyInternship: "Passionate about enterprise microservices and building scalable RAG pipelines.",
    careerObjective: "Full-stack cloud engineering architect.",
    declarationAccepted: true,
    status: "ADMIN_REVIEW",
    createdAt: "2026-09-18T14:20:00Z",
  },
  {
    id: "app-int-003",
    applicationNumber: "INT-2026-000003",
    internshipId: "int-ltts-03",
    studentId: "u-student-3",
    fullName: "Rohan Dave",
    enrollmentNumber: "STU-2024-003",
    email: "rohan.dave@gsfcuniversity.ac.in",
    phone: "+91 98250 12345",
    course: "B.Tech",
    branch: "Mechanical Engineering",
    semester: 6,
    cgpa: 8.1,
    tenthPercentage: 85.0,
    twelfthPercentage: 82.5,
    backlogs: 0,
    skills: ["Embedded C", "RTOS", "CAD / SolidWorks", "CAN Bus"],
    whyInternship: "Desire hands-on electric vehicle powertrain diagnostics at L&T Knowledge City.",
    declarationAccepted: true,
    status: "DEAN_REVIEW",
    adminReviewedBy: "Prof. Rajiv Mehta (TPC Head)",
    adminReviewedAt: "2026-09-18T16:45:00Z",
    adminComment: "Eligible and recommended. Completed prerequisites.",
    createdAt: "2026-09-17T09:15:00Z",
  },
];

export const INITIAL_INTERNSHIP_ATTENDANCE: InternshipAttendanceRecord[] = [
  {
    id: "att-int-01",
    applicationId: "app-int-001",
    studentId: "u-student-1",
    internshipId: "int-gsfc-01",
    attendanceDate: "2026-09-18",
    punchInTime: "2026-09-18T09:12:00Z",
    punchInLatitude: 22.3688,
    punchInLongitude: 73.1893,
    punchInAccuracy: 12,
    punchInAddress: "GSFC Fertilizernagar Plant Complex, Vadodara, Gujarat",
    punchOutTime: "2026-09-18T17:42:00Z",
    punchOutLatitude: 22.3689,
    punchOutLongitude: 73.1894,
    punchOutAccuracy: 14,
    punchOutAddress: "GSFC Fertilizernagar Plant Complex, Vadodara, Gujarat",
    workingDuration: "8h 30m",
    status: "present",
    createdAt: "2026-09-18T09:12:00Z",
    updatedAt: "2026-09-18T17:42:00Z",
  },
];

export const INITIAL_INTERNSHIP_APPROVALS: InternshipApprovalRecord[] = [
  {
    id: "apprv-01",
    applicationId: "app-int-001",
    approvalType: "ADMIN",
    approvedBy: "Prof. Rajiv Mehta (TPC Head)",
    status: "approved",
    comment: "Verified eligibility (8.9 CGPA, 0 backlogs). Forwarded to Dean.",
    approvedAt: "2026-09-02T11:00:00Z",
    createdAt: "2026-09-02T11:00:00Z",
  },
  {
    id: "apprv-02",
    applicationId: "app-int-001",
    approvalType: "DEAN",
    approvedBy: "Dr. Ananya Sharma (Dean)",
    status: "approved",
    comment: "Formally approved and sanctioned. Student granted attendance punch access.",
    approvedAt: "2026-09-03T14:30:00Z",
    createdAt: "2026-09-03T14:30:00Z",
  },
];

export const INITIAL_INTERNSHIP_NOTIFICATIONS: InternshipNotification[] = [
  {
    id: "notif-int-01",
    studentId: "u-student-1",
    applicationId: "app-int-001",
    type: "active",
    title: "Internship Approved & Activated!",
    message:
      "Your application INT-2026-000001 for GSFC Ltd has been fully approved by Dean Dr. Ananya Sharma. You are now authorized to log GPS attendance.",
    isRead: false,
    createdAt: "2026-09-03T14:31:00Z",
  },
];

const STORAGE_KEY = "gsfc_campus_connect_state_v6";
const ACCOUNTS_STORAGE_KEY = "gsfc_campus_accounts_v5";

export function getStoredAccounts(): CampusAccount[] {
  const defaultAccounts = [STUDENT_ACCOUNT, ADMIN_ACCOUNT, TPC_ADMIN_ACCOUNT];
  if (typeof window === "undefined") return defaultAccounts;
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed: CampusAccount[] = JSON.parse(raw);
      const merged = [...parsed];
      for (const def of defaultAccounts) {
        if (
          !merged.some(
            (a) =>
              a.email.toLowerCase() === def.email.toLowerCase() ||
              a.idOrRoll.toLowerCase() === def.idOrRoll.toLowerCase(),
          )
        ) {
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
    const sanitized = accounts.map((acc) => ({
      ...acc,
      password: "", // Security: Never persist plaintext passwords into browser localStorage
    }));
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(sanitized));
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
      internships: INITIAL_INTERNSHIPS,
      internshipApplications: INITIAL_INTERNSHIP_APPLICATIONS,
      internshipAttendance: INITIAL_INTERNSHIP_ATTENDANCE,
      internshipApprovals: INITIAL_INTERNSHIP_APPROVALS,
      internshipNotifications: INITIAL_INTERNSHIP_NOTIFICATIONS,
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
        ? parsed.registrations.filter(
            (r: Registration) => !["reg-1", "reg-2", "reg-3", "reg-4"].includes(r.id),
          )
        : [];
      const mergedRegs = [...existingRegs];
      for (const defReg of INITIAL_REGISTRATIONS) {
        if (
          !mergedRegs.some(
            (r) =>
              r.id === defReg.id ||
              (r.eventId === defReg.eventId &&
                (r.userId === defReg.userId || r.userRollNo === defReg.userRollNo)),
          )
        ) {
          mergedRegs.push(defReg);
        }
      }

      // Clean legacy dummy attendance records
      const existingAtt: AttendanceRecord[] = Array.isArray(parsed.attendanceRecords)
        ? parsed.attendanceRecords.filter(
            (a: AttendanceRecord) => !["att-1", "att-2"].includes(a.id),
          )
        : [];
      const mergedAtt = [...existingAtt];
      for (const defAtt of INITIAL_ATTENDANCE) {
        if (
          !mergedAtt.some(
            (a) =>
              a.id === defAtt.id ||
              (a.eventId === defAtt.eventId &&
                (a.userId === defAtt.userId || a.userRollNo === defAtt.userRollNo)),
          )
        ) {
          mergedAtt.push(defAtt);
        }
      }

      // Merge visitor records
      const existingVisitors: VisitorRecord[] = Array.isArray(parsed.visitorRecords)
        ? parsed.visitorRecords
        : [];
      const mergedVisitors = [...existingVisitors];
      for (const defVis of INITIAL_VISITORS) {
        if (!mergedVisitors.some((v) => v.id === defVis.id)) {
          mergedVisitors.push(defVis);
        }
      }

      // Merge vehicle records
      const existingVehicles: VehicleRecord[] = Array.isArray(parsed.vehicleRecords)
        ? parsed.vehicleRecords
        : [];
      const mergedVehicles = [...existingVehicles];
      for (const defVeh of INITIAL_VEHICLES) {
        if (
          !mergedVehicles.some(
            (v) => v.id === defVeh.id || v.vehicleNumber === defVeh.vehicleNumber,
          )
        ) {
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
        if (
          !mergedClubMembers.some(
            (cm) =>
              cm.id === defCm.id || (cm.clubId === defCm.clubId && cm.userId === defCm.userId),
          )
        ) {
          mergedClubMembers.push(defCm);
        }
      }

      // Merge club activities
      const existingActivities: ClubActivity[] = Array.isArray(parsed.clubActivities)
        ? parsed.clubActivities
        : [];
      const mergedActivities = [...existingActivities];
      for (const defAct of INITIAL_CLUB_ACTIVITIES) {
        if (!mergedActivities.some((a) => a.id === defAct.id)) {
          mergedActivities.push(defAct);
        }
      }

      // Merge achievements (clean dummy records)
      const existingAchievements: VerifiedAchievement[] = Array.isArray(parsed.achievements)
        ? parsed.achievements.filter(
            (a: VerifiedAchievement) => !["ach-1", "ach-2", "ach-3"].includes(a.id),
          )
        : [];
      const mergedAchievements = [...existingAchievements];
      for (const defAch of INITIAL_ACHIEVEMENTS) {
        if (!mergedAchievements.some((a) => a.id === defAch.id)) {
          mergedAchievements.push(defAch);
        }
      }

      // Merge announcements
      const existingAnnouncements: CampusAnnouncement[] = Array.isArray(parsed.announcements)
        ? parsed.announcements
        : [];
      const mergedAnnouncements = [...existingAnnouncements];
      for (const defAnn of INITIAL_ANNOUNCEMENTS) {
        if (!mergedAnnouncements.some((a) => a.id === defAnn.id)) {
          mergedAnnouncements.push(defAnn);
        }
      }

      // Merge services
      const existingServices: CampusService[] = Array.isArray(parsed.services)
        ? parsed.services
        : [];
      const mergedServices = [...existingServices];
      for (const defSrv of INITIAL_SERVICES) {
        if (!mergedServices.some((s) => s.id === defSrv.id)) {
          mergedServices.push(defSrv);
        }
      }

      // Merge new registered students
      const existingStudents: NewRegisteredStudent[] = Array.isArray(parsed.newRegisteredStudents)
        ? parsed.newRegisteredStudents
        : [];
      const mergedStudents = [...existingStudents];
      for (const defStu of INITIAL_NEW_STUDENTS) {
        if (!mergedStudents.some((s) => s.rollNo.toUpperCase() === defStu.rollNo.toUpperCase())) {
          mergedStudents.push(defStu);
        }
      }

      // Merge internships
      const existingInternships: Internship[] = Array.isArray(parsed.internships)
        ? parsed.internships
        : [];
      const mergedInternships = [...existingInternships];
      for (const defInt of INITIAL_INTERNSHIPS) {
        if (!mergedInternships.some((i) => i.id === defInt.id)) {
          mergedInternships.push(defInt);
        }
      }

      // Merge internship applications
      const existingApps: InternshipApplication[] = Array.isArray(parsed.internshipApplications)
        ? parsed.internshipApplications
        : [];
      const mergedApps = [...existingApps];
      for (const defApp of INITIAL_INTERNSHIP_APPLICATIONS) {
        if (!mergedApps.some((a) => a.id === defApp.id)) {
          mergedApps.push(defApp);
        }
      }

      // Merge internship attendance
      const existingIntAtt: InternshipAttendanceRecord[] = Array.isArray(
        parsed.internshipAttendance,
      )
        ? parsed.internshipAttendance
        : [];
      const mergedIntAtt = [...existingIntAtt];
      for (const defAtt of INITIAL_INTERNSHIP_ATTENDANCE) {
        if (!mergedIntAtt.some((a) => a.id === defAtt.id)) {
          mergedIntAtt.push(defAtt);
        }
      }

      // Merge internship approvals
      const existingApprv: InternshipApprovalRecord[] = Array.isArray(parsed.internshipApprovals)
        ? parsed.internshipApprovals
        : [];
      const mergedApprv = [...existingApprv];
      for (const defAp of INITIAL_INTERNSHIP_APPROVALS) {
        if (!mergedApprv.some((a) => a.id === defAp.id)) {
          mergedApprv.push(defAp);
        }
      }

      // Merge internship notifications
      const existingIntNotif: InternshipNotification[] = Array.isArray(
        parsed.internshipNotifications,
      )
        ? parsed.internshipNotifications
        : [];
      const mergedIntNotif = [...existingIntNotif];
      for (const defNot of INITIAL_INTERNSHIP_NOTIFICATIONS) {
        if (!mergedIntNotif.some((n) => n.id === defNot.id)) {
          mergedIntNotif.push(defNot);
        }
      }

      const cleanCurrentUser = parsed.currentUser || INITIAL_USER;

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
        internships: mergedInternships,
        internshipApplications: mergedApps,
        internshipAttendance: mergedIntAtt,
        internshipApprovals: mergedApprv,
        internshipNotifications: mergedIntNotif,
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
    internships: INITIAL_INTERNSHIPS,
    internshipApplications: INITIAL_INTERNSHIP_APPLICATIONS,
    internshipAttendance: INITIAL_INTERNSHIP_ATTENDANCE,
    internshipApprovals: INITIAL_INTERNSHIP_APPROVALS,
    internshipNotifications: INITIAL_INTERNSHIP_NOTIFICATIONS,
  };
}
let realtimeChannelInitialized = false;

// Concurrency locks to prevent double-submissions under 100+ concurrent user spikes
const inFlightApplications = new Set<string>();
const inFlightPunches = new Set<string>();

/**
 * Optimized Realtime Sync:
 * Removed global wildcard listener that caused 9x query cascades on every database change.
 */
export function initSupabaseRealtimeSync() {
  // Global wildcard disabled to prevent server overload and query storms
}

/**
 * Scoped realtime subscription for an individual student.
 * Subscribes strictly to notifications and application updates where student_id matches.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeStudentInternshipRealtime(
  studentId: string,
  onUpdate?: () => void,
): () => void {
  if (typeof window === "undefined" || !studentId) return () => {};
  try {
    const channelName = `student-int-${studentId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "internship_notifications",
          filter: `student_id=eq.${studentId}`,
        },
        () => {
          if (onUpdate) onUpdate();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "internship_applications",
          filter: `student_id=eq.${studentId}`,
        },
        () => {
          if (onUpdate) onUpdate();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.debug("Student realtime sub error:", err);
    return () => {};
  }
}

/**
 * Scoped realtime subscription for Administration / Dean review queues.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeAdminInternshipRealtime(onUpdate?: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  try {
    const channel = supabase
      .channel("admin-internship-queue")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "internship_applications",
        },
        () => {
          if (onUpdate) onUpdate();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.debug("Admin realtime sub error:", err);
    return () => {};
  }
}

export async function syncStateToSupabase(state: CampusState): Promise<void> {
  if (typeof window === "undefined" || !navigator.onLine) return;
  try {
    // 1. Sync events asynchronously
    if (state.events && state.events.length > 0) {
      const mappedEvents = state.events.map(serializeEventForDb);
      const { error: evErr } = await supabase.from("events").upsert(mappedEvents);
      if (evErr) logSupabaseError("upsert", "events", evErr);
    }
    // 2. Sync registrations
    if (state.registrations && state.registrations.length > 0) {
      const mappedRegs = state.registrations.map(serializeRegistrationForDb);
      const { error: regErr } = await supabase.from("registrations").upsert(mappedRegs);
      if (regErr) logSupabaseError("upsert", "registrations", regErr);
    }
    // 3. Sync attendance
    if (state.attendanceRecords && state.attendanceRecords.length > 0) {
      const mappedAtt = state.attendanceRecords.map(serializeAttendanceForDb);
      const { error: attErr } = await supabase.from("attendance").upsert(mappedAtt);
      if (attErr) logSupabaseError("upsert", "attendance", attErr);
    }
    // 4. Sync announcements
    if (state.announcements && state.announcements.length > 0) {
      const mappedAnn = state.announcements.map(serializeAnnouncementForDb);
      const { error: annErr } = await supabase.from("announcements").upsert(mappedAnn);
      if (annErr) logSupabaseError("upsert", "announcements", annErr);
    }
    // 5. Sync newly registered students
    if (state.newRegisteredStudents && state.newRegisteredStudents.length > 0) {
      const mappedStudents = state.newRegisteredStudents.map(serializeStudentForDb);
      const { error: stuErr } = await supabase
        .from("new_registered_students")
        .upsert(mappedStudents, { onConflict: "roll_no" });
      if (stuErr) logSupabaseError("upsert", "new_registered_students", stuErr);
    }

    // 6. Sync current active student to accounts & new_registered_students
    if (
      state.isAuthenticated &&
      state.currentUser &&
      state.currentUser.rollNo &&
      state.currentRole === "student"
    ) {
      const u = state.currentUser;
      const dbAcc = {
        id: `u-${u.rollNo.toLowerCase()}`,
        name: u.name,
        roll_no: u.rollNo,
        email: u.email || `${u.rollNo.toLowerCase()}@gsfcuniversity.ac.in`,
        role: "student",
        department: u.department || "Computer Science & Engineering",
        semester: u.semester || 4,
        year: Math.ceil((u.semester || 4) / 2) || 2,
        attendance_percentage: u.attendanceRate || 100,
        points: u.points || 100,
        streak_days: u.streakDays || 1,
        volunteer_hours: u.volunteerHours || 0,
        avatar: u.avatar || u.name?.slice(0, 2).toUpperCase() || "ST",
        mobile_number: u.mobileNumber || null,
        created_at: new Date().toISOString(),
      };
      await supabase.from("accounts").upsert(dbAcc, { onConflict: "roll_no" });
    }
  } catch (err) {
    logSupabaseError("background_sync", "all_tables", err);
  }
}

let isSyncingFromRemote = false;
let activeSyncPromise: Promise<void> | null = null;
let lastSyncTimestamp = 0;
const MIN_SYNC_INTERVAL_MS = 2500;

export function saveState(state: CampusState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!isSyncingFromRemote) {
      syncStateToSupabase(state);
    }
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

  async registerNewStudent(
    student: NewRegisteredStudent,
  ): Promise<{ success: boolean; message?: string }> {
    if (typeof window !== "undefined" && navigator.onLine) {
      try {
        const dbStudent = serializeStudentForDb(student);
        const { error: stuErr } = await supabase
          .from("new_registered_students")
          .upsert(dbStudent, { onConflict: "roll_no" });
        if (stuErr) {
          logSupabaseError("upsert", "new_registered_students", stuErr);
          return { success: false, message: stuErr.message };
        }

        const initials =
          student.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "ST";

        const dbAccount = {
          id: `u-${student.rollNo.toLowerCase()}`,
          name: student.fullName,
          roll_no: student.rollNo,
          email: student.email,
          role: "student",
          department: student.department,
          semester: student.semester || 4,
          year: Math.ceil((student.semester || 4) / 2) || 2,
          attendance_percentage: 100,
          points: 100,
          streak_days: 1,
          volunteer_hours: 0,
          avatar: initials,
          mobile_number: student.mobileNumber,
          created_at: new Date().toISOString(),
        };
        const { error: accErr } = await supabase
          .from("accounts")
          .upsert(dbAccount, { onConflict: "roll_no" });
        if (accErr) {
          logSupabaseError("upsert", "accounts", accErr);
        }

        campusStore.setState((prev) => {
          const filtered = (prev.newRegisteredStudents || []).filter(
            (s) => s.rollNo.toUpperCase() !== student.rollNo.toUpperCase(),
          );
          return { newRegisteredStudents: [student, ...filtered] };
        });

        return { success: true };
      } catch (err: any) {
        logSupabaseError("upsert_catch", "new_registered_students", err);
        return { success: false, message: err.message };
      }
    }
    return { success: true };
  },

  updateStudentProfile(student: NewRegisteredStudent) {
    campusStore.setState((prev) => {
      const updatedList = (prev.newRegisteredStudents || []).map((s) =>
        s.id === student.id || s.rollNo.toUpperCase() === student.rollNo.toUpperCase()
          ? { ...s, ...student }
          : s,
      );
      return { newRegisteredStudents: updatedList };
    });
  },

  /**
   * Dedicated, un-debounced Student Registry refresh querying server-side endpoint.
   * Ensures instant refresh on realtime events and manual admin triggers.
   */
  async refreshStudentRegistry(
    force = true,
  ): Promise<{ success: boolean; count: number; error?: string }> {
    if (typeof window === "undefined")
      return { success: false, count: 0, error: "Window undefined" };
    try {
      const res = await fetch("/api/students/registry?page=1&pageSize=100");
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.students)) {
        campusStore.setState(() => ({
          newRegisteredStudents: data.students,
        }));
        return { success: true, count: data.total || data.students.length };
      }
      return { success: false, count: 0, error: data?.message || "Invalid response format" };
    } catch (err: any) {
      console.warn("[campusStore] refreshStudentRegistry error:", err);
      return { success: false, count: 0, error: err.message || "Failed to load registry" };
    }
  },

  async loadFromSupabase(force = false): Promise<void> {
    if (typeof window === "undefined" || !navigator.onLine) return;
    initSupabaseRealtimeSync();

    // If an in-flight sync is already running, deduplicate and await the same promise
    if (activeSyncPromise) {
      return activeSyncPromise;
    }

    // Debounce rapid successive calls within MIN_SYNC_INTERVAL_MS unless explicitly forced
    const now = Date.now();
    if (!force && now - lastSyncTimestamp < MIN_SYNC_INTERVAL_MS) {
      return;
    }

    activeSyncPromise = (async () => {
      isSyncingFromRemote = true;
      try {
        // Run remote table queries in parallel with a 6000ms timeout cap
        const timeoutPromise = new Promise<{ isTimeout: true }>((resolve) =>
          setTimeout(() => resolve({ isTimeout: true }), 6000),
        );

        const fetchBatch = Promise.allSettled([
          // 1. Events (scalable university limit)
          supabase.from("events").select("*").limit(250).order("date", { ascending: true }),
          // 2. Registrations
          supabase
            .from("registrations")
            .select("*")
            .limit(500)
            .order("registered_at", { ascending: false }),
          // 3. Attendance
          supabase
            .from("attendance")
            .select("*")
            .limit(500)
            .order("timestamp", { ascending: false }),
          // 4. Students & Accounts
          Promise.allSettled([
            supabase
              .from("new_registered_students")
              .select("*")
              .limit(500)
              .order("created_at", { ascending: false }),
            supabase.from("accounts").select("*").limit(500),
          ]),
          // 5. Announcements
          supabase
            .from("announcements")
            .select("*")
            .limit(100)
            .order("created_at", { ascending: false }),
          // 6. Internships
          supabase
            .from("internships")
            .select("*")
            .limit(200)
            .order("created_at", { ascending: false }),
          // 7. Internship Applications
          supabase
            .from("internship_applications")
            .select("*")
            .limit(500)
            .order("created_at", { ascending: false }),
          // 8. Internship Attendance
          supabase
            .from("internship_attendance")
            .select("*")
            .limit(500)
            .order("punch_in_time", { ascending: false }),
          // 9. Internship Notifications
          supabase
            .from("internship_notifications")
            .select("*")
            .limit(200)
            .order("created_at", { ascending: false }),
        ]);

        const outcome = await Promise.race([fetchBatch, timeoutPromise]);
        if ("isTimeout" in outcome) {
          console.warn(
            "Supabase initial load timed out after 6000ms; continuing with cached data.",
          );
          return;
        }

        const [evRes, regRes, attRes, stuGroupRes, annRes, intRes, appRes, intAttRes, intNotifRes] =
          outcome;

        // 1. Process Events
        if (evRes.status === "fulfilled" && !evRes.value.error && Array.isArray(evRes.value.data)) {
          const eventsList: CampusEvent[] = (evRes.value.data as any[]).map((ev) => ({
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
          }));
          campusStore.setState((prev) => {
            const remoteIds = new Set(eventsList.map((e) => e.id));
            const localOnly = prev.events.filter((e) => !remoteIds.has(e.id));
            return { events: [...eventsList, ...localOnly] };
          });
        }

        // 2. Process Registrations
        if (
          regRes.status === "fulfilled" &&
          !regRes.value.error &&
          Array.isArray(regRes.value.data)
        ) {
          const regsList: Registration[] = (regRes.value.data as any[]).map((r) => ({
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
          }));
          campusStore.setState(() => ({ registrations: regsList }));
        }

        // 3. Process Attendance
        if (
          attRes.status === "fulfilled" &&
          !attRes.value.error &&
          Array.isArray(attRes.value.data)
        ) {
          const attList: AttendanceRecord[] = (attRes.value.data as any[]).map((a) => ({
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
          }));
          campusStore.setState(() => ({ attendanceRecords: attList }));
        }

        // 4. Process New Registered Students & Accounts
        if (stuGroupRes.status === "fulfilled") {
          const [studentsRes, accountsRes] = stuGroupRes.value;
          const supaStudents =
            studentsRes.status === "fulfilled" && !studentsRes.value.error
              ? studentsRes.value.data
              : null;
          const supaAccounts =
            accountsRes.status === "fulfilled" && !accountsRes.value.error
              ? accountsRes.value.data
              : null;

          const studentMap = new Map<string, NewRegisteredStudent>();

          if (supaStudents && Array.isArray(supaStudents)) {
            supaStudents.forEach((d: any) => {
              const s: NewRegisteredStudent = {
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
                hostelBlockOrBusRoute:
                  d.hostel_block_or_bus_route || d.hostelBlockOrBusRoute || "Campus Resident",
                clubsInterested: d.clubs_interested || d.clubsInterested || [],
                idCardUploaded: Boolean(d.id_card_uploaded ?? d.idCardUploaded ?? false),
                isLocked: true,
                verifiedByUniversity: Boolean(
                  d.verified_by_university ?? d.verifiedByUniversity ?? false,
                ),
                createdAt: d.created_at || d.createdAt || new Date().toISOString(),
              };
              if (s.rollNo && s.rollNo !== "N/A") {
                studentMap.set(s.rollNo.toUpperCase(), s);
              }
            });
          }

          if (supaAccounts && Array.isArray(supaAccounts)) {
            supaAccounts.forEach((acc: any) => {
              const roll = (acc.roll_no || "").toUpperCase();
              if (roll && !studentMap.has(roll)) {
                studentMap.set(roll, {
                  id: `stu-${roll.toLowerCase()}`,
                  fullName: acc.name,
                  mobileNumber: acc.mobile_number || "Not provided",
                  rollNo: roll,
                  email: acc.email,
                  school: "School of Technology (SOT)",
                  department: acc.department || "Computer Science & Engineering",
                  degree: "B.Tech",
                  semester: acc.semester || 4,
                  residenceType: "hostel",
                  hostelBlockOrBusRoute: "Campus Resident",
                  clubsInterested: ["Coding & AI Club"],
                  idCardUploaded: false,
                  isLocked: true,
                  verifiedByUniversity: Boolean(acc.is_verified ?? false),
                  createdAt: acc.created_at || new Date().toISOString(),
                });
              }
            });
          }

          const studentList = Array.from(studentMap.values());
          campusStore.setState((prev) => {
            let updatedCurrentUser = prev.currentUser;
            if (prev.isAuthenticated && prev.currentRole === "student" && prev.currentUser.rollNo) {
              const myRecord = studentMap.get(prev.currentUser.rollNo.toUpperCase());
              if (myRecord) {
                updatedCurrentUser = {
                  ...prev.currentUser,
                  name: myRecord.fullName || prev.currentUser.name,
                  mobileNumber:
                    myRecord.mobileNumber &&
                    myRecord.mobileNumber !== "N/A" &&
                    myRecord.mobileNumber !== "Not provided"
                      ? myRecord.mobileNumber
                      : prev.currentUser.mobileNumber,
                  school: myRecord.school || prev.currentUser.school,
                  degree: myRecord.degree || prev.currentUser.degree,
                  department: myRecord.department || prev.currentUser.department,
                  semester: myRecord.semester || prev.currentUser.semester,
                  residenceType: myRecord.residenceType || prev.currentUser.residenceType,
                  hostelBlockOrBusRoute:
                    myRecord.hostelBlockOrBusRoute || prev.currentUser.hostelBlockOrBusRoute,
                  clubsInterested: myRecord.clubsInterested || prev.currentUser.clubsInterested,
                };
              }
            }
            return {
              newRegisteredStudents: studentList,
              currentUser: updatedCurrentUser,
            };
          });
        }

        // 5. Process Announcements
        if (
          annRes.status === "fulfilled" &&
          !annRes.value.error &&
          Array.isArray(annRes.value.data) &&
          annRes.value.data.length > 0
        ) {
          campusStore.setState((prev) => {
            const map = new Map<string, CampusAnnouncement>();
            prev.announcements.forEach((a) => map.set(a.id, a));
            (annRes.value.data as any[]).forEach((ann) => {
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

        // 6. Process Internships
        if (
          intRes.status === "fulfilled" &&
          !intRes.value.error &&
          Array.isArray(intRes.value.data) &&
          intRes.value.data.length > 0
        ) {
          const remoteInternships = (intRes.value.data as any[]).map(deserializeInternshipFromDb);
          campusStore.setState((prev) => {
            const remoteIds = new Set(remoteInternships.map((i: any) => i.id));
            const localOnly = (prev.internships || []).filter((i) => !remoteIds.has(i.id));
            return { internships: [...remoteInternships, ...localOnly] };
          });
        }

        // 7. Process Internship Applications
        if (
          appRes.status === "fulfilled" &&
          !appRes.value.error &&
          Array.isArray(appRes.value.data) &&
          appRes.value.data.length > 0
        ) {
          const remoteApps = (appRes.value.data as any[]).map(
            deserializeInternshipApplicationFromDb,
          );
          campusStore.setState((prev) => {
            const remoteIds = new Set(remoteApps.map((a: any) => a.id));
            const localOnly = (prev.internshipApplications || []).filter(
              (a) => !remoteIds.has(a.id),
            );
            return { internshipApplications: [...remoteApps, ...localOnly] };
          });

          // Migrate this student's legacy local-only applications after the table is available.
          const currentUser = campusStore.getState().currentUser;
          const localStudentApplications = (campusStore.getState().internshipApplications || []).filter(
            (application) =>
              !remoteApps.some((remote) => remote.id === application.id) &&
              (application.studentId === currentUser.id ||
                application.enrollmentNumber.toUpperCase() === (currentUser.rollNo || "").toUpperCase()),
          );
          await Promise.all(
            localStudentApplications.map(async (application) => {
              try {
                const response = await fetch("/api/internships/applications", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    application: serializeInternshipApplicationForDb(application),
                  }),
                });
                if (!response.ok) {
                  console.warn("Could not migrate local internship application", application.id);
                }
              } catch (error) {
                console.warn("Local internship application migration deferred", error);
              }
            }),
          );
        }

        // 8. Process Internship Attendance
        if (
          intAttRes.status === "fulfilled" &&
          !intAttRes.value.error &&
          Array.isArray(intAttRes.value.data) &&
          intAttRes.value.data.length > 0
        ) {
          const remoteAtt = (intAttRes.value.data as any[]).map(
            deserializeInternshipAttendanceFromDb,
          );
          campusStore.setState((prev) => {
            const remoteIds = new Set(remoteAtt.map((a: any) => a.id));
            const localOnly = (prev.internshipAttendance || []).filter((a) => !remoteIds.has(a.id));
            return { internshipAttendance: [...remoteAtt, ...localOnly] };
          });
        }

        // 9. Process Internship Notifications
        if (
          intNotifRes.status === "fulfilled" &&
          !intNotifRes.value.error &&
          Array.isArray(intNotifRes.value.data) &&
          intNotifRes.value.data.length > 0
        ) {
          const remoteNotifs = (intNotifRes.value.data as any[]).map((n: any) => ({
            id: n.id,
            studentId: n.student_id,
            applicationId: n.application_id,
            type: n.type,
            title: n.title,
            message: n.message,
            isRead: Boolean(n.is_read),
            createdAt: n.created_at,
          }));
          campusStore.setState((prev) => {
            const remoteIds = new Set(remoteNotifs.map((n: any) => n.id));
            const localOnly = (prev.internshipNotifications || []).filter(
              (n) => !remoteIds.has(n.id),
            );
            return { internshipNotifications: [...remoteNotifs, ...localOnly] };
          });
        }
      } catch (e) {
        console.debug("Supabase load note:", e);
      } finally {
        isSyncingFromRemote = false;
        lastSyncTimestamp = Date.now();
        activeSyncPromise = null;
      }
    })();

    return activeSyncPromise;
  },

  registerNewAccount(account: CampusAccount) {
    const current = getStoredAccounts();
    const filtered = current.filter(
      (a) =>
        a.email.toLowerCase() !== account.email.toLowerCase() &&
        a.idOrRoll.toLowerCase() !== account.idOrRoll.toLowerCase(),
    );
    const updated = [account, ...filtered];
    saveStoredAccounts(updated);
    CAMPUS_ACCOUNTS.length = 0;
    CAMPUS_ACCOUNTS.push(...updated);
  },

  loginWithAccount(account: CampusAccount, sessionToken?: string) {
    if (sessionToken) {
      serverSessionToken = sessionToken;
      // Save token to localStorage for API calls
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", sessionToken);
      }
    }
    const currentState = campusStore.getState();
    const cleanRoll = (account.profile?.rollNo || account.idOrRoll || "").toUpperCase();
    const cleanEmail = (account.email || account.profile?.email || "").toLowerCase();
    const matchedStudent = currentState.newRegisteredStudents?.find(
      (s) =>
        (cleanRoll && s.rollNo?.toUpperCase() === cleanRoll) ||
        (cleanEmail && s.email?.toLowerCase() === cleanEmail),
    );

    const mergedProfile: UserProfile = {
      ...account.profile,
      mobileNumber:
        account.profile?.mobileNumber ||
        (matchedStudent?.mobileNumber &&
        matchedStudent.mobileNumber !== "N/A" &&
        matchedStudent.mobileNumber !== "Not provided"
          ? matchedStudent.mobileNumber
          : undefined),
      school: matchedStudent?.school || account.profile?.school,
      degree: matchedStudent?.degree || account.profile?.degree,
      residenceType: matchedStudent?.residenceType || account.profile?.residenceType,
      hostelBlockOrBusRoute:
        matchedStudent?.hostelBlockOrBusRoute || account.profile?.hostelBlockOrBusRoute,
      clubsInterested: matchedStudent?.clubsInterested || account.profile?.clubsInterested,
    };

    const accountToSave: CampusAccount = {
      ...account,
      profile: mergedProfile,
    };

    campusStore.registerNewAccount(accountToSave);
    campusStore.setState((prev) => ({
      isAuthenticated: true,
      currentRole: account.role,
      currentUser: mergedProfile,
      digitalId:
        account.role === "student"
          ? {
              ...prev.digitalId,
              name: mergedProfile.name,
              rollNo: mergedProfile.rollNo,
              department: mergedProfile.department,
              semester: mergedProfile.semester,
              qrVerificationCode: `GSFCU:DIGITAL_ID:${mergedProfile.rollNo}`,
              barcode: mergedProfile.rollNo,
              photoUrl: mergedProfile.avatar || prev.digitalId.photoUrl,
            }
          : prev.digitalId,
    }));
    // Load fresh data from Supabase immediately after login (force=true bypasses debounce)
    if (typeof window !== "undefined") {
      campusStore.loadFromSupabase(true).catch(() => {});
    }
  },

  loginWithCredentials(
    identifier: string,
    role: UserRole,
  ): { success: boolean; message: string; account?: CampusAccount } {
    const cleanId = identifier.trim().toLowerCase();
    const allAccounts = getStoredAccounts();

    const account = allAccounts.find(
      (acc) =>
        acc.role === role &&
        (acc.email.toLowerCase() === cleanId ||
          acc.idOrRoll.toLowerCase() === cleanId ||
          cleanId.includes(acc.idOrRoll.toLowerCase()) ||
          cleanId.includes(acc.email.split("@")[0].toLowerCase())),
    );

    if (account) {
      campusStore.loginWithAccount(account);
      return { success: true, message: `Welcome back, ${account.name}!`, account };
    }

    return { success: false, message: "Invalid credentials or unauthorized role." };
  },

  logout() {
    try {
      supabase.auth.signOut().catch(() => {});
    } catch {}
    campusStore.setState(() => ({
      isAuthenticated: false,
      currentUser: INITIAL_USER,
      currentRole: "student",
      digitalId: INITIAL_DIGITAL_ID,
    }));
    serverSessionToken = null;
  },

  getServerSessionToken() {
    return serverSessionToken;
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

  async registerForEvent(
    eventId: string,
    isTeam = false,
    teamName?: string,
    teamMembers?: Array<{ name: string; rollNo: string; email: string }>,
  ): Promise<{ success: boolean; message: string; waitlisted?: boolean }> {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) {
      toast.error("Registration failed: Event not found");
      return { success: false, message: "Event not found" };
    }

    const existing = state.registrations.find(
      (r) => r.eventId === eventId && r.userId === state.currentUser.id,
    );
    if (existing) {
      toast.info(`Already registered as ${existing.status}`);
      return { success: false, message: `Already registered as ${existing.status}` };
    }

    const isFull = event.registeredCount >= event.capacity;
    const regStatus = isFull
      ? "waitlisted"
      : event.approvalRequired
        ? "pending_approval"
        : "confirmed";

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

    const targetEv: CampusEvent = {
      ...event,
      registeredCount:
        !isFull && regStatus === "confirmed" ? event.registeredCount + 1 : event.registeredCount,
      waitlistCount: isFull ? event.waitlistCount + 1 : event.waitlistCount,
    };

    const updatedEvents = state.events.map((e) => (e.id === eventId ? targetEv : e));

    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: isFull
        ? `Added to Waitlist: ${event.title}`
        : `Registration Confirmed: ${event.title}`,
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

    // Save snapshot for rollback if database write fails
    const previousState = {
      registrations: [...state.registrations],
      events: [...state.events],
      notifications: [...state.notifications],
      auditLogs: [...state.auditLogs],
    };

    // 1. Optimistically update local store
    campusStore.setState((prev) => ({
      registrations: [newRegistration, ...prev.registrations],
      events: updatedEvents,
      notifications: [newNotification, ...prev.notifications],
      auditLogs: [auditEntry, ...prev.auditLogs],
    }));

    // 2. Perform Database Writes to Supabase
    try {
      // Step A: Upsert EVENT first and confirm it succeeded (parent record for FK constraint)
      const serializedEv = serializeEventForDb(targetEv);
      const { error: evError } = await supabase.from("events").upsert(serializedEv);

      if (evError) {
        console.error("[Supabase Error] Event capacity upsert failed:", evError, {
          targetEv,
          serializedEv,
        });
        logSupabaseError("upsert", "events", evError, { targetEv, serializedEv });
        // Rollback optimistic update
        campusStore.setState(() => previousState);
        const errMsg = `Registration failed: Could not update event capacity (${evError.message})`;
        toast.error(errMsg);
        return { success: false, message: errMsg };
      }

      // Step B: Upsert REGISTRATION record
      const serializedReg = serializeRegistrationForDb(newRegistration);
      const { error: regError } = await supabase.from("registrations").upsert(serializedReg);

      if (regError) {
        console.error("[Supabase Error] Registration upsert failed:", regError, {
          newRegistration,
          serializedReg,
        });
        logSupabaseError("upsert", "registrations", regError, { newRegistration, serializedReg });
        // Rollback optimistic update
        campusStore.setState(() => previousState);
        const errMsg = `Registration failed: Database write rejected (${regError.message})`;
        toast.error(errMsg);
        return { success: false, message: errMsg };
      }

      // Step C: Also notify REST API gateway for server-side persistence
      fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: newRegistration.eventId,
          userId: newRegistration.userId,
          userRollNo: newRegistration.userRollNo,
          userName: newRegistration.userName,
          department: newRegistration.department,
          isTeam: newRegistration.isTeam,
          teamName: newRegistration.teamName,
          teamMembers: newRegistration.teamMembers,
        }),
      }).catch((e) => console.debug("API Gateway registration background sync notice:", e));

      toast.success(
        isFull
          ? `Added to waitlist for ${event.title}`
          : `🎉 Successfully registered for ${event.title}!`,
      );

      return {
        success: true,
        message: isFull ? "Added to waitlist" : "Registration successful!",
        waitlisted: isFull,
      };
    } catch (err: any) {
      console.error("[Supabase Error] registerForEvent exception:", err);
      logSupabaseError("registerForEvent", "registrations/events", err);
      campusStore.setState(() => previousState);
      const errMsg = `Registration failed: ${err?.message || "Unexpected network error"}`;
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  },

  async recordCheckIn(
    eventId: string,
    token: string,
    forcedOffline = false,
    locationData?: {
      latitude: number;
      longitude: number;
      distanceMeters: number;
      verified: boolean;
      accuracy?: number;
      capturedAt?: string;
    },
  ): Promise<{ success: boolean; offlineQueued: boolean; message: string; record?: AttendanceRecord }> {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, offlineQueued: false, message: "Event not found." };

    // Check if already checked in
    const existingCheckIn = state.attendanceRecords.find(
      (a) => a.eventId === eventId && a.userId === state.currentUser.id,
    );
    if (existingCheckIn) {
      return {
        success: false,
        offlineQueued: false,
        message: "Attendance already verified for this event!",
      };
    }

    const isOffline =
      state.isOffline || forcedOffline || (typeof navigator !== "undefined" && !navigator.onLine);

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
        r.eventId === eventId && r.userId === state.currentUser.id
          ? { ...r, status: "attended" as const }
          : r,
      );

      campusStore.setState((prev) => ({
        pendingCheckins: [pending, ...prev.pendingCheckins],
        registrations: updatedRegs,
      }));

      return {
        success: true,
        offlineQueued: true,
        message:
          "Offline: Check-in saved securely on device with location metadata. Will auto-sync when online.",
      };
    }

    const sessionToken = serverSessionToken;
    if (!sessionToken) {
      return {
        success: false,
        offlineQueued: false,
        message: "Your authenticated session has expired. Please sign in again.",
      };
    }

    const serverResponse = await fetch("/api/attendance/check-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        eventId,
        token,
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
        accuracy: locationData?.accuracy,
        capturedAt: locationData?.capturedAt,
      }),
    });
    const serverResult = await serverResponse.json().catch(() => null);
    if (!serverResponse.ok || !serverResult?.success) {
      return {
        success: false,
        offlineQueued: false,
        message: serverResult?.message || "Attendance could not be verified by the server.",
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
      const mappedAtt = serializeAttendanceForDb(newRecord);
      supabase
        .from("attendance")
        .upsert(mappedAtt)
        .then(({ error }) => {
          if (error) {
            logSupabaseError("upsert", "attendance", error, { newRecord, mappedAtt });
            toast.error(`Check-in sync warning: ${error.message}`);
          }
        });
    } catch (err) {
      logSupabaseError("recordCheckIn", "attendance", err);
    }

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
      r.eventId === eventId && r.userId === state.currentUser.id
        ? { ...r, status: "attended" as const }
        : r,
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
    locationData?: {
      latitude: number;
      longitude: number;
      distanceMeters: number;
      verified: boolean;
      address?: string;
    },
  ): { success: boolean; message: string; record?: AttendanceRecord } {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Event not found" };

    const now = new Date().toISOString();
    const certId = `GSFC-CERT-${event.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${state.currentUser.rollNo.slice(-4)}-${Date.now().toString(36).toUpperCase()}`;

    // Check if an attendance record already exists
    let existingRecord = state.attendanceRecords.find(
      (a) => a.eventId === eventId && a.userId === state.currentUser.id,
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
        locationAddress: locationData?.address,
      };
      updatedAttendance = [existingRecord, ...updatedAttendance];
    } else {
      updatedAttendance = updatedAttendance.map((a) =>
        a.id === existingRecord!.id
          ? {
              ...a,
              punchInTime: now,
              locationVerified: locationData?.verified ?? a.locationVerified,
              userLatitude: locationData?.latitude ?? a.userLatitude,
              userLongitude: locationData?.longitude ?? a.userLongitude,
              distanceFromVenueMeters: locationData?.distanceMeters ?? a.distanceFromVenueMeters,
              locationAddress: locationData?.address ?? a.locationAddress,
            }
          : a,
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
        : r,
    );

    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action: "Event Punch-In Recorded",
      performedBy: `${state.currentUser.name} (${state.currentUser.rollNo})`,
      target: event.title,
      timestamp: now.replace("T", " ").slice(0, 19),
      details: `Punch-In at ${now.slice(11, 16)} · GPS: ${locationData?.distanceMeters || 18}m from ${event.venue} (${locationData?.address || "Geoapify Verified"})`,
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
      message: `Punched In successfully for ${event.title} at ${event.venue}! Location: ${locationData?.address || "Campus Verified"}`,
      record: existingRecord,
    };
  },

  punchOut(
    eventId: string,
    locationData?: {
      latitude: number;
      longitude: number;
      distanceMeters: number;
      verified: boolean;
      address?: string;
    },
  ): { success: boolean; message: string; record?: AttendanceRecord } {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Event not found" };

    const now = new Date().toISOString();
    const existingRecord = state.attendanceRecords.find(
      (a) => a.eventId === eventId && a.userId === state.currentUser.id,
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
            locationAddress: locationData?.address ?? a.locationAddress,
          }
        : a,
    );

    const updatedRegs = state.registrations.map((r) =>
      r.eventId === eventId && r.userId === state.currentUser.id
        ? {
            ...r,
            status: "attended" as const,
            punchOutTime: now,
            punchOutLocation: locationData,
          }
        : r,
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

  async createEvent(
    eventData: Omit<CampusEvent, "id" | "registeredCount" | "waitlistCount" | "status">,
  ): Promise<{ success: boolean; event: CampusEvent; error?: string }> {
    const state = campusStore.getState();
    const isDeanAdmin = state.currentRole === "admin";
    const status: CampusEvent["status"] = isDeanAdmin
      ? "upcoming"
      : eventData.approvalRequired
        ? "pending_approval"
        : "upcoming";

    // Create temporary ID for optimistic UI only (NOT for database)
    const tempId = `temp-evt-${Date.now()}`;

    const tempEvent: CampusEvent = {
      ...eventData,
      id: tempId,
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
      target: tempEvent.title,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      details: `Status: ${status} · Capacity: ${tempEvent.capacity} · Dept: ${tempEvent.department}`,
    };

    // Save snapshot for rollback if database write fails
    const previousState = {
      events: [...campusStore.getState().events],
      auditLogs: [...campusStore.getState().auditLogs],
    };

    // Optimistically update local store with TEMPORARY event
    campusStore.setState((prev) => ({
      events: [tempEvent, ...prev.events],
      auditLogs: [auditEntry, ...prev.auditLogs],
    }));

    // Use backend API endpoint to create event (server generates real ID)
    if (typeof window !== "undefined" && navigator.onLine) {
      try {
        const token = localStorage.getItem("authToken") || "";
        
        console.log('[EVENT_CREATE_FRONTEND] REQUEST_SENT', { tempId });
        
        const response = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Send WITHOUT id - let server generate it
          body: JSON.stringify({
            title: eventData.title,
            description: eventData.description,
            category: eventData.category,
            department: eventData.department,
            date: eventData.date,
            time: eventData.time,
            venue: eventData.venue,
            venueLatitude: eventData.venueLatitude,
            venueLongitude: eventData.venueLongitude,
            allowedRadiusMeters: eventData.allowedRadiusMeters,
            organizerName: eventData.organizerName,
            organizerEmail: eventData.organizerEmail,
            capacity: eventData.capacity,
            approvalRequired: eventData.approvalRequired,
            isTeamEvent: eventData.isTeamEvent,
            minTeamSize: eventData.minTeamSize,
            maxTeamSize: eventData.maxTeamSize,
            volunteerHoursReward: eventData.volunteerHoursReward,
            bannerImage: eventData.bannerImage,
            rules: eventData.rules,
          }),
        });

        console.log('[EVENT_CREATE_FRONTEND] RESPONSE_STATUS', { status: response.status });

        const result = await response.json();

        if (!response.ok) {
          console.error('[EVENT_CREATE_FRONTEND] RESPONSE_ERROR', { status: response.status, message: result.message });
          logSupabaseError("api_post", "events", new Error(result.message || `HTTP ${response.status}`));
          // Roll back optimistic update - use real database event or remove temporary
          campusStore.setState(() => previousState);
          toast.error(
            result.message || `Event creation failed. Please try again.`,
            { duration: 8000 },
          );
          return { success: false, event: tempEvent, error: result.message };
        }

        // Success: Remove temporary event, add REAL database event
        if (result.success && result.event) {
          console.log('[EVENT_CREATE_FRONTEND] REPLACE_TEMP_WITH_REAL', { tempId, realId: result.event.id });
          campusStore.setState((prev) => ({
            events: [
              result.event, // Add real database event
              ...prev.events.filter(e => e.id !== tempId), // Remove temporary event
            ],
          }));
          toast.success(`Event created successfully!`, { duration: 5000 });
          return { success: true, event: result.event };
        } else {
          throw new Error(result.message || 'Unexpected response format');
        }

      } catch (err: any) {
        console.error('[EVENT_CREATE_FRONTEND] EXCEPTION', { error: err.message });
        logSupabaseError("api_catch", "events", err);
        // Roll back optimistic update
        campusStore.setState(() => previousState);
        toast.error(
          err.message || `Network error. Please check your connection and try again.`,
          { duration: 8000 },
        );
        return { success: false, event: tempEvent, error: err.message };
      }
    }

    return { success: true, event: tempEvent };
  },

  async approveEvent(eventId: string): Promise<boolean> {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    const previousEvents = [...state.events];
    const previousAuditLogs = [...state.auditLogs];
    const audit: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action: "Event Approved by Dean",
      performedBy: "Dr. Ananya Sharma (Admin)",
      target: event?.title || eventId,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      details: "Event status transitioned from pending_approval to upcoming",
    };

    campusStore.setState((prev) => ({
      events: prev.events.map((e) => (e.id === eventId ? { ...e, status: "upcoming" } : e)),
      auditLogs: [audit, ...prev.auditLogs],
    }));

    if (typeof window !== "undefined" && navigator.onLine) {
      try {
        const { error } = await supabase
          .from("events")
          .update({ status: "upcoming" })
          .eq("id", eventId);

        if (error) {
          logSupabaseError("update", "events", error);
          campusStore.setState(() => ({ events: previousEvents, auditLogs: previousAuditLogs }));
          toast.error(`❌ Failed to approve event in database: ${error.message}. Please try again.`, { duration: 8000 });
          return false;
        }
        toast.success(`Event approved and published to campus directory!`);
      } catch (err: any) {
        logSupabaseError("update_catch", "events", err);
        campusStore.setState(() => ({ events: previousEvents, auditLogs: previousAuditLogs }));
        toast.error(`❌ Failed to approve event — network error: ${err.message || "Failed to reach database"}`, { duration: 8000 });
        return false;
      }
    }
    return true;
  },

  async rejectEvent(eventId: string): Promise<boolean> {
    const previousEvents = [...campusStore.getState().events];

    campusStore.setState((prev) => ({
      events: prev.events.map((e) => (e.id === eventId ? { ...e, status: "rejected" } : e)),
    }));

    if (typeof window !== "undefined" && navigator.onLine) {
      try {
        const { error } = await supabase
          .from("events")
          .update({ status: "rejected" })
          .eq("id", eventId);

        if (error) {
          logSupabaseError("update", "events", error);
          campusStore.setState(() => ({ events: previousEvents }));
          toast.error(`❌ Failed to reject event in database: ${error.message}. Please try again.`, { duration: 8000 });
          return false;
        }
        toast.info("Event proposal rejected.");
      } catch (err: any) {
        logSupabaseError("update_catch", "events", err);
        campusStore.setState(() => ({ events: previousEvents }));
        toast.error(`❌ Failed to reject event — network error: ${err.message || "Failed to reach database"}`, { duration: 8000 });
        return false;
      }
    }
    return true;
  },

  async updateEventStatus(eventId: string, status: EventStatus): Promise<boolean> {
    const previousState = {
      events: [...campusStore.getState().events],
      auditLogs: [...campusStore.getState().auditLogs],
    };

    campusStore.setState((prev) => {
      const event = prev.events.find((e) => e.id === eventId);
      const audit: AuditLogEntry = {
        id: `aud-${Date.now()}`,
        action: `Event Status Changed to ${status.toUpperCase()}`,
        performedBy: `${prev.currentUser.name} (${prev.currentUser.role})`,
        target: event?.title || eventId,
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        details: `Administrator updated event status to ${status}`,
      };
      return {
        events: prev.events.map((e) => (e.id === eventId ? { ...e, status } : e)),
        auditLogs: [audit, ...prev.auditLogs],
      };
    });

    if (typeof window !== "undefined" && navigator.onLine) {
      try {
        const { error } = await supabase.from("events").update({ status }).eq("id", eventId);

        if (error) {
          logSupabaseError("update", "events", error);
          campusStore.setState(() => previousState);
          toast.error(`❌ Failed to update event status: ${error.message}. Please try again.`, { duration: 8000 });
          return false;
        }
      } catch (err: any) {
        logSupabaseError("update_catch", "events", err);
        campusStore.setState(() => previousState);
        toast.error(`❌ Failed to update event status — network error: ${err.message || "Failed to reach database"}`, { duration: 8000 });
        return false;
      }
    }
    return true;
  },

  updateRegistrationStatus(registrationId: string, status: Registration["status"]) {
    const now = new Date().toISOString();
    campusStore.setState((prev) => {
      const targetReg = prev.registrations.find((r) => r.id === registrationId);
      if (!targetReg) return prev;

      const punchInTime =
        status === "punched_in" || status === "attended"
          ? targetReg.punchInTime || now
          : targetReg.punchInTime;

      const punchOutTime =
        status === "attended"
          ? targetReg.punchOutTime || now
          : status === "punched_in"
            ? undefined
            : targetReg.punchOutTime;

      const updatedRegs = prev.registrations.map((r) =>
        r.id === registrationId
          ? {
              ...r,
              status,
              punchInTime,
              punchOutTime,
            }
          : r,
      );

      // Also ensure attendanceRecords has an entry for this student & event
      const existingAtt = prev.attendanceRecords.find(
        (a) => a.eventId === targetReg.eventId && a.userId === targetReg.userId,
      );

      let updatedAttRecords = prev.attendanceRecords;
      if (status === "punched_in" || status === "attended") {
        if (existingAtt) {
          updatedAttRecords = prev.attendanceRecords.map((a) =>
            a.id === existingAtt.id
              ? {
                  ...a,
                  punchInTime: a.punchInTime || punchInTime,
                  punchOutTime:
                    status === "attended" ? a.punchOutTime || punchOutTime : a.punchOutTime,
                  verifiedMethod: a.verifiedMethod || "manual_override",
                  synced: true,
                }
              : a,
          );
        } else {
          const newRecord: AttendanceRecord = {
            id: `att-${Date.now()}-${targetReg.userId.slice(-4)}`,
            eventId: targetReg.eventId,
            userId: targetReg.userId,
            userName: targetReg.userName,
            userRollNo: targetReg.userRollNo,
            department: targetReg.department,
            timestamp: punchInTime || now,
            punchInTime: punchInTime || now,
            punchOutTime: status === "attended" ? punchOutTime || now : undefined,
            verifiedMethod: "manual_override",
            tokenUsed: "ADMIN-OVERRIDE",
            synced: true,
            distanceFromVenueMeters: 12,
            certificateId: `GSFC-CERT-${targetReg.eventId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${targetReg.userRollNo.replace(/[^a-zA-Z0-9]/g, "").slice(-4)}`,
          };
          updatedAttRecords = [newRecord, ...prev.attendanceRecords];
        }
      }

      return {
        registrations: updatedRegs,
        attendanceRecords: updatedAttRecords,
      };
    });
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
    const currentFeedbacks = [
      ...state.feedbackList.filter((f) => f.eventId === eventId),
      newFeedback,
    ];
    const avg = currentFeedbacks.reduce((sum, f) => sum + f.rating, 0) / currentFeedbacks.length;

    const updatedEvents = state.events.map((e) =>
      e.id === eventId
        ? { ...e, averageRating: Number(avg.toFixed(1)), reviewCount: currentFeedbacks.length }
        : e,
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
      message:
        "Urgent: 8 students have fallen below the mandatory 75% semester attendance threshold. Automated notices dispatched to academic mentors.",
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

  endAndConcludeEvent(eventId: string): {
    success: boolean;
    message: string;
    attendeesCount: number;
  } {
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

        const existingAtt = updatedAttendance.find(
          (a) => a.eventId === eventId && a.userId === r.userId,
        );
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
        : e,
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
    const isCurrentUserAttendee = eventRegistrations.some(
      (r) => r.userId === state.currentUser.id || r.userRollNo === state.currentUser.rollNo,
    );
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
        supabase
          .from("events")
          .upsert(serializeEventForDb(concludedEv))
          .then(({ error }) => {
            if (error) {
              logSupabaseError("upsert", "events", error);
              toast.error(`Event conclude sync error: ${error.message}`);
            }
          });
      }
      const relevantAtt = updatedAttendance.filter((a) => a.eventId === eventId);
      if (relevantAtt.length > 0) {
        supabase
          .from("attendance")
          .upsert(relevantAtt.map(serializeAttendanceForDb))
          .then(({ error }) => {
            if (error) {
              logSupabaseError("upsert", "attendance", error);
              toast.error(`Attendance finalize sync error: ${error.message}`);
            }
          });
      }
      const relevantRegs = updatedRegs.filter((r) => r.eventId === eventId);
      if (relevantRegs.length > 0) {
        supabase
          .from("registrations")
          .upsert(relevantRegs.map(serializeRegistrationForDb))
          .then(({ error }) => {
            if (error) {
              logSupabaseError("upsert", "registrations", error);
              toast.error(`Registration finalize sync error: ${error.message}`);
            }
          });
      }
    } catch (err) {
      logSupabaseError("concludeEvent", "multiple_tables", err);
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
      message: `Event concluded successfully! Certificates issued with official GSFC seal.`,
      attendeesCount: issuedCount,
    };
  },

  toggleEventCertificateRelease(
    eventId: string,
    forceRelease?: boolean,
  ): { success: boolean; message: string; released: boolean } {
    const state = campusStore.getState();
    const event = state.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Event not found", released: false };

    const nextReleased = forceRelease !== undefined ? forceRelease : !event.certificatesReleased;
    const now = new Date().toISOString();

    const updatedEvents = state.events.map((e) =>
      e.id === eventId ? { ...e, certificatesReleased: nextReleased } : e,
    );

    const updatedRegs = state.registrations.map((r) =>
      r.eventId === eventId ? { ...r, certificateUnlocked: nextReleased } : r,
    );

    const updatedAtt = state.attendanceRecords.map((a) =>
      a.eventId === eventId ? { ...a, certificateUnlocked: nextReleased } : a,
    );

    const notif: NotificationItem = {
      id: `notif-cert-rel-${Date.now()}`,
      title: nextReleased
        ? `🎓 Certificate Access Granted: ${event.title}`
        : `🔒 Certificate Access Locked: ${event.title}`,
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
      action: nextReleased
        ? "Certificate Access Granted (Admin Release)"
        : "Certificate Access Locked (Admin)",
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

  toggleStudentCertificateAccess(
    eventId: string,
    userId: string,
  ): { success: boolean; unlocked: boolean } {
    const state = campusStore.getState();
    const reg = state.registrations.find((r) => r.eventId === eventId && r.userId === userId);
    if (!reg) return { success: false, unlocked: false };

    const event = state.events.find((e) => e.id === eventId);
    const nextUnlocked = !reg.certificateUnlocked;
    const now = new Date().toISOString();

    const updatedRegs = state.registrations.map((r) =>
      r.eventId === eventId && r.userId === userId
        ? { ...r, certificateUnlocked: nextUnlocked }
        : r,
    );

    const updatedAtt = state.attendanceRecords.map((a) =>
      a.eventId === eventId && a.userId === userId
        ? { ...a, certificateUnlocked: nextUnlocked }
        : a,
    );

    const audit: AuditLogEntry = {
      id: `aud-stu-cert-${Date.now()}`,
      action: nextUnlocked
        ? "Student Certificate Access Granted"
        : "Student Certificate Access Revoked",
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
    // Secure randomized 6-digit OTP per session
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
      userLatitude: data.userLatitude || 22.359,
      userLongitude: data.userLongitude || 73.167,
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
      v.id === visitorId ? { ...v, status: "exited" as const, exitTime: now } : v,
    );

    const updatedVehicles = state.vehicleRecords.map((veh) =>
      veh.ownerRollOrVisitorId === visitorId
        ? { ...veh, status: "exited" as const, exitTime: now }
        : veh,
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
      v.id === vehicleId ? { ...v, status: "exited" as const, exitTime: now } : v,
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
  }): {
    success: boolean;
    attendanceRecord: AttendanceRecord;
    vehicleRecord?: VehicleRecord;
    message: string;
  } {
    const state = campusStore.getState();
    const now = new Date().toISOString();
    const event = state.events.find((e) => e.id === data.eventId) || state.events[0];

    const matchedStudent = state.newRegisteredStudents?.find(
      (s) => s.rollNo?.toUpperCase() === data.studentRollNo?.toUpperCase(),
    );
    const studentName =
      state.currentUser.rollNo === data.studentRollNo
        ? state.currentUser.name
        : matchedStudent?.fullName || state.currentUser.name || "Student";
    const studentDept =
      state.currentUser.rollNo === data.studentRollNo
        ? state.currentUser.department
        : matchedStudent?.department || state.currentUser.department || "School of Technology";
    const userId =
      state.currentUser.rollNo === data.studentRollNo
        ? state.currentUser.id
        : `u-${data.studentRollNo.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

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
      locationAddress: data.location.address,
      mobileNumber: data.mobileNumber,
      otpVerified: true,
      barcodeScanned: true,
      barcodeValue: data.barcodeValue || data.studentRollNo,
      vehicleId: vehicleRecord?.id,
      vehicleNumber: vehicleRecord?.vehicleNumber,
    };

    const existingReg = state.registrations.find(
      (r) => r.eventId === event.id && r.userId === userId,
    );
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
          : r,
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
      attendanceRecords: [
        attRecord,
        ...prev.attendanceRecords.filter((a) => !(a.eventId === event.id && a.userId === userId)),
      ],
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
    const user =
      targetUserId === state.currentUser.id ? state.currentUser : STUDENT_ACCOUNT.profile;

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
    const cappedTech = Math.min(40, techPoints);
    const cappedCultural = Math.min(20, culturalPoints);
    const cappedSports = Math.min(20, sportsPoints);
    const cappedSocial = Math.min(20, socialPoints);
    const totalEarned = cappedTech + cappedCultural + cappedSports + cappedSocial;

    return {
      technical: {
        earned: cappedTech,
        max: 40,
        color: "#1A3C6E",
        label: "Technical & Workshops",
        iconName: "Code",
      },
      cultural: {
        earned: cappedCultural,
        max: 20,
        color: "#F2A93B",
        label: "Cultural & Arts",
        iconName: "Palette",
      },
      sports: {
        earned: cappedSports,
        max: 20,
        color: "#10B981",
        label: "Sports & Athletics",
        iconName: "Trophy",
      },
      social: {
        earned: cappedSocial,
        max: 20,
        color: "#6366F1",
        label: "NSS & Social Responsibility",
        iconName: "HeartHandshake",
      },
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
    comment: string,
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
        : e,
    );

    campusStore.setState({
      feedbackList: updatedFeedbacks,
      events: updatedEvents,
    });

    return {
      success: true,
      message: "Thank you! Your feedback has been submitted to the faculty coordinator.",
    };
  },

  // --- Instant Event Broadcast Announcement ---
  sendEventBroadcast(
    eventId: string,
    message: string,
    priority: "high" | "normal" | "urgent" = "normal",
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
      e.id === eventId ? { ...e, certificatesReleased: true } : e,
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
      v.id === recordId ? { ...v, status: "exited" as const, exitTime: now } : v,
    );

    const updatedVehicles = state.vehicleRecords.map((veh) =>
      veh.ownerRollOrVisitorId === recordId
        ? { ...veh, status: "exited" as const, exitTime: now }
        : veh,
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

    return {
      success: true,
      message: `Departure recorded for ${visitor.fullName}. Parking space released.`,
    };
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
      [
        `Venue: ${event.venue}`,
        `Date: ${event.date}`,
        `Time: ${event.time}`,
        `Category: ${event.category}`,
      ],
      [
        `Coordinator: ${event.organizerName}`,
        `Total Registered: ${regs.length}`,
        `Verified Attendees: ${records.length}`,
      ],
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

    const sourceData =
      records.length > 0
        ? records
        : regs.map((r, i) => ({
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
    link.setAttribute(
      "download",
      `GSFC_Attendance_${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // --- Clubs & Communities Methods ---
  joinClub(
    clubId: string,
    role: "member" | "committee" = "member",
  ): { success: boolean; message: string } {
    const state = campusStore.getState();
    const club = state.clubs.find((c) => c.id === clubId);
    if (!club) return { success: false, message: "Club not found." };

    const existingMember = state.clubMembers.find(
      (m) => m.clubId === clubId && m.userId === state.currentUser.id,
    );
    if (existingMember) {
      return {
        success: false,
        message: `You are already registered with ${club.name} as ${existingMember.role}.`,
      };
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
      c.id === clubId ? { ...c, memberCount: c.memberCount + 1 } : c,
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
    const existing = state.clubMembers.find(
      (m) => m.clubId === clubId && m.userId === state.currentUser.id,
    );
    if (!existing) return { success: false, message: "You are not a member of this club." };

    const updatedMembers = state.clubMembers.filter(
      (m) => !(m.clubId === clubId && m.userId === state.currentUser.id),
    );
    const updatedClubs = state.clubs.map((c) =>
      c.id === clubId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c,
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
    data: Omit<VerifiedAchievement, "id" | "verificationHash" | "qrCodePayload">,
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
        a.qrCodePayload.toLowerCase() === clean,
    );
  },

  // --- Campus Announcements & Communication Feed ---
  postAnnouncement(
    data: Omit<CampusAnnouncement, "id" | "createdAt" | "readBy">,
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

  updateUserProfilePicture(photoUrl: string): void {
    const state = campusStore.getState();
    const currentProfile = state.currentUser;
    if (!currentProfile) return;

    const updatedProfile = {
      ...currentProfile,
      avatar: photoUrl,
    };

    campusStore.setState((prev) => ({
      currentUser: updatedProfile,
      digitalId: {
        ...prev.digitalId,
        photoUrl:
          photoUrl &&
          (photoUrl.startsWith("http") || photoUrl.startsWith("data:") || photoUrl.startsWith("/"))
            ? photoUrl
            : prev.digitalId.photoUrl,
      },
    }));

    // Update locally stored accounts
    const allAccounts = getStoredAccounts();
    const updatedAccounts = allAccounts.map((acc) => {
      if (
        acc.email.toLowerCase() === currentProfile.email.toLowerCase() ||
        acc.idOrRoll.toLowerCase() === currentProfile.rollNo.toLowerCase()
      ) {
        return {
          ...acc,
          profile: {
            ...acc.profile,
            avatar: photoUrl,
          },
        };
      }
      return acc;
    });
    saveStoredAccounts(updatedAccounts);

    // Sync to Supabase accounts table
    try {
      supabase
        .from("accounts")
        .update({ avatar: photoUrl })
        .eq("email", currentProfile.email)
        .then(({ error }) => {
          if (error) {
            console.warn("Failed to sync avatar to Supabase:", error);
          }
        })
        .catch((e) => {
          console.warn("Failed to sync avatar to Supabase:", e);
        });
    } catch (e) {
      console.warn("Failed to sync avatar to Supabase:", e);
    }
  },
  loginWithGoogle(userOverride?: {
    name?: string;
    email?: string;
    rollNo?: string;
    photo?: string;
  }): { success: boolean; message: string } {
    const email = userOverride?.email || "student@gsfcuniversity.ac.in";
    const name = userOverride?.name || "GSFC Student";
    const rollNo = userOverride?.rollNo || "STUDENT";

    const allAccounts = getStoredAccounts();
    let matchedAccount = allAccounts.find(
      (a) =>
        a.email.toLowerCase() === email.toLowerCase() ||
        a.idOrRoll.toLowerCase() === rollNo.toLowerCase(),
    );

    // Look up in registered students to fetch exact registered phone & details
    const existingStudent = campusStore
      .getState()
      .newRegisteredStudents?.find(
        (s) =>
          (s.email && s.email.toLowerCase() === email.toLowerCase()) ||
          (s.rollNo && s.rollNo.toUpperCase() === rollNo.toUpperCase()),
      );

    if (!matchedAccount) {
      // Create new verified GSFC student account
      matchedAccount = {
        idOrRoll: rollNo,
        email,
        name: existingStudent?.fullName || name,
        role: "student",
        roleTitle: "GSFC Student",
        roleBadge: rollNo,
        password: "",
        profile: {
          id: `u-${rollNo.toLowerCase()}`,
          name: existingStudent?.fullName || name,
          rollNo,
          email,
          role: "student",
          department: existingStudent?.department || "Computer Science & Engineering",
          school: existingStudent?.school || "School of Technology (SOT)",
          degree: existingStudent?.degree || "B.Tech",
          semester: existingStudent?.semester || 1,
          residenceType: existingStudent?.residenceType || "dayscholar",
          hostelBlockOrBusRoute: existingStudent?.hostelBlockOrBusRoute || "",
          clubsInterested: existingStudent?.clubsInterested || [],
          mobileNumber:
            existingStudent?.mobileNumber &&
            existingStudent.mobileNumber !== "N/A" &&
            existingStudent.mobileNumber !== "Not provided"
              ? existingStudent.mobileNumber
              : undefined,
          attendanceRate: 100,
          points: 0,
          streakDays: 0,
          volunteerHours: 0,
          badges: ["b1"],
          avatar: userOverride?.photo || name.slice(0, 2).toUpperCase() || "ST",
        },
      };
      campusStore.registerNewAccount(matchedAccount);
    } else if (existingStudent) {
      matchedAccount.profile = {
        ...matchedAccount.profile,
        mobileNumber:
          existingStudent.mobileNumber &&
          existingStudent.mobileNumber !== "N/A" &&
          existingStudent.mobileNumber !== "Not provided"
            ? existingStudent.mobileNumber
            : matchedAccount.profile.mobileNumber,
        school: existingStudent.school || matchedAccount.profile.school,
        degree: existingStudent.degree || matchedAccount.profile.degree,
      };
    }

    campusStore.loginWithAccount(matchedAccount);

    campusStore.setState((prev) => ({
      auditLogs: [
        {
          id: `aud-google-${Date.now()}`,
          action: "Google SSO Authentication Verified",
          performedBy: `${matchedAccount!.name} (${matchedAccount!.email})`,
          target: "GSFC University Identity Provider",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          details: `Authenticated via Google Workspace SSO · Role: ${matchedAccount!.role.toUpperCase()}`,
        },
        ...prev.auditLogs,
      ],
    }));

    return { success: true, message: `Welcome back via Google SSO, ${matchedAccount.name}!` };
  },

  async updateStudentMobileNumber(
    rollNo: string,
    newMobile: string,
  ): Promise<{ success: boolean; message?: string }> {
    const cleanNumber = newMobile.trim();
    const digits = cleanNumber.replace(/[^0-9]/g, "");
    if (digits.length < 10) {
      return { success: false, message: "Please enter a valid 10-digit mobile number." };
    }

    // 1. Call backend API
    try {
      const res = await fetch("/api/students/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: rollNo,
          mobileNumber: cleanNumber,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.student) {
        // Success via backend API
      }
    } catch (e: any) {
      console.warn("API phone update network note:", e);
    }

    // 2. Direct Supabase update for zero-downtime resilience
    try {
      await supabase
        .from("new_registered_students")
        .update({ mobile_number: cleanNumber, updated_at: new Date().toISOString() })
        .ilike("roll_no", rollNo);

      await supabase
        .from("accounts")
        .update({ mobile_number: cleanNumber })
        .ilike("roll_no", rollNo);
    } catch (e) {
      console.warn("Direct Supabase update note:", e);
    }

    // 3. Update local state
    campusStore.setState((prev) => {
      const updatedStudents = prev.newRegisteredStudents.map((s) =>
        s.rollNo.toUpperCase() === rollNo.toUpperCase() ? { ...s, mobileNumber: cleanNumber } : s,
      );
      const isCurrent = prev.currentUser.rollNo.toUpperCase() === rollNo.toUpperCase();
      const updatedUser: UserProfile = isCurrent
        ? { ...prev.currentUser, mobileNumber: cleanNumber }
        : prev.currentUser;

      return {
        newRegisteredStudents: updatedStudents,
        currentUser: updatedUser,
      };
    });

    // 4. Update stored accounts in localStorage
    const allAccounts = getStoredAccounts();
    const updatedAccounts = allAccounts.map((acc) => {
      if (
        acc.idOrRoll.toUpperCase() === rollNo.toUpperCase() ||
        acc.email.toLowerCase() === campusStore.getState().currentUser.email.toLowerCase()
      ) {
        return {
          ...acc,
          profile: {
            ...acc.profile,
            mobileNumber: cleanNumber,
          },
        };
      }
      return acc;
    });
    saveStoredAccounts(updatedAccounts);

    return { success: true, message: "Mobile phone number updated successfully." };
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
    if (
      prompt.includes("event") ||
      prompt.includes("happen") ||
      prompt.includes("workshop") ||
      prompt.includes("hackathon") ||
      prompt.includes("calendar")
    ) {
      const liveEvents = state.events.filter((e) => e.status === "live");
      const upcomingEvents = state.events.filter((e) => e.status === "upcoming");

      if (prompt.includes("tech") || prompt.includes("cse") || prompt.includes("coding")) {
        const techEvents = state.events.filter(
          (e) =>
            e.category === "Tech" ||
            e.category === "Workshop" ||
            e.department.toLowerCase().includes("comp"),
        );
        responseText =
          `### 💻 Technical & Engineering Events at GSFC University:\n\n` +
          techEvents
            .map(
              (e) =>
                `• **${e.title}** (${e.date} · ${e.time})\n  📍 *${e.venue}* · Organized by ${e.organizerName}\n  Seats Left: ${e.capacity - e.registeredCount}/${e.capacity}`,
            )
            .join("\n\n");
      } else if (
        prompt.includes("today") ||
        prompt.includes("tomorrow") ||
        prompt.includes("week")
      ) {
        responseText =
          `### 📅 Campus Events Schedule:\n\n` +
          `**Live Right Now:**\n` +
          (liveEvents.length > 0
            ? liveEvents.map((e) => `• 🔴 **${e.title}** at *${e.venue}* (${e.time})`).join("\n")
            : "_No events currently running._") +
          `\n\n**Upcoming Highlights:**\n` +
          upcomingEvents
            .slice(0, 4)
            .map(
              (e) =>
                `• 📌 **${e.title}** on **${e.date}** at *${e.venue}* (${e.capacity - e.registeredCount} seats left)`,
            )
            .join("\n");
      } else {
        responseText =
          `### 🎓 Active & Upcoming Campus Events (${state.events.length} Total):\n\n` +
          state.events
            .slice(0, 5)
            .map(
              (e) =>
                `• **${e.title}** [${e.category}]\n  📅 ${e.date} · 📍 ${e.venue} · ${e.registeredCount}/${e.capacity} Registered`,
            )
            .join("\n\n") +
          `\n\n_Tip: You can tap on any event in the Events Hub to register or view real-time location directions._`;
      }
      suggestions = [
        "Show my registered events",
        "How do I punch in for attendance?",
        "Which events have certificates?",
      ];
    }

    // Query 2: My registrations / personal schedule (privacy-scoped to current student only)
    else if (
      prompt.includes("register") ||
      prompt.includes("my event") ||
      prompt.includes("enrolled") ||
      prompt.includes("ticket")
    ) {
      const myRegs = state.registrations.filter(
        (r) => r.userId === user.id || r.userRollNo === user.rollNo,
      );
      if (myRegs.length === 0) {
        responseText = `You currently have **0 active registrations**.\n\nBrowse the Events Hub to find upcoming hackathons, workshops, and sports tournaments!`;
      } else {
        responseText =
          `### 🎟️ Your Event Registrations (${myRegs.length}):\n\n` +
          myRegs
            .map((r) => {
              const ev = state.events.find((e) => e.id === r.eventId);
              const statusBadge =
                r.status === "attended"
                  ? "✅ Attended"
                  : r.status === "punched_in"
                    ? "🟢 In Session"
                    : r.status === "waitlisted"
                      ? "⏳ Waitlisted"
                      : "📌 Confirmed";
              return `• **${ev?.title || r.eventId}** — ${statusBadge}\n  📅 Date: ${ev?.date || "TBD"} · 📍 Venue: ${ev?.venue || "Campus"}${r.isTeam ? ` · Team: **${r.teamName}**` : ""}`;
            })
            .join("\n\n");
      }
      suggestions = [
        "What is my attendance percentage?",
        "What certificates have I earned?",
        "How do I download my ID card?",
      ];
    }

    // Query 3: Attendance & Punch-In / Punch-Out
    else if (
      prompt.includes("attendance") ||
      prompt.includes("punch") ||
      prompt.includes("streak") ||
      prompt.includes("points") ||
      prompt.includes("xp")
    ) {
      const myAtt = state.attendanceRecords.filter(
        (a) => a.userId === user.id || a.userRollNo === user.rollNo,
      );
      responseText =
        `### 📊 Your GSFC Academic & Event Engagement:\n\n` +
        `• **Verified Attendance:** ${user.attendancePercentage}%\n` +
        `• **Events Attended:** ${myAtt.length} events\n` +
        `• **Activity Points / XP:** ${user.points} XP\n` +
        `• **Daily Streak:** 🔥 ${user.streakDays} Days\n` +
        `• **Volunteer Hours:** 🤝 ${user.volunteerHours} Hours\n\n` +
        `> **Attendance Policy Note:** GSFC University requires minimum 75% attendance for end-semester hall ticket clearance and campus placement drive eligibility.`;
      suggestions = [
        "Show my certificates",
        "What achievements have I unlocked?",
        "How to join student clubs?",
      ];
    }

    // Query 4: Certificates & Credentials
    else if (
      prompt.includes("cert") ||
      prompt.includes("wallet") ||
      prompt.includes("download") ||
      prompt.includes("credential")
    ) {
      const myAttWithCert = state.attendanceRecords.filter(
        (a) => (a.userId === user.id || a.userRollNo === user.rollNo) && a.certificateId,
      );
      if (myAttWithCert.length === 0) {
        responseText = `You don't have any issued certificates yet. Attend upcoming workshops or hackathons to earn verified digital credentials with unique verification IDs.`;
      } else {
        responseText =
          `### 📜 Your Verified Digital Certificates (${myAttWithCert.length}):\n\n` +
          myAttWithCert
            .map(
              (a) =>
                `• **${a.eventTitle}**\n  🆔 Cert ID: \`${a.certificateId}\`\n  📅 Verified on: ${a.timestamp.slice(0, 10)} via ${a.verifiedMethod}`,
            )
            .join("\n\n") +
          `\n\nYou can view and download official GSFC PDF certificates in the **Passport & Wallet** tab.`;
      }
      suggestions = [
        "Show my campus activity passport",
        "Show technical events",
        "What clubs can I join?",
      ];
    }

    // Query 5: Clubs & Communities
    else if (
      prompt.includes("club") ||
      prompt.includes("community") ||
      prompt.includes("lead") ||
      prompt.includes("committee")
    ) {
      responseText =
        `### 🏛️ GSFC University Recognized Student Clubs:\n\n` +
        state.clubs
          .map(
            (c) =>
              `• **${c.logo} ${c.name}** [${c.category}]\n  Coordinator: ${c.facultyCoordinator.name} · Student Lead: ${c.studentLead.name}\n  Members: ${c.memberCount} · Schedule: ${c.meetingSchedule}`,
          )
          .join("\n\n") +
        `\n\n_You can join or view club activities in the Clubs & Communities section._`;
      suggestions = [
        "Show coding club activities",
        "How do I earn volunteer hours?",
        "What events are happening this week?",
      ];
    }

    // Query 6: Campus Services / Directory / Placement / Dean
    else if (
      prompt.includes("service") ||
      prompt.includes("placement") ||
      prompt.includes("tpc") ||
      prompt.includes("dean") ||
      prompt.includes("library") ||
      prompt.includes("security") ||
      prompt.includes("health") ||
      prompt.includes("contact") ||
      prompt.includes("where is")
    ) {
      responseText =
        `### 🏢 GSFC Campus Services Directory:\n\n` +
        state.services
          .map(
            (s) =>
              `• **${s.name}**\n  📍 ${s.location} (${s.building})\n  ⏰ ${s.openingHours} · 📞 ${s.contactPhone}\n  ✉️ ${s.contactEmail}`,
          )
          .join("\n\n");
      suggestions = [
        "Where is Training & Placement Cell?",
        "What events are happening this week?",
        "Show campus announcements",
      ];
    }

    // Query 7: Digital Student ID Card
    else if (
      prompt.includes("id") ||
      prompt.includes("card") ||
      prompt.includes("identity") ||
      prompt.includes("roll")
    ) {
      responseText =
        `### 🪪 Digital Campus Identity Card:\n\n` +
        `• **Student:** ${state.digitalId.name}\n` +
        `• **Roll No:** \`${state.digitalId.rollNo}\`\n` +
        `• **Program:** ${state.digitalId.program}\n` +
        `• **Department:** ${state.digitalId.department} (Sem ${state.digitalId.semester})\n` +
        `• **Blood Group:** ${state.digitalId.bloodGroup}\n` +
        `• **Validity:** Till ${state.digitalId.validTill}\n` +
        `• **Status:** 🟢 ${state.digitalId.status.toUpperCase()}\n\n` +
        `Tap the **Digital ID** badge on the top right navigation bar to open your holographic smart card with barcode scanner.`;
      suggestions = [
        "Show my registered events",
        "What is my attendance percentage?",
        "What events are happening this week?",
      ];
    }

    // Query 8: Fallback / General Assistant
    else {
      responseText =
        `Hello **${user.name}**! I am your **GSFC Campus AI Assistant**.\n\nI can help you with:\n` +
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

  // ==============================================================================
  // INTERNSHIP SYSTEM ACTIONS
  // ==============================================================================

  async applyForInternship(applicationData: {
    internshipId: string;
    studentId?: string;
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
    address?: { street?: string; city?: string; state?: string; pincode?: string };
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
  }): Promise<{ success: boolean; application?: InternshipApplication; message: string }> {
    const state = campusStore.getState();
    const studentId =
      applicationData.studentId || state.currentUser.id || state.currentUser.rollNo || "u-student";

    const existing = (state.internshipApplications || []).find(
      (a) =>
        a.internshipId === applicationData.internshipId &&
        (a.studentId === studentId ||
          a.enrollmentNumber.toUpperCase() === applicationData.enrollmentNumber.toUpperCase()),
    );
    if (existing) {
      return {
        success: false,
        message: `You have already submitted an application (${existing.applicationNumber}) for this internship. Current Status: ${existing.status.replace("_", " ")}.`,
      };
    }

    if (!applicationData.declarationAccepted) {
      return {
        success: false,
        message:
          "You must accept the declaration and attendance agreement before submitting your application.",
      };
    }

    const lockKey = `${studentId}:${applicationData.internshipId}`;
    if (inFlightApplications.has(lockKey)) {
      return {
        success: false,
        message:
          "An application submission is already currently processing for this internship. Please wait.",
      };
    }
    inFlightApplications.add(lockKey);

    const year = new Date().getFullYear();
    const count = (state.internshipApplications || []).length + 1;
    const applicationNumber = `INT-${year}-${String(count).padStart(6, "0")}`;
    const newId = `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const newApplication: InternshipApplication = {
      id: newId,
      applicationNumber,
      internshipId: applicationData.internshipId,
      studentId,
      fullName: applicationData.fullName,
      enrollmentNumber: applicationData.enrollmentNumber,
      email: applicationData.email,
      phone: applicationData.phone,
      course: applicationData.course,
      branch: applicationData.branch,
      semester: applicationData.semester,
      cgpa: applicationData.cgpa,
      tenthPercentage: applicationData.tenthPercentage,
      twelfthPercentage: applicationData.twelfthPercentage,
      backlogs: applicationData.backlogs ?? 0,
      academicDetails: applicationData.academicDetails || {},
      address: applicationData.address || {},
      skills: applicationData.skills || [],
      projects: applicationData.projects,
      experience: applicationData.experience,
      whyInternship: applicationData.whyInternship,
      careerObjective: applicationData.careerObjective,
      coverLetter: applicationData.coverLetter,
      resumeUrl: applicationData.resumeUrl,
      collegeIdUrl: applicationData.collegeIdUrl,
      documents: applicationData.documents || [],
      declarationAccepted: true,
      status: "ADMIN_REVIEW",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const studentNotif: InternshipNotification = {
      id: `notif-${Date.now()}`,
      studentId,
      applicationId: newId,
      type: "submitted",
      title: "Application Submitted Successfully",
      message: `Your internship application ${applicationNumber} has been submitted and is currently waiting for Administration review. You cannot start internship attendance until your application is approved.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    campusStore.setState((prev) => ({
      internshipApplications: [newApplication, ...(prev.internshipApplications || [])],
      internshipNotifications: [studentNotif, ...(prev.internshipNotifications || [])],
    }));

    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        const dbPayload = serializeInternshipApplicationForDb(newApplication);
        const notificationPayload = {
          id: studentNotif.id,
          student_id: studentNotif.studentId,
          application_id: studentNotif.applicationId,
          type: studentNotif.type,
          title: studentNotif.title,
          message: studentNotif.message,
          is_read: false,
          created_at: studentNotif.createdAt,
        };
        const response = await fetch("/api/internships/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ application: dbPayload, notification: notificationPayload }),
        });
        const result = (await response.json()) as { success?: boolean; message?: string };
        if (!response.ok || !result.success) {
          campusStore.setState((prev) => ({
            internshipApplications: (prev.internshipApplications || []).filter(
              (a) => a.id !== newId,
            ),
            internshipNotifications: (prev.internshipNotifications || []).filter(
              (n) => n.id !== studentNotif.id,
            ),
          }));
          return {
            success: false,
            message: result.message || "Application could not be saved to the university database.",
          };
        }
      }
    } catch (err) {
      campusStore.setState((prev) => ({
        internshipApplications: (prev.internshipApplications || []).filter((a) => a.id !== newId),
        internshipNotifications: (prev.internshipNotifications || []).filter(
          (n) => n.id !== studentNotif.id,
        ),
      }));
      return {
        success: false,
        message: "Application could not be saved. Check your connection and try again.",
      };
    } finally {
      inFlightApplications.delete(lockKey);
    }

    return {
      success: true,
      application: newApplication,
      message: `Application submitted successfully. Your application ${applicationNumber} is currently waiting for Administration/Dean approval. You cannot start internship attendance until your application is approved.`,
    };
  },

  async adminReviewApplication(
    applicationId: string,
    decision: "approve" | "reject" | "changes_requested",
    comment: string,
  ): Promise<{ success: boolean; message: string }> {
    const state = campusStore.getState();
    if (!["admin", "dean", "super_admin", "tpc"].includes(state.currentUser.role)) {
      return {
        success: false,
        message: "Unauthorized: Administrator or TPC role required to review applications.",
      };
    }

    const app = (state.internshipApplications || []).find((a) => a.id === applicationId);
    if (!app) {
      return { success: false, message: "Application not found." };
    }

    const reviewerName = state.currentUser.name || "Faculty Coordinator";
    const nowIso = new Date().toISOString();
    let newStatus: InternshipApplicationStatus = "ADMIN_REVIEW";
    let notifTitle = "";
    let notifMessage = "";

    if (decision === "approve") {
      // Direct approval - no dean review needed
      newStatus = "APPROVED";
      notifTitle = "Application Approved";
      notifMessage = `Your application ${app.applicationNumber} has been approved by Faculty Coordinator (${reviewerName}). You can now start punching attendance!`;
    } else if (decision === "reject") {
      newStatus = "REJECTED";
      notifTitle = "Application Rejected";
      notifMessage = `Your application ${app.applicationNumber} was not approved. Reason: ${comment || "Requirements not met."}`;
    } else {
      newStatus = "CHANGES_REQUESTED";
      notifTitle = "Changes Requested";
      notifMessage = `Faculty Coordinator requested updates for application ${app.applicationNumber}: ${comment || "Please update your details."}`;
    }

    const updatedApp: InternshipApplication = {
      ...app,
      status: newStatus,
      adminReviewedBy: reviewerName,
      adminReviewedAt: nowIso,
      adminComment: comment,
      approvedAt: decision === "approve" ? nowIso : app.approvedAt,
      rejectedAt: decision === "reject" ? nowIso : app.rejectedAt,
      rejectionReason: decision === "reject" ? comment : app.rejectionReason,
      updatedAt: nowIso,
    };

    const approvalLog: InternshipApprovalRecord = {
      id: `apprv-${Date.now()}`,
      applicationId,
      approvalType: "ADMIN",
      approvedBy: reviewerName,
      status:
        decision === "approve"
          ? "approved"
          : decision === "reject"
            ? "rejected"
            : "changes_requested",
      comment,
      approvedAt: nowIso,
      createdAt: nowIso,
    };

    const studentNotif: InternshipNotification = {
      id: `notif-${Date.now()}`,
      studentId: app.studentId,
      applicationId,
      type:
        decision === "approve"
          ? "admin_approved"
          : decision === "reject"
            ? "rejected"
            : "changes_requested",
      title: notifTitle,
      message: notifMessage,
      isRead: false,
      createdAt: nowIso,
    };

    campusStore.setState((prev) => ({
      internshipApplications: (prev.internshipApplications || []).map((a) =>
        a.id === applicationId ? updatedApp : a,
      ),
      internshipApprovals: [approvalLog, ...(prev.internshipApprovals || [])],
      internshipNotifications: [studentNotif, ...(prev.internshipNotifications || [])],
    }));

    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        await supabase
          .from("internship_applications")
          .update(serializeInternshipApplicationForDb(updatedApp))
          .eq("id", applicationId);
        await supabase.from("internship_approvals").insert({
          id: approvalLog.id,
          application_id: approvalLog.applicationId,
          approval_type: approvalLog.approvalType,
          approved_by: approvalLog.approvedBy,
          status: approvalLog.status,
          comment: approvalLog.comment,
          approved_at: approvalLog.approvedAt,
          created_at: approvalLog.createdAt,
        });
      }
    } catch (err) {
      console.debug("Supabase admin review note:", err);
    }

    return {
      success: true,
      message:
        decision === "approve"
          ? `Application ${app.applicationNumber} approved successfully! Student can now punch attendance.`
          : decision === "reject"
            ? `Application ${app.applicationNumber} rejected.`
            : `Changes requested for ${app.applicationNumber}.`,
    };
  },

  async deanReviewApplication(
    applicationId: string,
    decision: "approve" | "reject",
    comment: string,
  ): Promise<{ success: boolean; message: string }> {
    const state = campusStore.getState();
    if (!["dean", "admin", "super_admin"].includes(state.currentUser.role)) {
      return { success: false, message: "Unauthorized: Dean role required for final approval." };
    }

    const app = (state.internshipApplications || []).find((a) => a.id === applicationId);
    if (!app) {
      return { success: false, message: "Application not found." };
    }

    const reviewerName = state.currentUser.name || "Dr. Ananya Sharma (Dean)";
    const nowIso = new Date().toISOString();

    const targetInternship = (state.internships || []).find((i) => i.id === app.internshipId);
    if (decision === "approve" && targetInternship && targetInternship.positions) {
      const alreadyApprovedCount = (state.internshipApplications || []).filter(
        (a) =>
          a.internshipId === app.internshipId &&
          (a.status === "APPROVED" || a.status === "ACTIVE") &&
          a.id !== applicationId,
      ).length;
      if (alreadyApprovedCount >= targetInternship.positions) {
        return {
          success: false,
          message: `Cannot approve application: all ${targetInternship.positions} available positions for this internship have already been filled.`,
        };
      }
    }

    const newStatus: InternshipApplicationStatus = decision === "approve" ? "APPROVED" : "REJECTED";

    const updatedApp: InternshipApplication = {
      ...app,
      status: newStatus,
      deanReviewedBy: reviewerName,
      deanReviewedAt: nowIso,
      deanComment: comment,
      approvedAt: decision === "approve" ? nowIso : app.approvedAt,
      rejectedAt: decision === "reject" ? nowIso : app.rejectedAt,
      rejectionReason: decision === "reject" ? comment : app.rejectionReason,
      updatedAt: nowIso,
    };

    const approvalLog: InternshipApprovalRecord = {
      id: `apprv-${Date.now()}`,
      applicationId,
      approvalType: "DEAN",
      approvedBy: reviewerName,
      status: decision === "approve" ? "approved" : "rejected",
      comment,
      approvedAt: nowIso,
      createdAt: nowIso,
    };

    const startDateText = targetInternship?.startDate || "scheduled start date";

    const studentNotif: InternshipNotification = {
      id: `notif-${Date.now()}`,
      studentId: app.studentId,
      applicationId,
      type: decision === "approve" ? "dean_approved" : "rejected",
      title:
        decision === "approve" ? "Final Dean Approval Granted!" : "Application Rejected by Dean",
      message:
        decision === "approve"
          ? `Your internship application ${app.applicationNumber} has been officially approved by Dean ${reviewerName}. You can log attendance starting from ${startDateText}.`
          : `Your application ${app.applicationNumber} was not approved by the Dean. Reason: ${comment || "Not approved."}`,
      isRead: false,
      createdAt: nowIso,
    };

    campusStore.setState((prev) => ({
      internshipApplications: (prev.internshipApplications || []).map((a) =>
        a.id === applicationId ? updatedApp : a,
      ),
      internshipApprovals: [approvalLog, ...(prev.internshipApprovals || [])],
      internshipNotifications: [studentNotif, ...(prev.internshipNotifications || [])],
    }));

    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        await supabase
          .from("internship_applications")
          .update(serializeInternshipApplicationForDb(updatedApp))
          .eq("id", applicationId);
        await supabase.from("internship_approvals").insert({
          id: approvalLog.id,
          application_id: approvalLog.applicationId,
          approval_type: approvalLog.approvalType,
          approved_by: approvalLog.approvedBy,
          status: approvalLog.status,
          comment: approvalLog.comment,
          approved_at: approvalLog.approvedAt,
          created_at: approvalLog.createdAt,
        });
      }
    } catch (err) {
      console.debug("Supabase dean review note:", err);
    }

    return {
      success: true,
      message:
        decision === "approve"
          ? `Application ${app.applicationNumber} granted Dean Final Approval. Internship is now APPROVED & ACTIVE.`
          : `Application ${app.applicationNumber} rejected by Dean.`,
    };
  },

  async punchInInternship(
    applicationId: string,
    coords: { latitude: number; longitude: number; accuracy: number; address: string },
  ): Promise<{ success: boolean; record?: InternshipAttendanceRecord; message: string }> {
    const state = campusStore.getState();
    const app = (state.internshipApplications || []).find((a) => a.id === applicationId);
    if (!app) {
      return { success: false, message: "Internship application record not found." };
    }

    if (app.status !== "APPROVED" && app.status !== "ACTIVE") {
      return {
        success: false,
        message:
          "Attendance punching is not available yet. Please wait until your internship is officially approved and activated by Administration and Dean.",
      };
    }

    const intn = (state.internships || []).find((i) => i.id === app.internshipId);
    const todayStr = new Date().toISOString().slice(0, 10);
    if (intn) {
      if (todayStr < intn.startDate) {
        return {
          success: false,
          message: `Internship has not started yet. Valid attendance period begins on ${intn.startDate}. Today is ${todayStr}.`,
        };
      }
      if (todayStr > intn.endDate) {
        return {
          success: false,
          message: `Internship tenure concluded on ${intn.endDate}. Attendance punching is closed.`,
        };
      }
    }

    const existingPunches = (state.internshipAttendance || []).filter(
      (a) => a.applicationId === applicationId && a.attendanceDate === todayStr,
    );
    const openPunch = existingPunches.find((p) => p.punchInTime && !p.punchOutTime);
    if (openPunch) {
      return {
        success: false,
        message: `You already have an active Punch In session logged today at ${new Date(openPunch.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Please Punch Out before creating a new punch.`,
      };
    }
    const completedPunch = existingPunches.find((p) => p.punchInTime && p.punchOutTime);
    if (completedPunch) {
      return {
        success: false,
        message: `You have already completed your internship punch for today (${todayStr}) with duration ${completedPunch.workingDuration}.`,
      };
    }

    const lockKey = `${app.studentId}:${todayStr}`;
    if (inFlightPunches.has(lockKey)) {
      return {
        success: false,
        message: "An attendance punch request is already processing. Please wait.",
      };
    }
    inFlightPunches.add(lockKey);

    const newRecord: InternshipAttendanceRecord = {
      id: `att-int-${Date.now()}`,
      applicationId,
      studentId: app.studentId,
      internshipId: app.internshipId,
      attendanceDate: todayStr,
      punchInTime: new Date().toISOString(),
      punchInLatitude: coords.latitude,
      punchInLongitude: coords.longitude,
      punchInAccuracy: Math.round(coords.accuracy),
      punchInAddress: coords.address || "Captured GPS Coordinates",
      status: "present",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const notif: InternshipNotification = {
      id: `notif-${Date.now()}`,
      studentId: app.studentId,
      applicationId,
      type: "punch",
      title: "Attendance Punched In",
      message: `Internship attendance recorded at ${coords.address} (GPS Accuracy: ±${Math.round(coords.accuracy)}m).`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    campusStore.setState((prev) => ({
      internshipAttendance: [newRecord, ...(prev.internshipAttendance || [])],
      internshipNotifications: [notif, ...(prev.internshipNotifications || [])],
    }));

    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        const { error: dbErr } = await supabase
          .from("internship_attendance")
          .insert(serializeInternshipAttendanceForDb(newRecord));
        if (dbErr) {
          if (
            dbErr.code === "23505" ||
            dbErr.message?.includes("unq_attendance_day") ||
            dbErr.message?.includes("duplicate key")
          ) {
            // Roll back optimistic state
            campusStore.setState((prev) => ({
              internshipAttendance: (prev.internshipAttendance || []).filter(
                (a) => a.id !== newRecord.id,
              ),
              internshipNotifications: (prev.internshipNotifications || []).filter(
                (n) => n.id !== notif.id,
              ),
            }));
            return {
              success: false,
              message:
                "You have already logged your attendance for today. Duplicate punches are prevented.",
            };
          }
          console.debug("Supabase punch in note:", dbErr);
        }
      }
    } catch (err) {
      console.debug("Supabase punch in note:", err);
    } finally {
      inFlightPunches.delete(lockKey);
    }

    return {
      success: true,
      record: newRecord,
      message: `Attendance punched in successfully at ${coords.address}.`,
    };
  },

  async punchOutInternship(
    attendanceId: string,
    coords: { latitude: number; longitude: number; accuracy: number; address: string },
  ): Promise<{ success: boolean; record?: InternshipAttendanceRecord; message: string }> {
    const state = campusStore.getState();
    const record = (state.internshipAttendance || []).find((a) => a.id === attendanceId);
    if (!record) {
      return { success: false, message: "Attendance session record not found." };
    }
    if (!record.punchInTime) {
      return { success: false, message: "Cannot Punch Out before Punching In." };
    }
    if (record.punchOutTime) {
      return { success: false, message: "This attendance session is already punched out." };
    }

    const now = new Date();
    const inTime = new Date(record.punchInTime);
    const diffMs = Math.max(0, now.getTime() - inTime.getTime());
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const workingDuration = `${hours}h ${String(minutes).padStart(2, "0")}m`;

    const updatedRecord: InternshipAttendanceRecord = {
      ...record,
      punchOutTime: now.toISOString(),
      punchOutLatitude: coords.latitude,
      punchOutLongitude: coords.longitude,
      punchOutAccuracy: Math.round(coords.accuracy),
      punchOutAddress: coords.address || "Captured GPS Coordinates",
      workingDuration,
      updatedAt: now.toISOString(),
    };

    const notif: InternshipNotification = {
      id: `notif-${Date.now()}`,
      studentId: record.studentId,
      applicationId: record.applicationId,
      type: "punch",
      title: "Attendance Punched Out",
      message: `Punched out successfully. Total working duration: ${workingDuration}.`,
      isRead: false,
      createdAt: now.toISOString(),
    };

    campusStore.setState((prev) => ({
      internshipAttendance: (prev.internshipAttendance || []).map((a) =>
        a.id === attendanceId ? updatedRecord : a,
      ),
      internshipNotifications: [notif, ...(prev.internshipNotifications || [])],
    }));

    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        await supabase
          .from("internship_attendance")
          .update(serializeInternshipAttendanceForDb(updatedRecord))
          .eq("id", attendanceId);
      }
    } catch (err) {
      console.debug("Supabase punch out note:", err);
    }

    return {
      success: true,
      record: updatedRecord,
      message: `Punch Out completed! Total logged duration: ${workingDuration}.`,
    };
  },

  createInternship(internshipData: Omit<Internship, "id" | "createdAt" | "updatedAt">): {
    success: boolean;
    internship: Internship;
  } {
    const newId = `int-${Date.now()}`;
    const newInternship: Internship = {
      ...internshipData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    campusStore.setState((prev) => ({
      internships: [newInternship, ...(prev.internships || [])],
    }));

    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        supabase
          .from("internships")
          .insert(serializeInternshipForDb(newInternship))
          .then(() => {});
      }
    } catch (e) {}

    return { success: true, internship: newInternship };
  },

  updateInternship(id: string, updates: Partial<Internship>): { success: boolean } {
    campusStore.setState((prev) => ({
      internships: (prev.internships || []).map((i) =>
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i,
      ),
    }));

    try {
      if (typeof window !== "undefined" && navigator.onLine) {
        supabase
          .from("internships")
          .update(updates)
          .eq("id", id)
          .then(() => {});
      }
    } catch (e) {}

    return { success: true };
  },
};
