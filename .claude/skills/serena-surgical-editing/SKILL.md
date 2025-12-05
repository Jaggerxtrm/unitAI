---
name: serena-surgical-editing
description: Symbol-level TypeScript/JavaScript navigation via Serena LSP. Use for refactoring, impact analysis, or files >300 LOC. Achieves 75-80% token savings vs full reads.
relatedSkills:
  - name: claude-context-usage
    when: Before using Serena
    reason: Discover which files to navigate with semantic search
  - name: code-validation
    when: After refactoring
    reason: Verify impact with AI review before committing
---

# Serena Surgical Editing Skill

## Quick Start

Navigate TypeScript/JavaScript code at symbol level, not file level.

### Essential Commands
```bash
# 1. Map file structure
mcp__serena__get_symbols_overview --relative_path "src/file.ts"

# 2. Find specific symbol
mcp__serena__find_symbol "ClassName/methodName" --relative_path "src/file.ts" --include_body true

# 3. CRITICAL: Check impact before editing
mcp__serena__find_referencing_symbols --name_path "methodName" --relative_path "src/file.ts"

# 4. Safe edit
mcp__serena__replace_symbol_body --name_path "methodName" --relative_path "src/file.ts" --body "new code"
```

## When to Use

- Files >300 LOC (75-80% token savings)
- Refactoring with unknown dependencies
- Renaming symbols across codebase
- Impact analysis before changes
- TypeScript/JavaScript only

## Three Workflows

### Path A: Quick Edit (Known, Isolated)
```bash
find_symbol → replace_symbol_body
```
**When**: Bug fixes, internal improvements, no external dependencies.

### Path B: Safe Refactoring (Public API)
```bash
find_symbol → find_referencing_symbols → rename_symbol or replace_symbol_body
```
**When**: Shared utilities, public APIs, exported symbols.

### Path C: Exploration First (Unfamiliar)
```bash
get_symbols_overview → find_symbol → find_referencing_symbols → edit
```
**When**: New module, complex refactoring, architectural changes.

## Token Savings

**Traditional**: Read 800 LOC file = ~8,000 tokens  
**Serena**: Overview + find + references = ~1,600 tokens  
**Savings**: 80%

## Key Principles

- Files >300 LOC → Use Serena
- Files <300 LOC → Direct read is fine
- Public API changes → ALWAYS check references first
- Safe renames → Use `rename_symbol` (automatic)

## Integration

**With claude-context**: Discovery → Serena navigation → Impact analysis  
**With AI Review**: Serena impact map → Gemini/Qwen review → Surgical edits

## Learn More

- [Common Patterns](PATTERNS.md) - Practical patterns for frequent operations
- [API Reference](API-REFERENCE.md) - Complete command documentation

---

**Token Efficiency**: 75-80% savings vs full reads  
**Safety**: LSP-powered, automatic reference handling  
**Best For**: TypeScript, JavaScript files >300 LOC
