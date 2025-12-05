---
name: unified-ai-orchestration
description: Multi-model AI analysis via unitAI. Use Gemini for architecture, Qwen for quick checks, Rovodev for code generation. Run parallel for comprehensive validation.
relatedSkills:
  - name: code-validation
    when: Part of validation workflow
    reason: Use parallel AI review for pre-commit validation
  - name: serena-surgical-editing
    when: After AI suggestions
    reason: Implement changes with surgical precision
---

# Unified AI Orchestration Skill

## Purpose

Leverage multiple AI backends through unitAI MCP server for robust analysis, implementation, and validation.

## Model Strengths (Guidelines, Not Rules)

### ask-gemini - Deep Reasoning
- Architectural design and security analysis
- Complex refactoring strategies
- Best practices and code quality
- Use for: high-stakes changes, architectural decisions

### ask-qwen - Fast Iteration
- Quick code quality checks and edge case detection
- Pattern recognition and redundancy identification
- Use for: rapid iteration, second opinions, quick validation

### ask-rovodev - Production Code
- Production-ready code generation
- Bug fixes with proper error handling
- Use for: clear implementation requirements, working prototypes

## Key Patterns

### Parallel Execution (Comprehensive Validation)
Run Gemini + Qwen simultaneously for different perspectives:
```bash
mcp__unitAI__ask-gemini --prompt "@file.ts Validate architecture, security, performance"
mcp__unitAI__ask-qwen --prompt "@file.ts Check quality, edge cases, bugs"
```
Use when: pre-commit review, critical changes, multiple perspectives needed

### Sequential Flow (Feature Development)
1. Design with Gemini (architecture)
2. Implement with Rovodev (code)
3. Validate with Qwen (quick review)

Use when: building new features, need design → implementation → validation

## Autonomous Decision Making

Let Claude choose based on context:
- Single model: Simple tasks, clear requirements
- Parallel models: Validation, comprehensive review
- Sequential models: Learning, feature development

Trust your judgment - these are guidelines to help, not rules to enforce.

---

**Skill Status**: Active
**Best Practice**: Parallel for validation, sequential for learning
