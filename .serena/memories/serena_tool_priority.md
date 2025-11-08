# Serena Tool Priority Guidelines

## Primary Tool for Code Navigation

**Serena MUST be the primary tool for all code exploration and navigation tasks.**

### When to Use Serena (ALWAYS)

1. **Symbol-Level Code Reading**
   - Finding functions, classes, methods, interfaces
   - Understanding code structure without reading entire files
   - Navigating symbol hierarchies
   - Finding symbol references and usages

2. **Code Exploration**
   - Getting file overview (`get_symbols_overview`)
   - Finding symbols by name (`find_symbol`)
   - Finding references to symbols (`find_referencing_symbols`)
   - Pattern-based code search (`search_for_pattern`)

3. **Code Modifications**
   - Replacing symbol bodies (`replace_symbol_body`)
   - Inserting code before/after symbols (`insert_before_symbol`, `insert_after_symbol`)
   - Renaming symbols across codebase (`rename_symbol`)

### Why Serena is Superior

- **75-80% token savings** vs reading full files
- **Precise targeting** of specific code elements
- **Safe refactoring** with impact analysis
- **Symbol-aware** navigation and editing
- **LSP-based** understanding of code structure

### When NOT to Use Read/Grep

❌ **DON'T use Read** for:
- Exploring code structure (use `get_symbols_overview`)
- Finding functions/classes (use `find_symbol`)
- Understanding symbol relationships (use `find_referencing_symbols`)

❌ **DON'T use Grep** for:
- Finding code symbols (use `find_symbol` with pattern matching)
- Searching for references (use `find_referencing_symbols`)
- Code pattern matching (use `search_for_pattern`)

### Correct Workflow Examples

#### ❌ WRONG: Using Read to find a function
```
Read("src/workflows/parallel-review.workflow.ts")
// Then manually search through 500 lines
```

#### ✅ CORRECT: Using Serena to find a function
```
find_symbol(
  name_path: "executeParallelReview",
  relative_path: "src/workflows/parallel-review.workflow.ts",
  include_body: true
)
// Returns only the function, ~50 lines
```

#### ❌ WRONG: Using Grep to find all usage
```
Grep(pattern: "executeParallelReview")
// Returns raw grep results, no context
```

#### ✅ CORRECT: Using Serena for references
```
find_referencing_symbols(
  name_path: "executeParallelReview",
  relative_path: "src/workflows/parallel-review.workflow.ts"
)
// Returns all references with code snippets and metadata
```

### Exceptions (When Read/Grep is OK)

✅ **Use Read** for:
- Non-code files (markdown, JSON, config files)
- Very small files (<50 lines)
- When you need to see the ENTIRE file context
- Reading documentation or text files

✅ **Use Grep** for:
- Searching non-code content
- Finding literal strings in logs/output
- When symbol-based search doesn't apply

### Integration with Other Tools

**Typical workflow:**
1. **Start with Serena** - Get overview, find symbols
2. **Use MCP tools** - claude-context for semantic search, context7 for docs
3. **Fall back to Read** - Only if Serena doesn't have the file indexed
4. **Never Grep first** - Always try Serena's `search_for_pattern` first

### Performance Metrics

| Task | Read/Grep | Serena | Token Savings |
|------|-----------|--------|---------------|
| Find function | 500 lines | 50 lines | 90% |
| Understand class | 800 lines | 100 lines | 87% |
| Find references | N/A (manual) | Automated | 95% |
| Safe refactoring | Risky | Safe | - |

### Team Standard

**This is a MUST-FOLLOW guideline:**
- All Claude Code workflows use Serena as primary tool
- Code exploration ALWAYS starts with Serena
- Read/Grep are fallback tools only
- Symbol-level operations use Serena exclusively

## Quick Reference

```typescript
// 1. Explore file structure
mcp__serena__get_symbols_overview({ relative_path: "src/file.ts" })

// 2. Find specific symbol
mcp__serena__find_symbol({ 
  name_path: "ClassName/methodName",
  relative_path: "src/file.ts",
  include_body: true
})

// 3. Find all references
mcp__serena__find_referencing_symbols({
  name_path: "symbolName",
  relative_path: "src/file.ts"
})

// 4. Search for pattern
mcp__serena__search_for_pattern({
  substring_pattern: "async function.*",
  relative_path: "src/",
  restrict_search_to_code_files: true
})
```

## Commit to Memory

✅ **Serena FIRST, always**
✅ **Symbol-level navigation = token efficiency**
✅ **Read/Grep = fallback only**
✅ **75-80% token savings achieved**
