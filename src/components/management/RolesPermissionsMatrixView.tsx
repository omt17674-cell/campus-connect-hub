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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { GranularPermission, PermissionScope, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    const res = await apiClient.getRolesAndPermissions();
    if (res?.success && res.rolePermissions) {
      setRolePermissions(res.rolePermissions);
    }
    setLoading(false);
  };

  const getPermissionStatus = (role: UserRole, perm: GranularPermission): { has: boolean; scope: PermissionScope } => {
    const match = rolePermissions.find((rp) => rp.role === role && rp.permission === perm);
    if (match) {
      return { has: true, scope: match.scope || "global" };
    }
    // Static RBAC matrix rule fallbacks if DB table is initializing
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

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand">
              <ShieldCheck className="size-3" /> Granular Access Control
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              Database Enforced RBAC
            </span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-black text-foreground mt-1">
            Institutional Role & Granular Permissions Matrix
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            Fine-grained capability assignment controlling what each system role is authorized to view, modify, allocate, or export across GSFC University.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPermissions}
            className="rounded-xl text-xs font-bold gap-1.5 h-8.5"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh Matrix
          </Button>
        </div>
      </div>

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
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                              status.scope === "global" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                              status.scope === "assigned" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" :
                              status.scope === "self" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400" :
                              "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            )}>
                              <CheckCircle2 className="size-2.5" />
                              {status.scope}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center text-slate-300 dark:text-slate-700">
                            —
                          </span>
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
  );
}
