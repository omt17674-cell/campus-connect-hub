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
  Trash2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusEvent } from "@/lib/types";
import { CampusState } from "@/lib/campus-store";
import { CreateEventModal } from "./CreateEventModal";
import { LiveAttendanceModal } from "./LiveAttendanceModal";
import { AttendeesManagerModal } from "./AttendeesManagerModal";
import { EventAttendanceViewer } from "./EventAttendanceViewer";
import { StudentRegistryViewer } from "@/components/admin/StudentRegistryViewer";
import { ConfirmationModal, ConfirmationModalProps } from "@/components/ui/ConfirmationModal";
import { campusStore } from "@/lib/campus-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface OrganizerDashboardProps {
  state: CampusState;
}

export function OrganizerDashboard({ state }: OrganizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"events" | "attendance_roster" | "students">("events");
  const [selectedRosterEventId, setSelectedRosterEventId] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [liveEventModal, setLiveEventModal] = useState<CampusEvent | null>(null);
  const [attendeesModalEvent, setAttendeesModalEvent] = useState<CampusEvent | null>(null);
  const [confirmModal, setConfirmModal] = useState<Omit<ConfirmationModalProps, "onClose"> | null>(null);

  const myEvents = state.events;

  const totalRegistrations = myEvents.reduce((acc, evt) => acc + (evt.registeredCount || 0), 0);
  const liveEventsCount = myEvents.filter((e) => e.status === "live").length;

  const handleDeleteEvent = (event: CampusEvent) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete "${event.title}"?`,
      subtitle: `${event.date} · ${event.venue} · ${event.registeredCount || 0} Registered Attendees`,
      badgeText: "Delete Event",
      variant: "danger",
      description: `Are you sure you want to permanently delete "${event.title}"? This will disband the event and remove all registered participant lists.`,
      bullets: [
        "Permanently delete this event from the portal",
        "Clear attendee registrations and check-in rosters",
        "This action cannot be undone"
      ],
      confirmText: "Permanently Delete",
      cancelText: "Keep Event",
      onConfirm: async () => {
        const res = await campusStore.deleteEvent(event.id);
        if (res.success) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
        setConfirmModal(null);
      },
    });
  };

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
            Manage your faculty workshops, live attendance sessions, student registry (mobile & identity updates), and delete or conclude events.
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

      {/* Main Workspace: Professional Left Sidebar + Active Module Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-6 items-start">
        {/* Left Sidebar Navigation */}
        <aside className="space-y-4">
          {/* Mobile Module Selector (< lg) */}
          <div className="lg:hidden rounded-2xl border border-border/80 bg-card p-3 shadow-sm">
            <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">
              Select Coordinator Module
            </label>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full h-10 rounded-xl border border-border/80 bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-[#1A3C6E]"
            >
              <option value="events">📅 Events & Live Sessions ({myEvents.length})</option>
              <option value="attendance_roster">📋 Attendance Roster</option>
              <option value="students">🎓 Student Registry</option>
            </select>
          </div>

          {/* Desktop Left Sidebar Card (lg+) */}
          <div className="hidden lg:flex flex-col rounded-3xl border border-border/80 bg-card p-4 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-display text-xs font-black uppercase tracking-wider text-foreground">
                  Coordinator Hub
                </h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Faculty & TPC Operations</p>
              </div>
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" title="Supabase Live" />
            </div>

            {/* Quick Create Event Action Button */}
            <Button
              onClick={() => setShowCreateModal(true)}
              className="h-10 w-full justify-start gap-2 rounded-2xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] px-3 font-display text-xs font-black text-white shadow-md hover:opacity-95"
            >
              <Plus className="size-4 text-[#F2A93B]" />
              <span>Create New Event</span>
            </Button>

            {/* Navigation Modules */}
            <nav className="space-y-1 text-xs">
              <p className="px-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 mb-1">
                Event Operations
              </p>

              <button
                type="button"
                onClick={() => setActiveTab("events")}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                  activeTab === "events"
                    ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <Calendar className={cn("size-4", activeTab === "events" ? "text-[#F2A93B]" : "text-slate-400")} />
                  <span>Events & Live QR</span>
                </span>
                <span className={cn(
                  "rounded-md px-1.5 py-0.5 text-[9px] font-black",
                  activeTab === "events" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {myEvents.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("attendance_roster")}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                  activeTab === "attendance_roster"
                    ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <UserCheck className={cn("size-4", activeTab === "attendance_roster" ? "text-[#F2A93B]" : "text-slate-400")} />
                  <span>Attendance Roster</span>
                </span>
                {activeTab === "attendance_roster" && (
                  <span className="size-1.5 rounded-full bg-[#F2A93B]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("students")}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                  activeTab === "students"
                    ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className={cn("size-4", activeTab === "students" ? "text-blue-400" : "text-slate-400")} />
                  <span>Student Registry</span>
                </span>
                {activeTab === "students" && (
                  <span className="size-1.5 rounded-full bg-[#F2A93B]" />
                )}
              </button>
            </nav>

            {/* Quick Metrics Summary in Sidebar */}
            <div className="mt-auto space-y-2 rounded-2xl border border-border/60 bg-muted/40 p-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-bold">Total Registrations</span>
                <span className="font-display font-black text-[#1A3C6E] dark:text-[#F2A93B]">{totalRegistrations}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-bold">Live Sessions</span>
                <span className="font-display font-black text-emerald-600">{liveEventsCount}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Active Module Area */}
        <div className="min-w-0 space-y-6">
          {activeTab === "students" ? (
            <StudentRegistryViewer state={state} />
          ) : activeTab === "attendance_roster" ? (
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
                            setConfirmModal({
                              isOpen: true,
                              title: "Conclude Event & Issue Certs?",
                              subtitle: `Event: ${event.title}`,
                              badgeText: "Conclude Session",
                              variant: "success",
                              description: `Are you sure you want to conclude "${event.title}"? This will finalize attendance and generate verified certificates.`,
                              bullets: [
                                "Conclude active session across portal",
                                "Lock and verify all attendee records",
                                "Generate official digital participation certificates"
                              ],
                              confirmText: "Conclude & Issue Certs",
                              cancelText: "Keep Active",
                              onConfirm: () => {
                                const res = campusStore.endAndConcludeEvent(event.id);
                                toast.success(res.message);
                                setConfirmModal(null);
                              },
                            });
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

                      {/* Delete Event Action */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteEvent(event)}
                        className="h-9 gap-1.5 rounded-xl border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        title="Permanently delete event"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
        </div>
      </div>

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

      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          subtitle={confirmModal.subtitle}
          description={confirmModal.description}
          badgeText={confirmModal.badgeText}
          bullets={confirmModal.bullets}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          variant={confirmModal.variant}
        />
      )}
    </div>
  );
}
