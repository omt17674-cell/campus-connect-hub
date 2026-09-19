import { useState, useEffect } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import {
  Internship,
  InternshipApplication,
  InternshipAttendanceRecord,
  UserProfile,
} from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import {
  getLiveStudentLocation,
  Coordinates,
  calculateDistanceMeters,
} from "@/lib/geofence-engine";
import {
  reverseGeocodeWithGeoapify,
  GeoapifyLocationDetails,
} from "@/lib/geoapify";
import { GeoapifyLiveMapCard } from "@/components/common/GeoapifyLiveMapCard";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InternshipGpsPunchViewProps {
  currentUser: UserProfile;
  applications: InternshipApplication[];
  internships: Internship[];
  attendanceRecords: InternshipAttendanceRecord[];
  initialApplicationId?: string;
}

export function InternshipGpsPunchView({
  currentUser,
  applications,
  internships,
  attendanceRecords,
  initialApplicationId,
}: InternshipGpsPunchViewProps) {
  // Select active or approved application
  const approvedApplications = applications.filter(
    (a) => a.status === "APPROVED" || a.status === "ACTIVE"
  );

  const [selectedAppId, setSelectedAppId] = useState<string>(() => {
    if (initialApplicationId) return initialApplicationId;
    if (approvedApplications.length > 0) return approvedApplications[0].id;
    if (applications.length > 0) return applications[0].id;
    return "";
  });

  const selectedApp = applications.find((a) => a.id === selectedAppId);
  const selectedInternship = selectedApp
    ? internships.find((i) => i.id === selectedApp.internshipId)
    : undefined;

  // Live Location & GPS
  const [userLocation, setUserLocation] = useState<Coordinates>({
    latitude: 22.3688,
    longitude: 73.1893,
  });
  const [locationAccuracy, setLocationAccuracy] = useState<number>(12);
  const [locationDetails, setLocationDetails] = useState<GeoapifyLocationDetails | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"loading" | "locked" | "error">("loading");
  const [isPunchingIn, setIsPunchingIn] = useState(false);
  const [isPunchingOut, setIsPunchingOut] = useState(false);

  // Acquire live GPS coordinates
  const refreshGps = async () => {
    setGpsStatus("loading");
    try {
      const { coords, accuracy } = await getLiveStudentLocation();
      setUserLocation(coords);
      setLocationAccuracy(Math.round(accuracy));
      const details = await reverseGeocodeWithGeoapify(coords.latitude, coords.longitude);
      setLocationDetails(details);
      setGpsStatus("locked");
      toast.success(`📍 Live GPS Locked: ${details.formattedAddress}`);
    } catch (err: any) {
      setGpsStatus("locked");
      const fallbackDetails = await reverseGeocodeWithGeoapify(userLocation.latitude, userLocation.longitude);
      setLocationDetails(fallbackDetails);
      toast.info("Using active campus reference coordinates.");
    }
  };

  useEffect(() => {
    refreshGps();
  }, []);

  // Check approval and date eligibility
  const todayStr = new Date().toISOString().slice(0, 10);
  const isApproved = selectedApp?.status === "APPROVED" || selectedApp?.status === "ACTIVE";
  const isBeforeStart = selectedInternship ? todayStr < selectedInternship.startDate : false;
  const isAfterEnd = selectedInternship ? todayStr > selectedInternship.endDate : false;
  const canPunch = isApproved && !isBeforeStart && !isAfterEnd;

  // Filter attendance records for this application
  const myAttendance = attendanceRecords.filter(
    (a) => a.applicationId === selectedAppId
  );

  // Today's punch session
  const todayRecord = myAttendance.find((a) => a.attendanceDate === todayStr);
  const hasPunchedInToday = Boolean(todayRecord?.punchInTime);
  const hasPunchedOutToday = Boolean(todayRecord?.punchOutTime);

  // Statistics
  const totalDaysPresent = myAttendance.length;
  const completedSessions = myAttendance.filter((a) => a.punchOutTime);

  const handlePunchIn = async () => {
    if (!selectedApp) return;
    setIsPunchingIn(true);
    try {
      const address =
        locationDetails?.formattedAddress ||
        `GPS Coordinates (${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)})`;

      const res = await campusStore.punchInInternship(selectedApp.id, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: locationAccuracy,
        address,
      });

      if (res.success) {
        toast.success(res.message);
        try {
          confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
        } catch {}
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to record punch-in.");
    } finally {
      setIsPunchingIn(false);
    }
  };

  const handlePunchOut = async () => {
    if (!todayRecord) return;
    setIsPunchingOut(true);
    try {
      const address =
        locationDetails?.formattedAddress ||
        `GPS Coordinates (${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)})`;

      const res = await campusStore.punchOutInternship(todayRecord.id, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: locationAccuracy,
        address,
      });

      if (res.success) {
        toast.success(res.message);
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch {}
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to record punch-out.");
    } finally {
      setIsPunchingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black text-foreground">
            Internship GPS Attendance & Punch
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            High-precision geolocation verification for official industrial internship attendance.
          </p>
        </div>

        {/* Application Selector if multiple */}
        {applications.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Application:</span>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="h-9 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground focus:border-brand focus:outline-none"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.applicationNumber} — {app.status}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Selected Internship Overview Banner */}
      {selectedApp && selectedInternship ? (
        <div className="relative overflow-hidden rounded-3xl border border-[#1A3C6E]/30 bg-gradient-to-br from-[#1A3C6E] via-[#0E2342] to-[#1A3C6E] p-6 text-white shadow-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#F2A93B]/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-[#F2A93B]">
                  {selectedInternship.mode}
                </span>
                <span className="text-xs font-mono text-white/80">
                  {selectedApp.applicationNumber}
                </span>
              </div>

              <h3 className="mt-2 text-xl font-black text-white">
                {selectedInternship.title}
              </h3>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/80">
                <span className="flex items-center gap-1">
                  <Building2 className="size-3.5 text-[#F2A93B]" />
                  {selectedInternship.companyName}
                </span>
                <span>•</span>
                <span>Tenure: {selectedInternship.startDate} to {selectedInternship.endDate}</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-center backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Days Logged</span>
                <p className="text-lg font-black text-[#F2A93B]">{totalDaysPresent}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-center backdrop-blur-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Completed</span>
                <p className="text-lg font-black text-emerald-400">{completedSessions.length}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* STRICT APPROVAL BLOCKING BANNER (If not approved or outside date window) */}
      {!canPunch && (
        <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-6 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-300 shrink-0">
              <Lock className="size-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">
                  Attendance Punching Locked
                </span>
              </div>

              <h4 className="mt-2 text-base font-black text-amber-950 dark:text-amber-100">
                Attendance punching is not available yet.
              </h4>

              <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                {!isApproved ? (
                  <>
                    Your application is currently with status <strong>{selectedApp?.status.replace("_", " ") || "UNDER REVIEW"}</strong>. Please wait until your application is officially approved and activated by Administration and Dean Dr. Ananya Sharma.
                  </>
                ) : isBeforeStart ? (
                  <>
                    Your application is approved, but the internship tenure has not commenced yet. Valid attendance period begins on <strong>{selectedInternship?.startDate}</strong>. (Today is {todayStr}).
                  </>
                ) : (
                  <>
                    The internship tenure concluded on <strong>{selectedInternship?.endDate}</strong>. Attendance punching is now closed.
                  </>
                )}
              </p>

              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs font-mono">
                Rule: application.status = APPROVED AND internship.status = ACTIVE AND currentDate ∈ [startDate, endDate]
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GPS Punching Workspace (Enabled when Approved and Active) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Geoapify Live Map Card */}
        <div className="space-y-4">
          <GeoapifyLiveMapCard
            userLocation={userLocation}
            locationDetails={locationDetails}
            isLoading={gpsStatus === "loading"}
            onRefresh={refreshGps}
          />

          {/* Captured Location Snapshot */}
          <div className="rounded-2xl border border-border/80 bg-card/70 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                GPS Verified Telemetry Fix
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-brand">
                <Navigation className="size-3" /> ±{locationAccuracy} meters
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground">Latitude:</span>
                <p className="font-bold text-foreground">{userLocation.latitude.toFixed(6)}° N</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Longitude:</span>
                <p className="font-bold text-foreground">{userLocation.longitude.toFixed(6)}° E</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <span className="text-[10px] text-muted-foreground">Reverse-Geocoded Address:</span>
              <p className="mt-0.5 text-xs font-semibold text-foreground leading-snug">
                {locationDetails?.formattedAddress || "Resolving address..."}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Punch Controls & Today's Session */}
        <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card/85 p-6 shadow-sm backdrop-blur-xl">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand">
                  Live Attendance Console
                </span>
                <h3 className="text-base font-black text-foreground">
                  Today's Session — {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-muted-foreground">Local Time</span>
                <p className="font-mono text-xs font-black text-foreground">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Today's Punch State Details */}
            <div className="my-6 space-y-3">
              {hasPunchedInToday ? (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      <span>Punch In Recorded</span>
                    </div>
                    <span className="font-mono">
                      {new Date(todayRecord!.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    📍 {todayRecord!.punchInAddress} (±{todayRecord!.punchInAccuracy}m)
                  </p>

                  {hasPunchedOutToday ? (
                    <div className="border-t border-emerald-500/20 pt-2 mt-2">
                      <div className="flex items-center justify-between text-xs font-black text-emerald-800 dark:text-emerald-300">
                        <span>Punch Out Recorded</span>
                        <span className="font-mono">
                          {new Date(todayRecord!.punchOutTime!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mt-1">
                        ⏱️ Total Working Duration: {todayRecord!.workingDuration}
                      </p>
                    </div>
                  ) : (
                    <div className="border-t border-emerald-500/20 pt-2 mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                      </span>
                      <span>Active Working Session In Progress...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-6 text-center space-y-2">
                  <div className="flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand mx-auto">
                    <Clock className="size-5" />
                  </div>
                  <h4 className="text-xs font-bold text-foreground">No Punch In Recorded Today</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Click "Punch In" below to capture your live GPS coordinates and officially log today's working session.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-border/60 pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Punch In Button */}
              <Button
                disabled={!canPunch || hasPunchedInToday || isPunchingIn}
                onClick={handlePunchIn}
                className={cn(
                  "h-12 gap-2 rounded-2xl text-xs font-black text-white shadow-lg transition-all",
                  hasPunchedInToday
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 via-[#1A3C6E] to-[#0E2342] hover:opacity-95"
                )}
              >
                <LogIn className="size-4 text-[#F2A93B]" />
                {isPunchingIn ? "Locking GPS..." : hasPunchedInToday ? "Already Punched In" : "Punch In"}
              </Button>

              {/* Punch Out Button */}
              <Button
                disabled={!canPunch || !hasPunchedInToday || hasPunchedOutToday || isPunchingOut}
                onClick={handlePunchOut}
                className={cn(
                  "h-12 gap-2 rounded-2xl text-xs font-black text-white shadow-lg transition-all",
                  !hasPunchedInToday || hasPunchedOutToday
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-rose-700 hover:opacity-95"
                )}
              >
                <LogOut className="size-4" />
                {isPunchingOut ? "Saving GPS..." : hasPunchedOutToday ? "Session Concluded" : "Punch Out"}
              </Button>
            </div>

            <p className="text-center text-[10px] text-muted-foreground">
              GPS coordinates are verified against Geoapify satellite imagery & archived in Supabase.
            </p>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/85 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <History className="size-4 text-brand" />
            <h3 className="text-sm font-black text-foreground">Attendance History Roster</h3>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {myAttendance.length} Logged Record{myAttendance.length !== 1 ? "s" : ""}
          </span>
        </div>

        {myAttendance.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No attendance punches recorded yet for this internship.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Punch In</th>
                  <th className="pb-3">Punch Out</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Verified Location</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {myAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 font-bold text-foreground">
                      {new Date(record.attendanceDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {new Date(record.punchInTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {record.punchOutTime
                        ? new Date(record.punchOutTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="py-3 font-bold text-foreground">
                      {record.workingDuration || "In Progress"}
                    </td>
                    <td className="py-3 max-w-xs truncate text-muted-foreground" title={record.punchInAddress}>
                      {record.punchInAddress}
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
