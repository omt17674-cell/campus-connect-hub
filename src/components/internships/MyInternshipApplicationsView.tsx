import {
  AlertTriangle,
  Award,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  MapPin,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Internship,
  InternshipApplication,
  InternshipApplicationStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface MyInternshipApplicationsViewProps {
  applications: InternshipApplication[];
  internships: Internship[];
  onNavigateToPunch: (applicationId: string) => void;
  onBrowseInternships: () => void;
}

export function MyInternshipApplicationsView({
  applications,
  internships,
  onNavigateToPunch,
  onBrowseInternships,
}: MyInternshipApplicationsViewProps) {
  const getInternship = (internshipId: string): Internship | undefined => {
    return internships.find((i) => i.id === internshipId);
  };

  const getStatusBadge = (status: InternshipApplicationStatus) => {
    switch (status) {
      case "APPROVED":
      case "ACTIVE":
        return {
          label: "Approved & Active",
          bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
          icon: CheckCircle2,
        };
      case "ADMIN_REVIEW":
      case "SUBMITTED":
        return {
          label: "Pending Faculty Review",
          bg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
          icon: Clock,
        };
      case "CHANGES_REQUESTED":
        return {
          label: "Changes Requested",
          bg: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
          icon: AlertTriangle,
        };
      case "REJECTED":
        return {
          label: "Application Rejected",
          bg: "bg-destructive/15 text-destructive border-destructive/30",
          icon: XCircle,
        };
      case "COMPLETED":
        return {
          label: "Internship Completed",
          bg: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
          icon: Award,
        };
      default:
        return {
          label: status,
          bg: "bg-muted text-muted-foreground border-border",
          icon: HelpCircle,
        };
    }
  };

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <FileText className="size-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-foreground">No Applications Yet</h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          You haven't submitted any internship applications yet. Browse available university postings to start your industrial tenure.
        </p>
        <Button
          onClick={onBrowseInternships}
          className="mt-5 gap-2 rounded-2xl bg-[#1A3C6E] text-xs font-bold text-white shadow-md hover:opacity-95"
        >
          <Send className="size-3.5 text-[#F2A93B]" />
          Browse Available Internships
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-foreground">My Internship Applications</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Track Faculty Coordinator review and approval status for each submitted application.
        </p>
      </div>

      <div className="space-y-6">
        {applications.map((app) => {
          const internship = getInternship(app.internshipId);
          const badge = getStatusBadge(app.status);
          const BadgeIcon = badge.icon;
          const isApproved = app.status === "APPROVED" || app.status === "ACTIVE";

          // Step index: 0=submitted, 1=admin review, 2=approved, 3=active
          const steps = [
            {
              title: "Application Submitted",
              subtitle: new Date(app.createdAt).toLocaleDateString(),
              done: true,
              active: false,
            },
            {
              title: "Faculty Coordinator Review",
              subtitle: app.adminReviewedBy ? `By ${app.adminReviewedBy}` : "Pending Review",
              done: Boolean(app.adminReviewedAt && app.status !== "REJECTED" && app.status !== "CHANGES_REQUESTED"),
              active: app.status === "ADMIN_REVIEW" || app.status === "SUBMITTED",
              failed: app.status === "CHANGES_REQUESTED" || app.status === "REJECTED",
            },
            {
              title: "Final Approval & Sanction",
              subtitle: isApproved ? "Authorized for Attendance" : "Pending",
              done: isApproved,
              active: false,
            },
            {
              title: "Internship Active & Punching",
              subtitle: isApproved ? "GPS Punch Enabled" : "Locked",
              done: app.status === "ACTIVE" || isApproved,
              active: isApproved,
            },
          ];

          return (
            <div
              key={app.id}
              className="overflow-hidden rounded-3xl border border-border/80 bg-card/85 p-6 shadow-sm backdrop-blur-xl"
            >
              {/* Card Top Details */}
              <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-brand bg-brand/10 px-2.5 py-0.5 rounded-lg">
                      {app.applicationNumber}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider",
                        badge.bg
                      )}
                    >
                      <BadgeIcon className="size-3 shrink-0" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <h3 className="mt-2 text-lg font-black text-foreground">
                    {internship?.title || "Internship Opportunity"}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building2 className="size-3.5 text-[#F2A93B]" />
                      <span>{internship?.companyName || "Organization"}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3.5 text-brand" />
                      <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                    {internship && (
                      <>
                        <span>•</span>
                        <span>Tenure: {internship.startDate} to {internship.endDate}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side punch shortcut */}
                {isApproved ? (
                  <Button
                    onClick={() => onNavigateToPunch(app.id)}
                    className="gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-[#1A3C6E] to-[#0E2342] text-xs font-black text-white shadow-md hover:opacity-95"
                  >
                    <CheckCircle2 className="size-4 text-[#F2A93B]" />
                    Punch Attendance
                  </Button>
                ) : (
                  <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2 text-right">
                    <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">
                      Attendance Access
                    </span>
                    <p className="text-xs font-extrabold text-amber-800 dark:text-amber-400">
                      Locked Until Faculty Approval
                    </p>
                  </div>
                )}
              </div>

              {/* Visual Status Stepper */}
              <div className="py-6">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-4">
                  Simplified Approval Workflow
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  {steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "relative flex flex-col rounded-2xl border p-3 transition-all",
                        step.done
                          ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                          : step.active
                          ? "border-brand/40 bg-brand/5 text-brand ring-1 ring-brand/30"
                          : step.failed
                          ? "border-destructive/40 bg-destructive/5 text-destructive"
                          : "border-border/60 bg-muted/20 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold">Stage 0{idx + 1}</span>
                        {step.done ? (
                          <div className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Check className="size-2.5 stroke-[3]" />
                          </div>
                        ) : step.active ? (
                          <span className="relative flex size-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                            <span className="relative inline-flex size-2.5 rounded-full bg-brand" />
                          </span>
                        ) : step.failed ? (
                          <XCircle className="size-4 text-destructive" />
                        ) : (
                          <span className="size-2 rounded-full bg-border" />
                        )}
                      </div>

                      <h4 className="mt-2 text-xs font-bold leading-tight text-foreground">
                        {step.title}
                      </h4>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {step.subtitle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attached Verification & Company Documents */}
              {app.documents && app.documents.length > 0 && (
                <div className="border-t border-border/60 pt-3 pb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Attached Verification Documents & Company Proofs ({app.documents.length})
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {app.documents.map((doc, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-center gap-1.5 rounded-xl border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground"
                      >
                        <FileCheck className="size-3.5 text-[#F2A93B]" />
                        <span className="truncate max-w-[200px]">{doc.name}</span>
                        <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[9px] font-bold text-brand uppercase">
                          {doc.type.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviewer Feedback / Remarks */}
              {(app.adminComment || app.rejectionReason) && (
                <div className="mt-2 space-y-2 border-t border-border/60 pt-4">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    Faculty Coordinator Remarks & Official Notes
                  </h4>

                  {app.adminComment && (
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs">
                      <span className="font-black text-brand">
                        Faculty Coordinator Comment ({app.adminReviewedBy || "TPC"}):
                      </span>{" "}
                      <span className="text-foreground/90 font-medium">{app.adminComment}</span>
                    </div>
                  )}

                  {app.rejectionReason && (
                    <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-xs">
                      <span className="font-black text-destructive">Rejection Reason:</span>{" "}
                      <span className="text-destructive/90 font-medium">{app.rejectionReason}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
