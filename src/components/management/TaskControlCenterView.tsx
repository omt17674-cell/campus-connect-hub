import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  User,
  GraduationCap,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { MentorshipTask } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TaskControlCenterView() {
  const [tasks, setTasks] = useState<MentorshipTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<MentorshipTask | null>(null);

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter]);

  const loadTasks = async () => {
    setLoading(true);
    const res = await apiClient.getManagementTasks({
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
    });
    if (res?.success && res.tasks) {
      setTasks(res.tasks);
    }
    setLoading(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (t.title || "").toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q) ||
      (t.mentorName || "").toLowerCase().includes(q) ||
      (t.studentName || "").toLowerCase().includes(q) ||
      (t.studentRollNo || "").toLowerCase().includes(q)
    );
  });

  const pendingCount = tasks.filter((t) => ["Pending", "In Progress", "Submitted"].includes(t.status)).length;
  const completedCount = tasks.filter((t) => ["Completed", "Reviewed"].includes(t.status)).length;

  return (
    <div className="space-y-4">
      {/* Control Header & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs">
          <p className="text-[11px] font-bold text-muted-foreground uppercase">Total Mentorship Tasks</p>
          <p className="text-2xl font-black text-foreground mt-1">{tasks.length}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Assigned across all cohorts</p>
        </div>
        <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs">
          <p className="text-[11px] font-bold text-muted-foreground uppercase">Pending Review / Active</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Awaiting completion or review</p>
        </div>
        <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs">
          <p className="text-[11px] font-bold text-muted-foreground uppercase">Completed Directives</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Reviewed and completed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks, faculty mentor, or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-2xl h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border/80 bg-background px-2.5 py-1.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-brand"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-border/80 bg-background px-2.5 py-1.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-brand"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent Priority</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={loadTasks}
            className="rounded-xl h-8 text-xs font-bold gap-1"
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} /> Refresh
          </Button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground font-bold uppercase tracking-wider text-[10px] border-b border-border/60">
              <tr>
                <th className="px-4 py-3">Task Directive</th>
                <th className="px-3 py-3">Assigned Mentor</th>
                <th className="px-3 py-3">Recipient Student</th>
                <th className="px-3 py-3">Due Date</th>
                <th className="px-3 py-3 text-center">Priority</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                      <span>Loading task control logs from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No tasks found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand font-bold text-xs">
                          <FileText className="size-4" />
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <p className="font-bold text-foreground truncate">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{t.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold text-foreground">{t.mentorName || "Faculty Mentor"}</p>
                      <span className="font-mono text-[9px] text-muted-foreground">ID: {t.mentorId}</span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold text-foreground">{t.studentName || "Student Scholar"}</p>
                      <span className="font-mono text-[9px] text-brand font-bold">{t.studentRollNo || t.studentId}</span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-bold text-foreground">{t.dueDate}</p>
                      <span className="text-[9px] text-muted-foreground">Assigned {t.assignedDate}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                        t.priority === "urgent" ? "bg-red-500/15 text-red-600 dark:text-red-400 font-black" :
                        t.priority === "high" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                        "bg-slate-200 dark:bg-slate-800 text-muted-foreground"
                      )}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                        t.status === "Completed" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                        t.status === "Submitted" ? "bg-blue-500/15 text-blue-600 dark:text-blue-400" :
                        "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      )}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTask(t)}
                        className="h-7 rounded-xl text-[10px] font-bold"
                      >
                        <Eye className="mr-1 size-3" /> Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-brand" />
                <h3 className="font-display text-base font-black text-foreground">{selectedTask.title}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedTask(null)} className="rounded-full">
                ✕
              </Button>
            </div>

            <div className="space-y-3 text-xs overflow-y-auto max-h-[60vh] pr-1">
              <div>
                <p className="text-muted-foreground font-bold uppercase text-[10px]">Directive Description</p>
                <p className="text-foreground mt-0.5 text-xs bg-muted/40 p-3 rounded-xl">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-border/80 p-2.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Faculty Mentor:</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedTask.mentorName || selectedTask.mentorId}</p>
                </div>
                <div className="rounded-xl border border-border/80 p-2.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Student Candidate:</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedTask.studentName || selectedTask.studentRollNo}</p>
                </div>
              </div>

              {selectedTask.submissionText ? (
                <div>
                  <p className="text-muted-foreground font-bold uppercase text-[10px]">Student Submission Deliverable</p>
                  <p className="text-foreground mt-0.5 text-xs bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">{selectedTask.submissionText}</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-dashed text-center text-muted-foreground text-xs">
                  No deliverable submitted yet by student candidate.
                </div>
              )}

              {selectedTask.feedback && (
                <div>
                  <p className="text-muted-foreground font-bold uppercase text-[10px]">Faculty Reviewer Feedback</p>
                  <p className="text-emerald-800 dark:text-emerald-300 mt-0.5 text-xs bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">{selectedTask.feedback}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-border/60">
              <Button onClick={() => setSelectedTask(null)} className="rounded-xl h-8 px-4 text-xs font-bold bg-[#1A3C6E] text-white">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
