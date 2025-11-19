# Enhanced MCP Tool Descriptions & System Discovery

## 🎯 Problema Identificato

**Situazione Attuale:**
- Unified-AI-MCP ha 4 tool generici esposti via MCP
- 9+ workflow potenti ma NASCOSTI dentro `smart-workflows`
- Documentazione ricca solo locale (docs/enhancement-plan/)
- AI assistants (Claude) devono "indovinare" capacità e parametri

**Esempio Serena MCP (Best Practice):**
- 20+ tool MCP specifici e ben documentati
- Ogni tool ha descrizione dettagliata, parametri, esempi
- AI assistant ha pieno contesto delle capacità disponibili

**Il Nostro Gap:**
- ❌ Workflow non esposti come tool MCP individuali
- ❌ Nessun mechanism di "discovery" delle capacità
- ❌ Documentazione non accessibile via MCP
- ❌ AI assistant deve indovinare workflow esistenti e parametri

---

## 🚀 Obiettivi

### Obiettivo Primario
Trasformare unified-ai-mcp in un sistema **self-documenting** e **discoverable**, dove:
1. Ogni workflow è un tool MCP separato
2. AI assistants possono scoprire capacità automaticamente
3. Documentazione ricca è accessibile via MCP
4. Parametri e esempi sono chiari e completi

### Obiettivi Secondari
1. Scegliere il tool/workflow giusto al primo colpo
2. Evitare tool inadatti
3. Combinare tool in workflow ottimali
4. Capire limitazioni e trade-offs
5. Mantenere compatibilità con sistema esistente

---

## Template Proposto

```typescript
interface EnhancedToolDescription {
  name: string;
  summary: string; // 1-liner (esistente)

  // NUOVO: Sezione dettagliata
  detailed: {
    bestFor: string[];      // Casi d'uso ideali
    notFor: string[];       // Quando NON usare
    characteristics: {
      speed: 'slow' | 'medium' | 'fast' | 'very-fast';
      contextSize: string;  // "32K tokens", "2M tokens"
      autonomy: 'read-only' | 'low' | 'medium' | 'high';
      cost: 'low' | 'medium' | 'high';
    };
    examples: Array<{
      scenario: string;
      prompt: string;
      expectedOutput: string;
    }>;
    alternatives: Array<{
      when: string;
      useTool: string;
    }>;
  };
}
```

---

## ask-gemini (Enhanced)

### Current Description
```
Query Google Gemini via the gemini CLI with support for @file/#file syntax,
sandbox mode, and model selection
```

### Proposed Enhanced Description
```json
{
  "name": "ask-gemini",
  "summary": "Google Gemini 2.5 Pro/Flash - Deep architectural analysis and large context processing",

  "detailed": {
    "bestFor": [
      "Architectural decisions and system design",
      "Large codebase analysis (>10 files, >5K LOC)",
      "Security audits and vulnerability scanning",
      "Documentation comprehension (README, specs)",
      "Multi-file refactoring planning",
      "Performance optimization strategies"
    ],

    "notFor": [
      "Quick syntax fixes (use cursor-agent)",
      "Single file edits (use cursor-agent)",
      "Autonomous code generation (use droid)",
      "Interactive debugging sessions"
    ],

    "characteristics": {
      "speed": "medium",
      "contextSize": "2M tokens (Pro) / 1M tokens (Flash)",
      "autonomy": "read-only",
      "cost": "medium"
    },

    "examples": [
      {
        "scenario": "Analyze project architecture",
        "prompt": "@src/**/*.ts @README.md Analyze the overall architecture and identify potential improvements",
        "expectedOutput": "Comprehensive analysis with architectural patterns, security concerns, scalability issues"
      },
      {
        "scenario": "Security audit",
        "prompt": "@src/auth/*.ts Review authentication implementation for security vulnerabilities",
        "expectedOutput": "Detailed security report with OWASP top 10 considerations"
      }
    ],

    "alternatives": [
      {
        "when": "Need fast response (<5s) for simple tasks",
        "useTool": "cursor-agent"
      },
      {
        "when": "Need code generation with file edits",
        "useTool": "droid"
      }
    ]
  }
}
```

---

## cursor-agent (Enhanced)

### Current Description
```
Multi-model Cursor Agent CLI per bug fixing e refactoring guidati
```

### Proposed Enhanced Description
```json
{
  "name": "cursor-agent",
  "summary": "Cursor Agent (GPT-5.1/Sonnet 4.5) - Fast bug fixes, refactoring, and test generation",

  "detailed": {
    "bestFor": [
      "Quick bug fixes with known file location",
      "Refactoring single functions/classes",
      "Test case generation",
      "Code review and style improvements",
      "Syntax error fixes",
      "Import/dependency updates",
      "Fast prototyping (< 3 files)"
    ],

    "notFor": [
      "Large architectural changes (use gemini)",
      "Multi-step autonomous tasks (use droid)",
      "Deep codebase analysis (use gemini)",
      "Production-critical code generation (use droid)"
    ],

    "characteristics": {
      "speed": "very-fast",
      "contextSize": "128K tokens (GPT-5.1) / 200K (Sonnet 4.5)",
      "autonomy": "low-medium (requires approval for file edits)",
      "cost": "low"
    },

    "examples": [
      {
        "scenario": "Fix TypeScript error",
        "prompt": "@src/utils/parser.ts Fix the 'Property does not exist on type' error on line 42",
        "expectedOutput": "Precise fix with type annotations"
      },
      {
        "scenario": "Refactor function",
        "prompt": "@src/helpers.ts Refactor the `calculateTotal` function to use reduce instead of loops",
        "expectedOutput": "Cleaner implementation with explanation"
      }
    ],

    "alternatives": [
      {
        "when": "Need architectural analysis",
        "useTool": "gemini"
      },
      {
        "when": "Need multi-file autonomous implementation",
        "useTool": "droid"
      }
    ]
  }
}
```

