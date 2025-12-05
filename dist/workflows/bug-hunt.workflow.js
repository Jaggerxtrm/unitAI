/**
 * Bug Hunt Workflow
 *
 * Searches for and analyzes bugs based on symptoms.
 * Uses AI to discover relevant files and perform parallel analysis.
 */
import { z } from 'zod';
import { executeAIClient, BACKENDS } from '../utils/aiExecutor.js';
import { formatWorkflowOutput } from './utils.js';
import { selectParallelBackends, createTaskCharacteristics } from './modelSelector.js';
import { logAudit } from '../utils/auditTrail.js';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
/**
 * Schema dei parametri per bug-hunt
 */
export const bugHuntSchema = z.object({
    symptoms: z.string().describe('Descrizione dei sintomi del problema'),
    suspected_files: z.array(z.string()).optional().describe('File sospetti da analizzare'),
    autonomyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'AUTONOMOUS'])
        .default('MEDIUM'),
    attachments: z.array(z.string())
        .optional()
        .describe('File aggiuntivi da allegare alle analisi (es. log)'),
    backendOverrides: z.array(z.string())
        .optional()
        .describe('Override dei backend AI per l\'analisi')
});
/**
 * Extract file paths from AI response
 */
function extractFilePaths(response) {
    const lines = response.split('\n');
    const filePaths = [];
    for (const line of lines) {
        // Match common file path patterns
        const matches = line.match(/(?:^|\s)([a-zA-Z0-9_\-./]+\.(?:ts|js|tsx|jsx|json|md))/g);
        if (matches) {
            for (const match of matches) {
                const path = match.trim();
                if (existsSync(path)) {
                    filePaths.push(path);
                }
            }
        }
    }
    return [...new Set(filePaths)]; // Remove duplicates
}
/**
 * Check if analysis indicates an issue
 */
function hasIssue(analysis) {
    const issueKeywords = [
        'bug', 'error', 'issue', 'problem', 'wrong', 'incorrect',
        'missing', 'broken', 'fail', 'crash', 'exception'
    ];
    const lowerAnalysis = analysis.toLowerCase();
    return issueKeywords.some(keyword => lowerAnalysis.includes(keyword));
}
/**
 * Find related files based on imports and references
 */
