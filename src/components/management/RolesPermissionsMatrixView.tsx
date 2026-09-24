import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Key,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sliders,
  Sparkles,
  Info,
  Lock,
  UserCheck,
  UserPlus,
  Users,
  Search,
  Filter,
  GraduationCap,
  Building2,
  Briefcase,
  SlidersHorizontal,
  Eye,
  Check,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { GranularPermission, PermissionScope, UserRole } from "@/lib/types";
import { ManageAccessModal } from "./ManageAccessModal";
import { Faculty360Modal } from "./Faculty360Modal";
import { MentorAssignmentModal } from "./MentorAssignmentModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SYSTEM_ROLES: { role: UserRole; title: string; category: string }[] = [
  { role: "management", title: "Institutional Management", category: "Governance" },
  { role: "super_admin", title: "Super Admin", category: "Governance" },
  { role: "dean", title: "Dean of Academic Affairs", category: "Academic" },
  { role: "admin", title: "University Admin", category: "Administration" },
  { role: "tpc", title: "Training & Placement (TPC)", category: "Corporate" },
  { role: "faculty_mentor", title: "Faculty Mentor", category: "Mentorship" },
  { role: "internship_mentor", title: "Internship Mentor", category: "Mentorship" },
  { role: "faculty", title: "Faculty Member", category: "Academic" },
  { role: "organizer", title: "Event Organizer", category: "Campus" },
  { role: "student", title: "Student Scholar", category: "Student" },
  { role: "security", title: "Security Gate Officer", category: "Operations" },
];

const PERMISSIONS_LIST: { key: GranularPermission; name: string; category: string }[] = [
  { key: "VIEW_STUDENTS", name: "View Students", category: "Students" },
  { key: "EDIT_STUDENTS", name: "Edit Students", category: "Students" },
  { key: "VIEW_FACULTY", name: "View Faculty", category: "Faculty" },
  { key: "EDIT_FACULTY", name: "Edit Faculty", category: "Faculty" },
  { key: "ASSIGN_FACULTY_MENTOR", name: "Assign Faculty Mentor", category: "Mentorship" },
  { key: "ASSIGN_INTERNSHIP_MENTOR", name: "Assign Internship Mentor", category: "Mentorship" },
  { key: "VIEW_INTERNSHIPS", name: "View Internships", category: "Internships" },
  { key: "CREATE_INTERNSHIP", name: "Create Internship", category: "Internships" },
  { key: "EDIT_INTERNSHIP", name: "Edit Internship", category: "Internships" },
  { key: "APPROVE_INTERNSHIP", name: "Approve Internship", category: "Internships" },
  { key: "VIEW_ATTENDANCE", name: "View Attendance", category: "Attendance" },
  { key: "VIEW_INTERNSHIP_ATTENDANCE", name: "View Intern Attendance", category: "Attendance" },
  { key: "VIEW_MENTORSHIP", name: "View Mentorship", category: "Mentorship" },
  { key: "CREATE_MENTOR_TASK", name: "Create Mentor Task", category: "Mentorship" },
  { key: "SEND_MENTOR_MESSAGE", name: "Send Mentor Message", category: "Mentorship" },
  { key: "VIEW_REPORTS", name: "View Reports", category: "Reports" },
  { key: "EXPORT_REPORTS", name: "Export Reports", category: "Reports" },
  { key: "MANAGE_MASTER_DATA", name: "Manage Master Data", category: "System" },
  { key: "MANAGE_USERS", name: "Manage Users", category: "System" },
  { key: "MANAGE_ROLES", name: "Manage Roles", category: "System" },
  { key: "MANAGE_PERMISSIONS", name: "Manage Permissions", category: "System" },
  { key: "VIEW_AUDIT_LOGS", name: "View Audit Logs", category: "System" },
  { key: "MANAGE_SYSTEM_SETTINGS", name: "System Settings", category: "System" },
];

