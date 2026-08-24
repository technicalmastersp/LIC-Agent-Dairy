import axios from "axios";
import { toastEmitter } from "../utils/toastEmitter";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  // Auth now lives in an httpOnly cookie set by the backend (see
  // authController.js's setTokenCookie) instead of a token the frontend
  // reads and attaches itself — withCredentials tells the browser to send
  // that cookie on every request and to accept Set-Cookie from responses.
  // Requires the backend's CORS config to echo back a specific origin
  // (never "*") with credentials: true — see app.js.
  withCredentials: true,
});

// No request interceptor needed anymore — the browser attaches the auth
// cookie automatically on every request to the API's origin.

// Auth now lives in an httpOnly cookie the browser controls — client JS
// can no longer read or clear it directly (that's the whole point of
// httpOnly). So wherever this file used to just localStorage.clear() and
// redirect on a 401, it now also has to ask the server to clear the
// cookie via /auth/logout, or the browser keeps sending the stale cookie
// on every request after the "logged out" redirect. Fired via plain
// fetch() (not apiClient) so it can't recurse into this same interceptor.
const clearServerSession = () => {
  fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {
    // Best-effort — if this fails the cookie just sits until its own
    // expiry; the server still rejects it on every request in the
    // SESSION_INVALIDATED (tokenVersion mismatch) case, so there's no
    // security regression, only slightly untidy browser state.
  });
};

// ── Response: global error handling ──────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response, // 2xx — pass through, no toast

  (error) => {
    // Network error (no response at all)
    if (!error.response) {
      toastEmitter.emit({
        title:       "Network Error",
        description: "Please check your internet connection and try again.",
        variant:     "destructive",
      });
      return Promise.reject(error);
    }

    const status  = error.response.status;
    const message = error.response.data?.message || "Something went wrong.";
    const code    = error.response.data?.code;

    // 401 — unauthorized / session expired
    if (status === 401) {
      const code = error.response?.data?.code;

      if (code === "SESSION_INVALIDATED") {
        // Clear everything and redirect with a message
        clearServerSession();
        localStorage.clear();
        window.location.href = "/login?reason=session_ended";
        return Promise.reject(error);
      }
      
      toastEmitter.emit({
        title:       "Session Expired",
        description: "Please login again.",
        variant:     "destructive",
      });
      clearServerSession();
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 403 — forbidden (subscription expired, downgrade blocked, etc.)
    if (status === 403) {
      // Subscription-specific codes — redirect, don't just toast
      if (code === "SUBSCRIPTION_EXPIRED" || code === "SUBSCRIPTION_INACTIVE") {
        window.location.href = "/our-plans?reason=expired";
        return Promise.reject(error);
      }
      if (code === "NO_SUBSCRIPTION") {
        window.location.href = "/our-plans?reason=no-plan";
        return Promise.reject(error);
      }
      // Other 403s — show toast
      toastEmitter.emit({ title: "Access Denied", description: message, variant: "destructive" });
      return Promise.reject(error);
    }

    // 404 — not found
    if (status === 404) {
      toastEmitter.emit({ title: "Not Found", description: message, variant: "destructive" });
      return Promise.reject(error);
    }

    // 409 — conflict (duplicate plan, etc.)
    if (status === 409) {
      toastEmitter.emit({ title: "Conflict", description: message, variant: "destructive" });
      return Promise.reject(error);
    }

    // 429 — rate limited
    if (status === 429) {
      toastEmitter.emit({
        title:       "Too Many Requests",
        description: message || "Please wait a moment before trying again.",
        variant:     "destructive",
      });
      return Promise.reject(error);
    }

    // 500+ — server errors
    if (status >= 500) {
      toastEmitter.emit({
        title:       "Server Error",
        description: "Something went wrong on our end. Please try again later.",
        variant:     "destructive",
      });
      return Promise.reject(error);
    }

    // All other 4xx — show the API message directly
    toastEmitter.emit({ title: "Error", description: message, variant: "destructive" });
    return Promise.reject(error);
  }
);

export default apiClient;