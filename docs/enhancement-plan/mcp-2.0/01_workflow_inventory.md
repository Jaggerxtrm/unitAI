# Workflow Inventory

This document provides a comprehensive inventory of all workflows implemented in the `unified-ai-mcp-tool` system.

## Implemented Workflows

Based on `src/workflows/` and `src/workflows/index.ts`.

### 1. parallel-review
- **File:** `src/workflows/parallel-review.workflow.ts`
- **Description:** Multi-perspective code review with parallel AI backends (Gemini + Cursor + Droid).
- **Parameters:**
  - `files` (string[], required): Files to analyze.
  - `focus` (enum, default: "all"): "architecture" | "security" | "performance" | "quality" | "all".
  - `strategy` (enum, default: "standard"): "standard" | "double-check".
  - `backendOverrides` (string[], optional): Manual backend selection.
  - `attachments` (string[], optional): Files to attach.
  - `autonomyLevel` (enum, optional): "read-only" | "low" | "medium" | "high".
- **Use Cases:** Pre-merge code review, security audit, comprehensive quality check.
- **Documentation:** `docs/reference/api-workflows.md`

### 2. pre-commit-validate
- **File:** `src/workflows/pre-commit-validate.workflow.ts`
- **Description:** Validate staged changes with configurable depth levels.
- **Parameters:**
  - `depth` (enum, default: "thorough"): "quick" | "thorough" | "paranoid".
  - `autonomyLevel` (enum, optional): Permission level.
- **Use Cases:** Pre-commit hook, quick sanity check before pushing.
- **Documentation:** `docs/reference/api-workflows.md`

### 3. init-session
- **File:** `src/workflows/init-session.workflow.ts`
- **Description:** Initialize development session with git analysis and AI synthesis.
- **Parameters:**
  - `autonomyLevel` (enum, optional): Permission level.
  - `commitCount` (number, optional): Number of commits to analyze.
- **Use Cases:** Starting a new work session, getting up to speed with recent changes.
- **Documentation:** `docs/reference/api-workflows.md`

### 4. validate-last-commit
- **File:** `src/workflows/validate-last-commit.workflow.ts`
- **Description:** Validate most recent commit for quality and security.
- **Parameters:**
  - `commit_ref` (string, default: "HEAD"): Git commit reference.
  - `autonomyLevel` (enum, optional): Permission level.
- **Use Cases:** Post-commit validation, CI pipeline check.
- **Documentation:** `docs/reference/api-workflows.md`

### 5. feature-design
- **File:** `src/workflows/feature-design.workflow.ts`
- **Description:** End-to-end feature planning with multi-agent collaboration.
- **Parameters:**
  - `featureDescription` (string, required): Description of the feature.
  - `targetFiles` (string[], required): Files to create/modify.
  - `context` (string, optional): Additional context.
  - `architecturalFocus` (enum, default: "design"): Focus area.
  - `implementationApproach` (enum, default: "incremental"): "incremental" | "full-rewrite" | "minimal".
  - `testType` (enum, default: "unit"): "unit" | "integration" | "e2e".
- **Use Cases:** Planning complex features, architectural design.
- **Documentation:** `docs/reference/api-workflows.md`

### 6. bug-hunt
- **File:** `src/workflows/bug-hunt.workflow.ts`
- **Description:** AI-powered bug investigation with root cause analysis.
- **Parameters:**
  - `symptoms` (string, required): Bug symptoms.
  - `suspected_files` (string[], optional): Suspected files.
  - `attachments` (string[], optional): Logs/dumps.
  - `backendOverrides` (string[], optional): Manual backend selection.
  - `autonomyLevel` (enum, optional): Permission level.
- **Use Cases:** Debugging complex issues, root cause analysis.
- **Documentation:** `docs/reference/api-workflows.md`

### 7. triangulated-review
- **File:** `src/workflows/triangulated-review.workflow.ts`
- **Description:** Cross-check critical refactors/bugfixes with multiple backends.
- **Parameters:**
  - `files` (string[], required): Files to analyze.
  - `goal` (enum, default: "refactor"): "bugfix" | "refactor".
  - `autonomyLevel` (enum, optional): Permission level.
- **Use Cases:** Critical code path review, high-risk changes.
- **Documentation:** `docs/reference/api-workflows.md`

### 8. auto-remediation
- **File:** `src/workflows/auto-remediation.workflow.ts`
- **Description:** Automatically generate remediation plans using Droid.
- **Parameters:**
  - `symptoms` (string, required): Description of the bug/issue.
  - `maxActions` (number, optional): Max steps in plan.
  - `autonomyLevel` (enum, optional): Permission level.
- **Use Cases:** Automated fix generation for known issues.
- **Documentation:** `docs/reference/api-workflows.md`

### 9. refactor-sprint
- **File:** `src/workflows/refactor-sprint.workflow.ts`
- **Description:** Orchestrates a mini-sprint of refactoring.
- **Parameters:**
  - `targetFiles` (string[], required): Files to refactor.
  - `scope` (string, required): Scope description.
  - `depth` (enum, default: "balanced"): "light" | "balanced" | "deep".
  - `autonomyLevel` (enum, optional): Permission level.
- **Use Cases:** Focused technical debt payback.
- **Documentation:** `docs/reference/api-workflows.md`

### 10. openspec-driven-development
- **File:** `src/workflows/openspec-driven-development.workflow.ts`
- **Description:** Workflow driven by OpenSpec specifications.
- **Parameters:**
  - `featureDescription` (string, required): Feature description.
  - `projectInitialized` (boolean, default: false): OpenSpec init status.
  - `aiTools` (string[], optional): AI tools configuration.
  - `changeType` (enum, default: "feature"): "feature" | "bugfix" | "improvement" | "refactor".
  - `targetFiles` (string[], optional): Target files.
  - `implementationApproach` (enum, default: "incremental"): Approach.
  - `autonomyLevel` (enum, default: "low"): Permission level.
  - `validationBackends` (enum[], optional): Backends for validation.
- **Use Cases:** Spec-first development, standardized implementation.
- **Documentation:** `docs/enhancement-plan/openspec-user-guide.md` (implied)

## Integration Points

- **Smart Workflows Router:** `src/workflows/index.ts` exposes all valid workflows via `smartWorkflowsSchema`.
- **OpenSpec:** Integrated via `openspec-driven-development` workflow and `src/tools/openspec/`.
- **Cursor Agent / Droid:** Used as backends within these workflows.

