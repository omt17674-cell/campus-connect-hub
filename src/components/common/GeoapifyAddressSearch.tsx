import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X, Check } from "lucide-react";
import {
  searchAddressWithGeoapify,
  GeoapifySearchResult,
} from "@/lib/geoapify";
import { cn } from "@/lib/utils";

interface GeoapifyAddressSearchProps {
  value?: string;
  placeholder?: string;
  onSelectLocation: (result: GeoapifySearchResult) => void;
  className?: string;
  inputClassName?: string;
}

export function GeoapifyAddressSearch({
  value = "",
  placeholder = "Search venue or address (e.g. Vigyan Bhavan, GSFC University)...",
  onSelectLocation,
  className,
  inputClassName,
}: GeoapifyAddressSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<GeoapifySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const matches = await searchAddressWithGeoapify(query, 5);
      setResults(matches);
      setIsLoading(false);
      setIsOpen(matches.length > 0);
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: GeoapifySearchResult) => {
    setQuery(item.name || item.formatted);
    setIsOpen(false);
    onSelectLocation(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < results.length) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "h-9 w-full rounded-xl border border-border/80 bg-background pl-8 pr-8 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-[#1A3C6E] focus:outline-none focus:ring-1 focus:ring-[#1A3C6E]",
            inputClassName
          )}
        />

        {isLoading ? (
          <Loader2 className="absolute right-3 size-3.5 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-2.5 rounded-full p-0.5 text-muted-foreground hover:bg-muted"
          >
            <X className="size-3" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border/80 bg-popover/95 p-1 text-popover-foreground shadow-xl backdrop-blur-md">
          <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/50 flex items-center justify-between">
            <span>Geoapify Search Suggestions</span>
            <span className="text-[9px] font-normal text-emerald-600">Live GPS API</span>
          </div>

          <div className="py-1">
            {results.map((item, idx) => (
              <button
                key={`${item.latitude}-${item.longitude}-${idx}`}
                type="button"
                onClick={() => handleSelect(item)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                  selectedIndex === idx ? "bg-accent text-accent-foreground font-bold" : "hover:bg-muted/70"
                )}
              >
                <MapPin className="size-3.5 shrink-0 text-rose-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-xs truncate">
                    {item.name || item.formatted.split(",")[0]}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {item.formatted}
                  </p>
                  <span className="text-[9px] font-mono text-slate-400">
                    {item.latitude.toFixed(4)}°, {item.longitude.toFixed(4)}°
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
