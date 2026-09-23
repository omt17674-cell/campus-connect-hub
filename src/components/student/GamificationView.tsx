import { useState, useMemo } from "react";
import {
  Award,
  Crown,
  Flame,
  Medal,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
  Filter,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampusState } from "@/lib/campus-store";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface GamificationViewProps {
  state: CampusState;
}

interface LeaderboardStudent {
  rank: number;
  name: string;
  rollNo: string;
  dept: string;
  xp: number;
  streak: number;
  avatar: string;
  isUser: boolean;
  attendanceCount: number;
}

// GSFC University standard campus cohort benchmarks
const DEFAULT_CAMPUS_PEERS = [
  {
    name: "Aarav Patel",
    rollNo: "21BT04012",
    dept: "Computer Science & Engineering",
    baseXp: 1850,
    streak: 18,
    avatar: "AP",
  },
  {
    name: "Pooja Desai",
    rollNo: "21BT04045",
    dept: "Computer Science & Engineering",
    baseXp: 1620,
    streak: 14,
    avatar: "PD",
  },
  {
    name: "Rohan Shah",
    rollNo: "22BT02018",
    dept: "Chemical & Petrochemical Eng",
    baseXp: 1480,
    streak: 12,
    avatar: "RS",
  },
  {
    name: "Diya Trivedi",
    rollNo: "22BBA0105",
    dept: "School of Management",
    baseXp: 1310,
    streak: 9,
    avatar: "DT",
  },
  {
    name: "Karan Joshi",
    rollNo: "21BT01033",
    dept: "Applied Sciences & Life Tech",
    baseXp: 1190,
    streak: 11,
    avatar: "KJ",
  },
  {
    name: "Meera Mehta",
    rollNo: "22BT03021",
    dept: "Mechanical & Automation Eng",
    baseXp: 980,
    streak: 7,
    avatar: "MM",
  },
  {
    name: "Siddharth Dave",
    rollNo: "23BT04089",
    dept: "Computer Science & Engineering",
    baseXp: 860,
    streak: 5,
    avatar: "SD",
  },
  {
    name: "Ananya Iyer",
    rollNo: "23BA02014",
    dept: "Humanities & Social Sciences",
    baseXp: 740,
    streak: 4,
    avatar: "AI",
  },
];

