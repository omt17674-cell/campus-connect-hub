import { useState, useEffect } from "react";
import {
  GraduationCap,
  Lock,
  Search,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  Home,
  Bus,
  FileCheck2,
  Download,
  Filter,
  RefreshCw,
  Edit,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusState, campusStore } from "@/lib/campus-store";
import { NewRegisteredStudent } from "@/lib/types";
import { EditStudentModal } from "./EditStudentModal";
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingStudent, setEditingStudent] = useState<NewRegisteredStudent | null>(null);

  useEffect(() => {
    campusStore.loadFromSupabase();

    const channel = supabase
      .channel("admin-student-registry-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "new_registered_students" }, () => {
        campusStore.loadFromSupabase();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "accounts" }, () => {
        campusStore.loadFromSupabase();
      })
      .subscribe();

    const interval = setInterval(() => {
      campusStore.loadFromSupabase();
    }, 4000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await campusStore.loadFromSupabase();
    const count = campusStore.getState().newRegisteredStudents?.length || 0;
    toast.success(`Synced with Supabase: ${count} students in registry.`);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const students: NewRegisteredStudent[] = state.newRegisteredStudents || [];

  // Filter students based on search and dropdowns
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobileNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      departmentFilter === "all" ||
      s.department.toLowerCase().includes(departmentFilter.toLowerCase());

    const matchesResidence =
      residenceFilter === "all" || s.residenceType === residenceFilter;

    return matchesSearch && matchesDept && matchesResidence;
  });

  const handleExportCsv = () => {
    const rows = [
      ["GSFC University - Official Student Identity Registry (Locked Identity Records)"],
      ["Export Timestamp", new Date().toISOString()],
      ["Total Registered Students", String(students.length)],
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
      ...filteredStudents.map((s) => [
        s.rollNo,
        s.fullName,
        s.mobileNumber,
        s.email,
        s.school,
        s.department,
        `${s.degree} - Sem ${s.semester}`,
        s.residenceType === "hostel" ? s.hostelBlockOrBusRoute || "Hostel" : s.hostelBlockOrBusRoute || "Day Scholar Bus",
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
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Sync Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Bona fide student candidate records. Name and Mobile Number cannot be altered post-registration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-center shadow-xs">
            <p className="text-[10px] font-bold uppercase text-slate-400">Total Enrolled</p>
            <p className="font-display text-lg font-black text-[#1A3C6E]">{students.length} Students</p>
          </div>
          <Button
            onClick={handleManualSync}
            variant="outline"
            className="h-10 gap-2 rounded-2xl border-blue-200 bg-blue-50/50 text-xs font-bold text-[#1A3C6E] hover:bg-blue-100/60"
          >
            <RefreshCw className={cn("size-3.5 text-[#F2A93B]", isRefreshing && "animate-spin")} />
            Sync Supabase
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
        </div>
      </div>

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
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <GraduationCap className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                    <p className="font-bold">No registered students found matching search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
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
                        <Lock className="size-3 text-amber-500" title="Locked by University Policy" />
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

                    {/* Hostel / Commute */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-foreground">
                        {stu.residenceType === "hostel" ? (
                          <>
                            <Home className="size-3.5 text-[#1A3C6E]" />
                            <span className="text-[11px] font-semibold line-clamp-1">
                              {stu.hostelBlockOrBusRoute || "Hostel Resident"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Bus className="size-3.5 text-amber-600" />
                            <span className="text-[11px] font-semibold line-clamp-1">
                              {stu.hostelBlockOrBusRoute || "Day Scholar Bus"}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Locked Identity Badge */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-400">
                        <Lock className="size-3" />
                        <span>LOCKED</span>
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        <span>Bona Fide</span>
                      </span>
                    </td>

                    {/* Actions: Edit Student */}
                    <td className="py-3.5 pl-4 pr-6 text-right">
                      {state.currentRole === "admin" || state.currentRole === "organizer" ? (
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
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSuccess={() => {
            campusStore.loadFromSupabase();
          }}
        />
      )}
    </div>
  );
}
