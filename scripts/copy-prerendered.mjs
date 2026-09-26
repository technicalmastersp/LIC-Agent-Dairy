// Runs as part of `npm run build`, including on Vercel. Deliberately does
// NOT launch a browser — this only copies the already-generated,
// git-committed HTML snapshots from prerendered/ (see scripts/prerender.mjs,
// which you run locally, never here) into dist/, so Vercel serves real
// pre-rendered content for public pages instead of the empty CSR shell,
// without ever needing Chromium inside Vercel's build container.
//
// If prerendered/ doesn't exist yet (e.g. first-ever setup, before anyone
// has run `npm run prerender:generate` locally), this warns and exits
// cleanly rather than failing the build — a missing prerendered/ folder
// just means public pages temporarily fall back to the plain CSR shell,
// not a broken deploy.
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR  = path.resolve(__dirname, "../prerendered");
const DIST_DIR = path.resolve(__dirname, "../dist");

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

  await fs.cp(SRC_DIR, DIST_DIR, { recursive: true });
  console.log(`Copied pre-rendered pages from ${path.relative(process.cwd(), SRC_DIR)}/ into dist/.`);
}

main();
