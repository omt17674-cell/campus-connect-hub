import { useState, useEffect } from "react";
import {
  Award,
  Check,
  Clock,
  Download,
  Maximize2,
  Minimize2,
  QrCode,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusEvent } from "@/lib/types";
import { CampusState, campusStore } from "@/lib/campus-store";
import { generateQrDataUrl, generateQrPayload, QR_ROTATION_INTERVAL_SECONDS } from "@/lib/qr-engine";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface LiveAttendanceModalProps {
  event: CampusEvent;
  state: CampusState;
  onClose: () => void;
}

export function LiveAttendanceModal({
  event,
  state: initialState,
  onClose,
}: LiveAttendanceModalProps) {
  const [storeState, setStoreState] = useState<CampusState>(initialState);
  const [activeTab, setActiveTab] = useState<"scans" | "registered">("registered");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(QR_ROTATION_INTERVAL_SECONDS);
  const [currentToken, setCurrentToken] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Subscribe to reactive campusStore updates
  useEffect(() => {
    const unsub = campusStore.subscribe((next) => {
      setStoreState(next);
    });
    return () => unsub();
  }, []);

  // Supabase Realtime listeners for immediate live updates when a student scans or registers
  useEffect(() => {
    campusStore.loadFromSupabase();

    const channel = supabase
      .channel(`live-session-${event.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance" },
        () => {
          campusStore.loadFromSupabase();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        () => {
          campusStore.loadFromSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id]);

  // Real live data calculations
  const currentEvent = storeState.events.find((e) => e.id === event.id) || event;
  const eventRegistrations = (storeState.registrations || []).filter((r) => r.eventId === event.id);
  const totalRegistered = Math.max(eventRegistrations.length, currentEvent.registeredCount || 0);

  const checkedInList = (storeState.attendanceRecords || []).filter((a) => a.eventId === event.id);
  const checkInCount = checkedInList.length;
  const turnoutPercent = totalRegistered > 0 ? Math.min(100, Math.round((checkInCount / totalRegistered) * 100)) : 0;

  // Generate & rotate QR code every 45s
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const refreshQr = async () => {
      const { jsonString, payload, secondsRemaining: sec } = generateQrPayload(event.id, event.title);
      setCurrentToken(payload.token);
      setSecondsRemaining(sec);
      const url = await generateQrDataUrl(jsonString);
      setQrDataUrl(url);
    };

    refreshQr();

    // 1-second countdown interval
    timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          refreshQr();
          return QR_ROTATION_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [event.id, event.title]);

  const handleConclude = () => {
    const res = campusStore.endAndConcludeEvent(event.id);
    toast.success(res.message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div
        className={cn(
          "relative flex flex-col rounded-3xl border border-border/80 bg-card p-6 shadow-2xl transition-all",
          isFullscreen
            ? "size-full max-w-none justify-between rounded-none p-8"
            : "w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        )}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500" />
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Live Attendance Session
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {currentEvent.venue || "Campus Venue"}
              </span>
            </div>
            <h2 className="mt-1 font-display text-xl font-black text-foreground sm:text-2xl">
              {currentEvent.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-full text-muted-foreground hover:text-foreground"
              title="Toggle Fullscreen Projector Mode"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Center Grid: QR Code Display + Live Stats */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1.2fr_1fr]">
          {/* Rotating QR Box */}
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-brand/30 bg-card/60 p-6 text-center shadow-xl backdrop-blur-xl">
            <div className="relative rounded-2xl bg-white p-3 shadow-md">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Dynamic Rotating Attendance QR"
                  className={cn("transition-all", isFullscreen ? "size-64" : "size-52")}
                />
              ) : (
                <div className="flex size-52 items-center justify-center">
                  <RefreshCw className="size-8 animate-spin text-brand" />
                </div>
              )}
            </div>

            {/* Rotation Countdown Bar */}
            <div className="mt-4 w-full max-w-[240px]">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3 text-brand" /> Rotates in
                </span>
                <span className="font-display text-brand">{secondsRemaining}s</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#F2A93B] transition-all duration-1000"
                  style={{ width: `${(secondsRemaining / QR_ROTATION_INTERVAL_SECONDS) * 100}%` }}
                />
              </div>
            </div>

            {/* Token Badge */}
            <div className="mt-3 flex items-center gap-1.5 rounded-full bg-brand/5 px-3 py-1 text-[10px] font-mono font-bold text-muted-foreground">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              <span>Token: {currentToken}</span>
            </div>
          </div>

          {/* Live Attendance Counter & Feed */}
          <div className="flex flex-col justify-between gap-4">
            {/* Live Count Card */}
            <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] p-5 text-white shadow-xl shadow-[#1A3C6E]/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F2A93B]">
                  Verified Check-ins
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">
                  <Users className="size-3 text-[#F2A93B]" />
                  <span>{totalRegistered} Registered</span>
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-black sm:text-5xl">
                  {checkInCount}
                </span>
                <span className="text-xs text-slate-300">
                  of {totalRegistered} registered
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#F2A93B] transition-all duration-500"
                  style={{ width: `${turnoutPercent}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] font-bold text-slate-300">
                <span>Capacity: {currentEvent.capacity}</span>
                <span className="text-[#F2A93B]">{turnoutPercent}% Turnout</span>
              </div>
            </div>

            {/* Live Feed Container with Tabs for Registered vs Checked-In */}
            <div className="flex flex-1 flex-col rounded-3xl border border-border/80 bg-card/60 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("registered")}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors",
                      activeTab === "registered"
                        ? "bg-[#1A3C6E] text-white"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Registered ({totalRegistered})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("scans")}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors",
                      activeTab === "scans"
                        ? "bg-emerald-600 text-white"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Scanned ({checkInCount})
                  </button>
                </div>
              </div>

              {/* Tab 1: Registered Students */}
              {activeTab === "registered" && (
                <div className="mt-2.5 max-h-40 flex-1 space-y-2 overflow-y-auto pr-1">
                  {eventRegistrations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                      <Users className="size-8 text-muted-foreground/30 mb-2" />
                      <p className="text-xs font-bold text-foreground">0 Students Registered</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Students who register from the event feed will appear here live.
                      </p>
                    </div>
                  ) : (
                    eventRegistrations.map((reg) => (
                      <div
                        key={reg.id}
                        className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-3 py-1.5 text-xs"
                      >
                        <div>
                          <span className="font-bold text-foreground">{reg.userName}</span>
                          <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">
                            ({reg.userRollNo})
                          </span>
                          <p className="text-[10px] text-slate-500">{reg.department}</p>
                        </div>
                        <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                          {reg.status || "Registered"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Live Scans Check-in Feed */}
              {activeTab === "scans" && (
                <div className="mt-2.5 max-h-40 flex-1 space-y-2 overflow-y-auto pr-1">
                  {checkedInList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                      <QrCode className="size-8 text-muted-foreground/30 mb-2" />
                      <p className="text-xs font-bold text-foreground">Awaiting Student Scans</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Students will appear here live when they scan this QR code.
                      </p>
                    </div>
                  ) : (
                    checkedInList.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-3 py-1.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Check className="size-3" />
                          </div>
                          <div>
                            <span className="font-bold text-foreground">{item.userName}</span>
                            <span className="text-[10px] text-muted-foreground ml-1 font-mono">
                              ({item.userRollNo})
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {item.punchInTime || "Checked in"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/70 pt-4 text-xs text-muted-foreground">
          <span>Project this QR on auditorium screen for student scanning</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs font-semibold"
            >
              Close Window
            </Button>
            <Button
              size="sm"
              onClick={handleConclude}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-[#1A3C6E] text-xs font-bold text-white shadow-md hover:opacity-95"
            >
              <Award className="mr-1.5 size-3.5 text-[#F2A93B]" />
              Conclude Event & Issue Certificates
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
