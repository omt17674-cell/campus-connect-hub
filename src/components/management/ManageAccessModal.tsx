import { useState, useEffect } from "react";
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Check,
  User,
  AlertTriangle,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { GranularPermission, UserRole } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ManageAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    rollNo?: string;
    role: UserRole;
    department?: string;
    designation?: string;
    permissions?: string[];
  };
  currentUser: {
    id: string;
    name: string;
    role: UserRole;
  };
}

const ALL_GRANULAR_PERMISSIONS: { key: GranularPermission; name: string; category: string; description: string }[] = [
  { key: "VIEW_STUDENTS", name: "View Students", category: "Students", description: "Access student profiles and enrollment records" },
  { key: "EDIT_STUDENTS", name: "Edit Students", category: "Students", description: "Modify student academic data and allocations" },
  { key: "VIEW_FACULTY", name: "View Faculty", category: "Faculty", description: "Access faculty directory and workloads" },
  { key: "EDIT_FACULTY", name: "Edit Faculty", category: "Faculty", description: "Modify faculty details and department roles" },
  { key: "ASSIGN_FACULTY_MENTOR", name: "Assign Faculty Mentor", category: "Mentorship", description: "Allocate or reassign students to faculty mentors" },
  { key: "ASSIGN_INTERNSHIP_MENTOR", name: "Assign Internship Mentor", category: "Mentorship", description: "Assign students to industrial mentors" },
  { key: "VIEW_INTERNSHIPS", name: "View Internships", category: "Internships", description: "Browse internship catalogs and applications" },
  { key: "CREATE_INTERNSHIP", name: "Create Internship", category: "Internships", description: "Post new verified company internships" },
  { key: "EDIT_INTERNSHIP", name: "Edit Internship", category: "Internships", description: "Update existing internship listings" },
  { key: "APPROVE_INTERNSHIP", name: "Approve Internship", category: "Internships", description: "Dean and TPC approval of student applications" },
  { key: "VIEW_ATTENDANCE", name: "View Attendance", category: "Attendance", description: "Inspect campus event check-in logs" },
  { key: "VIEW_INTERNSHIP_ATTENDANCE", name: "View Internship Attendance", category: "Attendance", description: "Review daily industrial punch logs" },
  { key: "VIEW_MENTORSHIP", name: "View Mentorship", category: "Mentorship", description: "Access mentorship dashboard and cohorts" },
  { key: "CREATE_MENTOR_TASK", name: "Create Mentor Task", category: "Mentorship", description: "Assign academic directives to students" },
  { key: "SEND_MENTOR_MESSAGE", name: "Send Mentor Message", category: "Mentorship", description: "Send formal advisement messages" },
  { key: "VIEW_REPORTS", name: "View Reports", category: "Governance", description: "Access institutional analytics and tables" },
  { key: "EXPORT_REPORTS", name: "Export Reports", category: "Governance", description: "Download CSV and Excel roster files" },
  { key: "MANAGE_MASTER_DATA", name: "Manage Master Data", category: "Governance", description: "Edit academic years, departments, and fields" },
  { key: "MANAGE_USERS", name: "Manage Users", category: "Governance", description: "Create and deactivate institutional accounts" },
  { key: "MANAGE_ROLES", name: "Manage Roles", category: "Governance", description: "Modify role assignments" },
  { key: "MANAGE_PERMISSIONS", name: "Manage Permissions", category: "Governance", description: "Grant or revoke granular system capabilities" },
  { key: "VIEW_AUDIT_LOGS", name: "View Audit Logs", category: "Governance", description: "Audit trail of system administrative actions" },
  { key: "MANAGE_SYSTEM_SETTINGS", name: "Manage System Settings", category: "Governance", description: "Global university system configuration" },
];

