// Verifies a DEPLOYED site against what the referral-off build should serve.
//
//   node scripts/verify-live.mjs                      # https://policyniketan.com
//   node scripts/verify-live.mjs http://127.0.0.1:4173  # any other base (e.g. a local preview)
//
// Needs Node 18+ (built-in fetch). Exits 1 if anything FAILS, so it can sit in CI.
//
// Every request bypasses caches (cache-busting query string + no-cache headers)
// and checks the raw HTML — the prerendered snapshot, i.e. exactly what a
// crawler or a payment reviewer's non-JS fetch sees. It reports the CDN cache
// headers so you can tell a stale edge copy from a stale deploy.
const BASE = (process.argv[2] || "https://policyniketan.com").replace(/\/$/, "");
const PROD = "https://policyniketan.com"; // canonicals always point at production

const PROGRAM_WORDS = /referr?al|wallet|commission|withdraw|payout|razorpayx|cashback/i;
// Insurance-glossary lines that legitimately contain those words.
const GLOSSARY_ALLOW = [/Tax deducted on certain payouts like commissions or maturity benefits/gi, /An additional payout if death occurs due to an accident/gi];

// Pages that are ALLOWED to talk about the suspended program — but only in the
// intended "suspended" wording.
const PAGE_RULES = {
  "/terms-of-service": {
    must: [/Referral Program is currently not available/i],
    mustNot: [/Use of Wallet Balance/i, /RazorpayX/i, /can earn referral/i, /Wallet Balance may be applied/i],
  },
  "/privacy-policy": {
    must: [/Earlier referral records/i, /no longer collect new referral data/i],
    mustNot: [/RazorpayX/i, /wallet payouts/i, /Referral wallet and payout details \(Agents, optional\)/i],
  },
  "/help-support": {
    must: [/Is there a referral program\?/i],
    mustNot: [/Payments & Referrals/i, /referral wallet work/i, /wallet|commission|withdraw/i],
  },
  "/our-plans": { must: [/does not renew automatically/i] },
};

const FALLBACK_ROUTES = [
  "/", "/about", "/our-plans", "/lic-info-hub", "/help-support", "/contact", "/refund-policy",
  "/tools", "/tools/age-calculator", "/tools/sip-calculator", "/tools/income-tax-calculator",
  "/tools/home-loan-emi-calculator", "/tools/term-insurance-calculator", "/tools/inflation-calculator",
  "/privacy-policy", "/terms-of-service", "/login", "/signup",
];

const bust = () => `cb=${Date.now()}${Math.floor(Math.random() * 1e6)}`;
async function get(path) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}${bust()}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache", "User-Agent": "policyniketan-verify/1.0" },
    redirect: "follow",
  });
  const body = await res.text();
  return { res, body, cdn: [res.headers.get("x-vercel-cache"), res.headers.get("age") && `age=${res.headers.get("age")}`].filter(Boolean).join(" ") };
}

const visibleText = (html) =>
  html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, " ");

function checkPage(route, html) {
  const fails = [];
  const text = visibleText(html);

  // 1. artefacts of a bad snapshot
  if (/no backend during prerender/i.test(html)) fails.push("baked-in prerender toast ('no backend during prerender')");
  if (/data-sonner-toast/.test(html)) fails.push("a toast is baked into the HTML");
  if (/Something went wrong/i.test(text)) fails.push("error screen baked into the HTML");

  // 2. head tags
  if (/twitter:site[^>]*(yourhandle|@dev)/i.test(html)) fails.push("placeholder twitter:site (@yourhandle)");
  const canon = [...html.matchAll(/<link[^>]+rel="canonical"[^>]*>/gi)].map((m) => (m[0].match(/href="([^"]*)"/) || [])[1]);
  const wantCanon = route === "/" ? `${PROD}/` : `${PROD}${route}`;
  if (canon.length !== 1) fails.push(`${canon.length} canonical tags (want exactly 1)`);
  else if (canon[0] !== wantCanon) fails.push(`canonical is ${canon[0]}, want ${wantCanon}`);
  const desc = (html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || [])[1];
  const ogDesc = (html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i) || [])[1];
  if (desc && ogDesc && desc !== ogDesc) fails.push("meta description is the generic site-wide text, not this page's own");

  // 3. wording
  const rule = PAGE_RULES[route] || {};
  for (const re of rule.must || []) if (!re.test(text)) fails.push(`missing expected text: ${re}`);
  for (const re of rule.mustNot || []) if (re.test(text)) fails.push(`still contains: ${re}`);
  if (!PAGE_RULES[route] || route === "/our-plans") {
    let scan = text;
    for (const re of GLOSSARY_ALLOW) scan = scan.replace(re, " ");
    const m = scan.match(PROGRAM_WORDS);
    if (m) fails.push(`mentions "${m[0]}" …${scan.slice(Math.max(0, m.index - 40), m.index + 50)}…`);
  }
  return fails;
}

const results = [];
const add = (name, fails, extra = "") => results.push({ name, fails, extra });

// ── sitemap → routes ────────────────────────────────────────────────────────
let routes = FALLBACK_ROUTES;
try {
  const { res, body } = await get("/sitemap.xml");
  if (res.ok) {
    const fromMap = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/(.)\/$/, "$1"));
    if (fromMap.length) routes = fromMap;
    const missing = ["/refund-policy", "/contact"].filter((r) => !fromMap.includes(r));
    add("/sitemap.xml", missing.map((r) => `missing ${r}`), `${fromMap.length} URLs`);
  } else add("/sitemap.xml", [`HTTP ${res.status}`]);
} catch (e) { add("/sitemap.xml", [`request failed: ${e.message}`]); }

// ── pages ───────────────────────────────────────────────────────────────────
for (const route of routes) {
  try {
    const { res, body, cdn } = await get(route);
    add(route, res.ok ? checkPage(route, body) : [`HTTP ${res.status}`], cdn);
  } catch (e) { add(route, [`request failed: ${e.message}`]); }
}

// ── robots.txt and the public bundle report ─────────────────────────────────
try {
  const { res, body } = await get("/robots.txt");
  add("/robots.txt", res.ok && /referral/i.test(body) ? ["still mentions /referral-program"] : res.ok ? [] : [`HTTP ${res.status}`]);
} catch (e) { add("/robots.txt", [`request failed: ${e.message}`]); }
try {
  const { res, body } = await get("/stats.html");
  const leaked = res.ok && /treemap|rollup|visualizer/i.test(body.slice(0, 5000));
  add("/stats.html", leaked ? ["bundle report is PUBLIC (should be a 404)"] : [], `HTTP ${res.status}`);
} catch (e) { add("/stats.html", [`request failed: ${e.message}`]); }

// ── report ──────────────────────────────────────────────────────────────────
const width = Math.max(...results.map((r) => r.name.length)) + 2;
console.log(`\nVerifying ${BASE}\n`);
for (const r of results) {
  console.log(`${r.fails.length ? "FAIL" : "PASS"}  ${r.name.padEnd(width)}${r.extra}`);
  r.fails.forEach((f) => console.log(`        - ${f}`));
}
const bad = results.filter((r) => r.fails.length).length;
console.log(`\n${results.length - bad}/${results.length} passed${bad ? `, ${bad} FAILED` : " — all clear"}.`);
process.exit(bad ? 1 : 0);
