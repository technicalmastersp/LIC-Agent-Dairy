import { z } from "zod";

// Step 1 — request an OTP by email.
export const forgotPasswordEmailSchema = z.object({
  email: z.string().trim().min(1, "Please enter your email address.").email("Please enter a valid email address."),
});
export type ForgotPasswordEmailValues = z.infer<typeof forgotPasswordEmailSchema>;

// Step 3 — set a new password after the OTP is verified. No "current
// password" field here (unlike changePasswordSchema) since the user is
// locked out and proving identity via OTP instead.
export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