---

## droid (Enhanced)

### Current Description
```
Factory Droid CLI (GLM-4.6) per task agentici con livelli di autonomia configurabili
```

### Proposed Enhanced Description
```json
{
  "name": "droid",
  "summary": "Factory Droid (GLM-4.6) - Autonomous multi-step implementation and remediation planning",

  "detailed": {
    "bestFor": [
      "Feature implementation (5-15 files)",
      "Multi-step bug fixing workflows",
      "Autonomous refactoring tasks",
      "Production code generation",
      "Remediation plan execution",
      "Migration scripts",
      "Test suite generation for modules"
    ],

    "notFor": [
      "Quick single-file fixes (use cursor-agent)",
      "Architectural planning (use gemini)",
      "Read-only analysis tasks",
      "High-risk production changes without review"
    ],

    "characteristics": {
      "speed": "medium",
      "contextSize": "128K tokens",
      "autonomy": "high (auto/medium/low modes)",
      "cost": "medium-high"
    },

    "examples": [
      {
        "scenario": "Implement new feature",
        "prompt": "Implement user authentication with JWT. Include: login endpoint, token validation middleware, and tests.",
        "expectedOutput": "Complete implementation across multiple files with tests"
      },
      {
        "scenario": "Remediation plan",
        "prompt": "@logs/error.log Create and execute a remediation plan for these production errors",
        "expectedOutput": "Step-by-step fix with validation"
      }
    ],

    "alternatives": [
      {
        "when": "Just need analysis without implementation",
        "useTool": "gemini"
      },
      {
        "when": "Simple single-file fix",
        "useTool": "cursor-agent"
      }
    ]
  }
}
```

---

## smart-workflows (Enhanced)

### Current Description
```
Intelligent workflows that orchestrate multiple AI backends for complex tasks
```

### Proposed Enhanced Description
```json
{
  "name": "smart-workflows",
  "summary": "Multi-backend workflow orchestration - Parallel code review, pre-commit validation, bug hunting",

  "detailed": {
    "bestFor": [
      "Comprehensive code review (parallel-review)",
      "Pre-commit validation with multiple perspectives",
      "Complex bug investigation (bug-hunt)",
      "Feature design with multi-model validation",
      "Session initialization with repo analysis",
      "Last commit validation"
    ],

    "notFor": [
      "Simple single-backend tasks",
      "Time-sensitive operations (workflows are slower)",
      "Low-budget operations (uses multiple AI backends)"
    ],

    "characteristics": {
      "speed": "slow",
      "contextSize": "Varies by workflow",
      "autonomy": "orchestrated (combines multiple backends)",
      "cost": "high (uses 2-3 backends)"
    },

    "workflows": {
      "parallel-review": {
        "description": "Run code review with Gemini + Cursor + Droid in parallel",
        "params": {
          "files": "string[] (required)",
          "focus": "'architecture' | 'security' | 'performance' | 'quality' | 'all'",
          "autonomyLevel": "'read-only' | 'low' | 'medium' | 'high'"
        },
        "duration": "30-60s (parallel execution)",
        "cost": "3× single backend"
      },

      "bug-hunt": {
        "description": "Multi-backend bug analysis with file discovery",
        "params": {
          "symptoms": "string (required)",
          "suspected_files": "string[] (optional)",
          "autonomyLevel": "enum"
        },
        "duration": "45-90s",
        "cost": "3× single backend"
      },

      "pre-commit-validate": {
        "description": "Validate staged changes before commit",
        "params": {
          "autonomyLevel": "enum"
        },
        "duration": "20-40s",
        "cost": "2× single backend"
      }
    },

    "examples": [
      {
        "scenario": "Pre-commit validation",
        "prompt": "{\"workflow\": \"pre-commit-validate\", \"params\": {\"autonomyLevel\": \"medium\"}}",
        "expectedOutput": "Multi-perspective analysis of staged changes"
      }
    ]
  }
}
```

---

## Decision Tree for AI Assistants

```
Task Type?
│
├─ Quick fix (1 file, <100 LOC)
│  └─> cursor-agent
│
├─ Analysis only (no code changes)
│  ├─ Large context (>10 files)
│  │  └─> gemini
│  └─ Small context (<5 files)
│     └─> cursor-agent
│
├─ Implementation (write code)
│  ├─ Single file / simple
│  │  └─> cursor-agent
│  └─ Multi-file / complex
│     └─> droid
│
├─ Comprehensive review
│  └─> smart-workflows (parallel-review)
│
└─ Bug hunting
   └─> smart-workflows (bug-hunt)
```

---

## Implementation Recommendations

### 1. Update Tool Schemas
Aggiungere campo `detailed` in `UnifiedTool`:

