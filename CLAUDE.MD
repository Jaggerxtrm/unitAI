# CLAUDE (Compact)

**Created:** 2025-11-07 00:00 UTC
**Last Updated:** 2025-11-07 00:00 UTC
**Version:** 3.0
**Status:** Active
**Supersedes:** 2.5

SSOT: `CLAUDE.md`

## PROJECT: unified-ai-mcp-tool

Multi-AI orchestration MCP server. Stack: TypeScript, Node.js, MCP protocol. Backends: Qwen CLI, Gemini CLI, Rovodev CLI. Features: smart-workflows, intelligent model selection, recursive MCP architecture.

---

## 0) PRINCIPLES
- MUST use deterministic rules; avoid prosa.
- DEFAULT TO PARALLEL tool calls unless A→B dependency.
- NEVER create new docs without explicit user approval.
- Prefer UPDATE over CREATE; maintain SSOT.

## 1) SESSION INIT (ALWAYS ON NEW CONVERSATION)
- Run:
  - git log --oneline -5
  - git diff HEAD~3..HEAD --stat
  - git status
  - git branch -vv
- Memory search (always useful):
  - openmemory-search-memories "recent work on unified-ai-mcp"
  - openmemory-search-memories "<YYYY-MM-DD> <topic>" (e.g., "2025-11-07 workflow")
  - openmemory-search-memories "similar implementation or pattern"
- Outcome: establish recent changes, current branch, relevant memories.

## 3) TOOL AUTO-TRIGGERS & ADVANCED WORKFLOWS

**CLAUDE-CONTEXT: Architectural Navigator & Pattern Finder**
- ALWAYS use repo root: /home/dawid/Projects/unified-ai-mcp-tool
- Index: mcp__claude-context__index_codebase --path /home/dawid/Projects/unified-ai-mcp-tool
- Search: mcp__claude-context__search_code "query" --path /home/dawid/Projects/unified-ai-mcp-tool
- Queries (semantic, not keyword):
  - "Where is executeAIClient called from?" (finds ALL callers)
  - "What code depends on aiExecutor?" (maps dependencies)
  - "Find similar workflow implementations" (pattern detection)
  - "What modules use MCP tools?" (architectural relationships)
  - "Find duplicate error handling patterns" (duplication detection)
- Use BEFORE: feature implementation, bug hunting, refactoring, schema changes
- Why: Hybrid search (BM25 + vectors), finds related code across codebase without reading files
**SERENA: Symbol-Level Code Surgery (LSP-Based)**
Use for: Precise code navigation, safe refactoring, symbol-based editing
Power: 75-80% token reduction vs full file reads
Key operations:
- mcp__serena__find_symbol "NamePath" --include_body true (localize symbols)
- mcp__serena__find_referencing_symbols "NamePath" (impact analysis, find ALL usages)
- mcp__serena__get_symbols_overview "file.ts" (map file structure)
- mcp__serena__replace_symbol_body "NamePath" "new_code" (surgical edit)
- mcp__serena__rename_symbol "NamePath" "new_name" (safe rename across codebase)
When: BEFORE editing, ALWAYS use find_symbol + find_referencing_symbols for impact analysis

**UNIFIED-AI-MCP: Multi-Model Analysis (Run in Parallel)**
Use for: Complex code, pre-commit review, multi-perspective validation
Strengths:
- ask-gemini: Architecture patterns, best practices, security/performance, detailed suggestions
- ask-qwen: Quick pattern recognition, code quality, redundancy detection, bottleneck spotting
- ask-rovodev: Production-ready code generation, bug fixes, implementation
Run multiple in parallel, compare results for synthesis

Examples:
```
# Parallel analysis
mcp__unified-ai-mcp__ask-gemini --prompt "@file.ts 1) Architecture review 2) Best practices 3) Security"
mcp__unified-ai-mcp__ask-qwen --prompt "@file.ts 1) Code quality issues 2) Redundant patterns 3) Performance"

# Production implementation
mcp__unified-ai-mcp__ask-rovodev --prompt "@file.ts Implement OAuth flow with error handling"
```

**INTEGRATED WORKFLOWS**

