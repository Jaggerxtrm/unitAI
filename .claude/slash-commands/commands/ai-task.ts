import { CommandResult } from '../types';

export async function executeAiTask(params: string[]): Promise<CommandResult> {
  try {
    if (params.length === 0) {
      return {
        success: false,
        output: '',
        error: 'Sottocomando richiesto. Uso: /ai-task <list|run|status> [parametri]'
      };
    }

    const subcommand = params[0];
    const subParams = params.slice(1);

    switch (subcommand) {
      case 'list':
        return await listWorkflows();

      case 'run':
        return await runWorkflow(subParams);

      case 'status':
        return await getWorkflowStatus();

      case 'cursor':
        return await executeCursor(subParams);

      case 'droid':
        return await executeDroid(subParams);

      default:
        return {
          success: false,
          output: '',
          error: `Sottocomando sconosciuto: ${subcommand}. Usa list, run, status, cursor, o droid.`
        };
    }

  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      output: '',
      error: `Errore durante l'esecuzione ai-task: ${err.message}`
    };
  }
}

async function listWorkflows(): Promise<CommandResult> {
  const workflows = [
    {
      name: 'init-session',
      description: 'Inizializza sessione di lavoro',
      backends: 'Gemini + Qwen',
      duration: '15-30s'
    },
    {
      name: 'pre-commit-validate',
      description: 'Validazione pre-commit',
      backends: 'Tutti (Qwen + Gemini + Rovodev)',
      duration: '5-90s'
    },
    {
      name: 'parallel-review',
      description: 'Review parallelo del codice',
      backends: 'Gemini + Rovodev',
      duration: '10-30s'
    },
    {
      name: 'validate-last-commit',
      description: 'Validazione post-commit',
      backends: 'Gemini + Qwen',
      duration: '15-25s'
    },
    {
      name: 'bug-hunt',
      description: 'Caccia ai bug con analisi root cause',
      backends: 'Qwen → Gemini → Rovodev',
      duration: '30-60s'
    },
    {
      name: 'feature-design',
      description: 'Design feature con agenti multipli',
      backends: 'ArchitectAgent + ImplementerAgent + TesterAgent',
      duration: '45-90s'
    }
  ];

  let output = '# Workflow Disponibili\n\n';
  output += '| Workflow | Descrizione | Backend | Durata |\n';
  output += '|----------|-------------|---------|---------|\n';

  workflows.forEach(wf => {
    output += `| ${wf.name} | ${wf.description} | ${wf.backends} | ${wf.duration} |\n`;
  });

  output += '\n## Esempi di Utilizzo\n\n';
  output += '```bash\n';
  output += '/ai-task run pre-commit-validate --depth thorough\n';
  output += '/ai-task run parallel-review --files "src/**/*.ts" --focus security\n';
  output += '/ai-task run bug-hunt --symptoms "500 error on upload"\n';
  output += '/ai-task run feature-design --featureDescription "Add OAuth support"\n';
  output += '```\n';

  return {
    success: true,
    output
  };
}

async function runWorkflow(params: string[]): Promise<CommandResult> {
  if (params.length === 0) {
    return {
      success: false,
      output: '',
      error: 'Nome workflow richiesto. Uso: /ai-task run <nome-workflow> [parametri]'
    };
  }

  const workflowName = params[0];
  const workflowParams = parseWorkflowParams(params.slice(1));

  try {
    const result = await executeWorkflow({
      workflow: workflowName,
      params: workflowParams
    });

    let output = `# Esecuzione Workflow: ${workflowName}\n\n`;
    output += `**Status:** ${result.success ? '✅ Successo' : '❌ Fallito'}\n`;
    output += `**Durata:** ${result.duration || 'N/A'}ms\n\n`;

    if (result.output) {
      output += `## Risultato\n\n${result.output}\n`;
    }

    if (result.error) {
      output += `## Errore\n\n${result.error}\n`;
    }

    return {
      success: result.success,
      output
    };

  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      output: '',
      error: `Errore durante l'esecuzione del workflow ${workflowName}: ${err.message}`
    };
  }
}

async function getWorkflowStatus(): Promise<CommandResult> {
  // This would check for running workflows
  // For now, return mock status
  return {
    success: true,
    output: '# Status Workflow\n\nNessun workflow attualmente in esecuzione.'
  };
}

