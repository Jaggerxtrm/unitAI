# Claude-Context Workflows

Workflow completi di integrazione per scenari comuni.

## Workflow Integration

### Before Any Code Work
```bash
# 1. Use claude-context for discovery
mcp__claude-context__search_code "[key term or function]" --path /home/dawid/Projects/unitai

# 2. Use Serena for symbol-level navigation
mcp__serena__get_symbols_overview --relative_path "discovered/file.ts"
mcp__serena__find_symbol "TargetSymbol" --relative_path "discovered/file.ts" --include_body true

# 3. If needed, use ask-gemini/ask-qwen for analysis
# 4. Only directly read files if <300 LOC or absolutely necessary
```

### For Feature Implementation
1. claude-context: "Where does similar feature exist?" → Find related modules
2. Serena: get_symbols_overview + find_symbol → Understand current architecture
3. Serena: find_referencing_symbols → Impact analysis before changes
4. claude-context: "Find all callers of new function" → Verify impact

### For Bug Hunting
1. claude-context: "Where is error generated?" → Locate root cause
2. Serena: find_symbol + find_referencing_symbols → Call graph + impact
3. claude-context: "Find all affected call sites" → Verify fix scope

### For Refactoring
1. claude-context: "Find all functions with pattern X" → Scope
2. Serena: get_symbols_overview → Map file structure
3. Serena: find_referencing_symbols → Identify ALL usages (critical for safe refactoring!)
4. claude-context: "Find similar code" → Ensure consistency

## Integration with Other Skills

### With memory-search-reminder
Before using claude-context, search memories for past approaches:
```bash
openmemory-search-memories "recent work on [component]"
mcp__claude-context__search_code "[component]" --path /project/path
```

### With serena-surgical-editing
After claude-context discovery, use Serena for precise navigation:
```bash
# Discovery
mcp__claude-context__search_code "redis connection" --path /project/path

# Found: src/redis/manager.ts

# Navigate symbols
mcp__serena__get_symbols_overview --relative_path "src/redis/manager.ts"
mcp__serena__find_symbol "RedisManager/connect" --relative_path "src/redis/manager.ts" --include_body true
```

### With pre-commit-ai-review
Verify architectural impact before committing:
```bash
# Check what depends on your changes
mcp__claude-context__search_code "code depending on MyFunction" --path /project/path

# If many dependencies, get AI review
mcp__unitAI__ask-gemini --prompt "@changed-file.ts Validate architectural impact"
```

## Advanced Queries

### Finding Architectural Relationships
```bash
# What depends on this component?
mcp__claude-context__search_code "code that uses RedisManager" --path /project/path

# What are similar implementations?
mcp__claude-context__search_code "similar caching implementations" --path /project/path

# What calls this function?
mcp__claude-context__search_code "where is executeTask called from" --path /project/path
```

### Pattern Detection
```bash
# Find duplicate code
mcp__claude-context__search_code "duplicate database connection logic" --path /project/path

# Find inconsistencies
mcp__claude-context__search_code "different error handling patterns" --path /project/path
```

### Dependency Mapping
```bash
# Map dependency chain
mcp__claude-context__search_code "what depends on shared/types" --path /project/path

# Find circular dependencies
mcp__claude-context__search_code "circular dependency between modules" --path /project/path
```

