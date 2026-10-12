// Shared by scripts/prerender.mjs (runs inside the browser via
// page.evaluate) and by its unit test. MUST stay self-contained: Playwright
// serialises this function's source, so it can't reference anything outside
// its own body.
//
// WHY THIS EXISTS: by the time a page is snapshotted, <head> usually holds
// TWO copies of canonical / description — the static one that
// copy-prerendered.mjs merged into dist/index.html (the HOME page's values)
// and the one react-helmet-async adds for the current route. Helmet marks the
// tags it manages with a `data-rh` attribute. Taking the *first*
// match (what this used to do) captured the home page's canonical and
// generic description for every page generated after the first build.
// So: prefer Helmet's own tags, and fall back to the LAST match in the
// document (Helmet appends after the static ones), never the first.
export function extractSnapshot() {
  const pick = (selector) => {
    const managed = document.querySelector(`${selector}[data-rh]`);
    if (managed) return managed;
    const all = document.querySelectorAll(selector);
    return all.length ? all[all.length - 1] : null;
  };

  // og:* / twitter:* — one entry per key; a later (Helmet) tag overrides an
  // earlier static one.
  const byKey = new Map();
  document
    .querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]')
    .forEach((el) => {
      const attr = el.hasAttribute("property") ? "property" : "name";
      const key = el.getAttribute("property") || el.getAttribute("name");
      byKey.set(`${attr}:${key}`, { attr, key, value: el.getAttribute("content") || "" });
    });

  return {
    title: document.title,
    description: pick('meta[name="description"]')?.getAttribute("content") ?? null,
    canonical: pick('link[rel="canonical"]')?.getAttribute("href") ?? null,
    ogAndTwitterMeta: Array.from(byKey.values()),
    // Only blocks this page's own <SEO jsonLd> produced — never ones merged
    // into the shell from another page's snapshot.
    jsonLd: Array.from(
      document.querySelectorAll('script[type="application/ld+json"][data-rh]')
    ).map((el) => el.textContent || ""),
    // Work on a COPY of #root with any toast notifications removed, so a
    // transient message ("Not Found", "Network error"...) can never be baked
    // into a snapshot. toastCount lets validateSnapshot() fail loudly: a toast
    // during capture means something errored and the page may not be in its
    // normal state. (Sonner renders li[data-sonner-toast]; Radix toasts render
    // li[role="status"].)
    ...(() => {
      const root = document.getElementById("root");
      if (!root) return { rootHtml: "", toastCount: 0 };
      const clone = root.cloneNode(true);
      const toasts = clone.querySelectorAll('[data-sonner-toast], li[role="status"]');
      const toastCount = toasts.length;
      toasts.forEach((el) => el.remove());
      return { rootHtml: clone.innerHTML, toastCount };
    })(),
  };
}

// Returns a list of human-readable problems; empty list = snapshot is safe to
// commit. Used to refuse writing a bad snapshot instead of shipping it.
export function validateSnapshot(route, snap, productionUrl) {
  const problems = [];
  if (/Something went wrong/i.test(snap.rootHtml)) {
    problems.push("page rendered the app's error screen (an API call probably failed during prerender)");
  }
  if (!snap.canonical) {
    problems.push("no canonical URL found");
  } else {
    const expected = new URL(route, productionUrl).href;
    if (snap.canonical !== expected) {
      problems.push(`canonical is ${snap.canonical}, expected ${expected}`);
    }
  }
  if (snap.toastCount > 0) {
    problems.push(`${snap.toastCount} error/notification toast(s) were on screen during capture (a failed API call?)`);
  }
  if (!snap.rootHtml || snap.rootHtml.length < 500) {
    problems.push("page body is empty or suspiciously small");
  }
  return problems;
}
