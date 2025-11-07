import { executeAIClient } from "../utils/aiExecutor.js";
import { BACKENDS } from "../constants.js";
import type { 
  ProgressCallback, 
  AIAnalysisResult, 
  ParallelAnalysisResult, 
  ReviewFocus 
} from "./types.js";

/**
 * Esegue un'analisi AI con un backend specifico
 */
export async function runAIAnalysis(
  backend: string,
  prompt: string,
  model?: string,
  onProgress?: ProgressCallback
): Promise<AIAnalysisResult> {
  try {
    onProgress?.(`Avvio analisi con ${backend}...`);
    
    const output = await executeAIClient({
      backend,
      prompt,
      model,
      onProgress: (msg) => onProgress?.(`${backend}: ${msg}`)
    });
    
    return {
      backend,
      model,
      output,
      success: true
    };
  } catch (error) {
    return {
      backend,
      model,
      output: "",
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Esegue analisi parallele con più backend AI
 */
export async function runParallelAnalysis(
  backends: string[],
  promptBuilder: (backend: string) => string,
  onProgress?: ProgressCallback
): Promise<ParallelAnalysisResult> {
  onProgress?.(`Avvio analisi parallela con ${backends.length} backend...`);
  
  const promises = backends.map(backend => 
    runAIAnalysis(backend, promptBuilder(backend), undefined, onProgress)
  );
  
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
export function synthesizeResults(results: AIAnalysisResult[]): string {
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
export function buildCodeReviewPrompt(
  files: string[],
  focus: ReviewFocus = "all"
): string {
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
export function buildBugHuntPrompt(
  symptoms: string,
  suspectedFiles?: string[]
): string {
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
export function formatWorkflowOutput(
  title: string,
  content: string,
  metadata?: Record<string, any>
): string {
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
export function extractFileName(filePath: string): string {
  return filePath.split("/").pop() || filePath;
}

/**
 * Verifica se un file è di un certo tipo
 */
export function isFileType(filePath: string, extensions: string[]): boolean {
  const ext = filePath.split(".").pop()?.toLowerCase();
  return ext ? extensions.includes(ext) : false;
}
