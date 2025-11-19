import { z } from "zod";
import { spawn } from "child_process";
import { promisify } from "util";
import type { UnifiedTool } from "../registry.js";

/**
 * Execute OpenSpec list command
 */
async function executeOpenSpecCommand(args: string[]): Promise<{ success: boolean; output: string; error?: string }> {
  return new Promise((resolve) => {
    const child = spawn("npx", ["@fission-ai/openspec", ...args], {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      resolve({
        success: code === 0,
        output: stdout,
        error: stderr || undefined,
      });
    });

    child.on("error", (error) => {
      resolve({
        success: false,
        output: stdout,
        error: error.message,
      });
    });
  });
}

/**
 * OpenSpec list tool - List all active change proposals
 */
export const openspecListTool: UnifiedTool = {
  name: "openspec-list",
  description: "List all active OpenSpec change proposals in the current project",
  category: "spec-management",
  zodSchema: z.object({}),
  execute: async (args, onProgress) => {
    try {
      onProgress?.("Listing OpenSpec changes...");

      const result = await executeOpenSpecCommand(["list"]);

      if (!result.success) {
        throw new Error(`OpenSpec list failed: ${result.error}`);
      }

      onProgress?.("OpenSpec changes listed successfully");

      const output = result.output.trim();

      if (!output) {
        return `No active OpenSpec changes found.

To create a new change proposal, use the 'openspec-proposal' tool with a description of the feature you want to implement.`;
      }

      return `Active OpenSpec changes:

${output}

Commands to work with these changes:
- openspec-show <change-name> - View details of a specific change
- openspec-apply <change-name> - Implement the change
- openspec-archive <change-name> - Archive completed change`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list OpenSpec changes: ${errorMessage}`);
    }
  },
};
