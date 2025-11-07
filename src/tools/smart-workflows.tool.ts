import { z } from "zod";
import { executeWorkflow, smartWorkflowsSchema } from "../workflows/index.js";
import type { ToolExecuteFunction } from "./registry.js";

/**
 * Esegue il workflow richiesto
 */
const executeSmartWorkflow: ToolExecuteFunction = async (
  args,
  onProgress
): Promise<string> => {
  const { workflow, params = {} } = args;
  
  onProgress?.(`Avvio del workflow: ${workflow}`);
  
  try {
    const result = await executeWorkflow(workflow, params, onProgress);
    onProgress?.(`Workflow ${workflow} completato con successo`);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    onProgress?.(`Errore nel workflow ${workflow}: ${errorMessage}`);
    throw new Error(`Errore nell'esecuzione del workflow ${workflow}: ${errorMessage}`);
  }
};

/**
 * Definizione dello strumento smart-workflows
 */
export const smartWorkflowsTool = {
  name: "smart-workflows",
  description: "Flussi di lavoro intelligenti che orchestrano più backend AI per compiti complessi come revisione parallela del codice, validazione pre-commit e caccia ai bug",
  zodSchema: smartWorkflowsSchema,
  execute: executeSmartWorkflow,
  category: "workflows",
  prompt: {
    name: "smart-workflows",
    description: "Esegui flussi di lavoro intelligenti che combinano più backend AI",
    arguments: [
      {
        name: "workflow",
        description: "Nome del workflow da eseguire",
        required: true
      },
      {
        name: "params",
        description: "Parametri specifici del workflow",
        required: false
      }
    ]
  }
};
