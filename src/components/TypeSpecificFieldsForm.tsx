import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInsuranceTypeDef } from "@/config/insuranceTypes";
import type { InsuranceFieldDef } from "@/types/config/insuranceTypes.types";
import type { TypeSpecificFieldsFormProps } from "@/types/components/TypeSpecificFieldsForm.types";
// Renders the extra fields particular to the selected built-in insurance
// type (e.g. IDV + registration number for Vehicle Insurance, trip dates
// for Travel Insurance) — driven entirely by src/config/insuranceTypes.ts,
// so adding a field to a type only ever means editing that config file.
const TypeSpecificFieldsForm = ({ insuranceType, values, onChange }: TypeSpecificFieldsFormProps) => {
  const def = getInsuranceTypeDef(insuranceType);
  if (!def || def.fields.length === 0) return null;

  const renderField = (field: InsuranceFieldDef) => {
    const value = values?.[field.key] ?? "";
    const id = `type-field-${field.key}`;

    if (field.type === "select") {
      return (
        <Select value={value} onValueChange={(v) => onChange(field.key, v)}>
          <SelectTrigger id={id} className="mt-1">
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "textarea") {
      return (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          rows={3}
          className="mt-1 resize-none"
        />
      );
    }

    return (
      <Input
        id={id}
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder}
        className="mt-1"
      />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {def.fields.map((field) => (
        <div key={field.key}>
          <Label htmlFor={`type-field-${field.key}`}>
            {field.label}{field.unit ? <span className="text-muted-foreground font-normal"> ({field.unit})</span> : null}
          </Label>
          {renderField(field)}
        </div>
      ))}
    </div>
  );
};

export default TypeSpecificFieldsForm;
