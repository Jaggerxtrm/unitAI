import { z } from "zod";
import { AI_MODELS, ERROR_MESSAGES, BACKENDS } from "../constants.js";
import { executeAIClient } from "../utils/aiExecutor.js";
import type { UnifiedTool } from "./registry.js";

/**
 * Ask Gemini tool - main interaction with Gemini CLI
 */
export const askGeminiTool: UnifiedTool = {
  name: "ask-gemini",
  description:
    "Query Google Gemini via the gemini CLI with support for @file/#file syntax, sandbox mode, and model selection",
  category: "ai-client",
  zodSchema: z.object({
    prompt: z
      .string()
      .min(1)
      .describe(
        "Query for Gemini. Use @filename or #filename to include files"
      ),
    model: z
      .enum([
        "gemini-3-pro-preview",
        "gemini-3-flash-preview",
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite"
      ])
      .optional()
      .describe("Gemini model to use (defaults to gemini-3-pro-preview)"),
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
    description:
      "Query Google Gemini with @file support",
    arguments: [
      {
        name: "prompt",
        description:
          "Query. Use @filename to reference files",
        required: true
      },
      {
        name: "model",
        description: "Gemini model (gemini-3-pro-preview, gemini-3-flash-preview, gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite)",
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
