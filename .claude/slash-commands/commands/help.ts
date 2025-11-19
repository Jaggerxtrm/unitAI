import { CommandResult } from '../types';

export function getHelpText(command?: string): string {
  const generalHelpText = `# Comandi Slash Disponibili

## Sessione e Workflow
- \`/init-session [opzioni]\` - Inizializza una nuova sessione di lavoro
  - \`--deep\`: Analisi più approfondita
  - \`--no-memory\`: Salta ricerca memorie automatica

- \`/save-commit "messaggio commit" [opzioni]\` - Salva lavoro stabile in memoria e commit
  - \`--force\`: Salta validazione stabilità
  - \`--no-cloud\`: Salta salvataggio cloud
  - \`--tag "tag"\`: Aggiunge tag alla memoria

## Task AI e Workflow
- \`/ai-task list\` - Lista workflow disponibili
- \`/ai-task run <nome> [params]\` - Esegue workflow specifico
- \`/ai-task status\` - Mostra status workflow in esecuzione

## Sviluppo e Documentazione
- \`/create-spec "descrizione feature" [opzioni]\` - Crea specifiche per nuove feature
  - \`--template "tipo"\`: Template specifico (api, ui, db, full)
  - \`--with-design\`: Include analisi architetturale
  - \`--output "path"\`: Percorso salvataggio custom

- \`/check-docs <topic> [sorgente]\` - Ricerca documentazione
  - Sorgenti: \`context7\`, \`deepwiki\`, \`local\`, \`all\` (default: auto)
  - Esempi: \`/check-docs react useCallback\`, \`/check-docs mcp-setup local\`

## Aiuto
- \`/help\` - Mostra questo messaggio di aiuto
- \`/help <comando>\` - Aiuto specifico per un comando

## Esempi di Utilizzo

\`\`\`
/init-session --deep
/save-commit "feat: Add OAuth support for Google and GitHub"
/ai-task run pre-commit-validate --depth thorough
/create-spec "Add dark mode toggle" --with-design
/check-docs react useCallback context7
\`\`\`

## Sicurezza
- I comandi che coinvolgono memoria (\`/save-commit\`) salvano **solo dopo** aver verificato che il codice sia stabile e funzionante
- Tutti i comandi rispettano le policy di sicurezza del progetto
`;

  return generalHelpText;
}

export async function executeHelp(params: string[]): Promise<CommandResult> {
  return {
    success: true,
    output: getHelpText(params[0])
  };
}

