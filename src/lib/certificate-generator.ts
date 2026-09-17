import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { AttendanceRecord, CampusEvent, UserProfile } from "./types";

export async function generateCertificatePdf(
  record: AttendanceRecord,
  event: CampusEvent,
  user: UserProfile
): Promise<void> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // Background
  doc.setFillColor(253, 252, 248); // warm cream
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Outer Border in GSFC Deep Blue (#1A3C6E)
  doc.setDrawColor(26, 60, 110);
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner Border in GSFC Gold (#F2A93B)
  doc.setDrawColor(242, 169, 59);
  doc.setLineWidth(1);
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

  // Corner Accents (Gold flourish squares)
  const drawCorner = (x: number, y: number) => {
    doc.setFillColor(242, 169, 59);
    doc.rect(x, y, 6, 6, "F");
  };
  drawCorner(14, 14);
  drawCorner(pageWidth - 20, 14);
  drawCorner(14, pageHeight - 20);
  drawCorner(pageWidth - 20, pageHeight - 20);

  // Header - GSFC University
  doc.setTextColor(26, 60, 110);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("GSFC UNIVERSITY", pageWidth / 2, 32, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("EDUCATION WITH PURPOSE · VADODARA, GUJARAT, INDIA", pageWidth / 2, 38, { align: "center" });

  // Certificate Title
  doc.setFontSize(28);
  doc.setFont("times", "bold");
  doc.setTextColor(242, 169, 59);
  doc.text("Certificate of Participation", pageWidth / 2, 54, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(51, 65, 85);
  doc.text("This is to proudly certify that", pageWidth / 2, 68, { align: "center" });

  // Student Name
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 60, 110);
  doc.text(user.name.toUpperCase(), pageWidth / 2, 82, { align: "center" });

  // Roll No and Department
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Enrolment No: ${user.rollNo}  |  Department: ${user.department} (Semester ${user.semester})`, pageWidth / 2, 90, { align: "center" });

  // Event description statement
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("has successfully participated and verified their attendance in the university event", pageWidth / 2, 104, { align: "center" });

  // Event Name
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 60, 110);
  doc.text(`"${event.title}"`, pageWidth / 2, 118, { align: "center" });

  // Category and Venue Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Held on ${event.date} at ${event.venue}, GSFC University`, pageWidth / 2, 126, { align: "center" });

  // Signatures Section
  const sigY = 162;

  // Organizer signature line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(35, sigY, 95, sigY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 60, 110);
  doc.text(event.organizerName, 65, sigY + 6, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Event Coordinator", 65, sigY + 11, { align: "center" });

  // Dean / Registrar line
  doc.line(pageWidth - 95, sigY, pageWidth - 35, sigY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 60, 110);
  doc.text("Dr. Ananya Sharma", pageWidth - 65, sigY + 6, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Dean, Student Affairs & Academic Records", pageWidth - 65, sigY + 11, { align: "center" });

  // Center Verification QR & Certificate ID
  const certId = record.certificateId || `GSFC-CERT-${event.id}-${user.rollNo.slice(-4)}-${Date.now().toString(36).toUpperCase()}`;
  const verifyUrl = `https://campusconnect.gsfcuni.edu/verify?certId=${certId}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, scale: 4 });
    doc.addImage(qrDataUrl, "PNG", pageWidth / 2 - 13, 142, 26, 26);
  } catch (e) {
    console.error("Failed to generate cert QR code", e);
  }

  doc.setFontSize(8);
  doc.setFont("courier", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text(`VERIFICATION ID: ${certId}`, pageWidth / 2, 173, { align: "center" });

  const geoStamp = record.userLatitude
    ? `GEO-VERIFIED ON-SITE: GSFC CAMPUS [${record.userLatitude.toFixed(4)}° N, ${record.userLongitude?.toFixed(4)}° E] · TOLERANCE: ${record.distanceFromVenueMeters || 15}M`
    : `GEO-VERIFIED ON-SITE: GSFC UNIVERSITY VADODARA CAMPUS`;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(242, 169, 59);
  doc.text(`📍 ${geoStamp}`, pageWidth / 2, 178, { align: "center" });

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(140, 150, 160);
  doc.text("Digitally issued via Campus Connect · Authenticated by GSFC University Academic Records", pageWidth / 2, 183, { align: "center" });

  // Save the PDF
  const filename = `GSFC_Certificate_${user.name.replace(/\s+/g, "_")}_${event.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
}
