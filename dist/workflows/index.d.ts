import { z } from "zod";
import type { WorkflowDefinition, ProgressCallback } from "./types.js";
/**
 * Registra un workflow nel registro
 */
export declare function registerWorkflow<TParams>(name: string, workflow: WorkflowDefinition<TParams>): void;
/**
 * Ottiene un workflow dal registro
 */
export declare function getWorkflow(name: string): WorkflowDefinition | undefined;
/**
 * Elenca tutti i workflow disponibili
 */
export declare function listWorkflows(): string[];
/**
 * Esegue un workflow per nome
 */
export declare function executeWorkflow(name: string, params: any, onProgress?: ProgressCallback): Promise<string>;
/**
 * Schema Zod per il router dei workflow
 */
export declare const smartWorkflowsSchema: z.ZodObject<{
    workflow: z.ZodEnum<["parallel-review", "pre-commit-validate", "init-session", "validate-last-commit", "feature-design", "bug-hunt", "triangulated-review", "auto-remediation", "refactor-sprint", "overthinker"]>;
    params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    workflow: "parallel-review" | "pre-commit-validate" | "bug-hunt" | "feature-design" | "validate-last-commit" | "init-session" | "triangulated-review" | "auto-remediation" | "refactor-sprint" | "overthinker";
    params?: Record<string, any> | undefined;
}, {
    workflow: "parallel-review" | "pre-commit-validate" | "bug-hunt" | "feature-design" | "validate-last-commit" | "init-session" | "triangulated-review" | "auto-remediation" | "refactor-sprint" | "overthinker";
    params?: Record<string, any> | undefined;
}>;
/**
 * Definizioni degli schemi per ogni workflow
 */
export declare const workflowSchemas: {
    "parallel-review": z.ZodObject<{
        files: z.ZodArray<z.ZodString, "many">;
        focus: z.ZodDefault<z.ZodOptional<z.ZodEnum<["architecture", "security", "performance", "quality", "all"]>>>;
        strategy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["standard", "double-check"]>>>;
        backendOverrides: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        writeReport: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        files: string[];
        focus: "security" | "performance" | "architecture" | "quality" | "all";
        strategy: "standard" | "double-check";
        attachments?: string[] | undefined;
        backendOverrides?: string[] | undefined;
        writeReport?: boolean | undefined;
    }, {
        files: string[];
        attachments?: string[] | undefined;
        focus?: "security" | "performance" | "architecture" | "quality" | "all" | undefined;
        strategy?: "standard" | "double-check" | undefined;
        backendOverrides?: string[] | undefined;
        writeReport?: boolean | undefined;
    }>;
    "pre-commit-validate": z.ZodObject<{
        depth: z.ZodDefault<z.ZodOptional<z.ZodEnum<["quick", "thorough", "paranoid"]>>>;
    }, "strip", z.ZodTypeAny, {
        depth: "quick" | "thorough" | "paranoid";
    }, {
        depth?: "quick" | "thorough" | "paranoid" | undefined;
    }>;
    "init-session": z.ZodObject<{
        autonomyLevel: z.ZodOptional<z.ZodEnum<["read-only", "low", "medium", "high"]>>;
        commitCount: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
        commitCount?: number | undefined;
    }, {
        autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
        commitCount?: number | undefined;
    }>;
    "validate-last-commit": z.ZodObject<{
        commit_ref: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        commit_ref: string;
    }, {
        commit_ref?: string | undefined;
    }>;
    "feature-design": z.ZodObject<{
        featureDescription: z.ZodString;
        targetFiles: z.ZodArray<z.ZodString, "many">;
        context: z.ZodOptional<z.ZodString>;
        architecturalFocus: z.ZodDefault<z.ZodOptional<z.ZodEnum<["design", "refactoring", "optimization", "security", "scalability"]>>>;
        implementationApproach: z.ZodDefault<z.ZodOptional<z.ZodEnum<["incremental", "full-rewrite", "minimal"]>>>;
        testType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["unit", "integration", "e2e"]>>>;
    }, "strip", z.ZodTypeAny, {
        targetFiles: string[];
        testType: "unit" | "integration" | "e2e";
        featureDescription: string;
        architecturalFocus: "security" | "design" | "refactoring" | "optimization" | "scalability";
        implementationApproach: "incremental" | "full-rewrite" | "minimal";
        context?: string | undefined;
    }, {
        targetFiles: string[];
        featureDescription: string;
        context?: string | undefined;
        testType?: "unit" | "integration" | "e2e" | undefined;
        architecturalFocus?: "security" | "design" | "refactoring" | "optimization" | "scalability" | undefined;
        implementationApproach?: "incremental" | "full-rewrite" | "minimal" | undefined;
    }>;
    "bug-hunt": z.ZodObject<{
        symptoms: z.ZodString;
        suspected_files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        backendOverrides: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        autonomyLevel: z.ZodOptional<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "AUTONOMOUS"]>>;
    }, "strip", z.ZodTypeAny, {
        symptoms: string;
        autonomyLevel?: "LOW" | "MEDIUM" | "HIGH" | "AUTONOMOUS" | undefined;
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
    "triangulated-review": z.ZodObject<{
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
    "auto-remediation": z.ZodObject<{
        symptoms: z.ZodString;
        maxActions: z.ZodOptional<z.ZodNumber>;
        autonomyLevel: z.ZodOptional<z.ZodEnum<["read-only", "low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        symptoms: string;
        autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
        maxActions?: number | undefined;
    }, {
        symptoms: string;
        autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
        maxActions?: number | undefined;
    }>;
    "refactor-sprint": z.ZodObject<{
        targetFiles: z.ZodArray<z.ZodString, "many">;
        scope: z.ZodString;
        depth: z.ZodDefault<z.ZodOptional<z.ZodEnum<["light", "balanced", "deep"]>>>;
        autonomyLevel: z.ZodOptional<z.ZodEnum<["read-only", "low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        depth: "light" | "balanced" | "deep";
        targetFiles: string[];
        scope: string;
        autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
    }, {
        targetFiles: string[];
        scope: string;
        autonomyLevel?: "low" | "medium" | "high" | "read-only" | undefined;
        depth?: "light" | "balanced" | "deep" | undefined;
    }>;
    overthinker: z.ZodObject<{
        initialPrompt: z.ZodString;
        iterations: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        contextFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        outputFile: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        modelOverride: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        initialPrompt: string;
        outputFile: string;
        iterations?: number | undefined;
        contextFiles?: string[] | undefined;
        modelOverride?: string | undefined;
    }, {
        initialPrompt: string;
        iterations?: number | undefined;
        contextFiles?: string[] | undefined;
        outputFile?: string | undefined;
        modelOverride?: string | undefined;
    }>;
};
/**
 * Inizializza il registro dei workflow
 * Questa funzione sarà chiamata dopo l'import di tutti i workflow
 */
export declare function initializeWorkflowRegistry(): void;
/**
 * Ottiene lo schema Zod per un workflow specifico
 */
export declare function getWorkflowSchema(workflowName: string): z.ZodSchema | undefined;
//# sourceMappingURL=index.d.ts.map