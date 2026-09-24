import { jsPDF } from "jspdf";
import { FacultyMentorAssignment } from "./types";
import { toast } from "sonner";

export function exportMentorAllocationsCSV(
  assignments: FacultyMentorAssignment[],
  filterSummary?: string
): void {
  if (!assignments || assignments.length === 0) {
    toast.error("No mentor allocation records found to export.");
    return;
  }

  const headers = [
    "Faculty Mentor Name",
    "Faculty Email",
    "Faculty Department",
    "Student Name",
    "Student Roll Number",
    "Student Email",
    "Department",
    "Specialization Field",
    "Academic Year",
    "Semester",
    "Allocation Status",
    "Assigned By",
    "Assigned Date",
    "Notes",
  ];

  const rows = assignments.map((a) => [
    `"${(a.facultyName || a.facultyId || "").replace(/"/g, '""')}"`,
    `"${(a.facultyEmail || "").replace(/"/g, '""')}"`,
    `"${(a.facultyDepartment || a.department || "").replace(/"/g, '""')}"`,
    `"${(a.studentName || a.studentId || "").replace(/"/g, '""')}"`,
    `"${(a.studentRollNo || a.studentId || "").replace(/"/g, '""')}"`,
    `"${(a.studentEmail || "").replace(/"/g, '""')}"`,
    `"${(a.department || "").replace(/"/g, '""')}"`,
    `"${(a.field || "General").replace(/"/g, '""')}"`,
    `"${(a.academicYear || "").replace(/"/g, '""')}"`,
    `"Semester ${a.semester || 1}"`,
    `"${(a.status || "active").toUpperCase()}"`,
    `"${(a.assignedBy || "Management Administration").replace(/"/g, '""')}"`,
    `"${a.assignedAt ? new Date(a.assignedAt).toLocaleDateString() : "N/A"}"`,
    `"${(a.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `GSFC_Faculty_Mentor_Allocations_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success(`Exported ${assignments.length} mentor allocations to CSV.`);
}

export function exportMentorAllocationsPDF(
  assignments: FacultyMentorAssignment[],
  filterInfo?: { department?: string; faculty?: string; semester?: string | number; search?: string }
): void {
  if (!assignments || assignments.length === 0) {
    toast.error("No mentor allocation records found to generate PDF.");
    return;
  }

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner - GSFC Blue
  doc.setFillColor(26, 60, 110);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Gold accent band
  doc.setFillColor(242, 169, 59);
  doc.rect(0, 28, pageWidth, 2.5, "F");

  // University Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("GSFC UNIVERSITY — INSTITUTIONAL GOVERNANCE", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(
    "Academic Affairs & System Control Center | Official Faculty Mentor Roster & Allocation Registry",
    margin,
    20
  );

  const generatedDate = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  doc.setFontSize(8.5);
  doc.text(`Generated: ${generatedDate}`, pageWidth - margin - 55, 20);

  // Subheader & Filters Summary Card
  let yPos = 38;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yPos, contentWidth, 16, 2.5, 2.5, "FD");

  doc.setTextColor(26, 60, 110);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(`OFFICIAL MENTOR-STUDENT ALLOCATION REPORT (${assignments.length} RECORDS)`, margin + 4, yPos + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const filterDesc = [
    filterInfo?.department && filterInfo.department !== "all" ? `Dept: ${filterInfo.department}` : null,
    filterInfo?.faculty && filterInfo.faculty !== "all" ? `Faculty: ${filterInfo.faculty}` : null,
    filterInfo?.semester && filterInfo.semester !== "all" ? `Sem: ${filterInfo.semester}` : null,
    filterInfo?.search ? `Search: "${filterInfo.search}"` : null,
  ].filter(Boolean).join(" | ") || "All Departments, Faculties & Cohorts";
  doc.text(`Applied Filters: ${filterDesc}`, margin + 4, yPos + 12);

  // Table Columns Setup
  yPos = 60;
  const colWidths = {
    index: 10,
    faculty: 62,
    student: 62,
    dept: 65,
    term: 40,
    status: 30,
  };

  const drawTableHeader = (y: number) => {
    doc.setFillColor(238, 242, 250);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 8, "FD");

    doc.setTextColor(26, 60, 110);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    let x = margin + 2;
    doc.text("#", x, y + 5.5);
    x += colWidths.index;
    doc.text("FACULTY MENTOR", x, y + 5.5);
    x += colWidths.faculty;
    doc.text("ASSIGNED STUDENT", x, y + 5.5);
    x += colWidths.student;
    doc.text("DEPARTMENT & SPECIALIZATION", x, y + 5.5);
    x += colWidths.dept;
    doc.text("ACADEMIC TERM", x, y + 5.5);
    x += colWidths.term;
    doc.text("STATUS", x, y + 5.5);
  };

  drawTableHeader(yPos);
  yPos += 8;

  const rowHeight = 12;

  assignments.forEach((item, index) => {
    // Check if new page is needed
    if (yPos + rowHeight > pageHeight - 15) {
      doc.addPage("a4", "landscape");

      // Small header on subsequent pages
      doc.setFillColor(26, 60, 110);
      doc.rect(0, 0, pageWidth, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("GSFC UNIVERSITY — Faculty Mentor Allocations (Continued)", margin, 8);

      yPos = 18;
      drawTableHeader(yPos);
      yPos += 8;
    }

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, yPos, contentWidth, rowHeight, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    let x = margin + 2;
    // 1. Index
    doc.setTextColor(148, 163, 184);
    doc.text(String(index + 1), x, yPos + 7);
    x += colWidths.index;

    // 2. Faculty Mentor
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    const facName = (item.facultyName || item.facultyId || "Faculty Mentor").slice(0, 28);
    doc.text(facName, x, yPos + 5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    const facEmail = (item.facultyEmail || `${item.facultyId}@gsfcuniversity.ac.in`).slice(0, 32);
    doc.text(facEmail, x, yPos + 9);
    x += colWidths.faculty;

    // 3. Student
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    const stuName = (item.studentName || item.studentId || "Student Scholar").slice(0, 28);
    doc.text(stuName, x, yPos + 5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 60, 110);
    doc.setFontSize(7.5);
    const stuRoll = item.studentRollNo || item.studentId || "";
    doc.text(`Roll: ${stuRoll}`, x, yPos + 9);
    x += colWidths.student;

    // 4. Department & Field
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    const deptStr = (item.department || "Engineering").slice(0, 34);
    doc.text(deptStr, x, yPos + 5);
    doc.setTextColor(217, 119, 6);
    doc.setFontSize(7);
    const fieldStr = (item.field || "General Focus").slice(0, 34);
    doc.text(fieldStr, x, yPos + 9);
    x += colWidths.dept;

    // 5. Academic Term
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`${item.academicYear || "2025-26"}`, x, yPos + 5);
    doc.text(`Semester ${item.semester || 6}`, x, yPos + 9);
    x += colWidths.term;

    // 6. Status
    const statusStr = (item.status || "active").toUpperCase();
    if (statusStr === "ACTIVE") {
      doc.setTextColor(16, 149, 106);
    } else {
      doc.setTextColor(100, 116, 139);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(statusStr, x, yPos + 7);

    yPos += rowHeight;
  });

  // Footer on final page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${totalPages}  |  GSFC University Management Control Center  |  Confidential Institutional Roster`,
      margin,
      pageHeight - 6
    );
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`GSFC_Faculty_Mentor_Allocations_${timestamp}.pdf`);
  toast.success(`PDF report for ${assignments.length} mentor allocations downloaded successfully.`);
}
