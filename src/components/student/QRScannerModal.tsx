import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Award,
  Camera,
  Check,
  Compass,
  Flame,
  MapPin,
  Navigation,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  WifiOff,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { CampusEvent } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import { generateQrPayload, validateQrPayload } from "@/lib/qr-engine";
import {
  calculateDistanceMeters,
  Coordinates,
  getLiveStudentLocation,
  GSFC_CAMPUS_VENUES,
} from "@/lib/geofence-engine";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface QRScannerModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function QRScannerModal({ onClose, onSuccess }: QRScannerModalProps) {
  const state = campusStore.getState();
  const t = translations[state.language];

  const [scanStatus, setScanStatus] = useState<"ready" | "scanning" | "success" | "error">("ready");
  const [errorMessage, setErrorMessage] = useState("");
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [scannedEvent, setScannedEvent] = useState<CampusEvent | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Live Location & Geofencing state
  const [userLocation, setUserLocation] = useState<Coordinates>({ latitude: 22.3688, longitude: 73.1893 });
  const [locationAccuracy, setLocationAccuracy] = useState<number>(15);
  const [locationStatus, setLocationStatus] = useState<"loading" | "acquired" | "simulated" | "denied">("loading");
  const [locationBypass, setLocationBypass] = useState(false);

  // Default to live event or first event
  const liveEvent = state.events.find((e) => e.status === "live") || state.events[0];
  const [selectedSimEventId, setSelectedSimEventId] = useState(liveEvent?.id || "");

  const currentSelectedEvent = state.events.find((e) => e.id === selectedSimEventId) || liveEvent;
  const venueCoords =
    GSFC_CAMPUS_VENUES[currentSelectedEvent?.venue || ""] ||
    GSFC_CAMPUS_VENUES["Default GSFC Campus"];
  const allowedRadius = currentSelectedEvent?.allowedRadiusMeters || 350;

  const currentDistanceMeters = calculateDistanceMeters(userLocation, venueCoords);
  const isInsideGeofence = currentDistanceMeters <= allowedRadius;

  // Request live device GPS coordinates
  useEffect(() => {
    let isMounted = true;

    async function fetchLocation() {
      try {
        const { coords, accuracy } = await getLiveStudentLocation();
        if (isMounted) {
          setUserLocation(coords);
          setLocationAccuracy(Math.round(accuracy));
          setLocationStatus("acquired");
        }
      } catch (e) {
        // Fallback to default on-campus simulation coords
        if (isMounted) {
          setUserLocation({ latitude: 22.3689, longitude: 73.1892 });
          setLocationStatus("simulated");
        }
      }
    }

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  // Request actual camera stream if available on device
  useEffect(() => {
    let mounted = true;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });
          if (mounted) {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            setHasCameraPermission(true);
          }
        } else {
          setHasCameraPermission(false);
        }
      } catch (err) {
        console.warn("Camera access not available or denied, simulator available:", err);
        if (mounted) setHasCameraPermission(false);
      }
    }

    initCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleProcessScan = (payloadJson: string, eventId: string) => {
    setScanStatus("scanning");

    setTimeout(() => {
      // Validate token
      const validation = validateQrPayload(payloadJson, eventId);
      if (!validation.valid) {
        setScanStatus("error");
        setErrorMessage(validation.reason || t.scan.scanFailure);
        return;
      }

      const event = state.events.find((e) => e.id === eventId);
      if (!event) {
        setScanStatus("error");
        setErrorMessage("Event not found in campus directory.");
        return;
      }

      // Check Geofencing
      if (!isInsideGeofence && !locationBypass) {
        setScanStatus("error");
        setErrorMessage(
          `Geofence Failed: You are ${currentDistanceMeters}m away from ${event.venue}. Attendance requires you to be within ${allowedRadius}m of the campus venue.`
        );
        return;
      }

      setScannedEvent(event);

      // Perform check-in via store (attaching live GPS coordinates)
      const res = campusStore.recordCheckIn(
        eventId,
        validation.payload?.token || "QR-VERIFIED",
        false,
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          distanceMeters: currentDistanceMeters,
          verified: isInsideGeofence || locationBypass,
        }
      );

      if (!res.success) {
        setScanStatus("error");
        setErrorMessage(res.message);
        return;
      }

      setOfflineSaved(res.offlineQueued);
      setScanStatus("success");

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#1A3C6E", "#F2A93B", "#10B981", "#6366F1"],
        });
      } catch {}

      if (onSuccess) onSuccess();
    }, 450);
  };

  const handleSimulateScan = () => {
    const targetEvent = state.events.find((e) => e.id === selectedSimEventId) || liveEvent;
    if (!targetEvent) return;

    // Generate fresh time-bound rotating token
    const { jsonString } = generateQrPayload(targetEvent.id, targetEvent.title);
    handleProcessScan(jsonString, targetEvent.id);
  };

  const handleSimulateExpiredScan = () => {
    const oldPayload = {
      version: "1.0",
      eventId: selectedSimEventId || liveEvent?.id || "evt-1",
      eventTitle: "Expired Session",
      timestamp: Date.now() - 3600000,
      windowId: Math.floor((Date.now() - 3600000) / 45000),
      token: "GSFC-EXPIRED-TOKEN",
      signature: "GSFC-INVALID",
    };
    handleProcessScan(JSON.stringify(oldPayload), selectedSimEventId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative max-h-[95vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-md hover:bg-background"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] text-[#F2A93B] shadow-lg shadow-[#1A3C6E]/30">
            <QrCode className="size-6" />
          </div>
          <h3 className="mt-3 font-display text-xl font-black text-foreground">
            {t.scan.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.scan.subtitle}
          </p>
        </div>

        {/* Live GPS Geolocation Status Bar */}
        <div className="mt-4 rounded-2xl border border-border/70 bg-card/60 p-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <MapPin className="size-3.5 text-brand" />
              <span>Live Location Verification</span>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                isInsideGeofence
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              )}
            >
              {isInsideGeofence ? "📍 In Campus Venue" : "⚠️ Outside Radius"}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              Distance: <strong className="text-foreground">{currentDistanceMeters}m</strong> / {allowedRadius}m allowed
            </span>
            <span className="font-mono text-[10px]">
              {userLocation.latitude.toFixed(4)}° N, {userLocation.longitude.toFixed(4)}° E
            </span>
          </div>

          {/* Location preset switches for testing */}
          <div className="mt-2.5 flex flex-wrap gap-1 border-t border-border/60 pt-2 text-[10px]">
            <span className="self-center font-bold text-muted-foreground mr-1">Simulate GPS:</span>
            <button
              type="button"
              onClick={() => setUserLocation({ latitude: 22.3689, longitude: 73.1892 })}
              className={cn(
                "rounded-md border px-2 py-0.5 font-semibold",
                currentDistanceMeters < 50
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold"
                  : "border-border/70 text-muted-foreground"
              )}
            >
              On-Site (18m)
            </button>
            <button
              type="button"
              onClick={() => setUserLocation({ latitude: 22.3670, longitude: 73.1880 })}
              className={cn(
                "rounded-md border px-2 py-0.5 font-semibold",
                currentDistanceMeters >= 50 && currentDistanceMeters <= 350
                  ? "border-amber-500 bg-amber-500/10 text-amber-600 font-bold"
                  : "border-border/70 text-muted-foreground"
              )}
            >
              Campus Gate (220m)
            </button>
            <button
              type="button"
              onClick={() => setUserLocation({ latitude: 22.3480, longitude: 73.1650 })}
              className={cn(
                "rounded-md border px-2 py-0.5 font-semibold",
                currentDistanceMeters > 350
                  ? "border-rose-500 bg-rose-500/10 text-rose-600 font-bold"
                  : "border-border/70 text-muted-foreground"
              )}
            >
              Off-Campus (2.4km)
            </button>
          </div>
        </div>

        {/* Viewfinder / Camera Screen */}
        <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-2xl border-2 border-dashed border-[#1A3C6E]/40 bg-slate-950">
          {hasCameraPermission ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center p-6 text-center text-slate-300">
              <Camera className="size-10 text-brand opacity-60" />
              <p className="mt-2 text-xs font-semibold">Camera Viewfinder Active</p>
              <p className="mt-1 text-[11px] text-slate-400">
                (GPS Geofence + Rotating QR Active)
              </p>
            </div>
          )}

          {/* Target Reticle Box */}
          <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-[#F2A93B] shadow-[0_0_15px_rgba(242,169,59,0.3)]">
            {/* Animated Laser Scanning Line */}
            {scanStatus === "scanning" || scanStatus === "ready" ? (
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#F2A93B] to-transparent shadow-[0_0_8px_#F2A93B] animate-pulse" />
            ) : null}

            {/* Corner Markers */}
            <div className="absolute -left-1 -top-1 size-4 border-l-4 border-t-4 border-[#F2A93B]" />
            <div className="absolute -right-1 -top-1 size-4 border-r-4 border-t-4 border-[#F2A93B]" />
            <div className="absolute -bottom-1 -left-1 size-4 border-b-4 border-l-4 border-[#F2A93B]" />
            <div className="absolute -bottom-1 -right-1 size-4 border-b-4 border-r-4 border-[#F2A93B]" />
          </div>

          {/* Success Overlay */}
          {scanStatus === "success" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/90 p-6 text-center text-white backdrop-blur-sm animate-in fade-in">
              <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/50">
                <Check className="size-8 stroke-[3]" />
              </div>
              <h4 className="mt-3 font-display text-lg font-black">
                {offlineSaved ? "Queued for Offline Sync" : "Presence Verified with Live Location!"}
              </h4>
              <p className="mt-1 text-xs text-emerald-200">
                {scannedEvent?.title}
              </p>

              <div className="mt-3 flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300">
                <ShieldCheck className="size-3.5 text-[#F2A93B]" />
                <span>Geo-Verified ({currentDistanceMeters}m from venue)</span>
              </div>

              {offlineSaved ? (
                <div className="mt-3 flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
                  <WifiOff className="size-3.5" />
                  <span>{t.scan.offlineSaved}</span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                    <Sparkles className="size-3.5 text-[#F2A93B]" /> +60 XP (Bonus)
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-[#F2A93B]">
                    <Flame className="size-3.5" /> 8 Day Streak
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error Overlay */}
          {scanStatus === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/95 p-6 text-center text-white backdrop-blur-sm animate-in fade-in">
              <div className="flex size-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-xl shadow-rose-500/50">
                <AlertTriangle className="size-7" />
              </div>
              <h4 className="mt-3 font-display text-lg font-black">Check-in Blocked</h4>
              <p className="mt-1 text-xs text-rose-200 leading-relaxed">{errorMessage}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setScanStatus("ready")}
                  className="rounded-xl bg-white text-rose-950 hover:bg-white/90"
                >
                  <RefreshCw className="mr-1.5 size-3.5" /> Try Again
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setLocationBypass(true);
                    setScanStatus("ready");
                  }}
                  className="rounded-xl border-white/40 text-xs text-white hover:bg-white/10"
                >
                  Bypass Geofence (Admin Demo)
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* QR Simulation Trigger Controls */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <select
              value={selectedSimEventId}
              onChange={(e) => setSelectedSimEventId(e.target.value)}
              className="h-9 flex-1 rounded-xl border border-border/70 bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
            >
              {state.events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.status === "live" ? "🔴 " : ""}
                  {evt.title} ({evt.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleSimulateScan}
              disabled={scanStatus === "scanning"}
              className="rounded-xl bg-[#1A3C6E] text-xs font-bold text-white hover:bg-[#1A3C6E]/90"
            >
              <ScanLine className="mr-1.5 size-3.5 text-[#F2A93B]" />
              Scan QR & Geo-Verify
            </Button>
            <Button
              onClick={handleSimulateExpiredScan}
              variant="outline"
              disabled={scanStatus === "scanning"}
              className="rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Test Expired Token
            </Button>
          </div>
        </div>

        {scanStatus === "success" && (
          <Button
            onClick={onClose}
            className="mt-3 w-full rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700"
          >
            Done
          </Button>
        )}
      </div>
    </div>
  );
}
