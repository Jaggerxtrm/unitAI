#!/usr/bin/env tsx

/**
 * Hook per fornire suggerimenti e completamento automatico per i comandi slash
 */
export async function onUserPromptSubmit(prompt: string): Promise<void> {
  // Only provide suggestions for partial slash commands
  if (!prompt.startsWith('/') || prompt.length < 2) {
    return;
  }

  const availableCommands = [
    'init-session',
    'save-commit',
    'ai-task',
    'create-spec',
    'check-docs',
    'help'
  ];

  // Check if it's a partial command
  const partialCommand = prompt.slice(1).toLowerCase();

  const matches = availableCommands.filter(cmd =>
    cmd.toLowerCase().startsWith(partialCommand)
  );

  if (matches.length === 1 && matches[0] !== partialCommand) {
    // Exact match for completion
    console.log(`💡 Suggerimento: Completa con /${matches[0]}`);

  } else if (matches.length > 1) {
    // Multiple matches, show options
    console.log(`💡 Comandi disponibili: ${matches.map(cmd => `/${cmd}`).join(', ')}`);

  } else if (matches.length === 0 && availableCommands.some(cmd => cmd.includes(partialCommand))) {
    // No exact matches but partial matches exist
    const partialMatches = availableCommands.filter(cmd =>
      cmd.includes(partialCommand)
    );
    console.log(`💡 Comandi simili: ${partialMatches.map(cmd => `/${cmd}`).join(', ')}`);
  }
}

// Hook metadata for Claude system
export const hookMetadata = {
  name: 'slash-command-suggestions',
  type: 'UserPromptSubmit',
  description: 'Fornisce suggerimenti e completamento per comandi slash',
  priority: 'medium'
};
