import { useState } from "react";
import {
  Award,
  Bell,
  Briefcase,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  GraduationCap,
  Layers,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusState, campusStore } from "@/lib/campus-store";
import { Internship, InternshipApplication } from "@/lib/types";
import { InternshipListingView } from "./InternshipListingView";
import { InternshipApplicationModal } from "./InternshipApplicationModal";
import { MyInternshipApplicationsView } from "./MyInternshipApplicationsView";
import { InternshipGpsPunchView } from "./InternshipGpsPunchView";
import { DeanNocRequestModal } from "./DeanNocRequestModal";
import { cn } from "@/lib/utils";

interface StudentInternshipsHubProps {
  state: CampusState;
}

export type InternshipHubTab =
  | "available"
  | "apply"
  | "applications"
  | "attendance"
  | "status";

export function StudentInternshipsHub({ state }: StudentInternshipsHubProps) {
  const [activeTab, setActiveTab] = useState<InternshipHubTab>("available");
  const [selectedInternshipForApply, setSelectedInternshipForApply] = useState<Internship | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isNocModalOpen, setIsNocModalOpen] = useState(false);
  const [targetAppIdForPunch, setTargetAppIdForPunch] = useState<string | undefined>(undefined);

  const currentUser = state.currentUser;
  const matchingStudent = (state.newRegisteredStudents || []).find(
    (s) =>
      (currentUser.rollNo && s.rollNo.toUpperCase() === currentUser.rollNo.toUpperCase()) ||
      (currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase())
  );

  const allInternships = state.internships || [];
  const myApplications = (state.internshipApplications || []).filter(
    (a) =>
      a.studentId === currentUser.id ||
      a.enrollmentNumber.toUpperCase() === (currentUser.rollNo || "").toUpperCase()
  );

  const appliedInternshipIds = new Set(myApplications.map((a) => a.internshipId));
  const myAttendanceRecords = state.internshipAttendance || [];

  const handleOpenApply = (internship: Internship) => {
    setSelectedInternshipForApply(internship);
    setIsApplyModalOpen(true);
  };

  const handleNavigateToPunch = (applicationId: string) => {
    setTargetAppIdForPunch(applicationId);
    setActiveTab("attendance");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-Navigation Pill Bar for Internships */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("available")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "available"
                ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Briefcase className="mr-1.5 size-3.5" />
            Available Internships ({allInternships.length})
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (allInternships.length > 0) {
                setSelectedInternshipForApply(allInternships[0]);
                setIsApplyModalOpen(true);
              } else {
                setActiveTab("available");
              }
            }}
            className={cn(
              "rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground"
            )}
          >
            <Send className="mr-1.5 size-3.5 text-[#F2A93B]" />
            Apply for Internship
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("applications")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "applications"
                ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="mr-1.5 size-3.5" />
            My Applications ({myApplications.length})
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("attendance")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "attendance"
                ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MapPin className="mr-1.5 size-3.5 text-emerald-500" />
            GPS Attendance / Punch
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("status")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "status"
                ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldCheck className="mr-1.5 size-3.5 text-[#F2A93B]" />
            Internship Status & Tenure
          </Button>
        </div>
      </div>

      {/* View 1: Available Internships */}
      {activeTab === "available" && (
        <InternshipListingView
          internships={allInternships}
          appliedInternshipIds={appliedInternshipIds}
          currentUser={currentUser}
          onApply={handleOpenApply}
        />
      )}

      {/* View 2: My Applications */}
      {activeTab === "applications" && (
        <MyInternshipApplicationsView
          applications={myApplications}
          internships={allInternships}
          onNavigateToPunch={handleNavigateToPunch}
          onBrowseInternships={() => setActiveTab("available")}
        />
      )}

      {/* View 3: GPS Attendance & Punch */}
      {activeTab === "attendance" && (
        <InternshipGpsPunchView
          currentUser={currentUser}
          applications={myApplications}
          internships={allInternships}
          attendanceRecords={myAttendanceRecords}
          initialApplicationId={targetAppIdForPunch}
        />
      )}

      {/* View 4: Internship Status & Tenure Overview */}
      {activeTab === "status" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/80 bg-card/85 p-6 shadow-sm backdrop-blur-xl">
            <h3 className="text-base font-black text-foreground">Active Tenure & Progress Summary</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cumulative dashboard for authorized corporate & industrial engagements.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Applications</span>
                <p className="mt-1 text-2xl font-black text-brand">{myApplications.length}</p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Approved / Active</span>
                <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {myApplications.filter((a) => a.status === "APPROVED" || a.status === "ACTIVE").length}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Days Present</span>
                <p className="mt-1 text-2xl font-black text-[#F2A93B]">{myAttendanceRecords.length}</p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <span className="text-[10px] font-black uppercase text-muted-foreground">Dean Sanction</span>
                <p className="mt-1 text-2xl font-black text-foreground">
                  {myApplications.some((a) => a.status === "APPROVED" || a.status === "ACTIVE") ? "🟢 Yes" : "⏳ Pending"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
              <div>
                <span className="text-xs font-bold text-foreground">
                  Need official Dean NOC or recommendation letter?
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Request an authorized No Objection Certificate from Dr. Ananya Sharma (Dean, School of Technology).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNocModalOpen(true)}
                className="rounded-full bg-[#F2A93B] hover:bg-[#F2A93B]/90 active:scale-95 text-[#0E2342] font-black text-xs px-5 py-2 transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Request Dean NOC Letter</span>
              </button>
            </div>
          </div>

          <MyInternshipApplicationsView
            applications={myApplications}
            internships={allInternships}
            onNavigateToPunch={handleNavigateToPunch}
            onBrowseInternships={() => setActiveTab("available")}
          />
        </div>
      )}

      {/* Application Modal */}
      {isApplyModalOpen && selectedInternshipForApply && (
        <InternshipApplicationModal
          internship={selectedInternshipForApply}
          currentUser={currentUser}
          matchingStudent={matchingStudent}
          isOpen={isApplyModalOpen}
          onClose={() => {
            setIsApplyModalOpen(false);
            setSelectedInternshipForApply(null);
          }}
          onSuccess={() => {
            setIsApplyModalOpen(false);
            setActiveTab("applications");
          }}
        />
      )}

      {/* Dean NOC Request Modal */}
      {isNocModalOpen && (
        <DeanNocRequestModal
          isOpen={isNocModalOpen}
          onClose={() => setIsNocModalOpen(false)}
          currentUser={currentUser}
          matchingStudent={matchingStudent}
          applications={myApplications}
          internships={allInternships}
        />
      )}
    </div>
  );
}
