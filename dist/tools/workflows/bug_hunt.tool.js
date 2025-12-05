import { bugHuntWorkflow } from "../../workflows/bug-hunt.workflow.js";
export const workflowBugHuntTool = {
    name: "workflow_bug_hunt",
    description: `
# Bug Hunt

Orchestrates a multi-agent investigation to find and analyze bugs based on symptoms.

This workflow:
1. **Searches** the codebase for relevant files based on symptoms (if not provided).
2. **Analyzes** files in parallel using Gemini (Root Cause) and Cursor (Hypothesis).
3. **Plans** a fix using Droid (Remediation Plan).
4. **Checks** related files for impact.

## Usage
Use when you have a bug report or error message but don't know exactly where the issue lies.
  `.trim(),
    zodSchema: bugHuntWorkflow.schema,
    category: "workflow",
    metadata: {
        category: "debugging",
        bestFor: [
            "Complex bugs with unknown origin",
            "Root cause analysis",
            "Generating fix strategies"
        ],
        notFor: [
            "Simple syntax errors",
            "Known bugs (use direct fix)"
        ],
        cost: "high",
        duration: "1-2m",
        backends: ["ask-gemini", "ask-cursor", "ask-droid"]
    },
    examples: [
        {
            scenario: "Investigate Crash",
            params: {
                symptoms: "App crashes on startup with 'undefined is not an object' in auth.ts",
                autonomyLevel: "medium"
            }
        },
        {
            scenario: "Performance Issue",
            params: {
                symptoms: "Dashboard load time increased by 5s after last deploy",
                suspected_files: ["src/components/Dashboard.tsx"]
            }
        }
    ],
    execute: async (args, onProgress) => {
        return await bugHuntWorkflow.execute(args, onProgress);
    }
};
//# sourceMappingURL=bug_hunt.tool.js.map