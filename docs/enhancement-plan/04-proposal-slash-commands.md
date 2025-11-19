# Proposta Implementazione Comandi Slash Personalizzati

**Data:** 19 novembre 2025
**Autore:** Claude Code Assistant
**Status:** Proposal Phase - Ready for Review

## Executive Summary

Questa proposta descrive l'implementazione di 5 comandi slash personalizzati per ottimizzare i workflow ripetitivi nel progetto unified-ai-mcp-tool. I comandi saranno implementati come estensioni del sistema skills/hooks esistente e utilizzeranno i workflow già disponibili.

## Architettura Proposta

### Approccio Tecnico

I comandi slash saranno implementati attraverso:

1. **Slash Command Parser**: Hook che intercetta i messaggi utente che iniziano con `/`
2. **Command Skills**: Skills dedicate per ogni comando slash
3. **Workflow Integration**: Utilizzo diretto dei workflow esistenti tramite MCP calls
4. **Parameter Parsing**: Supporto per parametri e opzioni

### Integrazione con Sistema Esistente

- Utilizzo del framework skills/hooks già implementato in `.claude/`
- Integrazione con `smart-workflows.tool` per esecuzione workflow
- Utilizzo di `openmemory` per gestione memoria
- Supporto per tutti gli strumenti MCP esistenti (context7, deepwiki, etc.)

## Comandi Slash Proposti

### 1. `/init-session`

**Sintassi:** `/init-session [opzioni]`

**Scopo:** Inizializza una nuova sessione di lavoro con analisi automatica del contesto.

**Implementazione:**
- Chiama workflow `init-session` esistente
- Opzionalmente esegue ricerche memoria suggerite
- Mostra stato repository e suggerimenti per prossimi passi

**Parametri:**
- `--deep`: Analisi più approfondita (default: normale)
- `--no-memory`: Salta ricerca memorie automatica

**Workflow:**
1. Esegue `init-session` workflow
2. Analizza suggerimenti memoria
3. Mostra stato corrente progetto

### 2. `/save-commit`

**Sintassi:** `/save-commit "messaggio commit" [opzioni]`

**Scopo:** Salva lavoro stabile in memoria e crea commit con validazione automatica.

**Implementazione:**
- Valida stabilità codice (test + lint)
- Salva memoria in openmemory-cloud e locale
- Crea commit con messaggio fornito
- Collega memoria al commit

**Parametri:**
- `--force`: Salta validazione stabilità
- `--no-cloud`: Salta salvataggio cloud
- `--tag "tag"`: Aggiunge tag alla memoria

**Workflow Sicurezza:**
1. **VALIDAZIONE**: Esegue test e controlli qualità
2. **CONFERMA**: Chiede conferma utente per procedere
3. **MEMORIA**: Salva in cloud e locale
4. **COMMIT**: Crea commit con messaggio
5. **LINKING**: Collega commit alla memoria

### 3. `/ai-task`

**Sintassi:** `/ai-task <comando> [parametri]`

**Scopo:** Esegue workflow unified-ai-mcp con interfaccia semplificata.

**Sottocomandi:**
- `/ai-task list`: Lista workflow disponibili
- `/ai-task run <nome> [params]`: Esegue workflow specifico
- `/ai-task status`: Mostra status workflow in esecuzione

**Implementazione:**
- Lista workflow da `dist/workflows/`
- Parsing parametri JSON per workflow complessi
- Monitoraggio progresso esecuzione

**Esempi:**
```bash
/ai-task list
/ai-task run pre-commit-validate --depth thorough
/ai-task run bug-hunt --symptoms "500 error on upload"
/ai-task run feature-design --featureDescription "Add OAuth support"
```

### 4. `/create-spec`

**Sintassi:** `/create-spec "descrizione feature" [opzioni]`

**Scopo:** Crea documento specifiche per nuove feature/module.

**Implementazione:**
- Template guidato per specifiche
- Integrazione con workflow `feature-design` per analisi preliminare
- Salvataggio in `docs/specs/`

**Parametri:**
- `--template "tipo"`: Template specifico (api, ui, db, full)
- `--with-design`: Include analisi architetturale preliminare
- `--output "path"`: Percorso salvataggio custom

**Workflow:**
1. Raccolta requisiti guidata
2. Generazione template
3. Analisi preliminare (se richiesta)
4. Salvataggio e preview

### 5. `/check-docs`

**Sintassi:** `/check-docs <topic> [sorgente] [opzioni]`

**Scopo:** Ricerca documentazione rapida da multiple sorgenti.

**Sorgenti Supportate:**
- `context7`: Documentazione librerie esterne
- `deepwiki`: Wiki GitHub repository
- `local`: Documentazione progetto locale
- `all`: Ricerca in tutte le sorgenti

**Implementazione:**
- Routing intelligente basato su topic
- Caching risultati per performance
- Formattazione risultati unificata

