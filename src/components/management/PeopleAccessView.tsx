import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  Key,
  GraduationCap,
  Briefcase,
  Building2,
  CheckCircle2,
  RefreshCw,
  UserPlus,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { ManageAccessModal } from "./ManageAccessModal";
import { Faculty360Modal } from "./Faculty360Modal";
import { UnifiedStudentHistoryModal } from "../mentorship/UnifiedStudentHistoryModal";
import { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PeopleAccessViewProps {
  currentUser: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export function PeopleAccessView({ currentUser }: PeopleAccessViewProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  // Modals
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<any | null>(null);
  const [selectedFacultyIdFor360, setSelectedFacultyIdFor360] = useState<string | null>(null);
  const [selectedStudentIdFor360, setSelectedStudentIdFor360] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [roleFilter, deptFilter]);

  const loadUsers = async () => {
    setLoading(true);
    const res = await apiClient.getPeopleAndAccess({
      role: roleFilter !== "all" ? roleFilter : undefined,
      department: deptFilter !== "all" ? deptFilter : undefined,
      search: search.trim() || undefined,
    });
    if (res?.success && res.users) {
      setUsers(res.users);
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.rollNo || "").toLowerCase().includes(q) ||
      (u.department || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by Name, Official Email, User ID, or Roll No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-2xl h-9 text-xs"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-bold text-[11px]">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-border/80 bg-background px-2.5 py-1.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-brand"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="faculty_mentor">Faculty Mentors</option>
              <option value="internship_mentor">Internship Mentors</option>
              <option value="dean">Deans</option>
              <option value="tpc">TPC</option>
              <option value="organizer">Organizers</option>
              <option value="admin">Administrators</option>
              <option value="management">Management</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-bold text-[11px]">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-border/80 bg-background px-2.5 py-1.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-brand"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science & Engineering">CSE</option>
              <option value="Chemical & Petrochemical Eng">Chemical Eng</option>
              <option value="School of Management">Management (SOM)</option>
              <option value="Mechanical & Automation Eng">Mechanical</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            className="rounded-xl h-8 text-xs font-bold gap-1"
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} /> Refresh
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border/60">
              <tr>
                <th className="px-4 py-3">User & Identity</th>
                <th className="px-3 py-3">System Role</th>
                <th className="px-3 py-3">Department & Designation</th>
                <th className="px-3 py-3 text-center">Assigned Mentees</th>
                <th className="px-3 py-3 text-center">Active Tasks</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Access Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                      <span>Loading authorized users from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No authorized users found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isStaff = u.role !== "student";
                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 items-center justify-center rounded-xl bg-brand/10 text-brand font-bold text-xs shrink-0">
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">{u.email}</p>
                            <span className="font-mono text-[9px] text-brand/80 font-bold">ID: {u.rollNo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn(
                          "rounded-lg px-2 py-0.5 text-[10px] font-bold capitalize",
                          u.role === "management" || u.role === "super_admin" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                          u.role === "dean" || u.role === "admin" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" :
                          u.role === "faculty_mentor" || u.role === "internship_mentor" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400" :
                          u.role === "student" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                          "bg-slate-200 dark:bg-slate-800 text-foreground"
                        )}>
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-foreground font-semibold">{u.department}</p>
                        <p className="text-[10px] text-muted-foreground">{u.designation}</p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-bold font-mono text-xs">{u.assignedStudentCount || "—"}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-bold font-mono text-xs">{u.assignedTasksCount || "—"}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isStaff ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedFacultyIdFor360(u.id)}
                              className="h-7 rounded-xl text-[10px] font-bold"
                            >
                              <Eye className="mr-1 size-3" /> 360°
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedStudentIdFor360(u.id || u.rollNo)}
                              className="h-7 rounded-xl text-[10px] font-bold"
                            >
                              <Eye className="mr-1 size-3" /> Student 360°
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => setSelectedUserForAccess(u)}
                            className="h-7 rounded-xl text-[10px] font-bold bg-[#1A3C6E] text-white hover:brightness-110"
                          >
                            <Key className="mr-1 size-3" /> Manage Access
                          </Button>
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

      {/* Manage Access Modal */}
      {selectedUserForAccess && (
        <ManageAccessModal
          isOpen={Boolean(selectedUserForAccess)}
          user={selectedUserForAccess}
          currentUser={currentUser}
          onClose={() => setSelectedUserForAccess(null)}
          onSuccess={() => {
            setSelectedUserForAccess(null);
            loadUsers();
          }}
        />
      )}

      {/* Faculty 360 Modal */}
      {selectedFacultyIdFor360 && (
        <Faculty360Modal
          facultyId={selectedFacultyIdFor360}
          isOpen={Boolean(selectedFacultyIdFor360)}
          onClose={() => setSelectedFacultyIdFor360(null)}
          onOpenStudent360={(stuId) => setSelectedStudentIdFor360(stuId)}
        />
      )}

      {/* Student 360 Modal */}
      {selectedStudentIdFor360 && (
        <UnifiedStudentHistoryModal
          studentId={selectedStudentIdFor360}
          isOpen={Boolean(selectedStudentIdFor360)}
          onClose={() => setSelectedStudentIdFor360(null)}
        />
      )}
    </div>
  );
}
