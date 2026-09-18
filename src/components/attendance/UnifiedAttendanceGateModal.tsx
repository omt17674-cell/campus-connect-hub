import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Building2,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Flame,
  GraduationCap,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  Maximize2,
  Navigation,
  Phone,
  QrCode,
  Radio,
  RefreshCw,
  Scan,
  ScanBarcode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Smartphone,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusEvent, VehicleType } from "@/lib/types";
import { campusStore, CampusState } from "@/lib/campus-store";
import { cn } from "@/lib/utils";

interface UnifiedAttendanceGateModalProps {
  state: CampusState;
  initialEvent?: CampusEvent | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UnifiedAttendanceGateModal({
  state,
  initialEvent,
  onClose,
  onSuccess,
}: UnifiedAttendanceGateModalProps) {
  const [userType, setUserType] = useState<"college" | "visitor">("college");

  // Selected Event
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEvent?.id || state.events[0]?.id || ""
  );
  const activeEvent = state.events.find((e) => e.id === selectedEventId) || state.events[0];

  // Step Tracker
  const [step, setStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resultPassData, setResultPassData] = useState<any>(null);

  // --- College Student / User State ---
  const currentStudent = state.newRegisteredStudents?.find(
    (s) => s.rollNo?.toUpperCase() === state.currentUser.rollNo?.toUpperCase()
  );
  const [studentMobile, setStudentMobile] = useState(
    currentStudent?.mobileNumber && currentStudent.mobileNumber !== "N/A"
      ? currentStudent.mobileNumber
      : ""
  );
  const [studentRollNo, setStudentRollNo] = useState(state.currentUser.rollNo || "");
  const [barcodeInput, setBarcodeInput] = useState(state.currentUser.rollNo || "");
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [barcodeVerified, setBarcodeVerified] = useState(false);

