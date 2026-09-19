/**
 * Geoapify Live Geocoding & Mapping Service
 * Integrates Geoapify Carto Tiles and Reverse Geocoding API for high-precision live GPS punch-in.
 */

export const GEOAPIFY_API_KEY = "a63135517bf04adb928e3f56e2907589";

export const GEOAPIFY_TILE_URL = `https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`;

export interface GeoapifyLocationDetails {
  formattedAddress: string;
  addressLine1?: string;
  addressLine2?: string;
  name?: string;
  street?: string;
  city?: string;
  district?: string;
  state?: string;
  postcode?: string;
  country?: string;
  latitude: number;
  longitude: number;
  confidence?: number;
}

/**
 * Reverse geocode latitude and longitude into an exact readable address using Geoapify API.
 */
export async function reverseGeocodeWithGeoapify(
  latitude: number,
  longitude: number
): Promise<GeoapifyLocationDetails> {
  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geoapify geocode error: HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      const prop = data.features[0].properties;
      return {
        formattedAddress: prop.formatted || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        addressLine1: prop.address_line1,
        addressLine2: prop.address_line2,
        name: prop.name,
        street: prop.street,
        city: prop.city || prop.county,
        district: prop.state_district,
        state: prop.state,
        postcode: prop.postcode,
        country: prop.country,
        latitude,
        longitude,
        confidence: prop.rank?.confidence,
      };
    }
  } catch (error) {
    console.warn("[Geoapify] Reverse geocode fallback:", error);
  }

  // Fallback if network fails
  return {
    formattedAddress: `GSFC University Campus (${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E)`,
    latitude,
    longitude,
  };
}

/**
 * Generate a static map image URL centered on the student with custom markers using Geoapify
 */
export function getGeoapifyStaticMapUrl({
  latitude,
  longitude,
  venueLat,
  venueLon,
  zoom = 16,
  width = 600,
  height = 240,
}: {
  latitude: number;
  longitude: number;
  venueLat?: number;
  venueLon?: number;
  zoom?: number;
  width?: number;
  height?: number;
}): string {
  // Student pin: Dark blue '#1A3C6E', labeled 'P' (Punch)
  let markersParam = `marker=lonlat:${longitude},${latitude};color:%231a3c6e;size:medium;text:P`;

  // If venue coordinates provided, add venue pin: Emerald green '#10B981', labeled 'V' (Venue)
  if (venueLat !== undefined && venueLon !== undefined) {
    markersParam += `|lonlat:${venueLon},${venueLat};color:%2310b981;size:medium;text:V`;
  }

  return `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=${width}&height=${height}&center=lonlat:${longitude},${latitude}&zoom=${zoom}&${markersParam}&apiKey=${GEOAPIFY_API_KEY}`;
}

export interface GeoapifySearchResult {
  formatted: string;
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

/**
 * Forward geocode / search address text using Geoapify Search API.
 * e.g. "GSFC University, Vadodara" or "38 Upper Montagu Street, Westminster"
 */
export async function searchAddressWithGeoapify(
  query: string,
  limit = 5
): Promise<GeoapifySearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
    query.trim()
  )}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geoapify search error: HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.features && Array.isArray(data.features)) {
      return data.features.map((f: any) => ({
        formatted: f.properties.formatted || "",
        name: f.properties.name,
        street: f.properties.street,
        city: f.properties.city || f.properties.county,
        state: f.properties.state,
        postcode: f.properties.postcode,
        country: f.properties.country,
        latitude: f.properties.lat,
        longitude: f.properties.lon,
      }));
    }
  } catch (err) {
    console.warn("[Geoapify] Search address error:", err);
  }

  return [];
}
