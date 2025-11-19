import { z } from "zod";
import { getGitRepoInfo, getGitDiff, getDetailedGitStatus, getGitBranches, checkCLIAvailability, isGitRepository, getRecentCommitsWithDiffs, getDateRangeFromCommits } from "../utils/gitHelper.js";
import { formatWorkflowOutput } from "./utils.js";
import { executeAIClient } from "../utils/aiExecutor.js";
import { BACKENDS } from "../constants.js";
import type { WorkflowDefinition, ProgressCallback, GitCommitInfo } from "./types.js";

/**
 * Schema Zod per il workflow init-session
 */
const initSessionSchema = z.object({
  autonomyLevel: z.enum(["read-only", "low", "medium", "high"])
    .optional()
    .describe("Livello di autonomia per le operazioni del workflow (default: read-only)"),
  commitCount: z.number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe("Numero massimo di commit recenti da analizzare (default: 10)")
});

/**
 * Genera query semantiche per la ricerca nelle memorie basate sull'analisi AI
 */
function generateMemorySearchQueries(aiAnalysis: string): string[] {
  const queries: string[] = [];

  // Estrai concetti chiave dall'analisi
  // Cerca pattern comuni nell'analisi

  // Query 1: Feature/workflow changes
  if (aiAnalysis.toLowerCase().includes('workflow') || aiAnalysis.toLowerCase().includes('feature')) {
    queries.push('workflows implementation features architecture');
  }

  // Query 2: Bug fixes e miglioramenti
  if (aiAnalysis.toLowerCase().includes('bug') || aiAnalysis.toLowerCase().includes('fix')) {
    queries.push('bug fixes improvements optimization');
  }

  // Query 3: AI/backend integration
  if (aiAnalysis.toLowerCase().includes('gemini') || aiAnalysis.toLowerCase().includes('qwen') || aiAnalysis.toLowerCase().includes('rovodev')) {
    queries.push('AI analysis Gemini Qwen Rovodev parallel backends');
  }

  // Query 4: Architecture e refactoring
  if (aiAnalysis.toLowerCase().includes('refactor') || aiAnalysis.toLowerCase().includes('architecture')) {
    queries.push('refactoring architecture code organization');
  }

  // Query 5: Token optimization
  if (aiAnalysis.toLowerCase().includes('token') || aiAnalysis.toLowerCase().includes('optimization')) {
    queries.push('token optimization performance efficiency');
  }

  // Limita a 3 query più rilevanti
  return queries.slice(0, 3);
}

/**
 * Costruisce il prompt per l'analisi AI dei commit
 */
function buildCommitAnalysisPrompt(commits: GitCommitInfo[]): string {
  let prompt = `Analyze the following ${commits.length} recent commits and provide a concise summary of the work done.

Focus on:
1. **Feature changes**: What new features or functionality was added
2. **Bug fixes**: What bugs were fixed and their root causes
3. **Refactoring/architecture**: Structural changes, code organization improvements
4. **Current work status**: What's in progress, what's completed, what might be next

Format your response as a clear, actionable summary that points to specific files and changes.

---

# Commits to Analyze

`;

  commits.forEach((commit, index) => {
    prompt += `
## Commit ${index + 1}: ${commit.message}
- **Author**: ${commit.author}
- **Date**: ${commit.date}
- **Hash**: ${commit.hash.substring(0, 8)}
- **Files**: ${commit.files.join(", ")}

### Diff (truncated to first 3000 chars):
\`\`\`diff
${commit.diff.substring(0, 3000)}${commit.diff.length > 3000 ? "\n... (diff truncated)" : ""}
\`\`\`

---
`;
  });

  prompt += `
Please provide a synthesized analysis of these commits.`;

  return prompt;
}

/**
 * Esegue il workflow di inizializzazione sessione
 */
