/* Push handling for the app's service worker.
 *
 * This file is pulled into the Workbox-generated service worker via
 * `workbox.importScripts` in vite.config.ts, so the existing caching setup is
 * untouched — this only adds "show a notification when the server pushes one"
 * and "open the right page when it's tapped".
 *
 * Browsers REQUIRE every push to result in a visible notification, so the
 * handler shows one even if the payload can't be parsed.
 */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }

  const title = typeof data.title === "string" && data.title ? data.title : "New notification";
  const options = {
    body: typeof data.body === "string" ? data.body : "",
    icon: "/pwa-icons/icon-192.png",
    badge: "/pwa-icons/icon-192.png",
    // Same tag = replace the previous notification instead of stacking
    // (today's daily reminder replaces yesterday's); renotify re-alerts.
    tag: typeof data.tag === "string" && data.tag ? data.tag : undefined,
    renotify: typeof data.tag === "string" && !!data.tag,
    data: { url: typeof data.url === "string" ? data.url : "/home" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Only ever open a page on THIS site, whatever the payload says.
  let target = "/home";
  try {
    const raw = event.notification.data && event.notification.data.url;
    const u = new URL(raw, self.location.origin);
    if (u.origin === self.location.origin) target = u.pathname + u.search + u.hash;
  } catch (e) {
    /* keep default */
  }

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (client.url.startsWith(self.location.origin)) {
          await client.focus();
          if ("navigate" in client) {
            try { await client.navigate(target); } catch (e) { /* focus is enough */ }
          }
          return;
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});
