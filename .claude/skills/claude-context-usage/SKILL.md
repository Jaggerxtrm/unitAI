---
name: claude-context-usage
description: Semantic codebase search via claude-context (BM25+vectors). Use before implementation, refactoring, or exploration. Finds dependencies and patterns without reading files.
relatedSkills:
  - name: serena-surgical-editing
    when: After finding relevant files
    reason: Navigate symbols without reading full files (75-80% token savings)
  - name: memory-search-reminder
    when: Before starting search
    reason: Check for past solutions and approaches
---

# Claude-Context Usage Skill

## Quick Start

Use claude-context for semantic codebase search before implementation, refactoring, or exploration.

### Basic Pattern
```bash
# 1. Index (once per codebase)
mcp__claude-context__index_codebase --path /home/dawid/Projects/unitai

# 2. Search with natural language
mcp__claude-context__search_code "where is authentication handled?" --path /home/dawid/Projects/unitai
```

## When to Use

- Before implementing new features
- Bug hunting in unfamiliar code
- Refactoring and impact analysis
- Finding duplicate implementations
- Mapping dependencies
- Before reading large files

## Common Patterns

### Find Dependencies
```bash
mcp__claude-context__search_code "what code depends on redis_manager?" --path /project/path
```

### Find Similar Code
```bash
mcp__claude-context__search_code "similar caching implementations" --path /project/path
```

### Find Callers
```bash
mcp__claude-context__search_code "where is executeTask called from?" --path /project/path
```

## Search Hierarchy

1. **claude-context**: Semantic discovery across codebase (90% token savings)
2. **Serena**: Symbol-level navigation for TS/JS (75-80% savings)
3. **AI Analysis**: ask-gemini/ask-qwen for complex analysis
4. **Direct Read**: Only for small files <300 LOC
5. **Last Resort**: grep/find

## Integration

**With Serena**: claude-context finds files → Serena navigates symbols
**With Memory**: Search memories before code search for past approaches
**With AI Review**: Validate architectural impact after discovery

## Learn More

- [Complete Workflows](WORKFLOWS.md) - Integration patterns and scenarios
- [Full API Reference](REFERENCE.md) - All commands and parameters

---

**Token Savings**: ~90% for discovery phase
**Best For**: TypeScript, JavaScript, Python codebases