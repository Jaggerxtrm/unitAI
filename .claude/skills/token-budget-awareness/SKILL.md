---
name: token-budget-awareness
description: Token efficiency awareness and guidance. Provides education on token-heavy operations and suggests efficient alternatives. Use when context window filling up or considering large operations.
relatedSkills:
  - name: serena-surgical-editing
    when: For TS/JS files
    reason: 75-80% token savings vs full reads
  - name: claude-context-usage
    when: For discovery
    reason: 90% savings vs grep/find
  - name: quick-exploration
    when: At session start
    reason: Structured efficient exploration pattern
---

# Token Budget Awareness Skill

## Purpose

Educate on token consumption patterns and guide toward efficient tool usage without blocking legitimate workflows.

## Token Cost Reference

### Reading Files

| Operation | Typical Cost | Example |
|-----------|--------------|---------|
| Read 100 LOC file | ~1,000 tokens | Small utility |
| Read 500 LOC file | ~5,000 tokens | Medium module |
| Read 1000 LOC file | ~10,000 tokens | Large component |
| Read 5000 LOC file | ~50,000 tokens | Major system file |

### Alternative Tools

| Tool | Cost | Savings vs Read |
|------|------|-----------------|
| `serena get_symbols_overview` | ~200 tokens | 95-98% for large files |
| `serena find_symbol` (with body) | ~500 tokens | 90-95% for large files |
| `claude-context search` | ~1,000 tokens | 80-90% vs multiple reads |
| `grep` (files only mode) | ~200 tokens | 90-95% vs reading each |
| `glob_file_search` | ~100 tokens | 99% vs reading to find files |

## High-Cost Patterns to Avoid

### Pattern 1: Multiple Reads of Same File

```bash
# BAD: Reading same file multiple times
read_file "src/large.ts"  # 8000 tokens
# ... later in conversation
read_file "src/large.ts"  # 8000 tokens again!
Total: 16,000 tokens
```

**Better Approach**:
```bash
# Use Serena for first read
mcp__serena__get_symbols_overview --relative_path "src/large.ts"  # 200 tokens
# Read specific symbols as needed
mcp__serena__find_symbol "TargetFunction" --relative_path "src/large.ts"  # 500 tokens
Total: 700 tokens (95% savings)
```

### Pattern 2: Recursive Directory Grep

```bash
# BAD: Searching entire codebase
grep "somePattern" --path . -C 3
# Returns 500 matches across 50 files
# Cost: ~10,000 tokens
```

**Better Approach**:
```bash
# Use claude-context semantic search
mcp__claude-context__search_code "code related to somePattern" --path /project/path
# Cost: ~1,000 tokens (90% savings)
```

### Pattern 3: Reading Generated/Vendor Files

```bash
# BAD: Reading files you didn't write
read_file "node_modules/library/dist/bundle.js"  # 50,000 tokens
read_file "package-lock.json"  # 100,000 tokens
```

**Better Approach**:
- Avoid reading generated files
- Use documentation lookup for libraries
- Trust that vendor code works

### Pattern 4: Reading Before Understanding Structure

```bash
# BAD: Guessing which files to read
read_file "file1.ts"  # Maybe relevant? 5000 tokens
read_file "file2.ts"  # Maybe? 5000 tokens
read_file "file3.ts"  # Maybe? 5000 tokens
# Only file2 was actually needed
Total: 15,000 tokens (10,000 wasted)
```

**Better Approach**:
```bash
# Map structure first
glob_file_search "**/*.ts"  # 100 tokens
grep "export.*Target" --output_mode files_with_matches  # 200 tokens
# Now read only relevant file
read_file "file2.ts"  # 5000 tokens
Total: 5,300 tokens (65% savings)
```

## Efficiency Patterns

### Pattern: Discovery → Navigation → Analysis

```bash
# Phase 1: Discovery (claude-context)
mcp__claude-context__search_code "where is authentication?" --path /project/path
# Cost: 1,000 tokens
# Output: Points to src/auth/manager.ts

# Phase 2: Navigation (Serena)
mcp__serena__get_symbols_overview --relative_path "src/auth/manager.ts"
# Cost: 200 tokens
# Output: Shows AuthManager class structure

# Phase 3: Targeted Analysis
mcp__serena__find_symbol "AuthManager/validateToken" --relative_path "src/auth/manager.ts" --include_body true
# Cost: 500 tokens

Total: 1,700 tokens vs ~10,000 for reading entire auth module
Savings: 83%
```

### Pattern: Progressive Disclosure

```bash
# Start with minimal info
glob_file_search "**/*.ts"  # 100 tokens

# Get more specific
grep "export class" --output_mode files_with_matches  # 200 tokens

# Narrow down
mcp__serena__get_symbols_overview --relative_path "target.ts"  # 200 tokens

# Final targeted read
mcp__serena__find_symbol "TargetClass/targetMethod" ...  # 500 tokens

Total: 1,000 tokens vs reading 10 files = 50,000 tokens
Savings: 98%
```

## Context Window Management

### Signs You're Using Too Many Tokens

1. Getting compaction warnings
2. Repeated reads of same files
3. Reading generated/vendor files
4. Large grep outputs with full matches
5. Reading files >1000 LOC directly

### Recovery Strategies

**If context window filling up**:
1. Use `/compact` to compress history
2. Switch to more efficient tools (Serena, claude-context)
3. Use `output_mode: files_with_matches` for grep
4. Read file metadata before full read (check LOC)

**For remaining session**:
1. Always use Serena for TS/JS >300 LOC
2. Always use claude-context for discovery
3. Avoid reading same file twice
4. Skip vendor/generated files

## Cost-Benefit Analysis Guide

### When Full Read is Worth It

- Files <100 LOC (cost: ~1000 tokens)
- Config files (small and important)
- Entry point files you'll reference often
- Already narrowed down to exact file needed

### When Alternative Tools Win

- Files >300 LOC (Serena saves 75-80%)
- Discovery phase (claude-context saves 90%)
- Multiple potential files (grep files_only + selective read)
- Unfamiliar codebase (quick-exploration pattern)

## Educational Messages

### For Large File Reads

```
Token consideration: This file is 800 LOC (~8,000 tokens)

Consider:
- Serena overview: ~200 tokens (97% savings)
- Serena targeted read: ~500 tokens (93% savings)

Use full read only if you need to see entire implementation.
```

### For Multiple Grep Results

```
Token consideration: 50 matches found (~5,000 tokens to show all)

Consider:
- Use --output_mode files_with_matches first (200 tokens)
- Then read specific files (selective)
- Or use claude-context semantic search (1,000 tokens)
```

## Integration with Other Skills

**With serena-surgical-editing**:
- Use Serena by default for TS/JS >300 LOC
- Massive token savings on large files

**With claude-context-usage**:
- Use for discovery before reading files
- Finds relevant code without token spend

**With quick-exploration**:
- Structured approach saves 85-90% tokens
- Proper exploration pattern from start

## Metrics to Track (Informal)

- Token usage per task (aim for <10,000 for typical tasks)
- Number of repeated file reads (aim for 0)
- Vendor file reads (aim for 0)
- Average file size read (aim for <300 LOC)
- Use of alternative tools (aim for 80%+ when applicable)

## Remember

**This is guidance, not enforcement**:
- Sometimes full file read is the right choice
- Educational awareness, not blocking
- Build efficient habits over time
- Tool suggestions, not mandates

**Goal**: Efficient workflows that extend your token budget further.

---

**Philosophy**: Educate toward efficiency without creating friction
**Approach**: Suggest better alternatives, explain token costs
**Outcome**: More work accomplished within token limits

