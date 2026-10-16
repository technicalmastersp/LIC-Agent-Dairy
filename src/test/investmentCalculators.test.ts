import { describe, it, expect } from "vitest";
import {
  calcLumpsum, calcFd, calcRd, tenureToMonths, COMPOUNDING_PER_YEAR, type Compounding,
} from "@/utils/investmentCalculators";

// Independent brute-force RD maths — sums each instalment separately — used to cross-check the closed form.
const rdBruteForce = (d: number, ratePct: number, n: number) => {
  let total = 0;
  for (let k = 1; k <= n; k++) total += d * Math.pow(1 + ratePct / 400, (n - k + 1) / 3);
  return total;
};

describe("calcLumpsum", () => {
  it("₹1,00,000 at 12% for 10 years → ₹3,10,584.82 (1.12^10)", () => {
    const r = calcLumpsum(100000, 12, 10);
    expect(r.maturity).toBeCloseTo(310584.82, 1);
    expect(r.invested).toBe(100000);
    expect(r.gains).toBeCloseTo(210584.82, 1);
  });
  it("0% return → maturity equals principal", () => {
    expect(calcLumpsum(50000, 0, 5)).toEqual({ invested: 50000, gains: 0, maturity: 50000 });
  });
  it("₹1 lakh at 10% for 1 year → exactly ₹1,10,000", () => {
    expect(calcLumpsum(100000, 10, 1).maturity).toBeCloseTo(110000, 6);
  });
  it("grows with rate and with time", () => {
    expect(calcLumpsum(1e5, 12, 10).maturity).toBeGreaterThan(calcLumpsum(1e5, 8, 10).maturity);
    expect(calcLumpsum(1e5, 12, 20).maturity).toBeGreaterThan(calcLumpsum(1e5, 12, 10).maturity);
  });
});

describe("calcFd", () => {
  it("₹1,00,000 at 7% for 1 year, quarterly → ₹1,07,185.90", () => {
    const r = calcFd(100000, 7, 12, "quarterly");
    expect(r.maturity).toBeCloseTo(107185.9, 1);
    expect(r.interest).toBeCloseTo(7185.9, 1);
  });
  it("₹1,00,000 at 7% for 5 years, quarterly → ≈ ₹1,41,478", () => {
    expect(calcFd(100000, 7, 60, "quarterly").maturity).toBeCloseTo(141478, 0);
  });
  it("yearly compounding for 1 year at 8% is exactly simple interest", () => {
    expect(calcFd(100000, 8, 12, "yearly").maturity).toBeCloseTo(108000, 6);
  });
  it("more frequent compounding never earns less", () => {
    const m = (c: Compounding) => calcFd(100000, 7, 60, c).maturity;
    expect(m("yearly")).toBeLessThan(m("halfyearly"));
    expect(m("halfyearly")).toBeLessThan(m("quarterly"));
    expect(m("quarterly")).toBeLessThan(m("monthly"));
  });
  it("effective yield: 7% compounded quarterly = 7.19%; yearly = 7%", () => {
    expect(calcFd(100000, 7, 12, "quarterly").effectiveYieldPct).toBeCloseTo(7.19, 2);
    expect(calcFd(100000, 7, 60, "yearly").effectiveYieldPct).toBeCloseTo(7, 6);
  });
  it("0% rate → maturity equals the deposit", () => {
    expect(calcFd(100000, 0, 24).maturity).toBe(100000);
  });
  it("covers every compounding option", () => {
    for (const c of Object.keys(COMPOUNDING_PER_YEAR) as Compounding[]) {
      expect(calcFd(100000, 7, 12, c).maturity).toBeGreaterThan(100000);
    }
  });
});

describe("calcRd", () => {
  it("₹1,000/month for 12 months at 6% → ₹12,395.23 (invested ₹12,000)", () => {
    const r = calcRd(1000, 6, 12);
    expect(r.invested).toBe(12000);
    expect(r.maturity).toBeCloseTo(12395.23, 2);   // verified independently by simulation + per-instalment sum
    expect(r.interest).toBeCloseTo(395.23, 2);
  });
  it("agrees within ₹1 per ₹12,000 with the bank-style method (simple interest in a part-quarter)", () => {
    // Banks compound per full quarter and use simple interest for leftover months.
    const bank = (d: number, rate: number, n: number) => {
      let t = 0;
      for (let k = 1; k <= n; k++) {
        const months = n - k + 1, q = Math.floor(months / 3), rem = months % 3;
        t += d * Math.pow(1 + rate / 400, q) * (1 + (rate / 100) * (rem / 12));
      }
      return t;
    };
    expect(Math.abs(calcRd(1000, 6, 12).maturity - bank(1000, 6, 12))).toBeLessThan(1);
    // …and stays within 0.05% on a long tenure
    const long = calcRd(5000, 7, 60).maturity;
    expect(Math.abs(long - bank(5000, 7, 60)) / long).toBeLessThan(0.0005);
  });
  it("closed form matches the instalment-by-instalment brute force across many inputs", () => {
    for (const [d, rate, n] of [[500, 5, 6], [1000, 6, 12], [5000, 7, 60], [10000, 6.5, 120], [2500, 8.25, 37], [100000, 15, 120]]) {
      expect(calcRd(d, rate, n).maturity).toBeCloseTo(rdBruteForce(d, rate, n), 4);
    }
  });
  it("0% rate → maturity equals total deposited", () => {
    expect(calcRd(1000, 0, 24)).toEqual({ invested: 24000, interest: 0, maturity: 24000 });
  });
  it("interest is positive and grows with the rate", () => {
    expect(calcRd(5000, 7, 60).interest).toBeGreaterThan(0);
    expect(calcRd(5000, 8, 60).maturity).toBeGreaterThan(calcRd(5000, 7, 60).maturity);
  });
  it("one monthly instalment compounds for exactly its remaining months", () => {
    // n = 1: a single deposit earns one month: D × (1 + r/4)^(1/3)
    expect(calcRd(1000, 6, 1).maturity).toBeCloseTo(1000 * Math.pow(1.015, 1 / 3), 6);
  });
});

describe("tenureToMonths", () => {
  it("combines years and months, never below 1", () => {
    expect(tenureToMonths(5, 6)).toBe(66);
    expect(tenureToMonths(0, 0)).toBe(1);
    expect(tenureToMonths(1, 0)).toBe(12);
    expect(tenureToMonths(-3, -2)).toBe(1);
  });
});

describe("hostile / garbage input never produces NaN or Infinity", () => {
  const bad = [NaN, Infinity, -Infinity, -5, 0, 1e300];
  it.each(bad)("input %s is handled by all three calculators", (v) => {
    for (const out of [
      calcLumpsum(v, 12, 10), calcLumpsum(1e5, v, 10), calcLumpsum(1e5, 12, v),
      calcFd(v, 7, 12), calcFd(1e5, v, 12), calcFd(1e5, 7, v),
      calcRd(v, 7, 12), calcRd(1000, v, 12), calcRd(1000, 7, v),
    ]) {
      for (const n of Object.values(out)) expect(Number.isFinite(n)).toBe(true);
    }
  });
  it("an absurd rate and tenure is clamped rather than overflowing", () => {
    for (const n of Object.values(calcLumpsum(1e12, 100, 100))) expect(Number.isFinite(n)).toBe(true);
    for (const n of Object.values(calcFd(1e12, 100, 1200, "monthly"))) expect(Number.isFinite(n)).toBe(true);
  });
});
