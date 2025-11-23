import { z } from "zod";
import type { 
  WorkflowDefinition, 
  ProgressCallback,
  ParallelReviewParams,
  PreCommitValidateParams,
  ValidateLastCommitParams,
  BugHuntParams
} from "./types.js";

// Import delle definizioni dei workflow
import { parallelReviewWorkflow } from "./parallel-review.workflow.js";
import { preCommitValidateWorkflow } from "./pre-commit-validate.workflow.js";
import { initSessionWorkflow } from "./init-session.workflow.js";
import { validateLastCommitWorkflow } from "./validate-last-commit.workflow.js";
import { featureDesignWorkflow } from "./feature-design.workflow.js";
import { bugHuntWorkflow } from "./bug-hunt.workflow.js";
import { triangulatedReviewWorkflow } from "./triangulated-review.workflow.js";
import { autoRemediationWorkflow } from "./auto-remediation.workflow.js";
import { refactorSprintWorkflow } from "./refactor-sprint.workflow.js";

/**
 * Registro di tutti i workflow disponibili
 */
const workflowRegistry: Record<string, WorkflowDefinition> = {};
let workflowsInitialized = false;

function ensureWorkflowsInitialized(): void {
  if (!workflowsInitialized) {
    initializeWorkflowRegistry();
  }
}

/**
 * Registra un workflow nel registro
 */
export function registerWorkflow<TParams>(
  name: string, 
  workflow: WorkflowDefinition<TParams>
): void {
  workflowRegistry[name] = workflow;
}

/**
 * Ottiene un workflow dal registro
 */
export function getWorkflow(name: string): WorkflowDefinition | undefined {
  ensureWorkflowsInitialized();
  return workflowRegistry[name];
}

/**
 * Elenca tutti i workflow disponibili
 */
export function listWorkflows(): string[] {
  ensureWorkflowsInitialized();
  return Object.keys(workflowRegistry);
}

/**
 * Esegue un workflow per nome
 */
export async function executeWorkflow(
  name: string,
  params: any,
  onProgress?: ProgressCallback
): Promise<string> {
  ensureWorkflowsInitialized();
  const workflow = getWorkflow(name);
  if (!workflow) {
    throw new Error(`Workflow non trovato: ${name}`);
  }
  
  try {
    // Validazione dei parametri
    const validatedParams = workflow.schema.parse(params);
    
    // Esecuzione del workflow
    return await workflow.execute(validatedParams, onProgress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorDetails = error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
      throw new Error(`Parametri non validi per il workflow ${name}: ${errorDetails}`);
    }
    throw error;
  }
}

/**
 * Schema Zod per il router dei workflow
 */
export const smartWorkflowsSchema = z.object({
  workflow: z.enum([
    "parallel-review",
    "pre-commit-validate",
    "init-session",
    "validate-last-commit",
    "feature-design",
    "bug-hunt",
    "triangulated-review",
    "auto-remediation",
    "refactor-sprint"
  ]).describe("Workflow da eseguire"),
  params: z.record(z.any()).optional().describe("Parametri specifici del workflow")
});

/**
 * Definizioni degli schemi per ogni workflow
 */
