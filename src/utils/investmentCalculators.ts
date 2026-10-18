// Pure maths for the Lumpsum, Fixed Deposit (FD) and Recurring Deposit (RD) calculators.
// Kept out of the page components so every formula is unit-tested (src/test/investmentCalculators.test.ts).
//
// All three are ESTIMATES: real banks/funds differ in day-count, part-period interest and rounding.

// NumberField doesn't clamp typed input, so a user can enter negatives or absurd values.
// Sanitise here so no page can ever display NaN / Infinity.
const MAX_AMOUNT = 1e12;
const MAX_RATE = 100;   // % p.a.
const MAX_YEARS = 100;
const MAX_MONTHS = MAX_YEARS * 12;

const clamp = (v: number, max: number) => (Number.isFinite(v) && v > 0 ? Math.min(v, max) : 0);
const finiteOr0 = (v: number) => (Number.isFinite(v) ? v : 0);

// ── Lumpsum ────────────────────────────────────────────────────────────────
export interface LumpsumResult { invested: number; gains: number; maturity: number }

/** One-time investment, compounded annually: FV = P × (1 + r)^years. */
export const calcLumpsum = (principal: number, annualRatePct: number, years: number): LumpsumResult => {
  const p = clamp(principal, MAX_AMOUNT);
  const r = clamp(annualRatePct, MAX_RATE) / 100;
  const t = clamp(years, MAX_YEARS);
  const maturity = finiteOr0(p * Math.pow(1 + r, t));
  return { invested: p, gains: maturity - p, maturity };
};

// ── Fixed Deposit ──────────────────────────────────────────────────────────
export type Compounding = "monthly" | "quarterly" | "halfyearly" | "yearly";

export const COMPOUNDING_PER_YEAR: Record<Compounding, number> = {
  monthly: 12,
  quarterly: 4,   // what Indian banks use by default
  halfyearly: 2,
  yearly: 1,
};

export const COMPOUNDING_LABEL: Record<Compounding, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  halfyearly: "Half-yearly",
  yearly: "Yearly",
};

export interface FdResult {
  invested: number;
  interest: number;
  maturity: number;
  /** Effective annual yield (what the deposit really earns per year after compounding), in %. */
  effectiveYieldPct: number;
}

/** Maturity = P × (1 + r/n)^(n × years), n = compounding periods per year. */
export const calcFd = (
  principal: number,
  annualRatePct: number,
  tenureMonths: number,
  compounding: Compounding = "quarterly"
): FdResult => {
  const p = clamp(principal, MAX_AMOUNT);
  const r = clamp(annualRatePct, MAX_RATE) / 100;
  const months = clamp(tenureMonths, MAX_MONTHS);
  const n = COMPOUNDING_PER_YEAR[compounding] ?? 4;

  const maturity = finiteOr0(p * Math.pow(1 + r / n, n * (months / 12)));
  const effectiveYieldPct = months > 0 && p > 0 ? finiteOr0((Math.pow(maturity / p, 12 / months) - 1) * 100) : 0;
  return { invested: p, interest: maturity - p, maturity, effectiveYieldPct };
};

// ── Recurring Deposit ──────────────────────────────────────────────────────
export interface RdResult { invested: number; interest: number; maturity: number }

/**
 * Monthly deposits at the start of each month, interest compounded QUARTERLY (the Indian-bank
 * convention). Each instalment k (1…n) earns for (n − k + 1) months:
 *     maturity = Σ D × (1 + r/4)^((n − k + 1)/3)
 * which is a geometric series — with g = (1 + r/4)^(1/3), the monthly growth factor:
 *     maturity = D × g × (gⁿ − 1) / (g − 1)
 */
export const calcRd = (monthlyDeposit: number, annualRatePct: number, tenureMonths: number): RdResult => {
  const d = clamp(monthlyDeposit, MAX_AMOUNT);
  const r = clamp(annualRatePct, MAX_RATE) / 100;
  const n = Math.floor(clamp(tenureMonths, MAX_MONTHS));

  const invested = d * n;
  if (n === 0 || d === 0) return { invested: 0, interest: 0, maturity: 0 };

  const g = Math.pow(1 + r / 4, 1 / 3);
  const maturity = finiteOr0(g === 1 ? invested : (d * g * (Math.pow(g, n) - 1)) / (g - 1));
  return { invested, interest: maturity - invested, maturity };
};

/** years + extra months → total months (never below 1, so a result always exists). */
export const tenureToMonths = (years: number, months: number): number =>
  Math.max(1, Math.floor(clamp(years, MAX_YEARS)) * 12 + Math.floor(clamp(months, 11)));
