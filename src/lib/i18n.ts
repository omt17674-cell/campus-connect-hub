import { Language } from "./types";

export interface Translations {
  appName: string;
  universityName: string;
  tagline: string;
  roles: {
    student: string;
    organizer: string;
    admin: string;
  };
  nav: {
    home: string;
    myEvents: string;
    scan: string;
    gamification: string;
    alerts: string;
    profile: string;
    adminOverview: string;
    eventApprovals: string;
    attendanceAlerts: string;
    auditLogs: string;
    organizerDashboard: string;
    createEvent: string;
    liveAttendance: string;
  };
  common: {
    register: string;
    registered: string;
    waitlist: string;
    waitlisted: string;
    seatsLeft: string;
    capacityReached: string;
    searchEvents: string;
    allCategories: string;
    downloadCertificate: string;
    rateEvent: string;
    addToCalendar: string;
    offlineMode: string;
    synced: string;
    syncNow: string;
    queuePending: string;
    live: string;
    completed: string;
    upcoming: string;
    exportCsv: string;
    streak: string;
    attendanceRate: string;
    points: string;
    volunteerHours: string;
    viewDetails: string;
    close: string;
    submit: string;
    cancel: string;
    approved: string;
    rejected: string;
    pending: string;
    teamRegister: string;
  };
  scan: {
    title: string;
    subtitle: string;
    scanInstruction: string;
    simulateSuccess: string;
    scanSuccess: string;
    scanFailure: string;
    offlineSaved: string;
    alreadyCheckedIn: string;
  };
  gamification: {
    title: string;
    subtitle: string;
    leaderboard: string;
    badgesTitle: string;
    rank: string;
    level: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "Campus Connect",
    universityName: "GSFC University",
    tagline: "Official Event & Attendance Ecosystem",
    roles: {
      student: "Student",
      organizer: "Faculty Organizer",
      admin: "Administrator",
    },
    nav: {
      home: "Home",
      myEvents: "My Events",
      scan: "QR Check-in",
      gamification: "Leaderboard & XP",
      alerts: "Notifications",
      profile: "Profile",
      adminOverview: "Campus Pulse",
      eventApprovals: "Approvals",
      attendanceAlerts: "Attendance Flags",
      auditLogs: "Audit Trail",
      organizerDashboard: "Events Hub",
      createEvent: "Create Event",
      liveAttendance: "Live Attendance",
    },
    common: {
      register: "Register",
      registered: "Registered",
      waitlist: "Join Waitlist",
      waitlisted: "Waitlisted",
      seatsLeft: "seats left",
      capacityReached: "Capacity reached",
      searchEvents: "Search events, workshops, hackathons...",
      allCategories: "All Categories",
      downloadCertificate: "Download Certificate (PDF)",
      rateEvent: "Rate & Review",
      addToCalendar: "Add to Calendar",
      offlineMode: "Offline Mode",
      synced: "All check-ins synced",
      syncNow: "Sync Now",
      queuePending: "queued offline check-ins",
      live: "LIVE NOW",
      completed: "Completed",
      upcoming: "Upcoming",
      exportCsv: "Export CSV Report",
      streak: "Day Streak",
      attendanceRate: "Semester Attendance",
      points: "XP Points",
      volunteerHours: "Volunteer Hours",
      viewDetails: "View Details",
      close: "Close",
      submit: "Submit",
      cancel: "Cancel",
      approved: "Approved",
      rejected: "Rejected",
      pending: "Pending Review",
      teamRegister: "Team Registration",
    },
    scan: {
      title: "QR Attendance Scanner",
      subtitle: "Instant presence marking with cryptographic rotating verification",
      scanInstruction: "Align the rotating event QR code inside the frame to record your presence.",
      simulateSuccess: "Simulate Live QR Scan",
      scanSuccess: "Attendance Marked & Verified!",
      scanFailure: "Invalid or Expired QR Code",
      offlineSaved: "Saved locally. Will sync automatically when online.",
      alreadyCheckedIn: "You have already checked in for this event.",
    },
    gamification: {
      title: "Campus League & Achievements",
      subtitle: "Earn XP, unlock verified badges, and climb the university leaderboard.",
      leaderboard: "Leaderboard",
      badgesTitle: "Earned Badges",
      rank: "Rank",
      level: "Level",
    },
  },
  gu: {
    appName: "કેમ્પસ કનેક્ટ",
    universityName: "જીએસએફસી યુનિવર્સિટી",
    tagline: "સત્તાવાર ઇવેન્ટ અને હાજરી પોર્ટલ",
    roles: {
      student: "વિદ્યાર્થી",
      organizer: "ફેકલ્ટી આયોજક",
      admin: "સંચાલક (એડમિન)",
    },
    nav: {
      home: "મુખ્ય પૃષ્ઠ",
      myEvents: "મારી ઇવેન્ટ્સ",
      scan: "ક્યૂઆર સ્કેન",
      gamification: "લીડરબોર્ડ અને એક્સપી",
      alerts: "સૂચનાઓ",
      profile: "પ્રોફાઇલ",
      adminOverview: "વિહંગાવલોકન",
      eventApprovals: "મંજૂરીઓ",
      attendanceAlerts: "હાજરી ચેતવણીઓ",
      auditLogs: "ઓડિટ લોગ",
      organizerDashboard: "ઇવેન્ટ નિયંત્રણ",
      createEvent: "નવી ઇવેન્ટ બનાવો",
      liveAttendance: "લાઈવ હાજરી",
    },
    common: {
      register: "નોંધણી કરો",
      registered: "નોંધાયેલ છે",
      waitlist: "વેઇટલિસ્ટમાં જોડાઓ",
      waitlisted: "વેઇટલિસ્ટમાં",
      seatsLeft: "જગ્યાઓ બાકી",
      capacityReached: "જગ્યા ભરાઈ ગઈ છે",
      searchEvents: "ઇવેન્ટ્સ, વર્કશોપ શોધો...",
      allCategories: "બધી શ્રેણીઓ",
      downloadCertificate: "પ્રમાણપત્ર ડાઉનલોડ કરો (PDF)",
      rateEvent: "પ્રતિસાદ આપો",
      addToCalendar: "કેલેન્ડરમાં ઉમેરો",
      offlineMode: "ઓફલાઇન સ્થિતિ",
      synced: "બધા ડેટા સિંક થયા છે",
      syncNow: "હમણાં સિંક કરો",
      queuePending: "ઓફલાઇન ચેક-ઇન કતારમાં",
      live: "ચાલુ છે",
      completed: "પૂર્ણ થયેલ",
      upcoming: "આગામી",
      exportCsv: "CSV રિપોર્ટ ડાઉનલોડ",
      streak: "દૈનિક ક્રમ",
      attendanceRate: "સેમેસ્ટર હાજરી",
      points: "પોઈન્ટ્સ (XP)",
      volunteerHours: "સ્વયંસેવક કલાકો",
      viewDetails: "વિગતો જુઓ",
      close: "બંધ કરો",
      submit: "સબમિટ કરો",
      cancel: "રદ કરો",
      approved: "મંજૂર",
      rejected: "અસ્વીકાર",
      pending: "સમીક્ષા બાકી",
      teamRegister: "ટીમ નોંધણી",
    },
    scan: {
      title: "ક્યૂઆર હાજરી સ્કેનર",
      subtitle: "સુરક્ષિત રોટેટિંગ ક્યૂઆર કોડ સાથે ત્વરિત હાજરી",
      scanInstruction: "તમારી હાજરી નોંધવા માટે ઇવેન્ટ ક્યૂઆર કોડ સ્કેન કરો.",
      simulateSuccess: "ક્યૂઆર સ્કેન સિમ્યુલેટ કરો",
      scanSuccess: "હાજરી સફળતાપૂર્વક નોંધાઈ ગઈ છે!",
      scanFailure: "અમાન્ય અથવા એક્સપાયર થયેલ ક્યૂઆર કોડ",
      offlineSaved: "ઓફલાઇન સાચવેલ છે. નેટવર્ક આવતાં જ સિંક થશે.",
      alreadyCheckedIn: "તમે આ ઇવેન્ટ માટે પહેલાથી જ હાજરી નોંધાવી છે.",
    },
    gamification: {
      title: "કેમ્પસ લીગ અને સિદ્ધિઓ",
      subtitle: "XP કમાઓ, બેજ અનલોક કરો અને લીડરબોર્ડ પર આગળ વધો.",
      leaderboard: "લીડરબોર્ડ",
      badgesTitle: "મેળવેલ બેજ",
      rank: "ક્રમ",
      level: "લેવલ",
    },
  },
  hi: {
    appName: "कैंपस कनेक्ट",
    universityName: "जीएसएफसी यूनिवर्सिटी",
    tagline: "आधिकारिक इवेंट एवं उपस्थिति प्रणाली",
    roles: {
      student: "छात्र",
      organizer: "संकाय आयोजक",
      admin: "प्रशासक (एडमिन)",
    },
    nav: {
      home: "मुख्य पृष्ठ",
      myEvents: "मेरे इवेंट्स",
      scan: "क्यूआर उपस्थिति",
      gamification: "लीडरबोर्ड और एक्सपी",
      alerts: "सूचनाएं",
      profile: "प्रोफ़ाइल",
      adminOverview: "गतिविधि डैशबोर्ड",
      eventApprovals: "स्वीकृतियां",
      attendanceAlerts: "उपस्थिति अलर्ट",
      auditLogs: "ऑडिट रिकॉर्ड",
      organizerDashboard: "आयोजक हब",
      createEvent: "नया इवेंट बनाएं",
      liveAttendance: "लाइव उपस्थिति",
    },
    common: {
      register: "पंजीकरण करें",
      registered: "पंजीकृत",
      waitlist: "प्रतीक्षा सूची में जुड़ें",
      waitlisted: "प्रतीक्षा सूची में",
      seatsLeft: "सीटें शेष",
      capacityReached: "सीटें भर चुकी हैं",
      searchEvents: "इवेंट्स, वर्कशॉप खोजें...",
      allCategories: "सभी श्रेणियां",
      downloadCertificate: "प्रमाणपत्र डाउनलोड करें (PDF)",
      rateEvent: "रेटिंग और समीक्षा",
      addToCalendar: "कैलेंडर में जोड़ें",
      offlineMode: "ऑफलाइन मोड",
      synced: "सभी रिकॉर्ड सिंक हो गए हैं",
      syncNow: "अभी सिंक करें",
      queuePending: "ऑफलाइन उपस्थिति कतार में",
      live: "लाइव चल रहा है",
      completed: "समाप्त",
      upcoming: "आगामी",
      exportCsv: "CSV रिपोर्ट निर्यात करें",
      streak: "दैनिक स्ट्रीक",
      attendanceRate: "सेमेस्टर उपस्थिति",
      points: "एक्सपी पॉइंट्स",
      volunteerHours: "स्वयंसेवक घंटे",
      viewDetails: "विवरण देखें",
      close: "बंद करें",
      submit: "जमा करें",
      cancel: "रद्द करें",
      approved: "स्वीकृत",
      rejected: "अस्वीकृत",
      pending: "समीक्षा जारी",
      teamRegister: "टीम पंजीकरण",
    },
    scan: {
      title: "क्यूआर उपस्थिति स्कैनर",
      subtitle: "सुरक्षित रोटेटिंग क्यूआर कोड से त्वरित उपस्थिति दर्ज करें",
      scanInstruction: "उपस्थिति दर्ज करने के लिए इवेंट क्यूआर कोड को स्कैन करें।",
      simulateSuccess: "क्यूआर स्कैन अनुकरण करें",
      scanSuccess: "उपस्थिति सफलतापूर्वक दर्ज और सत्यापित!",
      scanFailure: "अमान्य या समाप्त क्यूआर कोड",
      offlineSaved: "ऑफलाइन सहेजा गया। नेटवर्क आने पर सिंक हो जाएगा।",
      alreadyCheckedIn: "आप इस इवेंट के लिए पहले ही उपस्थिति दर्ज करा चुके हैं।",
    },
    gamification: {
      title: "कैंपस लीग और उपलब्धियां",
      subtitle: "एक्सपी अर्जित करें, बैज अनलॉक करें और लीडरबोर्ड में शीर्ष पर पहुंचें।",
      leaderboard: "लीडरबोर्ड",
      badgesTitle: "प्राप्त बैज",
      rank: "रैंक",
      level: "लेवल",
    },
  },
};
