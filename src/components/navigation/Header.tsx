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
  const t = translations[state.language];
  const [syncing, setSyncing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => isNotificationSoundEnabled());
  const unreadCount = state.notifications.filter((n) => !n.read).length;

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
    <header className="rounded-3xl border border-border/80 bg-card/75 p-3.5 sm:p-4 shadow-xl shadow-brand/5 backdrop-blur-2xl flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Official GSFC University Logo & App Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center rounded-2xl bg-white px-2 py-1 shadow-xs border border-border/60 shrink-0">
            <img
              src="/gsfc-logo.jpg"
              alt="GSFC University"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A3C6E] dark:text-[#F2A93B]">
                {t.universityName}
              </span>
              <span className="rounded-full bg-[#F2A93B]/20 px-1.5 py-0.2 text-[8px] font-black uppercase text-[#1A3C6E] dark:text-[#F2A93B]">
                Vadodara
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base sm:text-lg font-black tracking-tight text-foreground leading-none">
                {t.appName}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls - Perfectly aligned h-9 row */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Unified Gate Pass & Visitor Check-In Button */}
          {onOpenUnifiedCheckIn && (
            <Button
              size="sm"
              onClick={onOpenUnifiedCheckIn}
              className="h-9 gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-[#1A3C6E] to-[#0E2342] px-3.5 text-xs font-black text-white shadow-md hover:opacity-95 hidden xs:flex"
            >
              <ScanBarcode className="size-3.5 text-[#F2A93B]" />
              <span>Gate Check-In</span>
            </Button>
          )}

          {/* Digital Campus ID Card Button */}
          {onOpenDigitalId && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenDigitalId}
              className="h-9 gap-1.5 rounded-full border-[#F2A93B]/40 bg-[#F2A93B]/10 px-3 text-xs font-bold text-amber-600 dark:text-[#F2A93B] hover:bg-[#F2A93B]/20"
              title="Open Holographic Digital Student ID Card"
            >
              <ShieldCheck className="size-3.5 text-[#F2A93B]" />
              <span className="hidden sm:inline">Digital ID</span>
              <span className="font-mono text-[10px] opacity-80">{state.currentUser.rollNo.slice(-4)}</span>
            </Button>
          )}

          {/* AI Campus Assistant Button */}
          {onOpenAiAssistant && (
            <Button
              size="sm"
              onClick={onOpenAiAssistant}
              className="h-9 gap-1.5 rounded-full bg-gradient-to-r from-[#1A3C6E] to-[#255294] border border-blue-400/30 px-3 text-xs font-bold text-white shadow-md hover:brightness-110"
              title="Ask GSFC Campus AI Assistant"
            >
              <span className="relative flex size-2">
                <span className="relative inline-flex size-2 rounded-full bg-[#F2A93B]" />
              </span>
              <span className="hidden sm:inline">AI Copilot</span>
            </Button>
          )}

          {/* Mobile App Install Button */}
          {onOpenMobileInstall && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenMobileInstall}
              className="h-9 gap-1.5 rounded-full border-brand/30 bg-brand/5 px-3 text-xs font-bold text-brand hover:bg-brand/15 hidden md:flex"
            >
              <Smartphone className="size-3.5 text-[#F2A93B]" />
              <span>App</span>
            </Button>
          )}

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-full border-border/70 bg-card/60 px-3 text-xs font-semibold backdrop-blur-lg hover:bg-card/90"
              >
                <Globe className="size-3.5 text-brand" />
                <span className="uppercase">{state.language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuLabel className="text-xs font-bold text-muted-foreground">
                Language / ભાષા
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => campusStore.setLanguage("en")}
                className={cn("cursor-pointer text-xs font-semibold", state.language === "en" && "text-brand font-bold")}
              >
                English {state.language === "en" && <Check className="ml-auto size-3" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => campusStore.setLanguage("gu")}
                className={cn("cursor-pointer text-xs font-semibold", state.language === "gu" && "text-brand font-bold")}
              >
                ગુજરાતી {state.language === "gu" && <Check className="ml-auto size-3" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => campusStore.setLanguage("hi")}
                className={cn("cursor-pointer text-xs font-semibold", state.language === "hi" && "text-brand font-bold")}
              >
                हिन्दी {state.language === "hi" && <Check className="ml-auto size-3" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications Bell */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenNotifications}
            className="relative size-9 rounded-full text-foreground/80 hover:bg-card/70"
            aria-label="Notifications"
            title="Open Notifications"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-2">
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
            )}
          </Button>

          {/* Notification Sound Mute / Unmute Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSound}
            className={cn(
              "size-9 rounded-full text-foreground/80 hover:bg-card/70 transition-colors",
              !soundEnabled && "text-muted-foreground/60 opacity-70"
            )}
            aria-label={soundEnabled ? "Mute notification sounds" : "Unmute notification sounds"}
            title={soundEnabled ? "Notification sound is ON (click to mute)" : "Notification sound is MUTED (click to enable)"}
          >
            {soundEnabled ? (
              <Volume2 className="size-4 text-emerald-500" />
            ) : (
              <VolumeX className="size-4 text-muted-foreground" />
            )}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="size-9 rounded-full text-foreground/80 hover:bg-card/70"
            aria-label={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun className="size-4 text-[#F2A93B]" /> : <Moon className="size-4 text-brand" />}
          </Button>

          {/* User Profile Pill & Logout / Switch Role - aligned h-9 */}
          <div className="flex items-center gap-1.5">
            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 h-9 text-xs backdrop-blur-xl md:flex">
              <div className="flex size-6 items-center justify-center overflow-hidden rounded-full bg-brand/10 font-display text-[10px] font-extrabold text-brand">
                {state.currentUser.avatar && (state.currentUser.avatar.startsWith("http") || state.currentUser.avatar.startsWith("data:") || state.currentUser.avatar.startsWith("/")) ? (
                  <img src={state.currentUser.avatar} alt={state.currentUser.name} className="h-full w-full object-cover" />
                ) : (
                  (state.currentUser.avatar || state.currentUser.name.slice(0, 2).toUpperCase())
                )}
              </div>
              <div className="text-left leading-none">
                <p className="font-bold text-foreground">{state.currentUser.name}</p>
                <p className="text-[10px] text-muted-foreground">{state.currentUser.rollNo}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => campusStore.logout()}
              className="h-9 gap-1.5 rounded-full border-border/70 bg-card/50 px-3 text-xs font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              title="Sign Out / Switch Login Portal"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Clean Divider between Header Row and Status Bar */}
      <div className="h-px w-full bg-border/60" />

      {/* Active Portal Scope Banner & Offline Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Logged-In Portal Scope Badge */}
        <div className="flex items-center gap-2">
          {state.currentRole === "student" && (
            <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-1.5 text-xs">
              <div className="flex size-5 items-center justify-center rounded-full bg-[#1A3C6E] text-white">
                <Users className="size-3" />
              </div>
              <span className="text-xs font-black text-foreground">Student Portal</span>
              <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                {state.currentUser.department || "Computer Science & Engineering"}
              </span>
            </div>
          )}

          {state.currentRole === "organizer" && (
            <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-1.5 text-xs">
              <div className="flex size-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                <UserCheck className="size-3" />
              </div>
              <span className="text-xs font-black text-foreground">Faculty & TPC Organizer Portal</span>
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Event Convener
              </span>
            </div>
          )}

          {state.currentRole === "admin" && (
            <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-1.5 text-xs">
              <div className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-white">
                <ShieldCheck className="size-3" />
              </div>
              <span className="text-xs font-black text-foreground">University Administration Portal</span>
              <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                Dean Governance
              </span>
            </div>
          )}
        </div>

        {/* Offline Simulation & Sync Pill */}
        <div className="flex items-center gap-2">
          {state.pendingCheckins.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
              className="h-8 gap-1.5 rounded-full border-amber-500/40 bg-amber-500/10 px-3 text-xs font-bold text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
            >
              <RefreshCw className={cn("size-3", syncing && "animate-spin")} />
              <span>{t.common.syncNow} ({state.pendingCheckins.length})</span>
            </Button>
          )}

          <button
            type="button"
            onClick={toggleOfflineMode}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-xl transition-colors",
              state.isOffline
                ? "border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            )}
            title="Click to toggle offline mode simulation"
          >
            {state.isOffline ? (
              <>
                <WifiOff className="size-3.5" />
                <span>{t.common.offlineMode} · {state.pendingCheckins.length} {t.common.queuePending}</span>
              </>
            ) : (
              <>
                <Wifi className="size-3.5" />
                <span>{t.common.synced}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
