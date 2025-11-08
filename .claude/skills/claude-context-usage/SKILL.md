---
name: claude-context-usage
description: Use this skill to ensure Claude always uses claude-context semantic search before any other search method. claude-context provides hybrid search (BM25 + vectors) and finds related code across the codebase without reading files. Use BEFORE feature implementation, bug hunting, refactoring, schema changes, or any code search. claude-context should be the primary search method, with normal file reading as fallback only.
---

# Claude-Context Usage Skill

## Purpose

This skill ensures Claude always uses claude-context semantic search as the primary search method before resorting to normal file search methods. claude-context provides hybrid search (BM25 + vectors), finds related code across the entire codebase, and identifies architectural relationships without reading entire files.

## When to Use This Skill

- Before implementing any new feature
- When hunting for bugs in the codebase
- Before any refactoring work
- When analyzing schema changes
- When looking for specific functions or implementations
- When mapping dependencies in the codebase
- When searching for duplicate implementations
- Before reading large files directly

## Primary Search Pattern

### 1. ALWAYS use claude-context first:

```
# Index the codebase
mcp__claude-context__index_codebase --path /home/dawid/Projects/unified-ai-mcp-tool

# Semantic search (not keyword)
mcp__claude-context__search_code "where is X function called from?" --path /home/dawid/Projects/unified-ai-mcp-tool
mcp__claude-context__search_code "what code depends on redis_manager?" --path /home/dawid/Projects/unified-ai-mcp-tool
mcp__claude-context__search_code "find similar implementations of caching logic" --path /home/dawid/Projects/unified-ai-mcp-tool
```

### 2. Complement with memory search when appropriate:

```
# Before implementing features or making decisions, also search memories:
openmemory-search-memories "recent work on [component/feature]"
openmemory-search-memories "past decisions about [implementation approach]"
openmemory-search-memories "similar [problem/solution] implementation"
```

### 2. Use specific semantic queries:
- "Where is X function called from?" (finds ALL callers)
- "What code depends on [component]?" (maps dependencies)
- "Find similar implementations of [pattern]" (pattern detection)
- "What modules use [feature]?" (architectural relationships)
- "Find duplicate [pattern] in [module]" (duplication detection)

### 3. Only fallback to normal search after claude-context:
- If claude-context doesn't return relevant results
- For very specific line-by-line analysis after initial discovery
- When you need to examine exact implementation details

## Search Hierarchy (UPDATED with Serena)

1. **Discovery (Architectural)**: claude-context semantic search
   - Find related code across entire codebase
   - Map dependencies and relationships
   - Identify patterns and duplication

2. **Navigation (Symbol-Level)**: Serena for precise code navigation
   - get_symbols_overview: Map file structure without reading full code
   - find_symbol: Locate specific functions/classes by name
   - find_referencing_symbols: Find ALL usages (critical for safe refactoring)
   - **Token Savings**: 75-80% vs reading full files

3. **Analysis (AI-Powered)**: ask-gemini + ask-qwen for complex code analysis
   - Gemini: Architecture, security, best practices
   - Qwen: Quick quality check, edge cases

4. **Fallback**: Direct file reading (only for small files <300 LOC)
5. **Last Resort**: Normal file search methods (grep, find)

## Quality Assurance

### Before using normal search methods:
1. Confirm claude-context was used first
2. Verify the semantic search query was specific enough
3. Check if claude-context results were comprehensive
4. Only use normal search as a fallback

### Expected claude-context benefits:
- Finds related code across entire codebase
- Maps architectural relationships
- Identifies similar implementations
- Detects code duplication
- Shows dependency chains
- Reveals usage patterns without reading files

## Serena Pattern (NEW - Symbol-Level Navigation)

When you need PRECISE code navigation after claude-context discovery:

```bash
# 1. Find symbol definition
mcp__serena__find_symbol "SymbolName" --relative_path "src/file.ts" --include_body true

# 2. Map file structure (without reading full file!)
mcp__serena__get_symbols_overview --relative_path "src/file.ts"

# 3. CRITICAL: Impact analysis before editing
mcp__serena__find_referencing_symbols --name_path "SymbolName" --relative_path "src/file.ts"
```

**Token Savings**: 75-80% vs full file reads
**When to use**: Files >300 LOC, need call graph, refactoring with dependencies
**See also**: `serena-surgical-editing` skill for complete workflows

## Workflow Integration

### Before Any Code Work (UPDATED):
```
# 1. Use claude-context for discovery
mcp__claude-context__search_code "[key term or function]" --path /home/dawid/Projects/unified-ai-mcp-tool

# 2. Use Serena for symbol-level navigation
mcp__serena__get_symbols_overview --relative_path "discovered/file.ts"
mcp__serena__find_symbol "TargetSymbol" --relative_path "discovered/file.ts" --include_body true

# 3. If needed, use ask-gemini/ask-qwen for analysis
# 4. Only directly read files if <300 LOC or absolutely necessary
```

### For Feature Implementation (UPDATED):
1. claude-context: "Where does similar feature exist?" → Find related modules
2. Serena: get_symbols_overview + find_symbol → Understand current architecture
3. Serena: find_referencing_symbols → Impact analysis before changes
4. claude-context: "Find all callers of new function" → Verify impact

### For Bug Hunting (UPDATED):
1. claude-context: "Where is error generated?" → Locate root cause
2. Serena: find_symbol + find_referencing_symbols → Call graph + impact
3. claude-context: "Find all affected call sites" → Verify fix scope

### For Refactoring (UPDATED):
1. claude-context: "Find all functions with pattern X" → Scope
2. Serena: get_symbols_overview → Map file structure
3. Serena: find_referencing_symbols → Identify ALL usages (critical for safe refactoring!)
4. claude-context: "Find similar code" → Ensure consistency

## Fallback Scenarios

Only use normal search methods when:
- claude-context returns no relevant results
- You need to examine exact syntax/implementation
- Working with very small files (<300 LOC)
- Need to verify specific line numbers

## Reminder Phrases

Claude should ask:
- "Have I used claude-context for semantic search yet?"
- "Would claude-context provide better results for this query?"
- "Am I using normal search when semantic search would be better?"

---

**Skill Status**: COMPLETE ✅
**Line Count**: < 500 ✅