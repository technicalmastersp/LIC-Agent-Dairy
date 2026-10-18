import { useState, useMemo } from "react";
import ToolPageLayout from "./ToolPageLayout";
import NumberField from "@/components/tools/NumberField";
import TenureFields from "@/components/tools/TenureFields";
import ToolExplainer from "@/components/tools/ToolExplainer";
import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { calcRd, tenureToMonths } from "@/utils/investmentCalculators";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const RdCalculator = () => {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(5);
  const [extraMonths, setExtraMonths] = useState(0);

  const months = tenureToMonths(years, extraMonths);
  const { invested, interest, maturity } = useMemo(() => calcRd(monthly, rate, months), [monthly, rate, months]);

  const chartData = [
    { name: "Deposited", value: invested, color: "#f97316" },
    { name: "Interest", value: interest, color: "#fed7aa" },
  ];

  return (
    <ToolPageLayout
      icon={PiggyBank}
      title="Recurring Deposit (RD) Calculator"
      description="Free RD calculator: enter a monthly deposit, interest rate and tenure to see the recurring deposit maturity amount and total interest earned."
      accent="orange"
    >
      <Card className="rounded-2xl mt-3">
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-7">
              <NumberField label="Monthly deposit" value={monthly} onChange={setMonthly} min={500} max={100000} step={500} prefix="₹" />
              <NumberField label="Interest rate (p.a.)" value={rate} onChange={setRate} min={1} max={15} step={0.1} suffix="%" />
              <TenureFields years={years} months={extraMonths} onYearsChange={setYears} onMonthsChange={setExtraMonths} />
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
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" />Deposited</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-200" />Interest</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total deposited</p>
              <p className="text-lg font-semibold text-form-header">{inr(invested)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Interest earned</p>
              <p className="text-lg font-semibold text-green-600">{inr(interest)}</p>
            </div>
            <div className="text-center bg-orange-50 rounded-xl py-2">
              <p className="text-xs text-orange-700 mb-1">Maturity value</p>
              <p className="text-xl font-bold text-orange-800">{inr(maturity)}</p>
            </div>
          </div>

          <p className="text-sm text-form-header text-center mt-5">
            Tenure: <strong>{months} month{months === 1 ? "" : "s"}</strong> · {months} monthly deposits
          </p>

          <p className="text-xs text-muted-foreground mt-4">
            This is an estimate before tax, with interest compounded quarterly as most Indian banks do. Banks may treat a part-quarter slightly differently, so confirm the final figure with your bank.
          </p>
        </CardContent>
      </Card>

      <ToolExplainer
        heading="How recurring deposit interest is calculated"
        intro="In an RD you deposit a fixed amount every month. Each instalment earns interest only for the months it stays in the account, so earlier deposits earn more than later ones. Interest is compounded quarterly, and the maturity value is every instalment plus its interest."
        formula="Maturity = D × g × (gⁿ − 1) ÷ (g − 1),   g = (1 + r / 4) ^ (1/3)"
        legend={[
          "D = your monthly deposit",
          "r = annual interest rate, as a decimal (7% = 0.07)",
          "g = the monthly growth factor implied by quarterly compounding",
          "n = number of months (and number of deposits)",
        ]}
        faqs={[
          {
            q: "What is a recurring deposit?",
            a: "An RD lets you deposit a fixed amount every month for a chosen tenure at a fixed interest rate, and collect the total, with interest, at maturity. It builds a savings habit without needing a large starting amount.",
          },
          {
            q: "What happens if I miss an instalment?",
            a: "Banks usually charge a small penalty for each missed or late instalment, and some close the RD after repeated misses. The rules differ by bank, so check yours.",
          },
          {
            q: "RD or SIP?",
            a: "An RD earns a fixed, bank-declared rate, so the outcome is predictable but usually modest. A mutual fund SIP has no guaranteed return, with higher potential and higher risk. Compare both using this calculator and the SIP calculator.",
          },
          {
            q: "Is RD interest taxable?",
            a: "Yes. The interest is added to your income and taxed at your slab rate, and TDS may apply above a threshold. This calculator shows interest before tax.",
          },
        ]}
      />
    </ToolPageLayout>
  );
};

export default RdCalculator;