*Feature Implementation:*
1. claude-context: "Where does similar feature exist?" → Find related modules
2. Serena: find_symbol + get_symbols_overview → Understand current architecture
3. Parallel: ask-gemini + ask-qwen analyze existing pattern for best practices
4. ask-rovodev: Generate production-ready implementation
5. Serena: find_referencing_symbols → Impact analysis before changes
6. Serena: replace_symbol_body or insert_after_symbol → Surgical modification
7. claude-context: "Find all callers/imports of new function" → Verify impact
8. openmemory-add-memory "Implemented [feature]"

*Bug Hunting:*
1. claude-context: "Where is error message generated?" → Locate root cause
2. Serena: find_symbol + find_referencing_symbols → Call graph + impact
3. Parallel: ask-gemini + ask-qwen analyze for logic errors & patterns
4. Serena: replace_symbol_body → Surgical fix
5. claude-context: "Find all affected call sites" → Verify fix
6. openmemory-add-memory "Fixed [bug]: [root cause]"

*Refactoring (Safe with Serena):*
1. claude-context: "Find all functions with pattern X" → Scope
2. Serena: get_symbols_overview → Map file structure
3. Serena: find_referencing_symbols → Identify ALL usages (critical for safe refactoring)
4. Parallel: ask-gemini + ask-qwen → Refactoring strategy
5. Serena: rename_symbol or replace_symbol_body → Safe, surgical changes
6. claude-context: "Find similar code" → Ensure consistency
7. openmemory-add-memory "Refactored [scope]: [changes]; affects [X] files"

**DeepWiki (GitHub repository documentation):**
- For external repos (MCP servers, TypeScript libraries)
- mcp__deepwiki__read_wiki_structure "owner/repo"
- mcp__deepwiki__ask_question "owner/repo" "question"
- Use: architecture insights on dependencies

**Open-Memory (decisions & changes):**
- Search before answering: "recent work", "<YYYY-MM-DD> <topic>"
- Add after changes: "Implemented X", "Fixed bug: Y", "Workflow update: Z"

**Context7 (external library API docs):**
- mcp__context7__resolve-library-id "library"
- mcp__context7__get-library-docs "/org/project" --topic "topic" --tokens 5000

## 4) FILE SIZE DECISION TREE
- <300 LOC → Read tool ok
- 300–500 LOC → Serena (get_symbols_overview + find_symbol) for targeted reads
- 500–1000 LOC → Serena + claude-context scoped
- >1000 LOC → Serena (symbol-level) + ask-gemini for analysis
- ALWAYS: Serena find_referencing_symbols before editing (75-80% token savings)

## 5) MISSING/MOVED FILE RECOVERY
- mcp__claude-context__search_code "where is <X> now?" --path /home/dawid/Projects/unified-ai-mcp-tool
- Serena: mcp__serena__find_file "<name>" (if symbol-based)
- Glob: **/<name.ext>, **/<partial>*.ts
- Grep: rg -n "<signature>" --glob '!**/node_modules/**'
- Git renames: git log --name-status -n 20 | grep -E "^R" || true
- If large candidate (>200 LOC): Serena get_symbols_overview or ask-gemini
- Update memory: "File moved: <old> -> <new> (reason)"

## 6) DOCUMENTATION GATE (MANDATORY BEFORE NEW .md)
- Pre-search (semantic, root path): 2–3 queries
- Inventory:
  - glob "docs/*.md", "**/README*.md"
  - git log -5 --stat | grep "\.md$" || true
  - grep -inE "<topic>|<keyword>" -R docs/ || true
- Triage:
  - Related doc exists → UPDATE it (no new file)
  - Full rewrite → create successor ONE, deprecate old with banner
  - None exists → CREATE only with explicit user approval
- Metadata required in all docs:
  - Title, Created/Updated, Version, Status, Supersedes
- SSOT: one active doc per topic
- Archive policy: move to archive/ with ARCHIVED_ prefix

## 9) ADVANCED PRE-COMMIT VALIDATION (Multi-Stage)

