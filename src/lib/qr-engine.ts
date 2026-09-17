import QRCode from "qrcode";

export interface QrPayload {
  version: "1.0";
  eventId: string;
  eventTitle: string;
  timestamp: number;
  windowId: number;
  token: string;
  signature: string;
}

// Rotates every 45 seconds to prevent screenshot sharing/proxy attendance
export const QR_ROTATION_INTERVAL_SECONDS = 45;

export function generateQrPayload(eventId: string, eventTitle: string): { payload: QrPayload; jsonString: string; secondsRemaining: number } {
  const now = Date.now();
  const windowId = Math.floor(now / (QR_ROTATION_INTERVAL_SECONDS * 1000));
  const secondsRemaining = QR_ROTATION_INTERVAL_SECONDS - Math.floor((now % (QR_ROTATION_INTERVAL_SECONDS * 1000)) / 1000);
  
  // Deterministic token based on eventId + windowId
  const seed = `${eventId}-${windowId}-GSFC-SECRET`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const token = `GSFC-${Math.abs(hash).toString(36).toUpperCase()}-${windowId.toString(36)}`;
  
  const payload: QrPayload = {
    version: "1.0",
    eventId,
    eventTitle,
    timestamp: now,
    windowId,
    token,
    signature: `VERIFIED-GSFC-${Math.abs(hash % 9999).toString().padStart(4, "0")}`,
  };

  return {
    payload,
    jsonString: JSON.stringify(payload),
    secondsRemaining,
  };
}

export function validateQrPayload(payloadString: string, expectedEventId?: string): { valid: boolean; reason?: string; payload?: QrPayload } {
  try {
    const payload = JSON.parse(payloadString) as QrPayload;
    if (!payload.eventId || !payload.token || !payload.windowId) {
      return { valid: false, reason: "Malformed QR code payload format" };
    }

    if (expectedEventId && payload.eventId !== expectedEventId) {
      return { valid: false, reason: `QR is for another event: "${payload.eventTitle}"` };
    }

    // Allow current window or previous window (45s grace period)
    const currentWindow = Math.floor(Date.now() / (QR_ROTATION_INTERVAL_SECONDS * 1000));
    if (Math.abs(currentWindow - payload.windowId) > 1) {
      return { valid: false, reason: "QR code has expired. Please scan the newly rotated code." };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: "Unrecognized QR code format" };
  }
}

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 8,
      color: {
        dark: "#1A3C6E", // GSFC Deep Navy
        light: "#FFFFFF",
      },
    });
  } catch (error) {
    console.error("QR Code generation error, falling back to SVG URI:", error);
    // Fallback simple SVG data URI
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23ffffff"/><rect x="20" y="20" width="160" height="160" fill="%231A3C6E" rx="12"/><text x="100" y="105" fill="%23F2A93B" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">GSFC QR</text></svg>`;
  }
}
