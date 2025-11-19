import { z } from "zod";
import type { WorkflowDefinition, ProgressCallback } from "./types.js";
import { formatWorkflowOutput } from "./utils.js";
import { executeAIClient } from "../utils/aiExecutor.js";
import { BACKENDS } from "../constants.js";

const autoRemediationSchema = z.object({
  symptoms: z.string().min(1, "Descrivere i sintomi del problema"),
  maxActions: z.number().int().min(1).max(10).optional().default(5),
  autonomyLevel: z.enum(["read-only", "low", "medium", "high"]).optional(),
  attachments: z.array(z.string()).optional()
});

export type AutoRemediationParams = z.infer<typeof autoRemediationSchema>;

export async function executeAutoRemediation(
  params: AutoRemediationParams,
  onProgress?: ProgressCallback
): Promise<string> {
  const { symptoms, maxActions, attachments = [] } = params;

  onProgress?.("🛠️ Generazione piano di auto-remediation con Droid...");

  let plan = "";
  try {
    plan = await executeAIClient({
      backend: BACKENDS.DROID,
      prompt: `Sintomi: ${symptoms}

Genera un piano operativo in massimo ${maxActions} step.
Per ogni step fornisci:
- Azione proposta
- Output atteso
- Controlli/verifiche
- Rischi residui`,
      auto: "medium",
      attachments,
      outputFormat: "text"
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    plan = `Impossibile generare piano di remediation: ${errorMsg}`;
  }

  const content = `
## Symptoms
${symptoms}

---

## Autonomous Remediation Plan
${plan}
`;

  return formatWorkflowOutput(
    "Auto Remediation Plan",
    content,
    {
      maxActions,
      attachments
    }
  );
}

export const autoRemediationWorkflow: WorkflowDefinition = {
  name: "auto-remediation",
  description: "Genera un piano di remediation automatico tramite Factory Droid",
  schema: autoRemediationSchema,
  execute: executeAutoRemediation
};

