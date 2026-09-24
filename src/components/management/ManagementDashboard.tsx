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
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Key,
  Shield,
  Sliders,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { CampusState, INITIAL_NEW_STUDENTS } from "@/lib/campus-store";
import {
  FacultyMentorAssignment,
  FacultyRecord,
  ManagementAuditLog,
  ManagementKPIs,
  NewRegisteredStudent,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { MasterDataManager } from "./MasterDataManager";
import { MentorAssignmentModal } from "./MentorAssignmentModal";
import { Faculty360Modal } from "./Faculty360Modal";
import { UnifiedStudentHistoryModal } from "../mentorship/UnifiedStudentHistoryModal";
import { PeopleAccessView } from "./PeopleAccessView";
import { RolesPermissionsMatrixView } from "./RolesPermissionsMatrixView";
import { TaskControlCenterView } from "./TaskControlCenterView";
import { FacultyWorkloadView } from "./FacultyWorkloadView";
import { SystemDataDirectoryView } from "./SystemDataDirectoryView";
import { ManagementReportsView } from "./ManagementReportsView";
import { AuditActivityView } from "./AuditActivityView";
import { toast } from "sonner";

interface ManagementDashboardProps {
  state: CampusState;
}

type ManagementTab =
  | "overview"
  | "people"
  | "roles"
  | "faculty"
  | "students"
  | "assignments"
  | "tasks"
  | "workload"
  | "directory"
  | "reports"
  | "audit"
  | "masterdata";

export function ManagementDashboard({ state }: ManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState<ManagementTab>("overview");

  // Real Database KPIs (NO hardcoded numbers or fake defaults)
  const [kpis, setKpis] = useState<ManagementKPIs | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Real Database Lists
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>([]);
  const [assignments, setAssignments] = useState<FacultyMentorAssignment[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<ManagementAuditLog[]>([]);

  // Search queries & filters
  const [studentSearch, setStudentSearch] = useState("");
  const [facultySearch, setFacultySearch] = useState("");
  const [studentDeptFilter, setStudentDeptFilter] = useState("all");
  const [facultyDeptFilter, setFacultyDeptFilter] = useState("all");

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState<string | undefined>(undefined);
  const [selectedFacultyForAssign, setSelectedFacultyForAssign] = useState<string | undefined>(undefined);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<string | null>(null);
  const [selectedFacultyFor360, setSelectedFacultyFor360] = useState<string | null>(null);

  const registeredStudents =
    state?.newRegisteredStudents && state.newRegisteredStudents.length > 0
      ? state.newRegisteredStudents
      : INITIAL_NEW_STUDENTS;
  const currentUser = {
    id: state?.currentUser?.id || "u-management",
    name: state?.currentUser?.name || "Management Executive",
    role: state?.currentRole || "management",
  };

  useEffect(() => {
    loadManagementData();
  }, []);

  const loadManagementData = async () => {
    setLoading(true);
    setDbError(null);

    try {
      const [kpiRes, facRes, fmaRes, logsRes] = await Promise.all([
        apiClient.getManagementKPIs(),
        apiClient.getManagementFaculty(),
        apiClient.getFacultyMentorAssignments({}),
        apiClient.getManagementAuditLogs({ limit: 8 }),
      ]);

      if (kpiRes?.success && kpiRes.kpis) {
        setKpis(kpiRes.kpis);
      } else {
        setDbError(kpiRes?.error || "Failed to query live management KPIs from Supabase.");
      }

      if (facRes?.success && facRes.faculty) {
        setFacultyList(facRes.faculty);
      }
      if (fmaRes?.assignments) {
        setAssignments(fmaRes.assignments);
      }
      if (logsRes?.success && logsRes.logs) {
        setRecentAuditLogs(logsRes.logs);
      }
    } catch (err: any) {
      setDbError(err?.message || "Critical error connecting to institutional database.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = (studentId?: string, facultyId?: string) => {
    setSelectedStudentForAssign(studentId);
    setSelectedFacultyForAssign(facultyId);
    setShowAssignModal(true);
  };

  // Filtered lists
  const filteredStudents = registeredStudents.filter((s) => {
    const q = studentSearch.toLowerCase();
    const matchQuery =
      (s.fullName || "").toLowerCase().includes(q) ||
      (s.rollNo || "").toLowerCase().includes(q) ||
      (s.department || "").toLowerCase().includes(q);
    const matchDept = studentDeptFilter === "all" || s.department === studentDeptFilter;
    return matchQuery && matchDept;
  });

  const filteredFaculty = facultyList.filter((f) => {
    const q = facultySearch.toLowerCase();
    const matchQuery =
      (f.name || "").toLowerCase().includes(q) ||
      (f.email || "").toLowerCase().includes(q) ||
      (f.department || "").toLowerCase().includes(q) ||
      (f.designation || "").toLowerCase().includes(q);
    const matchDept = facultyDeptFilter === "all" || f.department === facultyDeptFilter;
    return matchQuery && matchDept;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Management Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-[#1A3C6E] via-[#122A4E] to-[#0A182E] p-6 text-white shadow-xl shadow-[#1A3C6E]/20">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 size-56 rounded-full bg-[#F2A93B]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[#F2A93B]/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#F2A93B]">
                <ShieldCheck className="size-3" /> GSFC University System Management
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                Live Supabase Governance Center
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black text-white">
              Institutional Governance & System Control Center
            </h2>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl">
              Highest-level university administration module: complete oversight of students, faculty rosters, mentor allocations, granular RBAC permissions, task control, data schemas, and audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => handleOpenAssignModal()}
              className="h-10 rounded-2xl bg-gradient-to-r from-[#F2A93B] to-amber-500 font-display text-xs font-black text-slate-950 shadow-lg hover:brightness-105 gap-1.5"
            >
              <UserPlus className="size-4 text-slate-950" /> Allocate Mentors
            </Button>
            <Button
              variant="outline"
              onClick={loadManagementData}
              className="h-10 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-bold gap-1.5 backdrop-blur-md"
            >
              <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Sync System
            </Button>
          </div>
        </div>
      </div>

      {/* Database Error Banner if query failed */}
      {dbError && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-5 shrink-0" />
            <div>
              <p className="font-bold">Database Connection Error</p>
              <p className="text-[11px] opacity-90">{dbError}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadManagementData}
            className="rounded-xl h-8 text-xs font-bold border-destructive/40"
          >
            Retry DB Query
          </Button>
        </div>
      )}

      {/* Main Governance Workspace: Professional Left Sidebar + Active Module Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-6 items-start">
        {/* ========================================================================= */}
        {/* PROFESSIONAL LEFT SIDEBAR MODULE NAVIGATION                               */}
        {/* ========================================================================= */}
        <aside className="space-y-4">
          {/* Mobile Module Selector (Visible on < lg screens) */}
          <div className="lg:hidden rounded-2xl border border-border/80 bg-card p-3 shadow-sm">
            <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">
              Select Governance Module
            </label>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as ManagementTab)}
              className="w-full h-10 rounded-xl border border-border/80 bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-[#1A3C6E]"
            >
              <optgroup label="Governance & Core">
                <option value="overview">📊 Institutional Overview</option>
                <option value="directory">🗄️ System Data Directory</option>
              </optgroup>
              <optgroup label="Identity & Access Control">
                <option value="people">👥 People & Access Control</option>
                <option value="roles">🛡️ Roles & Permissions Matrix</option>
              </optgroup>
              <optgroup label="Academic & Mentorship">
                <option value="faculty">🏛️ Faculty Master ({facultyList.length})</option>
                <option value="students">🎓 Student Master ({registeredStudents.length})</option>
                <option value="assignments">📖 Mentor Allocations ({assignments.length})</option>
                <option value="workload">📈 Faculty Workload & Capacity</option>
                <option value="tasks">📋 Task Control Center</option>
              </optgroup>
              <optgroup label="System & Audit">
                <option value="reports">📑 Management Reports</option>
                <option value="audit">⏱️ Audit Activity Trail</option>
                <option value="masterdata">⚙️ Master Data Schema</option>
              </optgroup>
            </select>
          </div>

          {/* Desktop Left Sidebar Card (Visible on lg+ screens) */}
          <div className="hidden lg:flex flex-col rounded-3xl border border-border/80 bg-card p-4 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-display text-xs font-black uppercase tracking-wider text-foreground">
                  Governance Hub
                </h3>
                <p className="text-[10px] text-muted-foreground font-semibold">12 Core System Modules</p>
              </div>
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" title="Supabase Live" />
            </div>

            {/* Sidebar Module Navigation List */}
            <nav className="space-y-4 text-xs">
              {/* Group 1: Governance & Core */}
              <div className="space-y-1">
                <p className="px-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                  Core & Metrics
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                    activeTab === "overview"
                      ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Layers className={cn("size-4", activeTab === "overview" ? "text-[#F2A93B]" : "text-slate-400")} />
                    <span>Overview</span>
                  </span>
                  {activeTab === "overview" && (
                    <span className="size-1.5 rounded-full bg-[#F2A93B]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("directory")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                    activeTab === "directory"
                      ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Database className={cn("size-4", activeTab === "directory" ? "text-blue-400" : "text-slate-400")} />
                    <span>Data Directory</span>
                  </span>
                  <span className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-black",
                    activeTab === "directory" ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  )}>
                    Live DB
                  </span>
                </button>
              </div>

              {/* Group 2: Access & RBAC */}
              <div className="space-y-1">
                <p className="px-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                  Access & RBAC
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("people")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                    activeTab === "people"
                      ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Users className={cn("size-4", activeTab === "people" ? "text-[#F2A93B]" : "text-slate-400")} />
                    <span>People & Access</span>
                  </span>
                  <span className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-black",
                    activeTab === "people" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    RBAC
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("roles")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                    activeTab === "roles"
                      ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Shield className={cn("size-4", activeTab === "roles" ? "text-[#F2A93B]" : "text-slate-400")} />
                    <span>Roles Matrix</span>
                  </span>
                </button>
              </div>

              {/* Group 3: Academic & Mentorship */}
              <div className="space-y-1">
                <p className="px-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                  Academic & Cohorts
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("faculty")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                    activeTab === "faculty"
                      ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className={cn("size-4", activeTab === "faculty" ? "text-[#F2A93B]" : "text-slate-400")} />
                    <span>Faculty Master</span>
                  </span>
                  <span className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-black",
                    activeTab === "faculty" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground font-mono"
                  )}>
                    {facultyList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("students")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                    activeTab === "students"
                      ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className={cn("size-4", activeTab === "students" ? "text-[#F2A93B]" : "text-slate-400")} />
                    <span>Student Master</span>
                  </span>
                  <span className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-black",
                    activeTab === "students" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground font-mono"
                  )}>
                    {registeredStudents.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("assignments")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                    activeTab === "assignments"
                      ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className={cn("size-4", activeTab === "assignments" ? "text-[#F2A93B]" : "text-amber-500")} />
                    <span>Mentor Allocations</span>
                  </span>
                  <span className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-black",
                    activeTab === "assignments" ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-600 font-mono"
                  )}>
                    {assignments.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("workload")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                    activeTab === "workload"
                      ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className={cn("size-4", activeTab === "workload" ? "text-[#F2A93B]" : "text-slate-400")} />
                    <span>Faculty Workload</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("tasks")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                    activeTab === "tasks"
                      ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <FileText className={cn("size-4", activeTab === "tasks" ? "text-[#F2A93B]" : "text-slate-400")} />
                    <span>Task Control</span>
                  </span>
                </button>
              </div>

              {/* Group 4: Reports & Auditing */}
              <div className="space-y-1">
                <p className="px-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                  Reports & Audits
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("reports")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                    activeTab === "reports"
                      ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className={cn("size-4", activeTab === "reports" ? "text-emerald-400" : "text-slate-400")} />
                    <span>System Reports</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("audit")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                    activeTab === "audit"
                      ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className={cn("size-4", activeTab === "audit" ? "text-amber-400" : "text-slate-400")} />
                    <span>Audit Trail</span>
                  </span>
                  <span className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-black",
                    activeTab === "audit" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    Logs
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("masterdata")}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                    activeTab === "masterdata"
                      ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Sliders className={cn("size-4", activeTab === "masterdata" ? "text-[#F2A93B]" : "text-slate-400")} />
                    <span>Master Data</span>
                  </span>
                </button>
              </div>
            </nav>

            {/* Sidebar Bottom Action / Info */}
            <div className="border-t border-border/60 pt-3 space-y-2">
              <Button
                size="sm"
                onClick={() => handleOpenAssignModal()}
                className="w-full h-8 rounded-xl bg-gradient-to-r from-[#F2A93B] to-amber-500 font-display text-[11px] font-black text-slate-950 shadow-sm hover:brightness-105 gap-1"
              >
                <UserPlus className="size-3.5" /> Allocate Mentors
              </Button>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* ACTIVE MODULE MAIN CONTENT AREA                                           */}
        {/* ========================================================================= */}
        <div className="min-w-0 space-y-6">
          {/* ========================================================================= */}
          {/* 1. OVERVIEW TAB: Live Database KPI Grid + Recent Activity                  */}
          {/* ========================================================================= */}
          {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Real Database KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Total Students */}
            <div
              onClick={() => setActiveTab("students")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Students</span>
                <GraduationCap className="size-4 text-brand group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-foreground">{kpis ? kpis.totalStudents : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Enrolled Scholars</p>
            </div>

            {/* Total Faculty */}
            <div
              onClick={() => setActiveTab("faculty")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Faculty</span>
                <Building2 className="size-4 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-foreground">{kpis ? kpis.totalFaculty : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Teaching Faculty</p>
            </div>

            {/* Faculty Mentors */}
            <div
              onClick={() => setActiveTab("assignments")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Faculty Mentors</span>
                <Users className="size-4 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-foreground">{kpis ? kpis.facultyMentorsCount : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Active Academic Guides</p>
            </div>

            {/* Internship Mentors */}
            <div
              onClick={() => setActiveTab("faculty")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Intern Mentors</span>
                <UserCheck className="size-4 text-teal-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-foreground">{kpis ? kpis.internshipMentorsCount : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Industry Supervisors</p>
            </div>

            {/* Administrators */}
            <div
              onClick={() => setActiveTab("people")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Administrators</span>
                <ShieldCheck className="size-4 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-foreground">{kpis ? kpis.administratorsCount : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Dean & Governance</p>
            </div>

            {/* Active Internships */}
            <div
              onClick={() => setActiveTab("reports")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Internships</span>
                <Briefcase className="size-4 text-[#F2A93B] group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-foreground">{kpis ? kpis.totalInternships : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Corporate Listings</p>
            </div>

            {/* Internship Applications */}
            <div
              onClick={() => setActiveTab("reports")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Applications</span>
                <BookOpen className="size-4 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-foreground">{kpis ? kpis.totalApplications : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Student Submissions</p>
            </div>

            {/* Active Interns */}
            <div
              onClick={() => setActiveTab("reports")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Interns</span>
                <CheckCircle2 className="size-4 text-emerald-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-emerald-600">{kpis ? kpis.activeInterns : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Working at Plants</p>
            </div>

            {/* Completed Internships */}
            <div
              onClick={() => setActiveTab("reports")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed</span>
                <Award className="size-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-foreground">{kpis ? kpis.completedInternships : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Certificates Issued</p>
            </div>

            {/* Active Mentor Allocations */}
            <div
              onClick={() => setActiveTab("assignments")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mentor Allocations</span>
                <CheckCircle2 className="size-4 text-emerald-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-foreground">{kpis ? kpis.activeMentorAssignments : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Assigned Cohorts</p>
            </div>

            {/* Unassigned Students */}
            <div
              onClick={() => setActiveTab("students")}
              className="cursor-pointer rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5 hover:border-amber-500 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Unassigned</span>
                <AlertCircle className="size-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-amber-600">{kpis ? kpis.unassignedStudentsCount : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Needs Mentor Allocation</p>
            </div>

            {/* Pending Approvals */}
            <div
              onClick={() => setActiveTab("reports")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending Approvals</span>
                <Clock className="size-4 text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-amber-600">{kpis ? kpis.pendingApprovals : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Dean & TPC Reviews</p>
            </div>

            {/* Pending Tasks */}
            <div
              onClick={() => setActiveTab("tasks")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending Tasks</span>
                <FileText className="size-4 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-blue-600">{kpis ? kpis.pendingTasks : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Active Academic Tasks</p>
            </div>

            {/* Unread Messages */}
            <div
              onClick={() => setActiveTab("tasks")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Unread Messages</span>
                <Clock className="size-4 text-purple-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-purple-600">{kpis ? kpis.unreadMessages : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Mentorship Channels</p>
            </div>

            {/* Attendance Alerts */}
            <div
              onClick={() => setActiveTab("reports")}
              className="cursor-pointer rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Attendance Alerts</span>
                <ShieldAlert className="size-4 text-red-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-1 text-2xl font-black text-red-600">{kpis ? kpis.attendanceAlertsCount : "—"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">&lt; 75% Attendance</p>
            </div>
          </div>

          {/* Quick Overview Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Unassigned Students Allocation Action List */}
            <div className="lg:col-span-2 rounded-3xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
                    <UserPlus className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-black text-foreground">
                      Students Requiring Mentor Allocation ({registeredStudents.filter((s) => !assignments.some((a) => a.studentId === s.id || a.studentId === s.rollNo)).length})
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Unassigned candidates ready for semester cohort allocation</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleOpenAssignModal()}
                  className="rounded-xl h-8 text-xs font-bold bg-[#1A3C6E] text-white"
                >
                  Allocate Mentors
                </Button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {registeredStudents
                  .filter((s) => !assignments.some((a) => a.studentId === s.id || a.studentId === s.rollNo))
                  .map((stu) => (
                    <div
                      key={stu.id}
                      className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-brand/10 font-bold text-xs text-brand">
                          {(stu.fullName || "ST").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-foreground">{stu.fullName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {stu.rollNo} · {stu.department} · Sem {stu.semester}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedStudentForHistory(stu.id)}
                          className="h-7 rounded-xl text-[10px] font-bold"
                        >
                          <Eye className="mr-1 size-3" /> 360°
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenAssignModal(stu.id)}
                          className="h-7 rounded-xl text-[10px] font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                        >
                          Assign Mentor
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent System Activity Log Card */}
            <div className="rounded-3xl border border-border/80 bg-card p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="font-display text-sm font-black text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-500" /> Recent System Activity
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("audit")}
                    className="h-7 text-[10px] font-bold"
                  >
                    View All
                  </Button>
                </div>

                <div className="mt-3 space-y-3">
                  {recentAuditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="rounded-xl border border-border/40 bg-muted/20 p-2.5 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded">
                          {log.action}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{log.details || "Administrative update logged"}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 text-[10px] text-muted-foreground text-center">
                All activities written immutably to <span className="font-mono text-brand">management_audit_logs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PEOPLE & ACCESS CONTROL TAB                                            */}
      {/* ========================================================================= */}
      {activeTab === "people" && (
        <PeopleAccessView currentUser={currentUser} />
      )}

      {/* ========================================================================= */}
      {/* 3. ROLES & PERMISSIONS MATRIX TAB                                         */}
      {/* ========================================================================= */}
      {activeTab === "roles" && (
        <RolesPermissionsMatrixView />
      )}

      {/* ========================================================================= */}
      {/* 4. FACULTY MASTER TAB                                                     */}
      {/* ========================================================================= */}
      {activeTab === "faculty" && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search faculty name, official email, or designation..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                className="pl-9 rounded-2xl h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={facultyDeptFilter}
                onChange={(e) => setFacultyDeptFilter(e.target.value)}
                className="rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-brand"
              >
                <option value="all">All Departments</option>
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Chemical & Petrochemical Eng">Chemical Eng</option>
                <option value="School of Management">School of Management</option>
                <option value="Mechanical & Automation Eng">Mechanical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredFaculty.map((fac) => (
              <div
                key={fac.id}
                className="rounded-3xl border border-border/80 bg-card p-5 hover:border-brand/50 transition-all flex flex-col justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] text-[#F2A93B] font-bold text-sm">
                      {fac.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                      Active
                    </span>
                  </div>

                  <h4 className="font-display text-sm font-black text-foreground mt-3">{fac.name}</h4>
                  <p className="text-xs text-muted-foreground font-semibold">{fac.designation}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{fac.department}</p>
                  <p className="font-mono text-[10px] text-brand/80 mt-1">{fac.email}</p>

                  <div className="grid grid-cols-2 gap-2 pt-3 mt-3 border-t border-border/40 text-[10px]">
                    <div className="rounded-xl bg-muted/40 p-2 text-center">
                      <p className="text-muted-foreground">Assigned Mentees</p>
                      <p className="font-mono text-sm font-bold text-foreground">{fac.assignedStudentCount}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-2 text-center">
                      <p className="text-muted-foreground">Active Tasks</p>
                      <p className="font-mono text-sm font-bold text-foreground">{fac.activeTasks}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenAssignModal(undefined, fac.id)}
                    className="h-7 text-[10px] font-bold rounded-xl"
                  >
                    Allocate Student
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setSelectedFacultyFor360(fac.id)}
                    className="h-7 text-[10px] font-bold rounded-xl bg-[#1A3C6E] text-white"
                  >
                    Open Faculty 360°
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STUDENT MASTER TAB                                                     */}
      {/* ========================================================================= */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search student by name, roll number, or department..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9 rounded-2xl h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={studentDeptFilter}
                onChange={(e) => setStudentDeptFilter(e.target.value)}
                className="rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-brand"
              >
                <option value="all">All Departments</option>
                <option value="Computer Science & Engineering">CSE</option>
                <option value="Chemical & Petrochemical Eng">Chemical Eng</option>
                <option value="School of Management">School of Management</option>
                <option value="Mechanical & Automation Eng">Mechanical</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border/60">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-3 py-3">Roll Number</th>
                    <th className="px-3 py-3">Department & Semester</th>
                    <th className="px-3 py-3">Faculty Mentor</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium">
                  {filteredStudents.map((stu) => {
                    const mentorAssign = assignments.find((a) => (a.studentId === stu.id || a.studentId === stu.rollNo) && a.status === "active");
                    return (
                      <tr key={stu.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-foreground">{stu.fullName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{stu.email}</p>
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-brand">{stu.rollNo}</td>
                        <td className="px-3 py-3">
                          <p className="text-foreground">{stu.department}</p>
                          <p className="text-[10px] text-muted-foreground">Semester {stu.semester}</p>
                        </td>
                        <td className="px-3 py-3">
                          {mentorAssign ? (
                            <span className="font-semibold text-foreground">
                              {mentorAssign.facultyName || mentorAssign.facultyId}
                            </span>
                          ) : (
                            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                            Enrolled
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedStudentForHistory(stu.id)}
                              className="h-7 text-[10px] font-bold rounded-xl"
                            >
                              <Eye className="mr-1 size-3" /> Student 360°
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleOpenAssignModal(stu.id)}
                              className="h-7 text-[10px] font-bold rounded-xl bg-[#1A3C6E] text-white"
                            >
                              {mentorAssign ? "Reassign" : "Assign Mentor"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MENTOR ALLOCATIONS TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-black text-foreground">
              Official Faculty Mentor Allocations ({assignments.length})
            </h3>
            <Button
              size="sm"
              onClick={() => handleOpenAssignModal()}
              className="rounded-xl h-8 text-xs font-bold bg-gradient-to-r from-[#F2A93B] to-amber-500 text-slate-950"
            >
              <UserPlus className="mr-1 size-3.5" /> Allocate New Mentor
            </Button>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border/60">
                  <tr>
                    <th className="px-4 py-3">Faculty Mentor</th>
                    <th className="px-3 py-3">Assigned Student</th>
                    <th className="px-3 py-3">Department & Field</th>
                    <th className="px-3 py-3">Academic Term</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-foreground">{a.facultyName || a.facultyId}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{a.facultyEmail || a.facultyId}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-bold text-foreground">{a.studentName || a.studentRollNo || a.studentId}</p>
                        <p className="text-[10px] text-brand font-mono font-bold">{a.studentRollNo || a.studentId}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-foreground">{a.department}</p>
                        <p className="text-[10px] text-amber-600 font-semibold">{a.field || "General Focus"}</p>
                      </td>
                      <td className="px-3 py-3 font-mono text-muted-foreground">
                        {a.academicYear} · Sem {a.semester}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenAssignModal(a.studentId, a.facultyId)}
                          className="h-7 text-[10px] font-bold rounded-xl"
                        >
                          Modify / Reassign
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TASK CONTROL CENTER TAB                                                */}
      {/* ========================================================================= */}
      {activeTab === "tasks" && (
        <TaskControlCenterView />
      )}

      {/* ========================================================================= */}
      {/* 8. FACULTY WORKLOAD TAB                                                   */}
      {/* ========================================================================= */}
      {activeTab === "workload" && (
        <FacultyWorkloadView />
      )}

      {/* ========================================================================= */}
      {/* 9. DATA DIRECTORY TAB                                                     */}
      {/* ========================================================================= */}
      {activeTab === "directory" && (
        <SystemDataDirectoryView />
      )}

      {/* ========================================================================= */}
      {/* 10. MANAGEMENT REPORTS TAB                                                */}
      {/* ========================================================================= */}
      {activeTab === "reports" && (
        <ManagementReportsView />
      )}

      {/* ========================================================================= */}
      {/* 11. AUDIT & ACTIVITY TAB                                                  */}
      {/* ========================================================================= */}
      {activeTab === "audit" && (
        <AuditActivityView />
      )}

      {/* ========================================================================= */}
      {/* 12. MASTER DATA TAB                                                       */}
      {/* ========================================================================= */}
      {activeTab === "masterdata" && (
        <MasterDataManager />
      )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GLOBAL MODALS                                                             */}
      {/* ========================================================================= */}

      {/* Mentor Assignment Modal */}
      {showAssignModal && (
        <MentorAssignmentModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedStudentForAssign(undefined);
            setSelectedFacultyForAssign(undefined);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            loadManagementData();
          }}
          students={registeredStudents}
          facultyList={facultyList}
          initialStudentId={selectedStudentForAssign}
          initialFacultyId={selectedFacultyForAssign}
        />
      )}

      {/* Faculty 360 Modal */}
      {selectedFacultyFor360 && (
        <Faculty360Modal
          facultyId={selectedFacultyFor360}
          isOpen={Boolean(selectedFacultyFor360)}
          onClose={() => setSelectedFacultyFor360(null)}
          onOpenStudent360={(stuId) => setSelectedStudentForHistory(stuId)}
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
