import { useState } from "react";
import {
  Award,
  Calendar,
  CalendarPlus,
  Check,
  Clock,
  Download,
  ExternalLink,
  HeartHandshake,
  Lock,
  MapPin,
  Share2,
  Star,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampusEvent, AttendanceRecord } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import { generateIcsFile, getGoogleCalendarUrl } from "@/lib/calendar-export";
import { generateCertificatePdf } from "@/lib/certificate-generator";
import { TeamRegisterModal } from "./TeamRegisterModal";
import { FeedbackModal } from "./FeedbackModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EventDetailModalProps {
  event: CampusEvent;
  onClose: () => void;
  onOpenScanner?: () => void;
  onOpenPunchModal?: (event: CampusEvent) => void;
}

export function EventDetailModal({
  event,
  onClose,
  onOpenScanner,
  onOpenPunchModal,
}: EventDetailModalProps) {
  const state = campusStore.getState();
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  const registration = state.registrations.find(
    (r) => r.eventId === event.id && r.userId === state.currentUser.id
  );
  const attendanceRecord = state.attendanceRecords.find(
    (a) => a.eventId === event.id && a.userId === state.currentUser.id
  );

  const isFull = event.registeredCount >= event.capacity;
  const isRegistered = Boolean(registration);
  const isAttended = Boolean(attendanceRecord) || registration?.status === "attended";
  const isCertUnlocked = Boolean(
    event.certificatesReleased || registration?.certificateUnlocked || attendanceRecord?.certificateUnlocked
  );

  const handleDownloadCertificate = async () => {
    const record: AttendanceRecord = attendanceRecord || {
      id: `att-gen-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      userRollNo: state.currentUser.rollNo,
      department: state.currentUser.department,
      timestamp: new Date().toISOString(),
      verifiedMethod: "qr_scan",
      tokenUsed: "GSFC-VERIFIED",
      synced: true,
      certificateId: `GSFC-CERT-${event.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}-${state.currentUser.rollNo.slice(-4)}-98A4`,
    };

    setDownloadingCert(true);
    try {
      await generateCertificatePdf(record, event, state.currentUser);
    } catch (err) {
      console.error("Certificate download error", err);
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleRegisterSingle = async () => {
    const res = await campusStore.registerForEvent(event.id, false);
    if (res.success) {
      if (onOpenPunchModal) {
        onClose();
        onOpenPunchModal(event);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${event.title} - GSFC University`,
        text: event.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard!");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border/80 bg-card shadow-2xl">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-2 text-foreground shadow-md backdrop-blur-md hover:bg-background"
          >
            <X className="size-4" />
          </button>

          {/* Banner Image */}
          <div className="relative h-56 w-full overflow-hidden sm:h-64">
            <img
              src={event.bannerImage}
              alt={event.title}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent px-3 py-1 font-display text-xs font-black text-[#1A3C6E]">
                  {event.category}
                </span>
                <span className="rounded-full bg-card/80 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-md">
                  {event.department}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-card/80 px-2.5 py-1 text-xs font-bold text-amber-500 backdrop-blur-md">
                <Star className="size-3.5 fill-amber-500 text-amber-500" />
                <span>{event.averageRating || "5.0"} ({event.reviewCount || 0})</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Title & Organizer */}
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    event.status === "live"
                      ? "animate-pulse bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : event.status === "completed"
                      ? "bg-muted text-muted-foreground"
                      : "bg-brand/10 text-brand"
                  )}
                >
                  {event.status === "live" ? "🔴 LIVE NOW" : event.status}
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-black text-foreground sm:text-3xl">
                {event.title}
              </h2>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Organized by <span className="font-bold text-foreground">{event.organizerName}</span> · {event.organizerEmail}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-border/70 bg-card/60 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5 text-brand" />
                  <span>Date</span>
                </div>
                <p className="mt-1 text-xs font-bold text-foreground">{event.date}</p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/60 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5 text-brand" />
                  <span>Time</span>
                </div>
                <p className="mt-1 truncate text-xs font-bold text-foreground">{event.time}</p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/60 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-brand" />
                  <span>Venue</span>
                </div>
                <p className="mt-1 truncate text-xs font-bold text-foreground">{event.venue}</p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/60 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Award className="size-3.5 text-[#F2A93B]" />
                  <span>Volunteer Credit</span>
                </div>
                <p className="mt-1 text-xs font-bold text-foreground">+{event.volunteerHoursReward || 0} Hours</p>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="mt-5 rounded-2xl border border-border/70 bg-card/50 p-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Users className="size-4 text-brand" />
                  <span>Seats & Registrations</span>
                </span>
                <span className="text-muted-foreground">
                  {event.registeredCount} / {event.capacity} Filled
                  {event.waitlistCount > 0 && ` (${event.waitlistCount} Waitlisted)`}
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isFull ? "bg-amber-500" : "bg-[#1A3C6E]"
                  )}
                  style={{ width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%` }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                About the Event
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {event.description}
              </p>
            </div>

            {/* Event Rules / Instructions */}
            {event.rules && event.rules.length > 0 && (
              <div className="mt-5 rounded-2xl bg-brand/5 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand">
                  Important Guidelines
                </h4>
                <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                  {event.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#F2A93B] font-bold">✓</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
              {/* Calendar & Share Tools */}
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                      <CalendarPlus className="mr-1.5 size-3.5" />
                      Add to Calendar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => generateIcsFile(event)}
                      className="cursor-pointer text-xs font-semibold"
                    >
                      Download .ICS File (Apple/Outlook)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => window.open(getGoogleCalendarUrl(event), "_blank")}
                      className="cursor-pointer text-xs font-semibold"
                    >
                      Sync to Google Calendar <ExternalLink className="ml-auto size-3" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShare}
                  className="size-8 rounded-xl text-muted-foreground hover:text-foreground"
                  title="Share Event"
                >
                  <Share2 className="size-3.5" />
                </Button>
              </div>

              {/* Registration & Check-in Controls */}
              <div className="flex items-center gap-2">
                {isAttended ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="size-4" /> Attendance Verified
                    </span>
                    {isCertUnlocked ? (
                      <Button
                        size="sm"
                        onClick={handleDownloadCertificate}
                        disabled={downloadingCert}
                        className="rounded-xl bg-[#1A3C6E] text-xs font-bold text-white hover:bg-[#1A3C6E]/90 dark:bg-[#F2A93B] dark:text-slate-950"
                      >
                        <Download className="mr-1.5 size-3.5" />
                        {downloadingCert ? "Generating PDF..." : "Download Certificate"}
                      </Button>
                    ) : (
                      <span
                        className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400"
                        title="Certificate release pending administration approval"
                      >
                        <Lock className="size-3.5" />
                        <span>Cert Pending Release</span>
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFeedbackModal(true)}
                      className="rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400"
                    >
                      <Star className="mr-1 size-3.5 fill-current" /> Rate Event
                    </Button>
                  </div>
                ) : isRegistered ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-xl bg-brand/10 px-3 py-2 text-xs font-bold text-brand">
                      {registration?.status === "waitlisted" ? "Waitlisted (#1)" : "Registered (Confirmed)"}
                    </span>
                    {onOpenPunchModal && (
                      <Button
                        onClick={() => {
                          onClose();
                          onOpenPunchModal(event);
                        }}
                        className="rounded-xl bg-gradient-to-r from-emerald-600 to-[#1A3C6E] text-xs font-bold text-white shadow-md hover:opacity-90"
                      >
                        <MapPin className="mr-1.5 size-3.5 text-[#F2A93B]" />
                        Mark Attendance (Punch In / Out)
                      </Button>
                    )}
                    {event.status === "live" && onOpenScanner && (
                      <Button
                        onClick={() => {
                          onClose();
                          onOpenScanner();
                        }}
                        className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Scan QR Code Now
                      </Button>
                    )}
                  </div>
                ) : event.isTeamEvent ? (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleRegisterSingle}
                      variant="outline"
                      className="rounded-xl text-xs font-bold"
                    >
                      Register Solo
                    </Button>
                    <Button
                      onClick={() => setShowTeamModal(true)}
                      className="rounded-xl bg-[#1A3C6E] text-white hover:bg-[#1A3C6E]/90"
                    >
                      <Users className="mr-1.5 size-4" />
                      Team Registration
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleRegisterSingle}
                    className={cn(
                      "rounded-xl font-bold",
                      isFull
                        ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                        : "bg-[#1A3C6E] text-white hover:bg-[#1A3C6E]/90"
                    )}
                  >
                    {isFull ? "Join Waitlist" : "Register for Event"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTeamModal && (
        <TeamRegisterModal
          event={event}
          onClose={() => setShowTeamModal(false)}
          onSuccess={() => {
            setShowTeamModal(false);
            if (onOpenPunchModal) {
              onClose();
              onOpenPunchModal(event);
            }
          }}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal
          event={event}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </>
  );
}
