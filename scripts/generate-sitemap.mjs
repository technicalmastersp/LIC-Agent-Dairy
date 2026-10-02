// Regenerates public/sitemap.xml from PUBLIC_ROUTES (scripts/publicRoutes.mjs)
// — the same list scripts/prerender.mjs renders. Pure file/string work, no
// browser needed, so unlike prerender.mjs this is safe to run as part of
// the actual Vercel build (see package.json's "build" script) — every
// deploy writes a fresh sitemap with today's <lastmod>, with no manual step.
//
// Run it by hand any time with: npm run sitemap:generate

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLIC_ROUTES } from "./publicRoutes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE  = path.join(__dirname, "..", "public", "sitemap.xml");

// Must match siteConfig.ts's buyUrl. Kept as a plain constant rather than
// imported from there — this is a pre-build Node script and siteConfig.ts
// is TypeScript, which plain `node scripts/*.mjs` can't import without a
// loader (vite.config.ts injects siteConfig into index.html the same way,
// for the same reason — see the comment at the top of siteConfig.ts).
// Update both if the domain ever changes.
const BASE_URL = "https://policyniketan.com";

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function generateSitemap() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const urlEntries = PUBLIC_ROUTES.map(({ path: routePath, changefreq, priority }) => `
  <url>
    <loc>${escapeXml(BASE_URL + routePath)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>
`;

  await fs.writeFile(OUT_FILE, xml, "utf8");
  console.log(`[sitemap] Wrote ${PUBLIC_ROUTES.length} URLs → ${path.relative(process.cwd(), OUT_FILE)} (lastmod ${today})`);
}

generateSitemap().catch((err) => {
  console.error("[sitemap] Failed to generate sitemap.xml:", err);
  process.exit(1);
});
