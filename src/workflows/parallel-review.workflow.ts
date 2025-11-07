import { z } from "zod";
import { BACKENDS } from "../constants.js";
import { runParallelAnalysis, buildCodeReviewPrompt, formatWorkflowOutput } from "./utils.js";
import type { 
  WorkflowDefinition, 
  ProgressCallback, 
  ParallelReviewParams,
  ReviewFocus 
} from "./types.js";

/**
 * Schema Zod per il workflow parallel-review
 */
const parallelReviewSchema = z.object({
  files: z.array(z.string()).describe("File da analizzare"),
  focus: z.enum(["architecture", "security", "performance", "quality", "all"])
    .optional().default("all").describe("Area di focus dell'analisi")
});

/**
 * Esegue il workflow di revisione parallela
 */
async function executeParallelReview(
  params: z.infer<typeof parallelReviewSchema>,
  onProgress?: ProgressCallback
): Promise<string> {
  const { files, focus } = params;
  
  onProgress?.(`Avvio revisione parallela di ${files.length} file con focus: ${focus}`);
  
  // Validazione dei file
  if (files.length === 0) {
    throw new Error("È necessario specificare almeno un file da analizzare");
  }
  
  // Preparazione dei prompt per ogni backend
  const promptBuilder = (backend: string): string => {
    const basePrompt = buildCodeReviewPrompt(files, focus as ReviewFocus);
    
    // Personalizzazione per backend specifici
    switch (backend) {
      case BACKENDS.GEMINI:
        return `${basePrompt}

Come Gemini, fornisci un'analisi approfondita con particolare attenzione a:
- Architettura e design patterns
- Impatto a lungo termine delle modifiche
- Considerazioni sulla scalabilità
- Best practices di ingegneria del software
`;
        
      case BACKENDS.ROVODEV:
        return `${basePrompt}

Come Rovodev, fornisci un'analisi pratica con focus su:
- Code quality e leggibilità
- Problemi potenziali e bug
- Suggerimenti di refactoring
- Best practices di sviluppo
`;
        
      default:
        return basePrompt;
    }
  };
  
  // Esecuzione dell'analisi parallela
  onProgress?.("Avvio analisi parallela con Gemini e Rovodev...");
  const analysisResult = await runParallelAnalysis(
    [BACKENDS.GEMINI, BACKENDS.ROVODEV],
    promptBuilder,
    onProgress
  );
  
  // Analisi dei risultati
  const successful = analysisResult.results.filter(r => r.success);
  const failed = analysisResult.results.filter(r => !r.success);
  
  // Preparazione dell'output
  let outputContent = "";
  const metadata: Record<string, any> = {
    filesAnalyzed: files,
    focus,
    backendsUsed: successful.map(r => r.backend),
    failedBackends: failed.map(r => r.backend),
    analysisCount: successful.length,
    timestamp: new Date().toISOString()
  };
  
  // Se abbiamo risultati, usiamo la sintesi già preparata
  if (analysisResult.synthesis) {
    outputContent = analysisResult.synthesis;
  } else {
    outputContent = "# Analisi Parallela del Codice\n\n";
    outputContent += "Nessun risultato disponibile dall'analisi.\n";
  }
  
  // Aggiunta di una sezione di riepilogo
  outputContent += `
## Riepilogo Analisi

- **File analizzati**: ${files.join(", ")}
- **Focus**: ${focus}
- **Backend utilizzati**: ${successful.map(r => r.backend).join(", ") || "Nessuno"}
- **Esito**: ${successful.length > 0 ? "✅ Completata" : "❌ Fallita"}
`;

  // Aggiunta di raccomandazioni combinate se disponibili
  if (successful.length > 0) {
    outputContent += `
## Raccomandazioni Combinate

Basandosi sull'analisi parallela, ecco le raccomandazioni principali:

1. **Priorità Alta**: Presta attenzione ai problemi di sicurezza e performance identificati
2. **Priorità Media**: Considera i suggerimenti di refactoring per migliorare la manutenibilità
3. **Priorità Bassa**: Valuta le raccomandazioni architetturali per il lungo termine

Per dettagli specifici, consulta le analisi individuali sopra.
`;
  }
  
  // Avvisi se alcuni backend sono falliti
  if (failed.length > 0) {
    outputContent += `
## ⚠️ Avvisi

I seguenti backend non hanno completato l'analisi:
${failed.map(f => `- **${f.backend}**: ${f.error}`).join("\n")}

L'analisi potrebbe essere incompleta. Si consiglia di risolvere i problemi e riprovare.
`;
  }
  
  onProgress?.(`Revisione parallela completata: ${successful.length}/${analysisResult.results.length} analisi riuscite`);
  
  return formatWorkflowOutput("Revisione Parallela del Codice", outputContent, metadata);
}

/**
 * Definizione del workflow parallel-review
 */
export const parallelReviewWorkflow: WorkflowDefinition = {
  description: "Esegue un'analisi parallela del codice utilizzando Gemini e Rovodev per fornire una revisione completa e multi-prospettiva",
  schema: parallelReviewSchema,
  execute: executeParallelReview
};
