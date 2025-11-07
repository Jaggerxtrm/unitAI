# UNIFIED AUTONOMOUS SYSTEM PLAN v3.0

**Versione:** 3.0 (Revised & Pragmatic)
**Data:** 2025-11-07
**Status:** Implementazione Realistica
**Revisore:** Architetto AI Senior
**Basato su:** Analisi completa della codebase esistente

---

## Executive Summary

Questo documento rappresenta una revisione critica e pragmatica del piano originale v2.0, basata su un'analisi approfondita della codebase esistente e delle best practices di ingegneria del software.

**Cambio di Paradigma:**
- Da "sistema autonomo completo" a **"sistema progressivamente autonomo"**
- Da "architettura ricorsiva MCP" a **"orchestrazione AI multi-modello"**
- Da target ottimistici (95% autonomia) a **target misurabili e realistici**
- Da implementazione monolitica a **staged rollout con validazione**

**Cosa Abbiamo Gia':**
- Permission system robusto (AutonomyLevel + OperationType)
- 3 workflow funzionanti (init-session, parallel-review, validate-last-commit)
- AI executor multi-backend (Qwen, Gemini, Rovodev)
- Git integration completa
- MCP server stabile

**Cosa Manca (Criticamente):**
- Testing infrastructure
- Logging strutturato e monitoring
- Error recovery mechanisms
- Integration con MCP servers esterni (Serena, claude-context)
- Learning & adaptation engine
- Audit trail per decisioni autonome

---

## 1. Analisi Critica del Piano v2.0

### 1.1. Problemi Identificati

#### Architettura Ricorsiva MCP: Gap Realta'/Visione
**Problema:** Il piano v2.0 descrive dettagliatamente un'architettura ricorsiva dove `unified-ai-mcp` invoca altri MCP servers (Serena, claude-context, context7, deepwiki, openmemory).

**Realta':** Analizzando il codice:
- `src/utils/aiExecutor.ts`: Chiama solo CLI esterni (qwen, acli, gemini)
- Nessuna integrazione con MCP SDK client
- Nessun codice per chiamare altri MCP servers
- Zero import di client MCP

**Impatto:** 
- Le sezioni 3.6 (Ecosistema MCP Integrato) e i workflow example sono **puramente teorici**
- Le metriche di token efficiency (95%+ reduction) sono **non verificate**
- Gli esempi di "orchestrazione ricorsiva" sono **aspirazionali, non reali**

**Raccomandazione:** Rimuovere o marcare come "Future Work" tutte le sezioni su architettura ricorsiva fino a quando non viene implementata.

#### Metriche di Successo Irrealistiche
**Problema:** Sezione 6 definisce:
- Autonomy Rate >90%
- Task Success Rate >95%
- Token saving 95%+

**Realta':**
- Nessun sistema di tracking per queste metriche nel codice
- Nessun telemetry o analytics
- Nessuna baseline measurement

**Confronto con Industria:**
- AutoGPT: ~50-60% task success rate
- GPT-Engineer: ~65-70% autonomy rate
- GitHub Copilot Workspace: ~75% task completion (con human guidance)

**Raccomandazione:** Target realistici per Fase 1:
- Autonomy Rate: 50-60%
- Task Success Rate: 70-75%
- Token efficiency: 30-40% vs manual approach

#### Learning & Adaptation Engine: Under-Specified
**Problema:** Sezione 3.4 descrive OpenMemory con "memoria cognitiva", "decadimento", "settori semantici/episodici/proceduali".

**Realta':**
- Zero implementazione nel codice
- Nessuno schema database
- Nessun retrieval mechanism
- Nessun decay algorithm

**Rischio:** Senza implementazione concreta, questo rimane vaporware.

**Raccomandazione:** Definire MVP:
```typescript
interface WorkflowMemory {
  id: string;
  workflowName: string;
  timestamp: Date;
  params: Record<string, any>;
  outcome: 'success' | 'failure' | 'partial';
  errorMessage?: string;
  executionTimeMs: number;
  backendsUsed: string[];
  lessons: string; // Human-readable insight
}
```

Iniziare con SQLite file-based storage, no fancy AI retrieval.

#### Testing Strategy: Assente
**Problema:** Il piano non menziona testing nonostante la complessita' del sistema.

**Realta':**
- Zero test files nella codebase
- Nessun test infrastructure
- Nessun mocking strategy per AI backends

**Rischio:** In un sistema che orchestrerà operazioni autonome su codice production, l'assenza di test e' **inaccettabile**.

**Raccomandazione:** Priorita' massima per Fase 1.

---

## 2. Architettura Rivista (Realistica)

### 2.1. Livelli di Sistema (Come Implementato)

```
┌─────────────────────────────────────────────────────┐
│ Livello 1: Claude Code (User Interface)            │
│  - Riceve comandi utente                            │
│  - Invoca MCP tools                                 │
└─────────────────────┬───────────────────────────────┘
                      │ MCP Protocol
┌─────────────────────▼───────────────────────────────┐
│ Livello 2: unified-ai-mcp-tool (MCP Server)        │
│  - Tool: ask-qwen, ask-gemini, ask-rovodev          │
│  - Tool: smart-workflows                            │
│  - Permission Manager (autonomyLevel checking)      │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│ Livello 3: Workflow Orchestration Layer            │
│  - initSessionWorkflow                              │
│  - parallelReviewWorkflow                           │
│  - validateLastCommitWorkflow                       │
│  - Utilities: runParallelAnalysis, gitHelper        │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│ Livello 4: AI Execution Layer                      │
│  - executeQwenCLI()                                 │
│  - executeGeminiCLI()                               │
│  - executeRovodevCLI()                              │
│  - Fallback logic (Qwen primary → fallback)        │
└─────────────────────┬───────────────────────────────┘
                      │ Process spawn
┌─────────────────────▼───────────────────────────────┐
│ Livello 5: External CLI Tools                      │
│  - qwen (Python CLI)                                │
│  - gemini (npm CLI)                                 │
│  - acli rovodev (npm CLI)                           │
└─────────────────────────────────────────────────────┘
```

**Nota Critica:** Questa e' l'architettura REALE. Non c'e' nessuna "recursive MCP architecture" al momento.

### 2.2. Permission System (GIA' IMPLEMENTATO)

```typescript
// src/utils/permissionManager.ts (ESISTENTE)

enum AutonomyLevel {
  READ_ONLY = "read-only", // Default
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high"
}

enum OperationType {
  READ_FILE, WRITE_FILE,
  GIT_READ, GIT_COMMIT, GIT_PUSH, GIT_BRANCH,
  INSTALL_DEPENDENCY, EXECUTE_COMMAND,
  EXTERNAL_API, MCP_CALL
}

// Permission matrix (gia' definito)
const PERMISSION_MATRIX: Record<OperationType, AutonomyLevel> = {
  [OperationType.READ_FILE]: AutonomyLevel.READ_ONLY,
  [OperationType.GIT_READ]: AutonomyLevel.READ_ONLY,
  [OperationType.WRITE_FILE]: AutonomyLevel.LOW,
  [OperationType.GIT_COMMIT]: AutonomyLevel.MEDIUM,
  [OperationType.GIT_PUSH]: AutonomyLevel.HIGH,
  // ... (completo nel codice)
}
```

**Punti di Forza:**
- Implementazione completa e pulita
- Helper classes (GitOperations, FileOperations)
- Integration con workflow types (BaseWorkflowParams)

**Mancanze Critiche:**
1. **Nessun Audit Trail**: Quando un workflow esegue un'operazione con MEDIUM/HIGH autonomy, non viene loggato
2. **Nessun Rate Limiting**: Un workflow in loop potrebbe fare 1000 git commits
3. **Nessuna Validazione Runtime**: Chi controlla che un workflow rispetti effettivamente i permessi?

### 2.3. Workflow System (3/5 IMPLEMENTATI)

**Implementati:**
- `init-session`: Git analysis + AI synthesis con Rovodev
- `parallel-review`: Parallel analysis con Gemini + Rovodev
- `validate-last-commit`: Commit validation con Gemini + Qwen

**Mancanti (commentati nel codice):**
- `pre-commit-validate`
- `bug-hunt`

**Analisi Qualita':**

Punti di forza:
- Schema Zod per validazione
- Progress callbacks
- Error handling base
- Parallel execution (Promise.all)

Punti deboli:
- Nessun retry logic
- Nessun timeout granulare per singolo AI backend
- Error messages poco strutturati
- Nessun caching dei risultati

---

## 3. Roadmap Rivista (Pragmatica)

### Fase 0: Foundations (3 settimane esatte) - PRIORITA' MASSIMA

#### 3.0.1. Testing Infrastructure
**Perche':** Non puoi costruire autonomia senza test. Period.

**Task:**
1. Setup testing framework (Vitest o Jest)
2. Create test utilities:
   ```typescript
   // tests/utils/mockAI.ts
   export function mockQwenResponse(response: string): jest.Mock
   export function mockGitCommand(command: string, output: string): jest.Mock
   ```
3. Write unit tests per:
   - `permissionManager.ts` (100% coverage)
   - `gitHelper.ts` (critical paths)
   - `aiExecutor.ts` (mock CLI calls)
4. Write integration tests per:
   - Ogni workflow con mocked AI backends
5. Setup CI/CD con test automation

**Success Criteria:**
- 80%+ code coverage
- Tutti i test green
- CI pipeline funzionante

**Effort:** 1 settimana (critico)

#### 3.0.2. Logging Strutturato e Monitoring
**Perche':** Debugging autonomia senza logging strutturato e' impossibile. Serve visibilita' real-time e post-mortem analysis.

**Architettura Proposta:**
```
logs/
├── workflow-executions.log    # Eventi workflow-level
├── ai-backend-calls.log        # Interazioni con AI
├── permission-checks.log       # Audit sistema permessi  
├── git-operations.log          # Operazioni Git
├── errors.log                  # Solo errori
└── debug.log                   # Tutto (verbose mode)
```

**Componenti Chiave:**

1. **StructuredLogger** - Logger principale con file-based output
2. **WorkflowLogger** - Logger context-aware con auto-inject workflowId
3. **LogEntry** - Formato strutturato JSON per ogni log
4. **LogRotation** - Compressione automatica logs vecchi
5. **Query API** - Ricerca logs per debug post-mortem

**Implementazione:**

```typescript
// src/utils/structuredLogger.ts

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export enum LogCategory {
  WORKFLOW = 'workflow',
  AI_BACKEND = 'ai-backend',
  PERMISSION = 'permission',
  GIT = 'git',
  MCP = 'mcp',
  SYSTEM = 'system'
}

export interface LogEntry {
  timestamp: string;              // ISO 8601
  level: LogLevel;
  category: LogCategory;
  component: string;              // Nome workflow o modulo
  operation: string;              // Nome operazione specifica
  message: string;
  metadata?: Record<string, any>;
  duration?: number;              // Millisecondi (per timing)
  workflowId?: string;            // Per correlare log stesso workflow
  parentSpanId?: string;          // Per distributed tracing (future)
}

export class StructuredLogger {
  private logDir: string;
  private minLevel: LogLevel;
  private streams: Map<string, fs.WriteStream>;
  
  constructor(config?: {
    logDir?: string;
    minLevel?: LogLevel;
    enableConsole?: boolean;
  });
  
  /**
   * Log generico - scrive su file appropriati
   */
  log(entry: Omit<LogEntry, 'timestamp'>): void;
  
  /**
   * Helpers per livelli specifici
   */
  debug(category: LogCategory, component: string, operation: string, message: string, metadata?: any): void;
  info(category: LogCategory, component: string, operation: string, message: string, metadata?: any): void;
  warn(category: LogCategory, component: string, operation: string, message: string, metadata?: any): void;
  error(category: LogCategory, component: string, operation: string, message: string, error?: Error, metadata?: any): void;
  
  /**
   * Crea workflow-scoped logger
   */
  forWorkflow(workflowId: string, workflowName: string): WorkflowLogger;
  
  /**
   * Query logs per debug post-mortem
   */
  queryLogs(filters: {
    category?: LogCategory;
    level?: LogLevel;
    workflowId?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): LogEntry[];
  
  /**
   * Export logs per external analysis
   */
  exportLogs(category: LogCategory, format: 'json' | 'csv'): string;
  
  /**
   * Cleanup logs vecchi
   */
  cleanup(daysToKeep: number): void;
  
  /**
   * Timer per operazioni
   */
  startTimer(workflowId: string, operation: string): () => void;
}

/**
 * Workflow-scoped logger - auto-inject workflowId
 */
export class WorkflowLogger {
  constructor(
    private baseLogger: StructuredLogger,
    private workflowId: string,
    private workflowName: string
  );
  
  /**
   * Log workflow step
   */
  step(stepName: string, message: string, metadata?: any): void;
  
  /**
   * Log AI backend call
   */
  aiCall(backend: string, prompt: string, metadata?: any): void;
  
  /**
   * Log permission check
   */
  permissionCheck(operation: string, allowed: boolean, metadata?: any): void;
  
  /**
   * Log error
   */
  error(operation: string, error: Error, metadata?: any): void;
  
  /**
   * Time operation automatically
   */
  timing<T>(operation: string, fn: () => Promise<T>): Promise<T>;
}

// Singleton instance
export const structuredLogger = new StructuredLogger({
  minLevel: process.env.LOG_LEVEL === 'debug' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: process.env.LOG_TO_CONSOLE === 'true'
});
```

