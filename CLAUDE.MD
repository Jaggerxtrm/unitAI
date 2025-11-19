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

**Use init-session workflow:**
```typescript
mcp__unified-ai-mcp__smart-workflows({
  workflow: "init-session",
  params: {}
})
```
- Analyzes last 10 commits + AI synthesis
- Generates 3 memory query suggestions
- Shows repo status, branch, CLI availability

**Then execute suggested memory queries:**
- openmemory-search-memories "recent work on unified-ai-mcp"
- openmemory-search-memories "<YYYY-MM-DD> <topic>"

## 3) MCP TOOLS & WORKFLOWS

**CLAUDE-CONTEXT** (Repo: /home/dawid/Projects/unified-ai-mcp-tool)
- Index: mcp__claude-context__index_codebase --path <repo>
- Search: mcp__claude-context__search_code "semantic query" --path <repo>
- Use BEFORE: features, bugs, refactors (finds ALL related code, 0 file reads)

**SERENA** (75-80% token savings)
- mcp__serena__find_symbol "Name" --include_body true
- mcp__serena__find_referencing_symbols "Name" (ALL usages)
- mcp__serena__get_symbols_overview "file.ts"
- mcp__serena__replace_symbol_body / rename_symbol
- ALWAYS: find_referencing_symbols before edit (impact analysis)

**UNIFIED-AI-MCP** (Parallel analysis)
- ask-gemini: Architecture, best practices, security
- cursor-agent: Refactor plan, patch chirurgiche, bugfix guidati
- droid: Checklist autonome, remediation plan

**3.1) MANUAL PATTERNS** (See 3.5 for automated workflows)
*Feature:* claude-context → Serena → ask-gemini + cursor-agent → droid (piano) → Serena verify
*Bug:* claude-context locate → Serena impact → cursor-agent (fix) → droid (remediation) → Serena apply
*Refactor:* Serena find_referencing_symbols → cursor-agent (patch) → ask-gemini review → Serena rename_symbol

**3.5) SMART WORKFLOWS** (Automated Multi-Agent Orchestration)

**When:** Use workflows for standard processes; tool-direct for custom exploration

| Workflow | Trigger | Params | Output |
|----------|---------|--------|--------|
| `init-session` | Every new conversation | `{}` | Git analysis + AI synthesis + memory queries |
| `pre-commit-validate` | Before commit | `{ depth: "quick\|thorough\|paranoid" }` | Security + quality + breaking changes → PASS/WARN/FAIL |
| `parallel-review` | Code review needed | `{ files: [...], focus: "architecture\|quality\|security" }` | Gemini + Rovodev parallel analysis |
| `validate-last-commit` | Post-commit validation | `{ commit_ref: "HEAD" }` | Gemini + Qwen commit analysis → verdict |
| `bug-hunt` | Bug unknown cause | `{ symptoms: "detailed description" }` | Root cause + fix + test plan |
| `feature-design` | Complex feature design | `{ featureDescription: "...", targetFiles: [...] }` | Architect + Implementer + Tester phases |

**Invocation:**
```typescript
mcp__unified-ai-mcp__smart-workflows({
  workflow: "WORKFLOW_NAME",
  params: { /* see table */ }
})
```

**Decision Tree:**
```
Standard process (commit/bug/review/feature)? → smart-workflows
Custom exploration? → Tool direct (Serena / claude-context / ask-gemini / cursor-agent / droid)
```

**Auto-Suggestions:** `workflow-pattern-detector` hook suggests workflows on pattern match (always ask user before executing)

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

**3.6) AGENTS** (.claude/agents/ - Task tool delegation)

**When:** Complex multi-phase tasks needing specialized orchestration (NOT for simple queries)

| Agent | Use Case | Key Feature |
|-------|----------|-------------|
| `gemini-codebase-analyzer` | Large codebase analysis, bug hunting | Parallel gemini+qwen, Serena integration |
| `implementation-validator` | Pre-commit validation, impact analysis | Aggressive Serena (75-95% token savings) |
| `infrastructure-analyzer` | Pipeline review, system architecture | 5-phase methodology + Context7 |
| `rovodev-task-handler` | Production code generation, refactoring | Haiku model (70% cost savings) |
| `triple-validator` | High-risk architectural decisions | Parallel 3-model validation (60-70% time savings) |

**Invocation:**
```typescript
Task({ subagent_type: "AGENT_NAME", prompt: "task description" })
```

**Decision:**
- Multi-phase complex task (architecture, high-risk refactor)? → Agent
- Simple query/analysis? → Tool direct (Serena / ask-gemini / cursor-agent)
- See: docs/AGENT_MIGRATION_GUIDE.md

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

## 9) PRE-COMMIT VALIDATION

