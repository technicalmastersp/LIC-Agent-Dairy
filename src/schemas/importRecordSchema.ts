import { z } from "zod";
import { policyRecordSchema } from "./policyRecordSchema";
import { VALID_INSURANCE_TYPES, IMPORT_COLUMNS, isValidCalendarDate, type ImportRow } from "@/utils/excelImport";

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
  /** field key -> message, so the UI can point at exactly which cell is wrong,
   * not just say "1 error" somewhere on the row. */
  fieldErrors: Record<string, string>;
}

/** Validates one parsed spreadsheet row against the same rules AddRecord
 * uses for personal fields, plus the extra current-policy/insurance-type
 * fields the import template adds on top. */
export function validateImportRow(row: ImportRow): ImportRowValidation {
  const fieldErrors: Record<string, string> = {};

  const { _rowNumber, ...rowFields } = row;
  const fullPersonal: Record<string, string> = { ...rowFields, date: new Date().toISOString() };
  for (const key of FIELDS_NOT_IN_TEMPLATE) fullPersonal[key] = fullPersonal[key] || "";

  const personalResult = policyRecordSchema.safeParse(fullPersonal);
  if (!personalResult.success) {
    for (const issue of personalResult.error.issues) {
      const field = String(issue.path[0] ?? "name");
      // Only surface errors for fields the import template actually has a
      // column for — the ones we defaulted to "" above should never fail
      // (they're all optional), but if schema rules ever change, don't
      // point the user at a column that isn't on screen.
      if (IMPORT_COLUMNS.some((c) => c.key === field) && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
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
    for (const issue of policyResult.error.issues) {
      const field = String(issue.path[0] ?? "policyNumber");
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
  }

  const insuranceType = (row.insuranceType || "Life Insurance").trim();
  if (!VALID_INSURANCE_TYPES.includes(insuranceType)) {
    fieldErrors.insuranceType = `Must be one of: ${VALID_INSURANCE_TYPES.join(", ")}`;
  }

  // policyRecordSchema/currentPolicySchema only check these are strings —
  // neither confirms the date actually exists on a calendar. A structurally
  // fine but nonsensical value like "1485-06-83" would otherwise sail
  // through here and only fail once it reaches Mongoose server-side.
  if (row.dateOfBirth && !isValidCalendarDate(row.dateOfBirth) && !fieldErrors.dateOfBirth) {
    fieldErrors.dateOfBirth = "Not a valid date.";
  }
  if (row.lastPaymentDate && !isValidCalendarDate(row.lastPaymentDate) && !fieldErrors.lastPaymentDate) {
    fieldErrors.lastPaymentDate = "Not a valid date.";
  }

  const errors = Object.values(fieldErrors);
  return { valid: errors.length === 0, errors, fieldErrors };
}