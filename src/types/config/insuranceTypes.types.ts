import { type LucideIcon } from "lucide-react";
export type InsuranceFieldType = "text" | "number" | "date" | "textarea" | "select";
export interface InsuranceFieldDef {
  key: string;
  label: string;
  type: InsuranceFieldType;
  options?: string[];
  placeholder?: string;
  unit?: string; // shown as a small suffix hint, e.g. "years", "₹"
}
export interface InsuranceTypeDef {
  id: string; // must exactly match backend INSURANCE_TYPES
  label: string;
  shortLabel: string; // for compact UI (table badges, tabs)
  description: string;
  icon: LucideIcon;
  fields: InsuranceFieldDef[];
}
export interface CustomFieldValue {
  key: string;
  label: string;
  fieldType: InsuranceFieldType;
  options?: string[];
  value: string;
}