**Automated (ALWAYS use):**
```typescript
mcp__unified-ai-mcp__smart-workflows({
  workflow: "pre-commit-validate",
  params: { depth: "quick" }  // or "thorough" / "paranoid"
})
```
- quick (10-30s): Syntax + Qwen security
- thorough (60-120s): + Gemini best practices + breaking changes
- paranoid (180-300s): + Rovodev parallel analysis

**Manual (fallback if workflow unavailable):**
1. Serena: find_referencing_symbols → ALL usages
2. claude-context: "What depends on changes?"
3. Parallel: ask-gemini + cursor-agent (aggiungi droid per checklist se necessario)
4. openmemory-add-memory "Validated [scope]"

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
- Code files: Serena (ALWAYS, no exceptions - 75-80% token savings)
- Session start: init-session workflow
- Pre-commit: pre-commit-validate workflow
- Code review: parallel-review workflow
- Bugs: bug-hunt workflow
- Features: feature-design workflow
- Before edit: Serena find_referencing_symbols (impact analysis)
- Before implementation: claude-context (discover related code)
- Complex analysis: ask-gemini + cursor-agent (parallel) + droid (checklist)
- After changes: update memory

**DON'T:**
- Read code files directly (ALWAYS use Serena)
- Edit without find_referencing_symbols (breaks code!)
- Skip workflows for standard tasks (commit/bug/review/feature)
- Create docs without approval
- Push unless asked
- Commit secrets

## 12) TOOL SELECTION GUIDE

**Priority by Task Type:**

| Task | Tool | Why |
|------|------|-----|
| **Code file access** | **Serena** (ALWAYS) | 75-80% token savings; symbol-level; LSP-based |
| **Session init** | init-session workflow | Automated git+AI analysis |
| **Commit validation** | pre-commit-validate workflow | Multi-stage security+quality |
| **Bug hunting** | bug-hunt workflow | Root cause analysis |
| **Code review** | parallel-review workflow | Gemini+Rovodev parallel |
| **Feature design** | feature-design workflow | Multi-agent orchestration |
| **Complex multi-phase** | Task agents (5 types) | Specialized orchestration; parallel validation; 50-95% savings |
| **Codebase search** | claude-context | Semantic; finds ALL related code |
| **Custom AI analysis** | ask-gemini / cursor-agent / droid | Scegli tool in base a contesto (architettura vs refactor vs remediation) |
| **Simple non-code** | Read | Only if <300 LOC |

**Decision Rules:**
1. Code file? → **Serena** (no exceptions)
2. Standard process (commit/bug/review/feature)? → **smart-workflows**
3. Complex multi-phase (architecture/high-risk)? → **Task agents**
4. Need to find related code? → **claude-context**
5. Custom analysis? → **ask-gemini / cursor-agent / droid** (parallel)
6. Simple config file? → Read ok

## 13) AUTONOMOUS TOKEN-AWARE ENFORCEMENT

**PRE-Tool Decision System (Automatic):**
Claude now autonomously detects inefficient tool usage BEFORE execution and suggests alternatives:

| Detected Action | Auto-Suggestion | Reason |
|-----------------|-----------------|---------|
| Read on code files (.ts/.js/.py) | ❌ BLOCK → Use Serena | 75-80% token savings |
| Grep on codebase | ❌ BLOCK → Use claude-context | Semantic search faster & better |
| Bash cat/grep commands | ❌ BLOCK → Use Serena/claude-context | Symbol-level access |

**Pattern-Based Workflow Triggering (Automatic):**
Hook detects patterns → suggests workflow (ask user confirmation before executing):

| Pattern | Workflow | Command |
|---------|----------|---------|
| "implement\|feature\|create" | feature-design | `mcp__unified-ai-mcp__smart-workflows({ workflow: "feature-design", params: { featureDescription: "...", targetFiles: [...] } })` |
| "bug\|error\|fix\|broken" | bug-hunt | `mcp__unified-ai-mcp__smart-workflows({ workflow: "bug-hunt", params: { symptoms: "..." } })` |
| "review\|analyze\|audit" | parallel-review | `mcp__unified-ai-mcp__smart-workflows({ workflow: "parallel-review", params: { files: [...], focus: "quality" } })` |
| "commit\|validate" | pre-commit-validate | `mcp__unified-ai-mcp__smart-workflows({ workflow: "pre-commit-validate", params: { depth: "thorough" } })` |

**Token Estimation:** LOC × 0.4 → classify (small <300, medium 300-600, large >600) → suggest tool

**Decision Flow:**
1. Pattern detect (feature/bug/review?) → suggest workflow
2. File analysis → Code? Serena. Multi-file? Workflow. Simple? Read ok.
3. Execute with user confirmation

**Enforcement:** SUGGESTIVE (shows alternatives, doesn't block)

**Implementation:**
- src/utils/tokenEstimator.ts
- .claude/hooks/pre-tool-use-enforcer.ts
- .claude/hooks/workflow-pattern-detector.ts

---

**Last Updated**: 2025-11-16 14:00 UTC