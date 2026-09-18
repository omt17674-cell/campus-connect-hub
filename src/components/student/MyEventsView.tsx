import { useState } from "react";
import {
  Award,
  Calendar,
  CalendarPlus,
  Check,
  Clock,
  Download,
  FileCheck,
  Lock,
  MapPin,
  Search,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampusEvent, Registration } from "@/lib/types";
import { campusStore, CampusState } from "@/lib/campus-store";
import { generateCertificatePdf } from "@/lib/certificate-generator";
import { getGoogleCalendarUrl, downloadIcsFile } from "@/lib/calendar-utils";
import { ActivityPointsCard } from "./ActivityPointsCard";
import { EventFeedbackModal } from "./EventFeedbackModal";
import { cn } from "@/lib/utils";

interface MyEventsViewProps {
  state: CampusState;
  onSelectEvent: (event: CampusEvent) => void;
  onOpenPunchModal?: (event: CampusEvent) => void;
}

export function MyEventsView({ state, onSelectEvent, onOpenPunchModal }: MyEventsViewProps) {
  const [activeTab, setActiveTab] = useState<"registered" | "attended" | "past">("registered");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackEvent, setFeedbackEvent] = useState<CampusEvent | null>(null);
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);

  const currentUser = state?.currentUser || {
    id: "",
    name: "GSFC Student",
    rollNo: "",
    department: "Computer Science & Engineering",
  };

  const currentRollNo = currentUser.rollNo?.toLowerCase() || "";
  const currentUserId = currentUser.id || "";
  const currentUserName = currentUser.name?.toLowerCase() || "";

  const registrations = state?.registrations || [];
  const events = state?.events || [];
  const attendanceRecords = state?.attendanceRecords || [];

  const userRegistrations = registrations.filter(
    (r) =>
      r &&
      (r.userId === currentUserId ||
        (r.userRollNo && r.userRollNo.toLowerCase() === currentRollNo) ||
        (r.userName && r.userName.toLowerCase() === currentUserName))
  );

  const attendedEvents = events.filter((e) =>
    e &&
    (attendanceRecords.some(
      (a) =>
        a &&
        a.eventId === e.id &&
        (a.userId === currentUserId || (a.userRollNo && a.userRollNo.toLowerCase() === currentRollNo))
    ) ||
      userRegistrations.some((r) => r.eventId === e.id && r.status === "attended"))
  );

  const registeredEvents = events.filter((e) =>
    e &&
    userRegistrations.some(
      (r) =>
        r &&
        r.eventId === e.id &&
        (r.status === "confirmed" ||
          r.status === "waitlisted" ||
          r.status === "pending_approval" ||
          r.status === "punched_in")
    )
  );

  const pastEvents = events.filter(
    (e) => e && e.status === "completed" && !attendedEvents.some((ae) => ae && ae.id === e.id)
  );

  const currentList =
    activeTab === "registered"
      ? registeredEvents
      : activeTab === "attended"
      ? attendedEvents
      : pastEvents;

  const filteredList = currentList.filter(
    (e) =>
      e &&
      ((e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.department || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDownloadCertificate = async (event: CampusEvent) => {
    if (!event) return;
    const record = attendanceRecords.find(
      (a) => a && a.eventId === event.id && a.userId === currentUser.id
    ) || {
      id: `att-gen-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      userId: currentUser.id,
      userName: currentUser.name || "Demo Student",
      userRollNo: currentUser.rollNo || "",
      department: currentUser.department || "Computer Science",
      timestamp: new Date().toISOString(),
      verifiedMethod: "qr_scan" as const,
      tokenUsed: "GSFC-VERIFIED",
      synced: true,
      certificateId: `GSFC-CERT-${(event.id || "EVT").replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${(currentUser.rollNo || "1001").slice(-4)}-98A4`,
    };

    setDownloadingCertId(event.id);
    try {
      await generateCertificatePdf(record, event, currentUser);
    } catch (err) {
      console.error("Certificate download error", err);
    } finally {
      setDownloadingCertId(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 100 Activity Points (SAP) Tracker Widget */}
      <ActivityPointsCard />

      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand/70">
            Student Academic Log
          </p>
          <h2 className="mt-1 font-display text-2xl font-black text-foreground sm:text-3xl">
            My Events & Certificates
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {attendedEvents.length} Verified Attendances · {registeredEvents.length} Upcoming Reservations
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-2xl border border-border/70 bg-card/60 p-1 backdrop-blur-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("registered")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "registered"
                ? "bg-[#1A3C6E] text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Registered ({registeredEvents.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("attended")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "attended"
                ? "bg-[#1A3C6E] text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Attended ({attendedEvents.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("past")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "past"
                ? "bg-[#1A3C6E] text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Past Archive
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
        <Input
          placeholder="Filter your events by title, department, category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 rounded-2xl border-border/70 bg-card/60 pl-10 text-xs backdrop-blur-xl"
        />
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 py-12 text-center backdrop-blur-xl">
            <FileCheck className="size-10 text-muted-foreground/40" />
            <h3 className="mt-3 font-display text-base font-bold text-foreground">
              No events found in this category
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeTab === "registered"
                ? "Browse upcoming events in the Home tab and register with one click."
                : "Attend campus sessions and check in with your live punch or QR scanner to earn verified certificates."}
            </p>
          </div>
        ) : (
          filteredList.map((event) => {
            if (!event) return null;
            const reg = userRegistrations.find((r) => r && r.eventId === event.id);
            const att = attendanceRecords.find(
              (a) => a && a.eventId === event.id && a.userId === currentUser.id
            );
            const isAttended = activeTab === "attended" || reg?.status === "attended" || Boolean(att);
            const isPunchedIn = reg?.status === "punched_in" || Boolean(reg?.punchInTime);
            const isCertUnlocked = Boolean(
              event.certificatesReleased || reg?.certificateUnlocked || att?.certificateUnlocked
            );

            const dateParts = (event.date || "2026-06-12").split("-");
            const monthStr = dateParts[1] === "06" ? "JUN" : dateParts[1] === "05" ? "MAY" : "JUL";
            const dayStr = dateParts[2] || "12";

            return (
              <div
                key={event.id}
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-xl transition-all hover:border-brand/40 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Event Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2A93B]">
                        {monthStr}
                      </span>
                      <span className="font-display text-base font-black leading-none">
                        {dayStr}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1A3C6E] dark:text-[#F2A93B]">
                          {event.category}
                        </span>
                        {reg?.isTeam && (
                          <span className="flex items-center gap-1 rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                            <Users className="size-3" /> {reg.teamName || "Team"}
                          </span>
                        )}
                        {isPunchedIn && !isAttended && (
                          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                            🟢 Punched In (Live)
                          </span>
                        )}
                        {reg?.status === "waitlisted" && (
                          <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            Waitlisted
                          </span>
                        )}
                      </div>
                      <h3
                        onClick={() => onSelectEvent(event)}
                        className="mt-1 cursor-pointer font-display text-base font-bold text-foreground transition-colors hover:text-brand"
                      >
                        {event.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-brand" /> {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-brand" /> {event.venue}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {isAttended ? (
                      <>
                        {isCertUnlocked ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadCertificate(event)}
                            disabled={downloadingCertId === event.id}
                            className="h-9 gap-1.5 rounded-xl border-[#1A3C6E]/30 bg-[#1A3C6E]/5 text-xs font-bold text-[#1A3C6E] hover:bg-[#1A3C6E]/15 dark:border-[#F2A93B]/30 dark:bg-[#F2A93B]/10 dark:text-[#F2A93B]"
                          >
                            <Download className="size-3.5" />
                            <span>{downloadingCertId === event.id ? "Generating..." : "PDF Certificate"}</span>
                          </Button>
                        ) : (
                          <span
                            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400"
                            title="Administration / Faculty Coordinator is finalizing roster verification before issuing certificates"
                          >
                            <Lock className="size-3.5" />
                            <span>Cert Pending Admin Release</span>
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setFeedbackEvent(event)}
                          className="h-9 gap-1 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                        >
                          <Star className="size-3.5 fill-current" />
                          <span>Review</span>
                        </Button>
                      </>
                    ) : (
                      <>
                        {onOpenPunchModal && (
                          <Button
                            size="sm"
                            onClick={() => onOpenPunchModal(event)}
                            className={cn(
                              "h-9 gap-1.5 rounded-xl text-xs font-bold shadow-md",
                              isPunchedIn
                                ? "bg-gradient-to-r from-amber-600 to-rose-600 text-white"
                                : "bg-gradient-to-r from-emerald-600 to-[#1A3C6E] text-white"
                            )}
                          >
                            <MapPin className="size-3.5 text-[#F2A93B]" />
                            {isPunchedIn ? "Punch Out (Exit Attendance)" : "Punch In (Live GPS)"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectEvent(event)}
                          className="h-9 rounded-xl text-xs font-semibold"
                        >
                          View Pass
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional Row for Registered Events: Calendar Sync & Team details */}
                {!isAttended && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">📅 Calendar Sync:</span>
                      <a
                        href={getGoogleCalendarUrl(event)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-brand hover:underline"
                      >
                        Google Calendar
                      </a>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => downloadIcsFile(event)}
                        className="font-bold text-brand hover:underline"
                      >
                        iCal (.ics)
                      </button>
                    </div>

                    {reg?.teamMembers && reg.teamMembers.length > 0 && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="size-3 text-muted-foreground" />
                        <span>Teammates:</span>
                        <span className="font-bold text-foreground">
                          {reg.teamMembers.map((m) => (m?.name || "Member").split(" ")[0]).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {feedbackEvent && (
        <EventFeedbackModal
          event={feedbackEvent}
          onClose={() => setFeedbackEvent(null)}
        />
      )}
    </div>
  );
}