```typescript
export interface UnifiedTool {
  name: string;
  description: string;
  zodSchema: z.ZodObject<any>;
  execute: ToolExecuteFunction;
  category?: string;

  // NUOVO
  detailed?: {
    bestFor: string[];
    notFor: string[];
    characteristics: {
      speed: string;
      contextSize: string;
      autonomy: string;
      cost: string;
    };
    examples: Array<{
      scenario: string;
      prompt: string;
      expectedOutput: string;
    }>;
    alternatives?: Array<{
      when: string;
      useTool: string;
    }>;
  };
}
```

### 2. Expose in MCP Tool Listings
Il campo `detailed` dovrebbe essere esposto in `ListToolsRequestSchema`:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = getToolDefinitions();

  // Include enhanced descriptions
  const enhancedTools = tools.map(tool => ({
    ...tool,
    // Add detailed info to description or separate field
    enhancedDescription: tool.detailed
      ? formatEnhancedDescription(tool.detailed)
      : undefined
  }));

  return { tools: enhancedTools };
});
```

### 3. Helper Function
```typescript
function formatEnhancedDescription(detailed: any): string {
  return `
BEST FOR: ${detailed.bestFor.join(', ')}
NOT FOR: ${detailed.notFor.join(', ')}

CHARACTERISTICS:
- Speed: ${detailed.characteristics.speed}
- Context: ${detailed.characteristics.contextSize}
- Autonomy: ${detailed.characteristics.autonomy}
- Cost: ${detailed.characteristics.cost}

EXAMPLES:
${detailed.examples.map(ex => `- ${ex.scenario}: ${ex.prompt}`).join('\n')}
  `.trim();
}
```

---

## Benefici Attesi

1. **Riduzione errori**: AI assistant sceglie tool giusto al primo colpo
2. **Performance**: Meno tentativi falliti, workflow più veloci
3. **Cost efficiency**: Evita tool costosi per task semplici
4. **Better UX**: Utenti ricevono risultati più appropriati
5. **Documentazione**: Self-documenting tools con esempi integrati

---

---

## 📋 PIANO DI ESPLORAZIONE COMPLETO

### Overview
Serve un **agente di esplorazione dedicato** che mappi l'intero sistema, le sue capacità nascoste, e proponga un'architettura MCP 2.0.

---

### Fase 1: Mappatura Documentazione Locale

**Obiettivo:** Comprendere tutte le capacità documentate ma non esposte via MCP

**File da Analizzare:**
```
docs/enhancement-plan/
├── 01-hooks-and-skills-optimization.md
├── 01-proposal-hooks-skills-optimization.md
├── 02-mcp-tools-integration.md
├── 02-proposal-mcp-tools.md
├── 03-advanced-features-exploration.md
├── 04-custom-slash-commands.md
├── 04-proposal-slash-commands.md
├── advanced-features-analysis.md
├── APPROVAL_SUMMARY.md
├── IMPLEMENTATION-SUMMARY.md
├── INTEGRATION-ANALYSIS.md
├── openspec-integration-proposal.md
├── openspec-user-guide.md
├── phase0-validation-results.md
├── phase1-implementation-summary.md
├── phase2-workflow-enhancement-summary.md
├── README.md
└── REVIEW_COMPLETION_REPORT.md

docs/guides/
├── cursor-droid-playbook.md
├── getting-started.md
└── (altri file)

docs/reference/
├── api-tools.md
├── api-workflows.md
└── (altri file)
```

**Domande da Rispondere:**
1. Quanti workflow sono implementati? (stima: 9-12)
2. Quali parametri accetta ogni workflow?
3. Quali use case sono documentati?
4. Quali integrazioni esistono (OpenSpec, Cursor, Droid)?
5. Quali capacità sono menzionate nei documenti ma non implementate?
6. Quali best practices sono suggerite?

**Output Atteso:**
```markdown
# Workflow Inventory

## Implemented Workflows (da src/workflows/*.workflow.ts)
1. parallel-review
   - File: src/workflows/parallel-review.workflow.ts
   - Params: files[], focus, autonomyLevel
   - Docs: docs/reference/api-workflows.md:45
   - Use cases: code review, security audit, quality check

2. bug-hunt
   - File: src/workflows/bug-hunt.workflow.ts
   - Params: symptoms, suspected_files?, autonomyLevel
   - Docs: docs/reference/api-workflows.md:89
   - Use cases: debugging, root cause analysis

3. ...

## Documented but Not Exposed
- Workflow X mentioned in phase2-workflow-enhancement-summary.md
- Feature Y planned in 03-advanced-features-exploration.md

## Integration Points
- OpenSpec: 6 tool + 1 workflow
- Cursor Agent: 1 tool
- Droid: 1 tool
- Slash Commands: 5 commands (not MCP tools!)
```

---

### Fase 2: Analisi TypeScript MCP SDK & Serena Best Practices

**Obiettivo:** Comprendere capacità avanzate del MCP SDK e studiare Serena come esempio di eccellenza

**Risorse da Studiare:**
```
MCP TypeScript SDK:
https://github.com/modelcontextprotocol/typescript-sdk

Serena MCP (Best Practice Example):
https://github.com/oraios/serena

