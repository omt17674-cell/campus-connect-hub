import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Globe,
  LogOut,
  Moon,
  RefreshCw,
  ScanBarcode,
  ShieldCheck,
  Smartphone,
  Sun,
  UserCheck,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Language, UserRole } from "@/lib/types";
import { campusStore, CampusState } from "@/lib/campus-store";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  isNotificationSoundEnabled,
  setNotificationSoundEnabled,
  playNotificationSound,
  requestBrowserNotificationPermission,
} from "@/lib/notification-sound";

interface HeaderProps {
  state: CampusState;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  onOpenMobileInstall?: () => void;
  onOpenUnifiedCheckIn?: () => void;
  onOpenDigitalId?: () => void;
  onOpenAiAssistant?: () => void;
}

export function Header({
  state,
  isDark,
  onToggleTheme,
  onOpenNotifications,
  onOpenMobileInstall,
  onOpenUnifiedCheckIn,
  onOpenDigitalId,
  onOpenAiAssistant,
}: HeaderProps) {
  const language = state?.language || "en";
  const t = translations[language] || translations.en;
  const [syncing, setSyncing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => isNotificationSoundEnabled());
  const unreadCount = (state?.notifications || []).filter((n) => !n.read).length;
  const user = state?.currentUser || {
    name: "GSFC Student",
    rollNo: "22BT04001",
    department: "Computer Science & Engineering",
    avatar: "ST",
  };

  const userRollSuffix = (user.rollNo || "").slice(-4);

  useEffect(() => {
    const handleSoundChange = (e: any) => {
      if (e?.detail?.enabled !== undefined) {
        setSoundEnabled(e.detail.enabled);
      }
    };
    window.addEventListener("notification-sound-change", handleSoundChange);
    return () => window.removeEventListener("notification-sound-change", handleSoundChange);
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setNotificationSoundEnabled(next);
    if (next) {
      playNotificationSound();
      requestBrowserNotificationPermission();
    }
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      campusStore.syncPendingCheckins();
      setSyncing(false);
    }, 600);
  };

  const toggleOfflineMode = () => {
    campusStore.setOffline(!state.isOffline);
  };

  return (
    <header className="rounded-3xl border border-border/80 bg-card/85 p-3 sm:p-4 shadow-xl shadow-brand/5 backdrop-blur-2xl flex flex-col gap-2.5 overflow-hidden w-full">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 min-w-0 w-full">
        {/* Official GSFC University Logo & App Brand */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <div className="relative flex items-center justify-center rounded-2xl bg-white px-2 py-1 shadow-xs border border-border/60 shrink-0">
            <img
              src="/gsfc-logo.jpg"
              alt="GSFC University"
              className="h-7 sm:h-8.5 w-auto object-contain"
            />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] text-[#1A3C6E] dark:text-[#F2A93B] truncate">
                {t.universityName}
              </span>
              <span className="rounded-full bg-[#F2A93B]/20 px-1.5 py-0.2 text-[8px] font-black uppercase text-[#1A3C6E] dark:text-[#F2A93B] shrink-0">
                Vadodara
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-sm sm:text-base lg:text-lg font-black tracking-tight text-foreground leading-none truncate">
                {t.appName}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[8px] sm:text-[9px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls - Perfectly aligned, responsive cluster */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Digital Campus ID Card Button */}
          {onOpenDigitalId && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenDigitalId}
              className="h-8.5 gap-1.5 rounded-full border-[#F2A93B]/40 bg-[#F2A93B]/10 px-2.5 sm:px-3 text-xs font-bold text-amber-600 dark:text-[#F2A93B] hover:bg-[#F2A93B]/20 transition-all shadow-xs shrink-0"
              title="Open Holographic Digital Student ID Card"
            >
              <ShieldCheck className="size-3.5 text-[#F2A93B] shrink-0" />
              <span className="hidden md:inline">Digital ID</span>
              {userRollSuffix && (
                <span className="font-mono text-[10px] opacity-80">{userRollSuffix}</span>
              )}
            </Button>
          )}

          {/* AI Campus Assistant Button */}
          {onOpenAiAssistant && (
            <Button
              size="sm"
              onClick={onOpenAiAssistant}
              className="h-8.5 gap-1.5 rounded-full bg-gradient-to-r from-[#1A3C6E] to-[#255294] border border-blue-400/30 px-2.5 sm:px-3 text-xs font-bold text-white shadow-xs hover:brightness-110 shrink-0"
              title="Ask GSFC Campus AI Assistant"
            >
              <Sparkles className="size-3.5 text-[#F2A93B] shrink-0" />
              <span className="hidden md:inline">AI Copilot</span>
            </Button>
          )}

          {/* Mobile App Install Button */}
          {onOpenMobileInstall && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenMobileInstall}
              className="h-8.5 gap-1 rounded-full border-brand/30 bg-brand/5 px-2 text-xs font-bold text-brand hover:bg-brand/15 hidden xl:flex shrink-0"
            >
              <Smartphone className="size-3.5 text-[#F2A93B]" />
              <span>App</span>
            </Button>
          )}

          {/* Clean Vertical Divider */}
          <div className="hidden sm:block h-4 w-px bg-border/70 mx-0.5" />

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 gap-1 rounded-full border-border/70 bg-card/60 px-2 text-xs font-semibold backdrop-blur-lg hover:bg-card/90 shrink-0"
              >
                <Globe className="size-3.5 text-brand" />
                <span className="uppercase font-bold text-[11px]">{state.language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1 shadow-lg">
              <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground px-2 py-1">
                Language / ભાષા
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => campusStore.setLanguage("en")}
                className={cn("cursor-pointer rounded-xl text-xs font-semibold px-2 py-1.5", state.language === "en" && "text-brand font-bold bg-brand/10")}
              >
                English {state.language === "en" && <Check className="ml-auto size-3 text-brand" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => campusStore.setLanguage("gu")}
                className={cn("cursor-pointer rounded-xl text-xs font-semibold px-2 py-1.5", state.language === "gu" && "text-brand font-bold bg-brand/10")}
              >
                ગુજરાતી {state.language === "gu" && <Check className="ml-auto size-3 text-brand" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => campusStore.setLanguage("hi")}
                className={cn("cursor-pointer rounded-xl text-xs font-semibold px-2 py-1.5", state.language === "hi" && "text-brand font-bold bg-brand/10")}
              >
                हिन्दी {state.language === "hi" && <Check className="ml-auto size-3 text-brand" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications Bell */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenNotifications}
            className="relative size-8.5 rounded-full text-foreground/80 hover:bg-card/70 shrink-0"
            aria-label="Notifications"
            title="Open Notifications"
          >
            <Bell className="size-3.5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-1.5">
                <span className="relative inline-flex size-1.5 rounded-full bg-[#F2A93B]" />
              </span>
            )}
          </Button>

          {/* Notification Sound Mute / Unmute Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSound}
            className={cn(
              "size-8.5 rounded-full text-foreground/80 hover:bg-card/70 transition-colors shrink-0",
              !soundEnabled && "text-muted-foreground/60 opacity-70"
            )}
            aria-label={soundEnabled ? "Mute notification sounds" : "Unmute notification sounds"}
            title={soundEnabled ? "Notification sound is ON" : "Notification sound is MUTED"}
          >
            {soundEnabled ? (
              <Volume2 className="size-3.5 text-emerald-500" />
            ) : (
              <VolumeX className="size-3.5 text-muted-foreground" />
            )}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="size-8.5 rounded-full text-foreground/80 hover:bg-card/70 shrink-0"
            aria-label={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun className="size-3.5 text-[#F2A93B]" /> : <Moon className="size-3.5 text-brand" />}
          </Button>

          {/* Clean Vertical Divider */}
          <div className="hidden sm:block h-4 w-px bg-border/70 mx-0.5" />

          {/* User Profile Pill & Integrated Sign Out Button */}
          <div className="flex items-center gap-1 shrink-0 rounded-full border border-border/70 bg-card/60 p-0.5 backdrop-blur-xl">
            <div className="flex items-center gap-1.5 px-2 py-0.5 max-w-[130px] sm:max-w-[160px] lg:max-w-[190px]">
              <div className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/10 font-display text-[10px] font-extrabold text-brand">
                {user.avatar && (user.avatar.startsWith("http") || user.avatar.startsWith("data:") || user.avatar.startsWith("/")) ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  (user.avatar || (user.name || "ST").slice(0, 2).toUpperCase())
                )}
              </div>
              <div className="text-left leading-tight truncate hidden xs:block">
                <p className="font-bold text-foreground truncate text-[11px]">{user.name}</p>
                {user.rollNo && (
                  <p className="text-[9px] text-muted-foreground font-mono truncate">{user.rollNo}</p>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => campusStore.logout()}
              className="h-7.5 gap-1 rounded-full px-2 text-[11px] font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
              title="Sign Out / Switch Login Portal"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Clean Divider between Header Row and Status Bar */}
      <div className="h-px w-full bg-border/50" />

      {/* Active Portal Scope Banner & Offline Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Logged-In Portal Scope Badge */}
        <div className="flex items-center gap-2 min-w-0">
          {state.currentRole === "student" && (
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-2.5 py-1 text-xs min-w-0">
              <div className="flex size-4.5 items-center justify-center rounded-full bg-[#1A3C6E] text-white shrink-0">
                <Users className="size-2.5" />
              </div>
              <span className="text-[11px] font-black text-foreground shrink-0">Student Portal</span>
              <span className="rounded-md bg-brand/10 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-brand truncate max-w-[180px] sm:max-w-xs">
                {user.department || "Computer Science & Engineering"}
              </span>
            </div>
          )}

          {state.currentRole === "organizer" && (
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-2.5 py-1 text-xs min-w-0">
              <div className="flex size-4.5 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
                <UserCheck className="size-2.5" />
              </div>
              <span className="text-[11px] font-black text-foreground shrink-0">Faculty & TPC Portal</span>
              <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
                Event Convener
              </span>
            </div>
          )}

          {state.currentRole === "admin" && (
            <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-2.5 py-1 text-xs min-w-0">
              <div className="flex size-4.5 items-center justify-center rounded-full bg-amber-500 text-white shrink-0">
                <ShieldCheck className="size-2.5" />
              </div>
              <span className="text-[11px] font-black text-foreground shrink-0">University Administration</span>
              <span className="rounded-md bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-bold text-amber-600 dark:text-amber-400 truncate">
                Dean Governance
              </span>
            </div>
          )}
        </div>

        {/* Offline Simulation & Sync Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {(state.pendingCheckins || []).length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
              className="h-7 gap-1.5 rounded-full border-amber-500/40 bg-amber-500/10 px-2 text-[10px] font-bold text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
            >
              <RefreshCw className={cn("size-2.5", syncing && "animate-spin")} />
              <span>{t.common.syncNow} ({state.pendingCheckins.length})</span>
            </Button>
          )}

          <button
            type="button"
            onClick={toggleOfflineMode}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold backdrop-blur-xl transition-colors",
              state.isOffline
                ? "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}
            title="Click to toggle offline mode simulation"
          >
            {state.isOffline ? (
              <>
                <WifiOff className="size-3" />
                <span>{t.common.offlineMode} · {(state.pendingCheckins || []).length} {t.common.queuePending}</span>
              </>
            ) : (
              <>
                <Wifi className="size-3" />
                <span>{t.common.synced}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
