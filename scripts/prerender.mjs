// Root cause this fixes: this app is a pure client-side-rendered SPA — the
// raw HTML Vite builds (dist/index.html) is the same near-empty shell for
// every single route ("<div id="root">" + a visually-hidden <h1>), and
// react-helmet-async only injects the real per-page <title>/description/
// canonical/content AFTER React mounts and runs client-side. Googlebot's
// first crawl pass fetches that raw HTML — every public page on the site
// looks byte-for-byte identical to it at that point, which is exactly the
// kind of signal that leaves pages sitting in "Discovered - currently not
// indexed" instead of progressing to a render/index pass.
//
// LOCAL-ONLY SCRIPT — run this yourself (`npm run prerender:generate`) on
// your own machine, NOT as part of the Vercel build. Vercel's build
// container generally can't launch a real Chromium (missing system
// libraries — libnss3 and friends — that a normal dev machine or GitHub
// Actions runner has but a serverless build sandbox doesn't), so this must
// never run there. Instead this writes its output into prerendered/, a
// folder you commit to git; the separate, browser-free
// scripts/copy-prerendered.mjs runs during the actual Vercel build and just
// copies those already-generated files into dist/ — pure filesystem I/O,
// safe anywhere.
//
// Re-run this locally and commit the result whenever a public page's
// content changes; it isn't regenerated automatically on every deploy.
//
// This spins up a throwaway static server for a fresh `vite build` output,
// visits each public route with Playwright's bundled Chromium (already a
// devDependency here for e2e tests — reused rather than pulling in a second
// full headless-browser toolchain), waits for React + Helmet + any data
// fetch to fully settle, and writes the resulting *fully rendered* HTML to
// prerendered/<route>/index.html.
//
// Only ever add PUBLIC, non-authenticated routes below. Prerendering bakes
// in whatever HTML renders without a login session — adding an
// authenticated route here would bake in its logged-out empty/redirect
// state as if that were the real page.
import { chromium } from "@playwright/test";
import http from "node:http";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, "../dist");
const OUT_DIR  = path.resolve(__dirname, "../prerendered");
const PORT = 5099;
const ORIGIN = `http://127.0.0.1:${PORT}`;

// Mirrors public/sitemap.xml and robots.txt's Allow list exactly.
const ROUTES = [
  "/",
  "/about",
  "/our-plans",
  "/lic-info-hub",
  "/help-support",
  "/tools",
  "/tools/age-calculator",
  "/tools/sip-calculator",
  "/tools/income-tax-calculator",
  "/tools/home-loan-emi-calculator",
  "/tools/term-insurance-calculator",
  "/tools/inflation-calculator",
  "/privacy-policy",
  "/terms-of-service",
  "/login",
  "/signup",
];

const MIME_TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".webp": "image/webp", ".ico": "image/x-icon", ".woff": "font/woff",
  ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
};

// Minimal static file server for dist/ with SPA fallback to index.html —
// just enough to let Playwright load each route the same way Vercel will.
function startStaticServer() {
  const server = http.createServer(async (req, res) => {
    let filePath = path.join(DIST_DIR, decodeURIComponent(req.url.split("?")[0]));
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) filePath = path.join(filePath, "index.html");
    } catch {
      filePath = path.join(DIST_DIR, "index.html"); // SPA fallback
    }
    try {
      const data = await fs.readFile(filePath);
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  try {
    await page.goto(`${ORIGIN}${route}`, { waitUntil: "networkidle", timeout: 30000 });
    // Helmet updates document.title asynchronously on mount — wait until it
    // differs from index.html's bare placeholder ("Policy Niketan"), which
    // means the real per-page <SEO> title has taken effect, then give any
    // last data-driven re-render a brief moment past that to settle.
    await page.waitForFunction(
      () => document.title && document.title !== "Policy Niketan",
      { timeout: 5000 }
    ).catch(() => {}); // best-effort; never fail the whole build over a slow title update
    await new Promise((r) => setTimeout(r, 300));

    const html = await page.content();

    const outDir = route === "/" ? OUT_DIR : path.join(OUT_DIR, route);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, "index.html"), html, "utf-8");
    console.log(`  ✓ ${route}`);
  } catch (err) {
    console.error(`  ✗ ${route} — ${err.message}`);
    process.exitCode = 1; // fail CI loudly rather than silently shipping a stale/empty page
  } finally {
    await page.close();
  }
}

async function main() {
  if (!fsSync.existsSync(DIST_DIR)) {
    console.error("dist/ not found — run `vite build` before prerendering.");
    process.exit(1);
  }

  console.log(`Prerendering ${ROUTES.length} public routes → ${path.relative(process.cwd(), OUT_DIR)}/`);
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  const server = await startStaticServer();
  // Uses the Edge browser that's already installed on every Windows machine
  // instead of Playwright's own bundled Chromium — avoids downloading
  // anything from cdn.playwright.dev, which some networks/firewalls/DNS
  // configs block outright (that's what the ENOTFOUND/socket-hang-up errors
  // from `npx playwright install` mean — nothing wrong with the script or
  // your Playwright install, just that download couldn't reach its host).
  // If you'd rather use Chrome instead, change "msedge" to "chrome" below
  // (works the same way, as long as Chrome is installed).
  const browser = await chromium.launch({ channel: "msedge", args: ["--no-sandbox"] });

  try {
    for (const route of ROUTES) {
      await prerenderRoute(browser, route);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log("Done. Review the diff, then commit the prerendered/ folder.");
}

main();
