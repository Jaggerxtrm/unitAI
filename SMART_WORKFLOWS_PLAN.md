# Smart Workflows Implementation Plan

**Created:** 2025-11-05
**Status:** Planning
**Version:** 1.0
**Supersedes:** None

---

## Executive Summary

This document outlines the implementation plan for adding intelligent multi-step workflows to the Unified AI MCP Tool. These workflows orchestrate multiple AI backends (Qwen, Gemini, Rovodev) to accomplish complex tasks like parallel code review, pre-commit validation, and bug hunting.

**Key Decision:** Use **lazy loading architecture** to minimize token overhead while providing comprehensive workflow functionality.

---

## Problem Statement

### Current State
- 3 powerful AI tools: `ask-qwen`, `ask-gemini`, `ask-rovodev`
- Each tool must be called separately by the user
- Common workflows require manual orchestration
- Token overhead: ~503 tokens per MCP request

### User Pain Points
1. **Manual Orchestration**: Users must manually run parallel analyses with both Gemini and Qwen
2. **Repetitive Prompts**: Same prompt patterns used repeatedly (e.g., "analyze for security, performance, quality")
3. **No Validation Workflows**: No built-in pre-commit validation or session initialization
4. **Context Switching**: Users must remember which AI is best for which task

### Desired State
- Smart workflows that combine multiple AI backends automatically
- Pre-configured prompt templates for common tasks
- Minimal token overhead to maintain efficient context usage
- Easy to add new workflows without affecting existing tools

---

## Proposed Solution: Lazy Loading Architecture

### Core Concept

**One MCP tool** (`smart-workflows`) that routes to **multiple workflow implementations**.

```
Claude MCP Request
       ↓
smart-workflows tool (router)
       ↓
Workflow Registry (dispatcher)
       ↓
Individual Workflow Implementation
       ↓
Orchestrates ask-qwen, ask-gemini, ask-rovodev
```

### Token Overhead Analysis

| Approach | Per-Request Overhead | Implementation Size |
|----------|---------------------|---------------------|
| **Current (3 tools)** | 503 tokens | 1,094 lines |
| **Direct (5 new tools)** | +910 tokens = 1,413 total (+181%) | +1,340 lines |
| **Lazy Loading (1 new tool)** | +250 tokens = 753 total (+50%) | +1,200 lines |
| **Hybrid (2 + 1 bundled)** | +620 tokens = 1,123 total (+123%) | +1,000 lines |

**Decision**: Implement **Lazy Loading** approach for optimal token efficiency.

---

## Architecture Design

### Directory Structure

```
src/
├── tools/
│   ├── ask-qwen.tool.ts              # Existing
│   ├── ask-gemini.tool.ts            # Existing
│   ├── ask-rovodev.tool.ts           # Existing
│   ├── smart-workflows.tool.ts       # NEW: Single MCP tool (router)
│   ├── registry.ts
│   └── index.ts
├── workflows/                         # NEW: Workflow implementations
│   ├── parallel-review.workflow.ts   # NEW
│   ├── pre-commit-validate.workflow.ts # NEW
│   ├── init-session.workflow.ts      # NEW
│   ├── validate-last-commit.workflow.ts # NEW
│   ├── bug-hunt.workflow.ts          # NEW
│   ├── types.ts                       # NEW: Shared types
│   ├── utils.ts                       # NEW: Shared utilities
│   └── index.ts                       # NEW: Workflow registry
└── utils/
    ├── aiExecutor.ts                  # Existing (used by workflows)
    ├── commandExecutor.ts             # Existing
    ├── logger.ts                      # Existing
    └── gitHelper.ts                   # NEW: Git operations helper
```

### Component Responsibilities

#### 1. `smart-workflows.tool.ts` (Router)
- Single MCP tool exposed to Claude
- Minimal schema: workflow name + generic params
- Routes requests to workflow registry
- Handles progress callbacks
- **Size**: ~100 lines, ~250 tokens in MCP schema

#### 2. `workflows/index.ts` (Registry)
- Central registry of all workflows
- Type-safe workflow execution
- Parameter validation via Zod schemas
- **Size**: ~100 lines

#### 3. Individual Workflow Files
- Self-contained workflow implementations
- Own Zod schema for parameters
- Execute function that orchestrates AI tools
- **Size**: ~200-300 lines each

#### 4. `workflows/utils.ts` (Shared Logic)
- Prompt template builders
- Result synthesis functions
- Common workflow patterns
- **Size**: ~150 lines

#### 5. `utils/gitHelper.ts` (Git Operations)
- Git status, log, diff operations
- Staged files detection
- Commit information retrieval
- **Size**: ~100 lines

---

## Workflows to Implement

### Priority Tier 1 (High Impact)

