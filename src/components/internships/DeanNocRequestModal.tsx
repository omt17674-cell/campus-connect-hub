import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  Info,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile, NewRegisteredStudent, InternshipApplication, Internship } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import { generateDeanNocPdf } from "@/lib/noc-letter-generator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DeanNocRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  matchingStudent?: NewRegisteredStudent;
  applications: InternshipApplication[];
  internships: Internship[];
}

export function DeanNocRequestModal({
  isOpen,
  onClose,
  currentUser,
  matchingStudent,
  applications,
  internships,
}: DeanNocRequestModalProps) {
  // Default values
  const defaultApp = applications[0];
  const defaultInternship = defaultApp
    ? internships.find((i) => i.id === defaultApp.internshipId)
    : internships[0];

  const [selectedAppId, setSelectedAppId] = useState<string>(defaultApp?.id || "custom");
  const [companyName, setCompanyName] = useState<string>(
    defaultInternship?.companyName || "Gujarat State Fertilizers & Chemicals (GSFC) Ltd."
  );
  const [internshipRole, setInternshipRole] = useState<string>(
    defaultInternship?.title || "Industrial Process Automation & IoT Intern"
  );
  const [companyLocation, setCompanyLocation] = useState<string>(
    defaultInternship?.location || "Fertilizernagar, P.O. Petrochemicals, Vadodara, Gujarat 391750"
  );
  const [duration, setDuration] = useState<string>(
    defaultInternship?.duration || "6 Months (Full Semester Academic Internship)"
  );
  const [startDate, setStartDate] = useState<string>("2026-06-01");
  const [addressee, setAddressee] = useState<string>("The Human Resources / Talent Acquisition Team");
  const [purpose, setPurpose] = useState<string>(
    "Mandatory Final Year / Semester Industrial Internship (Academic Credit Transfer)"
  );
  const [includeConductClause, setIncludeConductClause] = useState<boolean>(true);
  const [includeGpsClause, setIncludeGpsClause] = useState<boolean>(true);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [submittedNocId, setSubmittedNocId] = useState<string | null>(null);

  // Handle application select change
  const handleSelectApplication = (appId: string) => {
    setSelectedAppId(appId);
    if (appId === "custom") {
      setCompanyName("");
      setInternshipRole("");
      setCompanyLocation("");
      return;
    }

    const app = applications.find((a) => a.id === appId);
    if (app) {
      const relatedInternship = internships.find((i) => i.id === app.internshipId);
      const companyDetails = app.academicDetails?.companyDetails;
      setCompanyName(companyDetails?.companyName || relatedInternship?.companyName || "GSFC Ltd.");
      setInternshipRole(companyDetails?.designation || relatedInternship?.title || "Industrial Intern");
      setCompanyLocation(companyDetails?.companyLocation || relatedInternship?.location || "Vadodara, Gujarat");
      setDuration(relatedInternship?.duration || "6 Months");
    }
  };

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const studentName = currentUser.name || matchingStudent?.fullName || "Student Name";
  const rollNo = currentUser.rollNo || matchingStudent?.rollNo || "STU-2024-001";
  const department = currentUser.department || matchingStudent?.department || "Computer Science & Engineering";
  const course = currentUser.degree || matchingStudent?.degree || "B.Tech";
  const semester = currentUser.semester || matchingStudent?.semester || 4;

  const handleDownloadPdf = async () => {
    if (!companyName.trim()) {
      toast.error("Please enter the company or organization name.");
      return;
    }

    setIsDownloadingPdf(true);
    try {
      await generateDeanNocPdf({
        student: currentUser,
        matchingStudent,
        companyName,
        internshipRole,
        companyLocation,
        duration,
        startDate: new Date(startDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        addressee,
        purpose,
        referenceNo: `GSFCU/SOT/NOC/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      });
      toast.success("Official Dean NOC letter downloaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate NOC PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleSubmitRequest = () => {
    if (!companyName.trim()) {
      toast.error("Please enter the company or organization name.");
      return;
    }

    setIsSubmittingRequest(true);
    const nocRequestId = `NOC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(() => {
      // Record official notification in campusStore
      const newNotif = {
        id: `notif-${Date.now()}`,
        studentId: currentUser.id || rollNo,
        applicationId: selectedAppId !== "custom" ? selectedAppId : `app-noc-${Date.now()}`,
        type: "dean_approved" as const,
        title: "Dean NOC Request Submitted & Endorsed",
        message: `Your official NOC request #${nocRequestId} for ${companyName} (${internshipRole}) has been endorsed by Dr. Ananya Sharma (Dean, School of Technology). Digital copy is ready.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      campusStore.setState((prev) => ({
        internshipNotifications: [newNotif, ...(prev.internshipNotifications || [])],
      }));

      setSubmittedNocId(nocRequestId);
      setIsSubmittingRequest(false);
      toast.success(`NOC request #${nocRequestId} officially submitted to Dean's Office!`);
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dean-noc-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1A3C6E] via-[#0E2342] to-[#1A3C6E] p-5 sm:p-6 text-white select-none">
          <div className="pointer-events-none absolute -right-8 -top-8 size-36 rounded-full bg-[#F2A93B]/15 blur-2xl" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#F2A93B]/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#F2A93B]">
                  Official Academic Governance Document
                </span>
                <span className="text-xs text-white/80 font-mono">PORTAL: DEAN-NOC</span>
              </div>
              <h2 id="dean-noc-modal-title" className="mt-2 text-lg sm:text-2xl font-black text-white">
                Request Dean's No Objection Certificate (NOC)
              </h2>
              <p className="mt-1 text-xs font-semibold text-white/85">
                School of Technology • Office of the Dean & TPC Council • GSFC University
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close NOC Request modal"
              className="relative z-20 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/90 transition-all hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {submittedNocId ? (
            /* Success State After Submission */
            <div className="p-4 text-center flex flex-col items-center justify-center space-y-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-foreground">NOC Sanctioned & Recorded!</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Official Registration ID: <span className="font-mono font-bold text-foreground">{submittedNocId}</span>
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 max-w-lg text-left text-xs space-y-2">
                <div className="flex items-center gap-2 font-black text-[#1A3C6E] dark:text-[#F2A93B]">
                  <ShieldCheck className="size-4 shrink-0" />
                  <span>DEAN'S ENDORSEMENT SUMMARY</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  The No Objection Certificate for <strong>{studentName}</strong> to join <strong>{companyName}</strong> as <strong>{internshipRole}</strong> has been logged in the GSFC Academic Governance Registry. A notification has been dispatched to your portal feed.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="gap-2 rounded-2xl bg-[#F2A93B] hover:bg-[#F2A93B]/90 text-[#0E2342] text-xs font-black px-6 shadow-md"
                >
                  <Download className="size-4" />
                  {isDownloadingPdf ? "Generating PDF..." : "Download Official NOC PDF"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-2xl text-xs font-bold px-6"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Informational Banner */}
              <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-blue-900 dark:text-blue-200">
                <Info className="size-5 text-brand shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-bold">GSFC University Official Internship Clearance</p>
                  <p className="mt-0.5 text-blue-800/90 dark:text-blue-300">
                    A Dean's No Objection Certificate (NOC) certifies your bonafide student status and confirms that the university authorizes you to undertake industrial training at the designated corporate host facility.
                  </p>
                </div>
              </div>

              {/* Student Academic Identity Card */}
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-[#1A3C6E] text-white">
                      <GraduationCap className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-foreground">{studentName}</h4>
                      <p className="text-[10px] text-muted-foreground font-mono">Enrolment No: {rollNo}</p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="size-3" />
                    Academic Verified
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Program</span>
                    <p className="font-bold text-foreground">{course}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Department</span>
                    <p className="font-bold text-foreground truncate">{department}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Current Sem</span>
                    <p className="font-bold text-foreground">Semester {semester}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">CGPA</span>
                    <p className="font-black text-[#F2A93B]">8.8 / 10.0</p>
                  </div>
                </div>
              </div>

              {/* Select Sponsoring Internship / Company */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                  <Building2 className="size-4 text-[#F2A93B]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    Sponsoring Company & Internship Placement Details
                  </h3>
                </div>

                {applications.length > 0 && (
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground">
                      Link to an Active Application (Auto-Fills Details)
                    </label>
                    <select
                      value={selectedAppId}
                      onChange={(e) => handleSelectApplication(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-semibold text-foreground focus:border-brand focus:outline-none"
                    >
                      {applications.map((app) => {
                        const related = internships.find((i) => i.id === app.internshipId);
                        return (
                          <option key={app.id} value={app.id}>
                            {app.applicationNumber} — {related?.companyName || "Company"} ({related?.title || "Role"}) [{app.status.replace("_", " ")}]
                          </option>
                        );
                      })}
                      <option value="custom">Other / Custom Off-Campus Organization</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground">
                      Company / Organization Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Gujarat State Fertilizers & Chemicals (GSFC) Ltd."
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground">
                      Internship Role / Designation <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={internshipRole}
                      onChange={(e) => setInternshipRole(e.target.value)}
                      placeholder="e.g. Industrial IoT & Process Automation Intern"
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-muted-foreground">
                      Corporate Office / Plant Location Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={companyLocation}
                      onChange={(e) => setCompanyLocation(e.target.value)}
                      placeholder="e.g. Fertilizernagar, P.O. Petrochemicals, Vadodara, Gujarat 391750"
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground">
                      Addressee Formal Title
                    </label>
                    <input
                      type="text"
                      value={addressee}
                      onChange={(e) => setAddressee(e.target.value)}
                      placeholder="e.g. The Human Resources Manager"
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground">
                      Tenure Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 6 Months / Full Semester"
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground">
                      Proposed Joining Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground">
                      NOC Category & Purpose
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                    >
                      <option value="Mandatory Final Year / Semester Industrial Internship (Academic Credit Transfer)">
                        Mandatory Semester Internship (Credits)
                      </option>
                      <option value="Summer Practical Industrial Training & Exposure">
                        Summer Industrial Training
                      </option>
                      <option value="Corporate Pre-Placement Offer (PPO) Engagement">
                        Pre-Placement Offer (PPO)
                      </option>
                      <option value="Industrial Research & Capstone Project Execution">
                        Research & Capstone Dissertation
                      </option>
                    </select>
                  </div>
                </div>

                {/* Dean Endorsement Clauses */}
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-foreground">
                    Included Endorsement Provisions
                  </span>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={includeConductClause}
                      onChange={(e) => setIncludeConductClause(e.target.checked)}
                      className="size-4 rounded border-border text-brand focus:ring-brand"
                    />
                    <span className="text-muted-foreground">
                      Include official statement certifying satisfactory conduct and active academic enrollment.
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={includeGpsClause}
                      onChange={(e) => setIncludeGpsClause(e.target.checked)}
                      className="size-4 rounded border-border text-brand focus:ring-brand"
                    />
                    <span className="text-muted-foreground">
                      Include undertaking clause for daily GSFC University live GPS attendance gate synchronization.
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/70 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="rounded-2xl text-xs font-bold order-2 sm:order-1"
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2">
                  <Button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="flex-1 sm:flex-none gap-2 rounded-2xl bg-[#F2A93B] hover:bg-[#F2A93B]/90 text-[#0E2342] text-xs font-black px-5 shadow-sm"
                  >
                    <Download className="size-3.5" />
                    {isDownloadingPdf ? "Generating..." : "Download NOC PDF"}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSubmitRequest}
                    disabled={isSubmittingRequest}
                    className="flex-1 sm:flex-none gap-2 rounded-2xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] text-white text-xs font-black px-6 shadow-md"
                  >
                    <Send className="size-3.5 text-[#F2A93B]" />
                    {isSubmittingRequest ? "Submitting..." : "Submit to Dean"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
