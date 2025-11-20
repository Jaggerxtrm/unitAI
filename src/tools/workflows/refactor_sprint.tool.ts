import { UnifiedTool } from "../registry.js";
import { refactorSprintWorkflow } from "../../workflows/refactor-sprint.workflow.js";

export const workflowRefactorSprintTool: UnifiedTool = {
    name: "workflow_refactor_sprint",
    description: `
# Refactor Sprint

Coordinates a multi-agent team to plan and execute a complex refactor.

This workflow:
1. **Cursor Agent:** Generates a detailed refactoring plan and patches.
2. **Gemini:** Reviews the plan for architectural risks.
3. **Droid:** Creates an operational checklist for execution.

## Usage
Use for significant code restructuring, technical debt reduction, or pattern migration.
  `.trim(),
    zodSchema: refactorSprintWorkflow.schema as any,
    category: "workflow",
    metadata: {
        category: "planning",
        bestFor: [
            "Large-scale refactoring",
            "Technical debt cleanup",
            "Migration tasks"
        ],
        notFor: [
            "Small style fixes",
            "Single function rewrites"
        ],
        cost: "high",
        duration: "1-2m",
        backends: ["ask-cursor", "ask-gemini", "ask-droid"]
    },
    examples: [
        {
            scenario: "Migrate to Context API",
            params: {
                targetFiles: ["src/components/App.tsx", "src/store/redux.ts"],
                scope: "Replace Redux with React Context",
                depth: "deep"
            }
        }
    ],
    execute: async (args, onProgress) => {
        return await refactorSprintWorkflow.execute(args, onProgress);
    }
};
