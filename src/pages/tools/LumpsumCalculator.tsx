import { useState, useMemo } from "react";
import ToolPageLayout from "./ToolPageLayout";
import NumberField from "@/components/tools/NumberField";
import ToolExplainer from "@/components/tools/ToolExplainer";
import { Card, CardContent } from "@/components/ui/card";
import { Banknote } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { calcLumpsum } from "@/utils/investmentCalculators";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const LumpsumCalculator = () => {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const { invested, gains, maturity } = useMemo(() => calcLumpsum(amount, rate, years), [amount, rate, years]);

  const chartData = [
    { name: "Invested", value: invested, color: "#6366f1" },
    { name: "Est. gains", value: gains, color: "#c7d2fe" },
  ];

  return (
    <ToolPageLayout
      icon={Banknote}
      title="Lumpsum Calculator"
      description="Free lumpsum calculator: enter a one-time investment, expected annual return and period to see the estimated maturity value and total gains."
      accent="indigo"
    >
      <Card className="rounded-2xl mt-3">
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-7">
              <NumberField label="Total investment" value={amount} onChange={setAmount} min={5000} max={10000000} step={5000} prefix="₹" />
              <NumberField label="Expected annual return" value={rate} onChange={setRate} min={1} max={30} step={0.5} suffix="%" />
              <NumberField label="Investment period" value={years} onChange={setYears} min={1} max={40} step={1} suffix="yrs" />
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
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />Invested</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-200" />Est. gains</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Invested amount</p>
              <p className="text-lg font-semibold text-form-header">{inr(invested)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Est. gains</p>
              <p className="text-lg font-semibold text-green-600">{inr(gains)}</p>
            </div>
            <div className="text-center bg-indigo-50 rounded-xl py-2">
              <p className="text-xs text-indigo-600 mb-1">Est. total value</p>
              <p className="text-xl font-bold text-indigo-700">{inr(maturity)}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            This is an estimate assuming a constant annual return, compounded yearly, before tax and fund charges. Actual returns fluctuate and aren't guaranteed.
          </p>
        </CardContent>
      </Card>

      <ToolExplainer
        heading="How a lumpsum investment grows"
        intro="A lumpsum is a single, one-time investment. Every year the return is added to the amount, so the next year's return is earned on a bigger base — that is compounding."
        formula="Maturity value = P × (1 + r) ^ t"
        legend={[
          "P = the amount you invest today",
          "r = expected annual return, as a decimal (12% = 0.12)",
          "t = number of years you stay invested",
        ]}
        faqs={[
          {
            q: "What is a lumpsum investment?",
            a: "It is investing the whole amount at once, instead of a SIP where you invest a fixed amount every month. It suits money you already have available, such as a bonus, maturity proceeds or savings.",
          },
          {
            q: "Lumpsum or SIP — which is better?",
            a: "Neither wins for everyone. A lumpsum puts all your money to work from day one, which helps if markets rise afterwards. A SIP spreads your purchases over time, which reduces the risk of investing everything just before a fall and suits a regular income. Try this calculator and the SIP calculator side by side.",
          },
          {
            q: "What return should I assume?",
            a: "No return is guaranteed. Pick a conservative figure and also try lower ones to see how sensitive the result is — small changes in the rate make a large difference over long periods.",
          },
          {
            q: "Does the result include tax or charges?",
            a: "No. The figure is before tax, expense ratio and exit loads. Your actual take-home depends on the instrument you choose and how long you hold it.",
          },
        ]}
      />
    </ToolPageLayout>
  );
};

export default LumpsumCalculator;
