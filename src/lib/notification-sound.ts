import { toast } from "sonner";

export const NOTIFICATION_SOUND_STORAGE_KEY = "notificationSoundEnabled";
export const NOTIFICATION_SOUND_URL = "/sounds/notification.mp3";

/**
 * Check if notification sound is enabled in localStorage.
 * Defaults to true.
 */
export function isNotificationSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem(NOTIFICATION_SOUND_STORAGE_KEY);
    return val !== "false";
  } catch {
    return true;
  }
}

/**
 * Update notification sound preference in localStorage and notify listeners.
 */
export function setNotificationSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATION_SOUND_STORAGE_KEY, enabled ? "true" : "false");
    window.dispatchEvent(
      new CustomEvent("notification-sound-change", { detail: { enabled } }),
    );
  } catch (err) {
    console.debug("Failed to store notificationSoundEnabled:", err);
  }
}

/**
 * Fallback synthesizer using Web Audio API in case audio file playback is blocked or unavailable.
 */
function playWebAudioChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Dual-tone harmonic chime (880Hz A5 + 1760Hz A6) with soft exponential decay
    [880, 1760].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(idx === 0 ? 0.25 : 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    });
  } catch {
    // Fail silently if Web Audio is not permitted yet
  }
}

/**
 * Play notification sound asset (/sounds/notification.mp3).
 * Gracefully handles browser autoplay policies without breaking execution.
 */
export async function playNotificationSound(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!isNotificationSoundEnabled()) return false;

  try {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.75;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      await playPromise;
      return true;
    }
  } catch (err: any) {
    // Autoplay restrictions or audio policy can reject promise before user interaction
    // Attempt graceful web audio chime fallback
    try {
      playWebAudioChime();
    } catch {
      // Fail silently
    }
  }
  return false;
}

/**
 * Request OS-level browser notification permission if not yet decided.
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  try {
    if (Notification.permission === "default") {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  } catch {
    return "unsupported";
  }
}

/**
 * Show OS-level browser notification if permission has been granted.
 */
export function showBrowserNotification(
  title: string,
  options?: NotificationOptions,
): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  try {
    if (Notification.permission === "granted") {
      new Notification(title, {
        icon: "/gsfc-logo.jpg",
        badge: "/gsfc-logo.jpg",
        ...options,
      });
      return true;
    }
  } catch {
    // Fail silently if browser blocks desktop notification
  }
  return false;
}

export interface NotificationPayload {
  id?: string;
  title: string;
  message: string;
  type?: string;
  timestamp?: string;
}

/**
 * Centrally triggers:
 * 1. Audio sound (if not muted)
 * 2. Sonner toast popup with click-to-view action
 * 3. Browser OS-level notification (if permitted)
 */
export function triggerNewNotificationToast(
  item: NotificationPayload,
  onOpenNotifications?: () => void,
): void {
  // 1. Play sound
  playNotificationSound();

  // 2. OS-level background tab notification
  showBrowserNotification(item.title, {
    body: item.message,
  });

  // 3. In-app sonner toast popup
  toast(item.title, {
    description: item.message,
    duration: 6000,
    action: onOpenNotifications
      ? {
          label: "View",
          onClick: () => onOpenNotifications(),
        }
      : undefined,
  });
}
