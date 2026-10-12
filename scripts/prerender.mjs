// LOCAL-ONLY SCRIPT — run this yourself (`npm run prerender:generate`) on
// your own machine, NOT as part of the Vercel build. Vercel's build
// container generally can't launch a real Chromium (missing system
// libraries — libnss3 and friends — that a normal dev machine or GitHub
// Actions runner has but a serverless build sandbox doesn't), so this must
// never run there. Instead this writes its output into prerendered/, a
// folder you commit to git; the separate, browser-free
// scripts/copy-prerendered.mjs runs during the actual Vercel build and
// merges those already-generated snapshots into THAT build's own fresh
// dist/index.html — pure filesystem/string work, safe anywhere.
//
// IMPORTANT: this deliberately saves only *data* (title, meta tags,
// canonical, JSON-LD, and the rendered #root markup) as JSON — never a
// full HTML document. An earlier version of this script saved the whole
// page, including Vite's own hashed <script src="/assets/index-XXXX.js">
// tag from whatever build happened to be running locally at generation
// time. That filename changes on every build (Vite content-hashes it), so
// a snapshot with a baked-in script tag goes stale the instant you rebuild
// — Vercel's own build produces a *different* hash, the old one 404s, no
// JS ever runs, and the whole site freezes (this is exactly what broke
// production: check git history for the incident if you're reading this
// after that). Keeping snapshots as pure content data and merging them
// into whichever build's index.html is actually running (see
// copy-prerendered.mjs) makes that entire bug class impossible.
//
// Re-run this locally and commit the result whenever a public page's
// content changes; it isn't regenerated automatically on every deploy.
//
// Only ever add PUBLIC, non-authenticated routes below. Prerendering bakes
// in whatever renders without a login session — adding an authenticated
// route here would bake in its logged-out empty/redirect state as if that
// were the real page.
import { chromium } from "@playwright/test";
import http from "node:http";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLIC_ROUTES } from "./publicRoutes.mjs";
import { extractSnapshot, validateSnapshot } from "./snapshotExtract.mjs";

const PRODUCTION_URL = "https://policyniketan.com"; // must equal siteConfig.productionUrl

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, "../dist");
const OUT_DIR  = path.resolve(__dirname, "../prerendered");
const PORT = 5099;
const ORIGIN = `http://127.0.0.1:${PORT}`;

// Mirrors public/sitemap.xml and robots.txt's Allow list exactly.
// Sourced from scripts/publicRoutes.mjs — the same list generate-sitemap.mjs
// writes into public/sitemap.xml.
const ROUTES = PUBLIC_ROUTES.map((r) => r.path);

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
    // The app calls its API same-origin at /api/*. This tiny server has no
    // backend, and the SPA fallback below would answer those calls with
    // index.html + HTTP 200 — axios then "succeeds" with an HTML string as
    // data, config values come back undefined, and pages crash and get
    // snapshotted as the error screen.
    // Answer with an EMPTY 204 instead. NOT a 404/5xx: api/apiClient.js shows a
    // destructive toast for those (e.g. "Not Found: <message>"), and a toast on
    // screen at capture time gets baked into the snapshot. A 2xx never toasts,
    // and callers already treat an empty body as "no data" (configService
    // rejects anything that isn't an object), so pages render their defaults.
    if (req.url.startsWith("/api/")) {
      res.writeHead(204);
      res.end();
      return;
    }
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
    // Helmet applies <SEO> tags asynchronously on mount, so wait for them,
    // then give any last data-driven re-render a brief moment to settle.
    // Wait until react-helmet-async has applied THIS route's canonical
    // (its tags carry data-rh). Waiting only for "title changed" could pass
    // on the shell's pre-baked home title before Helmet ran for this page.
    await page.waitForFunction(
      (r) => {
        const el = document.querySelector('link[rel="canonical"][data-rh]');
        return !!el && new URL(el.href).pathname.replace(/\/$/, "") === r.replace(/\/$/, "");
      },
      route,
      { timeout: 8000 }
    ).catch(() => {}); // best-effort here; validateSnapshot() below is the hard gate
    await new Promise((r) => setTimeout(r, 300));

    // Pull out only the pieces we actually want to merge into a fresh
    // build's index.html — never the raw page HTML, which would include
    // this build's own hashed <script>/<link> asset tags (see the header
    // comment for why that's the bug that broke production).
    const snapshot = await page.evaluate(extractSnapshot);

    // Hard gate: never write a snapshot that would ship the error screen, an
    // empty page, or another page's canonical. The route simply keeps the
    // plain client-rendered shell until the cause is fixed.
    const problems = validateSnapshot(route, snapshot, PRODUCTION_URL);
    if (problems.length) {
      console.error(`  ✗ ${route} — NOT written:\n      - ${problems.join("\n      - ")}`);
      process.exitCode = 1;
      return;
    }

    const outPath = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "__");
    await fs.mkdir(OUT_DIR, { recursive: true });
    delete snapshot.toastCount; // diagnostic only — not part of the stored snapshot
    await fs.writeFile(path.join(OUT_DIR, `${outPath}.json`), JSON.stringify({ route, ...snapshot }, null, 2), "utf-8");
    console.log(`  ✓ ${route}`);
  } catch (err) {
    console.error(`  ✗ ${route} — ${err.message}`);
    process.exitCode = 1; // fail loudly rather than silently shipping a stale/empty page
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
