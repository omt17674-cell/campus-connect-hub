/**
 * GSFC Campus Connect Hub - Local Express Authentication Server
 * Handles: Email/Password Login, Google OAuth (local simulation), Session Management
 * No external APIs - Everything runs locally
 */

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.AUTH_SERVER_PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "your-local-jwt-secret-change-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";

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
  const adminHashedPassword = await bcrypt.hash("AdminPass@123", 10);
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

  // Demo Organizer Account
  const organizerHashedPassword = await bcrypt.hash("OrgPass@123", 10);
  usersDatabase.set("organizer-001", {
    id: "organizer-001",
    email: "placement@gsfcuniversity.ac.in",
    password: organizerHashedPassword,
    name: "Prof. Rajesh Kumar",
    rollNo: "ORG-TPC-001",
    role: "organizer",
    avatar: "RK",
    createdAt: new Date(),
  });

  console.log("✅ Database seeded with demo accounts:");
  console.log("   Student: student@gsfcuniversity.ac.in / Password@123");
  console.log("   Admin: admin.dean@gsfcuniversity.ac.in / AdminPass@123");
  console.log("   Organizer: placement@gsfcuniversity.ac.in / OrgPass@123");
}

// ─── UTILITY FUNCTIONS ──────────────────────────────────────────────────

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
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

// ─── HEALTH CHECK ───────────────────────────────────────────────────────

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    server: "Campus Connect Hub Auth Server",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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
    // Seed database with demo accounts
    await seedDatabase();

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
║     POST   /api/auth/login          - Email/Password login               ║
║     POST   /api/auth/register       - User registration                  ║
║     POST   /api/auth/google         - Google OAuth (simulated)           ║
║     POST   /api/auth/verify-token   - Verify JWT token                  ║
║     POST   /api/auth/logout         - Logout user                        ║
║     GET    /api/auth/me             - Get current user profile           ║
║     GET    /api/health              - Health check                       ║
║                                                                            ║
║  🔐 Demo Accounts (No External APIs):                                     ║
║                                                                            ║
║     👤 Student:                                                           ║
║        Email: student@gsfcuniversity.ac.in                               ║
║        Password: Password@123                                             ║
║        Role: student                                                      ║
║                                                                            ║
║     👨‍💼 Admin:                                                               ║
║        Email: admin.dean@gsfcuniversity.ac.in                            ║
║        Password: AdminPass@123                                            ║
║        Role: admin                                                        ║
║                                                                            ║
║     💼 Organizer:                                                         ║
║        Email: placement@gsfcuniversity.ac.in                             ║
║        Password: OrgPass@123                                              ║
║        Role: organizer                                                    ║
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
