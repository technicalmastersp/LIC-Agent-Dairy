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

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);