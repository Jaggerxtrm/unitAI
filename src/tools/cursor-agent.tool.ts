import { z } from "zod";
import { AI_MODELS, BACKENDS, ERROR_MESSAGES } from "../constants.js";
import { executeAIClient } from "../utils/aiExecutor.js";
import type { UnifiedTool } from "./registry.js";
import { AutonomyLevel } from "../utils/permissionManager.js";

const cursorAgentModels = [
  AI_MODELS.CURSOR_AGENT.GPT_5_1,
  AI_MODELS.CURSOR_AGENT.GPT_5,
  AI_MODELS.CURSOR_AGENT.COMPOSER_1,
  AI_MODELS.CURSOR_AGENT.SONNET_4_5,
  AI_MODELS.CURSOR_AGENT.HAIKU_5,
  AI_MODELS.CURSOR_AGENT.DEEPSEEK_V3
] as const;

const cursorAgentSchema = z.object({
  prompt: z
    .string()
    .min(1)
    .describe("Prompt da inviare al Cursor Agent CLI"),
  model: z
    .enum(cursorAgentModels)
    .optional()
    .describe(`Modello da usare (default: ${AI_MODELS.CURSOR_AGENT.GPT_5_1})`),
  outputFormat: z
    .enum(["text", "json"])
    .default("text")
    .describe("Formato dell'output (text/json)"),
  projectRoot: z
    .string()
    .optional()
    .describe("Directory di lavoro da passare come --cwd"),
  files: z
    .array(z.string())
    .optional()
    .describe("File locali da allegare tramite --file"),
  autoApprove: z
    .boolean()
    .default(false)
    .describe("Abilita --auto-approve per esecuzioni completamente autonome"),
  autonomyLevel: z
    .nativeEnum(AutonomyLevel)
    .optional()
    .describe("Livello di autonomia da comunicare al CLI (metadata)")
});

export type CursorAgentParams = z.infer<typeof cursorAgentSchema>;

export const cursorAgentTool: UnifiedTool = {
  name: "cursor-agent",
  description: "Multi-model Cursor Agent CLI per bug fixing e refactoring guidati",
  category: "ai-client",
  zodSchema: cursorAgentSchema,
  execute: async (args, onProgress) => {
    const {
      prompt,
      model,
      outputFormat,
      projectRoot,
      files,
      autoApprove,
      autonomyLevel
    } = args;

    if (!prompt || !prompt.trim()) {
      throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
    }

    return executeAIClient({
      backend: BACKENDS.CURSOR,
      prompt,
      model,
      outputFormat,
      projectRoot,
      attachments: files,
      autoApprove,
      autonomyLevel,
      onProgress
    });
  },
  prompt: {
    name: "cursor-agent",
    description: "Esegui Cursor Agent headless per analisi e refactoring multi-modello",
    arguments: [
      {
        name: "prompt",
        description: "Prompt principale (usa @file per allegare file)",
        required: true
      },
      {
        name: "model",
        description: `Modello (es. ${AI_MODELS.CURSOR_AGENT.SONNET_4_5})`,
        required: false
      },
      {
        name: "outputFormat",
        description: "Formato output (text/json)",
        required: false
      }
    ]
  }
};

