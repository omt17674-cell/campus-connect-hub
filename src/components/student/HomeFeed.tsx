import { useState } from "react";
import {
  Calendar,
  Check,
  Clock,
  Flame,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampusEvent, EventCategory } from "@/lib/types";
import { CampusState, campusStore } from "@/lib/campus-store";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface HomeFeedProps {
  state: CampusState;
  onSelectEvent: (event: CampusEvent) => void;
  onOpenScanner: () => void;
  onOpenPunchModal?: (event: CampusEvent) => void;
}

const CATEGORIES: Array<"All" | EventCategory> = [
  "All",
  "Tech",
  "Culture",
  "Sports",
  "Leadership",
  "Academic",
  "Workshop",
];

export function HomeFeed({
  state,
  onSelectEvent,
  onOpenScanner,
  onOpenPunchModal,
}: HomeFeedProps) {
  const t = translations[state.language];
  const [selectedCategory, setSelectedCategory] = useState<"All" | EventCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const activeEvents = state.events.filter(
    (e) => e.status === "upcoming" || e.status === "live"
  );

  const filteredEvents = activeEvents.filter((event) => {
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const liveEvents = filteredEvents.filter((e) => e.status === "live");

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Category Filter Header */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-xl shadow-brand/5 backdrop-blur-2xl sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand/70">
              Explore Campus Life
            </p>
            <h2 className="mt-1 font-display text-2xl font-black text-foreground sm:text-3xl">
              Upcoming Events & Workshops
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#F2A93B]/15 px-3 py-1 text-xs font-extrabold text-[#1A3C6E] dark:text-[#F2A93B]">
            <Sparkles className="size-3.5" /> {activeEvents.length} Active Events
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder={t.common.searchEvents}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-2xl border-border/70 bg-card/80 pl-10 text-xs backdrop-blur-xl"
          />
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full px-3.5 py-1 text-xs font-bold transition-all",
                selectedCategory === cat
                  ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                  : "border border-border/70 bg-card/60 text-muted-foreground hover:bg-card/90 hover:text-foreground"
              )}
            >
              {cat === "All" ? t.common.allCategories : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Live Events Highlight Banner (if any) */}
      {liveEvents.length > 0 && (
        <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-card/70 to-card/70 p-5 shadow-lg shadow-emerald-500/10 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <Flame className="size-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex size-2 animate-ping rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Happening Right Now
                  </span>
                </div>
                <h3 className="font-display text-lg font-black text-foreground">
                  {liveEvents[0].title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {liveEvents[0].venue} · Check in with dynamic QR code now
                </p>
              </div>
            </div>

            <Button
              onClick={onOpenScanner}
              className="h-10 rounded-2xl bg-emerald-600 font-display text-xs font-black text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700"
            >
              Scan Live QR Code
            </Button>
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredEvents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-card/40 py-12 text-center backdrop-blur-xl">
            <p className="font-display text-base font-bold text-foreground">
              No events found matching "{searchQuery}"
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try searching with a different keyword or category.
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const userRegistration = state.registrations.find(
              (r) => r.eventId === event.id && r.userId === state.currentUser.id
            );
            const isRegistered = Boolean(userRegistration);
            const isWaitlisted = userRegistration?.status === "waitlisted";
            const isFull = event.registeredCount >= event.capacity;

            return (
              <div
                key={event.id}
                className="group flex flex-col justify-between gap-4 rounded-3xl border border-border/80 bg-card/70 p-5 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5 sm:flex-row sm:items-center"
              >
                {/* Date & Core Info */}
                <div className="flex items-start gap-4">
                  {/* Date Badge */}
                  <button
                    type="button"
                    onClick={() => onSelectEvent(event)}
                    className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] text-white shadow-md shadow-[#1A3C6E]/20 transition-transform group-hover:scale-105"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2A93B]">
                      {event.date.split("-")[1] === "06" ? "JUN" : "MAY"}
                    </span>
                    <span className="font-display text-xl font-black leading-none">
                      {event.date.split("-")[2] || "12"}
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1A3C6E] dark:text-[#F2A93B]">
                        {event.category}
                      </span>
                      <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                        {event.department}
                      </span>
                      {event.isTeamEvent && (
                        <span className="flex items-center gap-1 rounded-md bg-[#F2A93B]/15 px-2 py-0.5 text-[10px] font-bold text-[#1A3C6E] dark:text-[#F2A93B]">
                          <Users className="size-3" /> Team Event
                        </span>
                      )}
                      {event.status === "live" && (
                        <span className="animate-pulse rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                          🔴 LIVE
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onSelectEvent(event)}
                      className="mt-1.5 cursor-pointer font-display text-base font-bold text-foreground transition-colors hover:text-brand sm:text-lg"
                    >
                      {event.title}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5 text-brand" /> {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-brand" /> {event.venue}
                      </span>
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="size-3 fill-amber-500" /> {event.averageRating || "5.0"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Capacity & Register CTA */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 pt-3 sm:border-0 sm:pt-0">
                  <div className="text-right sm:block">
                    <span className="block text-xs font-bold text-foreground">
                      {isFull ? "Capacity reached" : `${event.capacity - event.registeredCount} seats left`}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {event.registeredCount} registered
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectEvent(event)}
                      className="h-9 rounded-xl text-xs font-semibold"
                    >
                      Details
                    </Button>

                    {isRegistered ? (
                      <div className="flex items-center gap-1.5">
                        {onOpenPunchModal && (
                          <Button
                            size="sm"
                            onClick={() => onOpenPunchModal(event)}
                            className="h-9 gap-1 rounded-xl bg-gradient-to-r from-emerald-600 to-[#1A3C6E] text-xs font-bold text-white shadow-sm hover:opacity-95"
                          >
                            <MapPin className="size-3.5 text-[#F2A93B]" />
                            Punch In / Out
                          </Button>
                        )}
                        <Button
                          size="sm"
                          disabled
                          className="h-9 gap-1 rounded-xl bg-emerald-500/15 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                        >
                          <Check className="size-3.5" />
                          {isWaitlisted ? "Waitlisted" : "Registered"}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (event.isTeamEvent) {
                            onSelectEvent(event);
                          } else {
                            campusStore.registerForEvent(event.id, false);
                            if (onOpenPunchModal) {
                              onOpenPunchModal(event);
                            }
                          }
                        }}
                        className={cn(
                          "h-9 rounded-xl font-display text-xs font-black shadow-md",
                          isFull
                            ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                            : "bg-[#1A3C6E] text-white hover:bg-[#1A3C6E]/90"
                        )}
                      >
                        {isFull ? "Waitlist" : t.common.register}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
