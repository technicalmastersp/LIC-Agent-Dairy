// Pure income-tax maths for the public Income Tax Calculator (kept out of the
// component so it can be unit-tested).
//
// Rates: FY 2026-27 (AY 2027-28). Budget 2026 left the individual slab rates
// unchanged from FY 2025-26, so the same table applies to both years.
// ⚠️ Re-verify against the Income Tax Department every Budget (Feb) and update.
//
// Deliberately NOT modelled (the page says so): surcharge (starts above ₹50L, and
// the page's income input is capped at ₹50L), senior-citizen slabs, other income.

export type Regime = "new" | "old";
export interface Slab { upTo: number; rate: number }

export const NEW_REGIME_SLABS: Slab[] = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 0.05 },
  { upTo: 1200000, rate: 0.10 },
  { upTo: 1600000, rate: 0.15 },
  { upTo: 2000000, rate: 0.20 },
  { upTo: 2400000, rate: 0.25 },
  { upTo: Infinity, rate: 0.30 },
];
export const NEW_REGIME_STANDARD_DEDUCTION = 75000;
export const NEW_REGIME_REBATE_LIMIT = 1200000; // Sec 87A: nil tax up to this total income

export const OLD_REGIME_SLABS: Slab[] = [
  { upTo: 250000, rate: 0 },
  { upTo: 500000, rate: 0.05 },
  { upTo: 1000000, rate: 0.20 },
  { upTo: Infinity, rate: 0.30 },
];
export const OLD_REGIME_STANDARD_DEDUCTION = 50000;
export const OLD_REGIME_REBATE_LIMIT = 500000;

export const calcSlabTax = (taxableIncome: number, slabs: Slab[]): number => {
  let tax = 0;
  let lower = 0;
  for (const slab of slabs) {
    if (taxableIncome <= lower) break;
    tax += (Math.min(taxableIncome, slab.upTo) - lower) * slab.rate;
    lower = slab.upTo;
  }
  return tax;
};

export interface IncomeTaxResult {
  taxableIncome: number;
  tax: number;            // before cess
  cess: number;           // 4% health & education cess
  totalTax: number;
  rebateApplied: boolean; // 87A rebate (full or via marginal relief)
  marginalReliefApplied: boolean;
  takeHome: number;
}

export const computeIncomeTax = (
  regime: Regime,
  grossIncome: number,
  deductions: number
): IncomeTaxResult => {
  const isNew = regime === "new";
  const standardDeduction = isNew ? NEW_REGIME_STANDARD_DEDUCTION : OLD_REGIME_STANDARD_DEDUCTION;
  const rebateLimit = isNew ? NEW_REGIME_REBATE_LIMIT : OLD_REGIME_REBATE_LIMIT;
  const slabs = isNew ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;

  const otherDeductions = isNew ? 0 : deductions;
  const taxableIncome = Math.max(0, grossIncome - standardDeduction - otherDeductions);

  let tax = calcSlabTax(taxableIncome, slabs);
  let rebateApplied = false;
  let marginalReliefApplied = false;

  if (taxableIncome <= rebateLimit) {
    tax = 0;
    rebateApplied = true;
  } else if (isNew) {
    // New regime only: marginal relief just above the ₹12L rebate limit — tax cannot
    // exceed the income earned above the limit. (The old regime's 87A rebate has no
    // marginal relief in law, so its cliff at ₹5L is correct.)
    const capped = taxableIncome - rebateLimit;
    if (tax > capped) {
      tax = capped;
      marginalReliefApplied = true;
    }
  }

  const cess = tax * 0.04;
  const totalTax = tax + cess;
  return { taxableIncome, tax, cess, totalTax, rebateApplied, marginalReliefApplied, takeHome: grossIncome - totalTax };
};
