import { z } from "zod";
import { spawn } from "child_process";
import { promisify } from "util";
import type { UnifiedTool } from "../registry.js";

/**
 * Execute OpenSpec archive command
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
 * OpenSpec archive tool - Archive a completed change into source specifications
 */
export const openspecArchiveTool: UnifiedTool = {
  name: "openspec-archive",
  description: "Archive a completed OpenSpec change to merge it into the source specifications",
  category: "spec-management",
  zodSchema: z.object({
    changeId: z
      .string()
      .min(1)
      .describe("Name/ID of the completed change to archive"),
    force: z
      .boolean()
      .optional()
      .default(false)
      .describe("Force archive without confirmation prompts"),
  }),
  execute: async (args, onProgress) => {
    const { changeId, force } = args;

    try {
      onProgress?.(`Archiving OpenSpec change: ${changeId}`);

      const commandArgs = ["archive", changeId];
      if (force) {
        commandArgs.push("--yes");
      }

      const result = await executeOpenSpecCommand(commandArgs);

      if (!result.success) {
        throw new Error(`OpenSpec archive failed: ${result.error}`);
      }

      onProgress?.("OpenSpec change archived successfully");

      return `OpenSpec change "${changeId}" archived successfully.

Output: ${result.output}

The change has been merged into the source specifications in openspec/specs/.
This permanently updates the project's specification documentation.

The change folder openspec/changes/${changeId}/ has been removed.

Next steps:
1. The specifications are now part of the project's living documentation
2. Future changes can reference these updated specs
3. Use 'openspec-list' to see remaining active changes`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to archive OpenSpec change: ${errorMessage}`);
    }
  },
};
