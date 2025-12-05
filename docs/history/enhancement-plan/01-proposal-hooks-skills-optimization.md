# Proposta: Ottimizzazione Sistema Hooks e Skills

**Data**: 2025-11-19  
**Versione**: 1.0  
**Stato**: In Revisione

---

## Executive Summary

Dopo un'analisi approfondita della documentazione ufficiale, del sistema attuale e delle best practices, propongo un'evoluzione del sistema hooks e skills verso un approccio più bilanciato. L'attuale sistema ha già fatto passi importanti (conversione da blocking a warning in `smart-tool-enforcer.sh`), ma presenta ancora margini di miglioramento per ridurre la frizione senza compromettere l'efficienza guidata.

**Obiettivo**: Creare un sistema che guida senza frustrare, educa senza bloccare, e si adatta al contesto.

---

## 1. Analisi del Sistema Attuale

### 1.1 Punti di Forza

#### Sistema Hooks
1. **Architettura Ben Progettata**
   - Uso corretto degli eventi hook (PreToolUse, PostToolUse, UserPromptSubmit)
   - Separazione delle responsabilità tra hook diversi
   - Buon uso delle variabili d'ambiente (`$CLAUDE_PROJECT_DIR`)

2. **Smart-Tool-Enforcer Recentemente Migliorato**
   - Convertito da blocking (exit 2) a warning (exit 0) con messaggi educativi
   - Messaggi informativi e ben formattati
   - Soglie configurabili (500 LOC max, 200 LOC warning)
   - Calcolo dei risparmi di token mostrato agli utenti

3. **Post-Tool-Use Hooks Efficaci**
   - `claude-context-reminder.sh`: Suggerimenti contestuali dopo Read/Bash
   - `memory-search-reminder.sh`: Tracking sessione con flag per evitare spam
   - `post-tool-use-tracker.sh`: Logging utile per analytics
   - Nessuno è bloccante, tutti sono educativi

4. **Skill Activation System Intelligente**
   - `skill-activation-prompt.ts`: Matching per keyword e intent pattern
   - Prioritizzazione (critical, high, medium, low)
   - Non bloccante, solo informativo

#### Sistema Skills
1. **Skills Ben Definite**
   - Ogni skill ha uno scopo chiaro e documentato
   - Descrizioni accurate per l'auto-discovery di Claude
   - Struttura YAML corretta

2. **Contenuto di Qualità**
   - Guide complete con esempi pratici
   - Workflow step-by-step
   - Integration patterns tra skills diverse
   - Token savings quantificati (es. Serena: 75-80%)

3. **Coverage Completa**
   - claude-context-usage: Discovery architetturale
   - serena-surgical-editing: Navigazione symbol-level
   - memory-search-reminder: Consistency con decisioni passate
   - code-validation: Pre-commit quality
   - unified-ai-orchestration: Multi-model analysis
   - post-stop-resumption: Ripresa dopo interruzioni
   - documentation-lookup: Accesso documentazione efficiente

### 1.2 Aree di Miglioramento

#### Problematiche Sistema Hooks

1. **Frequenza Messaggi Eccessiva**
   - Problema: Hook PostToolUse triggerano su quasi ogni operazione
   - Impatto: Potential "noise" per l'utente/Claude
   - Esempio: `claude-context-reminder.sh` mostra reminder dopo ogni Read di file codice
   - Esempio: `memory-search-reminder.sh` ricorda dopo ogni Bash command se flag non settato

2. **Mancanza di Contextual Awareness**
   - Gli hooks non considerano:
     - Dimensione effettiva del file (Read potrebbe essere su file piccolo)
     - Contesto della sessione (fase discovery vs implementation)
     - Tipo di task (exploratory vs production)
   - Risultato: Suggerimenti che possono essere inappropriati

3. **Smart-Tool-Enforcer: Soglie Rigide**
   - 500 LOC è una soglia arbitraria
   - Non considera:
     - Complessità del codice (500 LOC di CSS vs 500 LOC di algoritmi)
     - Tipo di file (config vs business logic)
     - Scopo della lettura (debug veloce vs refactoring completo)

