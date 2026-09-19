import {
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InternshipAttendanceRecord } from "@/lib/types";
import { GeoapifyLiveMapCard } from "@/components/common/GeoapifyLiveMapCard";

interface InternshipAttendanceMapModalProps {
  record: InternshipAttendanceRecord;
  studentName?: string;
  enrollmentNumber?: string;
  internshipTitle?: string;
  companyName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InternshipAttendanceMapModal({
  record,
  studentName = "Student",
  enrollmentNumber = "",
  internshipTitle = "Internship",
  companyName = "Company",
  isOpen,
  onClose,
}: InternshipAttendanceMapModalProps) {
  if (!isOpen) return null;

  const userLocation = {
    latitude: record.punchInLatitude,
    longitude: record.punchInLongitude,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-2xl bg-[#1A3C6E] text-[#F2A93B]">
              <MapPin className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">
                GPS Verified Attendance Location
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Audit Inspection · {studentName} ({enrollmentNumber})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Map & Telemetry Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Map Display */}
          <GeoapifyLiveMapCard
            userLocation={userLocation}
            locationDetails={{
              formattedAddress: record.punchInAddress,
              latitude: record.punchInLatitude,
              longitude: record.punchInLongitude,
            }}
          />

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Punch In Time</span>
              <p className="mt-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {new Date(record.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Punch Out Time</span>
              <p className="mt-1 font-mono font-bold text-amber-600 dark:text-amber-400">
                {record.punchOutTime
                  ? new Date(record.punchOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "Session Active"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Working Duration</span>
              <p className="mt-1 font-bold text-foreground">{record.workingDuration || "In Progress"}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Latitude</span>
              <p className="mt-1 font-mono font-bold text-foreground">{record.punchInLatitude.toFixed(6)}° N</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Longitude</span>
              <p className="mt-1 font-mono font-bold text-foreground">{record.punchInLongitude.toFixed(6)}° E</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">GPS Accuracy</span>
              <p className="mt-1 font-mono font-bold text-brand">±{record.punchInAccuracy} meters</p>
            </div>
          </div>

          {/* Captured Address */}
          <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Reverse-Geocoded Physical Address
            </span>
            <p className="text-xs font-semibold text-foreground leading-relaxed">
              {record.punchInAddress}
            </p>
          </div>

          {/* Internship reference */}
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-xs">
            <div>
              <p className="font-bold text-foreground">{internshipTitle}</p>
              <p className="text-[11px] text-muted-foreground">{companyName}</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-black text-emerald-600 uppercase">
              {record.status}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/70 bg-muted/30 px-6 py-4">
          <a
            href={`https://www.google.com/maps?q=${record.punchInLatitude},${record.punchInLongitude}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
          >
            <ExternalLink className="size-3.5" />
            <span>Open in External Google Maps</span>
          </a>

          <Button onClick={onClose} className="rounded-xl text-xs font-bold bg-[#1A3C6E] text-white">
            Close Audit View
          </Button>
        </div>
      </div>
    </div>
  );
}
