import { CommandResult } from './commands/types';
import { executeAIClient, BACKENDS } from '../../src/utils/aiExecutor.js';
import { executeWorkflow as runWorkflowInternal, listWorkflows as listWorkflowsInternal, getWorkflow } from '../../src/workflows/index.js';

export async function executeAiTask(params: string[]): Promise<CommandResult> {
  try {
    if (params.length === 0) {
      return {
        success: false,
        output: '',
        error: 'Sottocomando richiesto. Uso: /ai-task <list|run|status|cursor|droid> [parametri]'
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
  const workflowNames = listWorkflowsInternal();

  let output = '# Workflow Disponibili\n\n';
  output += '| Workflow | Descrizione |\n';
  output += '|----------|-------------|\n';

  workflowNames.forEach(name => {
    const wf = getWorkflow(name);
    output += `| ${name} | ${wf?.description || 'N/A'} |\n`;
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
    const startTime = Date.now();
    const output = await runWorkflowInternal(workflowName, workflowParams, (msg) => {
      // Optional progress logging
    });
    const duration = Date.now() - startTime;

    let resultOutput = `# Esecuzione Workflow: ${workflowName}\n\n`;
    resultOutput += `**Status:** ✅ Successo\n`;
    resultOutput += `**Durata:** ${duration}ms\n\n`;
    resultOutput += `## Risultato\n\n${output}\n`;

    return {
      success: true,
      output: resultOutput
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
  // Currently we don't track async workflow status in a persistent way accessible here
  // This is a placeholder for future implementation
  return {
    success: true,
    output: '# Status Workflow\n\nNessun workflow in background monitorato attivamente.'
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
    const output = await executeAIClient({
      backend: BACKENDS.CURSOR,
      prompt: prompt,
      model: options.model,
      attachments: options.files
    });

    return {
      success: true,
      output: `# Cursor Agent Execution\n\n${output}`
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
    const output = await executeAIClient({
      backend: BACKENDS.DROID,
      prompt: prompt,
      auto: options.auto as any,
      attachments: options.files
    });

    return {
      success: true,
      output: `# Droid Execution\n\n${output}`
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
