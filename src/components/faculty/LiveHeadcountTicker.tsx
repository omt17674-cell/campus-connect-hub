import { Users, LogIn, LogOut, UserX, Activity } from "lucide-react";
import { CampusEvent } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import { cn } from "@/lib/utils";

interface LiveHeadcountTickerProps {
  event: CampusEvent;
  className?: string;
}

export function LiveHeadcountTicker({ event, className }: LiveHeadcountTickerProps) {
  const state = campusStore.getState();
  const eventRegs = state.registrations.filter((r) => r.eventId === event.id);
  const totalRegistered = eventRegs.length || event.registeredCount;

  // In Room Now: Punched in but not yet punched out
  const inRoomNow = eventRegs.filter((r) => r.punchInTime && !r.punchOutTime).length;
  const completedExit = eventRegs.filter((r) => r.punchOutTime).length;
  const notPunchedYet = Math.max(0, totalRegistered - (inRoomNow + completedExit));

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-gradient-to-r from-card/90 via-card/70 to-card/90 p-3.5 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-black text-foreground uppercase tracking-wider">
            Live Session Attendance Headcount
          </span>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground">
          {event.venue}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* In Room Now */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <LogIn className="size-3" /> In Room Now
          </div>
          <div className="font-display text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
            {inRoomNow}
          </div>
        </div>

        {/* Punched Out / Completed */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
            <LogOut className="size-3" /> Completed Exit
          </div>
          <div className="font-display text-lg font-black text-blue-700 dark:text-blue-300 mt-0.5">
            {completedExit}
          </div>
        </div>

        {/* Yet to Punch */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            <Activity className="size-3" /> Yet to Punch
          </div>
          <div className="font-display text-lg font-black text-amber-700 dark:text-amber-300 mt-0.5">
            {notPunchedYet}
          </div>
        </div>

        {/* Total Roster */}
        <div className="rounded-xl border border-border bg-card/60 p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-muted-foreground">
            <Users className="size-3" /> Total Roster
          </div>
          <div className="font-display text-lg font-black text-foreground mt-0.5">
            {totalRegistered}
          </div>
        </div>
      </div>
    </div>
  );
}
