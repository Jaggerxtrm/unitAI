/**
 * Bug Hunt Workflow
 *
 * Searches for and analyzes bugs based on symptoms.
 * Uses AI to discover relevant files and perform parallel analysis.
 */
import { z } from 'zod';
import type { WorkflowDefinition, ProgressCallback } from './types.js';
/**
 * Schema dei parametri per bug-hunt
 */
export declare const bugHuntSchema: z.ZodObject<{
    symptoms: z.ZodString;
    suspected_files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    autonomyLevel: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "AUTONOMOUS"]>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    backendOverrides: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    autonomyLevel: "LOW" | "MEDIUM" | "HIGH" | "AUTONOMOUS";
    symptoms: string;
    attachments?: string[] | undefined;
    suspected_files?: string[] | undefined;
    backendOverrides?: string[] | undefined;
}, {
    symptoms: string;
    autonomyLevel?: "LOW" | "MEDIUM" | "HIGH" | "AUTONOMOUS" | undefined;
    attachments?: string[] | undefined;
    suspected_files?: string[] | undefined;
    backendOverrides?: string[] | undefined;
}>;
export type BugHuntParams = z.infer<typeof bugHuntSchema>;
/**
 * Execute bug hunt workflow
 */
export declare function executeBugHunt(params: BugHuntParams, onProgress?: ProgressCallback): Promise<string>;
/**
 * Bug hunt workflow definition
 */
export declare const bugHuntWorkflow: WorkflowDefinition;
//# sourceMappingURL=bug-hunt.workflow.d.ts.map