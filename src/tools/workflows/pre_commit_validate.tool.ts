import { UnifiedTool } from "../registry.js";
import { preCommitValidateWorkflow } from "../../workflows/pre-commit-validate.workflow.js";

export const workflowPreCommitValidateTool: UnifiedTool = {
  name: "workflow_pre_commit_validate",
  description: `
# Pre-Commit Validation

Validate staged changes before committing to git.

This workflow analyzes the *staged* git diff (files added with 'git add') for:
- **Security Secrets:** Accidental API key commits.
- **Code Quality:** Linting issues, bad patterns, and potential bugs.
- **Breaking Changes:** API compatibility checks.

It uses parallel execution of Gemini and Qwen, plus Droid if depth is "paranoid".

## Usage
Run this *after* 'git add' but *before* 'git commit'.
  `.trim(),
  zodSchema: preCommitValidateWorkflow.schema as any,
  category: "workflow",
  metadata: {
    category: "validation",
    bestFor: [
      "Pre-commit hook replacement",
      "Sanity check before pushing",
      "Preventing secret leaks"
    ],
    notFor: [
      "Validating un-staged changes (stage them first)",
      "Deep architectural review of the whole repo"
    ],
    cost: "medium",
    duration: "5-20s",
    backends: ["ask-gemini", "qwen", "droid (optional)"]
  },
  examples: [
    {
      scenario: "Quick Check",
      params: {
        depth: "quick"
      }
    },
    {
      scenario: "Thorough Review",
      params: {
        depth: "thorough"
      }
    }
  ],
  execute: async (args, onProgress) => {
    return await preCommitValidateWorkflow.execute(args, onProgress);
  }
};

