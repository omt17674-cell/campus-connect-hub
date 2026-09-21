/**
 * GSFC Campus Connect Hub - Local Express Authentication Server
 * Handles: Email/Password Login, Google OAuth (local simulation), Session Management
 * No external APIs - Everything runs locally
 */

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { config as dotenvConfig } from "dotenv";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

// Load environment variables
dotenvConfig();

const app = express();
const PORT = process.env.AUTH_SERVER_PORT || 5001;
const JWT_SECRET: string = process.env.JWT_SECRET || "your-local-jwt-secret-change-in-production";
const JWT_EXPIRY: string = process.env.JWT_EXPIRY || "7d";

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

let supabaseEvents: any;

// ─── IN-MEMORY DATABASE (for local testing) ─────────────────────────────

interface User {
  id: string;
  email: string;
  password?: string; // hashed
  name: string;
  rollNo?: string;
  role: "student" | "admin" | "organizer";
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

interface Session {
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const usersDatabase = new Map<string, User>();
const sessionsDatabase = new Map<string, Session>();

// ⚠️ Events are now stored in SUPABASE (not in-memory)

// ─── SEED DEMO DATA ──────────────────────────────────────────────────────

async function seedDatabase() {
  // Hash demo password: "Password@123"
  const hashedPassword = await bcrypt.hash("Password@123", 10);

  // Demo Student Account
  usersDatabase.set("student-001", {
    id: "student-001",
    email: "student@gsfcuniversity.ac.in",
    password: hashedPassword,
    name: "GSFC Student",
    rollNo: "20CS001",
    role: "student",
    avatar: "ST",
    createdAt: new Date(),
  });

  // Demo Admin Account
  const adminHashedPassword = await bcrypt.hash("9558413347@Om", 10);
  usersDatabase.set("admin-001", {
    id: "admin-001",
    email: "admin.dean@gsfcuniversity.ac.in",
    password: adminHashedPassword,
    name: "Dr. Ananya Sharma",
    rollNo: "ADM-DEAN-001",
    role: "admin",
    avatar: "AS",
    createdAt: new Date(),
  });

  // Demo Organizer Account (TPC Admin)
  const organizerHashedPassword = await bcrypt.hash("7043313347@Om", 10);
  usersDatabase.set("organizer-001", {
    id: "organizer-001",
    email: "tpc.admin@gsfcuniversity.ac.in",
    password: organizerHashedPassword,
    name: "Prof. Rajiv Mehta",
    rollNo: "TPC-ADMIN-108",
    role: "organizer",
    avatar: "RM",
    createdAt: new Date(),
  });

  console.log("✅ Database seeded with demo accounts:");
  console.log("   Admin: admin.dean@gsfcuniversity.ac.in (Password not displayed for security)");
  console.log("   TPC Coordinator: tpc.admin@gsfcuniversity.ac.in (Password not displayed for security)");
}

// ─── UTILITY FUNCTIONS ──────────────────────────────────────────────────

function generateToken(userId: string): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRY as any };
  return jwt.sign({ userId }, JWT_SECRET, options);
}

function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

// Authentication middleware
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }

  (req as any).userId = decoded.userId;
  next();
}

// ─── AUTHENTICATION ROUTES ──────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Email/Password Login
 */
app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    let user: User | undefined;
    for (const u of usersDatabase.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check role match (if provided)
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as ${user.role}, not ${role}`,
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Update last login
    user.lastLogin = new Date();

    // Create session
    const session: Session = {
      userId: user.id,
      token,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
    sessionsDatabase.set(token, session);

    console.log(`✅ User logged in: ${user.email} (${user.role})`);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        rollNo: user.rollNo,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

/**
 * POST /api/auth/google
 * Google OAuth (Local Simulation)
 * In production, integrate with actual Google OAuth flow
 */
app.post("/api/auth/google", async (req: Request, res: Response) => {
  try {
    const { email, name, rollNo } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for Google login",
      });
    }

    // Check if user exists
    let user: User | undefined;
    for (const u of usersDatabase.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        user = u;
        break;
      }
    }

    // If user doesn't exist, create a new one (auto-registration)
    if (!user) {
      const userId = `user-${uuidv4()}`;
      user = {
        id: userId,
        email,
        name: name || email.split("@")[0],
        role: "student", // Default role for new Google users
        avatar: name?.charAt(0).toUpperCase() || "U",
        createdAt: new Date(),
      };
      usersDatabase.set(userId, user);
      console.log(`✅ New user created via Google OAuth: ${email}`);
    }

    // Generate token
    const token = generateToken(user.id);

    // Update last login
    user.lastLogin = new Date();

    // Create session
    const session: Session = {
      userId: user.id,
      token,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    sessionsDatabase.set(token, session);

    console.log(`✅ User logged in via Google: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        rollNo: user.rollNo,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during Google login",
    });
  }
});

