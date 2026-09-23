import { useState, useEffect } from "react";
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  Layers,
  Calendar,
  AlertCircle,
  Activity,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { Faculty360Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Faculty360ModalProps {
  facultyId: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenStudent360?: (studentId: string) => void;
}

export function Faculty360Modal({
  facultyId,
  isOpen,
  onClose,
  onOpenStudent360,
}: Faculty360ModalProps) {
  const [profile, setProfile] = useState<Faculty360Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "mentees" | "tasks" | "internships" | "messages" | "notes" | "audit">("overview");

  useEffect(() => {
    if (!isOpen || !facultyId) return;
    setLoading(true);
    setError(null);
    let isMounted = true;

    apiClient
      .getFaculty360(facultyId)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && res.profile) {
          setProfile(res.profile);
        } else {
          setError(res?.message || "Failed to load Faculty 360 profile from database.");
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Network error loading Faculty 360.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, facultyId]);

  if (!isOpen) return null;

  const fac = profile?.faculty;
  const mentees = profile?.assignedStudents || [];
  const tasks = profile?.tasks || [];
  const messages = profile?.messages || [];
  const notes = profile?.mentorshipNotes || [];
  const internships = profile?.supervisedInternships || [];
  const logs = profile?.activityLogs || [];
  const permissions = profile?.permissions || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] text-[#F2A93B] shadow-md font-bold">
              <User className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg sm:text-xl font-black text-foreground">
                  {fac?.name || "Faculty 360° Profile"}
                </h3>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  {fac?.designation || "Faculty Member"}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Faculty ID: <span className="font-mono font-semibold text-foreground">{facultyId}</span> · {fac?.department}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto border-b border-border/50 pb-2 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "overview" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
            )}
          >
            <Layers className="mr-1.5 size-3.5" /> Overview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("mentees")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "mentees" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
            )}
          >
            <GraduationCap className="mr-1.5 size-3.5" /> Assigned Students ({mentees.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "tasks" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
            )}
          >
            <FileText className="mr-1.5 size-3.5" /> Tasks ({tasks.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("internships")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "internships" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
            )}
          >
            <Briefcase className="mr-1.5 size-3.5" /> Internships Supervised ({internships.length})
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
            <MessageSquare className="mr-1.5 size-3.5" /> Messages ({messages.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("notes")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "notes" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
            )}
          >
            <Activity className="mr-1.5 size-3.5" /> Mentorship Notes ({notes.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("audit")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "audit" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground"
            )}
          >
            <ShieldCheck className="mr-1.5 size-3.5" /> Audit History ({logs.length})
          </Button>
        </div>

        {/* Content Body */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <div className="size-8 animate-spin rounded-full border-4 border-[#1A3C6E] border-t-transparent" />
              <p className="text-xs font-semibold">Querying live database records for Faculty 360°...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
              <AlertCircle className="mx-auto size-8 mb-2" />
              <p className="font-bold text-sm">Database Query Error</p>
              <p className="text-xs mt-1 text-muted-foreground">{error}</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Assigned Mentees</p>
                      <p className="text-2xl font-black text-foreground mt-1">{mentees.length}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Active Academic Cohort</p>
                    </div>
                    <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tasks Assigned</p>
                      <p className="text-2xl font-black text-blue-600 mt-1">{tasks.length}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{profile?.tasksCompletedCount || 0} Completed</p>
                    </div>
                    <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pending Tasks</p>
                      <p className="text-2xl font-black text-amber-600 mt-1">{profile?.tasksPendingCount || 0}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Awaiting Review/Submissions</p>
                    </div>
                    <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Messages Sent</p>
                      <p className="text-2xl font-black text-purple-600 mt-1">{messages.length}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Active Mentorship Threads</p>
                    </div>
                  </div>

                  {/* Profile Details & Permissions Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
                      <h4 className="font-display text-sm font-black text-foreground flex items-center gap-2">
                        <Building2 className="size-4 text-brand" /> Institutional Profile & Contact
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">Official Email:</span>
                          <span className="font-medium text-foreground">{fac?.email}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">Mobile Contact:</span>
                          <span className="font-medium text-foreground">{fac?.mobileNumber}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">Department:</span>
                          <span className="font-medium text-foreground">{fac?.department}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground">Designation:</span>
                          <span className="font-medium text-foreground">{fac?.designation}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">Specialization:</span>
                          <span className="font-medium text-foreground">{fac?.specialization}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
                      <h4 className="font-display text-sm font-black text-foreground flex items-center gap-2">
                        <Key className="size-4 text-brand" /> Active Granular Permissions
                      </h4>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {permissions.length > 0 ? (
                          permissions.map((p, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-border/60 px-2 py-1 text-[11px] font-bold text-foreground"
                            >
                              <CheckCircle2 className="size-3 text-emerald-500" />
                              {p.permission}
                              <span className="text-[9px] text-muted-foreground uppercase">({p.scope})</span>
                            </span>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">Default faculty scope active.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ASSIGNED STUDENTS */}
              {activeTab === "mentees" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-black text-foreground">
                      Assigned Student Cohort ({mentees.length})
                    </h4>
                    <span className="text-xs text-muted-foreground">Database backed allocations</span>
                  </div>
                  {mentees.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-muted-foreground text-xs">
                      No students currently allocated to this faculty member.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mentees.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-2xl border border-border/80 bg-card p-4 hover:border-brand/50 transition-all flex flex-col justify-between gap-3 shadow-xs"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-black text-brand bg-brand/10 px-2 py-0.5 rounded-md">
                                {m.studentRollNo}
                              </span>
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                {m.type === "faculty_mentor" ? "Academic Mentee" : "Internship Mentee"}
                              </span>
                            </div>
                            <p className="font-display text-sm font-bold text-foreground mt-2">{m.studentName}</p>
                            <p className="text-xs text-muted-foreground">{m.department} · Sem {m.semester}</p>
                            {m.field && (
                              <p className="text-[11px] text-amber-600 font-semibold mt-1">Focus: {m.field}</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                            <span>Assigned: {new Date(m.assignedAt).toLocaleDateString()}</span>
                            {onOpenStudent360 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onOpenStudent360(m.studentId)}
                                className="h-7 text-[10px] font-bold rounded-lg"
                              >
                                View Student 360°
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TASKS */}
              {activeTab === "tasks" && (
                <div className="space-y-3">
                  <h4 className="font-display text-sm font-black text-foreground">
                    Mentorship & Academic Directives Assigned ({tasks.length})
                  </h4>
                  {tasks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-muted-foreground text-xs">
                      No active mentorship tasks assigned by this faculty member yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {tasks.map((t) => (
                        <div key={t.id} className="rounded-2xl border border-border/80 bg-card p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-sm text-foreground">{t.title}</h5>
                            <span className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                              t.status === "Completed" ? "bg-emerald-500/15 text-emerald-600" :
                              t.status === "Submitted" ? "bg-blue-500/15 text-blue-600" :
                              "bg-amber-500/15 text-amber-600"
                            )}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{t.description}</p>
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                            <span>Student: <strong className="text-foreground">{t.studentName || t.studentRollNo}</strong></span>
                            <span>Due Date: <strong className="text-foreground">{t.dueDate}</strong></span>
                            <span>Priority: <strong className="uppercase text-amber-600">{t.priority}</strong></span>
                          </div>
                          {t.submissionText && (
                            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/80 p-2.5 text-xs text-foreground mt-2">
                              <strong className="text-brand">Submission:</strong> {t.submissionText}
                            </div>
                          )}
                          {t.feedback && (
                            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                              <strong>Faculty Feedback:</strong> {t.feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: INTERNSHIPS */}
              {activeTab === "internships" && (
                <div className="space-y-3">
                  <h4 className="font-display text-sm font-black text-foreground">
                    Supervised Corporate & Plant Internships
                  </h4>
                  {internships.map((intn) => (
                    <div key={intn.id} className="rounded-2xl border border-border/80 bg-card p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-sm text-foreground">{intn.title}</h5>
                        <span className="rounded-full bg-purple-500/10 text-purple-600 px-2.5 py-0.5 text-[10px] font-bold">
                          {intn.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Partner Company: <strong className="text-foreground">{intn.companyName}</strong></p>
                      <p className="text-xs text-muted-foreground">Active Supervised Interns: <strong className="text-foreground">{intn.activeInternsCount} Candidates</strong></p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: MESSAGES */}
              {activeTab === "messages" && (
                <div className="space-y-3">
                  <h4 className="font-display text-sm font-black text-foreground">
                    Mentorship Correspondence Threads ({messages.length})
                  </h4>
                  {messages.map((m) => (
                    <div key={m.id} className="rounded-2xl border border-border/80 bg-card p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{m.subject}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{m.message}</p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                        <span>From: <strong>{m.senderName}</strong> ({m.senderRole})</span>
                        <span className="capitalize font-bold text-amber-600">{m.priority} Priority</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 6: NOTES */}
              {activeTab === "notes" && (
                <div className="space-y-3">
                  <h4 className="font-display text-sm font-black text-foreground">
                    Recorded Mentorship Observations ({notes.length})
                  </h4>
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-2xl border border-border/80 bg-card p-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{n.title}</span>
                        <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[9px] font-bold uppercase">{n.noteType}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.notes}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 7: AUDIT */}
              {activeTab === "audit" && (
                <div className="space-y-3">
                  <h4 className="font-display text-sm font-black text-foreground">
                    Administrative Action & Governance History ({logs.length})
                  </h4>
                  {logs.map((l) => (
                    <div key={l.id} className="rounded-2xl border border-border/80 bg-card p-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-brand">{l.action}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-muted-foreground">{l.details || "Administrative record updated"}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-end border-t border-border/60 pt-3">
          <Button onClick={onClose} className="rounded-xl h-9 px-4 font-bold text-xs bg-[#1A3C6E] text-white">
            Close 360° Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
