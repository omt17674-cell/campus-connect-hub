import React from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  className?: string;
  label?: string;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onDateChange,
  className,
  label = "Filter by Date",
}: DateRangeFilterProps) {
  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const applyPreset = (preset: "all" | "today" | "7d" | "30d" | "month") => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (preset === "all") {
      onDateChange("", "");
    } else if (preset === "today") {
      onDateChange(todayStr, todayStr);
    } else if (preset === "7d") {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      onDateChange(past.toISOString().split("T")[0], todayStr);
    } else if (preset === "30d") {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      onDateChange(past.toISOString().split("T")[0], todayStr);
    } else if (preset === "month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      onDateChange(firstDay, todayStr);
    }
  };

  const hasFilter = Boolean(startDate || endDate);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-card/80 p-2 text-xs backdrop-blur-md shadow-xs",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground font-bold px-1">
        <Calendar className="size-3.5 text-[#1A3C6E] dark:text-[#F2A93B]" />
        <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground font-semibold">From:</span>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onDateChange(e.target.value, endDate)}
            className="h-8 w-32 rounded-xl border-border/70 bg-background/80 px-2 py-1 text-[11px] font-medium"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground font-semibold">To:</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onDateChange(startDate, e.target.value)}
            className="h-8 w-32 rounded-xl border-border/70 bg-background/80 px-2 py-1 text-[11px] font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => applyPreset("all")}
          className={cn(
            "rounded-lg px-2 py-1 text-[10px] font-bold transition-all",
            !hasFilter
              ? "bg-[#1A3C6E] text-white"
              : "border border-border/60 bg-card hover:bg-muted text-muted-foreground"
          )}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => applyPreset("today")}
          className={cn(
            "rounded-lg px-2 py-1 text-[10px] font-bold transition-all",
            startDate === getTodayStr() && endDate === getTodayStr()
              ? "bg-[#1A3C6E] text-white"
              : "border border-border/60 bg-card hover:bg-muted text-muted-foreground"
          )}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => applyPreset("7d")}
          className="rounded-lg border border-border/60 bg-card hover:bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground transition-all"
        >
          7D
        </button>
        <button
          type="button"
          onClick={() => applyPreset("30d")}
          className="rounded-lg border border-border/60 bg-card hover:bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground transition-all"
        >
          30D
        </button>

        {hasFilter && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDateChange("", "")}
            className="h-7 gap-1 px-2 text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
            title="Clear date filter"
          >
            <X className="size-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>
    </div>
  );
}
