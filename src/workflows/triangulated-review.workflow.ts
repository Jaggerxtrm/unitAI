import { z } from "zod";
import { BACKENDS } from "../constants.js";
import { runParallelAnalysis, buildCodeReviewPrompt, formatWorkflowOutput } from "./utils.js";
import type { WorkflowDefinition, ProgressCallback } from "./types.js";
import { executeAIClient } from "../utils/aiExecutor.js";

const triangulatedReviewSchema = z.object({
  files: z.array(z.string())
    .min(1, "Specificare almeno un file da analizzare"),
  goal: z.enum(["bugfix", "refactor"])
    .optional()
    .default("refactor"),
  autonomyLevel: z.enum(["read-only", "low", "medium", "high"])
    .optional()
});

export type TriangulatedReviewParams = z.infer<typeof triangulatedReviewSchema>;

export async function executeTriangulatedReview(
  params: TriangulatedReviewParams,
  onProgress?: ProgressCallback
): Promise<string> {
  const { files, goal } = params;

  onProgress?.(`🧭 Triangulated review avviata su ${files.length} file (goal: ${goal})`);

  const promptBuilder = (backend: string): string => {
    const basePrompt = buildCodeReviewPrompt(files, goal === "bugfix" ? "security" : "quality");

    switch (backend) {
      case BACKENDS.GEMINI:
        return `${basePrompt}

Focus:
- Allineamento architetturale
- Impatto a lungo termine rispetto all'obiettivo ${goal}`;
      case BACKENDS.CURSOR:
        return `${basePrompt}

Genera suggerimenti concreti di refactoring con priorità e rischi residui.`;
      default:
        return basePrompt;
    }
  };

  const analysisResult = await runParallelAnalysis(
    [BACKENDS.GEMINI, BACKENDS.CURSOR],
    promptBuilder,
    onProgress,
    (backend) => backend === BACKENDS.CURSOR
      ? { attachments: files.slice(0, 5), projectRoot: process.cwd(), outputFormat: "text" }
      : {}
  );

  let droidVerification = "";
  try {
    droidVerification = await executeAIClient({
      backend: BACKENDS.DROID,
      prompt: `Verifica questo set di file e genera una checklist operativa per completare il goal "${goal}".
File:
${files.join("\n")}

Restituisci:
- Step operativi (max 5)
- Metriche/controlli per ciascun step
- Rischi residui`,
      auto: "low",
      outputFormat: "text"
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    droidVerification = `Impossibile eseguire Droid: ${errorMsg}`;
  }

  const successful = analysisResult.results.filter(r => r.success);
  const failed = analysisResult.results.filter(r => !r.success);

  const content = `
## Sintesi Analisi (Gemini + Cursor)
${analysisResult.synthesis}

---

## Autonomous Verification (Droid)
${droidVerification}

---

## Stato Backend
- Successi: ${successful.map(r => r.backend).join(", ") || "Nessuno"}
- Fallimenti: ${failed.map(r => `${r.backend} (${r.error})`).join(", ") || "Nessuno"}
`;

  return formatWorkflowOutput(
    "Triangulated Review",
    content,
    {
      files,
      goal,
      backendsUsed: successful.map(r => r.backend),
      failedBackends: failed.map(r => r.backend)
    }
  );
}

export const triangulatedReviewWorkflow: WorkflowDefinition = {
  name: "triangulated-review",
  description: "Confronta prospettive multiple (Gemini, Cursor, Droid) per bugfix/refactor di file specifici",
  schema: triangulatedReviewSchema,
  execute: executeTriangulatedReview
};

