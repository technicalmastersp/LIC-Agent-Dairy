import { useState, useMemo } from "react";
import ToolPageLayout from "./ToolPageLayout";
import NumberField from "@/components/tools/NumberField";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

// Human Life Value method — a standard rule-of-thumb approach for coverage
// need, not a premium quote. Income multiplier decreases with age since
// fewer working years remain to replace.
const getIncomeMultiplier = (age: number) => {
  if (age < 30) return 20;
  if (age < 40) return 15;
  if (age < 50) return 10;
  if (age < 60) return 5;
  return 2;
};

const TermInsuranceCalculator = () => {
  const { t } = useLanguage();
  const [age, setAge] = useState(30);
  const [annualIncome, setAnnualIncome] = useState(800000);
  const [loans, setLoans] = useState(1500000);
  const [savings, setSavings] = useState(300000);

  const result = useMemo(() => {
    const multiplier = getIncomeMultiplier(age);
    const incomeReplacement = annualIncome * multiplier;
    const recommended = Math.max(0, incomeReplacement + loans - savings);
    return { multiplier, incomeReplacement, recommended };
  }, [age, annualIncome, loans, savings]);

  return (
    <ToolPageLayout
      icon={ShieldCheck}
      title={t('tools.termInsuranceCalculator')}
      description={t('tools.estimateHowMuchLifeCover')}
      accent="rose"
    >
      <Card className="rounded-2xl mt-3">
        <CardContent className="p-6 md:p-8 space-y-7">
          <NumberField label={t('tools.yourAge')} value={age} onChange={setAge} min={18} max={65} step={1} suffix={t('tools.yrs')} />
          <NumberField label={t('tools.annualIncome')} value={annualIncome} onChange={setAnnualIncome} min={100000} max={10000000} step={25000} prefix="₹" />
          <NumberField label={t('tools.outstandingLoansHomeCarEtc')} value={loans} onChange={setLoans} min={0} max={10000000} step={50000} prefix="₹" />
          <NumberField label={t('tools.existingSavingsInvestments')} value={savings} onChange={setSavings} min={0} max={10000000} step={25000} prefix="₹" />

          <div className="bg-rose-50 rounded-xl p-5 text-center">
            <p className="text-xs text-rose-600 mb-1">{t('tools.recommendedCover')}</p>
            <p className="text-3xl font-bold text-rose-700">{inr(result.recommended)}</p>
            <p className="text-xs text-rose-600/70 mt-2">
              {t('tools.basedOnAnnualIncomeAge', { multiplier: result.multiplier })}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            {t('tools.thisIsACoverageNeed')}
          </p>
        </CardContent>
      </Card>
    </ToolPageLayout>
  );
};

export default TermInsuranceCalculator;