**Task Dettagliati:**

1. **Implementare StructuredLogger** (Giorni 1-2)
   - File-based write streams per categoria
   - JSON serialization per ogni log entry
   - Atomic writes (evitare corrupted logs)
   - Gestione errori write (fallback graceful)
   - Tests: 100% coverage su log writing

2. **Implementare WorkflowLogger** (Giorno 2)
   - Wrapper che auto-inject workflowId
   - Helper methods (step, aiCall, permissionCheck, etc.)
   - Timing decorator per operations
   - Tests: integration con StructuredLogger

3. **Integrate in workflow esistenti** (Giorno 3)
   - Aggiornare init-session.workflow.ts
   - Aggiornare parallel-review.workflow.ts  
   - Aggiornare validate-last-commit.workflow.ts
   - Pattern:
     ```typescript
     const workflowId = generateId();
     const logger = structuredLogger.forWorkflow(workflowId, 'workflow-name');
     
     logger.step('start', 'Starting workflow', { params });
     // ... workflow logic con logger.step() calls
     logger.step('complete', 'Workflow done', { results });
     ```

4. **Implementare Log Rotation** (Giorno 4)
   ```typescript
   // src/utils/logRotation.ts
   export class LogRotator {
     constructor(
       private logDir: string,
       private maxSizeMB: number = 10,
       private maxFiles: number = 5
     );
     
     /**
      * Rotate single log file
      * file.log -> file.log.1.gz -> file.log.2.gz -> ...
      */
     async rotate(filename: string): Promise<void>;
     
     /**
      * Rotate all logs
      */
     async rotateAll(): Promise<void>;
   }
   
   // Auto-rotation ogni ora
   const rotator = new LogRotator(path.join(process.cwd(), 'logs'));
   setInterval(() => rotator.rotateAll(), 60 * 60 * 1000);
   ```

5. **Implementare Query API** (Giorno 4)
   - Read logs da file
   - Parse JSON lines
   - Apply filters (category, level, workflowId, time range)
   - Return sorted results
   - Tests: vari scenari di query

6. **Monitoring Scripts** (Giorno 5)
   ```bash
   # scripts/watch-logs.sh
   #!/bin/bash
   
   # Real-time workflow monitoring
   tail -f logs/workflow-executions.log | jq '.'
   
   # Watch errors only
   tail -f logs/errors.log | jq 'select(.level == 3)'
   
   # Filter by workflowId
   tail -f logs/debug.log | jq 'select(.workflowId == "'"$1"'")'   
   # Watch specific category
   tail -f logs/ai-backend-calls.log | jq '.'
   ```
   
   ```bash
   # scripts/analyze-logs.sh
   #!/bin/bash
   
   # Show workflow summary
   cat logs/workflow-executions.log | jq -s '
     group_by(.component) | 
     map({
       workflow: .[0].component,
       count: length,
       avgDuration: (map(.duration) | add / length)
     })
   '
   
   # Show error distribution
   cat logs/errors.log | jq -s 'group_by(.component) | map({component: .[0].component, count: length})'
   ```

7. **Documentation** (Giorno 5)
   - README section su logging
   - Examples di usage nei workflow
   - Query examples per common debug scenarios
   - Monitoring setup guide

**Integration Example:**

```typescript
// src/workflows/parallel-review.workflow.ts (AGGIORNATO)

import { structuredLogger, LogCategory } from '../utils/structuredLogger.js';
import { generateId } from '../utils/idGenerator.js';

async function executeParallelReview(
  params: ParallelReviewParams,
  onProgress?: ProgressCallback
): Promise<string> {
  // Setup logging
  const workflowId = generateId();
  const logger = structuredLogger.forWorkflow(workflowId, 'parallel-review');
  
  logger.step('start', 'Starting parallel review workflow', {
    filesCount: params.files.length,
    focus: params.focus,
    autonomyLevel: params.autonomyLevel
  });
  
  try {
    // Step 1: Permission check
    const permissions = createWorkflowPermissionManager(params);
    const canRead = permissions.file.canRead();
    logger.permissionCheck('read-files', canRead, {
      requestedLevel: params.autonomyLevel
    });
    
    if (!canRead) {
      throw new Error('Permission denied: cannot read files');
    }
    
    // Step 2: Parallel AI analysis
    logger.step('parallel-analysis-start', 'Starting parallel analysis', {
      backends: ['gemini', 'rovodev']
    });
    
    const geminiResult = await logger.timing('gemini-analysis', async () => {
      logger.aiCall('gemini', buildPrompt(params.files), {
        model: AI_MODELS.GEMINI.PRIMARY,
        filesCount: params.files.length
      });
      
      return await executeAIClient({
        backend: BACKENDS.GEMINI,
        prompt: buildPrompt(params.files, params.focus)
      });
    });
    
    logger.step('gemini-complete', 'Gemini analysis completed', {
      outputLength: geminiResult.length
    });
    
    const rovodevResult = await logger.timing('rovodev-analysis', async () => {
      logger.aiCall('rovodev', buildPrompt(params.files), {
        filesCount: params.files.length
      });
      
      return await executeAIClient({
        backend: BACKENDS.ROVODEV,
        prompt: buildPrompt(params.files, params.focus)
      });
    });
    
    logger.step('rovodev-complete', 'Rovodev analysis completed', {
      outputLength: rovodevResult.length
    });
    
    // Step 3: Synthesize
    const synthesis = synthesizeResults([
      { backend: 'gemini', output: geminiResult, success: true },
      { backend: 'rovodev', output: rovodevResult, success: true }
    ]);
    
    logger.step('complete', 'Parallel review completed successfully', {
      synthesisLength: synthesis.length
    });
    
    return formatWorkflowOutput('Parallel Review', synthesis);
    
  } catch (error) {
    logger.error('execution-failed', error as Error, {
      files: params.files,
      focus: params.focus
    });
    throw error;
  }
}
```

**Real-Time Monitoring:**

```bash
# Terminal 1: Run MCP server
unified-ai-mcp-tool

# Terminal 2: Monitor workflow activity
tail -f logs/workflow-executions.log | jq '.'

# Terminal 3: Monitor AI backend calls
tail -f logs/ai-backend-calls.log | jq 'select(.component == "parallel-review")'

# Terminal 4: Watch for errors
tail -f logs/errors.log | jq '.'

# Query logs post-mortem
node -e "
const { structuredLogger } = require('./dist/utils/structuredLogger.js');
const logs = structuredLogger.queryLogs({
  workflowId: 'abc-123',
  category: 'workflow'
});
console.log(JSON.stringify(logs, null, 2));
"
```

**Success Criteria:**
- Ogni workflow execution ha log completo (start, steps, complete/error)
- Correlation via workflowId (tutti i log di uno stesso workflow)
- Performance metrics visibili (duration per ogni step)
- Zero interferenza con MCP protocol (write a stderr/files, NOT stdout)
- Log rotation automatico (evita file giganti)
- Query API funzionante per debug post-mortem
- Export in JSON/CSV per external analysis
- Real-time monitoring possibile via tail
- Tests con 80%+ coverage

**Effort:** 5 giorni (1 settimana lavorativa)

**Breakdown:**
- Giorni 1-2: StructuredLogger + WorkflowLogger implementation + unit tests
- Giorno 3: Integration in tutti i workflow esistenti (3 workflow)
- Giorno 4: Log rotation + query API + integration tests
- Giorno 5: Monitoring scripts + documentation + examples

#### 3.0.3. Audit Trail per Decisioni Autonome
**Perche':** Trust ma verify. Ogni azione autonoma deve essere tracciata.

**Task:**
1. Create audit database (SQLite):
   ```typescript
   // src/utils/auditTrail.ts
   interface AuditEntry {
     id: string;
     timestamp: Date;
     workflowName: string;
     autonomyLevel: AutonomyLevel;
     operation: OperationType;
     target: string; // file path, branch name, etc.
     approved: boolean;
     executedBy: 'system' | 'user';
     outcome: 'success' | 'failure';
     metadata: Record<string, any>;
   }
   
   export class AuditTrail {
     record(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void;
     query(filters: Partial<AuditEntry>): AuditEntry[];
     exportReport(format: 'json' | 'csv' | 'html'): string;
   }
   ```
2. Integrate audit trail in PermissionManager:
   ```typescript
   export function assertPermission(
     currentLevel: AutonomyLevel,
     operation: OperationType,
     context?: string
   ): void {
     const result = checkPermission(currentLevel, operation);
     
     // LOG AUDIT ENTRY
     auditTrail.record({
       workflowName: getCurrentWorkflowName(),
       autonomyLevel: currentLevel,
       operation,
       target: context || 'unknown',
       approved: result.allowed,
       executedBy: 'system',
       outcome: 'pending',
       metadata: {}
     });
     
     if (!result.allowed) {
       throw new Error(result.reason);
     }
   }
   ```
3. Create audit report viewer

**Success Criteria:**
- Ogni operazione MEDIUM/HIGH e' auditata
- Report ricostruisce sequenza decisioni
- Possibilita' di rollback basato su audit

**Effort:** 4-5 giorni

#### 3.0.4. Error Recovery Framework
**Perche':** Workflows falliranno. Serve strategia di recovery.

**Task:**
1. Create error classification:
   ```typescript
   // src/utils/errorRecovery.ts
   enum ErrorType {
     TRANSIENT = 'transient',      // Retry possibile (network, timeout)
     PERMANENT = 'permanent',       // No retry (invalid syntax, missing file)
     QUOTA = 'quota',              // Fallback a modello alternativo
     PERMISSION = 'permission'      // Escalation a utente
   }
   
   interface RecoveryStrategy {
     maxRetries: number;
     backoffMs: number[];
     fallbackAction?: () => Promise<void>;
     escalateToUser: boolean;
   }
   
   const RECOVERY_STRATEGIES: Record<ErrorType, RecoveryStrategy> = {
     [ErrorType.TRANSIENT]: {
       maxRetries: 3,
       backoffMs: [1000, 5000, 15000],
       escalateToUser: false
     },
     [ErrorType.QUOTA]: {
       maxRetries: 1,
       backoffMs: [0],
       fallbackAction: () => switchToFallbackModel(),
       escalateToUser: false
     },
     // ...
   }
   ```
2. Implement retry wrapper:
   ```typescript
   export async function executeWithRecovery<T>(
     operation: () => Promise<T>,
     errorClassifier: (error: Error) => ErrorType
   ): Promise<T>
   ```
3. Add circuit breaker per AI backend:
   ```typescript
   class CircuitBreaker {
     private failureCount = 0;
     private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
     
     async execute<T>(fn: () => Promise<T>): Promise<T> {
       if (this.state === 'OPEN') {
         throw new Error('Circuit breaker OPEN');
       }
       // ... logic
     }
   }
   ```

**Success Criteria:**
- Transient errors recuperati automaticamente
- Circuit breaker previene cascading failures
- User escalation per errori irrecuperabili

**Effort:** 1 settimana

#### 3.0.5. Workflow Context Memory
**Perche':** Workflow complessi necessitano stato temporaneo per accumulo incrementale, conditional flow, e AI context building. Evita parameter drilling e rende workflow più composabili.

**Concept:**
```typescript
// WorkflowContext = memoria temporanea che vive durante esecuzione workflow
// Permette accumulo incrementale, checkpoint/rollback, shared context

const ctx = new WorkflowContext(workflowId, 'bug-hunt');

// Accumulo progressivo
ctx.set('targetFiles', await findFiles());
ctx.append('analyses', await analyzeFile(file1));
ctx.append('analyses', await analyzeFile(file2));
ctx.increment('issuesFound');

// Checkpoint per error recovery
ctx.checkpoint('before-risky-operation');
try {
  await riskyOperation();
} catch (error) {
  ctx.rollback('before-risky-operation');
}

// Generate report con tutto il contesto
const report = generateReport(ctx.getAll('analyses'));
```

