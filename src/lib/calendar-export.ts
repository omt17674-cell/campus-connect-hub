import { CampusEvent } from "./types";

export function generateIcsFile(event: CampusEvent): void {
  // Parse date and time e.g., date="2026-06-12", time="10:00 AM"
  const dateParts = event.date.split("-").map(Number);
  const year = dateParts[0] || 2026;
  const month = dateParts[1] || 6;
  const day = dateParts[2] || 12;

  // Format YYYYMMDDTHHMMSSZ
  const dtStart = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}T100000Z`;
  const dtEnd = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}T130000Z`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GSFC University//Campus Connect//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:gsfc-event-${event.id}@campusconnect.gsfcuni.edu`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title} — GSFC University`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}\\n\\nOrganizer: ${event.organizerName}`,
    `LOCATION:${event.venue}, GSFC University Campus, Vigyan Bhavan, Vadodara`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${event.title} is tomorrow!`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `gsfc-event-${event.id}-${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getGoogleCalendarUrl(event: CampusEvent): string {
  const dateParts = event.date.split("-").map(Number);
  const year = dateParts[0] || 2026;
  const month = dateParts[1] || 6;
  const day = dateParts[2] || 12;

  const dtStart = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}T100000Z`;
  const dtEnd = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}T130000Z`;

  const title = encodeURIComponent(`${event.title} (GSFC University)`);
  const details = encodeURIComponent(`${event.description}\n\nOrganizer: ${event.organizerName}\nLocation: ${event.venue}`);
  const location = encodeURIComponent(`${event.venue}, GSFC University, Vadodara, Gujarat`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dtStart}/${dtEnd}&details=${details}&location=${location}`;
}
