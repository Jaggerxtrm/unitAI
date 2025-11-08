---
name: serena-surgical-editing
description: Use Serena for symbol-level code surgery when editing TypeScript/JavaScript. ALWAYS use find_referencing_symbols before modifications to prevent breaking changes. Achieves 75-80% token savings vs full file reads. Use for precise navigation, safe refactoring, and impact analysis.
---

# Serena Surgical Editing Skill

## Purpose

Enable precise, safe code modifications using LSP-based symbol navigation with Serena MCP server. This skill provides 75-80% token savings compared to reading full files while ensuring safe refactoring through comprehensive impact analysis.

## When to Use

Consider this skill when:
- Editing TypeScript/JavaScript functions, classes, or interfaces
- Refactoring code with unknown dependencies
- Renaming symbols across the codebase
- Need to understand call graphs before changes
- Working with files >300 LOC
- Impact analysis required before modifications

## Core Principle

**Guideline**: Navigate code at the symbol level, not file level. Always verify impact before surgical edits.

## Dynamic Workflow (Choose Your Path)

### Path A: Quick Symbol Edit (Known Location, Isolated Change)

Use when you know exactly what to change and are confident there's no external dependencies.

```bash
# 1. Find and read symbol
mcp__serena__find_symbol "FunctionName" --relative_path "src/file.ts" --include_body true

# 2. Replace symbol body
mcp__serena__replace_symbol_body --name_path "FunctionName" --relative_path "src/file.ts" --body "new implementation"
```

**When to choose**: Simple bug fixes, internal function improvements, adding logging.

### Path B: Safe Refactoring (Unknown Impact, Public API)

Use when the symbol might be used elsewhere or you're refactoring public APIs.

```bash
# 1. Find symbol definition
mcp__serena__find_symbol "SymbolName" --relative_path "src/file.ts" --include_body true

# 2. CRITICAL: Find ALL references
mcp__serena__find_referencing_symbols --name_path "SymbolName" --relative_path "src/file.ts"

# 3. Analyze impact (review all usages from step 2)

# 4. Choose approach:
#    a) Safe rename: mcp__serena__rename_symbol (handles all references automatically)
#    b) Surgical edit: mcp__serena__replace_symbol_body (if signature unchanged)
#    c) Manual updates: Edit each referencing file if breaking change needed
```

**When to choose**: Refactoring shared utilities, changing public APIs, renaming exported symbols.

### Path C: Exploration First (New Codebase Area, Discovery Mode)

Use when you're unfamiliar with the code structure and need to understand before acting.

```bash
# 1. Map file structure
mcp__serena__get_symbols_overview --relative_path "src/module.ts"

# 2. Navigate to symbol of interest
mcp__serena__find_symbol "SymbolOfInterest" --relative_path "src/module.ts" --depth 1

# 3. Understand relationships
mcp__serena__find_referencing_symbols --name_path "SymbolOfInterest" --relative_path "src/module.ts"

# 4. Now make informed decision (back to Path A or B)
```

**When to choose**: First time working in a module, complex refactoring, architectural changes.

## Serena Tool Reference

### Core Navigation Tools

**find_symbol** - Locate symbols by name path
```bash
mcp__serena__find_symbol "ClassName/methodName" \
  --relative_path "src/file.ts" \
  --include_body true \
  --substring_matching false
```

**get_symbols_overview** - Map file structure without reading implementations
```bash
mcp__serena__get_symbols_overview --relative_path "src/file.ts"
```

**find_referencing_symbols** - Find ALL usages (critical for safe refactoring)
```bash
mcp__serena__find_referencing_symbols \
  --name_path "SymbolName" \
  --relative_path "src/file.ts"
```

### Surgical Editing Tools

**replace_symbol_body** - Replace symbol implementation
```bash
mcp__serena__replace_symbol_body \
  --name_path "FunctionName" \
  --relative_path "src/file.ts" \
  --body "new implementation code"
```

**rename_symbol** - Safe rename across entire codebase (LSP-powered)
```bash
mcp__serena__rename_symbol \
  --name_path "OldName" \
  --relative_path "src/file.ts" \
  --new_name "NewName"
```

**insert_after_symbol** - Add new code after a symbol
```bash
mcp__serena__insert_after_symbol \
  --name_path "LastFunction" \
  --relative_path "src/file.ts" \
  --body "new function code"
```

