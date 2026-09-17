import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Download,
  FileDown,
  LayoutDashboard,
  MapPin,
  Menu,
  Moon,
  QrCode,
  ScanLine,
  Search,
  ShieldCheck,
  Sun,
  TicketCheck,
  UserRound,
  Users,
  WifiOff,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Connect — GSFC University" },
      { name: "description", content: "GSFC University's event and attendance hub for students, organizers, and administrators." },
      { property: "og:title", content: "Campus Connect — GSFC University" },
      { property: "og:description", content: "Discover campus events, manage registrations, and check in with confidence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampusConnect,
});

type Role = "student" | "organizer" | "admin";
type StudentView = "home" | "events" | "scan" | "notifications" | "profile";

type CampusEvent = {
  id: number;
  month: string;
  day: string;
  category: string;
  title: string;
  detail: string;
  location: string;
  organizer: string;
  seats: string;
  status?: "registered" | "waitlisted";
};

const eventSeed: CampusEvent[] = [
  {
    id: 1,
    month: "JUN",
    day: "12",
    category: "Tech",
    title: "AI & Robotics Hackathon",
    detail: "10:00 AM · Innovation Lab, Block C · Dr. S. Rao",
    location: "Innovation Lab, Block C",
    organizer: "Computer Science Department",
    seats: "18 seats left",
  },
  {
    id: 2,
    month: "JUN",
    day: "14",
    category: "Culture",
    title: "Cultural Fest — Navratri Open Day",
    detail: "4:30 PM · Main Auditorium · Culture Club",
    location: "Main Auditorium",
    organizer: "Culture Club",
    seats: "42 seats left",
  },
  {
    id: 3,
    month: "JUN",
    day: "16",
    category: "Sports",
    title: "Inter-Faculty Football Cup",
    detail: "3:00 PM · Sports Grounds · Athletics Dept",
    location: "Sports Grounds",
    organizer: "Athletics Department",
    seats: "Capacity reached",
    status: "waitlisted",
  },
  {
    id: 4,
    month: "JUN",
    day: "19",
    category: "Leadership",
    title: "Prayaas Leadership Forum",
    detail: "11:00 AM · Seminar Hall A · Student Affairs",
    location: "Seminar Hall A",
    organizer: "Student Affairs Office",
    seats: "64 seats left",
  },
];

const navItems: Array<{ id: StudentView; label: string; icon: typeof CalendarDays }> = [
  { id: "home", label: "Home", icon: CalendarDays },
  { id: "events", label: "My Events", icon: TicketCheck },
  { id: "scan", label: "Scan", icon: ScanLine },
  { id: "notifications", label: "Alerts", icon: Bell },
  { id: "profile", label: "Profile", icon: UserRound },
];

function CampusConnect() {
  const [role, setRole] = useState<Role>("student");
  const [view, setView] = useState<StudentView>("home");
  const [events, setEvents] = useState(eventSeed);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [scanState, setScanState] = useState<"ready" | "success">("ready");
  const [isDark, setIsDark] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);

  const registeredCount = useMemo(() => events.filter((event) => event.status === "registered").length, [events]);

  const switchRole = (nextRole: Role) => {
    setRole(nextRole);
    setSelectedEvent(null);
    setScanState("ready");
    if (nextRole !== "student") return;
    setView("home");
  };

  const register = (id: number) => {
    setEvents((current) => current.map((event) => (event.id === id ? { ...event, status: "registered" } : event)));
  };

  const activeNav = role === "student" ? view : role;

  return (
    <div className={cn("campus-app min-h-screen overflow-hidden", isDark && "dark")}>
      <div className="campus-wash pointer-events-none fixed inset-0" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1240px] flex-col px-5 py-5 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-brand text-primary-foreground shadow-lg shadow-brand/30" aria-label="GSFC University logo placeholder">
              <span className="font-display text-lg font-bold">GC</span>
            </div>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand/60">GSFC University</p>
              <p className="font-display text-lg font-extrabold text-brand-deep">Campus Connect</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 backdrop-blur-xl sm:flex">
              <span className="size-2 rounded-full bg-accent" />
              <span className="text-xs font-semibold text-brand-deep">Signed in · Aarav Mehta · S062</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsDark((current) => !current)} aria-label={isDark ? "Use light theme" : "Use dark theme"} className="rounded-full text-brand-deep hover:bg-card/70">
              {isDark ? <Sun /> : <Moon />}
            </Button>
            <div className="grid size-10 place-items-center rounded-full bg-brand-deep/10 text-sm font-bold text-brand-deep">AM</div>
          </div>
        </header>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card/60 p-1 backdrop-blur-xl" aria-label="Choose workspace">
            {(["student", "organizer", "admin"] as Role[]).map((item) => (
              <Button key={item} variant="ghost" size="sm" onClick={() => switchRole(item)} className={cn("rounded-full px-3 text-xs capitalize text-brand/70 hover:bg-brand/10 hover:text-brand-deep", role === item && "bg-brand text-primary-foreground hover:bg-brand/90 hover:text-primary-foreground")}>
                {item}
              </Button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-xl">
            <WifiOff className="size-3.5 text-accent" />
            <span>Offline mode · 2 check-ins queued</span>
          </div>
        </div>

        {role === "student" ? (
          <StudentWorkspace
            view={view}
            setView={setView}
            events={events}
            registeredCount={registeredCount}
            register={register}
            onSelectEvent={setSelectedEvent}
            scanState={scanState}
            setScanState={setScanState}
          />
        ) : role === "organizer" ? (
          <OrganizerWorkspace qrGenerated={qrGenerated} setQrGenerated={setQrGenerated} />
        ) : (
          <AdminWorkspace />
        )}
      </div>

      {selectedEvent ? (
        <EventDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} onRegister={register} />
      ) : null}
    </div>
  );
}

