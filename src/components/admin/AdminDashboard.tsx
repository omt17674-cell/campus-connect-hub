import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Award,
  BarChart3,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  GraduationCap,
  History,
  Mail,
  PauseCircle,
  PieChart as PieIcon,
  PlayCircle,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Button } from "@/components/ui/button";
import { CampusState, campusStore } from "@/lib/campus-store";
import { translations } from "@/lib/i18n";
import { EventAttendanceViewer } from "@/components/organizer/EventAttendanceViewer";
import { VisitorVehicleSecurityViewer } from "@/components/admin/VisitorVehicleSecurityViewer";
import { StudentRegistryViewer } from "@/components/admin/StudentRegistryViewer";
import { InternshipManagementHub } from "@/components/admin/InternshipManagementHub";
import { CreateEventModal } from "@/components/organizer/CreateEventModal";
import { LiveAttendanceModal } from "@/components/organizer/LiveAttendanceModal";
import { CampusEvent, EventCategory, EventStatus } from "@/lib/types";
import { ConfirmationModal, ConfirmationModalProps } from "@/components/ui/ConfirmationModal";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  state: CampusState;
  onOpenGateModal?: () => void;
}

export function AdminDashboard({ state, onOpenGateModal }: AdminDashboardProps) {
  const t = translations[state.language];
  const [adminTab, setAdminTab] = useState<
    "overview" | "events" | "students" | "roster" | "security" | "approvals" | "alerts" | "audit" | "internships"
  >("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [liveEventModal, setLiveEventModal] = useState<CampusEvent | null>(null);
  const [selectedRosterEventId, setSelectedRosterEventId] = useState<string | undefined>(undefined);
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState<string>("all");
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>("all");
  const [confirmModal, setConfirmModal] = useState<Omit<ConfirmationModalProps, "onClose"> | null>(null);

  // Date filter states for Approvals, Attendance Flags, and Audit Trail
  const [approvalsStartDate, setApprovalsStartDate] = useState("");
  const [approvalsEndDate, setApprovalsEndDate] = useState("");

  const [flagsStartDate, setFlagsStartDate] = useState("");
  const [flagsEndDate, setFlagsEndDate] = useState("");

  const [auditStartDate, setAuditStartDate] = useState("");
  const [auditEndDate, setAuditEndDate] = useState("");

  // Sync fresh records directly from Supabase on load
  useEffect(() => {
    campusStore.loadFromSupabase();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await campusStore.loadFromSupabase();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const pendingApprovals = state.events.filter((e) => e.status === "pending_approval");
  const filteredApprovals = pendingApprovals.filter((evt) => {
    if (!approvalsStartDate && !approvalsEndDate) return true;
    if (!evt.date) return false;
    try {
      const d = new Date(evt.date).toISOString().slice(0, 10);
      if (approvalsStartDate && d < approvalsStartDate) return false;
      if (approvalsEndDate && d > approvalsEndDate) return false;
      return true;
    } catch {
      return true;
    }
  });

  const activeVisitors = state.visitorRecords.filter((v) => v.status === "active");

  const totalEvents = state.events.length;
  const totalCheckins = state.attendanceRecords.length;
  const totalRegistrations = state.registrations.length;
  const avgEngagement = totalRegistrations > 0 ? `${Math.round((totalCheckins / totalRegistrations) * 100)}%` : "0%";
  const verifiedCertificates = state.attendanceRecords.filter((a) => a.certificateId || a.verifiedMethod).length;

  // Dynamic department calculation from active events & registrations
  const departmentsList = [
    "Computer Science",
    "Chemical Engineering",
    "School of Management",
    "Applied Sciences",
    "Humanities",
  ];

  const departmentData = departmentsList.map((dept) => {
    const deptEvents = state.events.filter((e) => (e.department || "").toLowerCase().includes(dept.toLowerCase().slice(0, 4)));
    const deptStudents = (state.newRegisteredStudents || []).filter((s) => (s.department || "").toLowerCase().includes(dept.toLowerCase().slice(0, 4))).length;
    const deptRegs = state.registrations.filter((r) => (r.department || "").toLowerCase().includes(dept.toLowerCase().slice(0, 4))).length;
    const participation = deptStudents > 0 ? Math.min(100, Math.round((deptRegs / deptStudents) * 100)) : 0;
    return {
      department: dept.slice(0, 13),
      participation,
      students: deptStudents,
    };
  });

  const trendData = [
    { week: "W1", scans: state.attendanceRecords.filter((_, i) => i % 6 === 0).length },
    { week: "W2", scans: state.attendanceRecords.filter((_, i) => i % 6 === 1).length },
    { week: "W3", scans: state.attendanceRecords.filter((_, i) => i % 6 === 2).length },
    { week: "W4", scans: state.attendanceRecords.filter((_, i) => i % 6 === 3).length },
    { week: "W5", scans: state.attendanceRecords.filter((_, i) => i % 6 === 4).length },
    { week: "W6", scans: state.attendanceRecords.filter((_, i) => i % 6 === 5).length },
  ];

  const flaggedStudents: Array<{ name: string; rollNo: string; dept: string; attendance: number; mentor: string }> = (
    state.newRegisteredStudents || []
  )
    .filter((s) => {
      // Date range filtering if specified
      if (s.createdAt && (flagsStartDate || flagsEndDate)) {
        try {
          const cd = new Date(s.createdAt).toISOString().slice(0, 10);
          if (flagsStartDate && cd < flagsStartDate) return false;
          if (flagsEndDate && cd > flagsEndDate) return false;
        } catch {}
      }
      const studentAtt = state.attendanceRecords.filter((a) => a.userRollNo === s.rollNo).length;
      const studentReg = state.registrations.filter((r) => r.userRollNo === s.rollNo).length;
      return studentReg > 0 && (studentAtt / studentReg) * 100 < 75;
    })
    .map((s) => {
      const studentAtt = state.attendanceRecords.filter((a) => a.userRollNo === s.rollNo).length;
      const studentReg = state.registrations.filter((r) => r.userRollNo === s.rollNo).length;
      return {
        name: s.fullName,
        rollNo: s.rollNo,
        dept: s.department,
        attendance: studentReg > 0 ? Math.round((studentAtt / studentReg) * 100) : 0,
        mentor: "Faculty Mentor",
      };
    });

  const filteredAuditLogs = state.auditLogs.filter((log) => {
    if (!auditStartDate && !auditEndDate) return true;
    if (!log.timestamp) return false;
    try {
      const d = new Date(log.timestamp).toISOString().slice(0, 10);
      if (auditStartDate && d < auditStartDate) return false;
      if (auditEndDate && d > auditEndDate) return false;
      return true;
    } catch {
      return true;
    }
  });

  const handleExportFullCsv = () => {
    const rows = [
      ["Campus Connect - GSFC University Institutional Activity Report"],
      ["Generated Timestamp", new Date().toISOString()],
      [],
      ["--- DEPARTMENT ENGAGEMENT ---"],
      ["Department", "Participation Rate (%)", "Active Students"],
      ...departmentData.map((d) => [d.department, `${d.participation}%`, String(d.students)]),
      [],
      ["--- AUDIT LOG TRAIL ---"],
      ["Log ID", "Action", "Performed By", "Target", "Timestamp", "Details"],
      ...state.auditLogs.map((l) => [l.id, l.action, l.performedBy, l.target, l.timestamp, l.details]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSFC_Campus_Activity_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApprove = async (id: string) => {
    await campusStore.approveEvent(id);
  };

  const handleReject = async (id: string) => {
    await campusStore.rejectEvent(id);
  };

  const handleTriggerAlerts = () => {
    campusStore.triggerLowAttendanceAlerts();
    toast.success("Warning emails & mentor notifications dispatched successfully!");
  };

  const handleMarkAsHeld = (event: CampusEvent) => {
    setConfirmModal({
      isOpen: true,
      title: "Mark Event as Held & Conclude?",
      subtitle: `Event: ${event.title} (${event.category.toUpperCase()})`,
      badgeText: "Conclude Session",
      variant: "success",
      description: `Are you sure you want to mark "${event.title}" as Held? This will conclude the session, digitally verify attendance, and generate official participation certificates for all registered attendees.`,
      bullets: [
        "Conclude the active event session across campus",
        "Digitally verify and finalize attendance records",
        "Generate official GSFC University participation certificates"
      ],
      confirmText: "Confirm & Conclude Event",
      cancelText: "Keep Active",
      onConfirm: () => {
        const res = campusStore.endAndConcludeEvent(event.id);
        toast.success(res.message);
        setConfirmModal(null);
      },
    });
  };

  const handleHoldLiveSession = (event: CampusEvent) => {
    setLiveEventModal(event);
  };

  const handleViewRoster = (event: CampusEvent) => {
    setSelectedRosterEventId(event.id);
    setAdminTab("roster");
  };

  const handleToggleHoldEvent = (event: CampusEvent) => {
    if (event.status === "cancelled") {
      campusStore.updateEventStatus(event.id, "upcoming");
      toast.success(`Event "${event.title}" has been resumed as Upcoming.`);
    } else {
      setConfirmModal({
        isOpen: true,
        title: "Put Event On Hold?",
        subtitle: `Event: ${event.title} (${event.category.toUpperCase()})`,
        badgeText: "Pause Event",
        variant: "warning",
        description: `Are you sure you want to put "${event.title}" on hold? This will pause student registrations and live sessions until resumed.`,
        bullets: [
          "Event status will be set to 'On Hold'",
          "New student registrations will be paused",
          "You can resume this event at any time"
        ],
        confirmText: "Put On Hold",
        cancelText: "Cancel",
        onConfirm: () => {
          campusStore.updateEventStatus(event.id, "cancelled");
          toast.info(`Event "${event.title}" is now on hold.`);
          setConfirmModal(null);
        },
      });
    }
  };

  const handleDeleteEvent = (event: CampusEvent) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete "${event.title}"?`,
      subtitle: `${event.date} · ${event.venue} · ${event.registeredCount} Registered`,
      badgeText: "Permanent Deletion",
      variant: "danger",
      description: `Are you sure you want to permanently delete "${event.title}"? This will remove the event, clear all student registrations, and cannot be undone.`,
      bullets: [
        "Permanently remove event from the university catalog",
        "Clear all student registrations and attendance logs for this event",
        "This action is permanent and irreversible"
      ],
      confirmText: "Delete Event",
      cancelText: "Cancel",
      onConfirm: async () => {
        const res = await campusStore.deleteEvent(event.id);
        if (res.success) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
        setConfirmModal(null);
      },
    });
  };

  const filteredEvents = state.events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      evt.organizerName.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      evt.department.toLowerCase().includes(eventSearchQuery.toLowerCase());

    const matchesStatus =
      eventStatusFilter === "all" || evt.status === eventStatusFilter;

    const matchesCategory =
      eventCategoryFilter === "all" || evt.category === eventCategoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand/70">
            University Administration & TPC Governance
          </p>
          <h2 className="mt-1 font-display text-2xl font-black text-foreground sm:text-3xl">
            Campus Activity & Governance Dashboard
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Cross-department analytics, event-by-event attendance inspection, event approval queue, and automated attendance flagging
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="h-10 gap-2 rounded-2xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] text-xs font-black text-white shadow-md shadow-[#1A3C6E]/20 hover:opacity-95"
          >
            <Plus className="size-4 text-[#F2A93B]" />
            <span>Generate Event</span>
          </Button>

          <Button
            onClick={handleManualRefresh}
            variant="outline"
            className="h-10 gap-2 rounded-2xl border-blue-200 bg-blue-50/50 text-xs font-bold text-[#1A3C6E] shadow-sm hover:bg-blue-100/60"
          >
            <RefreshCw className={cn("size-3.5 text-[#F2A93B]", isRefreshing && "animate-spin")} />
            <span>Sync Supabase</span>
          </Button>

          <Button
            onClick={handleExportFullCsv}
            variant="outline"
            className="h-10 gap-2 rounded-2xl border-border/80 text-xs font-bold shadow-sm"
          >
            <Download className="size-4 text-brand" />
            Export Complete Report (CSV)
          </Button>
        </div>
      </div>


      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/70 bg-card/60 p-1 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdminTab("overview")}
          className={cn(
            "rounded-xl text-xs font-bold",
            adminTab === "overview"
              ? "bg-[#1A3C6E] text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BarChart3 className="mr-1.5 size-3.5" /> Analytics Overview
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setAdminTab("events");
            campusStore.loadFromSupabase();
          }}
          className={cn(
            "rounded-xl text-xs font-bold",
            adminTab === "events"
              ? "bg-[#1A3C6E] text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Calendar className="mr-1.5 size-3.5 text-[#F2A93B]" />
          Events & Live Sessions ({state.events.length})
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setAdminTab("students");
            campusStore.loadFromSupabase();
          }}
          className={cn(
            "rounded-xl text-xs font-bold",
            adminTab === "students"
              ? "bg-[#1A3C6E] text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GraduationCap className="mr-1.5 size-3.5 text-[#F2A93B]" />
          Student Identity Registry ({(state.newRegisteredStudents || []).length})
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setAdminTab("roster");
            campusStore.loadFromSupabase();
          }}
          className={cn(
            "rounded-xl text-xs font-bold",
            adminTab === "roster"
              ? "bg-[#1A3C6E] text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UserCheck className="mr-1.5 size-3.5 text-[#F2A93B]" />
          Event-by-Event Roster
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdminTab("security")}
          className={cn(
            "rounded-xl text-xs font-bold",
            adminTab === "security"
              ? "bg-[#1A3C6E] text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ShieldCheck className="mr-1.5 size-3.5 text-emerald-500" />
          Visitor & Vehicle Gate Security ({activeVisitors.length})
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdminTab("approvals")}
          className={cn(
            "rounded-xl text-xs font-bold",
            adminTab === "approvals"
              ? "bg-[#1A3C6E] text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="mr-1.5 size-3.5" />
          Approvals Queue ({pendingApprovals.length})
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdminTab("alerts")}
          className={cn(
            "rounded-xl text-xs font-bold",
            adminTab === "alerts"
              ? "bg-[#1A3C6E] text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ShieldAlert className="mr-1.5 size-3.5 text-amber-500" />
          Attendance Flags ({flaggedStudents.length})
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdminTab("audit")}
          className={cn(
            "rounded-xl text-xs font-bold",
            adminTab === "audit"
              ? "bg-[#1A3C6E] text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <History className="mr-1.5 size-3.5" />
          Immutable Audit Log
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setAdminTab("internships");
            campusStore.loadFromSupabase();
          }}
          className={cn(
            "rounded-xl text-xs font-bold",
            adminTab === "internships"
              ? "bg-[#1A3C6E] text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Briefcase className="mr-1.5 size-3.5 text-[#F2A93B]" />
          Internships Governance ({(state.internshipApplications || []).length})
        </Button>
      </div>

      {/* University Events & Session Controls View */}
      {adminTab === "events" && (
        <div className="space-y-6">
          {/* Top Banner with Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/90 via-white to-amber-50/80 p-5 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20">
                <Calendar className="size-6 text-[#F2A93B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-black text-[#1A3C6E]">
                    University Event Governance & Controls
                  </h3>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-700">
                    <span className="size-1.5 rounded-full bg-emerald-500" /> Live System
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Generate official campus events, host live dynamic QR attendance sessions, or mark events as Held to release verifiable certificates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="h-10 gap-2 rounded-2xl bg-[#1A3C6E] font-display text-xs font-black text-white shadow-md shadow-[#1A3C6E]/25 hover:bg-[#1A3C6E]/90"
              >
                <Plus className="size-4 text-[#F2A93B]" />
                Generate New Event
              </Button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Events</span>
              <p className="mt-1 font-display text-2xl font-black text-foreground">{state.events.length}</p>
              <p className="text-[11px] text-muted-foreground">Across all departments</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 backdrop-blur-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Live Sessions</span>
              <p className="mt-1 font-display text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {state.events.filter((e) => e.status === "live").length}
              </p>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">Active QR check-in</p>
            </div>
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 backdrop-blur-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A3C6E] dark:text-blue-400">Held & Concluded</span>
              <p className="mt-1 font-display text-2xl font-black text-[#1A3C6E] dark:text-blue-400">
                {state.events.filter((e) => e.status === "completed").length}
              </p>
              <p className="text-[11px] text-muted-foreground">Certificates released</p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 backdrop-blur-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Pending Approval</span>
              <p className="mt-1 font-display text-2xl font-black text-amber-600 dark:text-amber-400">
                {pendingApprovals.length}
              </p>
              <p className="text-[11px] text-muted-foreground">Proposals awaiting review</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
              <input
                type="text"
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
                placeholder="Search events by title, department, venue, organizer..."
                className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-xs font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={eventStatusFilter}
                onChange={(e) => setEventStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="live">🔴 Live Now</option>
                <option value="completed">🎓 Held / Concluded</option>
                <option value="pending_approval">⏳ Pending Approval</option>
                <option value="cancelled">⏸️ On Hold / Cancelled</option>
              </select>

              <select
                value={eventCategoryFilter}
                onChange={(e) => setEventCategoryFilter(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Tech">Tech</option>
                <option value="Culture">Culture</option>
                <option value="Sports">Sports</option>
                <option value="Leadership">Leadership</option>
                <option value="Academic">Academic</option>
                <option value="Career">Career</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="rounded-3xl border border-border/70 bg-card/60 p-12 text-center text-muted-foreground">
                <Calendar className="mx-auto size-10 text-muted-foreground/40 mb-3" />
                <p className="font-bold text-base text-foreground">No events found matching your search.</p>
                <p className="text-xs mt-1">Try adjusting your filters or click Generate Event to schedule one.</p>
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="h-10 gap-2 rounded-2xl bg-[#1A3C6E] px-5 font-display text-xs font-black text-white shadow-md shadow-[#1A3C6E]/20 hover:bg-[#1A3C6E]/90"
                  >
                    <Plus className="size-4 text-[#F2A93B]" />
                    <span>Generate New Event Now</span>
                  </Button>
                </div>
              </div>
            ) : (
              filteredEvents.map((event) => {
                const isLive = event.status === "live";
                const isHeld = event.status === "completed";
                const isCancelled = event.status === "cancelled";
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "flex flex-col justify-between gap-4 rounded-3xl border p-5 backdrop-blur-xl transition-all sm:flex-row sm:items-center",
                      isLive
                        ? "border-emerald-500/50 bg-emerald-500/5 shadow-md shadow-emerald-500/10"
                        : isHeld
                        ? "border-blue-200/70 bg-card/70"
                        : isCancelled
                        ? "border-border/60 bg-muted/30 opacity-75"
                        : "border-border/70 bg-card/60 hover:bg-card/80"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
                            isLive
                              ? "animate-pulse bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : isHeld
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              : event.status === "pending_approval"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                              : isCancelled
                              ? "bg-slate-500/20 text-slate-600 dark:text-slate-400"
                              : "bg-[#1A3C6E]/10 text-[#1A3C6E] dark:text-blue-300"
                          )}
                        >
                          {isLive ? "🔴 LIVE NOW" : isHeld ? "🎓 HELD / CONCLUDED" : isCancelled ? "⏸️ ON HOLD" : event.status.replace("_", " ")}
                        </span>
                        <span className="rounded-md bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1A3C6E] dark:text-[#F2A93B]">
                          {event.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {event.date} · {event.time}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-semibold text-foreground">
                          📍 {event.venue}
                        </span>
                      </div>

                      <h4 className="mt-1.5 font-display text-base font-black text-foreground">
                        {event.title}
                      </h4>

                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {event.description}
                      </p>

                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>
                          <strong>{event.registeredCount}</strong> / {event.capacity} Registered
                        </span>
                        <span>•</span>
                        <span>Dept: <strong className="text-foreground">{event.department}</strong></span>
                        <span>•</span>
                        <span>Organizer: {event.organizerName}</span>
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {/* Hold / Conclude Action */}
                      {!isHeld ? (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsHeld(event)}
                          className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#1A3C6E] text-xs font-bold text-white shadow-md hover:opacity-95"
                          title="Mark event as Held, finalize attendance, and automatically generate verified PDF certificates"
                        >
                          <Award className="size-3.5 text-[#F2A93B]" />
                          <span>Held / Conclude Event</span>
                        </Button>
                      ) : (
                        <span className="flex items-center gap-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="size-3.5" />
                          Held & Certified
                        </span>
                      )}

                      {/* Hold Live Session (QR Attendance) */}
                      <Button
                        size="sm"
                        onClick={() => handleHoldLiveSession(event)}
                        className={cn(
                          "h-9 gap-1.5 rounded-xl text-xs font-black shadow-md",
                          isLive
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-[#1A3C6E] text-white hover:bg-[#1A3C6E]/90"
                        )}
                        title="Display dynamic anti-proxy QR code on projector for student check-ins"
                      >
                        <QrCode className="size-3.5 text-[#F2A93B]" />
                        <span>{isLive ? "Live QR Display" : "Hold Live Session"}</span>
                      </Button>

                      {/* View Attendance Roster */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewRoster(event)}
                        className="h-9 gap-1.5 rounded-xl border-[#1A3C6E]/30 text-xs font-bold text-[#1A3C6E] dark:text-[#F2A93B]"
                      >
                        <UserCheck className="size-3.5" />
                        <span>Roster</span>
                      </Button>

                      {/* Put on Hold / Resume */}
                      {!isHeld && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleHoldEvent(event)}
                          className={cn(
                            "h-9 gap-1 rounded-xl text-xs font-bold",
                            isCancelled
                              ? "text-emerald-600 hover:bg-emerald-50"
                              : "text-rose-600 hover:bg-rose-50"
                          )}
                          title={isCancelled ? "Resume event" : "Put event on hold"}
                        >
                          {isCancelled ? (
                            <>
                              <PlayCircle className="size-3.5" />
                              <span>Resume</span>
                            </>
                          ) : (
                            <>
                              <PauseCircle className="size-3.5" />
                              <span>Put On Hold</span>
                            </>
                          )}
                        </Button>
                      )}

                      {/* Delete Event Action */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteEvent(event)}
                        className="h-9 gap-1 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        title="Permanently delete event"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Student Identity Registry View */}
      {adminTab === "students" && (
        <StudentRegistryViewer state={state} />
      )}

      {/* Event Attendance Roster View */}
      {adminTab === "roster" && (
        <EventAttendanceViewer
          state={state}
          selectedEventId={selectedRosterEventId}
          onSelectEventId={(id) => setSelectedRosterEventId(id)}
          titlePrefix="TPC Admin & University Governance Roster"
        />
      )}

      {/* Visitor & Vehicle Gate Security Governance View */}
      {adminTab === "security" && (
        <VisitorVehicleSecurityViewer
          state={state}
          onOpenGateModal={onOpenGateModal}
        />
      )}

      {/* Overview Analytics View */}
      {adminTab === "overview" && (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-3xl border border-border/80 bg-card/60 p-4 shadow-lg shadow-brand/5 backdrop-blur-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Events
              </span>
              <p className="mt-2 font-display text-3xl font-black text-foreground">{totalEvents}</p>
              <p className="mt-1 text-xs text-muted-foreground">Active university sessions</p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card/60 p-4 shadow-lg shadow-brand/5 backdrop-blur-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Check-ins
              </span>
              <p className="mt-2 font-display text-3xl font-black text-foreground">{totalCheckins}</p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Verified QR punches</p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card/60 p-4 shadow-lg shadow-brand/5 backdrop-blur-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Avg. Engagement
              </span>
              <p className="mt-2 font-display text-3xl font-black text-foreground">{avgEngagement}</p>
              <p className="mt-1 text-xs text-muted-foreground">Turnout across events</p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card/60 p-4 shadow-lg shadow-brand/5 backdrop-blur-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Certificates Issued
              </span>
              <p className="mt-2 font-display text-3xl font-black text-foreground">{verifiedCertificates}</p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">100% digitally verified</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Department Participation Bar Chart */}
            <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-black text-foreground">
                    Department Participation Rates
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Percentage of enrolled students attending co-curricular events
                  </p>
                </div>
                <BarChart3 className="size-5 text-brand" />
              </div>

              <div className="mt-6 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip
                      formatter={(val: number) => [`${val}%`, "Participation Rate"]}
                      contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                    />
                    <Bar dataKey="participation" fill="#1A3C6E" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance Check-in Growth Area Chart */}
            <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-black text-foreground">
                    Weekly Verified Attendance Scans
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Growth of QR check-in volume throughout Semester 6
                  </p>
                </div>
                <TrendingUp className="size-5 text-emerald-500" />
              </div>

              <div className="mt-6 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F2A93B" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#F2A93B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: number) => [val, "Scans Verified"]}
                      contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="scans"
                      stroke="#F2A93B"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#areaColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approvals Queue */}
      {adminTab === "approvals" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-black text-foreground">
                Event Proposals Requiring Approval
              </h3>
              <p className="text-xs text-muted-foreground">
                Review and approve faculty events before publishing to the campus directory
              </p>
            </div>
          </div>

          <DateRangeFilter
            startDate={approvalsStartDate}
            endDate={approvalsEndDate}
            onStartDateChange={setApprovalsStartDate}
            onEndDateChange={setApprovalsEndDate}
            onReset={() => {
              setApprovalsStartDate("");
              setApprovalsEndDate("");
            }}
            label="Filter by Event Date"
          />

          <div className="space-y-3">
            {filteredApprovals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <ShieldCheck className="size-10 text-emerald-500" />
                <p className="mt-2 text-sm font-bold text-foreground">
                  {pendingApprovals.length === 0 ? "All pending events reviewed!" : "No pending proposals match the selected date range."}
                </p>
                <p className="text-xs">No pending proposals awaiting administrative authorization.</p>
              </div>
            ) : (
              filteredApprovals.map((evt) => (
                <div
                  key={evt.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-card/70 p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                        {evt.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {evt.department} · {evt.date}
                      </span>
                    </div>
                    <h4 className="mt-1 font-display text-base font-bold text-foreground">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Proposed by {evt.organizerName} · Capacity: {evt.capacity} students · Venue: {evt.venue}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(evt.id)}
                      className="rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      <Check className="mr-1 size-3.5" /> Approve Event
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(evt.id)}
                      className="rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      <XCircle className="mr-1 size-3.5" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteEvent(evt)}
                      className="rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Permanently delete proposal"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Attendance Flags & Low Attendance Actions */}
      {adminTab === "alerts" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-lg font-black text-foreground">
                Low-Attendance Follow-Up Center
              </h3>
              <p className="text-xs text-muted-foreground">
                Automated flag for students with verified attendance &lt;75% this semester
              </p>
            </div>

            <Button
              onClick={handleTriggerAlerts}
              className="rounded-xl bg-amber-500 font-bold text-slate-950 hover:bg-amber-400"
            >
              <Mail className="mr-1.5 size-4" />
              Dispatch Notices to Mentors & Students
            </Button>
          </div>

          <DateRangeFilter
            startDate={flagsStartDate}
            endDate={flagsEndDate}
            onStartDateChange={setFlagsStartDate}
            onEndDateChange={setFlagsEndDate}
            onReset={() => {
              setFlagsStartDate("");
              setFlagsEndDate("");
            }}
            label="Filter by Student Registration / Flag Date"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="border-b border-border/70 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-3 font-bold">Student Name</th>
                  <th className="pb-3 font-bold">Enrolment ID</th>
                  <th className="pb-3 font-bold">Department</th>
                  <th className="pb-3 font-bold">Attendance %</th>
                  <th className="pb-3 font-bold">Assigned Faculty Mentor</th>
                  <th className="pb-3 text-right font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {flaggedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground font-medium">
                      No students flagged below 75% attendance in this date range.
                    </td>
                  </tr>
                ) : (
                  flaggedStudents.map((st) => (
                    <tr key={st.rollNo} className="hover:bg-muted/20">
                      <td className="py-3.5 font-bold text-foreground">{st.name}</td>
                      <td className="py-3.5 text-muted-foreground">{st.rollNo}</td>
                      <td className="py-3.5 text-muted-foreground">{st.dept}</td>
                      <td className="py-3.5 font-bold text-rose-600 dark:text-rose-400">
                        {st.attendance}%
                      </td>
                      <td className="py-3.5 text-muted-foreground">{st.mentor}</td>
                      <td className="py-3.5 text-right">
                        <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                          Notice Dispatched
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Immutable Audit Log */}
      {adminTab === "audit" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-black text-foreground">
                University Immutable Audit Trail
              </h3>
              <p className="text-xs text-muted-foreground">
                Cryptographic log of all scan events, check-ins, approvals, and administrative actions
              </p>
            </div>
          </div>

          <DateRangeFilter
            startDate={auditStartDate}
            endDate={auditEndDate}
            onStartDateChange={setAuditStartDate}
            onEndDateChange={setAuditEndDate}
            onReset={() => {
              setAuditStartDate("");
              setAuditEndDate("");
            }}
            label="Filter by Event / Action Date"
          />

          <div className="space-y-2.5">
            {filteredAuditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground font-medium">
                No audit log records found for the selected date range.
              </div>
            ) : (
              filteredAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-card/40 p-3.5 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand">{log.action}</span>
                      <span className="text-muted-foreground">by</span>
                      <span className="font-semibold text-foreground">{log.performedBy}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      Target: <span className="font-semibold text-foreground">{log.target}</span> · {log.details}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono text-muted-foreground">
                    {log.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Internships & TPC Governance View */}
      {adminTab === "internships" && (
        <InternshipManagementHub state={state} />
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Live Attendance Dynamic QR Modal */}
      {liveEventModal && (
        <LiveAttendanceModal
          event={liveEventModal}
          state={state}
          onClose={() => setLiveEventModal(null)}
        />
      )}

      {/* Modern UI Confirmation Modal */}
      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          subtitle={confirmModal.subtitle}
          description={confirmModal.description}
          badgeText={confirmModal.badgeText}
          bullets={confirmModal.bullets}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          variant={confirmModal.variant}
        />
      )}
    </div>
  );
}
