// Build-time feature flags. Kept OUT of siteConfig.ts on purpose: vite.config.ts
// imports siteConfig in plain Node, where `import.meta.env` doesn't exist.
//
// REFERRAL_PROGRAM_ENABLED — the whole referral / commission / wallet
// program. OFF by default (and for anything but the exact string "true"):
//   • hides the signup referral-code field and "₹ off" messaging
//   • hides the Referral Program page + menu entry and redirects its URL
//   • hides wallet/referral cards on Home and Profile, and the wallet option
//     at checkout
//   • switches the legal/marketing copy to its "no referral program" wording
// It is read at BUILD time, so the prerendered snapshots match what visitors
// see. Set it together with the backend's REFERRAL_PROGRAM_ENABLED (the
// backend is what actually enforces it; this flag only controls display).
// To bring the program back: set VITE_REFERRAL_PROGRAM_ENABLED=true, rebuild,
// re-run `npm run prerender:generate`, and set the backend flag.
export const REFERRAL_PROGRAM_ENABLED: boolean =
  import.meta.env.VITE_REFERRAL_PROGRAM_ENABLED === "true";
