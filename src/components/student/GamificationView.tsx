import { useState } from "react";
import {
  Award,
  Crown,
  Flame,
  Medal,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusState } from "@/lib/campus-store";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface GamificationViewProps {
  state: CampusState;
}

export function GamificationView({ state }: GamificationViewProps) {
  const t = translations[state.language];
  const [leaderboardTab, setLeaderboardTab] = useState<"students" | "departments">("students");
  const user = state?.currentUser || {
    id: "u-om",
    name: "Om Thakkar",
    rollNo: "24BT04171",
    department: "B.Tech CSE",
    points: 640,
    streakDays: 9,
  };

  const studentRankings = [
    { rank: 1, name: "Tanvi Bhatt", rollNo: "GSFC-CS-0091", dept: "Computer Science", xp: 820, streak: 14, avatar: "TB" },
    { rank: 2, name: `${user.name || "You"} (You)`, rollNo: user.rollNo || "24BT04171", dept: user.department || "CSE", xp: user.points || 640, streak: user.streakDays || 9, avatar: user.avatar || "OT", isUser: true },
    { rank: 3, name: "Harshil Patel", rollNo: "GSFC-CH-0044", dept: "Chemical Eng", xp: 460, streak: 6, avatar: "HP" },
    { rank: 4, name: "Sneha Desai", rollNo: "GSFC-MG-0112", dept: "Management", xp: 410, streak: 5, avatar: "SD" },
    { rank: 5, name: "Kunal Shah", rollNo: "GSFC-CS-0205", dept: "Computer Science", xp: 380, streak: 4, avatar: "KS" },
  ];

  const departmentRankings = [
    { rank: 1, dept: "Computer Science & Engineering", participation: "88%", totalXp: "14,820 XP", events: 24 },
    { rank: 2, dept: "Chemical & Petrochemical Eng", participation: "74%", totalXp: "9,640 XP", events: 18 },
    { rank: 3, dept: "School of Management", participation: "69%", totalXp: "7,810 XP", events: 14 },
    { rank: 4, dept: "Applied Sciences & Life Tech", participation: "61%", totalXp: "6,200 XP", events: 11 },
    { rank: 5, dept: "Humanities & Social Sciences", participation: "54%", totalXp: "4,950 XP", events: 8 },
  ];

  const userPoints = user.points || 0;
  const currentLevel = Math.floor(userPoints / 200) + 1;
  const currentLevelXp = userPoints % 200;
  const nextLevelXp = 200;
  const levelProgress = Math.min(100, (currentLevelXp / nextLevelXp) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Gamification Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-[#1A3C6E] to-[#0D203C] p-6 text-white shadow-xl shadow-[#1A3C6E]/20">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 size-48 rounded-full bg-[#F2A93B]/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[#F2A93B]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#F2A93B]">
                <Crown className="size-3" /> GSFC Academic League
              </span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold">
                Level {currentLevel} Scholar
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">
              {state.currentUser.name}
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Rank #2 on Campus · {state.currentUser.department}
            </p>
          </div>

          {/* Points & Stats Card */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-xs text-[#F2A93B]">
                <Zap className="size-4 fill-current" />
                <span className="font-bold uppercase tracking-wider">Total XP</span>
              </div>
              <p className="mt-1 font-display text-2xl font-black">{state.currentUser.points}</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-xs text-orange-400">
                <Flame className="size-4 fill-current" />
                <span className="font-bold uppercase tracking-wider">Streak</span>
              </div>
              <p className="mt-1 font-display text-2xl font-black">{state.currentUser.streakDays} Days</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <ShieldCheck className="size-4" />
                <span className="font-bold uppercase tracking-wider">Attendance</span>
              </div>
              <p className="mt-1 font-display text-2xl font-black">{state.currentUser.attendanceRate}%</p>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="relative z-10 mt-6 border-t border-white/15 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Level {currentLevel}</span>
            <span>{currentLevelXp} / {nextLevelXp} XP to Level {currentLevel + 1}</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F2A93B] to-amber-300 transition-all"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Showcase Section */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-black text-foreground">
              {t.gamification.badgesTitle}
            </h3>
            <p className="text-xs text-muted-foreground">
              Collect verified badges by attending workshops, leading teams, and maintaining streaks
            </p>
          </div>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
            {state.badges.filter((b) => b.unlocked).length} / {state.badges.length} Unlocked
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {state.badges.map((badge) => {
            const isUnlocked = badge.unlocked;
            return (
              <div
                key={badge.id}
                className={cn(
                  "relative flex items-start gap-3.5 rounded-2xl border p-4 backdrop-blur-xl transition-all",
                  isUnlocked
                    ? "border-[#F2A93B]/40 bg-card/80 shadow-md"
                    : "border-border/60 bg-card/40 opacity-60"
                )}
              >
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-md",
                    isUnlocked
                      ? "bg-gradient-to-br from-[#F2A93B] to-amber-600 text-slate-950"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Award className="size-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-display text-sm font-bold text-foreground truncate">
                      {badge.title}
                    </h4>
                    {isUnlocked && (
                      <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                        Earned
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {badge.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-[#F2A93B]">
                    <Sparkles className="size-3" /> +{badge.xpBonus} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-xl shadow-brand/5 backdrop-blur-2xl sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-xl font-black text-foreground">
              University Leaderboard
            </h3>
            <p className="text-xs text-muted-foreground">
              Semester 6 Live Rankings based on verified event attendance and participation
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-2xl border border-border/70 bg-card/60 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeaderboardTab("students")}
              className={cn(
                "rounded-xl text-xs font-bold",
                leaderboardTab === "students"
                  ? "bg-[#1A3C6E] text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="mr-1.5 size-3.5" /> Top Students
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeaderboardTab("departments")}
              className={cn(
                "rounded-xl text-xs font-bold",
                leaderboardTab === "departments"
                  ? "bg-[#1A3C6E] text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Trophy className="mr-1.5 size-3.5" /> Department League
            </Button>
          </div>
        </div>

        {/* Leaderboard Table / Rows */}
        <div className="mt-5 space-y-2.5">
          {leaderboardTab === "students" ? (
            studentRankings.map((student) => (
              <div
                key={student.rollNo}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all",
                  student.isUser
                    ? "border-amber-500/50 bg-amber-500/10 shadow-md"
                    : "border-border/60 bg-card/50 hover:bg-card/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-xl font-display text-xs font-black",
                      student.rank === 1
                        ? "bg-amber-400 text-slate-950"
                        : student.rank === 2
                        ? "bg-slate-300 text-slate-900"
                        : student.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {student.rank === 1 ? <Crown className="size-4" /> : `#${student.rank}`}
                  </div>

                  <div className="flex size-9 items-center justify-center rounded-full bg-brand/10 font-bold text-brand">
                    {student.avatar}
                  </div>

                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground">
                      {student.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {student.dept} · {student.rollNo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden text-right sm:block">
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                      <Flame className="size-3.5 fill-current" /> {student.streak}d Streak
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#1A3C6E]/10 px-3 py-1.5 font-display text-xs font-black text-[#1A3C6E] dark:bg-white/10 dark:text-white">
                    {student.xp} XP
                  </div>
                </div>
              </div>
            ))
          ) : (
            departmentRankings.map((dept) => (
              <div
                key={dept.dept}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 transition-all hover:bg-card/80"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-brand/10 font-display text-xs font-bold text-brand">
                    #{dept.rank}
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground">
                      {dept.dept}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {dept.events} Organized Events · {dept.totalXp} Earned
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {dept.participation} Attendance
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
