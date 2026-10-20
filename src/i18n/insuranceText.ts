// src/i18n/insuranceText.ts
//
// Translated display text for the insurance-type config (src/config/insuranceTypes.ts).
//
// That config is module-scope data AND its `id`s, field `key`s and select `options` are persisted
// verbatim in the database (and validated by the backend), so they can never be translated. Only what
// the user READS is: type names, field labels, placeholders, units, and the label of a select option
// (the stored value stays e.g. "Yes"). Keys are derived by convention, so no config edits are needed
// to translate a new language — and a field with no translation simply shows its English label.
//
//   insurance.type.<id>.label|short|desc      insurance.field.<typeId>.<fieldKey>.label|ph
//   insurance.option.<value>                  insurance.unit.<unit>
import type { InsuranceFieldDef, InsuranceTypeDef } from "@/types/config/insuranceTypes.types";
import type { LanguageContextType } from "@/types/i18n.types";

/** "Term Life Insurance" -> "termLifeInsurance"; "Investment & Protection" -> "investmentProtection". */
export const insuranceSlug = (s: string): string =>
  s.split(/[^A-Za-z0-9]+/).filter(Boolean).map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w[0].toLowerCase() + w.slice(1))).join("");

export const insuranceKeys = {
  typeLabel: (typeId: string) => `insurance.type.${insuranceSlug(typeId)}.label`,
  typeShort: (typeId: string) => `insurance.type.${insuranceSlug(typeId)}.short`,
  typeDesc: (typeId: string) => `insurance.type.${insuranceSlug(typeId)}.desc`,
  fieldLabel: (typeId: string, fieldKey: string) => `insurance.field.${insuranceSlug(typeId)}.${fieldKey}.label`,
  fieldPlaceholder: (typeId: string, fieldKey: string) => `insurance.field.${insuranceSlug(typeId)}.${fieldKey}.ph`,
  option: (value: string) => `insurance.option.${insuranceSlug(value)}`,
  unit: (unit: string) => `insurance.unit.${insuranceSlug(unit)}`,
};

export function makeInsuranceText(tOr: LanguageContextType["tOr"]) {
  return {
    typeLabel: (def: InsuranceTypeDef) => tOr(insuranceKeys.typeLabel(def.id), def.label),
    typeShortLabel: (def: InsuranceTypeDef) => tOr(insuranceKeys.typeShort(def.id), def.shortLabel),
    typeDescription: (def: InsuranceTypeDef) => tOr(insuranceKeys.typeDesc(def.id), def.description),
    fieldLabel: (typeId: string, f: InsuranceFieldDef) => tOr(insuranceKeys.fieldLabel(typeId, f.key), f.label),
    fieldPlaceholder: (typeId: string, f: InsuranceFieldDef) =>
      f.placeholder ? tOr(insuranceKeys.fieldPlaceholder(typeId, f.key), f.placeholder) : undefined,
    /** Label for a stored select value (the value itself is never changed). */
    option: (value: string) => tOr(insuranceKeys.option(value), value),
    unit: (unit: string) => tOr(insuranceKeys.unit(unit), unit),
    /** Name for a stored insuranceType id, falling back to the id (custom/unknown types). */
    typeNameById: (id: string, fallback = id) => tOr(insuranceKeys.typeLabel(id), fallback),
    typeShortNameById: (id: string, fallback = id) => tOr(insuranceKeys.typeShort(id), fallback),
  };
}
