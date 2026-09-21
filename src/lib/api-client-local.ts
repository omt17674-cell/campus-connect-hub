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
};