Serena MCP Tools Locali:
Lista tool via: mcp__serena__* (installato in .cursor/mcp.json)
```

**Aspetti da Esplorare:**

1. **Serena MCP Tool Analysis (CRITICAL)**

   **Analisi Tool Esposti:**
   ```bash
   # Metodo 1: Via Claude Code
   # Guardare tutti i tool che iniziano con mcp__serena__*
   # Es: mcp__serena__list_dir, mcp__serena__find_symbol, ecc.

   # Metodo 2: Via documentazione Serena
   # Analizzare https://github.com/oraios/serena
   # Focus su: come espongono i tool, naming, descrizioni
   ```

   **Domande Chiave:**
   - Quanti tool espone Serena? (~20+)
   - Come sono strutturate le descrizioni?
   - Quali pattern di naming usano? (snake_case, prefissi, ecc.)
   - Come gestiscono parametri complessi?
   - Usano category/grouping per i tool?
   - Come documentano examples inline?
   - Hanno meta-tool per discovery? (list_*, check_*, ecc.)

   **Output Atteso:**
   ```markdown
   # Serena MCP Tool Inventory

   ## Symbolic Tools (Code Navigation)
   - get_symbols_overview: Get high-level view of file symbols
   - find_symbol: Find symbols by name path pattern
   - find_referencing_symbols: Find references to a symbol
   - replace_symbol_body: Replace symbol implementation
   - insert_after_symbol: Insert code after symbol
   - insert_before_symbol: Insert code before symbol
   - rename_symbol: Rename symbol across codebase

   ## File Operations
   - list_dir: List directory contents
   - find_file: Find files by name/pattern
   - search_for_pattern: Regex search in codebase

   ## Memory Management
   - write_memory: Store project knowledge
   - read_memory: Retrieve stored knowledge
   - list_memories: List all stored memories
   - delete_memory: Remove memory
   - edit_memory: Update memory content

   ## Meta Tools
   - check_onboarding_performed: Check if project onboarded
   - onboarding: Initialize project
   - initial_instructions: Get Serena manual
   - think_about_*: Reflection tools

   ## Patterns Identificati
   1. Tool Naming: snake_case, verbo-first
   2. Descriptions: Molto dettagliate, multi-linea
   3. Parameters: Zod schema ricchi con descriptions
   4. Grouping: Logico (symbolic, file, memory, meta)
   5. Discovery: Hanno initial_instructions, onboarding
   6. Examples: Inclusi nelle descriptions
   ```

2. **Tool Registration Best Practices (da SDK + Serena)**
   - Come Serena registra 20+ tool senza performance issues
   - Pattern per tool naming (da Serena: `snake_case`)
   - Grouping e categorization strategies
   - Prefix-based organization vs category field

3. **Rich Descriptions (studiare Serena)**
   - Supporto markdown nel `description` field
   - Lunghezza massima descrizioni (Serena ha descrizioni lunghe)
   - Strutture dati custom in `inputSchema`
   - Multi-paragraph descriptions con esempi inline

4. **Resource System (MCP Resources)**
   - Possibilità di esporre documentazione come MCP Resources
   - `ListResourcesRequestSchema` usage
   - Resource templates per workflow docs
   - Serena espone Resources? Analizzare.

5. **Prompts System (MCP Prompts)**
   - Esporre workflow come Prompts invece che Tools
   - `ListPromptsRequestSchema` per discovery
   - Prompt arguments mapping a workflow params
   - Serena usa Prompts? Come?

6. **Capability Discovery (Serena pattern)**
   - Tool per listare capabilities (Serena: `list_memories`, `initial_instructions`)
   - Tool per descrivere capabilities (`check_onboarding_performed`)
   - Metadata richness (esempi, alternatives, ecc.)
   - Self-documenting pattern di Serena

**Domande da Rispondere:**
1. MCP SDK supporta "nested" descriptions o solo flat?
2. Possiamo esporre examples via `inputSchema.$examples`?
3. Quanto è verbose la description senza impattare performance?
4. Resources vs Tools vs Prompts: quale usare per i workflow?
5. Come gestire versioning dei workflow?
6. **Serena-specific:** Come Serena gestisce 20+ tool senza confusion?
7. **Serena-specific:** Quale pattern di naming è più efficace?
8. **Serena-specific:** Come Serena documenta parametri complessi?

**Output Atteso:**
```markdown
# MCP SDK & Serena Analysis Report

## Serena Tool Exposition Pattern

### Tool Count & Organization
- Total Tools: 23 (symbolic: 7, file: 3, memory: 5, meta: 4, other: 4)
- Naming: snake_case, verb-first (find_*, list_*, write_*)
- Grouping: By functionality (no explicit category field)
- Discovery: initial_instructions tool provides full manual

### Description Pattern (from Serena)
```python
# Esempio da Serena
description = """Retrieves information on all symbols/code entities
(classes, methods, etc.) based on the given name path pattern.

The returned symbol information can be used for edits or further queries.
Specify `depth > 0` to also retrieve children/descendants.

A name path is a path in the symbol tree *within a source file*.
Example: method `my_method` in class `MyClass` -> `MyClass/my_method`

Pattern matching:
- Simple name: "method" matches any symbol named "method"
- Relative path: "class/method" matches suffix
- Absolute path: "/class/method" requires exact match
"""
```

