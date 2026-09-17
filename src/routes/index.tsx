import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  Building2,
  CalendarDays,
  Flame,
  QrCode,
  Radio,
  ScanBarcode,
  ScanLine,
  TicketCheck,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/navigation/Header";
import { StudentBottomNav, StudentNavView } from "@/components/navigation/StudentBottomNav";
import { HomeFeed } from "@/components/student/HomeFeed";
import { AttendanceHub } from "@/components/student/AttendanceHub";
import { MyEventsView } from "@/components/student/MyEventsView";
import { GamificationView } from "@/components/student/GamificationView";
import { ProfileView } from "@/components/student/ProfileView";
import { StudentPassportView } from "@/components/student/StudentPassportView";
import { ClubsHubView } from "@/components/clubs/ClubsHubView";
import { CampusFeedView } from "@/components/feed/CampusFeedView";
import { CampusServicesView } from "@/components/campus/CampusServicesView";
import { DigitalCampusIdModal } from "@/components/student/DigitalCampusIdModal";
import { CampusAssistantModal } from "@/components/ai/CampusAssistantModal";
import { EventDetailModal } from "@/components/student/EventDetailModal";
import { QRScannerModal } from "@/components/student/QRScannerModal";
import { PunchAttendanceModal } from "@/components/student/PunchAttendanceModal";
import { NotificationsModal } from "@/components/student/NotificationsModal";
import { MobileInstallModal } from "@/components/mobile/MobileInstallModal";
import { UnifiedAttendanceGateModal } from "@/components/attendance/UnifiedAttendanceGateModal";
import { OrganizerDashboard } from "@/components/organizer/OrganizerDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { LoginPage } from "@/components/auth/LoginPage";
import { CampusEvent } from "@/lib/types";
import { campusStore, CampusState } from "@/lib/campus-store";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Connect Hub — GSFC University" },
      {
        name: "description",
        content: "GSFC University's official Event Management & Attendance Tracking platform with offline QR check-ins, verifiable PDF certificates, and gamification.",
      },
      { property: "og:title", content: "Campus Connect Hub — GSFC University" },
      { property: "og:description", content: "Event Management and Attendance Tracking for students, faculty organizers, and administrators on Android, iOS, and Web." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CampusConnectApp,
});

