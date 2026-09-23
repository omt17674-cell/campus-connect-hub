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
    apiClient.getUnifiedStudentHistory(studentId).then((res) => {
      if (res?.success && res.history) {
        setHistory(res.history);
      }
      setLoading(false);
    });
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const stu = history?.student;
  const facultyMentor = history?.facultyMentor;
  const internshipMentor = history?.internshipMentor;

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
                {stu ? (stu as any).fullName || (stu as any).name : "Student 360° Academic Record"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Roll No: {(stu as any)?.rollNo || studentId} · {(stu as any)?.department || "GSFC University"}
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
              "rounded-xl text-xs font-bold",
              activeTab === "overview" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
            )}
          >
            <User className="mr-1.5 size-3.5" /> Overview & Academics
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("mentorship")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "mentorship" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
            )}
          >
            <Award className="mr-1.5 size-3.5" /> Faculty Mentorship ({history?.tasks?.length || 0})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("internship")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "internship" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
            )}
          >
            <Briefcase className="mr-1.5 size-3.5" /> Internships ({history?.internships?.length || 0})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("messages")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "messages" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
            )}
          >
            <MessageSquare className="mr-1.5 size-3.5" /> Messages ({history?.messages?.length || 0})
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          ) : !history ? (
            <div className="p-8 text-center text-muted-foreground">
              <AlertTriangle className="mx-auto size-8 mb-2 opacity-50" />
              <p>Student record not found or could not be loaded from database.</p>
            </div>
          ) : (
            <>
              {/* Tab 1: Overview & Academics */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {/* Quick KPI stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5">
                      <p className="text-[11px] font-bold text-muted-foreground">Semester</p>
                      <p className="text-xl font-black text-foreground mt-0.5">
                        Sem {(stu as any)?.semester || history.academicSummary.currentSemester}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{(stu as any)?.degree || "B.Tech"}</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5">
                      <p className="text-[11px] font-bold text-muted-foreground">Attendance Rate</p>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {history.attendanceRate}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {history.totalAttendanceRecords} logged sessions
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5">
                      <p className="text-[11px] font-bold text-muted-foreground">Faculty Mentor</p>
                      <p className="text-sm font-black text-foreground truncate mt-1">
                        {facultyMentor?.facultyName || "Unassigned"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{facultyMentor?.department || "Pending"}</p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5">
                      <p className="text-[11px] font-bold text-muted-foreground">Internship Mentor</p>
                      <p className="text-sm font-black text-foreground truncate mt-1">
                        {internshipMentor?.facultyName || "Unassigned"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{internshipMentor?.companyName || "Industry"}</p>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="rounded-2xl border border-border/70 bg-card/50 p-4">
                    <h4 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="size-4 text-brand" /> Academic & Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Email:</span>{" "}
                        <span className="font-semibold text-foreground">{(stu as any)?.email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mobile:</span>{" "}
                        <span className="font-semibold text-foreground">{(stu as any)?.mobileNumber || "Not recorded"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department:</span>{" "}
                        <span className="font-semibold text-foreground">{(stu as any)?.department}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">School:</span>{" "}
                        <span className="font-semibold text-foreground">{(stu as any)?.school || "School of Technology"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Residence:</span>{" "}
                        <span className="font-semibold text-foreground capitalize">{(stu as any)?.residenceType || "Dayscholar"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Verification:</span>{" "}
                        <span className="font-semibold text-emerald-600">Verified by University</span>
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
                    <h4 className="font-display text-sm font-bold text-foreground mb-2">Mentorship Tasks</h4>
                    {history.tasks.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No mentorship tasks assigned yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {history.tasks.map((task) => (
                          <div key={task.id} className="rounded-xl border border-border/60 bg-card/60 p-3 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-foreground">{task.title}</span>
                              <span className={cn(
                                "rounded-md px-2 py-0.5 text-[10px] font-bold",
                                task.status === "Completed" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"
                              )}>
                                {task.status}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{task.description}</p>
                            <p className="text-[10px] text-muted-foreground">Due: {task.dueDate}</p>
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
                  {history.internships.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No internship applications or assignments on record for this student.
                    </div>
                  ) : (
                    history.internships.map((intn, idx) => (
                      <div key={idx} className="rounded-2xl border border-border/70 bg-card/60 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display text-sm font-bold text-foreground">
                            {intn.application?.applicationNumber}
                          </h4>
                          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold text-brand">
                            {intn.application?.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          CGPA: {intn.application?.cgpa} · Course: {intn.application?.course} ({intn.application?.branch})
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 4: Messages */}
              {activeTab === "messages" && (
                <div className="space-y-2.5">
                  {history.messages.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No communication records.</p>
                  ) : (
                    history.messages.map((msg) => (
                      <div key={msg.id} className="rounded-xl border border-border/60 bg-card/60 p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{msg.senderName} ({msg.senderRole})</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="font-semibold text-foreground">{msg.subject}</p>
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
