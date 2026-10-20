// Cross-file consistency. These guard the places where the same fact is written down more than once.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
// Plain .mjs shared with the build scripts (sitemap + prerender).
import { PUBLIC_ROUTES } from "../../scripts/publicRoutes.mjs";
import { SITE_STATS, HOME_STATS, SOCIAL_PROOF_STATS, formatStat } from "@/config/siteStats";
import { PLAN_IDS, isValidPlanId, signupPathForPlan } from "@/config/plans";

const root = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");

const toolPaths: string[] = (PUBLIC_ROUTES as { path: string }[]).map((r) => r.path).filter((p) => /^\/tools\/.+/.test(p));

// English source strings for i18n keys ("tools.ageCalculator" -> locales/en/tools.json).
const readEn = (ns: string) => JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/i18n/locales/en", `${ns}.json`), "utf8"));

describe("free tools — registered everywhere", () => {
  it("has the nine expected calculators, incl. the new lumpsum / RD / FD", () => {
    expect(toolPaths).toEqual(expect.arrayContaining([
      "/tools/lumpsum-calculator", "/tools/rd-calculator", "/tools/fd-calculator", "/tools/sip-calculator",
    ]));
  });

  it("SITE_STATS.freeTools equals the number of /tools/* routes (so the '9 free calculators' claim can't drift)", () => {
    expect(SITE_STATS.freeTools).toBe(toolPaths.length);
  });

  it.each(["src/App.tsx", "src/components/Navigation.tsx", "src/components/Footer.tsx", "src/pages/tools/ToolsHub.tsx", "src/pages/About.tsx", "scripts/verify-live.mjs"])(
    "%s links to every tool",
    (file) => {
      const src = read(file);
      for (const p of toolPaths) expect(src, `${file} is missing ${p}`).toContain(`"${p}"`);
    }
  );

  it("every tool route has a page file with a distinct title and a 100–170 char description", () => {
    const seenTitles = new Set<string>(), seenDesc = new Set<string>();
    for (const p of toolPaths) {
      const app = read("src/App.tsx");
      const m = app.match(new RegExp(`path="${p}" element=\\{<(\\w+) />\\}`));
      expect(m, `no <Route> for ${p}`).toBeTruthy();
      const imp = app.match(new RegExp(`const ${m![1]} = lazy\\(\\(\\) => import\\("\\./pages/tools/(\\w+)"\\)\\)`));
      expect(imp, `no lazy import for ${m![1]}`).toBeTruthy();
      const page = read(`src/pages/tools/${imp![1]}.tsx`);
      // Pages pass either a literal or an i18n key (title={t('tools.xyz')}); resolve keys to English.
      const attr = (name: string) => {
        const lit = page.match(new RegExp(`${name}="([^"]+)"`))?.[1];
        if (lit) return lit;
        const key = page.match(new RegExp(`${name}=\\{t\\('([\\w]+)\\.([\\w]+)'\\)\\}`));
        return key ? (readEn(key[1]) as Record<string, string>)[key[2]] : undefined;
      };
      const title = attr("title");
      const desc = attr("description");
      expect(title, `${p} title`).toBeTruthy();
      expect(desc!.length, `${p} description is ${desc!.length} chars`).toBeGreaterThanOrEqual(100);
      expect(desc!.length, `${p} description is ${desc!.length} chars`).toBeLessThanOrEqual(170);
      expect(seenTitles.has(title!), `duplicate title ${title}`).toBe(false);
      expect(seenDesc.has(desc!), `duplicate description for ${p}`).toBe(false);
      seenTitles.add(title!); seenDesc.add(desc!);
    }
  });
});

describe("site stats — single source of truth", () => {
  it("formats as a rounded-down 'N+' with Indian digit grouping", () => {
    expect(formatStat(200)).toBe("200+");
    expect(formatStat(2200)).toBe("2,200+");
    expect(formatStat(12000)).toBe("12,000+");
    expect(formatStat(120000)).toBe("1,20,000+");
  });
  it("HOME_STATS and SOCIAL_PROOF_STATS are derived from SITE_STATS, not hard-coded copies", () => {
    expect(SOCIAL_PROOF_STATS.map((s) => s.value)).toEqual([formatStat(SITE_STATS.agentsJoined), formatStat(SITE_STATS.recordsManaged)]);
    expect(HOME_STATS.map((s) => s.key)).toEqual(["agents", "records", "tools", "trial"]);
    expect(HOME_STATS.find((s) => s.key === "tools")!.value).toBe(String(SITE_STATS.freeTools));
    expect(HOME_STATS.find((s) => s.key === "trial")!.value).toBe(`${SITE_STATS.freeTrialDays} days`);
  });
  it("claims are positive whole numbers and `lastVerified` is a YYYY-MM date", () => {
    for (const n of [SITE_STATS.agentsJoined, SITE_STATS.recordsManaged, SITE_STATS.freeTools, SITE_STATS.freeTrialDays]) {
      expect(Number.isInteger(n) && n > 0).toBe(true);
    }
    expect(SITE_STATS.lastVerified).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
  });
  it("no page hard-codes the numbers — they must come from the config", () => {
    for (const f of ["src/pages/Landing.tsx", "src/pages/About.tsx"]) {
      const src = read(f);
      expect(src).not.toMatch(new RegExp(`\\b${SITE_STATS.agentsJoined}\\+`));
      expect(src).not.toMatch(new RegExp(`${SITE_STATS.recordsManaged.toLocaleString("en-IN")}\\+|${SITE_STATS.recordsManaged}\\+`));
    }
  });
});

describe("plan ids", () => {
  const ids = (src: string) => Array.from(src.matchAll(/\bid:\s*["']([a-z0-9-]+)["']/g)).map((m) => m[1]);

  it("the signup page offers exactly the shared plan ids", () => {
    const signup = ids(read("src/pages/SignUp.tsx")).filter((i) => /month/.test(i));
    expect([...signup].sort()).toEqual([...PLAN_IDS].sort());
  });
  it("the home page shows exactly the shared plan ids (none missing, none invented)", () => {
    const landing = ids(read("src/pages/Landing.tsx")).filter((i) => /month/.test(i));
    expect([...landing].sort()).toEqual([...PLAN_IDS].sort());
  });
  it("/our-plans lists exactly the shared plan ids", () => {
    const op = ids(read("src/pages/OurPlans.tsx")).filter((i) => /month/.test(i));
    expect([...op].sort()).toEqual([...PLAN_IDS].sort());
  });
  it("isValidPlanId / signupPathForPlan", () => {
    for (const id of PLAN_IDS) { expect(isValidPlanId(id)).toBe(true); expect(signupPathForPlan(id)).toBe(`/signup?plan=${id}`); }
    for (const bad of ["", "free", "3month", "constructor", "__proto__", null, undefined, 3, {}, "3months "]) {
      expect(isValidPlanId(bad)).toBe(false);
    }
    expect(signupPathForPlan("nope")).toBe("/signup");
  });
});
