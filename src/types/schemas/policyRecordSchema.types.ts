import { z } from "zod";
import type { policyRecordSchema } from "@/schemas/policyRecordSchema";

export type PolicyRecordFormValues = z.infer<typeof policyRecordSchema>;