**Use Cases Principali:**

1. **Accumulo Incrementale**
   ```typescript
   // SENZA Context (parameter drilling)
   async function bugHunt(symptoms: string) {
     const files = await findFiles(symptoms);
     const issues = [];
     for (const file of files) {
       issues.push(await analyzeFile(file));
     }
     return generateReport(files, issues); // Ripeti parametri
   }
   
   // CON Context (accumulo naturale)
   async function bugHunt(symptoms: string, ctx: WorkflowContext) {
     ctx.set('targetFiles', await findFiles(symptoms));
     
     for (const file of ctx.get<string[]>('targetFiles')!) {
       ctx.append('analyses', await analyzeFile(file));
       if (hasIssue) ctx.increment('issuesFound');
     }
     
     return generateReport(ctx); // Accede a tutto
   }
   ```

2. **AI Context Building**
   ```typescript
   // Accumula discoveries per AI synthesis
   async function iterativeAnalysis(ctx: WorkflowContext) {
     const scan1 = await askQwen("Quick scan");
     ctx.append('discoveries', scan1);
     
     // AI ha contesto precedente
     const scan2 = await askGemini(`
       Based on: ${ctx.getAll('discoveries').join('\n')}
       Now analyze deeper...
     `);
     ctx.append('discoveries', scan2);
     
     // Final synthesis con TUTTO il contesto
     return await askGemini(`
       Report from: ${ctx.getAll('discoveries').join('\n\n')}
     `);
   }
   ```

3. **Conditional Flow**
   ```typescript
   // Decisioni basate su discoveries
   async function smartWorkflow(ctx: WorkflowContext) {
     const hasTests = await checkForTests();
     ctx.set('hasTests', hasTests);
     
     if (!ctx.get('hasTests')) {
       await generateTests();
       ctx.set('testsGenerated', true);
     }
     
     if (ctx.get('testsGenerated')) {
       await commitTests();
     }
     
     return `Tests ${ctx.get('testsGenerated') ? 'generated' : 'existed'}`;
   }
   ```

4. **Error Recovery con Checkpoints**
   ```typescript
   async function multiStepRefactoring(ctx: WorkflowContext) {
     const steps = ['rename', 'extract', 'optimize'];
     
     for (const step of steps) {
       ctx.checkpoint(`before-${step}`);
       
       try {
         await applyRefactoring(step);
         ctx.append('completedSteps', step);
       } catch (error) {
         ctx.rollback(`before-${step}`); // Safe rollback
         ctx.append('failedSteps', { step, error });
         if (isCritical(step)) throw error;
       }
     }
   }
   ```

5. **Shared Context tra Sub-Workflows**
   ```typescript
   async function complexTask() {
     const mainCtx = new WorkflowContext('main', 'complex');
     mainCtx.set('projectRoot', process.cwd());
     
     // Sub-workflows ereditano context
     await Promise.all([
       securityAudit(mainCtx.createChild('security')),  // Legge projectRoot
       performanceCheck(mainCtx.createChild('perf'))   // Legge projectRoot
     ]);
   }
   ```

**Implementazione:**

```typescript
// src/workflows/workflowContext.ts

export class WorkflowContext {
  private data: Map<string, any>;
  private arrays: Map<string, any[]>;
  private metadata: {
    workflowId: string;
    workflowName: string;
    startTime: Date;
  };
  
  constructor(workflowId: string, workflowName: string) {
    this.data = new Map();
    this.arrays = new Map();
    this.metadata = { workflowId, workflowName, startTime: new Date() };
  }
  
  /**
   * Basic operations
   */
  set<T>(key: string, value: T): void;
  get<T>(key: string): T | undefined;
  has(key: string): boolean;
  getOrDefault<T>(key: string, defaultValue: T): T;
  
  /**
   * Array operations (accumulo)
   */
  append<T>(key: string, value: T): void;
  getAll<T>(key: string): T[];
  
  /**
   * Counter operations
   */
  increment(key: string, amount?: number): number;
  
  /**
   * Object merge
   */
  merge(key: string, partial: Record<string, any>): void;
  
  /**
   * Checkpoints (error recovery)
   */
  checkpoint(name: string): void;
  rollback(name: string): boolean;
  
  /**
   * Persistence (optional)
   */
  export(): string;
  static import(json: string): WorkflowContext;
  
  /**
   * Summary per logging
   */
  summary(): Record<string, any>;
  
  /**
   * Clear (testing)
   */
  clear(): void;
}

/**
 * Context-aware workflow executor
 * Auto-inject context in workflow params
 */
export class ContextualWorkflowExecutor {
  async execute<TParams, TResult>(
    workflow: WorkflowDefinition<TParams>,
    params: TParams,
    onProgress?: ProgressCallback
  ): Promise<TResult> {
    const workflowId = generateId();
    const ctx = new WorkflowContext(workflowId, workflow.name);
    
    // Inject context
    const contextualParams = { ...params, __context: ctx };
    
    try {
      const result = await workflow.execute(contextualParams, onProgress);
      
      // Log context summary
      structuredLogger.info(
        LogCategory.WORKFLOW,
        workflow.name,
        'context-summary',
        'Workflow context summary',
        ctx.summary()
      );
      
      return result;
    } catch (error) {
      // Log context at error (per debug)
      structuredLogger.error(
        LogCategory.WORKFLOW,
        workflow.name,
        'execution-failed',
        'Workflow failed',
        error as Error,
        { context: ctx.summary() }
      );
      throw error;
    }
  }
}
```

**Advanced: Shared Context Manager (Optional)**

```typescript
// src/workflows/sharedContext.ts

/**
 * Manager per shared context tra workflow parent-child
 */
export class SharedContextManager {
  private contexts: Map<string, WorkflowContext>;
  private parentChildMap: Map<string, string[]>;
  
  constructor() {
    this.contexts = new Map();
    this.parentChildMap = new Map();
  }
  
  /**
   * Create root context
   */
  createRoot(workflowId: string, workflowName: string): WorkflowContext;
  
  /**
   * Create child context (inherits from parent)
   */
  createChild(parentId: string, childId: string, childName: string): WorkflowContext;
  
  /**
   * Get context by ID
   */
  get(workflowId: string): WorkflowContext | undefined;
  
  /**
   * Cleanup completed workflows
   */
  cleanup(workflowId: string): void;
}

export const sharedContextManager = new SharedContextManager();
```

**Task Dettagliati:**

1. **Implementare WorkflowContext** (Giorno 1)
   - Map-based storage per data e arrays
   - Basic operations (set, get, has, append)
   - Counter operations (increment)
   - Checkpoint/rollback mechanism
   - Tests: 100% coverage

2. **Implementare ContextualWorkflowExecutor** (Giorno 1)
   - Auto-inject context in params
   - Log context summary on completion
   - Log context on error
   - Integration con StructuredLogger
   - Tests: integration con workflow mock

3. **Update workflow types** (Giorno 2)
   ```typescript
   // src/workflows/types.ts
   export interface BaseWorkflowParams {
     autonomyLevel?: AutonomyLevel;
     __context?: WorkflowContext; // Injected by executor
   }
   ```

4. **Integrate in workflow esistenti** (Giorno 2)
   - Update parallel-review per usare context
   - Update init-session per usare context
   - Update validate-last-commit per usare context
   - Pattern:
     ```typescript
     async function myWorkflow(params: MyParams) {
       const ctx = params.__context!;
       
       ctx.set('startData', await fetchData());
       ctx.append('results', await processData());
       ctx.increment('itemsProcessed');
       
       return formatOutput(ctx.summary());
     }
     ```

5. **Documentation & Examples** (Giorno 2)
   - README section su workflow context
   - Examples per ogni use case
   - Best practices
   - Common patterns

**Integration Example:**

```typescript
// src/workflows/bug-hunt-with-context.workflow.ts

interface BugHuntParams extends BaseWorkflowParams {
  symptoms: string;
  suspectedFiles?: string[];
  __context?: WorkflowContext; // Injected
}

async function executeBugHunt(
  params: BugHuntParams,
  onProgress?: ProgressCallback
): Promise<string> {
  const ctx = params.__context!;
  const logger = structuredLogger.forWorkflow(ctx.metadata.workflowId, 'bug-hunt');
  
  logger.step('start', 'Starting bug hunt', { symptoms: params.symptoms });
  
  // Step 1: Find files
  if (!params.suspectedFiles || params.suspectedFiles.length === 0) {
    logger.step('file-discovery', 'Searching for relevant files');
    
    const files = await executeAIClient({
      backend: BACKENDS.QWEN,
      prompt: `Find files related to: ${params.symptoms}`
    });
    
    ctx.set('targetFiles', extractFilePaths(files));
    ctx.set('discoveryMethod', 'ai-search');
  } else {
    ctx.set('targetFiles', params.suspectedFiles);
    ctx.set('discoveryMethod', 'user-provided');
  }
  
  logger.step('files-identified', 'Target files identified', {
    count: ctx.get<string[]>('targetFiles')!.length,
    method: ctx.get('discoveryMethod')
  });
  
  // Step 2: Analyze each file (accumulo)
  for (const file of ctx.get<string[]>('targetFiles')!) {
    logger.step('analyzing-file', `Analyzing ${file}`);
    
    const analysis = await executeAIClient({
      backend: BACKENDS.GEMINI,
      prompt: `Analyze ${file} for: ${params.symptoms}`
    });
    
    ctx.append('fileAnalyses', { file, analysis });
    
    if (hasIssue(analysis)) {
      ctx.append('problematicFiles', file);
      ctx.increment('issuesFound');
    }
  }
  
  logger.step('analysis-complete', 'File analysis complete', {
    filesAnalyzed: ctx.get<string[]>('targetFiles')!.length,
    issuesFound: ctx.get('issuesFound')
  });
  
  // Step 3: Conditional - Se trovati issue, cerca related files
  if (ctx.has('problematicFiles') && ctx.getAll('problematicFiles').length > 0) {
    logger.step('searching-related', 'Searching for related files');
    
    const problematic = ctx.getAll<string>('problematicFiles');
    
    for (const file of problematic) {
      const related = await findRelatedFiles(file);
      ctx.append('relatedFiles', ...related);
    }
    
    logger.step('related-found', 'Related files identified', {
      count: ctx.getAll('relatedFiles').length
    });
  }
  
  // Step 4: Synthesis con TUTTO il contesto
  logger.step('generating-report', 'Generating comprehensive report');
  
  const synthesisPrompt = `
Generate bug report:
Symptoms: ${params.symptoms}
Files analyzed: ${ctx.get<string[]>('targetFiles')!.join(', ')}
Issues found: ${ctx.get('issuesFound')}
Problematic files: ${ctx.getAll('problematicFiles').join(', ')}

Detailed analyses:
${ctx.getAll('fileAnalyses').map((a: any) => `${a.file}: ${a.analysis}`).join('\n')}

${ctx.has('relatedFiles') ? `
Related files: ${ctx.getAll('relatedFiles').join(', ')}
` : ''}

Provide root cause and fix recommendations.
  `;
  
  const report = await executeAIClient({
    backend: BACKENDS.GEMINI,
    prompt: synthesisPrompt
  });
  
  logger.step('complete', 'Bug hunt complete', ctx.summary());
  
  return formatWorkflowOutput('Bug Hunt Report', report, {
    ...ctx.summary(),
    problematicFilesCount: ctx.getAll('problematicFiles').length,
    relatedFilesCount: ctx.getAll('relatedFiles').length
  });
}
```

**Success Criteria:**
- WorkflowContext implementato con API completa
- Zero parameter drilling tra workflow steps
- Context summary loggato automaticamente
- Checkpoint/rollback funzionante per error recovery
- Integration in almeno 2 workflow esistenti
- Documentation con esempi pratici
- Tests con 80%+ coverage

**Effort:** 2 giorni

**Breakdown:**
- Giorno 1: WorkflowContext implementation + ContextualWorkflowExecutor + unit tests
- Giorno 2: Integration in workflow + documentation + examples

**Note:** Questa feature è MOLTO utile e NON è "too much". Rende workflow più:
- Composable (sub-workflows con shared context)
- Debuggable (context summary in logs)
- Resilient (checkpoint/rollback)
- Maintainable (meno parameter drilling)

#### 3.0.6. Summary Fase 0 - Effort & Timeline

**Effort Totale:** 3 settimane (15 giorni lavorativi)

