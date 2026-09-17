import React, { useState } from "react";
import {
  Building2,
  Camera,
  Compass,
  ExternalLink,
  Eye,
  Film,
  GraduationCap,
  Heart,
  Instagram,
  MapPin,
  Maximize2,
  Play,
  Share2,
  Sparkles,
  Users,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShortCampusTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterGuestPortal: () => void;
}

interface TourSpot {
  id: string;
  title: string;
  category: "Architecture" | "Innovation Lab" | "Academic" | "Student Life";
  location: string;
  description: string;
  image: string;
  badge: string;
  stats: string;
}

interface TourVideo {
  id: string;
  title: string;
  creator: string;
  instagramHandle: string;
  thumbnail: string;
  duration: string;
  views: string;
  likes: string;
  description: string;
  videoUrl?: string;
  instagramUrl: string;
}

export const ShortCampusTourModal: React.FC<ShortCampusTourModalProps> = ({
  isOpen,
  onClose,
  onEnterGuestPortal,
}) => {
  const [activeTab, setActiveTab] = useState<"gallery" | "videos" | "spots">("gallery");
  const [selectedSpotIndex, setSelectedSpotIndex] = useState(0);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  if (!isOpen) return null;

  const tourSpots: TourSpot[] = [
    {
      id: "spot-1",
      title: "GSFC University Main Academic Quad & Bhavan",
      category: "Architecture",
      location: "Fertilizernagar, P.O. Petrochemicals, Vadodara 391750",
      description:
        "The grand administrative and academic quad of GSFC University featuring contemporary eco-friendly glass and stone architecture, manicured gardens, and student walk-plazas.",
      image: "/images/tour/gsfc_main_bhavan.jpg",
      badge: "Main Landmark",
      stats: "40+ Acre Green Eco-Campus",
    },
    {
      id: "spot-2",
      title: "School of Technology AI & Robotics Innovation Labs",
      category: "Innovation Lab",
      location: "School of Technology (SOT), Block C - Level 2",
      description:
        "State-of-the-art engineering workstations, industrial robotic arms, IoT prototyping kits, and GPU computing nodes where students build cutting-edge automation projects.",
      image: "/images/tour/gsfc_ai_robotics_lab.jpg",
      badge: "Industry 4.0 Lab",
      stats: "200+ Workstations & Prototyping Benches",
    },
    {
      id: "spot-3",
      title: "Central Knowledge Resource Center & Digital Library",
      category: "Academic",
      location: "Vigyan Bhavan - Central Atrium",
      description:
        "Double-height modern study sanctuary housing over 25,000+ volumes, IEEE digital repositories, high-speed Wi-Fi research pods, and collaborative group discussion zones.",
      image: "/images/tour/gsfc_central_library.jpg",
      badge: "Digital Commons",
      stats: "25,000+ Physical & E-Resources",
    },
    {
      id: "spot-4",
      title: "Grand Cultural Amphitheatre & Open-Air Arena",
      category: "Student Life",
      location: "Central Campus Promenade",
      description:
        "Tiered open-air auditorium with a panoramic stage, hosting the annual Chrysalis Fest, music concerts, tech symposiums, drama troupe performances, and student assemblies.",
      image: "/images/tour/gsfc_amphitheatre.jpg",
      badge: "Student Hub",
      stats: "800+ Seating Capacity",
    },
  ];

  const tourVideos: TourVideo[] = [
    {
      id: "vid-1",
      title: "GSFC University Life & Campus Drone Walkthrough",
      creator: "GSFC University Official",
      instagramHandle: "@gsfcuniversity",
      thumbnail: "/images/tour/gsfc_main_bhavan.jpg",
      duration: "0:58",
      views: "24.5K",
      likes: "1.8K",
      description:
        "A breathtaking 4K aerial tour of the lush 40-acre campus, faculty buildings, hostels, and sports grounds in Vadodara.",
      instagramUrl: "https://www.instagram.com/gsfcuniversity/",
    },
    {
      id: "vid-2",
      title: "Chrysalis Annual Cultural Fest & Celebrity Concert",
      creator: "GSFC Student Council",
      instagramHandle: "@gsfcuniversity",
      thumbnail: "/images/tour/gsfc_amphitheatre.jpg",
      duration: "0:45",
      views: "18.2K",
      likes: "2.3K",
      description:
        "Highlights from Chrysalis: vibrant dance battles, rock band performances, EDM night, and art installations at the amphitheatre.",
      instagramUrl: "https://www.instagram.com/gsfcuniversity/",
    },
    {
      id: "vid-3",
      title: "HackGSFC & AI Hackathon Day in the Life",
      creator: "Coding & AI Club",
      instagramHandle: "@gsfcuniversity",
      thumbnail: "/images/tour/gsfc_ai_robotics_lab.jpg",
      duration: "1:12",
      views: "15.9K",
      likes: "1.4K",
      description:
        "36 hours of non-stop coding, mentors from GSFC Ltd & tech giants, pizza midnight hacks, and winning AI demos.",
      instagramUrl: "https://www.instagram.com/gsfcuniversity/",
    },
    {
      id: "vid-4",
      title: "Central Digital Library & Quiet Study Pods",
      creator: "Library & Learning Cell",
      instagramHandle: "@gsfcuniversity",
      thumbnail: "/images/tour/gsfc_central_library.jpg",
      duration: "0:38",
      views: "11.4K",
      likes: "890",
      description:
        "Experience the peace and high-speed research resources inside the double-height GSFC University Knowledge Commons.",
      instagramUrl: "https://www.instagram.com/gsfcuniversity/",
    },
  ];

  const currentSpot = tourSpots[selectedSpotIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md animate-fade-in">
      <div className="relative flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-950 text-white shadow-2xl">
        {/* Top Header Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-md shadow-amber-500/20">
              <Compass className="size-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base sm:text-lg font-black tracking-tight text-white">
                  GSFC University • Short Campus Tour
                </h2>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  HD 360°
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Fertilizernagar, Vadodara · 40+ Acre Sustainable Green Eco-Campus
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEnterGuestPortal}
              className="hidden h-8 gap-1.5 rounded-xl border-amber-500/40 bg-amber-500/10 text-xs font-bold text-[#F2A93B] hover:bg-amber-500/20 sm:flex"
            >
              <Sparkles className="size-3.5" />
              <span>Launch Live Portal</span>
            </Button>
            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-2 sm:px-6">
          <button
            onClick={() => setActiveTab("gallery")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
              activeTab === "gallery"
                ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/40"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
            )}
          >
            <Camera className="size-3.5 text-[#F2A93B]" />
            <span>Campus Photo Gallery (Copyright-Free)</span>
          </button>

          <button
            onClick={() => setActiveTab("videos")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
              activeTab === "videos"
                ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/40"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
            )}
          >
            <Instagram className="size-3.5 text-rose-400" />
            <span>Instagram Reels & Video Tour</span>
          </button>

          <button
            onClick={() => setActiveTab("spots")}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
              activeTab === "spots"
                ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/40"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
            )}
          >
            <MapPin className="size-3.5 text-emerald-400" />
            <span>Key Campus Landmarks</span>
          </button>
        </div>

        {/* Tab Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CAMPUS PHOTO GALLERY */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              {/* Featured Large Showcase */}
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 sm:aspect-[21/9]">
                  <img
                    src={currentSpot.image}
                    alt={currentSpot.title}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950">
                        {currentSpot.badge}
                      </span>
                      <span className="rounded-md bg-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300 backdrop-blur-md">
                        {currentSpot.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-300">
                        <MapPin className="size-3 text-amber-400" />
                        {currentSpot.location}
                      </span>
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                      {currentSpot.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-3xl">
                      {currentSpot.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thumbnails Navigation Grid */}
              <div>
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Click a Campus Spot to Explore:
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {tourSpots.map((spot, idx) => (
                    <button
                      key={spot.id}
                      onClick={() => setSelectedSpotIndex(idx)}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border text-left transition-all",
                        selectedSpotIndex === idx
                          ? "border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10"
                          : "border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-700"
                      )}
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-900">
                        <img
                          src={spot.image}
                          alt={spot.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-2.5 bg-slate-900/90">
                        <p className="text-[10px] font-bold text-amber-400">{spot.category}</p>
                        <p className="text-xs font-bold text-white line-clamp-1">{spot.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INSTAGRAM REELS & VIDEO TOUR */}
          {activeTab === "videos" && (
            <div className="space-y-6">
              {/* Instagram Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900 to-purple-950/40 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20">
                    <Instagram className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-black text-white">
                      Official GSFC University Reels & Videos
                    </h3>
                    <p className="text-xs text-slate-300">
                      Follow <strong>@gsfcuniversity</strong> for campus fests, hackathons, and student activities
                    </p>
                  </div>
                </div>

                <a
                  href="https://www.instagram.com/gsfcuniversity/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 px-4 py-2 text-xs font-black text-white hover:opacity-90"
                >
                  <Instagram className="size-3.5" />
                  <span>Open Instagram Page</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>

              {/* Video Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {tourVideos.map((vid) => (
                  <div
                    key={vid.id}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition-all hover:border-slate-700"
                  >
                    <div className="relative aspect-video w-full bg-slate-950 group">
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <a
                          href={vid.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex size-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-[#F2A93B] hover:text-slate-950"
                        >
                          <Play className="ml-1 size-5 fill-current" />
                        </a>
                      </div>

                      {/* Video Badges */}
                      <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white">
                        {vid.duration}
                      </span>
                      <span className="absolute top-2 left-2 rounded-md bg-rose-600/90 px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                        <Instagram className="size-3" /> Reel
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>{vid.creator}</span>
                        <span className="text-amber-400 font-bold">👁️ {vid.views}</span>
                      </div>
                      <h4 className="font-display text-sm font-black text-white">
                        {vid.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                        {vid.description}
                      </p>

                      <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800/80">
                        <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                          <Heart className="size-3 fill-current" /> {vid.likes} Likes
                        </span>
                        <a
                          href={vid.instagramUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#F2A93B] hover:underline flex items-center gap-1"
                        >
                          Watch on Instagram <ExternalLink className="size-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: KEY CAMPUS SPOTS & HIGHLIGHTS */}
          {activeTab === "spots" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {tourSpots.map((spot) => (
                <div
                  key={spot.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-4"
                >
                  <div className="flex gap-3.5">
                    <img
                      src={spot.image}
                      alt={spot.title}
                      className="size-20 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                        {spot.category}
                      </span>
                      <h4 className="mt-1 font-display text-sm font-black text-white">
                        {spot.title}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-2">
                        {spot.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
                    <span className="text-slate-400">{spot.stats}</span>
                    <button
                      onClick={() => {
                        setSelectedSpotIndex(tourSpots.findIndex((s) => s.id === spot.id));
                        setActiveTab("gallery");
                      }}
                      className="font-bold text-[#F2A93B] hover:underline flex items-center gap-1"
                    >
                      <Eye className="size-3.5" /> View Photo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Footer Actions */}
        <div className="flex shrink-0 flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 bg-slate-900/90 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <GraduationCap className="size-4 text-amber-500" />
            <span>GSFC University · An Initiative of GSFC Ltd & Gujarat State</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-9 flex-1 sm:flex-initial rounded-xl border-slate-700 bg-slate-800 text-xs font-bold text-white hover:bg-slate-700"
            >
              Close Tour
            </Button>
            <Button
              onClick={() => {
                onClose();
                onEnterGuestPortal();
              }}
              className="h-9 flex-1 sm:flex-initial rounded-xl bg-gradient-to-r from-[#1A3C6E] to-[#0E2342] font-display text-xs font-black text-[#F2A93B] hover:opacity-90 shadow-md"
            >
              <Sparkles className="mr-1.5 size-3.5" />
              <span>Enter Portal as Student / Guest</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
