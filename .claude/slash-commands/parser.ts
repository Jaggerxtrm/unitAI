import { SlashCommand } from './types';

export function parseSlashCommand(message: string): SlashCommand | null {
  // Check if message starts with slash
  if (!message.startsWith('/')) {
    return null;
  }

  // Remove the slash and split by spaces, but handle quoted strings
  const rawArgs = message.slice(1);

  // Simple parsing: split by spaces, but this could be enhanced for quoted strings
  const parts = rawArgs.split(/\s+/);

  if (parts.length === 0) {
    return null;
  }

  const command = parts[0];
  const params = parts.slice(1);

  return {
    command,
    params,
    raw: message
  };
}

export function validateCommand(command: SlashCommand): { valid: boolean; error?: string } {
  const validCommands = [
    'init-session',
    'save-commit',
    'ai-task',
    'create-spec',
    'check-docs',
    'help'
  ];

  if (!validCommands.includes(command.command)) {
    return {
      valid: false,
      error: `Comando slash sconosciuto: /${command.command}. Usa /help per vedere i comandi disponibili.`
    };
  }

  // Validate specific command parameters
  switch (command.command) {
    case 'save-commit':
      if (command.params.length === 0) {
        return {
          valid: false,
          error: 'Il comando /save-commit richiede un messaggio di commit tra virgolette.'
        };
      }
      break;

    case 'ai-task':
      if (command.params.length === 0) {
        return {
          valid: false,
          error: 'Il comando /ai-task richiede un sottocomando (list, run, status).'
        };
      }
      break;
  }

  return { valid: true };
}
