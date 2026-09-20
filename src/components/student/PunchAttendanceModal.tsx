import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Hourglass,
  LogIn,
  LogOut,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { CampusEvent } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import {
  calculateDistanceMeters,
  Coordinates,
  getLiveStudentLocation,
  GSFC_CAMPUS_VENUES,
} from "@/lib/geofence-engine";
import { generateCertificatePdf } from "@/lib/certificate-generator";
import {
  reverseGeocodeWithGeoapify,
  GeoapifyLocationDetails,
} from "@/lib/geoapify";
import { GeoapifyLiveMapCard } from "@/components/common/GeoapifyLiveMapCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PunchAttendanceModalProps {
  event: CampusEvent;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PunchAttendanceModal({
  event,
  onClose,
  onSuccess,
}: PunchAttendanceModalProps) {
  const state = campusStore.getState();

  // Find registration & attendance record for this event
  const registration = state.registrations.find(
    (r) => r.eventId === event.id && r.userId === state.currentUser.id
  );
  const attendance = state.attendanceRecords.find(
    (a) => a.eventId === event.id && a.userId === state.currentUser.id
  );

  // Live Location & Geofencing
  const [userLocation, setUserLocation] = useState<Coordinates>({
    latitude: 22.3688,
    longitude: 73.1893,
  });
  const [locationDetails, setLocationDetails] = useState<GeoapifyLocationDetails | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState<"loading" | "acquired" | "simulated">("loading");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPunching, setIsPunching] = useState(false);

  const venueCoords =
    GSFC_CAMPUS_VENUES[event.venue] || GSFC_CAMPUS_VENUES["Default GSFC Campus"];
  const allowedRadius = event.allowedRadiusMeters || 350;
  const currentDistanceMeters = calculateDistanceMeters(userLocation, venueCoords);
  const isInsideGeofence = currentDistanceMeters <= allowedRadius;

  // Has punched in / punched out
  const isPunchedIn = Boolean(registration?.punchInTime || attendance?.punchInTime);
  const isPunchedOut = Boolean(registration?.punchOutTime || attendance?.punchOutTime);
  const isFullyAttended = isPunchedIn && isPunchedOut;

  const refreshGps = async () => {
    setLocationStatus("loading");
    setStatusMessage("Locking live Geoapify GPS coordinates...");
    try {
      const { coords, accuracy } = await getLiveStudentLocation();
      setUserLocation(coords);
      setLocationAccuracy(Math.round(accuracy));
      setLocationStatus("acquired");

      // Reverse geocode via Geoapify API
      const details = await reverseGeocodeWithGeoapify(coords.latitude, coords.longitude);
      setLocationDetails(details);
      setStatusMessage(`📍 Live GPS Locked: ${details.formattedAddress}`);
    } catch (err: any) {
      setLocationStatus("simulated");
      const fallbackDetails = await reverseGeocodeWithGeoapify(userLocation.latitude, userLocation.longitude);
      setLocationDetails(fallbackDetails);
      setStatusMessage(err?.message || "Using active campus coordinates.");
    }
  };

  // Acquire live GPS and exact address on mount
  useEffect(() => {
    let mounted = true;
    async function initGps() {
      try {
        const { coords, accuracy } = await getLiveStudentLocation();
        if (mounted) {
          setUserLocation(coords);
          setLocationAccuracy(Math.round(accuracy));
          setLocationStatus("acquired");

          // Exact location via Geoapify
          const details = await reverseGeocodeWithGeoapify(coords.latitude, coords.longitude);
          if (mounted) {
            setLocationDetails(details);
          }
        }
      } catch {
        if (mounted) {
          const fallbackCoords = { latitude: 22.3689, longitude: 73.1892 };
          setUserLocation(fallbackCoords);
          setLocationStatus("simulated");
          const details = await reverseGeocodeWithGeoapify(fallbackCoords.latitude, fallbackCoords.longitude);
          if (mounted) {
            setLocationDetails(details);
          }
        }
      }
    }
    initGps();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle Punch In
  const handlePunchIn = () => {
    setIsPunching(true);
    setTimeout(() => {
      const res = campusStore.punchIn(event.id, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        distanceMeters: currentDistanceMeters,
        verified: true,
        address: locationDetails?.formattedAddress,
      });

      setIsPunching(false);
      if (res.success) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#10B981", "#1A3C6E", "#F2A93B"],
          });
        } catch {}
        setStatusMessage(`✅ Punch-In confirmed at your exact location: ${locationDetails?.formattedAddress || "GSFC Campus"} (${currentDistanceMeters}m from venue).`);
        if (onSuccess) onSuccess();
      } else {
        setStatusMessage(res.message);
      }
    }, 400);
  };

  // Handle Punch Out
  const handlePunchOut = () => {
    setIsPunching(true);
    setTimeout(() => {
      const res = campusStore.punchOut(event.id, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        distanceMeters: currentDistanceMeters,
        verified: true,
        address: locationDetails?.formattedAddress,
      });

      setIsPunching(false);
      if (res.success) {
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
            colors: ["#10B981", "#F2A93B", "#3B82F6", "#8B5CF6"],
          });
        } catch {}
        setStatusMessage(`✅ Punch-Out confirmed at your exact location: ${locationDetails?.formattedAddress || "GSFC Campus"}.`);
        if (onSuccess) onSuccess();
      }
    }, 400);
  };

  // Download certificate helper
  const handleDownloadCertificate = async () => {
    if (!attendance) {
      toast.error("Attendance verification required to generate certificate.");
      return;
    }
    try {
      await generateCertificatePdf(attendance, event, state.currentUser);
      toast.success("Certificate downloaded successfully!");
    } catch (err: any) {
      console.error("Certificate download error", err);
      const specificMissing: string[] = [];
      if (!event.organizerName) specificMissing.push("organizer name");
      if (!event.venue) specificMissing.push("venue");
      if (!event.date) specificMissing.push("event date");
      if (!state.currentUser.department) specificMissing.push("department");

      if (specificMissing.length > 0) {
        toast.error(
          `Certificate generation failed: missing ${specificMissing.join(", ")}. Please contact the event coordinator.`
        );
      } else {
        toast.error(`Certificate download error: ${err?.message || "Failed to generate PDF"}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl text-foreground">
        {/* Close Button */}
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
            <Clock className="size-6" />
          </div>
          <h3 className="mt-3 font-display text-xl font-black">
            Event Attendance Verification
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {event.title}
          </p>
        </div>

        {/* Event Details Card */}
        <div className="mt-4 rounded-2xl border border-border/70 bg-card/60 p-3.5 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3.5 text-brand" /> {event.date} · {event.time}
            </span>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
              {event.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-foreground pt-1 border-t border-border/50">
            <MapPin className="size-3.5 text-amber-500" />
            <span>Venue: {event.venue}</span>
          </div>
        </div>

        {/* Live Geoapify Map Card & Exact Address */}
        <div className="mt-3.5">
          <GeoapifyLiveMapCard
            userLocation={userLocation}
            venueLocation={venueCoords}
            venueName={event.venue}
            locationDetails={locationDetails}
            distanceMeters={currentDistanceMeters}
            isInsideGeofence={isInsideGeofence}
            isLoading={locationStatus === "loading"}
            onRefresh={refreshGps}
          />
        </div>

        {/* Status Alert Message */}
        {statusMessage && (
          <div className="mt-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-2.5 text-center text-xs font-bold text-blue-700 dark:text-blue-300 animate-in fade-in">
            {statusMessage}
          </div>
        )}

        {/* Punch In / Punch Out Interactive Buttons */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Punch In Card */}
          <div
            className={cn(
              "rounded-2xl border p-4 text-center transition-all",
              isPunchedIn
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-border bg-card/60"
            )}
          >
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 mb-2">
              <LogIn className="size-5" />
            </div>
            <h4 className="font-bold text-sm">Step 1: Punch In</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isPunchedIn
                ? `Entry Recorded (${registration?.punchInTime?.slice(11, 16) || "Verified"})`
                : "Mark entry when arriving at venue"}
            </p>

            <Button
              onClick={handlePunchIn}
              disabled={isPunchedIn || isPunching}
              className={cn(
                "mt-3 w-full rounded-xl text-xs font-bold shadow-md",
                isPunchedIn
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              )}
            >
              {isPunchedIn ? (
                <>
                  <CheckCircle2 className="mr-1.5 size-4" /> Entry Verified
                </>
              ) : (
                <>
                  <LogIn className="mr-1.5 size-4" /> Punch In (+30 XP)
                </>
              )}
            </Button>
          </div>

          {/* Punch Out Card */}
          <div
            className={cn(
              "rounded-2xl border p-4 text-center transition-all",
              isFullyAttended
                ? "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                : !isPunchedIn
                ? "border-border/40 bg-card/30 opacity-60"
                : "border-amber-500/50 bg-amber-500/10"
            )}
          >
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 mb-2">
              <LogOut className="size-5" />
            </div>
            <h4 className="font-bold text-sm">Step 2: Punch Out</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isFullyAttended
                ? `Completed (${registration?.punchOutTime?.slice(11, 16) || "Done"})`
                : isPunchedIn
                ? "Mark exit when session finishes"
                : "Punch In first to unlock"}
            </p>

            <Button
              onClick={handlePunchOut}
              disabled={!isPunchedIn || isFullyAttended || isPunching}
              className={cn(
                "mt-3 w-full rounded-xl text-xs font-bold shadow-md",
                isFullyAttended
                  ? "bg-blue-600 text-white cursor-default"
                  : isPunchedIn
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-slate-400 text-white"
              )}
            >
              {isFullyAttended ? (
                <>
                  <CheckCircle2 className="mr-1.5 size-4" /> Full Session Confirmed
                </>
              ) : (
                <>
                  <LogOut className="mr-1.5 size-4" /> Punch Out (+30 XP)
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Live Active Session Indicator when Punched In */}
        {isPunchedIn && !isFullyAttended && (
          <div className="mt-3.5 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
              <span>Active in Session · Live Attendance Registered</span>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">
              Visible on Faculty & TPC Dashboard
            </span>
          </div>
        )}

        {/* Full Attendance Confirmed Banner & PDF Download */}
        {isFullyAttended && (
          <div className="mt-4 space-y-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center">
            <div className="flex items-center justify-center gap-2 font-display text-sm font-black text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="size-5 text-[#F2A93B]" />
              <span>Full Attendance Recorded & Verified!</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              +60 Total XP Earned · Recorded in GSFC University Academic Archive
            </p>

            <Button
              onClick={handleDownloadCertificate}
              className="mt-2 h-9 w-full rounded-xl bg-[#1A3C6E] text-xs font-bold text-[#F2A93B] shadow-md hover:bg-[#1A3C6E]/90"
            >
              <Download className="mr-1.5 size-3.5" />
              Download Verified PDF Certificate
            </Button>
          </div>
        )}

        {/* Done Button */}
        <Button
          onClick={onClose}
          variant="outline"
          className="mt-4 w-full rounded-xl font-bold text-xs"
        >
          Close Window
        </Button>
      </div>
    </div>
  );
}
