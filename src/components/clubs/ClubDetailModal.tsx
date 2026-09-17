import React, { useState } from "react";
import {
  X,
  Users,
  Calendar,
  Building,
  GraduationCap,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  Clock,
  Tag,
  Plus,
} from "lucide-react";
import { Club, ClubMember, ClubActivity } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";

interface ClubDetailModalProps {
  club: Club | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClubDetailModal: React.FC<ClubDetailModalProps> = ({
  club,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"about" | "activities" | "members">("about");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen || !club) return null;

  const state = campusStore.getState();
  const user = state.currentUser;
  const isMember = state.clubMembers.some(
    (m) => m.clubId === club.id && m.userId === user.id
  );
  const myMembership = state.clubMembers.find(
    (m) => m.clubId === club.id && m.userId === user.id
  );
  const clubMembers = state.clubMembers.filter((m) => m.clubId === club.id);
  const clubActivities = state.clubActivities.filter((a) => a.clubId === club.id);

  const handleJoin = () => {
    const res = campusStore.joinClub(club.id, "member");
    setStatusMessage(res.message);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleLeave = () => {
    const res = campusStore.leaveClub(club.id);
    setStatusMessage(res.message);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
        {/* Banner with Logo Header */}
        <div className="relative h-44 w-full bg-slate-800 flex-shrink-0">
          <img
            src={club.bannerImage}
            alt={club.name}
            className="h-full w-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-lg border-2 border-white/80">
                {club.logo}
              </div>
              <div className="text-white">
                <span className="rounded-md bg-[#F2A93B] px-2 py-0.5 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  {club.category}
                </span>
                <h2 className="mt-1 text-xl sm:text-2xl font-black">{club.name}</h2>
                <p className="text-xs text-slate-300 font-medium">
                  {club.department} · Founded {club.foundedYear}
                </p>
              </div>
            </div>

            {isMember ? (
              <button
                onClick={handleLeave}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-400/30 px-3.5 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition-colors"
              >
                Leave Club
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1A3C6E] to-[#255294] border border-blue-400/40 px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 transition-all"
              >
                <Plus className="h-4 w-4 text-[#F2A93B]" /> Join Community
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 pt-3 bg-slate-50/50">
          {(["about", "activities", "members"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 text-xs font-bold capitalize transition-all border-b-2 ${
                activeTab === tab
                  ? "border-[#1A3C6E] text-[#1A3C6E]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab === "about"
                ? "Overview & Faculty"
                : tab === "activities"
                ? `Events & Workshops (${clubActivities.length})`
                : `Active Members (${club.memberCount})`}
            </button>
          ))}
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="mx-6 mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {statusMessage}
          </div>
        )}

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "about" && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  About Community
                </h3>
                <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
                  {club.description}
                </p>
              </div>

              {/* Meeting Schedule */}
              <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-3.5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A3C6E] text-white">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    Weekly Meeting & Meetup Schedule
                  </span>
                  <p className="text-xs font-bold text-[#1A3C6E]">{club.meetingSchedule}</p>
                </div>
              </div>

              {/* Leadership & Faculty Coordination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <GraduationCap className="h-4 w-4 text-[#1A3C6E]" />
                    Faculty Coordinator
                  </div>
                  <p className="mt-1 font-bold text-slate-900 text-sm">
                    {club.facultyCoordinator.name}
                  </p>
                  <p className="text-xs text-slate-500">{club.facultyCoordinator.department}</p>
                  <a
                    href={`mailto:${club.facultyCoordinator.email}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <Mail className="h-3 w-3" /> {club.facultyCoordinator.email}
                  </a>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                    <ShieldCheck className="h-4 w-4 text-amber-500" />
                    Student Lead & Convener
                  </div>
                  <p className="mt-1 font-bold text-slate-900 text-sm">
                    {club.studentLead.name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">Roll: {club.studentLead.rollNo}</p>
                  <a
                    href={`mailto:${club.studentLead.email}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <Mail className="h-3 w-3" /> {club.studentLead.email}
                  </a>
                </div>
              </div>

              {/* Focus Tags */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Key Focus Areas & Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {club.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "activities" && (
            <div className="space-y-3">
              {clubActivities.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">
                  No upcoming activities scheduled for this club yet.
                </p>
              ) : (
                clubActivities.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#1A3C6E]">
                          {act.date}
                        </span>
                        <span className="text-[10px] text-slate-400">{act.time}</span>
                      </div>
                      <h4 className="mt-1 font-bold text-slate-900 text-sm">{act.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                      <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                        📍 <strong>{act.venue}</strong> · {act.attendanceCount} participants attended
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                <span>Active Registered Members</span>
                <span>{club.memberCount} Members</span>
              </div>
              {clubMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A3C6E]/10 text-[#1A3C6E] font-bold text-xs">
                      {member.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{member.userName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{member.userRollNo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        member.role === "lead"
                          ? "bg-amber-100 text-amber-800"
                          : member.role === "committee"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-[#1A3C6E]"
                      }`}
                    >
                      {member.role}
                    </span>
                    {member.volunteerHoursEarned > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {member.volunteerHoursEarned}h logged
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Join / Leave Bottom Bar */}
        <div className="border-t border-slate-100 p-4 sm:hidden bg-slate-50">
          {isMember ? (
            <button
              onClick={handleLeave}
              className="w-full rounded-xl bg-rose-50 border border-rose-200 py-2.5 text-xs font-bold text-rose-700"
            >
              Leave Club
            </button>
          ) : (
            <button
              onClick={handleJoin}
              className="w-full rounded-xl bg-[#1A3C6E] py-2.5 text-xs font-bold text-white shadow-md"
            >
              Join Community
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
