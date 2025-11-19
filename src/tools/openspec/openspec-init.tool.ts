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
 * OpenSpec init tool - Initialize OpenSpec in the current project
 */
export const openspecInitTool: UnifiedTool = {
  name: "openspec-init",
  description: "initialize OpenSpec in the current project directory",
  category: "spec-management",
  zodSchema: z.object({
    aiTools: z
      .array(z.string())
      .optional()
      .describe(
        "List of AI tools to configure during initialization (e.g., ['claude-code', 'cursor', 'qoder']). If not provided, OpenSpec will prompt interactively."
      ),
  }),
  execute: async (args, onProgress) => {
    const { aiTools } = args;

    try {
      onProgress?.("Initializing OpenSpec in project...");

      // Try to execute the init command
      const result = await executeOpenSpecCommand(
        ["init"],
        {
          timeout: 20000, // Init command may take some time
          expectInteractive: true, // Init command is interactive
          onProgress
        }
      );

      if (result.success) {
        onProgress?.("OpenSpec initialized successfully");

        return `OpenSpec initialized successfully in the current project.

Output: ${result.output}

Next steps:
1. Use 'openspec-proposal' to create change proposals
2. Use 'openspec-list' to view active changes
3. Use 'openspec-show <change>' to review change details

For language-specific guidance, see the OpenSpec integration documentation.`;
      }

      // Handle interactive requirements
      if (result.isInteractive) {
        return `⚠️ **OpenSpec Init Requires Manual Execution**

The initialization command requires interactive input. Please run this command manually in your terminal:

\`\`\`bash
npx @fission-ai/openspec init
\`\`\`

**Interactive Steps:**
1. The command will prompt you to select AI tools to integrate
2. Choose which AI assistants you want to configure (${aiTools?.length ? aiTools.join(', ') : 'none specified'})
3. The command will create the \`openspec/\` directory structure
4. AI tool configurations will be generated automatically

**After Manual Initialization:**
- Run \`openspec-list\` to verify setup
- Use \`openspec-proposal\` to create your first change
- The \`openspec/\` directory will contain your project specifications

**Alternative:** Use the \`openspec-driven-development\` workflow for fully automated spec-driven development.`;
      }

      // Other failures
      throw new Error(`OpenSpec init failed: ${result.error}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize OpenSpec: ${errorMessage}`);
    }
  },
};