**Stage 1: Scope Analysis (Serena + claude-context)**
- Serena: find_referencing_symbols → Identify ALL usages of modified symbols
- Serena: get_symbols_overview → Map structural changes
- claude-context: "What code depends on my changes?"
- claude-context: "Find all files importing modified module"
- Outcome: Complete impact map, breaking change detection

**Stage 2: Parallel AI Review (ask-gemini + ask-qwen)**
```
# Both in parallel
mcp__unified-ai-mcp__ask-gemini --prompt "@modified_file.ts Validate: 1) Architecture 2) Error handling 3) Performance 4) Security"
mcp__unified-ai-mcp__ask-qwen --prompt "@modified_file.ts Check: 1) Code quality issues 2) Redundant logic 3) Potential bugs 4) Edge cases"
```
- ask-gemini provides architectural validation
- ask-qwen catches edge cases and quality issues
- Compare outputs, synthesize findings

**Stage 3: Dependency Verification (Serena + claude-context)**
- Serena: find_referencing_symbols → Find ALL callers (LSP-based, 100% accurate)
- claude-context: "Verify changes compatible with call sites"
- claude-context: "Find tests related to modified code"

**Stage 4: Memory Update**
- openmemory-add-memory "Refactored [module]: [what changed]; validated with Serena + claude-context + ask-gemini/qwen; affects [X] files"

## 10) KEY CONFIGS & LOCATIONS
- package.json: Dependencies, scripts, MCP server entry
- tsconfig.json: TypeScript compiler config
- src/: Main source code (utils/, workflows/, tools/)
- docs/: Documentation (UNIFIED_AUTONOMOUS_SYSTEM_PLAN.md, CLAUDE_SKILLS_HOOKS_GUIDE.md)
- docker/: Containerization (Dockerfile, docker-compose.yml)
- .claude/: Skills & hooks (when implemented)
- ~/.claude.json: MCP server configurations

## 11) AGENT BEHAVIOR SUMMARY
**DO:**
- Check memories & commits at session start
- Use Serena find_symbol + find_referencing_symbols BEFORE editing (impact analysis)
- Use claude-context for architectural queries before any code work
- Run ask-gemini + ask-qwen in PARALLEL for complex analysis
- Use Serena for surgical, symbol-level modifications (75-80% token savings)
- Use claude-context to find ALL affected code (refactoring, bug fixes)
- Run advanced pre-commit validation (Serena + claude-context + ask-gemini/qwen)
- Update memory after significant changes with architectural impact
- Verify SSOT for docs

**DON'T:**
- Read huge files directly (use Serena get_symbols_overview + find_symbol)
- Edit symbols without find_referencing_symbols first (breaks code!)
- Implement without understanding code relationships (use claude-context + Serena first)
- Review single-file changes without impact analysis
- Create new docs without approval
- Push to remote unless asked
- Commit secrets
- Use emoji in code/docs

## 12) TOOL QUICK GUIDE
| Tool | When | Purpose | Key Power |
|------|------|---------|-----------|
| **Serena** | BEFORE any edit, for navigation | Symbol-level code surgery | LSP-based; finds ALL references; 75-80% token savings; safe refactoring |
| **Claude-Context** | FIRST, for discovery | Architectural navigator | Semantic search; finds ALL related code; maps dependencies; detects patterns |
| **ask-gemini** | Complex analysis, architecture | Deep AI reasoning | Best practices, security, performance, architectural patterns |
| **ask-qwen** | Parallel with ask-gemini | Fast AI perspective | Code quality, redundancy, edge cases; catches what Gemini misses |
| **ask-rovodev** | Production code generation | Implementation expert | Bug fixes, production-ready code, detailed implementations |
| **DeepWiki** | External repo internals | GitHub documentation | Architecture insights on dependencies (MCP servers, libraries) |
| **Open-Memory** | After significant work | Decision storage | Historical context, date-based queries, architectural decisions |
| **Context7** | External library usage | API documentation | TypeScript, Node.js, MCP protocol specifics |

**Workflow Principle**: claude-context FIRST (discover) → Serena (navigate symbols) → ask-gemini/qwen (analyze) → Serena (edit) → Serena find_referencing_symbols (verify impact)

---

**Last Updated**: 2025-11-07 00:00 UTC