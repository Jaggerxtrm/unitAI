import { executeAIClient } from "../utils/aiExecutor.js";
import { createPermissionManager, getDefaultAutonomyLevel } from "../utils/permissionManager.js";
/**
 * Esegue un'analisi AI con un backend specifico
 */
export async function runAIAnalysis(backend, prompt, options = {}, onProgress) {
    try {
        onProgress?.(`Avvio analisi con ${backend}...`);
        const { onProgress: optionProgress, model, ...restOptions } = options;
        const output = await executeAIClient({
            backend,
            prompt,
            ...restOptions,
            onProgress: (msg) => {
                optionProgress?.(msg);
                onProgress?.(`${backend}: ${msg}`);
            }
        });
        return {
            backend,
            model,
            output,
            success: true
        };
    }
    catch (error) {
        return {
            backend,
            model: options.model,
            output: "",
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
/**
 * Esegue analisi parallele con più backend AI
 */
export async function runParallelAnalysis(backends, promptBuilder, onProgress, optionsBuilder) {
    onProgress?.(`Avvio analisi parallela con ${backends.length} backend...`);
    const promises = backends.map(backend => runAIAnalysis(backend, promptBuilder(backend), optionsBuilder ? optionsBuilder(backend) || {} : {}, onProgress));
    const results = await Promise.all(promises);
    // Sintesi dei risultati
    const synthesis = synthesizeResults(results);
    return {
        results,
        synthesis
    };
}
/**
 * Sintetizza i risultati di analisi multiple
 */
export function synthesizeResults(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    let synthesis = "# Analisi Combinata\n\n";
    // Aggiungi risultati riusciti
    if (successful.length > 0) {
        synthesis += "## Risultati delle Analisi\n\n";
        successful.forEach(result => {
            synthesis += `### ${result.backend}${result.model ? ` (${result.model})` : ""}\n\n`;
            synthesis += `${result.output}\n\n`;
        });
    }
    // Aggiungi errori se presenti
    if (failed.length > 0) {
        synthesis += "## Errori Rilevati\n\n";
        failed.forEach(result => {
            synthesis += `### ${result.backend}${result.model ? ` (${result.model})` : ""}\n\n`;
            synthesis += `**Errore:** ${result.error}\n\n`;
        });
    }
    return synthesis;
}
/**
 * Costruisce un prompt per l'analisi del codice in base al focus
 */
export function buildCodeReviewPrompt(files, focus = "all") {
    let focusInstructions = "";
    switch (focus) {
        case "architecture":
            focusInstructions = `
Concentrati sull'architettura del codice:
- Struttura e organizzazione del progetto
- Pattern di design utilizzati
- Separazione delle responsabilità
- Accoppiamento e coesione
- Scalabilità e manutenibilità
`;
            break;
        case "security":
            focusInstructions = `
Concentrati sulla sicurezza del codice:
- Vulnerabilità comuni (SQL injection, XSS, CSRF)
- Gestione dell'autenticazione e autorizzazione
- Validazione degli input
- Gestione dei dati sensibili
- Configurazioni di sicurezza
`;
            break;
        case "performance":
            focusInstructions = `
Concentrati sulle prestazioni del codice:
- Efficienza degli algoritmi
- Utilizzo della memoria
- Complessità computazionale
- Ottimizzazioni possibili
- Colli di bottiglia
`;
            break;
        case "quality":
            focusInstructions = `
Concentrati sulla qualità del codice:
- Leggibilità e manutenibilità
- Copertura dei test
- Gestione degli errori
- Documentazione
- Best practices del linguaggio
`;
            break;
        case "all":
        default:
            focusInstructions = `
Analisi completa del codice includendo:
- Architettura e design
- Sicurezza
- Prestazioni
- Qualità e manutenibilità
- Best practices
`;
            break;
    }
    return `
Analizza i seguenti file: ${files.join(", ")}

${focusInstructions}

Fornisci un'analisi dettagliata con:
1. Punti di forza identificati
2. Problemi o aree di miglioramento
3. Raccomandazioni specifiche
4. Priorità dei problemi (se applicabile)

Sii specifico e fornisci esempi concreti quando possibile.
`;
}
/**
 * Costruisce un prompt per la caccia ai bug
 */
export function buildBugHuntPrompt(symptoms, suspectedFiles) {
    let filesSection = "";
    if (suspectedFiles && suspectedFiles.length > 0) {
        filesSection = `
File sospetti da analizzare:
${suspectedFiles.map(f => `- ${f}`).join("\n")}
`;
    }
    return `
Sintomi del problema: ${symptoms}

${filesSection}

Analizza il problema seguendo questo approccio:
1. Identifica le possibili cause radice
2. Cerca pattern comuni di bug correlati
3. Suggerisci un piano di debug
4. Proponi soluzioni specifiche
5. Indica come prevenire problemi simili in futuro

Fai attenzione a:
- Race conditions
- Errori di gestione null/undefined
- Problemi asincroni
- Memory leak
- Errori di logica
`;
}
/**
 * Formatta l'output per la visualizzazione
 */
export function formatWorkflowOutput(title, content, metadata) {
    let output = `# ${title}\n\n`;
    if (metadata) {
        output += "## Metadati\n\n";
        Object.entries(metadata).forEach(([key, value]) => {
            output += `- **${key}**: ${value}\n`;
        });
        output += "\n";
    }
    output += content;
    return output;
}
/**
 * Estrae il nome del file da un path completo
 */
export function extractFileName(filePath) {
    return filePath.split("/").pop() || filePath;
}
/**
 * Verifica se un file è di un certo tipo
 */
export function isFileType(filePath, extensions) {
    const ext = filePath.split(".").pop()?.toLowerCase();
    return ext ? extensions.includes(ext) : false;
}
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
export function createWorkflowPermissionManager(params) {
    const level = params.autonomyLevel || getDefaultAutonomyLevel();
    return createPermissionManager(level);
}
// ============================================================================
// Agent Integration Helpers
// ============================================================================
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
export function createAgentConfig(params, onProgress) {
    const level = params.autonomyLevel || getDefaultAutonomyLevel();
    return {
        autonomyLevel: level,
        onProgress,
        timeout: 300000 // 5 minutes default timeout
    };
}
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
export function formatAgentResults(result, agentName) {
    let output = `# ${agentName} Results\n\n`;
    // Status badge
    const statusBadge = result.success ? "✅ SUCCESS" : "❌ FAILED";
    output += `**Status:** ${statusBadge}\n\n`;
    // Metadata
    if (result.metadata) {
        output += "## Metadata\n\n";
        output += `- **Backend:** ${result.metadata.backend}\n`;
        output += `- **Execution Time:** ${result.metadata.executionTime}ms\n`;
        output += `- **Autonomy Level:** ${result.metadata.autonomyLevel}\n`;
        // Add any additional metadata
        Object.entries(result.metadata).forEach(([key, value]) => {
            if (!["backend", "executionTime", "autonomyLevel"].includes(key)) {
                output += `- **${key}:** ${JSON.stringify(value)}\n`;
            }
        });
        output += "\n";
    }
    // Error handling
    if (!result.success && result.error) {
        output += "## Error\n\n";
        output += `\`\`\`\n${result.error}\n\`\`\`\n\n`;
    }
    // Output (serialize as JSON for complex types)
    output += "## Output\n\n";
    if (typeof result.output === "string") {
        output += result.output;
    }
    else {
        output += "```json\n";
        output += JSON.stringify(result.output, null, 2);
        output += "\n```\n";
    }
    return output;
}
//# sourceMappingURL=utils.js.map