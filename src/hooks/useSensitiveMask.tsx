import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getCurrentUser, setCurrentUser } from "@/utils/auth";
import { USER_UPDATED_EVENT } from "@/utils/userEvents";
import { getPrivacySettings, updatePrivacySettings } from "../../services/userService";
import { toast } from "@/hooks/use-toast";
import type { SensitiveFieldKey } from "@/config/sensitiveDataRegistry";

// App-wide state of the Hide/Show sensitive-data button.
//   enabled — the backend master switch (SENSITIVE_MASKING_ENABLED) is on
//   hidden  — enabled AND this account's saved choice is "hide"  ← what the UI follows
// The saved choice lives in the DB (userPersonalInfo[0].maskSensitiveData) and
// reaches the client on the cached `currentUser` (login / GET /auth/profile);
// this provider keeps that cache and the DB in step when the button is pressed.

interface SensitiveMaskContextValue {
  enabled: boolean;
  hidden: boolean;
  saving: boolean;
  toggle: () => Promise<void>;
}

// Default (no provider mounted — e.g. a component rendered alone in a test):
// feature off, nothing masked, so existing behavior is untouched.
const SensitiveMaskContext = createContext<SensitiveMaskContextValue>({
  enabled: false,
  hidden: false,
  saving: false,
  toggle: async () => {},
});

const readFromCache = () => {
  const u = getCurrentUser();
  return {
    signedIn: !!u,
    enabled: !!u && u.sensitiveMaskingEnabled !== false,
    pref: u?.maskSensitiveData === true,
    known: u?.maskSensitiveData !== undefined,
  };
};

export function SensitiveMaskProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(readFromCache);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  // Re-read the cache whenever it changes: same tab (setCurrentUser fires our
  // event) or another tab (the browser's `storage` event).
  useEffect(() => {
    const sync = () => setState(readFromCache());
    const onStorage = (e: StorageEvent) => { if (e.key === "currentUser" || e.key === null) sync(); };
    window.addEventListener(USER_UPDATED_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(USER_UPDATED_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // One quiet refresh per app load for a signed-in user: picks up a choice made
  // on another device (admin pages, for one, never re-fetch the profile), and
  // fills in the value for an old cached login that predates this feature.
  useEffect(() => {
    if (!readFromCache().signedIn) return;
    let cancelled = false;
    getPrivacySettings()
      .then((s: { featureEnabled: boolean; maskSensitiveData: boolean }) => {
        const u = getCurrentUser();
        if (cancelled || !u) return;
        if (u.maskSensitiveData !== s.maskSensitiveData || u.sensitiveMaskingEnabled !== s.featureEnabled) {
          setCurrentUser({ ...u, maskSensitiveData: s.maskSensitiveData, sensitiveMaskingEnabled: s.featureEnabled });
        }
      })
      .catch(() => { /* non-fatal — keep whatever the cache says */ });
    return () => { cancelled = true; };
  }, []);

  const toggle = useCallback(async () => {
    const u = getCurrentUser();
    if (!u || savingRef.current) return; // ignore double-clicks while a save is in flight
    const previous = u.maskSensitiveData === true;
    const next = !previous;

    savingRef.current = true;
    setSaving(true);
    // Optimistic: flip immediately so the screen hides/reveals at once.
    setCurrentUser({ ...u, maskSensitiveData: next });
    try {
      const res = await updatePrivacySettings(next);
      const saved = res?.data;
      if (saved && typeof saved.maskSensitiveData === "boolean") {
        const latest = getCurrentUser();
        if (latest) setCurrentUser({ ...latest, maskSensitiveData: saved.maskSensitiveData, sensitiveMaskingEnabled: saved.featureEnabled });
      }
    } catch (err) {
      // Roll back so what's on screen matches what's stored.
      const latest = getCurrentUser();
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
      if (latest) {
        setCurrentUser({
          ...latest,
          maskSensitiveData: previous,
          ...(code === "FEATURE_DISABLED" ? { sensitiveMaskingEnabled: false } : {}),
        });
      }
      toast({
        title: code === "FEATURE_DISABLED" ? "Feature unavailable" : "Couldn't save your choice",
        description: code === "FEATURE_DISABLED"
          ? "Hiding sensitive data is currently turned off."
          : "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, []);

  const value = useMemo<SensitiveMaskContextValue>(
    () => ({ enabled: state.enabled, hidden: state.enabled && state.pref, saving, toggle }),
    [state.enabled, state.pref, saving, toggle],
  );

  return <SensitiveMaskContext.Provider value={value}>{children}</SensitiveMaskContext.Provider>;
}

export const useSensitiveMask = () => useContext(SensitiveMaskContext);

/**
 * className for a text <input> that holds a registered sensitive field: while
 * data is hidden it shows dots instead of the value (CSS only — the value is
 * untouched, so editing, validation and submit keep working). Pair with
 * `autoComplete="off"`. Empty string when data is visible.
 */
export function useSensitiveInputClass(_field: SensitiveFieldKey): string {
  const { hidden } = useSensitiveMask();
  return hidden ? "sensitive-input" : "";
}
