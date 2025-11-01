import { z } from "zod";
import { ERROR_MESSAGES, BACKENDS } from "../constants.js";
import { executeAIClient } from "../utils/aiExecutor.js";
/**
 * Ask Rovodev tool - main interaction with acli rovodev
 */
export const askRovodevTool = {
    name: "ask-rovodev",
    description: "Query Rovodev AI with support for file analysis (@file or #file syntax), codebase exploration, and large context windows. Supports various models and execution modes.",
    category: "ai-client",
    zodSchema: z.object({
        prompt: z
            .string()
            .min(1)
            .describe("The query or instruction for Rovodev. Use @filename, #filename, or directory references to include file contents. Example: '@src/ Explain this codebase structure'"),
        yolo: z
            .boolean()
            .default(false)
            .describe("Enable YOLO mode to automatically approve all tool calls without prompting"),
        shadow: z
            .boolean()
            .default(false)
            .describe("Enable shadow mode for safe changes on temporary workspace copy"),
        verbose: z
            .boolean()
            .default(false)
            .describe("Enable verbose tool output"),
        restore: z
            .boolean()
            .default(false)
            .describe("Continue the last session if available instead of starting a new one")
    }),
    execute: async (args, onProgress) => {
        const { prompt, yolo, shadow, verbose, restore } = args;
        // Validate prompt
        if (!prompt || !prompt.trim()) {
            throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
        }
        // Execute Rovodev CLI (only passing supported parameters)
        const result = await executeAIClient({
            backend: BACKENDS.ROVODEV,
            prompt,
            yolo,
            shadow,
            verbose,
            restore,
            onProgress
        });
        return result;
    },
    prompt: {
        name: "ask-rovodev",
        description: "Interact with Rovodev AI for code analysis, file exploration, and general queries. Supports @file or #file references for including file contents. Based on acli rovodev CLI.",
        arguments: [
            {
                name: "prompt",
                description: "Your question or instruction. Use @filename or #filename to reference files.",
                required: true
            },
            {
                name: "yolo",
                description: "Enable YOLO mode to auto-approve all operations",
                required: false
            },
            {
                name: "shadow",
                description: "Enable shadow mode for safe changes on temporary workspace copy",
                required: false
            },
            {
                name: "verbose",
                description: "Enable verbose tool output",
                required: false
            },
            {
                name: "restore",
                description: "Continue last session instead of starting new one",
                required: false
            }
        ]
    }
};
//# sourceMappingURL=ask-rovodev.tool.js.map