### Parameter Documentation (from Serena)
```python
# Serena usa descriptions dettagliate in ogni parameter
{
  "name_path_pattern": {
    "type": "string",
    "description": "The name path matching pattern (see above)."
  },
  "depth": {
    "type": "integer",
    "default": 0,
    "description": "Depth up to which descendants shall be retrieved
                   (e.g. use 1 to also retrieve immediate children)"
  }
}
```

### Key Takeaways
1. ✅ Multi-paragraph descriptions funzionano bene
2. ✅ snake_case naming è consistente e leggibile
3. ✅ Meta-tool (`initial_instructions`) = ottima strategia
4. ✅ Examples inline nelle descriptions (non in schema)
5. ✅ Verb-first naming facilita discovery
6. ✅ No category field, organization via naming prefix

## MCP SDK Capabilities Analysis

### Tool Registration Patterns
✅ Supporto markdown in descriptions
✅ Multi-paragraph descriptions OK
✅ inputSchema può avere `description` per ogni field
❌ No nested categorization (flat list only)
❌ No `examples` field nativo in schema (usare description)

### Recommended Pattern for Workflows (ispirato a Serena)
```
Pattern: Expose as Tools (not Prompts/Resources)
Reason: Tools sono più flessibili e hanno validation

Naming: workflow_<name> (snake_case come Serena)
Examples:
- workflow_parallel_review
- workflow_bug_hunt
- workflow_pre_commit_validate

Meta Tools (come Serena):
- list_workflows
- describe_workflow
- workflow_capabilities
```

### Enhanced Description Format (Serena-style)
```typescript
{
  name: "workflow_parallel_review",
  description: `
Run comprehensive code review using 3 AI backends in parallel.

This workflow executes Gemini (architecture), Cursor (refactoring),
and Droid (implementation) analysis simultaneously and combines results.

**Best For:**
- Pre-merge code review
- Security audits before deployment
- Comprehensive quality checks (3 perspectives)

**Not Recommended For:**
- Quick fixes (use cursor-agent directly)
- Single file review (overkill, use workflow_pre_commit_validate)

**Parameters:**
- files: Array of file paths to review
- focus: Review focus area (architecture|security|performance|quality|all)
- autonomyLevel: Execution mode (read-only|low|medium|high)

**Example:**
{
  "files": ["src/auth.ts", "src/middleware.ts"],
  "focus": "security",
  "autonomyLevel": "medium"
}

**Duration:** 30-60s (parallel execution)
**Cost:** High (uses 3 backends)

**Related Workflows:**
- workflow_pre_commit_validate: Faster, staged files only
- workflow_bug_hunt: For debugging specific issues
  `,
  inputSchema: {
    type: "object",
    properties: {
      files: {
        type: "array",
        items: { type: "string" },
        description: "File paths to review (relative to project root)"
      },
      focus: {
        type: "string",
        enum: ["architecture", "security", "performance", "quality", "all"],
        description: "Primary review focus area"
      }
      // ...
    }
  }
}
```

### Serena vs Unified-AI Comparison

| Aspect | Serena | Unified-AI (Current) | Unified-AI (Target) |
|--------|--------|---------------------|---------------------|
| Tool Count | 23 | 4 | 20+ |
| Naming | snake_case | kebab-case | snake_case (Serena-style) |
| Discovery | initial_instructions | ❌ None | list_workflows, describe_workflow |
| Descriptions | Multi-paragraph, rich | Short, generic | Multi-paragraph (Serena-style) |
| Examples | Inline in description | ❌ None | Inline (Serena-style) |
| Grouping | Prefix-based | ❌ None | Prefix-based (workflow_*) |
| Meta Tools | 4 (check, onboard, etc) | 0 | 3 (list, describe, capabilities) |

```

---

### Fase 3: Analisi Commit History

**Obiettivo:** Capire l'evoluzione del sistema e le decisioni architetturali

**Branch/Commit Range da Analizzare:**
```bash
# Trovare il branch corretto
git branch -a | grep enhancement

# Analizzare commit dal branch di enhancement a HEAD
git log <enhancement-branch>..HEAD --oneline --name-status

# Focus su:
- Modifiche a src/workflows/
- Modifiche a src/tools/
- Modifiche a src/constants.ts (backend changes)
- Introduzione OpenSpec
- Rimozione ask-qwen/ask-rovodev
```

**Domande da Rispondere:**
1. Quando sono stati aggiunti cursor-agent e droid?
2. Quali workflow sono stati aggiunti dopo il branch enhancement?
3. Ci sono workflow deprecati o rimossi?
4. Quali breaking changes ci sono stati?
5. Pattern architetturali emergenti nei commit recenti?

**Output Atteso:**
```markdown
# Architectural Evolution

## Major Changes
- [commit-hash] Add cursor-agent and droid tools (replaced qwen/rovodev)
- [commit-hash] Implement OpenSpec integration (6 tools + 1 workflow)
- [commit-hash] Add auto-remediation workflow
- [commit-hash] Refactor model selector (BACKENDS constants)

## Workflow Timeline
2025-11-19: openspec-driven-development
2025-11-15: auto-remediation, refactor-sprint
2025-11-10: parallel-review, bug-hunt
...

