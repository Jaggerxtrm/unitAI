/**
 * Pre-Commit Validation Workflow
 * 
 * Validates staged changes before committing, checking for:
 * - Security issues (secrets, vulnerabilities)
 * - Code quality issues
 * - Breaking changes
 * 
 * Uses parallel AI analysis with multiple backends for comprehensive validation.
 */

import { z } from 'zod';
import type { WorkflowDefinition, ProgressCallback } from './types.js';
import { executeAIClient, BACKENDS } from '../utils/aiExecutor.js';
import { getStagedDiff } from '../utils/gitHelper.js';
import { formatWorkflowOutput } from './utils.js';
import { logAudit } from '../utils/auditTrail.js';
import { estimateFileTokens } from '../utils/tokenEstimator.js';
import { resolve } from 'path';
import { logger } from '../utils/logger.js';
async function estimateDiffTokens(stagedDiff: string): Promise<{ files: string[]; tokens: number; }> {
  const fileRegex = /^\+\+\+\sb\/([^\n]+)/gm;
  const files = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = fileRegex.exec(stagedDiff)) !== null) {
    const relativePath = match[1].trim();
    if (relativePath === "/dev/null") {
      continue;
    }
    files.add(relativePath);
  }

  let totalTokens = 0;
  for (const relativePath of files) {
    try {
      const absolutePath = resolve(process.cwd(), relativePath);
      const estimate = await estimateFileTokens(absolutePath);
      totalTokens += estimate.estimatedTokens;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.warn(`Token estimation fallback for ${relativePath}: ${errorMsg}`);
      totalTokens += 400;
    }
  }

  return {
    files: Array.from(files),
    tokens: totalTokens
  };
}

async function generateAutonomousRemediationPlan(
  stagedDiff: string,
  depth: string
): Promise<string> {
  const prompt = `Agisci come Factory Droid (GLM-4.6) e genera un piano di remediation autonomo per questo diff git.

Profondità richiesta: ${depth}

Diff:
\`\`\`diff
${stagedDiff}
\`\`\`

Produci un piano strutturato con:
1. Priorità delle azioni (CRITICAL/HIGH/MEDIUM)
2. Step consigliati (max 5)
3. Verifiche automatiche suggerite
4. Rischi residui`;

  return executeAIClient({
    backend: BACKENDS.DROID,
    prompt,
    auto: "low",
    outputFormat: "text"
  });
}

/**
 * Schema dei parametri per pre-commit-validate
 */
export const preCommitValidateSchema = z.object({
  depth: z.enum(['quick', 'thorough', 'paranoid'])
    .default('thorough')
    .describe('Profondità della validazione'),
  autonomyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'AUTONOMOUS'])
    .default('MEDIUM')
});

export type PreCommitValidateParams = z.infer<typeof preCommitValidateSchema>;

/**
 * Check for secrets in staged diff
 */
async function checkForSecrets(stagedDiff: string, depth: string): Promise<string> {
  const prompt = `Analyze this git diff for potential secrets, API keys, passwords, or sensitive data.
Be ${depth === 'paranoid' ? 'extremely thorough and flag anything suspicious' : depth === 'quick' ? 'fast and flag only obvious issues' : 'thorough'}.

Diff:
\`\`\`
${stagedDiff}
\`\`\`

Respond with:
1. SECRETS_FOUND: yes/no
2. List of findings with severity (CRITICAL/HIGH/MEDIUM/LOW)
3. Recommended actions

Format as JSON:
{
  "hasSecrets": boolean,
  "findings": [{"type": string, "severity": string, "line": string, "recommendation": string}]
}`;

  return await executeAIClient({
    backend: BACKENDS.QWEN,
    prompt
  });
}

/**
 * Check code quality issues
 */
async function checkCodeQuality(stagedDiff: string, depth: string): Promise<string> {
  const analysisDepth = depth === 'paranoid' 
    ? 'extremely detailed analysis including edge cases, error handling, performance implications'
    : depth === 'quick'
    ? 'quick scan for obvious issues only'
    : 'thorough analysis of code quality, patterns, and best practices';

  const prompt = `Analyze this git diff for code quality issues. Perform ${analysisDepth}.

Diff:
\`\`\`
${stagedDiff}
\`\`\`

Check for:
1. Code smells and anti-patterns
2. Missing error handling
3. Performance issues
4. Maintainability concerns
5. TypeScript/JavaScript best practices violations
6. Potential bugs

Respond with JSON:
{
  "qualityScore": number (0-100),
  "issues": [{"category": string, "severity": string, "description": string, "suggestion": string}],
  "positives": [string]
}`;

  return await executeAIClient({
    backend: BACKENDS.GEMINI,
    prompt
  });
}

/**
 * Check for breaking changes
 */
async function checkBreakingChanges(stagedDiff: string, depth: string): Promise<string> {
  const prompt = `Analyze this git diff for potential breaking changes.

Diff:
\`\`\`
${stagedDiff}
\`\`\`

Identify:
1. API changes (function signatures, exports, interfaces)
2. Removed or renamed public functions/classes
3. Changed behavior of existing functions
4. Database schema changes
5. Configuration changes

${depth === 'paranoid' ? 'Be extremely cautious and flag even minor changes.' : ''}

Respond with JSON:
{
  "hasBreakingChanges": boolean,
  "changes": [{"type": string, "severity": string, "description": string, "impact": string}],
  "mitigationStrategies": [string]
}`;

  return await executeAIClient({
    backend: BACKENDS.ROVODEV,
    prompt
  });
}

