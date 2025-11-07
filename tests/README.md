# Test Suite

Suite di test per unified-ai-mcp-tool, implementata con Vitest.

## Struttura

```
tests/
├── utils/              # Test per moduli di utilità
│   ├── permissionManager.test.ts
│   ├── gitHelper.test.ts
│   ├── aiExecutor.test.ts
│   ├── mockAI.ts      # Mock utilities per AI backends
│   └── mockGit.ts     # Mock utilities per comandi Git
├── workflows/         # Test di integrazione workflow
│   └── workflow-integration.test.ts
└── README.md
```

## Esecuzione Test

```bash
# Esegui tutti i test
npm test

# Esegui test con UI interattiva
npm run test:ui

# Genera report di coverage
npm run test:coverage
```

## Coverage Attuale

- **permissionManager.ts**: 93.44%
- **aiExecutor.ts**: 77.77%
- **gitHelper.ts**: 64.08%

Target: 80% coverage per tutti i moduli critici

## Writing Tests

### Test Utilities

Usa i mock utilities per simulare AI backends e comandi Git:

```typescript
import { mockQwenResponse, mockAIError } from './mockAI.js';
import { mockGitCommand } from './mockGit.js';

// Mock AI response
vi.spyOn(commandExecutor, 'executeCommand')
  .mockImplementation(mockQwenResponse('test response'));

// Mock Git command
vi.spyOn(commandExecutor, 'executeCommand')
  .mockImplementation(mockGitCommand('git status', 'clean'));
```

### Best Practices

1. **Isola le dipendenze**: Usa `vi.mock()` per moduli esterni
2. **Test atomici**: Ogni test deve essere indipendente
3. **Mock granulari**: Mock solo ciò che serve
4. **Coverage critica**: Testa edge cases e error handling
5. **Nomenclatura chiara**: Descrizioni in italiano, esplicative

## CI/CD

I test vengono eseguiti automaticamente su:
- Push su branch main/master/develop
- Pull requests

Configurazione: `.github/workflows/test.yml`