export function RolesPermissionsMatrixView() {
  const [viewMode, setViewMode] = useState<"faculty_access" | "system_matrix">("faculty_access");
  const [facultyMembers, setFacultyMembers] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Modals
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<any | null>(null);
  const [selectedFacultyIdFor360, setSelectedFacultyIdFor360] = useState<string | null>(null);
  const [selectedFacultyForAssign, setSelectedFacultyForAssign] = useState<string | null>(null);

  const currentUser = {
    id: "u-management",
    name: "Dr. S. K. Patel (Management Head)",
    role: "management" as UserRole,
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [facRes, permsRes, assignmentsRes] = await Promise.all([
      apiClient.getManagementFaculty(),
      apiClient.getRolesAndPermissions(),
      apiClient.getFacultyMentorAssignments({}),
    ]);

    if (facRes?.success && facRes.faculty) {
      const assignments = assignmentsRes?.assignments || [];
      const enriched = facRes.faculty.map((f: any) => {
        const assignedCount = assignments.filter((a: any) => a.facultyId === f.id || a.facultyEmail === f.email).length;
        return {
          ...f,
          activeRole: f.id === "u-ananya" ? "dean" : f.id === "u-tpc" ? "organizer" : f.id === "fac-2" ? "internship_mentor" : "faculty_mentor",
          menteeCount: assignedCount,
          permissions: f.id === "u-ananya" || f.id === "u-tpc"
            ? ["VIEW_STUDENTS", "EDIT_STUDENTS", "ASSIGN_FACULTY_MENTOR", "APPROVE_INTERNSHIP", "VIEW_ATTENDANCE", "VIEW_REPORTS"]
            : ["VIEW_STUDENTS", "VIEW_ATTENDANCE", "VIEW_MENTORSHIP", "CREATE_MENTOR_TASK", "SEND_MENTOR_MESSAGE"],
        };
      });
      setFacultyMembers(enriched);
    }

    if (permsRes?.success && permsRes.rolePermissions) {
      setRolePermissions(permsRes.rolePermissions);
    }
    setLoading(false);
  };

  const handleRoleQuickChange = async (facultyId: string, newRole: UserRole) => {
    const faculty = facultyMembers.find((f) => f.id === facultyId);
    if (!faculty) return;

    const updated = facultyMembers.map((f) => (f.id === facultyId ? { ...f, activeRole: newRole } : f));
    setFacultyMembers(updated);

    const res = await apiClient.updateUserAccess({
      userId: facultyId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      newRole,
      reason: `Assigned role ${newRole} from Faculty Access Matrix`,
    });

    if (res?.success) {
      toast.success(`Updated role for ${faculty.name} to "${newRole.replace("_", " ").toUpperCase()}"`);
    } else {
      toast.error("Failed to persist role change to database.");
    }
  };

  const getPermissionStatus = (role: UserRole, perm: GranularPermission): { has: boolean; scope: PermissionScope } => {
    const match = rolePermissions.find((rp) => rp.role === role && rp.permission === perm);
    if (match) {
      return { has: true, scope: match.scope || "global" };
    }
    if (role === "management" || role === "super_admin") {
      return { has: true, scope: "global" };
    }
    if (role === "dean" || role === "admin") {
      if (["VIEW_STUDENTS", "EDIT_STUDENTS", "VIEW_FACULTY", "ASSIGN_FACULTY_MENTOR", "ASSIGN_INTERNSHIP_MENTOR", "VIEW_INTERNSHIPS", "CREATE_INTERNSHIP", "EDIT_INTERNSHIP", "APPROVE_INTERNSHIP", "VIEW_ATTENDANCE", "VIEW_INTERNSHIP_ATTENDANCE", "VIEW_MENTORSHIP", "VIEW_REPORTS", "EXPORT_REPORTS", "MANAGE_USERS", "VIEW_AUDIT_LOGS"].includes(perm)) {
        return { has: true, scope: "global" };
      }
    }
    if (role === "faculty_mentor") {
      if (["VIEW_STUDENTS", "VIEW_ATTENDANCE", "VIEW_MENTORSHIP", "CREATE_MENTOR_TASK", "SEND_MENTOR_MESSAGE", "VIEW_REPORTS"].includes(perm)) {
        return { has: true, scope: "assigned" };
      }
    }
    if (role === "internship_mentor") {
      if (["VIEW_STUDENTS", "VIEW_INTERNSHIPS", "VIEW_INTERNSHIP_ATTENDANCE", "VIEW_MENTORSHIP", "CREATE_MENTOR_TASK", "SEND_MENTOR_MESSAGE", "VIEW_REPORTS"].includes(perm)) {
        return { has: true, scope: "assigned" };
      }
    }
    if (role === "student") {
      if (["VIEW_STUDENTS", "VIEW_INTERNSHIPS", "VIEW_ATTENDANCE", "VIEW_INTERNSHIP_ATTENDANCE", "VIEW_MENTORSHIP", "SEND_MENTOR_MESSAGE"].includes(perm)) {
        return { has: true, scope: "self" };
      }
    }
    if (role === "security" && perm === "VIEW_ATTENDANCE") {
      return { has: true, scope: "limited" };
    }
    return { has: false, scope: "none" };
  };

  const categories = ["all", "Students", "Faculty", "Mentorship", "Internships", "Attendance", "Reports", "System"];

  const filteredPermissions = PERMISSIONS_LIST.filter(
    (p) => filterCategory === "all" || p.category === filterCategory
  );

  const filteredFaculty = facultyMembers.filter((f) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      (f.name || "").toLowerCase().includes(q) ||
      (f.email || "").toLowerCase().includes(q) ||
      (f.department || "").toLowerCase().includes(q) ||
      (f.designation || "").toLowerCase().includes(q);
    const matchDept = deptFilter === "all" || (f.department || "").includes(deptFilter);
    return matchQuery && matchDept;
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand">
              <ShieldCheck className="size-3" /> Faculty Role & Access Governance
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              Live Database Enforced RBAC
            </span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-black text-foreground mt-1">
            Faculty Access, Roles & Permissions Control Center
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Select faculty names and directly assign their institutional roles (Faculty Mentor, Internship Mentor, TPC Convener, Dean, Admin) and customize granular permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="rounded-xl text-xs font-bold gap-1.5 h-9"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Sync Matrix
          </Button>
        </div>
      </div>

      {/* Primary Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-2xl border border-border/60">
          <button
            type="button"
            onClick={() => setViewMode("faculty_access")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all",
              viewMode === "faculty_access"
                ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="size-4 text-[#F2A93B]" />
            <span>Faculty Members & Roles ({facultyMembers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("system_matrix")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all",
              viewMode === "system_matrix"
                ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldCheck className="size-4" />
            <span>Global Role Permissions Matrix</span>
          </button>
        </div>

        {viewMode === "faculty_access" && (
          <p className="text-[11px] font-semibold text-muted-foreground">
            Showing <strong className="text-foreground">{filteredFaculty.length}</strong> faculty guides available for role configuration
          </p>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. FACULTY MEMBERS ACCESS & ROLES VIEW (PRIMARY)                           */}
      {/* ========================================================================= */}
      {viewMode === "faculty_access" && (
        <div className="space-y-4">
          {/* Search & Department Filters */}
          <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search Faculty by Name, Email, or Department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl h-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground font-bold text-[11px]">Department:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-[#1A3C6E]"
              >
                <option value="all">All Departments</option>
                <option value="Computer Science">Computer Science & Engineering</option>
                <option value="Chemical">Chemical & Petrochemical Eng</option>
                <option value="Mechanical">Mechanical & Automation</option>
                <option value="Management">School of Management (SOM)</option>
                <option value="Central">University Central / TPC</option>
              </select>
            </div>
          </div>

          {/* Faculty Members Card List */}
          <div className="space-y-3">
            {filteredFaculty.map((fac) => (
              <div
                key={fac.id}
                className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs hover:border-[#1A3C6E]/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Faculty Identity */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-[260px]">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] font-display text-sm font-black text-[#F2A93B] shadow-md">
                    {(fac.name || "FA").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm font-black text-foreground">{fac.name}</h4>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black text-emerald-600">
                        Active Faculty
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium">{fac.email}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 flex items-center gap-1.5">
                      <Building2 className="size-3 text-[#F2A93B]" />
                      <span>{fac.department}</span>
                      <span>·</span>
                      <span className="text-slate-500">{fac.designation}</span>
                    </p>
                  </div>
                </div>

                {/* Role Selector Dropdown */}
                <div className="flex flex-col gap-1 min-w-[200px]">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <UserCheck className="size-3 text-[#1A3C6E]" /> Assign System Role
                  </label>
                  <select
                    value={fac.activeRole || "faculty"}
                    onChange={(e) => handleRoleQuickChange(fac.id, e.target.value as UserRole)}
                    className="w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-[#1A3C6E]"
                  >
                    <option value="faculty_mentor">👨‍🏫 Faculty Mentor (Mentorship & Capstone)</option>
                    <option value="internship_mentor">💼 Internship Mentor (Industry & Plant NOC)</option>
                    <option value="organizer">🎪 TPC Coordinator & Event Convener</option>
                    <option value="dean">🏛️ Dean & Academic Affairs</option>
                    <option value="admin">🛡️ University Administrator</option>
                    <option value="faculty">🎓 Teaching Faculty (Standard Academic)</option>
                  </select>
                </div>

                {/* Active Capabilities Summary & Actions */}
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <div className="hidden sm:flex flex-wrap gap-1 max-w-xs">
                    {(fac.permissions || []).slice(0, 3).map((p: string) => (
                      <span key={p} className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-mono font-bold text-muted-foreground">
                        {p.replace(/_/g, " ")}
                      </span>
                    ))}
                    {(fac.permissions?.length || 0) > 3 && (
                      <span className="rounded-md bg-[#1A3C6E]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#1A3C6E]">
                        +{(fac.permissions?.length || 0) - 3} more
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedFacultyIdFor360(fac.id)}
                    className="h-8 rounded-xl text-xs font-bold gap-1"
                  >
                    <Eye className="size-3.5" /> 360° Profile
                  </Button>

                  <Button
                    size="sm"
                    onClick={() =>
                      setSelectedUserForAccess({
                        id: fac.id,
                        name: fac.name,
                        email: fac.email,
                        role: fac.activeRole || "faculty_mentor",
                        department: fac.department,
                        designation: fac.designation,
                        permissions: fac.permissions,
                      })
                    }
                    className="h-8 rounded-xl bg-[#1A3C6E] text-white font-bold text-xs gap-1 hover:bg-[#1A3C6E]/90"
                  >
                    <Key className="size-3.5 text-[#F2A93B]" /> Configure Permissions
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SYSTEM ROLES & PERMISSIONS MATRIX (TEMPLATE MATRIX VIEW)               */}
      {/* ========================================================================= */}
      {viewMode === "system_matrix" && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  "rounded-xl px-3 py-1.5 font-bold transition-colors whitespace-nowrap text-xs",
                  filterCategory === cat
                    ? "bg-[#1A3C6E] text-white shadow-xs"
                    : "bg-card border border-border/80 text-muted-foreground hover:text-foreground"
                )}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Matrix Table */}
          <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border/60">
                  <tr>
                    <th className="px-4 py-3 sticky left-0 bg-muted/90 backdrop-blur-md z-10">
                      Granular Permission
                    </th>
                    {SYSTEM_ROLES.map((r) => (
                      <th key={r.role} className="px-3 py-3 text-center min-w-[110px]">
                        <p className="font-bold text-foreground capitalize">{r.role.replace("_", " ")}</p>
                        <span className="text-[9px] text-muted-foreground font-normal">{r.category}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-medium">
                  {filteredPermissions.map((perm) => (
                    <tr key={perm.key} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 sticky left-0 bg-card backdrop-blur-md z-10">
                        <div className="flex items-center gap-2">
                          <Key className="size-3 text-brand shrink-0" />
                          <div>
                            <p className="font-bold text-foreground text-xs">{perm.name}</p>
                            <p className="font-mono text-[9px] text-muted-foreground font-semibold">{perm.key}</p>
                          </div>
                        </div>
                      </td>

                      {SYSTEM_ROLES.map((r) => {
                        const status = getPermissionStatus(r.role, perm.key);
                        return (
                          <td key={r.role} className="px-3 py-2.5 text-center">
                            {status.has ? (
                              <div className="inline-flex flex-col items-center">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                                    status.scope === "global"
                                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                      : status.scope === "assigned"
                                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                      : status.scope === "self"
                                      ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                  )}
                                >
                                  <CheckCircle2 className="size-2.5" />
                                  {status.scope}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center text-slate-300 dark:text-slate-700">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scope Legend */}
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="size-3.5 text-brand" /> Authorization Scope Definitions:
            </span>
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                <strong>GLOBAL:</strong> Full university institutional access
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-500" />
                <strong>ASSIGNED:</strong> Only students & records assigned to faculty
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-purple-500" />
                <strong>SELF:</strong> Candidate's own academic records only
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-500" />
                <strong>LIMITED:</strong> Department or event specific authority
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Manage Access Modal */}
      {selectedUserForAccess && (
        <ManageAccessModal
          isOpen={Boolean(selectedUserForAccess)}
          onClose={() => setSelectedUserForAccess(null)}
          onSuccess={() => {
            setSelectedUserForAccess(null);
            loadData();
          }}
          user={selectedUserForAccess}
          currentUser={currentUser}
        />
      )}

      {/* Faculty 360 Modal */}
      {selectedFacultyIdFor360 && (
        <Faculty360Modal
          isOpen={Boolean(selectedFacultyIdFor360)}
          onClose={() => setSelectedFacultyIdFor360(null)}
          facultyId={selectedFacultyIdFor360}
        />
      )}
    </div>
  );
}
