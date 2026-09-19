import { useState } from "react";
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  MapPin,
  QrCode,
  ScanBarcode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WifiOff,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampusEvent } from "@/lib/types";
import { CampusState } from "@/lib/campus-store";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface AttendanceHubProps {
  state: CampusState;
  onOpenScanner: () => void;
  onSelectEvent: (event: CampusEvent) => void;
  onOpenUnifiedCheckIn?: () => void;
  onViewAllUpcoming?: () => void;
}

export function AttendanceHub({
  state,
  onOpenScanner,
  onSelectEvent,
  onOpenUnifiedCheckIn,
  onViewAllUpcoming,
}: AttendanceHubProps) {
  const t = translations[state.language];
  const user = state.currentUser;
  const isLowAttendance = user.attendanceRate < 75;

  const [activeTab, setActiveTab] = useState<"both" | "upcoming" | "new">("both");

  const todayStr = new Date().toISOString().split("T")[0];

  // Active events: upcoming or live (excluding completed, rejected, cancelled)
  const activeEvents = (state.events || []).filter(
    (e) => e && (e.status === "upcoming" || e.status === "live")
  );

  // 1. Upcoming events (chronologically closest first)
  const upcomingEvents = [...activeEvents]
    .filter((e) => e.date >= todayStr || e.status === "live")
    .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));

  // 2. New events (newest created in store / latest IDs)
  const newEvents = [...activeEvents].sort((a, b) => {
    const timeA = parseInt((a.id || "").replace(/\D/g, "")) || 0;
    const timeB = parseInt((b.id || "").replace(/\D/g, "")) || 0;
    if (timeA && timeB && timeA !== timeB) return timeB - timeA;
    return 0;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Attendance Percentage Gauge Card */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-6 shadow-xl shadow-brand/5 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand/70">
              Official Event Record
            </span>
            <h3 className="font-display text-lg font-black text-foreground">
              {t.common.attendanceRate}
            </h3>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
              isLowAttendance
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            )}
          >
            {isLowAttendance ? "Attention Needed (<75%)" : "Good Standing (>75%)"}
          </span>
        </div>

        {/* Low Attendance Notice Banner if < 75% */}
        {isLowAttendance && (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertTriangle className="size-4 shrink-0 text-rose-500" />
            <div>
              <p className="font-bold">Low Attendance Alert</p>
              <p className="mt-0.5 text-[11px] opacity-90">
                Your semester attendance is below 75%. Please attend upcoming workshops to avoid exam debarment.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          {/* Radial Dial Indicator */}
          <div className="relative flex size-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#1A3C6E] to-[#F2A93B] p-1 shadow-lg shadow-[#1A3C6E]/20">
            <div className="flex size-full flex-col items-center justify-center rounded-full bg-card backdrop-blur-xl">
              <span className="font-display text-3xl font-black text-foreground">
                {user.attendanceRate}%
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Verified
              </span>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-orange-500">
                <Flame className="size-3.5 fill-current" />
                <span className="font-semibold text-muted-foreground">Streak</span>
              </div>
              <p className="mt-1 font-display text-xl font-black text-foreground">
                {user.streakDays} Days
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-[#F2A93B]">
                <Award className="size-3.5" />
                <span className="font-semibold text-muted-foreground">Volunteer Hours</span>
              </div>
              <p className="mt-1 font-display text-xl font-black text-foreground">
                {user.volunteerHours || 0} Hrs
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                <TrendingUp className="size-3.5" />
                <span className="font-semibold text-muted-foreground">Events Attended</span>
              </div>
              <p className="mt-1 font-display text-xl font-black text-foreground">
                {state.attendanceRecords.filter((a) => a.userId === user.id || a.userRollNo === user.rollNo).length} Verified
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick QR Check-in Box */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] p-6 text-white shadow-xl shadow-[#1A3C6E]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#F2A93B]">
              Rotating QR Check-in
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-300">
            Cryptographic Tokens
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-2 text-[#F2A93B] backdrop-blur-md">
            <QrCode className="size-10" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-display text-base font-bold">
              Mark Event Presence
            </h4>
            <p className="mt-0.5 text-xs text-slate-300">
              Rotates every 45 seconds to prevent proxy attendance. Works offline with automatic sync.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {onOpenUnifiedCheckIn && (
              <Button
                onClick={onOpenUnifiedCheckIn}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-display font-black text-white shadow-lg shadow-emerald-500/20 hover:opacity-95"
              >
                <ScanBarcode className="mr-1.5 size-4 text-[#F2A93B]" />
                OTP + ID Barcode
              </Button>
            )}

            <Button
              onClick={onOpenScanner}
              className="rounded-2xl bg-[#F2A93B] font-display font-black text-[#1A3C6E] shadow-lg shadow-[#F2A93B]/30 hover:bg-[#F2A93B]/90"
            >
              <ScanLine className="mr-1.5 size-4" />
              Scan QR
            </Button>
          </div>
        </div>

        {state.isOffline && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-300">
            <WifiOff className="size-3.5" />
            <span>Offline mode: Scans are saved locally and synced once reconnected.</span>
          </div>
        )}
      </div>

      {/* Campus Events Section: Upcoming & New Events */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-xl shadow-brand/5 backdrop-blur-2xl">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#F2A93B]/20 text-[#F2A93B]">
                <Calendar className="size-4" />
              </div>
              <div>
                <h4 className="font-display text-sm font-black text-foreground">
                  Campus Events
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Upcoming & newly published sessions
                </p>
              </div>
            </div>

            {onViewAllUpcoming && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewAllUpcoming}
                className="h-7 text-[11px] font-bold text-brand hover:text-brand hover:bg-brand/10 px-2"
              >
                View all <ChevronRight className="size-3 ml-0.5" />
              </Button>
            )}
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 rounded-2xl bg-muted/60 p-1 text-xs">
            <button
              onClick={() => setActiveTab("both")}
              className={cn(
                "flex-1 rounded-xl py-1 text-center font-display text-[11px] font-bold transition-all",
                activeTab === "both"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Both
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={cn(
                "flex-1 rounded-xl py-1 text-center font-display text-[11px] font-bold transition-all flex items-center justify-center gap-1",
                activeTab === "upcoming"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="size-3 text-[#1A3C6E] dark:text-[#F2A93B]" />
              Upcoming ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={cn(
                "flex-1 rounded-xl py-1 text-center font-display text-[11px] font-bold transition-all flex items-center justify-center gap-1",
                activeTab === "new"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="size-3 text-emerald-500 fill-current" />
              New ({newEvents.length})
            </button>
          </div>
        </div>

        {/* Content Views */}
        <div className="mt-4 space-y-4">
          {/* Helper render function */}
          {(() => {
            const renderEventCard = (evt: CampusEvent, isNewBadge: boolean = false) => {
              const isRegistered = (state.registrations || []).some(
                (r) =>
                  r.eventId === evt.id &&
                  ((user.id && r.userId === user.id) ||
                    (user.rollNo && r.userRollNo?.toLowerCase() === user.rollNo.toLowerCase()))
              );

              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="group relative flex cursor-pointer flex-col gap-2 rounded-2xl border border-border/70 bg-card/60 p-3 shadow-xs transition-all hover:border-[#1A3C6E]/40 hover:bg-card hover:shadow-md dark:hover:border-[#F2A93B]/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="border-border/70 bg-brand/5 px-2 py-0 text-[9px] font-extrabold uppercase tracking-wider text-brand"
                      >
                        {evt.category}
                      </Badge>

                      {isNewBadge && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                          <Zap className="size-2.5 fill-current" /> New
                        </span>
                      )}

                      {isRegistered && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                          <CheckCircle2 className="size-2.5" /> Enrolled
                        </span>
                      )}
                    </div>

                    <span className="flex items-center gap-1 font-mono text-[10px] font-semibold text-muted-foreground">
                      <Calendar className="size-3 text-muted-foreground/70" />
                      {evt.date}
                    </span>
                  </div>

                  <h5 className="font-display text-xs font-black text-foreground line-clamp-1 transition-colors group-hover:text-[#1A3C6E] dark:group-hover:text-[#F2A93B]">
                    {evt.title}
                  </h5>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <MapPin className="size-3 shrink-0 text-muted-foreground/80" />
                      <span className="truncate">{evt.venue}</span>
                      {evt.time && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-muted-foreground/70">
                          • {evt.time.split("-")[0].trim()}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 rounded-lg text-[11px] font-bold text-brand hover:bg-brand/10 shrink-0"
                    >
                      View <ChevronRight className="ml-0.5 size-3" />
                    </Button>
                  </div>
                </div>
              );
            };

            return (
              <>
                {/* 1. UPCOMING EVENTS BLOCK */}
                {(activeTab === "both" || activeTab === "upcoming") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#1A3C6E] dark:text-[#F2A93B]">
                        <Calendar className="size-3.5" /> Upcoming Events
                      </span>
                      <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {upcomingEvents.length} scheduled
                      </span>
                    </div>

                    {upcomingEvents.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
                        No upcoming events scheduled right now.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(activeTab === "both" ? upcomingEvents.slice(0, 3) : upcomingEvents).map((evt) =>
                          renderEventCard(evt, false)
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. NEW EVENTS BLOCK */}
                {(activeTab === "both" || activeTab === "new") && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <Zap className="size-3.5 fill-current" /> Newly Added Events
                      </span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {newEvents.length} new
                      </span>
                    </div>

                    {newEvents.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border/80 p-4 text-center text-xs text-muted-foreground">
                        No newly published events yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(activeTab === "both" ? newEvents.slice(0, 3) : newEvents).map((evt) =>
                          renderEventCard(evt, true)
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
