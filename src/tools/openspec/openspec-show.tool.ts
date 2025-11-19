import { z } from "zod";
import { spawn } from "child_process";
import { promisify } from "util";
import type { UnifiedTool } from "../registry.js";

/**
 * Execute OpenSpec show command
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
 * OpenSpec show tool - Show detailed information about a specific change
 */
export const openspecShowTool: UnifiedTool = {
  name: "openspec-show",
  description: "Show detailed information about a specific OpenSpec change proposal",
  category: "spec-management",
  zodSchema: z.object({
    changeId: z
      .string()
      .min(1)
      .describe("Name/ID of the change to show details for"),
  }),
  execute: async (args, onProgress) => {
    const { changeId } = args;

    if (!changeId || !changeId.trim()) {
      throw new Error("Parameter 'changeId' is required to show an OpenSpec change.");
    }

    try {
      onProgress?.(`Showing OpenSpec change details: ${changeId}`);

      const result = await executeOpenSpecCommand(["show", changeId]);

      if (!result.success) {
        throw new Error(`OpenSpec show failed: ${result.error}`);
      }

      onProgress?.("OpenSpec change details retrieved successfully");

      return `OpenSpec change "${changeId}" details:

${result.output}

This shows the proposal, tasks, and specification deltas for the change.

Next steps based on change status:
- If specs need refinement: Edit the proposal files in openspec/changes/${changeId}/
- If ready to implement: Use 'openspec-apply ${changeId}'
- If completed: Use 'openspec-archive ${changeId}'`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to show OpenSpec change: ${errorMessage}`);
    }
  },
};
