import { z } from "zod";
import { AI_MODELS, BACKENDS, ERROR_MESSAGES } from "../constants.js";
import { executeAIClient } from "../utils/aiExecutor.js";
import { AutonomyLevel } from "../utils/permissionManager.js";
const droidModels = [AI_MODELS.DROID.PRIMARY];
const droidSchema = z.object({
    prompt: z
        .string()
        .min(1)
        .describe("Prompt da passare a droid exec"),
    model: z
        .enum(droidModels)
        .optional()
        .describe(`Modello GLM (default: ${AI_MODELS.DROID.PRIMARY})`),
    auto: z
        .enum(["low", "medium", "high"])
        .default("low")
        .describe("Livello di autonomia (--auto)"),
    outputFormat: z
        .enum(["text", "json"])
        .default("text")
        .describe("Formato dell'output"),
    sessionId: z
        .string()
        .optional()
        .describe("ID sessione per continuare conversazioni precedenti"),
    skipPermissionsUnsafe: z
        .boolean()
        .default(false)
        .describe("Imposta --skip-permissions-unsafe (solo autonomia HIGH)"),
    files: z
        .array(z.string())
        .optional()
        .describe("File da allegare via --file"),
    cwd: z
        .string()
        .optional()
        .describe("Directory di lavoro da passare a --cwd"),
    autonomyLevel: z
        .nativeEnum(AutonomyLevel)
        .optional()
        .describe("Livello di autonomia del workflow (per enforcement interno)")
});
export const droidTool = {
    name: "droid",
    description: "Factory Droid CLI (GLM-4.6) per task agentici con livelli di autonomia configurabili",
    category: "ai-client",
    zodSchema: droidSchema,
    execute: async (args, onProgress) => {
        const { prompt, model, auto, outputFormat, sessionId, skipPermissionsUnsafe, files, cwd, autonomyLevel } = args;
        if (!prompt || !prompt.trim()) {
            throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
        }
        if (skipPermissionsUnsafe && autonomyLevel !== AutonomyLevel.HIGH) {
            throw new Error("Flag --skip-permissions-unsafe consentito solo con autonomyLevel=high");
        }
        return executeAIClient({
            backend: BACKENDS.DROID,
            prompt,
            model,
            outputFormat,
            auto,
            sessionId,
            skipPermissionsUnsafe,
            attachments: files,
            cwd,
            onProgress
        });
    },
    prompt: {
        name: "droid",
        description: "Esegui Factory Droid (GLM-4.6) per task agentici multi-step",
        arguments: [
            {
                name: "prompt",
                description: "Prompt principale da eseguire",
                required: true
            },
            {
                name: "auto",
                description: "Livello di autonomia (low/medium/high)",
                required: false
            },
            {
                name: "sessionId",
                description: "Sessione esistente da riprendere",
                required: false
            }
        ]
    }
};
//# sourceMappingURL=droid.tool.js.map