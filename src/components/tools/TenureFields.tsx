import NumberField from "@/components/tools/NumberField";
import { useLanguage } from "@/hooks/useLanguage";

interface TenureFieldsProps {
  years: number;
  months: number;
  onYearsChange: (v: number) => void;
  onMonthsChange: (v: number) => void;
}

// Years + extra months. Deposits are usually quoted like "1 year 6 months", and a single
// slider can't express that precisely on a phone.
const TenureFields = ({ years, months, onYearsChange, onMonthsChange }: TenureFieldsProps) => {
  const { t } = useLanguage();
  return (
  <div className="space-y-7">
    <NumberField label={t('tools.tenure')} value={years} onChange={onYearsChange} min={0} max={10} step={1} suffix={t('tools.yrs')} />
    <NumberField label={t('tools.additionalMonths')} value={months} onChange={onMonthsChange} min={0} max={11} step={1} suffix={t('tools.mo')} />
  </div>
);
};

export default TenureFields;
