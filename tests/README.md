# Test Infrastructure

Testing infrastructure per unified-ai-mcp-tool basata su Vitest.

## Struttura

```
tests/
├── utils/           # Utilities di test (mock, helpers)
│   ├── mockAI.ts    # Mock per AI backends
│   ├── mockGit.ts   # Mock per comandi Git
│   └── testHelpers.ts # Helpers generici
├── unit/            # Test unitari
│   ├── permissionManager.test.ts
│   ├── gitHelper.test.ts
│   └── aiExecutor.test.ts
└── integration/     # Test di integrazione
    └── workflows.test.ts
```

## Esecuzione Test

```bash
# Esegui tutti i test
npm test

# Esegui test in watch mode
npm run test:watch

# Genera report coverage
npm run test:coverage
```

## Coverage Thresholds

Il progetto richiede un minimo di:
- 80% lines coverage
- 80% statements coverage
- 80% functions coverage
- 80% branches coverage

## Mock Utilities

### mockAI.ts

Fornisce utilities per mockare le risposte dei backend AI:

```typescript
import { mockQwenResponse, mockGeminiResponse, mockAIExecutor } from '../utils/mockAI';

// Mock singolo backend
mockQwenResponse('Mocked response');

// Mock multiple backends
mockAIExecutor({
  qwen: 'Qwen response',
  gemini: 'Gemini response'
});
```

### mockGit.ts

Fornisce utilities per mockare i comandi Git:

```typescript
import { mockGitCommand, mockGitCommands, createMockGitDiff } from '../utils/mockGit';

// Mock singolo comando
mockGitCommand('git status', 'nothing to commit');

// Mock multiple comandi
mockGitCommands([
  { command: 'status', output: 'clean' },
  { command: 'branch', output: 'main' }
]);

// Crea diff realistici
const diff = createMockGitDiff('file.ts', ['+new'], ['-old']);
```

### testHelpers.ts

Utilities generiche per i test:

```typescript
import { 
  waitFor, 
  createMockProgressCallback, 
  createMockWorkflowParams 
} from '../utils/testHelpers';

// Progress callback
const { callback, messages } = createMockProgressCallback();
await workflow(params, callback);
expect(messages).toContain('Starting');

// Wait for condition
await waitFor(() => someCondition === true, 5000);
```

## Best Practices

1. **Isolation**: Ogni test deve essere indipendente e non influenzare altri test
2. **Mocking**: Usa le mock utilities per isolare il codice sotto test
3. **Assertions**: Usa assertions chiare e specifiche
4. **Coverage**: Scrivi test per edge cases e error handling
5. **Performance**: Evita sleep/delays inutili, usa mock con delay quando necessario

## Aggiungere Nuovi Test

### Test Unitari

Per testare una singola funzione o classe:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('MyModule', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Test di Integrazione

Per testare l'integrazione tra moduli:

```typescript
import { describe, it, expect } from 'vitest';
import { mockGitCommands } from '../utils/mockGit';
import { mockAIExecutor } from '../utils/mockAI';

describe('Workflow Integration', () => {
  it('should execute workflow end-to-end', async () => {
    // Setup mocks
    mockGitCommands([...]);
    mockAIExecutor({...});
    
    // Execute workflow
    const result = await executeWorkflow(params);
    
    // Verify
    expect(result).toContain('expected output');
  });
});
```

## CI/CD Integration

I test vengono eseguiti automaticamente in GitHub Actions:
- **test.yml**: Esegue test su Node.js 18, 20, 22
- **lint.yml**: Verifica linting e type checking

I test devono passare su tutti i branch prima di merge.
