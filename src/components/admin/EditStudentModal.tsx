import { useState } from "react";
import {
  Building2,
  Bus,
  Check,
  CheckCircle2,
  GraduationCap,
  Home,
  Info,
  Lock,
  Phone,
  Save,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewRegisteredStudent } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { campusStore } from "@/lib/campus-store";
import { supabase } from "@/lib/supabase";
import { serializeStudentForDb, logSupabaseError } from "@/lib/supabase-mappers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditStudentModalProps {
  student: NewRegisteredStudent;
  onClose: () => void;
  onSuccess: (updatedStudent: NewRegisteredStudent) => void;
}

const SCHOOLS = [
  "School of Technology (SOT)",
  "School of Science (SOS)",
  "School of Management (SOM)",
  "School of Fire Safety & Environment (SFSE)",
];

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Chemical Engineering",
  "Mechanical Engineering",
  "Biotechnology",
  "Chemistry & Industrial Sciences",
  "Business Administration & Management",
  "Fire Safety Engineering",
];

const AVAILABLE_CLUBS = [
  "GSFC Coding & Robotics Club",
  "AI & Data Science Society",
  "Chemical Engineers Forum",
  "TPC Placement Cell",
  "Cultural & Arts Society",
  "Sports & Athletics Committee",
  "IEEE Student Branch",
];

