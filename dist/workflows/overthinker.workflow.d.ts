import { z } from "zod";
import { AutonomyLevel } from "../utils/permissionManager.js";
import type { WorkflowDefinition, ProgressCallback, BaseWorkflowParams } from "./types.js";
/**
 * Overthinker Workflow
 *
 * A chain-of-thought workflow involving multiple agent personas to refine,
 * reason, critique, and synthesize a solution for a complex problem.
 */
declare const overthinkerSchema: z.ZodObject<{
    initialPrompt: z.ZodString;
    iterations: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    contextFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    outputFile: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    modelOverride: z.ZodOptional<z.ZodString>;
    autonomyLevel: z.ZodOptional<z.ZodNativeEnum<typeof AutonomyLevel>>;
}, "strip", z.ZodTypeAny, {
    initialPrompt: string;
    outputFile: string;
    autonomyLevel?: AutonomyLevel | undefined;
    iterations?: number | undefined;
    contextFiles?: string[] | undefined;
    modelOverride?: string | undefined;
}, {
    initialPrompt: string;
    autonomyLevel?: AutonomyLevel | undefined;
    iterations?: number | undefined;
    contextFiles?: string[] | undefined;
    outputFile?: string | undefined;
    modelOverride?: string | undefined;
}>;
export type OverthinkerParams = z.infer<typeof overthinkerSchema> & BaseWorkflowParams;
export declare function executeOverthinker(params: OverthinkerParams, onProgress?: ProgressCallback): Promise<string>;
export declare const overthinkerWorkflow: WorkflowDefinition;
export {};
//# sourceMappingURL=overthinker.workflow.d.ts.map