# Claude Code: Skills & Hooks - Guida Pratica

**Versione:** 1.0
**Data:** 2025-11-07
**Audience:** Sviluppatori che vogliono automatizzare Claude Code

---

## 📚 Indice

1. [Cosa Sono Skills & Hooks](#cosa-sono)
2. [Skills: Automazione Dichiarativa](#skills)
3. [Hooks: Automazione Procedurale](#hooks)
4. [Integrazione con unified-ai-mcp](#integrazione)
5. [Best Practices](#best-practices)

---

## 🎯 Cosa Sono Skills & Hooks {#cosa-sono}

**Skills** e **Hooks** sono i due meccanismi di automazione di Claude Code:

| Meccanismo | Tipo | Quando Si Attiva | Scopo |
|------------|------|-----------------|-------|
| **Skills** | Dichiarativo | Quando Claude legge `SKILL.md` | Dare istruzioni permanenti a Claude |
| **Hooks** | Procedurale | Su eventi specifici | Intercettare e modificare il workflow |

### Analogia Semplice

```
Skills  = "Manuale di istruzioni" per Claude
Hooks   = "Trigger automatici" su eventi
```

---

## 📖 Skills: Automazione Dichiarativa {#skills}

### Cos'è una Skill?

Una **Skill** è un file markdown che Claude legge automaticamente all'avvio, contenente istruzioni specializzate.

### Struttura Base

```
.claude/
├── skills/
│   └── unified-ai-orchestrator/
│       ├── SKILL.md          # Entry point (principale)
│       ├── ref/              # Documentazione dettagliata
│       │   ├── workflows.md
│       │   ├── permissions.md
│       │   └── examples.md
│       └── .claudeignore     # File da ignorare
```

### Esempio: SKILL.md per unified-ai-mcp

```markdown
# Unified AI Orchestrator Skill

You are an AI orchestration expert with access to the `unified-ai-mcp` tool.

## Core Capabilities

You can orchestrate multiple AI backends through smart workflows:
- **Qwen**: Fast analysis, testing, iteration
- **Gemini**: Deep reasoning, architecture, complex refactoring
- **Rovodev**: Production code, bug fixes, implementation

## Smart Workflows Available

Invoke via: `smart-workflows(workflow_name, params)`

### 1. parallel-review
Reviews code using multiple AI models in parallel for comprehensive feedback.

**When to use:** Code review, architecture validation
**Backends:** Gemini + Rovodev
**Example:**
```json
{
  "workflow": "parallel-review",
  "params": {
    "file_path": "src/auth.ts",
    "focus": "security"
  }
}
```

### 2. init-session
Analyzes recent commits and memories to provide context for the session.

**When to use:** Start of work session, resuming work
**Auto-triggers:** On session start (via hook)

### 3. validate-last-commit
Validates the most recent commit for issues, breaking changes, and quality.

**When to use:** After committing, before pushing
**Backends:** Gemini (analysis) + Qwen (quick checks)

## Recursive MCP Capability

**IMPORTANT:** Your workflows can invoke other MCP servers:
- `serena.*` - Symbol-level code surgery
- `claude-context.*` - Semantic code search
- `context7.*` - API documentation
- `deepwiki.*` - Repository analysis
- `openmemory.*` - Persistent memory

### Example Recursive Pattern

```typescript
// In workflow: use Serena + claude-context
const code = await claudeContext.search("auth middleware");
const symbols = await serena.findSymbol("AuthService");
const analysis = await gemini.analyze(code + symbols);
await serena.replaceSymbolBody("AuthService", improved_code);
```

## Decision Framework

### Use unified-ai-mcp when:
✅ Task requires multiple AI perspectives
✅ Need to orchestrate MCP servers autonomously
✅ Complex multi-step workflow
✅ Want to persist learning (openmemory)

### Use direct tools when:
❌ Simple single-model query
❌ Basic file operations
❌ Quick one-off tasks

## Progressive Disclosure

For detailed documentation on specific topics:
- Workflow parameters: `@.claude/skills/unified-ai-orchestrator/ref/workflows.md`
- Permission levels: `@.claude/skills/unified-ai-orchestrator/ref/permissions.md`
- Real examples: `@.claude/skills/unified-ai-orchestrator/ref/examples.md`

**Load refs only when needed to save tokens.**
```

### Principio: Progressive Disclosure

✅ **SKILL.md principale**: Conciso (<500 righe), overview
✅ **ref/*.md**: Dettagli approfonditi, caricati on-demand
✅ **Saving tokens**: Claude carica refs solo quando serve

### Come Claude Usa le Skills

1. **Session start**: Legge tutti i `SKILL.md` in `.claude/skills/*/`
2. **Durante lavoro**: Segue le istruzioni della skill
3. **On-demand**: Carica `ref/*.md` quando @-menzionati

---

## 🪝 Hooks: Automazione Procedurale {#hooks}

### Cos'è un Hook?

Un **Hook** è uno script che si attiva automaticamente su eventi specifici del workflow di Claude.

### Hook Disponibili (Completi)

| Hook | Quando Si Attiva | Input Ricevuto | Output Atteso |
|------|-----------------|----------------|---------------|
| `SessionStart` | All'inizio sessione | Session info | Messages to prepend |
| `SessionEnd` | Alla fine sessione | Session stats | Cleanup actions |
| `UserPromptSubmit` | Prima che Claude processi prompt | User message | Modified context/tools |
| `PreToolUse` | Prima dell'esecuzione tool | Tool name + args | Allow/deny/modify |
| `PostToolUse` | Dopo esecuzione tool | Tool result | Validation/actions |
| `PreCompact` | Prima di compattare context | Messages to compact | Modified messages |
| `Stop` | Quando loop termina | Final state | Cleanup/reporting |

### Struttura Hook Script

```
.claude/
└── hooks/
    ├── UserPromptSubmit.js       # Hook per intercettare prompt
    ├── PostToolUse.js            # Hook post-esecuzione
    ├── SessionStart.js           # Hook avvio sessione
    └── PreToolUse.js             # Hook pre-esecuzione
```

### Esempio 1: UserPromptSubmit (Auto-trigger Workflows)

```javascript
// .claude/hooks/UserPromptSubmit.js
/**
 * Hook: Intercetta prompt utente e attiva workflow automaticamente
 * Usa pattern matching per mappare intenti a smart-workflows
 */

const intentPatterns = {
  // Code review patterns
  'review-code': [
    /review (this |the )?code/i,
    /code review/i,
    /check (this |the )?code/i
  ],

  // Session initialization
  'init-session': [
    /what did i work on/i,
    /catch me up/i,
    /session (summary|context)/i,
    /resume work/i
  ],

  // Validation patterns
  'validate-commit': [
    /validate (last |this )?commit/i,
    /check my commit/i
  ]
};

module.exports = async function UserPromptSubmitHook(context) {
  const { userMessage } = context;

  // Detect intent from user message
  for (const [workflow, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(userMessage)) {
        console.log(`[Hook] Auto-triggering workflow: ${workflow}`);

        // Inject workflow invocation into context
        return {
          additionalContext: `\n\n[Auto-triggered by hook] Execute: smart-workflows("${workflow}")`
        };
      }
    }
  }

  // No match - proceed normally
  return {};
};
```

### Esempio 2: PostToolUse (Validation + Auto-fix)

```javascript
// .claude/hooks/PostToolUse.js
/**
 * Hook: Valida risultati tool e triggera auto-correzione
 */

module.exports = async function PostToolUseHook(context) {
  const { toolName, result, arguments: toolArgs } = context;

  // Valida solo smart-workflows
  if (toolName !== 'smart-workflows') {
    return {};
  }

  const workflow = toolArgs.workflow;

  // Parse result per cercare fallimenti
  const hasErrors = result.includes('error') ||
                   result.includes('failed') ||
                   result.includes('❌');

  if (hasErrors) {
    console.log(`[Hook] Workflow ${workflow} failed, triggering auto-fix`);

    return {
      systemMessage: `⚠️ Workflow ${workflow} encountered errors. Consider:
1. Analyzing error with: smart-workflows("validate-last-commit")
2. Using Serena to inspect symbols that caused issues
3. Re-running with different backend model`,

      // Opzionale: auto-trigger fix workflow
      continue: true
    };
  }

  // Success - salva learning in openmemory
  if (result.includes('success') || result.includes('✅')) {
    console.log(`[Hook] Workflow ${workflow} succeeded, persisting learning`);

    return {
      systemMessage: `✅ Workflow ${workflow} completed successfully.
Consider saving this pattern to openmemory for future reference.`
    };
  }

  return {};
};
```

### Esempio 3: SessionStart (Context Initialization)

```javascript
// .claude/hooks/SessionStart.js
/**
 * Hook: Auto-inizializza context all'avvio
 */

module.exports = async function SessionStartHook(context) {
  const { projectPath, branchName } = context;

  console.log(`[Hook] Session started on branch: ${branchName}`);

  // Auto-trigger init-session workflow per context
  return {
    additionalMessages: [
      {
        role: 'user',
        content: 'Execute init-session workflow to catch me up on recent work'
      }
    ]
  };
};
```

### Hook Output Format

Gli hook possono restituire:

```javascript
{
  // Continua esecuzione?
  continue: true,  // default: true

  // Messaggi da aggiungere al context
  additionalMessages: [
    { role: 'user', content: '...' },
    { role: 'assistant', content: '...' }
  ],

  // Context aggiuntivo (UserPromptSubmit only)
  additionalContext: "String appended to prompt",

  // System message per Claude
  systemMessage: "Warning or info for Claude",

  // Redirect tool call (PreToolUse only)
  redirect: {
    tool: 'different-tool',
    arguments: { ... }
  }
}
```

---

## 🔗 Integrazione con unified-ai-mcp {#integrazione}

### Pattern 1: Skill → Tool Invocation

```markdown
<!-- SKILL.md -->
## When User Says "review this code"

Execute: smart-workflows("parallel-review", { file_path: <path> })
```

Claude legge skill → capisce mapping → invoca tool

### Pattern 2: Hook → Auto-trigger Workflow

```javascript
// UserPromptSubmit.js
if (/review code/i.test(userMessage)) {
  return {
    additionalContext: `Execute: smart-workflows("parallel-review")`
  };
}
```

Hook intercetta prompt → inietta comando → Claude esegue

### Pattern 3: Workflow → MCP Recursion

```typescript
// Nel workflow TypeScript
async function parallelReviewWorkflow(params) {
  // 1. Usa claude-context MCP
  const code = await claudeContext.search(params.file_path);

  // 2. Usa Serena MCP
  const symbols = await serena.findSymbol("MainClass");

  // 3. Esegui AI analysis
  const review = await gemini.analyze(code + symbols);

  // 4. Salva in openmemory MCP
  await openmemory.store({
    content: `Review pattern: ${review.insights}`,
    metadata: { workflow: "parallel-review", success: true }
  });

  return review;
}
```

Workflow invoca autonomamente tutti gli MCP servers disponibili!

### Architettura Completa

```
User: "review this code"
  ↓
SessionStart hook (auto-init context)
  ↓
UserPromptSubmit hook (intercetta intent)
  ↓ (inietta: Execute smart-workflows("parallel-review"))
  ↓
Claude legge SKILL.md (capisce come usare tool)
  ↓
Claude invoca: smart-workflows("parallel-review")
  ↓
Workflow esegue autonomamente:
  ├─> claude-context.search()
  ├─> serena.findSymbol()
  ├─> gemini.analyze()
  └─> openmemory.store()
  ↓
PostToolUse hook (valida risultato)
  ↓
SessionEnd hook (cleanup)
```

---

## ✅ Best Practices {#best-practices}

### Skills

1. **Progressive Disclosure**: SKILL.md conciso, dettagli in `ref/`
2. **Decision Framework**: Quando usare il tool, quando no
3. **Examples First**: Mostra esempi pratici subito
4. **Token Efficient**: <500 righe main skill, load refs on-demand

### Hooks

1. **Fail Safe**: Sempre `return {}` se nessuna azione
2. **Logging**: Console.log per debug (`--debug` flag)
3. **Performance**: Hook veloci (<100ms), no blocking operations
4. **Error Handling**: Try-catch, non bloccare workflow

### Integrazione

1. **Separation of Concerns**:
   - Skills = "Cosa può fare" (dichiarativo)
   - Hooks = "Quando farlo" (procedurale)
   - Workflow = "Come farlo" (implementazione)

2. **Avoid Duplication**:
   - ❌ Non duplicare logica tra skill e hook
   - ✅ Skill spiega capability, hook triggera

3. **Test Incrementally**:
   - Testa skill standalone
   - Aggiungi hook uno alla volta
   - Valida con `--debug` flag

---

## 📚 Risorse

- **Skills Official Docs**: https://docs.claude.com/en/docs/claude-code/skills
- **Hooks Official Docs**: https://docs.claude.com/en/docs/claude-code/hooks
- **Progressive Disclosure Pattern**: https://github.com/wshobson/agents
- **Hook Examples**: https://github.com/diet103/claude-code-infrastructure-showcase

---

## 🎯 Next Steps - Iterazione Continua

### Immediate (Sistema Base Attivo ✅)

**Status attuale**: Sistema skills/hooks configurato e funzionante con:
- 9 skills totali (7 aggiornate + 2 nuove: serena-surgical-editing, unified-ai-orchestration)
- 4 hooks attivi (UserPromptSubmit, PostToolUse tracking)
- skill-rules.json con pattern matching per auto-activation

### Short-Term (Quando Hai Esempi Reali)

#### 1. Aggiungi Progressive Disclosure alle Skills

Quando una skill diventa troppo lunga o hai esempi pratici da condividere, struttura con `ref/`:

```bash
.claude/skills/serena-surgical-editing/
├── SKILL.md              # Mantieni <500 righe, overview
└── ref/
    ├── workflows.md      # Workflow dettagliati con esempi reali
    ├── examples.md       # Casi d'uso concreti dal tuo lavoro
    └── troubleshooting.md # Problemi comuni e soluzioni
```

**Nel SKILL.md principale**, aggiungi alla fine:
```markdown
## Progressive Disclosure

Per informazioni dettagliate:
- Workflow completi: `@.claude/skills/serena-surgical-editing/ref/workflows.md`
- Esempi pratici: `@.claude/skills/serena-surgical-editing/ref/examples.md`
- Troubleshooting: `@.claude/skills/serena-surgical-editing/ref/troubleshooting.md`

**Carica refs solo quando necessario per risparmiare token.**
```

#### 2. Raffina Hook Basandoti su Uso Reale

Monitora quali skills vengono triggerate e quando:

```bash
# Controlla i log degli hook
tail -f .claude/tsc-cache/*/context-reminders.log
tail -f .claude/tsc-cache/*/memory-search-reminders.log
```

**Aggiungi pattern che mancano** a `skill-rules.json`:
```json
// Se noti che "refactor class" non triggera serena-surgical-editing
"keywords": [
  "edit",
  "refactor",
  "class refactor",  // ← aggiungi pattern specifico
  // ...
]
```

#### 3. Aggiungi Esempi Concreti a skill-rules.json

Quando trovi pattern che funzionano bene, aggiungili:

```json
"serena-surgical-editing": {
  "promptTriggers": {
    "keywords": [
      "edit function executeAIClient",  // ← esempio reale dal tuo progetto
      "refactor workflow handler",      // ← esempio reale
      // ...
    ]
  }
}
```

### Medium-Term (Ottimizzazione)

#### 4. Crea Memory Pattern Library

Dopo aver usato le skills con successo, salva i pattern in openmemory:

```bash
openmemory-add-memory "Used serena-surgical-editing for refactoring executeAIClient: found 9 references with find_referencing_symbols, prevented breaking changes. Pattern works well for symbol-level surgery."
```

Poi nelle skills, referenzia questi pattern:
```markdown
## Proven Patterns (From Memory)

Search memories for: `openmemory-search-memories "serena refactoring pattern"`
```

#### 5. Sviluppa Hook Personalizzati

Basandoti sui tuoi workflow più comuni, crea hook specifici:

**Esempio**: Auto-trigger Serena quando modifichi file >300 LOC

```bash
# .claude/hooks/auto-serena-trigger.sh
if [[ "$FILE_SIZE" -gt 300 ]]; then
  echo "💡 File >300 LOC detected. Consider using serena-surgical-editing skill for token efficiency."
fi
```

### Long-Term (Conformità Ufficiale - Opzionale)

#### 6. Rimuovi skill-rules.json (Se Vuoi Conformità)

**Perché**: skill-rules.json non è una feature ufficiale di Claude Code

**Come**:
1. Sposta pattern matching negli hook TypeScript
2. Implementa logica dinamica in `skill-activation-prompt.ts`
3. Usa Progressive Disclosure invece di JSON statico

**Esempio hook TypeScript con pattern matching integrato**:
```typescript
// .claude/hooks/skill-activation-prompt.ts
const dynamicPatterns = {
  'serena-surgical-editing': {
    test: (msg: string) =>
      /edit.*?(function|class)/i.test(msg) ||
      /refactor.*?code/i.test(msg),
    priority: 'high'
  }
};
```

**Pro**: Conformità ufficiale, più flessibile
**Contro**: Più lavoro iniziale, richiede TypeScript

#### 7. Integra con Smart Workflows

Quando implementi gli smart-workflows di `unified-ai-mcp-tool`:

**Hook → Workflow Integration**:
```javascript
// UserPromptSubmit.js
if (/review this code/i.test(userMessage)) {
  return {
    additionalContext: `Execute: smart-workflows("parallel-review")`
  };
}
```

**Skill → Workflow Reference**:
```markdown
## Integration with Smart Workflows

When using this skill with smart-workflows:
- Use `parallel-review` workflow for comprehensive validation
- Use `refactor-with-research` workflow for architectural changes
```

### Testing & Validation

#### Testa Nuove Skills

```bash
# 1. Trigger manual di una skill
# Digita un prompt che dovrebbe attivare serena-surgical-editing
echo "I want to refactor the executeAIClient function"

# 2. Verifica che l'hook suggerisca la skill corretta
# Dovresti vedere: "💡 Consider: Serena for precise, safe edits"

# 3. Usa la skill e valida i risultati
# Se funziona bene, aggiungi esempio a ref/examples.md
```

#### Debug Hook Issues

```bash
# Enable debug mode
claude --debug

# Check hook output
cat .claude/tsc-cache/*/skill-activation.log

# Validate JSON syntax
python3 -m json.tool .claude/skills/skill-rules.json
```

## Roadmap Consigliata

| Fase | Quando | Azione | Tempo |
|------|--------|--------|-------|
| **Fase 1** ✅ | Oggi | Sistema base implementato | 1h (completato) |
| **Fase 2** | Questa settimana | Testa skills, raccogli esempi reali | 2-3h uso normale |
| **Fase 3** | Prossimo mese | Aggiungi ref/*.md con esempi concreti | 1-2h |
| **Fase 4** | Continuo | Raffina hook e pattern basandoti su uso | Ongoing |
| **Fase 5** | Opzionale | Rimuovi skill-rules.json per conformità | 3-4h |

## Principio Chiave: Itera, Non Pianificare

✅ **DO**:
- Usa il sistema come è ora
- Aggiungi pattern quando li scopri
- Raffina basandoti su esperienza reale
- Salva esempi concreti in ref/*.md

❌ **DON'T**:
- Non pianificare tutte le skills in anticipo
- Non creare ref/*.md vuoti "per completezza"
- Non raffinare hook senza dati di uso reale
- Non rimuovere skill-rules.json finché non hai alternativa funzionante

Il sistema diventa davvero autonomo quando Skills + Hooks + Workflows lavorano insieme, **iterando basandoti sull'uso reale**! 🚀
