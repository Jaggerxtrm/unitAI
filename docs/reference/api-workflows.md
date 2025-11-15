# API Reference: Workflows

**Version:** 1.1  
**Last Updated:** 2025-11-14  
**Status:** Production Ready

Complete API reference for all 6 smart workflows. For usage guide and examples, see [Workflows Guide](../WORKFLOWS.md).

---

## Common Parameters

All workflows support these common parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| autonomyLevel | string | No | read-only | Permission level: read-only, low, medium, high |

---

## init-session

Initialize development session with git analysis and AI synthesis.

**Backends:** Gemini (primary), Qwen (fallback)

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| autonomyLevel | string | No | read-only | Permission level |

### Returns

```typescript
{
  success: boolean,
  report: string,           // Markdown session report
  metadata: {
    isGitRepository: boolean,
    commitsAnalyzed: number,
    aiAnalysisCompleted: boolean,
    memoryQueriesGenerated: number,
    sessionStartTime: string,
    timezone: string
  }
}
```

### Example

```json
{
  "workflow": "init-session",
  "params": {}
}
```

---

## pre-commit-validate

Validate staged changes with configurable depth levels.

**Backends:** All 3 (Qwen, Gemini, Rovodev) in parallel

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| depth | string | No | thorough | Validation depth: quick (5-10s), thorough (20-30s), paranoid (60-90s) |
| autonomyLevel | string | No | read-only | Permission level |

### Returns

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

### Example

```json
{
  "workflow": "pre-commit-validate",
  "params": {
    "depth": "thorough"
  }
}
```

---

## parallel-review

Multi-perspective code review with parallel AI backends.

**Backends:** Gemini + Rovodev (parallel)

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| files | string[] | Yes | - | File paths to review |
| focus | string | No | all | Focus area: all, security, performance, architecture |
| autonomyLevel | string | No | read-only | Permission level |

### Returns

```typescript
{
  success: boolean,
  synthesis: string,        // Combined analysis
  analyses: Array<{
    backend: string,
    output: string,
    success: boolean,
    duration: number
  }>,
  cacheHit: boolean
}
```

### Example

```json
{
  "workflow": "parallel-review",
  "params": {
    "files": ["src/workflows/parallel-review.workflow.ts"],
    "focus": "security"
  }
}
```

---

## validate-last-commit

Validate most recent commit for quality and security.

**Backends:** Gemini + Qwen (parallel)

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| commit_ref | string | No | HEAD | Git commit reference |
| autonomyLevel | string | No | read-only | Permission level |

### Returns

```typescript
{
  success: boolean,
  validation: string,       // Validation report
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

### Example

```json
{
  "workflow": "validate-last-commit",
  "params": {
    "commit_ref": "HEAD"
  }
}
```

---

## bug-hunt

AI-powered bug investigation with root cause analysis.

**Backends:** All 3 (sequential: Qwen → Gemini → Rovodev)

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| symptoms | string | Yes | - | Detailed bug symptom description |
| suspected_files | string[] | No | [] | Optional suspected files |
| autonomyLevel | string | No | read-only | Permission level |

### Returns

```typescript
{
  success: boolean,
  report: string,           // Bug hunt report
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

### Example

```json
{
  "workflow": "bug-hunt",
  "params": {
    "symptoms": "Users getting 500 error when uploading files larger than 10MB",
    "suspected_files": ["src/api/upload.ts"]
  }
}
```

---

## feature-design

End-to-end feature planning with multi-agent collaboration.

**Backends:** All 3 via agents (ArchitectAgent, ImplementerAgent, TesterAgent)

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| featureDescription | string | Yes | - | Detailed feature description |
| targetFiles | string[] | No | [] | Files to be modified |
| includeTests | boolean | No | true | Generate test strategy |
| includeAPI | boolean | No | false | Design API endpoints |
| includeDB | boolean | No | false | Design database schema |
| includeUI | boolean | No | false | Design UI components |
| autonomyLevel | string | No | read-only | Permission level |

### Returns

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
  synthesis: string,          // Combined plan
  estimatedComplexity: "low" | "medium" | "high",
  suggestedApproach: string
}
```

### Example

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

---

## Workflow Comparison

| Workflow | Backends | Parallel | Typical Duration | Cache | Primary Use Case |
|----------|----------|----------|------------------|-------|------------------|
| init-session | Gemini + Qwen | Sequential | 15-30s | Yes | Session start |
| pre-commit-validate | All 3 | Parallel | 5-90s | No | Pre-commit gates |
| parallel-review | Gemini + Rovodev | Yes | 10-30s | Yes | Code review |
| validate-last-commit | Gemini + Qwen | Parallel | 15-25s | Yes | Post-commit validation |
| bug-hunt | All 3 | Sequential | 30-60s | No | Bug investigation |
| feature-design | All 3 (agents) | Parallel | 45-90s | Yes | Feature planning |

---

## Error Handling

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

### Error Types

| Type | Description | Common Causes |
|------|-------------|---------------|
| PERMISSION | Operation not allowed | Autonomy level too low |
| NOT_FOUND | Resource not found | File/commit doesn't exist |
| VALIDATION | Invalid parameters | Missing required params |
| BACKEND | AI backend failure | CLI not installed, network issue |
| TIMEOUT | Operation timeout | Large files, slow network |

---

## See Also

- [Workflows Guide](../WORKFLOWS.md) - Usage guide with examples
- [Base Tools API](./api-tools.md) - ask-gemini, ask-qwen, ask-rovodev
- [Error Codes](./error-codes.md) - Complete error reference