| Task | Effort | Settimana | Priorità |
|------|--------|-----------|----------|
| 3.0.1 Testing Infrastructure | 5 giorni | Settimana 1 | CRITICA |
| 3.0.2 Structured Logging | 5 giorni | Settimana 2 (giorni 1-5) | CRITICA |
| 3.0.5 Workflow Context | 2 giorni | Settimana 2 (giorni 3-4, parallelo) | ALTA |
| 3.0.3 Audit Trail | 5 giorni | Settimana 2-3 | ALTA |
| 3.0.4 Error Recovery | 5 giorni | Settimana 3 | ALTA |

**Timeline Dettagliato:**

**Settimana 1: Testing Infrastructure**
- Giorni 1-2: Setup Vitest, test utilities, mock frameworks
- Giorni 3-4: Unit tests (permissionManager, gitHelper, aiExecutor)
- Giorno 5: Integration tests, CI/CD setup

**Settimana 2: Logging & Context**
- Giorni 1-2: StructuredLogger + WorkflowLogger implementation
- Giorno 3: Workflow Context implementation (parallelo con logging)
- Giorno 4: Workflow Context integration + logging integration
- Giorno 5: Log rotation, query API, monitoring scripts

**Settimana 3: Audit & Recovery**
- Giorni 1-3: Audit Trail (database, integration, reporting)
- Giorni 4-5: Error Recovery Framework (classification, retry, circuit breaker)

**Dependencies:**
- Testing deve essere completato prima (Settimana 1)
- Logging e Context possono essere paralleli (Settimana 2)
- Audit Trail richiede Logging completato
- Error Recovery può iniziare quando Logging è pronto

**Success Criteria Complessivi (Fine Fase 0):**
- 80%+ test coverage
- CI/CD green con automated tests
- Structured logging operativo su tutti i workflow
- Workflow context memory funzionante
- Audit trail completo per operazioni MEDIUM/HIGH
- Error recovery con retry e circuit breaker
- Real-time log monitoring funzionante
- Documentation completa per tutte le features

**Deliverables Fine Fase 0:**
1. Test suite completa (tests/)
2. StructuredLogger + WorkflowLogger (src/utils/)
3. WorkflowContext + ContextualWorkflowExecutor (src/workflows/)
4. AuditTrail (src/utils/)
5. Error Recovery Framework (src/utils/)
6. Monitoring scripts (scripts/)
7. Documentation aggiornata (docs/)

Dopo Fase 0, il sistema avrà fondamenta solide per implementare features avanzate con confidence.

---

### Fase 1: Core Workflows (3-4 settimane)

#### 3.1.1. Completare Workflow Mancanti

**Task 1: pre-commit-validate**
```typescript
// src/workflows/pre-commit-validate.workflow.ts
async function executePreCommitValidate(
  params: PreCommitValidateParams,
  onProgress?: ProgressCallback
): Promise<string> {
  const permissions = createWorkflowPermissionManager(params);
  
  // 1. Get staged files
  permissions.git.assertCommit('reading staged files');
  const stagedDiff = await getStagedDiff();
  
  if (!stagedDiff.trim()) {
    return formatWorkflowOutput('Pre-Commit Validation', 'No staged files to validate');
  }
  
  // 2. Run parallel checks
  const checks = [
    checkForSecrets(stagedDiff),      // Qwen: fast scan
    checkCodeQuality(stagedDiff),     // Gemini: deep analysis
    checkBreakingChanges(stagedDiff)  // Rovodev: practical review
  ];
  
  const results = await Promise.all(checks);
  
  // 3. Synthesize verdict
  const verdict = synthesizeValidationVerdict(results);
  
  return formatWorkflowOutput('Pre-Commit Validation', verdict);
}
```

**Task 2: bug-hunt**
```typescript
// src/workflows/bug-hunt.workflow.ts
async function executeBugHunt(
  params: BugHuntParams,
  onProgress?: ProgressCallback
): Promise<string> {
  const { symptoms, suspected_files } = params;
  
  // 1. Se non ci sono file sospetti, usa Qwen per pattern search
  let filesToAnalyze = suspected_files;
  if (!filesToAnalyze || filesToAnalyze.length === 0) {
    onProgress?.('Searching codebase for relevant files...');
    const searchResults = await executeAIClient({
      backend: BACKENDS.QWEN,
      prompt: `List files likely related to: ${symptoms}`
    });
    filesToAnalyze = extractFilePaths(searchResults);
  }
  
  // 2. Parallel analysis con diversi focus
  const analyses = await runParallelAnalysis(
    [BACKENDS.GEMINI, BACKENDS.ROVODEV],
    (backend) => buildBugHuntPrompt(symptoms, filesToAnalyze)
  );
  
  // 3. Synthesize findings
  return synthesizeBugHuntReport(analyses, symptoms, filesToAnalyze);
}
```

**Success Criteria:**
- 2 nuovi workflow funzionanti
- Tests per entrambi
- Documentazione con esempi

**Effort:** 1 settimana

#### 3.1.2. Workflow Enhancement: Caching

**Perche':** Analisi ripetute sprecano token e tempo.

**Task:**
```typescript
// src/workflows/cache.ts
interface CacheEntry {
  key: string;        // Hash di (workflowName + params + file content)
  result: string;
  timestamp: Date;
  ttlSeconds: number;
}

export class WorkflowCache {
  private cache = new Map<string, CacheEntry>();
  
  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const age = Date.now() - entry.timestamp.getTime();
    if (age > entry.ttlSeconds * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.result;
  }
  
  async set(key: string, result: string, ttlSeconds: number): Promise<void> {
    this.cache.set(key, { key, result, timestamp: new Date(), ttlSeconds });
  }
}

// Usage in workflows
const cacheKey = computeCacheKey(workflowName, params, fileContents);
const cached = await workflowCache.get(cacheKey);
if (cached) {
  onProgress?.('Using cached result');
  return cached;
}

const result = await runAnalysis();
await workflowCache.set(cacheKey, result, 3600); // 1 hour TTL
return result;
```

**Success Criteria:**
- Cache hit rate >50% in development
- 3-5x speedup per cached results
- TTL configurable per workflow

**Effort:** 3-4 giorni

#### 3.1.3. Smart Model Selection (SEMPLIFICATO)

Il piano v2.0 descrive "meta-orchestration" con GLM-4.6. Troppo complesso.

**Approccio Pragmatico:**
```typescript
// src/workflows/modelSelector.ts
interface TaskCharacteristics {
  complexity: 'low' | 'medium' | 'high';
  tokenBudget: number;
  requiresArchitecturalThinking: boolean;
  requiresCodeGeneration: boolean;
  requiresSpeed: boolean;
}

export function selectOptimalBackend(task: TaskCharacteristics): string {
  // Rule-based selection (no AI needed)
  if (task.requiresSpeed && task.complexity === 'low') {
    return BACKENDS.QWEN; // Fast, cheap
  }
  
  if (task.requiresArchitecturalThinking) {
    return BACKENDS.GEMINI; // Best for high-level reasoning
  }
  
  if (task.requiresCodeGeneration && task.complexity === 'high') {
    return BACKENDS.ROVODEV; // Most reliable for code
  }
  
  // Default
  return BACKENDS.GEMINI;
}

// Usage
const backend = selectOptimalBackend({
  complexity: 'high',
  tokenBudget: 50000,
  requiresArchitecturalThinking: true,
  requiresCodeGeneration: false,
  requiresSpeed: false
});

await executeAIClient({ backend, prompt });
```

**Success Criteria:**
- Chiara logica di selection
- Metriche: track quale backend usato per quale task
- Possibilita' di override manuale

**Effort:** 2-3 giorni

---

### Fase 2: External Integrations (4-6 settimane) - OPZIONALE

**NOTA CRITICA:** Questa fase implementa l'"architettura ricorsiva MCP" descritta nel piano v2.0. E' tecnicamente fattibile MA richiede:
1. Installare e configurare Serena, claude-context, etc come MCP servers
2. Implementare MCP client SDK in unified-ai-mcp
3. Gestire lifecycle di multiple MCP connections
4. Debugging complesso (multi-layer)

**Consiglio:** Implementare SOLO se i workflow attuali non bastano.

#### 3.2.1. MCP Client Infrastructure

**Task:**
```typescript
// src/mcp/client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export class MCPClientManager {
  private clients = new Map<string, Client>();
  
  async connect(config: MCPServerConfig): Promise<void> {
    const client = new Client({
      name: `unified-ai-mcp-client-${config.name}`,
      version: '1.0.0'
    });
    
    // Setup transport (stdio o SSE)
    const transport = createTransport(config);
    await client.connect(transport);
    
    this.clients.set(config.name, client);
  }
  
  async callTool(
    serverName: string,
    toolName: string,
    args: Record<string, any>
  ): Promise<any> {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new Error(`MCP client ${serverName} not connected`);
    }
    
    return await client.callTool({ name: toolName, arguments: args });
  }
  
  async disconnect(serverName: string): Promise<void> {
    const client = this.clients.get(serverName);
    if (client) {
      await client.close();
      this.clients.delete(serverName);
    }
  }
}
```

**Success Criteria:**
- Connessione stabile a 1+ MCP server esterno
- Error handling per connection failures
- Graceful degradation se server non disponibile

**Effort:** 1-2 settimane (complesso)

#### 3.2.2. Serena Integration (Symbol-based Code Surgery)

**Task:**
```typescript
// src/integrations/serena.ts
export class SerenaIntegration {
  constructor(private mcpClient: MCPClientManager) {}
  
  async findSymbol(
    name: string,
    includeBody = false
  ): Promise<SerenaSymbol[]> {
    return await this.mcpClient.callTool('serena', 'find_symbol', {
      name,
      include_body: includeBody
    });
  }
  
  async findReferencingSymbols(namePath: string): Promise<SerenaReference[]> {
    return await this.mcpClient.callTool('serena', 'find_referencing_symbols', {
      name_path: namePath
    });
  }
  
  async replaceSymbolBody(
    namePath: string,
    newBody: string
  ): Promise<void> {
    await this.mcpClient.callTool('serena', 'replace_symbol_body', {
      name_path: namePath,
      body: newBody
    });
  }
}

// Usage in workflow
async function refactorWithSerena(params: RefactorParams) {
  const serena = new SerenaIntegration(mcpClient);
  
  // 1. Find symbol
  const symbols = await serena.findSymbol('AuthMiddleware', true);
  
  // 2. Find all references (impact analysis)
  const references = await serena.findReferencingSymbols('AuthMiddleware');
  
  // 3. AI analysis
  const analysis = await executeAIClient({
    backend: BACKENDS.GEMINI,
    prompt: `Refactor this:\n${symbols[0].body}\n\nImpact: ${references.length} references`
  });
  
  // 4. Apply refactoring
  const newCode = extractCodeFromAI(analysis);
  await serena.replaceSymbolBody('AuthMiddleware', newCode);
  
  return formatWorkflowOutput('Refactoring Complete', analysis);
}
```

**Success Criteria:**
- Almeno 1 workflow che usa Serena
- Riduzione token verificata (vs Read file tradizionale)
- Safe refactoring (no breaking changes)

**Effort:** 2-3 settimane (richiede Serena setup + learning curve)

#### 3.2.3. claude-context Integration (Semantic Search)

**Task:**
```typescript
// src/integrations/claudeContext.ts
export class ClaudeContextIntegration {
  constructor(private mcpClient: MCPClientManager) {}
  
  async semanticSearch(
    query: string,
    targetDirs: string[] = []
  ): Promise<CodeChunk[]> {
    return await this.mcpClient.callTool('claude-context', 'search_code', {
      path: process.cwd(),
      query,
      extensionFilter: ['.ts', '.js', '.tsx', '.jsx']
    });
  }
}

// Usage in workflow
async function discoverRelevantCode(params: DiscoveryParams) {
  const context = new ClaudeContextIntegration(mcpClient);
  
  // Semantic search (NOT grep-based)
  const chunks = await context.semanticSearch(
    "Where is authentication middleware implemented?"
  );
  
  // AI synthesis
  const synthesis = await executeAIClient({
    backend: BACKENDS.QWEN,
    prompt: `Explain these code chunks:\n${formatChunks(chunks)}`
  });
  
  return formatWorkflowOutput('Code Discovery', synthesis);
}
```

**Success Criteria:**
- Semantic search funzionante
- Risultati ranked per rilevanza
- Integrato in almeno 1 workflow

**Effort:** 1-2 settimane

---

### Fase 3: Learning & Adaptation (6-8 settimane) - AVANZATO

#### 3.3.1. Workflow Memory System (MVP)

**NOTA:** Non implementare il sistema "cognitivo" complesso del piano v2.0. Troppo ambizioso.

