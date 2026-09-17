import { useState, useEffect } from "react";
import {
  Apple,
  Check,
  Download,
  ExternalLink,
  Laptop,
  QrCode,
  Share2,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeBridge } from "@/lib/native-bridge";
import { generateQrDataUrl } from "@/lib/qr-engine";
import { cn } from "@/lib/utils";

interface MobileInstallModalProps {
  onClose: () => void;
}

export function MobileInstallModal({ onClose }: MobileInstallModalProps) {
  const [activeTab, setActiveTab] = useState<"android" | "apple" | "scan">("android");
  const [appQrUrl, setAppQrUrl] = useState<string>("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (NativeBridge.isIOS()) {
      setActiveTab("apple");
    } else if (NativeBridge.isAndroid()) {
      setActiveTab("android");
    }

    // Generate QR code pointing to current URL for instant mobile testing
    const currentUrl = typeof window !== "undefined" ? window.location.href : "https://campusconnect.gsfcuni.edu";
    generateQrDataUrl(currentUrl).then(setAppQrUrl);

    // Listen for beforeinstallprompt (Android Chrome PWA)
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("To install on Android: Tap the three dots (⋮) in Chrome menu and tap 'Install App' or 'Add to Home screen'.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C6E] to-[#0E2342] text-[#F2A93B] shadow-lg shadow-[#1A3C6E]/30">
            <Smartphone className="size-7" />
          </div>
          <h3 className="mt-3 font-display text-2xl font-black text-foreground">
            Get Campus Connect on Mobile
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Works natively on both <strong className="text-foreground">Android</strong> and <strong className="text-foreground">Apple iOS (iPhone/iPad)</strong> with offline check-in capability.
          </p>
        </div>

        {/* Tabs: Android vs Apple vs QR Scan */}
        <div className="mt-5 flex items-center justify-center gap-1.5 rounded-2xl border border-border/70 bg-card/60 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("android")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "android"
                ? "bg-[#1A3C6E] text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Smartphone className="mr-1.5 size-3.5" /> Android (APK / PWA)
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("apple")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "apple"
                ? "bg-[#1A3C6E] text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Apple className="mr-1.5 size-3.5" /> Apple iOS (iPhone)
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("scan")}
            className={cn(
              "rounded-xl text-xs font-bold",
              activeTab === "scan"
                ? "bg-[#1A3C6E] text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <QrCode className="mr-1.5 size-3.5 text-[#F2A93B]" /> Scan on Phone
          </Button>
        </div>

        {/* Content based on Tab */}
        <div className="mt-5">
          {/* ANDROID TAB */}
          {activeTab === "android" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="size-4" />
                  <span>Instant Installation on Android</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Install Campus Connect as a native standalone Android app directly from Chrome with offline sync and camera permissions.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    onClick={handleInstallPwa}
                    className="rounded-xl bg-emerald-600 font-display text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <Download className="mr-1.5 size-3.5" />
                    Install App on Android
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => alert("Capacitor Android Project is ready! Run `npx cap open android` to build in Android Studio.")}
                    className="rounded-xl text-xs font-semibold"
                  >
                    Android Studio / APK Project
                  </Button>
                </div>
              </div>

              {/* Step by Step Guide for Android */}
              <div className="space-y-2 rounded-2xl border border-border/70 bg-card/50 p-4 text-xs">
                <h4 className="font-bold text-foreground">3 Steps to Install on Android:</h4>
                <ol className="list-inside list-decimal space-y-1.5 text-muted-foreground">
                  <li>Open this link in <strong className="text-foreground">Google Chrome</strong> on your Android phone.</li>
                  <li>Tap the top-right menu button <strong className="text-foreground">(⋮)</strong>.</li>
                  <li>Select <strong className="text-foreground">"Install app"</strong> or <strong className="text-foreground">"Add to Home screen"</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* APPLE IOS TAB */}
          {activeTab === "apple" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                  <Apple className="size-4" />
                  <span>Install on iPhone & iPad (Safari)</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Runs full screen on iOS without browser bars, with camera QR scanner, haptic feedback, and offline certificate downloads.
                </p>
              </div>

              {/* Step by Step Guide for Apple iOS */}
              <div className="space-y-2 rounded-2xl border border-border/70 bg-card/50 p-4 text-xs">
                <h4 className="font-bold text-foreground">How to Install on iPhone / iPad:</h4>
                <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
                  <li>
                    Open this URL in <strong className="text-foreground">Safari</strong> on your Apple device.
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span>Tap the Safari</span>
                    <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 font-bold text-foreground">
                      <Share2 className="mr-1 size-3" /> Share Button
                    </span>
                    <span>at the bottom of the screen.</span>
                  </li>
                  <li>
                    Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong> (➕).
                  </li>
                  <li>
                    Tap <strong className="text-foreground">"Add"</strong> in the top right. The Campus Connect app icon will appear on your Home Screen!
                  </li>
                </ol>
              </div>

              <div className="rounded-xl bg-brand/5 p-3 text-xs text-muted-foreground">
                📱 <strong>Xcode Native Build:</strong> Run <code>npx cap open ios</code> to build directly with Xcode for TestFlight / App Store.
              </div>
            </div>
          )}

          {/* SCAN ON PHONE TAB */}
          {activeTab === "scan" && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/50 p-6 text-center">
              <div className="rounded-2xl bg-white p-3 shadow-md">
                {appQrUrl && (
                  <img
                    src={appQrUrl}
                    alt="Open on Mobile QR"
                    className="size-48"
                  />
                )}
              </div>
              <p className="mt-4 text-xs font-bold text-foreground">
                Scan with iPhone or Android Camera
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Opens Campus Connect directly on your mobile device for instant testing and installation.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-border/70 pt-4">
          <Button
            onClick={onClose}
            className="rounded-xl bg-[#1A3C6E] text-xs font-bold text-white hover:bg-[#1A3C6E]/90"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
