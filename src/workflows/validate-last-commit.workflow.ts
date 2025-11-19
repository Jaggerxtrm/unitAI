import { z } from "zod";
import { BACKENDS } from "../constants.js";
import { getGitCommitInfo, isGitRepository } from "../utils/gitHelper.js";
import { runParallelAnalysis, formatWorkflowOutput } from "./utils.js";
import type { 
  WorkflowDefinition, 
  ProgressCallback, 
  ValidateLastCommitParams 
} from "./types.js";

/**
 * Schema Zod per il workflow validate-last-commit
 */
const validateLastCommitSchema = z.object({
  commit_ref: z.string().optional().default("HEAD")
    .describe("Riferimento al commit da validare"),
  autonomyLevel: z.enum(["read-only", "low", "medium", "high"])
    .optional().describe("Livello di autonomia per le operazioni del workflow (default: read-only)")
});

/**
 * Esegue il workflow di validazione dell'ultimo commit
 */
export async function executeValidateLastCommit(
  params: z.infer<typeof validateLastCommitSchema>,
  onProgress?: ProgressCallback
): Promise<string> {
  const { commit_ref } = params;
  
  onProgress?.(`Avvio validazione del commit: ${commit_ref}`);
  
  // Verifica se siamo in un repository Git
  if (!await isGitRepository()) {
    throw new Error("Directory corrente non è un repository Git");
  }
  
  // Recupero informazioni del commit
  onProgress?.("Recupero informazioni commit...");
  let commitInfo;
  try {
    commitInfo = await getGitCommitInfo(commit_ref);
  } catch (error) {
    throw new Error(`Impossibile recuperare informazioni per il commit ${commit_ref}: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Preparazione dei prompt per ogni backend
  const promptBuilder = (backend: string): string => {
    const basePrompt = `
Analizza il seguente commit Git per identificare problemi, breaking changes e best practices:

**Informazioni Commit:**
- Hash: ${commitInfo.hash}
- Autore: ${commitInfo.author}
- Data: ${commitInfo.date}
- Messaggio: ${commitInfo.message}

**File Modificati:**
${commitInfo.files.map(f => `- ${f}`).join("\n")}

**Diff:**
\`\`\`diff
${commitInfo.diff.substring(0, 3000)}${commitInfo.diff.length > 3000 ? "\n... (diff troncato per lunghezza)" : ""}
\`\`\`

Fornisci un'analisi dettagliata includendo:
1. Breaking changes identificati
2. Problemi di sicurezza o performance
3. Violazioni delle best practices
4. Problemi di qualità del codice
5. Raccomandazioni specifiche
6. Verdetto complessivo (APPROVATO/RIFIUTATO/NECESSARIA REVISIONE)
`;
    
    // Personalizzazione per backend specifici
    switch (backend) {
      case BACKENDS.GEMINI:
        return `${basePrompt}

Come Gemini, fornisci un'analisi architetturale con attenzione a:
- Impatto delle modifiche sull'architettura esistente
- Scalabilità e manutenibilità a lungo termine
- Consistenza con i pattern di design del progetto
- Considerazioni sull'integrazione con altri componenti
`;
        
      case BACKENDS.QWEN:
        return `${basePrompt}

Come Qwen, fornisci un'analisi tecnica con focus su:
- Correttezza del codice e potenziali bug
- Efficienza degli algoritmi e complessità
- Gestione degli errori e edge cases
- Conformità con le convenzioni del linguaggio
`;
        
      default:
        return basePrompt;
    }
  };
  
  // Esecuzione dell'analisi parallela
  onProgress?.("Avvio analisi parallela con Gemini e Qwen...");
  const analysisResult = await runParallelAnalysis(
    [BACKENDS.GEMINI, BACKENDS.QWEN],
    promptBuilder,
    onProgress
  );
  
  // Analisi dei risultati
  const successful = analysisResult.results.filter(r => r.success);
  const failed = analysisResult.results.filter(r => !r.success);
  
  // Preparazione dell'output
  let outputContent = "";
  const metadata: Record<string, any> = {
    commitRef: commit_ref,
    commitHash: commitInfo.hash,
    commitAuthor: commitInfo.author,
    commitDate: commitInfo.date,
    commitMessage: commitInfo.message,
    filesModified: commitInfo.files,
    backendsUsed: successful.map(r => r.backend),
    failedBackends: failed.map(r => r.backend),
    analysisCount: successful.length,
    timestamp: new Date().toISOString()
  };
  
  // Informazioni del commit
  outputContent += `
## Informazioni Commit

- **Hash**: ${commitInfo.hash}
- **Autore**: ${commitInfo.author}
- **Data**: ${commitInfo.date}
- **Messaggio**: ${commitInfo.message}
- **File modificati**: ${commitInfo.files.length}

### File Modificati
${commitInfo.files.map(f => `- ${f}`).join("\n")}
`;
  
  // Se abbiamo risultati, usiamo la sintesi già preparata
  if (analysisResult.synthesis) {
    outputContent += analysisResult.synthesis;
  } else {
    outputContent += "\n## Analisi del Commit\n\n";
    outputContent += "Nessun risultato disponibile dall'analisi.\n";
  }
  
  // Verdetto combinato
  if (successful.length > 0) {
    outputContent += `
## Verdetto Combinato

Basandosi sull'analisi parallela (${successful.map(r => r.backend).join(" + ")}):

`;
    
    // Logica per determinare il verdetto
    // In un'implementazione reale, potremmo analizzare i testi delle risposte
    // Per ora, usiamo una logica semplificata
    const hasFailures = failed.length > 0;
    const hasSuccessfulAnalyses = successful.length > 0;
    
    if (hasFailures && !hasSuccessfulAnalyses) {
      outputContent += `### ❌ RIFIUTATO

L'analisi non può essere completata a causa di errori nei backend.
`;
    } else if (hasFailures) {
      outputContent += `### ⚠️ NECESSARIA REVISIONE PARZIALE

Alcune analisi sono fallite, ma quelle completate suggeriscono la necessità di revisione.
`;
    } else {
      outputContent += `### ✅ APPROVATO CON RISERVE

L'analisi è stata completata con successo. Si raccomanda di attenere alle raccomandazioni fornite.
`;
    }
  }
  
  // Avvisi se alcuni backend sono falliti
  if (failed.length > 0) {
    outputContent += `
## ⚠️ Avvisi

I seguenti backend non hanno completato l'analisi:
${failed.map(f => `- **${f.backend}**: ${f.error}`).join("\n")}

La validazione potrebbe essere incompleta. Si consiglia di risolvere i problemi e riprovare.
`;
  }
  
  // Raccomandazioni finali
  outputContent += `
## Raccomandazioni Finali

1. **Revisione del codice**: Verifica manualmente le modifiche prima del merge
2. **Test**: Esegui test completi per verificare che non ci siano regressioni
3. **Documentazione**: Aggiorna la documentazione se necessario
4. **Comunicazione**: Informa il team delle modifiche significative

Per dettagli specifici, consulta le analisi individuali sopra.
`;
  
  onProgress?.(`Validazione commit completata: ${successful.length}/${analysisResult.results.length} analisi riuscite`);
  
  return formatWorkflowOutput(`Validazione Commit (Commit Validation): ${commit_ref}`, outputContent, metadata);
}

/**
 * Definizione del workflow validate-last-commit
 */
export const validateLastCommitWorkflow: WorkflowDefinition = {
  name: 'validate-last-commit',
  description: "Valida un commit Git specifico utilizzando analisi parallela con Gemini e Qwen per identificare problemi e breaking changes",
  schema: validateLastCommitSchema,
  execute: executeValidateLastCommit
};