**Approccio MVP:**
```typescript
// src/learning/workflowMemory.ts
interface WorkflowExecution {
  id: string;
  workflowName: string;
  params: Record<string, any>;
  timestamp: Date;
  
  // Execution metrics
  durationMs: number;
  backendsUsed: string[];
  tokensUsed?: number;
  
  // Outcome
  outcome: 'success' | 'failure' | 'partial';
  errorType?: ErrorType;
  errorMessage?: string;
  
  // Learning
  userFeedback?: 'helpful' | 'not_helpful';
  lessonsLearned: string; // Free-form text per ora
}

export class WorkflowMemoryStore {
  private db: Database; // SQLite
  
  async record(execution: WorkflowExecution): Promise<void> {
    await this.db.insert('workflow_executions', execution);
  }
  
  async getSuccessfulExecutions(
    workflowName: string,
    limit = 10
  ): Promise<WorkflowExecution[]> {
    return await this.db.query(
      'SELECT * FROM workflow_executions WHERE workflow_name = ? AND outcome = ? ORDER BY timestamp DESC LIMIT ?',
      [workflowName, 'success', limit]
    );
  }
  
  async getFailurePatterns(workflowName: string): Promise<FailurePattern[]> {
    // Group failures by errorType
    return await this.db.query(
      'SELECT error_type, COUNT(*) as count, MAX(timestamp) as last_seen FROM workflow_executions WHERE workflow_name = ? AND outcome = ? GROUP BY error_type',
      [workflowName, 'failure']
    );
  }
  
  async generateInsights(workflowName: string): Promise<string> {
    const successes = await this.getSuccessfulExecutions(workflowName);
    const failures = await this.getFailurePatterns(workflowName);
    
    // Simple statistics
    const totalExecutions = successes.length + failures.reduce((sum, f) => sum + f.count, 0);
    const successRate = (successes.length / totalExecutions) * 100;
    const avgDuration = successes.reduce((sum, s) => sum + s.durationMs, 0) / successes.length;
    
    return `
Workflow: ${workflowName}
Total executions: ${totalExecutions}
Success rate: ${successRate.toFixed(1)}%
Avg duration: ${(avgDuration / 1000).toFixed(1)}s
Common failures: ${failures.map(f => f.error_type).join(', ')}
    `.trim();
  }
}
```

**Usage:**
```typescript
// In ogni workflow
const executionStart = Date.now();
try {
  const result = await executeWorkflowLogic(params);
  
  await workflowMemory.record({
    id: generateId(),
    workflowName: 'parallel-review',
    params,
    timestamp: new Date(),
    durationMs: Date.now() - executionStart,
    backendsUsed: ['gemini', 'rovodev'],
    outcome: 'success',
    lessonsLearned: 'Gemini provided better architectural insights'
  });
  
  return result;
} catch (error) {
  await workflowMemory.record({
    id: generateId(),
    workflowName: 'parallel-review',
    params,
    timestamp: new Date(),
    durationMs: Date.now() - executionStart,
    backendsUsed: ['gemini', 'rovodev'],
    outcome: 'failure',
    errorType: classifyError(error),
    errorMessage: error.message,
    lessonsLearned: ''
  });
  
  throw error;
}
```

**Success Criteria:**
- Ogni workflow execution registrata
- Query dashboard per insights
- Identificazione pattern di fallimento

**Effort:** 2-3 settimane

#### 3.3.2. Adaptive Backend Selection

**Perche':** Imparare quale backend funziona meglio per quale task.

**Task:**
```typescript
// src/learning/adaptiveSelector.ts
interface BackendPerformance {
  backend: string;
  taskType: string; // 'architecture', 'code-gen', 'bug-hunt'
  successRate: number;
  avgDurationMs: number;
  avgTokens: number;
  lastUsed: Date;
}

export class AdaptiveBackendSelector {
  constructor(private memory: WorkflowMemoryStore) {}
  
  async selectBestBackend(taskType: string): Promise<string> {
    // Query historical performance
    const performances = await this.memory.db.query<BackendPerformance>(
      `SELECT 
        backends_used[0] as backend,
        workflow_name as task_type,
        AVG(CASE WHEN outcome = 'success' THEN 1.0 ELSE 0.0 END) as success_rate,
        AVG(duration_ms) as avg_duration_ms
      FROM workflow_executions
      WHERE workflow_name = ?
      GROUP BY backend
      ORDER BY success_rate DESC, avg_duration_ms ASC`,
      [taskType]
    );
    
    if (performances.length === 0) {
      // No historical data, use default
      return getDefaultBackend(taskType);
    }
    
    // Epsilon-greedy: 90% exploit best, 10% explore others
    if (Math.random() < 0.1) {
      // Exploration
      const allBackends = [BACKENDS.QWEN, BACKENDS.GEMINI, BACKENDS.ROVODEV];
      return allBackends[Math.floor(Math.random() * allBackends.length)];
    } else {
      // Exploitation
      return performances[0].backend;
    }
  }
}
```

**Success Criteria:**
- Backend selection migliora nel tempo
- Metriche mostrano convergenza a backend ottimale per task
- Mantenimento di exploration (no over-fitting)

**Effort:** 1-2 settimane

---

### Fase 4: Production Readiness (4-6 settimane)

#### 3.4.1. Comprehensive Testing

**Task:**
1. Increase code coverage a 85%+
2. Add E2E tests con real AI backends (se API key disponibili)
3. Add stress tests:
   ```typescript
   test('workflow handles 100 concurrent executions', async () => {
     const executions = Array(100).fill(null).map(() =>
       executeWorkflow('parallel-review', testParams)
     );
     const results = await Promise.allSettled(executions);
     const failures = results.filter(r => r.status === 'rejected');
     expect(failures.length).toBeLessThan(5); // <5% failure rate
   });
   ```
4. Add performance benchmarks
5. Add regression tests (per ogni bug fix)

**Effort:** 2-3 settimane

#### 3.4.2. Documentation Completa

**Task:**
1. API documentation (TypeDoc)
2. Workflow guide con esempi reali
3. Troubleshooting guide
4. Architecture decision records (ADR)
5. Contributing guide

**Effort:** 1-2 settimane

#### 3.4.3. CLI for Workflow Management

**Task:**
```bash
# unified-ai-mcp-tool CLI (non solo MCP server)
unified-ai workflow list
unified-ai workflow run parallel-review --files src/index.ts --focus security
unified-ai workflow history init-session
unified-ai workflow insights parallel-review
unified-ai memory query "authentication bugs"
unified-ai audit report --last-week
```

**Effort:** 1-2 settimane

---

## 4. Metriche di Successo (REALISTICHE)

### Fase 0 (Foundations)
- **Test Coverage**: 80%+
- **CI/CD Green**: 100% dei test passano
- **Logging Coverage**: 100% dei workflow hanno structured logging
- **Audit Coverage**: 100% delle operazioni MEDIUM/HIGH auditate

### Fase 1 (Core Workflows)
- **Workflow Count**: 5 (3 esistenti + 2 nuovi)
- **Autonomy Rate**: 50-60% (task completati senza intervento umano)
- **Task Success Rate**: 70-75% (task completati con successo al primo tentativo)
- **Cache Hit Rate**: 40-50%
- **Token Efficiency**: 30-40% vs approccio manuale

### Fase 2 (External Integrations) - Opzionale
- **MCP Integrations**: 2+ (Serena, claude-context)
- **Token Efficiency con MCP**: 50-60% vs approccio manuale
- **Safe Refactoring Rate**: 95%+ (con Serena)

### Fase 3 (Learning & Adaptation)
- **Memory Store**: 1000+ executions registrate
- **Adaptive Selection**: 10%+ miglioramento backend selection accuracy nel tempo
- **Failure Pattern Recognition**: 80%+ dei fallimenti classificati correttamente

### Fase 4 (Production)
- **Code Coverage**: 85%+
- **Documentation**: 100% dei workflow documentati
- **Performance**: 95-percentile execution time <30s per workflow

---

## 5. Rischi e Mitigazioni

### Rischio 1: Complessita' MCP Client
**Probabilita':** Alta  
**Impatto:** Alto  
**Mitigazione:**
- Implementare MCP integrations SOLO se Fase 1 workflows non bastano
- Proof of concept con 1 MCP server prima di espandere
- Fallback graceful se MCP server non disponibile

### Rischio 2: AI Backend Instabilita'
**Probabilita':** Media  
**Impatto:** Alto  
**Mitigazione:**
- Circuit breaker per ogni backend
- Fallback automatico a backend alternativi
- Cache aggressivo per ridurre dependency

