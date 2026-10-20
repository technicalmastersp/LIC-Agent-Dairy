import { useState, useMemo } from "react";
import ToolPageLayout from "./ToolPageLayout";
import NumberField from "@/components/tools/NumberField";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useLanguage } from "@/hooks/useLanguage";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const SipCalculator = () => {
  const { t } = useLanguage();
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const { invested, futureValue, gains } = useMemo(() => {
    const i = rate / 12 / 100;
    const n = years * 12;
    const fv = i === 0 ? monthly * n : monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const inv = monthly * n;
    return { invested: inv, futureValue: fv, gains: fv - inv };
  }, [monthly, rate, years]);

  const chartData = [
    { name: "Invested", value: invested, color: "#8b5cf6" },
    { name: "Est. gains", value: gains, color: "#c4b5fd" },
  ];

  return (
    <ToolPageLayout
      icon={TrendingUp}
      title={t('tools.sipCalculator')}
      description={t('tools.estimateTheFutureValue')}
      accent="violet"
    >
      <Card className="rounded-2xl mt-3">
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-7">
              <NumberField label={t('tools.monthlyInvestment')} value={monthly} onChange={setMonthly} min={500} max={200000} step={500} prefix="₹" />
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
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" />{t('tools.invested')}</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-200" />{t('tools.estGains')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('tools.investedAmount')}</p>
              <p className="text-lg font-semibold text-form-header">{inr(invested)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{t('tools.totalInterest')}</p>
              <p className="text-lg font-semibold text-green-600">{inr(gains)}</p>
            </div>
            <div className="text-center bg-violet-50 rounded-xl py-2">
              <p className="text-xs text-violet-600 mb-1">{t('tools.estTotalReturns')}</p>
              <p className="text-xl font-bold text-violet-700">{inr(futureValue)}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            {t('tools.thisIsAnEstimateAssuming2')}
          </p>
        </CardContent>
      </Card>
    </ToolPageLayout>
  );
};

export default SipCalculator;