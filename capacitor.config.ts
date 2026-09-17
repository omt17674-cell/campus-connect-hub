import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "edu.gsfcuni.campusconnect",
  appName: "Campus Connect",
  webDir: "dist",
  server: {
    androidScheme: "https",
    iosScheme: "https",
    cleartext: true,
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1A3C6E",
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#0E2342",
      showSpinner: false,
    },
  },
  ios: {
    contentInset: "always",
    preferredContentMode: "mobile",
    scheme: "CampusConnect",
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: "#0E2342",
  },
};

export default config;
