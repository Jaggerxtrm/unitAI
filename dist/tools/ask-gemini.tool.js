import { z } from "zod";
import { AI_MODELS, ERROR_MESSAGES, BACKENDS } from "../constants.js";
import { executeAIClient } from "../utils/aiExecutor.js";
/**
 * Ask Gemini tool - main interaction with Gemini CLI
 */
export const askGeminiTool = {
    name: "ask-gemini",
    description: "Query Google Gemini via the gemini CLI with support for @file/#file syntax, sandbox mode, and model selection.",
    category: "ai-client",
    zodSchema: z.object({
        prompt: z
            .string()
            .min(1)
            .describe("The query or instruction for Gemini. Use @filename, #filename, or directory references to include file contents. Example: '@src/ Explain this codebase structure'"),
        model: z
            .enum([
            AI_MODELS.GEMINI.PRIMARY,
            AI_MODELS.GEMINI.PRO,
            AI_MODELS.GEMINI.FLASH
        ])
            .optional()
            .describe(`Optional model to use (e.g., '${AI_MODELS.GEMINI.PRIMARY}'). If not specified, uses the default model (${AI_MODELS.GEMINI.PRIMARY}).`),
        sandbox: z
            .boolean()
            .default(false)
            .describe("Enable sandbox mode (-s flag) for safe code execution"),
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
        description: "Interact with Google Gemini for code analysis, file exploration, and general queries. Supports @file or #file references for including file contents.",
        arguments: [
            {
                name: "prompt",
                description: "Your question or instruction. Use @filename or #filename to reference files.",
                required: true
            },
            {
                name: "model",
                description: `Optional model selection (${AI_MODELS.GEMINI.PRIMARY}, ${AI_MODELS.GEMINI.PRO}, etc.)`,
                required: false
            },
            {
                name: "sandbox",
                description: "Enable sandbox mode for safe code execution",
                required: false
            }
        ]
    }
};
//# sourceMappingURL=ask-gemini.tool.js.map