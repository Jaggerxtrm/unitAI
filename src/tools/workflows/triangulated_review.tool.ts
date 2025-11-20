import { UnifiedTool } from "../registry.js";
import { triangulatedReviewWorkflow } from "../../workflows/triangulated-review.workflow.js";

export const workflowTriangulatedReviewTool: UnifiedTool = {
  name: "workflow_triangulated_review",
  description: `
# Triangulated Review

Perform a 3-way cross-check on critical changes.

1. **Gemini** checks architecture and long-term impact.
2. **Cursor** suggests concrete code improvements.
3. **Droid** creates an operational checklist and verifying remaining risks.

## Usage
Best for critical refactors or complex bug fixes where you need high confidence.
  `.trim(),
  zodSchema: triangulatedReviewWorkflow.schema,
  category: "workflow",
  metadata: {
    category: "code-review",
    bestFor: [
      "Critical bug fixes",
      "Core architectural changes",
      "High-risk refactors"
    ],
    notFor: [
      "Routine reviews",
      "Simple style changes"
    ],
    cost: "high",
    duration: "60-90s",
    backends: ["gemini", "cursor-agent", "droid"]
  },
  examples: [
    {
      scenario: "Critical Bug Fix",
      params: {
        files: ["src/core/payment-gateway.ts"],
        goal: "bugfix"
      }
    }
  ],
  execute: async (args, onProgress) => {
    return await triangulatedReviewWorkflow.execute(args, onProgress);
  }
};

