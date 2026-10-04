import { getPushConfig, subscribePush, unsubscribePush, getPushStatus } from "../../services/pushService";

// What the settings toggle needs to know about THIS browser/device.
export type PushState =
  | "unsupported"  // browser has no Push API
  | "ios-install"  // iPhone/iPad: only works once added to the Home Screen
  | "unavailable"  // server has no VAPID keys, or no service worker (dev build)
  | "denied"       // user blocked notifications for this site
  | "off"          // available, not enabled for this account on this device
  | "on";

export const isPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// `serviceWorker.ready` never resolves when no SW is registered (e.g.
// `npm run dev`, where the PWA plugin is off) — so race it against a timeout
// instead of hanging the settings page.
const getRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
  return Promise.race([navigator.serviceWorker.ready, timeout]);
};

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const sameKey = (a: ArrayBuffer | null | undefined, b: Uint8Array) => {
  if (!a) return false;
  const x = new Uint8Array(a);
  return x.length === b.length && x.every((v, i) => v === b[i]);
};

export async function getPushState(): Promise<PushState> {
  if (!isPushSupported()) return isIos() && !isStandalone() ? "ios-install" : "unsupported";

  const config = await getPushConfig();
  if (!config.enabled) return "unavailable";
  if (Notification.permission === "denied") return "denied";

  const reg = await getRegistration();
  if (!reg) return "unavailable";

  const sub = await reg.pushManager.getSubscription();
  if (!sub) return "off";
  // A subscription can linger from a previous account on a shared computer —
  // only report "on" if the SERVER has it registered to the current user.
  return (await getPushStatus(sub.endpoint)) ? "on" : "off";
}

/** Must be called from a user gesture (click) — browsers block the permission prompt otherwise. */
export async function enablePush(): Promise<PushState> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";

  const config = await getPushConfig();
  if (!config.enabled || !config.publicKey) return "unavailable";
  const reg = await getRegistration();
  if (!reg) return "unavailable";

  const serverKey = urlBase64ToUint8Array(config.publicKey);
  let sub = await reg.pushManager.getSubscription();
  // If the server's VAPID key was ever rotated, the old subscription can
  // never receive anything again — replace it.
  if (sub && !sameKey(sub.options?.applicationServerKey, serverKey)) {
    await sub.unsubscribe();
    sub = null;
  }
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: serverKey as BufferSource,
    });
  }

  await subscribePush(sub.toJSON());
  return "on";
}

export async function disablePush(): Promise<void> {
  if (!isPushSupported()) return;
  const reg = await getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  await unsubscribePush(sub.endpoint);
  await sub.unsubscribe();
}

/**
 * For logout: stop THIS device receiving the signed-out user's notifications.
 * Never throws and never delays logout by more than a few seconds.
 */
export async function disablePushQuietly(): Promise<void> {
  try {
    await Promise.race([disablePush(), new Promise<void>((resolve) => setTimeout(resolve, 3000))]);
  } catch {
    /* logout must always succeed */
  }
}
