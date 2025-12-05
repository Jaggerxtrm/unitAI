import { z } from "zod";
import type { WorkflowDefinition, ProgressCallback } from "./types.js";
declare const refactorSprintSchema: z.ZodObject<{
    targetFiles: z.ZodArray<z.ZodString, "many">;
    scope: z.ZodString;
    depth: z.ZodDefault<z.ZodOptional<z.ZodEnum<["light", "balanced", "deep"]>>>;
    autonomyLevel: z.ZodOptional<z.ZodEnum<["read-only", "low", "medium", "high"]>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    depth: "light" | "balanced" | "deep";
    targetFiles: string[];
    scope: string;
    autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
    attachments?: string[] | undefined;
}, {
    targetFiles: string[];
    scope: string;
    autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
    attachments?: string[] | undefined;
    depth?: "light" | "balanced" | "deep" | undefined;
}>;
export type RefactorSprintParams = z.infer<typeof refactorSprintSchema>;
export declare function executeRefactorSprint(params: RefactorSprintParams, onProgress?: ProgressCallback): Promise<string>;
export declare const refactorSprintWorkflow: WorkflowDefinition;
export {};
//# sourceMappingURL=refactor-sprint.workflow.d.ts.map