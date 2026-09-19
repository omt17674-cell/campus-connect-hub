import React, { useState } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
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

  // Documents
  const [resumeFileName, setResumeFileName] = useState<string>("Resume_Om_Thakkar_2026.pdf");
  const [collegeIdAttached, setCollegeIdAttached] = useState<boolean>(true);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessNotice, setSubmissionSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResumeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingResume(true);
      setTimeout(() => {
        setResumeFileName(file.name);
        setIsUploadingResume(false);
        toast.success(`Resume "${file.name}" uploaded successfully!`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1A3C6E] via-[#0E2342] to-[#1A3C6E] p-5 sm:p-6 text-white">
          <div className="absolute -right-8 -top-8 size-36 rounded-full bg-[#F2A93B]/15 blur-2xl" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#F2A93B]/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#F2A93B]">
                  Official TPC Internship Application
                </span>
                <span className="text-xs text-white/80 font-mono">ID: {internship.id}</span>
              </div>
              <h2 className="mt-2 text-lg sm:text-2xl font-black text-white">
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
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="size-4" />
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

            {/* SECTION 6: DECLARATION & CONSENT */}
            <div className="rounded-2xl border border-border/80 bg-card/60 p-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                6. Student Declaration & Attendance Agreement
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
                  I confirm that the information provided by me is correct, and I agree to strictly abide by the university's internship rules, corporate workplace policies, and the daily live GPS attendance punch requirements. I understand that falsification will result in immediate disqualification and disciplinary action by the Dean's Office.
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
                disabled={isSubmitting || !declarationAccepted}
                className="gap-2 rounded-2xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] px-8 text-xs font-black text-white shadow-lg shadow-[#1A3C6E]/20 hover:opacity-95 disabled:opacity-50"
              >
                <Send className="size-4 text-[#F2A93B]" />
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
