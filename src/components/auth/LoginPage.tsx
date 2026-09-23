import { useState, useEffect } from "react";
import {
  AlertCircle,
  Building2,
  Bus,
  Check,
  ChevronDown,
  Compass,
  Eye,
  EyeOff,
  FileCheck2,
  GraduationCap,
  Home,
  KeyRound,
  LayoutGrid,
  Lock,
  LogIn,
  Mail,
  School,
  ShieldCheck,
  Sparkles,
  Smartphone,
  UploadCloud,
  User,
  UserCheck,
  UserPlus,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import {
  CAMPUS_ACCOUNTS,
  CampusAccount,
  STUDENT_ACCOUNT,
  campusStore,
} from "@/lib/campus-store";
import { UserRole, UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ShortCampusTourModal } from "@/components/tour/ShortCampusTourModal";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api-client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface LoginPageProps {

  onLoginSuccess?: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [signInMethod, setSignInMethod] = useState<"password" | "otp">("password");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [autoAppendDomain, setAutoAppendDomain] = useState(true);
  const [showCampusTour, setShowCampusTour] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // OTP Sign-In State
  const [otpMobile, setOtpMobile] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  // Registration & Email OTP State
  const [regStep, setRegStep] = useState<"form" | "otp">("form");
  const [regEmailOtp, setRegEmailOtp] = useState("");
  const [regOtpPreview, setRegOtpPreview] = useState<string | null>(null);
  const [regOtpTimer, setRegOtpTimer] = useState(60);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isVerifyingRegOtp, setIsVerifyingRegOtp] = useState(false);
  const [isResendingRegOtp, setIsResendingRegOtp] = useState(false);

  const [regRole, setRegRole] = useState<"student" | "organizer">("student");
  const [regFullName, setRegFullName] = useState("");
  const [regRollNo, setRegRollNo] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regSchool, setRegSchool] = useState("School of Technology (SOT)");
  const [regDepartment, setRegDepartment] = useState("Computer Science & Engineering");
  const [regDegree, setRegDegree] = useState("B.Tech");
  const [regSemester, setRegSemester] = useState<number>(4);
  const [regResidence, setRegResidence] = useState<"hostel" | "dayscholar">("hostel");
  const [regHostelBlock, setRegHostelBlock] = useState("Kasturba Hostel - Block B");
  const [regBusRoute, setRegBusRoute] = useState("Route 4 - Vadodara Alkapuri");
  const [regClubs, setRegClubs] = useState<string[]>(["Coding & AI Club"]);
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regTermsAgreed, setRegTermsAgreed] = useState(true);
  const [regIdUploaded, setRegIdUploaded] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ── Forgot Password State ─────────────────────────────────────────────────
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "newPassword" | "success" | null>(null);
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpResetToken, setFpResetToken] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpShowNewPass, setFpShowNewPass] = useState(false);
  const [fpShowConfirmPass, setFpShowConfirmPass] = useState(false);
  const [fpTimer, setFpTimer] = useState(0);
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState<string | null>(null);

  // Countdown for forgot-password OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (forgotStep === "otp" && fpTimer > 0) {
      timer = setInterval(() => setFpTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [forgotStep, fpTimer]);

  // Email OTP countdown timer for registration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (regStep === "otp" && regOtpTimer > 0) {
      timer = setInterval(() => {
        setRegOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [regStep, regOtpTimer]);

  // Listen for Supabase Auth confirmation link clicks (e.g. from email "Confirm email address")
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user && regStep !== "otp" && !regSubmitting) {
        const result = await apiClient.loginWithGoogle(session.access_token);
        if (result.success && result.account) {
          campusStore.loginWithAccount(result.account, result.token);
          setStatusMessage({ text: result.message || "Signed in with Google Workspace.", type: "success" });
          onLoginSuccess?.();
        } else {
          setStatusMessage({ text: result.message || "Google account is not registered with GSFC University.", type: "error" });
        }
      }
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user && regStep === "otp") {
        const email = session.user.email || registeredEmail;
        const userMeta = session.user.user_metadata || {};
        const roll = userMeta.roll_no || regRollNo.trim().toUpperCase();
        if (roll && email) {
          await completeRegistrationAfterVerification(roll, email, regPassword, session.access_token);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [regStep, regRollNo, registeredEmail, regPassword, regSubmitting]);

  // Mask email for display e.g. o***r@gsfcuniversity.ac.in
  const maskEmail = (emailStr: string) => {
    if (!emailStr) return "";
    const [user, domain] = emailStr.split("@");
    if (!domain) return emailStr;
    if (!user || user.length <= 2) return `${user?.[0] || "*"}***@${domain}`;
    return `${user[0]}${"*".repeat(Math.min(user.length - 2, 4))}${user.slice(-1)}@${domain}`;
  };

  // Handle role change from dropdown
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setStatusMessage(null);
    if (role === "admin") {
      setIdentifier("admin.dean@gsfcuniversity.ac.in");
      setPassword(""); // Password field kept empty for security
    } else if (role === "organizer") {
      setIdentifier("tpc.admin@gsfcuniversity.ac.in");
      setPassword(""); // Password field kept empty for security
    } else {
      setIdentifier("");
      setPassword("");
    }
  };

  // Standard Login Submit — Supabase Auth is the ONE real login path for registered users
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setStatusMessage({ text: "Please enter your GSFC University ID or Email.", type: "error" });
      return;
    }
    if (!password) {
      setStatusMessage({ text: "Please enter your password.", type: "error" });
      return;
    }

    setIsLoggingIn(true);
    setStatusMessage(null);

    const cleanInput = identifier.trim();
    const cleanEmail = cleanInput.includes("@") ? cleanInput.toLowerCase() : `${cleanInput.toLowerCase()}@gsfcuniversity.ac.in`;
    const cleanPass = password.trim();

    // In development only: allow demo bypass if explicitly enabled via DEV flag
    const isDev = Boolean(import.meta.env?.DEV);
    if (isDev && import.meta.env?.VITE_ENABLE_DEV_DEMO_LOGIN === "true") {
      const rollPattern = /^[0-9]{2}[a-z]{2}[0-9]{5}$/i;
      if (selectedRole === "student" && rollPattern.test(cleanInput.replace(/[^a-z0-9]/gi, ""))) {
        const rollNo = cleanInput.toUpperCase();
        const studentName = `GSFC Student (${rollNo})`;
        const studentAccount: CampusAccount = {
          role: "student",
          roleTitle: "GSFC Student",
          roleBadge: rollNo,
          name: studentName,
          idOrRoll: rollNo,
          email: cleanEmail,
          password: "",
          profile: {
            id: `u-${rollNo.toLowerCase()}`,
            name: studentName,
            rollNo,
            email: cleanEmail,
            role: "student",
            department: "Computer Science & Engineering",
            school: "School of Technology (SOT)",
            degree: "B.Tech",
            semester: 4,
            residenceType: "dayscholar",
            attendanceRate: 100,
            points: 100,
            streakDays: 1,
            volunteerHours: 0,
            badges: ["b1"],
            avatar: rollNo.slice(0, 2).toUpperCase(),
            isVerified: true,
          },
        };
        campusStore.loginWithAccount(studentAccount);
        setIsLoggingIn(false);
        setStatusMessage({ text: `Welcome, ${studentName}!`, type: "success" });
        if (onLoginSuccess) onLoginSuccess();
        return;
      }
    }

    try {
      const cleanInputUpper = cleanInput.toUpperCase();
      const cleanEmailLower = cleanEmail.toLowerCase();
      const currentState = campusStore.getState();

      // Extract roll prefix if input is email (e.g. "24bt04171@..." -> "24BT04171")
      const extractedRoll = cleanInput.includes("@")
        ? cleanInput.split("@")[0].toUpperCase()
        : cleanInputUpper;

      // 1. FAST LOCAL CHECK (0ms): Look for student in local state / cache
      let matchedStudent: any = currentState.newRegisteredStudents?.find(
        (s) =>
          s.rollNo?.toUpperCase() === extractedRoll ||
          s.rollNo?.toUpperCase() === cleanInputUpper ||
          s.email?.toLowerCase() === cleanEmailLower
      );
      let matchedAccount: any = null;
      const matchedReg: any = currentState.registrations?.find(
        (r) =>
          r.userRollNo?.toUpperCase() === extractedRoll ||
          r.userRollNo?.toUpperCase() === cleanInputUpper
      );

      let targetEmail = matchedStudent?.email || matchedAccount?.email || cleanEmail;

      // 2. If not found locally, probe Supabase with a strict 2-second timeout
      if (!matchedStudent && !matchedAccount && !matchedReg) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("query timeout")), 2000)
          );

          if (!cleanInput.includes("@")) {
            const queryPromise = supabase
              .from("new_registered_students")
              .select("*")
              .ilike("roll_no", cleanInput)
              .maybeSingle();
            const { data: stu }: any = await Promise.race([queryPromise, timeoutPromise]).catch(() => ({ data: null }));
            if (stu) {
              targetEmail = stu.email;
              matchedStudent = stu;
            } else {
              const accPromise = supabase
                .from("accounts")
                .select("*")
                .ilike("roll_no", cleanInput)
                .maybeSingle();
              const { data: acc }: any = await Promise.race([accPromise, timeoutPromise]).catch(() => ({ data: null }));
              if (acc) {
                targetEmail = acc.email;
                matchedAccount = acc;
              }
            }
          } else {
            const queryPromise = supabase
              .from("new_registered_students")
              .select("*")
              .ilike("email", cleanInput)
              .maybeSingle();
            const { data: stu }: any = await Promise.race([queryPromise, timeoutPromise]).catch(() => ({ data: null }));
            if (stu) {
              matchedStudent = stu;
            } else {
              const accPromise = supabase
                .from("accounts")
                .select("*")
                .ilike("email", cleanInput)
                .maybeSingle();
              const { data: acc }: any = await Promise.race([accPromise, timeoutPromise]).catch(() => ({ data: null }));
              if (acc) {
                matchedAccount = acc;
              }
            }
          }
        } catch (queryErr) {
          console.debug("Quick query note:", queryErr);
        }
      }

      // If student is completely unknown in registry, guide them to register
      if (selectedRole === "student" && !matchedStudent && !matchedAccount && !matchedReg) {
        setIsLoggingIn(false);
        setStatusMessage({
          text: `Student "${cleanInputUpper}" is not registered yet. Please click "New Student Registration" above to create your student account.`,
          type: "error",
        });
        return;
      }

      // Supabase Auth is mandatory. Never fall back to localStorage or cached profiles.
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: cleanPass,
      });
      if (authError || !authData.session?.access_token) {
        setIsLoggingIn(false);
        setStatusMessage({
          text: authError?.message || "Authentication failed. Please check your credentials.",
          type: "error",
        });
        return;
      }

      const serverResult = await apiClient.loginWithGoogle(authData.session.access_token);
      if (!serverResult?.success || !serverResult.account) {
        setIsLoggingIn(false);
        setStatusMessage({
          text: serverResult?.message || "Your account is not authorized by the GSFC database.",
          type: "error",
        });
        return;
      }

      campusStore.loginWithAccount(serverResult.account, serverResult.token);
      setIsLoggingIn(false);
      setStatusMessage({ text: serverResult.message || `Welcome back, ${serverResult.account.name}!`, type: "success" });
      onLoginSuccess?.();
      return;

    } catch (err: any) {
      setIsLoggingIn(false);
      const isFetchErr =
        err?.message?.toLowerCase().includes("failed to fetch") ||
        err?.name === "TypeError";
      setStatusMessage({
        text: isFetchErr
          ? "Unable to connect to authentication server. If you are a new student, please click 'New Student Registration' above."
          : (err?.message || "Unable to authenticate. Please check your connection and credentials."),
        type: "error",
      });
    }
  };

  // Send Mobile OTP for Login
  const handleSendLoginOtp = async () => {
    if (!otpMobile.trim()) {
      setStatusMessage({ text: "Please enter your registered 10-digit mobile number.", type: "error" });
      return;
    }
    setIsSendingOtp(true);
    setStatusMessage(null);
    try {
      const res = await apiClient.sendOtp(otpMobile.trim(), "login");
      setIsSendingOtp(false);
      if (res.success) {
        setOtpSent(true);
        setOtpTimer(30);
        setStatusMessage({ text: res.message, type: "success" });
      } else {
        setStatusMessage({ text: res.message || "Failed to send OTP.", type: "error" });
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setStatusMessage({ text: err?.message || "Failed to dispatch OTP.", type: "error" });
    }
  };

  // Verify Mobile OTP & Sign In
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setStatusMessage({ text: "Please enter the 6-digit OTP code received.", type: "error" });
      return;
    }
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const res = await apiClient.verifyOtp(otpMobile.trim(), otpCode.trim(), "login", selectedRole);
      setIsLoggingIn(false);
      if (res.success && res.account) {
        campusStore.loginWithAccount(res.account, res.token);
        setStatusMessage({ text: res.message || `Welcome back, ${res.account.name}!`, type: "success" });
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setStatusMessage({ text: res.message || "OTP verification failed. Check the code and retry.", type: "error" });
      }
    } catch (err: any) {
      setIsLoggingIn(false);
      setStatusMessage({ text: err?.message || "OTP verification network error.", type: "error" });
    }
  };

  // Handle New Student / Faculty Registration Submit (STEP A & B)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // 1. Mandatory field checks
    if (!regFullName.trim() || !regRollNo.trim() || !regEmail.trim() || !regPhone.trim()) {
      setStatusMessage({ text: "Please fill in all mandatory fields (Name, Roll No, Mobile Number, Email).", type: "error" });
      return;
    }

    // 2. Email format validation
    const cleanEmail = regEmail.includes("@") ? regEmail.trim().toLowerCase() : `${regEmail.trim().toLowerCase()}@gsfcuniversity.ac.in`;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setStatusMessage({ text: "Please enter a valid university email address.", type: "error" });
      return;
    }

    // 3. Mobile number validation (10 digits)
    const cleanPhoneDigits = regPhone.replace(/[^0-9]/g, "");
    if (cleanPhoneDigits.length < 10) {
      setStatusMessage({ text: "Please enter a valid 10-digit mobile number.", type: "error" });
      return;
    }

    // 4. Password validation
    if (!regPassword || regPassword.length < 6) {
      setStatusMessage({ text: "Please create a password with at least 6 characters.", type: "error" });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setStatusMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    // 5. Terms declaration
    if (!regTermsAgreed) {
      setStatusMessage({ text: "Please declare you are a bona fide student of GSFC University.", type: "error" });
      return;
    }

    setRegSubmitting(true);
    const cleanRoll = regRollNo.trim().toUpperCase();

    try {
      // 6. Pre-check if roll number or email already exists in database
      const checkRes = await apiClient.checkAccountExists(cleanRoll, cleanEmail);
      if (checkRes.exists) {
        setRegSubmitting(false);
        setStatusMessage({
          text: checkRes.message || `A student account with Roll Number '${cleanRoll}' or Email '${cleanEmail}' already exists. Please sign in instead.`,
          type: "error",
        });
        return;
      }

      // 7. Skip OTP verification and create account directly
      setRegisteredEmail(cleanEmail);
      await completeRegistrationAfterVerification(cleanRoll, cleanEmail, regPassword);
    } catch (err: any) {
      console.warn("Registration initiation error:", err);
      setRegSubmitting(false);
      setStatusMessage({
        text: err?.message || "Failed to initiate registration. Please check your network connection.",
        type: "error",
      });
    }
  };

  // Handle mobile registration OTP (STEP D & E)
  const handleVerifyRegOtp = async (e?: React.FormEvent, customOtp?: string) => {
    if (e) e.preventDefault();
    const codeToVerify = (customOtp || regEmailOtp).trim();
    if (!codeToVerify || codeToVerify.length !== 6) {
      setStatusMessage({ text: "Please enter the complete 6-digit verification code.", type: "error" });
      return;
    }

    setIsVerifyingRegOtp(true);
    setStatusMessage(null);

    const cleanRoll = regRollNo.trim().toUpperCase();
    const targetEmail = registeredEmail || (regEmail.includes("@") ? regEmail.trim().toLowerCase() : `${regEmail.trim().toLowerCase()}@gsfcuniversity.ac.in`);

    try {
      // Verify EMAIL OTP (not mobile OTP)
      const otpRes = await apiClient.verifyRegistrationOtp(targetEmail, codeToVerify);
      if (!otpRes?.success || !otpRes?.verified) {
        setIsVerifyingRegOtp(false);
        setStatusMessage({
          text: otpRes?.message || "Invalid or expired verification code. Please check the code and try again.",
          type: "error",
        });
        return;
      }

      // Verified successfully. Persist identity and account in the database.
      await completeRegistrationAfterVerification(
        cleanRoll,
        targetEmail,
        regPassword,
      );
    } catch (err: any) {
      setIsVerifyingRegOtp(false);
      setStatusMessage({
        text: err?.message || "Verification network error. Please check your connection.",
        type: "error",
      });
    }
  };

  // Finalize registration records after successful email OTP verification
  const completeRegistrationAfterVerification = async (
    cleanRoll: string,
    cleanEmail: string,
    passToUse: string,
    accessToken?: string
  ) => {
    try {
      const res = await fetch("/api/students/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          fullName: regFullName.trim(),
          mobileNumber: regPhone.trim(),
          rollNo: cleanRoll,
          email: cleanEmail,
          school: regSchool,
          department: regDepartment,
          degree: regDegree,
          semester: regSemester,
          residenceType: regResidence,
          hostelBlockOrBusRoute: regResidence === "hostel" ? regHostelBlock : regBusRoute,
          clubsInterested: regClubs,
          idCardUploaded: regIdUploaded,
          password: passToUse,
        }),
      });

      const resData = await res.json().catch(() => null);

      if (!res.ok) {
        setIsVerifyingRegOtp(false);
        setRegSubmitting(false);
        const errMsg =
          res.status === 409
            ? `⚠️ Identity Locked: Student ${cleanRoll} is already registered in Supabase.`
            : resData?.message || `Registration failed on Supabase backend (HTTP ${res.status}).`;
        setStatusMessage({ text: errMsg, type: "error" });
        return;
      }

      const initials = regFullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "ST";

      const newUserProfile: UserProfile = {
        id: `u-${cleanRoll.toLowerCase()}`,
        name: regFullName.trim(),
        rollNo: cleanRoll,
        email: cleanEmail,
        role: regRole,
        department: `${regDegree} ${regDepartment}`,
        school: regSchool,
        degree: regDegree,
        semester: regSemester,
        residenceType: regResidence,
        hostelBlockOrBusRoute: regResidence === "hostel" ? regHostelBlock : regBusRoute,
        clubsInterested: regClubs,
        mobileNumber: regPhone.trim(),
        avatar: initials,
        points: 100,
        streakDays: 1,
        volunteerHours: 0,
        attendanceRate: 100,
        badges: ["b1"],
        isVerified: true,
      };

      const newAccount: CampusAccount = {
        role: regRole,
        roleTitle: regRole === "student" ? "GSFC Student" : "Faculty Organizer",
        roleBadge: cleanRoll,
        name: regFullName.trim(),
        idOrRoll: cleanRoll,
        email: cleanEmail,
        password: passToUse,
        profile: newUserProfile,
      };

      const newStudentObj = {
        id: `stu-${cleanRoll.toLowerCase()}`,
        fullName: regFullName.trim(),
        mobileNumber: regPhone.trim(),
        rollNo: cleanRoll,
        email: cleanEmail,
        school: regSchool,
        department: regDepartment,
        degree: regDegree,
        semester: regSemester,
        residenceType: regResidence,
        hostelBlockOrBusRoute: regResidence === "hostel" ? regHostelBlock : regBusRoute,
        clubsInterested: regClubs,
        idCardUploaded: regIdUploaded,
        isLocked: true,
        verifiedByUniversity: true,
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      await campusStore.registerNewStudent(newStudentObj);
      campusStore.registerNewAccount(newAccount);
      campusStore.loginWithAccount(newAccount, resData?.token);

      await campusStore.loadFromSupabase();

      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ["#1A3C6E", "#F2A93B", "#10B981", "#3B82F6"],
        });
      } catch {}

      setIsVerifyingRegOtp(false);
      setRegSubmitting(false);
      setStatusMessage({
        text: `Email verified successfully! Welcome to Campus Connect Hub, ${regFullName}.`,
        type: "success",
      });

      if (onLoginSuccess) {
        setTimeout(onLoginSuccess, 600);
      }
    } catch (err: any) {
      console.warn("Error finalizing verified registration:", err);
      setIsVerifyingRegOtp(false);
      setRegSubmitting(false);
      setStatusMessage({
        text: `Error saving registration: ${err.message || "Please check network connection"}`,
        type: "error",
      });
    }
  };

  // Handle Resend Email Verification OTP
  const handleResendRegOtp = async () => {
    if (regOtpTimer > 0 || isResendingRegOtp) return;
    setIsResendingRegOtp(true);
    setStatusMessage(null);

    const targetEmail = registeredEmail || (regEmail.includes("@") ? regEmail.trim().toLowerCase() : `${regEmail.trim().toLowerCase()}@gsfcuniversity.ac.in`);

    try {
      const apiRes = await apiClient.sendRegistrationOtp(targetEmail);
      if (!apiRes?.success) throw new Error(apiRes?.message || "Email verification is temporarily unavailable.");

      setIsResendingRegOtp(false);
      setRegOtpTimer(600); // 10 minutes
      setRegEmailOtp("");
      setStatusMessage({
        text: `A new 6-digit verification code has been sent to your email. Valid for 10 minutes.`,
        type: "success",
      });
    } catch (err: any) {
      setIsResendingRegOtp(false);
      setStatusMessage({
        text: err?.message || "Failed to resend verification code. Check network.",
        type: "error",
      });
    }
  };


  // Toggle club selection
  const toggleClub = (club: string) => {
    if (regClubs.includes(club)) {
      setRegClubs(regClubs.filter((c) => c !== club));
    } else {
      setRegClubs([...regClubs, club]);
    }
  };

  // Guest preview
  const handleGuestPreview = () => {
    campusStore.loginWithAccount(STUDENT_ACCOUNT);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] font-sans text-slate-800">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-md sm:px-8">
        {/* Logo & Portal Branding */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 p-2 text-white shadow-md shadow-amber-500/20">
            <School className="size-6 text-white" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-lg font-black tracking-tight text-[#1A3C6E] sm:text-xl">
                CAMPUS CONNECT
              </span>
              <span className="font-display text-lg font-black tracking-tight text-[#F2A93B] sm:text-xl">
                HUB
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#1A3C6E]/70 sm:text-[10px]">
              GSFC UNIVERSITY · EVENT MANAGEMENT & ATTENDANCE GOVERNANCE PORTAL
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCampusTour(true)}
            className="h-8 gap-1.5 rounded-lg border-[#1A3C6E]/30 bg-white px-2.5 text-xs font-bold text-[#1A3C6E] shadow-sm hover:bg-blue-50"
          >
            <Compass className="size-3.5 text-[#F2A93B]" />
            <span className="hidden sm:inline">Short Campus Tour 🏛️</span>
            <span className="sm:hidden">Tour 🏛️</span>
          </Button>

          <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-black text-[#1A3C6E] lg:inline-flex">
            CampusConnect Live • v2.6
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
        {/* Sanskrit Motto */}
        <div className="mb-6 text-center">
          <h2 className="font-serif text-2xl font-black tracking-wide text-[#1A3C6E] sm:text-3xl">
            ॥ बुद्धिर्ज्ञानेन शुध्यति ॥
          </h2>
          <p className="mt-1 font-sans text-xs font-bold uppercase tracking-wider text-[#D97706] sm:text-sm">
            Purification of Mind and Intellect through Knowledge
          </p>
        </div>

        {/* High-Resolution GSFC Campus Architectural Sketch Background */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            src="/gsfc-campus-bg.jpg"
            alt="GSFC University Campus Sketch"
            className="size-full object-cover object-center opacity-35 filter saturate-[0.85] contrast-[1.05]"
          />
          {/* Subtle lighting overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-white/70" />
          
          {/* Campus Location Caption */}
          <div className="absolute bottom-16 right-8 hidden font-display text-xs font-black tracking-widest text-[#1A3C6E]/60 uppercase md:block">
            GSFC UNIVERSITY CAMPUS - VADODARA, INDIA
          </div>
        </div>

        {/* Central Floating Card */}
        <div
          className={cn(
            "relative z-10 w-full rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-slate-400/20 transition-all sm:p-8",
            activeTab === "signin" || regStep === "otp" ? "max-w-[460px]" : "max-w-[620px]"
          )}
        >
          {/* Top Tabs: Sign In / Registration */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab("signin");
                setStatusMessage(null);
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all",
                activeTab === "signin"
                  ? "bg-white text-[#1A3C6E] shadow-sm shadow-slate-300"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <LogIn className="size-3.5 text-[#1A3C6E]" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setStatusMessage(null);
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all",
                activeTab === "register"
                  ? "bg-white text-[#1A3C6E] shadow-sm shadow-slate-300"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <GraduationCap className="size-3.5 text-amber-500" />
              <span>New Student Registration</span>
            </button>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={cn(
                "mb-4 rounded-xl p-2.5 text-center text-xs font-bold animate-in fade-in",
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              )}
            >
              {statusMessage.text}
            </div>
          )}

          {/* TAB 1: SIGN IN VIEW */}
          {activeTab === "signin" && (
            <div>
              <div className="mb-2 flex items-center justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wider text-slate-500">
                  SELECT PORTAL ROLE TO SIGN IN
                </span>
                <span className="font-bold uppercase text-[#1A3C6E]">
                  {selectedRole.toUpperCase()} PORTAL
                </span>
              </div>

              <div className="relative mb-4">
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 pr-10 text-xs font-bold text-slate-800 shadow-sm focus:border-[#1A3C6E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20"
                >
                  <option value="student">🎓 GSFC Student (Campus Candidate)</option>
                  <option value="admin">🏛️ TPC Admin (Dean & Academic Affairs)</option>
                  <option value="organizer">💼 Placement Faculty Coordinator (Training & Placement / Organizer)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-3 size-4 text-slate-400" />
              </div>

              {/* Sign In Method Selector */}
              <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setSignInMethod("password");
                    setStatusMessage(null);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all",
                    signInMethod === "password"
                      ? "bg-white text-[#1A3C6E] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Lock className="size-3.5" />
                  <span>Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignInMethod("otp");
                    setStatusMessage(null);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all",
                    signInMethod === "otp"
                      ? "bg-white text-[#1A3C6E] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Smartphone className="size-3.5" />
                  <span>Mobile OTP</span>
                </button>
              </div>

              {signInMethod === "password" ? (
                <form onSubmit={handleFormSubmit} className="space-y-3.5">
                  <div className="relative flex items-stretch rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-[#1A3C6E] focus-within:ring-2 focus-within:ring-[#1A3C6E]/20">
                    <div className="flex w-11 items-center justify-center rounded-l-xl bg-[#1A3C6E] text-white">
                      <User className="size-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={selectedRole === "student" ? "GSFC University Email or Roll No" : "official.id@gsfcuniversity.ac.in"}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck="false"
                      className="w-full bg-transparent px-3 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                    {selectedRole === "student" && (
                      <button
                        type="button"
                        onClick={() => setAutoAppendDomain(!autoAppendDomain)}
                        className="mr-2 self-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
                        title="Click to toggle official domain suffix"
                      >
                        @gsfcuniversity.ac.in
                      </button>
                    )}
                  </div>

                  <div className="relative flex items-stretch rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-[#1A3C6E] focus-within:ring-2 focus-within:ring-[#1A3C6E]/20">
                    <div className="flex w-11 items-center justify-center rounded-l-xl bg-[#1A3C6E] text-white">
                      <Lock className="size-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="w-full bg-transparent px-3 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoggingIn}
                    className="h-10 w-full rounded-xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] font-display text-sm font-black text-white shadow-lg shadow-[#1A3C6E]/20 hover:from-[#1A3C6E]/90 hover:to-[#0E2342]/90 flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-[#F2A93B]" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <span>Login with Password</span>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyLoginOtp} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase text-slate-500">
                      Registered Mobile Number (+91)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex flex-1 items-stretch rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-[#1A3C6E] focus-within:ring-2 focus-within:ring-[#1A3C6E]/20">
                        <div className="flex w-11 items-center justify-center rounded-l-xl bg-[#1A3C6E] text-white">
                          <Smartphone className="size-4" />
                        </div>
                        <input
                          type="tel"
                          value={otpMobile}
                          onChange={(e) => setOtpMobile(e.target.value)}
                          placeholder="e.g. 98765 00001"
                          maxLength={15}
                          className="w-full bg-transparent px-3 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleSendLoginOtp}
                        disabled={isSendingOtp || (otpSent && otpTimer > 0)}
                        className="rounded-xl bg-[#1A3C6E] text-xs font-bold text-white hover:bg-[#1A3C6E]/90 px-3 shrink-0"
                      >
                        {isSendingOtp ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : otpSent && otpTimer > 0 ? (
                          `Resend (${otpTimer}s)`
                        ) : otpSent ? (
                          "Resend OTP"
                        ) : (
                          "Send OTP"
                        )}
                      </Button>
                    </div>
                  </div>

                  {otpSent && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">
                        Enter 6-Digit OTP Code
                      </label>
                      <div className="relative flex items-stretch rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-[#1A3C6E] focus-within:ring-2 focus-within:ring-[#1A3C6E]/20">
                        <div className="flex w-11 items-center justify-center rounded-l-xl bg-emerald-600 text-white">
                          <KeyRound className="size-4" />
                        </div>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="• • • • • •"
                          maxLength={6}
                          className="w-full bg-transparent px-3 py-2.5 text-center font-mono text-sm font-black tracking-widest text-slate-800 placeholder:text-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoggingIn || !otpSent || otpCode.length !== 6}
                    className="h-10 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-[#1A3C6E] font-display text-sm font-black text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-600/90 hover:to-[#1A3C6E]/90 flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="size-4 animate-spin text-[#F2A93B]" />
                        <span>Verifying OTP...</span>
                      </>
                    ) : (
                      <span>Verify & Sign In</span>
                    )}
                  </Button>
                </form>
              )}

              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep("email");
                    setFpEmail("");
                    setFpOtp("");
                    setFpResetToken("");
                    setFpNewPassword("");
                    setFpConfirmPassword("");
                    setFpError(null);
                    setStatusMessage(null);
                  }}
                  className="text-xs font-bold text-[#1A3C6E] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* ── FORGOT PASSWORD INLINE PANEL ── */}
              {forgotStep && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 animate-in fade-in zoom-in-95 duration-200">
                  {/* Step header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-[#1A3C6E] text-white">
                        {forgotStep === "email" ? <Mail className="size-3.5" /> :
                         forgotStep === "otp" ? <KeyRound className="size-3.5" /> :
                         forgotStep === "newPassword" ? <Lock className="size-3.5" /> :
                         <ShieldCheck className="size-3.5 text-emerald-400" />}
                      </div>
                      <span className="text-xs font-black text-[#1A3C6E]">
                        {forgotStep === "email" && "Reset Password"}
                        {forgotStep === "otp" && "Enter Verification Code"}
                        {forgotStep === "newPassword" && "Create New Password"}
                        {forgotStep === "success" && "Password Updated!"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setForgotStep(null); setFpError(null); }}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-0.5 rounded hover:bg-slate-200"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Error message */}
                  {fpError && (
                    <div className="mb-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-[11px] font-bold text-rose-700">
                      {fpError}
                    </div>
                  )}

                  {/* STEP 1: Email entry */}
                  {forgotStep === "email" && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const emailVal = fpEmail.trim().toLowerCase();
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(emailVal)) {
                          setFpError("Please enter a valid email address.");
                          return;
                        }
                        setFpLoading(true);
                        setFpError(null);
                        try {
                          const res = await apiClient.requestPasswordReset(emailVal);
                          setFpLoading(false);
                          if (res.success) {
                            setForgotStep("otp");
                            setFpTimer(60);
                            setFpOtp("");
                          } else if (res.code === "COOLDOWN_ACTIVE") {
                            setFpError(res.message);
                            setForgotStep("otp");
                            setFpTimer(res.retryAfterSeconds || 60);
                          } else {
                            setFpError(res.message || "Failed to send code. Try again.");
                          }
                        } catch {
                          setFpLoading(false);
                          setFpError("Network error. Please check your connection.");
                        }
                      }}
                      className="space-y-3"
                    >
                      <p className="text-[11px] text-slate-500">
                        Enter your registered email address and we'll send a 6-digit verification code.
                      </p>
                      <div className="relative flex items-center rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-[#1A3C6E] focus-within:ring-2 focus-within:ring-[#1A3C6E]/20">
                        <div className="flex w-10 items-center justify-center rounded-l-xl bg-[#1A3C6E] text-white self-stretch">
                          <Mail className="size-4" />
                        </div>
                        <input
                          type="email"
                          value={fpEmail}
                          onChange={(e) => setFpEmail(e.target.value)}
                          placeholder="your.email@gsfcuniversity.ac.in"
                          autoComplete="email"
                          className="w-full bg-transparent px-3 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={fpLoading || !fpEmail.trim()}
                        className="h-9 w-full rounded-xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] text-xs font-black text-white shadow-md hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {fpLoading ? <><Loader2 className="size-3.5 animate-spin" /><span>Sending...</span></> : <span>Send Verification Code</span>}
                      </Button>
                    </form>
                  )}

                  {/* STEP 2: OTP entry */}
                  {forgotStep === "otp" && (
                    <div className="space-y-3">
                      <p className="text-[11px] text-slate-500">
                        We sent a 6-digit code to{" "}
                        <span className="font-bold text-[#1A3C6E]">{maskEmail(fpEmail)}</span>.
                        Check your email inbox and spam folder.
                      </p>

                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={fpOtp}
                          onChange={(val) => {
                            setFpOtp(val);
                            setFpError(null);
                          }}
                        >
                          <InputOTPGroup className="gap-1.5">
                            {[0,1,2,3,4,5].map((i) => (
                              <InputOTPSlot
                                key={i}
                                index={i}
                                className="size-10 rounded-xl border-2 border-slate-300 text-base font-black text-[#1A3C6E] focus:border-[#1A3C6E] shadow-sm bg-white"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>

                      <Button
                        type="button"
                        disabled={fpLoading || fpOtp.length !== 6}
                        onClick={async () => {
                          setFpLoading(true);
                          setFpError(null);
                          try {
                            const res = await apiClient.verifyPasswordResetOtp(fpEmail.trim().toLowerCase(), fpOtp.trim());
                            setFpLoading(false);
                            if (res.success && res.resetToken) {
                              setFpResetToken(res.resetToken);
                              setForgotStep("newPassword");
                            } else {
                              setFpError(res.message || "Invalid code. Please try again.");
                              if (res.code === "TOO_MANY_ATTEMPTS") setForgotStep("email");
                            }
                          } catch {
                            setFpLoading(false);
                            setFpError("Network error. Please check your connection.");
                          }
                        }}
                        className="h-9 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-[#1A3C6E] text-xs font-black text-white shadow-md hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {fpLoading ? <><Loader2 className="size-3.5 animate-spin" /><span>Verifying...</span></> : <><ShieldCheck className="size-3.5" /><span>Verify Code</span></>}
                      </Button>

                      <div className="flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          disabled={fpTimer > 0 || fpLoading}
                          onClick={async () => {
                            setFpLoading(true);
                            setFpError(null);
                            try {
                              const res = await apiClient.requestPasswordReset(fpEmail.trim().toLowerCase());
                              setFpLoading(false);
                              if (res.success || res.code === "COOLDOWN_ACTIVE") {
                                setFpOtp("");
                                setFpTimer(res.retryAfterSeconds || 60);
                              } else {
                                setFpError(res.message || "Failed to resend.");
                              }
                            } catch {
                              setFpLoading(false);
                              setFpError("Network error.");
                            }
                          }}
                          className={cn(
                            "font-bold transition-all",
                            fpTimer > 0 ? "text-slate-400 cursor-not-allowed" : "text-[#1A3C6E] hover:underline cursor-pointer"
                          )}
                        >
                          {fpTimer > 0 ? `Resend in ${fpTimer}s` : "Resend Code"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setForgotStep("email"); setFpOtp(""); setFpError(null); }}
                          className="text-slate-400 hover:text-slate-700 font-bold"
                        >
                          Change Email
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: New password */}
                  {forgotStep === "newPassword" && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (fpNewPassword.length < 8) {
                          setFpError("Password must be at least 8 characters.");
                          return;
                        }
                        if (!/\d/.test(fpNewPassword)) {
                          setFpError("Password must contain at least one number.");
                          return;
                        }
                        if (fpNewPassword !== fpConfirmPassword) {
                          setFpError("Passwords do not match.");
                          return;
                        }
                        setFpLoading(true);
                        setFpError(null);
                        try {
                          const res = await apiClient.completePasswordReset(fpResetToken, fpNewPassword);
                          setFpLoading(false);
                          if (res.success) {
                            setForgotStep("success");
                          } else {
                            setFpError(res.message || "Failed to update password.");
                            if (res.message?.includes("expired") || res.message?.includes("already been used")) {
                              setForgotStep("email");
                            }
                          }
                        } catch {
                          setFpLoading(false);
                          setFpError("Network error. Please check your connection.");
                        }
                      }}
                      className="space-y-3"
                    >
                      <p className="text-[11px] text-slate-500">
                        Create a strong new password. Must be at least 8 characters and contain a number.
                      </p>

                      <div className="relative flex items-center rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-[#1A3C6E] focus-within:ring-2 focus-within:ring-[#1A3C6E]/20">
                        <div className="flex w-10 items-center justify-center rounded-l-xl bg-[#1A3C6E] text-white self-stretch">
                          <Lock className="size-4" />
                        </div>
                        <input
                          type={fpShowNewPass ? "text" : "password"}
                          value={fpNewPassword}
                          onChange={(e) => { setFpNewPassword(e.target.value); setFpError(null); }}
                          placeholder="New password (min 8 chars + number)"
                          autoComplete="new-password"
                          className="w-full bg-transparent px-3 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                        <button type="button" onClick={() => setFpShowNewPass(!fpShowNewPass)} className="px-3 text-slate-400 hover:text-slate-600">
                          {fpShowNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>

                      <div className="relative flex items-center rounded-xl border border-slate-300 bg-white shadow-sm focus-within:border-[#1A3C6E] focus-within:ring-2 focus-within:ring-[#1A3C6E]/20">
                        <div className="flex w-10 items-center justify-center rounded-l-xl bg-slate-500 text-white self-stretch">
                          <Lock className="size-4" />
                        </div>
                        <input
                          type={fpShowConfirmPass ? "text" : "password"}
                          value={fpConfirmPassword}
                          onChange={(e) => { setFpConfirmPassword(e.target.value); setFpError(null); }}
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          className="w-full bg-transparent px-3 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                        <button type="button" onClick={() => setFpShowConfirmPass(!fpShowConfirmPass)} className="px-3 text-slate-400 hover:text-slate-600">
                          {fpShowConfirmPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>

                      {fpNewPassword && fpConfirmPassword && fpNewPassword !== fpConfirmPassword && (
                        <p className="text-[10px] font-bold text-rose-600">⚠️ Passwords do not match</p>
                      )}
                      {fpNewPassword.length >= 8 && /\d/.test(fpNewPassword) && fpNewPassword === fpConfirmPassword && (
                        <p className="text-[10px] font-bold text-emerald-600">✓ Password strength: Good</p>
                      )}

                      <Button
                        type="submit"
                        disabled={fpLoading || !fpNewPassword || !fpConfirmPassword}
                        className="h-9 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-[#1A3C6E] text-xs font-black text-white shadow-md hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {fpLoading ? <><Loader2 className="size-3.5 animate-spin" /><span>Updating...</span></> : <span>Reset Password</span>}
                      </Button>
                    </form>
                  )}

                  {/* STEP 4: Success */}
                  {forgotStep === "success" && (
                    <div className="space-y-3 text-center py-2">
                      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Check className="size-7" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-emerald-700">Password Updated Successfully!</p>
                        <p className="mt-1 text-[11px] text-slate-500">You can now sign in with your new password.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setForgotStep(null); setStatusMessage(null); }}
                        className="text-xs font-black text-[#1A3C6E] underline hover:text-amber-600"
                      >
                        Return to Login
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={async () => {
                    setStatusMessage(null);
                    const redirectOrigin = window.location.hostname === "localhost"
                      ? window.location.origin
                      : "https://campus-connect-hub-indol.vercel.app";
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: { redirectTo: redirectOrigin },
                    });
                    if (error) {
                      // OAuth not configured in Supabase dashboard → use local-store demo login
                      const res = campusStore.loginWithGoogle();
                      setStatusMessage({ text: res.message, type: res.success ? "success" : "error" });
                      if (res.success && onLoginSuccess) setTimeout(onLoginSuccess, 300);
                    }
                  }}
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google Workspace</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: COMPREHENSIVE NEW REGISTRATION VIEW */}
          {activeTab === "register" && (
            <div className="space-y-4 text-xs">
              {regStep === "otp" ? (
                /* OTP VERIFICATION VIEW */
                <div className="space-y-5 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 to-[#1A3C6E]/20 text-[#1A3C6E] ring-1 ring-[#1A3C6E]/20 shadow-inner">
                    <Mail className="size-8 text-[#1A3C6E]" />
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-[#1A3C6E] tracking-tight">Verify Your Email</h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
                      We sent a 6-digit verification code to
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#1A3C6E] bg-blue-50/90 inline-block px-3.5 py-1 rounded-full border border-blue-200/70">
                      {maskEmail(registeredEmail || regEmail)}
                    </p>
                  </div>

                  {import.meta.env.DEV && regOtpPreview && (
                    <div className="bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-200/90 rounded-2xl p-3 text-left space-y-1.5 shadow-sm animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1A3C6E] flex items-center gap-1.5">
                          <Smartphone className="size-3.5 text-amber-600" />
                          DEV MODE — OTP Preview
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setRegEmailOtp(regOtpPreview);
                            handleVerifyRegOtp(undefined, regOtpPreview);
                          }}
                          className="text-[11px] font-black text-[#1A3C6E] hover:underline bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-xs cursor-pointer"
                        >
                          Auto-fill &amp; Verify
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg font-black tracking-widest text-[#1A3C6E]">
                          {regOtpPreview}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Valid for 10 minutes</span>
                      </div>
                      <div className="text-[10px] text-amber-700 bg-amber-100 rounded-lg px-2 py-1">
                        ⚠️ Configure SMTP_* or RESEND_API_KEY to send real emails
                      </div>
                    </div>
                  )}

                  <form onSubmit={(e) => handleVerifyRegOtp(e)} className="space-y-5">
                    <div className="flex justify-center my-4">
                      <InputOTP
                        maxLength={6}
                        value={regEmailOtp}
                        onChange={(val) => {
                          setRegEmailOtp(val);
                          if (val.length === 6) {
                            setTimeout(() => {
                              handleVerifyRegOtp(undefined, val);
                            }, 50);
                          }
                        }}
                      >
                        <InputOTPGroup className="gap-2 sm:gap-2.5">
                          <InputOTPSlot index={0} className="size-11 sm:size-12 rounded-xl border-2 border-slate-300 text-lg font-black text-[#1A3C6E] focus:border-[#1A3C6E] shadow-sm bg-white" />
                          <InputOTPSlot index={1} className="size-11 sm:size-12 rounded-xl border-2 border-slate-300 text-lg font-black text-[#1A3C6E] focus:border-[#1A3C6E] shadow-sm bg-white" />
                          <InputOTPSlot index={2} className="size-11 sm:size-12 rounded-xl border-2 border-slate-300 text-lg font-black text-[#1A3C6E] focus:border-[#1A3C6E] shadow-sm bg-white" />
                          <InputOTPSlot index={3} className="size-11 sm:size-12 rounded-xl border-2 border-slate-300 text-lg font-black text-[#1A3C6E] focus:border-[#1A3C6E] shadow-sm bg-white" />
                          <InputOTPSlot index={4} className="size-11 sm:size-12 rounded-xl border-2 border-slate-300 text-lg font-black text-[#1A3C6E] focus:border-[#1A3C6E] shadow-sm bg-white" />
                          <InputOTPSlot index={5} className="size-11 sm:size-12 rounded-xl border-2 border-slate-300 text-lg font-black text-[#1A3C6E] focus:border-[#1A3C6E] shadow-sm bg-white" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      type="submit"
                      disabled={isVerifyingRegOtp || regEmailOtp.length !== 6}
                      className="h-11 w-full rounded-xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] font-display text-sm font-black text-white shadow-xl shadow-[#1A3C6E]/20 hover:from-[#1A3C6E]/90 hover:to-[#0E2342]/90 transition-all disabled:opacity-50"
                    >
                      {isVerifyingRegOtp ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin text-[#F2A93B]" />
                          Verifying OTP...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="size-4 text-[#F2A93B]" />
                          Verify OTP
                        </span>
                      )}
                    </Button>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-center gap-2 text-left">
                      <Mail className="size-4 text-[#1A3C6E] shrink-0" />
                      <span>
                        Received a confirmation email? You can also click <strong>"Confirm email address"</strong> in your Gmail inbox to verify automatically.
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-xs">
                      <button
                        type="button"
                        disabled={regOtpTimer > 0 || isResendingRegOtp}
                        onClick={handleResendRegOtp}
                        className={cn(
                          "font-bold transition-all py-1 px-2.5 rounded-lg",
                          regOtpTimer > 0
                            ? "text-slate-400 cursor-not-allowed"
                            : "text-[#1A3C6E] hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                        )}
                      >
                        {isResendingRegOtp ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="size-3.5 animate-spin" />
                            Resending...
                          </span>
                        ) : regOtpTimer > 0 ? (
                          <span>Resend OTP in 00:{regOtpTimer < 10 ? `0${regOtpTimer}` : regOtpTimer}</span>
                        ) : (
                          <span>Resend OTP</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRegStep("form");
                          setStatusMessage(null);
                        }}
                        className="text-slate-500 hover:text-slate-800 font-bold py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        Change Email / Back
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* REGISTRATION FORM VIEW */
                <>
                  <div className="flex items-center gap-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3">
                    <GraduationCap className="size-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-black text-[#1A3C6E]">GSFC University Portal Onboarding</p>
                      <p className="text-[10px] text-slate-500">Includes +100 Welcome XP & Smart Timetable Sync</p>
                    </div>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {/* 1. Account Role Selection */}
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">
                        1. Onboarding Category
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegRole("student")}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border p-2.5 font-bold transition-all text-left",
                            regRole === "student"
                              ? "border-[#1A3C6E] bg-blue-50/80 text-[#1A3C6E] ring-1 ring-[#1A3C6E]/30"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          <GraduationCap className="size-4 text-[#1A3C6E]" />
                          <div>
                            <p className="text-xs font-black">Student Candidate</p>
                            <p className="text-[10px] font-normal text-slate-500">B.Tech / B.Sc / BBA / MBA</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRegRole("organizer")}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border p-2.5 font-bold transition-all text-left",
                            regRole === "organizer"
                              ? "border-[#1A3C6E] bg-blue-50/80 text-[#1A3C6E] ring-1 ring-[#1A3C6E]/30"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          <UserCheck className="size-4 text-emerald-600" />
                          <div>
                            <p className="text-xs font-black">Faculty / Organizer</p>
                            <p className="text-[10px] font-normal text-slate-500">TPC / Club Convener</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* 2. Personal & Contact Information */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-600">
                          2. Academic Identity & Contact Details
                        </label>
                        <span className="flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-black text-amber-800">
                          🔒 Locked After Registration
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500">Full Legal Name *</span>
                          <div className="relative mt-1 flex items-center rounded-xl border border-slate-300 bg-white">
                            <User className="ml-3 size-3.5 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={regFullName}
                              onChange={(e) => setRegFullName(e.target.value)}
                              placeholder="e.g. Om Thakkar"
                              className="w-full bg-transparent px-2.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-500">Enrollment / Roll Number *</span>
                          <div className="relative mt-1 flex items-center rounded-xl border border-slate-300 bg-white">
                            <GraduationCap className="ml-3 size-3.5 text-slate-400" />
                            <input
                              type="text"
                              required
                              value={regRollNo}
                              onChange={(e) => setRegRollNo(e.target.value.toUpperCase())}
                              placeholder="e.g. 24BT01089"
                              className="w-full bg-transparent px-2.5 py-2 text-xs font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-500">University Email Address *</span>
                          <div className="relative mt-1 flex items-center rounded-xl border border-slate-300 bg-white">
                            <Mail className="ml-3 size-3.5 text-slate-400" />
                            <input
                              type="email"
                              required
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="e.g. 24bt01089@gsfcuniversity.ac.in"
                              className="w-full bg-transparent px-2.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-500">Mobile Number (SMS Updates) *</span>
                          <div className="relative mt-1 flex items-center rounded-xl border border-slate-300 bg-white">
                            <Smartphone className="ml-3 size-3.5 text-slate-400" />
                            <input
                              type="tel"
                              required
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="w-full bg-transparent px-2.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. School & Department Information */}
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">
                        3. Academic Program & School
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500">University School</span>
                          <select
                            value={regSchool}
                            onChange={(e) => setRegSchool(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                          >
                            <option value="School of Technology (SOT)">School of Technology (SOT)</option>
                            <option value="School of Science (SOS)">School of Science (SOS)</option>
                            <option value="School of Management (SOM)">School of Management (SOM)</option>
                            <option value="School of Fire, Safety & Environment">School of Fire & Safety (FSE)</option>
                          </select>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-500">Degree Program</span>
                          <select
                            value={regDegree}
                            onChange={(e) => setRegDegree(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                          >
                            <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                            <option value="B.Sc">B.Sc (Hons / Applied Sciences)</option>
                            <option value="M.Sc">M.Sc (Post-Graduate)</option>
                            <option value="BBA">BBA (Bachelor of Business Admin)</option>
                            <option value="MBA">MBA (Master of Business Admin)</option>
                            <option value="Diploma">Polytechnic Diploma</option>
                          </select>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-500">Department / Discipline</span>
                          <select
                            value={regDepartment}
                            onChange={(e) => setRegDepartment(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-2.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                          >
                            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                            <option value="Chemical Engineering">Chemical Engineering</option>
                            <option value="Fire & EHS Engineering">Fire & EHS Engineering</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Biotechnology & Microbiology">Biotechnology</option>
                            <option value="Chemistry & Polymers">Industrial Chemistry</option>
                            <option value="Business Administration">BBA / MBA</option>
                          </select>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-500">Current Semester</span>
                          <select
                            value={regSemester}
                            onChange={(e) => setRegSemester(Number(e.target.value))}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                          >
                            <option value={1}>Semester 1 (1st Year)</option>
                            <option value={2}>Semester 2 (1st Year)</option>
                            <option value={3}>Semester 3 (2nd Year)</option>
                            <option value={4}>Semester 4 (2nd Year)</option>
                            <option value={5}>Semester 5 (3rd Year)</option>
                            <option value={6}>Semester 6 (3rd Year)</option>
                            <option value={7}>Semester 7 (4th Year)</option>
                            <option value={8}>Semester 8 (4th Year)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 4. Campus Residency & Commute */}
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">
                        4. Campus Residency & Transportation
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegResidence("hostel")}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border p-2 text-left font-bold transition-all",
                            regResidence === "hostel"
                              ? "border-[#1A3C6E] bg-blue-50/80 text-[#1A3C6E] ring-1 ring-[#1A3C6E]/30"
                              : "border-slate-200 bg-white text-slate-600"
                          )}
                        >
                          <Home className="size-4 text-[#1A3C6E]" />
                          <div>
                            <p className="text-xs font-black">Campus Hostelite</p>
                            <p className="text-[9px] text-slate-500">On-campus hostel resident</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRegResidence("dayscholar")}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border p-2 text-left font-bold transition-all",
                            regResidence === "dayscholar"
                              ? "border-[#1A3C6E] bg-blue-50/80 text-[#1A3C6E] ring-1 ring-[#1A3C6E]/30"
                              : "border-slate-200 bg-white text-slate-600"
                          )}
                        >
                          <Bus className="size-4 text-amber-600" />
                          <div>
                            <p className="text-xs font-black">Day Scholar / Bus Commuter</p>
                            <p className="text-[9px] text-slate-500">Vadodara / Anand / Ahmedabad</p>
                          </div>
                        </button>
                      </div>

                      {regResidence === "hostel" ? (
                        <div className="mt-2">
                          <span className="text-[10px] font-semibold text-slate-500">Assigned Hostel Wing</span>
                          <select
                            value={regHostelBlock}
                            onChange={(e) => setRegHostelBlock(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                          >
                            <option value="Sardar Patel Boys Hostel - Block A">Sardar Patel Boys Hostel - Block A</option>
                            <option value="Kasturba Girls Hostel - Block B">Kasturba Girls Hostel - Block B</option>
                            <option value="Vikram Sarabhai PG Hostel - Block C">Vikram Sarabhai PG Hostel - Block C</option>
                          </select>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <span className="text-[10px] font-semibold text-slate-500">University Bus Commute Route</span>
                          <select
                            value={regBusRoute}
                            onChange={(e) => setRegBusRoute(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                          >
                            <option value="Route 1 - Vadodara Railway Station / Sayajigunj">Route 1 - Sayajigunj / Vadodara Station</option>
                            <option value="Route 2 - Manjalpur / Makarpura Express">Route 2 - Manjalpur / Makarpura</option>
                            <option value="Route 3 - Gotri / Vasna Road">Route 3 - Gotri / Vasna Road</option>
                            <option value="Route 4 - Alkapuri / Fatehgunj">Route 4 - Alkapuri / Fatehgunj</option>
                            <option value="Route 5 - Anand / Nadiad Highway Shuttle">Route 5 - Anand / Nadiad Shuttle</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* 5. Student Clubs & Interests */}
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">
                        5. Campus Clubs & Co-Curricular Interests
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Coding & AI Club",
                          "Robotics & IoT Club",
                          "Cultural & Drama Troupe",
                          "Sports Council",
                          "Rotaract / NSS Volunteer Wing",
                          "Literary & Debating Society",
                          "E-Cell & Startup Incubation",
                        ].map((club) => {
                          const selected = regClubs.includes(club);
                          return (
                            <button
                              key={club}
                              type="button"
                              onClick={() => toggleClub(club)}
                              className={cn(
                                "rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all",
                                selected
                                  ? "border-[#1A3C6E] bg-[#1A3C6E] text-white shadow-sm"
                                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                              )}
                            >
                              {selected ? "✓ " : "+ "}
                              {club}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 6. Security Password */}
                    <div>
                      <label className="block font-bold text-slate-600 mb-1">
                        6. Portal Password
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-500">Create Password *</span>
                          <div className="relative mt-1 flex items-center rounded-xl border border-slate-300 bg-white">
                            <Lock className="ml-3 size-3.5 text-slate-400" />
                            <input
                              type="password"
                              required
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Min 6 characters"
                              className="w-full bg-transparent px-2.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-semibold text-slate-500">Confirm Password *</span>
                          <div className="relative mt-1 flex items-center rounded-xl border border-slate-300 bg-white">
                            <Lock className="ml-3 size-3.5 text-slate-400" />
                            <input
                              type="password"
                              required
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              placeholder="Re-enter password"
                              className="w-full bg-transparent px-2.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 7. Student ID Verification Upload Preview Simulation */}
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <UploadCloud className="size-5 text-[#1A3C6E]" />
                        <span className="font-bold text-slate-700">GSFC University Student ID Card Verification</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        Upload your physical ID card or GSFC admission receipt to enable Instant Attendance Badges
                      </p>

                      <div className="mt-2 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRegIdUploaded(!regIdUploaded)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold transition-all",
                            regIdUploaded
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-black"
                              : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          <FileCheck2 className="size-3.5" />
                          <span>{regIdUploaded ? "ID Card Verified (ID_GSFC_2026.pdf)" : "Attach ID Card Photo / PDF"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Declaration Checkbox */}
                    <label className="flex items-start gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={regTermsAgreed}
                        onChange={(e) => setRegTermsAgreed(e.target.checked)}
                        className="mt-0.5 size-4 rounded border-slate-300 text-[#1A3C6E] focus:ring-[#1A3C6E]"
                      />
                      <span className="text-[11px] text-slate-600 leading-snug">
                        I declare that I am an active bona fide student/faculty member of <strong>GSFC University, Vadodara</strong> and agree to adhere to university attendance governance norms.
                      </span>
                    </label>

                    {/* Register Submit Button */}
                    <Button
                      type="submit"
                      disabled={regSubmitting}
                      className="h-11 w-full rounded-xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] font-display text-sm font-black text-white shadow-xl shadow-[#1A3C6E]/20 hover:from-[#1A3C6E]/90 hover:to-[#0E2342]/90 transition-all disabled:opacity-50"
                    >
                      {regSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin text-[#F2A93B]" />
                          Creating your student account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <UserPlus className="size-4 text-[#F2A93B]" />
                          Create Account & Open Dashboard →
                        </span>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Sweeping Orange Wave Curve Graphic (Bottom Left Corner) */}
      <div className="pointer-events-none absolute bottom-9 left-0 z-10 h-24 w-80 overflow-hidden sm:h-32 sm:w-[420px]">
        <svg viewBox="0 0 400 120" className="h-full w-full" preserveAspectRatio="none">
          <path d="M0,120 L0,30 Q140,-10 260,60 Q340,100 400,120 Z" fill="#EA580C" opacity="0.95" />
        </svg>
      </div>

      {/* Short Campus Tour Modal (Copyright-free photo gallery & Instagram video reels) */}
      <ShortCampusTourModal
        isOpen={showCampusTour}
        onClose={() => setShowCampusTour(false)}
        onEnterGuestPortal={handleGuestPreview}
      />

      {/* Bottom Footer Banner (Matching Screenshot) */}
      <footer className="relative z-20 flex flex-wrap items-center justify-between gap-2 bg-[#0284C7] px-6 py-2.5 text-xs font-bold text-white sm:px-8">
        <div>All Rights Reserved ©2026</div>
        <div className="tracking-wide">
          Developed & Managed By : <span className="font-black text-amber-300">OM THAKKAR</span>
        </div>
      </footer>
    </div>
  );
}
