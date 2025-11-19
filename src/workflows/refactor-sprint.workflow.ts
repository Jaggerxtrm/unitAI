import { z } from "zod";
import type { WorkflowDefinition, ProgressCallback } from "./types.js";
import { formatWorkflowOutput } from "./utils.js";
import { executeAIClient } from "../utils/aiExecutor.js";
import { BACKENDS } from "../constants.js";

const refactorSprintSchema = z.object({
  targetFiles: z.array(z.string()).min(1, "Indicare almeno un file"),
  scope: z.string().min(1, "Descrivere lo scopo del refactor"),
  depth: z.enum(["light", "balanced", "deep"]).optional().default("balanced"),
  autonomyLevel: z.enum(["read-only", "low", "medium", "high"]).optional(),
  attachments: z.array(z.string()).optional()
});

export type RefactorSprintParams = z.infer<typeof refactorSprintSchema>;

export async function executeRefactorSprint(
  params: RefactorSprintParams,
  onProgress?: ProgressCallback
): Promise<string> {
  const { targetFiles, scope, depth, attachments = [] } = params;

  onProgress?.(`⚙️ Refactor sprint avviato (${depth}) su ${targetFiles.length} file`);

  let cursorPlan = "";
  try {
    cursorPlan = await executeAIClient({
      backend: BACKENDS.CURSOR,
      prompt: `Stai pianificando un refactor (${depth}). Scopo: ${scope}.

File interessati:
${targetFiles.join("\n")}

Genera:
- Piano in step numerati
- Patch suggerite (anche descrittive)
- Test consigliati`,
      attachments: attachments.length ? attachments : targetFiles.slice(0, 5),
      projectRoot: process.cwd(),
      outputFormat: "text"
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    cursorPlan = `Impossibile ottenere il piano da Cursor Agent: ${errorMsg}`;
  }

  let geminiReview = "";
  try {
    geminiReview = await executeAIClient({
      backend: BACKENDS.GEMINI,
      prompt: `Valuta il seguente piano di refactor per ${scope} e segnala rischi architetturali.

File target:
${targetFiles.join(", ")}

Piano:
${cursorPlan}`
    });
  } catch (error) {
    geminiReview = `Impossibile ottenere validazione da Gemini: ${error instanceof Error ? error.message : String(error)}`;
  }

  let droidChecklist = "";
  try {
    droidChecklist = await executeAIClient({
      backend: BACKENDS.DROID,
      prompt: `Trasforma questo piano di refactoring in una checklist operativa pronta all'esecuzione.

Scope: ${scope}
Depth: ${depth}

Piano di riferimento:
${cursorPlan}

Checklist richiesta:
- Step dettagliati
- Comandi/strumenti suggeriti
- Criteri di completamento`,
      auto: depth === "deep" ? "medium" : "low",
      outputFormat: "text"
    });
  } catch (error) {
    droidChecklist = `Impossibile generare checklist da Droid: ${error instanceof Error ? error.message : String(error)}`;
  }

  const content = `
## Cursor Agent Plan
${cursorPlan}

---

## Gemini Architectural Review
${geminiReview}

---

## Droid Operational Checklist
${droidChecklist}
`;

  return formatWorkflowOutput(
    "Refactor Sprint",
    content,
    {
      targetFiles,
      scope,
      depth
    }
  );
}

export const refactorSprintWorkflow: WorkflowDefinition = {
  name: "refactor-sprint",
  description: "Coordina Cursor, Gemini e Droid per pianificare un refactor multi-step",
  schema: refactorSprintSchema,
  execute: executeRefactorSprint
};