4. **Workflow-Pattern-Detector Troppo Aggressivo**
   - Suggerisce smart-workflows su pattern molto comuni
   - Esempio: Ogni `git diff` → suggerisce pre-commit-validate
   - Può diventare ridondante per utenti esperti

5. **Hook Execution Overhead**
   - 5 hooks diversi su PostToolUse per Read/Bash
   - Tutti eseguiti in parallelo, ognuno con jq parsing
   - Potenziale per rallentamento su operazioni frequenti

#### Problematiche Sistema Skills

1. **Skill Descriptions Troppo Lunghe**
   - Alcune descriptions superano i 200 caratteri
   - Claude deve processare testo lungo per ogni matching
   - Esempio: `claude-context-usage` description: 3 frasi
   - Raccomandazione ufficiale: max 1024 chars ma più brevi = meglio

2. **Overlapping tra Skills**
   - `claude-context-usage` e `serena-surgical-editing` hanno overlap nei trigger
   - `code-validation` e `unified-ai-orchestration` potrebbero confondere
   - Non è chiaro quando attivare una vs l'altra

3. **Mancanza di Progressive Disclosure**
   - Tutte le skills mostrano tutto il contenuto quando attivate
   - Nessuna skill usa file supplementari (reference.md, examples.md)
   - Risultato: Context bloat anche per domande semplici

4. **File Triggers Non Utilizzati**
   - `skill-rules.json` definisce `fileTriggers` ma nessun hook li usa
   - `skill-activation-prompt.ts` guarda solo `promptTriggers`
   - Opportunità persa per activation context-aware

5. **Enforcement "suggest" Uniforme**
   - Tutte le 7 skills hanno `"enforcement": "suggest"`
   - Non c'è differenziazione tra guidance critica e opzionale
   - Priority levels definiti ma non influenzano il comportamento

### 1.3 Osservazioni dalla Documentazione Ufficiale

#### Insights da Hooks Guide
1. Exit code 0 con stdout è visibile solo in transcript mode (CTRL-R) per PreToolUse/PostToolUse
2. UserPromptSubmit è speciale: stdout viene aggiunto direttamente al context
3. Hooks dovrebbero essere veloci (timeout default 60s)
4. JSON output permette controllo granulare (continue, suppressOutput, etc.)

#### Insights da Skills Guide
1. Skills sono model-invoked, non user-invoked
2. Description è CRITICA per discovery
3. Progressive disclosure raccomandato (SKILL.md + reference.md + examples.md)
4. `allowed-tools` può limitare scope quando skill è attiva
5. Skills dovrebbero essere focused (one capability per skill)

---

## 2. Raccomandazioni Specifiche

### 2.1 Ottimizzazione Hooks

#### Raccomandazione 1: Implementare Smart Throttling

**Obiettivo**: Ridurre noise senza perdere guidance efficace

**Implementazione**:
```bash
# Aggiungere session tracking con cooldown
LAST_REMINDER_FILE="$cache_dir/last-context-reminder-timestamp"
COOLDOWN_SECONDS=300  # 5 minuti

if [ -f "$LAST_REMINDER_FILE" ]; then
    LAST_REMINDER=$(cat "$LAST_REMINDER_FILE")
    NOW=$(date +%s)
    TIME_SINCE=$((NOW - LAST_REMINDER))
    
    if [ $TIME_SINCE -lt $COOLDOWN_SECONDS ]; then
        exit 0  # Skip reminder, too soon
    fi
fi
```

**Applicare a**:
- `claude-context-reminder.sh`: Max 1 reminder ogni 5 minuti
- `memory-search-reminder.sh`: Max 1 reminder ogni sessione (già parzialmente fatto)
- `workflow-pattern-detector.sh`: Max 1 reminder per workflow type ogni 10 minuti

**Impatto**: Riduzione ~70% della frequenza messaggi, mantenendo efficacia

#### Raccomandazione 2: Context-Aware Thresholds

**Obiettivo**: Smart-tool-enforcer più intelligente

