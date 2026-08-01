// Centralized route paths — avoids magic strings across Sidebar/Routes/redirects
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  LIVE_DETECTION: '/live-detection',
  HISTORY: '/history',
  SETTINGS: '/settings',
};

// Generic connection/status labels reused by StatusBadge-style UI across pages
export const STATUS = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  OK: 'OK',
  DEFECT: 'DEFECT',
  IDLE: 'IDLE',
};

export const APP_NAME = 'Fabricon';

// localStorage key for the persisted admin session ({ token, admin }).
// Must match the key axiosInstance.js reads when attaching the Bearer token.
export const AUTH_STORAGE_KEY = 'fabricon_admin_session';