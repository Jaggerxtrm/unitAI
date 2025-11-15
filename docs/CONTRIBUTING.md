# Contributing Guide

**Version:** 1.0  
**Last Updated:** 2025-11-14

Thank you for considering contributing to unified-ai-mcp-tool. This guide will help you get started.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)

---

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- TypeScript knowledge
- One or more AI backend CLIs (qwen, gemini, acli)

### Clone and Install

```bash
git clone https://github.com/jaggerxtrm/unified-ai-mcp-tool.git
cd unified-ai-mcp-tool
npm install
```

### Build

```bash
npm run build
```

Output will be in `dist/` directory.

### Development Mode

```bash
npm run dev
```

This watches for changes and rebuilds automatically.

### Type Checking

```bash
npm run lint
```

---

## Project Structure

```
unified-ai-mcp-tool/
├── src/
│   ├── agents/              # Agent implementations (Architect, Implementer, Tester)
│   │   ├── base/
│   │   │   └── BaseAgent.ts
│   │   ├── ArchitectAgent.ts
│   │   ├── ImplementerAgent.ts
│   │   └── TesterAgent.ts
│   ├── tools/               # MCP tool definitions
│   │   ├── ask-gemini.tool.ts
│   │   ├── ask-qwen.tool.ts
│   │   ├── ask-rovodev.tool.ts
│   │   └── smart-workflows.tool.ts
│   ├── workflows/           # Workflow implementations
│   │   ├── init-session.workflow.ts
│   │   ├── parallel-review.workflow.ts
│   │   ├── validate-last-commit.workflow.ts
│   │   ├── pre-commit-validate.workflow.ts
│   │   ├── bug-hunt.workflow.ts
│   │   └── feature-design.workflow.ts
│   ├── utils/               # Utility modules
│   │   ├── aiExecutor.ts
│   │   ├── gitHelper.ts
│   │   ├── structuredLogger.ts
│   │   ├── permissionManager.ts
│   │   ├── tokenEstimator.ts
│   │   ├── auditTrail.ts
│   │   └── errorRecovery.ts
│   ├── constants.ts         # Configuration constants
│   └── index.ts             # MCP server entry point
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── utils/               # Test utilities
├── docs/                    # Documentation
└── dist/                    # Build output
```

### Key Files

**Entry Point:**
- `src/index.ts`: MCP server initialization

**Core Infrastructure:**
- `src/utils/aiExecutor.ts`: AI backend execution
- `src/utils/permissionManager.ts`: Permission system
- `src/workflows/index.ts`: Workflow registry

**Configuration:**
- `src/constants.ts`: Default configs and CLI paths

---

## Coding Standards

### TypeScript Guidelines

**Use strict types:**

```typescript
// Good
function processFiles(files: string[]): Promise<Result[]> {
  // ...
}

// Bad
function processFiles(files: any) {
  // ...
}
```

**Interfaces over types for objects:**

```typescript
// Preferred
interface WorkflowParams {
  files: string[];
  focus?: string;
}

// Avoid
type WorkflowParams = {
  files: string[];
  focus?: string;
};
```

**Async/await over promises:**

```typescript
// Good
async function fetchData() {
  const result = await apiCall();
  return result;
}

// Avoid
function fetchData() {
  return apiCall().then(result => result);
}
```

### Code Organization

**File naming:**
- PascalCase for classes: `ArchitectAgent.ts`
- camelCase for utilities: `aiExecutor.ts`
- kebab-case for workflows: `pre-commit-validate.workflow.ts`

**Export patterns:**

```typescript
// Named exports preferred
export class ArchitectAgent { }
export function executeWorkflow() { }

// Default exports only for entry points
export default class MCPServer { }
```

### Error Handling

**Always use structured errors:**

```typescript
// Good
throw new Error(JSON.stringify({
  type: 'VALIDATION',
  code: 'MISSING_PARAM',
  message: 'Required parameter missing',
  details: { param: 'files' }
}));

// Bad
throw new Error('Missing parameter');
```

**Catch and log errors:**

```typescript
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack
  });
  throw error;  // Re-throw after logging
}
```

### Documentation

**All public functions must have JSDoc:**

```typescript
/**
 * Executes a workflow with given parameters.
 * 
 * @param workflowName - Name of the workflow to execute
 * @param params - Workflow-specific parameters
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to workflow result
 * @throws {Error} If workflow not found or execution fails
 */
export async function executeWorkflow(
  workflowName: string,
  params: any,
  onProgress?: (message: string) => void
): Promise<WorkflowResult> {
  // ...
}
```

---

## Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Requirements

- All new features must have tests
- Bug fixes should include regression tests
- Target 80% coverage minimum
- Tests must pass before PR merge

