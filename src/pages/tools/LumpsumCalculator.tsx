import { useState, useMemo } from "react";
import ToolPageLayout from "./ToolPageLayout";
import NumberField from "@/components/tools/NumberField";
import ToolExplainer from "@/components/tools/ToolExplainer";
import { Card, CardContent } from "@/components/ui/card";
import { Banknote } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { calcLumpsum } from "@/utils/investmentCalculators";
import { useLanguage } from "@/hooks/useLanguage";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const LumpsumCalculator = () => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const { invested, gains, maturity } = useMemo(() => calcLumpsum(amount, rate, years), [amount, rate, years]);

  const chartData = [
    { name: t('tools.invested'), value: invested, color: "#6366f1" },
    { name: "Est. gains", value: gains, color: "#c7d2fe" },
  ];

  return (
    <ToolPageLayout
      icon={Banknote}
      title={t('tools.lumpsumCalculator')}
      description={t('tools.freeLumpsumCalculatorEnter')}
      accent="indigo"
    >
      <Card className="rounded-2xl mt-3">
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-7">
              <NumberField label={t('tools.totalInvestment')} value={amount} onChange={setAmount} min={5000} max={10000000} step={5000} prefix="₹" />
              <NumberField label={t('tools.expectedAnnualReturn')} value={rate} onChange={setRate} min={1} max={30} step={0.5} suffix="%" />
              <NumberField label={t('tools.investmentPeriod')} value={years} onChange={setYears} min={1} max={40} step={1} suffix={t('tools.yrs')} />
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
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />{t('tools.invested')}</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-200" />{t('tools.estGains')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('tools.investedAmount')}</p>
              <p className="text-lg font-semibold text-form-header">{inr(invested)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('tools.estGains')}</p>
              <p className="text-lg font-semibold text-green-600">{inr(gains)}</p>
            </div>
            <div className="text-center bg-indigo-50 rounded-xl py-2">
              <p className="text-xs text-indigo-600 mb-1">{t('tools.estTotalValue')}</p>
              <p className="text-xl font-bold text-indigo-700">{inr(maturity)}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            {t('tools.thisIsAnEstimateAssuming')}
          </p>
        </CardContent>
      </Card>

      <ToolExplainer
        heading={t('tools.howALumpsumInvestmentGrows')}
        intro={t('tools.aLumpsumIsASingle')}
        formula={t('tools.maturityValueP1R')}
        legend={[
          t('tools.pTheAmountYouInvest'),
          "r = expected annual return, as a decimal (12% = 0.12)",
          "t = number of years you stay invested",
        ]}
        faqs={[
          {
            q: t('tools.whatIsALumpsumInvestment'),
            a: t('tools.itIsInvestingTheWhole'),
          },
          {
            q: t('tools.lumpsumOrSipWhich'),
            a: t('tools.neitherWinsForEveryone'),
          },
          {
            q: t('tools.whatReturnShouldIAssume'),
            a: t('tools.noReturnIsGuaranteedPick'),
          },
          {
            q: t('tools.doesTheResultIncludeTax'),
            a: t('tools.noTheFigureIsBefore'),
          },
        ]}
      />
    </ToolPageLayout>
  );
};

export default LumpsumCalculator;
