import { UnifiedTool } from "../registry.js";
import { parallelReviewWorkflow } from "../../workflows/parallel-review.workflow.js";

export const workflowParallelReviewTool: UnifiedTool = {
  name: "workflow_parallel_review",
  description: `
# Parallel Code Review

Run comprehensive code review using multiple AI backends in parallel.

This workflow executes Gemini (architecture), Cursor (refactoring), and Droid (implementation) analysis simultaneously and combines results.

## Key Features
- **Multi-Perspective:** Get architectural, stylistic, and functional feedback at once.
- **Fast:** Parallel execution minimizes wait time.
- **Comprehensive:** Catch security issues, performance bottlenecks, and code style violations.

## Usage
Use this tool when you need a deep review of specific files, especially before merging critical changes.
  `.trim(),
  zodSchema: parallelReviewWorkflow.schema,
  category: "workflow",
  metadata: {
    category: "code-review",
    bestFor: [
      "Pre-merge code review",
      "Security audits",
      "Comprehensive quality checks"
    ],
    notFor: [
      "Quick syntax fixes (use ask_cursor_agent)",
      "Single file formatting"
    ],
    cost: "high",
    duration: "30-60s",
    backends: ["gemini", "cursor-agent", "droid"]
  },
  examples: [
    {
      scenario: "Security Review",
      params: {
        files: ["src/auth.ts", "src/middleware.ts"],
        focus: "security"
      }
    },
    {
      scenario: "Double Check Strategy",
      params: {
        files: ["src/core/payment.ts"],
        strategy: "double-check",
        focus: "quality"
      }
    }
  ],
  execute: async (args, onProgress) => {
    return await parallelReviewWorkflow.execute(args, onProgress);
  }
};

