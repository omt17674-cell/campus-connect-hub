import { useState } from "react";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Plus,
  QrCode,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusEvent } from "@/lib/types";
import { CampusState } from "@/lib/campus-store";
import { CreateEventModal } from "./CreateEventModal";
import { LiveAttendanceModal } from "./LiveAttendanceModal";
import { AttendeesManagerModal } from "./AttendeesManagerModal";
import { EventAttendanceViewer } from "./EventAttendanceViewer";
import { cn } from "@/lib/utils";

interface OrganizerDashboardProps {
  state: CampusState;
}

export function OrganizerDashboard({ state }: OrganizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"events" | "attendance_roster">("events");
  const [selectedRosterEventId, setSelectedRosterEventId] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [liveEventModal, setLiveEventModal] = useState<CampusEvent | null>(null);
  const [attendeesModalEvent, setAttendeesModalEvent] = useState<CampusEvent | null>(null);

  const myEvents = state.events;

  const totalRegistrations = myEvents.reduce((acc, evt) => acc + (evt.registeredCount || 0), 0);
  const liveEventsCount = myEvents.filter((e) => e.status === "live").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand/70">
            Faculty Coordinator & TPC Admin Portal
          </p>
          <h2 className="mt-1 font-display text-2xl font-black text-foreground sm:text-3xl">
            Faculty & TPC Event Management Hub
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage your faculty workshops, live Punch-in / Punch-out attendance, and event-by-event participant rosters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="h-10 gap-2 rounded-2xl bg-[#1A3C6E] font-display text-xs font-black text-white shadow-lg shadow-[#1A3C6E]/25 hover:bg-[#1A3C6E]/90"
          >
            <Plus className="size-4" />
            Create New Event
          </Button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/60 p-1.5 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("events")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "events"
              ? "bg-[#1A3C6E] text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Calendar className="mr-1.5 size-3.5" />
          Events & Live QR Controls
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("attendance_roster")}
          className={cn(
            "rounded-xl text-xs font-bold",
            activeTab === "attendance_roster"
              ? "bg-[#1A3C6E] text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <UserCheck className="mr-1.5 size-3.5 text-[#F2A93B]" />
          Event-by-Event Attendance Roster
        </Button>
      </div>

      {activeTab === "attendance_roster" ? (
        <EventAttendanceViewer
          state={state}
          selectedEventId={selectedRosterEventId}
          onSelectEventId={(id) => setSelectedRosterEventId(id)}
          titlePrefix="Faculty & TPC Coordinator Attendance Governance"
        />
      ) : (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-lg shadow-brand/5 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Registrations
                </span>
                <Users className="size-4 text-brand" />
              </div>
              <p className="mt-3 font-display text-3xl font-black text-foreground">
                {totalRegistrations}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-3.5" /> Across managed events
              </p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-lg shadow-brand/5 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Live & Upcoming
                </span>
                <Calendar className="size-4 text-[#F2A93B]" />
              </div>
              <p className="mt-3 font-display text-3xl font-black text-foreground">
                {myEvents.filter((e) => e.status !== "completed").length} Events
              </p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                {liveEventsCount > 0 ? `${liveEventsCount} Event${liveEventsCount > 1 ? "s" : ""} live right now` : "No active live sessions"}
              </p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-lg shadow-brand/5 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Avg. Turnout Rate
                </span>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </div>
              <p className="mt-3 font-display text-3xl font-black text-foreground">
                {totalRegistrations > 0 ? `${Math.round((state.attendanceRecords.length / totalRegistrations) * 100)}%` : "0%"}
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Verified attendance scans
              </p>
            </div>
          </div>

          {/* Events Table Section */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-xl shadow-brand/5 backdrop-blur-2xl sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-black text-foreground">
                  Event Management & QR Controls
                </h3>
                <p className="text-xs text-muted-foreground">
                  Control dynamic QR attendance sessions and review registered attendees
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {myEvents.map((event) => {
                const isLive = event.status === "live";
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "flex flex-col justify-between gap-4 rounded-2xl border p-4 backdrop-blur-xl transition-all sm:flex-row sm:items-center",
                      isLive
                        ? "border-emerald-500/40 bg-emerald-500/5 shadow-md"
                        : "border-border/70 bg-card/60 hover:bg-card/80"
                    )}
                  >
                    {/* Event Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            isLive
                              ? "animate-pulse bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold"
                              : event.status === "pending_approval"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-brand/10 text-brand"
                          )}
                        >
                          {isLive ? "🔴 LIVE NOW" : event.status.replace("_", " ")}
                        </span>
                        <span className="rounded-md bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1A3C6E] dark:text-[#F2A93B]">
                          {event.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {event.date} · {event.venue}
                        </span>
                      </div>

                      <h4 className="mt-1 font-display text-base font-bold text-foreground">
                        {event.title}
                      </h4>

                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          <strong>{event.registeredCount}</strong> / {event.capacity} Registered
                        </span>
                        {event.isTeamEvent && (
                          <span className="rounded bg-brand/5 px-1.5 py-0.2 text-[10px] font-semibold text-brand">
                            Team Event
                          </span>
                        )}
                        {event.approvalRequired && (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            Approval Required
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRosterEventId(event.id);
                          setActiveTab("attendance_roster");
                        }}
                        className="h-9 gap-1.5 rounded-xl border-[#1A3C6E]/30 text-xs font-bold text-[#1A3C6E] dark:text-[#F2A93B]"
                      >
                        <UserCheck className="size-3.5" />
                        View Attendance Roster
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAttendeesModalEvent(event)}
                        className="h-9 gap-1.5 rounded-xl text-xs font-bold"
                      >
                        <Users className="size-3.5 text-brand" />
                        Manage Attendees
                      </Button>

                      {event.status !== "completed" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            const res = campusStore.endAndConcludeEvent(event.id);
                            alert(`🎓 ${res.message}`);
                          }}
                          className="h-9 gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#1A3C6E] text-xs font-bold text-white shadow-md hover:opacity-95"
                        >
                          <Award className="size-3.5 text-[#F2A93B]" />
                          Conclude & Issue Certs
                        </Button>
                      ) : (
                        <span className="flex items-center gap-1 rounded-xl bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          ✓ Certified
                        </span>
                      )}

                      <Button
                        size="sm"
                        onClick={() => setLiveEventModal(event)}
                        className={cn(
                          "h-9 gap-1.5 rounded-xl text-xs font-black shadow-md",
                          isLive
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-[#1A3C6E] text-white hover:bg-[#1A3C6E]/90"
                        )}
                      >
                        <QrCode className="size-3.5 text-[#F2A93B]" />
                        {isLive ? "Live QR Display" : "Launch QR Check-in"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}

      {liveEventModal && (
        <LiveAttendanceModal
          event={liveEventModal}
          state={state}
          onClose={() => setLiveEventModal(null)}
        />
      )}

      {attendeesModalEvent && (
        <AttendeesManagerModal
          event={attendeesModalEvent}
          state={state}
          onClose={() => setAttendeesModalEvent(null)}
        />
      )}
    </div>
  );
}
