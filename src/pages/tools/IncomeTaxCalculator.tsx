import { useState, useMemo } from "react";
import ToolPageLayout from "./ToolPageLayout";
import NumberField from "@/components/tools/NumberField";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, AlertTriangle } from "lucide-react";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

// ⚠️ Rates as understood for FY 2025-26 (AY 2026-27) — VERIFY against the
// official Income Tax Department before relying on this for real filing.
// Tax law changes with every Union Budget; update these slabs each year.
const NEW_REGIME_SLABS = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 0.05 },
  { upTo: 1200000, rate: 0.10 },
  { upTo: 1600000, rate: 0.15 },
  { upTo: 2000000, rate: 0.20 },
  { upTo: 2400000, rate: 0.25 },
  { upTo: Infinity, rate: 0.30 },
];
const NEW_REGIME_STANDARD_DEDUCTION = 75000;
const NEW_REGIME_REBATE_LIMIT = 1200000; // taxable income up to this = effectively nil tax (Sec 87A)

const OLD_REGIME_SLABS = [
  { upTo: 250000, rate: 0 },
  { upTo: 500000, rate: 0.05 },
  { upTo: 1000000, rate: 0.20 },
  { upTo: Infinity, rate: 0.30 },
];
const OLD_REGIME_STANDARD_DEDUCTION = 50000;
const OLD_REGIME_REBATE_LIMIT = 500000;

const calcSlabTax = (taxableIncome: number, slabs: typeof NEW_REGIME_SLABS) => {
  let tax = 0;
  let lower = 0;
  for (const slab of slabs) {
    if (taxableIncome <= lower) break;
    const taxableInSlab = Math.min(taxableIncome, slab.upTo) - lower;
    tax += taxableInSlab * slab.rate;
    lower = slab.upTo;
  }
  return tax;
};

const IncomeTaxCalculator = () => {
  const [regime, setRegime] = useState<"new" | "old">("new");
  const [grossIncome, setGrossIncome] = useState(1200000);
  const [deductions, setDeductions] = useState(150000); // 80C/80D/etc — old regime only

  const result = useMemo(() => {
    const isNew = regime === "new";
    const standardDeduction = isNew ? NEW_REGIME_STANDARD_DEDUCTION : OLD_REGIME_STANDARD_DEDUCTION;
    const rebateLimit = isNew ? NEW_REGIME_REBATE_LIMIT : OLD_REGIME_REBATE_LIMIT;
    const slabs = isNew ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;

    const otherDeductions = isNew ? 0 : deductions;
    const taxableIncome = Math.max(0, grossIncome - standardDeduction - otherDeductions);

    let tax = calcSlabTax(taxableIncome, slabs);
    const rebateApplied = taxableIncome <= rebateLimit;
    if (rebateApplied) tax = 0;

    const cess = tax * 0.04;
    const totalTax = tax + cess;

    return { taxableIncome, tax, cess, totalTax, rebateApplied, takeHome: grossIncome - totalTax };
  }, [regime, grossIncome, deductions]);

  return (
    <ToolPageLayout
      icon={Receipt}
      title="Income Tax Calculator"
      description="Estimate your income tax liability under India's old and new tax regimes."
      accent="amber"
    >
      <Card className="rounded-2xl mt-3">
        <CardContent className="p-6 md:p-8 space-y-7">
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Estimate only, based on FY 2025-26 slabs as commonly understood — tax law changes every
              Budget. Please verify current rates with the Income Tax Department or a tax professional
              before making real decisions.
            </p>
          </div>

          <div className="flex gap-2">
            {(["new", "old"] as const).map((r) => (
              <Button key={r} variant={regime === r ? "default" : "outline"} size="sm" onClick={() => setRegime(r)} className="capitalize">
                {r} regime
              </Button>
            ))}
          </div>

          <NumberField label="Gross annual income" value={grossIncome} onChange={setGrossIncome} min={200000} max={5000000} step={10000} prefix="₹" />

          {regime === "old" && (
            <NumberField label="Deductions (80C, 80D, HRA, etc.)" value={deductions} onChange={setDeductions} min={0} max={500000} step={5000} prefix="₹" />
          )}

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Taxable income</p>
              <p className="text-lg font-semibold text-form-header">{inr(result.taxableIncome)}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Health & education cess (4%)</p>
              <p className="text-lg font-semibold text-form-header">{inr(result.cess)}</p>
            </div>
          </div>

          {result.rebateApplied && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              Rebate under Section 87A applies — your tax liability is effectively nil.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-xs text-amber-700 mb-1">Total tax payable</p>
              <p className="text-2xl font-bold text-amber-800">{inr(result.totalTax)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-xs text-green-700 mb-1">Estimated take-home</p>
              <p className="text-2xl font-bold text-green-800">{inr(result.takeHome)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolPageLayout>
  );
};

export default IncomeTaxCalculator;