**insert_before_symbol** - Add code before a symbol (e.g., imports)
```bash
mcp__serena__insert_before_symbol \
  --name_path "FirstSymbol" \
  --relative_path "src/file.ts" \
  --body "import statement"
```

## Principles (NOT Rules)

### ✅ DO (When It Makes Sense)

- Use find_referencing_symbols when refactoring public APIs or shared utilities
- Prefer symbol-level reading over full file reads for large files (>300 LOC)
- Use rename_symbol for safe renames instead of manual find/replace
- Map file structure with get_symbols_overview before diving into details
- Let Serena handle cross-file refactoring automatically

### 🤔 CONSIDER (Context-Dependent)

- Is this edit isolated or has external dependencies?
- Do I know all callers of this symbol? (If no → use find_referencing_symbols)
- Would 5 min of Serena analysis save 20 min of debugging breaking changes?
- Is this a quick fix or architectural change? (Choose Path A vs Path B/C)
- Would reading the full file provide better context for this specific task?

### ❌ AVOID (Unless Necessary)

- Reading full files when symbol-level navigation would suffice
- Editing public APIs without checking references first (breaks code!)
- Using regex replace when rename_symbol is safer and automatic
- Skipping find_referencing_symbols for "seemingly isolated" changes
- Symbol-level surgery on files <100 LOC (normal editing is fine)

## Token Savings Example

**Traditional Approach** (Reading full file):
```
File: src/aiExecutor.ts (800 LOC)
Read entire file: ~8,000 tokens
Modify one function: Edit tool
Total: ~8,000+ tokens
```

**Serena Approach** (Symbol-level):
```
get_symbols_overview: ~200 tokens
find_symbol "executeAIClient": ~500 tokens
find_referencing_symbols: ~800 tokens
replace_symbol_body: ~100 tokens
Total: ~1,600 tokens
Savings: 80%
```

## Integration with Other Skills

### With claude-context-usage
1. claude-context: Discover where functionality exists
2. Serena: Navigate to precise symbols
3. Serena: Verify impact with find_referencing_symbols

### With pre-commit-ai-review
1. Serena: find_referencing_symbols → Impact map
2. Ask-gemini + ask-qwen: Review changes
3. Serena: Surgical edits based on feedback

### With unified-ai-orchestration
1. Ask-gemini: Design refactoring approach
2. Serena: Implement surgical changes
3. Ask-qwen: Validate no edge cases missed

## Common Patterns

### Pattern: Safe Function Rename
```bash
serena find_symbol "oldFunctionName" --relative_path "src/utils.ts"
serena find_referencing_symbols "oldFunctionName" --relative_path "src/utils.ts"
# Review 15 references across 5 files
serena rename_symbol "oldFunctionName" "newFunctionName" --relative_path "src/utils.ts"
# Serena handles all 15 updates automatically
```

### Pattern: Add Method to Class
```bash
serena get_symbols_overview --relative_path "src/MyClass.ts"
# Find last method in class
serena insert_after_symbol "MyClass/lastMethod" --relative_path "src/MyClass.ts" --body "new method"
```

### Pattern: Refactor with Impact Analysis
```bash
serena find_symbol "complexFunction" --relative_path "src/core.ts" --include_body true
serena find_referencing_symbols "complexFunction" --relative_path "src/core.ts"
# Found 23 references! Breaking change requires careful planning
# Use ask-gemini for refactoring strategy given impact scope
```

## Memory Integration

After successful Serena-based refactoring, consider saving the pattern:

```bash
openmemory-add-memory "Refactored [SymbolName] using Serena: found X references across Y files, used rename_symbol for safe rename, validated with find_referencing_symbols"
```

## Troubleshooting

**"Symbol not found"**
- Check name_path syntax (use `/` for nested symbols like "ClassName/methodName")
- Try substring_matching: true
- Verify file is in TypeScript/JavaScript (Serena uses LSP)

**"Too many results"**
- Use more specific name_path
- Narrow with --relative_path to specific file
- Check if multiple symbols have same name

**"Should I use Serena or just read the file?"**
- File <300 LOC → Normal Read tool is fine
- File >300 LOC → Serena saves tokens
- Need impact analysis → Always Serena find_referencing_symbols

---

**Skill Status**: Active
**Token Efficiency**: 75-80% savings vs full file reads
**Safety**: High (LSP-based, automatic reference updates)
**Line Count**: 295 lines
