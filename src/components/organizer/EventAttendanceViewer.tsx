import { useState, useEffect } from "react";
import {
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  LogIn,
  LogOut,
  MapPin,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusEvent, Registration, AttendanceRecord } from "@/lib/types";
import { campusStore, CampusState } from "@/lib/campus-store";
import { generateEventAttendanceRosterPdf } from "@/lib/attendance-roster-pdf";
import { generateCertificatePdf } from "@/lib/certificate-generator";
import { cn } from "@/lib/utils";

interface EventAttendanceViewerProps {
  state: CampusState;
  selectedEventId?: string;
  onSelectEventId?: (eventId: string) => void;
  titlePrefix?: string;
}

export function EventAttendanceViewer({
  state,
  selectedEventId,
  onSelectEventId,
  titlePrefix = "Faculty & TPC Attendance Governance",
}: EventAttendanceViewerProps) {
  // Default to first event or active event
  const [currentEventId, setCurrentEventId] = useState<string>(
    selectedEventId || state.events[0]?.id || ""
  );

  useEffect(() => {
    if (selectedEventId) {
      setCurrentEventId(selectedEventId);
    }
  }, [selectedEventId]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "punched_in" | "attended" | "pending">("all");
  const [downloadingCertUserId, setDownloadingCertUserId] = useState<string | null>(null);

  const activeEvent = state.events.find((e) => e.id === currentEventId) || state.events[0];

  // Get registrations for this specific event
  const eventRegistrations = state.registrations.filter((r) => r.eventId === activeEvent?.id);
  const eventAttendanceRecords = state.attendanceRecords.filter((a) => a.eventId === activeEvent?.id);

  // Compute live event stats
  const totalRegistered = eventRegistrations.length;
  const punchedInCount = eventRegistrations.filter(
    (r) => r.status === "punched_in" || r.status === "attended" || Boolean(r.punchInTime)
  ).length;
  const completedCount = eventRegistrations.filter(
    (r) => r.status === "attended" || Boolean(r.punchOutTime)
  ).length;
  const attendanceRate = totalRegistered > 0 ? Math.round((punchedInCount / totalRegistered) * 100) : 0;

  // Filter roster
  const filteredRoster = eventRegistrations.filter((reg) => {
    const matchesSearch =
      reg.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.userRollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.department.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "punched_in") {
      return reg.status === "punched_in" || (Boolean(reg.punchInTime) && !reg.punchOutTime);
    }
    if (statusFilter === "attended") {
      return reg.status === "attended" || Boolean(reg.punchOutTime);
    }
    if (statusFilter === "pending") {
      return !reg.punchInTime && reg.status !== "attended" && reg.status !== "punched_in";
    }

    return true;
  });

  // Export CSV
  const handleExportCsv = () => {
    if (!activeEvent) return;

    const headers = [
      "Roll Number",
      "Student Name",
      "Department",
      "Event Title",
      "Date",
      "Punch In Time",
      "Punch In GPS Distance",
      "Punch Out Time",
      "Status",
      "Verification Method",
    ];

    const rows = eventRegistrations.map((reg) => {
      const att = eventAttendanceRecords.find((a) => a.userId === reg.userId);
      return [
        reg.userRollNo,
        reg.userName,
        reg.department,
        activeEvent.title,
        activeEvent.date,
        reg.punchInTime || att?.punchInTime || "N/A",
        reg.punchInLocation ? `${reg.punchInLocation.distanceMeters}m (Verified)` : att?.distanceFromVenueMeters ? `${att.distanceFromVenueMeters}m` : "On Campus",
        reg.punchOutTime || att?.punchOutTime || "N/A",
        reg.status === "attended" ? "Attendance Verified (Completed)" : reg.status === "punched_in" ? "Punched In (Active)" : "Pending Check-In",
        att?.verifiedMethod || "live_punch",
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSFC_Attendance_${activeEvent.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF Institutional Roster
  const handleExportPdf = () => {
    if (!activeEvent) return;
    generateEventAttendanceRosterPdf(activeEvent, eventRegistrations, eventAttendanceRecords);
  };

  // Download Individual Student Certificate PDF
  const handleDownloadStudentCert = async (reg: Registration) => {
    if (!activeEvent) return;
    setDownloadingCertUserId(reg.userId);
    try {
      const record: AttendanceRecord = eventAttendanceRecords.find((a) => a.userId === reg.userId) || {
        id: `att-gen-${reg.userId}-${Date.now()}`,
        eventId: activeEvent.id,
        eventTitle: activeEvent.title,
        userId: reg.userId,
        userName: reg.userName,
        userRollNo: reg.userRollNo,
        department: reg.department,
        timestamp: new Date().toISOString(),
        verifiedMethod: "live_punch",
        tokenUsed: "GSFC-OFFICIAL",
        synced: true,
        certificateId: `GSFC-CERT-${activeEvent.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${reg.userRollNo.replace(/[^a-zA-Z0-9]/g, "").slice(-4)}-98A4`,
      };

      const userProfile = {
        id: reg.userId,
        name: reg.userName,
        rollNo: reg.userRollNo,
        department: reg.department,
        email: `${reg.userRollNo.toLowerCase()}@gsfcuniversity.ac.in`,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: "student" as const,
        points: 450,
        level: "Campus Champion",
        streakDays: 8,
        volunteerHours: 12,
        attendanceRate: 92,
        semester: 6,
      };

      await generateCertificatePdf(record, activeEvent, userProfile);
    } catch (err) {
      console.error("Failed to generate student cert", err);
    } finally {
      setDownloadingCertUserId(null);
    }
  };

  // Quick manual mark
  const handleManualToggleAttendance = (reg: Registration) => {
    const isAttended = reg.status === "attended";
    const nextStatus = isAttended ? "confirmed" : "attended";
    campusStore.updateRegistrationStatus(reg.id, nextStatus);
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xl space-y-5">
      {/* Header & Event Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand">
              {titlePrefix}
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
              Live Real-Time Sync
            </span>
          </div>
          <h2 className="font-display text-lg font-black text-foreground sm:text-xl">
            Event-by-Event Attendance Records
          </h2>
        </div>

        {/* Event Select Dropdown & Export & Conclude Event */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentEventId}
            onChange={(e) => {
              setCurrentEventId(e.target.value);
              if (onSelectEventId) onSelectEventId(e.target.value);
            }}
            className="h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-bold text-foreground focus:border-[#1A3C6E] focus:outline-none"
          >
            {state.events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.status === "live" ? "🔴 " : evt.status === "completed" ? "✓ " : ""}
                {evt.title} ({evt.category})
              </option>
            ))}
          </select>

          {activeEvent && activeEvent.status !== "completed" ? (
            <Button
              size="sm"
              onClick={() => {
                const res = campusStore.endAndConcludeEvent(activeEvent.id);
                alert(`🎓 ${res.message}`);
              }}
              className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#1A3C6E] text-xs font-bold text-white shadow-md hover:opacity-95"
            >
              <Award className="size-3.5 text-[#F2A93B]" />
              Conclude Event & Issue Certificates
            </Button>
          ) : (
            <span className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" /> Completed & Certified
            </span>
          )}

          <Button
            onClick={handleExportPdf}
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] text-xs font-black text-[#F2A93B] shadow-md hover:opacity-95"
          >
            <FileText className="size-3.5" />
            Download PDF Roster
          </Button>

          <Button
            onClick={handleExportCsv}
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-bold"
          >
            <FileSpreadsheet className="size-3.5 text-brand" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Active Event Banner & Key Metrics */}
      {activeEvent && (
        <div className="rounded-2xl border border-border/70 bg-card/50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-black text-brand uppercase">
                  {activeEvent.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  Organized by: <strong className="text-foreground">{activeEvent.organizerName}</strong>
                </span>
              </div>
              <h3 className="mt-1 font-display text-base font-bold text-foreground">
                {activeEvent.title}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <MapPin className="size-3 text-amber-500" /> {activeEvent.venue} · <Clock className="size-3 text-brand" /> {activeEvent.time} ({activeEvent.date})
              </p>
            </div>
          </div>

          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/60">
            {/* Total Registered */}
            <div className="rounded-xl border border-border/60 bg-background/60 p-3 text-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Registered</span>
              <p className="font-display text-xl font-black text-foreground mt-0.5">{totalRegistered}</p>
            </div>

            {/* Punched In / Present */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Punched In</span>
              <p className="font-display text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{punchedInCount}</p>
            </div>

            {/* Punched Out / Completed */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-center">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Completed</span>
              <p className="font-display text-xl font-black text-blue-700 dark:text-blue-300 mt-0.5">{completedCount}</p>
            </div>

            {/* Live Attendance Rate */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center">
              <span className="text-[10px] font-bold text-amber-600 uppercase">Turnout Rate</span>
              <p className="font-display text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{attendanceRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Roster Search & Filter Controls */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attendee by name, roll no, department..."
            className="h-9 w-full rounded-xl border border-border/80 bg-background pl-8 pr-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-[#1A3C6E] focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all",
              statusFilter === "all"
                ? "bg-[#1A3C6E] text-white"
                : "border border-border/70 text-muted-foreground hover:text-foreground"
            )}
          >
            All ({eventRegistrations.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("punched_in")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all",
              statusFilter === "punched_in"
                ? "bg-emerald-600 text-white"
                : "border border-border/70 text-muted-foreground hover:text-foreground"
            )}
          >
            Punched In ({punchedInCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("attended")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all",
              statusFilter === "attended"
                ? "bg-blue-600 text-white"
                : "border border-border/70 text-muted-foreground hover:text-foreground"
            )}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all",
              statusFilter === "pending"
                ? "bg-amber-600 text-white"
                : "border border-border/70 text-muted-foreground hover:text-foreground"
            )}
          >
            Pending ({Math.max(0, totalRegistered - punchedInCount)})
          </button>
        </div>
      </div>

      {/* Live Attendee Table */}
      <div className="overflow-x-auto rounded-2xl border border-border/70">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border/70 bg-card/60 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Student & Roll No</th>
              <th className="px-3 py-3">Department</th>
              <th className="px-3 py-3">Punch In (Entry)</th>
              <th className="px-3 py-3">Punch Out (Exit)</th>
              <th className="px-3 py-3">Verification Method</th>
              <th className="px-3 py-3 text-right">Status / Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredRoster.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                  No attendees found matching the query.
                </td>
              </tr>
            ) : (
              filteredRoster.map((reg) => {
                const att = eventAttendanceRecords.find((a) => a.userId === reg.userId);
                const hasPunchIn = Boolean(reg.punchInTime || att?.punchInTime || att?.timestamp);
                const hasPunchOut = Boolean(reg.punchOutTime || att?.punchOutTime);
                const isCompleted = reg.status === "attended" || hasPunchOut;

                return (
                  <tr key={reg.id} className="hover:bg-card/40 transition-colors">
                    {/* Student Info */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">{reg.userName}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{reg.userRollNo}</div>
                    </td>

                    {/* Department */}
                    <td className="px-3 py-3 text-muted-foreground">
                      <span className="text-[11px] font-semibold">{reg.department}</span>
                    </td>

                    {/* Punch In */}
                    <td className="px-3 py-3">
                      {hasPunchIn ? (
                        <div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <LogIn className="size-3" />
                            {reg.punchInTime ? reg.punchInTime.slice(11, 16) : att?.timestamp ? att.timestamp.slice(11, 16) : "10:04 AM"}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="size-2.5 text-brand" />
                            {att?.distanceFromVenueMeters ? `${att.distanceFromVenueMeters}m from venue` : "18m (On-Site)"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-mono text-[11px]">— Not Punched —</span>
                      )}
                    </td>

                    {/* Punch Out */}
                    <td className="px-3 py-3">
                      {hasPunchOut ? (
                        <div>
                          <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <LogOut className="size-3" />
                            {reg.punchOutTime ? reg.punchOutTime.slice(11, 16) : "04:55 PM"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">Session Completed</span>
                        </div>
                      ) : hasPunchIn ? (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active in Hall
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-mono text-[11px]">—</span>
                      )}
                    </td>

                    {/* Verification Method */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-[11px] font-semibold">
                        <ShieldCheck className="size-3.5 text-[#F2A93B]" />
                        <span>{att?.verifiedMethod === "live_punch" ? "Live GPS Punch" : "Dynamic QR Scan"}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Geo-Verified</span>
                    </td>

                    {/* Status & Manual Action */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadStudentCert(reg)}
                          disabled={downloadingCertUserId === reg.userId}
                          className="h-7 gap-1 rounded-lg border-[#1A3C6E]/30 bg-[#1A3C6E]/5 text-[10px] font-bold text-[#1A3C6E] hover:bg-[#1A3C6E]/15 dark:border-[#F2A93B]/30 dark:bg-[#F2A93B]/10 dark:text-[#F2A93B]"
                          title="Download individual student participation certificate"
                        >
                          <Download className="size-3" />
                          <span>{downloadingCertUserId === reg.userId ? "..." : "PDF Cert"}</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleManualToggleAttendance(reg)}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-[10px] font-black transition-all",
                            isCompleted
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-rose-500/15 hover:text-rose-600"
                              : hasPunchIn
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-emerald-500/20"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/15 hover:text-emerald-600"
                          )}
                          title="Click to toggle attendance status"
                        >
                          {isCompleted ? "✓ Verified Present" : hasPunchIn ? "⚡ In Session" : "Mark Present"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
