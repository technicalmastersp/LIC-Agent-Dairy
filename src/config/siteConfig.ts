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
  // Legal/brand name — as confirmed, "Dairy" is the correct spelling
  // (not a typo), despite reading like one.
  companyName: "LIC Agent Dairy",
  // Marketing/SEO name — used for <title>, og:title, twitter:title.
  title: "Life Insurance Records",
  // Shorter variant for space-constrained contexts (PWA home-screen icon
  // label via apple-mobile-web-app-title) where the full title truncates.
  shortTitle: "LIC Records",

  buyUrl: "policyegleman.com",

  // on root location
  // Small UI icon (128x128 WebP, ~7KB) — used everywhere the logo renders
  // at 32-48px (Navigation, RecordDetailsModal, AddRecord header).
  logo_icon: "/logos/logo_icon.webp",
  // Social-share size (512x512 PNG, ~256KB) — used for og:image/twitter:image
  // where crawlers need a real raster image, not a tiny icon.
  logo_social: "/logos/logo_social.png",

  description: "Professional life insurance policy record management system for all types of agents and customers",
  author: "Mr. Shashank S Pandey",
  version: "1.0.0",
  productionUrl: "https://lic-agent-dairy.vercel.app",
  // PLACEHOLDER — update with the real contact address when available.
  contactEmail: "contact@example.com",
  supportEmail: "support@lic-agent-dairy.vercel.app",
  // PLACEHOLDERS — update with real profile links when available.
  socialLinks: {
    twitter: "https://twitter.com/yourhandle",
    twitterHandle: "@yourhandle",
    github: "https://github.com/yourrepo",
  }
};

export default siteConfig;