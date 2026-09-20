# Campus Connect Hub

> **Integrated Campus Engagement, Events, Attendance, Internship & Digital Student Experience Platform**  
> _Developed by Om P. Thakkar_

---

## 🏛️ About Campus Connect Hub

**Campus Connect Hub** is an integrated campus management platform designed for student engagement, campus event administration, internship tracking, and verified attendance tracking with live GPS geofencing (tested with GSFC University campus contexts).

Designed for high reliability, multi-platform accessibility (Android, iOS, Web PWA), and seamless academic record workflows.

---

## ✨ Key Capabilities

### 🎓 1. Student Portal

- **Campus Event Directory**: Browse, search, filter by department and tags, and register for technical hackathons, cultural conclaves, and sports tournaments.
- **Team & Solo Registration**: Register full rosters with verified university roll numbers.
- **Live Location Geofenced Attendance**: Time-bound rotating QR code check-in enforced with GPS perimeter validation against GSFC University campus venues.
- **Offline-First Synchronization**: Check in without cellular/WiFi connectivity; transactions queue securely on-device and auto-sync when online.
- **Official PDF Participation Certificates**: High-resolution, verifiable PDF certificate generation with embedded verification QR code and GPS location verification watermark.
- **Gamification & Leaderboard**: Earn XP (+60 for GPS verified check-ins), unlock achievement badges, maintain streaks, and track department rankings.
- **Calendar Integration**: Export to Apple Calendar / Outlook via `.ics` and direct Google Calendar synchronization.

### 💼 2. TPC Admin & Faculty Organizer Portal

- **Event Lifecycle Governance**: Create, edit, publish, and manage capacities and waitlists.
- **Live Attendance Screen**: Large projector mode with rotating time-limited dynamic QR code and live check-in ticker.
- **Attendee Management & Export**: Real-time roll list, manual attendance overrides, and one-click CSV export.

### 🏛️ 3. University Administration Portal

- **Cross-Department Analytics**: Interactive Recharts graphs tracking department attendance, active student engagement, and capacity utilization.
- **Dean Event Approval Queue**: Review and approve newly created events before publication.
- **Automated Low-Attendance Alerts**: Smart detection and alerts for students falling below the 75% attendance threshold.
- **Immutable Audit Trail**: Chronological event logs for every check-in, registration, and role change.

---

## 🔑 Authentication Portals

All users must register or sign in using their official GSFC University credentials or Google Workspace SSO:

- 🎓 **Student Portal**: Sign in using your official enrollment number or university email.
- 🏛️ **Administration Portal**: Restricted to authorized academic deans and university officers.
- 💼 **TPC & Faculty Organizer Portal**: Accessible to Training & Placement cell coordinators and verified event leads.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, TanStack Router & Start, Lucide Icons, Canvas Confetti
- **Analytics & Visuals**: Recharts, jsPDF, html2canvas, QRCode
- **Mobile & PWA**: Service Worker, Web App Manifest, Capacitor iOS & Android bridge
- **Geolocation**: Haversine Geofence Engine (`navigator.geolocation`)
- **Localization**: English, Gujarati (ગુજરાતી), Hindi (हिन्दी)

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/omt17674-cell/campus-connect-hub.git
cd campus-connect-hub

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 📱 Mobile Native Build (iOS & Android)

```bash
# Sync Capacitor native projects
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode (macOS)
npx cap open ios
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

**Copyright © 2026 Om P. Thakkar**  
_Integrated Campus Engagement, Events, Attendance, Internship & Digital Student Experience Platform_
