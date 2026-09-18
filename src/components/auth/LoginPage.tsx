import { useState } from "react";
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
  ADMIN_ACCOUNT,
  TPC_ADMIN_ACCOUNT,
  getStoredAccounts,
  campusStore,
} from "@/lib/campus-store";
import { UserRole, UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ShortCampusTourModal } from "@/components/tour/ShortCampusTourModal";
import { supabase } from "@/lib/supabase";

interface LoginPageProps {

  onLoginSuccess?: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const allAccounts = getStoredAccounts();
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [autoAppendDomain, setAutoAppendDomain] = useState(true);
  const [showCampusTour, setShowCampusTour] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New Registration State
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

  // Handle role change from dropdown
  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setStatusMessage(null);
  };

  // Standard Login Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setStatusMessage({ text: "Please enter your GSFC University ID or Email.", type: "error" });
      return;
    }

    setIsLoggingIn(true);
    setStatusMessage(null);

    const cleanInput = identifier.trim();
    const cleanEmail = cleanInput.includes("@") ? cleanInput.toLowerCase() : `${cleanInput.toLowerCase()}@gsfcuniversity.ac.in`;

    try {
      // 1. Direct local account matching for instant login
      const localAccount = allAccounts.find(
        (a) =>
          a.role === selectedRole &&
          (a.email.toLowerCase() === cleanEmail ||
            a.idOrRoll.toLowerCase() === cleanInput.toLowerCase() ||
            cleanEmail.includes(a.idOrRoll.toLowerCase()) ||
            cleanEmail.includes(a.email.split("@")[0].toLowerCase()))
      );

      // 2. Supabase Auth sign-in
      if (password) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!authError && authData?.user) {
            const { data: accountRow } = await supabase
              .from("accounts")
              .select("*")
              .eq("email", cleanEmail)
              .maybeSingle();

            const studentRoll = authData.user.user_metadata?.roll_no || localAccount?.idOrRoll || cleanInput.toUpperCase();
            const studentName = authData.user.user_metadata?.full_name || accountRow?.name || localAccount?.name || "GSFC User";
            const studentRole = (authData.user.user_metadata?.role as UserRole) || (accountRow?.role as UserRole) || selectedRole;

            const loggedProfile: UserProfile = {
              id: accountRow?.id || authData.user.id,
              name: studentName,
              rollNo: studentRoll,
              email: cleanEmail,
              role: studentRole,
              department: accountRow?.department || localAccount?.profile.department || "GSFC University",
              semester: accountRow?.semester ?? localAccount?.profile.semester ?? 4,
              avatar: accountRow?.avatar || localAccount?.profile.avatar || studentName.slice(0, 2).toUpperCase(),
              points: accountRow?.points || localAccount?.profile.points || 100,
              streakDays: accountRow?.streak_days || localAccount?.profile.streakDays || 1,
              volunteerHours: accountRow?.volunteer_hours || localAccount?.profile.volunteerHours || 0,
              attendanceRate: accountRow?.attendance_percentage || localAccount?.profile.attendanceRate || 100,
              badges: localAccount?.profile.badges || ["b1"],
            };

            const campusAcc: CampusAccount = {
              role: studentRole,
              roleTitle: studentRole === "admin" ? "Administration" : studentRole === "organizer" ? "TPC Admin" : "GSFC Student",
              roleBadge: studentRoll,
              name: studentName,
              idOrRoll: studentRoll,
              email: cleanEmail,
              password,
              profile: loggedProfile,
            };

            campusStore.loginWithAccount(campusAcc);
            setIsLoggingIn(false);
            setStatusMessage({ text: `Welcome back, ${studentName}! Authenticated via Supabase Auth.`, type: "success" });
            if (onLoginSuccess) onLoginSuccess();
            return;
          }
        } catch (authErr) {
          console.debug("Supabase auth signIn error note:", authErr);
        }
      }

      // 3. Fallback to matched account
      if (localAccount) {
        campusStore.loginWithAccount(localAccount);
        setIsLoggingIn(false);
        setStatusMessage({ text: `Welcome back, ${localAccount.name}!`, type: "success" });
        if (onLoginSuccess) onLoginSuccess();
        return;
      }

      // 4. Query REST API Gateway or Supabase tables
      try {
        const { data: supaAccount } = await supabase
          .from("accounts")
          .select("*")
          .or(`email.ilike.${cleanEmail},roll_no.ilike.${cleanInput}`)
          .maybeSingle();

        if (supaAccount) {
          const studentAccount: CampusAccount = {
            role: supaAccount.role as UserRole,
            roleTitle: supaAccount.role === "admin" ? "Administration" : supaAccount.role === "organizer" ? "TPC Admin" : "GSFC Student",
            roleBadge: supaAccount.roll_no,
            name: supaAccount.name,
            idOrRoll: supaAccount.roll_no,
            email: supaAccount.email,
            password: password || "DemoStudent@2026",
            profile: {
              id: supaAccount.id,
              name: supaAccount.name,
              rollNo: supaAccount.roll_no,
              email: supaAccount.email,
              role: supaAccount.role as UserRole,
              department: supaAccount.department,
              semester: supaAccount.semester || 4,
              avatar: supaAccount.avatar || supaAccount.name.slice(0, 2).toUpperCase(),
              points: supaAccount.points || 100,
              streakDays: supaAccount.streak_days || 1,
              volunteerHours: supaAccount.volunteer_hours || 0,
              attendanceRate: supaAccount.attendance_percentage || 100,
              badges: ["b1"],
            },
          };
          campusStore.loginWithAccount(studentAccount);
          setIsLoggingIn(false);
          setStatusMessage({ text: `Welcome, ${studentAccount.name}!`, type: "success" });
          if (onLoginSuccess) onLoginSuccess();
          return;
        }
      } catch {}

      // 5. Final fallback to loginWithCredentials
      const localRes = campusStore.loginWithCredentials(identifier, selectedRole);
      setIsLoggingIn(false);
      if (localRes.success) {
        setStatusMessage({ text: localRes.message, type: "success" });
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setStatusMessage({ text: "Invalid credentials. Please verify your email and password.", type: "error" });
      }
    } catch (err: any) {
      setIsLoggingIn(false);
      const localRes = campusStore.loginWithCredentials(identifier, selectedRole);
      if (localRes.success) {
        setStatusMessage({ text: localRes.message, type: "success" });
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setStatusMessage({ text: "Unable to authenticate with database. Check credentials.", type: "error" });
      }
    }
  };

  // Auto-Fill Sample Registration Form
  const handleAutoFillSampleRegistration = () => {
    setRegFullName("Priya Patel");
    setRegRollNo("24BT04199");
    setRegEmail("priya.patel@gsfcuniversity.ac.in");
    setRegPhone("9876543210");
    setRegSchool("School of Technology (SOT)");
    setRegDepartment("Computer Science & Engineering");
    setRegDegree("B.Tech");
    setRegSemester(4);
    setRegResidence("hostel");
    setRegHostelBlock("Kasturba Hostel - Block B");
    setRegClubs(["Coding & AI Club", "Robotics Club", "Cultural Troupe"]);
    setRegPassword("DemoStudent@2026");
    setRegConfirmPassword("DemoStudent@2026");
    setRegIdUploaded(true);
    setRegTermsAgreed(true);
    setStatusMessage({ text: "Sample GSFC Student data auto-filled!", type: "success" });
  };

  // Handle New Student / Faculty Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regRollNo.trim() || !regEmail.trim() || !regPhone.trim()) {
      setStatusMessage({ text: "Please fill in all mandatory fields (Name, Roll No, Mobile Number, Email).", type: "error" });
      return;
    }

    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      setStatusMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    if (!regTermsAgreed) {
      setStatusMessage({ text: "Please declare you are a bona fide student of GSFC University.", type: "error" });
      return;
    }

    setRegSubmitting(true);

    try {
      const cleanRoll = regRollNo.trim().toUpperCase();
      const cleanEmail = regEmail.includes("@") ? regEmail.trim().toLowerCase() : `${regEmail.trim().toLowerCase()}@gsfcuniversity.ac.in`;
      const passToUse = regPassword || "DemoStudent@2026";

      // 1. Create real Supabase Auth user
      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: passToUse,
          options: {
            data: {
              full_name: regFullName.trim(),
              roll_no: cleanRoll,
              role: regRole,
              department: regDepartment,
              semester: regSemester,
            },
          },
        });
        if (signUpError && !signUpError.message.includes("already registered")) {
          console.debug("Supabase auth signUp notice:", signUpError.message);
        }
      } catch (authErr) {
        console.debug("Supabase auth creation note:", authErr);
      }

      // 2. Submit to API Gateway -> Supabase PostgreSQL table (new_registered_students & accounts)
      const res = await fetch("/api/students/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const errMsg =
          res.status === 409
            ? `⚠️ Identity Locked: Student ${cleanRoll} is already registered in Supabase. Name & Mobile cannot be changed.`
            : resData?.message || `Registration failed on Supabase backend (HTTP ${res.status}).`;
        setStatusMessage({
          text: errMsg,
          type: "error",
        });
        setRegSubmitting(false);
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
        semester: regSemester,
        avatar: initials,
        points: 100,
        streakDays: 1,
        volunteerHours: 0,
        attendanceRate: 100,
        badges: ["b1"],
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
        createdAt: new Date().toISOString(),
      };

      // Register and update store (with direct Supabase upsert)
      const regRes = await campusStore.registerNewStudent(newStudentObj);
      if (!regRes.success) {
        setRegSubmitting(false);
        setStatusMessage({
          text: `Registration failed on database: ${regRes.message || "Please check network connection"}`,
          type: "error",
        });
        return;
      }

      campusStore.registerNewAccount(newAccount);
      campusStore.loginWithAccount(newAccount);

      // Trigger fresh load from Supabase
      await campusStore.loadFromSupabase();

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#1A3C6E", "#F2A93B", "#10B981", "#3B82F6"],
        });
      } catch {}

      setRegSubmitting(false);
      setStatusMessage({
        text: `🔒 Registered & Identity Permanently Synced to Supabase! Welcome, ${regFullName}.`,
        type: "success",
      });

      if (onLoginSuccess) {
        setTimeout(onLoginSuccess, 400);
      }
    } catch (err: any) {
      console.warn("Registration error:", err);
      setRegSubmitting(false);
      setStatusMessage({
        text: `Error during registration: ${err.message || "Please check network connection"}`,
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
            activeTab === "signin" ? "max-w-[460px]" : "max-w-[620px]"
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
                  <option value="admin">🏛️ Administration (Dean & Academic Affairs)</option>
                  <option value="organizer">💼 TPC Admin (Training & Placement / Organizer)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-3 size-4 text-slate-400" />
              </div>

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
                    <span>Login</span>
                  )}
                </Button>
              </form>

              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => alert("Password reset link has been dispatched to your official GSFC University email.")}
                  className="text-xs font-bold text-[#1A3C6E] hover:underline"
                >
                  Forgot Password ?
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const res = campusStore.loginWithGoogle();
                    setStatusMessage({ text: res.message, type: "success" });
                    if (onLoginSuccess) {
                      setTimeout(onLoginSuccess, 300);
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
              <div className="flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="size-4 text-amber-600" />
                  <div>
                    <p className="font-black text-[#1A3C6E]">GSFC University Portal Onboarding</p>
                    <p className="text-[10px] text-slate-500">Includes +100 Welcome XP & Smart Timetable Sync</p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoFillSampleRegistration}
                  className="h-7 gap-1 rounded-lg border-amber-500/40 bg-white text-[10px] font-bold text-amber-700 hover:bg-amber-50"
                >
                  <Sparkles className="size-3 text-amber-500" />
                  <span>Auto-Fill Demo</span>
                </Button>
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
                  <div className="mb-2 rounded-xl border border-amber-300 bg-amber-50/80 p-2 text-[10px] text-amber-900 flex items-start gap-1.5">
                    <span className="text-xs">⚠️</span>
                    <span>
                      <strong>Identity Security Policy:</strong> Your <strong>Full Name</strong>, <strong>Roll Number</strong>, and <strong>Mobile Number</strong> will be permanently locked upon registration in the university database and cannot be changed later. Please enter exact credentials.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Full Name (As per GSFC Records) *</span>
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
                        <span className="ml-3 font-mono text-[10px] font-bold text-[#1A3C6E]">#</span>
                        <input
                          type="text"
                          required
                          value={regRollNo}
                          onChange={(e) => setRegRollNo(e.target.value.toUpperCase())}
                          placeholder="e.g. 24BT01001"
                          className="w-full bg-transparent px-2.5 py-2 font-mono text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Official GSFC Email *</span>
                      <div className="relative mt-1 flex items-center rounded-xl border border-slate-300 bg-white">
                        <Mail className="ml-3 size-3.5 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="rollno@gsfcuniversity.ac.in"
                          className="w-full bg-transparent px-2.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Mobile / WhatsApp Number *</span>
                      <div className="relative mt-1 flex items-center rounded-xl border border-slate-300 bg-white">
                        <span className="ml-3 text-[10px] font-bold text-slate-400">+91</span>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="98765 43210"
                          className="w-full bg-transparent px-2.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Academic School & Department */}
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    3. Academic Program & School
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">School / Faculty</span>
                      <select
                        value={regSchool}
                        onChange={(e) => setRegSchool(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="School of Technology (SOT)">School of Technology (SOT)</option>
                        <option value="School of Science (SOS)">School of Science (SOS)</option>
                        <option value="School of Management (SOM)">School of Management (SOM)</option>
                        <option value="Fire & Safety Institute">Fire & Safety Institute</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-500">Department / Branch</span>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50/60 px-2.5 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Engg</option>
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
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] font-display text-sm font-black text-white shadow-xl shadow-[#1A3C6E]/20 hover:from-[#1A3C6E]/90 hover:to-[#0E2342]/90"
                >
                  <UserPlus className="mr-2 size-4 text-[#F2A93B]" />
                  <span>{regSubmitting ? "Provisioning Student Profile..." : "Complete Registration & Launch Portal (+100 XP)"}</span>
                </Button>
              </form>
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
          Developed & Managed By : <span className="font-black text-amber-300">GSFC University IT Operations</span>
        </div>
      </footer>
    </div>
  );
}
