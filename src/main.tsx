import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

// Error monitoring — only active in production builds with a DSN configured.
// Skipping this in dev keeps local errors out of your Sentry quota, and
// skipping it when VITE_SENTRY_DSN is unset means an incomplete local
// .env never breaks the app; Sentry.init() with no DSN is a documented
// no-op, but gating explicitly here makes that intent visible rather than
// relying on it silently.
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
  });
}

// Dev-only automated accessibility audit. import.meta.env.DEV is statically
// replaced at build time, so this whole block (and the @axe-core/react +
// react-dom imports it pulls in) is dead-code-eliminated from production
// builds — it never ships to users.
if (import.meta.env.DEV) {
  Promise.all([import("react"), import("react-dom"), import("@axe-core/react")]).then(
    ([React, ReactDOM, axe]) => {
      axe.default(React.default, ReactDOM.default, 1000);
    }
  );
}

const container = document.getElementById("root")!;

// Prerendered public pages (see scripts/prerender.mjs) bake real, visible
// markup into #root so crawlers see actual content on the first HTML
// fetch. But createRoot() — unlike React 17's ReactDOM.render(), and
// unlike hydrateRoot() — does NOT clear a container's existing children
// before rendering; it only manages nodes it creates itself. Left as-is,
// that prerendered markup would stay in the DOM forever, with React's own
// tree rendered *alongside* it rather than replacing it — exactly the
// "stacked" duplicate content (leftover public navbar, an auth-redirect
// that looks like it never fired) seen after login. Clearing the
// container first restores plain client-side rendering for real visitors,
// while crawlers — which never run this JS — still see the prerendered
// content in the raw HTML.
container.innerHTML = "";

createRoot(container).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);