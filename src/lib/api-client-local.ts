/**
 * GSFC Campus Connect Hub - Local API Client
 * Connects to local Express auth server (no external APIs)
 */

const API_BASE_URL = import.meta.env.VITE_AUTH_SERVER_URL || "http://localhost:5001";

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: "student" | "admin" | "organizer";
    rollNo?: string;
    avatar?: string;
  };
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin" | "organizer";
  rollNo?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export const localApiClient = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string, role?: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error. Check if auth server is running on port 5001." };
    }
  },

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    name: string,
    rollNo?: string,
    role: string = "student"
  ): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, rollNo, role }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error during registration." };
    }
  },

  /**
   * Google OAuth Login (local simulation)
   */
  async loginWithGoogle(email: string, name?: string, rollNo?: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, rollNo }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error with Google login." };
    }
  },

  /**
   * Verify if a JWT token is valid
   */
  async verifyToken(token: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error verifying token." };
    }
  },

  /**
   * Get current user profile (requires valid token)
   */
  async getCurrentUser(token: string): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error fetching user profile." };
    }
  },

  /**
   * Logout user
   */
  async logout(token: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error during logout." };
    }
  },

  /**
   * Health check
   */
  async health(): Promise<{ status: string; server?: string; timestamp?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      return await res.json();
    } catch (e) {
      return { status: "offline" };
    }
  },

  /**
   * EVENTS API
   */

  /**
   * Get all events
   */
  async getEvents(): Promise<{ success: boolean; events?: any[]; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events`);
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error fetching events." };
    }
  },

  /**
   * Get event details
   */
  async getEventDetails(eventId: string): Promise<{ success: boolean; event?: any; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error fetching event." };
    }
  },

  /**
   * Create event (Admin only)
   */
  async createEvent(
    token: string,
    eventData: {
      title: string;
      description: string;
      category: string;
      date: string;
      time: string;
      venue: string;
      capacity: number;
      bannerImage?: string;
    }
  ): Promise<{ success: boolean; event?: any; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error creating event." };
    }
  },

  /**
   * Update event (Admin only)
   */
  async updateEvent(
    token: string,
    eventId: string,
    eventData: Partial<{
      title: string;
      description: string;
      date: string;
      time: string;
      venue: string;
      status: string;
      capacity: number;
    }>
  ): Promise<{ success: boolean; event?: any; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error updating event." };
    }
  },

  /**
   * Delete event (Admin only)
   */
  async deleteEvent(token: string, eventId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error deleting event." };
    }
  },

  /**
   * Register for event (Student)
   */
  async registerForEvent(
    token: string,
    eventId: string
  ): Promise<{ success: boolean; registration?: any; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error registering for event." };
    }
  },

  /**
   * Get event registrations (Admin only)
   */
  async getEventRegistrations(
    token: string,
    eventId: string
  ): Promise<{ success: boolean; registrations?: any[]; count?: number; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}/registrations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error fetching registrations." };
    }
  },

  /**
   * Get my registered events (Student)
   */
  async getMyEvents(token: string): Promise<{ success: boolean; events?: any[]; count?: number; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/events`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error fetching my events." };
    }
  },
};
