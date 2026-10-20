import { useState, useMemo } from "react";
import ToolPageLayout from "./ToolPageLayout";
import NumberField from "@/components/tools/NumberField";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, AlertTriangle } from "lucide-react";
import { computeIncomeTax, type Regime } from "@/utils/incomeTax";
import { useLanguage } from "@/hooks/useLanguage";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const IncomeTaxCalculator = () => {
  const { t } = useLanguage();
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
      title={t('tools.incomeTaxCalculator')}
      description={t('tools.freeIncomeTaxCalculator')}
      accent="amber"
    >
      <Card className="rounded-2xl mt-3">
        <CardContent className="p-6 md:p-8 space-y-7">
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              {t('tools.estimateOnlyUsingTheIndividual')}
            </p>
          </div>

          <div className="flex gap-2">
            {(["new", "old"] as const).map((r) => (
              <Button key={r} variant={regime === r ? "default" : "outline"} size="sm" onClick={() => setRegime(r)} className="capitalize">
                {t(r === "old" ? 'tools.regimeOld' : 'tools.regimeNew')}
              </Button>
            ))}
          </div>

          <NumberField label={t('tools.grossAnnualIncome')} value={grossIncome} onChange={setGrossIncome} min={200000} max={5000000} step={10000} prefix="₹" />

          {regime === "old" && (
            <NumberField label={t('tools.deductions80c80dHraEtc')} value={deductions} onChange={setDeductions} min={0} max={500000} step={5000} prefix="₹" />
          )}

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{t('tools.taxableIncome')}</p>
              <p className="text-lg font-semibold text-form-header">{inr(result.taxableIncome)}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{t('tools.healthEducationCess4')}</p>
              <p className="text-lg font-semibold text-form-header">{inr(result.cess)}</p>
            </div>
          </div>

          {result.marginalReliefApplied && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {t('tools.marginalReliefAppliesYourTax')}
            </p>
          )}

          {result.rebateApplied && (
            <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {t('tools.rebateUnderSection87aApplies')}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-xs text-amber-700 mb-1">{t('tools.totalTaxPayable')}</p>
              <p className="text-2xl font-bold text-amber-800">{inr(result.totalTax)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-xs text-green-700 mb-1">{t('tools.estimatedGetInHand')}</p>
              <p className="text-2xl font-bold text-green-800">{inr(result.takeHome)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolPageLayout>
  );
};

export default IncomeTaxCalculator;