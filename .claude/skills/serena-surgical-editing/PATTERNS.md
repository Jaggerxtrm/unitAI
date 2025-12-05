# Serena Common Patterns

Pattern pratici per operazioni comuni.

## Pattern: Safe Function Rename

```bash
# 1. Find function definition
mcp__serena__find_symbol "oldFunctionName" --relative_path "src/utils.ts"

# 2. Find ALL references
mcp__serena__find_referencing_symbols --name_path "oldFunctionName" --relative_path "src/utils.ts"
# → Found: 15 references across 5 files

# 3. Safe rename (handles all references automatically)
mcp__serena__rename_symbol --name_path "oldFunctionName" --new_name "newFunctionName" --relative_path "src/utils.ts"
```

**Why**: LSP-powered rename handles all references automatically, preventing broken imports.

## Pattern: Add Method to Class

```bash
# 1. Map class structure
mcp__serena__get_symbols_overview --relative_path "src/MyClass.ts"

# 2. Find last method
# Output shows: MyClass/constructor, MyClass/publicMethod, MyClass/privateMethod

# 3. Insert after last method
mcp__serena__insert_after_symbol \
  --name_path "MyClass/privateMethod" \
  --relative_path "src/MyClass.ts" \
  --body "
  newMethod(param: string): void {
    // implementation
  }
  "
```

## Pattern: Refactor with Impact Analysis

```bash
# 1. Find complex function
mcp__serena__find_symbol "complexFunction" --relative_path "src/core.ts" --include_body true

# 2. Check impact (CRITICAL step!)
mcp__serena__find_referencing_symbols --name_path "complexFunction" --relative_path "src/core.ts"
# → Found: 23 references across 8 files!

# 3. Breaking change? Get AI help
mcp__unitAI__ask-gemini --prompt "@src/core.ts complexFunction has 23 callers. Best refactoring strategy?"

# 4. Implement strategy (non-breaking if possible)
mcp__serena__replace_symbol_body --name_path "complexFunction" --relative_path "src/core.ts" --body "..."
```

**Why**: 23 references = high risk. AI review ensures safe approach.

## Pattern: Explore Before Edit

```bash
# Scenario: Need to modify unfamiliar file

# 1. Map structure (200 tokens vs 8000 for full read)
mcp__serena__get_symbols_overview --relative_path "src/unfamiliar.ts"

# Output:
# - UnknownClass/constructor
# - UnknownClass/publicMethod1
# - UnknownClass/publicMethod2
# - helperFunction
# - exportedConstant

# 2. Navigate to symbol of interest
mcp__serena__find_symbol "UnknownClass/publicMethod1" --relative_path "src/unfamiliar.ts" --include_body true

# 3. Check usages before modifying
mcp__serena__find_referencing_symbols --name_path "UnknownClass/publicMethod1" --relative_path "src/unfamiliar.ts"

# 4. Safe edit
mcp__serena__replace_symbol_body ...
```

**Token Savings**: 200 + 500 + 800 = 1,500 tokens vs 8,000 = 81% savings

## Pattern: Add Import Statement

```bash
# 1. Find first symbol in file
mcp__serena__get_symbols_overview --relative_path "src/file.ts"
# First symbol: MyClass

# 2. Insert import before first symbol
mcp__serena__insert_before_symbol \
  --name_path "MyClass" \
  --relative_path "src/file.ts" \
  --body "import { NewDependency } from './new-dep';"
```

## Pattern: Debug Call Chain

```bash
# Scenario: Function misbehaves, need to find all callers

# 1. Find function
mcp__serena__find_symbol "buggyFunction" --relative_path "src/buggy.ts" --include_body true

# 2. Find ALL callers
mcp__serena__find_referencing_symbols --name_path "buggyFunction" --relative_path "src/buggy.ts"

# Output shows call locations:
# - src/moduleA.ts:45
# - src/moduleB.ts:78
# - src/tests/test.ts:12

# 3. Navigate to suspicious caller
mcp__serena__find_symbol "ModuleA/suspiciousMethod" --relative_path "src/moduleA.ts" --include_body true

# Now you know who calls what without reading entire files!
```

## Pattern: Batch Symbol Reading

When you need multiple symbols from same file:

```bash
# Instead of reading full file (8000 tokens), read specific symbols:

# 1. Overview
mcp__serena__get_symbols_overview --relative_path "src/large.ts"  # 200 tokens

# 2. Read only symbols you need
mcp__serena__find_symbol "ClassA/method1" --relative_path "src/large.ts" --include_body true  # 400 tokens
mcp__serena__find_symbol "ClassB/method2" --relative_path "src/large.ts" --include_body true  # 400 tokens

# Total: 1000 tokens vs 8000 = 87.5% savings
```

## Anti-Patterns

### Don't: Skip find_referencing_symbols Before Public API Changes

```bash
# BAD: Modify without checking impact
mcp__serena__replace_symbol_body --name_path "publicMethod" ...
# → Breaks 30 callers across 10 files!

# GOOD: Always check first
mcp__serena__find_referencing_symbols --name_path "publicMethod" ...
# → See 30 callers, realize breaking change, adjust approach
```

### Don't: Use Serena on Very Small Files

```bash
# BAD: Overhead not worth it
mcp__serena__get_symbols_overview --relative_path "src/tiny-config.ts"  # 50 LOC

# GOOD: Just read small files
read_file "src/tiny-config.ts"  # 50 LOC = ~500 tokens
```

**Rule of Thumb**: Serena for files >300 LOC, direct read for <300 LOC

### Don't: Use Serena for Non-TS/JS Files

```bash
# BAD: Serena uses TypeScript LSP
mcp__serena__get_symbols_overview --relative_path "config.json"
# → Error or no results

# GOOD: Use appropriate tool
read_file "config.json"
```

## Decision Tree

```
Need to edit file?
├─ File <300 LOC? → Direct read
├─ Non-TS/JS file? → Direct read
└─ File >300 LOC + TS/JS?
   ├─ First time seeing file? → get_symbols_overview
   ├─ Know what symbol to edit? → find_symbol
   ├─ Public API change? → find_referencing_symbols (CRITICAL!)
   └─ Safe rename? → rename_symbol (automatic)
```

