// ─────────────────────────────────────────────────────────────────────────────
//  SINGLE SOURCE OF TRUTH for every number shown on the marketing pages
//  (home page stats band, About page stats bar, …). Edit it HERE and nowhere else.
//
//  agentsJoined / recordsManaged are CLAIMS ABOUT YOUR BUSINESS, so they must be true:
//  run `npm run site-stats` in the backend repo — it counts your real agents and policy
//  records and prints rounded-DOWN figures ready to paste below. Update every few
//  months (and bump `lastVerified`) so the site never claims more than is real.
// ─────────────────────────────────────────────────────────────────────────────
export const SITE_STATS = {
  /** Agent accounts registered. Shown as "200+". */
  agentsJoined: 200,
  /** Policy records stored across all agents. Shown as "2,200+". */
  recordsManaged: 2700,
  /**
   * Free calculators on /tools. Must equal the number of /tools/* routes — enforced by
   * src/test/siteStats.test.ts, so adding a tool without updating this fails the build.
   */
  freeTools: 9,
  /** Length of the free trial (backend plan "1month-free" = 30 days). */
  freeTrialDays: 30,
  /** When agentsJoined / recordsManaged were last checked against the database (YYYY-MM). */
  lastVerified: "2026-10",
} as const;

// "2,200+" — Indian digit grouping, always with the trailing plus (these are floors, not exact counts).
export const formatStat = (n: number): string => `${new Intl.NumberFormat("en-IN").format(n)}+`;

import type { TranslationKey } from "@/types/i18n.types";

export interface SiteStat {
  key: string;
  /** English display value / fallback (also what tests assert). */
  value: string;
  /** English label / fallback. */
  label: string;
  /** i18n keys — config is module-scope, so the UI translates these at render. */
  labelKey: TranslationKey;
  valueKey?: TranslationKey;
  valueParams?: Record<string, number>;
}

/** The two customer-base proof points, in display order. */
export const SOCIAL_PROOF_STATS: SiteStat[] = [
  { key: "agents", value: formatStat(SITE_STATS.agentsJoined), label: "Agents joined", labelKey: "common.statAgentsJoined" },
  { key: "records", value: formatStat(SITE_STATS.recordsManaged), label: "Records managed", labelKey: "common.statRecordsManaged" },
];

/** Everything the home page stats band shows. */
export const HOME_STATS: SiteStat[] = [
  ...SOCIAL_PROOF_STATS,
  { key: "tools", value: String(SITE_STATS.freeTools), label: "Free calculators", labelKey: "common.statFreeCalculators" },
  { key: "trial", value: `${SITE_STATS.freeTrialDays} days`, label: "Free trial, no credit card", labelKey: "common.statTrialNoCard", valueKey: "common.statDays", valueParams: { days: SITE_STATS.freeTrialDays } },
];
