import { CommandResult } from './commands/types';
import { executeCommand } from '../../src/utils/commandExecutor.js';

/**
 * Execute OpenSpec commands via slash command interface
 * Maps slash commands to openspec CLI invocations
 */
export async function executeOpenspec(params: string[]): Promise<CommandResult> {
    try {
        if (params.length === 0) {
            return {
                success: false,
                output: '',
                error: 'Sottocomando richiesto. Uso: /openspec <init|add|show|track|apply|detect> [parametri]'
            };
        }

        const subcommand = params[0];
        const subParams = params.slice(1);

        // Map slash command arguments to openspec CLI arguments
        const args = [subcommand, ...subParams];

        try {
            // Execute openspec CLI
            // We assume 'openspec' is in the PATH or we can use 'npx openspec'
            // Using 'npx openspec' is safer if it's a project dependency
            const output = await executeCommand('npx', ['openspec', ...args]);

            return {
                success: true,
                output: `# OpenSpec: ${subcommand} \n\n${output} `
            };

        } catch (error) {
            const err = error as Error;
            return {
                success: false,
                output: '',
                error: `Errore durante l'esecuzione openspec: ${err.message}`
            };
        }

    } catch (error) {
        const err = error as Error;
        return {
            success: false,
            output: '',
            error: `Errore generale openspec: ${err.message}`
        };
    }
}