### Writing Tests

**Use Vitest framework:**

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('WorkflowExecutor', () => {
  it('should execute workflow successfully', async () => {
    // Arrange
    const params = { files: ['test.ts'] };
    
    // Act
    const result = await executeWorkflow('parallel-review', params);
    
    // Assert
    expect(result.success).toBe(true);
  });
});
```

**Mock external dependencies:**

```typescript
import { mockAIExecutor } from '../utils/mockAI';

it('should handle AI backend failure', async () => {
  // Mock AI to fail
  mockAIExecutor({ gemini: new Error('Backend failed') });
  
  const result = await executeWorkflow('parallel-review', params);
  
  expect(result.success).toBe(false);
  expect(result.error.type).toBe('BACKEND');
});
```

### Test Organization

```
tests/
├── unit/
│   ├── agents/
│   │   └── ArchitectAgent.test.ts
│   ├── workflows/
│   │   └── parallel-review.test.ts
│   └── utils/
│       └── permissionManager.test.ts
├── integration/
│   └── workflows.test.ts
└── utils/
    ├── mockAI.ts
    ├── mockGit.ts
    └── testHelpers.ts
```

---

## Documentation

### Documentation Requirements

**All new features require:**
1. API reference entry
2. Usage example in guide
3. Update to relevant sections

**Documentation locations:**
- API reference: `docs/reference/`
- User guides: `docs/guides/`
- Architecture: `docs/ARCHITECTURE.md`
- Workflows: `docs/WORKFLOWS.md`

### Writing Documentation

**Use clear, concise language:**

```markdown
# Good
Execute the parallel-review workflow to analyze code with multiple AI backends.

# Too verbose
This workflow, which we call parallel-review, can be used when you want to 
analyze your code using multiple different AI backends in order to get 
comprehensive feedback from different perspectives.
```

**Include practical examples:**

```markdown
## Example

Query Gemini for architectural analysis:

\`\`\`json
{
  "tool": "ask-gemini",
  "params": {
    "prompt": "@src/auth.ts Analyze architecture",
    "model": "gemini-2.5-pro"
  }
}
\`\`\`
```

**No emoji in documentation** (per project standards).

---

## Submitting Changes

### Git Workflow

**1. Create a branch:**

```bash
git checkout -b feature/your-feature-name
```

Branch naming:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation only
- `refactor/` for code refactoring

**2. Make changes:**

Follow coding standards and write tests.

**3. Commit messages:**

Use conventional commits format:

```
type(scope): description

- feat: New feature
- fix: Bug fix
- docs: Documentation only
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance

Examples:
feat(workflows): Add pre-commit-validate workflow
fix(agents): Handle timeout in ArchitectAgent
docs(api): Update workflow API reference
```

**4. Run validation:**

```bash
npm run lint     # Type check
npm test         # Tests
npm run build    # Build check
```

**5. Push and create PR:**

```bash
git push origin feature/your-feature-name
```

Then create Pull Request on GitHub.

### Pull Request Guidelines

**PR Title:**

Use same format as commit messages:

```
feat(workflows): Add support for workflow caching
```

**PR Description:**

Include:
- Summary of changes
- Motivation/context
- Related issues (if any)
- Testing performed
- Screenshots (if UI changes)

**Example:**

```markdown
## Summary
Adds caching support to workflows with configurable TTL.

## Motivation
Reduce redundant AI calls for repeated operations.

## Changes
- Added cache layer in workflow executor
- Implemented TTL-based expiration
- Updated tests

## Testing
- Unit tests for cache operations
- Integration tests for workflow caching
- Manual testing with parallel-review workflow

## Related Issues
Closes #123
```

### Review Process

**All PRs require:**
1. Passing CI/CD checks
2. Code review approval
3. Up-to-date with main branch
4. No merge conflicts

**Reviewers will check:**
- Code quality and standards
- Test coverage
- Documentation completeness
- Performance implications
- Breaking changes

### Release Process

Releases are handled by maintainers:

1. Version bump in `package.json`
2. Update `CHANGELOG.md`
3. Tag release: `git tag v1.2.3`
4. Publish to npm

---

## Getting Help

**Questions or issues?**

- Check existing documentation
- Search GitHub issues
- Create new issue with details

**Discussion:**

- Architecture decisions: Create GitHub issue
- Feature requests: Create GitHub issue with "enhancement" label
- Bug reports: Create GitHub issue with "bug" label

---

## Code of Conduct

**Be respectful:**
- Constructive feedback
- Professional communication
- Inclusive environment

**Focus on code:**
- Review code, not people
- Assume good intentions
- Learn from each other

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to unified-ai-mcp-tool!