export function GamificationView({ state }: GamificationViewProps) {
  const language = state?.language || "en";
  const t = translations[language] || translations.en;
  const [leaderboardTab, setLeaderboardTab] = useState<"students" | "departments">("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState<"all" | "earned" | "locked">("all");

  const user = state?.currentUser || {
    id: "stu-1",
    name: "GSFC Student",
    rollNo: "22BT04001",
    department: "Computer Science & Engineering",
    points: 0,
    streakDays: 0,
    attendanceRate: 100,
    badges: [],
  };

  const attendanceRecords = state?.attendanceRecords || [];
  const registeredStudents = state?.newRegisteredStudents || [];
  const badgesList = state?.badges || [];

  // Construct comprehensive dynamic student rankings
  const studentRankings: LeaderboardStudent[] = useMemo(() => {
    const list: LeaderboardStudent[] = [];
    const processedRolls = new Set<string>();

    const currentUserRoll = (user.rollNo || "").toUpperCase();
    const currentUserName = user.name || "GSFC Student";
    const userAttendanceCount = attendanceRecords.filter(
      (a) =>
        a &&
        ((a.userRollNo && a.userRollNo.toUpperCase() === currentUserRoll) ||
          (a.userId && a.userId === user.id))
    ).length;

    // 1. Add current user
    const currentUserItem: LeaderboardStudent = {
      rank: 1,
      name: `${currentUserName} (You)`,
      rollNo: user.rollNo || "22BT04001",
      dept: user.department || "Computer Science & Engineering",
      xp: Number(user.points || 0),
      streak: Number(user.streakDays || 0),
      avatar:
        user.avatar ||
        currentUserName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() ||
        "YOU",
      isUser: true,
      attendanceCount: userAttendanceCount,
    };
    list.push(currentUserItem);
    if (currentUserRoll) {
      processedRolls.add(currentUserRoll);
    }

    // 2. Add registered students from state
    registeredStudents.forEach((s) => {
      if (!s) return;
      const roll = (s.rollNo || "").toUpperCase();
      if (!roll || processedRolls.has(roll)) return;
      processedRolls.add(roll);

      const stuAttCount = attendanceRecords.filter(
        (a) => a && a.userRollNo && a.userRollNo.toUpperCase() === roll
      ).length;

      // Base XP from attendance + initial registration XP
      const xp = stuAttCount * 60 + 120;
      const name = s.fullName || "Student Candidate";
      const avatar =
        name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "ST";

      list.push({
        rank: 0,
        name,
        rollNo: s.rollNo,
        dept: s.department || "School of Technology",
        xp,
        streak: stuAttCount > 0 ? Math.min(14, stuAttCount * 2) : 1,
        avatar,
        isUser: false,
        attendanceCount: stuAttCount,
      });
    });

    // 3. Add default campus cohort benchmarks
    DEFAULT_CAMPUS_PEERS.forEach((peer) => {
      const roll = peer.rollNo.toUpperCase();
      if (processedRolls.has(roll)) return;
      processedRolls.add(roll);

      const peerAttCount = attendanceRecords.filter(
        (a) => a && a.userRollNo && a.userRollNo.toUpperCase() === roll
      ).length;

      list.push({
        rank: 0,
        name: peer.name,
        rollNo: peer.rollNo,
        dept: peer.dept,
        xp: peer.baseXp + peerAttCount * 60,
        streak: peer.streak,
        avatar: peer.avatar,
        isUser: false,
        attendanceCount: peerAttCount + Math.floor(peer.baseXp / 100),
      });
    });

    // Sort descending by XP
    list.sort((a, b) => b.xp - a.xp);

    // Assign dynamic ranks
    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [user, registeredStudents, attendanceRecords]);

  // Current user's live rank on campus
  const currentUserRank = useMemo(() => {
    const found = studentRankings.find((s) => s.isUser);
    return found ? found.rank : 1;
  }, [studentRankings]);

  // Calculate dynamic department league rankings
  const departmentRankings = useMemo(() => {
    const deptMap: Record<
      string,
      { totalXp: number; studentCount: number; events: number; totalAttendance: number }
    > = {
      "Computer Science & Engineering": { totalXp: 14820, studentCount: 142, events: 24, totalAttendance: 92 },
      "Chemical & Petrochemical Eng": { totalXp: 11240, studentCount: 98, events: 19, totalAttendance: 78 },
      "School of Management": { totalXp: 8950, studentCount: 84, events: 15, totalAttendance: 72 },
      "Applied Sciences & Life Tech": { totalXp: 7420, studentCount: 65, events: 12, totalAttendance: 66 },
      "Mechanical & Automation Eng": { totalXp: 6100, studentCount: 52, events: 10, totalAttendance: 59 },
      "Humanities & Social Sciences": { totalXp: 4950, studentCount: 40, events: 8, totalAttendance: 54 },
    };

    // Factor in live student rankings and events
    studentRankings.forEach((stu) => {
      const match = Object.keys(deptMap).find(
        (d) => d.toLowerCase() === (stu.dept || "").toLowerCase()
      );
      if (match) {
        deptMap[match].totalXp += stu.xp;
        deptMap[match].totalAttendance += stu.attendanceCount;
      }
    });

    const list = Object.entries(deptMap).map(([dept, data]) => {
      const participationRate = Math.min(
        98,
        Math.max(45, Math.round((data.totalAttendance / (data.studentCount || 1)) * 35 + 40))
      );
      return {
        dept,
        totalXpNum: data.totalXp,
        totalXp: `${data.totalXp.toLocaleString()} XP`,
        events: data.events,
        participation: `${participationRate}%`,
        studentCount: data.studentCount,
      };
    });

    list.sort((a, b) => b.totalXpNum - a.totalXpNum);

    return list.map((d, idx) => ({
      ...d,
      rank: idx + 1,
    }));
  }, [studentRankings]);

  // Filtered students based on search and department filter
  const filteredStudents = useMemo(() => {
    return studentRankings.filter((s) => {
      const matchesSearch =
        (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.rollNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.dept || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        selectedDeptFilter === "all" ||
        (s.dept || "").toLowerCase().includes(selectedDeptFilter.toLowerCase());

      return matchesSearch && matchesDept;
    });
  }, [studentRankings, searchQuery, selectedDeptFilter]);

  // Top 3 Podium Students
  const topThree = useMemo(() => {
    return studentRankings.slice(0, 3);
  }, [studentRankings]);

  const userPoints = Number(user.points || 0);
  const currentLevel = Math.floor(userPoints / 200) + 1;
  const currentLevelXp = userPoints % 200;
  const nextLevelXp = 200;
  const levelProgress = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));

  // Filtered badges
  const filteredBadges = useMemo(() => {
    const userBadgeIds = new Set(user.badges || []);
    return badgesList.filter((b) => {
      const isEarned = b.unlocked || userBadgeIds.has(b.id);
      if (badgeFilter === "earned") return isEarned;
      if (badgeFilter === "locked") return !isEarned;
      return true;
    });
  }, [badgesList, user.badges, badgeFilter]);

  const earnedBadgeCount = useMemo(() => {
    const userBadgeIds = new Set(user.badges || []);
    return badgesList.filter((b) => b.unlocked || userBadgeIds.has(b.id)).length;
  }, [badgesList, user.badges]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Gamification Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-[#1A3C6E] via-[#132E56] to-[#0D203C] p-6 text-white shadow-xl shadow-[#1A3C6E]/20">
        <div className="absolute right-0 top-0 -mr-10 -mt-10 size-48 rounded-full bg-[#F2A93B]/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 -mb-12 size-40 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[#F2A93B]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#F2A93B]">
                <Crown className="size-3" /> GSFC Academic League
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
                Level {currentLevel} Scholar
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                <TrendingUp className="size-3" /> Active Status
              </span>
            </div>
            <h2 className="mt-2 font-display text-2xl font-black sm:text-3xl text-white">
              {user.name || "GSFC Student"}
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Rank #{currentUserRank} on Campus · {user.department || "Computer Science & Engineering"}
            </p>
          </div>

          {/* Points & Stats Cards */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md min-w-[100px]">
              <div className="flex items-center gap-1.5 text-xs text-[#F2A93B]">
                <Zap className="size-4 fill-current" />
                <span className="font-bold uppercase tracking-wider">Total XP</span>
              </div>
              <p className="mt-1 font-display text-2xl font-black text-white">{userPoints}</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md min-w-[100px]">
              <div className="flex items-center gap-1.5 text-xs text-orange-400">
                <Flame className="size-4 fill-current" />
                <span className="font-bold uppercase tracking-wider">Streak</span>
              </div>
              <p className="mt-1 font-display text-2xl font-black text-white">
                {user.streakDays || 0} Days
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md min-w-[100px]">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <ShieldCheck className="size-4" />
                <span className="font-bold uppercase tracking-wider">Attendance</span>
              </div>
              <p className="mt-1 font-display text-2xl font-black text-white">
                {user.attendanceRate || 100}%
              </p>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="relative z-10 mt-6 border-t border-white/15 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Level {currentLevel} Scholar</span>
            <span>
              {currentLevelXp} / {nextLevelXp} XP to Level {currentLevel + 1} ({levelProgress}%)
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F2A93B] to-amber-300 transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top 3 Podium Section */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card/80 via-card/50 to-card/80 p-5 shadow-xl backdrop-blur-xl sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-black text-foreground flex items-center gap-2">
              <Trophy className="size-5 text-[#F2A93B]" /> Campus Champions Podium
            </h3>
            <p className="text-xs text-muted-foreground">
              Top performing scholars across all faculties and academic departments
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
          {/* Rank 2 (Silver) */}
          {topThree[1] && (
            <div
              className={cn(
                "order-2 sm:order-1 flex flex-col items-center rounded-2xl border p-4 text-center transition-all",
                topThree[1].isUser
                  ? "border-amber-500/60 bg-amber-500/10 shadow-lg"
                  : "border-slate-300/40 bg-card/60"
              )}
            >
              <div className="relative">
                <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-400 font-display text-base font-black text-slate-900 shadow-md">
                  {topThree[1].avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-slate-300 font-display text-xs font-black text-slate-900 border-2 border-background">
                  #2
                </div>
              </div>
              <h4 className="mt-3 font-display text-sm font-bold text-foreground truncate max-w-[140px]">
                {topThree[1].name}
              </h4>
              <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                {topThree[1].dept}
              </p>
              <div className="mt-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/60 px-3 py-1 text-xs font-black text-slate-700 dark:text-slate-300">
                {topThree[1].xp.toLocaleString()} XP
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {topThree[0] && (
            <div
              className={cn(
                "order-1 sm:order-2 flex flex-col items-center rounded-2xl border-2 p-5 text-center transition-all shadow-xl sm:-translate-y-2",
                topThree[0].isUser
                  ? "border-[#F2A93B] bg-[#F2A93B]/15 shadow-[#F2A93B]/20"
                  : "border-[#F2A93B]/60 bg-gradient-to-b from-[#F2A93B]/10 to-card"
              )}
            >
              <div className="relative">
                <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[#F2A93B] to-amber-600 font-display text-lg font-black text-slate-950 shadow-lg">
                  {topThree[0].avatar}
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <Crown className="size-6 text-[#F2A93B] drop-shadow-md animate-bounce" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-[#F2A93B] font-display text-xs font-black text-slate-950 border-2 border-background">
                  #1
                </div>
              </div>
              <h4 className="mt-3 font-display text-base font-black text-foreground truncate max-w-[160px]">
                {topThree[0].name}
              </h4>
              <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                {topThree[0].dept}
              </p>
              <div className="mt-2 rounded-xl bg-[#F2A93B]/20 px-3.5 py-1 text-xs font-black text-[#F2A93B] dark:text-amber-300">
                {topThree[0].xp.toLocaleString()} XP
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] && (
            <div
              className={cn(
                "order-3 flex flex-col items-center rounded-2xl border p-4 text-center transition-all",
                topThree[2].isUser
                  ? "border-amber-500/60 bg-amber-500/10 shadow-lg"
                  : "border-amber-700/40 bg-card/60"
              )}
            >
              <div className="relative">
                <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-700 to-amber-900 font-display text-base font-black text-white shadow-md">
                  {topThree[2].avatar}
                </div>
                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-amber-700 font-display text-xs font-black text-white border-2 border-background">
                  #3
                </div>
              </div>
              <h4 className="mt-3 font-display text-sm font-bold text-foreground truncate max-w-[140px]">
                {topThree[2].name}
              </h4>
              <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                {topThree[2].dept}
              </p>
              <div className="mt-2 rounded-xl bg-amber-700/20 px-3 py-1 text-xs font-black text-amber-700 dark:text-amber-400">
                {topThree[2].xp.toLocaleString()} XP
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Badges Showcase Section */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-xl backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-black text-foreground flex items-center gap-2">
              <Award className="size-5 text-[#F2A93B]" /> {t.gamification?.badgesTitle || "Verified Achievement Badges"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Collect verified digital credentials by attending workshops, leading teams, and maintaining streaks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">
              {earnedBadgeCount} / {badgesList.length} Unlocked
            </span>
            <div className="flex items-center rounded-xl border border-border/60 bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setBadgeFilter("all")}
                className={cn(
                  "rounded-lg px-2.5 py-1 font-semibold transition-colors",
                  badgeFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setBadgeFilter("earned")}
                className={cn(
                  "rounded-lg px-2.5 py-1 font-semibold transition-colors",
                  badgeFilter === "earned" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                Earned
              </button>
              <button
                type="button"
                onClick={() => setBadgeFilter("locked")}
                className={cn(
                  "rounded-lg px-2.5 py-1 font-semibold transition-colors",
                  badgeFilter === "locked" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                In Progress
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {filteredBadges.map((badge) => {
            const userBadgeIds = new Set(user.badges || []);
            const isUnlocked = Boolean(badge.unlocked || userBadgeIds.has(badge.id));

            return (
              <div
                key={badge.id}
                className={cn(
                  "relative flex items-start gap-3.5 rounded-2xl border p-4 backdrop-blur-xl transition-all",
                  isUnlocked
                    ? "border-[#F2A93B]/40 bg-card/80 shadow-md"
                    : "border-border/60 bg-card/30 opacity-65"
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
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-display text-sm font-bold text-foreground truncate">
                      {badge.title}
                    </h4>
                    {isUnlocked ? (
                      <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                        Earned
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                        Locked
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

      {/* Main Leaderboard Section */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-xl shadow-brand/5 backdrop-blur-2xl sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-xl font-black text-foreground">
              University Leaderboard
            </h3>
            <p className="text-xs text-muted-foreground">
              Semester 6 Live Rankings based on verified event attendance, check-ins, and campus engagement
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
              <Users className="mr-1.5 size-3.5" /> Top Students ({studentRankings.length})
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

        {/* Filters and Search when in Students Tab */}
        {leaderboardTab === "students" && (
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search student or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs rounded-xl h-9"
              />
            </div>

            <div className="flex w-full sm:w-auto items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDeptFilter("all")}
                className={cn(
                  "h-8 rounded-xl text-xs shrink-0",
                  selectedDeptFilter === "all" ? "border-brand bg-brand/10 text-brand font-bold" : ""
                )}
              >
                All Faculties
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDeptFilter("Computer")}
                className={cn(
                  "h-8 rounded-xl text-xs shrink-0",
                  selectedDeptFilter === "Computer" ? "border-brand bg-brand/10 text-brand font-bold" : ""
                )}
              >
                CSE
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDeptFilter("Chemical")}
                className={cn(
                  "h-8 rounded-xl text-xs shrink-0",
                  selectedDeptFilter === "Chemical" ? "border-brand bg-brand/10 text-brand font-bold" : ""
                )}
              >
                Chemical
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDeptFilter("Management")}
                className={cn(
                  "h-8 rounded-xl text-xs shrink-0",
                  selectedDeptFilter === "Management" ? "border-brand bg-brand/10 text-brand font-bold" : ""
                )}
              >
                Management
              </Button>
            </div>
          </div>
        )}

        {/* Leaderboard Table / Rows */}
        <div className="mt-5 space-y-2.5">
          {leaderboardTab === "students" ? (
            filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div
                  key={student.rollNo}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all",
                    student.isUser
                      ? "border-amber-500/60 bg-amber-500/10 shadow-md ring-1 ring-amber-500/30"
                      : "border-border/60 bg-card/50 hover:bg-card/80"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-xl font-display text-xs font-black",
                        student.rank === 1
                          ? "bg-amber-400 text-slate-950 shadow-sm"
                          : student.rank === 2
                          ? "bg-slate-300 text-slate-900 shadow-sm"
                          : student.rank === 3
                          ? "bg-amber-700 text-white shadow-sm"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {student.rank === 1 ? <Crown className="size-4" /> : `#${student.rank}`}
                    </div>

                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 font-bold text-brand text-xs">
                      {student.avatar}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-display text-sm font-bold text-foreground truncate">
                          {student.name}
                        </h4>
                        {student.isUser && (
                          <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-700 dark:text-amber-300">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.dept} · {student.rollNo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden text-right sm:block">
                      <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                        <Flame className="size-3.5 fill-current" /> {student.streak}d Streak
                      </span>
                    </div>
                    <div className="rounded-xl bg-[#1A3C6E]/10 px-3 py-1.5 font-display text-xs font-black text-[#1A3C6E] dark:bg-white/10 dark:text-white">
                      {student.xp.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
                <Users className="mx-auto size-8 opacity-40 mb-2" />
                <p className="text-sm font-semibold">No students found matching your search</p>
                <p className="text-xs mt-1">Try clearing filters or search term</p>
              </div>
            )
          ) : (
            departmentRankings.map((dept) => (
              <div
                key={dept.dept}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 transition-all hover:bg-card/80"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl font-display text-xs font-bold",
                      dept.rank === 1
                        ? "bg-[#F2A93B] text-slate-950 font-black"
                        : dept.rank === 2
                        ? "bg-slate-300 text-slate-900 font-black"
                        : dept.rank === 3
                        ? "bg-amber-700 text-white font-black"
                        : "bg-brand/10 text-brand"
                    )}
                  >
                    #{dept.rank}
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground">
                      {dept.dept}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {dept.events} Organized Events · {dept.totalXp} Earned · {dept.studentCount} Scholars
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {dept.participation} Turnout
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