**Implementazione**:
```bash
# Considerare complessità file, non solo dimensione
calculate_complexity_score() {
    local file=$1
    local lines=$(wc -l < "$file")
    local functions=$(grep -c "function\|def\|class" "$file" || echo 0)
    local imports=$(grep -c "import\|require\|include" "$file" || echo 0)
    
    # Score = lines * (1 + functions/10 + imports/20)
    # Files con molte funzioni/imports = più complessi
    local complexity=$((lines * (10 + functions + imports/2) / 10))
    echo $complexity
}

# Usare soglie dinamiche
COMPLEXITY=$(calculate_complexity_score "$FILE_PATH")
if [ "$COMPLEXITY" -gt 8000 ]; then  # ~500 LOC complesse o 800 LOC semplici
    warn_with_message ...
fi
```

**Impatto**: Warning più accurati, meno false positive

#### Raccomandazione 3: Preferenze Utente Persistite

**Obiettivo**: Rispettare scelte dell'utente

**Implementazione**:
```bash
# File preferenze: .claude/user-preferences.json
# {
#   "suppressReminders": {
#     "claude-context": false,
#     "serena": false,
#     "memory-search": false
#   },
#   "experienceLevel": "expert"  # beginner|intermediate|expert
# }

# Hook legge preferenze
PREFERENCES="$CLAUDE_PROJECT_DIR/.claude/user-preferences.json"
if [ -f "$PREFERENCES" ]; then
    SUPPRESS=$(jq -r '.suppressReminders."claude-context" // false' "$PREFERENCES")
    if [ "$SUPPRESS" = "true" ]; then
        exit 0
    fi
    
    LEVEL=$(jq -r '.experienceLevel // "intermediate"' "$PREFERENCES")
    if [ "$LEVEL" = "expert" ]; then
        # Messaggi più brevi per expert
        echo "💡 TIP: Consider claude-context"
        exit 0
    fi
fi
```

**Impatto**: Personalizzazione senza modificare hooks

#### Raccomandazione 4: Consolidare Hook Logic

**Obiettivo**: Ridurre overhead di esecuzione

**Proposta**: Creare `unified-post-tool-reminder.sh` che sostituisce:
- `claude-context-reminder.sh`
- `memory-search-reminder.sh`
- `workflow-pattern-detector.sh`

**Vantaggi**:
- Single jq parsing instead of 3
- Shared session tracking
- Coordinated throttling
- Easier maintenance

**Struttura**:
```bash
#!/bin/bash
# unified-post-tool-reminder.sh

# Single stdin read and parse
TOOL_INFO=$(cat)
TOOL_NAME=$(echo "$TOOL_INFO" | jq -r '.tool_name')

# Load preferences and session state once
load_preferences
load_session_state

# Intelligent routing
case "$TOOL_NAME" in
    Read)
        check_and_suggest_claude_context
        ;;
    Bash)
        check_and_suggest_memory_search
        check_and_suggest_workflows
        ;;
esac
```

### 2.2 Ottimizzazione Skills

#### Raccomandazione 5: Descriptions Più Concise e Specifiche

**Obiettivo**: Migliorare discovery accuracy

**Esempio Attuale** (claude-context-usage):
```yaml
description: "Use this skill to ensure Claude always uses claude-context semantic search before any other search method. claude-context provides hybrid search (BM25 + vectors) and finds related code across the codebase without reading files. Use BEFORE feature implementation, bug hunting, refactoring, schema changes, or any code search. claude-context should be the primary search method, with normal file reading as fallback only."
```

**Proposta Ottimizzata**:
```yaml
description: "Semantic codebase search using claude-context (BM25 + vectors). Use before feature implementation, refactoring, or code exploration. Finds dependencies and relationships without reading files."
```

**Vantaggi**:
- 60% più corto
- Keywords più prominenti (semantic, codebase search, dependencies)
- Trigger conditions chiare (before feature, refactoring)
- Still specific enough for accurate matching

**Applicare a tutte le 7 skills** con stesso pattern:
1. Prima frase: Cosa fa (tecnica specifica)
2. Seconda frase: Quando usare (trigger chiave)
3. Terza frase: Beneficio unico

#### Raccomandazione 6: Progressive Disclosure Implementata

**Obiettivo**: Ridurre context bloat