## Architectural Patterns
1. Workflow = separate file in src/workflows/
2. Tool = registered in src/tools/index.ts
3. Backend = BACKENDS constant + executor function
4. Agents = BaseAgent + specific agent class
```

---

### Fase 4: Gap Analysis

**Obiettivo:** Identificare gap tra capacità implementate e esposizione MCP

**Analisi da Condurre:**

1. **Workflow Exposure Gap**
   ```
   Implemented: 9+ workflows
   Exposed as MCP tools: 1 (smart-workflows with params)
   Gap: 8+ workflows nascosti
   ```

2. **Documentation Gap**
   ```
   Local docs: docs/enhancement-plan/ (18 files)
   MCP-accessible docs: 0 (nessuna Resource MCP)
   Gap: AI assistant non può leggere docs
   ```

3. **Discovery Gap**
   ```
   Serena: list_memories, check_onboarding, ecc.
   Unified-AI: No list/describe tools
   Gap: AI assistant deve sapere a priori cosa esiste
   ```

4. **Parameter Documentation Gap**
   ```
   Current: Parametri in Zod schema (solo type, no examples)
   Desired: Examples, constraints, best practices inline
   Gap: AI assistant deve provare parametri random
   ```

**Output Atteso:**
```markdown
# Gap Analysis Report

## Critical Gaps
1. **Workflow Exposure** (Priority: P0)
   - 8+ workflow non esposti come tool MCP
   - Soluzione: Tool per workflow approach

2. **Discovery Mechanism** (Priority: P0)
   - Nessun modo per AI di scoprire capabilities
   - Soluzione: list-workflows, describe-workflow tools

3. **Rich Documentation** (Priority: P1)
   - Docs solo locali, non accessibili via MCP
   - Soluzione: MCP Resources per docs

4. **Parameter Examples** (Priority: P1)
   - inputSchema non ha examples inline
   - Soluzione: $examples field nel schema

## Impact Assessment
- Current: AI assistant guesses 60% of the time
- After fix: AI assistant knows capabilities 100%
```

---

### Fase 5: Architettura Proposta (MCP 2.0)

**Obiettivo:** Proporre architettura dettagliata per sistema discoverable

**Componenti da Progettare:**

1. **Tool-per-Workflow Pattern**
   ```typescript
   // Da:
   smart-workflows({ workflow: "parallel-review", params: {...} })

   // A:
   workflow_parallel_review({ files: [...], focus: "security" })
   workflow_bug_hunt({ symptoms: "...", suspected_files: [...] })
   workflow_pre_commit_validate({ autonomyLevel: "medium" })
   ...
   ```

2. **Meta Tools for Discovery**
   ```typescript
   list_workflows() → ["parallel-review", "bug-hunt", ...]

   describe_workflow({ name: "parallel-review" }) → {
     description: "...",
     parameters: {...},
     examples: [...],
     relatedWorkflows: [...],
     backends: ["gemini", "cursor", "droid"]
   }

   list_capabilities({ category: "code-review" }) → [...]
   ```

3. **MCP Resources for Documentation**
   ```typescript
   // Esporre docs/ come MCP Resources
   Resource: unified-ai://docs/enhancement-plan/phase2-workflow...
   Resource: unified-ai://docs/guides/cursor-droid-playbook
   Resource: unified-ai://docs/reference/api-workflows
   ```

4. **Enhanced Tool Descriptions**
   ```typescript
   // Implementare template dal documento corrente
   interface WorkflowTool {
     name: string;
     description: string; // markdown-rich
     inputSchema: {
       type: "object",
       properties: {...},
       examples: [...],  // inline examples
       required: [...]
     };
     metadata: {  // custom field
       bestFor: string[];
       notFor: string[];
       relatedWorkflows: string[];
       backends: string[];
       estimatedDuration: string;
       cost: "low" | "medium" | "high";
     };
   }
   ```

**Domande da Rispondere:**
1. Mantenere smart-workflows come backward compatibility?
2. Prefisso naming: `workflow-*` o `workflow_*`?
3. Categoria tool: `workflow` field o prefix-based?
4. Come gestire workflow deprecation?
5. Versioning dei workflow (v1, v2)?

**Output Atteso:**
```markdown
# MCP 2.0 Architecture Proposal

## Tool Structure
```typescript
// Backend Tools (unchanged)
{
  "ask-gemini": { ... },
  "cursor-agent": { ... },
  "droid": { ... }
}

// Workflow Tools (NEW - one per workflow)
{
  "workflow-parallel-review": {
    name: "workflow-parallel-review",
    description: `# Parallel Code Review

    Multi-backend code review with Gemini + Cursor + Droid.

    ## Best For
    - Pre-merge reviews
    - Security audits
    - Comprehensive quality checks

    ## Parameters
    ...

    ## Example
    \`\`\`json
    {
      "files": ["src/auth.ts", "src/middleware.ts"],
      "focus": "security",
      "autonomyLevel": "medium"
    }
    \`\`\`
    `,
    inputSchema: { ... },
    metadata: {
      category: "code-review",
      backends: ["gemini", "cursor-agent", "droid"],
      duration: "30-60s",
      cost: "high"
    }
  },

  "workflow-bug-hunt": { ... },
  "workflow-pre-commit-validate": { ... },
  // ... 9+ workflow tools
}

