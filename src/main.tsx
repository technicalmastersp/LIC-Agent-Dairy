import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeReferralCode } from "./utils/referral";

// Initialize referral code from URL
initializeReferralCode();

createRoot(document.getElementById("root")!).render(<App />);
