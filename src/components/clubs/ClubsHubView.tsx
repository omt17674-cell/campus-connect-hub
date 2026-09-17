import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Building,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Filter,
} from "lucide-react";
import { Club } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import { ClubDetailModal } from "./ClubDetailModal";

export const ClubsHubView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  const state = campusStore.getState();
  const user = state.currentUser;
  const clubs = state.clubs;

  const categories = [
    { id: "all", label: "All Communities" },
    { id: "Technical", label: "Technical & Coding" },
    { id: "Cultural", label: "Cultural & Arts" },
    { id: "Entrepreneurship", label: "E-Cell & Startups" },
    { id: "Sports", label: "Sports & Athletics" },
    { id: "Social & NSS", label: "NSS & Social Action" },
  ];

  const filteredClubs = clubs.filter((c) => {
    const matchesCategory =
      selectedCategory === "all" || c.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A3C6E] via-[#255294] to-[#0e2547] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#F2A93B]/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#F2A93B] px-2 py-0.5 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                Student Life & Leadership
              </span>
              <span className="text-xs text-blue-200">Recognized Communities</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
              Clubs & Communities Hub
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl">
              Join student-led societies, organize national hackathons, perform in cultural conclaves, and earn verified volunteer hours under faculty mentorship.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 text-center">
              <span className="block text-2xl font-black text-[#F2A93B]">{clubs.length}</span>
              <span className="text-[10px] text-blue-200 font-semibold uppercase">Chartered Clubs</span>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 text-center">
              <span className="block text-2xl font-black text-emerald-400">
                {state.clubMembers.filter((m) => m.userId === user.id).length}
              </span>
              <span className="text-[10px] text-blue-200 font-semibold uppercase">Joined by You</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#1A3C6E] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clubs & tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
          />
        </div>
      </div>

      {/* Clubs Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClubs.map((club) => {
          const isMember = state.clubMembers.some(
            (m) => m.clubId === club.id && m.userId === user.id
          );

          return (
            <div
              key={club.id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm hover:border-[#1A3C6E]/40 hover:shadow-xl transition-all duration-300"
            >
              {/* Card Image Banner */}
              <div className="relative h-36 w-full overflow-hidden bg-slate-800">
                <img
                  src={club.bannerImage}
                  alt={club.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="rounded-lg bg-black/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/10">
                    {club.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-2xl shadow-md border border-white/60">
                      {club.logo}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-300 font-semibold block">Founded {club.foundedYear}</span>
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        <Users className="h-3 w-3 text-[#F2A93B]" /> {club.memberCount} Members
                      </span>
                    </div>
                  </div>

                  {isMember && (
                    <span className="rounded-full bg-emerald-500/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Member
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#1A3C6E] transition-colors">
                    {club.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-slate-600 leading-relaxed">
                    {club.description}
                  </p>

                  <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 border border-slate-100 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#1A3C6E] flex-shrink-0" />
                    <span className="truncate">{club.meetingSchedule}</span>
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {club.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        #{t}
                      </span>
                    ))}
                    {club.tags.length > 3 && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">
                        +{club.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Button */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[10px] text-slate-500">
                    Lead: <strong className="text-slate-700">{club.studentLead.name}</strong>
                  </div>
                  <button
                    onClick={() => setSelectedClub(club)}
                    className="flex items-center gap-1 rounded-xl bg-[#1A3C6E] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#255294] transition-colors"
                  >
                    View Community <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Club Detail Modal */}
      <ClubDetailModal
        club={selectedClub}
        isOpen={Boolean(selectedClub)}
        onClose={() => setSelectedClub(null)}
      />
    </div>
  );
};
