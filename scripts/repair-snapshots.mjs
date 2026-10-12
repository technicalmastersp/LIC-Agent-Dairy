// One-off, NO-BROWSER repair for snapshots already in prerendered/.
//   node scripts/repair-snapshots.mjs          # fix files in place
//   node scripts/repair-snapshots.mjs --dry    # just report
//
// Fixes two kinds of damage caused by the old extraction logic:
//  1. canonical pointing at another page (usually the home page) or missing
//     -> rewritten to PRODUCTION_URL + route
//  3. a placeholder twitter:site tag (e.g. "@yourhandle" or "@dev") -> removed
//  2. meta description = the generic site-wide text -> replaced by the page's
//     own description, which is always present as og:description (SEO.tsx
//     writes the same string to both)
// Snapshots that captured the app's "Something went wrong" error screen can't
// be repaired without a browser; they are DELETED so those routes fall back to
// the normal client-rendered shell instead of shipping an error page. Re-run
// `npm run prerender:generate` afterwards to produce good ones.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PRODUCTION_URL = "https://policyniketan.com"; // must equal siteConfig.productionUrl
const DRY = process.argv.includes("--dry");
const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../prerendered");

if (!fs.existsSync(DIR)) { console.error("prerendered/ not found"); process.exit(1); }

let fixed = 0, removed = 0, clean = 0;
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".json")).sort()) {
  const full = path.join(DIR, file);
  const snap = JSON.parse(fs.readFileSync(full, "utf-8"));
  const notes = [];

  if (/Something went wrong/i.test(snap.rootHtml || "")) {
    console.log(`✗ ${snap.route}: captured the error screen -> ${DRY ? "would delete" : "deleted"} (regenerate it)`);
    if (!DRY) fs.unlinkSync(full);
    removed++;
    continue;
  }

  const wantCanonical = new URL(snap.route, PRODUCTION_URL).href;
  if (snap.canonical !== wantCanonical) {
    notes.push(`canonical ${snap.canonical} -> ${wantCanonical}`);
    snap.canonical = wantCanonical;
  }

  const og = Object.fromEntries((snap.ogAndTwitterMeta || []).map((m) => [m.key, m.value]));
  if (og["og:description"] && snap.description !== og["og:description"]) {
    notes.push("description -> page's own (from og:description)");
    snap.description = og["og:description"];
  }

  // Placeholder social handle baked in from siteConfig — drop the tag.
  const before = (snap.ogAndTwitterMeta || []).length;
  snap.ogAndTwitterMeta = (snap.ogAndTwitterMeta || []).filter(
    (m) => !(m.key === "twitter:site" && /yourhandle|^@dev$/i.test(m.value || ""))
  );
  if (snap.ogAndTwitterMeta.length !== before) notes.push("removed placeholder twitter:site tag");

  if (notes.length) {
    console.log(`✓ ${snap.route}: ${notes.join("; ")}`);
    if (!DRY) fs.writeFileSync(full, JSON.stringify(snap, null, 2), "utf-8");
    fixed++;
  } else clean++;
}
console.log(`\n${DRY ? "[dry run] " : ""}${fixed} repaired, ${removed} removed, ${clean} already fine.`);
