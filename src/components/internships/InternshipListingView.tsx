import { useState } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  MapPin,
  Search,
  Send,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Internship, UserProfile } from "@/lib/types";
import { InternshipDetailModal } from "./InternshipDetailModal";
import { cn } from "@/lib/utils";

interface InternshipListingViewProps {
  internships: Internship[];
  appliedInternshipIds: Set<string>;
  currentUser: UserProfile;
  onApply: (internship: Internship) => void;
}

export function InternshipListingView({
  internships,
  appliedInternshipIds,
  currentUser,
  onApply,
}: InternshipListingViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [selectedModalInternship, setSelectedModalInternship] = useState<Internship | null>(null);

  const departments = Array.from(
    new Set(internships.map((i) => i.department).filter(Boolean))
  );

  const filteredInternships = internships.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skillsRequired.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMode = modeFilter === "all" || item.mode === modeFilter;
    const matchesDept = deptFilter === "all" || item.department === deptFilter;

    return matchesSearch && matchesMode && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-[#1A3C6E]/30 bg-gradient-to-br from-[#1A3C6E] via-[#0E2342] to-[#1A3C6E] p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-[#F2A93B]/15 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#F2A93B]/20 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-[#F2A93B]">
              GSFC University TPC Portal
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/80">
              Verified Industrial Tie-ups
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Official Corporate & Research Internships
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed">
            Discover vetted industrial internship positions across GSFC Ltd., TCS, L&T, and Vadodara municipal initiatives. Apply directly with your digital campus profile, undergo administrative & Dean approval, and log verified GPS attendance.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-white/90">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-[#F2A93B]" />
              <span>Multi-Role Dean Approved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Direct Profile Auto-Fill</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-[#F2A93B]" />
              <span>Tamper-Proof GPS Attendance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by role, company, skills (Python, IoT), or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-border/80 bg-background/80 pl-10 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Filter */}
          <div className="flex items-center rounded-xl border border-border/70 bg-muted/40 p-1">
            {["all", "On-site", "Hybrid", "Remote"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setModeFilter(mode)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-bold transition-colors",
                  modeFilter === mode
                    ? "bg-[#1A3C6E] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mode === "all" ? "All Modes" : mode}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          {departments.length > 0 && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 rounded-xl border border-border/80 bg-background/80 px-3 text-xs font-semibold text-foreground focus:border-brand focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Opportunities Grid */}
      {filteredInternships.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Briefcase className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-foreground">No matching internships found</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Try adjusting your search keywords or switching filters to see all available university postings.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setModeFilter("all");
              setDeptFilter("all");
            }}
            className="mt-4 rounded-xl text-xs font-bold"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredInternships.map((item) => {
            const hasApplied = appliedInternshipIds.has(item.id);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-[#1A3C6E]/40 hover:shadow-lg dark:hover:border-[#F2A93B]/30"
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
                            item.mode === "On-site"
                              ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                              : item.mode === "Hybrid"
                              ? "bg-purple-500/15 text-purple-700 dark:text-purple-300"
                              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          )}
                        >
                          {item.mode}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          ID: {item.id}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-black text-foreground group-hover:text-brand transition-colors">
                        {item.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <Building2 className="size-3.5 text-[#F2A93B]" />
                        <span>{item.companyName}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-right">
                      <span className="text-[9px] font-bold uppercase text-muted-foreground">Stipend</span>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {item.stipend}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Skills tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.skillsRequired.slice(0, 4).map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-foreground/80"
                      >
                        {skill}
                      </span>
                    ))}
                    {item.skillsRequired.length > 4 && (
                      <span className="rounded-lg bg-muted/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        +{item.skillsRequired.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="mt-5 border-t border-border/60 pt-4">
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-medium mb-4">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="size-3 text-brand shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-brand shrink-0" />
                      <span>{item.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="size-3 text-[#F2A93B] shrink-0" />
                      <span>{item.positions} Opening{item.positions > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3 text-amber-500 shrink-0" />
                      <span>Deadline: {item.applicationDeadline}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedModalInternship(item)}
                      className="flex-1 rounded-xl text-xs font-bold border-border/80 hover:bg-muted"
                    >
                      View Details
                    </Button>

                    {hasApplied ? (
                      <span className="flex-1 text-center rounded-xl bg-emerald-500/10 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ Applied
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onApply(item)}
                        className="flex-1 gap-1.5 rounded-xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] text-xs font-black text-white shadow-md hover:opacity-95"
                      >
                        <Send className="size-3 text-[#F2A93B]" />
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedModalInternship && (
        <InternshipDetailModal
          internship={selectedModalInternship}
          isOpen={Boolean(selectedModalInternship)}
          onClose={() => setSelectedModalInternship(null)}
          onApply={onApply}
          hasApplied={appliedInternshipIds.has(selectedModalInternship.id)}
        />
      )}
    </div>
  );
}