function CampusConnectApp() {
  const [state, setState] = useState<CampusState>(campusStore.getState());
  const [studentView, setStudentView] = useState<StudentNavView>("home");
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [punchModalEvent, setPunchModalEvent] = useState<CampusEvent | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [showGateModal, setShowGateModal] = useState(false);
  const [showDigitalId, setShowDigitalId] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Subscribe to reactive store
  useEffect(() => {
    const unsubscribe = campusStore.subscribe((nextState) => {
      setState(nextState);
    });
    return unsubscribe;
  }, []);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      campusStore.syncPendingCheckins();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const t = translations[state.language];

  // If user is not authenticated, show Digital Campus System Login Portal
  if (!state.isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setStudentView("home")} />;
  }

  return (
    <div className={cn("campus-app min-h-screen bg-background text-foreground transition-colors", isDark && "dark")}>
      <div className="campus-wash pointer-events-none fixed inset-0 opacity-40 dark:opacity-20" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1280px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <Header
          state={state}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenMobileInstall={() => setShowMobileModal(true)}
          onOpenUnifiedCheckIn={() => setShowGateModal(true)}
          onOpenDigitalId={() => setShowDigitalId(true)}
          onOpenAiAssistant={() => setShowAiAssistant(true)}
        />

        {/* Dynamic Workspace based on Role */}
        <main className="mt-6 flex-1 pb-24 md:pb-8">
          {state.currentRole === "student" && (
            <div className="flex flex-col gap-6">
              {/* Desktop Sub-Nav Pill Bar */}
              <div className="hidden items-center justify-between gap-4 border-b border-border/70 pb-3 md:flex flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStudentView("home")}
                    className={cn(
                      "rounded-xl text-xs font-bold",
                      studentView === "home"
                        ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <CalendarDays className="mr-1.5 size-3.5" />
                    {t.nav.home}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStudentView("events")}
                    className={cn(
                      "rounded-xl text-xs font-bold",
                      studentView === "events"
                        ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <TicketCheck className="mr-1.5 size-3.5" />
                    {t.nav.myEvents}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStudentView("passport")}
                    className={cn(
                      "rounded-xl text-xs font-bold",
                      studentView === "passport"
                        ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Award className="mr-1.5 size-3.5 text-[#F2A93B]" />
                    360 Passport
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStudentView("clubs")}
                    className={cn(
                      "rounded-xl text-xs font-bold",
                      studentView === "clubs"
                        ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Users className="mr-1.5 size-3.5" />
                    Clubs & Societies
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStudentView("feed")}
                    className={cn(
                      "rounded-xl text-xs font-bold",
                      studentView === "feed"
                        ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Radio className="mr-1.5 size-3.5" />
                    Campus Feed
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStudentView("services")}
                    className={cn(
                      "rounded-xl text-xs font-bold",
                      studentView === "services"
                        ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Building2 className="mr-1.5 size-3.5" />
                    Services & TPC
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStudentView("gamification")}
                    className={cn(
                      "rounded-xl text-xs font-bold",
                      studentView === "gamification"
                        ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Trophy className="mr-1.5 size-3.5 text-[#F2A93B]" />
                    {t.nav.gamification}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStudentView("profile")}
                    className={cn(
                      "rounded-xl text-xs font-bold",
                      studentView === "profile"
                        ? "bg-[#1A3C6E] text-white shadow-md shadow-[#1A3C6E]/20"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <UserRound className="mr-1.5 size-3.5" />
                    {t.nav.profile}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowGateModal(true)}
                    className="h-9 gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-[#1A3C6E] to-[#0E2342] font-display text-xs font-black text-white shadow-md hover:opacity-95"
                  >
                    <ScanBarcode className="size-4 text-[#F2A93B]" />
                    Multi-Factor Check-In (OTP + ID + GPS)
                  </Button>

                  <Button
                    onClick={() => setShowScanner(true)}
                    variant="outline"
                    className="h-9 gap-1.5 rounded-2xl border-[#1A3C6E]/40 font-display text-xs font-black text-[#1A3C6E] dark:text-[#F2A93B]"
                  >
                    <ScanLine className="size-4" />
                    Scan QR
                  </Button>
                </div>
              </div>

              {/* Student View Router */}
              {studentView === "home" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.8fr]">
                  <HomeFeed
                    state={state}
                    onSelectEvent={setSelectedEvent}
                    onOpenScanner={() => setShowScanner(true)}
                    onOpenPunchModal={(evt) => setPunchModalEvent(evt)}
                  />
                  <AttendanceHub
                    state={state}
                    onOpenScanner={() => setShowScanner(true)}
                    onSelectEvent={setSelectedEvent}
                    onOpenUnifiedCheckIn={() => setShowGateModal(true)}
                  />
                </div>
              )}

              {studentView === "events" && (
                <MyEventsView
                  state={state}
                  onSelectEvent={setSelectedEvent}
                  onOpenPunchModal={(evt) => setPunchModalEvent(evt)}
                />
              )}

              {studentView === "passport" && (
                <StudentPassportView />
              )}

              {studentView === "clubs" && (
                <ClubsHubView />
              )}

              {studentView === "feed" && (
                <CampusFeedView />
              )}

              {studentView === "services" && (
                <CampusServicesView />
              )}

              {studentView === "gamification" && (
                <GamificationView state={state} />
              )}

              {studentView === "profile" && (
                <ProfileView state={state} />
              )}
            </div>
          )}

          {state.currentRole === "organizer" && (
            <OrganizerDashboard state={state} />
          )}

          {state.currentRole === "admin" && (
            <AdminDashboard
              state={state}
              onOpenGateModal={() => setShowGateModal(true)}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation for Students */}
        {state.currentRole === "student" && (
          <StudentBottomNav
            state={state}
            activeView={studentView}
            onSelectView={setStudentView}
            onOpenScanner={() => setShowScanner(true)}
          />
        )}
      </div>

      {/* Global Modals */}
      {showDigitalId && (
        <DigitalCampusIdModal
          isOpen={showDigitalId}
          onClose={() => setShowDigitalId(false)}
        />
      )}

      {showAiAssistant && (
        <CampusAssistantModal
          isOpen={showAiAssistant}
          onClose={() => setShowAiAssistant(false)}
        />
      )}

      {showGateModal && (
        <UnifiedAttendanceGateModal
          state={state}
          initialEvent={selectedEvent}
          onClose={() => setShowGateModal(false)}
          onSuccess={() => setShowGateModal(false)}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onOpenScanner={() => {
            setSelectedEvent(null);
            setShowScanner(true);
          }}
          onOpenPunchModal={(evt) => {
            setPunchModalEvent(evt);
          }}
        />
      )}

      {punchModalEvent && (
        <PunchAttendanceModal
          event={punchModalEvent}
          onClose={() => setPunchModalEvent(null)}
          onSuccess={() => setPunchModalEvent(null)}
        />
      )}

      {showScanner && (
        <QRScannerModal
          onClose={() => setShowScanner(false)}
          onSuccess={() => {}}
        />
      )}

      {showNotifications && (
        <NotificationsModal
          state={state}
          onClose={() => setShowNotifications(false)}
          onSelectEventId={(id) => {
            const evt = state.events.find((e) => e.id === id);
            if (evt) setSelectedEvent(evt);
          }}
        />
      )}

      {showMobileModal && (
        <MobileInstallModal
          onClose={() => setShowMobileModal(false)}
        />
      )}
    </div>
  );
}