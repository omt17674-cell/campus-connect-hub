import { useState } from "react";
import { Calendar, Clock, Image as ImageIcon, MapPin, Plus, Sparkles, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { EventCategory } from "@/lib/types";
import { campusStore } from "@/lib/campus-store";
import { GeoapifyAddressSearch } from "@/components/common/GeoapifyAddressSearch";
import { toast } from "sonner";

interface CreateEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_BANNERS = [
  { label: "Tech Hackathon", url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80" },
  { label: "Culture & Dance", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80" },
  { label: "Sports Match", url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80" },
  { label: "Career & Leadership", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80" },
  { label: "Workshop UI/UX", url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80" },
];

export function CreateEventModal({ onClose, onSuccess }: CreateEventModalProps) {
  const currentUser = campusStore.getState().currentUser;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("Tech");
  const [department, setDepartment] = useState("Computer Science");
  const [date, setDate] = useState("2026-06-25");
  const [time, setTime] = useState("10:00 AM - 01:00 PM");
  const [venue, setVenue] = useState("Innovation Lab, Block C");
  const [capacity, setCapacity] = useState(100);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [isTeamEvent, setIsTeamEvent] = useState(false);
  const [minTeamSize, setMinTeamSize] = useState(2);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [volunteerHoursReward, setVolunteerHoursReward] = useState(4);
  const [bannerImage, setBannerImage] = useState(PRESET_BANNERS[0].url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    await campusStore.createEvent({
      title,
      description,
      category,
      department,
      date,
      time,
      venue,
      capacity: Number(capacity),
      approvalRequired,
      isTeamEvent,
      minTeamSize: isTeamEvent ? Number(minTeamSize) : undefined,
      maxTeamSize: isTeamEvent ? Number(maxTeamSize) : undefined,
      volunteerHoursReward: Number(volunteerHoursReward),
      organizerName: currentUser.name,
      organizerEmail: currentUser.email,
      bannerImage,
      rules: [
        "Please bring your valid GSFC Student ID card.",
        "Attend at least 80% of the session duration for verified certificate issuance.",
      ],
    });

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Plus className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-xl font-black text-foreground">
              Create Campus Event
            </h3>
            <p className="text-xs text-muted-foreground">
              Submit a new workshop, hackathon, or university seminar
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Title */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Event Title *
            </Label>
            <Input
              required
              placeholder="e.g. Next-Gen Agentic AI & Robotics Summit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 rounded-xl"
            />
          </div>

          {/* Category & Department */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Category
              </Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="mt-1 flex h-10 w-full rounded-xl border border-border/70 bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="Tech">Tech</option>
                <option value="Culture">Culture</option>
                <option value="Sports">Sports</option>
                <option value="Leadership">Leadership</option>
                <option value="Academic">Academic</option>
                <option value="Career">Career</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Target Department
              </Label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-xl border border-border/70 bg-card px-3 text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="All Departments">All Departments (Open Campus)</option>
                <option value="Computer Science">Computer Science & Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Management">School of Management</option>
                <option value="Applied Sciences">Applied Sciences</option>
              </select>
            </div>
          </div>

          {/* Date, Time, Venue */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Event Date
              </Label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 rounded-xl text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Timing
              </Label>
              <Input
                required
                placeholder="10:00 AM - 01:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 rounded-xl text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Campus Venue / Location
                </Label>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Geoapify GPS Search
                </span>
              </div>
              <GeoapifyAddressSearch
                value={venue}
                placeholder="Search venue or address (e.g. Vigyan Bhavan Hall, GSFC)..."
                onSelectLocation={(loc) => {
                  setVenue(loc.name || loc.formatted.split(",")[0]);
                }}
                className="mt-1"
              />
            </div>
          </div>

          {/* Capacity & Volunteer Hours */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Seat Capacity Limit
              </Label>
              <Input
                type="number"
                min="10"
                max="1000"
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="mt-1 rounded-xl text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Volunteer Service Credit (Hours)
              </Label>
              <Input
                type="number"
                min="0"
                max="20"
                value={volunteerHoursReward}
                onChange={(e) => setVolunteerHoursReward(Number(e.target.value))}
                className="mt-1 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Event Description *
            </Label>
            <Textarea
              required
              placeholder="Provide event objectives, schedule outline, and benefits..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 rounded-xl text-xs"
            />
          </div>

          {/* Banner Preset Selector */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Banner Image
            </Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {PRESET_BANNERS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setBannerImage(preset.url)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    bannerImage === preset.url
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border/70 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Toggles */}
          <div className="space-y-3 rounded-2xl border border-border/70 bg-card/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">
                  Require Organizer Approval for Registrations
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Review student applications before confirming seat
                </p>
              </div>
              <Switch
                checked={approvalRequired}
                onCheckedChange={setApprovalRequired}
              />
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <div>
                <p className="text-xs font-bold text-foreground">
                  Team / Group Event
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Allow students to register under a team name with multiple member IDs
                </p>
              </div>
              <Switch
                checked={isTeamEvent}
                onCheckedChange={setIsTeamEvent}
              />
            </div>

            {isTeamEvent && (
              <div className="mt-2 grid grid-cols-2 gap-3 border-t border-border/60 pt-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground">Min Team Members</Label>
                  <Input
                    type="number"
                    min="2"
                    max="10"
                    value={minTeamSize}
                    onChange={(e) => setMinTeamSize(Number(e.target.value))}
                    className="mt-1 h-8 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Max Team Members</Label>
                  <Input
                    type="number"
                    min="2"
                    max="12"
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                    className="mt-1 h-8 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-[#1A3C6E] text-white hover:bg-[#1A3C6E]/90 font-bold"
            >
              Publish Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