/**
 * Parse JSON response from AI (with error handling)
 */
function parseAIResponse(response: string, fallback: any): any {
  try {
    const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(response);
  } catch (error) {
    console.warn('Failed to parse AI response as JSON, using fallback', error);
    return fallback;
  }
}

/**
 * Synthesize validation verdict from all checks
 */
function synthesizeValidationVerdict(
  secretsCheck: string,
  qualityCheck: string,
  breakingChangesCheck: string
): { verdict: 'PASS' | 'WARN' | 'FAIL'; report: string } {
  const secrets = parseAIResponse(secretsCheck, { hasSecrets: false, findings: [] });
  const quality = parseAIResponse(qualityCheck, { qualityScore: 50, issues: [], positives: [] });
  const breaking = parseAIResponse(breakingChangesCheck, { hasBreakingChanges: false, changes: [] });

  let verdict: 'PASS' | 'WARN' | 'FAIL' = 'PASS';
  const issues: string[] = [];
  const warnings: string[] = [];

  if (secrets.hasSecrets) {
    verdict = 'FAIL';
    issues.push(`🔴 CRITICAL: Potential secrets found!`);
  }

  if (quality.qualityScore < 60) {
    verdict = verdict === 'FAIL' ? 'FAIL' : 'WARN';
    warnings.push(`⚠️ Code quality score: ${quality.qualityScore}/100`);
  }

  if (breaking.hasBreakingChanges) {
    verdict = verdict === 'FAIL' ? 'FAIL' : 'WARN';
    warnings.push(`⚠️ Potential breaking changes detected`);
  }

  const report = `
# Pre-Commit Validation Report

## Verdict: ${verdict === 'PASS' ? '✅ PASS' : verdict === 'WARN' ? '⚠️ WARNINGS' : '🔴 FAIL'}

${issues.length > 0 ? `### 🔴 Critical Issues:\n${issues.join('\n')}\n` : ''}
${warnings.length > 0 ? `### ⚠️ Warnings:\n${warnings.join('\n')}\n` : ''}

---

## Security Analysis
${secrets.hasSecrets ? `⚠️ Potential secrets detected` : '✅ No secrets detected'}

## Code Quality Analysis
Score: ${quality.qualityScore}/100

## Breaking Changes Analysis
${breaking.hasBreakingChanges ? '⚠️ Breaking changes detected' : '✅ No breaking changes'}
`;

  return { verdict, report };
}

/**
 * Execute pre-commit validation workflow
 */
export async function executePreCommitValidate(
  params: PreCommitValidateParams,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.('🔍 Reading staged changes...');
  
  const stagedDiff = await getStagedDiff();
  
  if (!stagedDiff.trim()) {
    return formatWorkflowOutput('Pre-Commit Validation', '✅ No staged files to validate');
  }

  const diffEstimation = await estimateDiffTokens(stagedDiff);
  if (diffEstimation.tokens > 0) {
    onProgress?.(`📏 Token stimati per il diff: ~${diffEstimation.tokens}`);
    logger.info(`[pre-commit-validate] Estimated token budget: ~${diffEstimation.tokens}`);
  }

  await logAudit({
    operation: 'pre-commit-validate',
    autonomyLevel: params.autonomyLevel || 'MEDIUM',
    details: `Validating staged changes with depth: ${params.depth}`
  });

  onProgress?.('🔍 Running parallel security, quality, and breaking change checks...');

  const [secretsCheck, qualityCheck, breakingChangesCheck] = await Promise.all([
    checkForSecrets(stagedDiff, params.depth || 'thorough'),
    checkCodeQuality(stagedDiff, params.depth || 'thorough'),
    checkBreakingChanges(stagedDiff, params.depth || 'thorough')
  ]);

  onProgress?.('📊 Synthesizing validation report...');
  
  const { verdict, report } = synthesizeValidationVerdict(
    secretsCheck,
    qualityCheck,
    breakingChangesCheck
  );

  let remediationSection = '';
  if (params.depth === 'paranoid') {
    onProgress?.('🤖 Generazione piano di remediation con Droid...');
    try {
      const remediationPlan = await generateAutonomousRemediationPlan(stagedDiff, params.depth);
      remediationSection = `
## Autonomous Remediation Plan (Droid)

${remediationPlan}
`;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      remediationSection = `
## Autonomous Remediation Plan (Droid)

Impossibile generare il piano: ${errorMsg}
`;
    }
  }

  const tokenSection = diffEstimation.tokens > 0 ? `
## Token Estimate

~${diffEstimation.tokens.toLocaleString()} token stimati per i file modificati (${diffEstimation.files.length} file)
` : '';

  const finalReport = `${report}
${tokenSection}
${remediationSection}`;

  await logAudit({
    operation: 'pre-commit-validate-complete',
    autonomyLevel: params.autonomyLevel || 'MEDIUM',
    details: `Validation verdict: ${verdict}`
  });

  return formatWorkflowOutput('Pre-Commit Validation', finalReport);
}

/**
 * Pre-commit validation workflow definition
 */
export const preCommitValidateWorkflow: WorkflowDefinition = {
  name: 'pre-commit-validate',
  description: 'Validates staged changes before committing',
  schema: preCommitValidateSchema as any,
  execute: executePreCommitValidate
};
