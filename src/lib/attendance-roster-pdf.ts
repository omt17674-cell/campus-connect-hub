import { jsPDF } from "jspdf";
import { CampusEvent, Registration, AttendanceRecord } from "./types";

export function generateEventAttendanceRosterPdf(
  event: CampusEvent,
  registrations: Registration[] = [],
  attendanceRecords: AttendanceRecord[] = []
): void {
  // Safe fallbacks for all event fields
  const safeTitle = (event?.title || "").trim() || "Campus Event";
  const safeCategory = (event?.category || "").trim() || "General";
  const safeDepartment = (event?.department || "").trim() || "All Departments";
  const safeStatus = ((event?.status || "").trim() || "COMPLETED").toUpperCase();
  const safeDate = (event?.date || "").trim() || "N/A";
  const safeTime = (event?.time || "").trim() || "N/A";
  const safeVenue = (event?.venue || "").trim() || "GSFC University Campus";
  const safeOrganizer = (event?.organizerName || "").trim() || "Event Coordinator";
  const safeOrganizerEmail = (event?.organizerEmail || "").trim() || "faculty@gsfcuni.edu";

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Top University Banner
  doc.setFillColor(26, 60, 110);
  doc.rect(0, 0, pageWidth, 28, "F");

  // GSFC Crest Gold Circle
  doc.setFillColor(242, 169, 59);
  doc.circle(20, 14, 8, "F");
  doc.setFillColor(26, 60, 110);
  doc.circle(20, 14, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("GC", 20, 16.5, { align: "center" });

  // University Header text
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("GSFC UNIVERSITY — VADODARA", 32, 12);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(242, 169, 59);
  doc.text("OFFICIAL INSTITUTIONAL ATTENDANCE & PARTICIPATION ROSTER", 32, 18);

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated on ${new Date().toLocaleString()} | Academic Year 2025-2026`, 32, 23);

  // Event Details Box
  let y = 35;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 3, 3, "FD");

  doc.setTextColor(26, 60, 110);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(safeTitle, margin + 4, y + 7);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Category: ${safeCategory}  |  Department: ${safeDepartment}  |  Status: ${safeStatus}`, margin + 4, y + 13);
  doc.text(`Date & Time: ${safeDate} (${safeTime})  |  Venue: ${safeVenue}`, margin + 4, y + 19);
  doc.text(`Faculty Coordinator: ${safeOrganizer} (${safeOrganizerEmail})`, margin + 4, y + 25);

  // Stats Summary
  const safeRegistrations = Array.isArray(registrations) ? registrations : [];
  const safeAttendance = Array.isArray(attendanceRecords) ? attendanceRecords : [];
  const totalRegistered = safeRegistrations.length;
  const punchedInCount = safeRegistrations.filter(
    (r) => r && (r.status === "punched_in" || r.status === "attended" || Boolean(r.punchInTime))
  ).length;
  const completedCount = safeRegistrations.filter(
    (r) => r && (r.status === "attended" || Boolean(r.punchOutTime))
  ).length;
  const turnoutRate = totalRegistered > 0 ? Math.round((punchedInCount / totalRegistered) * 100) : 0;

  y += 37;
  const statBoxWidth = (pageWidth - margin * 2 - 9) / 4;

  const drawStatBox = (x: number, label: string, val: string, color: [number, number, number]) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, statBoxWidth, 14, 2, 2, "FD");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x + statBoxWidth / 2, y + 4.5, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(val, x + statBoxWidth / 2, y + 11, { align: "center" });
  };

  drawStatBox(margin, "Registered", String(totalRegistered), [26, 60, 110]);
  drawStatBox(margin + statBoxWidth + 3, "Punched In", String(punchedInCount), [16, 185, 129]);
  drawStatBox(margin + (statBoxWidth + 3) * 2, "Completed", String(completedCount), [37, 99, 235]);
  drawStatBox(margin + (statBoxWidth + 3) * 3, "Turnout Rate", `${turnoutRate}%`, [242, 169, 59]);

  // Attendee Table Header
  y += 20;
  doc.setFillColor(26, 60, 110);
  doc.rect(margin, y, pageWidth - margin * 2, 7, "F");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("SR", margin + 2, y + 5);
  doc.text("ROLL NUMBER", margin + 12, y + 5);
  doc.text("STUDENT NAME", margin + 48, y + 5);
  doc.text("DEPARTMENT", margin + 100, y + 5);
  doc.text("PUNCH IN", margin + 138, y + 5);
  doc.text("PUNCH OUT", margin + 158, y + 5);
  doc.text("STATUS", margin + 176, y + 5);

  y += 7;

  // Table Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  safeRegistrations.forEach((reg, index) => {
    if (y > pageHeight - 35) {
      doc.addPage();
      y = 20;

      // Repeat table header on new page
      doc.setFillColor(26, 60, 110);
      doc.rect(margin, y, pageWidth - margin * 2, 7, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("SR", margin + 2, y + 5);
      doc.text("ROLL NUMBER", margin + 12, y + 5);
      doc.text("STUDENT NAME", margin + 48, y + 5);
      doc.text("DEPARTMENT", margin + 100, y + 5);
      doc.text("PUNCH IN", margin + 138, y + 5);
      doc.text("PUNCH OUT", margin + 158, y + 5);
      doc.text("STATUS", margin + 176, y + 5);
      y += 7;
    }

    const att = safeAttendance.find((a) => a && a.userId === reg?.userId);
    const isEven = index % 2 === 0;

    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 6.5, "F");
    }

    const safeRoll = (reg?.userRollNo || "N/A").trim() || "N/A";
    const safeUserName = (reg?.userName || "Student").trim() || "Student";
    const safeUserDept = (reg?.department || "N/A").trim() || "N/A";

    doc.setTextColor(71, 85, 105);
    doc.text(String(index + 1), margin + 2, y + 4.5);
    doc.text(safeRoll, margin + 12, y + 4.5);

    doc.setTextColor(26, 60, 110);
    doc.setFont("helvetica", "bold");
    doc.text(safeUserName.slice(0, 24), margin + 48, y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(safeUserDept.slice(0, 18), margin + 100, y + 4.5);

    const punchInStr = reg?.punchInTime
      ? reg.punchInTime.slice(11, 16)
      : att?.timestamp
      ? att.timestamp.slice(11, 16)
      : "—";
    doc.text(punchInStr || "—", margin + 138, y + 4.5);

    const punchOutStr = reg?.punchOutTime ? reg.punchOutTime.slice(11, 16) : "—";
    doc.text(punchOutStr || "—", margin + 158, y + 4.5);

    const isAttended = reg?.status === "attended" || Boolean(reg?.punchOutTime);
    if (isAttended) {
      doc.setTextColor(16, 185, 129);
      doc.text("Verified", margin + 176, y + 4.5);
    } else if (reg?.status === "punched_in" || Boolean(reg?.punchInTime)) {
      doc.setTextColor(217, 119, 6);
      doc.text("In Session", margin + 176, y + 4.5);
    } else {
      doc.setTextColor(148, 163, 184);
      doc.text("Registered", margin + 176, y + 4.5);
    }

    y += 6.5;
  });

  // Footer Authentication
  const sigY = pageHeight - 22;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(margin, sigY, margin + 50, sigY);
  doc.line(pageWidth - margin - 50, sigY, pageWidth - margin, sigY);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 60, 110);
  doc.text(safeOrganizer, margin + 25, sigY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Faculty Event Coordinator", margin + 25, sigY + 8, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 60, 110);
  doc.text("Dr. Ananya Sharma", pageWidth - margin - 25, sigY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Dean, Student Affairs & Records", pageWidth - margin - 25, sigY + 8, { align: "center" });

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Authenticated via Campus Connect Hub · GSFC University Vadodara", pageWidth / 2, pageHeight - 4, { align: "center" });

  // Save the PDF
  const safeFileTitle = safeTitle.replace(/[^a-zA-Z0-9]/g, "_") || "Event";
  const filename = `GSFC_Attendance_Roster_${safeFileTitle}.pdf`;
  doc.save(filename);
}
