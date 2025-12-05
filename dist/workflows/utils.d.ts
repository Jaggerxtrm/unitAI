import { type PermissionManager } from "../utils/permissionManager.js";
import type { ProgressCallback, AIAnalysisResult, ParallelAnalysisResult, ReviewFocus, BaseWorkflowParams } from "./types.js";
import type { AIExecutionOptions } from "../utils/aiExecutor.js";
/**
 * Esegue un'analisi AI con un backend specifico
 */
export declare function runAIAnalysis(backend: string, prompt: string, options?: Partial<Omit<AIExecutionOptions, "backend" | "prompt">>, onProgress?: ProgressCallback): Promise<AIAnalysisResult>;
/**
 * Esegue analisi parallele con più backend AI
 */
export declare function runParallelAnalysis(backends: string[], promptBuilder: (backend: string) => string, onProgress?: ProgressCallback, optionsBuilder?: (backend: string) => Partial<Omit<AIExecutionOptions, "backend" | "prompt">>): Promise<ParallelAnalysisResult>;
/**
 * Sintetizza i risultati di analisi multiple
 */
export declare function synthesizeResults(results: AIAnalysisResult[]): string;
/**
 * Costruisce un prompt per l'analisi del codice in base al focus
 */
export declare function buildCodeReviewPrompt(files: string[], focus?: ReviewFocus): string;
/**
 * Costruisce un prompt per la caccia ai bug
 */
export declare function buildBugHuntPrompt(symptoms: string, suspectedFiles?: string[]): string;
/**
 * Formatta l'output per la visualizzazione
 */
export declare function formatWorkflowOutput(title: string, content: string, metadata?: Record<string, any>): string;
/**
 * Estrae il nome del file da un path completo
 */
export declare function extractFileName(filePath: string): string;
/**
 * Verifica se un file è di un certo tipo
 */
export declare function isFileType(filePath: string, extensions: string[]): boolean;
/**
 * Crea un PermissionManager dai parametri del workflow
 *
 * Estrae l'autonomyLevel dai parametri (se presente) e crea un PermissionManager
 * con il livello appropriato. Se non specificato, usa il livello di default (READ_ONLY).
 *
 * @param params - Parametri del workflow che estendono BaseWorkflowParams
 * @returns PermissionManager configurato con il livello di autonomia appropriato
 *
 * @example
 * ```typescript
 * async function myWorkflow(params: MyWorkflowParams) {
 *   const permissions = createWorkflowPermissionManager(params);
 *
 *   // Verifica permessi prima di operazioni rischiose
 *   if (permissions.git.canCommit()) {
 *     // Esegui commit
 *   }
 *
 *   // Oppure assert che lancia errore se non permesso
 *   permissions.git.assertPush("pushing to remote");
 * }
 * ```
 */
export declare function createWorkflowPermissionManager(params: BaseWorkflowParams): PermissionManager;
/**
 * Crea un AgentConfig dai parametri del workflow
 *
 * Converte i parametri di un workflow in una configurazione Agent-compatible,
 * gestendo autonomy level e progress callback.
 *
 * @param params - Parametri del workflow che estendono BaseWorkflowParams
 * @param onProgress - Callback opzionale per report di progresso
 * @returns AgentConfig pronto per l'uso con gli agent
 *
 * @example
 * ```typescript
 * import { AgentFactory } from "../agents/index.js";
 *
 * async function myWorkflow(params: MyWorkflowParams) {
 *   const config = createAgentConfig(params, (msg) => console.log(msg));
 *   const architect = AgentFactory.createArchitect();
 *
 *   const result = await architect.execute({
 *     task: "Analyze system architecture",
 *     files: params.files
 *   }, config);
 * }
 * ```
 */
export declare function createAgentConfig(params: BaseWorkflowParams, onProgress?: ProgressCallback): import("../agents/types.js").AgentConfig;
/**
 * Formatta i risultati di un agent per la visualizzazione
 *
 * Converte l'output strutturato di un agent in un formato leggibile
 * per l'utente, includendo metadata e gestione degli errori.
 *
 * @param result - Risultato dell'esecuzione di un agent
 * @param agentName - Nome dell'agent (per il titolo)
 * @returns Stringa formattata pronta per la visualizzazione
 *
 * @example
 * ```typescript
 * const result = await architect.execute(input, config);
 * const formatted = formatAgentResults(result, "ArchitectAgent");
 * console.log(formatted);
 * ```
 */
export declare function formatAgentResults<T>(result: import("../agents/types.js").AgentResult<T>, agentName: string): string;
//# sourceMappingURL=utils.d.ts.map