import { useEffect } from "react";
import {
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Send,
  Sparkles,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Internship } from "@/lib/types";

interface InternshipDetailModalProps {
  internship: Internship;
  isOpen: boolean;
  onClose: () => void;
  onApply: (internship: Internship) => void;
  hasApplied?: boolean;
}

export function InternshipDetailModal({
  internship,
  isOpen,
  onClose,
  onApply,
  hasApplied = false,
}: InternshipDetailModalProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="internship-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with GSFC gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1A3C6E] via-[#0E2342] to-[#1A3C6E] p-6 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[#F2A93B]/15 blur-2xl" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#F2A93B]/20 px-3 py-0.5 text-[11px] font-black uppercase text-[#F2A93B]">
                  {internship.mode}
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold text-white/90">
                  {internship.department}
                </span>
              </div>
              <h2 id="internship-detail-title" className="mt-2 text-xl font-black text-white sm:text-2xl">
                {internship.title}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white/80">
                <Building2 className="size-4 text-[#F2A93B]" />
                <span>{internship.companyName}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close internship details"
              className="relative z-20 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/90 transition-all hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stipend</span>
              <p className="mt-1 text-sm font-black text-emerald-600 dark:text-emerald-400">{internship.stipend}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duration</span>
              <p className="mt-1 text-sm font-black text-foreground">{internship.duration}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</span>
              <p className="mt-1 text-xs font-bold text-foreground truncate">{internship.location}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Openings</span>
              <p className="mt-1 text-sm font-black text-foreground">{internship.positions} Positions</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Opportunity Overview</h4>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
              {internship.description}
            </p>
          </div>

          {/* Skills Required */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Required Skills & Tools</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {internship.skillsRequired.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-xl border border-brand/20 bg-brand/5 px-2.5 py-1 text-xs font-bold text-brand"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Eligibility & Dates Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
              <div className="flex items-center gap-2 text-xs font-black text-foreground">
                <GraduationCap className="size-4 text-[#F2A93B]" />
                <span>Eligibility Criteria</span>
              </div>
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                {internship.eligibility}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-4">
              <div className="flex items-center gap-2 text-xs font-black text-foreground">
                <Clock className="size-4 text-brand" />
                <span>Tenure & Working Hours</span>
              </div>
              <div className="mt-2 space-y-1 text-xs font-medium text-muted-foreground">
                <p>• Period: {internship.startDate} to {internship.endDate}</p>
                <p>• Hours: {internship.workingHours}</p>
                <p>• Apply by: <span className="font-bold text-amber-600 dark:text-amber-400">{internship.applicationDeadline}</span></p>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Required Verification Documents</h4>
            <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs text-foreground/90 font-medium">
              {internship.requiredDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
                  <span className="size-1.5 rounded-full bg-[#F2A93B]" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Person */}
          <div className="rounded-2xl border border-border/70 bg-gradient-to-r from-muted/30 to-card p-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Corporate / TPC Point of Contact</h4>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <User className="size-3.5 text-brand" />
                <span>{internship.contactPerson}</span>
              </div>
              <a
                href={`mailto:${internship.contactEmail}`}
                className="flex items-center gap-1.5 font-semibold text-brand hover:underline"
              >
                <Mail className="size-3.5" />
                <span>{internship.contactEmail}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border/70 bg-muted/30 px-6 py-4">
          <Button variant="ghost" onClick={onClose} className="rounded-2xl text-xs font-bold">
            Close
          </Button>

          {hasApplied ? (
            <span className="rounded-xl bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ✓ Application Already Submitted
            </span>
          ) : (
            <Button
              onClick={() => {
                onClose();
                onApply(internship);
              }}
              className="gap-2 rounded-2xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] px-6 text-xs font-black text-white shadow-md hover:opacity-95"
            >
              <Send className="size-3.5 text-[#F2A93B]" />
              Apply Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