### Rischio 3: Drift di Autonomia (System fa troppo)
**Probabilita':** Media  
**Impatto:** Critico  
**Mitigazione:**
- Permission system robusto (GIA' implementato)
- Audit trail completo (Fase 0)
- Human checkpoints per operazioni HIGH autonomy
- Kill switch per disabilitare autonomia

### Rischio 4: Testing Infrastructure Debole
**Probabilita':** Alta (attualmente zero test)  
**Impatto:** Critico  
**Mitigazione:**
- Fase 0 PRIORITA' MASSIMA
- Bloccare sviluppo features senza test
- CI/CD enforcement

### Rischio 5: Token Costs Esplosivi
**Probabilita':** Media  
**Impatto:** Alto  
**Mitigazione:**
- Caching aggressivo
- Budget tracking per backend
- Alert se spending supera threshold
- User feedback loop ("questo e' stato utile?")

---

## 6. Decisioni Architetturali Chiave

### ADR-001: Permission System Come Implementato
**Decisione:** Mantenere AutonomyLevel enum + Permission matrix  
**Rationale:** Sistema e' ben progettato, pulito, testabile  
**Alternativa Rigettata:** Policy-based system (troppo complesso per MVP)

### ADR-002: SQLite per Audit e Memory
**Decisione:** Usare SQLite file-based per audit trail e workflow memory  
**Rationale:** Zero dependency, embedded, fast, SQL query support  
**Alternativa Rigettata:** PostgreSQL (over-engineering), JSON files (no query support)

### ADR-003: NO "Recursive MCP Architecture" in Fase 1
**Decisione:** Posporre MCP client integration a Fase 2 (opzionale)  
**Rationale:**
- Complessita' alta
- Debugging difficile
- Dependency on external tool setup
- Fase 1 workflows gia' forniscono valore

**Quando Riconsiderare:** Se Fase 1 workflows mostrano clear limitation (es. impossibile fare refactoring sicuro senza Serena)

### ADR-004: Rule-based Model Selection (NO AI meta-orchestrator)
**Decisione:** Usare logica if/else per backend selection, NO GLM-4.6 o altre AI per decidere  
**Rationale:**
- Semplice, debuggable, prevedibile
- No extra API costs
- Adaptive learning in Fase 3 sufficiente per migliorare nel tempo

**Alternativa Rigettata:** AI-based orchestrator (GLM-4.6) - troppo complesso, costoso, non deterministico

### ADR-005: Test-First per Fase 0
**Decisione:** Nessuna nuova feature prima di 80% test coverage  
**Rationale:**
- Sistema autonomo senza test = disaster waiting to happen
- Refactoring futuro molto piu' safe
- Debugging molto piu' rapido

---

## 7. Confronto con Piano v2.0

| Aspetto | Piano v2.0 | Piano v3.0 (Rivisto) |
|---------|-----------|---------------------|
| **Architettura Ricorsiva MCP** | Core feature, 40% del documento | Fase 2 opzionale, <10% |
| **Target Autonomy** | 90%+ | 50-60% (Fase 1) |
| **Target Success Rate** | 95%+ | 70-75% (Fase 1) |
| **Token Efficiency** | 95%+ | 30-40% (Fase 1), 50-60% (Fase 2) |
| **Testing** | Non menzionato | Fase 0, priorita' massima |
| **Logging/Monitoring** | Accennato | Fase 0, comprehensive |
| **Timeline** | 4 fasi generiche | 4 fasi con effort estimates |
| **Rischi** | Non analizzati | 5 rischi + mitigazioni |
| **Fallback Strategies** | Non specificate | Circuit breaker, retry logic, graceful degradation |
| **Learning Engine** | "Memoria cognitiva" vaga | SQLite-based workflow memory (concreto) |
| **Meta-Orchestration** | GLM-4.6 AI-based | Rule-based (pragmatico) |

---

## 8. Conclusioni e Raccomandazioni

### Cosa Fare Subito (Prossimi 30 giorni)

1. **Setup Testing (Settimana 1-2)**
   - Vitest o Jest
   - Test utilities
   - Mocking AI backends
   - CI/CD pipeline
   - Target: 80% coverage

2. **Structured Logging (Settimana 2-3)**
   - Replace console.log
   - Log ogni workflow step
   - Log ogni permission check
   - Log ogni AI call con timing

3. **Audit Trail (Settimana 3-4)**
   - SQLite database
   - Integration in PermissionManager
   - Audit report viewer

4. **Error Recovery Framework (Settimana 4)**
   - Error classification
   - Retry logic
   - Circuit breaker
   - User escalation

### Cosa NON Fare

1. **NO MCP Client Integration** finche' Fase 1 non e' completa e validata
2. **NO AI Meta-Orchestration** (GLM-4.6) - over-engineering
3. **NO "Memoria Cognitiva" Complessa** - troppo vago, usare SQLite semplice
4. **NO Feature Development** senza test (almeno 80% coverage)

### Prossimi Milestones

- **M1 (1 mese):** Fase 0 completa - Testing + Logging + Audit
- **M2 (2 mesi):** Fase 1 completa - 5 workflow + caching + model selection
- **M3 (4 mesi):** Fase 2 se necessario - MCP integrations
- **M4 (6 mesi):** Fase 3 - Learning & adaptation
- **M5 (8 mesi):** Fase 4 - Production ready

### Success Criteria per Go/No-Go

**Go a Fase 2 se:**
- Fase 1 ha 85%+ test coverage
- Autonomy rate stabile 50%+
- Success rate stabile 70%+
- Audit trail funzionante
- Almeno 500 workflow executions loggate

**No-Go a Fase 2 se:**
- Test coverage <70%
- Frequenti crashes
- Success rate <60%
- Nessun audit logging

---

## Appendice A: Codebase Inventory

### Gia' Implementato (Verificato)

```
src/
├── utils/
│   ├── permissionManager.ts ✅ COMPLETO
│   │   - AutonomyLevel enum
│   │   - OperationType enum
│   │   - Permission matrix
│   │   - GitOperations, FileOperations wrappers
│   │   - PermissionManager class
│   ├── aiExecutor.ts ✅ COMPLETO
│   │   - executeQwenCLI
│   │   - executeGeminiCLI
│   │   - executeRovodevCLI
│   │   - Fallback logic (Qwen primary -> fallback)
│   ├── gitHelper.ts ✅ COMPLETO
│   │   - 15+ git operations
│   │   - getRecentCommitsWithDiffs
│   │   - checkCLIAvailability
│   ├── logger.ts ⚠️ BASIC (needs structured logging)
│   └── commandExecutor.ts ✅ COMPLETO
│
├── workflows/
│   ├── types.ts ✅ COMPLETO
│   │   - BaseWorkflowParams (con autonomyLevel)
│   │   - WorkflowDefinition interface
│   │   - All param types
│   ├── utils.ts ✅ COMPLETO
│   │   - runAIAnalysis
│   │   - runParallelAnalysis
│   │   - synthesizeResults
│   │   - createWorkflowPermissionManager
│   ├── init-session.workflow.ts ✅ COMPLETO
│   ├── parallel-review.workflow.ts ✅ COMPLETO
│   ├── validate-last-commit.workflow.ts ✅ COMPLETO
│   ├── pre-commit-validate.workflow.ts ❌ NON IMPLEMENTATO (commentato)
│   ├── bug-hunt.workflow.ts ❌ NON IMPLEMENTATO (commentato)
│   └── index.ts ✅ COMPLETO (workflow registry)
│
├── tools/
│   ├── ask-qwen.tool.ts ✅ COMPLETO
│   ├── ask-gemini.tool.ts ✅ COMPLETO
│   ├── ask-rovodev.tool.ts ✅ COMPLETO
│   ├── smart-workflows.tool.ts ✅ COMPLETO
│   └── registry.ts ✅ COMPLETO
│
├── constants.ts ✅ COMPLETO
└── index.ts ✅ COMPLETO (MCP server)
```

### Mancante (Prioritizzato)

**PRIORITA' MASSIMA (Fase 0):**
- `tests/` - DIRECTORY COMPLETA (zero tests attualmente)
- `src/utils/structuredLogger.ts` - NEW (file-based JSON logging)
- `src/workflows/workflowContext.ts` - NEW (memoria temporanea workflow)
- `src/utils/logRotation.ts` - NEW (compressione logs vecchi)
- `src/utils/auditTrail.ts` - NEW (audit database SQLite)
- `src/utils/errorRecovery.ts` - NEW (retry logic + circuit breaker)
- `scripts/watch-logs.sh` - NEW (real-time monitoring)
- `scripts/analyze-logs.sh` - NEW (log analysis)

**PRIORITA' ALTA (Fase 1):**
- `src/workflows/pre-commit-validate.workflow.ts` - COMPLETO
- `src/workflows/bug-hunt.workflow.ts` - COMPLETO
- `src/workflows/cache.ts` - NEW
- `src/workflows/modelSelector.ts` - NEW

**PRIORITA' MEDIA (Fase 2 - Opzionale):**
- `src/mcp/client.ts` - NEW
- `src/integrations/serena.ts` - NEW
- `src/integrations/claudeContext.ts` - NEW

**PRIORITA' BASSA (Fase 3):**
- `src/learning/workflowMemory.ts` - NEW
- `src/learning/adaptiveSelector.ts` - NEW

---

## Appendice B: Effort Estimates

### Totale per Fase

| Fase | Descrizione | Effort (settimane) | Priorita' |
|------|-------------|-------------------|-----------|
| **Fase 0** | Foundations | 2-3 | CRITICA |
| **Fase 1** | Core Workflows | 3-4 | ALTA |
| **Fase 2** | External Integrations | 4-6 | MEDIA (opzionale) |
| **Fase 3** | Learning & Adaptation | 6-8 | BASSA |
| **Fase 4** | Production Readiness | 4-6 | ALTA |
| **TOTALE** | End-to-end | 19-27 settimane | |

### Breakdown Fase 0 (Dettagliato)

| Task | Effort (giorni) | Blockers |
|------|-----------------|----------|
| Setup Vitest + Test utilities | 2 | None |
| Unit tests per permissionManager | 1 | Test setup |
| Unit tests per gitHelper | 2 | Test setup |
| Unit tests per aiExecutor (mocked) | 2 | Test setup |
| Integration tests per workflows | 3 | Unit tests |
| CI/CD pipeline | 1 | Tests green |
| Structured logger implementation | 3 | None |
| Logger integration in workflows | 1 | Logger impl |
| Audit trail database schema | 1 | None |
| Audit trail implementation | 2 | Schema |
| Audit trail integration | 1 | Audit impl |
| Error recovery framework | 4 | None |
| Circuit breaker implementation | 2 | Error recovery |
| Documentation per Fase 0 | 2 | All above |
| **TOTALE** | **27 giorni** (~4 settimane) | |

---

## Appendice C: Riferimenti

### Documentazione Tecnica
- MCP SDK: https://github.com/modelcontextprotocol/typescript-sdk
- Serena MCP: https://github.com/oraios/serena
- Claude Context: (documentation link)

### Best Practices
- Circuit Breaker Pattern: Martin Fowler
- Autonomous Agent Design: AutoGPT learnings
- Testing AI Systems: Google AI Test Strategy

### Competitor Analysis
- GitHub Copilot Workspace: 75% task completion rate
- Cursor: 80% code acceptance rate
- AutoGPT: 50-60% autonomy rate
- GPT-Engineer: 65-70% first-pass success

---

## Appendice D: Workflow Adattabili (Dynamic Workflow Generation)

### D.1. Problema con Workflow Fissi

**Limitazione Attuale:**
```typescript
// Workflow predefiniti e rigidi
const workflows = {
  "parallel-review": parallelReviewWorkflow,
  "init-session": initSessionWorkflow,
  "validate-last-commit": validateLastCommitWorkflow
};

// L'utente può solo scegliere da questa lista
```

**Problemi:**
1. **Inflessibilità**: Se l'utente vuole "analizza performance + security in parallelo poi genera report", serve un nuovo workflow
2. **Combinatoria esplosiva**: Ogni combinazione di task richiede un workflow custom
3. **Manutenzione**: Aggiungere features richiede modificare workflow esistenti
4. **Innovation bottleneck**: Il sistema può fare solo quello che abbiamo pre-programmato

### D.2. Visione: Workflow Come "Execution Plans" Generati Dinamicamente

**Cambio di Paradigma:**
```
Workflow Fisso:
  User → "run parallel-review" → Workflow predefinito → Esegue steps fissi

Workflow Adattabile:
  User → "analizza questo file per security e performance" 
       → AI genera execution plan 
       → Sistema valida plan 
       → Esegue plan dinamicamente
       → Impara dal risultato
```

**Esempio Concreto:**
```
User: "Voglio validare questo commit, ma solo per file TypeScript, 
       con focus su type safety, e se trovi problemi crea un report 
       markdown con esempi di fix"

Sistema:
1. [AI Planning] Genera execution plan
2. [Validation] Verifica che plan sia safe
3. [Execution] Esegue steps in sequenza
4. [Learning] Salva plan come template per riuso futuro
```

### D.3. Architettura Proposta

#### Componenti Chiave

```typescript
// 1. Execution Plan (Structure)
interface ExecutionPlan {
  id: string;
  name: string;
  description: string;
  
  // Steps da eseguire in sequenza
  steps: ExecutionStep[];
  
  // Metadata
  estimatedDurationMs: number;
  requiredAutonomyLevel: AutonomyLevel;
  backendsUsed: string[];
  
  // Validazione
  validated: boolean;
  safetyScore: number; // 0-1
}

interface ExecutionStep {
  id: string;
  type: 'ai-analysis' | 'git-operation' | 'file-operation' | 'parallel-execution';
  description: string;
  
  // Configurazione
  config: {
    backend?: string;      // Per 'ai-analysis'
    prompt?: string;
    operation?: string;    // Per 'git-operation', 'file-operation'
    parallelSteps?: ExecutionStep[]; // Per 'parallel-execution'
  };
  
  // Dependencies
  dependsOn?: string[];  // IDs di step precedenti
  requiredPermission: OperationType;
  
  // Error handling
  onError: 'fail' | 'continue' | 'retry';
  maxRetries?: number;
}

// 2. Workflow Generator (AI-Powered)
export class DynamicWorkflowGenerator {
  constructor(
    private aiBackend: string = BACKENDS.GEMINI // Gemini per reasoning
  ) {}
  
  async generatePlan(request: WorkflowRequest): Promise<ExecutionPlan> {
    // Costruisce prompt per AI
    const prompt = this.buildPlanningPrompt(request);
    
    // Chiama AI per generare plan
    const aiResponse = await executeAIClient({
      backend: this.aiBackend,
      prompt
    });
    
    // Parse response in ExecutionPlan
    const plan = this.parseAIResponse(aiResponse);
    
    // Valida plan
    const validatedPlan = await this.validatePlan(plan);
    
    return validatedPlan;
  }
  
  private buildPlanningPrompt(request: WorkflowRequest): string {
    return `
You are a workflow planning AI. Generate a detailed execution plan for this request:

**User Request:** ${request.description}

**Available Operations:**
1. AI Analysis (backends: qwen, gemini, rovodev)
   - Use for: code review, bug analysis, architecture evaluation
   
2. Git Operations (requires MEDIUM autonomy)
   - Use for: reading commits, diffs, status
   
3. File Operations
   - Read (requires READ_ONLY autonomy)
   - Write (requires LOW autonomy)

4. Parallel Execution
   - Run multiple steps concurrently

**Context:**
- Repository: ${request.repoInfo}
- Available files: ${request.availableFiles}
- Current autonomy level: ${request.autonomyLevel}

**Output Format (JSON):**
\`\`\`json
{
  "name": "descriptive-workflow-name",
  "description": "what this workflow does",
  "steps": [
    {
      "id": "step-1",
      "type": "ai-analysis",
      "description": "Analyze file for security issues",
      "config": {
        "backend": "gemini",
        "prompt": "Analyze @file.ts for security vulnerabilities"
      },
      "requiredPermission": "READ_FILE",
      "onError": "fail"
    },
    {
      "id": "step-2",
      "type": "parallel-execution",
      "description": "Run parallel checks",
      "config": {
        "parallelSteps": [
          // ... nested steps
        ]
      },
      "dependsOn": ["step-1"],
      "requiredPermission": "READ_FILE",
      "onError": "continue"
    }
  ]
}
\`\`\`

IMPORTANT:
- Keep steps atomic and focused
- Use parallel execution when steps are independent
- Specify clear error handling
- Respect autonomy levels
- Each step must have a permission requirement
`;
  }
}

