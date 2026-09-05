import { z } from "zod";
import { policyRecordSchema } from "./policyRecordSchema";
import { VALID_INSURANCE_TYPES, type ImportRow } from "@/utils/excelImport";

// Fields policyRecordSchema requires that the Excel import template
// doesn't collect (family/nominee/bank/employment details — deliberately
// out of scope for v1, see ImportRecords.tsx). Every imported row gets
// these defaulted to "" and then run through the *exact same*
// policyRecordSchema the manual Add Record form uses — one set of rules
// for "is this a valid record", not a second, parallel one that could
// quietly drift out of sync.
const FIELDS_NOT_IN_TEMPLATE = [
  "birthPlace", "age", "educationalQualification", "designationOfPolicyHolder",
  "annualIncome", "periodOfService", "employerName", "nameOfNominee",
  "ageOfNominee", "relationName", "lastChildBirthDate", "height", "weight",
  "bankAccountNumber", "ifscCode", "bankName", "branchName",
] as const;

// The template's current-policy columns aren't part of policyRecordSchema
// (that schema only covers the policy-holder's personal fields) — light,
// consistent validation for those on top.
const currentPolicySchema = z.object({
  policyNumber: z.string().max(50, "Policy number is at most 50 characters"),
  planAndTerm: z.string().max(200, "Plan & Term is at most 200 characters"),
  sumAssured: z
    .string()
    .max(20, "Sum assured is at most 20 characters")
    .refine((v) => v === "" || /^[0-9,.]+$/.test(v), "Sum assured should be a plain number"),
  modeOfPayment: z.string().max(50, "Mode of payment is at most 50 characters"),
  branch: z.string().max(200, "Branch is at most 200 characters"),
  lastPaymentDate: z.string(),
});

export interface ImportRowValidation {
  valid: boolean;
  errors: string[];
}

/** Validates one parsed spreadsheet row against the same rules AddRecord
 * uses for personal fields, plus the extra current-policy/insurance-type
 * fields the import template adds on top. */
export function validateImportRow(row: ImportRow): ImportRowValidation {
  const errors: string[] = [];

  const { _rowNumber, ...rowFields } = row;
  const fullPersonal: Record<string, string> = { ...rowFields, date: new Date().toISOString() };
  for (const key of FIELDS_NOT_IN_TEMPLATE) fullPersonal[key] = fullPersonal[key] || "";

  const personalResult = policyRecordSchema.safeParse(fullPersonal);
  if (!personalResult.success) {
    for (const issue of personalResult.error.issues) errors.push(issue.message);
  }

  const policyResult = currentPolicySchema.safeParse({
    policyNumber: row.policyNumber || "",
    planAndTerm: row.planAndTerm || "",
    sumAssured: row.sumAssured || "",
    modeOfPayment: row.modeOfPayment || "",
    branch: row.branch || "",
    lastPaymentDate: row.lastPaymentDate || "",
  });
  if (!policyResult.success) {
    for (const issue of policyResult.error.issues) errors.push(issue.message);
  }

  const insuranceType = (row.insuranceType || "Life Insurance").trim();
  if (!VALID_INSURANCE_TYPES.includes(insuranceType)) {
    errors.push(`Insurance Type must be one of: ${VALID_INSURANCE_TYPES.join(", ")}`);
  }

  return { valid: errors.length === 0, errors };
}