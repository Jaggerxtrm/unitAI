# Structured Logging Guide

Sistema di logging strutturato per unified-ai-mcp-tool con file-based JSON logging, rotation, query API e monitoring.

## Componenti Principali

### StructuredLogger

Logger principale con supporto multi-file e categorizzazione.

```typescript
import { structuredLogger, LogLevel, LogCategory } from '../utils/structuredLogger.js';

structuredLogger.info(
  LogCategory.WORKFLOW,
  'workflow-name',
  'operation-name',
  'Message',
  { metadata: 'value' }
);
```

### WorkflowLogger

Logger context-aware per workflow con auto-injection workflowId.

```typescript
const logger = structuredLogger.forWorkflow(workflowId, 'workflow-name');

logger.step('step-name', 'Step description', { params });
logger.aiCall('qwen', prompt, { model: 'qwen-max' });
logger.permissionCheck('write-file', allowed, { file: 'test.txt' });
logger.error('operation', error, { context });
```

## File di Log

Struttura directory:

```
logs/
├── workflow-executions.log    # Eventi workflow-level
├── ai-backend-calls.log        # Interazioni con AI
├── permission-checks.log       # Audit sistema permessi
├── git-operations.log          # Operazioni Git
├── errors.log                  # Solo errori
└── debug.log                   # Tutto (verbose mode)
```

## Livelli di Log

- `DEBUG`: Informazioni dettagliate per debugging
- `INFO`: Eventi normali
- `WARN`: Situazioni anomale ma non critiche
- `ERROR`: Errori che richiedono attenzione

## Configurazione

Variabili ambiente:

```bash
export LOG_LEVEL=debug          # debug | info | warn | error
export LOG_TO_CONSOLE=true      # true | false
export LOG_TO_FILE=true         # true | false
```

## Query Logs

```typescript
const results = structuredLogger.queryLogs({
  category: LogCategory.WORKFLOW,
  level: LogLevel.ERROR,
  workflowId: 'abc-123',
  startTime: new Date('2024-01-01'),
  limit: 100
});
```

## Export Logs

```typescript
const json = structuredLogger.exportLogs(LogCategory.WORKFLOW, 'json');
const csv = structuredLogger.exportLogs(LogCategory.AI_BACKEND, 'csv');
```

## Log Rotation

Automatic rotation ogni ora (configurable):

```typescript
import { startAutoRotation } from '../utils/logRotation.js';

const timer = startAutoRotation('./logs', 3600000); // 1 hour
```

Configurazione:
- `maxSizeMB`: Dimensione massima file prima di rotation (default: 10MB)
- `maxFiles`: Numero di file rotati da mantenere (default: 5)

File rotati vengono compressi: `file.log.1.gz`, `file.log.2.gz`, etc.

## Monitoring Scripts

### Watch Logs

Real-time monitoring:

```bash
./scripts/watch-logs.sh -w              # Watch workflows
./scripts/watch-logs.sh -a              # Watch AI calls
./scripts/watch-logs.sh -e              # Watch errors
./scripts/watch-logs.sh -i abc-123      # Watch specific workflow
```

### Analyze Logs

Post-mortem analysis:

```bash
./scripts/analyze-logs.sh summary       # Workflow summary
./scripts/analyze-logs.sh errors        # Error distribution
./scripts/analyze-logs.sh performance   # Performance metrics
./scripts/analyze-logs.sh ai-usage      # AI backend usage
```

## Integrazione Workflow

Esempio di integrazione in un workflow:

```typescript
import { structuredLogger } from '../utils/structuredLogger.js';
import { randomUUID } from 'crypto';

async function executeWorkflow(params, onProgress) {
  const workflowId = randomUUID();
  const logger = structuredLogger.forWorkflow(workflowId, 'my-workflow');
  
  logger.step('start', 'Starting workflow', { params });
  
  try {
    logger.aiCall('qwen', prompt, { promptLength: prompt.length });
    const result = await executeAIClient({ backend: 'qwen', prompt });
    
    logger.step('complete', 'Workflow completed', { resultLength: result.length });
    return result;
  } catch (error) {
    logger.error('execution-failed', error as Error, { params });
    throw error;
  }
}
```

## Timing Operations

```typescript
const result = await logger.timing('expensive-operation', async () => {
  return await expensiveTask();
});
```

Il timing viene automaticamente loggato con la durata.

## Cleanup

Pulizia automatica log vecchi:

```typescript
structuredLogger.cleanup(30); // Elimina log più vecchi di 30 giorni
```

## Best Practices

1. Usa WorkflowLogger per context automatico
2. Log tutti gli step critici del workflow
3. Includi metadata rilevante per debugging
4. Log errori con stack trace completo
5. Usa timing per operazioni costose
6. Log permission checks per audit
7. Monitor real-time durante sviluppo
8. Analyze logs post-mortem per pattern