// Meta Tools (NEW - for discovery)
{
  "list-workflows": {
    description: "List all available workflows with categories",
    inputSchema: {
      category?: "code-review" | "debugging" | "validation" | "all"
    }
  },

  "describe-workflow": {
    description: "Get detailed documentation for a workflow",
    inputSchema: {
      name: string,  // workflow name
      format?: "short" | "full"
    }
  },

  "list-capabilities": {
    description: "Discover all system capabilities",
    inputSchema: {}
  }
}

// OpenSpec Tools (unchanged)
{
  "openspec-init": { ... },
  "openspec-proposal": { ... },
  // ... 6 openspec tools
}

// Backward Compatibility (DEPRECATED)
{
  "smart-workflows": {
    description: "DEPRECATED: Use workflow-* tools instead",
    deprecated: true,
    migration: "Use specific workflow tools like workflow-parallel-review"
  }
}
```

## Implementation Phases

### Phase 1: Meta Tools (1-2 days)
- [ ] Implement `list-workflows`
- [ ] Implement `describe-workflow`
- [ ] Implement `list-capabilities`
- [ ] Test discovery mechanism

### Phase 2: Workflow Tool Exposure (2-3 days)
- [ ] Create tool wrapper for each workflow
- [ ] Add enhanced descriptions
- [ ] Add inline examples in inputSchema
- [ ] Add metadata fields

### Phase 3: MCP Resources (1 day)
- [ ] Expose docs/ as MCP Resources
- [ ] Create resource index
- [ ] Test resource access

### Phase 4: Enhanced Descriptions (1 day)
- [ ] Update all tool descriptions with markdown
- [ ] Add bestFor/notFor sections
- [ ] Add examples and alternatives

### Phase 5: Backward Compatibility & Migration (1 day)
- [ ] Mark smart-workflows as deprecated
- [ ] Create migration guide
- [ ] Update tests

## Metrics for Success
- AI assistant discovery rate: 0% → 100%
- Parameter guessing: 60% → 0%
- Documentation access: local-only → MCP-accessible
- Tool count: 4 → 20+
```

---

### Fase 6: Implementation Roadmap

**Obiettivo:** Piano dettagliato per implementare MCP 2.0

**Tasks Dettagliati:**

```markdown
# Implementation Tasks

## Task 1: Setup Infrastructure
- [ ] Create `src/tools/workflows/` directory
- [ ] Create `src/tools/meta/` directory
- [ ] Update `src/tools/index.ts` registration logic
- [ ] Create workflow tool factory function

## Task 2: Implement Meta Tools
- [ ] `meta/list-workflows.tool.ts`
  - Read workflow registry
  - Group by category
  - Return structured list

- [ ] `meta/describe-workflow.tool.ts`
  - Load workflow metadata
  - Format documentation
  - Include examples

- [ ] `meta/list-capabilities.tool.ts`
  - Aggregate all capabilities
  - Include tools + workflows + agents
  - Return comprehensive list

## Task 3: Workflow Tool Wrappers
For each workflow in src/workflows/*.workflow.ts:

- [ ] Create wrapper tool in `src/tools/workflows/`
- [ ] Extract workflow params → tool inputSchema
- [ ] Write enhanced description
- [ ] Add metadata field
- [ ] Add examples array
- [ ] Register in tool registry

Example:
```typescript
// src/tools/workflows/parallel-review.tool.ts
import { parallelReviewWorkflow } from '../../workflows/parallel-review.workflow.js';

export const workflowParallelReviewTool: UnifiedTool = {
  name: 'workflow-parallel-review',
  description: `
    # Parallel Code Review Workflow

    Multi-backend comprehensive code review.
    ...
  `,
  zodSchema: parallelReviewWorkflow.schema,
  execute: async (args, onProgress) => {
    return parallelReviewWorkflow.execute(args, onProgress);
  },
  category: 'workflow',
  metadata: {
    workflowName: 'parallel-review',
    backends: ['gemini', 'cursor-agent', 'droid'],
    duration: '30-60s',
    cost: 'high',
    bestFor: [...],
    notFor: [...]
  }
};
```

## Task 4: Enhanced Descriptions
- [ ] Update ask-gemini description
- [ ] Update cursor-agent description
- [ ] Update droid description
- [ ] Update all OpenSpec tool descriptions
- [ ] Add examples to all inputSchemas

## Task 5: MCP Resources (Optional)
- [ ] Implement resource handler for docs/
- [ ] Create resource URI scheme
- [ ] Index all documentation files
- [ ] Test resource access

## Task 6: Testing & Validation
- [ ] Unit tests for meta tools
- [ ] Integration tests for workflow tools
- [ ] Test AI assistant discovery workflow
- [ ] Validate backward compatibility
- [ ] Performance testing (20+ tools)

## Task 7: Documentation
- [ ] Update README.md
- [ ] Create MIGRATION.md
- [ ] Update docs/reference/api-tools.md
- [ ] Add examples to docs/guides/
- [ ] Create video/tutorial for discovery

## Task 8: Deprecation & Migration
- [ ] Mark smart-workflows as deprecated
- [ ] Add warning messages
- [ ] Create migration script
- [ ] Update all examples
```

---

### Fase 7: Validation & Testing Plan

**Obiettivo:** Assicurare che MCP 2.0 funzioni come previsto

**Test Cases:**

