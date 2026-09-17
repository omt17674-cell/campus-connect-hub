import { useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Code,
  Download,
  HeartHandshake,
  Palette,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { campusStore } from "@/lib/campus-store";
import { cn } from "@/lib/utils";

interface ActivityPointsCardProps {
  className?: string;
}

export function ActivityPointsCard({ className }: ActivityPointsCardProps) {
  const [copied, setCopied] = useState(false);
  const state = campusStore.getState();
  const breakdown = campusStore.calculateActivityPoints(state.currentUser.id);

  const categories = [
    {
      ...breakdown.technical,
      icon: Code,
      bgGradient: "from-blue-600 to-indigo-700",
      lightBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    {
      ...breakdown.cultural,
      icon: Palette,
      bgGradient: "from-amber-500 to-orange-600",
      lightBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    {
      ...breakdown.sports,
      icon: Trophy,
      bgGradient: "from-emerald-600 to-teal-700",
      lightBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    {
      ...breakdown.social,
      icon: HeartHandshake,
      bgGradient: "from-purple-600 to-pink-600",
      lightBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    },
  ];

  const handleDownloadTranscript = () => {
    const text = [
      "============================================================",
      "       GSFC UNIVERSITY, VADODARA - STUDENT ACTIVITY RECORD  ",
      "             100 ACTIVITY POINTS (SAP) TRANSCRIPT           ",
      "============================================================",
      `Student Name  : ${state.currentUser.name}`,
      `Roll Number   : ${state.currentUser.rollNo}`,
      `Department    : ${state.currentUser.department}`,
      `Generated On  : ${new Date().toLocaleDateString("en-GB")}`,
      "------------------------------------------------------------",
      `Technical & Workshops     : ${breakdown.technical.earned} / ${breakdown.technical.max} pts`,
      `Cultural & Arts Events    : ${breakdown.cultural.earned} / ${breakdown.cultural.max} pts`,
      `Sports & Athletics        : ${breakdown.sports.earned} / ${breakdown.sports.max} pts`,
      `NSS & Social Activity     : ${breakdown.social.earned} / ${breakdown.social.max} pts`,
      "------------------------------------------------------------",
      `TOTAL ACTIVITY POINTS     : ${breakdown.totalEarned} / 100 PTS (${breakdown.percentage}%)`,
      `STATUS                    : ${breakdown.totalEarned >= 80 ? "PASSED - ELIGIBLE FOR DEGREE HONOURS" : "IN PROGRESS"}`,
      "============================================================",
    ].join("\r\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GSFC_100_Activity_Points_${state.currentUser.rollNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-card/60 p-6 shadow-xl relative overflow-hidden",
        className
      )}
    >
      {/* Background Glow */}
      <div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#1A3C6E]/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 size-48 rounded-full bg-[#F2A93B]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] text-[#F2A93B] shadow-md shadow-[#1A3C6E]/30">
            <Award className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base sm:text-lg font-black text-foreground">
                GSFC 100 Activity Points (SAP)
              </h3>
              <span className="rounded-full bg-[#1A3C6E]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#1A3C6E] dark:text-[#F2A93B]">
                Academic Diary
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Degree requirement progress for {state.currentUser.rollNo}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownloadTranscript}
            size="sm"
            variant="outline"
            className="rounded-xl text-xs font-bold gap-1.5 h-8 border-border hover:bg-accent"
          >
            {copied ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Download className="size-3.5" />}
            {copied ? "Downloaded" : "Point Summary"}
          </Button>
        </div>
      </div>

      {/* Main Overall Progress Bar */}
      <div className="mt-5 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground">Total Degree Activity Points Earned</span>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-black text-foreground">{breakdown.totalEarned}</span>
            <span className="text-xs text-muted-foreground font-semibold">/ 100 PTS</span>
            <span className="ml-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {breakdown.percentage}% Completed
            </span>
          </div>
        </div>

        <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1A3C6E] via-[#F2A93B] to-emerald-500 transition-all duration-700 shadow-sm"
            style={{ width: `${breakdown.percentage}%` }}
          />
        </div>
      </div>

      {/* 4 Category Breakdown Cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const catPct = Math.round((cat.earned / cat.max) * 100);
          return (
            <div
              key={cat.label}
              className="rounded-2xl border border-border/70 bg-card/50 p-3.5 transition hover:border-brand/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={cn("flex size-8 items-center justify-center rounded-xl", cat.lightBg)}>
                    <Icon className="size-4" />
                  </div>
                  <span className="text-xs font-black text-foreground">
                    {cat.earned} <span className="text-[10px] font-normal text-muted-foreground">/ {cat.max}</span>
                  </span>
                </div>
                <h4 className="mt-2 font-bold text-xs text-foreground line-clamp-1">{cat.label}</h4>
              </div>

              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r", cat.bgGradient)}
                    style={{ width: `${catPct}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{catPct}% target</span>
                  <span>{cat.max - cat.earned > 0 ? `${cat.max - cat.earned} left` : "Achieved!"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
