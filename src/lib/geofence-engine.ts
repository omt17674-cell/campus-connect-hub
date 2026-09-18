export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeofenceResult {
  isWithinGeofence: boolean;
  distanceMeters: number;
  accuracyMeters?: number;
  venueName: string;
  allowedRadiusMeters: number;
}

// GSFC University Vadodara Campus Benchmark Coordinates
export const GSFC_CAMPUS_CENTER: Coordinates = { latitude: 22.3685, longitude: 73.1895 };
export const DEFAULT_ALLOWED_RADIUS_METERS = 350;

export const GSFC_CAMPUS_VENUES: Record<string, Coordinates> = {
  "Innovation Lab, Block C": { latitude: 22.3689, longitude: 73.1892 },
  "Main Amphitheatre & Central Lawns": { latitude: 22.3681, longitude: 73.1901 },
  "University Sports Arena, Ground A": { latitude: 22.3672, longitude: 73.1884 },
  "Vigyan Bhavan, Seminar Hall A": { latitude: 22.3694, longitude: 73.1898 },
  "Sardar Patel Auditorium, Block B": { latitude: 22.3683, longitude: 73.1890 },
  "Computer Center, Lab 4": { latitude: 22.3691, longitude: 73.1896 },
  "Default GSFC Campus": { latitude: 22.3685, longitude: 73.1895 },
};

/**
 * Retrieves the coordinates for a given GSFC venue name or defaults to campus center
 */
export function getVenueCoordinates(venueName?: string): Coordinates {
  if (!venueName) return GSFC_CAMPUS_CENTER;
  if (GSFC_CAMPUS_VENUES[venueName]) {
    return GSFC_CAMPUS_VENUES[venueName];
  }
  // Try partial case-insensitive match
  const matchedKey = Object.keys(GSFC_CAMPUS_VENUES).find((key) =>
    key.toLowerCase().includes(venueName.toLowerCase()) || venueName.toLowerCase().includes(key.toLowerCase())
  );
  if (matchedKey) {
    return GSFC_CAMPUS_VENUES[matchedKey];
  }
  return GSFC_CAMPUS_CENTER;
}

/**
 * Calculates Great-Circle distance between two coordinates using Haversine formula (in meters)
 */
export function calculateDistanceMeters(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (point1.latitude * Math.PI) / 180;
  const phi2 = (point2.latitude * Math.PI) / 180;
  const deltaPhi = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const deltaLambda = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Gets the student's live device location using browser / mobile GPS
 */
export async function getLiveStudentLocation(): Promise<{ coords: Coordinates; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        // Provide friendly fallback explanation
        let message = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission denied. Please allow GPS location to verify event presence.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "GPS signal unavailable. Please ensure location services are enabled.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Validates whether the student is within the event's allowed venue radius
 */
export function verifyEventGeofence(
  userCoords: Coordinates,
  venueCoords: Coordinates,
  allowedRadiusMeters = 350
): GeofenceResult {
  const distance = calculateDistanceMeters(userCoords, venueCoords);
  return {
    isWithinGeofence: distance <= allowedRadiusMeters,
    distanceMeters: distance,
    venueName: "GSFC Campus Venue",
    allowedRadiusMeters,
  };
}
