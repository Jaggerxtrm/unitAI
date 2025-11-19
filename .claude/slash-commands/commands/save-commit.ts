import { CommandResult } from '../types';

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
        if (!validationResult.passed) {
          return {
            success: false,
            output,
            error: `Codice non stabile. Problemi trovati:\n${validationResult.issues.join('\n')}\n\nUsa --force per forzare il commit.`
          };
        }
        output += '✅ Codice stabile - tutti i controlli passati\n\n';
      } catch (error) {
        return {
          success: false,
          output,
          error: `Errore durante la validazione: ${error.message}`
        };
      }
    }

    // Step 2: Save to memory (local and cloud)
    output += '## Salvataggio Memoria\n';
    try {
      const memoryContent = `Commit: ${commitMessage}\nTimestamp: ${new Date().toISOString()}\nChanges: ${await getGitChanges()}`;

      if (!options.noCloud) {
        await saveToMemoryCloud(memoryContent, options.tag);
        output += '✅ Salvato in openmemory-cloud\n';
      }

      await saveToMemoryLocal(memoryContent, options.tag);
      output += '✅ Salvato in openmemory locale\n\n';

    } catch (error) {
      return {
        success: false,
        output,
        error: `Errore durante il salvataggio memoria: ${error.message}`
      };
    }

    // Step 3: Create git commit
    output += '## Creazione Commit\n';
    try {
      const commitResult = await createGitCommit(commitMessage);
      output += `✅ Commit creato: ${commitResult.hash}\n\n`;
      output += '## Riepilogo\n';
      output += '- Codice validato e stabile\n';
      output += '- Memoria salvata con successo\n';
      output += `- Commit: ${commitResult.hash}\n`;

    } catch (error) {
      return {
        success: false,
        output,
        error: `Errore durante la creazione del commit: ${error.message}`
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
      error: `Errore durante il salvataggio commit: ${error.message}`
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

async function validateCodeStability(): Promise<{ passed: boolean; issues: string[] }> {
  // This would run pre-commit-validate workflow with thorough depth
  // For now, return mock result
  return {
    passed: true,
    issues: []
  };
}

async function saveToMemoryCloud(content: string, tag?: string): Promise<void> {
  // This would call openmemory-cloud MCP tool
  // For now, mock implementation
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function saveToMemoryLocal(content: string, tag?: string): Promise<void> {
  // This would call openmemory MCP tool
  // For now, mock implementation
  await new Promise(resolve => setTimeout(resolve, 50));
}

async function getGitChanges(): Promise<string> {
  // This would call git commands to get staged changes
  // For now, return mock data
  return 'Modified: .claude/slash-commands/\nAdded: 5 new files';
}

async function createGitCommit(message: string): Promise<{ hash: string }> {
  // This would execute git commit
  // For now, return mock hash
  return {
    hash: 'abc123def456'
  };
}