/**
 * POST /api/auth/register
 * User Registration
 */
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, rollNo, role = "student" } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required",
      });
    }

    // Check if user already exists
    for (const user of usersDatabase.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const userId = `user-${uuidv4()}`;
    const newUser: User = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      rollNo,
      role: role as "student" | "admin" | "organizer",
      avatar: name.charAt(0).toUpperCase(),
      createdAt: new Date(),
    };

    usersDatabase.set(userId, newUser);

    // Generate token
    const token = generateToken(userId);

    // Create session
    const session: Session = {
      userId,
      token,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    sessionsDatabase.set(token, session);

    console.log(`✅ New user registered: ${email}`);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: userId,
        email,
        name,
        role,
        rollNo,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

/**
 * POST /api/auth/verify-token
 * Verify if a token is valid
 */
app.post("/api/auth/verify-token", (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = usersDatabase.get(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        rollNo: user.rollNo,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error verifying token",
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate session)
 */
app.post("/api/auth/logout", authenticateToken, (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (token) {
      sessionsDatabase.delete(token);
      console.log(`✅ User logged out`);
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
app.get("/api/auth/me", authenticateToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = usersDatabase.get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        rollNo: user.rollNo,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user profile",
    });
  }
});

// ─── EVENT MANAGEMENT ENDPOINTS (Using Supabase) ──────────────────────

/**
 * GET /api/events
 * Get all events (public endpoint, visible to students)
 */
app.get("/api/events", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const events = await supabaseEvents.getEvents(status);

    console.log(`✅ Retrieved ${events.length} events from Supabase`);

    return res.status(200).json({
      success: true,
      events: events.map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        category: e.category,
        date: e.date,
        time: e.time,
        venue: e.venue,
        organizerName: e.organizer_name,
        organizerEmail: e.organizer_email,
        capacity: e.capacity,
        registeredCount: e.registered_count,
        bannerImage: e.banner_image,
        status: e.status,
        createdAt: e.created_at,
      })),
      count: events.length,
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching events",
    });
  }
});

/**
 * GET /api/events/:eventId
 * Get specific event details
 */
app.get("/api/events/:eventId", async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const event = await supabaseEvents.getEventById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date,
        time: event.time,
        venue: event.venue,
        organizerName: event.organizer_name,
        organizerEmail: event.organizer_email,
        capacity: event.capacity,
        registeredCount: event.registered_count,
        bannerImage: event.banner_image,
        status: event.status,
        createdAt: event.created_at,
      },
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching event",
    });
  }
});

/**
 * POST /api/events
 * Create new event (Admin only)
 */
app.post("/api/events", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = usersDatabase.get(userId);

    // Check if user is admin
    if (user?.role !== "admin" && user?.role !== "organizer") {
      return res.status(403).json({
        success: false,
        message: "Only admin or organizer can create events",
      });
    }

    const { title, description, category, date, time, venue, capacity, bannerImage } = req.body;

    if (!title || !description || !date || !time || !venue) {
      return res.status(400).json({
        success: false,
        message: "Title, description, date, time, and venue are required",
      });
    }

    const event = await supabaseEvents.createEvent({
      title,
      description,
      category: category || "General",
      date,
      time,
      venue,
      organizer_name: user.name,
      organizer_email: user.email,
      capacity: capacity || 100,
      registered_count: 0,
      banner_image: bannerImage || "",
      status: "upcoming",
      created_by: userId,
    });

    if (!event) {
      return res.status(500).json({
        success: false,
        message: "Failed to create event in database",
      });
    }

    console.log(`✅ Event created: ${title}`);

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date,
        time: event.time,
        venue: event.venue,
        organizerName: event.organizer_name,
        organizerEmail: event.organizer_email,
        capacity: event.capacity,
        registeredCount: event.registered_count,
        bannerImage: event.banner_image,
        status: event.status,
        createdAt: event.created_at,
      },
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating event",
    });
  }
});

