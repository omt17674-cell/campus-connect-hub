import { CampusEvent } from "./types";

/**
 * Generates a Google Calendar add event URL
 */
export function getGoogleCalendarUrl(event: CampusEvent): string {
  const [startTimeStr, endTimeStr] = event.time.split(" - ");
  
  // Format event date (YYYY-MM-DD)
  const dateClean = event.date.replace(/-/g, "");
  
  // Convert 12h time to 24h roughly for query params
  function parseTimeToIso(timeStr?: string): string {
    if (!timeStr) return "100000";
    const isPm = timeStr.toUpperCase().includes("PM");
    const [h, m] = timeStr.replace(/[^\d:]/g, "").split(":");
    let hours = parseInt(h || "10", 10);
    const minutes = m || "00";
    if (isPm && hours < 12) hours += 12;
    if (!isPm && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}${minutes.padStart(2, "0")}00`;
  }

  const startIso = `${dateClean}T${parseTimeToIso(startTimeStr)}`;
  const endIso = `${dateClean}T${parseTimeToIso(endTimeStr || startTimeStr)}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `[GSFC University] ${event.title}`,
    dates: `${startIso}/${endIso}`,
    details: `${event.description}\n\nOrganizer: ${event.organizerName} (${event.organizerEmail})\nCategory: ${event.category}`,
    location: `${event.venue}, GSFC University Campus, Vigyan Bhavan, Vadodara, Gujarat 391750`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and triggers download of an .ics calendar file
 */
export function downloadIcsFile(event: CampusEvent): void {
  const [startTimeStr, endTimeStr] = event.time.split(" - ");
  const dateClean = event.date.replace(/-/g, "");

  function parseTimeToIso(timeStr?: string): string {
    if (!timeStr) return "100000";
    const isPm = timeStr.toUpperCase().includes("PM");
    const [h, m] = timeStr.replace(/[^\d:]/g, "").split(":");
    let hours = parseInt(h || "10", 10);
    const minutes = m || "00";
    if (isPm && hours < 12) hours += 12;
    if (!isPm && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}${minutes.padStart(2, "0")}00`;
  }

  const startIso = `${dateClean}T${parseTimeToIso(startTimeStr)}`;
  const endIso = `${dateClean}T${parseTimeToIso(endTimeStr || startTimeStr)}`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GSFC University//Campus Connect Hub//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:gsfc-event-${event.id}@gsfcuniversity.ac.in`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:[GSFC University] ${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")} - Organizer: ${event.organizerName}`,
    `LOCATION:${event.venue}\\, GSFC University\\, Vadodara`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${event.title} starts in 30 minutes!`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}_GSFC_Calendar.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
