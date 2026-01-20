import { z } from "zod";
import type { ToolExecuteFunction } from "./registry.js";
/**
 * Definizione dello strumento smart-workflows
 */
export declare const smartWorkflowsTool: {
    name: string;
    description: string;
    zodSchema: z.ZodObject<{
        workflow: z.ZodEnum<["parallel-review", "pre-commit-validate", "init-session", "validate-last-commit", "feature-design", "bug-hunt", "triangulated-review", "auto-remediation", "refactor-sprint", "overthinker"]>;
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        workflow: "parallel-review" | "pre-commit-validate" | "bug-hunt" | "feature-design" | "validate-last-commit" | "init-session" | "triangulated-review" | "auto-remediation" | "refactor-sprint" | "overthinker";
        params?: Record<string, any> | undefined;
    }, {
        workflow: "parallel-review" | "pre-commit-validate" | "bug-hunt" | "feature-design" | "validate-last-commit" | "init-session" | "triangulated-review" | "auto-remediation" | "refactor-sprint" | "overthinker";
        params?: Record<string, any> | undefined;
    }>;
    execute: ToolExecuteFunction;
    category: string;
    prompt: {
        name: string;
        description: string;
        arguments: {
            name: string;
            description: string;
            required: boolean;
        }[];
    };
};
//# sourceMappingURL=smart-workflows.tool.d.ts.map