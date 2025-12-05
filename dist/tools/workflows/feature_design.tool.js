import { featureDesignWorkflow } from "../../workflows/feature-design.workflow.js";
export const workflowFeatureDesignTool = {
    name: "workflow_feature_design",
    description: `
# Feature Design

Orchestrates a multi-agent team to design, implement, and test a feature.

This workflow activates three specialized agents:
1. **ArchitectAgent:** Designs the solution structure.
2. **ImplementerAgent:** Writes the code.
3. **TesterAgent:** Generates test suites.

## Usage
Use for complex features requiring multiple files or careful architectural planning.
  `.trim(),
    zodSchema: featureDesignWorkflow.schema,
    category: "workflow",
    metadata: {
        category: "planning",
        bestFor: [
            "New feature implementation",
            "Complex refactoring",
            "End-to-end development"
        ],
        notFor: [
            "Simple one-line fixes",
            "Quick bug patches"
        ],
        cost: "high",
        duration: "45-90s",
        backends: ["ask-gemini", "ask-cursor", "ask-droid"]
    },
    examples: [
        {
            scenario: "New API Endpoint",
            params: {
                featureDescription: "Add GET /api/users endpoint with caching",
                targetFiles: ["src/api/users.ts", "src/services/cache.ts"],
                architecturalFocus: "performance",
                testType: "integration"
            }
        }
    ],
    execute: async (args, onProgress) => {
        return await featureDesignWorkflow.execute(args, onProgress);
    }
};
//# sourceMappingURL=feature_design.tool.js.map