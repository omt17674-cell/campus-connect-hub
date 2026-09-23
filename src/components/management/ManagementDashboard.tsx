import { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  GraduationCap,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { CampusState, campusStore } from "@/lib/campus-store";
import { FacultyMentorAssignment, NewRegisteredStudent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MasterDataManager } from "./MasterDataManager";
import { MentorAssignmentModal } from "./MentorAssignmentModal";
import { UnifiedStudentHistoryModal } from "../mentorship/UnifiedStudentHistoryModal";
import { toast } from "sonner";

interface ManagementDashboardProps {
  state: CampusState;
}

export function ManagementDashboard({ state }: ManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "faculty" | "assignments" | "masterdata">("overview");

  const [kpis, setKpis] = useState<any>({
    totalStudents: 142,
    totalFaculty: 18,
    facultyMentorsCount: 12,
    internshipMentorsCount: 8,
    totalInternships: 24,
    totalApplications: 68,
    activeInterns: 19,
    completedInternships: 32,
    activeMentorAssignments: 95,
    unassignedStudentsCount: 47,
    pendingApprovals: 6,
    attendanceAlertsCount: 3,
  });

  const [assignments, setAssignments] = useState<FacultyMentorAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Search queries
  const [studentSearch, setStudentSearch] = useState("");
  const [facultySearch, setFacultySearch] = useState("");

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<string | null>(null);

  const registeredStudents = state?.newRegisteredStudents || [];

  // Faculty list derived from accounts and campus state
  const facultyList = [
    { id: "u-tpc", name: "Prof. Rajiv Mehta", department: "Training & Placement Cell / Event Convener", email: "tpc.admin@gsfcuniversity.ac.in", designation: "Associate Professor" },
    { id: "u-ananya", name: "Dr. Ananya Sharma", department: "Student Affairs & Academic Governance", email: "admin.dean@gsfcuniversity.ac.in", designation: "Dean & Academic Head" },
    { id: "fac-1", name: "Dr. K. N. Joshi", department: "Computer Science & Engineering", email: "kn.joshi@gsfcuniversity.ac.in", designation: "Professor & HOD" },
    { id: "fac-2", name: "Prof. Sneha Dave", department: "Chemical & Petrochemical Eng", email: "sneha.dave@gsfcuniversity.ac.in", designation: "Assistant Professor" },
    { id: "fac-3", name: "Dr. Amit Trivedi", department: "School of Management", email: "amit.trivedi@gsfcuniversity.ac.in", designation: "Associate Professor" },
  ];

  useEffect(() => {
    loadManagementData();
  }, []);

  const loadManagementData = async () => {
    setLoading(true);
    const [kpiRes, fmaRes] = await Promise.all([
      apiClient.getManagementKPIs(),
      apiClient.getFacultyMentorAssignments({}),
    ]);

    if (kpiRes?.kpis) {
      setKpis(kpiRes.kpis);
    }
    if (fmaRes?.assignments) {
      setAssignments(fmaRes.assignments);
    }
    setLoading(false);
  };

  const filteredStudents = registeredStudents.filter((s) => {
    const q = studentSearch.toLowerCase();
    return (
      (s.fullName || "").toLowerCase().includes(q) ||
      (s.rollNo || "").toLowerCase().includes(q) ||
      (s.department || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Management Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-[#1A3C6E] via-[#122A4E] to-[#0A182E] p-6 text-white shadow-xl shadow-[#1A3C6E]/20">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 size-48 rounded-full bg-[#F2A93B]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[#F2A93B]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#F2A93B]">
                <ShieldCheck className="size-3" /> GSFC University Executive Management
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
                Live Governance System
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black text-white">
              Institutional Management Portal
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Institutional KPIs, faculty mentorship allocation, internship governance, and database master data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAssignModal(true)}
              className="h-10 rounded-2xl bg-gradient-to-r from-[#F2A93B] to-amber-500 font-display text-xs font-black text-slate-950 shadow-lg hover:brightness-105 gap-1.5"
            >
              <UserPlus className="size-4 text-slate-950" /> Allocate Mentors
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border/60 pb-3 overflow-x-auto text-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "rounded-2xl text-xs font-bold px-4 h-9",
            activeTab === "overview" ? "bg-[#1A3C6E] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingUp className="mr-1.5 size-3.5" /> Management Overview
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("students")}
          className={cn(
            "rounded-2xl text-xs font-bold px-4 h-9",
            activeTab === "students" ? "bg-[#1A3C6E] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GraduationCap className="mr-1.5 size-3.5" /> Student Master ({registeredStudents.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("faculty")}
          className={cn(
            "rounded-2xl text-xs font-bold px-4 h-9",
            activeTab === "faculty" ? "bg-[#1A3C6E] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UserCheck className="mr-1.5 size-3.5" /> Faculty Master ({facultyList.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("assignments")}
          className={cn(
            "rounded-2xl text-xs font-bold px-4 h-9",
            activeTab === "assignments" ? "bg-[#1A3C6E] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="mr-1.5 size-3.5" /> Mentor Assignments ({assignments.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("masterdata")}
          className={cn(
            "rounded-2xl text-xs font-bold px-4 h-9",
            activeTab === "masterdata" ? "bg-[#1A3C6E] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Database className="mr-1.5 size-3.5" /> Master Data System
        </Button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-muted-foreground">Total Students</p>
              <p className="mt-1 font-display text-2xl font-black text-foreground">{kpis.totalStudents}</p>
              <p className="text-[10px] text-muted-foreground">Enrolled Scholars</p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-muted-foreground">Faculty Body</p>
              <p className="mt-1 font-display text-2xl font-black text-foreground">{kpis.totalFaculty}</p>
              <p className="text-[10px] text-muted-foreground">Active Academicians</p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-[#F2A93B]">Faculty Mentors</p>
              <p className="mt-1 font-display text-2xl font-black text-[#F2A93B]">{kpis.facultyMentorsCount}</p>
              <p className="text-[10px] text-muted-foreground">Assigned Cohorts</p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-emerald-500">Active Interns</p>
              <p className="mt-1 font-display text-2xl font-black text-emerald-600 dark:text-emerald-400">{kpis.activeInterns}</p>
              <p className="text-[10px] text-muted-foreground">Industry Placed</p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-blue-500">Pending Approvals</p>
              <p className="mt-1 font-display text-2xl font-black text-blue-600 dark:text-blue-400">{kpis.pendingApprovals}</p>
              <p className="text-[10px] text-muted-foreground">Dean / TPC Review</p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-sm">
              <p className="text-[11px] font-bold text-amber-500">Unassigned</p>
              <p className="mt-1 font-display text-2xl font-black text-amber-600 dark:text-amber-400">{kpis.unassignedStudentsCount}</p>
              <p className="text-[10px] text-muted-foreground">Need Allocation</p>
            </div>
          </div>

          {/* Quick Management Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
              <h3 className="font-display text-base font-black text-foreground flex items-center gap-2">
                <Users className="size-4 text-brand" /> Mentorship Allocation Status
              </h3>
              <p className="text-xs text-muted-foreground">
                Current academic year allocations across School of Technology and School of Management.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Computer Science & Engineering</span>
                  <span className="font-bold text-emerald-600">92% Assigned</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "92%" }} />
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="font-semibold text-foreground">Chemical & Petrochemical Eng</span>
                  <span className="font-bold text-emerald-600">84% Assigned</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "84%" }} />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
              <h3 className="font-display text-base font-black text-foreground flex items-center gap-2">
                <Briefcase className="size-4 text-brand" /> Industry Internship Governance
              </h3>
              <p className="text-xs text-muted-foreground">
                Real-time tracking of student applications, Dean approvals, and industry partners.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-border/60 p-3 bg-card/40">
                  <span className="text-muted-foreground">Total Listings:</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">{kpis.totalInternships} Open Roles</p>
                </div>
                <div className="rounded-2xl border border-border/60 p-3 bg-card/40">
                  <span className="text-muted-foreground">Applications:</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">{kpis.totalApplications} Submitted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Student Master */}
      {activeTab === "students" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-black text-foreground">Student Master Registry</h3>
              <p className="text-xs text-muted-foreground">Authorized complete institutional student master database</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search student, roll no, department..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9 text-xs rounded-xl h-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-bold">
                  <th className="pb-3 pl-2">Student Name</th>
                  <th className="pb-3">Roll Number</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Semester</th>
                  <th className="pb-3">Verification</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 pl-2 font-bold text-foreground">{stu.fullName}</td>
                    <td className="py-3 font-mono">{stu.rollNo}</td>
                    <td className="py-3">{stu.department}</td>
                    <td className="py-3">Sem {stu.semester || 6}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        Verified
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedStudentForHistory(stu.rollNo || stu.id)}
                        className="h-7 rounded-xl text-xs gap-1 font-bold"
                      >
                        <Eye className="size-3" /> View 360° History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Faculty Master */}
      {activeTab === "faculty" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-black text-foreground">Faculty Master Registry</h3>
              <p className="text-xs text-muted-foreground">Institutional faculty records with assigned capability management</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-bold">
                  <th className="pb-3 pl-2">Faculty Name</th>
                  <th className="pb-3">Designation</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Capabilities</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {facultyList.map((fac) => (
                  <tr key={fac.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 pl-2">
                      <p className="font-bold text-foreground">{fac.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{fac.email}</p>
                    </td>
                    <td className="py-3">{fac.designation}</td>
                    <td className="py-3">{fac.department}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[9px] font-bold text-brand">
                          Faculty
                        </span>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                          Faculty Mentor
                        </span>
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-bold text-amber-600">
                          Internship Mentor
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAssignModal(true)}
                        className="h-7 rounded-xl text-xs gap-1 font-bold"
                      >
                        <UserPlus className="size-3" /> Assign Students
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Mentor Assignments */}
      {activeTab === "assignments" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-black text-foreground">Faculty Mentor Allocations</h3>
              <p className="text-xs text-muted-foreground">Active mentor-student mappings stored in Supabase database</p>
            </div>

            <Button
              size="sm"
              onClick={() => setShowAssignModal(true)}
              className="rounded-xl bg-[#1A3C6E] text-white text-xs font-bold gap-1.5 h-8.5 shadow-md"
            >
              <UserPlus className="size-3.5" /> Assign Mentors
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-bold">
                  <th className="pb-3 pl-2">Faculty Mentor</th>
                  <th className="pb-3">Student Mentee</th>
                  <th className="pb-3">Department & Semester</th>
                  <th className="pb-3">Academic Year</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 pl-2 font-bold text-foreground">
                      {a.facultyName || a.facultyId}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-foreground">{a.studentName || a.studentId}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{a.studentRollNo || a.studentId}</p>
                    </td>
                    <td className="py-3">{a.department} (Sem {a.semester})</td>
                    <td className="py-3">{a.academicYear}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedStudentForHistory(a.studentRollNo || a.studentId)}
                        className="h-7 rounded-xl text-xs gap-1 font-bold"
                      >
                        <Eye className="size-3" /> History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Master Data */}
      {activeTab === "masterdata" && <MasterDataManager />}

      {/* Mentor Assignment Modal */}
      {showAssignModal && (
        <MentorAssignmentModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onSuccess={loadManagementData}
          students={registeredStudents}
          facultyList={facultyList}
        />
      )}

      {/* Student 360 History Modal */}
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