#### 1. **parallel-review**
- **Purpose**: Run Gemini + Qwen analysis in parallel for comprehensive code review
- **Parameters**:
  - `files`: string[] - Files to review
  - `focus`: "architecture" | "security" | "performance" | "quality" | "all"
- **Workflow**:
  1. Build specialized prompts for each AI based on focus area
  2. Execute Gemini and Qwen in parallel with Promise.all()
  3. Aggregate results with synthesis
  4. Return unified report
- **Token Overhead**: Included in 250-token router
- **Implementation**: ~250 lines

#### 2. **pre-commit-validate**
- **Purpose**: Multi-stage validation before committing (from CLAUDE.MD section 9)
- **Parameters**:
  - `depth`: "quick" | "thorough" | "paranoid" (optional, default: "thorough")
- **Workflow**:
  1. Auto-detect staged files via `git diff --cached`
  2. Run parallel Gemini + Qwen review on changes
  3. Check for common issues (secrets, console.logs, TODOs, large files)
  4. Verify tests exist for modified code
  5. Return pass/fail with actionable suggestions
- **Token Overhead**: Included in 250-token router
- **Implementation**: ~300 lines

#### 3. **init-session**
- **Purpose**: Session initialization from CLAUDE.MD section 1
- **Parameters**: None (fully automated)
- **Workflow**:
  1. Run `git log --oneline -5`
  2. Run `git diff HEAD~3..HEAD --stat`
  3. Run `git status && git branch -vv`
  4. Check CLI availability (qwen, gemini, acli)
  5. Return formatted summary
- **Token Overhead**: Included in 250-token router
- **Implementation**: ~250 lines

#### 4. **validate-last-commit**
- **Purpose**: Validate the last git commit (mentioned in README.md)
- **Parameters**:
  - `commit_ref`: string (optional, default: "HEAD")
- **Workflow**:
  1. Get `git show <commit_ref>`
  2. Run parallel Gemini + Qwen analysis
  3. Check for: breaking changes, best practices, issues
  4. Return verdict with suggestions
- **Token Overhead**: Included in 250-token router
- **Implementation**: ~220 lines

#### 5. **bug-hunt**
- **Purpose**: Comprehensive bug analysis workflow (from CLAUDE.MD)
- **Parameters**:
  - `symptoms`: string - Error message or behavior description
  - `suspected_files`: string[] (optional)
- **Workflow**:
  1. Analyze error patterns with Qwen (quick scan)
  2. Deep analysis with Gemini (architectural perspective)
  3. Check for common issues (race conditions, null checks, async errors)
  4. Search for similar patterns in codebase
  5. Suggest fixes with priority ranking
- **Token Overhead**: Included in 250-token router
- **Implementation**: ~320 lines

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Set up architecture and infrastructure

- [ ] Create `workflows/` directory structure
- [ ] Implement `workflows/types.ts` with shared types
- [ ] Implement `workflows/utils.ts` with common functions
- [ ] Implement `utils/gitHelper.ts` for git operations
- [ ] Create `smart-workflows.tool.ts` router with minimal schema
- [ ] Set up workflow registry in `workflows/index.ts`
- [ ] Write unit tests for utilities

**Deliverables**:
- Infrastructure ready for workflow implementations
- ~200 lines of foundation code
- Test coverage for utilities

### Phase 2: Core Workflows (Week 1-2)
**Goal**: Implement the 3 most valuable workflows

- [ ] Implement `parallel-review.workflow.ts`
  - Prompt templates for both AIs
  - Result synthesis logic
  - Focus area routing
- [ ] Implement `init-session.workflow.ts`
  - Git command orchestration
  - CLI availability checks
  - Formatted output
- [ ] Implement `validate-last-commit.workflow.ts`
  - Git show parsing
  - Parallel analysis
  - Verdict generation
- [ ] Register workflows in registry
- [ ] Integration testing with real AI calls
- [ ] Update README.md with workflow documentation

**Deliverables**:
- 3 working workflows (~700 lines)
- Integration tests
- User documentation

### Phase 3: Advanced Workflows (Week 2)
**Goal**: Implement validation and debugging workflows

- [ ] Implement `pre-commit-validate.workflow.ts`
  - Staged file detection
  - Multi-stage validation pipeline
  - Issue detection (secrets, TODOs, etc.)
- [ ] Implement `bug-hunt.workflow.ts`
  - Error pattern analysis
  - Similarity search
  - Priority-based suggestions
- [ ] End-to-end testing with real scenarios
- [ ] Performance optimization
- [ ] Error handling improvements

**Deliverables**:
- 5 complete workflows (~1,200 lines total)
- Comprehensive test coverage
- Performance benchmarks

### Phase 4: Polish & Release (Week 3)
**Goal**: Production readiness

- [ ] Code review and refactoring
- [ ] Documentation completion
  - API documentation
  - Workflow usage examples
  - Best practices guide
