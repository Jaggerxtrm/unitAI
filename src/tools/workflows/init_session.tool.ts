import { UnifiedTool } from "../registry.js";
import { initSessionWorkflow } from "../../workflows/init-session.workflow.js";

export const workflowInitSessionTool: UnifiedTool = {
  name: "workflow_init_session",
  description: `
# Initialize Session

Analyze the current state of the repository to prepare for a development session.

This workflow:
1. **Scans Git Status:** Branch, staged files, modified files.
2. **Analyzes Recent History:** AI summary of last 10 commits (features, bug fixes).
3. **Checks CLI Tools:** Verifies availability of Gemini, Cursor, Droid.
4. **Queries Memories:** Suggests relevant project knowledge based on recent work.

## Usage
Run this at the start of every session to get context.
  `.trim(),
  zodSchema: initSessionWorkflow.schema as any,
  category: "workflow",
  metadata: {
    category: "session",
    bestFor: [
      "Starting a new task",
      "Understanding recent changes",
      "Checking tool availability"
    ],
    notFor: [
      "Code generation",
      "Deep debugging"
    ],
    cost: "low",
    duration: "10-20s",
    backends: ["gemini", "cursor-agent"]
  },
  examples: [
    {
      scenario: "Standard Start",
      params: {
        commitCount: 10
      }
    },
    {
      scenario: "Deep History Check",
      params: {
        commitCount: 30
      }
    }
  ],
  execute: async (args, onProgress) => {
    return await initSessionWorkflow.execute(args, onProgress);
  }
};

