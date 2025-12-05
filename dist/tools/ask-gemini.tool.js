import { z } from "zod";
import { AI_MODELS, ERROR_MESSAGES, BACKENDS } from "../constants.js";
import { executeAIClient } from "../utils/aiExecutor.js";
/**
 * Ask Gemini tool - main interaction with Gemini CLI
 */
export const askGeminiTool = {
    name: "ask-gemini",
    description: "Query Google Gemini via the gemini CLI with support for @file/#file syntax, sandbox mode, and model selection",
    category: "ai-client",
    zodSchema: z.object({
        prompt: z
            .string()
            .min(1)
            .describe("Query for Gemini. Use @filename or #filename to include files"),
        model: z
            .enum([
            AI_MODELS.GEMINI.PRIMARY,
            AI_MODELS.GEMINI.FLASH
        ])
            .optional()
            .describe(`Model to use (default: ${AI_MODELS.GEMINI.PRIMARY})`),
        sandbox: z
            .boolean()
            .default(false)
            .describe("Sandbox mode for safe execution"),
    }),
    execute: async (args, onProgress) => {
        const { prompt, model, sandbox } = args;
        if (!prompt || !prompt.trim()) {
            throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
        }
        const result = await executeAIClient({
            backend: BACKENDS.GEMINI,
            prompt,
            model,
            sandbox,
            onProgress
        });
        return result;
    },
    prompt: {
        name: "ask-gemini",
        description: "Query Google Gemini with @file support",
        arguments: [
            {
                name: "prompt",
                description: "Query. Use @filename to reference files",
                required: true
            },
            {
                name: "model",
                description: `Model (default: ${AI_MODELS.GEMINI.PRIMARY})`,
                required: false
            },
            {
                name: "sandbox",
                description: "Sandbox mode",
                required: false
            }
        ]
    }
};
//# sourceMappingURL=ask-gemini.tool.js.map