- [ ] TypeScript strict mode compliance
- [ ] Error message improvements
- [ ] Logging and debugging enhancements
- [ ] Version bump and changelog
- [ ] NPM publish

**Deliverables**:
- Production-ready release
- Complete documentation
- Published to npm

---

## Technical Specifications

### Workflow Interface

```typescript
// workflows/types.ts
export interface WorkflowDefinition<TParams = any> {
  description: string;
  schema: z.ZodSchema<TParams>;
  execute: (params: TParams, onProgress?: ProgressCallback) => Promise<string>;
}

export type ProgressCallback = (message: string) => void;

export interface WorkflowResult {
  success: boolean;
  output: string;
  metadata?: Record<string, any>;
}
```

### Router Schema

```typescript
// smart-workflows.tool.ts
zodSchema: z.object({
  workflow: z.enum([
    "parallel-review",
    "pre-commit-validate",
    "init-session",
    "validate-last-commit",
    "bug-hunt"
  ]).describe("Workflow to execute"),
  params: z.record(z.any()).optional().describe("Workflow-specific parameters")
})
```

### Example Usage

```json
{
  "workflow": "parallel-review",
  "params": {
    "files": ["src/index.ts", "src/tools/registry.ts"],
    "focus": "security"
  }
}
```

---

## Testing Strategy

### Unit Tests
- Workflow utilities (prompt builders, result synthesis)
- Git helper functions
- Parameter validation

### Integration Tests
- Each workflow with mocked AI responses
- Router dispatch logic
- Error handling paths

### End-to-End Tests
- Real workflow execution (manual/semi-automated)
- Performance benchmarks
- Token usage measurement

### Test Coverage Goals
- Utilities: 90%+
- Workflows: 80%+
- Router: 95%+

---

## Risk Analysis & Mitigation

### Risk 1: Token Overhead Higher Than Expected
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Start with minimal schema (generic params)
- Monitor actual token usage in production
- Can switch to discriminated union if needed (+150 tokens)

### Risk 2: Workflow Complexity Increases Maintenance
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Keep workflows independent and self-contained
- Extract common logic to shared utilities
- Comprehensive documentation for each workflow
- Unit tests for all utilities

### Risk 3: AI Response Variability Breaks Synthesis
**Probability**: Medium
**Impact**: Low
**Mitigation**:
- Design synthesis logic to be resilient to format variations
- Include metadata about which AI provided which insights
- Fallback to raw concatenation if synthesis fails
- Log failures for improvement

### Risk 4: Git Operations Fail in Edge Cases
**Probability**: Low
**Impact**: High
**Mitigation**:
- Extensive error handling in gitHelper
- Graceful degradation (e.g., skip git checks if repo not found)
- Clear error messages to users
- Test on various git states (detached HEAD, merge conflicts, etc.)

---

## Success Metrics

### Performance Metrics
- **Token Overhead**: ≤ 300 tokens (target: 250)
- **Response Time**: < 60s for parallel-review on 3 files
- **Success Rate**: > 95% for workflow execution

### Usage Metrics
- **Adoption Rate**: Track workflow usage vs direct tool usage
- **Most Used Workflows**: Identify which workflows provide most value
- **Error Rate**: < 2% for workflow failures

### Quality Metrics
- **Test Coverage**: > 85% overall
- **Bug Reports**: Track and resolve within 48 hours
- **User Feedback**: Positive feedback on workflow usefulness

---

## Future Enhancements

### Post-MVP Features
1. **Workflow Chaining**: Allow workflows to call other workflows
2. **Custom Workflows**: User-defined workflows via configuration
3. **Caching**: Cache AI responses for repeated analyses
4. **Webhook Integration**: Trigger workflows on git hooks
5. **Report Generation**: Export workflow results as markdown/HTML

### Additional Workflows (Tier 2)
- `find-duplicates`: Code duplication detection
- `refactor-suggest`: Structured refactoring suggestions
- `generate-tests`: Auto-generate test cases
- `architecture-map`: Visualize codebase architecture
- `security-audit`: Comprehensive security review

---

## Appendix

### Token Calculation Methodology
Tokens estimated using: `characters / 4` (rough approximation)
- Measured on actual MCP tool schemas from current implementation
- Conservative estimates to avoid underestimation

### References
- CLAUDE.MD: Workflow patterns and best practices
- README.md: Existing tool documentation
- improvements.md: Token optimization lessons learned
- MCP SDK Documentation: Tool schema specifications

---

## Approval & Sign-off

**Prepared by**: Claude (AI Assistant)
**Review Required**: Repository Owner
**Estimated Effort**: 3 weeks (1 developer)
**Priority**: High (adds significant value with minimal overhead)

**Decision**: Awaiting approval to proceed with implementation.
