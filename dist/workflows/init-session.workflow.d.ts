import { z } from "zod";
import type { WorkflowDefinition, ProgressCallback } from "./types.js";
/**
 * Schema Zod per il workflow init-session
 */
declare const initSessionSchema: z.ZodObject<{
    autonomyLevel: z.ZodOptional<z.ZodEnum<["read-only", "low", "medium", "high"]>>;
    commitCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
    commitCount?: number | undefined;
}, {
    autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
    commitCount?: number | undefined;
}>;
/**
 * Esegue il workflow di inizializzazione sessione
 */
export declare function executeInitSession(params: z.infer<typeof initSessionSchema>, onProgress?: ProgressCallback): Promise<string>;
/**
 * Definizione del workflow init-session
 */
export declare const initSessionWorkflow: WorkflowDefinition;
export {};
//# sourceMappingURL=init-session.workflow.d.ts.map