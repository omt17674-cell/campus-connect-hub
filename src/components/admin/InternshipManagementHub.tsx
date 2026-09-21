import { useState, useMemo, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { PaginationControls } from "@/components/common/PaginationControls";
import { subscribeAdminInternshipRealtime } from "@/lib/campus-store";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CampusState,
  campusStore,
} from "@/lib/campus-store";
import {
  Internship,
  InternshipApplication,
  InternshipAttendanceRecord,
} from "@/lib/types";
import { InternshipAttendanceMapModal } from "./InternshipAttendanceMapModal";
import { DateRangeFilter } from "./DateRangeFilter";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InternshipManagementHubProps {
  state: CampusState;
}

export type AdminInternshipTab =
  | "overview"
  | "review_queue"
  | "attendance"
  | "post_new"
  | "reports";

export function InternshipManagementHub({ state }: InternshipManagementHubProps) {
  const [activeTab, setActiveTab] = useState<AdminInternshipTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<InternshipApplication | null>(null);

  // Review comment dialog
  const [reviewDialogMode, setReviewDialogMode] = useState<
    "approve" | "reject" | "changes" | null
  >(null);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Map Inspector Modal
  const [mapModalRecord, setMapModalRecord] = useState<InternshipAttendanceRecord | null>(null);

  // Post New Internship Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newDepartment, setNewDepartment] = useState("Computer Science & Engineering");
  const [newMode, setNewMode] = useState<"On-site" | "Hybrid" | "Remote">("On-site");
  const [newLocation, setNewLocation] = useState("Vadodara, Gujarat");
  const [newStipend, setNewStipend] = useState("₹20,000 / month");
  const [newDuration, setNewDuration] = useState("6 Months");
  const [newPositions, setNewPositions] = useState(3);
  const [newStartDate, setNewStartDate] = useState("2026-10-01");
  const [newEndDate, setNewEndDate] = useState("2027-03-31");
  const [newWorkingHours, setNewWorkingHours] = useState("09:00 AM - 05:30 PM (Mon-Fri)");
  const [newDeadline, setNewDeadline] = useState("2026-11-15");
  const [newEligibility, setNewEligibility] = useState("Min CGPA: 7.0, Semester 6 or 8");
  const [newContactPerson, setNewContactPerson] = useState("Er. Rajesh Varma");
  const [newContactEmail, setNewContactEmail] = useState("careers@organization.com");
  const [newSkills, setNewSkills] = useState("Python, React, SQL, Problem Solving");
  const [newDescription, setNewDescription] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 350);
  const [appPage, setAppPage] = useState(1);
  const [appPageSize, setAppPageSize] = useState(25);
  const [attPage, setAttPage] = useState(1);
  const [attPageSize, setAttPageSize] = useState(25);
  const [attendanceStartDate, setAttendanceStartDate] = useState("");
  const [attendanceEndDate, setAttendanceEndDate] = useState("");

  useEffect(() => {
    const unsub = subscribeAdminInternshipRealtime(() => {
      campusStore.loadFromSupabase(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setAppPage(1);
  }, [debouncedSearch, statusFilter, activeTab]);

  const internships = state.internships || [];
  const applications = state.internshipApplications || [];
  const attendanceRecords = state.internshipAttendance || [];

  // Memoized Metrics for production performance (100+ concurrent records)
  const {
    totalApps,
    pendingAdminApps,
    pendingDeanApps,
    approvedActiveApps,
    rejectedApps,
    changesRequestedApps,
    todayAttendance,
  } = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return {
      totalApps: applications.length,
      pendingAdminApps: applications.filter((a) => a.status === "ADMIN_REVIEW" || a.status === "SUBMITTED"),
      pendingDeanApps: applications.filter((a) => a.status === "DEAN_REVIEW" || a.status === "ADMIN_APPROVED"),
      approvedActiveApps: applications.filter((a) => a.status === "APPROVED" || a.status === "ACTIVE"),
      rejectedApps: applications.filter((a) => a.status === "REJECTED"),
      changesRequestedApps: applications.filter((a) => a.status === "CHANGES_REQUESTED"),
      todayAttendance: attendanceRecords.filter((a) => a.attendanceDate === todayStr),
    };
  }, [applications, attendanceRecords]);

  const getInternship = (id: string) => internships.find((i) => i.id === id);

  // Filtered Applications with debounced search
  const filteredApplications = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return applications.filter((app) => {
      const intn = getInternship(app.internshipId);
      const matchesSearch =
        !q ||
        app.fullName.toLowerCase().includes(q) ||
        app.enrollmentNumber.toLowerCase().includes(q) ||
        app.applicationNumber.toLowerCase().includes(q) ||
        (intn?.companyName.toLowerCase().includes(q) ?? false) ||
        (intn?.title.toLowerCase().includes(q) ?? false);

      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, debouncedSearch, statusFilter, internships]);

  const queueFilteredApplications = useMemo(() => {
    return filteredApplications.filter((app) => {
      if (activeTab === "review_queue") {
        return app.status === "ADMIN_REVIEW" || app.status === "SUBMITTED";
      }
      return true;
    });
  }, [filteredApplications, activeTab]);

  const paginatedApplications = useMemo(() => {
    return queueFilteredApplications.slice((appPage - 1) * appPageSize, appPage * appPageSize);
  }, [queueFilteredApplications, appPage, appPageSize]);

  const paginatedAttendance = useMemo(() => {
    const filtered = attendanceRecords.filter((record) => {
      if (attendanceStartDate && record.attendanceDate < attendanceStartDate) return false;
      if (attendanceEndDate && record.attendanceDate > attendanceEndDate) return false;
      return true;
    });
    return filtered.slice((attPage - 1) * attPageSize, attPage * attPageSize);
  }, [attendanceRecords, attendanceStartDate, attendanceEndDate, attPage, attPageSize]);

  const filteredAttendanceCount = useMemo(
    () => attendanceRecords.filter((record) => {
      if (attendanceStartDate && record.attendanceDate < attendanceStartDate) return false;
      if (attendanceEndDate && record.attendanceDate > attendanceEndDate) return false;
      return true;
    }).length,
    [attendanceRecords, attendanceStartDate, attendanceEndDate]
  );

  // Action Handlers
  const handleOpenReviewDialog = (
    mode: "admin_approve" | "admin_reject" | "admin_changes" | "dean_approve" | "dean_reject"
  ) => {
    setReviewDialogMode(mode);
    setReviewComment("");
  };

  const handleExecuteReview = async () => {
    if (!selectedApplication || !reviewDialogMode) return;
    setIsSubmittingReview(true);

    try {
      if (reviewDialogMode === "admin_approve") {
        const res = await campusStore.adminReviewApplication(
          selectedApplication.id,
          "approve",
          reviewComment || "Approved by Administration and recommended to Dean."
        );
        toast.success(res.message);
      } else if (reviewDialogMode === "admin_reject") {
        if (!reviewComment.trim()) {
          toast.error("Please provide a rejection reason.");
          setIsSubmittingReview(false);
          return;
        }
        const res = await campusStore.adminReviewApplication(
          selectedApplication.id,
          "reject",
          reviewComment
        );
        toast.success(res.message);
      } else if (reviewDialogMode === "admin_changes") {
        if (!reviewComment.trim()) {
          toast.error("Please specify the requested changes.");
          setIsSubmittingReview(false);
          return;
        }
        const res = await campusStore.adminReviewApplication(
          selectedApplication.id,
          "changes_requested",
          reviewComment
        );
        toast.success(res.message);
      } else if (reviewDialogMode === "dean_approve") {
        const res = await campusStore.deanReviewApplication(
          selectedApplication.id,
          "approve",
          reviewComment || "Official Dean sanction granted. Student authorized for live GPS punch."
        );
        toast.success(res.message);
      } else if (reviewDialogMode === "dean_reject") {
        if (!reviewComment.trim()) {
          toast.error("Please provide a rejection reason.");
          setIsSubmittingReview(false);
          return;
        }
        const res = await campusStore.deanReviewApplication(
          selectedApplication.id,
          "reject",
          reviewComment
        );
        toast.success(res.message);
      }

      setReviewDialogMode(null);
      setSelectedApplication(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to process review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handlePostInternship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) {
      toast.error("Please enter a title and company name.");
      return;
    }

    const skillsArray = newSkills.split(",").map((s) => s.trim()).filter(Boolean);
    const res = campusStore.createInternship({
      title: newTitle,
      companyName: newCompany,
      department: newDepartment,
      mode: newMode,
      location: newLocation,
      stipend: newStipend,
      duration: newDuration,
      positions: newPositions,
      startDate: newStartDate,
      endDate: newEndDate,
      workingHours: newWorkingHours,
      applicationDeadline: newDeadline,
      eligibility: newEligibility,
      contactPerson: newContactPerson,
      contactEmail: newContactEmail,
      skillsRequired: skillsArray,
      description: newDescription || `${newTitle} opportunity with ${newCompany}.`,
      requiredDocuments: ["Resume/CV", "College ID Card"],
      status: "open",
    });

    toast.success(`Internship "${res.internship.title}" posted successfully!`);
    setNewTitle("");
    setNewCompany("");
    setNewDescription("");
    setActiveTab("overview");
  };

  const handleExportCsv = () => {
    const rows = [
      ["GSFC UNIVERSITY — INSTITUTIONAL INTERNSHIP REPORT"],
      ["Generated At", new Date().toISOString()],
      ["Total Applications", String(totalApps)],
      ["Approved & Active", String(approvedActiveApps.length)],
      [],
      [
        "Application ID",
        "Student Name",
        "Enrollment Number",
        "Department",
        "Company Name",
        "Internship Title",
        "Mode",
        "Start Date",
        "End Date",
        "Status",
        "Admin Reviewer",
        "Dean Reviewer",
        "Days Logged",
        "Total Hours Logged",
      ],
      ...applications.map((app) => {
        const intn = getInternship(app.internshipId);
        const studentPunches = attendanceRecords.filter((a) => a.applicationId === app.id);
        const completedPunches = studentPunches.filter((a) => a.punchOutTime);
        return [
          app.applicationNumber,
          app.fullName,
          app.enrollmentNumber,
          app.branch,
          intn?.companyName || "N/A",
          intn?.title || "N/A",
          intn?.mode || "On-site",
          intn?.startDate || "N/A",
          intn?.endDate || "N/A",
          app.status,
          app.adminReviewedBy || "Pending",
          app.deanReviewedBy || "Pending",
          String(studentPunches.length),
          `${completedPunches.length * 8}h (Est.)`,
        ];
      }),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSFC_Internships_Governance_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Internship institutional report exported successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand">
              University Administration & Dean Governance
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
              Live GPS Verification Active
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
            Internship Governance & Approval Command Center
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Two-tier review queue (Administration & Dean), live GPS punch telemetrics, application auditing, and reporting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setActiveTab("post_new")}
            className="h-9 gap-1.5 rounded-2xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] text-xs font-black text-white shadow-md hover:opacity-95"
          >
            <Plus className="size-4 text-[#F2A93B]" />
            <span>Post Internship</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="h-9 gap-1.5 rounded-2xl border-border/80 text-xs font-bold shadow-sm"
          >
            <Download className="size-4 text-brand" />
            <span>Export CSV Report</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-border/70 bg-card/70 p-3.5 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Applications</span>
          <p className="mt-1 text-xl font-black text-foreground">{totalApps}</p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Pending Admin
          </span>
          <p className="mt-1 text-xl font-black text-amber-600 dark:text-amber-400">
            {pendingAdminApps.length}
          </p>
        </div>

        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-3.5 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Pending Dean
          </span>
          <p className="mt-1 text-xl font-black text-blue-600 dark:text-blue-400">
            {pendingDeanApps.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Approved & Active
          </span>
          <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
            {approvedActiveApps.length}
          </p>
        </div>

        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">
            Rejected
          </span>
          <p className="mt-1 text-xl font-black text-destructive">{rejectedApps.length}</p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/40 p-3.5 backdrop-blur-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Today's Punches</span>
          <p className="mt-1 text-xl font-black text-brand">{todayAttendance.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border/70 bg-card/60 p-1 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "overview" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="mr-1.5 size-3.5" /> All Applications ({totalApps})
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("admin_queue")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "admin_queue" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="mr-1.5 size-3.5 text-amber-500" />
          Admin Review Queue ({pendingAdminApps.length})
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("dean_queue")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "dean_queue" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ShieldCheck className="mr-1.5 size-3.5 text-[#F2A93B]" />
          Dean Final Approval ({pendingDeanApps.length})
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("attendance")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "attendance" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MapPin className="mr-1.5 size-3.5 text-emerald-500" />
          GPS Attendance & Locations ({attendanceRecords.length})
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("post_new")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "post_new" ? "bg-[#1A3C6E] text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Plus className="mr-1.5 size-3.5" /> Post Opportunity
        </Button>
      </div>

      {/* TAB 1 & 2 & 3: Applications Tables */}
      {(activeTab === "overview" || activeTab === "admin_queue" || activeTab === "dean_queue") && (
        <div className="space-y-4">
          {/* Search and status filter */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-3.5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by student name, roll number, application ID, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-xl border border-border bg-background/80 pl-10 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none"
              />
            </div>

            {activeTab === "overview" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-xl border border-border bg-background/80 px-3 text-xs font-bold text-foreground focus:border-brand focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="ADMIN_REVIEW">Pending Admin</option>
                <option value="DEAN_REVIEW">Pending Dean</option>
                <option value="APPROVED">Approved / Active</option>
                <option value="CHANGES_REQUESTED">Changes Requested</option>
                <option value="REJECTED">Rejected</option>
              </select>
            )}
          </div>

          {/* Applications Table */}
          <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/85 shadow-sm backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    <th className="p-3.5">App ID</th>
                    <th className="p-3.5">Student Details</th>
                    <th className="p-3.5">Internship & Company</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Applied Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {paginatedApplications.map((app) => {
                      const intn = getInternship(app.internshipId);

                      return (
                        <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-brand">{app.applicationNumber}</td>
                          <td className="p-3.5">
                            <p className="font-bold text-foreground">{app.fullName}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">{app.enrollmentNumber}</p>
                          </td>
                          <td className="p-3.5">
                            <p className="font-bold text-foreground truncate max-w-xs">{intn?.title || "Internship"}</p>
                            <p className="text-[10px] text-muted-foreground">{intn?.companyName || "Company"}</p>
                          </td>
                          <td className="p-3.5 font-medium text-foreground">{app.branch}</td>
                          <td className="p-3.5 text-muted-foreground">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase",
                                app.status === "APPROVED" || app.status === "ACTIVE"
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                  : app.status === "DEAN_REVIEW"
                                  ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                  : app.status === "ADMIN_REVIEW"
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                  : app.status === "CHANGES_REQUESTED"
                                  ? "bg-orange-500/15 text-orange-700 dark:text-orange-300"
                                  : "bg-destructive/15 text-destructive"
                              )}
                            >
                              {app.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApplication(app)}
                              className="h-8 gap-1 rounded-xl text-xs font-bold hover:bg-brand/10 hover:text-brand"
                            >
                              <Eye className="size-3.5" />
                              <span>Review</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Applications */}
            <PaginationControls
              currentPage={appPage}
              totalItems={queueFilteredApplications.length}
              pageSize={appPageSize}
              onPageChange={setAppPage}
              onPageSizeChange={setAppPageSize}
              pageSizeOptions={[10, 25, 50]}
            />
          </div>
        </div>
      )}

      {/* TAB 4: GPS ATTENDANCE ROSTER */}
      {activeTab === "attendance" && (
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/85 p-6 shadow-sm backdrop-blur-xl space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-border/60 pb-4">
            <div>
              <h3 className="text-base font-black text-foreground">
                Live Geolocation Punch Audit Roster
              </h3>
              <p className="text-xs text-muted-foreground">
                Audited GPS coordinates, reverse-geocoded physical addresses, and telemetry timestamps.
              </p>
            </div>

            <Button
              onClick={handleExportCsv}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <Download className="size-3.5 text-brand" />
              Export Roster
            </Button>
          </div>

          <DateRangeFilter
            startDate={attendanceStartDate}
            endDate={attendanceEndDate}
            onDateChange={(start, end) => {
              setAttendanceStartDate(start);
              setAttendanceEndDate(end);
              setAttPage(1);
            }}
            label="Attendance Date"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/70 bg-muted/40 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Internship</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Punch In</th>
                  <th className="p-3.5">Punch Out</th>
                  <th className="p-3.5">Working Duration</th>
                  <th className="p-3.5">Location & Address</th>
                  <th className="p-3.5">GPS Fix</th>
                  <th className="p-3.5 text-right">Map</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedAttendance.map((rec) => {
                  const app = applications.find((a) => a.id === rec.applicationId);
                  const intn = getInternship(rec.internshipId);

                  return (
                    <tr key={rec.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-foreground">{app?.fullName || "Student"}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{app?.enrollmentNumber}</p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-foreground truncate max-w-xs">{intn?.title || "Internship"}</p>
                        <p className="text-[10px] text-muted-foreground">{intn?.companyName}</p>
                      </td>
                      <td className="p-3.5 font-medium text-foreground">
                        {new Date(rec.attendanceDate).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {new Date(rec.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {rec.punchOutTime
                          ? new Date(rec.punchOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Active"}
                      </td>
                      <td className="p-3.5 font-bold text-foreground">{rec.workingDuration || "In Progress"}</td>
                      <td className="p-3.5 max-w-xs truncate text-muted-foreground" title={rec.punchInAddress}>
                        {rec.punchInAddress}
                      </td>
                      <td className="p-3.5 font-mono text-[10px] text-brand">
                        ±{rec.punchInAccuracy}m
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          onClick={() => setMapModalRecord(rec)}
                          className="h-8 gap-1 rounded-xl bg-[#1A3C6E] text-[11px] font-bold text-white hover:opacity-95"
                        >
                          <MapPin className="size-3 text-[#F2A93B]" />
                          View on Map
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {paginatedAttendance.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-sm font-semibold text-muted-foreground">
                      No internship attendance records match the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Attendance */}
          <PaginationControls
            currentPage={attPage}
            totalItems={filteredAttendanceCount}
            pageSize={attPageSize}
            onPageChange={setAttPage}
            onPageSizeChange={setAttPageSize}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      )}

      {/* TAB 5: POST NEW INTERNSHIP */}
      {activeTab === "post_new" && (
        <form
          onSubmit={handlePostInternship}
          className="rounded-3xl border border-border/80 bg-card/85 p-6 shadow-sm backdrop-blur-xl space-y-6"
        >
          <div>
            <h3 className="text-base font-black text-foreground">Post New Corporate Internship Opportunity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Publish vetted corporate opportunities for students of GSFC University.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground">Internship Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Industrial Automation Intern"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Company / Organization</label>
              <input
                type="text"
                required
                placeholder="e.g. GSFC Ltd."
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Department</label>
              <input
                type="text"
                required
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Workplace Mode</label>
              <select
                value={newMode}
                onChange={(e) => setNewMode(e.target.value as any)}
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:border-brand focus:outline-none"
              >
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Location</label>
              <input
                type="text"
                required
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Monthly Stipend</label>
              <input
                type="text"
                required
                value={newStipend}
                onChange={(e) => setNewStipend(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Start Date</label>
              <input
                type="date"
                required
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">End Date</label>
              <input
                type="date"
                required
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Number of Positions</label>
              <input
                type="number"
                min={1}
                required
                value={newPositions}
                onChange={(e) => setNewPositions(parseInt(e.target.value) || 1)}
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-muted-foreground">Skills Required (Comma separated)</label>
              <input
                type="text"
                required
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground">Eligibility</label>
              <input
                type="text"
                required
                value={newEligibility}
                onChange={(e) => setNewEligibility(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-muted-foreground">Role Description & Responsibilities</label>
              <textarea
                rows={3}
                required
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe key responsibilities and deliverables..."
                className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border/70 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveTab("overview")}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gap-2 rounded-xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] px-6 text-xs font-black text-white"
            >
              <Plus className="size-4 text-[#F2A93B]" />
              Publish Opportunity
            </Button>
          </div>
        </form>
      )}

      {/* COMPLETE APPLICATION REVIEW MODAL (Admin & Dean Actions) */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md">
          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border/70 bg-gradient-to-r from-[#1A3C6E] via-[#0E2342] to-[#1A3C6E] p-6 text-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#F2A93B]/20 px-3 py-0.5 text-[10px] font-black uppercase text-[#F2A93B]">
                    Application Inspection
                  </span>
                  <span className="font-mono text-xs text-white/80">{selectedApplication.applicationNumber}</span>
                </div>
                <h3 className="mt-2 text-xl font-black text-white">
                  {selectedApplication.fullName} ({selectedApplication.enrollmentNumber})
                </h3>
                <p className="mt-0.5 text-xs text-white/80">
                  {selectedApplication.course} · {selectedApplication.branch} (Sem {selectedApplication.semester}) · CGPA: {selectedApplication.cgpa}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Internship details */}
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Target Opportunity</span>
                <p className="text-sm font-black text-foreground mt-1">
                  {getInternship(selectedApplication.internshipId)?.title}
                </p>
                <p className="text-xs font-semibold text-brand">
                  {getInternship(selectedApplication.internshipId)?.companyName} · {getInternship(selectedApplication.internshipId)?.duration}
                </p>
              </div>

              {/* Student Academic & Contact Details */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                <div className="rounded-xl border border-border/70 p-3 bg-card">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Email</span>
                  <p className="font-bold text-foreground mt-0.5 truncate">{selectedApplication.email}</p>
                </div>
                <div className="rounded-xl border border-border/70 p-3 bg-card">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Phone</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedApplication.phone}</p>
                </div>
                <div className="rounded-xl border border-border/70 p-3 bg-card">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">CGPA</span>
                  <p className="font-black text-brand text-sm mt-0.5">{selectedApplication.cgpa}</p>
                </div>
                <div className="rounded-xl border border-border/70 p-3 bg-card">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Backlogs</span>
                  <p className="font-black text-foreground mt-0.5">{selectedApplication.backlogs ?? 0}</p>
                </div>
              </div>

              {/* Motivation & Skills */}
              <div className="space-y-3">
                <div className="rounded-xl border border-border/70 p-3.5 bg-card">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Statement of Purpose</span>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/90">
                    {selectedApplication.whyInternship || "Not provided."}
                  </p>
                </div>

                <div className="rounded-xl border border-border/70 p-3.5 bg-card">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Projects & Technical Experience</span>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/90">
                    {selectedApplication.projects || "Not provided."}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Reported Skills</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {selectedApplication.skills.map((s, i) => (
                      <span key={i} className="rounded-lg bg-brand/10 text-brand px-2 py-0.5 text-xs font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attached Documents */}
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Attached Verification Documents</span>
                <div className="mt-2 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3.5 py-2 text-xs font-bold">
                    <FileCheck2 className="size-4 text-brand" />
                    <span>{selectedApplication.resumeUrl ? "Verified Resume (PDF)" : "Resume Attached"}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3.5 py-2 text-xs font-bold">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>College Identity Proof (Verified)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-muted/30 p-4 sm:px-6">
              <Button
                variant="ghost"
                onClick={() => setSelectedApplication(null)}
                className="rounded-xl text-xs font-bold"
              >
                Close
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Administration Actions */}
                {(selectedApplication.status === "ADMIN_REVIEW" || selectedApplication.status === "SUBMITTED") && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReviewDialog("admin_changes")}
                      className="rounded-xl text-xs font-bold border-orange-500/40 text-orange-600 hover:bg-orange-500/10"
                    >
                      Request Changes
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReviewDialog("admin_reject")}
                      className="rounded-xl text-xs font-bold border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      Reject Application
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleOpenReviewDialog("admin_approve")}
                      className="rounded-xl bg-[#1A3C6E] text-xs font-black text-white hover:opacity-95"
                    >
                      <Check className="size-3.5 mr-1 text-[#F2A93B]" />
                      Approve & Forward to Dean
                    </Button>
                  </>
                )}

                {/* Dean Review Actions */}
                {(selectedApplication.status === "DEAN_REVIEW" || selectedApplication.status === "ADMIN_APPROVED") && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReviewDialog("dean_reject")}
                      className="rounded-xl text-xs font-bold border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      Dean Reject
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleOpenReviewDialog("dean_approve")}
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-[#1A3C6E] text-xs font-black text-white shadow-md hover:opacity-95"
                    >
                      <ShieldCheck className="size-4 mr-1 text-[#F2A93B]" />
                      Dean Final Sanction & Activate
                    </Button>
                  </>
                )}

                {/* Already approved */}
                {(selectedApplication.status === "APPROVED" || selectedApplication.status === "ACTIVE") && (
                  <span className="rounded-xl bg-emerald-500/15 px-3 py-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    ✓ Officially Approved & Active
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Comment Prompt Dialog */}
      {reviewDialogMode && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-foreground">
              {reviewDialogMode === "admin_approve" && "Approve Application (Forward to Dean)"}
              {reviewDialogMode === "admin_reject" && "Reject Application (Administration)"}
              {reviewDialogMode === "admin_changes" && "Request Changes from Student"}
              {reviewDialogMode === "dean_approve" && "Final Dean Sanction & Activation"}
              {reviewDialogMode === "dean_reject" && "Reject Application (Dean)"}
            </h3>

            <p className="text-xs text-muted-foreground">
              Application: <strong>{selectedApplication.applicationNumber}</strong> · Student: <strong>{selectedApplication.fullName}</strong>
            </p>

            <div>
              <label className="text-xs font-bold text-muted-foreground">
                Official Remarks / Decision Comment {reviewDialogMode.includes("reject") || reviewDialogMode.includes("changes") ? "(Required)" : "(Optional)"}
              </label>
              <textarea
                rows={3}
                required={reviewDialogMode.includes("reject") || reviewDialogMode.includes("changes")}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Enter formal justification or feedback for the student..."
                className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReviewDialogMode(null)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                disabled={isSubmittingReview}
                onClick={handleExecuteReview}
                className={cn(
                  "rounded-xl text-xs font-black text-white",
                  reviewDialogMode.includes("reject")
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-[#1A3C6E] hover:opacity-95"
                )}
              >
                {isSubmittingReview ? "Processing..." : "Confirm Decision"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Map Inspection Modal */}
      {mapModalRecord && (
        <InternshipAttendanceMapModal
          record={mapModalRecord}
          studentName={applications.find((a) => a.id === mapModalRecord.applicationId)?.fullName}
          enrollmentNumber={applications.find((a) => a.id === mapModalRecord.applicationId)?.enrollmentNumber}
          internshipTitle={getInternship(mapModalRecord.internshipId)?.title}
          companyName={getInternship(mapModalRecord.internshipId)?.companyName}
          isOpen={Boolean(mapModalRecord)}
          onClose={() => setMapModalRecord(null)}
        />
      )}
    </div>
  );
}
