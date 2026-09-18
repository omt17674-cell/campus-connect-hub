// GSFC University Campus Connect Hub — Typed API Client

export const apiClient = {
  async getHealth() {
    try {
      const res = await fetch("/api/health");
      return await res.json();
    } catch (e) {
      return { status: "offline", error: String(e) };
    }
  },

  async loginWithCredentials(identifier: string, role: string, password?: string) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, role, password }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error contacting server." };
    }
  },

  async loginWithGoogle(email?: string, name?: string, rollNo?: string) {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, rollNo }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Google SSO network error." };
    }
  },

  async checkAccountExists(rollNo: string, email: string) {
    try {
      const res = await fetch("/api/auth/check-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNo, email }),
      });
      return await res.json();
    } catch (e) {
      return { exists: false, message: "Network error checking account." };
    }
  },

  async sendOtp(mobileNumber: string, purpose: "login" | "attendance" = "login") {
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, purpose }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Failed to send OTP. Check network connection." };
    }
  },

  async verifyOtp(mobileNumber: string, code: string, purpose: "login" | "attendance" = "login", role?: string) {
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber, code, purpose, role }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Failed to verify OTP. Check network connection." };
    }
  },

  async fetchEvents(category?: string) {
    try {
      const url = category ? `/api/events?category=${encodeURIComponent(category)}` : "/api/events";
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      return { success: false, events: [] };
    }
  },

  async registerForEvent(payload: {
    eventId: string;
    userId: string;
    userRollNo: string;
    userName: string;
    department: string;
    isTeam?: boolean;
    teamName?: string;
  }) {
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Failed to register with server." };
    }
  },

  async recordCheckIn(payload: {
    eventId: string;
    userId: string;
    userRollNo: string;
    userName: string;
    department: string;
    token: string;
    locationData?: { latitude: number; longitude: number; distanceMeters: number; verified: boolean };
  }) {
    try {
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Failed to record check-in on server." };
    }
  },

  async verifyCertificate(certificateId: string) {
    try {
      const res = await fetch(`/api/certificates/verify?id=${encodeURIComponent(certificateId)}`);
      return await res.json();
    } catch (e) {
      return { success: false, verified: false, message: "Verification server unreachable." };
    }
  },

  async fetchClubs() {
    try {
      const res = await fetch("/api/clubs");
      return await res.json();
    } catch (e) {
      return { success: false, clubs: [] };
    }
  },

  async joinClub(payload: {
    clubId: string;
    userId: string;
    userName: string;
    userRollNo: string;
    department: string;
  }) {
    try {
      const res = await fetch("/api/clubs/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Failed to join club on server." };
    }
  },

  async getEventRegistrations(eventId?: string) {
    try {
      const url = eventId ? `/api/events/${encodeURIComponent(eventId)}/registrations` : "/api/registrations";
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      return { success: false, registrations: [] };
    }
  },

  async updateStudentProfile(payload: {
    studentId: string;
    school?: string;
    department?: string;
    degree?: string;
    semester?: number;
    residenceType?: "hostel" | "dayscholar";
    hostelBlockOrBusRoute?: string;
    clubsInterested?: string[];
    verifiedByUniversity?: boolean;
  }) {
    try {
      const res = await fetch("/api/students/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error updating student profile." };
    }
  },

  async queryAiAssistant(prompt: string, userRole?: string, userId?: string) {
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, userRole, userId }),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },
};

