import { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Users,
  GraduationCap,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import {
  AcademicYearMaster,
  DepartmentMaster,
  FieldMaster,
  NewRegisteredStudent,
  UserProfile,
} from "@/lib/types";
import { toast } from "sonner";

interface MentorAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  students: NewRegisteredStudent[];
  facultyList: Array<{ id: string; name: string; department?: string; email?: string }>;
}

export function MentorAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  students,
  facultyList,
}: MentorAssignmentModalProps) {
  const [assignmentMode, setAssignmentMode] = useState<"single" | "bulk">("single");

  // Master Data
  const [academicYears, setAcademicYears] = useState<AcademicYearMaster[]>([]);
  const [departments, setDepartments] = useState<DepartmentMaster[]>([]);
  const [fields, setFields] = useState<FieldMaster[]>([]);

  // Form State
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBulkStudents, setSelectedBulkStudents] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("2025-2026");
  const [selectedSemester, setSelectedSemester] = useState(6);
  const [selectedDept, setSelectedDept] = useState("Computer Science & Engineering");
  const [selectedField, setSelectedField] = useState("Artificial Intelligence & Data Science");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    apiClient.getMasterData().then((res) => {
      if (res?.success && res.data) {
        setAcademicYears(res.data.academicYears || []);
        setDepartments(res.data.departments || []);
        setFields(res.data.fields || []);
        if (res.data.academicYears?.length > 0) {
          setSelectedYear(res.data.academicYears[0].yearName);
        }
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSingleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFaculty || !selectedStudent) {
      toast.error("Please select both a faculty mentor and a student.");
      return;
    }

    setSubmitting(true);
    const res = await apiClient.assignFacultyMentor({
      facultyId: selectedFaculty,
      studentId: selectedStudent,
      academicYear: selectedYear,
      semester: selectedSemester,
      department: selectedDept,
      field: selectedField,
      assignedBy: "Management Administration",
      notes,
    });
    setSubmitting(false);

    if (res?.success) {
      toast.success("Faculty mentor assigned successfully!");
      onSuccess();
      onClose();
    } else {
      toast.error(res?.message || "Failed to assign faculty mentor.");
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedFaculty || selectedBulkStudents.length === 0) {
      toast.error("Please select a faculty mentor and at least one student.");
      return;
    }

    setSubmitting(true);
    const payload = selectedBulkStudents.map((stuId) => ({
      facultyId: selectedFaculty,
      studentId: stuId,
      academicYear: selectedYear,
      semester: selectedSemester,
      department: selectedDept,
      field: selectedField,
      assignedBy: "Management Administration",
    }));

    const res = await apiClient.bulkAssignFacultyMentors(payload);
    setSubmitting(false);

    if (res?.success) {
      toast.success(`Successfully assigned ${res.count} students to the faculty mentor!`);
      onSuccess();
      onClose();
    } else {
      toast.error(res?.message || "Failed to complete bulk assignment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-border/80 bg-card p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#1A3C6E] text-[#F2A93B] shadow-md font-bold">
              <UserPlus className="size-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-black text-foreground">
                Faculty → Student Mentorship Assignment
              </h3>
              <p className="text-xs text-muted-foreground">
                Assign institutional faculty mentors with academic year, semester, and field tracking
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Mode Selector */}
        <div className="mt-4 flex items-center gap-2 border-b border-border/40 pb-3 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAssignmentMode("single")}
            className={cn(
              "rounded-xl text-xs font-bold h-8",
              assignmentMode === "single" ? "border-brand bg-brand/10 text-brand font-black" : ""
            )}
          >
            Single Student Assignment
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAssignmentMode("bulk")}
            className={cn(
              "rounded-xl text-xs font-bold h-8",
              assignmentMode === "bulk" ? "border-brand bg-brand/10 text-brand font-black" : ""
            )}
          >
            Bulk Cohort Allocation
          </Button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          {/* Faculty Mentor Select */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground">Faculty Mentor</label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
              required
            >
              <option value="">-- Choose Faculty Mentor --</option>
              {facultyList.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.department || "Faculty"}) · {fac.email}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Criteria Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground">Academic Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.yearName}>
                    {ay.yearName} {ay.isCurrent ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
                className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground">Specialization Field</label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Single Student Selection */}
          {assignmentMode === "single" ? (
            <div>
              <label className="text-[11px] font-bold text-muted-foreground">Select Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="mt-1 w-full h-9 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold"
                required
              >
                <option value="">-- Choose Student --</option>
                {students.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.fullName} ({stu.rollNo}) · {stu.department}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Bulk Selection */
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-muted-foreground">
                  Select Students ({selectedBulkStudents.length} selected)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedBulkStudents.length === students.length) {
                      setSelectedBulkStudents([]);
                    } else {
                      setSelectedBulkStudents(students.map((s) => s.id));
                    }
                  }}
                  className="text-[11px] font-bold text-brand hover:underline"
                >
                  {selectedBulkStudents.length === students.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-2xl border border-border/70 p-2 space-y-1 bg-background/50">
                {students.map((stu) => {
                  const isChecked = selectedBulkStudents.includes(stu.id);
                  return (
                    <label
                      key={stu.id}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl p-2 cursor-pointer transition-colors text-xs",
                        isChecked ? "bg-brand/10 text-brand font-bold" : "hover:bg-muted/40 text-foreground"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBulkStudents([...selectedBulkStudents, stu.id]);
                          } else {
                            setSelectedBulkStudents(selectedBulkStudents.filter((id) => id !== stu.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span>{stu.fullName}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">({stu.rollNo})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-muted-foreground">Allocation Notes (Optional)</label>
            <Textarea
              placeholder="e.g. Assigned under GSFC Semester 6 Mentorship Directive"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 text-xs rounded-xl min-h-[60px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
            Cancel
          </Button>
          {assignmentMode === "single" ? (
            <Button
              size="sm"
              onClick={handleSingleAssign}
              disabled={submitting}
              className="rounded-xl bg-[#1A3C6E] text-white text-xs font-bold px-4"
            >
              {submitting ? "Assigning..." : "Confirm Mentor Assignment"}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleBulkAssign}
              disabled={submitting}
              className="rounded-xl bg-[#1A3C6E] text-white text-xs font-bold px-4"
            >
              {submitting ? "Bulk Assigning..." : `Assign ${selectedBulkStudents.length} Students`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
