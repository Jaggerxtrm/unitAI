/**
 * Pre-Commit Validation Workflow
 *
 * Validates staged changes before committing, checking for:
 * - Security issues (secrets, vulnerabilities)
 * - Code quality issues
 * - Breaking changes
 *
 * Uses parallel AI analysis with multiple backends for comprehensive validation.
 */
import { z } from 'zod';
import type { WorkflowDefinition, ProgressCallback } from './types.js';
/**
 * Schema dei parametri per pre-commit-validate
 */
export declare const preCommitValidateSchema: z.ZodObject<{
    depth: z.ZodDefault<z.ZodEnum<["quick", "thorough", "paranoid"]>>;
    autonomyLevel: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "AUTONOMOUS"]>>;
}, "strip", z.ZodTypeAny, {
    autonomyLevel: "LOW" | "MEDIUM" | "HIGH" | "AUTONOMOUS";
    depth: "quick" | "thorough" | "paranoid";
}, {
    autonomyLevel?: "LOW" | "MEDIUM" | "HIGH" | "AUTONOMOUS" | undefined;
    depth?: "quick" | "thorough" | "paranoid" | undefined;
}>;
export type PreCommitValidateParams = z.infer<typeof preCommitValidateSchema>;
/**
 * Execute pre-commit validation workflow
 */
export declare function executePreCommitValidate(params: PreCommitValidateParams, onProgress?: ProgressCallback): Promise<string>;
/**
 * Pre-commit validation workflow definition
 */
export declare const preCommitValidateWorkflow: WorkflowDefinition;
//# sourceMappingURL=pre-commit-validate.workflow.d.ts.map