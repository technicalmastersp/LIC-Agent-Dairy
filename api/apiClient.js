import axios from "axios";
import * as Sentry from "@sentry/react";
import { toastEmitter } from "../utils/toastEmitter";

const apiClient = axios.create({
  // Same-origin path, not the Railway URL directly. vercel.json rewrites
  // /api/* to the Railway backend server-side, so from the browser's
  // point of view every request stays on this site's own origin. That
  // matters for the auth cookie: a cookie set via a cross-origin request
  // (even with SameSite=None; Secure) is still a *third-party* cookie,
  // which Chrome Incognito, Safari Private Browsing, and Firefox's
  // tracking protection block outright regardless of SameSite. Routing
  // through a same-origin path makes it a first-party cookie everywhere.
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  // Still needed even same-origin — withCredentials controls whether the
  // browser attaches/accepts cookies on this axios instance's requests at
  // all. Backend CORS (app.js) also still needs credentials: true, even
  // though the browser now only ever talks to the proxy, not Railway
  // directly.
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
  fetch("/api/auth/logout", {
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
      // Report to Sentry with request context — a no-op if Sentry.init()
      // was never called (dev, or VITE_SENTRY_DSN unset).
      Sentry.captureException(error, {
        extra: {
          url:      error.config?.url,
          method:   error.config?.method,
          status,
          responseData: error.response?.data,
        },
      });
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