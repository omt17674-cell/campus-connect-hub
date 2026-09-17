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
  public digitalId: DigitalStudentIdCard = {
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

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    this.accounts = [
      {
        role: "student",
        roleTitle: "GSFC Student",
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
          year: 2,
          semester: 4,
          attendancePercentage: 88,
          points: 1200,
          streakDays: 14,
          volunteerHours: 24,
          avatar: "OT",
        },
      },
      {
        role: "admin",
        roleTitle: "GSFC Administration",
        roleBadge: "Dean Office",
        name: "Dr. Ananya Sharma",
        idOrRoll: "ADM-GSFC-001",
        email: "dean.studentaffairs@gsfcuni.edu",
        password: "Admin@2026",
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
        password: "TPC@2026",
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

    this.events = [
      {
        id: "evt-1",
        title: "AI & Robotics National Hackathon",
        description: "Build cutting-edge agentic AI and autonomous robotics solutions. 24-hour sprint with mentorship from industry leaders and GSFC research faculty.",
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
      },
      {
        id: "evt-3",
        title: "Inter-Faculty Football Championship",
        description: "Thrilling annual football tournament between Engineering, Science, Management, and Humanities faculties.",
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
      },
      {
        id: "evt-6",
        title: "Design Systems & Modern Web UI Workshop",
        description: "Deep dive into building enterprise-grade design tokens, component architecture, and accessibility standards.",
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
    ];

    this.registrations = [
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
    ];

    this.attendanceRecords = [
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
