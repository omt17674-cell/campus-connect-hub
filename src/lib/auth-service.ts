// ============================================================================
// Auth Service - Communicates with Express Auth Server
// ============================================================================

const AUTH_SERVER_URL = import.meta.env.VITE_AUTH_SERVER_URL || 'http://localhost:5001';

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: 'admin' | 'organizer' | 'student';
    };
  };
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'organizer' | 'student';
}

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;

  constructor() {
    this.loadFromLocalStorage();
  }

  // Load auth state from localStorage
  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('auth_state');
      if (stored) {
        const { token, refreshToken, user } = JSON.parse(stored);
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = user;
      }
    } catch (err) {
      console.error('[AuthService] Error loading from localStorage:', err);
    }
  }

  // Save auth state to localStorage
  private saveToLocalStorage() {
    try {
      localStorage.setItem(
        'auth_state',
        JSON.stringify({
          token: this.token,
          refreshToken: this.refreshToken,
          user: this.user,
        })
      );
    } catch (err) {
      console.error('[AuthService] Error saving to localStorage:', err);
    }
  }

  // Email/Password Login
  async loginWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.data) {
        this.token = data.data.token;
        this.refreshToken = data.data.refreshToken;
        this.user = data.data.user;
        this.saveToLocalStorage();
      }

      return data;
    } catch (error: any) {
      console.error('[AuthService] Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed',
        error: error.message,
      };
    }
  }

  // Verify Token
  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    if (!this.token) {
      return { valid: false };
    }

    try {
      const response = await fetch(`${AUTH_SERVER_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return { valid: true, user: data.data?.user };
        }
      }

      return { valid: false };
    } catch (error) {
      console.error('[AuthService] Token verification error:', error);
      return { valid: false };
    }
  }

  // Refresh Token
  async refreshAccessToken(): Promise<{ success: boolean; token?: string }> {
    if (!this.refreshToken) {
      return { success: false };
    }

    try {
      const response = await fetch(`${AUTH_SERVER_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        this.token = data.data.token;
        this.saveToLocalStorage();
        return { success: true, token: data.data.token };
      }

      return { success: false };
    } catch (error: any) {
      console.error('[AuthService] Token refresh error:', error);
      return { success: false };
    }
  }

  // Google OAuth Login
  initiateGoogleLogin() {
    window.location.href = `${AUTH_SERVER_URL}/auth/google`;
  }

  // Handle Google OAuth Callback
  async handleAuthCallback(token: string, refreshToken: string, userJson: string) {
    try {
      const user = JSON.parse(userJson);
      this.token = token;
      this.refreshToken = refreshToken;
      this.user = user;
      this.saveToLocalStorage();
      return { success: true, user };
    } catch (error) {
      console.error('[AuthService] Auth callback error:', error);
      return { success: false, error };
    }
  }

  // Logout
  logout() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    localStorage.removeItem('auth_state');
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Get current user
  getUser(): User | null {
    return this.user;
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.token !== null && this.user !== null;
  }
}

export const authService = new AuthService();
