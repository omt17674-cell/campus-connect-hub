# Campus Connect Hub

Campus Connect — App Build Prompt

Two prompts below: one for Lovable (UI/UX prototype) and one for Antigravity (full functional build). Copy-paste each into its respective tool.

1. Prompt for Lovable (UI Design)

Build a mobile-first web app called "Campus Connect" — an Event Management
and Attendance Tracking platform for GSFC University. It should feel like
a native module of the university's existing digital ecosystem (similar in
spirit to their "DCS" portal and "Prayaas" SSO app): clean, official,
trustworthy, and modern — not like a generic consumer app.

DESIGN LANGUAGE
- Primary color: deep blue/navy (#1A3C6E or similar) with a warm gold/amber
  accent (#F2A93B) — reflecting an academic/institutional feel.
- Clean sans-serif typography, generous white space, card-based layouts.
- Rounded cards, soft shadows, minimal clutter.
- Support both light and dark mode.
- Include a university logo placeholder in the header.

USER ROLES (three separate dashboards)
1. Student
2. Event Organizer / Faculty
3. Admin

SCREENS TO DESIGN

Login / Auth
- Single sign-on style login screen (email/ID + password), with "Forgot
  password" and a note "Login with your university credentials."

Student View
- Home: list of upcoming events as cards (title, date, time, venue,
  category tag, "Register" button, seats remaining if limited).
- Event Details page: full description, organizer, schedule, location
  (map preview), registration status, list of rules/eligibility.
- My Events: tabs for "Registered", "Attended", "Past".
- Attendance History: calendar or list view showing attendance %,
  streaks, and a downloadable certificate/participation record per event.
- QR Check-in screen: a scan button that opens the camera to scan an
  event's QR code for attendance marking. Show success/failure state
  clearly (green check / red cross with reason).
- Notifications tab: reminders, event updates, cancellations.
- Profile: student ID, department, semester, contact info.

Organizer View
- Dashboard: list of events they created, with quick stats (registrations,
  attendance rate).
- Create/Edit Event form: title, description, category, date/time,
  venue, capacity limit, registration deadline, whether approval is
  required, upload banner image.
- Live Attendance screen: real-time list of who has checked in during
  an event (with a "Generate QR" button that displays a rotating/
  time-limited QR code for the event).
- Registrations list: view/export list of registered students, approve
  or reject registration requests if the event requires approval.

Admin View
- Overview dashboard: total events, total participation, department-wise
  engagement charts (bar and line charts).
- Manage all events across organizers (approve new events before they
  go live).
- Reports section: filter attendance data by department/date range,
  export as CSV/PDF.
- Flag events/students with low attendance for follow-up.

GENERAL UX NOTES
- Bottom navigation bar for students (Home, My Events, Scan, Notifications,
  Profile).
- Empty states should be friendly and instructive (e.g. "No events yet —
  check back soon!").
- Loading and offline states should be visually clear (e.g. a banner:
  "You're offline — check-ins will sync once you're back online").
- Make it responsive: works well as a mobile web app and also reasonably
  on desktop for organizers/admins.

Please generate a clickable prototype covering these screens with
realistic sample data (events, students, attendance numbers).


2. Prompt for Antigravity (Full Functional Build)

Build a full-stack Event Management and Attendance Tracking web application
called "Campus Connect" for GSFC University, designed to replace an
existing buggy internal app ("WeConnect") and to feel consistent with the
university's existing ecosystem (a "DCS" portal and a "Prayaas" SSO app).

CORE REQUIREMENTS

1. Authentication & Roles
   - Email/ID + password login (structured so it could later be swapped
     for real university SSO).
   - Three roles: Student, Organizer (faculty/staff who run events),
     Admin.
   - Role-based access control on every route/API endpoint.

2. Event Management
   - Organizers can create, edit, cancel events with: title, description,
     category, date/time, venue, capacity, registration deadline,
     approval-required flag, banner image.
   - Students can browse/search/filter events (by category, date,
     department) and register (respecting capacity and deadlines).
   - Waitlist support when an event is full.
   - Admins can review and approve/reject newly created events before
     they go public (optional toggle).

3. Attendance Tracking (this is the part that must be rock solid — the
   old app failed here)
   - Each event generates a unique, time-bound QR code for check-in.
   - Students scan the QR code via the app camera to mark attendance.
   - The check-in flow MUST work offline: if the device has no
     connectivity, store the check-in locally and sync automatically
     once connectivity returns. No lost attendance records.
   - Prevent duplicate check-ins and proxy attendance (e.g. one scan per
     student per event, QR code rotates/expires every N minutes).
   - Organizers see a live attendance count during the event.

4. Notifications
   - In-app notifications for: new events matching a student's
     department/interests, registration confirmation, reminders (24h and
     1h before an event), event changes or cancellations.
   - (Optional, if feasible) push notifications via web push or a service
     like Firebase Cloud Messaging.

5. Reporting & Analytics
   - Students: personal attendance history, attendance percentage per
     semester, downloadable participation certificate/PDF per event.
   - Organizers: registration list export (CSV), attendance summary per
     event.
   - Admins: cross-department engagement dashboard, exportable reports
     (CSV/PDF), ability to flag low-attendance students.

6. Reliability & Data Integrity
   - Proper error handling everywhere — no silent failures.
   - Input validation on both frontend and backend.
   - Audit log of attendance changes (who marked what, when) to prevent
     disputes.
   - Automated tests for the check-in/attendance flow specifically,
     since reliability there is the main improvement over the old app.

TECH STACK PREFERENCES
- Frontend: React (or Next.js), mobile-responsive, PWA-capable so it can
  be "installed" on phones and work offline.
- Backend: Node.js/Express or similar, REST or GraphQL API.
- Database: PostgreSQL (or similar relational DB) for structured data
  like users, events, registrations, attendance records.
- Auth: JWT-based sessions, structured so SSO can be added later.
- QR generation/scanning: use a standard library (e.g. qrcode for
  generation, a camera-based scanner library on the frontend).
- Deployment-ready structure (environment variables for config, no
  hardcoded secrets).

DELIVERABLE
A working, deployable app with seeded sample data (a handful of events,
student and organizer accounts) so it can be demoed end-to-end: log in as
a student, register for an event, scan a QR to check in (including while
offline), then log in as an organizer/admin to see the attendance and
reports update.


Notes for you

Feed the Lovable prompt in first to get the look/feel and clickable screens nailed down for your presentation slides/demo.

Feed the Antigravity prompt in separately (or after) when you want the actual working functionality (QR check-in, offline sync, reports) built out.

If you want, I can also turn this into a slide deck or one-page proposal doc to present alongside the prototype — just say the word.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b709965f-5a0c-44b0-a1c1-93a5246e1625).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