// 3. Plan Validator (Safety First)
export class ExecutionPlanValidator {
  validate(plan: ExecutionPlan, autonomyLevel: AutonomyLevel): ValidationResult {
    const issues: string[] = [];
    
    // Check 1: Tutti gli step hanno permission validi
    for (const step of plan.steps) {
      const permResult = checkPermission(autonomyLevel, step.requiredPermission);
      if (!permResult.allowed) {
        issues.push(`Step ${step.id} requires ${permResult.requiredLevel} but current is ${autonomyLevel}`);
      }
    }
    
    // Check 2: Dependencies sono acicliche
    if (this.hasCyclicDependencies(plan.steps)) {
      issues.push('Plan has cyclic dependencies');
    }
    
    // Check 3: Nessun step pericoloso senza HIGH autonomy
    const dangerousOps = [OperationType.GIT_PUSH, OperationType.EXTERNAL_API];
    for (const step of plan.steps) {
      if (dangerousOps.includes(step.requiredPermission) && 
          autonomyLevel !== AutonomyLevel.HIGH) {
        issues.push(`Step ${step.id} requires HIGH autonomy for ${step.requiredPermission}`);
      }
    }
    
    // Check 4: Numero ragionevole di step (max 20)
    if (plan.steps.length > 20) {
      issues.push('Plan has too many steps (>20), might be too complex');
    }
    
    // Check 5: Backends esistono
    for (const step of plan.steps) {
      if (step.type === 'ai-analysis' && step.config.backend) {
        const validBackends = [BACKENDS.QWEN, BACKENDS.GEMINI, BACKENDS.ROVODEV];
        if (!validBackends.includes(step.config.backend)) {
          issues.push(`Step ${step.id} uses invalid backend: ${step.config.backend}`);
        }
      }
    }
    
    const safetyScore = 1 - (issues.length / 10); // Simple scoring
    
    return {
      valid: issues.length === 0,
      issues,
      safetyScore: Math.max(0, safetyScore)
    };
  }
  
  private hasCyclicDependencies(steps: ExecutionStep[]): boolean {
    // Topological sort algorithm
    // ... implementation
    return false; // simplified
  }
}

// 4. Dynamic Executor (Interpreta ed esegue plan)
export class DynamicWorkflowExecutor {
  async execute(
    plan: ExecutionPlan,
    autonomyLevel: AutonomyLevel,
    onProgress?: ProgressCallback
  ): Promise<WorkflowResult> {
    onProgress?.(`Starting dynamic workflow: ${plan.name}`);
    
    const results = new Map<string, any>();
    const permissions = createPermissionManager(autonomyLevel);
    
    // Esegui steps in ordine di dependencies
    const sortedSteps = this.topologicalSort(plan.steps);
    
    for (const step of sortedSteps) {
      try {
        onProgress?.(`Executing step: ${step.description}`);
        
        // Check permission
        permissions.assert(step.requiredPermission, step.description);
        
        // Execute step based on type
        const result = await this.executeStep(step, results, onProgress);
        results.set(step.id, result);
        
      } catch (error) {
        // Handle error based on strategy
        if (step.onError === 'fail') {
          throw error;
        } else if (step.onError === 'retry' && step.maxRetries) {
          // Retry logic
          const result = await this.retryStep(step, step.maxRetries);
          results.set(step.id, result);
        } else {
          // Continue with null result
          results.set(step.id, null);
        }
      }
    }
    
    return {
      success: true,
      output: this.synthesizeResults(results),
      metadata: {
        planId: plan.id,
        stepsExecuted: sortedSteps.length,
        duration: 0 // calculate
      }
    };
  }
  
  private async executeStep(
    step: ExecutionStep,
    previousResults: Map<string, any>,
    onProgress?: ProgressCallback
  ): Promise<any> {
    switch (step.type) {
      case 'ai-analysis':
        return await executeAIClient({
          backend: step.config.backend!,
          prompt: this.resolvePrompt(step.config.prompt!, previousResults),
          onProgress
        });
        
      case 'git-operation':
        return await this.executeGitOp(step.config.operation!);
        
      case 'file-operation':
        return await this.executeFileOp(step.config.operation!);
        
      case 'parallel-execution':
        const parallelResults = await Promise.all(
          step.config.parallelSteps!.map(s => this.executeStep(s, previousResults, onProgress))
        );
        return parallelResults;
        
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }
  
  private resolvePrompt(prompt: string, previousResults: Map<string, any>): string {
    // Replace placeholders like {{step-1.output}} with actual results
    let resolved = prompt;
    for (const [stepId, result] of previousResults) {
      resolved = resolved.replace(`{{${stepId}.output}}`, String(result));
    }
    return resolved;
  }
}
```

### D.4. Esempio Pratico: User Request → Dynamic Workflow

**Scenario:**
```
User: "Analizza i file modificati nel mio ultimo commit. 
       Per ogni file TypeScript, controlla type safety con Qwen e 
       performance con Gemini in parallelo. 
       Poi crea un report markdown con i problemi trovati."
```

**Step 1: AI genera plan**
```json
{
  "name": "commit-analysis-typescript-safety-performance",
  "description": "Analyze last commit TS files for type safety and performance",
  "steps": [
    {
      "id": "get-commit-info",
      "type": "git-operation",
      "description": "Get last commit info and modified files",
      "config": {
        "operation": "getGitCommitInfo('HEAD')"
      },
      "requiredPermission": "GIT_READ",
      "onError": "fail"
    },
    {
      "id": "filter-typescript-files",
      "type": "file-operation",
      "description": "Filter only .ts and .tsx files",
      "config": {
        "operation": "filterFiles({{get-commit-info.output.files}}, ['.ts', '.tsx'])"
      },
      "dependsOn": ["get-commit-info"],
      "requiredPermission": "READ_FILE",
      "onError": "fail"
    },
    {
      "id": "parallel-analysis",
      "type": "parallel-execution",
      "description": "Run type safety and performance analysis in parallel",
      "config": {
        "parallelSteps": [
          {
            "id": "type-safety-check",
            "type": "ai-analysis",
            "description": "Check type safety with Qwen",
            "config": {
              "backend": "qwen",
              "prompt": "Analyze these TypeScript files for type safety issues: {{filter-typescript-files.output}}"
            },
            "requiredPermission": "READ_FILE",
            "onError": "continue"
          },
          {
            "id": "performance-check",
            "type": "ai-analysis",
            "description": "Check performance with Gemini",
            "config": {
              "backend": "gemini",
              "prompt": "Analyze these TypeScript files for performance issues: {{filter-typescript-files.output}}"
            },
            "requiredPermission": "READ_FILE",
            "onError": "continue"
          }
        ]
      },
      "dependsOn": ["filter-typescript-files"],
      "requiredPermission": "READ_FILE",
      "onError": "continue"
    },
    {
      "id": "generate-report",
      "type": "ai-analysis",
      "description": "Generate markdown report",
      "config": {
        "backend": "gemini",
        "prompt": "Create a markdown report summarizing these findings:\n\nType Safety:\n{{type-safety-check.output}}\n\nPerformance:\n{{performance-check.output}}"
      },
      "dependsOn": ["parallel-analysis"],
      "requiredPermission": "READ_FILE",
      "onError": "fail"
    }
  ],
  "estimatedDurationMs": 45000,
  "requiredAutonomyLevel": "read-only",
  "backendsUsed": ["qwen", "gemini"]
}
```

**Step 2: Sistema valida plan**
```typescript
const validator = new ExecutionPlanValidator();
const validation = validator.validate(plan, AutonomyLevel.READ_ONLY);

// Output:
// {
//   valid: true,
//   issues: [],
//   safetyScore: 1.0
// }
```

**Step 3: Sistema esegue plan**
```typescript
const executor = new DynamicWorkflowExecutor();
const result = await executor.execute(plan, AutonomyLevel.READ_ONLY, onProgress);

// Logs:
// "Starting dynamic workflow: commit-analysis-typescript-safety-performance"
// "Executing step: Get last commit info and modified files"
// "Executing step: Filter only .ts and .tsx files"
// "Executing step: Run type safety and performance analysis in parallel"
// "Executing step: Generate markdown report"
```

**Step 4: Sistema impara e salva template**
```typescript
await workflowMemory.record({
  id: generateId(),
  workflowName: plan.name,
  planJson: JSON.stringify(plan),
  outcome: 'success',
  userFeedback: 'helpful',
  lessonsLearned: 'This plan pattern works well for commit analysis with parallel AI checks',
  reusable: true
});

// Prossima volta che l'utente chiede qualcosa di simile,
// il sistema può suggerire questo template
```

### D.5. Vantaggi dell'Approccio Dinamico

**1. Flessibilità Infinita**
```typescript
// L'utente può chiedere QUALSIASI combinazione di task
"analizza commit + genera test + crea PR description"
"trova bug nei file modificati + suggerisci fix + applica patch"
"valida configurazione security + controlla dependencies + audit"
```

**2. Composabilità**
```typescript
// I plan possono essere composti da building blocks riutilizzabili
const buildingBlocks = {
  "get-commit": { /* step definition */ },
  "filter-files": { /* step definition */ },
  "ai-analysis": { /* step definition */ },
  "parallel-exec": { /* step definition */ }
};

// AI combina questi blocchi in modi nuovi
```

**3. Learning & Improvement**
```typescript
// Il sistema accumula "best practices"
interface WorkflowTemplate {
  name: string;
  pattern: string; // "commit-analysis", "bug-hunt", "refactoring"
  successRate: number;
  avgDuration: number;
  planStructure: ExecutionPlan;
  usageCount: number;
}

// Dopo 100 executions, il sistema sa quale plan structure funziona meglio
```

**4. User Intent Understanding**
```typescript
// Il sistema può interpretare richieste vaghe
User: "controlla se questo commit è ok"

AI Reasoning:
- "ok" significa: no breaking changes, no security issues, tests pass
- Plan should include: commit analysis, security scan, test validation
- Use parallel execution for speed
- Generate final verdict
```

### D.6. Implementazione Pragmatica (Roadmap)

#### Fase 2.5: Dynamic Workflow MVP (3-4 settimane)

**Week 1: Plan Structure & Validator**
```typescript
// src/workflows/dynamic/types.ts
export interface ExecutionPlan { /* ... */ }
export interface ExecutionStep { /* ... */ }

// src/workflows/dynamic/validator.ts
export class ExecutionPlanValidator { /* ... */ }

// Tests
describe('ExecutionPlanValidator', () => {
  test('rejects plan with cyclic dependencies', () => {
    // ...
  });
  
  test('rejects plan exceeding autonomy level', () => {
    // ...
  });
});
```

**Week 2: Dynamic Executor**
```typescript
// src/workflows/dynamic/executor.ts
export class DynamicWorkflowExecutor {
  async execute(plan: ExecutionPlan): Promise<WorkflowResult> {
    // Topological sort
    // Execute steps in order
    // Handle dependencies
    // Error recovery
  }
}

// Tests con mocked AI backends
describe('DynamicWorkflowExecutor', () => {
  test('executes sequential steps correctly', async () => {
    // ...
  });
  
  test('executes parallel steps concurrently', async () => {
    // ...
  });
  
  test('handles step failures with retry', async () => {
    // ...
  });
});
```

**Week 3: AI-Powered Plan Generator**
```typescript
// src/workflows/dynamic/generator.ts
export class DynamicWorkflowGenerator {
  async generatePlan(request: WorkflowRequest): Promise<ExecutionPlan> {
    // Build planning prompt
    // Call Gemini for reasoning
    // Parse JSON response
    // Validate plan
  }
}

// Tests
describe('DynamicWorkflowGenerator', () => {
  test('generates valid plan for simple request', async () => {
    const request = {
      description: 'analyze last commit',
      autonomyLevel: AutonomyLevel.READ_ONLY
    };
    const plan = await generator.generatePlan(request);
    expect(plan.steps.length).toBeGreaterThan(0);
  });
});
```

**Week 4: Integration & Tool Exposure**
```typescript
// src/tools/dynamic-workflow.tool.ts
export const dynamicWorkflowTool = {
  name: "generate-and-run-workflow",
  description: "Genera ed esegue un workflow personalizzato basato sulla tua richiesta",
  zodSchema: z.object({
    request: z.string().describe("Descrizione in linguaggio naturale di cosa vuoi fare"),
    autonomyLevel: z.enum(["read-only", "low", "medium", "high"]).optional(),
    dryRun: z.boolean().optional().describe("Se true, genera solo il plan senza eseguirlo")
  }),
  execute: async (args, onProgress) => {
    const generator = new DynamicWorkflowGenerator();
    const validator = new ExecutionPlanValidator();
    const executor = new DynamicWorkflowExecutor();
    
    // Generate plan
    onProgress?.('Generazione execution plan...');
    const plan = await generator.generatePlan({
      description: args.request,
      autonomyLevel: args.autonomyLevel || AutonomyLevel.READ_ONLY
    });
    
    // Validate
    onProgress?.('Validazione plan...');
    const validation = validator.validate(plan, args.autonomyLevel || AutonomyLevel.READ_ONLY);
    
    if (!validation.valid) {
      return formatWorkflowOutput(
        'Plan Validation Failed',
        `Issues:\n${validation.issues.join('\n')}`
      );
    }
    
    if (args.dryRun) {
      return formatWorkflowOutput(
        'Generated Execution Plan (Dry Run)',
        JSON.stringify(plan, null, 2)
      );
    }
    
    // Execute
    onProgress?.('Esecuzione plan...');
    const result = await executor.execute(plan, args.autonomyLevel || AutonomyLevel.READ_ONLY, onProgress);
    
    return formatWorkflowOutput(
      `Dynamic Workflow: ${plan.name}`,
      result.output,
      result.metadata
    );
  }
};
```

### D.7. Safety & Guardrails

**1. Plan Validation (Multi-Layer)**
```typescript
interface ValidationLayer {
  name: string;
  validate: (plan: ExecutionPlan) => ValidationResult;
}

const validationLayers: ValidationLayer[] = [
  {
    name: 'permission-check',
    validate: (plan) => checkAllPermissions(plan)
  },
  {
    name: 'dependency-check',
    validate: (plan) => checkDependencies(plan)
  },
  {
    name: 'complexity-check',
    validate: (plan) => checkComplexity(plan)
  },
  {
    name: 'safety-check',
    validate: (plan) => checkDangerousOperations(plan)
  }
];

// Tutti i layer devono passare
for (const layer of validationLayers) {
  const result = layer.validate(plan);
  if (!result.valid) {
    throw new Error(`Validation failed at ${layer.name}: ${result.issues}`);
  }
}
```

**2. User Confirmation per High-Risk Plans**
```typescript
if (plan.requiredAutonomyLevel === AutonomyLevel.HIGH) {
  // Mostra plan a utente e chiedi conferma
  return {
    type: 'confirmation-required',
    plan: plan,
    message: `
This workflow requires HIGH autonomy and will perform:
${plan.steps.map(s => `- ${s.description}`).join('\n')}

Approve? (yes/no)
    `
  };
}
```

**3. Sandboxed Execution (Future)**
```typescript
// Esegui plan in ambiente isolato prima di applicare a codebase reale
const sandboxResult = await executor.execute(plan, autonomyLevel, {
  sandbox: true,
  dryRun: true
});

// Se sandbox success, allora esegui per davvero
if (sandboxResult.success) {
  await executor.execute(plan, autonomyLevel);
}
```

### D.8. Template Library & Reusability

**Concept:**
```typescript
// src/workflows/dynamic/templates.ts
export class WorkflowTemplateLibrary {
  private templates = new Map<string, WorkflowTemplate>();
  
