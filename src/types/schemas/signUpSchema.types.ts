import { z } from "zod";
import type { signUpSchema } from "@/schemas/signUpSchema";

export type SignUpFormValues = z.infer<typeof signUpSchema>;