export async function executeInitSession(
  params: z.infer<typeof initSessionSchema>,
  onProgress?: ProgressCallback
): Promise<string> {
  const { autonomyLevel, commitCount } = initSessionSchema.parse(params);
  onProgress?.("Avvio inizializzazione sessione... (Starting session initialization...)");

  const sections: string[] = [];
  const metadata: Record<string, any> = {};

  // Verifica se siamo in un repository Git
  const isRepo = await isGitRepository();
  metadata.isGitRepository = isRepo;

  if (isRepo) {
    onProgress?.("Recupero informazioni repository Git...");

    try {
      // Informazioni base del repository
      const repoInfo = await getGitRepoInfo();
      sections.push(`
## Informazioni Repository

- **Branch corrente**: ${repoInfo.currentBranch}
- **File staged**: ${repoInfo.stagedFiles.length}
- **File modificati**: ${repoInfo.modifiedFiles.length}
`);

      // Ottieni gli ultimi 10 commits con diffs completi
      const commitsToAnalyze = commitCount ?? 10;
      onProgress?.(`Recupero ultimi ${commitsToAnalyze} commits con diffs...`);
      const recentCommits = await getRecentCommitsWithDiffs(commitsToAnalyze);
      metadata.commitsAnalyzed = recentCommits.length;

      // Commit recenti (sommario)
      sections.push(`
## Commit Recenti (ultimi 10)

${recentCommits.map((commit, i) => `${i + 1}. [${commit.hash.substring(0, 8)}] ${commit.message} - ${commit.author}`).join("\n")}
`);

      // Analisi AI con fallback tra più backend
      const analysisPrompt = buildCommitAnalysisPrompt(recentCommits);
      const analysisBackends = [BACKENDS.ROVODEV, BACKENDS.GEMINI];
      let aiAnalysis = "";
      let lastAnalysisError: string | undefined;

      for (const backend of analysisBackends) {
        onProgress?.(`Analisi AI dei commit con ${backend}...`);
        try {
          aiAnalysis = await executeAIClient({
            backend,
            prompt: analysisPrompt
          });
          metadata.aiAnalysisCompleted = true;
          metadata.aiAnalysisBackend = backend;
          break;
        } catch (error) {
          lastAnalysisError = error instanceof Error ? error.message : String(error);
          onProgress?.(`Analisi con ${backend} fallita: ${lastAnalysisError}`);
        }
      }

      if (aiAnalysis) {
        sections.push(`
## AI Analysis of Recent Work

${aiAnalysis}
`);
      } else {
        sections.push(`
## AI Analysis

⚠️ Could not complete AI analysis${lastAnalysisError ? `: ${lastAnalysisError}` : ""}
`);
        metadata.aiAnalysisCompleted = false;
      }

      // Genera query semantiche per la ricerca nelle memorie
      onProgress?.("Generazione query semantiche per memorie...");
      if (aiAnalysis) {
        const memoryQueries = generateMemorySearchQueries(aiAnalysis);

        if (memoryQueries.length > 0) {
          metadata.memoryQueriesGenerated = memoryQueries.length;

          sections.push(`
## Relevant Memories - Suggested Searches

Based on the AI analysis of recent work, try these semantic memory searches:

${memoryQueries.map((query, i) => `${i + 1}. \`mcp__openmemory__search-memories "${query}"\``).join('\n')}

*These queries target key concepts from your recent commits for better semantic matching.*
`);
        }
      } else {
        // Fallback se l'analisi AI non è disponibile
        const dateRange = getDateRangeFromCommits(recentCommits);
        if (dateRange) {
          sections.push(`
## Relevant Memories

📅 Commit date range: ${dateRange.oldest} to ${dateRange.newest}

*AI analysis unavailable. Search memories manually based on specific topics from commits above.*
`);
        }
      }

      // Status dettagliato
      onProgress?.("Recupero stato repository...");
      const status = await getDetailedGitStatus();
      sections.push(`
## Stato Repository

\`\`\`
${status}
\`\`\`
`);

      // Informazioni sui branch
      onProgress?.("Recupero informazioni branch...");
      const branches = await getGitBranches();
      sections.push(`
## Branch

\`\`\`
${branches}
\`\`\`
`);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      sections.push(`
## Errore nel recupero informazioni Git

${errorMsg}
`);
    }
  } else {
    sections.push(`
## Repository Git

La directory corrente non è un repository Git.
`);
  }
  
  // Verifica disponibilità CLI
  onProgress?.("Verifica disponibilità CLI...");
  try {
    const cliAvailability = await checkCLIAvailability();
    metadata.cliAvailability = cliAvailability;
    
    sections.push(`
## Disponibilità CLI

- **Qwen**: ${cliAvailability.qwen ? "✅ Disponibile" : "❌ Non disponibile"}
- **Gemini**: ${cliAvailability.gemini ? "✅ Disponibile" : "❌ Non disponibile"}
- **ACLI**: ${cliAvailability.acli ? "✅ Disponibile" : "❌ Non disponibile"}
`);
    
    // Avvisi se qualche CLI non è disponibile
    const unavailable = Object.entries(cliAvailability)
      .filter(([_, available]) => !available)
      .map(([name]) => name);
    
    if (unavailable.length > 0) {
      sections.push(`
### ⚠️ Avviso

Le seguenti CLI non sono disponibili: ${unavailable.join(", ")}
Alcuni workflow potrebbero non funzionare correttamente.
`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    sections.push(`
## Errore nella verifica CLI

${errorMsg}
`);
  }
  
  // Informazioni sulla sessione
  const now = new Date();
  metadata.sessionStartTime = now.toISOString();
  metadata.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  sections.push(`
## Informazioni Sessione

- **Data e ora**: ${now.toLocaleString()}
- **Timezone**: ${metadata.timezone}
- **Directory di lavoro**: ${process.cwd()}
`);
  
  onProgress?.("Sessione inizializzata con successo");
  
  return formatWorkflowOutput("Report Inizializzazione Sessione (Session Initialization Report)", sections.join("\n"), metadata);
}

/**
 * Definizione del workflow init-session
 */
export const initSessionWorkflow: WorkflowDefinition = {
  name: 'init-session',
  description: "Inizializza la sessione corrente analizzando il repository Git e verificando la disponibilità delle CLI",
  schema: initSessionSchema,
  execute: executeInitSession
};