  async saveAsTemplate(
    execution: WorkflowExecution,
    name: string
  ): Promise<void> {
    const template: WorkflowTemplate = {
      name,
      pattern: extractPattern(execution.planJson),
      successRate: 1.0, // Initial
      avgDuration: execution.durationMs,
      planStructure: JSON.parse(execution.planJson),
      usageCount: 1
    };
    
    this.templates.set(name, template);
  }
  
  async findSimilarTemplate(request: WorkflowRequest): Promise<WorkflowTemplate | null> {
    // Usa AI per fare semantic similarity search
    const requestEmbedding = await getEmbedding(request.description);
    
    let bestMatch: WorkflowTemplate | null = null;
    let bestSimilarity = 0;
    
    for (const template of this.templates.values()) {
      const templateEmbedding = await getEmbedding(template.pattern);
      const similarity = cosineSimilarity(requestEmbedding, templateEmbedding);
      
      if (similarity > bestSimilarity && similarity > 0.8) {
        bestMatch = template;
        bestSimilarity = similarity;
      }
    }
    
    return bestMatch;
  }
  
  async suggestTemplate(request: WorkflowRequest): Promise<string> {
    const similar = await this.findSimilarTemplate(request);
    
    if (similar) {
      return `
Found similar workflow template: "${similar.name}"
Success rate: ${(similar.successRate * 100).toFixed(1)}%
Used ${similar.usageCount} times
Avg duration: ${(similar.avgDuration / 1000).toFixed(1)}s

Would you like to use this template? (yes/no)
      `.trim();
    }
    
    return "No similar template found. Generating new workflow...";
  }
}
```

**Usage:**
```typescript
// Prima volta
User: "analizza commit per security issues"
System: Genera plan da zero → Esegue → Salva come template

// Seconda volta (stessa richiesta)
User: "analizza commit per security issues"
System: Trova template simile (98% similarity) → Usa template → 5x più veloce

// Terza volta (richiesta simile)
User: "controlla questo commit per problemi di sicurezza"
System: Trova template (85% similarity) → "Found similar template: commit-security-analysis. Use it?" → Utente approva → Usa template
```

### D.9. Metriche di Successo per Dynamic Workflows

| Metrica | Target (Fase 2.5) | Misurazione |
|---------|------------------|-------------|
| **Plan Generation Success** | 90%+ | % di plan generati validi |
| **Plan Execution Success** | 80%+ | % di plan eseguiti senza errori |
| **User Satisfaction** | 75%+ | Feedback "helpful" vs "not helpful" |
| **Template Reuse Rate** | 40%+ | % di richieste che usano template esistente |
| **Generation Speed** | <5s | Tempo per generare plan |
| **Execution Speedup vs Manual** | 3x | Tempo workflow vs task manuale |

### D.10. Confronto: Fixed vs Dynamic Workflows

| Aspetto | Fixed Workflows | Dynamic Workflows |
|---------|----------------|-------------------|
| **Flessibilità** | Limitata (5-10 workflow predefiniti) | Infinita (qualsiasi combinazione) |
| **Setup Time** | Settimane per ogni nuovo workflow | Minuti (AI genera plan) |
| **Manutenzione** | Alta (codice per ogni workflow) | Bassa (solo building blocks) |
| **Debugging** | Facile (codice statico) | Medio (plan dinamici) |
| **Safety** | Alta (review manuale) | Media (validation automatica) |
| **Learning Curve** | Utente impara workflow disponibili | Sistema impara da uso |
| **Innovation** | Limitata a workflow predefiniti | Continua (nuovi pattern emergono) |
| **Cost** | Basso (no AI per planning) | Medio (AI per plan generation) |

**Raccomandazione:** Usare entrambi gli approcci:
- **Fixed workflows** per task comuni e critici (init-session, pre-commit-validate)
- **Dynamic workflows** per task custom e esploratori (analisi ad-hoc, debugging complesso)

### D.11. Esempio End-to-End

**User Request:**
```
"Ho un bug nel sistema di autenticazione. Gli utenti riportano 
che dopo il login vengono reindirizzati alla home invece che 
alla pagina richiesta. Trova il problema e suggerisci una fix."
```

**AI-Generated Plan:**
```json
{
  "name": "auth-redirect-bug-investigation",
  "description": "Investigate authentication redirect bug",
  "steps": [
    {
      "id": "search-auth-code",
      "type": "ai-analysis",
      "description": "Find authentication-related files",
      "config": {
        "backend": "qwen",
        "prompt": "List all files related to authentication and redirect logic"
      }
    },
    {
      "id": "analyze-redirect-logic",
      "type": "parallel-execution",
      "description": "Analyze redirect implementation in parallel",
      "config": {
        "parallelSteps": [
          {
            "id": "check-login-handler",
            "type": "ai-analysis",
            "config": {
              "backend": "gemini",
              "prompt": "Analyze login handler in {{search-auth-code.output}} for redirect bugs"
            }
          },
          {
            "id": "check-session-management",
            "type": "ai-analysis",
            "config": {
              "backend": "rovodev",
              "prompt": "Check session management in {{search-auth-code.output}} for state issues"
            }
          }
        ]
      },
      "dependsOn": ["search-auth-code"]
    },
    {
      "id": "check-recent-changes",
      "type": "git-operation",
      "description": "Check recent commits to auth files",
      "config": {
        "operation": "getRecentCommitsWithDiffs(5)"
      }
    },
    {
      "id": "synthesize-findings",
      "type": "ai-analysis",
      "description": "Synthesize findings and suggest fix",
      "config": {
        "backend": "gemini",
        "prompt": "Based on these analyses:\n\nLogin Handler: {{check-login-handler.output}}\n\nSession Mgmt: {{check-session-management.output}}\n\nRecent Changes: {{check-recent-changes.output}}\n\nIdentify root cause and suggest specific code fix."
      },
      "dependsOn": ["analyze-redirect-logic", "check-recent-changes"]
    }
  ]
}
```

**Execution Log:**
```
[12:00:01] Starting dynamic workflow: auth-redirect-bug-investigation
[12:00:02] Step 1/4: Find authentication-related files
[12:00:15] Found 5 files: auth.service.ts, login.controller.ts, session.manager.ts, redirect.helper.ts, auth.middleware.ts
[12:00:15] Step 2/4: Analyze redirect implementation in parallel
[12:00:16]   - Parallel task 1: Analyzing login handler with Gemini
[12:00:16]   - Parallel task 2: Checking session management with Rovodev
[12:00:45]   - Gemini: Found potential issue in login.controller.ts line 45
[12:00:47]   - Rovodev: Session state not persisted before redirect
[12:00:47] Step 3/4: Check recent commits to auth files
[12:00:48] Found commit abc123: "Fix login redirect" modified redirect.helper.ts
[12:00:48] Step 4/4: Synthesize findings and suggest fix
[12:01:15] Analysis complete
```

**Result:**
```markdown
# Bug Investigation: Auth Redirect Issue

## Root Cause Identified
The bug was introduced in commit abc123 where the redirect logic was 
refactored. The session state is now read AFTER the redirect URL is 
determined, causing the redirect to always point to the default home page.

## Affected File
`src/auth/redirect.helper.ts`, line 45-50

## Suggested Fix
```typescript
// BEFORE (buggy)
const redirectUrl = getDefaultRedirectUrl(); // Always returns '/home'
const sessionState = await getSessionState(userId);

// AFTER (fixed)
const sessionState = await getSessionState(userId);
const redirectUrl = sessionState.intendedUrl || getDefaultRedirectUrl();
```

## Testing Recommendation
1. Add unit test for redirect with intended URL in session
2. Add integration test for login → redirect flow
3. Verify existing users' sessions are not broken
```

**Outcome:**
- Bug identified in 1 minuto e 15 secondi
- Root cause trovato (commit specific)
- Fix suggerita con code example
- Testing recommendations fornite
- Zero intervento umano necessario

---

## D.12. Conclusione: Il Meglio di Entrambi i Mondi

**Strategia Ibrida Raccomandata:**

```typescript
// src/workflows/hybrid.ts
export class HybridWorkflowManager {
  constructor(
    private fixedWorkflows: Map<string, WorkflowDefinition>,
    private dynamicGenerator: DynamicWorkflowGenerator
  ) {}
  
  async executeRequest(request: WorkflowRequest): Promise<WorkflowResult> {
    // 1. Check se esiste workflow fisso che matcha perfettamente
    const fixedMatch = this.findFixedWorkflow(request);
    if (fixedMatch) {
      logger.info('Using fixed workflow:', fixedMatch.name);
      return await fixedMatch.execute(request.params);
    }
    
    // 2. Check se esiste template riutilizzabile
    const template = await this.templateLibrary.findSimilarTemplate(request);
    if (template && template.successRate > 0.9) {
      logger.info('Using template:', template.name);
      return await this.executeFromTemplate(template, request);
    }
    
    // 3. Genera dynamic workflow
    logger.info('Generating dynamic workflow for:', request.description);
    const plan = await this.dynamicGenerator.generatePlan(request);
    const result = await this.dynamicExecutor.execute(plan);
    
    // 4. Se success, salva come template per future
    if (result.success && request.saveAsTemplate) {
      await this.templateLibrary.saveAsTemplate(result, `user-${Date.now()}`);
    }
    
    return result;
  }
}
```

**Vantaggi:**
- Task comuni → Fast (fixed workflows)
- Task custom → Flessibile (dynamic workflows)
- Task ricorrenti → Learned (templates)
- Safety → Multi-layer validation
- Innovation → Continua (nuovi pattern)

---

**Fine Appendice D**
