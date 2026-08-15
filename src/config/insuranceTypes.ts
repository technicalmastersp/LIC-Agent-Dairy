// src/config/insuranceTypes.ts
//
// Single source of truth (frontend side) for the insurance types an agent
// can create a record under, and the extra "type-specific" fields shown for
// each one. Keep the `id` values in sync with the backend's
// utils/insuranceTypes.js INSURANCE_TYPES list — they're stored verbatim in
// the database, so a mismatch here means records silently fail validation.
//
// Architecture: every record (regardless of type) shares the same
// "Applicant / Policyholder Details" section and Current/Previous Policy
// tables (see AddRecord.tsx) — that's genuinely common across insurance
// types and is what drives due-date / missed-payment tracking. Only the
// *extra* fields particular to a type (coverage amount, vehicle details,
// trip dates, etc.) differ, and those are rendered dynamically from the
// `fields` list below into `typeSpecificData`.
//
// "Other (Custom)" is special-cased: instead of a fixed field list, the
// agent names the insurance type themselves and builds their own fields
// (see CustomFieldsBuilder.tsx), stored in `customFields` instead of
// `typeSpecificData`.

import {
  HeartPulse, ShieldCheck, Stethoscope, Users, Car, Plane, Sparkles,
  type LucideIcon,
} from "lucide-react";

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

export const CUSTOM_FIELD_TYPES: InsuranceFieldType[] = ["text", "number", "date", "textarea", "select"];

export const MAX_CUSTOM_FIELDS = 40;
export const MAX_CUSTOM_LABEL_LENGTH = 80;
export const MAX_CUSTOM_OPTION_LENGTH = 60;
export const MAX_CUSTOM_TYPE_NAME_LENGTH = 60;

export const OTHER_INSURANCE_TYPE_ID = "Other";

export const INSURANCE_TYPES: InsuranceTypeDef[] = [
  {
    id: "Life Insurance",
    label: "Life Insurance",
    shortLabel: "Life",
    description: "Whole/endowment life cover — the standard policyholder intake form.",
    icon: ShieldCheck,
    fields: [
      { key: "policyPurpose", label: "Policy Purpose", type: "select", options: ["Protection", "Investment", "Retirement", "Child Plan"] },
      { key: "ridersAttached", label: "Riders Attached", type: "text", placeholder: "e.g. Accidental Death, Critical Illness" },
      { key: "survivalBenefit", label: "Survival Benefit", type: "text" },
    ],
  },
  {
    id: "Term Life Insurance",
    label: "Term Life Insurance",
    shortLabel: "Term Life",
    description: "Pure protection cover for a fixed term, no maturity value.",
    icon: ShieldCheck,
    fields: [
      { key: "policyTerm", label: "Policy Term", type: "number", unit: "years" },
      { key: "coverageAmount", label: "Coverage Amount (Sum Assured)", type: "number", unit: "₹" },
      { key: "premiumPayingTerm", label: "Premium Paying Term", type: "text" },
      { key: "smokerStatus", label: "Smoker / Tobacco User", type: "select", options: ["Yes", "No"] },
      { key: "criticalIllnessRider", label: "Critical Illness Rider", type: "select", options: ["Yes", "No"] },
      { key: "returnOfPremium", label: "Return of Premium Option", type: "select", options: ["Yes", "No"] },
    ],
  },
  {
    id: "Health Insurance",
    label: "Health Insurance",
    shortLabel: "Health",
    description: "Individual medical/hospitalisation cover.",
    icon: Stethoscope,
    fields: [
      { key: "sumInsured", label: "Sum Insured", type: "number", unit: "₹" },
      { key: "planType", label: "Plan Type", type: "select", options: ["Individual", "Floater"] },
      { key: "roomRentLimit", label: "Room Rent Limit", type: "text" },
      { key: "waitingPeriodMonths", label: "Waiting Period", type: "number", unit: "months" },
      { key: "networkHospital", label: "Preferred Network Hospital", type: "text" },
      { key: "preExistingConditions", label: "Pre-existing Conditions", type: "textarea" },
    ],
  },
  {
    id: "Family Health Insurance",
    label: "Family Health Insurance",
    shortLabel: "Family Health",
    description: "Floater medical cover across multiple family members.",
    icon: Users,
    fields: [
      { key: "floaterSumInsured", label: "Floater Sum Insured", type: "number", unit: "₹" },
      { key: "numberOfMembersCovered", label: "Members Covered", type: "number" },
      { key: "eldestMemberAge", label: "Eldest Member's Age", type: "number" },
      { key: "maternityCover", label: "Maternity Cover", type: "select", options: ["Yes", "No"] },
      { key: "networkHospital", label: "Preferred Network Hospital", type: "text" },
      { key: "preExistingConditions", label: "Pre-existing Conditions", type: "textarea" },
    ],
  },
  {
    id: "Vehicle Insurance",
    label: "Vehicle Insurance (Car & Bike)",
    shortLabel: "Vehicle",
    description: "Motor cover for a car or bike — registration, IDV, and RTO details.",
    icon: Car,
    fields: [
      { key: "vehicleType", label: "Vehicle Type", type: "select", options: ["Car", "Bike"] },
      { key: "registrationNumber", label: "Registration Number", type: "text", placeholder: "e.g. RJ14 AB 1234" },
      { key: "makeAndModel", label: "Make & Model", type: "text", placeholder: "e.g. Maruti Swift VXI" },
      { key: "manufactureYear", label: "Manufacture Year", type: "number" },
      { key: "idv", label: "Insured Declared Value (IDV)", type: "number", unit: "₹" },
      { key: "rtoBranch", label: "RTO Branch", type: "text" },
      { key: "noClaimBonus", label: "No Claim Bonus (NCB)", type: "text", unit: "%" },
    ],
  },
  {
    id: "Travel Insurance",
    label: "Travel Insurance",
    shortLabel: "Travel",
    description: "Single/multi-trip cover for domestic or international travel.",
    icon: Plane,
    fields: [
      { key: "destinationCountry", label: "Destination Country", type: "text" },
      { key: "tripType", label: "Trip Type", type: "select", options: ["Single Trip", "Multi Trip", "Annual"] },
      { key: "tripStartDate", label: "Trip Start Date", type: "date" },
      { key: "tripEndDate", label: "Trip End Date", type: "date" },
      { key: "coverageAmount", label: "Coverage Amount", type: "number", unit: "₹" },
      { key: "tripPurpose", label: "Trip Purpose", type: "select", options: ["Leisure", "Business", "Study", "Medical"] },
    ],
  },
  {
    id: OTHER_INSURANCE_TYPE_ID,
    label: "Other (Custom)",
    shortLabel: "Custom",
    description: "Any other insurance type — name it and build your own fields.",
    icon: Sparkles,
    fields: [], // no fixed fields — agent builds customFields instead
  },
];

export const getInsuranceTypeDef = (id: string | undefined | null): InsuranceTypeDef | undefined =>
  INSURANCE_TYPES.find((t) => t.id === id);

export const isOtherInsuranceType = (id: string | undefined | null) => id === OTHER_INSURANCE_TYPE_ID;

// Builds an empty { [fieldKey]: "" } map for a given type's fixed fields —
// used to seed typeSpecificData when an agent picks/switches a built-in type.
export const emptyTypeSpecificData = (id: string | undefined | null): Record<string, string> => {
  const def = getInsuranceTypeDef(id);
  if (!def) return {};
  return Object.fromEntries(def.fields.map((f) => [f.key, ""]));
};

export interface CustomFieldValue {
  key: string;
  label: string;
  fieldType: InsuranceFieldType;
  options?: string[];
  value: string;
}
