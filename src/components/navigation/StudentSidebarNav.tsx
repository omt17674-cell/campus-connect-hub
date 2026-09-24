import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  CalendarDays,
  Flame,
  GraduationCap,
  History,
  QrCode,
  Radio,
  ScanBarcode,
  ScanLine,
  TicketCheck,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusState } from "@/lib/campus-store";
import { StudentNavView } from "./StudentBottomNav";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface StudentSidebarNavProps {
  state: CampusState;
  activeView: StudentNavView;
  onSelectView: (view: StudentNavView) => void;
  onOpenScanner: () => void;
  onOpenGateModal: () => void;
}

export function StudentSidebarNav({
  state,
  activeView,
  onSelectView,
  onOpenScanner,
  onOpenGateModal,
}: StudentSidebarNavProps) {
  const language = state?.language || "en";
  const t = translations[language] || translations.en;

  const user = state?.currentUser;
  const registeredCount = (state?.events || []).filter(
    (e) => (e.registeredStudentIds || []).includes(user?.id || "")
  ).length;

  const upcomingCount = (state?.events || []).filter(
    (e) => e.status === "upcoming" || e.status === "live"
  ).length;

  const navSections: Array<{
    title: string;
    items: Array<{
      id: StudentNavView;
      label: string;
      icon: typeof CalendarDays;
      badge?: string | number;
      badgeColor?: string;
      iconColor?: string;
    }>;
  }> = [
    {
      title: "Events & Attendance",
      items: [
        {
          id: "home",
          label: t.nav.home || "Home",
          icon: CalendarDays,
        },
        {
          id: "events",
          label: t.nav.myEvents || "My Events",
          icon: TicketCheck,
          badge: registeredCount > 0 ? registeredCount : undefined,
          badgeColor: "bg-[#1A3C6E] text-white",
        },
        {
          id: "upcoming",
          label: "Upcoming Events",
          icon: Calendar,
          badge: upcomingCount > 0 ? `${upcomingCount}` : undefined,
          iconColor: "text-[#F2A93B]",
        },
        {
          id: "past",
          label: "Past Events",
          icon: History,
        },
      ],
    },
    {
      title: "Campus & Community",
      items: [
        {
          id: "passport",
          label: "360 Passport",
          icon: Award,
          iconColor: "text-[#F2A93B]",
        },
        {
          id: "clubs",
          label: "Clubs & Societies",
          icon: Users,
        },
        {
          id: "feed",
          label: "Campus Feed",
          icon: Radio,
        },
        {
          id: "services",
          label: "Services & TPC",
          icon: Building2,
        },
      ],
    },
    {
      title: "Career & Progress",
      items: [
        {
          id: "internships",
          label: "Internships",
          icon: Briefcase,
          iconColor: "text-[#F2A93B]",
        },
        {
          id: "mentorship",
          label: "Mentorship",
          icon: GraduationCap,
          iconColor: "text-emerald-500",
        },
        {
          id: "gamification",
          label: t.nav.gamification || "Leaderboard & XP",
          icon: Trophy,
          iconColor: "text-[#F2A93B]",
        },
        {
          id: "profile",
          label: t.nav.profile || "Profile",
          icon: UserRound,
        },
      ],
    },
  ];

  return (
    <div className="hidden lg:flex flex-col rounded-3xl border border-border/80 bg-card p-4 shadow-sm space-y-4 sticky top-6">
      {/* Sidebar Header with Live Indicator like Management */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h3 className="font-display text-xs font-black uppercase tracking-wider text-foreground">
            Student Hub
          </h3>
          <p className="text-[10px] text-muted-foreground font-semibold">12 Core System Modules</p>
        </div>
        <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" title="Live Portal" />
      </div>

      {/* Quick Attendance Gate Check-in Actions */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={onOpenGateModal}
          className="h-10 w-full justify-start gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-[#1A3C6E] to-[#0E2342] px-3 font-display text-xs font-black text-white shadow-md hover:opacity-95"
        >
          <ScanBarcode className="size-4 text-[#F2A93B] shrink-0" />
          <span className="truncate">Multi-Factor Check-In</span>
        </Button>

        <Button
          onClick={onOpenScanner}
          variant="outline"
          className="h-9 w-full justify-start gap-2.5 rounded-2xl border-[#1A3C6E]/30 bg-card px-3 font-display text-xs font-bold text-[#1A3C6E] hover:bg-[#1A3C6E]/5 dark:text-[#F2A93B]"
        >
          <ScanLine className="size-4 text-brand shrink-0" />
          <span className="truncate">Scan QR Code</span>
        </Button>
      </div>

      {/* Sidebar Navigation Modules List */}
      <nav className="space-y-4 text-xs">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectView(item.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all text-left",
                      isActive
                        ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-transform",
                          isActive ? "text-[#F2A93B]" : item.iconColor || "text-slate-400"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>

                    {isActive && (
                      <span className="size-1.5 rounded-full bg-[#F2A93B] shrink-0" />
                    )}

                    {!isActive && item.badge !== undefined && (
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[9px] font-black shrink-0",
                          item.badgeColor || "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Status Card */}
      {user && (
        <div className="mt-auto rounded-2xl border border-border/60 bg-muted/40 p-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-[#F2A93B]">
                <Flame className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-[9px] font-mono text-muted-foreground truncate">
                  {user.rollNo || "Student"}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400">
              Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
