# Workflows Guide

**Version:** 1.1  
**Last Updated:** 2025-11-14  
**Status:** Production Ready

This guide provides comprehensive documentation for all workflows available in unified-ai-mcp-tool.

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
| pre-commit-validate | All 3 | Parallel | 5-90s | Pre-commit quality gates |
| parallel-review | Gemini + Rovodev | Yes | 10-30s | Code review |
| validate-last-commit | Gemini + Qwen | Parallel | 15-25s | Post-commit validation |
| bug-hunt | All 3 | Sequential | 30-60s | Bug investigation |
| feature-design | All 3 (agents) | Parallel | 45-90s | Feature planning |

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
All three in parallel:
- Qwen: Security and secret detection
- Gemini: Code quality and best practices
- Rovodev: Breaking change analysis

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

**paranoid** (60-90 seconds):
- All thorough checks
- Extended security analysis
- Performance impact analysis
- Comprehensive edge case detection
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
result=$(npx unified-ai-mcp workflow run pre-commit-validate --depth thorough)

# Check verdict
if echo "$result" | grep -q "FAIL"; then
  echo "Pre-commit validation FAILED. Please fix issues before committing."
  exit 1
fi

exit 0
```

---

### parallel-review

Perform multi-perspective code review using parallel AI backends for comprehensive analysis.

**Purpose:**  
Get complementary perspectives on code by running Gemini (architectural thinking) and Rovodev (practical implementation) in parallel.

**When to Use:**
- Pre-pull request reviews
- Code quality audits
- Security assessments
- Architecture validation
- Learning from existing code

**Backends:**  
Gemini + Rovodev (parallel execution)

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| files | string[] | Yes | - | List of file paths to review |
| focus | string | No | all | Review focus area |
| autonomyLevel | string | No | read-only | Permission level |

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
    "files": ["src/workflows/parallel-review.workflow.ts", "src/utils/aiExecutor.ts"],
    "focus": "security"
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
    }
  ],
  cacheHit: boolean
}
```

**Performance:**
- Parallel execution: ~45% faster than sequential
- Caching: 50%+ cache hit rate (1-hour TTL)
- Typical duration: 10-30 seconds depending on file size

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
    result=$(npx unified-ai-mcp workflow run validate-last-commit)
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
Sequential execution across all three:
1. Qwen: File discovery based on symptoms
2. Gemini: Root cause analysis
3. Rovodev: Practical fix recommendations

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

1. **File Discovery** (if suspected_files empty):
   - Qwen analyzes symptoms and searches codebase
   - Pattern matching and semantic analysis
   - Returns list of likely relevant files

2. **Analysis**:
   - Gemini performs deep analysis of each file
   - Identifies potential root causes
   - Assigns severity levels

3. **Fix Recommendations**:
   - Rovodev provides practical fix suggestions
   - Includes code examples
   - Suggests test cases

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
result=$(node /path/to/unified-ai-mcp-tool/dist/index.js <<EOF
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
      
      - name: Install unified-ai-mcp-tool
        run: npm install -g @jaggerxtrm/unified-ai-mcp-tool
      
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
