import { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  GraduationCap,
  Building2,
  RefreshCw,
  Search,
  Eye,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { FacultyWorkloadItem } from "@/lib/types";
import { Faculty360Modal } from "./Faculty360Modal";
import { cn } from "@/lib/utils";

export function FacultyWorkloadView() {
  const [workloads, setWorkloads] = useState<FacultyWorkloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);

  useEffect(() => {
    loadWorkloads();
  }, []);

  const loadWorkloads = async () => {
    setLoading(true);
    const res = await apiClient.getFacultyWorkload();
    if (res?.success && res.workload) {
      setWorkloads(res.workload);
    }
    setLoading(false);
  };

  const filteredWorkloads = workloads.filter((w) => {
    const q = search.toLowerCase();
    return (
      w.facultyName.toLowerCase().includes(q) ||
      w.department.toLowerCase().includes(q) ||
      w.designation.toLowerCase().includes(q)
    );
  });

  const totalAcademicMentees = workloads.reduce((sum, w) => sum + (w.facultyMenteesCount || 0), 0);
  const totalTasks = workloads.reduce((sum, w) => sum + (w.tasksAssignedCount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand">
              <Users className="size-3" /> Faculty Roster & Workload Governance
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              Factual Academic Data Only
            </span>
          </div>
          <h3 className="font-display text-lg sm:text-xl font-black text-foreground mt-1">
            Faculty Academic & Mentorship Workload Analysis
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            Objective oversight of student mentorship distribution, assigned tasks, completed directives, messages sent, and active industrial supervisions per faculty member.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadWorkloads}
            className="rounded-xl text-xs font-bold gap-1.5 h-8.5"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh Workload
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search faculty name, department, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-2xl h-9 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground font-semibold">
          {filteredWorkloads.length} Faculty Members
        </span>
      </div>

      {/* Workload Table */}
      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border/60">
              <tr>
                <th className="px-4 py-3">Faculty Member</th>
                <th className="px-3 py-3">Department & Designation</th>
                <th className="px-3 py-3 text-center">Academic Mentees</th>
                <th className="px-3 py-3 text-center">Intern Mentees</th>
                <th className="px-3 py-3 text-center">Tasks Assigned</th>
                <th className="px-3 py-3 text-center">Pending Tasks</th>
                <th className="px-3 py-3 text-center">Completed Tasks</th>
                <th className="px-4 py-3 text-right">Faculty 360°</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                      <span>Loading faculty workload analytics...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredWorkloads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    No faculty records found.
                  </td>
                </tr>
              ) : (
                filteredWorkloads.map((w) => (
                  <tr key={w.facultyId} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand font-bold text-xs">
                          {w.facultyName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{w.facultyName}</p>
                          <p className="font-mono text-[10px] text-muted-foreground truncate">ID: {w.facultyId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold text-foreground">{w.department}</p>
                      <p className="text-[10px] text-muted-foreground">{w.designation}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-mono font-bold text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-md">
                        {w.facultyMenteesCount}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-mono font-bold text-xs text-muted-foreground">
                        {w.internshipMenteesCount}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-mono font-bold text-xs text-foreground">
                        {w.tasksAssignedCount}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-mono font-bold text-xs text-amber-600">
                        {w.tasksPendingCount}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="font-mono font-bold text-xs text-emerald-600">
                        {w.tasksCompletedCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFacultyId(w.facultyId)}
                        className="h-7 rounded-xl text-[10px] font-bold"
                      >
                        <Eye className="mr-1 size-3" /> View 360°
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty 360 Modal */}
      {selectedFacultyId && (
        <Faculty360Modal
          facultyId={selectedFacultyId}
          isOpen={Boolean(selectedFacultyId)}
          onClose={() => setSelectedFacultyId(null)}
        />
      )}
    </div>
  );
}
