import { useState } from "react";
import { CampusEvent, CampusState, campusStore } from "@/lib/campus-store";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UpcomingEventsViewProps {
  state: CampusState;
  onSelectEvent: (event: CampusEvent) => void;
  onOpenPunchModal?: (event: CampusEvent) => void;
}

export function UpcomingEventsView({
  state,
  onSelectEvent,
  onOpenPunchModal,
}: UpcomingEventsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isRegisteringId, setIsRegisteringId] = useState<string | null>(null);

  const currentUser = state.currentUser;
  const currentRoll = (currentUser.rollNo || "").trim().toLowerCase();
  const currentUserId = (currentUser.id || "").trim();

  // Current date string in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split("T")[0];

  // Filter events that are upcoming: date >= today and status !== "completed"
  const upcomingEvents = (state.events || []).filter((e) => {
    if (!e) return false;
    const isFutureOrToday = e.date >= todayStr;
    const isNotCompleted = e.status !== "completed" && e.status !== "rejected";
    return isFutureOrToday || isNotCompleted;
  });

  const categories = [
    { id: "all", label: "All Upcoming" },
    { id: "tech", label: "Technology" },
    { id: "cultural", label: "Cultural" },
    { id: "sports", label: "Sports" },
    { id: "academic", label: "Academic & TPC" },
    { id: "workshop", label: "Workshops" },
  ];

  const filteredEvents = upcomingEvents.filter((e) => {
    const matchesCategory =
      selectedCategory === "all" ||
      (e.category && e.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesSearch =
      (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.venue || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.department || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isUserRegistered = (eventId: string) => {
    return (state.registrations || []).some(
      (r) =>
        r.eventId === eventId &&
        (r.userId === currentUserId ||
          (r.userRollNo && r.userRollNo.toLowerCase() === currentRoll) ||
          (currentUser.email && (r as any).userEmail === currentUser.email))
    );
  };

  const getRegistrationStatus = (eventId: string) => {
    const reg = (state.registrations || []).find(
      (r) =>
        r.eventId === eventId &&
        (r.userId === currentUserId ||
          (r.userRollNo && r.userRollNo.toLowerCase() === currentRoll))
    );
    return reg?.status;
  };

  const handleQuickRegister = async (event: CampusEvent) => {
    setIsRegisteringId(event.id);
    try {
      const res = await campusStore.registerForEvent(event.id);
      if (res.success) {
        toast.success(res.message || `Successfully registered for "${event.title}"!`);
      }
    } finally {
      setIsRegisteringId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 rounded-3xl border border-border/80 bg-gradient-to-r from-[#1A3C6E]/10 via-card to-[#F2A93B]/10 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1A3C6E]/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#1A3C6E] dark:text-[#F2A93B]">
              <Calendar className="size-3.5" /> Upcoming Campus Schedule
            </span>
            <h2 className="mt-2 font-display text-2xl font-black text-foreground">
              Upcoming Events & Workshops
            </h2>
            <p className="text-xs text-muted-foreground">
              Verified sessions scheduled for upcoming dates. Register early to guarantee capacity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-2xl border border-border bg-card px-4 py-2 font-mono text-xs font-bold text-foreground shadow-xs">
              {upcomingEvents.length} Event{upcomingEvents.length === 1 ? "" : "s"} Scheduled
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search upcoming events by title, venue, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-2xl border-border/80 bg-background/80 pl-10 text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                  selectedCategory === c.id
                    ? "bg-[#1A3C6E] text-white shadow-xs"
                    : "border border-border/70 bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
          <Calendar className="size-12 text-muted-foreground/50" />
          <h3 className="mt-3 font-display text-base font-bold text-foreground">
            No Upcoming Events Found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {searchQuery
              ? "No events match your search filters. Try adjusting your query."
              : "No upcoming events scheduled right now. Check back soon!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((evt) => {
            const registered = isUserRegistered(evt.id);
            const status = getRegistrationStatus(evt.id);
            const isFull = evt.registeredCount >= evt.capacity;

            return (
              <div
                key={evt.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:border-[#1A3C6E]/40 hover:shadow-lg hover:shadow-brand/5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                      {evt.category}
                    </Badge>
                    {registered ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        {status === "attended" ? "Attended" : "Registered"}
                      </span>
                    ) : isFull ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
                        <AlertCircle className="size-3" /> Waitlist Open
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600">
                        {evt.capacity - evt.registeredCount} seats left
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => onSelectEvent(evt)}
                    className="mt-3 cursor-pointer font-display text-base font-bold text-foreground line-clamp-1 hover:text-[#1A3C6E] dark:hover:text-[#F2A93B]"
                  >
                    {evt.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {evt.description || "Official campus session scheduled at GSFC University."}
                  </p>

                  <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-[#1A3C6E] dark:text-[#F2A93B]" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 text-[#1A3C6E] dark:text-[#F2A93B]" />
                      <span>{evt.time || "10:00 AM - 12:00 PM"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-[#1A3C6E] dark:text-[#F2A93B]" />
                      <span>{evt.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="size-3.5 text-[#1A3C6E] dark:text-[#F2A93B]" />
                      <span>{evt.department}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectEvent(evt)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    Details <ChevronRight className="ml-1 size-3.5" />
                  </Button>

                  {registered ? (
                    onOpenPunchModal ? (
                      <Button
                        size="sm"
                        onClick={() => onOpenPunchModal(evt)}
                        className="rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                      >
                        Punch Attendance
                      </Button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600">✓ Enrolled</span>
                    )
                  ) : (
                    <Button
                      size="sm"
                      disabled={isRegisteringId === evt.id}
                      onClick={() => handleQuickRegister(evt)}
                      className="rounded-xl bg-[#1A3C6E] text-xs font-black text-white hover:bg-[#1A3C6E]/90 shadow-sm"
                    >
                      {isRegisteringId === evt.id
                        ? "Registering..."
                        : isFull
                        ? "Join Waitlist"
                        : "Register"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
