import { SlashCommand, CommandResult } from './types';
import { executeInitSession } from '../init-session';
import { executeSaveCommit } from '../save-commit';
import { executeAiTask } from '../ai-task';
import { executeCreateSpec } from '../create-spec';
import { executeCheckDocs } from '../check-docs';
import { executePrompt } from '../prompt';
import { executeHelp } from './help';

const commandHandlers: Record<string, (params: string[]) => Promise<CommandResult>> = {
  'init-session': executeInitSession,
  'save-commit': executeSaveCommit,
  'ai-task': executeAiTask,
  'create-spec': executeCreateSpec,
  'check-docs': executeCheckDocs,
  'prompt': executePrompt,
  'help': executeHelp
};

export async function executeSlashCommand(command: SlashCommand): Promise<CommandResult> {
  const startTime = Date.now();

  try {
    const handler = commandHandlers[command.command];

    if (!handler) {
      return {
        success: false,
        output: '',
        error: `Comando slash non implementato: /${command.command}`,
        duration: Date.now() - startTime
      };
    }

    const result = await handler(command.params);

    return {
      ...result,
      duration: Date.now() - startTime
    };

  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      output: '',
      error: `Errore durante l'esecuzione del comando /${command.command}: ${err.message}`,
      duration: Date.now() - startTime
    };
  }
}
