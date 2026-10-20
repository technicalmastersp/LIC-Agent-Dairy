import { useState, useMemo } from "react";
import ToolPageLayout from "./ToolPageLayout";
import NumberField from "@/components/tools/NumberField";
import TenureFields from "@/components/tools/TenureFields";
import ToolExplainer from "@/components/tools/ToolExplainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { calcFd, tenureToMonths, COMPOUNDING_LABEL, type Compounding } from "@/utils/investmentCalculators";
import { useLanguage } from "@/hooks/useLanguage";
import Trans from "@/components/Trans";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const COMPOUNDING_OPTIONS: Compounding[] = ["quarterly", "monthly", "halfyearly", "yearly"];

const FdCalculator = () => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(5);
  const [extraMonths, setExtraMonths] = useState(0);
  const [compounding, setCompounding] = useState<Compounding>("quarterly");

  const months = tenureToMonths(years, extraMonths);
  const { invested, interest, maturity, effectiveYieldPct } = useMemo(
    () => calcFd(amount, rate, months, compounding),
    [amount, rate, months, compounding]
  );

  const chartData = [
    { name: t('tools.deposit'), value: invested, color: "#16a34a" },
    { name: t('common.interest'), value: interest, color: "#bbf7d0" },
  ];

  return (
    <ToolPageLayout
      icon={Landmark}
      title={t('tools.fixedDepositFdCalculator')}
      description={t('tools.freeFdCalculatorEnter')}
      accent="green"
    >
      <Card className="rounded-2xl mt-3">
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-7">
              <NumberField label={t('tools.depositAmount')} value={amount} onChange={setAmount} min={10000} max={10000000} step={10000} prefix="₹" />
              <NumberField label={t('tools.interestRateP')} value={rate} onChange={setRate} min={1} max={15} step={0.1} suffix="%" />
              <TenureFields years={years} months={extraMonths} onYearsChange={setYears} onMonthsChange={setExtraMonths} />

              <div className="space-y-2.5">
                <p className="text-sm text-form-header" id="fd-compounding-label">{t('tools.interestCompounded')}</p>
                <div role="group" aria-labelledby="fd-compounding-label" className="flex flex-wrap gap-2">
                  {COMPOUNDING_OPTIONS.map((c) => (
                    <Button
                      key={c}
                      type="button"
                      size="sm"
                      variant={compounding === c ? "default" : "outline"}
                      aria-pressed={compounding === c}
                      onClick={() => setCompounding(c)}
                    >
                      {COMPOUNDING_LABEL[c]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-full max-w-[220px] h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={2}>
                      {chartData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => inr(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 text-xs mt-1">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-600" />{t('tools.deposit')}</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-200" />{t('common.interest')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('tools.depositAmount')}</p>
              <p className="text-lg font-semibold text-form-header">{inr(invested)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('tools.interestEarned')}</p>
              <p className="text-lg font-semibold text-green-600">{inr(interest)}</p>
            </div>
            <div className="text-center bg-green-50 rounded-xl py-2">
              <p className="text-xs text-green-700 mb-1">{t('tools.maturityValue')}</p>
              <p className="text-xl font-bold text-green-800">{inr(maturity)}</p>
            </div>
          </div>

          <p className="text-sm text-form-header text-center mt-5">
            <Trans i18nKey="tools.fdTenureYield" params={{ count: months, effectiveYieldPct: effectiveYieldPct.toFixed(2) }} /></p>

          <p className="text-xs text-muted-foreground mt-4">
            {t('tools.thisIsAnEstimateBefore')}
          </p>
        </CardContent>
      </Card>

      <ToolExplainer
        heading={t('tools.howFixedDepositInterest')}
        intro={t('tools.withACumulativeFd')}
        formula="Maturity = P × (1 + r / n) ^ (n × t)"
        legend={[
          t('tools.pTheAmountYouDeposit'),
          "r = annual interest rate, as a decimal (7% = 0.07)",
          "n = how many times a year interest is compounded (4 for quarterly)",
          "t = tenure in years (18 months = 1.5)",
        ]}
        faqs={[
          {
            q: t('tools.doesCompoundingFrequencyMatter'),
            a: t('tools.yesTheSameStatedRate'),
          },
          {
            q: t('tools.isFdInterestTaxable'),
            a: t('tools.yesInterestIsAdded'),
          },
          {
            q: t('tools.whatIfMyFdPays'),
            a: t('tools.aPayoutNonCumulativeFd'),
          },
          {
            q: t('tools.whyDoesMyBankShow'),
            a: t('tools.banksMayUseExactDay'),
          },
        ]}
      />
    </ToolPageLayout>
  );
};

export default FdCalculator;