**Esempi:**
```bash
/check-docs react useCallback
/check-docs mcp-setup local
/check-docs typescript generics context7
/check-docs workflow-api all
```

## Implementazione Tecnica Dettagliata

### Struttura File

```
.claude/
├── skills/
│   ├── slash-commands/
│   │   ├── init-session.skill.md
│   │   ├── save-commit.skill.md
│   │   ├── ai-task.skill.md
│   │   ├── create-spec.skill.md
│   │   └── check-docs.skill.md
│   └── skill-rules.json (aggiornato)
├── hooks/
│   ├── slash-command-parser.ts (nuovo)
│   └── slash-command-executor.sh (nuovo)
└── slash-commands/
    ├── parser.ts
    ├── executor.ts
    ├── commands.ts
    └── types.ts
```

### Hook di Parsing

```typescript
// .claude/hooks/slash-command-parser.ts
export function parseSlashCommand(message: string): SlashCommand | null {
  if (!message.startsWith('/')) return null;

  const [command, ...args] = message.slice(1).split(' ');
  const params = parseCommandArgs(args);

  return { command, params, raw: message };
}
```

### Sistema di Esecuzione

```typescript
// .claude/slash-commands/executor.ts
export async function executeSlashCommand(cmd: SlashCommand): Promise<CommandResult> {
  const handler = commandHandlers[cmd.command];
  if (!handler) {
    throw new Error(`Comando slash sconosciuto: /${cmd.command}`);
  }

  return await handler.execute(cmd.params);
}
```

## Integrazione Workflow

### Mappatura Comandi → Workflow

| Comando Slash | Workflow MCP | Parametri |
|---------------|--------------|-----------|
| `/init-session` | `init-session` | `{}` |
| `/save-commit` | `pre-commit-validate` + git | depth, message |
| `/ai-task run X` | `X` (dinamico) | workflow-specific |
| `/create-spec` | `feature-design` (opzionale) | feature spec |
| `/check-docs` | context7/deepwiki/local search | topic, source |

### Sicurezza e Validazione

- **Memory Safety**: Salvataggio memoria solo dopo validazione codice
- **Git Safety**: Commit solo dopo validazione pre-commit
- **Parameter Validation**: Sanitizzazione input per tutti i comandi
- **Error Recovery**: Fallback graceful per workflow falliti

## Testing Strategy

### Unit Testing
- Parser comandi slash
- Validazione parametri
- Handler esecuzione

### Integration Testing
- Esecuzione workflow completi
- Integrazione MCP tools
- Error handling

### User Acceptance Testing
- Workflow completi end-to-end
- Performance validation
- UX feedback

## Documentazione e Formazione

### Guida Utente
- Documentazione comandi in `docs/guides/slash-commands.md`
- Esempi pratici per ogni comando
- Troubleshooting comune

### Help System Integrato
- `/help`: Lista comandi disponibili
- `/help <comando>`: Documentazione specifica
- Suggerimenti automatici per comandi simili

## Metriche Successo

### KPI Tecnici
- Tempo esecuzione comandi (< 30s per comando semplice)
- Tasso successo esecuzione (> 95%)
- Riduzione token utilizzati vs approccio manuale (30-50%)

### KPI User Experience
- Tempo risparmio workflow ripetitivi (> 60%)
- Facilità apprendimento (curva < 15 minuti)
- Adozione comandi (80%+ task ripetitivi)

## Piano Implementazione

### Phase 1: Core Infrastructure (1 settimana)
- Creazione parser slash commands
- Setup struttura file
- Integrazione base con MCP

### Phase 2: Command Implementation (2 settimane)
- Implementazione 5 comandi base
- Testing unit e integration
- Error handling

### Phase 3: Enhancement & Polish (1 settimana)
- Ottimizzazioni performance
- UX improvements
- Documentazione completa

### Phase 4: Rollout & Training (1 settimana)
- Deploy produzione
- Training team
- Monitoraggio adozione

## Rischi e Mitigazioni

### Rischio: Integrazione MCP Instabile
**Mitigazione:** Testing estensivo pre-deploy, fallback a esecuzione manuale

### Rischio: Performance Degradation
**Mitigazione:** Caching risultati, esecuzione async, monitoring performance

### Rischio: User Adoption Bassa
**Mitigazione:** Training obbligatorio, documentazione chiara, feedback loop

## Conclusioni

Questa proposta fornisce un'implementazione robusta e integrata per comandi slash personalizzati che sfrutteranno i workflow esistenti per ottimizzare i task ripetitivi. L'approccio mantiene compatibilità con il sistema esistente mentre fornisce un'interfaccia utente significativamente migliorata.

**Raccomandazione:** Approvare implementazione secondo il piano proposto.

---

**Document Status:** Proposal - Awaiting Approval
**Estimated Effort:** 5 settimane
**Priority:** High (ottimizzazione workflow quotidiani)
