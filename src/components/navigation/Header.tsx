import { useState } from "react";
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
  const unreadCount = state.notifications.filter((n) => !n.read).length;

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
    <header className="flex flex-col gap-4 border-b border-border/70 bg-card/40 pb-4 pt-1 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        {/* GSFC Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] text-white shadow-lg shadow-[#1A3C6E]/25">
            <span className="font-display text-lg font-black tracking-wider text-[#F2A93B]">GC</span>
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" title="System Operational" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand/70">
                {t.universityName}
              </span>
              <span className="rounded-full bg-accent/20 px-1.5 py-0.2 text-[9px] font-extrabold text-[#F2A93B]">
                VADODARA
              </span>
            </div>
            <h1 className="font-display text-xl font-black tracking-tight text-foreground sm:text-2xl">
              {t.appName}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Unified Gate Pass & Visitor Check-In Button */}
          {onOpenUnifiedCheckIn && (
            <Button
              size="sm"
              onClick={onOpenUnifiedCheckIn}
              className="h-9 gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-[#1A3C6E] to-[#0E2342] px-3.5 text-xs font-black text-white shadow-md hover:opacity-95 hidden xs:flex"
            >
              <ScanBarcode className="size-3.5 text-[#F2A93B]" />
              <span>Gate & Attendance Check-In</span>
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

          {/* Mobile App (Android & Apple) Install Button */}
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
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-2">
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
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

          {/* User Profile Pill & Logout / Switch Role */}
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs backdrop-blur-xl md:flex">
              <div className="flex size-7 items-center justify-center overflow-hidden rounded-full bg-brand/10 font-display text-xs font-extrabold text-brand">
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
              className="h-8 gap-1 rounded-full border-border/70 bg-card/50 px-2.5 text-xs font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Sign Out / Switch Login Portal"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Active Portal Scope Banner & Offline Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Logged-In Portal Scope Badge */}
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 backdrop-blur-xl shadow-sm">
          {state.currentRole === "student" && (
            <div className="flex items-center gap-2">
              <div className="flex size-5 items-center justify-center rounded-full bg-[#1A3C6E] text-white">
                <Users className="size-3" />
              </div>
              <span className="text-xs font-black text-foreground">Student Portal</span>
              <span className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                {state.currentUser.department || "B.Tech CSE"}
              </span>
            </div>
          )}

          {state.currentRole === "organizer" && (
            <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-2">
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
