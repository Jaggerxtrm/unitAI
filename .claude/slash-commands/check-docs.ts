import { CommandResult } from './commands/types';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export async function executeCheckDocs(params: string[]): Promise<CommandResult> {
  try {
    if (params.length === 0) {
      return {
        success: false,
        output: '',
        error: 'Topic di ricerca richiesto. Uso: /check-docs <topic> [sorgente]'
      };
    }

    const topic = params[0];
    const source = params[1] || 'auto'; // auto, context7, deepwiki, local, all

    let output = `# Ricerca Documentazione: "${topic}"\n\n`;
    output += `** Sorgente:** ${source} \n\n`;

    const results: string[] = [];

    // Determine which sources to search based on source parameter
    const sourcesToSearch = source === 'all' ? ['local', 'context7', 'deepwiki'] :
      source === 'auto' ? determineAutoSources(topic) : [source];

    for (const searchSource of sourcesToSearch) {
      try {
        const sourceResults = await searchDocumentation(topic, searchSource);
        if (sourceResults.length > 0) {
          output += `## Risultati da ${searchSource.toUpperCase()} \n\n`;
          sourceResults.forEach(result => {
            output += `- ${result} \n`;
          });
          output += '\n';
        } else {
          output += `## ${searchSource.toUpperCase()} \nNessun risultato trovato per "${topic}".\n\n`;
        }
      } catch (error) {
        output += `## ${searchSource.toUpperCase()} \nErrore durante la ricerca: ${error instanceof Error ? error.message : String(error)} \n\n`;
      }
    }

    if (sourcesToSearch.length === 0) {
      output += 'Nessuna sorgente valida specificata.\n';
    }

    // Add helpful suggestions if no results found
    if (!output.includes('- ')) {
      output += `## Suggerimenti\n\n`;
      output += `Se non hai trovato quello che cercavi, prova: \n\n`;
      output += `- Usa \`/check-docs "${topic}" all\` per cercare in tutte le sorgenti\n`;
      output += `- Sorgenti disponibili: \`local\`, \`context7\`, \`deepwiki\`, \`all\`\n`;
      output += `- Per documentazione esterna: usa \`context7\` (es. React, Node.js)\n`;
      output += `- Per repository GitHub: usa \`deepwiki\` (es. facebook/react, microsoft/vscode)\n`;
      output += `- Per documentazione progetto: usa \`local\` o \`auto\`\n`;
    }

    return {
      success: true,
      output
    };

  } catch (error) {
    return {
      success: false,
      output: '',
      error: `Errore durante la ricerca documentazione: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

function determineAutoSources(topic: string): string[] {
  // Simple heuristic to guess source
  if (topic.includes('/') && !topic.includes(' ')) {
    return ['deepwiki']; // Looks like repo/owner
  }
  if (['react', 'node', 'typescript', 'nextjs'].some(k => topic.toLowerCase().includes(k))) {
    return ['context7', 'local'];
  }
  return ['local'];
}

async function searchDocumentation(topic: string, source: string): Promise<string[]> {
  switch (source) {
    case 'local':
      return await searchLocalDocs(topic);
    case 'context7':
      return await searchContext7(topic);
    case 'deepwiki':
      return await searchDeepWiki(topic);
    default:
      throw new Error(`Sorgente sconosciuta: ${source}`);
  }
}

async function searchLocalDocs(topic: string): Promise<string[]> {
  try {
    // Use grep to search in docs/ directory and .md files
    // -r: recursive
    // -i: case insensitive
    // -l: print only filenames
    // --include: only search .md files
    const command = `grep -r -i -l --include="*.md" "${topic}" docs/ .claude/docs/ README.md`;
    const { stdout } = await execAsync(command).catch(() => ({ stdout: '' })); // Catch error if grep finds nothing (exit code 1)

    if (!stdout.trim()) {
      return [];
    }

    const files = stdout.trim().split('\n');
    return files.map(file => `Trovato in: [${path.basename(file)}](${file})`);
  } catch (error) {
    console.error('Error searching local docs:', error);
    return [];
  }
}

async function searchContext7(topic: string): Promise<string[]> {
  // This would call context7 MCP tool
  // For now, return mock results with a note
  return [
    `Risultato simulato da Context7 per "${topic}"`,
    `Nota: Integrazione reale richiede client MCP`
  ];
}

async function searchDeepWiki(topic: string): Promise<string[]> {
  // This would call deepwiki MCP tool
  // For now, return mock results with a note
  return [
    `Risultato simulato da DeepWiki per "${topic}"`,
    `Nota: Integrazione reale richiede client MCP`
  ];
}
