import { useState, useMemo } from "react";
import ToolPageLayout from "./ToolPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cake, Calendar, Gift } from "lucide-react";

const AgeCalculator = () => {
  const [dob, setDob] = useState("");

  const result = useMemo(() => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    if (isNaN(birth.getTime()) || birth > today) return null;

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < today) nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return { years, months, days, totalDays, daysToNextBirthday };
  }, [dob]);

  return (
    <ToolPageLayout
      icon={Cake}
      title="Age Calculator"
      description="Enter a date of birth to find the exact age in years, months, and days."
      accent="blue"
    >
      <Card className="rounded-2xl mt-3">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="max-w-xs"
            />
          </div>

          {result && (
            <div className="space-y-5 pt-2">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Years", val: result.years },
                  { label: "Months", val: result.months },
                  { label: "Days", val: result.days },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-700">{val}</p>
                    <p className="text-xs text-blue-600/80 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-4">
                  <Calendar className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-form-header">{result.totalDays.toLocaleString("en-IN")} days lived</p>
                    <p className="text-xs text-muted-foreground">Since your date of birth</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-4">
                  <Gift className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-form-header">{result.daysToNextBirthday} days to go</p>
                    <p className="text-xs text-muted-foreground">Until your next birthday</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </ToolPageLayout>
  );
};

export default AgeCalculator;