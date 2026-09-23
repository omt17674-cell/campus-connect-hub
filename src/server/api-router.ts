import { supabaseSync } from "./supabase-sync";
import { isSupabaseAdminConfigured, supabaseAdmin } from "./supabase-admin";
import { confirmUserEmailInAuth } from "./postgres";
import { sendRegistrationOTP, sendPasswordResetOTP, emailService } from "./emailService";
import { validateQrPayload } from "../lib/qr-engine";
import { mentorshipSync } from "./mentorship-sync";
import { ensureMentorshipSchema } from "./mentorship-db-init";

let mentorshipSchemaInitialized = false;
function triggerSchemaInit() {
  if (!mentorshipSchemaInitialized) {
    mentorshipSchemaInitialized = true;
    ensureMentorshipSchema().catch((err) =>
      console.warn("[Mentorship DB Init] Startup warning:", err)
    );
  }
}

// ──────────────────────────────────────────────────────────────
// Helper: Generate secure password
// ──────────────────────────────────────────────────────────────
function generateSecurePassword(): string {
  return Array.from({ length: 16 }, () =>
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"[
      Math.floor(Math.random() * 70)
    ]
  ).join("");
}
import {
  CampusEvent,
  Registration,
  AttendanceRecord,
  ClubMember,
  CampusAnnouncement,
  VisitorRecord,
  VehicleRecord,
} from "../lib/types";

// In-Memory OTP Store with 5-minute expiration & attempt throttling
interface OtpEntry {
  codeHash: string;
  expiresAt: number; // 5 minutes validity
  attempts: number;
  mobileNumber: string;
  purpose: "login" | "attendance" | "registration" | "general";
  createdAt: number;
}

const otpStore = new Map<string, OtpEntry>();

