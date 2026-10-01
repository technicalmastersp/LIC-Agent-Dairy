// Runs as part of `npm run build`, including on Vercel. Deliberately does
// NOT launch a browser — merges the already-generated, git-committed
// snapshot data from prerendered/*.json (see scripts/prerender.mjs, which
// you run locally, never here) into THIS build's own freshly-built
// dist/index.html, then writes the result to dist/<route>/index.html.
//
// Critically, this NEVER touches index.html's own <script>/<link> asset
// tags — those always come straight from the current build (correct hash,
// guaranteed to exist), and only the <head> SEO tags + #root content get
// replaced. This is what makes it safe to commit a snapshot once and reuse
// it across many future builds/deploys: it doesn't matter that the
// snapshot was captured against an older build's asset hashes, because it
// never carries those hashes at all.
//
// Uses jsdom (already a devDependency, for Vitest) to parse and edit the
// HTML properly rather than fragile string/regex replacement.
//
// If prerendered/ doesn't exist yet (e.g. first-ever setup, before anyone
// has run `npm run prerender:generate` locally), this warns and exits
// cleanly rather than failing the build — a missing prerendered/ folder
// just means public pages temporarily fall back to the plain CSR shell,
// not a broken deploy.
import { JSDOM } from "jsdom";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR  = path.resolve(__dirname, "../prerendered");
const DIST_DIR = path.resolve(__dirname, "../dist");

function mergeSnapshotIntoTemplate(templateHtml, snapshot) {
  const dom = new JSDOM(templateHtml);
  const { document } = dom.window;

  if (snapshot.title) {
    document.title = snapshot.title;
  }

  if (snapshot.description) {
    let el = document.querySelector('meta[name="description"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "description");
      document.head.appendChild(el);
    }
    el.setAttribute("content", snapshot.description);
  }

  if (snapshot.canonical) {
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "canonical");
      document.head.appendChild(el);
    }
    el.setAttribute("href", snapshot.canonical);
  }

  for (const { attr, key, value } of snapshot.ogAndTwitterMeta || []) {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  }

  // Drop any JSON-LD already in the template (there shouldn't be any in the
  // bare CSR shell, but be defensive) before adding the snapshot's, so
  // re-running this against the same dist/ doesn't duplicate blocks.
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
  for (const json of snapshot.jsonLd || []) {
    const script = document.createElement("script");
    script.setAttribute("type", "application/ld+json");
    script.textContent = json;
    document.head.appendChild(script);
  }

  const root = document.getElementById("root");
  if (root && snapshot.rootHtml) {
    root.innerHTML = snapshot.rootHtml;
  }

  return dom.serialize();
}

async function main() {
  if (!fsSync.existsSync(SRC_DIR)) {
    console.warn(
      "prerendered/ not found — skipping. Run `npm run prerender:generate` " +
      "locally and commit its output to enable pre-rendered public pages."
    );
    return;
  }
  if (!fsSync.existsSync(DIST_DIR)) {
    console.error("dist/ not found — run `vite build` before this step.");
    process.exit(1);
  }

  const templatePath = path.join(DIST_DIR, "index.html");
  const templateHtml = await fs.readFile(templatePath, "utf-8");

  const files = (await fs.readdir(SRC_DIR)).filter(f => f.endsWith(".json"));
  let count = 0;

  for (const file of files) {
    const snapshot = JSON.parse(await fs.readFile(path.join(SRC_DIR, file), "utf-8"));
    const merged = mergeSnapshotIntoTemplate(templateHtml, snapshot);

    const outDir = snapshot.route === "/" ? DIST_DIR : path.join(DIST_DIR, snapshot.route);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, "index.html"), merged, "utf-8");
    count++;
  }

  console.log(`Merged ${count} pre-rendered page(s) into dist/ (using this build's own asset hashes).`);
}

main();
