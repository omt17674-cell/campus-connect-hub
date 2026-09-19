import React, { useState } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  Flame,
  GraduationCap,
  Mail,
  RefreshCw,
  ShieldCheck,
  User,
  Camera,
  Phone,
  Edit3,
  Building,
  Home,
  Bus,
  Users,
  Save,
  X,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusState, campusStore } from "@/lib/campus-store";
import { ChangeProfilePictureModal } from "@/components/profile/ChangeProfilePictureModal";
import { ConfirmationModal, ConfirmationModalProps } from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";

interface ProfileViewProps {
  state: CampusState;
}

export function ProfileView({ state }: ProfileViewProps) {
  const [isChangePhotoOpen, setIsChangePhotoOpen] = useState(false);
  const [isEditPhoneOpen, setIsEditPhoneOpen] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const user = state?.currentUser || {
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
  };

  // Find exact registered student record for this user
  const matchingStudent = state?.newRegisteredStudents?.find(
    (s) =>
      (user.rollNo && s.rollNo?.toUpperCase() === user.rollNo.toUpperCase()) ||
      (user.email && s.email?.toLowerCase() === user.email.toLowerCase())
  );

  const currentMobile =
    user.mobileNumber ||
    (matchingStudent?.mobileNumber &&
    matchingStudent.mobileNumber !== "N/A" &&
    matchingStudent.mobileNumber !== "Not provided"
      ? matchingStudent.mobileNumber
      : undefined);

  const currentSchool = user.school || matchingStudent?.school || "School of Technology (SOT)";
  const currentDegree = user.degree || matchingStudent?.degree || "B.Tech";
  const currentResidence = user.residenceType || matchingStudent?.residenceType || "dayscholar";
  const currentHostelOrRoute = user.hostelBlockOrBusRoute || matchingStudent?.hostelBlockOrBusRoute || "";
  const currentClubs = user.clubsInterested || matchingStudent?.clubsInterested || [];

  const formatPhoneNumber = (phone?: string) => {
    if (!phone || phone === "N/A" || phone === "Not provided") return "Not provided";
    const digits = phone.replace(/[^0-9]/g, "");
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    if (phone.startsWith("+")) return phone;
    return `+91 ${phone}`;
  };

  const isPhotoUrl = (url?: string) =>
    Boolean(url && (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")));

  const handleOpenEditPhone = () => {
    setNewPhoneInput(currentMobile || "");
    setPhoneError(null);
    setIsEditPhoneOpen(true);
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    const cleanDigits = newPhoneInput.replace(/[^0-9]/g, "");
    if (cleanDigits.length < 10) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSavingPhone(true);
    try {
      const res = await campusStore.updateStudentMobileNumber(user.rollNo, cleanDigits);
      if (res.success) {
        toast.success("Mobile phone number updated successfully!");
        setIsEditPhoneOpen(false);
        setNewPhoneInput("");
      } else {
        setPhoneError(res.message || "Failed to update mobile number.");
      }
    } catch (err: any) {
      setPhoneError(err?.message || "Failed to update mobile number.");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleExportStudentRecord = () => {
    const records = state?.attendanceRecords || [];
    const rows = [
      ["Student Name", user.name || ""],
      ["Roll Number", user.rollNo || ""],
      ["Mobile Number", currentMobile || "Not provided"],
      ["School", currentSchool],
      ["Degree", currentDegree],
      ["Department", user.department || ""],
      ["Semester", String(user.semester || 4)],
      ["Residence Type", currentResidence],
      ["Hostel / Bus Route", currentHostelOrRoute],
      ["Total XP Points", String(user.points || 0)],
      ["Streak (Days)", String(user.streakDays || 0)],
      ["Volunteer Hours", String(user.volunteerHours || 0)],
      ["Verified Attendance Rate", `${user.attendanceRate || 100}%`],
      [],
      ["Event ID", "Event Title", "Verified Date", "Method", "Certificate ID"],
      ...records
        .filter((a) => a && (a.userId === user.id || a.userRollNo === user.rollNo))
        .map((a) => [a.eventId, a.eventTitle, a.timestamp, a.verifiedMethod, a.certificateId || ""]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSFC_Student_Record_${user.rollNo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetDemo = () => {
    setConfirmResetOpen(true);
  };

  const handleConfirmReset = () => {
    localStorage.removeItem("gsfc_campus_connect_state_v5");
    toast.success("Demo data reset to initial state.");
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <div className="flex flex-col gap-6">
      <ChangeProfilePictureModal
        isOpen={isChangePhotoOpen}
        onClose={() => setIsChangePhotoOpen(false)}
        currentAvatar={user.avatar}
        userName={user.name}
      />

      {/* Edit Mobile Phone Modal */}
      {isEditPhoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <Phone className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Update Contact Number
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Student ID: {user.rollNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditPhoneOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSavePhone} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={newPhoneInput}
                    onChange={(e) => setNewPhoneInput(e.target.value.replace(/[^0-9]/g, ""))}
                    className="h-10 w-full rounded-xl border border-input bg-background pl-12 pr-4 font-mono text-sm font-semibold text-foreground focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                    autoFocus
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Enter the 10-digit mobile number for 2FA and event alerts.
                </p>
              </div>

              {phoneError && (
                <div className="rounded-xl bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                  {phoneError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditPhoneOpen(false)}
                  disabled={isSavingPhone}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingPhone}
                  className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90"
                >
                  {isSavingPhone ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="size-3.5" /> Save Number
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="relative group size-16 shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 border-[#F2A93B] shadow-lg shadow-[#1A3C6E]/20 bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] flex items-center justify-center"
              onClick={() => setIsChangePhotoOpen(true)}
              title="Click to Change Profile Picture"
            >
              {isPhotoUrl(user.avatar) ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-2xl font-black text-[#F2A93B]">
                  {user.avatar || user.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white text-[9px] font-bold gap-0.5">
                <Camera className="size-3.5 text-[#F2A93B]" />
                <span>Change</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                  Student Account
                </span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-3" /> SSO Verified
                </span>
              </div>
              <h2 className="mt-1 font-display text-2xl font-black text-foreground">
                {user.name}
              </h2>
              <p className="text-xs text-muted-foreground">
                {currentDegree} · {user.department} · Semester {user.semester || 1}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangePhotoOpen(true)}
              className="h-9 gap-1.5 rounded-xl border-brand/40 text-xs font-bold text-brand hover:bg-brand/10"
            >
              <Camera className="size-3.5 text-[#F2A93B]" />
              Change Photo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenEditPhone}
              className="h-9 gap-1.5 rounded-xl border-brand/40 text-xs font-bold text-brand hover:bg-brand/10"
            >
              <Phone className="size-3.5 text-brand" />
              Edit Mobile Number
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportStudentRecord}
              className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-bold"
            >
              <Download className="size-3.5" />
              Export Co-Curricular Record (CSV)
            </Button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-card/50 p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GraduationCap className="size-3.5 text-brand" />
              <span>Enrolment ID</span>
            </div>
            <p className="mt-1 font-display text-sm font-bold text-foreground">
              {user.rollNo}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/50 p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="size-3.5 text-brand" />
              <span>University Email</span>
            </div>
            <p className="mt-1 truncate font-display text-sm font-bold text-foreground" title={user.email}>
              {user.email}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/50 p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="size-3.5 text-brand" />
              <span>Primary Contact</span>
            </div>
            <p className="mt-1 font-display text-sm font-bold text-foreground">
              {formatPhoneNumber(currentMobile)}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/50 p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Award className="size-3.5 text-[#F2A93B]" />
              <span>Volunteer Credit</span>
            </div>
            <p className="mt-1 font-display text-sm font-bold text-foreground">
              {user.volunteerHours} Hours Logged
            </p>
          </div>
        </div>
      </div>

      {/* Immutable Student Academic Identity Security Card */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-card/60 to-[#1A3C6E]/5 p-6 shadow-xl shadow-amber-500/5 backdrop-blur-2xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-black text-foreground">
                  Verified Academic Identity Protection
                </h3>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  🔒 Locked Post-Registration
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                GSFC University Academic Governance & Anti-Impersonation Protocol
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
            Immutable Record
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Locked Name */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Full Name</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                🔒 Permanent Lock
              </span>
            </div>
            <p className="mt-1.5 font-display text-sm font-black text-foreground">
              {user.name}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Name change prohibited after initial enrolment.
            </p>
          </div>

          {/* Locked Roll No */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Enrolment Roll No</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                🔒 Permanent Lock
              </span>
            </div>
            <p className="mt-1.5 font-display text-sm font-black text-foreground">
              {user.rollNo}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Tied to official GSFC University ERP & Examination Board.
            </p>
          </div>

          {/* Registered Mobile / Contact with Edit Action */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Mobile Phone Number</span>
              <button
                onClick={handleOpenEditPhone}
                className="flex items-center gap-1 text-[10px] font-bold text-brand hover:underline"
                title="Edit mobile phone number"
              >
                <Edit3 className="size-2.5" /> Edit
              </button>
            </div>
            <p className="mt-1.5 font-display text-sm font-black text-foreground">
              {formatPhoneNumber(currentMobile)}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Registered contact number bound to this student profile.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-amber-500/10 p-3 text-[11px] font-medium text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <span className="text-sm">🛡️</span>
          <span>
            <strong>University Policy Note:</strong> In accordance with GSFC University security rules, students cannot edit their registered <strong>Full Name</strong> or <strong>Enrolment Number</strong> directly. Contact numbers can be modified with the edit control above. For corrections to name or roll number, please contact the Office of the Registrar with official government identity proof.
          </span>
        </div>
      </div>

      {/* Enrolled Academic Affiliation & Residence Card */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl">
        <div className="flex items-center gap-3 border-b border-border/70 pb-4">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Building className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-black text-foreground">
              Enrolled Academic Affiliations & Campus Profile
            </h3>
            <p className="text-xs text-muted-foreground">
              Official faculty registry details associated with {user.rollNo}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-2xl border border-border/70 bg-card/40 p-3.5">
            <span className="block text-xs text-muted-foreground">School / Faculty</span>
            <p className="mt-1 font-display text-xs font-bold text-foreground">
              {currentSchool}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/40 p-3.5">
            <span className="block text-xs text-muted-foreground">Degree Program</span>
            <p className="mt-1 font-display text-xs font-bold text-foreground">
              {currentDegree}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/40 p-3.5">
            <span className="block text-xs text-muted-foreground">Department</span>
            <p className="mt-1 font-display text-xs font-bold text-foreground">
              {user.department}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/40 p-3.5">
            <span className="block text-xs text-muted-foreground">Current Semester</span>
            <p className="mt-1 font-display text-xs font-bold text-foreground">
              Semester {user.semester || 1}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card/40 p-3.5 flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {currentResidence === "hostel" ? <Home className="size-4" /> : <Bus className="size-4" />}
            </div>
            <div>
              <span className="block text-xs text-muted-foreground">Residence & Transportation</span>
              <p className="mt-0.5 font-display text-xs font-bold text-foreground">
                {currentResidence === "hostel" ? "Campus Hostel Resident" : "Day Scholar"}
                {currentHostelOrRoute ? ` · ${currentHostelOrRoute}` : ""}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/40 p-3.5 flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground">Clubs & Societies</span>
              <p className="mt-0.5 truncate font-display text-xs font-bold text-foreground">
                {currentClubs && currentClubs.length > 0 ? currentClubs.join(", ") : "Coding & Robotics Club"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* University SSO Status Card */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl">
        <h3 className="font-display text-base font-black text-foreground">
          Connected University Services
        </h3>
        <p className="text-xs text-muted-foreground">
          Single Sign-On (SSO) connected with GSFC University Digital Ecosystem
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/40 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-foreground">
                  Prayaas SSO Authentication
                </h4>
                <p className="text-xs text-muted-foreground">
                  OAuth2 Token Active · Session valid for 12 hours
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" /> Connected
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/40 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#F2A93B]/15 text-[#F2A93B]">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-foreground">
                  DCS Academic Records Integration
                </h4>
                <p className="text-xs text-muted-foreground">
                  Auto-syncs verified event attendance for co-curricular academic credits
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" /> Synced
            </span>
          </div>
        </div>
      </div>

      {/* Demo State Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetDemo}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          <RefreshCw className="mr-1.5 size-3" />
          Reset Demo Data to Initial Seed
        </Button>
      </div>

      <ConfirmationModal
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Local Demo Data?"
        subtitle="Developer & Demo Reset"
        badgeText="Reset State"
        variant="danger"
        description="Are you sure you want to reset your local demo data? This will clear locally cached events and restore initial seed values."
        bullets={[
          "Local storage cache will be cleared",
          "Initial university accounts and events will be restored",
          "The application will reload automatically"
        ]}
        confirmText="Reset Demo Data"
        cancelText="Cancel"
      />
    </div>
  );
}
