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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusState, campusStore } from "@/lib/campus-store";

interface ProfileViewProps {
  state: CampusState;
}

export function ProfileView({ state }: ProfileViewProps) {
  const user = state.currentUser;

  const handleExportStudentRecord = () => {
    const rows = [
      ["Student Name", user.name],
      ["Roll Number", user.rollNo],
      ["Department", user.department],
      ["Semester", String(user.semester)],
      ["Total XP Points", String(user.points)],
      ["Streak (Days)", String(user.streakDays)],
      ["Volunteer Hours", String(user.volunteerHours)],
      ["Verified Attendance Rate", `${user.attendanceRate}%`],
      [],
      ["Event ID", "Event Title", "Verified Date", "Method", "Certificate ID"],
      ...state.attendanceRecords
        .filter((a) => a.userId === user.id)
        .map((a) => [a.eventId, a.eventTitle, a.timestamp, a.verifiedMethod, a.certificateId]),
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
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] font-display text-2xl font-black text-[#F2A93B] shadow-lg shadow-[#1A3C6E]/20">
              {user.avatar}
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
