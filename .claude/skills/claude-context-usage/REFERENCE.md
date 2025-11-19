# Claude-Context Reference

Complete API reference and advanced usage.

## Commands

### index_codebase
Indexes a codebase for semantic search.

```bash
mcp__claude-context__index_codebase --path /absolute/path/to/codebase
```

**Parameters**:
- `--path`: Absolute path to codebase directory (required)
- `--force`: Force re-indexing even if already indexed (optional)
- `--splitter`: Code splitter ('ast' or 'langchain', default: 'ast')
- `--customExtensions`: Additional file extensions to include (optional)
- `--ignorePatterns`: Additional patterns to ignore (optional)

**When to use**: Before first search in a new codebase or after major refactoring.

### search_code
Performs semantic search on indexed codebase.

```bash
mcp__claude-context__search_code "natural language query" --path /absolute/path --limit 10
```

**Parameters**:
- Query (positional): Natural language search query (required)
- `--path`: Absolute path to search in (required)
- `--limit`: Maximum number of results (default: 10, max: 50)
- `--extensionFilter`: Filter by file extensions like ['.ts', '.py'] (optional)

**Query Tips**:
- Use natural language, not keywords
- Be specific about what you're looking for
- Include context: "where is X called from Y"
- Ask questions: "how does authentication work?"

## Search Hierarchy (Updated with Serena)

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

## Expected Benefits

- **Token Efficiency**: ~10,000 tokens → ~1,000 tokens (90% reduction) for discovery
- **Comprehensive Search**: Finds code you didn't know existed
- **Architectural Insights**: Reveals dependency chains and relationships
- **Pattern Recognition**: Identifies similar implementations and duplication
- **Relationship Mapping**: Shows how components connect

## Performance Characteristics

- **Indexing Time**: 30-120 seconds for medium codebase (~100k LOC)
- **Search Time**: <1 second for typical queries
- **Token Cost**: ~1,000 tokens per search query
- **Memory Usage**: Minimal, index stored on disk

## Limitations

- Requires initial indexing (one-time cost)
- Best for TypeScript/JavaScript/Python codebases
- Quality depends on code organization and comments
- May miss very obscure relationships

## Troubleshooting

**"Codebase not indexed"**
→ Run `mcp__claude-context__index_codebase` first

**"No results found"**
→ Try broader query, check spelling, verify path

**"Too many results"**
→ Be more specific in query, use extensionFilter

**"Results not relevant"**
→ Rephrase as question, add more context

