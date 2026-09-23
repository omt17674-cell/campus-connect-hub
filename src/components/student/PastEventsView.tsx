import { useState, useMemo } from "react";
import { CampusEvent, CampusState } from "@/lib/campus-store";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  Download,
  Loader2,
  ChevronRight,
  ShieldCheck,
  History,
  Filter,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { generateCertificatePdf } from "@/lib/certificate-generator";
import { toast } from "sonner";

interface PastEventsViewProps {
  state: CampusState;
  onSelectEvent: (event: CampusEvent) => void;
}

const CATEGORIES = [
  { id: "all", label: "All Past" },
  { id: "tech", label: "Tech" },
  { id: "cultural", label: "Cultural" },
  { id: "sports", label: "Sports" },
  { id: "academic", label: "Academic & TPC" },
  { id: "workshop", label: "Workshops" },
];

export function PastEventsView({ state, onSelectEvent }: PastEventsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "attended" | "not_attended">("all");
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);

  const currentUser = state.currentUser;
  const currentRoll = (currentUser.rollNo || "").trim().toLowerCase();
  const currentUserId = (currentUser.id || "").trim();
  const currentUserName = (currentUser.name || "").trim().toLowerCase();

  const todayStr = new Date().toISOString().split("T")[0];

  // Helper to match student in attendance or registration
  const isStudentMatch = (userId?: string, rollNo?: string, userName?: string) => {
    if (currentUserId && userId === currentUserId) return true;
    if (currentRoll && rollNo) {
      const r = rollNo.toLowerCase();
      if (r === currentRoll || r.includes(currentRoll) || currentRoll.includes(r)) return true;
    }
    if (currentUserName && userName) {
      const n = userName.toLowerCase();
      if (n === currentUserName || n.includes(currentUserName) || currentUserName.includes(n)) return true;
    }
    return false;
  };

  // Find all past events (date < todayStr or status === "completed")
  const pastEvents = (state.events || []).filter((e) => {
    if (!e) return false;
    return e.date < todayStr || e.status === "completed";
  });

  const departments = useMemo(() => {
    const set = new Set<string>();
    (pastEvents || []).forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return ["all", ...Array.from(set)];
  }, [pastEvents]);

  const isAttendedByStudent = (eventId: string) => {
    const hasAtt = (state.attendanceRecords || []).some(
      (a) => a.eventId === eventId && isStudentMatch(a.userId, a.userRollNo, a.userName)
    );
    if (hasAtt) return true;
    return (state.registrations || []).some(
      (r) => r.eventId === eventId && r.status === "attended" && isStudentMatch(r.userId, r.userRollNo, r.userName)
    );
  };

  const filteredEvents = pastEvents.filter((e) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (e.title || "").toLowerCase().includes(query) ||
      (e.venue || "").toLowerCase().includes(query) ||
      (e.department || "").toLowerCase().includes(query) ||
      (e.category || "").toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "all" ||
      (e.category && e.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    const matchesDept =
      selectedDepartment === "all" ||
      (e.department && e.department.toLowerCase() === selectedDepartment.toLowerCase());

    const isAtt = isAttendedByStudent(e.id);
    const matchesAttendance =
      attendanceFilter === "all" ||
      (attendanceFilter === "attended" && isAtt) ||
      (attendanceFilter === "not_attended" && !isAtt);

    return matchesSearch && matchesCategory && matchesDept && matchesAttendance;
  });

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedDepartment !== "all" ||
    attendanceFilter !== "all" ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedDepartment("all");
    setAttendanceFilter("all");
    setSearchQuery("");
  };

  const getStudentEventStatus = (eventId: string) => {
    // 1. Check attendance record
    const att = (state.attendanceRecords || []).find(
      (a) => a.eventId === eventId && isStudentMatch(a.userId, a.userRollNo, a.userName)
    );
    if (att) {
      return {
        status: "attended" as const,
        punchInTime: att.punchInTime || att.timestamp,
        punchOutTime: att.punchOutTime,
        certificateId: att.certificateId,
        verifiedMethod: att.verifiedMethod,
      };
    }

    // 2. Check registration record
    const reg = (state.registrations || []).find(
      (r) => r.eventId === eventId && isStudentMatch(r.userId, r.userRollNo, r.userName)
    );
    if (reg) {
      if (reg.status === "attended") {
        return {
          status: "attended" as const,
          punchInTime: reg.punchInTime || reg.registeredAt,
          punchOutTime: reg.punchOutTime,
          certificateId: `GSFC-CERT-${eventId.slice(-4)}-${currentUser.rollNo.slice(-4)}`,
          verifiedMethod: "qr_scan" as const,
        };
      }
      return {
        status: "registered_absent" as const,
        punchInTime: undefined,
        punchOutTime: undefined,
        certificateId: undefined,
        verifiedMethod: undefined,
      };
    }

    return {
      status: "not_registered" as const,
      punchInTime: undefined,
      punchOutTime: undefined,
      certificateId: undefined,
      verifiedMethod: undefined,
    };
  };

  const handleDownloadCertificate = async (event: CampusEvent) => {
    setDownloadingCertId(event.id);
    try {
      const attInfo = getStudentEventStatus(event.id);
      const record = {
        id: `att-${event.id}-${currentUser.rollNo}`,
        eventId: event.id,
        eventTitle: event.title,
        userId: currentUser.id,
        userName: currentUser.name || "GSFC Student",
        userRollNo: currentUser.rollNo || "",
        department: currentUser.department || "Computer Science & Engineering",
        timestamp: attInfo.punchInTime || new Date().toISOString(),
        verifiedMethod: (attInfo.verifiedMethod || "qr_scan") as any,
        tokenUsed: "GSFC_VERIFIED_SIGNATURE",
        certificateId:
          attInfo.certificateId ||
          `GSFC-CERT-${event.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6)}-${currentUser.rollNo.replace(/[^a-zA-Z0-9]/g, "").slice(-4)}`,
        synced: true,
      };

      await generateCertificatePdf(record, event, currentUser);
      toast.success("Certificate generated and downloaded successfully!");
    } catch (err: any) {
      console.error("Certificate download error", err);
      const specificMissing: string[] = [];
      if (!event.organizerName) specificMissing.push("organizer name");
      if (!event.venue) specificMissing.push("venue");
      if (!event.date) specificMissing.push("event date");
      if (!currentUser.department) specificMissing.push("department");

      if (specificMissing.length > 0) {
        toast.error(
          `Certificate generation failed: missing ${specificMissing.join(", ")}. Please contact the event coordinator.`
        );
      } else {
        toast.error(`Certificate download error: ${err?.message || "Failed to generate PDF"}`);
      }
    } finally {
      setDownloadingCertId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 rounded-3xl border border-border/80 bg-gradient-to-r from-slate-100 via-card to-blue-50/50 dark:from-slate-900/40 dark:to-blue-950/20 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 dark:bg-slate-800 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <History className="size-3.5" /> University Event Archives
            </span>
            <h2 className="mt-2 font-display text-2xl font-black text-foreground">
              Past Events & Certificates
            </h2>
            <p className="text-xs text-muted-foreground">
              Historical campus sessions and workshops. Verify attendance and download official certificates of completion.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-2xl border border-border bg-card px-4 py-2 font-mono text-xs font-bold text-foreground shadow-xs">
              {pastEvents.length} Past Event{pastEvents.length === 1 ? "" : "s"} Archived
            </span>
          </div>
        </div>

        {/* Search Bar & Category Filter Bar */}
        <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search past events by title, venue, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-2xl border-border/80 bg-background/80 pl-10 text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                  selectedCategory === c.id
                    ? "bg-[#1A3C6E] text-white shadow-xs"
                    : "border border-border/70 bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-criteria Filter Bar */}
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border/60 pt-3">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
              <Filter className="size-3 text-brand" /> Dept:
            </span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="h-8 rounded-xl border border-border/80 bg-card px-2.5 text-xs font-semibold text-foreground focus:border-brand focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments
                .filter((d) => d !== "all")
                .map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
            </select>
          </div>

          {/* Attendance Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-muted-foreground">My Attendance:</span>
            <div className="flex rounded-xl border border-border/70 bg-background/60 p-0.5">
              <button
                type="button"
                onClick={() => setAttendanceFilter("all")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all",
                  attendanceFilter === "all"
                    ? "bg-[#1A3C6E] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All Past
              </button>
              <button
                type="button"
                onClick={() => setAttendanceFilter("attended")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all",
                  attendanceFilter === "attended"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Attended (Certs Ready)
              </button>
              <button
                type="button"
                onClick={() => setAttendanceFilter("not_attended")}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all",
                  attendanceFilter === "not_attended"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Not Attended
              </button>
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 gap-1 rounded-xl text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 ml-auto"
            >
              <RotateCcw className="size-3" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
          <Calendar className="size-12 text-muted-foreground/50" />
          <h3 className="mt-3 font-display text-base font-bold text-foreground">
            No Past Events Found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {searchQuery
              ? "No past events match your search query."
              : "No completed campus events recorded yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((evt) => {
            const studentInfo = getStudentEventStatus(evt.id);
            const attended = studentInfo.status === "attended";
            const absent = studentInfo.status === "registered_absent";

            return (
              <div
                key={evt.id}
                className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-[#1A3C6E]/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                      {evt.category}
                    </Badge>

                    {attended ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> Verified Attended
                      </span>
                    ) : absent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-black text-rose-600 dark:text-rose-400">
                        <XCircle className="size-3" /> Absent
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        Not Enrolled
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => onSelectEvent(evt)}
                    className="mt-3 cursor-pointer font-display text-base font-bold text-foreground line-clamp-1 hover:text-[#1A3C6E] dark:hover:text-[#F2A93B]"
                  >
                    {evt.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {evt.description || "Official completed session at GSFC University."}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-muted-foreground" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <Users className="size-3.5 text-muted-foreground" />
                      <span>{evt.department}</span>
                    </div>
                  </div>

                  {attended && studentInfo.certificateId && (
                    <div className="mt-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        <div>
                          <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                            Certificate ID: {studentInfo.certificateId}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            Verified via {studentInfo.verifiedMethod || "QR Scan"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectEvent(evt)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    Details <ChevronRight className="ml-1 size-3.5" />
                  </Button>

                  {attended ? (
                    <Button
                      size="sm"
                      disabled={downloadingCertId === evt.id}
                      onClick={() => handleDownloadCertificate(evt)}
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-[#1A3C6E] text-xs font-black text-white hover:opacity-90 shadow-xs flex items-center gap-1.5"
                    >
                      {downloadingCertId === evt.id ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="size-3.5" />
                          <span>Download Certificate</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {absent ? "No certificate issued" : "Event concluded"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