function StudentWorkspace({
  view,
  setView,
  events,
  registeredCount,
  register,
  onSelectEvent,
  scanState,
  setScanState,
}: {
  view: StudentView;
  setView: (view: StudentView) => void;
  events: CampusEvent[];
  registeredCount: number;
  register: (id: number) => void;
  onSelectEvent: (event: CampusEvent) => void;
  scanState: "ready" | "success";
  setScanState: (state: "ready" | "success") => void;
}) {
  return (
    <>
      <main className="mt-6 grid flex-1 grid-cols-1 gap-5 pb-20 lg:grid-cols-[1.35fr_1fr] lg:pb-5">
        <section className="flex min-w-0 flex-col gap-5">
          <div className="hidden items-center gap-2 lg:flex">
            {navItems.slice(0, 4).map((item) => <NavPill key={item.id} item={item} active={view === item.id} onClick={() => setView(item.id)} />)}
          </div>
          {view === "home" ? <HomeView events={events} onSelectEvent={onSelectEvent} onRegister={register} /> : null}
          {view === "events" ? <MyEventsView events={events} registeredCount={registeredCount} onSelectEvent={onSelectEvent} /> : null}
          {view === "scan" ? <ScanView scanState={scanState} setScanState={setScanState} /> : null}
          {view === "notifications" ? <NotificationsView /> : null}
          {view === "profile" ? <ProfileView /> : null}
        </section>
        <StudentAside view={view} setView={setView} events={events} onSelectEvent={onSelectEvent} scanState={scanState} setScanState={setScanState} />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-card/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-lg backdrop-blur-2xl lg:hidden" aria-label="Student navigation">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {navItems.map((item) => <NavPill key={item.id} item={item} active={view === item.id} onClick={() => setView(item.id)} mobile />)}
        </div>
      </nav>
    </>
  );
}

function NavPill({ item, active, onClick, mobile = false }: { item: { id: StudentView; label: string; icon: typeof CalendarDays }; active: boolean; onClick: () => void; mobile?: boolean }) {
  const Icon = item.icon;
  return <Button variant="ghost" onClick={onClick} className={cn("rounded-full px-3 text-[11px] font-bold uppercase tracking-wider text-brand/70 hover:bg-brand/10 hover:text-brand-deep", active && "bg-brand text-primary-foreground hover:bg-brand/90 hover:text-primary-foreground", mobile && "h-auto flex-col gap-1 px-1 py-1.5 text-[9px] tracking-normal") }><Icon className={cn(mobile ? "size-4" : "size-3.5")} />{item.label}</Button>;
}

