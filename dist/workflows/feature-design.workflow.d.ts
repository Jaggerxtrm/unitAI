import { z } from "zod";
import { AutonomyLevel } from "../utils/permissionManager.js";
import type { WorkflowDefinition, ProgressCallback } from "./types.js";
/**
 * Feature Design Workflow - Orchestration Example
 *
 * This workflow demonstrates the orchestration of all three specialized agents:
 * 1. ArchitectAgent - Designs the architecture and approach
 * 2. ImplementerAgent - Generates production-ready code
 * 3. TesterAgent - Creates comprehensive tests
 *
 * Use Case: End-to-end feature development from design to tests
 */
/**
 * Schema Zod per il workflow feature-design
 */
declare const featureDesignSchema: z.ZodObject<{
    featureDescription: z.ZodString;
    targetFiles: z.ZodArray<z.ZodString, "many">;
    context: z.ZodOptional<z.ZodString>;
    architecturalFocus: z.ZodDefault<z.ZodOptional<z.ZodEnum<["design", "refactoring", "optimization", "security", "scalability"]>>>;
    implementationApproach: z.ZodDefault<z.ZodOptional<z.ZodEnum<["incremental", "full-rewrite", "minimal"]>>>;
    testType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["unit", "integration", "e2e"]>>>;
    autonomyLevel: z.ZodOptional<z.ZodNativeEnum<typeof AutonomyLevel>>;
    validationBackends: z.ZodOptional<z.ZodArray<z.ZodEnum<["ask-gemini", "cursor-agent", "droid"]>, "many">>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    targetFiles: string[];
    testType: "unit" | "integration" | "e2e";
    featureDescription: string;
    architecturalFocus: "security" | "design" | "refactoring" | "optimization" | "scalability";
    implementationApproach: "incremental" | "full-rewrite" | "minimal";
    autonomyLevel?: AutonomyLevel | undefined;
    attachments?: string[] | undefined;
    context?: string | undefined;
    validationBackends?: ("cursor-agent" | "droid" | "ask-gemini")[] | undefined;
}, {
    targetFiles: string[];
    featureDescription: string;
    autonomyLevel?: AutonomyLevel | undefined;
    attachments?: string[] | undefined;
    context?: string | undefined;
    testType?: "unit" | "integration" | "e2e" | undefined;
    architecturalFocus?: "security" | "design" | "refactoring" | "optimization" | "scalability" | undefined;
    implementationApproach?: "incremental" | "full-rewrite" | "minimal" | undefined;
    validationBackends?: ("cursor-agent" | "droid" | "ask-gemini")[] | undefined;
}>;
export type FeatureDesignParams = z.infer<typeof featureDesignSchema>;
/**
 * Esegue il workflow di feature design
 *
 * Orchestration Flow:
 * 1. Architecture Phase - ArchitectAgent analyzes and designs
 * 2. Implementation Phase - ImplementerAgent generates code
 * 3. Testing Phase - TesterAgent creates tests
 */
export declare function executeFeatureDesign(params: FeatureDesignParams, onProgress?: ProgressCallback): Promise<string>;
/**
 * Definizione del workflow feature-design
 */
export declare const featureDesignWorkflow: WorkflowDefinition;
export {};
//# sourceMappingURL=feature-design.workflow.d.ts.map