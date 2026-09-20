import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { UserProfile, NewRegisteredStudent, InternshipApplication } from "./types";

export interface NocLetterParams {
  student: UserProfile;
  matchingStudent?: NewRegisteredStudent;
  companyName: string;
  internshipRole: string;
  companyLocation?: string;
  duration?: string;
  startDate?: string;
  addressee?: string;
  purpose?: string;
  referenceNo?: string;
}

export async function generateDeanNocPdf(params: NocLetterParams): Promise<void> {
  const {
    student,
    matchingStudent,
    companyName,
    internshipRole,
    companyLocation = "Corporate Office / Industrial Facility",
    duration = "6 Months / Semester Duration",
    startDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    addressee = "The Human Resources / Hiring Team",
    purpose = "Mandatory Academic Industrial Internship",
    referenceNo = `GSFCU/SOT/NOC/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
  } = params;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Background subtle tint
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Top header decorative gradient bar (Deep Blue & Gold)
  doc.setFillColor(26, 60, 110); // #1A3C6E
  doc.rect(0, 0, pageWidth, 6, "F");
  doc.setFillColor(242, 169, 59); // #F2A93B
  doc.rect(0, 6, pageWidth, 2, "F");

  // Bottom footer decorative bar
  doc.setFillColor(26, 60, 110);
  doc.rect(0, pageHeight - 6, pageWidth, 6, "F");
  doc.setFillColor(242, 169, 59);
  doc.rect(0, pageHeight - 8, pageWidth, 2, "F");

  // Watermark Emblem in Center
  doc.setDrawColor(245, 247, 250);
  doc.setFillColor(248, 250, 252);
  doc.circle(pageWidth / 2, pageHeight / 2 - 10, 48, "FD");

  // Header - University Branding
  doc.setTextColor(26, 60, 110);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("GSFC UNIVERSITY", pageWidth / 2, 24, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(242, 169, 59);
  doc.text("SCHOOL OF TECHNOLOGY · TRAINING & PLACEMENT CELL (TPC)", pageWidth / 2, 30, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Vigyan Bhavan, Fertilizernagar, Vadodara, Gujarat 391750 · www.gsfcuniversity.ac.in", pageWidth / 2, 35, {
    align: "center",
  });

  // Dividing line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.line(margin, 38, pageWidth - margin, 38);

  // Reference Number and Date
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text(`Ref. No: ${referenceNo}`, margin, 46);

  const formattedDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(`Date: ${formattedDate}`, pageWidth - margin, 46, { align: "right" });

  // Addressee Block
  let currentY = 56;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 60, 110);
  doc.text("To,", margin, currentY);

  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.text(addressee, margin, currentY);

  currentY += 5;
  doc.setFont("helvetica", "bold");
  doc.text(companyName || "Industrial Partner", margin, currentY);

  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.text(companyLocation, margin, currentY);

  // Subject Line
  currentY += 12;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY - 5, contentWidth, 11, 2, 2, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 60, 110);
  doc.text("SUBJECT: NO OBJECTION CERTIFICATE (NOC) FOR INDUSTRIAL INTERNSHIP", pageWidth / 2, currentY + 2, {
    align: "center",
  });

  // Salutation
  currentY += 15;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text("Respected Sir / Madam,", margin, currentY);

  // Paragraph 1: Student Certification
  currentY += 7;
  const studentName = (student?.name || "GSFC Student").toUpperCase();
  const rollNo = student.rollNo || matchingStudent?.rollNo || "STU-2024-001";
  const department = student.department || matchingStudent?.department || "Computer Science & Engineering";
  const course = student.degree || matchingStudent?.degree || "B.Tech";
  const semester = student.semester || matchingStudent?.semester || 4;
  const cgpa = student.cgpa || 8.8;

  const p1Text =
    `This is to certify that Mr./Ms. ${studentName}, bearing University Enrolment No. ${rollNo}, ` +
    `is a bonafide and regular student of GSFC University, School of Technology, currently enrolled in Semester ${semester} ` +
    `of the ${course} program in ${department} with an active Cumulative Grade Point Average (CGPA) of ${cgpa}/10.0.`;

  const p1Split = doc.splitTextToSize(p1Text, contentWidth);
  doc.text(p1Split, margin, currentY);
  currentY += p1Split.length * 5 + 3;

  // Paragraph 2: No Objection & Authorization
  const p2Text =
    `The Dean's Office, School of Technology, along with the University Training & Placement Cell (TPC), ` +
    `has NO OBJECTION to the aforementioned student undertaking an Industrial Internship / Practical Professional Training ` +
    `at your esteemed organization, ${companyName}, for the position of "${internshipRole}".`;

  const p2Split = doc.splitTextToSize(p2Text, contentWidth);
  doc.text(p2Split, margin, currentY);
  currentY += p2Split.length * 5 + 3;

  // Paragraph 3: Schedule & Academic Compliance
  const p3Text =
    `The proposed internship duration is ${duration}, commencing from ${startDate}. ` +
    `The student is permitted to undertake this industrial engagement under the purpose of "${purpose}". ` +
    `During the tenure, the student is expected to adhere strictly to all corporate guidelines, intellectual property mandates, ` +
    `and safety protocols of ${companyName}, while fulfilling GSFC University's daily GPS attendance punch regulations.`;

  const p3Split = doc.splitTextToSize(p3Text, contentWidth);
  doc.text(p3Split, margin, currentY);
  currentY += p3Split.length * 5 + 3;

  // Paragraph 4: Closing recommendation
  const p4Text =
    `We highly appreciate the opportunity extended by ${companyName} to our engineering student. ` +
    `Should your human resources or technical mentor team require any further academic clarification or performance verification, ` +
    `please feel free to reach out to the undersigned office or the TPC Convener at tpc@gsfcuniversity.ac.in.`;

  const p4Split = doc.splitTextToSize(p4Text, contentWidth);
  doc.text(p4Split, margin, currentY);
  currentY += p4Split.length * 5 + 10;

  // Sign-off text
  doc.text("Wishing the student and your organization a fruitful collaborative tenure.", margin, currentY);
  currentY += 8;

  // Signatures Section (Dean & Verification QR Code)
  const signatureY = Math.max(currentY + 6, 210);

  // Generate Verification QR Code
  const qrData = `GSFC UNIVERSITY OFFICIAL NOC\nRef: ${referenceNo}\nStudent: ${studentName}\nEnrolment: ${rollNo}\nCompany: ${companyName}\nRole: ${internshipRole}\nStatus: Officially Sanctioned by Dean`;
  const qrDataUrl = await QRCode.toDataURL(qrData, {
    width: 120,
    margin: 1,
    color: {
      dark: "#1A3C6E",
      light: "#FFFFFF",
    },
  });

  // QR Box
  doc.addImage(qrDataUrl, "PNG", margin, signatureY, 26, 26);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Scan to verify digital NOC authenticity", margin, signatureY + 30);
  doc.text("GSFC University Academic Verification Node", margin, signatureY + 33.5);

  // University Stamp Seal
  doc.setDrawColor(242, 169, 59);
  doc.setLineWidth(0.8);
  doc.circle(pageWidth / 2 - 2, signatureY + 12, 12);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 60, 110);
  doc.text("GSFC UNIVERSITY", pageWidth / 2 - 2, signatureY + 10, { align: "center" });
  doc.setTextColor(242, 169, 59);
  doc.text("OFFICIAL SEAL", pageWidth / 2 - 2, signatureY + 13, { align: "center" });
  doc.setFontSize(5.5);
  doc.setTextColor(100, 116, 139);
  doc.text("VADODARA", pageWidth / 2 - 2, signatureY + 16, { align: "center" });

  // Dean's Signature Block (Right side)
  const deanBlockX = pageWidth - margin - 55;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(deanBlockX, signatureY + 16, pageWidth - margin, signatureY + 16);

  // Script signature approximation
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(26, 60, 110);
  doc.text("Dr. Ananya Sharma", deanBlockX + 10, signatureY + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 60, 110);
  doc.text("Dr. Ananya Sharma, Ph.D.", deanBlockX, signatureY + 21);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Dean, School of Technology", deanBlockX, signatureY + 25);
  doc.text("Convener, Academic Council", deanBlockX, signatureY + 29);
  doc.text("GSFC University, Vadodara", deanBlockX, signatureY + 33);

  // Save the PDF
  const sanitizedCompany = companyName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
  const fileName = `GSFC_Dean_NOC_${rollNo}_${sanitizedCompany}.pdf`;
  doc.save(fileName);
}
