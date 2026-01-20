# Workflows Guide

**Version:** 1.1  
**Last Updated:** 2025-11-14  
**Status:** Production Ready

This guide provides comprehensive documentation for all workflows available in unitai.

---

## Table of Contents

- [Quick Reference](#quick-reference)
- [Workflow Catalog](#workflow-catalog)
- [Common Patterns](#common-patterns)
- [Integration Examples](#integration-examples)
- [Best Practices](#best-practices)

---

## Quick Reference

### Workflow Comparison

| Workflow | Backends | Parallel | Duration | Primary Use Case |
|----------|----------|----------|----------|------------------|
| init-session | Gemini + Qwen | Sequential | 15-30s | Session initialization |
| pre-commit-validate | Gemini + Qwen + Droid (depth-based) | Parallel | 5-120s | Pre-commit quality gates |
| parallel-review | Gemini + Rovodev (+ Cursor/Droid con `strategy=double-check`) | Yes | 10-45s | Code review multi-prospettiva |
| validate-last-commit | Gemini + Qwen | Parallel | 15-25s | Post-commit validation |
| bug-hunt | Gemini + Cursor + Droid (sequenziale) | Sequenziale | 30-90s | Bug investigation |
| feature-design | Architect/Implementer/Tester (Gemini + Rovodev + Droid + Qwen) | Parallel | 45-120s | Feature planning |
| triangulated-review | Gemini + Cursor + Droid | Misto | 20-60s | Refactor/bugfix con doppia conferma |
| refactor-sprint | Cursor + Gemini + Droid | Sequenziale | 40-120s | Refactor organizzato in sprint |
| auto-remediation | Droid | Sequenziale | 15-45s | Piani di remediation autonomi |
| overthinker | Gemini (Multi-persona) | Sequenziale | 60-180s | Deep reasoning & refinement |

### When to Use Each Workflow

**Starting Work:**
- Use `init-session` to get context on recent changes

**During Development:**
- Use `parallel-review` for comprehensive code review
- Use `bug-hunt` when investigating issues

**Before Committing:**
- Use `pre-commit-validate` with appropriate depth level
  - `quick`: Rapid development cycles (5-10s)
  - `thorough`: Standard validation (20-30s)
  - `paranoid`: Critical code changes (60-90s)

**After Committing:**
- Use `validate-last-commit` to ensure quality

**Planning Features:**
- Use `feature-design` for architectural planning and implementation guidance
- Use `overthinker` for deep reasoning and refining complex ideas

---

## Workflow Catalog

### init-session

Initialize a development session by analyzing git repository state and providing relevant context.

**Purpose:**  
Analyze recent commits, staged changes, and repository status to provide an intelligent summary of recent work and suggest relevant memory queries.

**When to Use:**
- Start of coding session
- After pulling latest changes
- When switching branches
- Team member onboarding

**Backends:**  
Primary: Gemini (deep analysis)  
Fallback: Qwen (if Gemini unavailable)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| autonomyLevel | string | No | read-only | Permission level for operations |

**Example Usage:**

```json
{
  "workflow": "init-session",
  "params": {}
}
```

**Output:**

The workflow produces a markdown-formatted report containing:

- Repository information (current branch, remotes)
- Recent commits (last 10)
- Staged and modified files
- AI analysis of recent work patterns
- Suggested memory search queries based on recent activity
- CLI availability status

**Sample Output:**

```markdown
# Session Initialization Report

## Repository Status
Branch: feature/token-optimization
Staged files: 3
Modified files: 5

## Recent Commits (Last 10)
- 8793e7a: updated readme
- 560b90a: docs: Update CLAUDE.MD with smart-workflows integration
- 42eedc9: feat: Implement autonomous token-aware decision making system

## AI Analysis
Recent work focuses on token optimization and autonomous decision making.
Main changes in utils/ directory suggest performance improvements.

## Suggested Memory Queries
1. Search for: "token optimization patterns"
2. Search for: "2025-11-09 autonomous system"
3. Search for: "workflow implementation decisions"
```

**Error Cases:**
- Not a git repository: Error returned with suggestion to initialize git
- Git command failure: Partial report with available information
- AI backend unavailable: Basic git info only

---

### pre-commit-validate

Validate staged changes before committing with configurable depth levels for different scenarios.

**Purpose:**  
Multi-stage validation of staged files including security scanning, code quality checks, and breaking change detection.

**When to Use:**
- Git pre-commit hook (recommended)
- Manual pre-commit validation
- CI/CD quality gates
- Before code review requests

**Backends:**  
Esecuzione parallela con pipeline dinamica:
- Qwen: Security e secret detection
- Gemini: Code quality e best practice
- Rovodev: Breaking change analysis (shadow mode)
- Droid (solo depth `paranoid`): tentativa di remediation autonoma / checklist finale

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| depth | string | No | thorough | Validation depth: quick, thorough, paranoid |
| autonomyLevel | string | No | read-only | Permission level for operations |

**Depth Levels:**

**quick** (5-10 seconds):
- Security scan only (Qwen)
- Hardcoded secrets detection
- Basic syntax validation
- Use for: Rapid development cycles, frequent commits

**thorough** (20-30 seconds):
- All quick checks
- Code quality analysis (Gemini)
- Breaking change detection (Rovodev)
- Best practices validation
- Use for: Standard pre-commit validation (recommended)

**paranoid** (60-120 seconds):
- Tutto ciò che offre `thorough`
- Analisi estesa di sicurezza/performance
- Attivazione di Droid (`auto=low/medium`) per sintetizzare un piano di remediation
- Edge case detection avanzata + suggerimenti di rollback
- Use for: Critical code, production releases

**Example Usage:**

```json
{
  "workflow": "pre-commit-validate",
  "params": {
    "depth": "thorough"
  }
}
```

**Output:**

The workflow returns a verdict with detailed validation results:

```typescript
{
  success: boolean,
  verdict: {
    level: "PASS" | "WARN" | "FAIL",
    message: string,
    details: {
      security: { pass: boolean, issues: string[] },
      quality: { pass: boolean, issues: string[] },
      breaking: { pass: boolean, issues: string[] }
    }
  },
  stagedDiff: string,
  duration: number
}
```

**Verdict Levels:**
- **PASS**: No issues found, safe to commit
- **WARN**: Minor issues detected, review recommended but not blocking
- **FAIL**: Critical issues found, do not commit

**Integration Example (Git Hook):**

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run thorough validation
result=$(npx unitAI workflow run pre-commit-validate --depth thorough)

# Check verdict
if echo "$result" | grep -q "FAIL"; then
  echo "Pre-commit validation FAILED. Please fix issues before committing."
  exit 1
fi

exit 0
```

---

### parallel-review

Perform multi-perspective code review orchestrando Gemini (architettura), Rovodev (implementazione), Cursor Agent (refactor plan) e Droid (verifica autonoma).

**Purpose:**  
Ottenere punti di vista complementari sul codice: architettura, best practice, refactor pratici e checklist operative in un’unica esecuzione.

**When to Use:**
- Pre-pull request reviews
- Code quality audits
- Security assessments
- Architecture validation
- Learning from existing code

**Backends:**  
- `strategy="standard"` → Gemini + Rovodev  
- `strategy="double-check"` → Gemini + Rovodev + Cursor + Droid (con attachments opzionali)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| files | string[] | Yes | - | List of file paths to review |
| focus | string | No | all | Review focus area |
| autonomyLevel | string | No | read-only | Permission level |
| strategy | string | No | standard | `standard` oppure `double-check` (aggiunge Cursor+Droid) |
| backendOverrides | string[] | No | - | Specifica manualmente i backend da usare |
| attachments | string[] | No | - | File allegati a Cursor/Droid (max 5 consigliati) |

**Focus Areas:**
- `all`: Comprehensive review (architecture, quality, security)
- `security`: Security-focused review only
- `performance`: Performance optimization focus
- `architecture`: Architectural patterns and design

**Example Usage:**

```json
{
  "workflow": "parallel-review",
  "params": {
    "files": [
      "src/workflows/parallel-review.workflow.ts",
      "src/utils/aiExecutor.ts"
    ],
    "focus": "security",
    "strategy": "double-check",
    "attachments": ["src/utils/aiExecutor.ts"]
  }
}
```

**Output:**

The workflow provides synthesized analysis combining both perspectives:

```typescript
{
  success: boolean,
  synthesis: string,        // Combined insights
  analyses: [
    {
      backend: "gemini",
      output: string,
      success: boolean,
      duration: number
    },
    {
      backend: "rovodev",
      output: string,
      success: boolean,
      duration: number
    },
    {
      backend: "ask-cursor",
      output: string,
      success: boolean,
      duration: number
    },
    {
      backend: "droid",
      output: string,
      success: boolean,
      duration: number
    }
  ],
  cacheHit: boolean
}
```

**Performance:**
- Modalità standard: ~45% più veloce della sequenziale (Gemini + Rovodev).
- Modalità double-check: +10/15s per coinvolgere Cursor/Droid ma con checklist pronta all’uso.
- Caching: 50%+ cache hit rate (1-hour TTL) per i backend deterministici (Gemini/Rovodev).

**Sample Synthesis:**

```markdown
# Code Review: src/workflows/parallel-review.workflow.ts

## Gemini Perspective (Architecture)
The workflow implementation follows good separation of concerns.
Consider extracting the synthesis logic into a separate utility for reuse.

## Rovodev Perspective (Implementation)
Code is production-ready with proper error handling.
Suggestion: Add type guards for the analyses array.

## Consensus
Both backends recommend:
1. Extract synthesis logic for better testability
2. Add more explicit error cases
3. Consider timeout configuration for long-running reviews
```

---

### validate-last-commit

Validate the most recent git commit for quality, security issues, and potential breaking changes.

**Purpose:**  
Post-commit validation to ensure code quality and catch issues before pushing to remote.

**When to Use:**
- After committing locally
- Before pushing to remote
- CI/CD quality gates
- Automated commit validation

**Backends:**  
Gemini (code quality) + Qwen (quick security scan) in parallel

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| commit_ref | string | No | HEAD | Git commit reference to validate |
| autonomyLevel | string | No | read-only | Permission level |

**Example Usage:**

```json
{
  "workflow": "validate-last-commit",
  "params": {
    "commit_ref": "HEAD"
  }
}
```

**Output:**

Detailed validation including commit metadata and verdict:

```typescript
{
  success: boolean,
  validation: string,       // Markdown validation report
  commit: {
    hash: string,
    author: string,
    message: string,
    files: string[],
    diff: string
  },
  verdict: {
    pass: boolean,
    warnings: string[],
    errors: string[]
  }
}
```

**Use in CI/CD:**

```yaml
# .github/workflows/validate.yml
- name: Validate Last Commit
  run: |
    result=$(npx unitAI workflow run validate-last-commit)
    if echo "$result" | grep -q "errors"; then
      exit 1
    fi
```

---

### bug-hunt

AI-powered bug discovery and analysis with automatic file discovery and root cause identification.

**Purpose:**  
Investigate bugs by analyzing symptoms, discovering relevant files, and identifying root causes with fix recommendations.

**When to Use:**
- Production bug investigation
- Hard-to-reproduce issues
- Complex multi-file bugs
- Root cause analysis needed

**Backends:**  
Esecuzione sequenziale ottimizzata:
1. **Gemini**: individua file sospetti (usa claude-context se `suspected_files` è vuoto)
2. **Cursor Agent**: genera ipotesi e patch candidate sui file emersi
3. **Droid**: costruisce un piano operativo / remediation checklist

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| symptoms | string | Yes | - | Detailed description of bug symptoms |
| suspected_files | string[] | No | [] | Optional list of suspected files |
| autonomyLevel | string | No | read-only | Permission level |

**Example Usage:**

```json
{
  "workflow": "bug-hunt",
  "params": {
    "symptoms": "Users getting 500 error when uploading files larger than 10MB",
    "suspected_files": ["src/api/upload.ts"]
  }
}
```

**Workflow Steps:**

1. **Discovery**  
   - Gemini legge i sintomi e usa claude-context per proporre file target (se `suspected_files` è vuoto)  
   - Classifica i file per priorità e rischio.

2. **Hypothesis + Patch Draft**  
   - Cursor Agent analizza i file (max 5 allegati) e produce possibili root cause + patch suggerite.  
   - Restituisce anche i test consigliati.

3. **Remediation Plan**  
   - Droid trasforma le ipotesi in una checklist operativa (max `maxActions` step).  
   - Ogni step include controlli/metriche e rischi residui.

**Output:**

```typescript
{
  success: boolean,
  report: string,          // Markdown bug hunt report
  findings: {
    targetFiles: string[],
    problematicFiles: string[],
    rootCause: string,
    recommendations: string[],
    relatedFiles: string[]
  },
  analyses: Array<{
    file: string,
    analysis: string,
    severity: "low" | "medium" | "high" | "critical"
  }>
}
```

**Sample Report:**

```markdown
# Bug Hunt Report

## Symptoms
Users getting 500 error when uploading files larger than 10MB

## Files Analyzed
- src/api/upload.ts (CRITICAL)
- src/middleware/bodyParser.ts (HIGH)
- src/utils/fileValidator.ts (MEDIUM)

## Root Cause
Body parser middleware has default limit of 10MB. Large file uploads
exceed this limit causing request rejection.

## Recommended Fix
1. Increase body parser limit in middleware configuration
2. Add proper error handling for file size limits
3. Implement chunked upload for large files

## Related Files
- src/config/server.ts (middleware configuration)
- tests/api/upload.test.ts (add test case for large files)
```

---

### feature-design

Design new features with architectural planning and implementation guidance using multi-agent collaboration.

**Purpose:**  
End-to-end feature planning combining architectural design (Gemini), implementation strategy (Rovodev), and testing approach (Qwen).

**When to Use:**
- New feature planning
- Complex refactoring strategies
- Architecture validation before implementation
- Implementation roadmap creation

**Backends:**  
All three via specialized agents:
- ArchitectAgent (Gemini): High-level design
- ImplementerAgent (Rovodev): Implementation plan
- TesterAgent (Qwen): Test strategy

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| featureDescription | string | Yes | - | Detailed feature description |
| targetFiles | string[] | No | [] | Files that will be modified |
| includeTests | boolean | No | true | Generate test strategy |
| includeAPI | boolean | No | false | Design API endpoints |
| includeDB | boolean | No | false | Design database schema |
| includeUI | boolean | No | false | Design UI components |
| autonomyLevel | string | No | read-only | Permission level |

**Example Usage:**

```json
{
  "workflow": "feature-design",
  "params": {
    "featureDescription": "Add OAuth2 authentication with JWT tokens",
    "targetFiles": ["src/auth/", "src/middleware/"],
    "includeAPI": true,
    "includeDB": true
  }
}
```

**Agent Collaboration:**

1. **ArchitectAgent** (Gemini):
   - System design and patterns
   - Technology choices
   - Scalability considerations
   - Security implications
   - Trade-off analysis

2. **ImplementerAgent** (Rovodev):
   - Step-by-step implementation guide
   - Code structure recommendations
   - Error handling patterns
   - Performance optimizations

3. **TesterAgent** (Qwen):
   - Test strategy (unit, integration, E2E)
   - Test case specifications
   - Edge cases and error scenarios
   - Coverage goals

**Output:**

```typescript
{
  success: boolean,
  design: {
    architecture: string,      // Architectural design
    implementation: string,    // Implementation plan
    testing: string,          // Test strategy
    api?: string,             // API design (if includeAPI)
    database?: string,        // DB schema (if includeDB)
    ui?: string               // UI design (if includeUI)
  },
  synthesis: string,          // Combined comprehensive plan
  estimatedComplexity: "low" | "medium" | "high",
  suggestedApproach: string
}
```

**Sample Synthesis:**

```markdown
# Feature Design: OAuth2 Authentication

## Architecture (ArchitectAgent)

### Design Pattern
Implement OAuth2 with JWT tokens using the Authorization Code flow.

### Components
- Auth Controller: Handle OAuth2 flow
- JWT Service: Token generation and validation
- Auth Middleware: Protect routes
- Token Storage: Redis for refresh tokens

### Security Considerations
- Use PKCE for additional security
- Implement token rotation
- Add rate limiting on auth endpoints

## Implementation (ImplementerAgent)

### Phase 1: Setup Dependencies
```typescript
// Install required packages
npm install jsonwebtoken passport passport-oauth2 redis
```

### Phase 2: Implement Auth Service
Create `src/services/AuthService.ts` with methods:
- `generateAccessToken(user): string`
- `verifyAccessToken(token): User | null`
- `generateRefreshToken(user): string`

### Phase 3: Configure Passport Strategy
[Detailed implementation steps...]

## Testing (TesterAgent)

### Test Coverage Goals
- Unit tests: 95% (auth service, JWT utilities)
- Integration tests: OAuth2 flow end-to-end
- E2E tests: Login, token refresh, logout

### Critical Test Cases
1. Valid token authentication
2. Expired token handling
3. Invalid token rejection
4. Token refresh flow
5. Concurrent token requests

### Security Test Scenarios
- Token tampering attempts
- Replay attack simulation
- Rate limit enforcement

## Implementation Roadmap

1. Week 1: Core auth service implementation
2. Week 2: OAuth2 flow and middleware
3. Week 3: Testing and security hardening
4. Week 4: Documentation and deployment
```

---

### triangulated-review

Triangula bugfix/refactor critici confrontando Gemini (architettura), Cursor Agent (piani concreti) e Droid (checklist autonoma) in un’unica esecuzione.

**Purpose:**  
Ridurre il rischio di regressioni quando si toccano file sensibili o quando serve una doppia conferma prima di procedere.

**When to Use:**
- Refactor strutturali che toccano più moduli
- Bugfix ad alto impatto (sicurezza, performance)
- Revisione prima di merge/rilascio

**Backends:**  
Gemini + Cursor Agent (in parallelo) + Droid (verifica sequenziale).

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| files | string[] | Yes | - | File da analizzare (max consigliato: 5) |
| goal | string | No | refactor | `refactor` oppure `bugfix` (influenza i prompt) |
| autonomyLevel | string | No | read-only | Livello di autonomia dei passaggi aggiuntivi |

**Example Usage:**

```json
{
  "workflow": "triangulated-review",
  "params": {
    "files": ["src/utils/aiExecutor.ts", "src/workflows/utils.ts"],
    "goal": "refactor"
  }
}
```

**Output Highlights:**
- Sintesi combinata Gemini + Cursor (markdown)
- Checklist Droid con step operativi, metriche e rischi
- Stato dei backend (success/failure) per auditing

---

### refactor-sprint

Orchestra un mini-sprint di refactoring: Cursor genera il piano, Gemini lo valida e Droid produce la checklist operativa.

**Purpose:**  
Organizzare refactor multi-step con tracking chiaro di piano, rischi e attività da svolgere.

**When to Use:**
- Refactor programmati (light/balanced/deep)
- Debt cleanup con più file coinvolti
- Coordinamento tra più sviluppatori (checklist condivisa)

**Backends:**  
Cursor Agent → Gemini → Droid (sequenziale, con progress bar).

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| targetFiles | string[] | Yes | - | File coinvolti nel refactor |
| scope | string | Yes | - | Descrizione sintetica dell’obiettivo |
| depth | string | No | balanced | `light`, `balanced`, `deep` (modifica tono del piano) |
| autonomyLevel | string | No | read-only | Permessi del workflow |
| attachments | string[] | No | [] | File allegati a Cursor (fallback ai primi 5 target) |

**Example Usage:**

```json
{
  "workflow": "refactor-sprint",
  "params": {
    "targetFiles": ["src/utils/aiExecutor.ts"],
    "scope": "Separare la logica dei backend dal core executor",
    "depth": "deep"
  }
}
```

**Output:**
- Piano Cursor (step numerati + patch/test suggeriti)
- Review architetturale Gemini con rischi
- Checklist Droid pronta da seguire (con criteri di completamento)

---

### auto-remediation

Genera automaticamente un piano di remediation (max 10 step) a partire dai sintomi forniti, sfruttando Droid con autonomia controllata.

**Purpose:**  
Ottenere rapidamente una sequenza di azioni ripetibili per incidenti o bug complessi, con note su output atteso e rischi residui.

**When to Use:**
- Incidente in produzione e necessità di piano immediato
- Handoff fra turni/on-call
- Validazione di ipotesi emerse da altri workflow

**Backends:**  
Factory Droid CLI (`droid exec`).

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| symptoms | string | Yes | - | Descrizione dei sintomi / errori |
| maxActions | number | No | 5 | Numero massimo di step generati |
| autonomyLevel | string | No | read-only | Se `high` permette `skipPermissionsUnsafe` |
| attachments | string[] | No | [] | Log o file di supporto da allegare |

**Example Usage:**

```json
{
  "workflow": "auto-remediation",
  "params": {
    "symptoms": "Timeout API upload oltre 50MB",
    "maxActions": 6,
    "attachments": ["logs/upload-error.log"]
  }
}
```

**Output:**
- Sezione “Symptoms” con il testo originale
- Piano in markdown con step numerati (azione, output atteso, controlli, rischi)
- Metadati con numero di azioni e allegati utilizzati

---

### overthinker

A deep reasoning loop using multiple AI personas to refine, critique, and perfect an idea.

**Purpose:**  
Simulate a room of experts (Prompt Refiner, Lead Architect, Reviewers, Synthesizer) to iteratively improve a concept or solution before finalizing it.

**When to Use:**
- Brainstorming complex architectural decisions
- Refining vague requirements into concrete specifications
- "Rubber ducking" difficult bugs or system designs
- Creating comprehensive documentation or policy documents

**Backends:**  
Gemini (simulating multiple personas in a sequential chain-of-thought).

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| initialPrompt | string | Yes | - | The raw idea or request |
| iterations | number | No | 3 | Number of review cycles (1-10) |
| contextFiles | string[] | No | [] | Files to provide as background context |
| outputFile | string | No | overthinking.md | Filename for the final output |
| modelOverride | string | No | - | Override backend model |
| autonomyLevel | string | No | read-only | Permission level |

**Example Usage:**

```json
{
  "workflow": "overthinker",
  "params": {
    "initialPrompt": "Design a distributed caching strategy for unitAI",
    "iterations": 3,
    "contextFiles": ["src/workflows/cache.ts", "docs/ARCHITECTURE.md"]
  }
}
```

**Workflow Steps:**

1. **Prompt Refiner**
   - Analyzes raw request + context
   - Produces a detailed "Master Prompt" with clear constraints

2. **Initial Reasoning**
   - "Lead Architect" proposes a concrete initial solution based on the Master Prompt

3. **Iterative Review Loop**
   - "Reviewer Agents" (1 to N) critique the current thinking
   - They identify gaps, risks, and improvements
   - Each iteration refines and evolves the solution

4. **Consolidation**
   - "Synthesizer" compiles the entire history into a final, polished document

**Output:**

- A comprehensive Markdown file (`overthinking.md`) containing:
  - Executive Summary
  - Refined Master Prompt
  - Detailed Solution
  - Reasoning Process history
  - Implementation Steps

---

## Common Patterns

### Pattern: Progressive Validation

Use validation workflows progressively based on change impact:

```
Small fix → quick validation (5s)
Feature work → thorough validation (30s)
Production release → paranoid validation (90s)
```

### Pattern: Review Before Commit

Establish a workflow for quality assurance:

```
1. Make changes
2. Run parallel-review on modified files
3. Address feedback
4. Run pre-commit-validate with thorough depth
5. Commit if PASS
6. Run validate-last-commit
7. Push if no errors
```

### Pattern: Bug Investigation Flow

Systematic approach to bug fixing:

```
1. Document symptoms clearly
2. Run bug-hunt workflow
3. Review identified files and root cause
4. Implement recommended fixes
5. Run parallel-review on fix
6. Add test cases suggested by TesterAgent
7. Validate with pre-commit-validate
```

### Pattern: Feature Development Cycle

End-to-end feature development:

```
1. Run feature-design with full parameters
2. Review architectural design
3. Follow implementation plan step-by-step
4. Implement test cases from TesterAgent
5. Run parallel-review on completed feature
6. Validate with pre-commit-validate
7. Commit and validate-last-commit
```

---

## Integration Examples

### Example 1: Pre-commit Hook Integration

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "Running pre-commit validation..."

# Run thorough validation
result=$(node /path/to/unitai/dist/index.js <<EOF
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "smart-workflows",
    "arguments": {
      "workflow": "pre-commit-validate",
      "params": { "depth": "thorough" }
    }
  },
  "id": 1
}
EOF
)

# Parse verdict
if echo "$result" | grep -q "\"level\":\"FAIL\""; then
  echo "Validation FAILED. Please fix issues before committing."
  exit 1
fi

if echo "$result" | grep -q "\"level\":\"WARN\""; then
  echo "Validation returned WARNINGS. Review before committing."
  # Optional: exit 1 to block on warnings
fi

echo "Validation PASSED."
exit 0
```

### Example 2: CI/CD Pipeline Integration

GitHub Actions example (`.github/workflows/validate.yml`):

```yaml
name: Validate Commits

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install unitai
        run: npm install -g @jaggerxtrm/unitai
      
      - name: Validate Last Commit
        run: |
          unified-ai workflow run validate-last-commit
          
      - name: Run Parallel Review on Changed Files
        run: |
          files=$(git diff --name-only HEAD~1)
          unified-ai workflow run parallel-review --files "$files"
```

### Example 3: Session Initialization Script

Create a session start script (`scripts/start-session.sh`):

```bash
#!/bin/bash

echo "Initializing development session..."

# Run init-session workflow
unified-ai workflow run init-session

# Execute suggested memory queries
echo ""
echo "Suggested memory searches:"
echo "1. openmemory-search-memories 'recent work'"
echo "2. openmemory-search-memories 'TODO items'"

# Optional: Auto-run first query
openmemory-search-memories "recent work on $(basename $(pwd))"
```

---

## Best Practices

### Workflow Selection

**Use the right workflow for the task:**
- Quick feedback: `init-session`, `validate-last-commit`
- Comprehensive review: `parallel-review`, `pre-commit-validate` with thorough
- Investigation: `bug-hunt`
- Planning: `feature-design`

### Parameter Optimization

**File selection:**
- Limit files to relevant changes only (max 10-15 files per review)
- Use focused reviews for large features
- Split large changesets into smaller reviews

**Depth levels:**
- Use `quick` during active development
- Use `thorough` before commits
- Use `paranoid` only for critical changes (releases, security fixes)

### Caching Awareness

Workflows cache results for 1 hour. When working on the same files:
- First run: Full analysis
- Subsequent runs: Cached results (instant)
- After changes: Cache invalidated automatically

**Tip:** Run `parallel-review` multiple times on the same files for instant feedback.

### Error Handling

Always check the `success` field in responses:

```typescript
const result = await executeWorkflow('parallel-review', params);

if (!result.success) {
  console.error('Workflow failed:', result.error);
  // Handle fallback or retry
}
```

### Performance Tips

**Parallel execution:**
- Use workflows that support parallel backends (parallel-review, pre-commit-validate)
- Avoid sequential workflows when parallel alternatives exist

**Incremental analysis:**
- Analyze small changesets frequently rather than large batches
- Break large features into reviewable chunks

**Focus areas:**
- Specify focus when you need targeted feedback (security, performance)
- Use "all" focus only when comprehensive review is needed

---

## Troubleshooting

### Workflow Timeout

**Symptom:** Workflow exceeds expected duration

**Solutions:**
- Reduce number of files being analyzed
- Use `quick` depth for pre-commit validation
- Check AI backend availability (network issues)
- Review logs: `logs/workflow-executions.log`

### Backend Unavailable

**Symptom:** Workflow fails with backend error

**Solutions:**
- Verify CLI installation: `qwen --version`, `gemini --version`, `acli --version`
- Check network connectivity
- Review logs: `logs/ai-backend-calls.log`
- Use workflows with fallback backends

### Unexpected Results

**Symptom:** Workflow returns unexpected or low-quality analysis

**Solutions:**
- Provide more context in parameters
- Use different depth level
- Try alternative workflow
- Check if results are cached (wait 1 hour or clear cache)

---

## See Also

- [Architecture Overview](./ARCHITECTURE.md) - System design and components
- [API Reference](./reference/api-workflows.md) - Full API specification
- [Integration Guide](./INTEGRATIONS.md) - MCP servers, skills, hooks
- [Token Metrics](./TOKEN_METRICS.md) - Token optimization documentation
