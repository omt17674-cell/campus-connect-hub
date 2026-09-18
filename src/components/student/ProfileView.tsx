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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusState, campusStore } from "@/lib/campus-store";
import { ChangeProfilePictureModal } from "@/components/profile/ChangeProfilePictureModal";

interface ProfileViewProps {
  state: CampusState;
}

export function ProfileView({ state }: ProfileViewProps) {
  const [isChangePhotoOpen, setIsChangePhotoOpen] = useState(false);

  const user = state?.currentUser || {
    id: "u-demo-student",
    name: "Demo Student",
    rollNo: "24BT01001",
    email: "demo.student@gsfcuniversity.ac.in",
    role: "student",
    department: "B.Tech Computer Science & Engineering",
    semester: 4,
    avatar: "DS",
    points: 640,
    streakDays: 9,
    volunteerHours: 18,
    attendanceRate: 91,
    badges: ["b1", "b2", "b3", "b5"],
  };

  const isPhotoUrl = (url?: string) =>
    Boolean(url && (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")));

  const handleExportStudentRecord = () => {
    const records = state?.attendanceRecords || [];
    const rows = [
      ["Student Name", user.name || ""],
      ["Roll Number", user.rollNo || ""],
      ["Department", user.department || ""],
      ["Semester", String(user.semester || 4)],
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
    if (confirm("Reset local demo data to initial seed?")) {
      localStorage.removeItem("gsfc_campus_connect_state_v1");
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <ChangeProfilePictureModal
        isOpen={isChangePhotoOpen}
        onClose={() => setIsChangePhotoOpen(false)}
        currentAvatar={user.avatar}
        userName={user.name}
      />

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
                {user.department} · Semester {user.semester}
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
            <p className="mt-1 truncate font-display text-sm font-bold text-foreground">
              {user.email}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/50 p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="size-3.5 text-brand" />
              <span>Department</span>
            </div>
            <p className="mt-1 truncate font-display text-sm font-bold text-foreground">
              {user.department}
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

          {/* Locked Mobile / Contact */}
          <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Mobile Phone Number</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                🔒 Permanent Lock
              </span>
            </div>
            <p className="mt-1.5 font-display text-sm font-black text-foreground">
              +91 95584 13347 / +91 98765 43210
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Registered 2FA number is permanently bound to this student profile.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-amber-500/10 p-3 text-[11px] font-medium text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <span className="text-sm">🛡️</span>
          <span>
            <strong>University Policy Note:</strong> In accordance with GSFC University security rules, students cannot edit their registered <strong>Full Name</strong>, <strong>Enrolment Number</strong>, or <strong>Primary Mobile Number</strong> directly. For corrections, please contact the Office of the Registrar with official government identity proof.
          </span>
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
    </div>
  );
}
