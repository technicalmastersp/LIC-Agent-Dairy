import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

const NumberField = ({ label, value, onChange, min, max, step = 1, prefix, suffix }: NumberFieldProps) => (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between">
      <Label className="text-sm text-form-header">{label}</Label>
      <div className="flex items-center gap-1 bg-muted/60 rounded-lg px-2.5 py-1">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-6 w-24 border-0 bg-transparent p-0 text-right text-sm font-semibold shadow-none focus-visible:ring-0"
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
      className="py-1"
    />
  </div>
);

export default NumberField;