```markdown
# Test Scenarios

## Scenario 1: Fresh AI Assistant Discovery
**Setup:** AI assistant (Claude) starts with no prior knowledge
**Test:**
1. Call `list-workflows()`
2. Should see all 9+ workflows listed
3. Call `describe-workflow({ name: "parallel-review" })`
4. Should get full description with examples
5. Call `workflow-parallel-review({ files: [...], focus: "security" })`
6. Should execute correctly

**Success Criteria:**
- AI finds all workflows without guessing
- AI understands parameters without trial-error
- AI selects right workflow for task

## Scenario 2: Workflow Selection Decision
**Setup:** AI needs to choose between workflows
**Test:**
1. User: "Review my code for security issues"
2. AI should:
   - Consider workflow-parallel-review (comprehensive)
   - Consider workflow-pre-commit-validate (fast)
   - Choose based on context (staged files → pre-commit, else → parallel)

**Success Criteria:**
- AI makes informed decision
- AI explains why it chose that workflow
- AI suggests alternatives

## Scenario 3: Backward Compatibility
**Setup:** Existing code using smart-workflows
**Test:**
1. Call `smart-workflows({ workflow: "parallel-review", ... })`
2. Should still work (deprecated warning)
3. Should suggest migration to `workflow-parallel-review`

**Success Criteria:**
- No breaking changes
- Clear deprecation message
- Migration path documented

## Scenario 4: Documentation Access
**Setup:** AI needs workflow documentation
**Test:**
1. Call `describe-workflow({ name: "bug-hunt", format: "full" })`
2. Should include:
   - Full description
   - All parameters with examples
   - Best practices
   - Related workflows
   - Backend requirements

**Success Criteria:**
- Comprehensive documentation
- Actionable examples
- Clear constraints

## Scenario 5: Parameter Validation
**Setup:** AI tries invalid parameters
**Test:**
1. Call `workflow-parallel-review({ files: [], focus: "invalid" })`
2. Should fail with clear error
3. Error should suggest valid values

**Success Criteria:**
- Zod validation catches errors
- Error messages are helpful
- Suggests correct values
```

---

## 🎯 DELIVERABLES ATTESI

Al termine dell'esplorazione, l'agente dovrà produrre:

### 1. Workflow Inventory Document
- Lista completa di tutti i workflow
- Parametri, use cases, esempi
- Mapping a documentazione esistente

### 2. MCP SDK Capabilities Report
- Cosa supporta il SDK TypeScript
- Pattern consigliati per tool exposition
- Limitazioni e workaround

### 3. Architectural Evolution Timeline
- Commit history analysis
- Decisioni architetturali chiave
- Pattern emergenti

### 4. Gap Analysis Report
- Gap identificati con priorità
- Impact assessment
- Metriche attuali vs. desiderate

### 5. MCP 2.0 Architecture Proposal
- Architettura dettagliata
- Tool structure completa
- Implementation phases

### 6. Implementation Roadmap
- Task breakdown dettagliato
- Stime temporali
- Dipendenze tra task

### 7. Testing & Validation Plan
- Test scenarios
- Success criteria
- Performance benchmarks

---

## 🚀 NEXT STEPS

1. **Review & Approval**
   - [ ] Review questo documento
   - [ ] Approvare approccio generale
   - [ ] Identificare priorità

2. **Launch Exploration Agent**
   - [ ] Creare agente dedicato per esplorazione
   - [ ] Fornire accesso a:
     - docs/enhancement-plan/
     - Git history
     - TypeScript MCP SDK docs
     - Codebase completo

3. **Implement MCP 2.0**
   - [ ] Seguire roadmap dall'agente
   - [ ] Implementare in fasi
   - [ ] Validare con testing

4. **Migrate & Document**
   - [ ] Migrare esempi esistenti
   - [ ] Deprecare smart-workflows
   - [ ] Pubblicare nuova versione

---

## ⚠️ CONSIDERAZIONI IMPORTANTI

1. **Performance**: 20+ tool potrebbero rallentare ListTools. Test necessari.
2. **Backward Compatibility**: smart-workflows deve rimanere funzionante.
3. **Naming**: Prefisso `workflow-*` vs `workflow_*` - decidere standard.
4. **Versioning**: Come gestire v1/v2 dei workflow?
5. **Deprecation**: Strategia chiara per rimuovere tool obsoleti.

---

## 📚 RIFERIMENTI

### Documentazione Tecnica
- **MCP TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **Serena MCP Repository**: https://github.com/oraios/serena
- **Serena Tool Inspection**: Via Claude Code → mcp__serena__* tools

### Codebase Locale
- **Enhancement Plans**: docs/enhancement-plan/ (18 documenti)
- **Workflow Implementations**: src/workflows/*.workflow.ts
- **Tool Definitions**: src/tools/*.tool.ts
- **MCP Configuration**: .cursor/mcp.json (Serena config alla linea 33-46)

### Analisi da Condurre
1. **Serena Tool Listing**:
   ```bash
   # In Claude Code, guardare tutti i tool disponibili
   # Filtro: mcp__serena__*
   # Analizzare descrizioni, parametri, pattern
   ```

2. **Serena Repository**:
   ```bash
   # Studiare:
   # - Come registrano tool
   # - Pattern di naming
   # - Struttura descrizioni
   # - Gestione parametri complessi
   ```

3. **Workflow Locali**:
   ```bash
   # Inventario completo:
   ls -la src/workflows/*.workflow.ts
   # Per ogni workflow: params, use case, backends
   ```
