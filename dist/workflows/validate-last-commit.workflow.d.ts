import { z } from "zod";
import type { WorkflowDefinition, ProgressCallback } from "./types.js";
/**
 * Schema Zod per il workflow validate-last-commit
 */
declare const validateLastCommitSchema: z.ZodObject<{
    commit_ref: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    autonomyLevel: z.ZodOptional<z.ZodEnum<["read-only", "low", "medium", "high"]>>;
}, "strip", z.ZodTypeAny, {
    commit_ref: string;
    autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
}, {
    autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
    commit_ref?: string | undefined;
}>;
/**
 * Esegue il workflow di validazione dell'ultimo commit
 */
export declare function executeValidateLastCommit(params: z.infer<typeof validateLastCommitSchema>, onProgress?: ProgressCallback): Promise<string>;
/**
 * Definizione del workflow validate-last-commit
 */
export declare const validateLastCommitWorkflow: WorkflowDefinition;
export {};
//# sourceMappingURL=validate-last-commit.workflow.d.ts.map