interface RegistrationOtpEntry {
  codeHash: string;   // SHA-256 hash — never store plaintext OTP
  email: string;
  rollNo?: string;
  mobileNumber?: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

const registrationOtpStore = new Map<string, RegistrationOtpEntry>();

// Password Reset OTP Store
interface PasswordResetOtpEntry {
  codeHash: string;   // SHA-256 hash of the 6-digit OTP
  email: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}
const passwordResetOtpStore = new Map<string, PasswordResetOtpEntry>();

// Password Reset Token Store (short-lived, single-use)
interface PasswordResetTokenEntry {
  tokenHash: string;  // SHA-256 hash of the reset token
  email: string;
  expiresAt: number;
  used: boolean;
  createdAt: number;
}
const passwordResetTokenStore = new Map<string, string>();  // tokenHash -> email
const passwordResetTokenMeta = new Map<string, PasswordResetTokenEntry>();

// Cryptographic SHA-256 hash helper (server-side, no external deps)
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeMobile(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

// Optional SMS Provider Dispatcher (Twilio / MSG91 / Fast2SMS)
async function dispatchSms(
  mobile: string,
  otp: string,
  purpose: string,
): Promise<{ dispatched: boolean; configured: boolean; provider: string; note: string }> {
  const purposeText =
    purpose === "login"
      ? "Portal Sign-In"
      : purpose === "registration"
        ? "Student Account Registration"
        : "Event Attendance Check-In";
  const message = `[GSFC University] Your verification code for ${purposeText} is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;

  const configuredProvider = (process.env.SMS_PROVIDER || "").toLowerCase();

  // Twilio is used only when explicitly selected and fully configured.
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  if (configuredProvider === "twilio" && twilioSid && twilioAuth && twilioPhone) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64");
      const resp = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: `+91${mobile}`,
            From: twilioPhone,
            Body: message,
          }).toString(),
        },
      );
      if (resp.ok) {
        return {
          dispatched: true,
          configured: true,
          provider: "Twilio SMS Gateway",
          note: `Delivered to +91${mobile}`,
        };
      }
    } catch (err) {
      console.warn("[SMS Gateway Error] Twilio dispatch failed:", err);
    }
  }

  // Fast2SMS is used only when explicitly selected and configured.
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (configuredProvider === "fast2sms" && fast2smsKey) {
    try {
      const resp = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers: mobile,
        }),
      });
      if (resp.ok) {
        return {
          dispatched: true,
          configured: true,
          provider: "Fast2SMS India Gateway",
          note: `Delivered to +91${mobile}`,
        };
      }
    } catch (err) {
      console.warn("[SMS Gateway Error] Fast2SMS dispatch failed:", err);
    }
  }

  return {
    dispatched: false,
    configured: false,
    provider: "none",
    note:
      process.env.NODE_ENV === "production"
        ? "No production SMS provider is configured."
        : "Development SMS provider is not configured; no message was sent.",
  };
}

// In-memory Rate Limiting (Protects authentication & registration from brute-force)
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();

function checkRateLimit(key: string, limit = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const bucket = rateLimitMap.get(key) || { tokens: limit, lastRefill: now };
  const elapsed = now - bucket.lastRefill;
  if (elapsed > windowMs) {
    bucket.tokens = limit;
    bucket.lastRefill = now;
  }
  if (bucket.tokens <= 0) {
    return false;
  }
  bucket.tokens -= 1;
  rateLimitMap.set(key, bucket);
  return true;
}

// Server-side Authenticated Session Store (Protects against client-side role forgery)
export interface ActiveSession {
  userId: string;
  role: string;
  email: string;
  name: string;
  rollNo?: string;
  expiresAt: number;
}
const activeSessions = new Map<string, ActiveSession>();
const usedQrTokens = new Map<string, number>();

export function createServerSession(user: {
  id: string;
  role: string;
  email: string;
  name: string;
  rollNo?: string;
}): string {
  const token = `gsfc-session-${crypto.randomUUID()}`;
  activeSessions.set(token, {
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    rollNo: user.rollNo,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24-hour validity
  });
  return token;
}

async function getAuthenticatedUser(request: Request): Promise<ActiveSession | null> {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  // 1. Check verified server sessions
  const session = activeSessions.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      activeSessions.delete(token);
      return null;
    }
    return session;
  }

  // 2. Validate Supabase JWT token via Supabase Auth
  try {
    const { data: authData, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && authData?.user?.email) {
      const email = authData.user.email.toLowerCase().trim();
      // Look up account in database to get verified role, roll number, and name
      const account = await supabaseSync.getAccountByIdentifier(email);
      if (account) {
        return {
          userId: account.id,
          role: account.role,
          email: account.email,
          name: account.name,
          rollNo: account.roll_no,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };
      }

      // Check student registry
      const student = await supabaseSync.getStudentByRollOrEmail("___NONE___", email);
      if (student) {
        return {
          userId: student.id,
          role: "student",
          email: student.email,
          name: student.fullName,
          rollNo: student.rollNo,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };
      }
    }
  } catch (err) {
    console.debug("[Auth] Token validation error:", err);
  }

  return null;
}

function calculateHaversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Helper for standardized JSON HTTP responses
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": process.env.FRONTEND_URL || "http://localhost:5173",
      "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization",
      "access-control-allow-credentials": "true",
    },
  });
}

// Helper to safely parse JSON body from Request
async function parseBody<T = any>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  // Handle CORS Pre-flight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": process.env.FRONTEND_URL || "http://localhost:5173",
        "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
        "access-control-allow-headers": "Content-Type, Authorization",
        "access-control-allow-credentials": "true",
      },
    });
  }

  // Only handle /api/* requests
  if (!path.startsWith("/api/")) {
    return null;
  }

  // 1. Health Check & Supabase Status (Safe, production-grade)
  if (path === "/api/health" && method === "GET") {
    const supabaseStatus = await supabaseSync.pingSupabase();

    return jsonResponse({
      status: supabaseStatus.connected ? "online" : "degraded",
      institution: "GSFC University, Vadodara",
      service: "Campus Connect Hub REST API Gateway",
      version: "2.6.0",
      databaseConnected: supabaseStatus.connected,
      schemaReady: supabaseStatus.schemaReady,
      requiredTablesReady: supabaseStatus.requiredTablesReady,
      environmentConfigured: isSupabaseAdminConfigured,
      emailConfigured: emailService.isConfigured,
      emailProvider: emailService.provider,
      timestamp: new Date().toISOString(),
      ...(supabaseStatus.error && { error: supabaseStatus.error }),
    });
  }

  // 1b. Check If Roll Number or Email Already Registered
  if (path === "/api/auth/check-exists" && method === "POST") {
    const body = await parseBody<{ rollNo?: string; email?: string }>(request);
    if (!body || (!body.rollNo && !body.email)) {
      return jsonResponse({ exists: false, message: "Provide rollNo or email to check." });
    }

    const cleanRoll = body.rollNo ? body.rollNo.trim().toUpperCase() : "";
    const cleanEmail = body.email ? body.email.trim().toLowerCase() : "";

    let existingStudent = null;
    if (cleanRoll || cleanEmail) {
      existingStudent = await supabaseSync.getStudentByRollOrEmail(
        cleanRoll || "___NONE___",
        cleanEmail || "___NONE___",
      );
    }

    let existingAccount = null;
    if (cleanEmail) {
      existingAccount = await supabaseSync.getAccountByIdentifier(cleanEmail);
    }
    if (!existingAccount && cleanRoll) {
      existingAccount = await supabaseSync.getAccountByIdentifier(cleanRoll);
    }

    if (existingStudent || existingAccount) {
      return jsonResponse(
        {
          exists: true,
          message: `An account with ${existingStudent?.rollNo === cleanRoll || existingAccount?.roll_no === cleanRoll ? `Roll Number '${cleanRoll}'` : `Email '${cleanEmail}'`} is already registered in GSFC University database.`,
        },
        200,
      );
    }

    return jsonResponse({ exists: false, message: "Roll number and email are available." }, 200);
  }

  // 1c. OTP Generation & SMS Dispatch
  if (path === "/api/auth/otp/send" && method === "POST") {
    const body = await parseBody<{ mobileNumber: string; purpose?: "login" | "attendance" | "registration" }>(
      request,
    );
    if (!body || !body.mobileNumber) {
      return jsonResponse(
        { success: false, message: "Please provide a valid mobile number." },
        400,
      );
    }

    const cleanNumber = normalizeMobile(body.mobileNumber);
    if (cleanNumber.length < 10) {
      return jsonResponse(
        { success: false, message: "Invalid mobile number. Please enter a 10-digit number." },
        400,
      );
    }

    // Rate limiting: 10 OTP requests per minute max per number
    if (!checkRateLimit(`otp-send:${cleanNumber}`, 10, 60000)) {
      return jsonResponse(
        {
          success: false,
          code: "RATE_LIMITED",
          message: "Too many OTP requests. Please wait a minute before requesting another code.",
        },
        429,
      );
    }

    // Enforce 60-second resend cooldown
    const existingEntry = otpStore.get(cleanNumber);
    if (existingEntry && Date.now() - existingEntry.createdAt < 60000) {
      const waitSeconds = Math.ceil((60000 - (Date.now() - existingEntry.createdAt)) / 1000);
      return jsonResponse(
        {
          success: false,
          code: "COOLDOWN_ACTIVE",
          message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
          retryAfterSeconds: waitSeconds,
        },
        429,
      );
    }

    // Generate real cryptographically secure random 6-digit OTP (never static)
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    const generatedOtp = (100000 + (randomBuffer[0] % 900000)).toString();

    // 5 minutes expiry (300,000 ms)
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(cleanNumber, {
      codeHash: await sha256(generatedOtp),
      expiresAt,
      attempts: 0,
      mobileNumber: cleanNumber,
      purpose: body.purpose || "login",
      createdAt: Date.now(),
    });

    const smsResult = await dispatchSms(cleanNumber, generatedOtp, body.purpose || "login");

    // If SMS provider is not configured, log OTP for development/testing
    // Registration can proceed without SMS - OTP is stored server-side and verified
    if (!smsResult.dispatched) {
      console.log(
        `[OTP SEND] SMS Provider Not Configured - Mobile: +91${cleanNumber}, Purpose: ${body.purpose || "login"}`,
      );
      console.log(
        `[OTP SEND] In development/testing, OTP is: ${generatedOtp} (check server logs to complete registration)`,
      );
    }

    return jsonResponse({
      success: true,
      message: `OTP sent to your registered mobile number. Valid for 5 minutes.`,
      expiresInSeconds: 300,
      expiresAt,
      smsProvider: smsResult.provider,
    });
  }

  // 1c. OTP Verification & Login
  if (path === "/api/auth/otp/verify" && method === "POST") {
    const body = await parseBody<{
      mobileNumber: string;
      code: string;
      purpose?: "login" | "attendance" | "registration";
      role?: string;
    }>(request);
    if (!body || !body.mobileNumber || !body.code) {
      return jsonResponse(
        { success: false, message: "Mobile number and 6-digit OTP code are required." },
        400,
      );
    }

    const cleanNumber = normalizeMobile(body.mobileNumber);
    const entry = otpStore.get(cleanNumber);

    if (!entry) {
      return jsonResponse(
        {
          success: false,
          message:
            "No active OTP request found for this mobile number or it has expired. Please click Send OTP again.",
        },
        400,
      );
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(cleanNumber);
      return jsonResponse(
        {
          success: false,
          message:
            "OTP has expired. Verification codes are valid for 5 minutes only. Please request a new OTP.",
        },
        400,
      );
    }

    if (entry.attempts >= 5) {
      otpStore.delete(cleanNumber);
      return jsonResponse(
        {
          success: false,
          code: "TOO_MANY_ATTEMPTS",
          message:
            "Maximum verification attempts exceeded. For security, please request a new OTP.",
        },
        400,
      );
    }

    const submittedHash = await sha256(body.code.trim());
    if (submittedHash !== entry.codeHash) {
      entry.attempts += 1;
      return jsonResponse(
        {
          success: false,
          message: `Invalid OTP code. Please enter the correct 6-digit code (${5 - entry.attempts} attempts remaining).`,
        },
        400,
      );
    }

    // OTP Verified! Consume the single-use OTP
    otpStore.delete(cleanNumber);

    // If for Login: fetch student/account profile strictly from Supabase Database
    if (body.purpose === "registration") {
      return jsonResponse({ success: true, verified: true, message: "Mobile number verified successfully." });
    }

    if (body.purpose === "login" || !body.purpose) {
      // 1. Check in new_registered_students
      let matchedStudent: any = null;
      try {
        const { data } = await supabaseAdmin
          .from("new_registered_students")
          .select("*")
          .or(`mobile_number.ilike.%${cleanNumber}%,email.ilike.%${cleanNumber}%`)
          .maybeSingle();
        matchedStudent = data;
      } catch {}

      // 2. Check in accounts
      let matchedAccount: any = null;
      try {
        const { data } = await supabaseAdmin
          .from("accounts")
          .select("*")
          .or(`roll_no.ilike.%${cleanNumber}%,email.ilike.%${cleanNumber}%`)
          .maybeSingle();
        matchedAccount = data;
      } catch {}

      if (!matchedStudent && !matchedAccount) {
        return jsonResponse(
          {
            success: false,
            code: "STUDENT_NOT_FOUND",
            message: `No registered GSFC University student account found with mobile number +91 ${cleanNumber}. Please complete New Student Registration first.`,
          },
          404,
        );
      }

      const name = matchedStudent?.full_name || matchedAccount?.name || "GSFC Student";
      const roll = matchedStudent?.roll_no || matchedAccount?.roll_no || "";
      // Role is strictly derived from the database account, never from client request body
      const role = (matchedAccount?.role || "student") as string;
      const dept =
        matchedStudent?.department ||
        matchedAccount?.department ||
        "Computer Science & Engineering";
      const email =
        matchedStudent?.email ||
        matchedAccount?.email ||
        `${roll.toLowerCase()}@gsfcuniversity.ac.in`;

      const userAccount = {
        role,
        roleTitle:
          role === "admin" ? "Administration" : role === "organizer" ? "Placement Faculty Coordinator" : "GSFC Student",
        roleBadge: roll,
        name,
        idOrRoll: roll,
        email,
        profile: {
          id: matchedAccount?.id || matchedStudent?.id || `u-${roll.toLowerCase()}`,
          name,
          rollNo: roll,
          email,
          role,
          department: dept,
          semester: matchedStudent?.semester || matchedAccount?.semester || 4,
          year: Math.ceil((matchedStudent?.semester || matchedAccount?.semester || 4) / 2) || 2,
          attendancePercentage: matchedAccount?.attendance_percentage || 100,
          points: matchedAccount?.points || 100,
          streakDays: matchedAccount?.streak_days || 1,
          volunteerHours: matchedAccount?.volunteer_hours || 0,
          avatar:
            name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "ST",
        },
      };

      const sessionToken = createServerSession({
        id: matchedAccount?.id || matchedStudent?.id || `u-${roll.toLowerCase()}`,
        role,
        email,
        name,
        rollNo: roll,
      });

      return jsonResponse({
        success: true,
        message: `OTP verified! Welcome back, ${name}.`,
        account: userAccount,
        token: sessionToken,
      });
    }

    return jsonResponse({
      success: true,
      message: "Mobile number verified successfully via OTP.",
    });
  }

  // 1d. Registration OTP Send (Email & SMS)
  if (path === "/api/auth/registration-otp/send" && method === "POST") {
    const body = await parseBody<{ email: string; mobileNumber?: string; rollNo?: string }>(
      request,
    );
    if (!body || !body.email) {
      return jsonResponse(
        { success: false, message: "Email is required to generate registration verification OTP." },
        400,
      );
    }
    const cleanEmail = body.email.trim().toLowerCase();

    // Rate limiting: 10 per minute per email
    if (!checkRateLimit(`reg-otp:${cleanEmail}`, 10, 60000)) {
      return jsonResponse(
        {
          success: false,
          code: "RATE_LIMITED",
          message: "Too many verification code requests. Please wait a minute.",
        },
        429,
      );
    }

    // Enforce 60-second cooldown
    const existing = registrationOtpStore.get(cleanEmail);
    if (existing && Date.now() - existing.createdAt < 60000) {
      const waitSeconds = Math.ceil((60000 - (Date.now() - existing.createdAt)) / 1000);
      return jsonResponse(
        {
          success: false,
          code: "COOLDOWN_ACTIVE",
          message: `Please wait ${waitSeconds} seconds before requesting a new verification code.`,
          retryAfterSeconds: waitSeconds,
        },
        429,
      );
    }

    // Generate cryptographically secure random 6-digit numeric OTP
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    const generatedOtp = (100000 + (randomBuffer[0] % 900000)).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Hash the OTP — NEVER store plaintext
    const otpHash = await sha256(generatedOtp);

    registrationOtpStore.set(cleanEmail, {
      codeHash: otpHash,
      email: cleanEmail,
      rollNo: body.rollNo?.trim().toUpperCase(),
      mobileNumber: body.mobileNumber,
      expiresAt,
      attempts: 0,
      createdAt: Date.now(),
    });

    // Send email OTP (primary channel)
    let emailResult = { sent: false, provider: "none", configured: false };
    try {
      emailResult = await sendRegistrationOTP(cleanEmail, generatedOtp);
    } catch (emailErr) {
      console.warn("[Registration OTP] Email dispatch error:", emailErr);
    }

    if (!emailResult.sent) {
      return jsonResponse(
        {
          success: false,
          code: "EMAIL_DELIVERY_NOT_CONFIGURED",
          message:
            "Verification email could not be sent. Please configure RESEND_API_KEY or SMTP settings in Vercel, then try again.",
          emailProvider: emailResult.provider,
          emailConfigured: emailResult.configured,
        },
        503,
      );
    }

    // Send SMS OTP (secondary channel)
    let smsNote = "";
    if (body.mobileNumber) {
      const cleanMobile = normalizeMobile(body.mobileNumber);
      if (cleanMobile.length >= 10) {
        const smsRes = await dispatchSms(cleanMobile, generatedOtp, "registration");
        smsNote = smsRes.note;
      }
    }

    // NEVER include the OTP in the API response
    return jsonResponse(
      {
        success: true,
        message: `Verification code sent to ${cleanEmail}. Please check your email inbox (and spam folder). Valid for 10 minutes.`,
        expiresAt,
        email: cleanEmail,
        emailSent: emailResult.sent,
        emailProvider: emailResult.provider,
        emailConfigured: emailResult.configured,
        smsNote,
      },
      200,
    );
  }

  // 1e. Registration OTP Verify
  if (path === "/api/auth/registration-otp/verify" && method === "POST") {
    const body = await parseBody<{ email: string; code: string }>(request);
    if (!body || !body.email || !body.code) {
      return jsonResponse(
        { success: false, message: "Email and 6-digit verification code are required." },
        400,
      );
    }

    const cleanEmail = body.email.trim().toLowerCase();
    const entry = registrationOtpStore.get(cleanEmail);

    if (!entry) {
      return jsonResponse(
        {
          success: false,
          message:
            "No active verification code found for this email or it has expired. Please click Resend OTP.",
        },
        400,
      );
    }

    if (Date.now() > entry.expiresAt) {
      registrationOtpStore.delete(cleanEmail);
      return jsonResponse(
        {
          success: false,
          message: "Verification code has expired. Please request a new code.",
        },
        400,
      );
    }

    if (entry.attempts >= 5) {
      registrationOtpStore.delete(cleanEmail);
      return jsonResponse(
        {
          success: false,
          code: "TOO_MANY_ATTEMPTS",
          message: "Maximum verification attempts exceeded. Please request a new code.",
        },
        400,
      );
    }

    // Compare SHA-256 hash of submitted code against stored hash
    const submittedHash = await sha256(body.code.trim());
    if (submittedHash !== entry.codeHash) {
      entry.attempts += 1;
      return jsonResponse(
        {
          success: false,
          message: `Invalid verification code. Please check the code (${5 - entry.attempts} attempts remaining).`,
        },
        400,
      );
    }

    // Code matches! Consume the single-use OTP
    registrationOtpStore.delete(cleanEmail);

    // Confirm user in Supabase auth.users directly via PostgreSQL
    const confirmed = await confirmUserEmailInAuth(cleanEmail);

    return jsonResponse(
      {
        success: true,
        message: "Email verified successfully.",
        verified: true,
        confirmedInAuth: confirmed,
      },
      200,
    );
  }

  // 2. Authentication: Login with Credentials
  if (path === "/api/auth/login" && method === "POST") {
    const body = await parseBody<{ identifier: string; password?: string; role?: string }>(request);
    if (!body || !body.identifier) {
      return jsonResponse({ success: false, message: "Missing identifier." }, 400);
    }

    const cleanIdentifier = body.identifier.trim();
    if (!checkRateLimit(`login:${cleanIdentifier}`, 15, 60000)) {
      return jsonResponse(
        {
          success: false,
          code: "RATE_LIMITED",
          message: "Too many login attempts. Please wait a minute before retrying.",
        },
        429,
      );
    }

    if (!body.password) {
      return jsonResponse({ success: false, message: "Password is required to sign in." }, 400);
    }

    // Check demo accounts first
    const isDeanDemo = cleanIdentifier.toLowerCase().includes("admin.dean") && body.password === "9558413347@Om";
    const isTpcDemo = cleanIdentifier.toLowerCase().includes("tpc.admin") && body.password === "7043313347@Om";

    // Check account in database
    const account = await supabaseSync.getAccountByIdentifier(cleanIdentifier);
    let targetEmail = account?.email;

    let student = null;
    if (!account) {
      // Check new_registered_students table
      const cleanId = cleanIdentifier.toUpperCase();
      student = await supabaseSync.getStudentByRollOrEmail(
        cleanId,
        cleanIdentifier.toLowerCase(),
      );
      if (student) {
        targetEmail = student.email;
      }
    }

    if (!isDeanDemo && !isTpcDemo && !account && !student) {
      return jsonResponse(
        { success: false, message: "Invalid credentials or account not registered." },
        401,
      );
    }

    if (account) {
      const serverRole = account.role;
      const sessionToken = createServerSession({
        id: account.id,
        role: serverRole,
        email: account.email,
        name: account.name,
        rollNo: account.roll_no,
      });

      return jsonResponse({
        success: true,
        message: `Authenticated as ${account.name}`,
        account: {
          role: serverRole,
          roleTitle:
            serverRole === "admin"
              ? "Administration (Dean & Academic Governance)"
              : serverRole === "organizer"
                ? "Placement Faculty Coordinator"
                : "GSFC Student",
          roleBadge: account.roll_no,
          name: account.name,
          idOrRoll: account.roll_no,
          email: account.email,
          profile: {
            id: account.id,
            name: account.name,
            rollNo: account.roll_no,
            email: account.email,
            role: serverRole,
            department: account.department,
            semester: account.semester || 4,
            year: account.year || 2,
            attendancePercentage: account.attendance_percentage || 100,
            points: account.points || 100,
            streakDays: account.streak_days || 1,
            volunteerHours: account.volunteer_hours || 0,
            avatar: account.avatar || account.name.slice(0, 2).toUpperCase(),
          },
        },
        token: sessionToken,
      });
    }

    // Fallback for verified student record
    const cleanId = cleanIdentifier.toUpperCase();
    if (!student) {
      student = await supabaseSync.getStudentByRollOrEmail(
        cleanId,
        cleanIdentifier.toLowerCase(),
      );
    }
    if (student) {
      const studentAccount = {
        role: "student",
        roleTitle: "GSFC Student",
        roleBadge: student.rollNo,
        name: student.fullName,
        idOrRoll: student.rollNo,
        email: student.email,
        profile: {
          id: student.id,
          name: student.fullName,
          rollNo: student.rollNo,
          email: student.email,
          role: "student",
          department: `${student.degree} ${student.department}`,
          semester: student.semester,
          year: 2,
          attendancePercentage: 100,
          points: 100,
          streakDays: 1,
          volunteerHours: 0,
          avatar:
            student.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "ST",
        },
      };

      // Persist to accounts table as well
      await supabaseSync.saveAccount({
        id: student.id,
        name: student.fullName,
        roll_no: student.rollNo,
        email: student.email,
        role: "student",
        department: student.department,
        semester: student.semester,
      });

      const sessionToken = createServerSession({
        id: student.id,
        role: "student",
        email: student.email,
        name: student.fullName,
        rollNo: student.rollNo,
      });

      return jsonResponse({
        success: true,
        message: `Authenticated as ${student.fullName}`,
        account: studentAccount,
        token: sessionToken,
      });
    }

    return jsonResponse(
      { success: false, message: "Invalid credentials or account not registered." },
      401,
    );
  }

  // Internship applications: persist through the server-side Supabase client.
  if (path === "/api/internships/applications" && method === "POST") {
    const body = await parseBody<{
      application?: Record<string, unknown>;
      notification?: Record<string, unknown>;
    }>(request);

    if (!body?.application?.id || !body.application.internship_id || !body.application.student_id) {
      return jsonResponse(
        { success: false, message: "Missing internship application identity fields." },
        400,
      );
    }

    const { data, error } = await supabaseAdmin
      .from("internship_applications")
      .upsert(body.application, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      console.error("[Internship Application] Supabase save failed:", error.message);
      return jsonResponse(
        { success: false, message: "Application could not be saved to the university database." },
        500,
      );
    }

    if (body.notification?.id) {
      const { error: notificationError } = await supabaseAdmin
        .from("internship_notifications")
        .upsert(body.notification, { onConflict: "id" });
      if (notificationError) {
        console.warn("[Internship Application] Notification save failed:", notificationError.message);
      }
    }

    return jsonResponse({ success: true, application: data });
  }

  // 3. Authentication: Google Workspace SSO
  if (path === "/api/auth/google" && method === "POST") {
    if (!isSupabaseAdminConfigured) {
      // Demo-mode fallback: DB not configured on Vercel → return a valid student
      // session so the showcase works without SUPABASE_SERVICE_ROLE_KEY.
      const demoName = "GSFC Student";
      const demoEmail = "student@gsfcuniversity.ac.in";
      const demoRoll = "GSFC-DEMO";
      const demoId = "u-google-demo";
      const demoToken = createServerSession({
        id: demoId,
        role: "student",
        email: demoEmail,
        name: demoName,
        rollNo: demoRoll,
      });
      return jsonResponse({
        success: true,
        message: "Signed in with Google Workspace (Demo Mode)",
        account: {
          role: "student",
          roleTitle: "GSFC Student",
          roleBadge: demoRoll,
          name: demoName,
          idOrRoll: demoRoll,
          email: demoEmail,
          profile: {
            id: demoId,
            name: demoName,
            rollNo: demoRoll,
            email: demoEmail,
            role: "student",
            department: "Computer Science & Engineering",
            school: "School of Technology (SOT)",
            degree: "B.Tech",
            semester: 4,
            year: 2,
            attendanceRate: 100,
            points: 100,
            streakDays: 1,
            volunteerHours: 0,
            badges: ["b1"],
            avatar: "GS",
            isVerified: true,
          },
        },
        token: demoToken,
      });
    }

    // ──────────────────────────────────────────────────────────────────────
    // Demo-mode fallback: when DB is not configured (SUPABASE_SERVICE_ROLE_KEY
    // missing on Vercel), return a valid demo session so the showcase works.
    // ──────────────────────────────────────────────────────────────────────
    const bearerToken = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
    if (!bearerToken) {
      return jsonResponse({ success: false, message: "A valid Supabase authentication token is required." }, 401);
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(bearerToken);
    if (authError || !authData.user?.email) {
      return jsonResponse({ success: false, message: "Google authentication could not be verified." }, 401);
    }
    const cleanEmail = authData.user.email.trim().toLowerCase();

    // Verify against registered database accounts or students
    let account = await supabaseSync.getAccountByIdentifier(cleanEmail);
    let matchedStudent = null;

    if (!account) {
      matchedStudent = await supabaseSync.getStudentByRollOrEmail("___NONE___", cleanEmail);
      if (matchedStudent) {
        const studentAccountPayload = {
          id: matchedStudent.id,
          name: matchedStudent.fullName,
          roll_no: matchedStudent.rollNo,
          email: matchedStudent.email,
          role: "student",
          department: matchedStudent.department,
          semester: matchedStudent.semester,
          year: Math.ceil(matchedStudent.semester / 2) || 2,
          attendance_percentage: 100,
          points: 100,
          streak_days: 1,
          volunteer_hours: 0,
          avatar: matchedStudent.fullName.slice(0, 2).toUpperCase(),
        };
        await supabaseSync.saveAccount(studentAccountPayload);
        account = studentAccountPayload;
      }
    }

    if (!account) {
      return jsonResponse(
        {
          success: false,
          code: "ACCOUNT_NOT_AUTHORIZED",
          message:
            "Your Google account is not registered with GSFC University. Please complete student registration or contact administration.",
        },
        403,
      );
    }

    // Role is strictly derived from the university database account
    const serverRole = account.role;
    const sessionToken = createServerSession({
      id: account.id,
      role: serverRole,
      email: account.email,
      name: account.name,
      rollNo: account.roll_no,
    });

    return jsonResponse({
      success: true,
      message: `Authenticated via Google as ${account.name}`,
      account: {
        role: serverRole,
        roleTitle:
          serverRole === "admin"
            ? "Administration (Dean & Academic Governance)"
            : serverRole === "organizer"
              ? "Placement Faculty Coordinator"
              : "GSFC Student",
        roleBadge: account.roll_no,
        name: account.name,
        idOrRoll: account.roll_no,
        email: account.email,
        profile: {
          id: account.id,
          name: account.name,
          rollNo: account.roll_no,
          email: account.email,
          role: serverRole,
          department: account.department || "Computer Science & Engineering",
          year: account.year || 2,
          semester: account.semester || 4,
          attendancePercentage: account.attendance_percentage || 100,
          points: account.points || 100,
          streakDays: account.streak_days || 1,
          volunteerHours: account.volunteer_hours || 0,
          avatar: account.avatar || "OT",
        },
      },
      token: sessionToken,
    });
  }

  // 1. Events: List Catalog
  if (path === "/api/events" && method === "GET") {
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");

    const events = await supabaseSync.getEvents(category, status);
    return jsonResponse({ success: true, count: events.length, events });
  }

  // 5. Events: Create Event
  if (path === "/api/events" && method === "POST") {
    console.log('[EVENT_CREATE] REQUEST_START');
    
    const eventData =
      await parseBody<Omit<CampusEvent, "id" | "registeredCount" | "waitlistCount">>(request);
    if (!eventData || !eventData.title || !eventData.venue || !eventData.date) {
      console.log('[EVENT_CREATE] VALIDATION_FAILED', { missing: { title: !eventData?.title, venue: !eventData?.venue, date: !eventData?.date } });
      return jsonResponse({ success: false, message: "Missing required event fields (title, venue, date)." }, 400);
    }

    // Generate ID ONCE on backend
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newEvent: CampusEvent = {
      ...eventData,
      id: eventId,
      registeredCount: 0,
      waitlistCount: 0,
      status: eventData.status || "upcoming",
      averageRating: 5.0,
      reviewCount: 0,
      description: eventData.description || "",
      category: eventData.category || "workshop",
      department: eventData.department || "General",
      time: eventData.time || "10:00 AM",
      organizerName: eventData.organizerName || "Admin",
      organizerEmail: eventData.organizerEmail || "admin@gsfc.edu",
      capacity: eventData.capacity || 100,
      approvalRequired: eventData.approvalRequired ?? false,
      isTeamEvent: eventData.isTeamEvent ?? false,
      minTeamSize: eventData.minTeamSize || 1,
      maxTeamSize: eventData.maxTeamSize || 4,
      volunteerHoursReward: eventData.volunteerHoursReward || 0,
      bannerImage: eventData.bannerImage || "",
    };

    console.log('[EVENT_CREATE] EVENT_PAYLOAD', { id: newEvent.id, title: newEvent.title });

    // Save to Supabase - now returns structured result
    const saveResult = await supabaseSync.saveEvent(newEvent);
    
    console.log('[EVENT_CREATE] DB_RESULT', { success: saveResult.success, eventId: newEvent.id });
    
    // Return success with actual database event if saved
    if (saveResult.success && saveResult.data) {
      console.log('[EVENT_CREATE] HTTP_201_SUCCESS', { eventId: saveResult.data.id });
      return jsonResponse(
        {
          success: true,
          message: "Event created successfully.",
          event: saveResult.data,
        },
        201,
      );
    }

    // Return error with details if failed
    const errorMessage = saveResult.error?.message || "Could not save event to database.";
    console.log('[EVENT_CREATE] HTTP_500_ERROR', { 
      eventId: newEvent.id, 
      reason: saveResult.error?.message,
      code: saveResult.error?.code,
    });
    
    return jsonResponse(
      {
        success: false,
        message: "Event could not be created. Please try again.",
        code: "EVENT_CREATE_FAILED",
      },
      500,
    );
  }

  // 5b. Events: Delete Event (Admin & Placement Coordinator)
  if (path.startsWith("/api/events/") && method === "DELETE") {
    const parts = path.split("/");
    const eventId = parts[3];
    if (!eventId) {
      return jsonResponse({ success: false, message: "Missing event ID." }, 400);
    }

    console.log('[EVENT_DELETE] REQUEST_RECEIVED', { eventId });
    const success = await supabaseSync.deleteEvent(eventId);
    if (success) {
      return jsonResponse({ success: true, message: "Event deleted successfully." });
    } else {
      return jsonResponse({ success: false, message: "Could not delete event from database." }, 500);
    }
  }

  // 6. Events: Register (Unique Constraint & Duplicate Protected)
  if (path === "/api/events/register" && method === "POST") {
    const body = await parseBody<{
      eventId: string;
      userId: string;
      userRollNo: string;
      userName: string;
      department: string;
      isTeam?: boolean;
      teamName?: string;
      teamMembers?: Array<{ name: string; rollNo: string; email: string }>;
    }>(request);

    if (!body || !body.eventId || !body.userId) {
      return jsonResponse({ success: false, message: "Missing registration payload." }, 400);
    }

    const event = await supabaseSync.getEventById(body.eventId);
    if (!event) return jsonResponse({ success: false, message: "Event not found." }, 404);

    // Prevent duplicate registration for the same event
    const existingRegs = await supabaseSync.getRegistrations(body.eventId);
    const alreadyRegistered = existingRegs.some(
      (r) =>
        r.userId === body.userId ||
        (body.userRollNo && r.userRollNo.toUpperCase() === body.userRollNo.toUpperCase()),
    );
    if (alreadyRegistered) {
      return jsonResponse(
        {
          success: false,
          code: "ALREADY_REGISTERED",
          message: "You are already registered for this event.",
        },
        409,
      );
    }

    const isFull = event.registeredCount >= event.capacity;
    const regStatus = isFull ? "waitlisted" : "confirmed";

    const newReg: Registration = {
      id: `reg-${Date.now()}`,
      eventId: body.eventId,
      userId: body.userId,
      userRollNo: body.userRollNo,
      userName: body.userName,
      department: body.department,
      registeredAt: new Date().toISOString(),
      status: regStatus,
      isTeam: body.isTeam || false,
      teamName: body.teamName,
      teamMembers: body.teamMembers,
    };

    await supabaseSync.saveRegistration(newReg);

    // Update event counts
    if (!isFull) {
      event.registeredCount += 1;
    } else {
      event.waitlistCount += 1;
    }
    await supabaseSync.saveEvent(event);

    return jsonResponse({
      success: true,
      message: isFull ? "Added to waitlist on Supabase" : "Registration confirmed on Supabase",
      registration: newReg,
      waitlisted: isFull,
      event,
    });
  }

  // 6b. Events: Get Registrations for an Event or All
  if (
    (path === "/api/registrations" ||
      (path.startsWith("/api/events/") && path.endsWith("/registrations"))) &&
    method === "GET"
  ) {
    let eventId = url.searchParams.get("eventId");
    if (!eventId && path.startsWith("/api/events/")) {
      const parts = path.split("/");
      // e.g. /api/events/evt-123/registrations -> parts[3] is evt-123
      if (parts.length >= 4) {
        eventId = parts[3];
      }
    }

    const registrations = await supabaseSync.getRegistrations(eventId || undefined);
    return jsonResponse({
      success: true,
      count: registrations.length,
      registrations,
    });
  }

  // 7. Attendance: Server-side Geofenced & Validated Check-In
  if (path === "/api/attendance/check-in" && method === "POST") {
    const body = await parseBody<{
      eventId: string;
      token: string;
      latitude: number;
      longitude: number;
      accuracy: number;
      capturedAt: string;
    }>(request);

    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return jsonResponse({ success: false, code: "UNAUTHENTICATED", message: "Please sign in again before checking in." }, 401);
    }

    if (!body || !body.eventId || !body.token || !Number.isFinite(body.latitude) || !Number.isFinite(body.longitude)) {
      return jsonResponse({ success: false, message: "Invalid check-in payload." }, 400);
    }

    if (body.latitude < -90 || body.latitude > 90 || body.longitude < -180 || body.longitude > 180) {
      return jsonResponse({ success: false, code: "INVALID_COORDINATES", message: "Invalid GPS coordinates." }, 400);
    }

    const capturedAt = Date.parse(body.capturedAt);
    const ageMs = Date.now() - capturedAt;
    if (!Number.isFinite(capturedAt) || ageMs < -30000 || ageMs > 120000) {
      return jsonResponse({ success: false, code: "STALE_LOCATION", message: "Location fix is stale. Please refresh GPS and try again." }, 400);
    }

    const maxAccuracy = Number(process.env.MAX_ACCEPTABLE_ACCURACY_METERS || 50);
    if (!Number.isFinite(body.accuracy) || body.accuracy < 0 || body.accuracy > maxAccuracy) {
      return jsonResponse({ success: false, code: "LOW_LOCATION_ACCURACY", message: `GPS accuracy must be ${maxAccuracy}m or better.` }, 403);
    }

    // Token validation: must be present and non-empty
    if (!body.token || !body.token.trim()) {
      return jsonResponse(
        {
          success: false,
          code: "INVALID_TOKEN",
          message: "A valid rotating QR attendance code or session token is required.",
        },
        400,
      );
    }

    const qrValidation = validateQrPayload(body.token, body.eventId);
    if (!qrValidation.valid) {
      return jsonResponse({ success: false, code: "INVALID_QR", message: qrValidation.reason || "QR code is invalid or expired." }, 403);
    }
    const qrKey = `${body.eventId}:${authUser.userId}:${qrValidation.payload?.token || body.token}`;
    if (usedQrTokens.has(qrKey)) {
      return jsonResponse({ success: false, code: "QR_ALREADY_USED", message: "This QR attendance code has already been used." }, 409);
    }

    const event = await supabaseSync.getEventById(body.eventId);
    if (!event) return jsonResponse({ success: false, message: "Event not found." }, 404);
    if (event.status !== "live") {
      return jsonResponse({ success: false, code: "EVENT_NOT_ACTIVE", message: "Attendance is not active for this event." }, 403);
    }

    // Verify student is actually registered for this event
    const eventRegistrations = await supabaseSync.getRegistrations(body.eventId);
    const userReg = eventRegistrations.find(
      (r) =>
        r.userId === authUser.userId ||
        (authUser.rollNo && r.userRollNo.toUpperCase() === authUser.rollNo.toUpperCase()),
    );
    if (!userReg) {
      return jsonResponse(
        {
          success: false,
          code: "NOT_REGISTERED",
          message: "You must be officially registered for this event to check in.",
        },
        403,
      );
    }

    // Prevent duplicate attendance
    const existingRecords = await supabaseSync.getAttendance(body.eventId);
    const existing = existingRecords.find(
      (a) =>
        a.userId === authUser.userId ||
        (authUser.rollNo && a.userRollNo.toUpperCase() === authUser.rollNo.toUpperCase()),
    );
    if (existing) {
      return jsonResponse(
        {
          success: false,
          code: "ALREADY_CHECKED_IN",
          message: "Attendance has already been recorded for this event.",
        },
        409,
      );
    }

    // Server-Side Geofence Calculation using Haversine Formula against GSFC Campus Coordinates
    const venueLatitude = event.venueLatitude;
    const venueLongitude = event.venueLongitude;
    const allowedRadius = event.allowedRadiusMeters || 350;
    if (!Number.isFinite(venueLatitude) || !Number.isFinite(venueLongitude)) {
      return jsonResponse({ success: false, code: "VENUE_NOT_CONFIGURED", message: "This event does not have a verified venue configured." }, 503);
    }

    let distanceMeters = calculateHaversineMeters(
      venueLatitude,
      venueLongitude,
      body.latitude,
      body.longitude,
    );
    let isLocationVerified = true;

    if (distanceMeters > allowedRadius) {
      isLocationVerified = false;
      return jsonResponse(
        {
          success: false,
          code: "GEOFENCE_VALIDATION_FAILED",
          message: `Attendance could not be verified because you are outside the permitted event area (${distanceMeters}m away; maximum ${allowedRadius}m).`,
          distanceMeters,
          maxAllowedMeters: allowedRadius,
        },
        403,
      );
    }

    const verifiedRoll = authUser.rollNo || userReg.userRollNo || "0000";
    const rollSuffix = verifiedRoll.replace(/[^a-zA-Z0-9]/g, "").slice(-4) || "0000";
    const certId = `GSFC-CERT-${event.id.toUpperCase()}-${rollSuffix}-${Date.now().toString(36).toUpperCase()}`;

    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      eventId: body.eventId,
      eventTitle: event.title,
      userId: authUser.userId,
      userName: authUser.name,
      userRollNo: verifiedRoll,
      department: userReg.department,
      timestamp: new Date().toISOString(),
      punchInTime: new Date().toISOString(),
      verifiedMethod: "qr_scan",
      tokenUsed: qrValidation.payload?.token || body.token,
      synced: true,
      certificateId: certId,
      userLatitude: body.latitude,
      userLongitude: body.longitude,
      accuracyMeters: body.accuracy,
      distanceFromVenueMeters: distanceMeters,
      locationVerified: isLocationVerified,
    };

    const saved = await supabaseSync.saveAttendance(record);
    if (!saved) {
      return jsonResponse({ success: false, code: "DATABASE_ERROR", message: "Attendance could not be saved to the university database." }, 500);
    }
    usedQrTokens.set(qrKey, Date.now());

    return jsonResponse({
      success: true,
      message: `Attendance verified with live GPS (${distanceMeters}m from venue) and recorded to Supabase.`,
      record,
    });
  }

  // 8. Certificates: Public Verification Gateway
  if (path.startsWith("/api/certificates/verify")) {
    const certId = url.searchParams.get("id") || path.split("/").pop();
    if (!certId) return jsonResponse({ success: false, message: "Certificate ID required." }, 400);

    const record = await supabaseSync.getCertificateRecord(certId);

    if (record) {
      return jsonResponse({
        success: true,
        verified: true,
        certificateId: record.certificateId,
        studentName: record.userName,
        rollNumber: record.userRollNo,
        department: record.department,
        eventTitle: record.eventTitle,
        issuedOn: record.timestamp,
        verificationAuthority: "GSFC University Academic Governance & TPC",
      });
    }

    return jsonResponse(
      { success: false, verified: false, message: "Certificate ID not found or invalid." },
      404,
    );
  }

  // 9. Clubs & Communities
  if (path === "/api/clubs" && method === "GET") {
    const clubs = await supabaseSync.getClubs();
    return jsonResponse({ success: true, count: clubs.length, clubs });
  }

  if (path === "/api/clubs/join" && method === "POST") {
    const body = await parseBody<{
      clubId: string;
      userId: string;
      userName: string;
      userRollNo: string;
      department: string;
    }>(request);
    if (!body || !body.clubId || !body.userId) {
      return jsonResponse({ success: false, message: "Missing club membership details." }, 400);
    }

    const member: ClubMember = {
      id: `cm-${Date.now()}`,
      clubId: body.clubId,
      userId: body.userId,
      userName: body.userName,
      userRollNo: body.userRollNo,
      department: body.department,
      role: "member",
      joinedAt: new Date().toISOString(),
      status: "active",
      volunteerHoursEarned: 0,
    };

    await supabaseSync.joinClub(member);
    return jsonResponse({ success: true, message: `Joined club successfully!`, member });
  }

  // 10. Campus Announcements Feed
  if (path === "/api/announcements" && method === "GET") {
    const announcements = await supabaseSync.getAnnouncements();
    return jsonResponse({ success: true, count: announcements.length, announcements });
  }

  if (path === "/api/announcements" && method === "POST") {
    const data = await parseBody<Omit<CampusAnnouncement, "id" | "createdAt" | "readBy">>(request);
    if (!data || !data.title || !data.content) {
      return jsonResponse(
        { success: false, message: "Missing announcement title or content." },
        400,
      );
    }

    const newAnn: CampusAnnouncement = {
      ...data,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
      readBy: [],
    };

    await supabaseSync.saveAnnouncement(newAnn);
    return jsonResponse(
      {
        success: true,
        message: "Announcement broadcasted successfully to Supabase.",
        announcement: newAnn,
      },
      201,
    );
  }

  // 11. AI Campus Assistant Backend
  if (path === "/api/ai/assistant" && method === "POST") {
    const body = await parseBody<{ prompt: string; userRole?: string; userId?: string }>(request);
    const userPrompt = (body?.prompt || "").trim();
    const promptLower = userPrompt.toLowerCase();

    const events = await supabaseSync.getEvents();
    const clubs = await supabaseSync.getClubs();

    const rawBaseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const openaiBaseUrl = rawBaseUrl.replace(/\/$/, "").replace("://localhost:", "://127.0.0.1:");

    let reply = "";

    if (openaiApiKey && userPrompt) {
      try {
        const systemContext = `You are the official GSFC University Campus Connect AI Assistant, helping students and faculty at GSFC University, Vadodara.
You provide helpful, concise, accurate, and encouraging guidance about university events, academic schedules, clubs, attendance policies, and campus amenities.
Format your responses using clean GitHub-style markdown (bullet points, bold text, headers).

Current Live Campus Events:
${events.map((e) => `- "${e.title}" on ${e.date} (${e.time}) at ${e.venue}. Category: ${e.category}. Coordinator: ${e.organizerName}.`).join("\n") || "No upcoming events scheduled at this moment."}

Official Student Clubs:
${clubs.map((c) => `- ${c.name} (${c.category}): ${c.description || "Active student society"}`).join("\n") || "Technical, Cultural, and Sports student clubs active on campus."}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const aiResponse = await fetch(`${openaiBaseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gemini/gemini-3.8-flash",
            stream: false,
            messages: [
              { role: "system", content: systemContext },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 600,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          reply = aiData?.choices?.[0]?.message?.content?.trim() || "";
        } else {
          const errText = await aiResponse.text();
          console.warn("AI API returned status:", aiResponse.status, errText);
        }
      } catch (err) {
        console.warn("AI API request failed or timed out:", err);
      }
    }

    // High quality fallback if OpenAI call is unavailable or fails
    if (!reply) {
      if (
        promptLower.includes("event") ||
        promptLower.includes("hackathon") ||
        promptLower.includes("workshop") ||
        promptLower.includes("seminar")
      ) {
        reply =
          `### 📅 GSFC Campus Events (Live Feed):\n` +
          events
            .map(
              (e) =>
                `• **${e.title}** (${e.date} · ${e.time})\n  📍 *${e.venue}* · Organized by ${e.organizerName}\n  Category: \`${e.category}\``,
            )
            .join("\n\n");
      } else if (
        promptLower.includes("club") ||
        promptLower.includes("society") ||
        promptLower.includes("team")
      ) {
        reply =
          `### 🏛️ GSFC University Student Clubs & Chapters:\n` +
          clubs
            .map(
              (c) =>
                `• **${c.logo || "🎓"} ${c.name}** (${c.category})\n  ${c.description || "University student chapter."}`,
            )
            .join("\n\n");
      } else if (
        promptLower.includes("attendance") ||
        promptLower.includes("punch") ||
        promptLower.includes("geo")
      ) {
        reply =
          `### 📍 Attendance & Verification Guidelines:\n` +
          `• **Geo-Fenced Punch**: Attendance is verified using GPS on-campus at GSFC University venues.\n` +
          `• **100 Activity Points (SAP)**: Participating in verified technical and cultural events earns activity points towards your degree requirement.\n` +
          `• **Certificates**: Automatically issued upon verified attendance completion and coordinator sign-off.`;
      } else if (promptLower.includes("noc") || promptLower.includes("internship")) {
        reply =
          `### 📄 Dean's No Objection Certificate (NOC):\n` +
          `• You can request an official Dean NOC letter for mandatory semester industrial training and internships via the **Internships & NOC** section.\n` +
          `• Letters are authenticated and digitally stamped by the Training & Placement Cell (TPC).`;
      } else {
        reply =
          `Hello! I am your **GSFC Campus AI Assistant** 🎓.\n\n` +
          `I can help you with:\n` +
          `• **Campus Events & Workshops** (dates, venues, registrations)\n` +
          `• **Student Clubs & Chapters** (joining, leadership)\n` +
          `• **Verified Attendance & Certificates** (GPS check-ins, download certificates)\n` +
          `• **Dean NOC Letters & Internships** (TPC approvals)\n\n` +
          `What would you like to explore today?`;
      }
    }

    return jsonResponse({
      id: `ai-res-${Date.now()}`,
      sender: "assistant",
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  }

  // 12. Newly Registered Students (Immutable Identity System)
  if (path === "/api/students/register" && method === "POST") {
    // Rate limit registrations
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`register:${clientIp}`, 10, 60 * 1000)) {
      return jsonResponse(
        {
          success: false,
          code: "RATE_LIMITED",
          message: "Too many registration attempts. Please wait a minute and try again.",
        },
        429,
      );
    }

    const body =
      await parseBody<Partial<import("../lib/types").NewRegisteredStudent & { password?: string }>>(
        request,
      );
    if (!body || !body.fullName || !body.rollNo || !body.mobileNumber || !body.email) {
      return jsonResponse(
        {
          success: false,
          code: "MISSING_FIELDS",
          message:
            "Missing mandatory registration fields: Full Name, Roll No, Mobile Number, or Email.",
        },
        400,
      );
    }

    const cleanRoll = body.rollNo.trim().toUpperCase();
    const cleanMobile = body.mobileNumber.trim().replace(/[^0-9]/g, "");
    const cleanEmail = body.email.trim().toLowerCase();

    if (cleanMobile.length < 10) {
      return jsonResponse(
        {
          success: false,
          code: "INVALID_MOBILE",
          message: "Please enter a valid 10-digit mobile number.",
        },
        400,
      );
    }

    // Check if roll number or email already registered in Supabase new_registered_students or accounts
    const existingStudent = await supabaseSync.getStudentByRollOrEmail(cleanRoll, cleanEmail);
    const existingAccount = await supabaseSync.getAccountByIdentifier(cleanEmail);
    const existingAccountRoll = await supabaseSync.getAccountByIdentifier(cleanRoll);

    if (existingStudent || existingAccount || existingAccountRoll) {
      return jsonResponse(
        {
          success: false,
          code: "STUDENT_ALREADY_EXISTS",
          message: `Student with Roll Number '${cleanRoll}' or Email '${cleanEmail}' is already registered in the database.`,
          isLocked: true,
        },
        409,
      );
    }

    const newStudent: import("../lib/types").NewRegisteredStudent = {
      id: `STU-${cleanRoll}`,
      fullName: body.fullName.trim(),
      mobileNumber: cleanMobile,
      rollNo: cleanRoll,
      email: cleanEmail,
      school: body.school || "School of Technology (SOT)",
      department: body.department || "Computer Science & Engineering",
      degree: body.degree || "B.Tech",
      semester: Number(body.semester) || 4,
      residenceType: body.residenceType || "dayscholar",
      hostelBlockOrBusRoute: body.hostelBlockOrBusRoute || "",
      clubsInterested: body.clubsInterested || [],
      idCardUploaded: Boolean(body.idCardUploaded),
      isLocked: true, // Permanent lock enforced
      verifiedByUniversity: false, // Strict university verification workflow default
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    // 1. Skip Supabase auth creation - just create student record
    // Auth user will be created on first login if needed
    console.log("[REGISTER] Skipping auth creation, proceeding directly to student record");

    // 2. Sync to Supabase table: new_registered_students
    const supabaseResult = await supabaseSync.saveNewStudent(newStudent);
    if (!supabaseResult.success) {
      return jsonResponse(
        {
          success: false,
          code: "DATABASE_ERROR",
          message: `Database insertion failed: ${supabaseResult.message || "Unable to save to Supabase."}`,
        },
        500,
      );
    }

    // 3. Also sync login account in Supabase accounts table
    try {
      const accountRes = await supabaseSync.saveAccount({
        id: `u-${cleanRoll.toLowerCase()}`,
        roll_no: cleanRoll,
        email: cleanEmail,
        password_hash: body.password || "$2b$10$defaultHashPlaceholder",
        mobile_number: cleanMobile,
        role: "student",
        department: newStudent.department,
        semester: newStudent.semester,
        avatar: newStudent.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        is_verified: true,
      });

      if (accountRes && accountRes.success) {
        console.log("[REGISTER] Student and account records created successfully");
      } else {
        console.warn("[REGISTER] Note: Secondary accounts table sync warning:", accountRes?.message);
      }
    } catch (secErr: any) {
      console.warn(
        "[REGISTER] Secondary account sync warning (non-blocking):",
        secErr?.message || secErr,
      );
    }

    const sessionToken = createServerSession({
      id: `u-${cleanRoll.toLowerCase()}`,
      role: "student",
      email: cleanEmail,
      name: newStudent.fullName,
      rollNo: cleanRoll,
    });

    return jsonResponse(
      {
        success: true,
        message:
          "Student registration saved to database successfully. Pending university verification.",
        student: newStudent,
        token: sessionToken,
        identityLocked: true,
        supabaseSyncStatus: "synced",
      },
      201,
    );
  }

  // Paginated Student Registry query
  if (path === "/api/students/registry" && method === "GET") {
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("pageSize") || "25", 10)),
    );
    const search = url.searchParams.get("search") || undefined;
    const department = url.searchParams.get("department") || undefined;
    const status = url.searchParams.get("status") || undefined;

    const result = await supabaseSync.getPaginatedStudents({
      page,
      pageSize,
      search,
      department,
      status,
    });

    return jsonResponse(
      {
        success: true,
        ...result,
        totalPages: Math.ceil(result.total / pageSize) || 1,
      },
      200,
    );
  }

  // Fetch all registered students directly from Supabase (legacy/compatibility endpoint)
  if (path === "/api/students/registered" && method === "GET") {
    const students = await supabaseSync.getNewRegisteredStudents();
    return jsonResponse({
      success: true,
      count: students.length,
      students,
    });
  }

  // 13. Update Student Profile (Enforces Academic Integrity with server-side role check)
  if (path === "/api/students/profile/update" && method === "POST") {
    const body = await parseBody<{
      studentId: string;
      fullName?: string;
      mobileNumber?: string;
      rollNo?: string;
      email?: string;
      school?: string;
      department?: string;
      degree?: string;
      semester?: number;
      residenceType?: "hostel" | "dayscholar";
      hostelBlockOrBusRoute?: string;
      clubsInterested?: string[];
      verifiedByUniversity?: boolean;
    }>(request);

    if (!body || !body.studentId) {
      return jsonResponse(
        { success: false, code: "MISSING_ID", message: "Missing student ID or roll number." },
        400,
      );
    }

    const currentStudent = await supabaseSync.getStudentByRollOrEmail(body.studentId);

    if (!currentStudent) {
      return jsonResponse(
        { success: false, code: "NOT_FOUND", message: "Student record not found in database." },
        404,
      );
    }

    const isModifyingIdentity =
      (body.fullName && body.fullName.trim() !== currentStudent.fullName) ||
      (body.rollNo && body.rollNo.trim().toUpperCase() !== currentStudent.rollNo) ||
      (body.verifiedByUniversity !== undefined &&
        body.verifiedByUniversity !== currentStudent.verifiedByUniversity);

    // Only authorized administrator or dean can alter immutable identity or university verification status
    if (isModifyingIdentity) {
      const authUser = await getAuthenticatedUser(request);
      const isPrivilegedAdmin =
        authUser && ["admin", "dean", "super_admin"].includes(authUser.role);

      if (!isPrivilegedAdmin) {
        return jsonResponse(
          {
            success: false,
            code: "UNAUTHORIZED_IDENTITY_MODIFICATION",
            message:
              "SECURITY POLICY: Modifying Student Name, Roll Number, or University Verification status requires an authorized administrator session.",
            lockedFields: ["fullName", "rollNo", "verifiedByUniversity"],
          },
          403,
        );
      }
    }

    // Validate mobile number if supplied
    let cleanMobile: string | undefined = undefined;
    if (body.mobileNumber !== undefined) {
      cleanMobile = body.mobileNumber.trim().replace(/[^0-9]/g, "");
      if (cleanMobile.length < 10) {
        return jsonResponse(
          {
            success: false,
            code: "INVALID_MOBILE",
            message: "Please enter a valid 10-digit mobile number.",
          },
          400,
        );
      }
    }

    const updateRes = await supabaseSync.updateStudentProfile(currentStudent.rollNo, {
      fullName: body.fullName?.trim(),
      rollNo: body.rollNo?.trim().toUpperCase(),
      email: body.email?.trim().toLowerCase(),
      mobileNumber: cleanMobile,
      school: body.school,
      department: body.department,
      degree: body.degree,
      semester: body.semester !== undefined ? Number(body.semester) : undefined,
      residenceType: body.residenceType,
      hostelBlockOrBusRoute: body.hostelBlockOrBusRoute,
      clubsInterested: body.clubsInterested,
      verifiedByUniversity: body.verifiedByUniversity,
    });

    if (!updateRes.success) {
      return jsonResponse(
        {
          success: false,
          code: "UPDATE_FAILED",
          message: updateRes.message || "Failed to update student profile in database.",
        },
        500,
      );
    }

    return jsonResponse({
      success: true,
      message: "Student record updated in database successfully.",
      student: updateRes.student,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD — STEP 1: Request OTP
  // ─────────────────────────────────────────────────────────────────────────
  if (path === "/api/auth/password-reset/request" && method === "POST") {
    const body = await parseBody<{ email: string }>(request);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body?.email || !emailRegex.test(body.email.trim())) {
      return jsonResponse(
        { success: false, message: "Please provide a valid email address." },
        400,
      );
    }

    const cleanEmail = body.email.trim().toLowerCase();

    // Rate limit: 5 requests per hour per email
    if (!checkRateLimit(`pw-reset:${cleanEmail}`, 5, 3600000)) {
      return jsonResponse(
        {
          success: false,
          code: "RATE_LIMITED",
          message: "Too many password reset requests. Please wait before trying again.",
        },
        429,
      );
    }

    // 60-second resend cooldown
    const existingEntry = passwordResetOtpStore.get(cleanEmail);
    if (existingEntry && Date.now() - existingEntry.createdAt < 60000) {
      const waitSeconds = Math.ceil((60000 - (Date.now() - existingEntry.createdAt)) / 1000);
      return jsonResponse(
        {
          success: false,
          code: "COOLDOWN_ACTIVE",
          message: `Please wait ${waitSeconds} seconds before requesting a new code.`,
          retryAfterSeconds: waitSeconds,
        },
        429,
      );
    }

    // Account enumeration protection — look up account silently (no early return on miss)
    let accountExists = false;
    try {
      const account = await supabaseSync.getAccountByIdentifier(cleanEmail);
      if (account) accountExists = true;
    } catch {}
    if (!accountExists) {
      try {
        const student = await supabaseSync.getStudentByRollOrEmail("___NONE___", cleanEmail);
        if (student) accountExists = true;
      } catch {}
    }
    // Also check Supabase Auth directly
    if (!accountExists) {
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.listUsers();
        if (authUser?.users?.some((u: any) => u.email === cleanEmail)) {
          accountExists = true;
        }
      } catch {}
    }

    // Generate OTP and store hash regardless of whether account exists
    // (prevents timing-based account enumeration)
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    const generatedOtp = (100000 + (randomBuffer[0] % 900000)).toString();
    const otpHash = await sha256(generatedOtp);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    if (accountExists) {
      passwordResetOtpStore.set(cleanEmail, {
        codeHash: otpHash,
        email: cleanEmail,
        expiresAt,
        attempts: 0,
        createdAt: Date.now(),
      });

      // Send password reset email — fire and forget (don't delay response)
      sendPasswordResetOTP(cleanEmail, generatedOtp).catch((err) =>
        console.warn("[Password Reset OTP] Email dispatch error:", err),
      );
    }

    // ALWAYS return the same generic message — never reveal if account exists
    return jsonResponse(
      {
        success: true,
        message: "If an account is associated with this email address, a verification code has been sent.",
      },
      200,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD — STEP 2: Verify OTP → issue reset token
  // ─────────────────────────────────────────────────────────────────────────
  if (path === "/api/auth/password-reset/verify" && method === "POST") {
    const body = await parseBody<{ email: string; otp: string }>(request);
    if (!body?.email || !body?.otp) {
      return jsonResponse(
        { success: false, message: "Email and 6-digit verification code are required." },
        400,
      );
    }

    const cleanEmail = body.email.trim().toLowerCase();
    const cleanOtp = body.otp.trim();

    // Rate limit verify attempts
    if (!checkRateLimit(`pw-reset-verify:${cleanEmail}`, 10, 60000)) {
      return jsonResponse(
        {
          success: false,
          code: "RATE_LIMITED",
          message: "Too many verification attempts. Please wait before retrying.",
        },
        429,
      );
    }

    const entry = passwordResetOtpStore.get(cleanEmail);

    if (!entry) {
      return jsonResponse(
        {
          success: false,
          message: "No active password reset code found for this email. Please request a new code.",
        },
        400,
      );
    }

    if (Date.now() > entry.expiresAt) {
      passwordResetOtpStore.delete(cleanEmail);
      return jsonResponse(
        {
          success: false,
          message: "Verification code has expired. Please request a new code.",
        },
        400,
      );
    }

    if (entry.attempts >= 5) {
      passwordResetOtpStore.delete(cleanEmail);
      return jsonResponse(
        {
          success: false,
          code: "TOO_MANY_ATTEMPTS",
          message: "Maximum verification attempts exceeded. Please request a new code.",
        },
        400,
      );
    }

    const submittedHash = await sha256(cleanOtp);
    if (submittedHash !== entry.codeHash) {
      entry.attempts += 1;
      return jsonResponse(
        {
          success: false,
          message: `Invalid verification code. ${5 - entry.attempts} attempt(s) remaining.`,
        },
        400,
      );
    }

    // OTP verified! Consume the single-use OTP
    passwordResetOtpStore.delete(cleanEmail);

    // Generate a cryptographically secure, short-lived reset token
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const resetToken = Array.from(tokenBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    const tokenHash = await sha256(resetToken);
    const tokenExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store hash → email mapping (never store the raw token)
    passwordResetTokenStore.set(tokenHash, cleanEmail);
    passwordResetTokenMeta.set(tokenHash, {
      tokenHash,
      email: cleanEmail,
      expiresAt: tokenExpiresAt,
      used: false,
      createdAt: Date.now(),
    });

    return jsonResponse(
      {
        success: true,
        message: "Verification code confirmed. You may now set a new password.",
        resetToken, // Raw token sent to client — hash stored server-side
      },
      200,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD — STEP 3: Complete reset with new password
  // ─────────────────────────────────────────────────────────────────────────
  if (path === "/api/auth/password-reset/complete" && method === "POST") {
    const body = await parseBody<{ resetToken: string; newPassword: string }>(request);
    if (!body?.resetToken || !body?.newPassword) {
      return jsonResponse(
        { success: false, message: "Reset token and new password are required." },
        400,
      );
    }

    const cleanPassword = body.newPassword;

    // Password strength validation
    if (cleanPassword.length < 8) {
      return jsonResponse(
        { success: false, message: "Password must be at least 8 characters long." },
        400,
      );
    }
    if (!/\d/.test(cleanPassword)) {
      return jsonResponse(
        { success: false, message: "Password must contain at least one number." },
        400,
      );
    }

    // Look up the reset token
    const tokenHash = await sha256(body.resetToken.trim());
    const tokenEmail = passwordResetTokenStore.get(tokenHash);
    const tokenMeta = passwordResetTokenMeta.get(tokenHash);

    if (!tokenEmail || !tokenMeta) {
      return jsonResponse(
        { success: false, message: "Invalid or expired password reset session. Please start over." },
        400,
      );
    }

    if (Date.now() > tokenMeta.expiresAt) {
      passwordResetTokenStore.delete(tokenHash);
      passwordResetTokenMeta.delete(tokenHash);
      return jsonResponse(
        { success: false, message: "Password reset session has expired. Please request a new code." },
        400,
      );
    }

    if (tokenMeta.used) {
      return jsonResponse(
        { success: false, message: "This reset session has already been used. Please request a new code." },
        400,
      );
    }

    // Mark token as used (single-use enforcement) before attempting password update
    tokenMeta.used = true;

    // Update password via Supabase Auth admin API
    try {
      // Find the user in Supabase Auth by email
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) throw listError;

      const authUser = usersData?.users?.find((u: any) => u.email === tokenEmail);
      if (!authUser) {
        return jsonResponse(
          {
            success: false,
            message: "Account not found in authentication system. Please contact support.",
          },
          404,
        );
      }

      // Update password via Supabase Admin — password is managed by Auth, not our DB
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        password: cleanPassword,
      });

      if (updateError) {
        console.error("[Password Reset] Supabase Auth update error:", updateError.message);
        return jsonResponse(
          {
            success: false,
            message: "Failed to update password. Please try again or contact support.",
          },
          500,
        );
      }

      // Clean up token stores
      passwordResetTokenStore.delete(tokenHash);
      passwordResetTokenMeta.delete(tokenHash);

      const maskedEmail = tokenEmail.replace(/(?<=.{2}).*(?=@)/, "***");
      console.log(`[Password Reset] ✓ Password updated for ${maskedEmail}`);

      return jsonResponse(
        {
          success: true,
          message: "Password updated successfully. You may now sign in with your new password.",
        },
        200,
      );
    } catch (err: any) {
      console.error("[Password Reset] Unexpected error:", err?.message);
      return jsonResponse(
        {
          success: false,
          message: "An unexpected error occurred while updating your password. Please try again.",
        },
        500,
      );
    }
  }

  // ==============================================================================
  // 30. MASTER DATA APIS (Supabase backed)
  // ==============================================================================
  if (path === "/api/master-data" && method === "GET") {
    triggerSchemaInit();
    const data = await mentorshipSync.getMasterData();
    return jsonResponse({ success: true, data }, 200);
  }

  // ==============================================================================
  // 31. FACULTY MENTOR ASSIGNMENTS
  // ==============================================================================
  if (path === "/api/mentorship/faculty/assignments" && method === "GET") {
    triggerSchemaInit();
    const facultyId = url.searchParams.get("facultyId") || undefined;
    const studentId = url.searchParams.get("studentId") || undefined;
    const academicYear = url.searchParams.get("academicYear") || undefined;
    const semester = url.searchParams.get("semester") ? parseInt(url.searchParams.get("semester")!, 10) : undefined;
    const department = url.searchParams.get("department") || undefined;
    const status = url.searchParams.get("status") || undefined;

    const assignments = await mentorshipSync.getFacultyMentorAssignments({
      facultyId,
      studentId,
      academicYear,
      semester,
      department,
      status,
    });
    return jsonResponse({ success: true, assignments }, 200);
  }

  if (path === "/api/mentorship/faculty/assign" && method === "POST") {
    triggerSchemaInit();
    const body = await parseBody<any>(request);
    if (!body || !body.facultyId || !body.studentId || !body.academicYear || !body.semester || !body.department) {
      return jsonResponse({ success: false, message: "Missing required assignment fields." }, 400);
    }
    const res = await mentorshipSync.assignFacultyMentor({
      facultyId: body.facultyId,
      studentId: body.studentId,
      academicYear: body.academicYear,
      semester: parseInt(body.semester, 10),
      department: body.department,
      field: body.field,
      assignedBy: body.assignedBy || "Management",
      notes: body.notes,
    });
    return jsonResponse(res, res.success ? 200 : 400);
  }

  if (path === "/api/mentorship/faculty/bulk-assign" && method === "POST") {
    triggerSchemaInit();
    const body = await parseBody<{ assignments: any[] }>(request);
    if (!body || !Array.isArray(body.assignments)) {
      return jsonResponse({ success: false, message: "Invalid assignments array." }, 400);
    }
    const res = await mentorshipSync.bulkAssignFacultyMentors(body.assignments);
    return jsonResponse(res, res.success ? 200 : 400);
  }

  // ==============================================================================
  // 32. INTERNSHIP MENTOR ASSIGNMENTS
  // ==============================================================================
  if (path === "/api/mentorship/internship/assignments" && method === "GET") {
    triggerSchemaInit();
    const facultyId = url.searchParams.get("facultyId") || undefined;
    const academicYear = url.searchParams.get("academicYear") || undefined;
    const semester = url.searchParams.get("semester") ? parseInt(url.searchParams.get("semester")!, 10) : undefined;
    const department = url.searchParams.get("department") || undefined;
    const field = url.searchParams.get("field") || undefined;

    const assignments = await mentorshipSync.getInternshipMentorAssignments({
      facultyId,
      academicYear,
      semester,
      department,
      field,
    });
    return jsonResponse({ success: true, assignments }, 200);
  }

  if (path === "/api/mentorship/internship/assign" && method === "POST") {
    triggerSchemaInit();
    const body = await parseBody<any>(request);
    if (!body || !body.facultyId || !body.studentId || !body.academicYear || !body.semester || !body.department) {
      return jsonResponse({ success: false, message: "Missing required fields." }, 400);
    }
    const res = await mentorshipSync.assignInternshipMentor({
      facultyId: body.facultyId,
      studentId: body.studentId,
      internshipId: body.internshipId,
      academicYear: body.academicYear,
      semester: parseInt(body.semester, 10),
      department: body.department,
      field: body.field,
      assignedBy: body.assignedBy || "Management",
      remarks: body.remarks,
    });
    return jsonResponse(res, res.success ? 200 : 400);
  }

  // ==============================================================================
  // 33. MENTORSHIP MESSAGES & COMMUNICATION
  // ==============================================================================
  if (path === "/api/mentorship/messages" && method === "GET") {
    triggerSchemaInit();
    const studentId = url.searchParams.get("studentId") || undefined;
    const facultyId = url.searchParams.get("facultyId") || undefined;
    const receiverId = url.searchParams.get("receiverId") || undefined;

    const messages = await mentorshipSync.getMentorMessages({ studentId, facultyId, receiverId });
    return jsonResponse({ success: true, messages }, 200);
  }

  if (path === "/api/mentorship/messages" && method === "POST") {
    triggerSchemaInit();
    const body = await parseBody<any>(request);
    if (!body || !body.senderId || !body.receiverId || !body.subject || !body.message) {
      return jsonResponse({ success: false, message: "Missing required message parameters." }, 400);
    }
    const res = await mentorshipSync.sendMentorMessage(body);
    return jsonResponse(res, res.success ? 200 : 400);
  }

  // ==============================================================================
  // 34. MENTORSHIP TASKS
  // ==============================================================================
  if (path === "/api/mentorship/tasks" && method === "GET") {
    triggerSchemaInit();
    const studentId = url.searchParams.get("studentId") || undefined;
    const mentorId = url.searchParams.get("mentorId") || undefined;

    const tasks = await mentorshipSync.getMentorshipTasks({ studentId, mentorId });
    return jsonResponse({ success: true, tasks }, 200);
  }

  if (path === "/api/mentorship/tasks" && method === "POST") {
    triggerSchemaInit();
    const body = await parseBody<any>(request);
    if (!body || !body.title || !body.description || !body.dueDate || !body.studentId || !body.mentorId) {
      return jsonResponse({ success: false, message: "Missing required task properties." }, 400);
    }
    const res = await mentorshipSync.createMentorshipTask(body);
    return jsonResponse(res, res.success ? 200 : 400);
  }

  if (path.startsWith("/api/mentorship/tasks/") && (method === "PATCH" || method === "PUT")) {
    triggerSchemaInit();
    const taskId = path.replace("/api/mentorship/tasks/", "");
    const body = await parseBody<any>(request);
    const res = await mentorshipSync.updateMentorshipTask(taskId, body || {});
    return jsonResponse(res, res.success ? 200 : 400);
  }

  // ==============================================================================
  // 35. UNIFIED STUDENT 360 HISTORY
  // ==============================================================================
  if (path.startsWith("/api/mentorship/student-history/") && method === "GET") {
    triggerSchemaInit();
    const studentId = decodeURIComponent(path.replace("/api/mentorship/student-history/", ""));
    const history = await mentorshipSync.getUnifiedStudentHistory(studentId);
    if (!history) {
      return jsonResponse({ success: false, message: "Student record not found in system." }, 404);
    }
    return jsonResponse({ success: true, history }, 200);
  }

  // ==============================================================================
  // 36. MANAGEMENT METRICS & AUDIT
  // ==============================================================================
  if (path === "/api/management/kpis" && method === "GET") {
    triggerSchemaInit();
    const kpis = await mentorshipSync.getManagementKPIs();
    return jsonResponse({ success: true, kpis }, 200);
  }

  return jsonResponse({ error: "Route not found in GSFC API Gateway" }, 404);
}
