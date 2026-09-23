import {
  Award,
  CalendarDays,
  Flame,
  Globe,
  Radio,
  ScanLine,
  TicketCheck,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { CampusState } from "@/lib/campus-store";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type StudentNavView =
  | "home"
  | "events"
  | "upcoming"
  | "past"
  | "scan"
  | "passport"
  | "clubs"
  | "feed"
  | "services"
  | "internships"
  | "mentorship"
  | "gamification"
  | "profile";

interface StudentBottomNavProps {
  state: CampusState;
  activeView: StudentNavView;
  onSelectView: (view: StudentNavView) => void;
  onOpenScanner: () => void;
}

export function StudentBottomNav({
  state,
  activeView,
  onSelectView,
  onOpenScanner,
}: StudentBottomNavProps) {
  const t = translations[state.language];

  const items: Array<{
    id: StudentNavView;
    label: string;
    icon: typeof CalendarDays;
    isPrimary?: boolean;
  }> = [
    { id: "home", label: t.nav.home, icon: CalendarDays },
    { id: "events", label: "My Events", icon: TicketCheck },
    { id: "scan", label: "Scan QR", icon: ScanLine, isPrimary: true },
    { id: "passport", label: "Passport", icon: Award },
    { id: "clubs", label: "Clubs", icon: Users },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-card/95 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur-2xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-center gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={onOpenScanner}
                className="group relative -top-3 flex flex-col items-center justify-center focus:outline-none"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] text-[#F2A93B] shadow-xl shadow-[#1A3C6E]/40 transition-transform group-active:scale-95">
                  <ScanLine className="size-6" />
                </div>
                <span className="mt-1 text-[10px] font-black text-foreground">
                  Scan QR
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-1 text-center transition-colors focus:outline-none",
                isActive
                  ? "text-[#1A3C6E] dark:text-[#F2A93B] font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("size-5 transition-transform", isActive && "scale-110 stroke-[2.5]")} />
              <span className="mt-1 truncate text-[10px] font-semibold">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
