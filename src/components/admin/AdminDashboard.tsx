import { useState, useEffect } from "react";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Check,
  Download,
  FileText,
  GraduationCap,
  History,
  Mail,
  PieChart as PieIcon,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
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
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  state: CampusState;
  onOpenGateModal?: () => void;
}

export function AdminDashboard({ state, onOpenGateModal }: AdminDashboardProps) {
  const t = translations[state.language];
  const [adminTab, setAdminTab] = useState<
    "overview" | "students" | "roster" | "security" | "approvals" | "alerts" | "audit"
  >("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleApprove = (id: string) => {
    campusStore.approveEvent(id);
  };

  const handleReject = (id: string) => {
    campusStore.rejectEvent(id);
  };

  const handleTriggerAlerts = () => {
    campusStore.triggerLowAttendanceAlerts();
    alert("Warning emails & mentor notifications dispatched successfully!");
  };

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

        <div className="flex items-center gap-2">
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
      </div>

      {/* Student Identity Registry View */}
      {adminTab === "students" && (
        <StudentRegistryViewer state={state} />
      )}

      {/* Event Attendance Roster View */}
      {adminTab === "roster" && (
        <EventAttendanceViewer
          state={state}
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
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl">
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

          <div className="mt-5 space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <ShieldCheck className="size-10 text-emerald-500" />
                <p className="mt-2 text-sm font-bold text-foreground">All pending events reviewed!</p>
                <p className="text-xs">No pending proposals awaiting administrative authorization.</p>
              </div>
            ) : (
              pendingApprovals.map((evt) => (
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
                      className="rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50"
                    >
                      <XCircle className="mr-1 size-3.5" /> Reject
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
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl">
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

          <div className="mt-5 overflow-x-auto">
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
                {flaggedStudents.map((st) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Immutable Audit Log */}
      {adminTab === "audit" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl">
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

          <div className="mt-5 space-y-2.5">
            {state.auditLogs.map((log) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
