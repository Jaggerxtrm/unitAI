#!/usr/bin/env tsx

/**
 * @deprecated This hook is DEPRECATED as of 2024-11-22.
 *
 * Claude Code now has native slash command support via Markdown files in .claude/commands/.
 * The custom TypeScript-based command system has been moved to .claude/legacy-scripts/
 * and is no longer the primary mechanism for slash commands.
 *
 * Native slash commands are defined in:
 * - .claude/commands/*.md (main commands)
 *
 * This hook is kept for backward compatibility but should not be used for new commands.
 */

// Legacy imports - kept for backward compatibility only
import { parseSlashCommand, validateCommand, executeSlashCommand } from '../legacy-scripts/commands';

/**
 * @deprecated Use native Claude Code slash commands instead.
 * Hook per intercettare e processare i comandi slash (LEGACY)
 * Viene eseguito su ogni messaggio utente inviato a Claude
 */
export async function onUserPromptSubmit(prompt: string): Promise<void> {
  // Check if this is a slash command
  if (!prompt.startsWith('/')) {
    return; // Not a slash command, let it pass through normally
  }

  try {
    // Parse the slash command
    const command = parseSlashCommand(prompt);

    if (!command) {
      console.log('❌ Comando slash non valido');
      return;
    }

    // Validate the command
    const validation = validateCommand(command);

    if (!validation.valid) {
      console.log(`❌ ${validation.error}`);
      return;
    }

    console.log(`🔄 Eseguendo comando: /${command.command}`);

    // Execute the command
    const result = await executeSlashCommand(command);

    // Display the result
    if (result.success) {
      console.log('✅ Comando eseguito con successo\n');
      console.log(result.output);
    } else {
      console.log('❌ Errore esecuzione comando\n');
      console.log(result.error);
    }

    if (result.duration) {
      console.log(`⏱️ Durata: ${result.duration}ms`);
    }

  } catch (error) {
    console.error('💥 Errore critico comando slash:', error.message);
  }
}

// Hook metadata for Claude system
export const hookMetadata = {
  name: 'slash-command-parser',
  type: 'UserPromptSubmit',
  description: 'Intercetta ed esegue comandi slash personalizzati',
  priority: 'high'
};
