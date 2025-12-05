---
name: slash-ai-task
description: Use /ai-task to execute unitAI workflows with simple commands - list available workflows or run specific ones like pre-commit validation, code review, bug hunting, and feature design.
---

# Slash AI Task Skill

## Purpose

Provides easy access to the full suite of unitAI workflows through simple slash commands, eliminating the need to remember complex workflow names and parameters.

## Available Workflows

| Workflow | Command | Purpose |
|----------|---------|---------|
| `init-session` | `/ai-task run init-session` | Session initialization |
| `pre-commit-validate` | `/ai-task run pre-commit-validate --depth thorough` | Code validation |
| `parallel-review` | `/ai-task run parallel-review --files "src/**/*.ts"` | Code review |
| `validate-last-commit` | `/ai-task run validate-last-commit` | Post-commit validation |
| `bug-hunt` | `/ai-task run bug-hunt --symptoms "error description"` | Bug investigation |
| `feature-design` | `/ai-task run feature-design --featureDescription "..."` | Feature planning |

## Command Usage

### List Workflows
```bash
/ai-task list
```
Shows all available workflows with descriptions, backends, and duration estimates.

### Run Specific Workflow
```bash
/ai-task run <workflow-name> [parameters]
```

## Common Use Cases

### Pre-Commit Quality Gates
```bash
/ai-task run pre-commit-validate --depth thorough
```
- **Quick** (5-10s): Basic security scan
- **Thorough** (20-30s): Security + quality + breaking changes
- **Paranoid** (60-90s): Comprehensive analysis

### Code Review
```bash
/ai-task run parallel-review --files "src/new-feature.ts" --focus security
```
- **Security**: Security-focused review
- **Performance**: Performance optimization
- **Architecture**: Design patterns and structure

### Bug Investigation
```bash
/ai-task run bug-hunt --symptoms "500 error when uploading >10MB files"
```
Automatically discovers relevant files and provides root cause analysis with fix recommendations.

### Feature Planning
```bash
/ai-task run feature-design --featureDescription "Add OAuth support" --includeTests
```
Generates complete implementation plans with testing strategies.

## Parameter Handling

The command automatically parses parameters:
- `--depth thorough` → `{ depth: "thorough" }`
- `--files "src/**/*.ts"` → `{ files: ["src/**/*.ts"] }`
- `--featureDescription "Add auth"` → `{ featureDescription: "Add auth" }`

## Progress Monitoring

- Real-time status updates during execution
- Duration tracking
- Success/failure indicators
- Detailed error messages

## Integration Points

- **Workflows**: Direct execution of all `unitAI` workflows
- **Backends**: Automatic selection (Gemini, Qwen, Rovodev)
- **Caching**: Intelligent result caching for repeated operations

## Success Metrics

- **Workflow Discovery**: Users find needed workflows in <30 seconds
- **Parameter Errors**: <5% invalid parameter attempts
- **Execution Success**: >95% successful workflow completions
- **Time Savings**: 60-80% reduction in workflow execution complexity

---

**Skill Status**: Active
**Workflow Coverage**: All unitAI workflows
**Parameter Support**: Full workflow parameter mapping
