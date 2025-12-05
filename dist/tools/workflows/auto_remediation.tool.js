import { autoRemediationWorkflow } from "../../workflows/auto-remediation.workflow.js";
export const workflowAutoRemediationTool = {
    name: "workflow_auto_remediation",
    description: `
# Auto Remediation

Generates an autonomous remediation plan using Factory Droid.

This workflow:
1. **Analyzes** the symptoms and context.
2. **Generates** a step-by-step operational plan.
3. **Defines** verification steps and residual risks.

## Usage
Use when you need a concrete, executable plan to fix a known issue or implement a recovery strategy.
  `.trim(),
    zodSchema: autoRemediationWorkflow.schema,
    category: "workflow",
    metadata: {
        category: "debugging",
        bestFor: [
            "Creating operational runbooks",
            "Automated recovery planning",
            "Incident response"
        ],
        notFor: [
            "Exploratory debugging",
            "Architectural design"
        ],
        cost: "medium",
        duration: "30s",
        backends: ["ask-droid"]
    },
    examples: [
        {
            scenario: "Fix Memory Leak",
            params: {
                symptoms: "Memory usage spikes to 2GB then crashes",
                maxActions: 5
            }
        }
    ],
    execute: async (args, onProgress) => {
        return await autoRemediationWorkflow.execute(args, onProgress);
    }
};
//# sourceMappingURL=auto_remediation.tool.js.map