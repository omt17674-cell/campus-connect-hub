import React, { useState } from "react";
import {
  ShieldCheck,
  Award,
  Trophy,
  HeartHandshake,
  Calendar,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
  Filter,
  GraduationCap,
  Clock,
  Flame,
  FileText,
  UserCheck,
  Building,
  Star,
  QrCode,
  Search,
} from "lucide-react";
import { campusStore } from "@/lib/campus-store";
import { VerifiedAchievement } from "@/lib/types";

export const StudentPassportView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRModal, setShowQRModal] = useState<VerifiedAchievement | null>(null);

  const state = campusStore.getState();
  const user = state?.currentUser || {
    id: "u-om",
    name: "Om Thakkar",
    rollNo: "24BT04171",
    email: "omthakkar168@gsfcuniversity.ac.in",
    role: "student",
    department: "B.Tech Computer Science & Engineering",
    semester: 4,
    avatar: "OT",
    points: 640,
    streakDays: 9,
    volunteerHours: 18,
    attendanceRate: 91,
    badges: ["b1", "b2", "b3", "b5"],
  };

  const activitySummary = campusStore.calculateActivityPoints
    ? campusStore.calculateActivityPoints(user.id)
    : {
        technical: { earned: 24, max: 40, color: "#1A3C6E", label: "Technical & Workshops", iconName: "Code" },
        cultural: { earned: 14, max: 20, color: "#F2A93B", label: "Cultural & Arts", iconName: "Palette" },
        sports: { earned: 10, max: 20, color: "#10B981", label: "Sports & Athletics", iconName: "Trophy" },
        social: { earned: 16, max: 20, color: "#6366F1", label: "NSS & Social Responsibility", iconName: "HeartHandshake" },
        totalEarned: 64,
        totalMax: 100,
        percentage: 64,
      };

  const myClubs = (state?.clubMembers || []).filter((m) => m && m.userId === user.id);
  const myAttendance = (state?.attendanceRecords || []).filter(
    (a) => a && (a.userId === user.id || a.userRollNo === user.rollNo)
  );
  const myAchievements = (state?.achievements || []).filter(
    (a) => a && (a.userId === user.id || a.userRollNo === user.rollNo)
  );

  const categories = [
    { id: "all", label: "All Records" },
    { id: "hackathon", label: "Hackathons & Tech" },
    { id: "technical", label: "Workshops & Certs" },
    { id: "volunteering", label: "NSS & Social" },
    { id: "sports", label: "Sports & Athletics" },
    { id: "cultural", label: "Cultural & Arts" },
  ];

  const filteredAchievements = myAchievements.filter((ach) => {
    if (!ach) return false;
    const cat = (ach.category || "").toLowerCase();
    const matchesCategory = selectedCategory === "all" || cat === selectedCategory.toLowerCase();
    const query = (searchQuery || "").toLowerCase();
    const matchesSearch =
      (ach.title || "").toLowerCase().includes(query) ||
      (ach.eventOrActivityName || "").toLowerCase().includes(query) ||
      (ach.issuingAuthority || "").toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handlePrintPassport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner: Student 360 Activity Passport */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A3C6E] via-[#255294] to-[#0e2547] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#F2A93B]/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                alt={user.name}
                className="h-20 w-20 rounded-2xl border-2 border-[#F2A93B] object-cover shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 text-white shadow">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#F2A93B] px-2 py-0.5 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  Official GSFC Ledger
                </span>
                <span className="text-xs text-blue-200 font-mono">Roll: {user.rollNo}</span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
                {user.name}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 font-medium">
                {user.department} · Semester {user.semester}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handlePrintPassport}
              className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/25 transition-all backdrop-blur-md border border-white/20"
            >
              <Download className="h-4 w-4 text-[#F2A93B]" />
              Export 360 Portfolio
            </button>
          </div>
        </div>

        {/* 6 Key Engagement KPIs */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between text-blue-200">
              <span className="text-[11px] font-semibold">Events Attended</span>
              <Calendar className="h-4 w-4 text-[#F2A93B]" />
            </div>
            <p className="mt-1 text-xl font-black text-white">{myAttendance.length}</p>
            <p className="text-[10px] text-emerald-300 font-medium">Verified On-Site</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between text-blue-200">
              <span className="text-[11px] font-semibold">Certificates</span>
              <FileText className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-1 text-xl font-black text-white">
              {myAttendance.filter((a) => a.certificateId).length}
            </p>
            <p className="text-[10px] text-blue-200 font-medium">Unique Digilocker IDs</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between text-blue-200">
              <span className="text-[11px] font-semibold">Achievements</span>
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <p className="mt-1 text-xl font-black text-white">{myAchievements.length}</p>
            <p className="text-[10px] text-amber-300 font-medium">Dean Endorsed</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between text-blue-200">
              <span className="text-[11px] font-semibold">Volunteer Hours</span>
              <HeartHandshake className="h-4 w-4 text-rose-400" />
            </div>
            <p className="mt-1 text-xl font-black text-white">{user.volunteerHours}h</p>
            <p className="text-[10px] text-rose-300 font-medium">NSS & Social Credit</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between text-blue-200">
              <span className="text-[11px] font-semibold">Active Clubs</span>
              <Building className="h-4 w-4 text-purple-400" />
            </div>
            <p className="mt-1 text-xl font-black text-white">{myClubs.length}</p>
            <p className="text-[10px] text-purple-300 font-medium">Student Leadership</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between text-blue-200">
              <span className="text-[11px] font-semibold">Daily Streak</span>
              <Flame className="h-4 w-4 text-orange-400" />
            </div>
            <p className="mt-1 text-xl font-black text-white">{user.streakDays} Days</p>
            <p className="text-[10px] text-orange-300 font-medium">Campus Engagement</p>
          </div>
        </div>
      </div>

      {/* 100-Point Activity Progress Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#1A3C6E]">
                <Award className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                100-Point Activity Progress (AICTE/GSFC Curriculum)
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Mandatory credit points earned across Technical, Cultural, Sports, and Social spheres for B.Tech Honors degree clearance.
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-[#1A3C6E]">
              {activitySummary.totalEarned}
            </span>
            <span className="text-xs font-bold text-slate-400"> / {activitySummary.totalMax} pts</span>
            <span className="ml-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              {activitySummary.percentage}% Completed
            </span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries({
            technical: activitySummary.technical,
            cultural: activitySummary.cultural,
            sports: activitySummary.sports,
            social: activitySummary.social,
          }).map(([key, cat]) => (
            <div key={key} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{cat.label}</span>
                <span className="font-mono font-bold text-slate-600">
                  {cat.earned}/{cat.max} pts
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (cat.earned / cat.max) * 100)}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                {cat.earned >= cat.max ? "✅ Requirement Met" : `${cat.max - cat.earned} pts needed`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Achievement Credentials Ledger */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Verified Credentials & Digital Achievements Ledger
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Cryptographically stamped credentials authorized by GSFC University administration.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#1A3C6E] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* List of Verified Achievements */}
        <div className="mt-6 space-y-3">
          {filteredAchievements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <Trophy className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-700">No records found</p>
              <p className="text-xs text-slate-400">
                No verified achievements match your current search or category filter.
              </p>
            </div>
          ) : (
            filteredAchievements.map((ach) => (
              <div
                key={ach.id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:border-[#1A3C6E]/40 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1A3C6E] to-[#255294] text-[#F2A93B] shadow-sm">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> VERIFIED CREDENTIAL
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {ach.dateEarned}
                      </span>
                    </div>
                    <h4 className="mt-1 font-bold text-slate-900 text-sm">{ach.title}</h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {ach.eventOrActivityName}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {ach.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                      <span>Issued by: <strong className="text-slate-600">{ach.issuingAuthority}</strong></span>
                      <span>·</span>
                      <span className="font-mono">Hash: {ach.verificationHash.slice(0, 18)}...</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowQRModal(ach)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5 text-[#1A3C6E]" />
                    Verify QR
                  </button>
                  {ach.certificateId && (
                    <span className="rounded-xl bg-amber-50 border border-amber-200/70 px-3 py-2 text-[11px] font-mono font-bold text-amber-900">
                      {ach.certificateId}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QR Verification Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-scale-in text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Verified GSFC University Credential
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Cryptographically signed by GSFC Academic Affairs
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                  showQRModal.qrCodePayload
                )}&color=1A3C6E`}
                alt="Credential QR"
                className="mx-auto h-36 w-36 rounded-xl shadow-sm"
              />
              <p className="mt-3 font-mono text-[10px] text-slate-500 break-all">
                {showQRModal.verificationHash}
              </p>
            </div>

            <div className="mt-3 text-left rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
              <p className="font-bold text-slate-800">{showQRModal.title}</p>
              <p className="text-slate-500 mt-0.5">Awarded to: {showQRModal.userName} ({showQRModal.userRollNo})</p>
              <p className="text-slate-500">Verified on: {showQRModal.dateEarned}</p>
            </div>

            <button
              onClick={() => setShowQRModal(null)}
              className="mt-5 w-full rounded-xl bg-[#1A3C6E] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#255294] transition-colors"
            >
              Close Verification
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