function parseWorkflowParams(params: string[]): Record<string, any> {
  const result: Record<string, any> = {};

  for (let i = 0; i < params.length; i++) {
    const param = params[i];

    if (param.startsWith('--')) {
      const key = param.slice(2);
      const value = params[i + 1];

      if (value && !value.startsWith('--')) {
        // Handle different parameter types
        if (value === 'true') {
          result[key] = true;
        } else if (value === 'false') {
          result[key] = false;
        } else if (!isNaN(Number(value))) {
          result[key] = Number(value);
        } else if (value.startsWith('"') && value.endsWith('"')) {
          result[key] = value.slice(1, -1);
        } else if (value.includes(',')) {
          result[key] = value.split(',').map(s => s.trim());
        } else {
          result[key] = value;
        }
        i++; // Skip next param as it's the value
      } else {
        result[key] = true; // Flag parameter
      }
    }
  }

  return result;
}

async function executeWorkflow(params: any): Promise<any> {
  // This would call the actual MCP smart-workflows tool
  // For now, return mock successful result
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate execution time

  return {
    success: true,
    output: 'Workflow completato con successo. Output dettagliato qui.',
    duration: 1500
  };
}

async function executeCursor(params: string[]): Promise<CommandResult> {
  if (params.length === 0) {
    return {
      success: false,
      output: '',
      error: 'Prompt richiesto. Uso: /ai-task cursor "prompt" [--model model-name] [--files file1,file2]'
    };
  }

  const options = parseCursorOptions(params);
  const prompt = extractPrompt(params);

  if (!prompt) {
    return {
      success: false,
      output: '',
      error: 'Prompt non valido. Racchiudilo tra virgolette.'
    };
  }

  try {
    // This would call the MCP cursor-agent tool
    // For now, return formatted result
    let output = `# Cursor Agent Execution\n\n`;
    output += `**Prompt:** "${prompt}"\n`;
    output += `**Model:** ${options.model || 'gpt-5.1 (default)'}\n`;
    if (options.files) {
      output += `**Files:** ${options.files.join(', ')}\n`;
    }
    output += `\n## Result\n\n`;
    output += `Cursor agent analysis completed successfully.\n`;
    output += `\n*Note: This is a mock result. Integration with actual cursor-agent MCP tool pending.*\n`;

    return {
      success: true,
      output
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      output: '',
      error: `Errore durante l'esecuzione cursor-agent: ${err.message}`
    };
  }
}

async function executeDroid(params: string[]): Promise<CommandResult> {
  if (params.length === 0) {
    return {
      success: false,
      output: '',
      error: 'Prompt richiesto. Uso: /ai-task droid "prompt" [--auto low|medium|high] [--files file1,file2]'
    };
  }

  const options = parseDroidOptions(params);
  const prompt = extractPrompt(params);

  if (!prompt) {
    return {
      success: false,
      output: '',
      error: 'Prompt non valido. Racchiudilo tra virgolette.'
    };
  }

  try {
    // This would call the MCP droid tool
    // For now, return formatted result
    let output = `# Droid Execution\n\n`;
    output += `**Prompt:** "${prompt}"\n`;
    output += `**Autonomy:** ${options.auto || 'low (default)'}\n`;
    if (options.files) {
      output += `**Files:** ${options.files.join(', ')}\n`;
    }
    output += `\n## Result\n\n`;
    output += `Droid analysis completed successfully.\n`;
    output += `\n*Note: This is a mock result. Integration with actual droid MCP tool pending.*\n`;

    return {
      success: true,
      output
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      output: '',
      error: `Errore durante l'esecuzione droid: ${err.message}`
    };
  }
}

function parseCursorOptions(params: string[]) {
  const modelIndex = params.indexOf('--model');
  const filesIndex = params.indexOf('--files');

  return {
    model: modelIndex !== -1 && params[modelIndex + 1] ? params[modelIndex + 1] : undefined,
    files: filesIndex !== -1 && params[filesIndex + 1] ? params[filesIndex + 1].split(',') : undefined
  };
}

function parseDroidOptions(params: string[]) {
  const autoIndex = params.indexOf('--auto');
  const filesIndex = params.indexOf('--files');

  return {
    auto: autoIndex !== -1 && params[autoIndex + 1] ? params[autoIndex + 1] : undefined,
    files: filesIndex !== -1 && params[filesIndex + 1] ? params[filesIndex + 1].split(',') : undefined
  };
}

function extractPrompt(params: string[]): string | null {
  // Find the first quoted string
  const promptMatch = params.join(' ').match(/"([^"]+)"/);
  return promptMatch ? promptMatch[1] : null;
}
