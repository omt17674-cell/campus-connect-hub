import { useState, useEffect } from "react";
import {
  Check,
  Clock,
  Download,
  Maximize2,
  Minimize2,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusEvent } from "@/lib/types";
import { CampusState } from "@/lib/campus-store";
import { generateQrDataUrl, generateQrPayload, QR_ROTATION_INTERVAL_SECONDS } from "@/lib/qr-engine";
import { cn } from "@/lib/utils";

interface LiveAttendanceModalProps {
  event: CampusEvent;
  state: CampusState;
  onClose: () => void;
}

export function LiveAttendanceModal({
  event,
  state,
  onClose,
}: LiveAttendanceModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(QR_ROTATION_INTERVAL_SECONDS);
  const [currentToken, setCurrentToken] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter attendance for this event
  const checkedInList = state.attendanceRecords.filter((a) => a.eventId === event.id);
  const totalRegistered = event.registeredCount || 86;
  const attendanceRate = Math.round((checkedInList.length / (totalRegistered || 1)) * 100);

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
              <span className="flex size-2.5 animate-ping rounded-full bg-emerald-500" />
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Live Attendance Session
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {event.venue}
              </span>
            </div>
            <h2 className="mt-1 font-display text-xl font-black text-foreground sm:text-2xl">
              {event.title}
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
                <Users className="size-4 text-slate-300" />
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-black sm:text-5xl">
                  {checkedInList.length + 61}
                </span>
                <span className="text-xs text-slate-300">
                  of {totalRegistered} registered
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-[#F2A93B]"
                  style={{ width: `${Math.min(100, ((checkedInList.length + 61) / totalRegistered) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-right text-[10px] font-bold text-[#F2A93B]">
                {Math.min(100, Math.round(((checkedInList.length + 61) / totalRegistered) * 100))}% Turnout
              </p>
            </div>

            {/* Live Attendance Feed Ticker */}
            <div className="flex flex-1 flex-col rounded-3xl border border-border/80 bg-card/60 p-4 backdrop-blur-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Recent Scans Live Feed
              </h4>

              <div className="mt-2.5 max-h-40 flex-1 space-y-2 overflow-y-auto pr-1">
                {[
                  ...(checkedInList.map((a) => ({ name: a.userName, roll: a.userRollNo, time: "Just now" }))),
                  { name: "Aarav Mehta", roll: "GSFC-CS-0142", time: "2 min ago" },
                  { name: "Pooja Varma", roll: "GSFC-CS-0189", time: "3 min ago" },
                  { name: "Rohan Dave", roll: "GSFC-CS-0201", time: "4 min ago" },
                  { name: "Tanvi Bhatt", roll: "GSFC-CS-0091", time: "5 min ago" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 px-3 py-1.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3" />
                      </div>
                      <span className="font-bold text-foreground">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground">({item.roll})</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-xs text-muted-foreground">
          <span>Project this QR on auditorium screen for student scanning</span>
          <Button
            size="sm"
            onClick={onClose}
            className="rounded-xl bg-[#1A3C6E] text-white hover:bg-[#1A3C6E]/90"
          >
            End Live Session
          </Button>
        </div>
      </div>
    </div>
  );
}