/**
 * PUT /api/events/:eventId
 * Update event (Admin only)
 */
app.put("/api/events/:eventId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = usersDatabase.get(userId);
    const { eventId } = req.params;

    if (user?.role !== "admin" && user?.role !== "organizer") {
      return res.status(403).json({
        success: false,
        message: "Only admin or organizer can update events",
      });
    }

    const event = await supabaseEvents.getEventById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const { title, description, date, time, venue, status, capacity } = req.body;
    const updates: any = {};

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (date) updates.date = date;
    if (time) updates.time = time;
    if (venue) updates.venue = venue;
    if (status) updates.status = status;
    if (capacity) updates.capacity = capacity;

    const updatedEvent = await supabaseEvents.updateEvent(eventId, updates);

    if (!updatedEvent) {
      return res.status(500).json({
        success: false,
        message: "Failed to update event",
      });
    }

    console.log(`✅ Event updated: ${eventId}`);

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description,
        category: updatedEvent.category,
        date: updatedEvent.date,
        time: updatedEvent.time,
        venue: updatedEvent.venue,
        organizerName: updatedEvent.organizer_name,
        organizerEmail: updatedEvent.organizer_email,
        capacity: updatedEvent.capacity,
        registeredCount: updatedEvent.registered_count,
        bannerImage: updatedEvent.banner_image,
        status: updatedEvent.status,
        createdAt: updatedEvent.created_at,
      },
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating event",
    });
  }
});

/**
 * DELETE /api/events/:eventId
 * Delete event (Admin only)
 */
app.delete("/api/events/:eventId", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = usersDatabase.get(userId);
    const { eventId } = req.params;

    if (user?.role !== "admin" && user?.role !== "organizer") {
      return res.status(403).json({
        success: false,
        message: "Only admin or organizer can delete events",
      });
    }

    const event = await supabaseEvents.getEventById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const deleted = await supabaseEvents.deleteEvent(eventId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete event",
      });
    }

    console.log(`✅ Event deleted: ${event.title}`);

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting event",
    });
  }
});

/**
 * POST /api/events/:eventId/register
 * Register student for event
 */
app.post("/api/events/:eventId/register", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = usersDatabase.get(userId);
    const { eventId } = req.params;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const event = await supabaseEvents.getEventById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check capacity
    if (event.registered_count >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "Event capacity is full",
      });
    }

    const registration = await supabaseEvents.registerForEvent(
      eventId,
      userId,
      user.name,
      user.email
    );

    if (!registration) {
      return res.status(400).json({
        success: false,
        message: "Failed to register or already registered",
      });
    }

    console.log(`✅ Student registered: ${user.name} → ${event.title}`);

    return res.status(201).json({
      success: true,
      message: "Registered for event successfully",
      registration: {
        id: registration.id,
        eventId: registration.event_id,
        userId: registration.student_id,
        userName: registration.student_name,
        userEmail: registration.student_email,
        registeredAt: registration.registered_at,
        status: registration.status,
      },
    });
  } catch (error) {
    console.error("Register event error:", error);
    res.status(500).json({
      success: false,
      message: "Server error registering for event",
    });
  }
});

/**
 * GET /api/events/:eventId/registrations
 * Get event registrations (Admin only)
 */
app.get("/api/events/:eventId/registrations", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = usersDatabase.get(userId);
    const { eventId } = req.params;

    if (user?.role !== "admin" && user?.role !== "organizer") {
      return res.status(403).json({
        success: false,
        message: "Only admin or organizer can view registrations",
      });
    }

    const registrations = await supabaseEvents.getEventRegistrations(eventId);

    return res.status(200).json({
      success: true,
      registrations: registrations.map((r: any) => ({
        id: r.id,
        eventId: r.event_id,
        userId: r.student_id,
        userName: r.student_name,
        userEmail: r.student_email,
        registeredAt: r.registered_at,
        status: r.status,
      })),
      count: registrations.length,
    });
  } catch (error) {
    console.error("Get registrations error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching registrations",
    });
  }
});

