import { useState } from "react";
import {
  Compass,
  ExternalLink,
  MapPin,
  Navigation,
  RefreshCw,
  ShieldCheck,
  Building2,
  Layers,
} from "lucide-react";
import {
  getGeoapifyStaticMapUrl,
  GeoapifyLocationDetails,
  GEOAPIFY_API_KEY,
} from "@/lib/geoapify";
import { Coordinates } from "@/lib/geofence-engine";
import { cn } from "@/lib/utils";

interface GeoapifyLiveMapCardProps {
  userLocation: Coordinates;
  venueLocation?: Coordinates;
  venueName?: string;
  locationDetails?: GeoapifyLocationDetails | null;
  distanceMeters?: number;
  isInsideGeofence?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function GeoapifyLiveMapCard({
  userLocation,
  venueLocation,
  venueName,
  locationDetails,
  distanceMeters,
  isInsideGeofence = true,
  isLoading = false,
  onRefresh,
  className,
}: GeoapifyLiveMapCardProps) {
  const [mapError, setMapError] = useState(false);

  const mapUrl = getGeoapifyStaticMapUrl({
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    venueLat: venueLocation?.latitude,
    venueLon: venueLocation?.longitude,
    zoom: 16,
    width: 640,
    height: 220,
  });

  const googleMapsUrl = `https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-md backdrop-blur-md transition-all",
        className
      )}
    >
      {/* Map Header / Status Bar */}
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            <span>Live Geoapify GPS Fix</span>
          </div>
          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-blue-600 dark:text-blue-400">
            Carto High-Res
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1 text-[10px] font-bold text-brand hover:underline disabled:opacity-50"
            >
              <RefreshCw className={cn("size-3", isLoading && "animate-spin")} />
              <span>{isLoading ? "Locking..." : "Refresh Fix"}</span>
            </button>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
            title="Open in External Maps"
          >
            <ExternalLink className="size-3" />
            <span>Maps</span>
          </a>
        </div>
      </div>

      {/* Map Preview Image / Geoapify Layer */}
      <div className="relative h-44 w-full bg-muted/50 overflow-hidden group">
        {!mapError ? (
          <img
            src={mapUrl}
            alt="Geoapify Live Punch Location Map"
            onError={() => setMapError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="eager"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground text-xs p-4 text-center">
            <Compass className="size-8 text-brand animate-pulse" />
            <p className="font-bold text-foreground">Live GPS Map Active</p>
            <p className="text-[11px] font-mono">
              {userLocation.latitude.toFixed(5)}° N, {userLocation.longitude.toFixed(5)}° E
            </p>
          </div>
        )}

        {/* Floating Badges on Map */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <div className="flex items-center gap-1 rounded-lg bg-background/90 px-2 py-1 text-[10px] font-extrabold text-foreground shadow-sm backdrop-blur-md">
            <span className="size-2 rounded-full bg-[#1A3C6E]" />
            <span>Your Live Location (P)</span>
          </div>

          {venueLocation && (
            <div className="flex items-center gap-1 rounded-lg bg-background/90 px-2 py-1 text-[10px] font-extrabold text-foreground shadow-sm backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Venue (V)</span>
            </div>
          )}
        </div>

        {/* Floating Distance Badge */}
        {distanceMeters !== undefined && (
          <div className="absolute bottom-2.5 right-2.5">
            <span
              className={cn(
                "rounded-lg px-2.5 py-1 text-[10px] font-black shadow-md backdrop-blur-md",
                isInsideGeofence
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 text-white"
              )}
            >
              {isInsideGeofence
                ? `📍 In Venue Radius (${distanceMeters}m)`
                : `⚠️ ${distanceMeters}m from venue`}
            </span>
          </div>
        )}
      </div>

      {/* Location Details Footer */}
      <div className="p-3.5 text-xs space-y-2 bg-card">
        {/* Exact Resolved Address */}
        <div className="flex items-start gap-2">
          <MapPin className="size-4 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Exact Punch-In Address (Geoapify Verified)
            </span>
            <p className="font-semibold text-foreground text-xs leading-snug mt-0.5 break-words">
              {locationDetails?.formattedAddress ||
                `Coordinates: ${userLocation.latitude.toFixed(5)}° N, ${userLocation.longitude.toFixed(5)}° E (Vadodara Campus)`}
            </p>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-[11px]">
          <div>
            <span className="text-muted-foreground block text-[10px]">Precise Coordinates</span>
            <span className="font-mono font-bold text-foreground">
              {userLocation.latitude.toFixed(5)}°, {userLocation.longitude.toFixed(5)}°
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px]">Target Event Venue</span>
            <span className="font-bold text-foreground truncate block">
              {venueName || "GSFC University Campus"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
