import { useState, useMemo } from "react";
import ToolPageLayout from "./ToolPageLayout";
import NumberField from "@/components/tools/NumberField";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const HomeLoanEmiCalculator = () => {
  const [principal, setPrincipal] = useState(3000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const { emi, totalPayment, totalInterest } = useMemo(() => {
    const r = rate / 12 / 100;
    const n = years * 12;
    const e = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = e * n;
    return { emi: e, totalPayment: total, totalInterest: total - principal };
  }, [principal, rate, years]);

  const chartData = [
    { name: "Principal", value: principal, color: "#10b981" },
    { name: "Interest", value: totalInterest, color: "#a7f3d0" },
  ];

  return (
    <ToolPageLayout
      icon={Home}
      title="Home Loan EMI Calculator"
      description="Calculate your monthly EMI, total interest, and total repayment amount on a home loan."
      accent="emerald"
    >
      <Card className="rounded-2xl mt-3">
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-7">
              <NumberField label="Loan amount" value={principal} onChange={setPrincipal} min={100000} max={20000000} step={50000} prefix="₹" />
              <NumberField label="Interest rate" value={rate} onChange={setRate} min={1} max={20} step={0.1} suffix="%" />
              <NumberField label="Loan tenure" value={years} onChange={setYears} min={1} max={30} step={1} suffix="yrs" />
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
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Principal</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-200" />Interest</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
            <div className="text-center bg-emerald-50 rounded-xl py-2">
              <p className="text-xs text-emerald-600 mb-1">Monthly EMI</p>
              <p className="text-xl font-bold text-emerald-700">{inr(emi)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total interest</p>
              <p className="text-lg font-semibold text-form-header">{inr(totalInterest)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total payment</p>
              <p className="text-lg font-semibold text-form-header">{inr(totalPayment)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolPageLayout>
  );
};

export default HomeLoanEmiCalculator;