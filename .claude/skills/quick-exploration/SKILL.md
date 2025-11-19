---
name: quick-exploration
description: Fast codebase exploration workflow at session start or when exploring unfamiliar code. Combines glob, grep, and overview commands for rapid context building without reading large files.
relatedSkills:
  - name: claude-context-usage
    when: After initial exploration
    reason: Semantic search for deeper understanding
  - name: serena-surgical-editing
    when: After finding target files
    reason: Navigate symbols efficiently
---

# Quick Exploration Skill

## Purpose

Guide rapid codebase exploration at session start or when working in unfamiliar areas, avoiding premature large file reads.

## When to Use

- Start of new session in unfamiliar codebase
- Exploring new module or component
- Need quick overview before deep dive
- Don't know where to start

## Core Pattern

```bash
# 1. Map file structure
glob_file_search "**/*.ts" --target_directory /project/path

# 2. Find key files
grep -i "export.*class" --output_mode files_with_matches --path /project/path

# 3. Read entry points only (< 100 LOC)
read_file "src/index.ts"

# 4. Defer deep reading until target identified
```

## Step-by-Step Workflow

### Step 1: Understand Structure

```bash
# See all TypeScript files
glob_file_search "**/*.ts"

# See specific area
glob_file_search "src/api/**/*.ts"
```

**Purpose**: Get mental map of codebase organization.

### Step 2: Find Key Components

```bash
# Find main exports
grep "export (class|function|const)" --output_mode files_with_matches

# Find main entry points
grep "new.*Server\|createApp\|main" --output_mode files_with_matches
```

**Purpose**: Identify important files without reading them.

### Step 3: Read Only Entry Points

```bash
# Check file size first
# If < 100 LOC: Read directly
read_file "src/main.ts"

# If > 100 LOC: Use Serena overview
mcp__serena__get_symbols_overview --relative_path "src/main.ts"
```

**Purpose**: Minimal token spend for maximum context.

### Step 4: Use Targeted Tools

Based on findings, use appropriate tool:
- **For discovery**: claude-context semantic search
- **For navigation**: Serena symbol-level
- **For specific info**: Direct read of small files

## Anti-Patterns to Avoid

### DON'T: Read Large Files Early

```bash
# BAD: Reading 800 LOC file at exploration phase
read_file "src/large-module.ts"  # 8000 tokens wasted!

# GOOD: Overview first, then targeted read
mcp__serena__get_symbols_overview --relative_path "src/large-module.ts"  # 200 tokens
# Then read only what you need
```

### DON'T: Recursive Grep on Everything

```bash
# BAD: Search entire codebase
grep "somePattern" --path .  # Thousands of tokens

# GOOD: Semantic search
mcp__claude-context__search_code "what does somePattern do?" --path /project/path
```

### DON'T: Skip Structure Mapping

```bash
# BAD: Jump straight to reading files
read_file "file1.ts"
read_file "file2.ts"
# No context, guessing which files matter

# GOOD: Map first
glob_file_search "**/*.ts"  # See structure
grep "export" --output_mode files_with_matches  # Find exports
# Now read with purpose
```

## Token Efficiency

**Traditional Exploration**:
```
Read 5 large files (500 LOC each): 25,000 tokens
Total: 25,000 tokens
```

**Quick Exploration Pattern**:
```
glob_file_search: 100 tokens
grep (files only): 200 tokens
read 2 entry points (<100 LOC): 2,000 tokens
serena overview 3 files: 600 tokens
Total: 2,900 tokens
Savings: 88%
```

## Integration

**With claude-context**:
1. Quick exploration → Find interesting area
2. claude-context → Semantic search in that area
3. Targeted work

**With Serena**:
1. Quick exploration → Identify large files
2. Serena overview → Map symbols
3. Serena find_symbol → Read specific code

## Example Session

```bash
# Session start: Unfamiliar codebase
# Goal: Understand how authentication works

# 1. Find auth-related files
glob_file_search "**/*auth*.ts"
# Found: src/auth/manager.ts, src/auth/middleware.ts, src/auth/utils.ts

# 2. Check which exports what
grep "export" --output_mode count --path src/auth/
# manager.ts: 5 exports
# middleware.ts: 2 exports
# utils.ts: 8 exports

# 3. Map main file structure (avoid reading 500 LOC)
mcp__serena__get_symbols_overview --relative_path "src/auth/manager.ts"
# Output: AuthManager class with 5 methods

# 4. Now I know what I need, targeted search
mcp__claude-context__search_code "where is AuthManager used?" --path /project/path

# Result: Full understanding with ~1500 tokens vs 10,000+ tokens
```

## When NOT to Use

- Already familiar with codebase area
- Working on specific known file/function
- Single-file projects
- Very small codebases (<1000 LOC total)

## Success Indicators

- Found target code in <5 tool calls
- Token usage <3000 for exploration phase
- Clear understanding of structure before deep reading
- No large file reads during exploration

---

**Token Efficiency**: 85-90% savings vs traditional exploration
**Best For**: Unfamiliar codebases, session start, exploratory work

