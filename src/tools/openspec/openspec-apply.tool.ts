import { z } from "zod";
import { spawn } from "child_process";
import { promisify } from "util";
import type { UnifiedTool } from "../registry.js";

/**
 * Execute OpenSpec apply command
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
 * OpenSpec apply tool - Apply a change proposal to implement the feature
 */
export const openspecApplyTool: UnifiedTool = {
  name: "openspec-apply",
  description: "Apply an OpenSpec change proposal and implement the specified feature",
  category: "spec-management",
  zodSchema: z.object({
    changeId: z
      .string()
      .min(1)
      .describe("Name/ID of the change to apply (use openspec-list to see available changes)"),
  }),
  execute: async (args, onProgress) => {
    const { changeId } = args;

    if (!changeId || !changeId.trim()) {
      throw new Error("Parameter 'changeId' is required to apply an OpenSpec change.");
    }

    try {
      onProgress?.(`Applying OpenSpec change: ${changeId}`);

      const result = await executeOpenSpecCommand(["apply", changeId]);

      if (!result.success) {
        throw new Error(`OpenSpec apply failed: ${result.error}`);
      }

      onProgress?.("OpenSpec change applied successfully");

      return `OpenSpec change "${changeId}" applied successfully.

Output: ${result.output}

This means the AI assistant has implemented the feature according to the approved specifications.

Next steps:
1. Test the implemented changes
2. Use 'openspec-archive ${changeId}' when implementation is complete and tested
3. The change will then be merged into the source specifications`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to apply OpenSpec change: ${errorMessage}`);
    }
  },
};
