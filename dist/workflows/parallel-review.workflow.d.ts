import { z } from "zod";
import type { WorkflowDefinition, ProgressCallback } from "./types.js";
/**
 * Schema Zod per il workflow parallel-review
 */
declare const parallelReviewSchema: z.ZodObject<{
    files: z.ZodArray<z.ZodString, "many">;
    focus: z.ZodDefault<z.ZodOptional<z.ZodEnum<["architecture", "security", "performance", "quality", "all"]>>>;
    autonomyLevel: z.ZodOptional<z.ZodEnum<["read-only", "low", "medium", "high"]>>;
    strategy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["standard", "double-check"]>>>;
    backendOverrides: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    files: string[];
    focus: "security" | "performance" | "architecture" | "quality" | "all";
    strategy: "standard" | "double-check";
    autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
    attachments?: string[] | undefined;
    backendOverrides?: string[] | undefined;
}, {
    files: string[];
    autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
    attachments?: string[] | undefined;
    focus?: "security" | "performance" | "architecture" | "quality" | "all" | undefined;
    strategy?: "standard" | "double-check" | undefined;
    backendOverrides?: string[] | undefined;
}>;
/**
 * Esegue il workflow di revisione parallela
 */
export declare function executeParallelReview(params: z.infer<typeof parallelReviewSchema>, onProgress?: ProgressCallback): Promise<string>;
/**
 * Definizione del workflow parallel-review
 */
export declare const parallelReviewWorkflow: WorkflowDefinition;
export {};
//# sourceMappingURL=parallel-review.workflow.d.ts.map