export const workflowSchemas = {
  "parallel-review": z.object({
    files: z.array(z.string()).describe("File da analizzare"),
    focus: z.enum(["architecture", "security", "performance", "quality", "all"])
      .optional().default("all").describe("Area di focus dell'analisi"),
    strategy: z.enum(["standard", "double-check"]).optional().default("standard")
      .describe("Strategia di revisione"),
    backendOverrides: z.array(z.string()).optional()
      .describe("Override manuale dei backend"),
    attachments: z.array(z.string()).optional()
      .describe("File da allegare a Cursor/Droid"),
    writeReport: z.boolean().optional().describe("Parametro legacy (non utilizzato)")
  }),
  
  "pre-commit-validate": z.object({
    depth: z.enum(["quick", "thorough", "paranoid"])
      .optional().default("thorough").describe("Profondità della validazione")
  }),
  
  "init-session": z.object({
    autonomyLevel: z.enum(["read-only", "low", "medium", "high"]).optional(),
    commitCount: z.number().int().min(1).max(50).optional()
  }).describe("Parametri opzionali per init-session"),
  
  "validate-last-commit": z.object({
    commit_ref: z.string().optional().default("HEAD")
      .describe("Riferimento al commit da validare")
  }),

  "feature-design": z.object({
    featureDescription: z.string().describe("Descrizione della feature da implementare"),
    targetFiles: z.array(z.string()).describe("File da creare o modificare"),
    context: z.string().optional().describe("Contesto addizionale sul progetto"),
    architecturalFocus: z.enum(["design", "refactoring", "optimization", "security", "scalability"])
      .optional().default("design").describe("Focus dell'analisi architetturale"),
    implementationApproach: z.enum(["incremental", "full-rewrite", "minimal"])
      .optional().default("incremental").describe("Approccio implementativo"),
    testType: z.enum(["unit", "integration", "e2e"])
      .optional().default("unit").describe("Tipo di test da generare")
  }),

  "bug-hunt": z.object({
    symptoms: z.string().describe("Descrizione dei sintomi del problema"),
    suspected_files: z.array(z.string()).optional()
      .describe("File sospetti da analizzare"),
    attachments: z.array(z.string()).optional()
      .describe("File aggiuntivi da allegare all'analisi (log, dump, ecc.)"),
    backendOverrides: z.array(z.string()).optional()
      .describe("Override manuale dei backend AI"),
    autonomyLevel: z.enum(["LOW", "MEDIUM", "HIGH", "AUTONOMOUS"]).optional()
  }),
  "triangulated-review": z.object({
    files: z.array(z.string()).describe("File da analizzare"),
    goal: z.enum(["bugfix", "refactor"]).optional().default("refactor")
      .describe("Obiettivo principale della revisione"),
    autonomyLevel: z.enum(["read-only", "low", "medium", "high"])
      .optional()
  }),
  "auto-remediation": z.object({
    symptoms: z.string().describe("Descrizione del bug da correggere"),
    maxActions: z.number().int().min(1).max(10).optional()
      .describe("Numero massimo di step nel piano"),
    autonomyLevel: z.enum(["read-only", "low", "medium", "high"]).optional()
  }),
  "refactor-sprint": z.object({
    targetFiles: z.array(z.string()).describe("File da refactorizzare"),
    scope: z.string().describe("Descrizione dello scope"),
    depth: z.enum(["light", "balanced", "deep"]).optional().default("balanced"),
    autonomyLevel: z.enum(["read-only", "low", "medium", "high"]).optional()
  })
};

/**
 * Inizializza il registro dei workflow
 * Questa funzione sarà chiamata dopo l'import di tutti i workflow
 */
export function initializeWorkflowRegistry(): void {
  if (workflowsInitialized) {
    return;
  }
  workflowsInitialized = true;
  // I workflow saranno registrati qui quando implementati
  registerWorkflow("parallel-review", parallelReviewWorkflow);
  registerWorkflow("pre-commit-validate", preCommitValidateWorkflow);
  registerWorkflow("init-session", initSessionWorkflow);
  registerWorkflow("validate-last-commit", validateLastCommitWorkflow);
  registerWorkflow("feature-design", featureDesignWorkflow);
  registerWorkflow("bug-hunt", bugHuntWorkflow);
  registerWorkflow("triangulated-review", triangulatedReviewWorkflow);
  registerWorkflow("auto-remediation", autoRemediationWorkflow);
  registerWorkflow("refactor-sprint", refactorSprintWorkflow);

  // Removed console.log - corrupts MCP JSON protocol
  // Use logger.debug() if logging needed
}

/**
 * Ottiene lo schema Zod per un workflow specifico
 */
export function getWorkflowSchema(workflowName: string): z.ZodSchema | undefined {
  ensureWorkflowsInitialized();
  return workflowSchemas[workflowName as keyof typeof workflowSchemas];
}
