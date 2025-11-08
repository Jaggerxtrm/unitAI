# Unified AI MCP Tool - API Reference

## Overview

This document provides comprehensive API documentation for all workflows available in the unified-ai-mcp-tool. Each workflow can be invoked through the MCP `smart-workflows` tool.

## Table of Contents

- [Common Concepts](#common-concepts)
- [Workflow Invocation](#workflow-invocation)
- [Workflows](#workflows)
  - [init-session](#init-session)
  - [parallel-review](#parallel-review)
  - [validate-last-commit](#validate-last-commit)
  - [pre-commit-validate](#pre-commit-validate)
  - [bug-hunt](#bug-hunt)
  - [feature-design](#feature-design)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## Common Concepts

### Autonomy Levels

All workflows support autonomy levels that control what operations are permitted:

- `read-only`: Only read operations allowed (default)
- `low`: Read + write files
- `medium`: Read + write + git commit
- `high`: All operations including git push

### Backend Selection

Workflows use different AI backends based on task requirements:

- **Qwen**: Fast, efficient for quick analysis and pattern matching
- **Gemini**: Best for architectural thinking and deep analysis
- **Rovodev**: Most reliable for code generation and practical fixes

### Progress Callbacks

All workflows support optional progress callbacks for real-time status updates:

```typescript
onProgress?: (message: string) => void
```

---

## Workflow Invocation

### MCP Tool Call

All workflows are invoked through the `smart-workflows` MCP tool:

```json
{
  "workflow": "workflow-name",
  "params": {
    // workflow-specific parameters
  }
}
```

### TypeScript Example

```typescript
import { executeWorkflow } from './src/workflows/index.js';

const result = await executeWorkflow(
  'parallel-review',
  {
    files: ['src/index.ts', 'src/utils.ts'],
    focus: 'security'
  },
  (progress) => console.log(progress)
);
```

---

## Workflows

### init-session

**Purpose**: Initialize a development session by analyzing git repository state and generating relevant context.

**Backends**: Gemini (primary), Qwen (fallback)

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `autonomyLevel` | `AutonomyLevel` | No | `read-only` | Permission level for operations |

#### Returns

```typescript
{
  success: boolean;
  report: string;  // Markdown-formatted session report
  metadata: {
    isGitRepository: boolean;
    commitsAnalyzed: number;
    aiAnalysisCompleted: boolean;
    memoryQueriesGenerated: number;
    sessionStartTime: string;
    timezone: string;
  }
}
```

#### Example

**MCP Call**:
```json
{
  "workflow": "init-session",
  "params": {}
}
```

**Response**: Comprehensive markdown report including:
- Repository information (branch, staged/modified files)
- Recent commits (last 10)
- AI analysis of recent work
- Suggested memory search queries
- Repository status and branch information
- CLI availability check

#### Use Cases

- Start of coding session to get context
- After pulling latest changes
- When switching branches
- Team onboarding

#### Error Cases

- **Not a Git repository**: Throws error if current directory is not a git repo
- **Git command failure**: Returns error details in report
- **AI backend unavailable**: Falls back to Qwen, then provides basic git info only

---

### parallel-review

**Purpose**: Perform multi-perspective code review using parallel AI backends for comprehensive analysis.

**Backends**: Gemini + Rovodev (parallel execution)

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `files` | `string[]` | Yes | - | List of file paths to review |
| `focus` | `enum` | No | `"all"` | Review focus area |
| `autonomyLevel` | `AutonomyLevel` | No | `read-only` | Permission level |

**Focus Options**:
- `"all"`: Comprehensive review (architecture, code quality, security)
- `"security"`: Security-focused review only
- `"performance"`: Performance optimization focus
- `"architecture"`: Architectural patterns and design

#### Returns

```typescript
{
  success: boolean;
  synthesis: string;  // Markdown synthesis of all analyses
  analyses: Array<{
    backend: string;
    output: string;
    success: boolean;
    duration: number;
  }>;
  cacheHit: boolean;
}
```

#### Example

**MCP Call**:
```json
{
  "workflow": "parallel-review",
  "params": {
    "files": ["src/workflows/parallel-review.workflow.ts", "src/utils/aiExecutor.ts"],
    "focus": "security"
  }
}
```

**Response**: Synthesized review combining insights from both Gemini (architectural perspective) and Rovodev (practical implementation perspective).

#### Performance

- **Parallel execution**: ~45% faster than sequential
- **Caching**: 50%+ cache hit rate (TTL: 1 hour)
- **Typical duration**: 10-30s depending on file size

#### Use Cases

- Pre-pull request reviews
- Code quality audits
- Security assessments
- Architecture validation

#### Error Cases

- **File not found**: Reports which files are missing
- **Permission denied**: If files are not readable with current autonomy level
- **Backend failure**: If one backend fails, continues with successful one

---

### validate-last-commit

**Purpose**: Validate the most recent git commit for quality, security, and breaking changes.

**Backends**: Gemini (code quality) + Qwen (quick scan)

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `commit_ref` | `string` | No | `"HEAD"` | Git commit reference to validate |
| `autonomyLevel` | `AutonomyLevel` | No | `read-only` | Permission level |

#### Returns

```typescript
{
  success: boolean;
  validation: string;  // Markdown validation report
  commit: {
    hash: string;
    author: string;
    message: string;
    files: string[];
    diff: string;
  };
  verdict: {
    pass: boolean;
    warnings: string[];
    errors: string[];
  }
}
```

#### Example

**MCP Call**:
```json
{
  "workflow": "validate-last-commit",
  "params": {
    "commit_ref": "HEAD~1"
  }
}
```

**Response**: Detailed validation including:
- Commit metadata
- Code quality assessment
- Security concerns
- Breaking change detection
- Recommendations

#### Use Cases

- Post-commit validation
- CI/CD quality gates
- Pre-push checks
- Code review automation

#### Error Cases

- **Invalid commit ref**: Throws error if commit doesn't exist
- **Not a git repository**: Requires git repository
- **Merge commit**: Handles merge commits with multiple diffs

---

### pre-commit-validate

**Purpose**: Validate staged changes before committing with configurable depth levels.

**Backends**: All 3 (Qwen for secrets, Gemini for quality, Rovodev for breaking changes)

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `depth` | `enum` | No | `"thorough"` | Validation depth level |
| `autonomyLevel` | `AutonomyLevel` | No | `read-only` | Permission level |

**Depth Levels**:
- `"quick"`: Fast security scan only (~5-10s)
- `"thorough"`: Security + code quality + breaking changes (~20-30s)
- `"paranoid"`: Complete analysis with all backends + comprehensive checks (~60-90s)

#### Returns

```typescript
{
  success: boolean;
  verdict: {
    level: "PASS" | "WARN" | "FAIL";
    message: string;
    details: {
      security: { pass: boolean; issues: string[] };
      quality: { pass: boolean; issues: string[] };
      breaking: { pass: boolean; issues: string[] };
    }
  };
  stagedDiff: string;
  duration: number;
}
```

#### Example

**MCP Call**:
```json
{
  "workflow": "pre-commit-validate",
  "params": {
    "depth": "thorough"
  }
}
```

**Response**:
- **PASS**: No issues found, safe to commit
- **WARN**: Minor issues detected, review recommended
- **FAIL**: Critical issues found, do not commit

#### Performance by Depth

| Depth | Backends | Typical Duration | Use Case |
|-------|----------|------------------|----------|
| quick | Qwen only | 5-10s | Rapid development cycles |
| thorough | All 3 parallel | 20-30s | Standard pre-commit (recommended) |
| paranoid | All 3 + extended checks | 60-90s | Critical code, production releases |

#### Use Cases

- Git pre-commit hook
- Manual pre-commit validation
- CI/CD quality gates
- Team code standards enforcement

#### Error Cases

- **No staged files**: Returns empty validation (PASS)
- **Backend timeout**: Fails gracefully, continues with available backends

---

### bug-hunt

**Purpose**: AI-powered bug discovery and analysis with automatic file discovery and root cause analysis.

**Backends**: Qwen (file discovery), Gemini (root cause), Rovodev (practical fixes)

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `symptoms` | `string` | Yes | - | Description of the bug symptoms |
| `suspected_files` | `string[]` | No | `[]` | Optional list of suspected files |
| `autonomyLevel` | `AutonomyLevel` | No | `read-only` | Permission level |

#### Returns

```typescript
{
  success: boolean;
  report: string;  // Markdown bug hunt report
  findings: {
    targetFiles: string[];        // Files analyzed
    problematicFiles: string[];   // Files with issues
    rootCause: string;            // Root cause analysis
    recommendations: string[];    // Fix recommendations
    relatedFiles: string[];       // Related files that may be affected
  };
  analyses: Array<{
    file: string;
    analysis: string;
    severity: "low" | "medium" | "high" | "critical";
  }>;
}
```

#### Example

**MCP Call**:
```json
{
  "workflow": "bug-hunt",
  "params": {
    "symptoms": "Users getting 500 error when uploading files larger than 10MB",
    "suspected_files": ["src/api/upload.ts"]
  }
}
```

**Response**: Comprehensive bug analysis including:
1. File discovery (if no suspected files provided)
2. Per-file analysis with severity
3. Root cause identification
4. Practical fix recommendations
5. Related file impact analysis

#### Workflow Steps

1. **File Discovery** (if `suspected_files` empty):
   - Uses Qwen to find relevant files based on symptoms
   - Pattern matching and semantic search

2. **Analysis**:
   - Gemini analyzes each file for root cause
   - Rovodev provides practical fix recommendations

3. **Impact Analysis**:
   - Finds related files that may be affected
   - Suggests comprehensive fix approach

#### Use Cases

- Production bug investigation
- Hard-to-reproduce issues
- Complex multi-file bugs
- Root cause analysis

#### Error Cases

- **No files found**: If file discovery finds no relevant files
- **Analysis timeout**: Returns partial analysis with timeout warning
- **Syntax errors**: May misinterpret code with syntax errors

---

### feature-design

**Purpose**: Design new features with architectural planning and implementation guidance using multi-agent collaboration.

**Backends**: All 3 (ArchitectAgent on Gemini, ImplementerAgent on Rovodev, TesterAgent on Qwen)

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `featureDescription` | `string` | Yes | - | Detailed feature description |
| `targetFiles` | `string[]` | No | `[]` | Files that will be modified |
| `includeTests` | `boolean` | No | `true` | Generate test strategy |
| `includeAPI` | `boolean` | No | `false` | Design API endpoints |
| `includeDB` | `boolean` | No | `false` | Design database schema |
| `includeUI` | `boolean` | No | `false` | Design UI components |
| `autonomyLevel` | `AutonomyLevel` | No | `read-only` | Permission level |

#### Returns

```typescript
{
  success: boolean;
  design: {
    architecture: string;      // Architectural design (Gemini)
    implementation: string;    // Implementation plan (Rovodev)
    testing: string;          // Test strategy (Qwen)
    api?: string;             // API design (if includeAPI)
    database?: string;        // DB schema (if includeDB)
    ui?: string;              // UI design (if includeUI)
  };
  synthesis: string;          // Combined comprehensive plan
  estimatedComplexity: "low" | "medium" | "high";
  suggestedApproach: string;
}
```

#### Example

**MCP Call**:
```json
{
  "workflow": "feature-design",
  "params": {
    "featureDescription": "Add real-time collaboration feature allowing multiple users to edit documents simultaneously",
    "targetFiles": ["src/editor/EditorComponent.tsx", "src/api/collaboration.ts"],
    "includeAPI": true,
    "includeDB": true,
    "includeTests": true
  }
}
```

**Response**: Comprehensive feature design including:
- **Architecture** (Gemini): High-level design, patterns, trade-offs
- **Implementation** (Rovodev): Step-by-step implementation guide, code examples
- **Testing** (Qwen): Test strategy, test cases, coverage goals
- **API Design**: Endpoints, request/response schemas, authentication
- **Database**: Schema changes, migrations, indexes
- **Synthesis**: Combined actionable plan

#### Agent Collaboration

1. **ArchitectAgent** (Gemini):
   - System design
   - Technology choices
   - Architectural patterns
   - Scalability considerations

2. **ImplementerAgent** (Rovodev):
   - Detailed implementation steps
   - Code structure
   - Error handling
   - Performance optimization

3. **TesterAgent** (Qwen):
   - Test strategy
   - Test cases (unit, integration, E2E)
   - Edge cases
   - Quality metrics

#### Use Cases

- New feature planning
- Refactoring strategies
- Architecture validation
- Implementation roadmaps

#### Performance

- **Typical duration**: 45-90s
- **Complexity**: High (3 AI agents + synthesis)
- **Caching**: Effective for iterative design

#### Error Cases

- **Vague description**: May request more details
- **Conflicting requirements**: Highlights conflicts in synthesis
- **Backend unavailable**: Falls back to available agents

---

## Error Handling

### Common Error Types

All workflows return standardized error responses:

```typescript
{
  success: false,
  error: {
    type: "PERMISSION" | "NOT_FOUND" | "VALIDATION" | "BACKEND" | "TIMEOUT",
    message: string,
    details?: any
  }
}
```

### Error Recovery

- **Automatic retries**: Transient errors (network, timeout) → 3 retries with exponential backoff
- **Fallback backends**: Primary backend failure → fallback to alternative
- **Circuit breaker**: Repeated backend failures → temporary disable, prevent cascading failures
- **Graceful degradation**: Partial results returned when possible

### Logging

All errors are logged to structured logs:

```bash
logs/
├── errors.log           # All errors
├── workflow-executions.log  # Workflow-level events
└── ai-backend-calls.log    # Backend interaction errors
```

---

## Best Practices

### 1. Workflow Selection

- **Quick feedback**: Use `init-session` or `validate-last-commit`
- **Comprehensive review**: Use `parallel-review` with thorough depth
- **Pre-commit**: Use `pre-commit-validate` in git hooks
- **Bug investigation**: Use `bug-hunt` with detailed symptoms
- **New features**: Use `feature-design` before implementation

### 2. Parameter Optimization

- **File selection**: Limit `files` parameter to relevant files only (max 10-15 files)
- **Depth levels**: Use `quick` for rapid iterations, `thorough` for standard work, `paranoid` for releases
- **Focus areas**: Specify `focus` to reduce analysis scope and improve speed

### 3. Performance

- **Caching**: Workflows cache results for 1 hour (TTL configurable)
- **Parallel execution**: Use workflows that support parallel backends when possible
- **Incremental analysis**: Analyze small changesets frequently rather than large batches

### 4. Autonomy Levels

- **Development**: `read-only` or `low` for most workflows
- **CI/CD**: `medium` for automated commit workflows
- **Release automation**: `high` only with explicit user approval

### 5. Error Handling

- Always check `success` field in response
- Log failed workflows for debugging
- Use retry logic for transient failures
- Fall back to manual review if workflows fail

### 6. Integration

**Git Hooks**:
```bash
# .git/hooks/pre-commit
npx unified-ai-mcp workflow run pre-commit-validate --depth thorough
```

**CI/CD**:
```yaml
# .github/workflows/validate.yml
- name: Validate Commit
  run: npx unified-ai-mcp workflow run validate-last-commit
```

**CLI Usage**:
```bash
# Quick session init
unified-ai workflow run init-session

# Review specific files
unified-ai workflow run parallel-review --files "src/**/*.ts" --focus security

# Design new feature
unified-ai workflow run feature-design --feature "Add user authentication"
```

---

## Appendix

### Workflow Comparison Matrix

| Workflow | Backends | Parallel | Caching | Typical Duration | Use Case |
|----------|----------|----------|---------|------------------|----------|
| init-session | Gemini+Qwen | Sequential | Yes | 15-30s | Session start |
| parallel-review | Gemini+Rovodev | Yes | Yes | 10-30s | Code review |
| validate-last-commit | Gemini+Qwen | Parallel | Yes | 15-25s | Post-commit |
| pre-commit-validate | All 3 | Parallel | No | 5-90s | Pre-commit |
| bug-hunt | All 3 | Sequential | No | 30-60s | Debugging |
| feature-design | All 3 (agents) | Parallel | Yes | 45-90s | Planning |

### Version History

- **v1.1.2**: Phase 1 complete - all 6 workflows operational
- **v1.0.0**: Initial release with 3 workflows
- **v0.3.0**: Added workflow caching and model selection

---

**Last Updated**: 2025-11-08
**API Version**: 1.1.2
**Status**: Production Ready