/**
 * GET /api/user/events
 * Get events registered by current student
 */
app.get("/api/user/events", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const events = await supabaseEvents.getStudentEvents(userId);

    return res.status(200).json({
      success: true,
      events: events.map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        category: e.category,
        date: e.date,
        time: e.time,
        venue: e.venue,
        organizerName: e.organizer_name,
        organizerEmail: e.organizer_email,
        capacity: e.capacity,
        registeredCount: e.registered_count,
        bannerImage: e.banner_image,
        status: e.status,
        createdAt: e.created_at,
      })),
      count: events.length,
    });
  } catch (error) {
    console.error("Get user events error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user events",
    });
  }
});

// ─── REMOVE DEMO EVENTS SEEDING (no longer needed) ────────────────────

function seedDemoEvents() {
  console.log("📝 Events are now stored in Supabase (no local seeding needed)");
}

// ─── HEALTH CHECK ───────────────────────────────────────────────────────

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    server: "Campus Connect Hub Auth Server",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    usersCount: usersDatabase.size,
    sessionsCount: sessionsDatabase.size,
  });
});

// ─── ERROR HANDLING ─────────────────────────────────────────────────────

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ─── START SERVER ───────────────────────────────────────────────────────

async function startServer() {
  try {
    // Dynamically import supabaseEvents to avoid module initialization errors
    const { default: importedEvents } = await import("./supabase-events.ts");
    supabaseEvents = importedEvents;
    
    // Seed database with demo accounts
    await seedDatabase();

    // Check Supabase connection
    const supabaseConnected = await supabaseEvents.testConnection();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                  GSFC Campus Connect Hub - Auth Server                     ║
║                          🚀 Server Started                                 ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  📡 Server running at: http://localhost:${PORT}                           ║
║  🔌 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}
║                                                                            ║
║  📚 API Endpoints:                                                         ║
║                                                                            ║
║  AUTHENTICATION:                                                           ║
║     POST   /api/auth/login          - Email/Password login               ║
║     POST   /api/auth/register       - User registration                  ║
║     POST   /api/auth/google         - Google OAuth (simulated)           ║
║     POST   /api/auth/verify-token   - Verify JWT token                  ║
║     POST   /api/auth/logout         - Logout user                        ║
║     GET    /api/auth/me             - Get current user profile           ║
║                                                                            ║
║  EVENTS (Supabase Backed):                                                 ║
║     GET    /api/events              - Get all events                     ║
║     GET    /api/events/:id          - Get event details                  ║
║     POST   /api/events              - Create event (Admin)               ║
║     PUT    /api/events/:id          - Update event (Admin)               ║
║     DELETE /api/events/:id          - Delete event (Admin)               ║
║     POST   /api/events/:id/register - Register for event                 ║
║     GET    /api/events/:id/regs     - View registrations (Admin)         ║
║     GET    /api/user/events         - Get my registered events           ║
║                                                                            ║
║     GET    /api/health              - Health check                       ║
║                                                                            ║
║  🔐 Demo Accounts:                                                         ║
║                                                                            ║
║     👤 Student:                                                           ║
║        Email: student@gsfcuniversity.ac.in                               ║
║        Password: Password@123                                             ║
║                                                                            ║
║     👨‍💼 Admin:                                                               ║
║        Email: admin.dean@gsfcuniversity.ac.in                            ║
║        Password: AdminPass@123                                            ║
║                                                                            ║
║     💼 Organizer:                                                         ║
║        Email: placement@gsfcuniversity.ac.in                             ║
║        Password: OrgPass@123                                              ║
║                                                                            ║
║  💾 DATABASE:                                                              ║
║     ${
       supabaseConnected
         ? "✅ Supabase Connected - Events saved to database"
         : "⚠️  Supabase Not Connected - Check credentials in .env"
     }
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