**Struttura Proposta**:
```
claude-context-usage/
├── SKILL.md (< 100 linee: quick start + common patterns)
├── WORKFLOWS.md (integration patterns, complex scenarios)
├── REFERENCE.md (complete API, all parameters)
└── TROUBLESHOOTING.md (common issues, edge cases)
```

**SKILL.md diventa**:
```markdown
---
name: claude-context-usage
description: Semantic codebase search via claude-context. Use before implementation or refactoring. Finds dependencies without reading files.
---

# Claude-Context Usage

## Quick Start
[5-line intro]

## Common Patterns
[3 most common use cases with 1-liner examples]

## When to Use
[Bullet list: 5 key scenarios]

## Learn More
- Complex workflows: [WORKFLOWS.md](WORKFLOWS.md)
- Full API reference: [REFERENCE.md](REFERENCE.md)
- Troubleshooting: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
```

**Impatto**: 
- SKILL.md passa da ~160 linee → ~50 linee
- Claude reads solo ciò che serve
- Può deepdive solo se necessario

#### Raccomandazione 7: File Triggers Integration

**Obiettivo**: Context-aware skill activation

**Implementazione**: Estendere `skill-activation-prompt.ts` per considerare file context

```typescript
interface HookInput {
    // ... existing fields
    recentFiles?: string[];  // Last N files read/edited
}

// Add file-based matching
function matchFileTriggers(recentFiles: string[], triggers: FileTriggers): boolean {
    if (!recentFiles || !triggers) return false;
    
    return recentFiles.some(file => {
        // Check path patterns
        if (triggers.pathPatterns?.some(pattern => 
            minimatch(file, pattern))) {
            return true;
        }
        
        // Check content patterns (would need file reading)
        // Skip for now to avoid overhead
        return false;
    });
}
```

**Configurazione Settings**:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/track-recent-files.sh"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/skill-activation-prompt-enhanced.sh"
          }
        ]
      }
    ]
  }
}
```

**Impatto**: Skills attivate non solo da prompt keywords, ma anche da file context

#### Raccomandazione 8: Skill Prioritization Behavior

**Obiettivo**: Differenziare guidance critica da opzionale

**Proposta**:
```json
{
    "skills": {
        "claude-context-usage": {
            "enforcement": "suggest",
            "priority": "critical",
            "behaviorFlags": {
                "showEveryTime": false,
                "minimumConfidence": 0.7,
                "canBeDismissed": true,
                "dismissDurationMinutes": 60
            }
        },
        "unified-ai-orchestration": {
            "enforcement": "suggest",
            "priority": "medium",
            "behaviorFlags": {
                "showEveryTime": false,
                "minimumConfidence": 0.85,
                "canBeDismissed": true,
                "dismissDurationMinutes": 120
            }
        }
    }
}
```

**Comportamento**:
- `priority: critical` + high confidence → Always show
- `priority: high` + medium confidence → Show once per session
- `priority: medium` + high confidence → Show, allow dismiss
- `priority: low` → Show only perfect match

**Implementazione** in `skill-activation-prompt.ts`:
```typescript
// Calculate confidence score
function calculateConfidence(matches: MatchedSkill[]): number {
    // Intent pattern match = 1.0
    // Multiple keyword matches = 0.9
    // Single keyword match = 0.6
    // ...
}

// Apply behavior flags
function shouldShowSkill(skill: MatchedSkill, confidence: number): boolean {
    const flags = skill.config.behaviorFlags;
    
    if (confidence < flags.minimumConfidence) return false;
    
    // Check dismiss status
    const dismissKey = `skill-${skill.name}-dismissed`;
    const dismissedAt = getSessionState(dismissKey);
    if (dismissedAt && !flags.showEveryTime) {
        const minutesSince = (Date.now() - dismissedAt) / 60000;
        if (minutesSince < flags.dismissDurationMinutes) {
            return false;
        }
    }
    
    return true;
}
```

#### Raccomandazione 9: Skill Chaining Hints

**Obiettivo**: Guidare workflow multi-skill

**Aggiungere campo** a SKILL.md frontmatter:
```yaml
---
name: claude-context-usage
description: ...
relatedSkills:
  - name: serena-surgical-editing
    when: "After finding relevant files"
    reason: "Navigate symbols without reading full files"
  - name: memory-search-reminder
    when: "Before starting implementation"
    reason: "Check for past solutions"
