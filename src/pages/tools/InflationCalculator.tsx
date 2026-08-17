import { useState, useMemo } from "react";
import ToolPageLayout from "./ToolPageLayout";
import NumberField from "@/components/tools/NumberField";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart as LineChartIcon } from "lucide-react";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const InflationCalculator = () => {
  const [mode, setMode] = useState<"future-cost" | "purchasing-power">("future-cost");
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const factor = Math.pow(1 + rate / 100, years);
    if (mode === "future-cost") {
      return { value: amount * factor, label: `Future cost of today's ₹${amount.toLocaleString("en-IN")}` };
    }
    return { value: amount / factor, label: `Today's purchasing power of ₹${amount.toLocaleString("en-IN")} in ${years} years` };
  }, [mode, amount, rate, years]);

  return (
    <ToolPageLayout
      icon={LineChartIcon}
      title="Inflation Calculator"
      description="See how inflation changes what money is worth — either what something will cost in the future, or what a future amount is worth today."
      accent="cyan"
    >
      <Card className="rounded-2xl mt-3">
        <CardContent className="p-6 md:p-8 space-y-7">
          <div className="flex gap-2 flex-wrap">
            <Button variant={mode === "future-cost" ? "default" : "outline"} size="sm" onClick={() => setMode("future-cost")}>
              What will it cost later?
            </Button>
            <Button variant={mode === "purchasing-power" ? "default" : "outline"} size="sm" onClick={() => setMode("purchasing-power")}>
              What's it worth today?
            </Button>
          </div>

          <NumberField
            label={mode === "future-cost" ? "Amount today" : "Future amount"}
            value={amount} onChange={setAmount} min={1000} max={10000000} step={1000} prefix="₹"
          />
          <NumberField label="Expected inflation rate" value={rate} onChange={setRate} min={1} max={15} step={0.5} suffix="%" />
          <NumberField label="Time period" value={years} onChange={setYears} min={1} max={40} step={1} suffix="yrs" />

          <div className="bg-cyan-50 rounded-xl p-5 text-center">
            <p className="text-xs text-cyan-700 mb-1">{result.label}</p>
            <p className="text-3xl font-bold text-cyan-800">{inr(result.value)}</p>
          </div>
        </CardContent>
      </Card>
    </ToolPageLayout>
  );
};

export default InflationCalculator;