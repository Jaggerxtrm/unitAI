import { z } from "zod";
import type { WorkflowDefinition, ProgressCallback } from "./types.js";
declare const triangulatedReviewSchema: z.ZodObject<{
    files: z.ZodArray<z.ZodString, "many">;
    goal: z.ZodDefault<z.ZodOptional<z.ZodEnum<["bugfix", "refactor"]>>>;
    autonomyLevel: z.ZodOptional<z.ZodEnum<["read-only", "low", "medium", "high"]>>;
}, "strip", z.ZodTypeAny, {
    files: string[];
    goal: "refactor" | "bugfix";
    autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
}, {
    files: string[];
    autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
    goal?: "refactor" | "bugfix" | undefined;
}>;
export type TriangulatedReviewParams = z.infer<typeof triangulatedReviewSchema>;
export declare function executeTriangulatedReview(params: TriangulatedReviewParams, onProgress?: ProgressCallback): Promise<string>;
export declare const triangulatedReviewWorkflow: WorkflowDefinition;
export {};
//# sourceMappingURL=triangulated-review.workflow.d.ts.map