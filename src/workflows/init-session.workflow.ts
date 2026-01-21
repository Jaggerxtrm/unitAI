import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { getGitRepoInfo, getGitDiff, getDetailedGitStatus, getGitBranches, checkCLIAvailability, isGitRepository, getRecentCommitsWithDiffs, getDateRangeFromCommits } from "../utils/gitHelper.js";
import { formatWorkflowOutput } from "./utils.js";
import { executeAIClient } from "../utils/aiExecutor.js";
import { BACKENDS, AI_MODELS } from "../constants.js";
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
 * Estrae keywords significative dai messaggi di commit
 */
function extractKeywordsFromCommits(commits: GitCommitInfo[]): string[] {
  const keywords = new Set<string>();
  const stopWords = ['add', 'fix', 'update', 'refactor', 'improve', 'remove', 'delete', 'change', 'modify', 'create', 'implement', 'the', 'and', 'or', 'for', 'with', 'from', 'to', 'in', 'on', 'at'];

  commits.forEach(commit => {
    // Estrai parole dal messaggio di commit
    const words = commit.message
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));

    words.forEach(word => keywords.add(word));

    // Estrai anche dai nomi dei file modificati
    commit.files.forEach(file => {
      const baseName = path.basename(file, path.extname(file));
      const fileWords = baseName
        .split(/[-_.]/)
        .filter(word => word.length > 3 && !stopWords.includes(word.toLowerCase()));

      fileWords.forEach(word => keywords.add(word.toLowerCase()));
    });
  });

  return Array.from(keywords);
}

/**
 * Estrae il titolo da un file markdown (prima riga non vuota o primo heading)
 */
function extractTitleFromContent(content: string): string {
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Se è un heading markdown, rimuovi il marcatore
    if (trimmed.startsWith('#')) {
      return trimmed.replace(/^#+\s*/, '').substring(0, 80);
    }

    // Altrimenti usa la prima riga non vuota
    return trimmed.substring(0, 80);
  }

  return 'No title found';
}

/**
 * Recursively finds all markdown files in a directory
 */
function findMarkdownFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;

  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        // Skip hidden folders and node_modules
        if (file.name !== 'node_modules' && !file.name.startsWith('.')) {
          findMarkdownFiles(filePath, fileList);
        }
      } else if (file.name.endsWith('.md')) {
        // Get relative path for cleaner display
        fileList.push(filePath);
      }
    }
  } catch (error) {
    // Ignore access errors
    console.error(`Error reading directory ${dir}:`, error);
  }
  return fileList;
}

/**
 * Searches for relevant documentation in .serena/memories and docs/
 * basandosi sui commit recenti
 */
function searchRelatedDocumentation(commits: GitCommitInfo[]): string[] {
  const results: string[] = [];
  const projectRoot = process.cwd();

  // Directories to search
  const searchDirs = [
    path.join(projectRoot, '.serena', 'memories'),
    path.join(projectRoot, 'docs')
  ];

  // 1. Extract keywords from commits
  const keywords = extractKeywordsFromCommits(commits);
  if (keywords.length === 0) return results;

  // 2. Gather all markdown files
  const markdownFiles: string[] = [];
  searchDirs.forEach(dir => findMarkdownFiles(dir, markdownFiles));

  if (markdownFiles.length === 0) return results;

  // 3. Search for keywords in files
  for (const filePath of markdownFiles) {
    let content: string;

    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      continue;
    }

    // Cerca corrispondenze di keywords nel content
    const matches = keywords.filter(kw =>
      content.toLowerCase().includes(kw.toLowerCase())
    );

    if (matches.length > 0) {
      const title = extractTitleFromContent(content);
      // Get relative path for display
      const relPath = path.relative(projectRoot, filePath);

      results.push(`- **${relPath}**: ${title} (matches: ${matches.slice(0, 5).join(', ')}${matches.length > 5 ? ', ...' : ''})`);
    }
  }

  // Ordina per numero di matches (decrescente)
  return results.sort((a, b) => {
    const matchesA = (a.match(/matches:/)?.[0] || '').split(',').length;
    const matchesB = (b.match(/matches:/)?.[0] || '').split(',').length;
    return matchesB - matchesA;
  });
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
      const analysisBackends = [BACKENDS.GEMINI, BACKENDS.CURSOR];
      let aiAnalysis = "";
      let lastAnalysisError: string | undefined;

      for (const backend of analysisBackends) {
        onProgress?.(`Analisi AI dei commit con ${backend}...`);
        try {
          aiAnalysis = await executeAIClient({
            backend,
            model: AI_MODELS.GEMINI.FLASH,
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

      // Cerca documentation e memorie rilevanti basandosi sui commit
      onProgress?.("Ricerca documentazione correlata...");
      const relatedDocs = searchRelatedDocumentation(recentCommits);

      if (relatedDocs.length > 0) {
        metadata.relatedDocsFound = relatedDocs.length;

        sections.push(`
## Relevant Documentation & Memories

Based on commit analysis, these documents may be relevant:

${relatedDocs.join('\n')}

*Use \`check_file\` or \`read_file\` to review specific documents.*
`);
      } else {
        const dateRange = getDateRangeFromCommits(recentCommits);
        sections.push(`
## Relevant Documentation & Memories

No matching documents found in \`.serena/memories/\` or \`docs/\` based on recent commits.

${dateRange ? `📅 Commit date range: ${dateRange.oldest} to ${dateRange.newest}` : ''}
`);
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

- **Gemini**: ${cliAvailability.gemini ? "✅ Disponibile" : "❌ Non disponibile"}
- **Cursor Agent**: ${cliAvailability['cursor-agent'] ? "✅ Disponibile" : "❌ Non disponibile"}
- **Droid**: ${cliAvailability.droid ? "✅ Disponibile" : "❌ Non disponibile"}
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
