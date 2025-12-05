import { z } from "zod";
import type { WorkflowDefinition, ProgressCallback } from "./types.js";
declare const autoRemediationSchema: z.ZodObject<{
    symptoms: z.ZodString;
    maxActions: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    autonomyLevel: z.ZodOptional<z.ZodEnum<["read-only", "low", "medium", "high"]>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    symptoms: string;
    maxActions: number;
    autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
    attachments?: string[] | undefined;
}, {
    symptoms: string;
    autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
    attachments?: string[] | undefined;
    maxActions?: number | undefined;
}>;
export type AutoRemediationParams = z.infer<typeof autoRemediationSchema>;
export declare function executeAutoRemediation(params: AutoRemediationParams, onProgress?: ProgressCallback): Promise<string>;
export declare const autoRemediationWorkflow: WorkflowDefinition;
export {};
//# sourceMappingURL=auto-remediation.workflow.d.ts.map