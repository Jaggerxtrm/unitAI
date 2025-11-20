import { UnifiedTool } from "../registry.js";
import { openspecDrivenDevelopmentWorkflow } from "../../workflows/openspec-driven-development.workflow.js";

export const workflowOpenspecDrivenDevelopmentTool: UnifiedTool = {
  name: "workflow_openspec_driven_development",
  description: `
# OpenSpec Driven Development

Implement features using the Specification-First methodology (OpenSpec).

This workflow:
1. **Initializes** OpenSpec (if needed).
2. **Proposes** a change (creates a spec file).
3. **Refines** the spec using AI validation.
4. **Implements** the code based on the refined spec.
5. **Archives** the spec as documentation.

## Usage
Best for projects enforcing strict specification protocols or when clear documentation is required before coding.
  `.trim(),
  zodSchema: openspecDrivenDevelopmentWorkflow.schema as any,
  category: "workflow",
  metadata: {
    category: "planning",
    bestFor: [
      "Spec-first development",
      "Standardized feature implementation",
      "Generating living documentation"
    ],
    notFor: [
      "Quick hacks",
      "Exploratory coding"
    ],
    cost: "high",
    duration: "60-120s",
    backends: ["ask-gemini", "ask-cursor", "ask-droid"]
  },
  examples: [
    {
      scenario: "New Feature with Spec",
      params: {
        featureDescription: "Implement JWT authentication middleware",
        changeType: "feature",
        validationBackends: ["ask-gemini"]
      }
    }
  ],
  execute: async (args, onProgress) => {
    return await openspecDrivenDevelopmentWorkflow.execute(args, onProgress);
  }
};

