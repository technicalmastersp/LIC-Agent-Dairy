import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { initializeReferralCode } from "./utils/referral";

// Initialize referral code from URL
initializeReferralCode();

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
