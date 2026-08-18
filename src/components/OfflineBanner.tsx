import { useEffect, useState } from "react";
import { WifiOff, X } from "lucide-react";

/**
 * Proactively tells the user they've lost their network connection, instead
 * of waiting for the next failed API call (apiClient.js's `!error.response`
 * toast handles that reactive case already). Listens to the browser's
 * online/offline events and shows a persistent banner while offline.
 *
 * The banner can be dismissed, but reappears the next time the connection
 * actually drops again — dismissing it doesn't silence future outages.
 */
const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setDismissed(false); // a fresh outage always gets shown, even if a past one was dismissed
    };
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-3 border-b border-destructive/50 bg-destructive text-destructive-foreground px-4 py-2.5 text-sm shadow-sm"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span className="font-medium">
        You're offline — check your internet connection.
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss offline notice"
        className="ml-1 shrink-0 rounded-full p-0.5 hover:bg-destructive-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive-foreground/60"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default OfflineBanner;
