import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";

export const NativeBridge = {
  isNative: (): boolean => {
    return Capacitor.isNativePlatform();
  },

  getPlatform: (): "ios" | "android" | "web" => {
    const platform = Capacitor.getPlatform();
    if (platform === "ios") return "ios";
    if (platform === "android") return "android";
    return "web";
  },

  isIOS: (): boolean => {
    if (typeof window === "undefined") return false;
    return (
      Capacitor.getPlatform() === "ios" ||
      /iPad|iPhone|iPod/.test(navigator.userAgent)
    );
  },

  isAndroid: (): boolean => {
    if (typeof window === "undefined") return false;
    return (
      Capacitor.getPlatform() === "android" ||
      /Android/.test(navigator.userAgent)
    );
  },

  // Trigger haptic feedback when user scans QR or unlocks a badge
  triggerHapticSuccess: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([40, 60, 80]);
      }
    } catch {
      // Haptics unavailable, silent fail
    }
  },

  triggerHapticError: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // Silent fail
    }
  },

  // Set mobile status bar styling
  setStatusBarDark: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.setStyle({ style: Style.Dark });
        if (Capacitor.getPlatform() === "android") {
          await StatusBar.setBackgroundColor({ color: "#1A3C6E" });
        }
      }
    } catch {
      // Status bar unavailable in pure web
    }
  },
};