function HomeView({ events, onSelectEvent, onRegister }: { events: CampusEvent[]; onSelectEvent: (event: CampusEvent) => void; onRegister: (id: number) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand/60">This week at campus</p><h1 className="mt-1 font-display text-3xl font-extrabold leading-none text-brand-deep sm:text-4xl">Upcoming Events</h1></div>
        <span className="whitespace-nowrap rounded-full bg-accent/15 px-3 py-1.5 text-xs font-bold text-brand-deep">5 live</span>
      </div>
      <div className="flex flex-col gap-3">
        {events.slice(0, 3).map((event) => <EventRow key={event.id} event={event} onSelect={() => onSelectEvent(event)} onRegister={() => onRegister(event.id)} />)}
      </div>
      <div className="rounded-3xl border border-border/70 bg-card/55 p-5 shadow-xl shadow-brand/10 backdrop-blur-2xl sm:p-6">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand/60">Stay in the loop</p><h2 className="mt-1 font-display text-xl font-extrabold text-brand-deep">Find your next campus moment</h2></div><Search className="size-5 text-brand/50" /></div>
        <div className="mt-4 flex flex-wrap gap-2">{["All events", "Tech", "Culture", "Sports", "Leadership"].map((filter, index) => <Button key={filter} variant="outline" size="sm" className={cn("rounded-full border-border/70 bg-card/50 text-xs text-brand/70", index === 0 && "border-brand bg-brand/10 text-brand-deep")}>{filter}</Button>)}</div>
      </div>
    </div>
  );
}

function EventRow({ event, onSelect, onRegister }: { event: CampusEvent; onSelect: () => void; onRegister: () => void }) {
  const isRegistered = event.status === "registered";
  const isWaitlisted = event.status === "waitlisted";
  return <div className="group flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/65 p-4 backdrop-blur-xl transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center">
    <Button variant="ghost" onClick={onSelect} className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-deep px-0 text-primary-foreground hover:bg-brand-deep/90"><span className="text-center font-display text-[10px] font-semibold leading-tight">{event.day}<br />{event.month}</span></Button>
    <button type="button" className="min-w-0 flex-1 text-left" onClick={onSelect}><div className="flex items-center gap-2"><span className="rounded-md bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-deep">{event.category}</span><span className={cn("rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand", isWaitlisted && "bg-accent/25 text-brand-deep")}>{isWaitlisted ? "Waitlisted" : event.seats}</span></div><h3 className="mt-1.5 truncate text-base font-bold text-foreground">{event.title}</h3><p className="truncate text-xs text-muted-foreground">{event.detail}</p></button>
    <Button onClick={onRegister} variant={isRegistered || isWaitlisted ? "outline" : "default"} size="sm" className={cn("shrink-0 rounded-xl px-4", isRegistered && "border-success/30 bg-success/10 text-success hover:bg-success/15", isWaitlisted && "border-brand/25 bg-card/60 text-brand")} disabled={isRegistered}>{isRegistered ? <><Check /> Registered</> : isWaitlisted ? "Join waitlist" : "Register"}</Button>
  </div>;
}

function StudentAside({ view, setView, events, onSelectEvent, scanState, setScanState }: { view: StudentView; setView: (view: StudentView) => void; events: CampusEvent[]; onSelectEvent: (event: CampusEvent) => void; scanState: "ready" | "success"; setScanState: (state: "ready" | "success") => void }) {
  return <section className="flex flex-col gap-5">{view === "home" ? <><AttendanceCard /><QuickScanCard onClick={() => setView("scan")} scanState={scanState} /><NotificationsCard /></> : view === "scan" ? <AttendanceCard /> : <><QuickScanCard onClick={() => setView("scan")} scanState={scanState} /><NotificationsCard /><MiniEventCard events={events} onSelectEvent={onSelectEvent} /></>}</section>;
}

function AttendanceCard() {
  return <div className="rounded-3xl border border-border/70 bg-card/55 p-6 shadow-xl shadow-brand/10 backdrop-blur-2xl"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-extrabold text-brand-deep">Attendance</h2><span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand">Semester 6</span></div><div className="mt-4 flex items-center gap-5"><div className="attendance-ring grid size-24 shrink-0 place-items-center rounded-full"><div className="grid size-[84px] place-items-center rounded-full bg-card/85 backdrop-blur-xl"><span className="font-display text-2xl font-extrabold text-brand-deep">85%</span></div></div><div className="flex flex-col gap-3"><StatLine value="7" label="day streak" accent /><StatLine value="24" label="events attended" /></div></div></div>;
}

