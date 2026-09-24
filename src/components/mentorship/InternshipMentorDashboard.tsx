import { useState, useEffect } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  Filter,
  GraduationCap,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  User,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { CampusState } from "@/lib/campus-store";
import {
  AcademicYearMaster,
  DepartmentMaster,
  FieldMaster,
  InternshipMentorAssignment,
  SemesterMaster,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { UnifiedStudentHistoryModal } from "./UnifiedStudentHistoryModal";

interface InternshipMentorDashboardProps {
  state: CampusState;
}

export function InternshipMentorDashboard({ state }: InternshipMentorDashboardProps) {
  const user = state?.currentUser;
  const facultyId = user?.id || user?.email || "u-tpc";

  // Master Data from Supabase
  const [academicYears, setAcademicYears] = useState<AcademicYearMaster[]>([]);
  const [departments, setDepartments] = useState<DepartmentMaster[]>([]);
  const [semesters, setSemesters] = useState<SemesterMaster[]>([]);
  const [fields, setFields] = useState<FieldMaster[]>([]);

  // Filter Selection
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [assignments, setAssignments] = useState<InternshipMentorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<string | null>(null);

  // 1. Load Master Data from Supabase
  useEffect(() => {
    apiClient.getMasterData().then((res) => {
      if (res?.success && res.data) {
        setAcademicYears(res.data.academicYears || []);
        setDepartments(res.data.departments || []);
        setSemesters(res.data.semesters || []);
        setFields(res.data.fields || []);

        // Default to first year / sem if available
        if (res.data.academicYears?.length > 0) {
          setSelectedYear(res.data.academicYears[0].yearName);
        }
      }
    });
  }, []);

  // 2. Load Assigned Interns from Supabase matching filter criteria
  useEffect(() => {
    loadInternAssignments();
  }, [facultyId, selectedYear, selectedSemester, selectedDept, selectedField]);

  const loadInternAssignments = async () => {
    setLoading(true);
    const res = await apiClient.getInternshipMentorAssignments({
      facultyId,
      academicYear: selectedYear || undefined,
      semester: selectedSemester ? parseInt(selectedSemester, 10) : undefined,
      department: selectedDept || undefined,
      field: selectedField || undefined,
    });

    if (res?.assignments) {
      setAssignments(res.assignments);
    }
    setLoading(false);
  };

  const filteredList = assignments.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      (a.studentName || "").toLowerCase().includes(q) ||
      (a.studentRollNo || "").toLowerCase().includes(q) ||
      (a.companyName || "").toLowerCase().includes(q) ||
      (a.internshipTitle || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-[#1A3C6E] via-[#122A4E] to-[#0A182E] p-6 text-white shadow-xl shadow-[#1A3C6E]/20">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 size-48 rounded-full bg-[#F2A93B]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[#F2A93B]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#F2A93B]">
                <Briefcase className="size-3" /> GSFC Industry Internship Mentorship
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
                Live Supabase Master Data
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black text-white">
              {user?.name || "Internship Faculty Mentor"}
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Oversee assigned student interns, verify company check-ins, and review internship deliverables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase text-[#F2A93B]">Assigned Interns</p>
              <p className="mt-0.5 font-display text-2xl font-black text-white">{assignments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Internship Mentorship Workspace: Professional Left Sidebar + Active Module Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-6 items-start">
        {/* Left Sidebar Navigation */}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-display text-xs font-black uppercase tracking-wider text-foreground">
                  Internship Hub
                </h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Industry & Academic Guide</p>
              </div>
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" title="Supabase Live" />
            </div>

            {/* Quick Filter Info */}
            <nav className="space-y-1 text-xs">
              <p className="px-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 mb-1">
                Mentorship Scope
              </p>

              <div className="flex w-full items-center justify-between rounded-xl bg-[#1A3C6E] text-white px-3 py-2 text-xs font-bold shadow-md shadow-[#1A3C6E]/20">
                <span className="flex items-center gap-2">
                  <Briefcase className="size-4 text-[#F2A93B]" />
                  <span>Assigned Interns</span>
                </span>
                <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-black text-white">
                  {assignments.length}
                </span>
              </div>
            </nav>

            {/* Active Mentor Info Card */}
            <div className="mt-auto space-y-2 rounded-2xl border border-border/60 bg-muted/40 p-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-bold">Total Assigned</span>
                <span className="font-display font-black text-[#1A3C6E] dark:text-[#F2A93B]">{assignments.length}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-bold">Active Cohort</span>
                <span className="font-mono text-[10px] font-bold text-emerald-600">2025-2026</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Active Module Area */}
        <div className="min-w-0 space-y-6">
          {/* Dynamic Master-Data Filter Bar */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-brand" />
          <h3 className="font-display text-sm font-bold text-foreground">
            Filter by Supabase Master Data (Academic Year, Semester, Department, Field)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* 1. Academic Year */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
            >
              <option value="">All Academic Years</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.yearName}>
                  {ay.yearName} {ay.isCurrent ? "(Current)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Semester */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Department */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Field */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground">Field / Specialization</label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
            >
              <option value="">All Fields</option>
              {fields.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interns Table */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-black text-foreground">Assigned Student Interns</h3>
            <p className="text-xs text-muted-foreground">Loaded dynamically from Supabase based on your selected academic criteria</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search intern, roll no, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs rounded-xl h-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent mx-auto" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground rounded-2xl border border-dashed">
            <Briefcase className="mx-auto size-8 mb-2 opacity-50" />
            <p className="font-semibold text-sm">No Student Interns Found</p>
            <p className="text-xs mt-1">Try adjusting the Academic Year, Semester, or Field filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-bold">
                  <th className="pb-3 pl-2">Intern Name</th>
                  <th className="pb-3">Roll Number</th>
                  <th className="pb-3">Internship Title & Organization</th>
                  <th className="pb-3">Semester & Field</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredList.map((intern) => (
                  <tr key={intern.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 pl-2 font-bold text-foreground">
                      {intern.studentName || intern.studentId}
                    </td>
                    <td className="py-3 font-mono">{intern.studentRollNo || intern.studentId}</td>
                    <td className="py-3">
                      <p className="font-semibold text-foreground">{intern.internshipTitle || "Industry Internship"}</p>
                      <p className="text-[10px] text-muted-foreground">{intern.companyName || "GSFC Ltd Partner"}</p>
                    </td>
                    <td className="py-3">
                      <p>Sem {intern.semester} · {intern.department}</p>
                      <p className="text-[10px] text-muted-foreground">{intern.field || "General"}</p>
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        {intern.status}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedStudentForHistory(intern.studentRollNo || intern.studentId)}
                        className="h-7 rounded-xl text-xs gap-1 font-bold"
                      >
                        <Eye className="size-3" /> Full 360° Record
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </div>
      </div>

      {/* Full 360 Student History Modal */}
      {selectedStudentForHistory && (
        <UnifiedStudentHistoryModal
          studentId={selectedStudentForHistory}
          isOpen={Boolean(selectedStudentForHistory)}
          onClose={() => setSelectedStudentForHistory(null)}
        />
      )}
    </div>
  );
}