export function EditStudentModal({ student, onClose, onSuccess }: EditStudentModalProps) {
  const [school, setSchool] = useState(student.school || SCHOOLS[0]);
  const [department, setDepartment] = useState(student.department || DEPARTMENTS[0]);
  const [degree, setDegree] = useState(student.degree || "B.Tech");
  const [semester, setSemester] = useState<number>(student.semester || 1);
  const [residenceType, setResidenceType] = useState<"hostel" | "dayscholar">(student.residenceType || "dayscholar");
  const [hostelBlockOrBusRoute, setHostelBlockOrBusRoute] = useState(student.hostelBlockOrBusRoute || "");
  const [clubsInterested, setClubsInterested] = useState<string[]>(student.clubsInterested || []);
  const [verifiedByUniversity, setVerifiedByUniversity] = useState<boolean>(student.verifiedByUniversity ?? true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggleClub = (clubName: string) => {
    if (clubsInterested.includes(clubName)) {
      setClubsInterested(clubsInterested.filter((c) => c !== clubName));
    } else {
      setClubsInterested([...clubsInterested, clubName]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const updatedStudent: NewRegisteredStudent = {
        ...student,
        school,
        department,
        degree,
        semester: Number(semester),
        residenceType,
        hostelBlockOrBusRoute,
        clubsInterested,
        verifiedByUniversity,
      };

      // 1. Call REST API endpoint
      const res = await apiClient.updateStudentProfile({
        studentId: student.rollNo,
        school,
        department,
        degree,
        semester: Number(semester),
        residenceType,
        hostelBlockOrBusRoute,
        clubsInterested,
        verifiedByUniversity,
      });

      if (!res.success) {
        setErrorMessage(res.message || "Failed to update student profile in Supabase.");
        setIsSubmitting(false);
        return;
      }

      // 2. Direct Supabase Table Upsert for instant Realtime broadcast to other sessions
      const serialized = serializeStudentForDb(updatedStudent);
      const { error: supaErr } = await supabase.from("new_registered_students").upsert(serialized);
      if (supaErr) {
        logSupabaseError("upsert", "new_registered_students", supaErr, { updatedStudent, serialized });
      }

      // 3. Update local store
      campusStore.updateStudentProfile(updatedStudent);
      setSuccessMessage("Student identity record updated in Supabase database!");
      toast.success(`Updated record for ${student.fullName} (${student.rollNo})`);
      setIsSubmitting(false);

      setTimeout(() => {
        onSuccess(updatedStudent);
        onClose();
      }, 700);
    } catch (err: any) {
      logSupabaseError("handleSave", "new_registered_students", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-border/70 pb-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20">
            <GraduationCap className="size-6 text-[#F2A93B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-black text-[#1A3C6E] dark:text-amber-400">
                Edit Student Registry Record
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">
                <Lock className="size-3" /> Policy Protected
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Candidate: <span className="font-bold text-foreground">{student.fullName}</span> (#{student.rollNo})
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-700 dark:text-rose-400">
            <ShieldAlert className="size-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
          {/* Section 1: Immutable Identity Fields (Locked) */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-display font-bold text-amber-900 dark:text-amber-400">
                <Lock className="size-3.5 text-amber-600" /> Immutable Core Identity Fields
              </span>
              <span className="text-[10px] font-semibold text-amber-700/80 dark:text-amber-300">
                Locked post-registration
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Locked Name */}
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  Full Name (Locked)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    disabled
                    value={student.fullName}
                    className="h-9 w-full rounded-xl border border-input bg-muted/60 pl-8 pr-7 text-xs font-bold text-muted-foreground cursor-not-allowed"
                  />
                  <Lock className="absolute right-2.5 top-2.5 size-3 text-amber-600" />
                </div>
              </div>

              {/* Locked Roll No */}
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  Roll Number (Locked)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">#</span>
                  <input
                    type="text"
                    disabled
                    value={student.rollNo}
                    className="h-9 w-full rounded-xl border border-input bg-muted/60 pl-7 pr-7 text-xs font-mono font-bold text-muted-foreground cursor-not-allowed"
                  />
                  <Lock className="absolute right-2.5 top-2.5 size-3 text-amber-600" />
                </div>
              </div>

              {/* Locked Mobile Number */}
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                  Mobile Number (Locked)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    disabled
                    value={student.mobileNumber}
                    className="h-9 w-full rounded-xl border border-input bg-muted/60 pl-8 pr-7 text-xs font-mono font-bold text-muted-foreground cursor-not-allowed"
                  />
                  <Lock className="absolute right-2.5 top-2.5 size-3 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Editable Academic Attributes */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
            <span className="font-display font-bold text-foreground">
              Editable Academic Affiliation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* School */}
              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  School / Faculty
                </label>
                <select
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                >
                  {SCHOOLS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Degree */}
              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Degree Program
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.Tech, BBA, B.Sc"
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Current Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Residence & Commute */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
            <span className="font-display font-bold text-foreground">
              Residence & Transportation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  Residence Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResidenceType("dayscholar")}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-colors",
                      residenceType === "dayscholar"
                        ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-black"
                        : "border-input bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Bus className="size-3.5" /> Day Scholar
                  </button>
                  <button
                    type="button"
                    onClick={() => setResidenceType("hostel")}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-colors",
                      residenceType === "hostel"
                        ? "border-[#1A3C6E] bg-blue-50 text-[#1A3C6E] dark:bg-blue-950 dark:text-blue-300 font-black"
                        : "border-input bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Home className="size-3.5" /> Hostel Resident
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-foreground mb-1">
                  {residenceType === "hostel" ? "Hostel Block / Room" : "Bus Route / Pickup Point"}
                </label>
                <input
                  type="text"
                  value={hostelBlockOrBusRoute}
                  onChange={(e) => setHostelBlockOrBusRoute(e.target.value)}
                  placeholder={
                    residenceType === "hostel"
                      ? "e.g. Sardar Patel Boys Hostel - Block B, Room 204"
                      : "e.g. Route 4 (Vadodara Station to GSFC Campus)"
                  }
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Clubs & Societies */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2">
            <label className="block font-display font-bold text-foreground">
              Interested Clubs & Societies
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CLUBS.map((club) => {
                const selected = clubsInterested.includes(club);
                return (
                  <button
                    key={club}
                    type="button"
                    onClick={() => toggleClub(club)}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors",
                      selected
                        ? "border-[#1A3C6E] bg-[#1A3C6E] text-white"
                        : "border-input bg-background text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {selected && <Check className="size-3" />}
                    <span>{club}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Verification & Governance Standing */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2">
            <label className="flex items-center justify-between font-display font-bold text-foreground cursor-pointer">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>University Bona Fide Verified Status</span>
              </span>
              <input
                type="checkbox"
                checked={verifiedByUniversity}
                onChange={(e) => setVerifiedByUniversity(e.target.checked)}
                className="size-4 rounded border-input text-[#1A3C6E] focus:ring-[#1A3C6E]"
              />
            </label>
            <p className="text-[11px] text-muted-foreground">
              Marks the student candidate as actively verified by GSFC University academic administration and registry authority.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 rounded-xl border-input px-4 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 gap-1.5 rounded-xl bg-[#1A3C6E] px-5 text-xs font-bold text-white hover:bg-[#142e56]"
            >
              <Save className="size-3.5 text-[#F2A93B]" />
              {isSubmitting ? "Saving to Supabase..." : "Save Record"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