function StatLine({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) { return <div className="flex items-center gap-2"><span className={cn("grid size-7 place-items-center rounded-md bg-brand/10 text-xs font-bold text-brand", accent && "bg-accent/20 text-brand-deep")}>{value}</span><span className="text-xs font-semibold text-muted-foreground">{label}</span></div>; }

function QuickScanCard({ onClick, scanState }: { onClick: () => void; scanState: "ready" | "success" }) {
  return <div className="rounded-3xl border border-border/70 bg-card/55 p-6 shadow-xl shadow-brand/10 backdrop-blur-2xl"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-extrabold text-brand-deep">QR Check-in</h2><span className={cn("rounded-full bg-success/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success", scanState === "success" && "bg-accent/20 text-brand-deep")}>{scanState === "success" ? "Synced" : "Ready"}</span></div><div className="mt-4 flex items-center gap-4"><QrGraphic /><div className="min-w-0"><p className="text-sm font-bold text-foreground">{scanState === "success" ? "Presence marked successfully" : "Scan event QR to mark presence"}</p><p className="mt-1 text-xs text-muted-foreground">Rotates every 2 min · works offline</p><Button onClick={onClick} className="mt-3 w-full rounded-xl bg-accent text-brand-deep shadow-lg shadow-accent/30 hover:bg-accent/90">{scanState === "success" ? "Scan another" : "Open scanner"}</Button></div></div></div>;
}

function QrGraphic() { return <div className="grid size-24 shrink-0 grid-cols-4 grid-rows-4 gap-1 rounded-2xl bg-brand-deep p-3">{Array.from({ length: 16 }).map((_, index) => <span key={index} className={cn("rounded-[2px] bg-primary-foreground", index % 3 === 1 && "bg-primary-foreground/40", index === 6 && "bg-accent")} />)}</div>; }

function NotificationsCard() { return <div className="rounded-3xl border border-border/70 bg-card/55 p-6 shadow-xl shadow-brand/10 backdrop-blur-2xl"><h2 className="font-display text-lg font-extrabold text-brand-deep">Notifications</h2><div className="mt-4 flex flex-col gap-3"><Notification title="Reminder: Hackathon in 24h" detail="Innovation Lab · 10:00 AM" /><Notification title="Registered: Cultural Fest" detail="Confirmation · Seat #112" muted /></div><Button variant="link" className="mt-3 h-auto px-0 text-xs text-brand" >View all <ArrowUpRight /></Button></div>; }

function Notification({ title, detail, muted = false }: { title: string; detail: string; muted?: boolean }) { return <div className="flex items-start gap-3"><span className={cn("mt-1 size-2 shrink-0 rounded-full bg-accent", muted && "bg-brand/30")} /><div><p className="text-sm font-semibold text-foreground">{title}</p><p className="text-xs text-muted-foreground">{detail}</p></div></div>; }

function MiniEventCard({ events, onSelectEvent }: { events: CampusEvent[]; onSelectEvent: (event: CampusEvent) => void }) { return <div className="rounded-3xl border border-border/70 bg-card/55 p-6 shadow-xl shadow-brand/10 backdrop-blur-2xl"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-extrabold text-brand-deep">Upcoming</h2><CalendarDays className="size-4 text-brand/60" /></div><div className="mt-4 space-y-3">{events.slice(0, 2).map((event) => <Button key={event.id} variant="ghost" onClick={() => onSelectEvent(event)} className="h-auto w-full justify-between rounded-xl px-0 py-1 text-left hover:bg-transparent"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-foreground">{event.title}</span><span className="block text-xs text-muted-foreground">{event.day} {event.month} · {event.location}</span></span><ChevronRight className="size-4 shrink-0 text-brand/50" /></Button>)}</div></div>; }

