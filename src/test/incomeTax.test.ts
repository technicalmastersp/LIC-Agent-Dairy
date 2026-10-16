import { describe, it, expect } from "vitest";
import { computeIncomeTax } from "@/utils/incomeTax";

describe("computeIncomeTax — new regime", () => {
  it("is nil up to ₹12L taxable (87A rebate)", () => {
    const r = computeIncomeTax("new", 1275000, 0); // 12.75L gross - 75k std ded = 12L
    expect(r.taxableIncome).toBe(1200000);
    expect(r.totalTax).toBe(0);
    expect(r.rebateApplied).toBe(true);
  });
  it("applies marginal relief just above ₹12L (tax capped at income over 12L)", () => {
    const r = computeIncomeTax("new", 1285000, 0); // taxable 12,10,000
    expect(r.tax).toBe(10000);
    expect(r.cess).toBeCloseTo(400);
    expect(r.marginalReliefApplied).toBe(true);
  });
  it("marginal relief stops once slab tax drops below the excess over ₹12L", () => {
    const r = computeIncomeTax("new", 1350000, 0); // taxable 12,75,000: slab tax 71,250 < excess 75,000
    expect(r.marginalReliefApplied).toBe(false);
    expect(r.tax).toBe(71250);
  });
  it("matches the published example: ₹13L taxable income -> ₹75,000 tax (before cess)", () => {
    const r = computeIncomeTax("new", 1375000, 0); // 13.75L gross - 75k = 13L taxable
    expect(r.tax).toBe(75000);
  });
  it("top slab: ₹30L gross", () => {
    const r = computeIncomeTax("new", 3000000, 0); // taxable 29,25,000
    // 0 + 20k + 40k + 60k + 80k + 100k + (525000*0.30=157,500) = 457,500
    expect(r.tax).toBe(457500);
    expect(r.totalTax).toBeCloseTo(457500 * 1.04);
  });
});

describe("computeIncomeTax — old regime", () => {
  it("is nil up to ₹5L taxable", () => {
    const r = computeIncomeTax("old", 550000, 0); // 5.5L - 50k = 5L
    expect(r.totalTax).toBe(0);
  });
  it("has NO marginal relief above ₹5L (cliff is correct for the old regime)", () => {
    const r = computeIncomeTax("old", 560000, 0); // taxable 5.1L -> 12,500 + 20% of 10k = 14,500
    expect(r.tax).toBe(14500);
    expect(r.marginalReliefApplied).toBe(false);
  });
  it("subtracts deductions", () => {
    const r = computeIncomeTax("old", 1000000, 150000); // taxable 8L
    expect(r.taxableIncome).toBe(800000);
    expect(r.tax).toBe(12500 + 0.2 * 300000);
  });
});
