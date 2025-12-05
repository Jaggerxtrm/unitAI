import { CommandResult } from './commands/types';
import { initSessionWorkflow } from '../../src/workflows/init-session.workflow.js';

export async function executeInitSession(params: string[]): Promise<CommandResult> {
  try {
    // Parse parameters
    const options = parseOptions(params);

    // Execute the init-session workflow directly
    const workflowParams = {
      autonomyLevel: options.deep ? 'low' : 'read-only',
      commitCount: options.deep ? 20 : 10
    };

    // Execute the workflow
    // Note: We pass a simple progress callback that logs to console (or could be ignored)
    const output = await initSessionWorkflow.execute(workflowParams, (msg) => {
      // Optional: log progress if needed, or ignore
      // console.log(msg);
    });

    let finalOutput = `# Sessione Inizializzata\n\n${output}`;

    // Execute suggested memory queries if not disabled
    // Note: The workflow output already contains suggested queries in text format.
    // If we want to automate execution, we would need to parse them or have the workflow return structured data.
    // For now, we rely on the workflow's text output which includes the queries.

    if (!options.noMemory) {
      // TODO: If openmemory has a CLI, we could execute searches here.
      // For now, the workflow output suggests the commands to run.
      finalOutput += '\n\n*Suggerimento: Esegui i comandi di ricerca memoria sopra indicati per recuperare il contesto.*';
    }

    return {
      success: true,
      output: finalOutput
    };

  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      output: '',
      error: `Errore durante l'inizializzazione della sessione: ${err.message}`
    };
  }
}

function parseOptions(params: string[]) {
  return {
    deep: params.includes('--deep'),
    noMemory: params.includes('--no-memory')
  };
}
