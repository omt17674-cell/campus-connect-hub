import { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Flame,
  GraduationCap,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { CampusState } from "@/lib/campus-store";
import { FacultyMentorAssignment, MentorMessage, MentorshipTask } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UnifiedStudentHistoryModal } from "./UnifiedStudentHistoryModal";

interface FacultyMentorDashboardProps {
  state: CampusState;
}

export function FacultyMentorDashboard({ state }: FacultyMentorDashboardProps) {
  const user = state?.currentUser;
  const facultyId = user?.id || user?.email || "u-tpc";
  const [activeTab, setActiveTab] = useState<"students" | "tasks" | "messages" | "alerts">("students");

  const [assignments, setAssignments] = useState<FacultyMentorAssignment[]>([]);
  const [tasks, setTasks] = useState<MentorshipTask[]>([]);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<string | null>(null);

  // New Task Modal
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [taskTargetStudent, setTaskTargetStudent] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);

  // Task Review Modal
  const [reviewTask, setReviewTask] = useState<MentorshipTask | null>(null);
  const [taskFeedback, setTaskFeedback] = useState("");
  const [taskNewStatus, setTaskNewStatus] = useState("Completed");

  // Send Message
  const [msgTargetStudent, setMsgTargetStudent] = useState("");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    loadFacultyData();
  }, [facultyId]);

  const loadFacultyData = async () => {
    setLoading(true);
    const [fmaRes, tasksRes, msgRes] = await Promise.all([
      apiClient.getFacultyMentorAssignments({ facultyId }),
      apiClient.getMentorshipTasks({ mentorId: facultyId }),
      apiClient.getMentorMessages({ facultyId }),
    ]);

    if (fmaRes?.assignments) setAssignments(fmaRes.assignments);
    if (tasksRes?.tasks) setTasks(tasksRes.tasks);
    if (msgRes?.messages) setMessages(msgRes.messages);
    setLoading(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDescription.trim() || !taskDueDate || !taskTargetStudent) {
      toast.error("Please fill all required task fields.");
      return;
    }

    setCreatingTask(true);
    const res = await apiClient.createMentorshipTask({
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      dueDate: taskDueDate,
      priority: taskPriority,
      studentId: taskTargetStudent,
      mentorId: facultyId,
    });
    setCreatingTask(false);

    if (res?.success) {
      toast.success("Mentorship task assigned successfully!");
      setShowNewTaskModal(false);
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
      loadFacultyData();
    } else {
      toast.error(res?.message || "Failed to assign task.");
    }
  };

  const handleUpdateTaskReview = async () => {
    if (!reviewTask) return;
    const res = await apiClient.updateMentorshipTask(reviewTask.id, {
      status: taskNewStatus,
      feedback: taskFeedback.trim(),
    });

    if (res?.success) {
      toast.success("Task review and feedback recorded!");
      setReviewTask(null);
      setTaskFeedback("");
      loadFacultyData();
    } else {
      toast.error("Failed to update task.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgSubject.trim() || !msgBody.trim() || !msgTargetStudent) {
      toast.error("Please fill subject, message, and select a student.");
      return;
    }

    setSendingMsg(true);
    const res = await apiClient.sendMentorMessage({
      senderId: facultyId,
      senderName: user?.name || "Faculty Mentor",
      senderRole: "mentor",
      receiverId: msgTargetStudent,
      studentId: msgTargetStudent,
      facultyId: facultyId,
      subject: msgSubject.trim(),
      message: msgBody.trim(),
      priority: "medium",
    });
    setSendingMsg(false);

    if (res?.success) {
      toast.success("Message dispatched to student!");
      setMsgSubject("");
      setMsgBody("");
      loadFacultyData();
    } else {
      toast.error("Failed to send message.");
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      (a.studentName || "").toLowerCase().includes(q) ||
      (a.studentRollNo || "").toLowerCase().includes(q) ||
      (a.department || "").toLowerCase().includes(q)
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
                <GraduationCap className="size-3" /> GSFC Faculty Mentorship Portal
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
                Academic Year 2025-2026
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black text-white">
              {user?.name || "Faculty Mentor"}
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Department: {user?.department || "Computer Science & Engineering"} · Faculty Mentor Capability Active
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase text-[#F2A93B]">Assigned Mentees</p>
              <p className="mt-0.5 font-display text-2xl font-black text-white">{assignments.length}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase text-emerald-400">Active Tasks</p>
              <p className="mt-0.5 font-display text-2xl font-black text-white">
                {tasks.filter((t) => t.status !== "Completed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("students")}
            className={cn(
              "rounded-2xl text-xs font-bold px-4 h-9",
              activeTab === "students" ? "bg-[#1A3C6E] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="mr-1.5 size-3.5" /> My Assigned Students ({assignments.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "rounded-2xl text-xs font-bold px-4 h-9",
              activeTab === "tasks" ? "bg-[#1A3C6E] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Award className="mr-1.5 size-3.5" /> Mentorship Tasks ({tasks.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("messages")}
            className={cn(
              "rounded-2xl text-xs font-bold px-4 h-9",
              activeTab === "messages" ? "bg-[#1A3C6E] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="mr-1.5 size-3.5" /> Communication ({messages.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("alerts")}
            className={cn(
              "rounded-2xl text-xs font-bold px-4 h-9",
              activeTab === "alerts" ? "bg-[#1A3C6E] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldAlert className="mr-1.5 size-3.5 text-amber-500" /> Attendance Alerts
          </Button>
        </div>

        {activeTab === "tasks" && (
          <Button
            size="sm"
            onClick={() => setShowNewTaskModal(true)}
            className="rounded-2xl bg-[#1A3C6E] text-white text-xs font-bold h-9 gap-1.5 shadow-md shrink-0"
          >
            <Plus className="size-3.5" /> Assign New Task
          </Button>
        )}
      </div>

      {/* Tab 1: My Students */}
      {activeTab === "students" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-black text-foreground">Assigned Student Cohort</h3>
              <p className="text-xs text-muted-foreground">Only students authorized and assigned to you by Management are visible</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search student or roll no..."
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
          ) : filteredAssignments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground rounded-2xl border border-dashed">
              <Users className="mx-auto size-8 mb-2 opacity-50" />
              <p className="font-semibold text-sm">No Mentees Assigned</p>
              <p className="text-xs mt-1">Students assigned to you in the Management Portal will appear here automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-bold">
                    <th className="pb-3 pl-2">Student Name</th>
                    <th className="pb-3">Roll Number</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Academic Year / Sem</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredAssignments.map((stu) => (
                    <tr key={stu.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 pl-2 font-bold text-foreground">
                        {stu.studentName || stu.studentId}
                      </td>
                      <td className="py-3 font-mono">{stu.studentRollNo || stu.studentId}</td>
                      <td className="py-3">{stu.department}</td>
                      <td className="py-3">{stu.academicYear} (Sem {stu.semester})</td>
                      <td className="py-3">
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          {stu.status}
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedStudentForHistory(stu.studentRollNo || stu.studentId)}
                          className="h-7 rounded-xl text-xs gap-1 font-bold"
                        >
                          <Eye className="size-3" /> 360° History
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Mentorship Tasks */}
      {activeTab === "tasks" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-black text-foreground">Assigned Tasks & Work Review</h3>
              <p className="text-xs text-muted-foreground">Track mentee progress, evaluate submissions, and deliver actionable feedback</p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground rounded-2xl border border-dashed">
              <Award className="mx-auto size-8 mb-2 opacity-50" />
              <p className="font-semibold text-sm">No Tasks Created</p>
              <p className="text-xs mt-1">Click "Assign New Task" above to assign work to your mentees.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-border/70 bg-card/70 p-4 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase",
                        task.priority === "urgent" || task.priority === "high" ? "bg-red-500/15 text-red-600" : "bg-blue-500/15 text-blue-600"
                      )}>
                        {task.priority}
                      </span>
                      <h4 className="font-display text-sm font-bold text-foreground">{task.title}</h4>
                      <span className="text-xs text-muted-foreground">· Mentee: {task.studentName || task.studentId}</span>
                    </div>

                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-bold",
                      task.status === "Completed" ? "bg-emerald-500/15 text-emerald-600" : task.status === "Submitted" ? "bg-blue-500/15 text-blue-600" : "bg-amber-500/15 text-amber-600"
                    )}>
                      {task.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">{task.description}</p>

                  {task.submissionText && (
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-2.5 text-xs">
                      <p className="font-bold text-blue-800 dark:text-blue-300">Mentee Work Submission:</p>
                      <p className="text-muted-foreground mt-0.5">{task.submissionText}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs">
                    <span className="text-muted-foreground text-[11px]">Due: {task.dueDate}</span>
                    <Button
                      size="sm"
                      onClick={() => {
                        setReviewTask(task);
                        setTaskFeedback(task.feedback || "");
                        setTaskNewStatus(task.status);
                      }}
                      className="h-7 rounded-xl bg-[#1A3C6E] text-white text-[11px] font-bold px-3"
                    >
                      Review & Feedback
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Messages */}
      {activeTab === "messages" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
            <h3 className="font-display text-lg font-black text-foreground">Student Communication Log</h3>
            {messages.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No messages exchanged yet.</p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {messages.map((msg) => (
                  <div key={msg.id} className="rounded-2xl border border-border/70 bg-card/70 p-4 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{msg.senderName} ({msg.senderRole})</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="font-semibold text-foreground">{msg.subject}</p>
                    <p className="text-muted-foreground leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-xl space-y-3">
            <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Send className="size-4 text-brand" /> Send Mentee Message
            </h4>
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Select Mentee</label>
                <select
                  value={msgTargetStudent}
                  onChange={(e) => setMsgTargetStudent(e.target.value)}
                  className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
                  required
                >
                  <option value="">-- Choose Assigned Student --</option>
                  <option value="ALL_ASSIGNED">All Assigned Mentees ({assignments.length})</option>
                  {assignments.map((a) => (
                    <option key={a.studentId} value={a.studentId}>
                      {a.studentName || a.studentId} ({a.studentRollNo || a.studentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Subject</label>
                <Input
                  placeholder="e.g. Attendance Warning / Project Review"
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  className="mt-1 h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Message</label>
                <Textarea
                  placeholder="Type message to student..."
                  value={msgBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="mt-1 text-xs rounded-xl min-h-[110px]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={sendingMsg}
                className="w-full h-9 rounded-xl bg-[#1A3C6E] text-white text-xs font-bold gap-1.5 shadow-md"
              >
                <Send className="size-3.5" />
                {sendingMsg ? "Sending..." : "Dispatch Message"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Attendance Alerts */}
      {activeTab === "alerts" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-5" />
            <h3 className="font-display text-lg font-black">Mandatory Attendance Compliance Alerts</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            University guidelines require minimum 75% attendance. Students falling below threshold receive automated advisory notices.
          </p>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
            <p className="text-xs font-bold text-foreground">Automated System Health:</p>
            <p className="text-xs text-muted-foreground">
              All assigned mentees are currently synchronized with live RFID / GPS Unified Gate Attendance.
            </p>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground">Assign Mentorship Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Assign To Student</label>
                <select
                  value={taskTargetStudent}
                  onChange={(e) => setTaskTargetStudent(e.target.value)}
                  className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
                  required
                >
                  <option value="">-- Choose Assigned Student --</option>
                  {assignments.map((a) => (
                    <option key={a.studentId} value={a.studentId}>
                      {a.studentName || a.studentId} ({a.studentRollNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground">Task Title</label>
                <Input
                  placeholder="e.g. Submit Semester Internship Preference Form"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="mt-1 h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground">Description / Instructions</label>
                <Textarea
                  placeholder="Describe the action item required from the mentee..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="mt-1 text-xs rounded-xl min-h-[90px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Due Date</label>
                  <Input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="mt-1 h-9 text-xs rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewTaskModal(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingTask}
                  className="rounded-xl bg-[#1A3C6E] text-white text-xs font-bold"
                >
                  {creatingTask ? "Assigning..." : "Assign Task"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Review Dialog */}
      {reviewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground">Review Task & Provide Feedback</h3>
            <p className="text-xs text-muted-foreground">Task: {reviewTask.title}</p>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Status</label>
              <select
                value={taskNewStatus}
                onChange={(e) => setTaskNewStatus(e.target.value)}
                className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
              >
                <option value="In Progress">In Progress</option>
                <option value="Submitted">Submitted</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Needs Changes</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Mentor Feedback</label>
              <Textarea
                placeholder="Write actionable remarks or feedback for the student..."
                value={taskFeedback}
                onChange={(e) => setTaskFeedback(e.target.value)}
                className="mt-1 text-xs rounded-xl min-h-[90px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewTask(null)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpdateTaskReview}
                className="rounded-xl bg-[#1A3C6E] text-white text-xs font-bold"
              >
                Save Review
              </Button>
            </div>
          </div>
        </div>
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
