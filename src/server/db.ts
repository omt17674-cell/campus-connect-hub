import {
  CampusAccount,
  CampusAnnouncement,
  CampusEvent,
  CampusService,
  Club,
  ClubActivity,
  ClubMember,
  DigitalStudentIdCard,
  Registration,
  AttendanceRecord,
  UserProfile,
  UserRole,
  VehicleRecord,
  VerifiedAchievement,
  VisitorRecord,
  AuditLogEntry,
} from "../lib/types";

// Server-side In-Memory Database Schema & State
class ServerDatabase {
  public accounts: CampusAccount[] = [];
  public events: CampusEvent[] = [];
  public registrations: Registration[] = [];
  public attendanceRecords: AttendanceRecord[] = [];
  public achievements: VerifiedAchievement[] = [];
  public clubs: Club[] = [];
  public clubMembers: ClubMember[] = [];
  public clubActivities: ClubActivity[] = [];
  public announcements: CampusAnnouncement[] = [];
  public services: CampusService[] = [];
  public visitors: VisitorRecord[] = [];
  public vehicles: VehicleRecord[] = [];
  public auditLogs: AuditLogEntry[] = [];
  public newRegisteredStudents: Array<{
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
    createdAt: string;
  }> = [
    {
      id: "STU-24BT01001",
      fullName: "Demo Student",
      mobileNumber: "+91 98765 00001",
      rollNo: "24BT01001",
      email: "demo.student@gsfcuniversity.ac.in",
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
  ];
  public digitalId: DigitalStudentIdCard = {
    rollNo: "24BT01001",
    name: "Demo Student",
    program: "Bachelor of Technology (B.Tech)",
    department: "Computer Science & Engineering",
    semester: 4,
    validTill: "June 2028",
    bloodGroup: "B+ (Positive)",
    qrVerificationCode: "GSFCU:VERIFIED:24BT01001:DEMO_STUDENT:CSE:2024-28",
    barcode: "24BT01001",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    status: "active",
  };

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    this.accounts = [
      {
        role: "student",
        roleTitle: "GSFC Student",
        roleBadge: "24BT01001",
        name: "Demo Student",
        idOrRoll: "24BT01001",
        email: "demo.student@gsfcuniversity.ac.in",
        password: "",
        profile: {
          id: "u-demo-student",
          name: "Demo Student",
          rollNo: "24BT01001",
          email: "demo.student@gsfcuniversity.ac.in",
          role: "student",
          department: "B.Tech Computer Science & Engineering",
          year: 2,
          points: 0,
          streakDays: 0,
          volunteerHours: 0,
          avatar: "DS",
        },
      },
      {
        role: "admin",
        roleTitle: "GSFC Administration",
        roleBadge: "Dean Office",
        name: "Dr. Ananya Sharma",
        idOrRoll: "ADM-GSFC-001",
        email: "dean.studentaffairs@gsfcuni.edu",
        password: "",
        profile: {
          id: "u-admin",
          name: "Dr. Ananya Sharma",
          rollNo: "ADM-001",
          email: "dean.studentaffairs@gsfcuni.edu",
          role: "admin",
          department: "Academic Governance & Dean of Student Affairs",
          year: 0,
          semester: 0,
          attendancePercentage: 99,
          points: 5000,
          streakDays: 45,
          volunteerHours: 120,
          avatar: "AS",
        },
      },
      {
        role: "organizer",
        roleTitle: "Faculty & TPC Convener",
        roleBadge: "TPC Admin",
        name: "Prof. Rajiv Mehta",
        idOrRoll: "FAC-TPC-104",
        email: "tpc.admin@gsfcuniversity.ac.in",
        password: "",
        profile: {
          id: "u-tpc",
          name: "Prof. Rajiv Mehta",
          rollNo: "FAC-TPC",
          email: "tpc.admin@gsfcuniversity.ac.in",
          role: "organizer",
          department: "Training & Placement Cell (TPC)",
          year: 0,
          semester: 0,
          attendancePercentage: 96,
          points: 3400,
          streakDays: 30,
          volunteerHours: 80,
          avatar: "RM",
        },
      },
    ];

    this.events = [];

    this.registrations = [];

    this.attendanceRecords = [];

    this.clubs = [
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
        description: "Fostering creative expression, theatre, music, classical dance, painting, and literature across all faculties.",
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
    ];

    this.announcements = [
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
        content: "Online registration for L&T Infotech and TCS campus recruitment drives is now active. B.Tech students with >= 75% attendance are eligible.",
        category: "placement",
        authorName: "Prof. Rajiv Mehta",
        authorRole: "Head, Training & Placement Cell (TPC)",
        departmentTarget: "Computer Science",
        priority: "important",
        createdAt: "2026-06-12T08:30:00Z",
        readBy: [],
      },
    ];

    this.auditLogs = [
      {
        id: "aud-1",
        action: "Server Initialized",
        performedBy: "GSFC Campus Backend Engine",
        target: "Production Cluster",
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        details: "Server database and REST API gateway initialized successfully",
      },
    ];
  }
}

// Global server singleton
export const db = new ServerDatabase();
