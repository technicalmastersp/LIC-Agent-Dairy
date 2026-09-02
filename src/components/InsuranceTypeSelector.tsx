import { INSURANCE_TYPES } from "@/config/insuranceTypes";
import { Check } from "lucide-react";
import type { InsuranceTypeSelectorProps } from "@/types/components/InsuranceTypeSelector.types";
// Card grid used on Add Record (and available for Edit) to pick which of
// the 6 built-in insurance types — or "Other (Custom)" — a record belongs
// to. Selecting a card is what drives which type-specific fields render
// underneath it.
const InsuranceTypeSelector = ({ value, onChange, disabled }: InsuranceTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {INSURANCE_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.id;
        return (
          <button
            key={type.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(type.id)}
            aria-pressed={isSelected}
            className={`relative text-left rounded-xl border p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-background hover:border-primary/40 hover:bg-muted/40"
            }`}
          >
            {isSelected && (
              <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            )}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${isSelected ? "bg-primary/15" : "bg-muted"}`}>
              <Icon className={`w-4.5 h-4.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <p className="text-sm font-medium text-form-header leading-tight pr-4">{type.label}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-snug">{type.description}</p>
          </button>
        );
      })}
    </div>
  );
};

export default InsuranceTypeSelector;
