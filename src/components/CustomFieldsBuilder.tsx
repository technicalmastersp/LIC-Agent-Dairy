import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  CUSTOM_FIELD_TYPES, MAX_CUSTOM_FIELDS, MAX_CUSTOM_LABEL_LENGTH, MAX_CUSTOM_TYPE_NAME_LENGTH,
  type CustomFieldValue, type InsuranceFieldType,
} from "@/config/insuranceTypes";

interface CustomFieldsBuilderProps {
  customTypeName: string;
  onCustomTypeNameChange: (name: string) => void;
  fields: CustomFieldValue[];
  onFieldsChange: (fields: CustomFieldValue[]) => void;
}

const FIELD_TYPE_LABELS: Record<InsuranceFieldType, string> = {
  text: "Short text",
  number: "Number",
  date: "Date",
  textarea: "Long text",
  select: "Dropdown",
};

const makeKey = (label: string, index: number) =>
  (label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || `field_${index}`);

// For the "Other (Custom)" insurance type: the agent names the type and
// then builds their own field list (label + type + optional select options
// + value) rather than picking from a fixed config. Mirrors the backend's
// customFields sub-schema and validateInsuranceTypeFields() limits exactly,
// so nothing here should exceed what the server will accept.
const CustomFieldsBuilder = ({ customTypeName, onCustomTypeNameChange, fields, onFieldsChange }: CustomFieldsBuilderProps) => {
  const addField = () => {
    if (fields.length >= MAX_CUSTOM_FIELDS) return;
    const index = fields.length;
    onFieldsChange([...fields, { key: `field_${index}_${Date.now()}`, label: "", fieldType: "text", value: "" }]);
  };

  const removeField = (index: number) => {
    onFieldsChange(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, patch: Partial<CustomFieldValue>) => {
    const next = [...fields];
    const updated = { ...next[index], ...patch };
    // Keep the internal key stable-ish and human-readable, derived from the label,
    // but only regenerate it while the field is still fresh (no value typed yet)
    // so we don't shuffle keys under an agent who's already filled the value in.
    if (patch.label !== undefined && !next[index].value) {
      updated.key = makeKey(patch.label, index);
    }
    if (updated.fieldType !== "select") {
      delete updated.options;
    } else if (!updated.options) {
      updated.options = [""];
    }
    next[index] = updated;
    onFieldsChange(next);
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const next = [...fields];
    const options = [...(next[fieldIndex].options || [])];
    options[optionIndex] = value;
    next[fieldIndex] = { ...next[fieldIndex], options };
    onFieldsChange(next);
  };

  const addOption = (fieldIndex: number) => {
    const next = [...fields];
    const options = [...(next[fieldIndex].options || []), ""];
    next[fieldIndex] = { ...next[fieldIndex], options };
    onFieldsChange(next);
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const next = [...fields];
    const options = (next[fieldIndex].options || []).filter((_, i) => i !== optionIndex);
    next[fieldIndex] = { ...next[fieldIndex], options };
    onFieldsChange(next);
  };

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="customInsuranceTypeName">Custom Insurance Type Name</Label>
        <Input
          id="customInsuranceTypeName"
          value={customTypeName}
          onChange={(e) => onCustomTypeNameChange(e.target.value.slice(0, MAX_CUSTOM_TYPE_NAME_LENGTH))}
          placeholder="e.g. Pet Insurance, Crop Insurance, Marine Cargo Insurance"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {customTypeName.length}/{MAX_CUSTOM_TYPE_NAME_LENGTH} characters
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Custom Fields</Label>
          <span className="text-xs text-muted-foreground">{fields.length}/{MAX_CUSTOM_FIELDS} fields</span>
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-4 text-center">
            No custom fields yet — add the details this insurance type needs (coverage, dates, limits, anything).
          </p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="rounded-lg border border-border p-3.5 space-y-3 bg-muted/20">
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground/50 mt-2.5 shrink-0" />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr,160px] gap-2.5">
                  <div>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value.slice(0, MAX_CUSTOM_LABEL_LENGTH) })}
                      placeholder="Field name, e.g. Coverage Region"
                    />
                  </div>
                  <Select value={field.fieldType} onValueChange={(v) => updateField(index, { fieldType: v as InsuranceFieldType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOM_FIELD_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{FIELD_TYPE_LABELS[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeField(index)} className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {field.fieldType === "select" && (
                <div className="pl-6 space-y-1.5">
                  <p className="text-xs text-muted-foreground">Dropdown options</p>
                  {(field.options || []).map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-1.5">
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(index, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        className="h-8 text-sm"
                      />
                      {(field.options || []).length > 1 && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeOption(index, optIndex)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" size="sm" variant="outline" onClick={() => addOption(index)} className="h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Add option
                  </Button>
                </div>
              )}

              <div className="pl-6">
                <Label className="text-xs text-muted-foreground">Value</Label>
                {field.fieldType === "textarea" ? (
                  <Textarea value={field.value} onChange={(e) => updateField(index, { value: e.target.value })} rows={2} className="mt-1 resize-none text-sm" />
                ) : field.fieldType === "select" ? (
                  <Select value={field.value} onValueChange={(v) => updateField(index, { value: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a value" />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options || []).filter(Boolean).map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.fieldType === "number" ? "number" : field.fieldType === "date" ? "date" : "text"}
                    value={field.value}
                    onChange={(e) => updateField(index, { value: e.target.value })}
                    className="mt-1 text-sm"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addField} disabled={fields.length >= MAX_CUSTOM_FIELDS}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add field
        </Button>
      </div>
    </div>
  );
};

export default CustomFieldsBuilder;