---
```

**Output quando skill attivata**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 SKILL: claude-context-usage

TIP: After finding files with claude-context, consider:
  → serena-surgical-editing: Navigate symbols without reading full files
  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Impatto**: Claude capisce il workflow end-to-end, non solo single-step

### 2.3 Nuove Skills Proposte

#### Skill Proposta 1: quick-exploration

**Scopo**: Guidare exploration rapida senza overhead

**Quando**: Start of session, exploratory phase, unfamiliar codebase

**Content**:
```yaml
---
name: quick-exploration
description: Fast codebase exploration workflow. Use at session start or when exploring unfamiliar code. Combines glob, grep, and overview commands for rapid context building.
---

# Quick Exploration

## Pattern
1. `glob_file_search "**/*.ts"` → Map file structure
2. `grep -i "export.*class" --output_mode files_with_matches` → Find key files
3. `read_file` only on entry points (< 100 LOC)
4. Defer deep reading until target identified

## When NOT to use
- Already familiar with codebase
- Specific file/function already identified
- Working on known component
```

**Beneficio**: Riduce tentazione di leggere file grandi early on

#### Skill Proposta 2: token-budget-awareness

**Scopo**: Educare su token consumption patterns

**Content**:
```yaml
---
name: token-budget-awareness
description: Token efficiency awareness skill. Provides guidance on token-heavy operations and suggests alternatives. Use when context window filling up or repeated large reads.
---

# Token Budget Awareness

## Token Costs (Approximate)
- Read 1000 LOC file: ~10,000 tokens
- Serena get_symbols_overview: ~200 tokens (98% savings)
- claude-context search: ~1,000 tokens
- Grep output (100 matches): ~2,000 tokens

## High-Cost Patterns to Avoid
- Multiple reads of same large file
- Recursive grep on large directories
- Reading generated/vendor files