function MyEventsView({ events, registeredCount, onSelectEvent }: { events: CampusEvent[]; registeredCount: number; onSelectEvent: (event: CampusEvent) => void }) { return <div className="flex flex-col gap-5"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand/60">Your campus calendar</p><h1 className="mt-1 font-display text-3xl font-extrabold text-brand-deep">My Events</h1><p className="mt-2 text-sm text-muted-foreground">{registeredCount} confirmed registration{registeredCount === 1 ? "" : "s"} · certificates are ready after check-in.</p></div><div className="flex gap-2 border-b border-border/70 pb-2"><Button variant="ghost" className="rounded-full bg-brand px-3 text-xs text-primary-foreground hover:bg-brand/90 hover:text-primary-foreground">Registered</Button><Button variant="ghost" className="rounded-full px-3 text-xs text-brand/70">Attended</Button><Button variant="ghost" className="rounded-full px-3 text-xs text-brand/70">Past</Button></div><div className="space-y-3">{events.map((event) => <Button key={event.id} variant="ghost" onClick={() => onSelectEvent(event)} className="h-auto w-full justify-between rounded-2xl border border-border/70 bg-card/60 p-4 text-left hover:bg-card/80"><span className="flex min-w-0 items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-center font-display text-xs font-bold text-brand-deep">{event.day}<br />{event.month}</span><span className="min-w-0"><span className="block truncate font-semibold text-foreground">{event.title}</span><span className="block truncate text-xs text-muted-foreground">{event.detail}</span></span></span><span className={cn("shrink-0 rounded-full px-2 py-1 text-[10px] font-bold", event.status === "registered" ? "bg-success/15 text-success" : event.status === "waitlisted" ? "bg-accent/20 text-brand-deep" : "bg-brand/10 text-brand")}>{event.status === "registered" ? "Confirmed" : event.status === "waitlisted" ? "Waitlisted" : "Explore"}</span></Button>)}</div></div>; }

function ScanView({ scanState, setScanState }: { scanState: "ready" | "success"; setScanState: (state: "ready" | "success") => void }) { return <div className="flex min-h-[520px] flex-col items-center justify-center rounded-3xl border border-border/70 bg-card/55 p-6 text-center shadow-xl shadow-brand/10 backdrop-blur-2xl"><div className={cn("grid size-28 place-items-center rounded-full bg-brand/10 text-brand", scanState === "success" && "bg-success/15 text-success")}><ScanLine className="size-12" /></div><p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand/60">QR check-in</p><h1 className="mt-1 font-display text-3xl font-extrabold text-brand-deep">{scanState === "success" ? "Check-in confirmed" : "Ready to scan"}</h1><p className="mt-2 max-w-sm text-sm text-muted-foreground">{scanState === "success" ? "Your attendance for Design Systems 101 was saved on this device and synced to campus records." : "Point your camera at the event QR code. Check-ins can be queued safely when you are offline."}</p>{scanState === "success" ? <div className="mt-6 flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success"><Check className="size-4" /> Design Systems 101 · 09:02 AM</div> : <Button onClick={() => setScanState("success")} className="mt-6 rounded-xl bg-accent text-brand-deep shadow-lg shadow-accent/30 hover:bg-accent/90"><ScanLine /> Simulate QR scan</Button>}<p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><WifiOff className="size-3.5 text-accent" /> Offline check-ins sync automatically once connected.</p></div>; }

function NotificationsView() { return <div className="rounded-3xl border border-border/70 bg-card/55 p-6 shadow-xl shadow-brand/10 backdrop-blur-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand/60">Your updates</p><h1 className="mt-1 font-display text-3xl font-extrabold text-brand-deep">Notifications</h1><div className="mt-6 space-y-4"><Notification title="Reminder: AI & Robotics Hackathon in 24h" detail="Innovation Lab, Block C · Tomorrow at 10:00 AM" /><Notification title="Your Cultural Fest registration is confirmed" detail="Seat #112 · Confirmation received 12 minutes ago" muted /><Notification title="Participation record ready" detail="Download your certificate for Design Systems 101" muted /></div></div>; }

function ProfileView() { return <div className="rounded-3xl border border-border/70 bg-card/55 p-6 shadow-xl shadow-brand/10 backdrop-blur-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand/60">Student profile</p><h1 className="mt-1 font-display text-3xl font-extrabold text-brand-deep">Aarav Mehta</h1><div className="mt-6 grid gap-3 sm:grid-cols-2">{[["Student ID", "GSFC-CS-2021-0142"], ["Department", "Computer Science"], ["Semester", "6 · 2026"], ["Contact", "aarav.mehta@gsfcuni.edu"]].map(([label, value]) => <div key={label} className="rounded-2xl border border-border/70 bg-card/55 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-brand/60">{label}</p><p className="mt-2 text-sm font-semibold text-foreground">{value}</p></div>)}</div><div className="mt-5 rounded-2xl bg-brand p-5 text-primary-foreground"><div className="flex items-center gap-3"><ShieldCheck className="size-5 text-accent" /><div><p className="text-sm font-bold">University account verified</p><p className="text-xs text-primary-foreground/70">Connected through GSFC single sign-on</p></div></div></div></div>; }

function OrganizerWorkspace({ qrGenerated, setQrGenerated }: { qrGenerated: boolean; setQrGenerated: (value: boolean) => void }) { return <main className="mt-6 flex flex-1 flex-col gap-5 pb-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand/60">Organizer workspace</p><h1 className="mt-1 font-display text-3xl font-extrabold text-brand-deep">Your events, at a glance</h1></div><Button className="rounded-xl bg-brand text-primary-foreground hover:bg-brand/90"><CalendarDays /> Create event</Button></div><div className="grid gap-4 sm:grid-cols-3"><MetricCard icon={Users} label="Registrations" value="248" trend="+18% this week" /><MetricCard icon={TicketCheck} label="Live events" value="04" trend="2 starting today" /><MetricCard icon={BarChart3} label="Attendance rate" value="82%" trend="+6% vs last month" /></div><div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]"><div className="rounded-3xl border border-border/70 bg-card/55 p-5 shadow-xl shadow-brand/10 backdrop-blur-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-brand/60">Active events</p><h2 className="mt-1 font-display text-xl font-extrabold text-brand-deep">Attendance control</h2></div><Button variant="outline" size="sm" className="rounded-lg border-border/70 text-brand"><Download /> Export</Button></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-border/70 text-[10px] uppercase tracking-wider text-muted-foreground"><tr><th className="pb-3 font-semibold">Event</th><th className="pb-3 font-semibold">Registrations</th><th className="pb-3 font-semibold">Attendance</th><th className="pb-3 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-border/60">{[["AI & Robotics Hackathon", "86", "71%", "Live"], ["Design Systems 101", "54", "93%", "Complete"], ["Prayaas Leadership Forum", "108", "—", "Upcoming"]].map(([name, regs, attendance, status]) => <tr key={name}><td className="py-4 font-semibold text-foreground">{name}</td><td className="py-4 text-muted-foreground">{regs}</td><td className="py-4 text-muted-foreground">{attendance}</td><td className="py-4"><span className={cn("rounded-full px-2 py-1 text-[10px] font-bold", status === "Live" ? "bg-success/15 text-success" : "bg-brand/10 text-brand")}>{status}</span></td></tr>)}</tbody></table></div></div><div className="rounded-3xl border border-border/70 bg-brand p-5 text-primary-foreground shadow-xl shadow-brand/20"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">Live attendance</p><h2 className="mt-1 font-display text-xl font-extrabold">AI & Robotics</h2></div><QrCode className="size-6 text-accent" /></div><div className="mt-6 flex items-end gap-2"><span className="font-display text-5xl font-extrabold">61</span><span className="mb-2 text-sm text-primary-foreground/70">of 86 checked in</span></div><div className="mt-3 h-2 rounded-full bg-primary-foreground/15"><div className="h-full w-[71%] rounded-full bg-accent" /></div><Button onClick={() => setQrGenerated(true)} className="mt-6 w-full rounded-xl bg-accent text-brand-deep hover:bg-accent/90">{qrGenerated ? <><Check /> QR active · rotates in 01:42</> : <><QrCode /> Generate live QR</>}</Button></div></div></main>; }

function MetricCard({ icon: Icon, label, value, trend }: { icon: typeof Users; label: string; value: string; trend: string }) { return <div className="rounded-2xl border border-border/70 bg-card/55 p-4 shadow-lg shadow-brand/5 backdrop-blur-xl"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span><Icon className="size-4 text-brand/60" /></div><p className="mt-3 font-display text-3xl font-extrabold text-brand-deep">{value}</p><p className="mt-1 text-xs text-success">{trend}</p></div>; }

function AdminWorkspace() { return <main className="mt-6 flex flex-1 flex-col gap-5 pb-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand/60">University overview</p><h1 className="mt-1 font-display text-3xl font-extrabold text-brand-deep">Campus activity dashboard</h1></div><Button variant="outline" className="rounded-xl border-border/70 text-brand"><FileDown /> Export report</Button></div><div className="grid gap-4 sm:grid-cols-3"><MetricCard icon={CalendarDays} label="Total events" value="128" trend="12 pending review" /><MetricCard icon={Users} label="Participation" value="4,820" trend="+14% this semester" /><MetricCard icon={BarChart3} label="Avg. engagement" value="76%" trend="Across 8 departments" /></div><div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]"><div className="rounded-3xl border border-border/70 bg-card/55 p-5 shadow-xl shadow-brand/10 backdrop-blur-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-brand/60">Engagement pulse</p><h2 className="mt-1 font-display text-xl font-extrabold text-brand-deep">Department participation</h2></div><BarChart3 className="size-5 text-brand/60" /></div><div className="mt-6 space-y-4">{[["Computer Science", 88], ["Chemical Engineering", 74], ["Management", 69], ["Life Sciences", 61], ["Humanities", 54]].map(([label, value]) => <div key={label as string}><div className="flex justify-between text-xs font-semibold"><span className="text-foreground">{label}</span><span className="text-muted-foreground">{value}%</span></div><div className="mt-2 h-2 rounded-full bg-brand/10"><div className="h-full rounded-full bg-accent" style={{ width: `${value}%` }} /></div></div>)}</div></div><div className="rounded-3xl border border-border/70 bg-card/55 p-5 shadow-xl shadow-brand/10 backdrop-blur-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-brand/60">Action queue</p><h2 className="mt-1 font-display text-xl font-extrabold text-brand-deep">Needs review</h2></div><LayoutDashboard className="size-5 text-brand/60" /></div><div className="mt-5 space-y-3"><QueueItem title="12 event approvals" detail="Review before publishing" tone="accent" /><QueueItem title="08 low attendance flags" detail="Follow up with students" /><QueueItem title="03 organizer requests" detail="Awaiting verification" /></div></div></div></main>; }

function QueueItem({ title, detail, tone = "brand" }: { title: string; detail: string; tone?: "accent" | "brand" }) { return <Button variant="ghost" className="h-auto w-full justify-between rounded-xl border border-border/60 bg-card/50 p-3 text-left hover:bg-card/80"><span className="flex items-center gap-3"><span className={cn("grid size-8 place-items-center rounded-lg bg-brand/10 text-brand", tone === "accent" && "bg-accent/20 text-brand-deep")}><ShieldCheck className="size-4" /></span><span><span className="block text-sm font-semibold text-foreground">{title}</span><span className="block text-xs text-muted-foreground">{detail}</span></span></span><ChevronRight className="size-4 text-brand/50" /></Button>; }

function EventDetails({ event, onClose, onRegister }: { event: CampusEvent; onClose: () => void; onRegister: (id: number) => void }) { const registered = event.status === "registered"; return <div className="fixed inset-0 z-40 flex items-end justify-center bg-brand-deep/30 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label={`${event.title} details`}><div className="w-full max-w-2xl rounded-t-3xl border border-border/70 bg-card p-6 shadow-2xl sm:rounded-3xl"><div className="flex items-start justify-between gap-4"><div><span className="rounded-md bg-accent/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-deep">{event.category}</span><h2 className="mt-3 font-display text-3xl font-extrabold text-brand-deep">{event.title}</h2><p className="mt-2 text-sm text-muted-foreground">Hosted by {event.organizer}</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close event details" className="rounded-full text-brand"><X /></Button></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><DetailItem icon={CalendarDays} label="Date" value={`${event.day} ${event.month} 2026`} /><DetailItem icon={Clock3} label="Time" value={event.detail.split(" · ")[0] ?? "10:00 AM"} /><DetailItem icon={MapPin} label="Location" value={event.location} /></div><div className="mt-5 rounded-2xl bg-brand/5 p-4 text-sm leading-relaxed text-muted-foreground">Join fellow students for a hands-on campus experience. Bring your university ID and arrive 15 minutes early for a smooth check-in.</div><div className="mt-6 flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="size-4 text-brand" /> {event.seats}</span><Button onClick={() => { onRegister(event.id); onClose(); }} disabled={registered} className={cn("rounded-xl bg-brand text-primary-foreground hover:bg-brand/90", registered && "bg-success hover:bg-success")}>{registered ? <><Check /> Registered</> : <><TicketCheck /> Register for event</>}</Button></div></div></div>; }

function DetailItem({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="rounded-xl border border-border/70 bg-card/50 p-3"><Icon className="size-4 text-brand" /><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-xs font-semibold text-foreground">{value}</p></div>; }