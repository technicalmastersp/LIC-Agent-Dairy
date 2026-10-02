// Single source of truth for PUBLIC, non-authenticated routes — the same
// list scripts/prerender.mjs renders and scripts/generate-sitemap.mjs
// writes into public/sitemap.xml. Keeping both fed from one array means
// they can't quietly drift apart the way two hand-maintained lists would.
//
// Only add routes here that render something meaningful without a login
// session — see the big warning in prerender.mjs for why that matters
// there too. changefreq/priority follow the standard sitemap.xml protocol
// (https://www.sitemaps.org/protocol.html) — priority is relative to your
// own other pages, not an absolute global ranking signal.
export const PUBLIC_ROUTES = [
  { path: "/",                                   changefreq: "weekly",  priority: 1.0 },
  { path: "/about",                               changefreq: "monthly", priority: 0.7 },
  { path: "/our-plans",                           changefreq: "monthly", priority: 0.8 },
  { path: "/lic-info-hub",                        changefreq: "weekly",  priority: 0.8 },
  { path: "/help-support",                        changefreq: "monthly", priority: 0.6 },
  { path: "/tools",                               changefreq: "monthly", priority: 0.7 },
  { path: "/tools/age-calculator",                changefreq: "monthly", priority: 0.6 },
  { path: "/tools/sip-calculator",                changefreq: "monthly", priority: 0.6 },
  { path: "/tools/income-tax-calculator",         changefreq: "monthly", priority: 0.6 },
  { path: "/tools/home-loan-emi-calculator",      changefreq: "monthly", priority: 0.6 },
  { path: "/tools/term-insurance-calculator",     changefreq: "monthly", priority: 0.6 },
  { path: "/tools/inflation-calculator",          changefreq: "monthly", priority: 0.6 },
  { path: "/privacy-policy",                      changefreq: "yearly",  priority: 0.3 },
  { path: "/terms-of-service",                    changefreq: "yearly",  priority: 0.3 },
  { path: "/login",                               changefreq: "yearly",  priority: 0.4 },
  { path: "/signup",                              changefreq: "yearly",  priority: 0.5 },
];
