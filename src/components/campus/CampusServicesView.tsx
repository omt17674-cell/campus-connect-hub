import React, { useState } from "react";
import {
  Building2,
  Search,
  Phone,
  Mail,
  Clock,
  MapPin,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  BookOpen,
  Cpu,
  HeartPulse,
  ExternalLink,
} from "lucide-react";
import { CampusService } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";

export const CampusServicesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const state = campusStore.getState();
  const services = state.services;

  const categories = [
    { id: "all", label: "All Facilities & Offices" },
    { id: "administrative", label: "Administrative & TPC" },
    { id: "academic", label: "Labs & Academic Wings" },
    { id: "facility", label: "Library & Student Amenities" },
    { id: "emergency", label: "Emergency & Health/Security" },
  ];

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case "Briefcase":
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      case "GraduationCap":
        return <GraduationCap className="h-5 w-5 text-indigo-600" />;
      case "BookOpen":
        return <BookOpen className="h-5 w-5 text-amber-600" />;
      case "Cpu":
        return <Cpu className="h-5 w-5 text-emerald-600" />;
      case "HeartPulse":
        return <HeartPulse className="h-5 w-5 text-rose-600" />;
      case "ShieldCheck":
        return <ShieldCheck className="h-5 w-5 text-purple-600" />;
      default:
        return <Building2 className="h-5 w-5 text-[#1A3C6E]" />;
    }
  };

  const filteredServices = services.filter((srv) => {
    const matchesCategory =
      selectedCategory === "all" || srv.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.headPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase());
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
                Campus Directory & Wayfinding
              </span>
              <span className="text-xs text-blue-200">Official University Directory</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campus Services & Facilities
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl">
              Locate campus administrative offices, Training & Placement Cell, Innovation Labs, 24x7 Health Center, and Library amenities.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/15 text-center">
            <span className="block text-2xl font-black text-[#F2A93B]">{services.length}</span>
            <span className="text-[10px] text-blue-200 font-semibold uppercase">Key Helpdesks</span>
          </div>
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
            placeholder="Search departments & offices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((srv) => (
          <div
            key={srv.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-[#1A3C6E]/40 hover:shadow-xl transition-all duration-300"
          >
            <div>
              {/* Header with Icon */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                  {getServiceIcon(srv.iconName)}
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    srv.category === "emergency"
                      ? "bg-rose-100 text-rose-800"
                      : srv.category === "administrative"
                      ? "bg-blue-100 text-[#1A3C6E]"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {srv.category}
                </span>
              </div>

              <h3 className="mt-4 text-base font-black text-slate-900 group-hover:text-[#1A3C6E] transition-colors">
                {srv.name}
              </h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {srv.description}
              </p>

              {/* Location & Time Info */}
              <div className="mt-4 space-y-2 rounded-2xl bg-slate-50/80 p-3 text-xs border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-[#1A3C6E] flex-shrink-0" />
                  <span>{srv.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                  <span>{srv.openingHours}</span>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500">
                In-charge: <strong className="text-slate-800">{srv.headPerson}</strong>
              </div>
            </div>

            {/* Direct Action Contact Buttons */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <a
                href={`tel:${srv.contactPhone}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-[#1A3C6E] hover:text-white transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
              <a
                href={`mailto:${srv.contactEmail}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-xs font-bold text-[#1A3C6E] hover:bg-[#1A3C6E] hover:text-white transition-colors"
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