async function findRelatedFiles(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const relatedFiles = [];
        // Extract import statements
        const importMatches = content.matchAll(/import.*from\s+['"](.+?)['"]/g);
        for (const match of importMatches) {
            let importPath = match[1];
            // Resolve relative imports
            if (importPath.startsWith('.')) {
                const dir = filePath.substring(0, filePath.lastIndexOf('/'));
                importPath = join(dir, importPath);
                // Try adding common extensions
                for (const ext of ['.ts', '.js', '.tsx', '.jsx', '/index.ts', '/index.js']) {
                    const fullPath = importPath + ext;
                    if (existsSync(fullPath)) {
                        relatedFiles.push(fullPath);
                        break;
                    }
                }
            }
        }
        return [...new Set(relatedFiles)];
    }
    catch (error) {
        console.warn(`Failed to find related files for ${filePath}:`, error);
        return [];
    }
}
/**
 * Execute bug hunt workflow
 */
export async function executeBugHunt(params, onProgress) {
    const { symptoms, suspected_files, attachments = [], backendOverrides } = params;
    await logAudit({
        operation: 'bug-hunt-start',
        autonomyLevel: params.autonomyLevel || 'MEDIUM',
        details: `Hunting bug with symptoms: ${symptoms}`
    });
    let filesToAnalyze = suspected_files || [];
    // Step 1: Find files if not provided
    if (filesToAnalyze.length === 0) {
        onProgress?.('🔍 Searching codebase for relevant files...');
        const searchResults = await executeAIClient({
            backend: BACKENDS.GEMINI,
            prompt: `Given these bug symptoms, list the most likely files in the codebase that could be causing the issue.

Symptoms: ${symptoms}

Consider:
- Error messages and stack traces
- Component/module names mentioned
- Common locations for such issues

List only file paths, one per line, in order of likelihood.`
        });
        filesToAnalyze = extractFilePaths(searchResults);
        if (filesToAnalyze.length === 0) {
            return formatWorkflowOutput('Bug Hunt', 'Unable to identify relevant files. Please provide suspected files manually.');
        }
        onProgress?.(`📁 Identified ${filesToAnalyze.length} files to analyze`);
    }
    // Step 2: Parallel analysis with different backends
    onProgress?.('🔬 Analyzing files with multiple AI backends...');
    const fileContents = filesToAnalyze
        .filter(f => existsSync(f))
        .map(f => ({ path: f, content: readFileSync(f, 'utf-8') }));
    // Dynamic Backend Selection
    const task = createTaskCharacteristics('bug-hunt');
    const selectedBackends = backendOverrides && backendOverrides.length > 0
        ? backendOverrides
        : selectParallelBackends(task, 3); // Try to get up to 3 backends
    const runGemini = selectedBackends.includes(BACKENDS.GEMINI);
    const runCursor = selectedBackends.includes(BACKENDS.CURSOR);
    const runDroid = selectedBackends.includes(BACKENDS.DROID);
    const runRovodev = selectedBackends.includes(BACKENDS.ROVODEV);
    const runQwen = selectedBackends.includes(BACKENDS.QWEN);
    let geminiAnalysis = '';
    let qwenAnalysis = '';
    const analysisTasks = [];
    // Primary Analysis (Gemini or Qwen)
    if (runGemini) {
        analysisTasks.push(executeAIClient({
            backend: BACKENDS.GEMINI,
            prompt: `Analyze these files for the reported bug.
Symptoms: ${symptoms}
Files:
${fileContents.map(f => `\n--- ${f.path} ---\n${f.content}`).join('\n')}
Provide:
1. Root cause analysis
2. Affected code sections
3. Why this causes the symptoms
4. Potential side effects`
        }).then(result => {
            geminiAnalysis = result;
        }).catch(error => {
            const errorMsg = error instanceof Error ? error.message : String(error);
            geminiAnalysis = `Impossibile completare l'analisi con Gemini: ${errorMsg}`;
        }));
    }
    else if (runQwen) {
        // Fallback/Alternative to Gemini
        analysisTasks.push(executeAIClient({
            backend: BACKENDS.QWEN,
            prompt: `Analyze these files for the reported bug.
Symptoms: ${symptoms}
Files:
${fileContents.map(f => `\n--- ${f.path} ---\n${f.content}`).join('\n')}
Provide root cause analysis and potential side effects.`,
            outputFormat: 'text'
        }).then(result => {
            qwenAnalysis = result;
        }).catch(error => {
            const errorMsg = error instanceof Error ? error.message : String(error);
            qwenAnalysis = `Impossibile completare l'analisi con Qwen: ${errorMsg}`;
        }));
    }
    await Promise.all(analysisTasks);
    let cursorHypothesis = '';
    if (runCursor) {
        onProgress?.('🧠 Generazione ipotesi con Cursor Agent...');
        try {
            cursorHypothesis = await executeAIClient({
                backend: BACKENDS.CURSOR,
                prompt: `Agisci come investigatore del codice. Hai i seguenti sintomi e file analizzati.
Symptoms: ${symptoms}
Files principali:
${filesToAnalyze.join("\n")}
Genera:
1. 3-5 ipotesi ordinate per probabilità
2. Evidenze richieste per confermarle
3. Esperimenti/strumenti suggeriti
4. Metriche da monitorare`,
                attachments,
                outputFormat: "text"
            });
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            cursorHypothesis = `Impossibile eseguire Cursor Agent: ${errorMsg}`;
        }
    }
    let remediationPlan = '';
    // Use Droid OR Rovodev for remediation
    if (runDroid) {
        onProgress?.('🤖 Preparazione piano di remediation con Droid...');
        try {
            remediationPlan = await executeAIClient({
                backend: BACKENDS.DROID,
                prompt: `Crea un piano operativo per risolvere i bug descritti.
Symptoms: ${symptoms}
Files:
${filesToAnalyze.join("\n")}
Output richiesto:
- Step di remediation (max 5) con priorità
- Verifiche automatiche per ciascun step
- Rischi residui`,
                auto: "medium",
                attachments,
                outputFormat: "text"
            });
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            remediationPlan = `Impossibile generare fix plan con Droid: ${errorMsg}`;
        }
    }
    else if (runRovodev) {
        onProgress?.('🤖 Preparazione piano di remediation con Rovodev...');
        try {
            remediationPlan = await executeAIClient({
                backend: BACKENDS.ROVODEV,
                prompt: `Crea un piano operativo per risolvere i bug descritti.
  Symptoms: ${symptoms}
  Files:
  ${filesToAnalyze.join("\n")}`,
                autoApprove: true // Yolo mode for planning
            });
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            remediationPlan = `Impossibile generare fix plan con Rovodev: ${errorMsg}`;
        }
    }
    // Step 3: Check if we need to analyze related files
    const problematicFiles = fileContents.filter(f => hasIssue(geminiAnalysis));
    let relatedFilesAnalysis = '';
    if (problematicFiles.length > 0) {
        onProgress?.('🔗 Searching for related files...');
        const relatedFiles = [];
        for (const file of problematicFiles) {
            const related = await findRelatedFiles(file.path);
            relatedFiles.push(...related);
        }
        const uniqueRelated = [...new Set(relatedFiles)].filter(f => !filesToAnalyze.includes(f));
        if (uniqueRelated.length > 0) {
            onProgress?.(`📎 Analyzing ${uniqueRelated.length} related files...`);
            relatedFilesAnalysis = `\n\n### Related Files Impact\n${uniqueRelated.join(', ')}`;
        }
    }
    // Step 4: Synthesize comprehensive report
    onProgress?.('📝 Generating comprehensive bug report...');
    const report = `
# Bug Hunt Report

## Symptoms
${symptoms}

## Files Analyzed
${filesToAnalyze.join('\n')}

---

## Root Cause Analysis (Gemini/Qwen)
${geminiAnalysis || qwenAnalysis}

---

${cursorHypothesis ? `---

## Hypothesis Exploration (Cursor Agent)
${cursorHypothesis}
` : ''}

${remediationPlan ? `---

## Autonomous Fix Plan (Droid/Rovodev)
${remediationPlan}
` : ''}

${relatedFilesAnalysis}

---

## Summary
- **Files Analyzed**: ${filesToAnalyze.length}
- **Problematic Files**: ${problematicFiles.length}
- **Related Files**: ${relatedFilesAnalysis ? 'Yes' : 'No'}
`;
    await logAudit({
        operation: 'bug-hunt-complete',
        autonomyLevel: params.autonomyLevel || 'MEDIUM',
        details: `Analyzed ${filesToAnalyze.length} files`
    });
    return formatWorkflowOutput('Bug Hunt', report);
}
/**
 * Bug hunt workflow definition
 */
export const bugHuntWorkflow = {
    name: 'bug-hunt',
    description: 'Hunts for bugs based on symptoms using AI-powered analysis',
    schema: bugHuntSchema,
    execute: executeBugHunt
};
//# sourceMappingURL=bug-hunt.workflow.js.map