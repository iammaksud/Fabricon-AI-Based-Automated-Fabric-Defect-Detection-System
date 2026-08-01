import axiosInstance from './axiosInstance';
import { AUTH_STORAGE_KEY } from '../utils/constants';

// Normalizes the backend's AdminResponse (id, username, email, role, ...)
// into the { name, email, role } shape the UI (Topbar, etc.) already expects.
// The backend has no "name" field, so username is used as the display name.
const toDisplayAdmin = (adminResponse) => ({
  id: adminResponse.id,
  name: adminResponse.username,
  email: adminResponse.email,
  role: adminResponse.role,
});

export const authService = {
  /**
   * Logs in against POST /api/auth/login, then fetches the admin's profile
   * via GET /api/auth/me, and persists { token, user } to localStorage.
   * Throws an Error with a user-facing message on failure.
   */
  async login(email, password) {
    let tokenResponse;
    try {
      const response = await axiosInstance.post('/auth/login', {
        email: email.trim(),
        password,
      });
      tokenResponse = response.data;
    } catch (error) {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;
      if (status === 401) {
        throw new Error(detail || 'Invalid email or password. Please try again.');
      }
      if (status === 403) {
        throw new Error(detail || 'This admin account is deactivated.');
      }
      throw new Error(
        detail || 'Unable to reach the server. Please check your connection and try again.'
      );
    }

    const { access_token: token } = tokenResponse;

    // Fetch the admin profile using the freshly issued token. axiosInstance's
    // request interceptor reads the token from localStorage, so it must be
    // saved (even provisionally) before this call goes out.
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token, user: null, loginAt: new Date().toISOString() })
    );

    let adminResponse;
    try {
      const meResponse = await axiosInstance.get('/auth/me');
      adminResponse = meResponse.data;
    } catch (error) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      throw new Error('Logged in, but could not load admin profile. Please try again.');
    }

    const session = {
      token,
      user: toDisplayAdmin(adminResponse),
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getSession() {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  },

  isAuthenticated() {
    const session = this.getSession();
    return Boolean(session && session.token);
  },
};