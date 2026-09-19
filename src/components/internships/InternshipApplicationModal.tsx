import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  GraduationCap,
  Info,
  Lock,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Internship, UserProfile, NewRegisteredStudent } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InternshipApplicationModalProps {
  internship: Internship;
  currentUser: UserProfile;
  matchingStudent?: NewRegisteredStudent;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InternshipApplicationModal({
  internship,
  currentUser,
  matchingStudent,
  isOpen,
  onClose,
  onSuccess,
}: InternshipApplicationModalProps) {
  // Pre-populate fields automatically from existing profile & identity registry
  const [fullName] = useState(currentUser.name || matchingStudent?.fullName || "Student Name");
  const [enrollmentNumber] = useState(currentUser.rollNo || matchingStudent?.rollNo || "STU-2024-001");
  const [universityEmail] = useState(currentUser.email || matchingStudent?.email || "student@gsfcuniversity.ac.in");
  const [personalEmail, setPersonalEmail] = useState(universityEmail);
  const [mobileNumber, setMobileNumber] = useState(
    currentUser.mobileNumber || matchingStudent?.mobileNumber || "+91 95584 13347"
  );
  const [dob, setDob] = useState("2004-05-15");
  const [gender, setGender] = useState("Prefer not to say");
  const [course, setCourse] = useState(currentUser.degree || matchingStudent?.degree || "B.Tech");
  const [branch, setBranch] = useState(currentUser.department || matchingStudent?.department || "Computer Science & Engineering");
  const [semester, setSemester] = useState<number>(currentUser.semester || matchingStudent?.semester || 4);
  const [college] = useState("GSFC University, Vadodara");

  // Contact Details
  const [address, setAddress] = useState(
    matchingStudent?.hostelBlockOrBusRoute || "Kasturba Hostel, GSFC University Campus"
  );
  const [city, setCity] = useState("Vadodara");
  const [state, setState] = useState("Gujarat");
  const [pincode, setPincode] = useState("391750");

  // Academic Details
  const [cgpa, setCgpa] = useState<string>("8.8");
  const [tenthPercent, setTenthPercent] = useState<string>("91.5");
  const [twelfthPercent, setTwelfthPercent] = useState<string>("88.2");
  const [backlogs, setBacklogs] = useState<number>(0);
  const [skills, setSkills] = useState<string>(
    internship.skillsRequired.slice(0, 3).join(", ") + ", Git, REST APIs"
  );
  const [certifications, setCertifications] = useState(
    "NPTEL Industry 4.0 IoT Certification, AWS Cloud Practitioner"
  );

  // Application Statement
  const [whyInternship, setWhyInternship] = useState(
    `I am eager to intern at ${internship.companyName} to apply my technical coursework in ${branch} to practical industrial engineering problems.`
  );
  const [previousExperience, setPreviousExperience] = useState(
    "Completed university semester lab projects and active member in technical campus clubs."
  );
  const [projects, setProjects] = useState(
    "Campus Connect IoT Attendance Gate, Real-time Telemetry Dashboard"
  );
  const [careerObjective, setCareerObjective] = useState(
    "To build robust, enterprise-grade software and embedded edge systems in core industrial domains."
  );
  const [coverLetter, setCoverLetter] = useState(
    `Respected Hiring Team, I am submitting my formal application for the ${internship.title} position at ${internship.companyName}.`
  );

  // Documents (Section 5)
  const [resumeFileName, setResumeFileName] = useState<string>("Resume_Om_Thakkar_2026.pdf");
  const [collegeIdAttached, setCollegeIdAttached] = useState<boolean>(true);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Section 6: Schedule & Modality
  const [expectedJoiningDate, setExpectedJoiningDate] = useState("2026-06-01");
  const [preferredModality, setPreferredModality] = useState(internship.mode || "In-Plant / On-Site");
  const [dailyShiftTimings, setDailyShiftTimings] = useState("General Shift: 09:00 AM - 05:30 PM");
  const [commuteArrangement, setCommuteArrangement] = useState("University Bus / Campus Resident");

  // Section 7: Company Details & Official Offer / Confirmation
  const [companyName, setCompanyName] = useState(internship.companyName || "Gujarat State Fertilizers & Chemicals (GSFC) Ltd.");
  const [companyDivision, setCompanyDivision] = useState(internship.department || "Process Automation & Edge Systems");
  const [internshipRole, setInternshipRole] = useState(internship.title || "Industrial Process Automation & IoT Intern");
  const [hrMentorName, setHrMentorName] = useState("Dr. R. K. Patel (Senior Process GM / Industrial Mentor)");
  const [hrEmail, setHrEmail] = useState("careers.industrial@gsfc.co.in");
  const [hrPhone, setHrPhone] = useState("+91 265 2240451");
  const [companyLocation, setCompanyLocation] = useState(
    internship.location || "Fertilizernagar, P.O. Petrochemicals, Vadodara, Gujarat 391750"
  );
  const [companyStipend, setCompanyStipend] = useState(internship.stipend || "₹12,000 / month");

  // Offer Letter or Confirmation Mail Document State
  const [offerDocumentType, setOfferDocumentType] = useState<"offer_letter" | "confirmation_mail">("offer_letter");
  const [offerDocumentName, setOfferDocumentName] = useState<string>("GSFC_Industrial_Offer_Letter_2026.pdf");
  const [isUploadingOffer, setIsUploadingOffer] = useState(false);

  // Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessNotice, setSubmissionSuccessNotice] = useState<string | null>(null);

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

  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  const ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

  const handleResumeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`Resume file exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller file.`);
        e.target.value = "";
        return;
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Unsupported file format. Please upload a PDF, PNG, or JPEG file.");
        e.target.value = "";
        return;
      }
      setIsUploadingResume(true);
      setTimeout(() => {
        setResumeFileName(file.name);
        setIsUploadingResume(false);
        toast.success(`Resume "${file.name}" validated and uploaded successfully!`);
      }, 600);
    }
  };

  const handleOfferDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`Offer document exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller file.`);
        e.target.value = "";
        return;
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Unsupported file format. Please upload a PDF, PNG, or JPEG file.");
        e.target.value = "";
        return;
      }
      setIsUploadingOffer(true);
      setTimeout(() => {
        setOfferDocumentName(file.name);
        setIsUploadingOffer(false);
        toast.success(
          `${offerDocumentType === "offer_letter" ? "Company offer letter" : "Confirmation mail"} "${file.name}" validated and attached!`
        );
      }, 600);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!declarationAccepted) {
      toast.error("Please accept the declaration before submitting your application.");
      return;
    }

    const numCgpa = parseFloat(cgpa) || 8.0;
    if (numCgpa < 1 || numCgpa > 10) {
      toast.error("Please enter a valid CGPA between 1.0 and 10.0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const result = await campusStore.applyForInternship({
        internshipId: internship.id,
        studentId: currentUser.id || currentUser.rollNo || "u-student",
        fullName,
        enrollmentNumber,
        email: universityEmail,
        phone: mobileNumber,
        course,
        branch,
        semester,
        cgpa: numCgpa,
        tenthPercentage: parseFloat(tenthPercent) || undefined,
        twelfthPercentage: parseFloat(twelfthPercent) || undefined,
        backlogs,
        academicDetails: {
          school: matchingStudent?.school || "School of Technology",
          certifications,
          personalEmail,
          dob,
          gender,
          college,
          schedule: {
            expectedJoiningDate,
            preferredModality,
            dailyShiftTimings,
            commuteArrangement,
          },
          companyDetails: {
            companyName,
            division: companyDivision,
            designation: internshipRole,
            hrMentorName,
            hrEmail,
            hrPhone,
            companyLocation,
            stipend: companyStipend,
            offerDocumentName,
            offerDocumentType,
          },
        },
        address: {
          street: address,
          city,
          state,
          pincode,
        },
        skills: skillsArray,
        projects,
        experience: previousExperience,
        whyInternship,
        careerObjective,
        coverLetter,
        resumeUrl: resumeFileName ? `/resumes/${resumeFileName}` : undefined,
        collegeIdUrl: collegeIdAttached ? `/id-cards/${enrollmentNumber}.pdf` : undefined,
        documents: [
          { name: resumeFileName, url: `/resumes/${resumeFileName}`, type: "resume" },
          { name: `College_ID_${enrollmentNumber}.pdf`, url: `/id-cards/${enrollmentNumber}.pdf`, type: "college_id" },
          ...(offerDocumentName
            ? [
                {
                  name: offerDocumentName,
                  url: `/offer-letters/${offerDocumentName}`,
                  type: offerDocumentType === "confirmation_mail" ? "confirmation_mail" : "offer_letter",
                },
              ]
            : []),
        ],
        declarationAccepted: true,
      });

      if (result.success) {
        setSubmissionSuccessNotice(result.message);
        toast.success("Application submitted successfully!");
      } else {
        toast.error(result.message);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit application.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="internship-form-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1A3C6E] via-[#0E2342] to-[#1A3C6E] p-5 sm:p-6 text-white">
          <div className="pointer-events-none absolute -right-8 -top-8 size-36 rounded-full bg-[#F2A93B]/15 blur-2xl" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#F2A93B]/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#F2A93B]">
                  Official TPC Internship Application
                </span>
                <span className="text-xs text-white/80 font-mono">ID: {internship.id}</span>
              </div>
              <h2 id="internship-form-modal-title" className="mt-2 text-lg sm:text-2xl font-black text-white">
                Application Form — {internship.title}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-white/85">
                <Building2 className="size-3.5 text-[#F2A93B]" />
                <span>{internship.companyName}</span>
                <span>•</span>
                <span>{internship.duration}</span>
                <span>•</span>
                <span>{internship.mode}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close application form"
              className="relative z-20 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/90 transition-all hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Form Body or Success Notice */}
        {submissionSuccessNotice ? (
          <div className="flex-1 overflow-y-auto p-8 text-center flex flex-col items-center justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-10" />
            </div>

            <h3 className="mt-4 text-xl font-black text-foreground">Application Submitted Successfully!</h3>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground leading-relaxed">
              {submissionSuccessNotice}
            </p>

            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 max-w-md text-left text-xs font-semibold text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2 font-black">
                <AlertCircle className="size-4 text-amber-500 shrink-0" />
                <span>IMPORTANT ATTENDANCE NOTICE</span>
              </div>
              <p className="mt-1.5 leading-relaxed">
                Your application is currently waiting for Administration and Dean review. In accordance with university governance, attendance punching remains disabled until your application receives official final approval.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Button
                onClick={() => {
                  onClose();
                  onSuccess();
                }}
                className="rounded-2xl bg-[#1A3C6E] text-xs font-bold text-white px-6"
              >
                Go to My Applications
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Auto-fill notification note */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3.5 text-xs text-blue-800 dark:text-blue-300">
              <Info className="size-4 text-brand shrink-0" />
              <span>
                <strong>Profile Auto-Filled:</strong> Your personal identity, enrollment number, department, and contact details have been automatically imported from your verified campus account.
              </span>
            </div>

            {/* SECTION 1: PERSONAL DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                <User className="size-4 text-[#F2A93B]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  1. Personal Identity & University Credentials
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Full Name (Locked)</label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      disabled
                      value={fullName}
                      className="h-9 w-full rounded-xl border border-border/70 bg-muted/60 pl-3 pr-8 text-xs font-bold text-foreground cursor-not-allowed"
                    />
                    <Lock className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Student ID / Enrollment (Locked)</label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      disabled
                      value={enrollmentNumber}
                      className="h-9 w-full rounded-xl border border-border/70 bg-muted/60 pl-3 pr-8 text-xs font-bold text-foreground font-mono cursor-not-allowed"
                    />
                    <Lock className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">University Email (Official)</label>
                  <input
                    type="email"
                    disabled
                    value={universityEmail}
                    className="mt-1 h-9 w-full rounded-xl border border-border/70 bg-muted/60 px-3 text-xs font-bold text-foreground cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Personal Contact Email</label>
                  <input
                    type="email"
                    required
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Course / Degree</label>
                  <input
                    type="text"
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Branch / Department</label>
                  <input
                    type="text"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Current Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={semester}
                    onChange={(e) => setSemester(parseInt(e.target.value) || 1)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: CONTACT DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                <MapPin className="size-4 text-brand" />
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  2. Residential & Contact Details
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-muted-foreground">Full Address / Hostel Block</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">State / Pincode</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="mt-1 h-9 w-24 rounded-xl border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: ACADEMIC DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                <GraduationCap className="size-4 text-[#F2A93B]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  3. Academic Track Record & Technical Competencies
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Current Cumulative CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.0"
                    max="10.0"
                    required
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">10th Board Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tenthPercent}
                    onChange={(e) => setTenthPercent(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">12th / Diploma Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={twelfthPercent}
                    onChange={(e) => setTwelfthPercent(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Active Backlogs (Count)</label>
                  <input
                    type="number"
                    min={0}
                    value={backlogs}
                    onChange={(e) => setBacklogs(parseInt(e.target.value) || 0)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-muted-foreground">Technical Skills (Comma separated)</label>
                  <input
                    type="text"
                    required
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-muted-foreground">Certifications / Honors</label>
                  <input
                    type="text"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: APPLICATION STATEMENTS & PROJECTS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                <FileText className="size-4 text-brand" />
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  4. Motivation, Projects & Experience
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Why do you want this internship?</label>
                  <textarea
                    rows={3}
                    required
                    value={whyInternship}
                    onChange={(e) => setWhyInternship(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Key Technical Projects</label>
                  <textarea
                    rows={3}
                    required
                    value={projects}
                    onChange={(e) => setProjects(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Previous Experience / Club Roles</label>
                  <textarea
                    rows={2}
                    value={previousExperience}
                    onChange={(e) => setPreviousExperience(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Career Objective</label>
                  <textarea
                    rows={2}
                    value={careerObjective}
                    onChange={(e) => setCareerObjective(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: DOCUMENTS UPLOAD */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                <Upload className="size-4 text-[#F2A93B]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  5. Verification Documents
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Resume Upload Box */}
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground">Resume / Curriculum Vitae</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Required</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-border/70 bg-card p-3">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck2 className="size-5 text-brand shrink-0" />
                      <span className="truncate text-xs font-bold text-foreground">
                        {isUploadingResume ? "Uploading..." : resumeFileName}
                      </span>
                    </div>

                    <label className="cursor-pointer rounded-xl bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand/20">
                      <span>Replace</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* College ID verification */}
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground">University Digital ID Verification</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Verified</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl border border-border/70 bg-card p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-foreground">GSFC Campus ID: {enrollmentNumber}</p>
                        <p className="text-[10px] text-muted-foreground">Digitally signed identity proof attached</p>
                      </div>
                    </div>

                    <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                      Attached
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 6: SCHEDULE & WORK MODALITY */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                <Clock className="size-4 text-[#F2A93B]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  6. Internship Schedule & Work Modality
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Expected Joining Date</label>
                  <input
                    type="date"
                    value={expectedJoiningDate}
                    onChange={(e) => setExpectedJoiningDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Preferred Work Modality</label>
                  <select
                    value={preferredModality}
                    onChange={(e) => setPreferredModality(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  >
                    <option value="In-Plant / On-Site">In-Plant / On-Site</option>
                    <option value="Hybrid (Office + Remote)">Hybrid (Office + Remote)</option>
                    <option value="Remote / Virtual">Remote / Virtual</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Daily Shift Timings</label>
                  <input
                    type="text"
                    value={dailyShiftTimings}
                    onChange={(e) => setDailyShiftTimings(e.target.value)}
                    placeholder="e.g. 09:00 AM - 05:30 PM"
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">Commute / Stay Arrangement</label>
                  <input
                    type="text"
                    value={commuteArrangement}
                    onChange={(e) => setCommuteArrangement(e.target.value)}
                    placeholder="e.g. University Bus / Hostel"
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 7: COMPANY DETAILS & OFFER LETTER / CONFIRMATION MAIL */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/70 pb-2">
                <Building2 className="size-4 text-[#F2A93B]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  7. Company Details & Offer Letter / Confirmation Mail
                </h3>
              </div>

              {/* Requirement Guidance Note */}
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2 font-bold">
                  <Info className="size-4 text-brand shrink-0" />
                  <span>Official Corporate Placement Verification</span>
                </div>
                <p className="mt-1 leading-relaxed text-blue-800/90 dark:text-blue-300">
                  Please verify the sponsoring company details and <strong>upload your official company offer letter or selection confirmation mail</strong>. The Dean's Office and TPC require this document to validate your industrial tenure, issue the formal university NOC, and activate your daily GPS attendance gate.
                </p>
              </div>

              {/* Company Information Inputs */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">
                    Company / Organization Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. GSFC Ltd. / Tata Motors / L&T"
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">
                    Designated Department / Division
                  </label>
                  <input
                    type="text"
                    value={companyDivision}
                    onChange={(e) => setCompanyDivision(e.target.value)}
                    placeholder="e.g. Automation & Edge Systems"
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
                    placeholder="e.g. Graduate Engineering Trainee"
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">
                    HR / Industry Mentor Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={hrMentorName}
                    onChange={(e) => setHrMentorName(e.target.value)}
                    placeholder="e.g. Mr. Rajesh Patel (HR Lead)"
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">
                    Official HR / Mentor Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                    placeholder="e.g. hr.careers@company.com"
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">
                    HR / Office Contact Number
                  </label>
                  <input
                    type="tel"
                    value={hrPhone}
                    onChange={(e) => setHrPhone(e.target.value)}
                    placeholder="e.g. +91 265 2240451"
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground">
                    Monthly Stipend / Remuneration
                  </label>
                  <input
                    type="text"
                    value={companyStipend}
                    onChange={(e) => setCompanyStipend(e.target.value)}
                    placeholder="e.g. ₹15,000 / month"
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
                    placeholder="e.g. P.O. Petrochemicals, Vadodara, Gujarat 391750"
                    className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              {/* Offer Document / Confirmation Mail Upload Box */}
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-foreground">
                      Upload Offer Letter or Confirmation Mail
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      Upload your formal appointment letter or selection confirmation email from the company
                    </p>
                  </div>

                  {/* Document Type Selector */}
                  <div className="flex items-center gap-1 rounded-xl bg-card p-1 border border-border/60">
                    <button
                      type="button"
                      onClick={() => setOfferDocumentType("offer_letter")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all",
                        offerDocumentType === "offer_letter"
                          ? "bg-[#1A3C6E] text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Offer Letter (PDF)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferDocumentType("confirmation_mail")}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all",
                        offerDocumentType === "confirmation_mail"
                          ? "bg-[#1A3C6E] text-white shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Confirmation Mail
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3.5">
                  <div className="flex items-center gap-3 truncate">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#F2A93B]/15 text-[#F2A93B] shrink-0">
                      <FileCheck2 className="size-5" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-xs font-bold text-foreground">
                          {isUploadingOffer ? "Uploading document..." : offerDocumentName}
                        </span>
                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                          {offerDocumentType === "offer_letter" ? "Offer Letter" : "Confirmation Mail"}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Accepted formats: PDF, PNG, JPG, DOCX (Max 10MB)
                      </p>
                    </div>
                  </div>

                  <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1A3C6E]/10 hover:bg-[#1A3C6E]/20 text-[#1A3C6E] dark:bg-white/10 dark:hover:bg-white/20 dark:text-white px-4 py-2 text-xs font-bold transition-colors shrink-0">
                    <Upload className="size-3.5" />
                    <span>Replace Document</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      onChange={handleOfferDocumentSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 8: DECLARATION & CONSENT */}
            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                8. Student Declaration & Attendance Agreement
              </h4>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="mt-1 size-4 rounded border-border text-brand focus:ring-brand"
                />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  I confirm that all personal, academic, and company offer details provided above (including the attached offer letter / confirmation email) are authentic and correct. I agree to strictly abide by the university's internship rules, corporate workplace policies, and the daily live GPS attendance punch requirements. I understand that falsification will result in immediate disqualification and disciplinary action by the Dean's Office.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-border/70 pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-2xl text-xs font-bold">
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || isUploadingResume || isUploadingOffer || !declarationAccepted}
                className="gap-2 rounded-2xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] px-8 text-xs font-black text-white shadow-lg shadow-[#1A3C6E]/20 hover:opacity-95 disabled:opacity-50"
              >
                <Send className="size-4 text-[#F2A93B]" />
                {isUploadingResume || isUploadingOffer ? "Uploading Document..." : isSubmitting ? "Submitting Application..." : "Submit Application"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
