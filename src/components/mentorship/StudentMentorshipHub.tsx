import { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { CampusState } from "@/lib/campus-store";
import { FacultyMentorAssignment, InternshipMentorAssignment, MentorMessage, MentorshipTask } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface StudentMentorshipHubProps {
  state: CampusState;
}

export function StudentMentorshipHub({ state }: StudentMentorshipHubProps) {
  const user = state?.currentUser;
  const studentId = user?.id || user?.rollNo || "";
  const [activeTab, setActiveTab] = useState<"mentor" | "tasks" | "messages" | "internship">("mentor");

  const [facultyMentor, setFacultyMentor] = useState<FacultyMentorAssignment | null>(null);
  const [internshipMentor, setInternshipMentor] = useState<InternshipMentorAssignment | null>(null);
  const [tasks, setTasks] = useState<MentorshipTask[]>([]);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Message compose
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Task Submission Modal
  const [selectedTask, setSelectedTask] = useState<MentorshipTask | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);

  useEffect(() => {
    loadStudentMentorshipData();
  }, [studentId, user?.rollNo, user?.email]);

  const loadStudentMentorshipData = async () => {
    const activeStudentKey = user?.rollNo || user?.id || user?.email || studentId;
    if (!activeStudentKey) return;
    setLoading(true);

    const [fmaRes, imaRes, tasksRes, msgRes] = await Promise.all([
      apiClient.getFacultyMentorAssignments({ studentId: activeStudentKey }),
      apiClient.getInternshipMentorAssignments({}),
      apiClient.getMentorshipTasks({ studentId: activeStudentKey }),
      apiClient.getMentorMessages({ studentId: activeStudentKey }),
    ]);

    if (fmaRes?.assignments && fmaRes.assignments.length > 0) {
      setFacultyMentor(fmaRes.assignments[0]);
    } else {
      setFacultyMentor(null);
    }
    if (imaRes?.assignments) {
      const match = imaRes.assignments.find(
        (a: any) =>
          a.studentId === activeStudentKey ||
          a.studentRollNo === user?.rollNo ||
          (user?.rollNo && a.studentRollNo?.toLowerCase() === user.rollNo.toLowerCase())
      );
      if (match) setInternshipMentor(match);
    }
    if (tasksRes?.tasks) {
      setTasks(tasksRes.tasks);
    }
    if (msgRes?.messages) {
      setMessages(msgRes.messages);
    }

    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !messageBody.trim() || !facultyMentor) {
      toast.error("Please provide both subject and message for your mentor.");
      return;
    }

    setSendingMsg(true);
    const res = await apiClient.sendMentorMessage({
      senderId: studentId,
      senderName: user?.name || "Student",
      senderRole: "student",
      receiverId: facultyMentor.facultyId,
      studentId: studentId,
      facultyId: facultyMentor.facultyId,
      subject: subject.trim(),
      message: messageBody.trim(),
      priority: "medium",
    });

    setSendingMsg(false);
    if (res?.success) {
      toast.success("Message dispatched to your Faculty Mentor!");
      setSubject("");
      setMessageBody("");
      loadStudentMentorshipData();
    } else {
      toast.error(res?.message || "Failed to send message.");
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedTask || !submissionText.trim()) {
      toast.error("Please describe your completed work or provide response text.");
      return;
    }

    setSubmittingTask(true);
    const res = await apiClient.updateMentorshipTask(selectedTask.id, {
      status: "Submitted",
      submissionText: submissionText.trim(),
    });
    setSubmittingTask(false);

    if (res?.success) {
      toast.success("Work submitted for mentor review!");
      setSelectedTask(null);
      setSubmissionText("");
      loadStudentMentorshipData();
    } else {
      toast.error("Failed to submit task.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-[#1A3C6E] via-[#122A4E] to-[#0A182E] p-6 text-white shadow-xl shadow-[#1A3C6E]/20">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 size-48 rounded-full bg-[#F2A93B]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[#F2A93B]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#F2A93B]">
                <GraduationCap className="size-3" /> GSFC Mentorship System
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
                Academic Year 2025-2026
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-black text-white">
              Faculty & Internship Mentorship
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Direct faculty guidance, academic tracking, work reviews, and internship mentoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase text-[#F2A93B]">My Faculty Mentor</p>
              <p className="mt-0.5 font-display text-sm font-black text-white truncate max-w-[180px]">
                {facultyMentor?.facultyName || "Assigned by TPC/Dean"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase text-emerald-400">Pending Tasks</p>
              <p className="mt-0.5 font-display text-base font-black text-white">
                {tasks.filter((t) => t.status !== "Completed").length} Tasks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto text-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("mentor")}
          className={cn(
            "rounded-2xl text-xs font-bold px-4 h-9",
            activeTab === "mentor" ? "bg-[#1A3C6E] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="mr-1.5 size-3.5" /> My Mentor
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
          <MessageSquare className="mr-1.5 size-3.5" /> Messages & Queries ({messages.length})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("internship")}
          className={cn(
            "rounded-2xl text-xs font-bold px-4 h-9",
            activeTab === "internship" ? "bg-[#1A3C6E] text-white shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Briefcase className="mr-1.5 size-3.5" /> Internship Mentor
        </Button>
      </div>

      {/* Tab 1: My Mentor */}
      {activeTab === "mentor" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl backdrop-blur-xl space-y-4">
            <h3 className="font-display text-lg font-black text-foreground flex items-center gap-2">
              <ShieldCheck className="size-5 text-[#F2A93B]" /> Faculty Mentor Profile
            </h3>

            {facultyMentor ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-2xl border border-[#1A3C6E]/20 bg-[#1A3C6E]/5 p-4">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0D203C] text-[#F2A93B] font-display text-lg font-black">
                    {facultyMentor.facultyName?.slice(0, 2).toUpperCase() || "FM"}
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-foreground">
                      {facultyMentor.facultyName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {facultyMentor.facultyDepartment || facultyMentor.department} · GSFC University
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      Official Academic Mentor
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-border/60 p-3 bg-card/40">
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-bold text-foreground mt-0.5">{facultyMentor.department}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 p-3 bg-card/40">
                    <span className="text-muted-foreground">Academic Year:</span>
                    <p className="font-bold text-foreground mt-0.5">{facultyMentor.academicYear} (Semester {facultyMentor.semester})</p>
                  </div>
                  <div className="rounded-xl border border-border/60 p-3 bg-card/40">
                    <span className="text-muted-foreground">Official Email:</span>
                    <p className="font-bold text-foreground mt-0.5">{facultyMentor.facultyEmail || "Official Portal"}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 p-3 bg-card/40">
                    <span className="text-muted-foreground">Assignment Date:</span>
                    <p className="font-bold text-foreground mt-0.5">{new Date(facultyMentor.assignedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={() => setActiveTab("messages")}
                    className="rounded-xl bg-[#1A3C6E] text-white text-xs font-bold gap-1.5"
                  >
                    <MessageSquare className="size-3.5" /> Send Message
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("tasks")}
                    className="rounded-xl text-xs font-bold gap-1.5"
                  >
                    <Award className="size-3.5" /> View My Tasks
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground rounded-2xl border border-dashed">
                <Users className="mx-auto size-8 mb-2 opacity-50" />
                <p className="font-semibold text-sm">Faculty Mentor Allocation in Progress</p>
                <p className="text-xs mt-1">Management and TPC Dean are finalizing the current academic year cohort.</p>
              </div>
            )}
          </div>

          {/* Guidelines Box */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-xl space-y-3">
            <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <BookOpen className="size-4 text-brand" /> Mentorship Responsibilities
            </h4>
            <ul className="text-xs text-muted-foreground space-y-2.5">
              <li className="flex items-start gap-2">
                <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Maintain mandatory 75%+ attendance to avoid automated alerts.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Complete and submit tasks assigned by your mentor before due date.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Seek guidance for internships, projects, and career development.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Mentorship Tasks */}
      {activeTab === "tasks" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-black text-foreground">My Mentorship Tasks</h3>
              <p className="text-xs text-muted-foreground">Action items assigned by your faculty mentor</p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground rounded-2xl border border-dashed">
              <CheckCircle2 className="mx-auto size-8 mb-2 text-emerald-500 opacity-60" />
              <p className="font-semibold text-sm">All Caught Up!</p>
              <p className="text-xs mt-1">No pending mentorship tasks assigned at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-border/70 bg-card/70 p-4 transition-all hover:bg-card space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase",
                        task.priority === "urgent" || task.priority === "high"
                          ? "bg-red-500/15 text-red-600"
                          : "bg-blue-500/15 text-blue-600"
                      )}>
                        {task.priority} Priority
                      </span>
                      <h4 className="font-display text-sm font-bold text-foreground">{task.title}</h4>
                    </div>

                    <span className={cn(
                      "rounded-full px-3 py-0.5 text-xs font-bold",
                      task.status === "Completed"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : task.status === "Submitted"
                        ? "bg-blue-500/15 text-blue-600"
                        : "bg-amber-500/15 text-amber-600"
                    )}>
                      {task.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">{task.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
                    <span>Due Date: {task.dueDate}</span>
                    {task.status !== "Completed" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task);
                          setSubmissionText(task.submissionText || "");
                        }}
                        className="h-7 rounded-xl bg-[#1A3C6E] text-white text-[11px] font-bold px-3"
                      >
                        {task.status === "Submitted" ? "Update Submission" : "Submit Work"}
                      </Button>
                    )}
                  </div>

                  {task.feedback && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="font-bold">Mentor Feedback:</span> {task.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Messages */}
      {activeTab === "messages" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="md:col-span-2 rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
            <h3 className="font-display text-lg font-black text-foreground">Message History</h3>
            {messages.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No messages exchanged yet.</p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "rounded-2xl border p-4 text-xs space-y-1.5",
                      msg.senderRole === "student"
                        ? "border-blue-500/30 bg-blue-500/5 ml-4"
                        : "border-border/70 bg-card/70 mr-4"
                    )}
                  >
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

          {/* Send Message Box */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-xl space-y-3">
            <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Send className="size-4 text-brand" /> Message Mentor
            </h4>
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Subject</label>
                <Input
                  placeholder="e.g. Project Query / Internship Advice"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground">Message</label>
                <Textarea
                  placeholder="Type your message or query..."
                  value={messageBody}
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
                {sendingMsg ? "Sending..." : "Send to Mentor"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Internship Mentor */}
      {activeTab === "internship" && (
        <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl space-y-4">
          <h3 className="font-display text-lg font-black text-foreground flex items-center gap-2">
            <Briefcase className="size-5 text-[#F2A93B]" /> Internship Mentorship Record
          </h3>

          {internshipMentor ? (
            <div className="rounded-2xl border border-[#1A3C6E]/30 bg-[#1A3C6E]/5 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-display text-base font-bold text-foreground">
                    {internshipMentor.facultyName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Internship Mentor · {internshipMentor.department}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600">
                  Assigned
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Internship:</span>{" "}
                  <span className="font-bold text-foreground">{internshipMentor.internshipTitle || "Industry Internship"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Company:</span>{" "}
                  <span className="font-bold text-foreground">{internshipMentor.companyName || "GSFC Ltd Partner"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Academic Year:</span>{" "}
                  <span className="font-bold text-foreground">{internshipMentor.academicYear} (Sem {internshipMentor.semester})</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Field:</span>{" "}
                  <span className="font-bold text-foreground">{internshipMentor.field || "Engineering"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground rounded-2xl border border-dashed">
              <Briefcase className="mx-auto size-8 mb-2 opacity-50" />
              <p className="font-semibold text-sm">No Active Internship Mentor Assigned</p>
              <p className="text-xs mt-1">Once your internship application is approved, a faculty internship mentor will be assigned to track your GPS check-ins and project deliverables.</p>
            </div>
          )}
        </div>
      )}

      {/* Task Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground">Submit Work for Review</h3>
            <p className="text-xs text-muted-foreground">Task: {selectedTask.title}</p>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Work Submission / Notes</label>
              <Textarea
                placeholder="Describe what you completed, code links, or deliverables..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="mt-1.5 text-xs rounded-xl min-h-[120px]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTask(null)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitTask}
                disabled={submittingTask}
                className="rounded-xl bg-[#1A3C6E] text-white text-xs font-bold"
              >
                {submittingTask ? "Submitting..." : "Submit to Mentor"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
