// Single source of truth for site identity — name, URLs, contact details,
// social links. Anything that appears in more than one place (Navigation,
// Footer, SEO meta tags, index.html, legal pages) should read from here
// rather than restating the value, so there's exactly one place to update
// it when it changes.
//
// index.html can't import this directly (it's static HTML, not processed
// by React) — vite.config.ts's transformIndexHtml hook injects these same
// values into it at build time instead. See that file if you need to add
// another meta tag sourced from here.
const siteConfig = {
  // Legal/brand name — the product is now branded "Policy Niketan".
  companyName: "Policy Niketan",
  // Marketing/SEO name — used for <title>, og:title, twitter:title.
  title: "Policy Niketan",
  // Shorter variant for space-constrained contexts (PWA home-screen icon
  // label via apple-mobile-web-app-title) where the full title truncates.
  shortTitle: "Policy Niketan",

  buyUrl: "policyniketan.com",

  // on root location
  // Small UI icon (128x128 WebP, ~7KB) — used everywhere the logo renders
  // at 32-48px (Navigation, RecordDetailsModal, AddRecord header).
  logo_icon: "/logos/logo_icon.webp",
  // Social-share size (512x512 PNG, ~256KB) — used for og:image/twitter:image
  // where crawlers need a real raster image, not a tiny icon.
  logo_social: "/logos/logo_social.png",

  description: "Professional insurance policy record management system for all types of agents and customers",
  author: "Mr. Shashank S Pandey",
  version: "1.0.0",
  productionUrl: "https://policyniketan.com",
  // PLACEHOLDER — update with the real contact address when available.
  contactEmail: "contact@policyniketan.com",
  supportEmail: "support@policyniketan.com",
  // OPTIONAL public business identity, shown on /contact only when non-empty
  // (payment gateways compare the website against the KYC entity, so filling
  // these in helps). Leave "" to hide a row — nothing placeholder is rendered.
  legalEntityName: "Shashank Shekhar Pandey",   // e.g. "Shashank Shekhar Pandey (Proprietor)" or your registered name
  // Intentionally blank: callers use the "Request a call" form instead of a public
  // number. If filled, /contact will ALSO show it as a direct-dial card.
  phone: "",             // e.g. "+91 98765 43210"
  address: "",           // full postal address, if you want it public
  // Feature switches for public-facing contact channels.
  // liveChat: no live-chat tool is wired up. Keep false to hide every live-chat
  // card/button; flip to true (and wire a real tool) when it's ready.
  features: {
    liveChat: false,
  },
  // PLACEHOLDERS — update with real profile links when available.
  socialLinks: {
    twitter: "https://twitter.com/yourhandle",
    twitterHandle: "@policyniketan",
    github: "https://github.com/yourrepo",
  }
};

export default siteConfig;