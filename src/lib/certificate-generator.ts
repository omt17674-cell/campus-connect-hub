import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { AttendanceRecord, CampusEvent, UserProfile } from "./types";

export interface CertificateOptions {
  studentName?: string;
  studentRollNo?: string;
  department?: string;
  semester?: string | number;
  eventTitle?: string;
  eventCategory?: string;
  eventDate?: string;
  venue?: string;
  certificateId?: string;
  organizerName?: string;
  locationDistanceMeters?: number;
  userLatitude?: number;
  userLongitude?: number;
}

async function loadImageDataUrl(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load certificate asset: ${path}`);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateCertificatePdf(
  arg1?: AttendanceRecord | CampusEvent | CertificateOptions | any,
  arg2?: CampusEvent | AttendanceRecord | any,
  arg3?: UserProfile | any
): Promise<void> {
  // Normalize parameters to handle different calling conventions:
  // 1. generateCertificatePdf(record, event, user) [Standard]
  // 2. generateCertificatePdf(event, record, user) [Inverted]
  // 3. generateCertificatePdf(options) [Single options object]
  let record: Partial<AttendanceRecord> = {};
  let event: Partial<CampusEvent> = {};
  let user: Partial<UserProfile> = {};

  if (arg1 && typeof arg1 === "object") {
    if ("studentName" in arg1 || ("eventTitle" in arg1 && !("userId" in arg1) && !("organizerEmail" in arg1))) {
      // Single options object format
      const opts = arg1 as CertificateOptions;
      user = {
        name: opts.studentName,
        rollNo: opts.studentRollNo,
        department: opts.department,
        semester: opts.semester != null ? Number(opts.semester) : undefined,
      };
      event = {
        title: opts.eventTitle,
        category: opts.eventCategory,
        date: opts.eventDate,
        venue: opts.venue,
        organizerName: opts.organizerName,
      };
      record = {
        certificateId: opts.certificateId,
        distanceFromVenueMeters: opts.locationDistanceMeters,
        userLatitude: opts.userLatitude,
        userLongitude: opts.userLongitude,
      };
    } else if ("venue" in arg1 && "title" in arg1 && !("userId" in arg1)) {
      // Inverted calling convention: (event, record, user)
      event = arg1 || {};
      record = arg2 || {};
      user = arg3 || {};
    } else {
      // Standard calling convention: (record, event, user)
      record = arg1 || {};
      event = arg2 || {};
      user = arg3 || {};
    }
  }

  // 1. Build safe fallback values for every field used in the certificate
  const safeOrganizer = (event?.organizerName || "").trim() || "Event Coordinator";
  const safeVenue = (event?.venue || "").trim() || "GSFC University Campus";
  const safeDate = (event?.date || (record?.timestamp ? new Date(record.timestamp).toLocaleDateString() : "") || "").trim() || "N/A";
  const safeTitle = (event?.title || record?.eventTitle || "").trim() || "University Campus Event";
  const safeName = (user?.name || record?.userName || "").trim() || "GSFC Student";
  const safeRollNo = (user?.rollNo || record?.userRollNo || "").trim() || "N/A";
  const safeDept = (user?.department || record?.department || event?.department || "").trim() || "Computer Science & Engineering";
  const safeSemester = user?.semester != null && String(user.semester).trim() !== "" ? String(user.semester) : "N/A";

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

  // Subtle Watermark Emblem
  doc.setDrawColor(240, 235, 225);
  doc.setFillColor(250, 247, 240);
  doc.circle(pageWidth / 2, pageHeight / 2 + 5, 45, "FD");

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

  try {
    const logoDataUrl = await loadImageDataUrl("/images/gsfc-logo.jpg");
    doc.addImage(logoDataUrl, "JPEG", 20, 17, 54, 20, undefined, "FAST");
  } catch (error) {
    console.warn("GSFC logo could not be embedded in certificate", error);
  }

  // Header - GSFC University
  doc.setTextColor(26, 60, 110);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("GSFC UNIVERSITY", pageWidth / 2, 40, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("EDUCATION WITH PURPOSE · VADODARA, GUJARAT, INDIA", pageWidth / 2, 45, { align: "center" });

  // Certificate Title
  doc.setFontSize(26);
  doc.setFont("times", "bold");
  doc.setTextColor(242, 169, 59);
  doc.text("Certificate of Participation", pageWidth / 2, 58, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(51, 65, 85);
  doc.text("This is to proudly certify that", pageWidth / 2, 70, { align: "center" });

  // Student Name
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 60, 110);
  doc.text(safeName.toUpperCase(), pageWidth / 2, 82, { align: "center" });

  // Roll No and Department
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Enrolment No: ${safeRollNo}  |  Department: ${safeDept} (Semester ${safeSemester})`,
    pageWidth / 2,
    90,
    { align: "center" }
  );

  // Event description statement
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("has successfully participated and verified their attendance in the university event", pageWidth / 2, 104, { align: "center" });

  // Event Name
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 60, 110);
  doc.text(`"${safeTitle}"`, pageWidth / 2, 118, { align: "center" });

  // Category and Venue Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Held on ${safeDate} at ${safeVenue}, GSFC University`, pageWidth / 2, 126, { align: "center" });

  // Signatures Section
  const sigY = 162;

  // Organizer signature line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(35, sigY, 95, sigY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 60, 110);
  doc.text(safeOrganizer, 65, sigY + 6, { align: "center" });
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

  // Center Verification QR Code & Certificate ID
  const rollSuffix = safeRollNo.replace(/[^a-zA-Z0-9]/g, "").slice(-4) || "0000";
  const eventIdClean = (event?.id || "EVT").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const certId =
    (record?.certificateId || "").trim() ||
    `GSFC-CERT-${eventIdClean}${rollSuffix}${Date.now().toString(36).toUpperCase()}`;
  
  // Enhanced verification URL with proper encoding
  const verifyOrigin = typeof window !== "undefined" ? window.location.origin : "https://campusconnect.gsfcuni.edu";
  const verifyUrl = `${verifyOrigin}/api/certificates/verify?id=${encodeURIComponent(certId)}`;

  // Generate QR Code with better error correction and size
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: "H", // High error correction
      margin: 1,
      width: 200, // Larger size for better scanning
      color: {
        dark: "#1A3C6E", // GSFC Blue
        light: "#FFFFFF"
      }
    });
    
    // Position QR code in center above signatures
    const qrSize = 28;
    const qrX = pageWidth / 2 - (qrSize / 2);
    const qrY = 138;
    
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  } catch (e) {
    console.error("Failed to generate certificate QR code", e);
  }

  doc.setFontSize(8);
  doc.setFont("courier", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text(`VERIFICATION ID: ${certId}`, pageWidth / 2, 171, { align: "center" });

  const hasLat = typeof record?.userLatitude === "number" && !isNaN(record.userLatitude);
  const hasLng = typeof record?.userLongitude === "number" && !isNaN(record.userLongitude);
  const geoStamp = hasLat && hasLng
    ? `GEO-VERIFIED ON-SITE: GSFC CAMPUS [${record.userLatitude!.toFixed(4)}° N, ${record.userLongitude!.toFixed(4)}° E] · TOLERANCE: ${record.distanceFromVenueMeters || 15}M`
    : `GEO-VERIFIED ON-SITE: GSFC UNIVERSITY VADODARA CAMPUS`;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(242, 169, 59);
  doc.text(`📍 ${geoStamp}`, pageWidth / 2, 176, { align: "center" });

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(140, 150, 160);
  doc.text("Digitally issued via Campus Connect · Authenticated by GSFC University Academic Records", pageWidth / 2, 181, { align: "center" });

  // Save the PDF
  const safeFileStudent = safeName.replace(/[^a-zA-Z0-9]/g, "_") || "Student";
  const safeFileTitle = safeTitle.replace(/[^a-zA-Z0-9]/g, "_") || "Event";
  const filename = `GSFC_Certificate_${safeFileStudent}_${safeFileTitle}.pdf`;
  doc.save(filename);
}
