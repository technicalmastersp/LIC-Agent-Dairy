import { z } from "zod";

// Shared by AddRecord.tsx and EditRecordModal.tsx — both create/edit the
// same policy-record shape. Captures the one hard rule that existed before
// (name required — this drives the existing nameError red-border + auto-
// scroll/focus UX) plus new, previously-missing sanity checks: valid email
// format when an email is entered, and reasonable max lengths so a stray
// paste can't silently create an oversized record. Nothing here was
// required before except name, so every other field stays optional-length
// text rather than becoming newly mandatory.
export const policyRecordSchema = z.object({
  date: z.string(),
  aadhaarNumber: z.string().max(12, "Aadhaar number must be 12 digits or fewer"),
  panNumber: z.string().max(10, "PAN is at most 10 characters"),
  email: z
    .string()
    .max(254)
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "Enter a valid email address",
    }),

  // Kept distinct from the toast copy in AddRecord.tsx's onInvalid handler
  // ("Please enter the applicant's name") so the two don't render identical
  // text simultaneously — the e2e spec asserts on that exact toast string.
  name: z.string().trim().min(1, "Name is required"),
  birthPlace: z.string().max(200),
  fatherName: z.string().max(200),
  motherName: z.string().max(200),
  spouseName: z.string().max(200),
  address: z.string().max(500),
  dateOfBirth: z.string(),
  age: z.string().max(10),
  occupation: z.string().max(200),
  educationalQualification: z.string().max(200),
  designationOfPolicyHolder: z.string().max(200),
  annualIncome: z.string().max(50),
  periodOfService: z.string().max(100),
  employerName: z.string().max(200),
  aadhaarLinkedMobileNumber: z.string().max(20),
  nameOfNominee: z.string().max(200),
  ageOfNominee: z.string().max(10),
  relationName: z.string().max(100),
  lastChildBirthDate: z.string(),
  height: z.string().max(20),
  weight: z.string().max(20),
  bankAccountNumber: z.string().max(30),
  ifscCode: z.string().max(20),
  bankName: z.string().max(200),
  branchName: z.string().max(200),
});