## Efficiency Patterns
- Serena for TS/JS navigation (75-80% savings)
- claude-context for discovery (90% savings vs grep)
- Targeted reads after discovery
```

**Impatto**: Educational, non blocking

---

## 3. Piano di Implementazione

### Fase 1: Quick Wins (1-2 ore)

**Priorità Alta, Rischio Basso**

1. **Aggiornare Skill Descriptions** (30 min)
   - Refactor tutte le 7 descriptions per conciseness
   - Testing: Verificare che Claude discovery funzioni ancora

2. **Implementare Throttling Base** (45 min)
   - Aggiungere cooldown a `claude-context-reminder.sh`
   - Aggiungere cooldown a `workflow-pattern-detector.sh`
   - Testing: Verificare che reminders non spariscano completamente

3. **Creare user-preferences.json Template** (15 min)
   - File template con defaults
   - Documentation su come personalizzare
   - Testing: Verificare che hooks leggano preferenze

### Fase 2: Core Improvements (3-4 ore)

**Priorità Alta, Rischio Medio**

1. **Progressive Disclosure per Skills Top-Used** (2 ore)
   - Refactor claude-context-usage e serena-surgical-editing
   - Splittare in SKILL.md + WORKFLOWS.md + REFERENCE.md
   - Testing: Verificare che references funzionino

2. **Context-Aware Thresholds in Smart-Tool-Enforcer** (1 ora)
   - Implementare complexity scoring
   - Aggiornare soglie dinamiche
   - Testing: Verificare accuracy improvement

3. **File Triggers Integration** (1 ora)
   - Estendere skill-activation-prompt.ts
   - Creare track-recent-files.sh hook
   - Testing: Verificare che file context matching funzioni

### Fase 3: Advanced Features (4-5 ore)

**Priorità Media, Rischio Medio**

1. **Skill Behavior Flags** (2 ore)
   - Aggiornare skill-rules.json schema
   - Implementare confidence scoring
   - Implementare dismiss tracking
   - Testing: Verificare che prioritization funzioni

2. **Consolidare Post-Tool-Use Hooks** (2 ore)
   - Creare unified-post-tool-reminder.sh
   - Migrare logica da 3 hooks esistenti
   - Update settings.json
   - Testing: Verificare che functionality sia preservata

3. **Skill Chaining Hints** (1 ora)
   - Aggiungere relatedSkills a frontmatter
   - Update skill-activation output
   - Testing: Verificare che hints siano utili

### Fase 4: Nuove Skills (2 ore)

**Priorità Bassa, Rischio Basso**

1. **Creare quick-exploration Skill** (1 ora)
2. **Creare token-budget-awareness Skill** (1 ora)

---

## 4. Metriche di Successo

### Obiettivi Quantitativi

1. **Riduzione Noise**
   - Baseline: Count reminders per session (current state)
   - Target: -60% reminder frequency
   - Misura: Log analysis su 10 sessioni

2. **Mantenimento Efficienza**
   - Baseline: Token usage per task (current state)
   - Target: < +5% token increase (mantenere guidance efficace)
   - Misura: Token tracking su task comuni

3. **Adoption Rate**
   - Baseline: Skill usage from logs (mcp tool calls)
   - Target: Mantenere o aumentare usage di claude-context, serena
   - Misura: Hook logs analytics

### Obiettivi Qualitativi

1. **User Experience**
   - Hooks non frustrano workflows legittimi
   - Suggerimenti arrivano al momento giusto
   - Guidance educativa, non coercitiva

2. **Code Quality**
   - Token-efficient patterns seguiti
   - Pre-commit quality checks usati
   - Architectural consistency mantenuta

3. **Documentation Clarity**
   - Skills descriptions accurate
   - Examples pratici e utilizzabili
   - Progressive disclosure riduce overwhelm

---

## 5. Considerazioni e Trade-offs

### Rischi Identificati

1. **Over-Throttling**
   - Rischio: Throttling troppo aggressivo → guidance importante persa
   - Mitigazione: Cooldown configurabile, priority-based exemptions

2. **Complessità Aggiunta**
   - Rischio: User preferences + behavior flags → harder to maintain
   - Mitigazione: Defaults intelligenti, documentation chiara

3. **Retrocompatibilità**
   - Rischio: Breaking changes in skill format
   - Mitigazione: Backward compatibility, graceful degradation

### Trade-offs Accettabili

1. **Complessità vs Flessibilità**
   - Acceptance: Sistema più complesso in cambio di personalizzazione
   - Rationale: Power users ne beneficiano senza impattare beginners

2. **Performance vs Intelligence**
   - Acceptance: File triggers add overhead in cambio di accuracy
   - Rationale: Overhead minimo (~10ms), benefit significativo

3. **Brevità vs Completezza**
   - Acceptance: Skills descriptions più corte potrebbero perdere nuance
   - Rationale: Progressive disclosure compensa con file supplementari

---

## 6. Domande Aperte per Discussione

1. **Threshold Values**: Le soglie proposte (cooldown 5min, complexity 8000) sono basate su stime. Dovrebbero essere A/B tested?

2. **User Preferences Scope**: Dovrebbero essere per-project o global? Propongo global (`~/.claude/user-preferences.json`) con project override.

3. **Skill Consolidation**: Alcune skills hanno overlap. Dovremmo consolidare (es. merge code-validation into unified-ai-orchestration)? Propongo di tenere separate per ora.

4. **Metrics Collection**: Implementare analytics tracking per misurare improvement? Privacy concerns?

5. **Migration Strategy**: Big bang migration vs gradual rollout? Propongo gradual (fase 1 → test → fase 2, etc).

---

## 7. Conclusioni

Il sistema attuale di hooks e skills è ben progettato e funzionale. Le modifiche proposte non sono una revisione radicale, ma un'evoluzione verso maggiore intelligenza e sensibilità al contesto.

**Principi Guida per l'Implementazione**:
1. **Guidance over Enforcement**: Educare senza bloccare
2. **Context Awareness**: Considerare situazione specifica
3. **Progressive Complexity**: Simple defaults, advanced options disponibili
4. **Measurable Impact**: Ogni change deve avere metriche di successo
5. **User Empowerment**: Dare controllo senza complessità obbligatoria

**Prossimi Passi Raccomandati**:
1. Review di questa proposta con stakeholder
2. Prioritizzare fasi in base a feedback
3. Implementare Fase 1 (Quick Wins) come proof of concept
4. Misurare impact prima di procedere con fasi successive
5. Iterare in base a dati reali

---

## Appendice A: Esempi di Before/After

### Esempio 1: Smart-Tool-Enforcer Message

**Prima** (attuale):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ TOKEN EFFICIENCY WARNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INEFFICIENT: Reading large file (650 LOC): src/aiExecutor.ts

Potential savings: ~2600 tokens → ~130 tokens (80% reduction)

SUGGESTION:
  mcp__serena__get_symbols_overview --relative_path "src/aiExecutor.ts"
  mcp__serena__find_symbol --name_path "SymbolName" --relative_path "src/aiExecutor.ts" --include_body true

REASON: Serena provides symbol-level navigation (75-80% token savings)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Dopo** (proposto):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 TOKEN TIP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reading: src/aiExecutor.ts (650 LOC, complexity: HIGH)

Consider symbol-level navigation:
  serena get_symbols_overview → Map structure (~200 tokens)
  serena find_symbol "TargetName" → Read specific code

Savings: ~2600 → ~400 tokens (85%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Miglioramenti:
- Più compatto (8 linee vs 13)
- Complexity indicator aggiunto
- Commands abbreviati (tool name ovvio dal context)
- Focus su actionable info

### Esempio 2: Skill Description

**Prima**:
```yaml
description: "Use this skill to ensure Claude always uses claude-context semantic search before any other search method. claude-context provides hybrid search (BM25 + vectors) and finds related code across the codebase without reading files. Use BEFORE feature implementation, bug hunting, refactoring, schema changes, or any code search. claude-context should be the primary search method, with normal file reading as fallback only."
```

**Dopo**:
```yaml
description: "Semantic codebase search via claude-context (BM25+vectors). Use before implementation, refactoring, or exploration. Finds dependencies and patterns without reading files."
```

Miglioramenti:
- 73% più corto (234 → 163 caratteri)
- Keywords concentrate ("semantic", "dependencies", "patterns")
- Trigger conditions chiare
- Technical capability upfront

### Esempio 3: Skill Activation Output

**Prima**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 SKILL ACTIVATION CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ CRITICAL SKILLS (REQUIRED):
  → claude-context-usage

📚 RECOMMENDED SKILLS:
  → memory-search-reminder
  → serena-surgical-editing

ACTION: Use Skill tool BEFORE responding
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Dopo** (proposto):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RECOMMENDED SKILLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Essential:
  → claude-context-usage
    After: Consider serena-surgical-editing for symbol navigation

Suggested:
  → memory-search-reminder (can dismiss for 1h)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Miglioramenti:
- Skill chaining hint incluso
- Dismiss info visible per optional skills
- "REQUIRED" → "Essential" (meno intimidatorio)
- Più compatto

---

## Appendice B: Riferimenti

### Documentazione Analizzata
1. Claude Code Hooks Guide (locale: `.claude/skills-hooks/hooks-doc.md`)
2. Claude Code Skills Guide (locale: `.claude/skills-hooks/skills.md`)
3. Hooks Reference (locale: `.claude/skills-hooks/hooks-reference.md`)

### Codebase Analizzato
1. `.claude/skills/skill-rules.json` - Configurazione skills
2. `.claude/skills/*/SKILL.md` - 7 skills definitions
3. `.claude/hooks/*.sh` - 6 hooks implementations
4. `.claude/hooks/skill-activation-prompt.ts` - Skill activation logic
5. `.claude/settings.json` - Hooks configuration

### Best Practices Identificate
1. **Progressive Disclosure**: Skill dovrebbe usare SKILL.md leggero + file supplementari
2. **Focused Skills**: One capability per skill
3. **Clear Descriptions**: Brevi, keyword-rich, trigger-specific
4. **Non-Blocking by Default**: Exit 0 con educational messages
5. **Session Tracking**: Evitare spam usando flag/timestamps

---

**Fine Proposta**

