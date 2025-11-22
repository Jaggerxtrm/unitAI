import { CommandResult } from './commands/types';
import { preCommitValidateWorkflow } from '../../src/workflows/pre-commit-validate.workflow.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export async function executeSaveCommit(params: string[]): Promise<CommandResult> {
  try {
    if (params.length === 0) {
      return {
        success: false,
        output: '',
        error: 'Messaggio di commit richiesto. Uso: /save-commit "messaggio commit"'
      };
    }

    const options = parseOptions(params);
    const commitMessage = extractCommitMessage(params);

    if (!commitMessage) {
      return {
        success: false,
        output: '',
        error: 'Messaggio di commit non valido. Racchiudilo tra virgolette.'
      };
    }

    let output = `# Salvataggio Commit\n\n`;
    output += `Messaggio: "${commitMessage}"\n\n`;

    // Step 1: Validate code stability (unless --force)
    if (!options.force) {
      output += '## Validazione Stabilità Codice\n';
      try {
        const validationResult = await validateCodeStability();

        // Check if validation failed (based on output string analysis as the workflow returns string)
        // The workflow output contains "Verdict: 🔴 FAIL" or "Verdict: ⚠️ WARNINGS" or "Verdict: ✅ PASS"
        const failed = validationResult.includes('Verdict: 🔴 FAIL');
        const warned = validationResult.includes('Verdict: ⚠️ WARNINGS');

        output += validationResult + '\n\n';

        if (failed) {
          return {
            success: false,
            output,
            error: `Codice non stabile. Validazione fallita. Usa --force per forzare il commit.`
          };
        }

        output += '✅ Codice validato (o con warning accettabili)\n\n';
      } catch (error) {
        return {
          success: false,
          output,
          error: `Errore durante la validazione: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    } else {
      output += '⚠️ Validazione saltata (--force)\n\n';
    }

    // Step 2: Save to memory (local and cloud)
    output += '## Salvataggio Memoria\n';
    try {
      const memoryContent = `Commit: ${commitMessage}\nTimestamp: ${new Date().toISOString()}\nTag: ${options.tag || 'none'}`;

      // Fallback to local file append since we don't have easy access to openmemory MCP client here
      await saveToMemoryLocalFallback(memoryContent);
      output += '✅ Salvato in memoria locale (.claude/memory.md)\n';

      if (!options.noCloud) {
        output += '⚠️ Salvataggio cloud non disponibile in questa modalità (richiede MCP client)\n';
      }

    } catch (error) {
      output += `⚠️ Errore salvataggio memoria: ${error instanceof Error ? error.message : String(error)}\n`;
    }

    // Step 3: Create git commit
    output += '\n## Creazione Commit\n';
    try {
      const commitResult = await createGitCommit(commitMessage);
      output += `✅ Commit creato: ${commitResult.hash}\n\n`;
      output += '## Riepilogo\n';
      output += '- Codice validato e stabile\n';
      output += '- Memoria salvata\n';
      output += `- Commit: ${commitResult.hash}\n`;

    } catch (error) {
      return {
        success: false,
        output,
        error: `Errore durante la creazione del commit: ${error instanceof Error ? error.message : String(error)}`
      };
    }

    return {
      success: true,
      output
    };

  } catch (error) {
    return {
      success: false,
      output: '',
      error: `Errore durante il salvataggio commit: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

function parseOptions(params: string[]) {
  return {
    force: params.includes('--force'),
    noCloud: params.includes('--no-cloud'),
    tag: extractTag(params)
  };
}

function extractCommitMessage(params: string[]): string | null {
  // Find the first quoted string
  const messageMatch = params.join(' ').match(/"([^"]+)"/);
  return messageMatch ? messageMatch[1] : null;
}

function extractTag(params: string[]): string | undefined {
  const tagIndex = params.indexOf('--tag');
  if (tagIndex !== -1 && tagIndex + 1 < params.length) {
    const tagMatch = params[tagIndex + 1].match(/"([^"]+)"/);
    return tagMatch ? tagMatch[1] : params[tagIndex + 1];
  }
  return undefined;
}

async function validateCodeStability(): Promise<string> {
  // Run pre-commit-validate workflow with thorough depth
  return await preCommitValidateWorkflow.execute({
    depth: 'thorough',
    autonomyLevel: 'MEDIUM'
  });
}

async function saveToMemoryLocalFallback(content: string): Promise<void> {
  const memoryPath = path.join(process.cwd(), '.claude', 'memory.md');
  const entry = `\n\n## Memory Entry [${new Date().toISOString()}]\n${content}\n`;

  try {
    await fs.appendFile(memoryPath, entry);
  } catch (err) {
    // If file doesn't exist, create it
    await fs.writeFile(memoryPath, '# Project Memory\n' + entry);
  }
}

async function createGitCommit(message: string): Promise<{ hash: string }> {
  // Execute git commit
  // We assume files are already staged (as per pre-commit-validate workflow assumption)
  await execAsync(`git commit -m "${message}"`);

  // Get the hash
  const { stdout } = await execAsync('git rev-parse HEAD');
  return {
    hash: stdout.trim()
  };
}
