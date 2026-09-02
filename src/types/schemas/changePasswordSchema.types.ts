import { z } from "zod";
import type { changePasswordSchema } from "@/schemas/changePasswordSchema";

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
