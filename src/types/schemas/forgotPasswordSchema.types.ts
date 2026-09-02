import { z } from "zod";
import type { forgotPasswordEmailSchema, resetPasswordSchema } from "@/schemas/forgotPasswordSchema";

export type ForgotPasswordEmailValues = z.infer<typeof forgotPasswordEmailSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