  // --- External Visitor State ---
  const [visitorName, setVisitorName] = useState("");
  const [visitorMobile, setVisitorMobile] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorOrg, setVisitorOrg] = useState("");
  const [visitorPurpose, setVisitorPurpose] = useState<
    "Campus Event Attendance" | "Placement & Industry Meeting" | "Guest Lecture / Workshop" | "Official Campus Visit" | "Vendor / Contractor"
  >("Placement & Industry Meeting");
  const [personToMeet, setPersonToMeet] = useState("");
  const [deptToMeet, setDeptToMeet] = useState("");
  const [idProofType, setIdProofType] = useState<"Aadhaar Card" | "Driving License" | "Voter ID / Gov ID" | "Corporate Work ID" | "Passport">("Corporate Work ID");
  const [idProofNumber, setIdProofNumber] = useState("");

  // --- Shared OTP State ---
  const generateRandomOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [expectedOtp, setExpectedOtp] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);

  // --- Shared GPS Location State ---
  const [isLocating, setIsLocating] = useState(false);
  const [geoVerified, setGeoVerified] = useState(false);
  const [distanceMeters, setDistanceMeters] = useState<number>(14);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: 22.3591,
    lng: 73.1671,
  });

  // --- Vehicle State ---
  const [hasVehicle, setHasVehicle] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("2_wheeler");
  const [parkingBay, setParkingBay] = useState("Zone B - Student Stand #88");

  // Timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  // Handle Send OTP
  const handleSendOtp = () => {
    const mobile = userType === "college" ? studentMobile : visitorMobile;
    if (!mobile.trim()) {
      alert("Please enter a valid mobile number first.");
      return;
    }
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(generated);
    setOtpSent(true);
    setOtpTimer(30);
  };

  // Handle Auto Fill Demo OTP
  const handleAutoFillOtp = () => {
    setOtpCode(expectedOtp);
    setOtpVerified(true);
  };

  // Handle Verify OTP
  const handleVerifyOtp = () => {
    if (otpCode.trim() === expectedOtp) {
      setOtpVerified(true);
    } else {
      alert("Invalid OTP code. Please enter the 6-digit code: " + expectedOtp);
    }
  };

  // Handle Barcode Scan Simulation
  const handleSimulateBarcodeScan = () => {
    setIsScanningBarcode(true);
    setTimeout(() => {
      setIsScanningBarcode(false);
      setBarcodeInput(studentRollNo);
      setBarcodeVerified(true);
    }, 1200);
  };

  // Handle GPS Check
  const handleVerifyLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          const dist = Math.floor(10 + Math.random() * 25);
          setDistanceMeters(dist);
          setGeoVerified(true);
          setIsLocating(false);
        },
        () => {
          setUserCoords({ lat: 22.3591, lng: 73.1671 });
          setDistanceMeters(18);
          setGeoVerified(true);
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setUserCoords({ lat: 22.3591, lng: 73.1671 });
      setDistanceMeters(14);
      setGeoVerified(true);
      setIsLocating(false);
    }
  };

  // Final Submit
  const handleCompleteAttendance = () => {
    if (userType === "college") {
      const res = campusStore.markUnifiedStudentAttendance({
        eventId: activeEvent.id,
        mobileNumber: studentMobile,
        studentRollNo,
        barcodeValue: barcodeInput,
        location: {
          latitude: userCoords.lat,
          longitude: userCoords.lng,
          distanceMeters,
          verified: true,
        },
        hasVehicle,
        vehicleNumber: hasVehicle ? vehicleNumber : undefined,
        vehicleType: hasVehicle ? vehicleType : undefined,
        parkingBay: hasVehicle ? parkingBay : undefined,
      });

      setResultPassData({
        type: "college",
        id: studentRollNo,
        name: state.currentUser.name || "Om Thakkar",
        department: state.currentUser.department,
        eventTitle: activeEvent.title,
        timestamp: new Date().toLocaleTimeString(),
        date: activeEvent.date,
        mobile: studentMobile,
        vehicle: hasVehicle ? `${vehicleNumber} (${vehicleType})` : "None",
        parking: hasVehicle ? parkingBay : "N/A",
        gatePassCode: `GSFC-ATT-${studentRollNo}-${Date.now().toString(36).toUpperCase()}`,
      });
      setIsCompleted(true);
    } else {
      // External Visitor
      const res = campusStore.registerVisitorEntry({
        fullName: visitorName,
        mobile: visitorMobile,
        email: visitorEmail,
        organization: visitorOrg,
        purpose: visitorPurpose,
        personToMeet,
        departmentToMeet: deptToMeet,
        idProofType,
        idProofNumber,
        locationVerified: geoVerified,
        userLatitude: userCoords.lat,
        userLongitude: userCoords.lng,
        distanceMeters,
        hasVehicle,
        vehicleNumber: hasVehicle ? vehicleNumber : undefined,
        vehicleType: hasVehicle ? vehicleType : undefined,
        parkingBay: hasVehicle ? parkingBay : undefined,
        assignedEventId: activeEvent.id,
        assignedEventTitle: activeEvent.title,
      });

      setResultPassData({
        type: "visitor",
        id: res.visitor.id,
        name: visitorName,
        organization: visitorOrg,
        purpose: visitorPurpose,
        personToMeet,
        departmentToMeet: deptToMeet,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toISOString().split("T")[0],
        mobile: visitorMobile,
        vehicle: hasVehicle ? `${vehicleNumber} (${vehicleType})` : "None",
        parking: hasVehicle ? parkingBay : "N/A",
        gatePassCode: res.visitor.qrPassCode,
      });
      setIsCompleted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-border/80 bg-card shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#1A3C6E] via-[#0E2342] to-[#1A3C6E] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#F2A93B]/20 text-[#F2A93B] border border-[#F2A93B]/40">
              <ScanBarcode className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#F2A93B]">
                  GSFC University · Gate & Attendance Terminal
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                  Live Sync
                </span>
              </div>
              <h2 className="font-display text-lg font-black text-white sm:text-xl">
                Unified Attendance & Visitor Check-In System
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* User Type Switcher (College Enrolled vs External Visitor) */}
        {!isCompleted && (
          <div className="border-b border-border/70 bg-card/70 px-6 py-3">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => {
                  setUserType("college");
                  setStep(1);
                }}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-black transition-all",
                  userType === "college"
                    ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/25"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <GraduationCap className="size-4" />
                <span>College User (Student / Staff)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserType("visitor");
                  setStep(1);
                }}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-black transition-all",
                  userType === "visitor"
                    ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/25"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 className="size-4" />
                <span>External Visitor / Guest</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Workflow Diagram Banner (Mirroring User Specifications) */}
          {!isCompleted && (
            <div className="rounded-2xl border border-brand/20 bg-brand/5 p-3 text-xs">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-brand mb-2">
                <span>Multi-Factor Verification Architecture</span>
                <span className="text-muted-foreground">ISO-Certified Campus Security</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-bold">
                <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg", otpVerified ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-card/70 text-muted-foreground")}>
                  <Phone className="size-3" />
                  <span>1. Mobile OTP</span>
                  {otpVerified && <Check className="size-3 text-emerald-600" />}
                </div>
                <ArrowRight className="size-3 text-muted-foreground hidden sm:inline" />
                <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg", (userType === "college" ? barcodeVerified : Boolean(visitorName)) ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-card/70 text-muted-foreground")}>
                  {userType === "college" ? <ScanBarcode className="size-3" /> : <UserCheck className="size-3" />}
                  <span>{userType === "college" ? "2. ID Barcode" : "2. Visitor Form"}</span>
                  {(userType === "college" ? barcodeVerified : Boolean(visitorName)) && <Check className="size-3 text-emerald-600" />}
                </div>
                <ArrowRight className="size-3 text-muted-foreground hidden sm:inline" />
                <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg", geoVerified ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-card/70 text-muted-foreground")}>
                  <MapPin className="size-3" />
                  <span>3. Location (GPS)</span>
                  {geoVerified && <Check className="size-3 text-emerald-600" />}
                </div>
                <ArrowRight className="size-3 text-muted-foreground hidden sm:inline" />
                <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg", hasVehicle && Boolean(vehicleNumber) ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-card/70 text-muted-foreground")}>
                  <Car className="size-3" />
                  <span>4. Vehicle (Optional)</span>
                </div>
              </div>
            </div>
          )}

          {!isCompleted ? (
            <div className="space-y-6">
              {/* Event Context Selection */}
              <div className="rounded-2xl border border-border/70 bg-card/50 p-4">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Select Associated Campus Event / Department
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="h-9 w-full sm:w-80 rounded-xl border border-border/80 bg-background px-3 text-xs font-bold text-foreground focus:border-[#1A3C6E] focus:outline-none"
                  >
                    {state.events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title} ({evt.category})
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <MapPin className="size-3 text-[#F2A93B]" /> {activeEvent.venue}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-brand" /> {activeEvent.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 1: MOBILE OTP VERIFICATION */}
              <div className="rounded-2xl border border-border/70 bg-card/60 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#1A3C6E] text-white text-[11px] font-black">
                      1
                    </span>
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Mobile Number & SMS OTP Verification
                    </h3>
                  </div>
                  {otpVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" /> OTP Verified
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                      {userType === "college" ? "Registered Student Mobile" : "Visitor Mobile Number"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={userType === "college" ? studentMobile : visitorMobile}
                        onChange={(e) =>
                          userType === "college"
                            ? setStudentMobile(e.target.value)
                            : setVisitorMobile(e.target.value)
                        }
                        placeholder="+91 98765 XXXXX"
                        disabled={otpVerified}
                        className="h-9 flex-1 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold focus:border-[#1A3C6E] focus:outline-none"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSendOtp}
                        disabled={otpVerified}
                        className="rounded-xl bg-[#1A3C6E] text-white text-xs font-bold hover:bg-[#1A3C6E]/90"
                      >
                        {otpSent ? (otpTimer > 0 ? `Resend (${otpTimer}s)` : "Resend") : "Send OTP"}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="e.g. 849521"
                        disabled={otpVerified || !otpSent}
                        className="h-9 flex-1 rounded-xl border border-border/80 bg-background px-3 font-mono text-xs font-bold tracking-widest text-center focus:border-[#1A3C6E] focus:outline-none"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleVerifyOtp}
                        disabled={otpVerified || !otpSent}
                        className="rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                      >
                        Verify
                      </Button>
                    </div>
                  </div>
                </div>

                {otpSent && !otpVerified && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-700 dark:text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="size-3.5" /> SMS Sent! Demo Code: <strong>{expectedOtp}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoFillOtp}
                      className="rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-black text-slate-950 hover:bg-amber-400"
                    >
                      ⚡ 1-Click Auto-Fill Demo OTP
                    </button>
                  </div>
                )}
              </div>

              {/* STEP 2: IDENTITY VERIFICATION (COLLEGE ID BARCODE vs VISITOR REGISTRATION) */}
              {userType === "college" ? (
                /* College Student ID Barcode Flow */
                <div className="rounded-2xl border border-border/70 bg-card/60 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-[#1A3C6E] text-white text-[11px] font-black">
                        2
                      </span>
                      <h3 className="font-display text-sm font-bold text-foreground">
                        College ID Card Barcode / QR Scan
                      </h3>
                    </div>
                    {barcodeVerified && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3.5" /> ID Card Verified
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    {/* Barcode Graphic Preview with Laser Animation */}
                    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-background/80 p-4 text-center overflow-hidden">
                      {isScanningBarcode && (
                        <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-bounce" />
                      )}

                      {/* SVG Barcode Graphic */}
                      <div className="flex items-end gap-1 h-12 my-1">
                        {[4, 2, 6, 2, 4, 3, 5, 2, 6, 4, 3, 5, 2, 6, 3, 5, 2, 4, 6].map((h, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-1 rounded-sm bg-foreground transition-all",
                              i % 2 === 0 ? "w-1.5" : "w-1"
                            )}
                            style={{ height: `${h * 7}px` }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-xs font-black tracking-widest text-muted-foreground mt-1">
                        * {studentRollNo} *
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        GSFC University Encrypted Student Card
                      </p>
                    </div>

                    {/* Live Camera Scanner Viewfinder */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                          Student Roll Number / Card Identifier
                        </label>
                        <input
                          type="text"
                          value={studentRollNo}
                          onChange={(e) => {
                            setStudentRollNo(e.target.value);
                            setBarcodeInput(e.target.value);
                          }}
                          placeholder="e.g. 24BT01001"
                          className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 font-mono text-xs font-bold text-foreground focus:border-[#1A3C6E] focus:outline-none"
                        />
                      </div>

                      {/* Camera Scanner Viewfinder Box */}
                      {isScanningBarcode && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-dashed border-[#1A3C6E] bg-slate-950 p-2 flex flex-col items-center justify-center animate-in fade-in">
                          <div className="absolute inset-x-4 top-1/2 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse" />
                          <ScanBarcode className="size-10 text-[#F2A93B] animate-bounce" />
                          <span className="text-[11px] font-bold text-white mt-2">
                            Align Physical GSFC ID Barcode in Frame...
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400 mt-0.5">
                            Laser Decoder Active · Reading 24BT01001
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleSimulateBarcodeScan}
                          disabled={isScanningBarcode}
                          className="flex-1 rounded-xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] text-xs font-bold text-[#F2A93B]"
                        >
                          <ScanBarcode className="mr-1.5 size-3.5" />
                          {isScanningBarcode ? "Decoding Barcode..." : "Live Camera Barcode Scan"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setBarcodeInput(studentRollNo);
                            setBarcodeVerified(true);
                          }}
                          className="rounded-xl text-xs font-bold border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                        >
                          ✓ Confirm ID
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* External Visitor Registration Form */
                <div className="rounded-2xl border border-border/70 bg-card/60 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-[#1A3C6E] text-white text-[11px] font-black">
                        2
                      </span>
                      <h3 className="font-display text-sm font-bold text-foreground">
                        Visitor Identity & Host Registration
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-brand bg-brand/10 px-2.5 py-0.5 rounded-full">
                      External Pass Request
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Full Name of Visitor
                      </label>
                      <input
                        type="text"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="e.g. Kaniya Agrawal"
                        className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold focus:border-[#1A3C6E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Organization / Company / Institute
                      </label>
                      <input
                        type="text"
                        value={visitorOrg}
                        onChange={(e) => setVisitorOrg(e.target.value)}
                        placeholder="e.g. Larsen & Toubro (L&T) Infotech"
                        className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold focus:border-[#1A3C6E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Purpose of Campus Visit
                      </label>
                      <select
                        value={visitorPurpose}
                        onChange={(e: any) => setVisitorPurpose(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 text-xs font-bold focus:border-[#1A3C6E] focus:outline-none"
                      >
                        <option value="Placement & Industry Meeting">Placement & Industry Meeting / Drive</option>
                        <option value="Campus Event Attendance">Campus Event Attendance</option>
                        <option value="Guest Lecture / Workshop">Guest Lecture / Workshop</option>
                        <option value="Official Campus Visit">Official Campus Visit</option>
                        <option value="Vendor / Contractor">Vendor / Contractor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Person / Officer to Meet
                      </label>
                      <input
                        type="text"
                        value={personToMeet}
                        onChange={(e) => setPersonToMeet(e.target.value)}
                        placeholder="e.g. Prof. Rajiv Mehta (TPC Head)"
                        className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold focus:border-[#1A3C6E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        ID Proof Type
                      </label>
                      <select
                        value={idProofType}
                        onChange={(e: any) => setIdProofType(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 text-xs font-bold focus:border-[#1A3C6E] focus:outline-none"
                      >
                        <option value="Corporate Work ID">Corporate Work ID / Employee Card</option>
                        <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Voter ID / Gov ID">Voter ID / Government ID</option>
                        <option value="Passport">Passport</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        ID Proof Document Number
                      </label>
                      <input
                        type="text"
                        value={idProofNumber}
                        onChange={(e) => setIdProofNumber(e.target.value)}
                        placeholder="e.g. LTI-EMP-98214 or XXXX-4891"
                        className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 font-mono text-xs font-semibold focus:border-[#1A3C6E] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: LIVE GPS LOCATION GEOFENCING */}
              <div className="rounded-2xl border border-border/70 bg-card/60 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#1A3C6E] text-white text-[11px] font-black">
                      3
                    </span>
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Live Campus Location & Geofence Verification
                    </h3>
                  </div>
                  {geoVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" /> Inside GSFC Campus ({distanceMeters}m)
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-background/60 p-3.5 border border-border/70">
                  <div className="flex items-center gap-3">
                    <div className="relative flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      <Navigation className="size-5" />
                      <span className="absolute -top-1 -right-1 size-2 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        GSFC University Campus Geofence Boundary
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Campus Center: 22.3590° N, 73.1670° E · Allowed Radius: 350m
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleVerifyLocation}
                    disabled={isLocating}
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-[#1A3C6E] text-xs font-bold text-white shadow-md"
                  >
                    <Compass className="mr-1.5 size-3.5 text-[#F2A93B]" />
                    {isLocating ? "Validating GPS..." : geoVerified ? "Re-Check Location (Passed)" : "Verify Live Location"}
                  </Button>
                </div>
              </div>

              {/* STEP 4: OPTIONAL VEHICLE REGISTRATION */}
              <div className="rounded-2xl border border-border/70 bg-card/60 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#1A3C6E] text-white text-[11px] font-black">
                      4
                    </span>
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Vehicle Gate Registration (Optional)
                    </h3>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVehicle}
                      onChange={(e) => setHasVehicle(e.target.checked)}
                      className="size-4 rounded accent-[#1A3C6E]"
                    />
                    <span>Bringing Vehicle</span>
                  </label>
                </div>

                {hasVehicle && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Vehicle Plate Number
                      </label>
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                        placeholder="e.g. GJ-06-AB-1234"
                        className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 font-mono text-xs font-bold tracking-wider text-foreground focus:border-[#1A3C6E] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Vehicle Type
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e: any) => setVehicleType(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 text-xs font-bold focus:border-[#1A3C6E] focus:outline-none"
                      >
                        <option value="2_wheeler">2-Wheeler (Motorcycle / Scooter)</option>
                        <option value="4_wheeler">4-Wheeler (Car / SUV)</option>
                        <option value="ev">Electric Vehicle (EV Charging Access)</option>
                        <option value="commercial">Commercial / Cab</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Assigned Parking Bay
                      </label>
                      <input
                        type="text"
                        value={parkingBay}
                        onChange={(e) => setParkingBay(e.target.value)}
                        placeholder="e.g. Zone A VIP Bay #04"
                        className="h-9 w-full rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold focus:border-[#1A3C6E] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* FINAL CONFIRMATION BUTTON */}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleCompleteAttendance}
                  className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-[#1A3C6E] to-[#0E2342] font-display text-sm font-black text-white shadow-xl hover:opacity-95"
                >
                  <CheckCircle2 className="mr-2 size-5 text-[#F2A93B]" />
                  {userType === "college"
                    ? "Confirm Attendance & Record Gate Entry"
                    : "Issue Official Visitor Pass & Vehicle Gate Entry"}
                </Button>
              </div>
            </div>
          ) : (
            /* SUCCESS PASS SCREEN */
            <div className="space-y-6 text-center py-4">
              <div className="flex size-16 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-600 mx-auto border-2 border-emerald-500/30 shadow-lg">
                <Check className="size-8 stroke-[3]" />
              </div>

              <div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                  {resultPassData?.type === "college" ? "Attendance Marked ✓" : "Visitor Gate Pass Issued ✓"}
                </span>
                <h3 className="mt-2 font-display text-2xl font-black text-foreground">
                  {resultPassData?.type === "college"
                    ? "Attendance Successfully Recorded!"
                    : `Welcome to GSFC University, ${resultPassData?.name}!`}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Verified with Multi-Factor OTP · Identity Barcode · GPS Geofencing · Vehicle Security
                </p>
              </div>

              {/* Pass Card */}
              <div className="mx-auto max-w-md rounded-3xl border-2 border-[#1A3C6E]/30 bg-card p-5 text-left shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#F2A93B]">
                      GSFC University Gate Pass
                    </span>
                    <h4 className="font-display text-base font-black text-foreground">
                      {resultPassData?.name}
                    </h4>
                    <p className="font-mono text-xs text-brand font-bold">
                      {resultPassData?.id} {resultPassData?.organization && `· ${resultPassData?.organization}`}
                    </p>
                  </div>
                  <div className="size-12 rounded-xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] flex items-center justify-center text-[#F2A93B] font-black text-sm">
                    GC
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Entry Time</span>
                    <p className="font-bold text-foreground">{resultPassData?.timestamp}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Event / Host</span>
                    <p className="font-bold text-foreground truncate">
                      {resultPassData?.eventTitle || resultPassData?.personToMeet}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Registered Vehicle</span>
                    <p className="font-bold font-mono text-foreground">{resultPassData?.vehicle}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Parking Location</span>
                    <p className="font-bold text-foreground">{resultPassData?.parking}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/60 p-2.5 text-center font-mono text-[11px] font-bold text-muted-foreground border border-border/70">
                  Pass Hash: {resultPassData?.gatePassCode}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => {
                    onClose();
                    if (onSuccess) onSuccess();
                  }}
                  className="rounded-xl bg-[#1A3C6E] text-white text-xs font-bold hover:bg-[#1A3C6E]/90 px-6"
                >
                  Close & View Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
