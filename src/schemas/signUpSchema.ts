import { z } from "zod";

// Mirrors every validation rule that previously lived inline in
// SignUp.tsx's handleSubmit — see git history for the pre-migration
// version if you need to compare behavior.
export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),

    fullAddress: z.string().trim().min(1, "Full address is required"),

    mobileNumber: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Mobile number must be 10 digits"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),

    // Same standard used on the Change Password page: 6+ chars, one
    // uppercase letter, one number.
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/\d/, "Password must include a number"),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    selectedPlan: z.string().min(1, "Please select a subscription plan"),

    // Format only — whether the code is actually *valid* is checked
    // against the backend via the separate "Validate" button, same as
    // before. An unvalidated-but-non-empty code is still blocked at
    // submit time in SignUp.tsx, same as the original manual check.
    referralCode: z.string().trim().max(7, "Referral codes are at most 7 characters").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
