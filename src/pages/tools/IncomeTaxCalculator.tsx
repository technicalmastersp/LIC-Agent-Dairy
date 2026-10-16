import { useState, useMemo } from "react";
import ToolPageLayout from "./ToolPageLayout";
import NumberField from "@/components/tools/NumberField";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, AlertTriangle } from "lucide-react";
import { computeIncomeTax, type Regime } from "@/utils/incomeTax";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const IncomeTaxCalculator = () => {
  const [regime, setRegime] = useState<Regime>("new");
  const [grossIncome, setGrossIncome] = useState(1200000);
  const [deductions, setDeductions] = useState(150000); // 80C/80D/etc — old regime only

  const result = useMemo(
    () => computeIncomeTax(regime, grossIncome, deductions),
    [regime, grossIncome, deductions]
  );

  return (
    <ToolPageLayout
      icon={Receipt}
      title="Income Tax Calculator"
      description="Free income tax calculator for FY 2026-27: compare India's old and new regimes and estimate your tax, 4% cess and in-hand income."
      accent="amber"
    >
      <Card className="rounded-2xl mt-3">
        <CardContent className="p-6 md:p-8 space-y-7">
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Estimate only, using the individual slab rates for FY 2026-27 (unchanged from FY 2025-26).
              The ₹75,000 / ₹50,000 standard deduction applies to salaried individuals and pensioners.
              Surcharge, senior-citizen slabs and other income are not included. Tax law changes every
              Budget — verify with the Income Tax Department or a tax professional before making real decisions.
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

          {result.marginalReliefApplied && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              Marginal relief applies — your tax is limited to the income earned above ₹12,00,000.
            </p>
          )}

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
              <p className="text-xs text-green-700 mb-1">Estimated get in hand</p>
              <p className="text-2xl font-bold text-green-800">{inr(result.takeHome)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolPageLayout>
  );
};

export default IncomeTaxCalculator;