import { useState } from "react";
import { Award, Bell, Calendar, Check, Play, RefreshCw, ShieldAlert, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusState, campusStore } from "@/lib/campus-store";
import { cn } from "@/lib/utils";
import {
  isNotificationSoundEnabled,
  setNotificationSoundEnabled,
  playNotificationSound,
  triggerNewNotificationToast,
} from "@/lib/notification-sound";

interface NotificationsModalProps {
  state: CampusState;
  onClose: () => void;
  onSelectEventId?: (eventId: string) => void;
}

export function NotificationsModal({
  state,
  onClose,
  onSelectEventId,
}: NotificationsModalProps) {
  const [soundEnabled, setSoundEnabled] = useState(() => isNotificationSoundEnabled());

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setNotificationSoundEnabled(next);
    if (next) {
      playNotificationSound();
    }
  };

  const handleTestNotification = () => {
    triggerNewNotificationToast(
      {
        id: `test-${Date.now()}`,
        title: "🔔 Test Notification Alert",
        message: "Real-time sound and toast notifications are working properly on Campus Connect Hub!",
        type: "alert",
      },
      () => {},
    );
  };

  const markAllAsRead = () => {
    campusStore.setState((prev) => ({
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Calendar className="size-4 text-blue-500" />;
      case "achievement":
        return <Award className="size-4 text-amber-500" />;
      case "sync":
        return <RefreshCw className="size-4 text-emerald-500" />;
      case "alert":
        return <ShieldAlert className="size-4 text-rose-500" />;
      default:
        return <Bell className="size-4 text-brand" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Bell className="size-4" />
            </div>
            <div>
              <h3 className="font-display text-lg font-black text-foreground">
                Campus Alerts & Updates
              </h3>
              <p className="text-xs text-muted-foreground">
                Automated event reminders, badges, and sync confirmations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sound Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSound}
              className="h-7 px-2 text-xs font-semibold gap-1"
              title={soundEnabled ? "Mute notification sound" : "Enable notification sound"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="size-3 text-emerald-500" />
                  <span className="hidden sm:inline">Sound On</span>
                </>
              ) : (
                <>
                  <VolumeX className="size-3 text-muted-foreground" />
                  <span className="hidden sm:inline">Muted</span>
                </>
              )}
            </Button>

            {/* Test Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              className="h-7 px-2 text-xs font-semibold gap-1 border-brand/30 text-brand hover:bg-brand/10"
              title="Test chime sound and toast popup"
            >
              <Play className="size-3 fill-current" />
              <span className="hidden sm:inline">Test</span>
            </Button>

            {state.notifications.some((n) => !n.read) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 text-xs font-bold text-brand"
              >
                <Check className="mr-1 size-3" /> Mark read
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5 max-h-[60vh] space-y-2.5 overflow-y-auto pr-1">
          {state.notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            state.notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.eventId && onSelectEventId) {
                    onClose();
                    onSelectEventId(n.eventId);
                  }
                }}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-3.5 transition-all",
                  n.read
                    ? "border-border/60 bg-card/40"
                    : "border-brand/30 bg-brand/5 shadow-sm",
                  n.eventId && "cursor-pointer hover:border-brand/60 hover:bg-card/80"
                )}
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-card shadow-sm">
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-xs font-bold text-foreground">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      {n.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
