import { UnifiedTool } from "../registry.js";
import { validateLastCommitWorkflow } from "../../workflows/validate-last-commit.workflow.js";

export const workflowValidateLastCommitTool: UnifiedTool = {
  name: "workflow_validate_last_commit",
  description: `
# Validate Last Commit

Analyze a specific git commit for quality, security, and breaking changes.

This workflow examines the *committed* code (unlike pre-commit which checks staged files). It retrieves the commit metadata, diff, and file list, then runs parallel analysis using Gemini and Cursor.

## Key Checks
- **Breaking Changes:** API compatibility.
- **Security:** Leaked secrets or vulnerabilities.
- **Best Practices:** Code style and patterns.

## Usage
Use this in CI pipelines or for post-commit reviews. Defaults to HEAD (most recent commit).
  `.trim(),
  zodSchema: validateLastCommitWorkflow.schema,
  category: "workflow",
  metadata: {
    category: "validation",
    bestFor: [
      "Post-commit review",
      "CI/CD pipeline integration",
      "Double-checking a recent change"
    ],
    notFor: [
      "Checking uncommitted changes (use workflow_pre_commit_validate)",
      "Reviewing a whole branch (use workflow_parallel_review)"
    ],
    cost: "medium",
    duration: "15-30s",
    backends: ["gemini", "cursor-agent"]
  },
  examples: [
    {
      scenario: "Check Latest Commit",
      params: {
        commit_ref: "HEAD"
      }
    },
    {
      scenario: "Check Specific Commit",
      params: {
        commit_ref: "a1b2c3d"
      }
    }
  ],
  execute: async (args, onProgress) => {
    return await validateLastCommitWorkflow.execute(args, onProgress);
  }
};

