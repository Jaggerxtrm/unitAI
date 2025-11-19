import { z } from "zod";
import { spawn } from "child_process";
import { promisify } from "util";
import type { UnifiedTool } from "../registry.js";

/**
 * Execute OpenSpec command with improved error handling and timeout
 */
async function executeOpenSpecCommand(
  args: string[],
  options: {
    timeout?: number;
    expectInteractive?: boolean;
    onProgress?: (message: string) => void;
  } = {}
): Promise<{
  success: boolean;
  output: string;
  error?: string;
  isInteractive?: boolean;
}> {
  const { timeout = 30000, expectInteractive = false, onProgress } = options;

  return new Promise((resolve) => {
    const child = spawn("npx", ["@fission-ai/openspec", ...args], {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    let stdout = "";
    let stderr = "";
    let isInteractive = false;

    // Timeout handling
    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({
        success: false,
        output: stdout,
        error: `Command timed out after ${timeout}ms`,
        isInteractive: true
      });
    }, timeout);

    child.stdout?.on("data", (data) => {
      const chunk = data.toString();
      stdout += chunk;

      // Detect interactive prompts
      if (chunk.includes("Press Enter") ||
          chunk.includes("Select") ||
          chunk.includes("Choose") ||
          chunk.includes("Type") ||
          chunk.includes("?") ||
          chunk.includes(">") ||
          chunk.match(/\[\w+\]/)) {
        isInteractive = true;
        onProgress?.("⚠️ Detected interactive prompt - command requires manual execution");
      }
    });

    child.stderr?.on("data", (data) => {
      const chunk = data.toString();
      stderr += chunk;

      // Detect interactive prompts in stderr too
      if (chunk.includes("Press Enter") ||
          chunk.includes("Select") ||
          chunk.includes("Choose")) {
        isInteractive = true;
      }
    });

    child.on("close", (code) => {
      clearTimeout(timeoutId);

      // If we detected interactive prompts, mark as such
      if (isInteractive || expectInteractive) {
        resolve({
          success: false,
          output: stdout,
          error: "Command requires interactive input",
          isInteractive: true
        });
        return;
      }

      resolve({
        success: code === 0,
        output: stdout,
        error: stderr || undefined,
        isInteractive: false
      });
    });

    child.on("error", (error) => {
      clearTimeout(timeoutId);
      resolve({
        success: false,
        output: stdout,
        error: error.message,
        isInteractive: false
      });
    });
  });
}

/**
 * OpenSpec proposal tool - Create a new change proposal
 */
export const openspecProposalTool: UnifiedTool = {
  name: "openspec-proposal",
  description: "Create a new OpenSpec change proposal for a feature or change",
  category: "spec-management",
  zodSchema: z.object({
    description: z
      .string()
      .min(1)
      .describe("Brief description of the change or feature to propose"),
    changeType: z
      .enum(["feature", "bugfix", "improvement", "refactor"])
      .optional()
      .default("feature")
      .describe("Type of change being proposed"),
  }),
  execute: async (args, onProgress) => {
    const { description, changeType } = args;

    try {
      onProgress?.(`Creating OpenSpec proposal: ${description}`);

      // OpenSpec proposal command expects the description as a positional argument
      // For now, we'll use a simplified approach
      // In practice, this might require interactive input or additional parameters

      // Try to execute the proposal command
      const result = await executeOpenSpecCommand(
        ["proposal", description],
        {
          timeout: 10000, // Shorter timeout for proposal command
          expectInteractive: true, // Proposal command is often interactive
          onProgress
        }
      );

      if (result.success) {
        onProgress?.("OpenSpec proposal created successfully");

        return `OpenSpec proposal created successfully.

Description: ${description}
Type: ${changeType}

Output: ${result.output}

Next steps:
1. Use 'openspec-list' to see the new change
2. Use 'openspec-show <change-name>' to review the generated specs
3. Use 'openspec-apply <change-name>' to implement the change`;
      }

      // Handle different failure scenarios
      if (result.isInteractive) {
        return `⚠️ **OpenSpec Proposal Requires Manual Execution**

The proposal creation command requires interactive input. Please run this command manually in your terminal:

\`\`\`bash
npx @fission-ai/openspec proposal "${description}"
\`\`\`

**Interactive Steps:**
1. The command will guide you through creating the proposal
2. You'll be prompted to describe the change scope
3. Choose the appropriate change type (${changeType})
4. Define which files will be affected
5. Review and confirm the generated specification

**After Manual Creation:**
- Run \`openspec-list\` to see your new change
- Use \`openspec-show <change-name>\` to review details
- Use \`openspec-apply <change-name>\` to implement

**Alternative:** Use the \`openspec-driven-development\` workflow for fully automated spec-driven development.`;
      }

      // Other failures
      throw new Error(`OpenSpec proposal failed: ${result.error}`);

      onProgress?.("OpenSpec proposal created successfully");

      return `OpenSpec proposal created successfully.

Description: ${description}
Type: ${changeType}

Output: ${result.output}

Next steps:
1. Use 'openspec-list' to see the new change
2. Use 'openspec-show <change-name>' to review the generated specs
3. Use 'openspec-apply <change-name>' to implement the change`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create OpenSpec proposal: ${errorMessage}`);
    }
  },
};
