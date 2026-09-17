import React, { useState } from "react";
import {
  Bell,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Building,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Filter,
  Search,
} from "lucide-react";
import { CampusAnnouncement } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";

export const CampusFeedView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<CampusAnnouncement["category"]>("university");
  const [newPriority, setNewPriority] = useState<CampusAnnouncement["priority"]>("normal");

  const state = campusStore.getState();
  const user = state.currentUser;
  const isAuthorizedToPost = state.currentRole === "admin" || state.currentRole === "organizer";
  const announcements = state.announcements;

  const categories = [
    { id: "all", label: "All Notices" },
    { id: "university", label: "University & Exams" },
    { id: "placement", label: "TPC Placements" },
    { id: "emergency", label: "Campus Security" },
    { id: "club", label: "Clubs & Events" },
  ];

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesCategory =
      selectedCategory === "all" || ann.category === selectedCategory;
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    campusStore.postAnnouncement({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      authorName: user.name,
      authorRole: state.currentRole === "admin" ? "Dean / Admin" : "Faculty Coordinator",
      departmentTarget: "all",
      priority: newPriority,
    });

    setNewTitle("");
    setNewContent("");
    setShowPostModal(false);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "placement":
        return <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-[#1A3C6E]">Placement Cell (TPC)</span>;
      case "emergency":
        return <span className="rounded-md bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-800">Campus Security & Safety</span>;
      case "club":
        return <span className="rounded-md bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800">Student Club Society</span>;
      default:
        return <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">Academic Governance</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A3C6E] via-[#255294] to-[#0e2547] p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#F2A93B]/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#F2A93B] px-2 py-0.5 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                Official Campus Bulletins
              </span>
              <span className="text-xs text-blue-200">Broadcast Feed</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campus Feed & Circulars
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl">
              Verified institutional announcements from Academic Governance, Training & Placement Cell, and Campus Operations.
            </p>
          </div>

          {isAuthorizedToPost && (
            <button
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#F2A93B] to-[#e09b30] px-5 py-3 text-xs font-black text-slate-950 shadow-lg hover:brightness-110 transition-all flex-shrink-0"
            >
              <Plus className="h-4 w-4" /> Publish Circular
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search circulars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
          />
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-700">No circulars found</p>
            <p className="text-xs text-slate-400">
              No institutional circulars match your current search or category filter.
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const isRead = ann.readBy.includes(user.id);
            const isEmergency = ann.priority === "emergency";
            const isImportant = ann.priority === "important";

            return (
              <div
                key={ann.id}
                className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 ${
                  isEmergency
                    ? "border-rose-300 bg-rose-50/50 shadow-md ring-1 ring-rose-300"
                    : isImportant
                    ? "border-amber-200 bg-amber-50/30 shadow-sm"
                    : "border-slate-200 bg-white shadow-sm hover:border-[#1A3C6E]/40"
                }`}
              >
                {/* Emergency banner bar if urgent */}
                {isEmergency && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    <AlertTriangle className="h-4 w-4" /> HIGH-PRIORITY SECURITY NOTIFICATION
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getCategoryBadge(ann.category)}
                    {isImportant && !isEmergency && (
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        IMPORTANT
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ann.createdAt).toLocaleDateString()} at {new Date(ann.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <button
                    onClick={() => campusStore.markAnnouncementRead(ann.id)}
                    className="self-start text-[11px] font-semibold text-slate-500 hover:text-[#1A3C6E] flex items-center gap-1"
                  >
                    {isRead ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Read
                      </span>
                    ) : (
                      <span className="text-blue-600 font-bold">Mark as Read</span>
                    )}
                  </button>
                </div>

                <h3 className="mt-3 text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {ann.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>

                {/* Footer Signature */}
                <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A3C6E]/10 text-[#1A3C6E] font-bold text-[10px]">
                      {ann.authorName.slice(0, 1)}
                    </div>
                    <span>
                      Issued by <strong className="text-slate-800">{ann.authorName}</strong> ({ann.authorRole})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Target: {ann.departmentTarget.toUpperCase()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Publish Circular Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-black text-slate-900">
              Publish Institutional Circular
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Broadcast an official announcement to students and faculty.
            </p>

            <form onSubmit={handlePostAnnouncement} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Circular Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End-Semester Exam Schedule & Hall Ticket Clearance"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                  >
                    <option value="university">University & Academic</option>
                    <option value="placement">Placement (TPC)</option>
                    <option value="emergency">Emergency / Security</option>
                    <option value="club">Clubs & Societies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="emergency">Emergency / Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Announcement Details
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide full circular text, instructions, deadlines, and contact details..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#1A3C6E] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#255294] transition-colors"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
