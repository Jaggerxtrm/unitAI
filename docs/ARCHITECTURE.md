# Architecture Overview

**Version:** 3.0  
**Last Updated:** 2025-11-14  
**Status:** Phase 1 Completed

This document provides a comprehensive overview of the unified-ai-mcp-tool architecture, implementation status, and technical decisions.

---

## Table of Contents

- [System Design](#system-design)
- [Implementation Status](#implementation-status)
- [Core Components](#core-components)
- [Technical Decisions](#technical-decisions)
- [Infrastructure](#infrastructure)

---

## System Design

### Overview

The unified-ai-mcp-tool is a Model Context Protocol server that orchestrates multiple AI backends (Qwen, Gemini, Rovodev) through intelligent workflows. The system is designed with progressive autonomy in mind, starting from read-only operations and gradually enabling more autonomous behaviors.

### Architecture Layers

The system is organized in three distinct layers:

**Layer 1: Foundation**
- MCP Server (stdio transport)
- Permission Management System
- Structured Logging and Audit Trail
- Error Recovery Framework
- Workflow Context Memory

**Layer 2: Orchestration**
- AI Executor (multi-backend support)
- Workflow Engine (6 production workflows)
- Agent System (Architect, Implementer, Tester)
- Model Selection Logic
- Caching System

**Layer 3: Intelligence**
- Token-Aware Decision Making
- Pattern Detection
- Workflow Memory and Learning
- Adaptive Backend Selection

### Permission System

The system implements a robust permission model with two orthogonal axes:

**Autonomy Levels:**
- `read-only`: Only read operations allowed (default)
- `low`: Read and write files
- `medium`: Read, write, and git commit
- `high`: All operations including git push

**Operation Types:**
- `read`: Reading files, listing directories
- `write`: Creating/modifying files
- `git-commit`: Committing changes to git
- `git-push`: Pushing to remote repositories
- `ai-query`: Querying AI backends
- `shell-exec`: Executing shell commands

Each workflow receives an autonomy level and validates operations against the permission matrix before execution.

---

## Implementation Status

### Phase 0: Foundation Infrastructure - COMPLETED

**Completion Date:** 2025-11-08  
**Status:** All systems operational

Core infrastructure components:

**Testing Infrastructure**
- Test framework: Vitest
- Tests passing: 180/208 (86.5%)
- Coverage: Core utilities at 100%
- Integration tests: All 6 workflows validated

**Structured Logging**
- 6 log categories active
- Rotation policy: daily
- Log files:
  - `logs/workflow-executions.log`
  - `logs/ai-backend-calls.log`
  - `logs/permission-checks.log`
  - `logs/errors.log`
  - `logs/git-operations.log`
  - `logs/mcp-server.log`

**Audit Trail**
- Database: SQLite (`data/audit.sqlite`)
- Entries: 134+ logged decisions
- Retention: 90 days
- Queryable via structured interface

**Error Recovery**
- Retry logic: 3 attempts with exponential backoff
- Circuit breaker: Temporary disable on repeated failures
- Fallback backends: Gemini → Qwen fallback
- Graceful degradation: Partial results when possible

**Workflow Context Memory**
- Database: SQLite (`data/openmemory.sqlite`)
- Test coverage: 42/42 tests passing (100%)
- Features: Pattern learning, decision persistence

### Phase 1: Core Workflows - COMPLETED

**Completion Date:** 2025-11-09  
**Status:** 6/6 workflows operational and tested

| Workflow | Status | Backends | Description |
|----------|--------|----------|-------------|
| init-session | OPERATIONAL | Gemini + Rovodev | Git analysis with AI synthesis |
| pre-commit-validate | OPERATIONAL | All 3 | Multi-depth validation (quick/thorough/paranoid) |
| parallel-review | OPERATIONAL | Gemini + Rovodev | Parallel code review |
| validate-last-commit | OPERATIONAL | Gemini + Qwen | Post-commit validation |
| bug-hunt | OPERATIONAL | All 3 | Root cause analysis |
| feature-design | OPERATIONAL | All 3 (agents) | Multi-agent feature design |

**Enhancements Implemented:**
- Workflow caching system (1-hour TTL)
- Smart model selection based on task type
- Progress reporting for long-running operations
- Parallel execution where applicable

### Phase 2: External Integrations - OPTIONAL

**Status:** Not yet started  
**Timeline:** 4-6 weeks (if needed)

Planned integrations with external MCP servers:
- Serena: Symbol-level code navigation
- claude-context: Semantic code search
- context7: API documentation lookup
- deepwiki: Repository analysis

### Phase 3: Learning and Adaptation - ADVANCED

**Status:** Foundation in place  
**Timeline:** 6-8 weeks

Workflow memory system MVP implemented. Advanced features planned:
- Adaptive backend selection based on historical performance
- Pattern recognition for workflow triggers
- Success rate tracking per workflow type

---

## Core Components

### Workflows (6)

The system provides six production-ready workflows:

**1. init-session**
- Purpose: Initialize development session with context
- Backends: Gemini (primary), Qwen (fallback)
- Output: Git analysis, recent work summary, suggested queries

**2. pre-commit-validate**
- Purpose: Validate staged changes before commit
- Backends: All three (parallel)
- Depth levels: quick (10s), thorough (30s), paranoid (90s)
- Output: PASS/WARN/FAIL verdict with detailed issues

**3. parallel-review**
- Purpose: Multi-perspective code review
- Backends: Gemini + Rovodev (parallel)
- Focus areas: all, security, performance, architecture
- Output: Synthesized review from both perspectives

**4. validate-last-commit**
- Purpose: Post-commit quality validation
- Backends: Gemini + Qwen (parallel)
- Output: Validation report with warnings and errors

**5. bug-hunt**
- Purpose: AI-powered bug investigation
- Backends: All three (sequential)
- Process: File discovery → Analysis → Root cause → Fix recommendations
- Output: Comprehensive bug report with severity levels

**6. feature-design**
- Purpose: End-to-end feature planning
- Backends: All three via agents
- Phases: Architecture (Architect) → Implementation (Implementer) → Testing (Tester)
- Output: Complete design document with implementation plan

### Agents (3)

The agent system provides specialized domain-focused interfaces:

**ArchitectAgent**
- Backend: Gemini (no fallback)
- Specialization: High-level system design, architecture patterns
- Focus areas: Design, refactoring, optimization, security, scalability
- Output: Analysis, recommendations, implementation plan, risk assessment

**ImplementerAgent**
- Backend: Rovodev (fallback: Gemini)
- Specialization: Production-ready code generation
- Approaches: Incremental, full rewrite, minimal changes
- Output: Code snippets, file changes, test suggestions, next steps

**TesterAgent**
- Backend: Qwen (no fallback)
- Specialization: Fast test generation and validation
- Test types: Unit, integration, end-to-end
- Output: Test code, coverage estimates, recommendations

### Utilities and Infrastructure

**Token Estimator**
- File: `src/utils/tokenEstimator.ts`
- Features: Token counting, savings estimation, metrics collection
- Database: `data/token-metrics.sqlite`

**AI Executor**
- File: `src/utils/aiExecutor.ts`
- Backends: Qwen CLI, Gemini CLI, Rovodev CLI
- Features: Retry logic, timeout handling, output parsing

**Git Helper**
- File: `src/utils/gitHelper.ts`
- Operations: Status, diff, commit info, staged files
- Integration: Full git repository support

**Permission Manager**
- File: `src/utils/permissionManager.ts`
- Features: Autonomy level validation, operation type checking
- Test coverage: 100%

**Structured Logger**
- File: `src/utils/structuredLogger.ts`
- Formats: JSON for machine parsing, text for human reading
- Rotation: Daily with compression

**Audit Trail**
- File: `src/utils/auditTrail.ts`
- Database: SQLite with retention policy
- Queryable: By date, operation, user, workflow

---

## Technical Decisions

### Decision: Multi-Backend Orchestration

**Rationale:** Different AI models excel at different tasks. Qwen is fast for code generation, Gemini excels at deep reasoning, and Rovodev produces production-ready code.

**Implementation:** Each workflow explicitly chooses backends based on task requirements. Parallel execution when perspectives are complementary (e.g., Gemini + Qwen for validation).

**Tradeoff:** Increased complexity and dependency on multiple CLI tools vs. better results and specialization.

### Decision: Permission System with Autonomy Levels

**Rationale:** Enable progressive autonomy while maintaining safety. Start with read-only, gradually enable write/commit/push as trust increases.

**Implementation:** Two-axis system (autonomy level × operation type) with explicit validation before each operation.

**Tradeoff:** Some boilerplate for permission checks vs. clear safety boundaries and audit trail.

### Decision: SQLite for Persistence

**Rationale:** Simple, serverless, embedded database suitable for single-user tool. No external dependencies.

**Implementation:** Three databases: audit trail, token metrics, workflow memory.

**Tradeoff:** Single-user limitation vs. simplicity and zero configuration.

### Decision: Workflow Caching with TTL

**Rationale:** Avoid redundant AI calls for repeated operations (e.g., reviewing same file twice).

**Implementation:** In-memory cache with 1-hour TTL, key based on workflow + params hash.

**Tradeoff:** Stale results if code changes within TTL vs. significant token savings (50%+ cache hit rate).

### Decision: Token-Aware Suggestion System

**Rationale:** Reduce token consumption by suggesting more efficient alternatives (e.g., Serena for symbol-level navigation vs. reading entire files).

**Implementation:** Pre-tool-use hook that estimates tokens and suggests alternatives. Non-blocking, suggestive approach.

**Tradeoff:** Additional complexity vs. 75-80% token savings on code file operations.

### Decision: Agent Template Method Pattern

**Rationale:** Consistent execution flow across all agents while allowing specialization.

**Implementation:** BaseAgent abstract class with template method, specialized agents override specific steps.

**Tradeoff:** Some inheritance complexity vs. guaranteed consistency and reusability.

---

## Infrastructure

### Deployment

**MCP Server:**
- Transport: stdio (standard MCP protocol)
- Entry point: `dist/index.js`
- Configuration: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Build System:**
- TypeScript compiler: tsc
- Output: `dist/` directory
- Source maps: Enabled for debugging

**Dependencies:**
- Runtime: Node.js 18+
- Required CLIs: qwen, acli (Rovodev), gemini
- Optional: git (for workflow features)

### Monitoring

**Structured Logs:**
- Location: `logs/` directory
- Format: JSON (machine-readable) + text (human-readable)
- Rotation: Daily with 7-day retention

**Audit Trail:**
- Database: `data/audit.sqlite`
- Query interface: `src/utils/auditTrail.ts`
- Retention: 90 days

**Token Metrics:**
- Database: `data/token-metrics.sqlite`
- CLI viewer: `npm run view-metrics`
- Metrics: Suggestions, follow rate, estimated savings

### Testing

**Test Framework:**
- Tool: Vitest
- Coverage: 86.5% overall
- Types: Unit, integration, end-to-end

**Test Execution:**
```bash
npm test                  # All tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

**Test Utilities:**
- Mock AI backends: `tests/utils/mockAI.ts`
- Mock Git commands: `tests/utils/mockGit.ts`
- Test helpers: `tests/utils/testHelpers.ts`

---

## Future Roadmap

### Short-term (Next 3 months)

- Improve test coverage to 95%
- Add more workflow patterns based on user feedback
- Optimize token usage with better caching strategies

### Medium-term (3-6 months)

- External MCP integrations (Serena, claude-context)
- Web UI for metrics and monitoring
- Enhanced learning system with pattern recognition

### Long-term (6-12 months)

- Adaptive backend selection based on historical performance
- Support for additional AI backends
- Plugin system for custom workflows

---

## References

- [Workflows Guide](./WORKFLOWS.md) - Detailed workflow documentation
- [API Reference](./reference/api-workflows.md) - Full API specification
- [Integration Guide](./INTEGRATIONS.md) - MCP servers, skills, hooks
- [Token Metrics](./TOKEN_METRICS.md) - Token optimization documentation
