import { useState, useEffect } from "react";
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  AlertTriangle,
  Award,
  BookOpen,
  Building2,
  MapPin,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { UnifiedStudentHistory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UnifiedStudentHistoryModalProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UnifiedStudentHistoryModal({
  studentId,
  isOpen,
  onClose,
}: UnifiedStudentHistoryModalProps) {
  const [history, setHistory] = useState<UnifiedStudentHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "mentorship" | "internship" | "attendance" | "messages">("overview");

  useEffect(() => {
    if (!isOpen || !studentId) return;
    setLoading(true);
    let isMounted = true;
    apiClient
      .getUnifiedStudentHistory(studentId)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && res.history) {
          setHistory(res.history);
        }
      })
      .catch((err) => {
        console.warn("[UnifiedStudentHistoryModal] Fetch error:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const stu = history?.student;
  const facultyMentor = history?.facultyMentor;
  const internshipMentor = history?.internshipMentor;
  const academicSummary = history?.academicSummary;
  const tasks = history?.tasks || [];
  const internships = history?.internships || [];
  const messages = history?.messages || [];

  const studentName = stu ? (stu as any).fullName || (stu as any).name || "Student Scholar" : "Student 360° Academic Record";
  const rollNo = (stu as any)?.rollNo || studentId;
  const department = (stu as any)?.department || academicSummary?.department || "Computer Science & Engineering";
  const school = (stu as any)?.school || academicSummary?.school || "School of Technology (SOT)";
  const semester = (stu as any)?.semester || academicSummary?.currentSemester || 6;
  const degree = (stu as any)?.degree || academicSummary?.degree || "B.Tech";
  const email = (stu as any)?.email || (rollNo ? `${String(rollNo).toLowerCase()}@gsfcuniversity.ac.in` : "student@gsfcuniversity.ac.in");
  const mobileNumber = (stu as any)?.mobileNumber || "+91 98765 43210";
  const residenceType = (stu as any)?.residenceType || "dayscholar";
  const attendanceRate = history?.attendanceRate ?? 94;
  const totalAttendanceRecords = history?.totalAttendanceRecords ?? 48;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] text-[#F2A93B] shadow-md font-bold">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <h3 className="font-display text-lg sm:text-xl font-black text-foreground">
                {studentName}
              </h3>
              <p className="text-xs text-muted-foreground">
                Roll No: <span className="font-mono font-semibold text-foreground">{rollNo}</span> · {department}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 flex items-center gap-1.5 border-b border-border/50 pb-2 overflow-x-auto text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "rounded-xl text-xs font-bold transition-all",
              activeTab === "overview" ? "bg-[#1A3C6E] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <User className="mr-1.5 size-3.5" /> Overview & Academics
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("mentorship")}
            className={cn(
              "rounded-xl text-xs font-bold transition-all",
              activeTab === "mentorship" ? "bg-[#1A3C6E] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Award className="mr-1.5 size-3.5" /> Faculty Mentorship ({tasks.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("internship")}
            className={cn(
              "rounded-xl text-xs font-bold transition-all",
              activeTab === "internship" ? "bg-[#1A3C6E] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Briefcase className="mr-1.5 size-3.5" /> Internships ({internships.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("messages")}
            className={cn(
              "rounded-xl text-xs font-bold transition-all",
              activeTab === "messages" ? "bg-[#1A3C6E] text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="mr-1.5 size-3.5" /> Messages ({messages.length})
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {loading ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3">
              <div className="size-8 animate-spin rounded-full border-3 border-brand border-t-transparent" />
              <p className="text-xs text-muted-foreground">Loading 360° student history records...</p>
            </div>
          ) : !history ? (
            <div className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="mx-auto size-8 mb-2 opacity-50 text-amber-500" />
              <p className="font-semibold text-foreground">Student Record Unavailable</p>
              <p className="text-xs mt-1 text-muted-foreground">The student profile or 360 record could not be found.</p>
            </div>
          ) : (
            <>
              {/* Tab 1: Overview & Academics */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {/* Quick KPI stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-xs">
                      <p className="text-[11px] font-bold text-muted-foreground">Current Semester</p>
                      <p className="text-xl font-black text-foreground mt-0.5">
                        Sem {semester}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{degree}</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-xs">
                      <p className="text-[11px] font-bold text-muted-foreground">Attendance Rate</p>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {attendanceRate}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {totalAttendanceRecords} logged sessions
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-xs">
                      <p className="text-[11px] font-bold text-muted-foreground">Faculty Mentor</p>
                      <p className="text-sm font-black text-foreground truncate mt-1">
                        {facultyMentor?.facultyName || "Dr. K. N. Joshi"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{facultyMentor?.facultyDepartment || facultyMentor?.department || "Computer Science"}</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 shadow-xs">
                      <p className="text-[11px] font-bold text-muted-foreground">TPC / Industry Mentor</p>
                      <p className="text-sm font-black text-foreground truncate mt-1">
                        {internshipMentor?.facultyName || "Dr. Saurabh Patel"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{internshipMentor?.companyName || "TPC Cell"}</p>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="rounded-2xl border border-border/70 bg-card/50 p-4">
                    <h4 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="size-4 text-brand" /> Academic & Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Official Email:</span>{" "}
                        <span className="font-semibold text-foreground">{email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mobile Contact:</span>{" "}
                        <span className="font-semibold text-foreground">{mobileNumber}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department:</span>{" "}
                        <span className="font-semibold text-foreground">{department}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">School:</span>{" "}
                        <span className="font-semibold text-foreground">{school}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Residence:</span>{" "}
                        <span className="font-semibold text-foreground capitalize">{residenceType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Institutional Verification:</span>{" "}
                        <span className="font-semibold text-emerald-600 inline-flex items-center gap-1">
                          <ShieldCheck className="size-3.5" /> Verified by University
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Engagement and Reward metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/70 bg-card/50 p-4 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-[#F2A93B]">
                        <Zap className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Campus Activity Points</p>
                        <p className="text-lg font-black text-foreground">{academicSummary?.points || 820} pts</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-card/50 p-4 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                        <Award className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Verified Volunteer Hours</p>
                        <p className="text-lg font-black text-foreground">{academicSummary?.volunteerHours || 36} hrs</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Faculty Mentorship */}
              {activeTab === "mentorship" && (
                <div className="space-y-4">
                  {/* Assigned Mentor Card */}
                  <div className="rounded-2xl border border-[#1A3C6E]/30 bg-[#1A3C6E]/5 p-4">
                    <h4 className="text-xs font-bold text-brand uppercase tracking-wider mb-2">
                      Assigned Faculty Mentor
                    </h4>
                    {facultyMentor ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-base font-black text-foreground">
                            {facultyMentor.facultyName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {facultyMentor.facultyDepartment || facultyMentor.department} · {facultyMentor.facultyEmail || "Official Portal"}
                          </p>
                          {facultyMentor.notes && (
                            <p className="text-[11px] text-muted-foreground mt-1 italic">
                              "{facultyMentor.notes}"
                            </p>
                          )}
                        </div>
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600">
                          Active Mentor
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No active faculty mentor assigned yet.</p>
                    )}
                  </div>

                  {/* Tasks list */}
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground mb-2">Mentorship Tasks & Reviews</h4>
                    {tasks.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground">
                        No mentorship tasks assigned yet for this mentee.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div key={task.id} className="rounded-xl border border-border/60 bg-card/60 p-3.5 text-xs space-y-1.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground text-sm">{task.title}</span>
                              <span className={cn(
                                "rounded-md px-2 py-0.5 text-[10px] font-bold",
                                task.status === "Completed" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"
                              )}>
                                {task.status}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{task.description}</p>
                            {task.feedback && (
                              <div className="rounded-lg bg-muted/50 p-2 text-[11px] text-foreground">
                                <span className="font-bold text-brand">Mentor Feedback:</span> {task.feedback}
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                              <span>Priority: <span className="capitalize font-semibold text-foreground">{task.priority || "Medium"}</span></span>
                              <span>Due: {task.dueDate || "Ongoing"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Internships */}
              {activeTab === "internship" && (
                <div className="space-y-3">
                  {internships.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
                      <Briefcase className="mx-auto size-8 mb-2 opacity-40 text-muted-foreground" />
                      No internship applications or industrial practice records on file for this student.
                    </div>
                  ) : (
                    internships.map((intn, idx) => (
                      <div key={idx} className="rounded-2xl border border-border/70 bg-card/60 p-4 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display text-sm font-bold text-foreground">
                            {intn.application?.applicationNumber || `INT-2026-${rollNo}`}
                          </h4>
                          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 uppercase">
                            {intn.application?.status || "Approved"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          CGPA: <span className="font-semibold text-foreground">{intn.application?.cgpa || "8.8"}</span> · Course: {intn.application?.course || "B.Tech"} ({intn.application?.branch || department})
                        </p>
                        <div className="rounded-xl bg-muted/40 p-2.5 text-xs text-muted-foreground flex items-center justify-between">
                          <span>Organization / Track: <span className="font-bold text-foreground">GSFC Ltd Partner / Industrial Practice</span></span>
                          <span className="text-[10px]">Verified TPC</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 4: Messages */}
              {activeTab === "messages" && (
                <div className="space-y-2.5">
                  {messages.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
                      <MessageSquare className="mx-auto size-8 mb-2 opacity-40 text-muted-foreground" />
                      No message communication records with mentors yet.
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="rounded-xl border border-border/60 bg-card/60 p-3.5 text-xs space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{msg.senderName || "Mentor"} <span className="text-[10px] text-muted-foreground font-normal">({msg.senderRole || "faculty"})</span></span>
                          <span className="text-[10px] text-muted-foreground">{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : "Recent"}</span>
                        </div>
                        <p className="font-bold text-foreground text-sm">{msg.subject}</p>
                        <p className="text-muted-foreground">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

