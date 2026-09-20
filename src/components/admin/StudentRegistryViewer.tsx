import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  Lock,
  Search,
  Phone,
  CheckCircle2,
  Clock,
  Home,
  Bus,
  Download,
  RefreshCw,
  Edit,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusState, campusStore } from "@/lib/campus-store";
import { NewRegisteredStudent } from "@/lib/types";
import { EditStudentModal } from "./EditStudentModal";
import { DateRangeFilter } from "./DateRangeFilter";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface StudentRegistryViewerProps {
  state: CampusState;
}

export function StudentRegistryViewer({ state }: StudentRegistryViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [residenceFilter, setResidenceFilter] = useState<"all" | "hostel" | "dayscholar">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingStudent, setEditingStudent] = useState<NewRegisteredStudent | null>(null);

  // Server-side paginated state
  const [students, setStudents] = useState<NewRegisteredStudent[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  const fetchRegistryData = useCallback(
    async (targetPage = page, isManual = false) => {
      setIsLoading(true);
      if (isManual) {
        setLoadError(null);
      }
      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          pageSize: String(pageSize),
        });
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (departmentFilter !== "all") params.set("department", departmentFilter);

        const res = await fetch(`/api/students/registry?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || "Failed to query student registry from database");
        }

        setStudents(data.students || []);
        setTotalCount(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setPage(data.page || targetPage);
        setLoadError(null);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

        if (isManual) {
          toast.success(
            `Synced with database: ${data.total} student record${data.total === 1 ? "" : "s"}.`,
          );
        }
      } catch (err: any) {
        console.error("[StudentRegistryViewer] Fetch error:", err);
        // If server API route is unavailable or offline, check campusStore as fallback
        const storeStudents = campusStore.getState().newRegisteredStudents;
        if (storeStudents && storeStudents.length > 0) {
          setStudents(storeStudents);
          setTotalCount(storeStudents.length);
          setTotalPages(Math.ceil(storeStudents.length / pageSize) || 1);
          setLastSyncTime(
            `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (Cache)`,
          );
          setLoadError(null);
        } else {
          setLoadError(err.message || "Unable to reach database gateway.");
        }
        if (isManual) {
          toast.error(`Sync failed: ${err.message || "Could not retrieve records"}`);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [page, pageSize, searchQuery, departmentFilter],
  );

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRegistryData(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, departmentFilter, pageSize]);

  // Realtime subscription: immediate un-debounced sync on table mutations
  useEffect(() => {
    fetchRegistryData(1);

    const channel = supabase
      .channel("admin-student-registry-live-sync")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "new_registered_students" },
        () => {
          fetchRegistryData(page);
          campusStore.refreshStudentRegistry(true);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "new_registered_students" },
        () => {
          fetchRegistryData(page);
          campusStore.refreshStudentRegistry(true);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "new_registered_students" },
        () => {
          fetchRegistryData(page);
          campusStore.refreshStudentRegistry(true);
        },
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "accounts" }, () => {
        fetchRegistryData(page);
        campusStore.refreshStudentRegistry(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page, fetchRegistryData]);

  // Client-side date and residence filtering on active page
  const displayedStudents = students.filter((s) => {
    const matchesResidence = residenceFilter === "all" || s.residenceType === residenceFilter;
    const matchesDate =
      (!startDate || (s.createdAt && s.createdAt.split("T")[0] >= startDate)) &&
      (!endDate || (s.createdAt && s.createdAt.split("T")[0] <= endDate));
    return matchesResidence && matchesDate;
  });

  const handleExportCsv = () => {
    const rows = [
      ["GSFC University - Official Student Identity Registry (Locked Identity Records)"],
      ["Export Timestamp", new Date().toISOString()],
      ["Total Registered Students", String(totalCount || students.length)],
      [],
      [
        "Roll Number",
        "Full Name (Locked)",
        "Mobile Number (Locked)",
        "Official Email",
        "School",
        "Department",
        "Degree & Semester",
        "Residency / Route",
        "ID Verified",
        "Locked Status",
        "Registration Date",
      ],
      ...displayedStudents.map((s) => [
        s.rollNo,
        s.fullName,
        s.mobileNumber,
        s.email,
        s.school,
        s.department,
        `${s.degree} - Sem ${s.semester}`,
        s.residenceType === "hostel"
          ? s.hostelBlockOrBusRoute || "Hostel"
          : s.hostelBlockOrBusRoute || "Day Scholar Bus",
        s.verifiedByUniversity ? "Verified" : "Pending",
        "LOCKED (Permanent)",
        s.createdAt || "N/A",
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSFC_Student_Registry_Locked_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Security Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/90 via-white to-amber-50/80 p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20">
            <GraduationCap className="size-6 text-[#F2A93B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-black text-[#1A3C6E]">
                Official Student Identity Registry
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-700">
                <Lock className="size-3" /> Identity Locked
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Live Sync Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Database-backed bona fide student records. Identity is verified and locked against
              unauthorized modification.
              {lastSyncTime && (
                <span className="ml-2 font-medium text-slate-400">
                  • Last synced: {lastSyncTime}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-center shadow-xs">
            <p className="text-[10px] font-bold uppercase text-slate-400">Total Enrolled</p>
            <p className="font-display text-lg font-black text-[#1A3C6E]">
              {totalCount} Student{totalCount === 1 ? "" : "s"}
            </p>
          </div>
          <Button
            onClick={() => fetchRegistryData(page, true)}
            disabled={isLoading}
            variant="outline"
            className="h-10 gap-2 rounded-2xl border-blue-200 bg-blue-50/50 text-xs font-bold text-[#1A3C6E] hover:bg-blue-100/60"
          >
            <RefreshCw className={cn("size-3.5 text-[#F2A93B]", isLoading && "animate-spin")} />
            Sync Database
          </Button>
          <Button
            onClick={handleExportCsv}
            variant="outline"
            className="h-10 gap-2 rounded-2xl border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Download className="size-4 text-[#1A3C6E]" />
            Export Registry (CSV)
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll number, email, or mobile..."
            className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-xs font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science">Computer Science & Engg</option>
            <option value="Chemical">Chemical Engineering</option>
            <option value="Mechanical">Mechanical Engineering</option>
            <option value="Biotechnology">Biotechnology</option>
            <option value="Management">Management / BBA</option>
          </select>

          <select
            value={residenceFilter}
            onChange={(e) => setResidenceFilter(e.target.value as any)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
          >
            <option value="all">All Residing</option>
            <option value="hostel">Hostelites Only</option>
            <option value="dayscholar">Day Scholars Only</option>
          </select>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold text-foreground focus:outline-none"
            title="Rows per page"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>

        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onDateChange={(s, e) => {
            setStartDate(s);
            setEndDate(e);
          }}
          label="Registration Date"
        />
      </div>

      {/* Error state if database is unreachable */}
      {loadError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center text-rose-800 shadow-xs">
          <AlertTriangle className="mx-auto size-8 text-rose-500 mb-2" />
          <p className="font-bold text-sm">Unable to load student records from database.</p>
          <p className="text-xs text-rose-600 mb-4">{loadError}</p>
          <Button
            onClick={() => fetchRegistryData(page, true)}
            variant="outline"
            className="h-9 gap-2 rounded-xl border-rose-300 bg-white text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            <RefreshCw className="size-3.5" />
            Retry Connection
          </Button>
        </div>
      )}

      {/* Students Table */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/70 bg-muted/40 font-display text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3.5 pl-6 pr-4">Student & Roll No</th>
                <th className="px-4 py-3.5">Locked Mobile</th>
                <th className="px-4 py-3.5">School & Department</th>
                <th className="px-4 py-3.5">Degree & Sem</th>
                <th className="px-4 py-3.5">Hostel / Commute</th>
                <th className="px-4 py-3.5 text-center">Identity Status</th>
                <th className="px-4 py-3.5 text-center">Verification</th>
                <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto size-6 animate-spin text-brand mb-2" />
                    <p className="font-bold">Loading student records from Supabase database...</p>
                  </td>
                </tr>
              ) : displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <GraduationCap className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                    <p className="font-bold">No registered students found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                displayedStudents.map((stu) => (
                  <tr key={stu.rollNo} className="transition-colors hover:bg-muted/20">
                    {/* Student & Roll No */}
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1A3C6E] to-[#0E2342] text-xs font-black text-white shadow-xs">
                          {stu.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-display font-black text-foreground">{stu.fullName}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="font-mono font-bold text-[#1A3C6E] dark:text-amber-400">
                              #{stu.rollNo}
                            </span>
                            <span>•</span>
                            <span>{stu.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Locked Mobile Number */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 font-mono font-bold text-foreground">
                        <Phone className="size-3 text-muted-foreground" />
                        <span>{stu.mobileNumber}</span>
                        <Lock
                          className="size-3 text-amber-500"
                          title="Locked by University Policy"
                        />
                      </div>
                    </td>

                    {/* Department & School */}
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-foreground line-clamp-1">{stu.department}</p>
                      <p className="text-[10px] text-muted-foreground">{stu.school}</p>
                    </td>

                    {/* Degree & Sem */}
                    <td className="px-4 py-3.5">
                      <span className="rounded-lg bg-muted px-2 py-0.5 font-bold text-foreground">
                        {stu.degree} · Sem {stu.semester}
                      </span>
                    </td>

                    {/* Hostel / Commute Campus Location */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        {stu.residenceType === "hostel" ? (
                          <div className="flex items-center gap-1.5 text-[#1A3C6E] dark:text-blue-300">
                            <Home className="size-3.5 shrink-0 text-[#1A3C6E]" />
                            <span className="text-[11px] font-bold">
                              {stu.hostelBlockOrBusRoute || "GSFC Campus Hostel"}
                            </span>
                            <span className="rounded bg-blue-500/10 px-1.5 py-0.2 text-[9px] font-black text-blue-700 dark:text-blue-300">
                              On-Campus
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                            <Bus className="size-3.5 shrink-0 text-amber-600" />
                            <span className="text-[11px] font-bold">
                              {stu.hostelBlockOrBusRoute || "Vadodara Bus Route"}
                            </span>
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-black text-amber-700 dark:text-amber-400">
                              Day Scholar
                            </span>
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {stu.residenceType === "hostel"
                            ? "Resident on GSFC Campus"
                            : "Commutes to GSFC Campus"}
                        </span>
                      </div>
                    </td>

                    {/* Locked Identity Badge */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-400">
                        <Lock className="size-3" />
                        <span>LOCKED</span>
                      </span>
                    </td>

                    {/* Verification Status (Requirement 5) */}
                    <td className="px-4 py-3.5 text-center">
                      {stu.verifiedByUniversity ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          <span>Verified Bona Fide</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          <Clock className="size-3" />
                          <span>Pending Verification</span>
                        </span>
                      )}
                    </td>

                    {/* Actions: Edit Student */}
                    <td className="py-3.5 pl-4 pr-6 text-right">
                      {state.currentRole === "admin" ||
                      state.currentRole === "dean" ||
                      state.currentRole === "super_admin" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingStudent(stu)}
                          className="h-8 gap-1.5 rounded-xl border-blue-200 bg-blue-50/60 px-3 text-[11px] font-bold text-[#1A3C6E] hover:bg-blue-100 hover:text-[#1A3C6E] dark:bg-slate-800 dark:border-slate-700 dark:text-blue-300"
                        >
                          <Edit className="size-3 text-[#F2A93B]" />
                          Edit Student
                        </Button>
                      ) : (
                        <span className="text-[11px] font-semibold text-muted-foreground italic">
                          Locked (View Only)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/70 px-6 py-3.5 bg-muted/20">
          <p className="text-xs text-muted-foreground font-medium">
            Showing <span className="font-bold text-foreground">{displayedStudents.length}</span> of{" "}
            <span className="font-bold text-foreground">{totalCount}</span> registered students
            (Page {page} of {totalPages || 1})
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (page > 1) fetchRegistryData(page - 1);
              }}
              disabled={page <= 1 || isLoading}
              className="h-8 gap-1 rounded-xl text-xs font-bold"
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>

            <span className="px-2 text-xs font-bold text-muted-foreground">
              {page} / {totalPages || 1}
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (page < totalPages) fetchRegistryData(page + 1);
              }}
              disabled={page >= totalPages || isLoading}
              className="h-8 gap-1 rounded-xl text-xs font-bold"
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSuccess={() => {
            fetchRegistryData(page);
            campusStore.refreshStudentRegistry(true);
          }}
        />
      )}
    </div>
  );
}