export function ManageAccessModal({
  isOpen,
  onClose,
  onSuccess,
  user,
  currentUser,
}: ManageAccessModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [activePermissions, setActivePermissions] = useState<Set<GranularPermission>>(new Set());
  const [reason, setReason] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedRole(user.role);
    // Pre-populate permissions from user's current permissions or role defaults
    const initialPerms = new Set<GranularPermission>();
    if (user.role === "management" || user.role === "super_admin") {
      ALL_GRANULAR_PERMISSIONS.forEach((p) => initialPerms.add(p.key));
    } else if (user.role === "faculty_mentor") {
      ["VIEW_STUDENTS", "VIEW_ATTENDANCE", "VIEW_MENTORSHIP", "CREATE_MENTOR_TASK", "SEND_MENTOR_MESSAGE", "VIEW_REPORTS"].forEach((p) => initialPerms.add(p as GranularPermission));
    } else if (user.role === "internship_mentor") {
      ["VIEW_STUDENTS", "VIEW_INTERNSHIPS", "VIEW_INTERNSHIP_ATTENDANCE", "VIEW_MENTORSHIP", "CREATE_MENTOR_TASK", "SEND_MENTOR_MESSAGE", "VIEW_REPORTS"].forEach((p) => initialPerms.add(p as GranularPermission));
    } else if (user.role === "admin" || user.role === "dean") {
      ["VIEW_STUDENTS", "EDIT_STUDENTS", "VIEW_FACULTY", "ASSIGN_FACULTY_MENTOR", "ASSIGN_INTERNSHIP_MENTOR", "VIEW_INTERNSHIPS", "CREATE_INTERNSHIP", "EDIT_INTERNSHIP", "APPROVE_INTERNSHIP", "VIEW_ATTENDANCE", "VIEW_INTERNSHIP_ATTENDANCE", "VIEW_MENTORSHIP", "VIEW_REPORTS", "EXPORT_REPORTS", "MANAGE_USERS", "VIEW_AUDIT_LOGS"].forEach((p) => initialPerms.add(p as GranularPermission));
    } else if (user.role === "student") {
      ["VIEW_STUDENTS", "VIEW_INTERNSHIPS", "VIEW_ATTENDANCE", "VIEW_INTERNSHIP_ATTENDANCE", "VIEW_MENTORSHIP", "SEND_MENTOR_MESSAGE"].forEach((p) => initialPerms.add(p as GranularPermission));
    }
    setActivePermissions(initialPerms);
  }, [isOpen, user]);

  if (!isOpen) return null;

  const isSelf = currentUser.id === user.id || currentUser.name === user.name;

  const handleTogglePermission = (perm: GranularPermission) => {
    setActivePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) {
        next.delete(perm);
      } else {
        next.add(perm);
      }
      return next;
    });
  };

  const handleRoleChange = (role: UserRole) => {
    if (isSelf && role !== "management" && role !== "super_admin") {
      toast.error("Self-Lockout Protection: You cannot demote your own management account.");
      return;
    }
    setSelectedRole(role);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const granted = Array.from(activePermissions);
      const revoked = ALL_GRANULAR_PERMISSIONS.map((p) => p.key).filter((p) => !activePermissions.has(p));

      const res = await apiClient.updateUserAccess({
        userId: user.id,
        actorId: currentUser.id,
        actorName: currentUser.name,
        newRole: selectedRole,
        grantedPermissions: granted,
        revokedPermissions: revoked,
        reason: reason.trim() || "Administrative security & RBAC update",
      });

      if (res?.success) {
        toast.success("User access and permissions updated successfully in Supabase.");
        onSuccess();
        onClose();
      } else {
        toast.error(res?.error || "Failed to update access.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Error saving access.");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] text-[#F2A93B] shadow-md font-bold">
              <Shield className="size-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-black text-foreground">
                Manage Access & Granular Permissions
              </h3>
              <p className="text-xs text-muted-foreground">
                User: <strong className="text-foreground">{user.name}</strong> ({user.email}) · ID: <span className="font-mono">{user.rollNo || user.id}</span>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="size-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {isSelf && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center gap-2.5 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="size-4 shrink-0" />
              <span><strong>Self-Management Notice:</strong> You are modifying your own account. Self-lockout safeguards are active.</span>
            </div>
          )}

          {/* Role Assignment */}
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-2.5">
            <label className="font-display text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Key className="size-3.5 text-brand" /> Assigned Institutional Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-brand"
            >
              <option value="student">🎓 Student Scholar</option>
              <option value="faculty">👨‍🏫 Faculty Member</option>
              <option value="faculty_mentor">👨‍🏫 Faculty Mentor (Academic Cohort Guide)</option>
              <option value="internship_mentor">💼 Internship Mentor (Industrial Supervisor)</option>
              <option value="dean">🏛️ Dean & Academic Head</option>
              <option value="tpc">💼 Training & Placement Cell (TPC Officer)</option>
              <option value="organizer">🎪 Event Convener / Coordinator</option>
              <option value="admin">🛡️ University Administrator</option>
              <option value="management">🏛️ Institutional Management & System Governance</option>
              <option value="super_admin">⚡ Super Administrator (Full Authority)</option>
            </select>
          </div>

          {/* Granular Permissions Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-display text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-brand" /> Granular Permission Matrix ({activePermissions.size}/{ALL_GRANULAR_PERMISSIONS.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActivePermissions(new Set(ALL_GRANULAR_PERMISSIONS.map((p) => p.key)))}
                  className="text-[10px] font-bold text-brand hover:underline"
                >
                  Grant All
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setActivePermissions(new Set())}
                  className="text-[10px] font-bold text-destructive hover:underline"
                >
                  Revoke All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_GRANULAR_PERMISSIONS.map((p) => {
                const isGranted = activePermissions.has(p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleTogglePermission(p.key)}
                    className={cn(
                      "flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition-all",
                      isGranted
                        ? "border-emerald-500/50 bg-emerald-500/10 text-foreground shadow-xs"
                        : "border-border/60 bg-card hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-md border",
                      isGranted ? "border-emerald-500 bg-emerald-500 text-white" : "border-border/80 bg-muted"
                    )}>
                      {isGranted && <Check className="size-3" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[11px] leading-tight text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{p.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason / Audit Note */}
          <div className="space-y-1.5">
            <label className="font-display text-xs font-black text-foreground">
              Audit Justification / Governance Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Approved by Dean of Academic Affairs for Semester 6 cohort governance"
              className="w-full rounded-xl border border-border/80 bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        {/* Confirmation State */}
        {showConfirm ? (
          <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 space-y-3">
            <div className="flex items-center gap-2 text-destructive font-bold text-xs">
              <ShieldAlert className="size-4" />
              <span>Confirm System Access Changes</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              This action will modify role and permissions for <strong>{user.name}</strong> and immediately record an entry in the immutable institutional audit log.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
                className="rounded-xl h-8 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={submitting}
                onClick={handleSave}
                className="rounded-xl h-8 text-xs font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {submitting ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
                Confirm & Save Audit Record
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
            <Button variant="ghost" onClick={onClose} className="rounded-xl h-9 text-xs font-bold">
              Cancel
            </Button>
            <Button
              onClick={() => setShowConfirm(true)}
              className="rounded-xl h-9 px-5 font-bold text-xs bg-[#1A3C6E] text-white hover:brightness-110"
            >
              Review & Update Access
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
