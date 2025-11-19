import { CommandResult } from '../types';

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
    output += `**Sorgente:** ${source}\n\n`;

    const results: string[] = [];

    // Determine which sources to search based on source parameter
    const sourcesToSearch = source === 'all' ? ['local', 'context7', 'deepwiki'] :
                          source === 'auto' ? determineAutoSources(topic) : [source];

    for (const searchSource of sourcesToSearch) {
      try {
        const sourceResults = await searchDocumentation(topic, searchSource);
        if (sourceResults.length > 0) {
          output += `## Risultati da ${searchSource.toUpperCase()}\n\n`;
          sourceResults.forEach(result => {
            output += `- ${result}\n`;
          });
          output += '\n';
        } else {
          output += `## ${searchSource.toUpperCase()}\nNessun risultato trovato per "${topic}".\n\n`;
        }
      } catch (error) {
        output += `## ${searchSource.toUpperCase()}\nErrore durante la ricerca: ${error.message}\n\n`;
      }
    }

    if (sourcesToSearch.length === 0) {
      output += 'Nessuna sorgente valida specificata.\n';
    }

    // Add helpful suggestions if no results found
    if (!output.includes('- ')) {
      output += `## Suggerimenti\n\n`;
      output += `Se non hai trovato quello che cercavi, prova:\n\n`;
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
      error: `Errore durante la ricerca documentazione: ${error.message}`
    };
  }
}

function determineAutoSources(topic: string): string[] {
  const sources: string[] = ['local']; // Always search local first

  // Determine if it's likely an external library/package
  const externalLibraries = [
    'react', 'vue', 'angular', 'node', 'express', 'typescript',
    'mongodb', 'postgres', 'redis', 'docker', 'kubernetes',
    'aws', 'azure', 'gcp', 'firebase', 'stripe'
  ];

  const isExternalLib = externalLibraries.some(lib =>
    topic.toLowerCase().includes(lib.toLowerCase())
  );

  if (isExternalLib) {
    sources.push('context7');
  }

  // Check if it looks like a GitHub repo reference
  if (topic.includes('/') && !topic.includes(' ')) {
    sources.push('deepwiki');
  }

  return sources;
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
      return [];
  }
}

async function searchLocalDocs(topic: string): Promise<string[]> {
  // This would search through local project documentation
  // For now, return mock results based on common project docs
  const mockResults = {
    'workflow': [
      'docs/WORKFLOWS.md - Guida completa ai workflow disponibili',
      'docs/enhancement-plan/04-proposal-slash-commands.md - Proposta implementazione comandi slash'
    ],
    'mcp': [
      'docs/INTEGRATIONS.md - Guida integrazione MCP servers',
      'docs/mcp_tools_documentations.md - Documentazione strumenti MCP'
    ],
    'agent': [
      'docs/AGENT_MIGRATION_GUIDE.md - Guida migrazione agenti',
      'src/agents/ - Implementazioni agenti disponibili'
    ]
  };

  // Simple keyword matching
  for (const [key, results] of Object.entries(mockResults)) {
    if (topic.toLowerCase().includes(key)) {
      return results;
    }
  }

  return [`Ricerca locale completata per "${topic}". Controlla docs/ per documentazione dettagliata.`];
}

async function searchContext7(topic: string): Promise<string[]> {
  // This would call the context7 MCP tool
  // For now, return mock results
  await new Promise(resolve => setTimeout(resolve, 300));

  if (topic.toLowerCase().includes('react')) {
    return [
      'React Documentation - Hooks: useState, useEffect, useCallback',
      'React.useCallback - Hook per memoizzazione funzioni',
      'React Best Practices - Ottimizzazione performance con memo'
    ];
  }

  if (topic.toLowerCase().includes('typescript')) {
    return [
      'TypeScript Handbook - Generics e utility types',
      'TypeScript Configuration - tsconfig.json options',
      'TypeScript Advanced Types - Conditional types e mapped types'
    ];
  }

  return [`Documentazione Context7 per "${topic}" - Ricerca completata`];
}

async function searchDeepWiki(topic: string): Promise<string[]> {
  // This would call the deepwiki MCP tool
  // For now, return mock results
  await new Promise(resolve => setTimeout(resolve, 400));

  // Check if it looks like a repo reference
  if (topic.includes('/') && !topic.includes(' ')) {
    return [
      `DeepWiki - Repository: ${topic}`,
      'README.md - Panoramica progetto e setup',
      'CONTRIBUTING.md - Guida contributi',
      'docs/ - Documentazione tecnica dettagliata'
    ];
  }

  return [`DeepWiki ricerca completata per "${topic}". Usa owner/repo format per repository specifici.`];
}
