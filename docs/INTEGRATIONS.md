# Integrations Guide

**Version:** 1.0  
**Last Updated:** 2025-11-14  
**Status:** Active

This guide explains how unified-ai-mcp-tool integrates with external systems including MCP servers, Claude Code Skills, and Hooks.

---

## Table of Contents

- [MCP Servers](#mcp-servers)
- [Skills System](#skills-system)
- [Hooks System](#hooks-system)
- [Best Practices](#best-practices)

---

## MCP Servers

### Overview

The unified-ai-mcp-tool can integrate with external MCP servers to extend functionality. Currently supported integrations:

### Serena (Symbol-Level Code Navigation)

**Purpose:** Symbol-level code surgery for precise, token-efficient code analysis and modification.

**When to Use:**
- Navigating large codebases (>300 LOC files)
- Finding all references to a symbol
- Safe refactoring with impact analysis
- Surgical code modifications

**Key Operations:**
- `mcp__serena__find_symbol`: Locate symbol definitions
- `mcp__serena__find_referencing_symbols`: Find all usages (100% accurate, LSP-based)
- `mcp__serena__get_symbols_overview`: Map file structure
- `mcp__serena__replace_symbol_body`: Surgical edits
- `mcp__serena__rename_symbol`: Safe rename across codebase

**Token Savings:** 75-80% compared to reading full files

**Example Pattern:**

```
Before Refactoring:
1. serena.find_referencing_symbols("FunctionName") 
   → Identifies ALL usages
2. serena.get_symbols_overview("file.ts") 
   → Map file structure
3. Analyze impact
4. serena.rename_symbol("FunctionName", "NewName") 
   → Safe rename everywhere
```

### claude-context (Semantic Code Search)

**Purpose:** Semantic search across codebase using hybrid BM25 and vector search.

**When to Use:**
- Finding related code without knowing exact names
- Architectural discovery (what depends on X?)
- Pattern detection across files
- Understanding code relationships

**Key Operations:**
- `mcp__claude-context__index_codebase`: Index repository
- `mcp__claude-context__search_code`: Semantic search with natural language

**Example Queries:**
- "Where is executeAIClient called from?"
- "What code depends on aiExecutor?"
- "Find similar workflow implementations"

**Why Semantic:** Finds related code even with different naming, unlike grep/regex.

### context7 (API Documentation)

**Purpose:** Access API documentation for external libraries.

**When to Use:**
- Understanding library APIs
- Looking up method signatures
- Checking parameter types

**Key Operations:**
- `mcp__context7__resolve-library-id`: Find library
- `mcp__context7__get-library-docs`: Get documentation

### deepwiki (Repository Analysis)

**Purpose:** Analyze external GitHub repositories.

**When to Use:**
- Understanding MCP server architectures
- Learning from open source projects
- Dependency research

**Key Operations:**
- `mcp__deepwiki__read_wiki_structure`: Get repo structure
- `mcp__deepwiki__ask_question`: Query repo

### openmemory (Persistent Memory)

**Purpose:** Store and retrieve memories across sessions.

**When to Use:**
- Saving architectural decisions
- Storing patterns that worked
- Recording lessons learned

**Key Operations:**
- `mcp__openmemory__openmemory-add-memory`: Store memory
- `mcp__openmemory__openmemory-search-memories`: Search memories

### unified-ai-mcp (Toolset)

**Purpose:** Esporre i tool principali (`ask-gemini`, `cursor-agent`, `droid`, `smart-workflows`) attraverso un unico server MCP.

**When to Use:**
- Analisi/lettura profonda di codice o documentazione (`ask-gemini`)
- Refactor, bug fixing, patch chirurgiche (`cursor-agent`)
- Piani operativi autonomi e remediation (`droid`)
- Processi standardizzati (pre-commit, bug-hunt, feature-design, ecc.) tramite `smart-workflows`

**Key Operations:**
- `mcp__unified-ai-mcp__ask-gemini({ ... })`
- `mcp__unified-ai-mcp__cursor-agent({ ... })`
- `mcp__unified-ai-mcp__droid({ ... })`
- `mcp__unified-ai-mcp__smart-workflows({ workflow: "...", params: { ... } })`

**Notes:**
- Impostare `CURSOR_AGENT_TOKEN` e `DROID_API_KEY` nell'env del server MCP.
- Allegare file reali (no glob) quando si usano `files`/`attachments`.
- `smart-workflows` sfrutta automaticamente Cursor e Droid nei workflow (`parallel-review` con `strategy=double-check`, `bug-hunt`, `refactor-sprint`, `auto-remediation`).

---

## Skills System

### Overview

Skills are markdown files that Claude Code reads automatically at session start. They provide persistent instructions and capabilities.

### Structure

```
.claude/skills/
├── skill-name/
│   ├── SKILL.md              # Main entry point
│   └── ref/                  # Optional detailed documentation
│       ├── examples.md
│       ├── workflows.md
│       └── troubleshooting.md
```

### Active Skills

The unified-ai-mcp-tool project includes 9 active skills:

**1. unified-ai-orchestration**
- **Purpose:** Main orchestration skill for smart workflows
- **Triggers:** When workflows needed
- **Capabilities:** Execute all 6 production workflows

**2. serena-surgical-editing**
- **Purpose:** Symbol-level code surgery
- **Triggers:** Editing code files, refactoring
- **Capabilities:** Find symbols, rename safely, replace bodies

**3. claude-context-usage**
- **Purpose:** Semantic code search
- **Triggers:** Searching codebase, finding dependencies
- **Capabilities:** Index and search code semantically

**4. pre-commit-ai-review**
- **Purpose:** AI-powered pre-commit validation
- **Triggers:** Before commits
- **Capabilities:** Multi-depth validation (quick/thorough/paranoid)

**5. token-aware-orchestration**
- **Purpose:** Token-efficient tool suggestions
- **Triggers:** Before using Read/Grep/Bash
- **Capabilities:** Suggest better alternatives (Serena, claude-context)

**6. memory-search-reminder**
- **Purpose:** Remind to search memories
- **Triggers:** Before implementing solutions
- **Capabilities:** Query openmemory for past decisions

**7. documentation-lookup**
- **Purpose:** Efficient documentation access
- **Triggers:** API questions
- **Capabilities:** Use context7 for library docs

**8. second-guessing-verification**
- **Purpose:** Validate MCP tool results
- **Triggers:** After tool execution
- **Capabilities:** Verify tool outputs

**9. post-stop-resumption**
- **Purpose:** Session resumption handling
- **Triggers:** Resuming work
- **Capabilities:** Restore context from previous session

### When Skills Activate

Skills activate based on:

**Keywords in Prompts:**
- "refactor" → serena-surgical-editing
- "search codebase" → claude-context-usage
- "commit" → pre-commit-ai-review
- "workflow" → unified-ai-orchestration

**File Types Being Worked On:**
- Code files (.ts, .js, .py) → serena-surgical-editing + token-aware-orchestration
- Documentation (.md) → documentation-lookup

**Actions Being Performed:**
- Git operations → pre-commit-ai-review
- Tool usage → second-guessing-verification
- Implementation work → memory-search-reminder

### Creating New Skills

To create a new skill:

1. Create directory: `.claude/skills/my-skill/`
2. Create `SKILL.md` with structure:

```markdown
# My Skill Name

You are an expert in [domain].

## Core Capabilities

You can:
- Capability 1
- Capability 2

## When to Use

Use this skill when:
- Scenario 1
- Scenario 2

## Examples

[Practical examples]

## Progressive Disclosure

For detailed information:
- Details: @.claude/skills/my-skill/ref/details.md
```

3. Add reference docs in `ref/` if needed
4. Test with trigger keywords

**Key Principles:**
- Keep SKILL.md concise (<500 lines)
- Use progressive disclosure (load refs on-demand)
- Provide decision framework (when to use, when not)
- Include practical examples

---

## Hooks System

### Overview

Hooks are scripts that execute automatically on specific events in Claude Code's workflow.

### Hook Types

| Hook | When Triggered | Purpose |
|------|---------------|---------|
| SessionStart | At session beginning | Initialize context, run init-session |
| UserPromptSubmit | Before processing prompt | Detect patterns, suggest workflows |
| PreToolUse | Before tool execution | Suggest alternatives, validate |
| PostToolUse | After tool execution | Validate results, trigger actions |
| Stop | When agent loop ends | Cleanup, final reporting |

### Active Hooks

**1. skill-activation-prompt**
- **Type:** UserPromptSubmit
- **Purpose:** Detect which skill should activate
- **Logic:** Pattern matching on user message
- **Output:** Suggestion to use relevant skill

**2. workflow-pattern-detector**
- **Type:** UserPromptSubmit
- **Purpose:** Auto-suggest workflows based on intent
- **Patterns Detected:**
  - "implement/feature" → feature-design workflow
  - "bug/error/fix" → bug-hunt workflow
  - "review/analyze" → parallel-review workflow
  - "commit/validate" → pre-commit-validate workflow

**3. pre-tool-use-enforcer**
- **Type:** PreToolUse
- **Purpose:** Suggest token-efficient alternatives
- **Suggestions:**
  - Read on code files → Use Serena (75-80% token savings)
  - Grep on codebase → Use claude-context (semantic search)
  - Bash cat/grep → Use appropriate MCP tools

**4. post-tool-use-tracker**
- **Type:** PostToolUse
- **Purpose:** Track file changes and suggest next actions
- **Actions:**
  - After Write: Suggest validation
  - After multiple Reads: Suggest claude-context instead

### Hook Output Format

Hooks return JSON with optional fields:

```typescript
{
  continue: boolean,              // Continue execution? (default: true)
  
  additionalMessages: [           // Messages to add to context
    { role: 'user', content: '...' },
    { role: 'assistant', content: '...' }
  ],
  
  additionalContext: string,      // Context appended to prompt
  
  systemMessage: string,          // Message shown to Claude
  
  redirect: {                     // Redirect tool call (PreToolUse only)
    tool: string,
    arguments: object
  }
}
```

### Creating New Hooks

Hooks are TypeScript or JavaScript files in `.claude/hooks/`:

**Example: Custom Validation Hook**

```typescript
// .claude/hooks/MyValidationHook.ts

export default async function MyValidationHook(context: any) {
  const { toolName, arguments: args } = context;
  
  // Your validation logic
  if (toolName === 'Write' && isImportantFile(args.path)) {
    return {
      systemMessage: 'Important file detected. Consider running validation.',
      additionalContext: 'Remember to validate after writing to this file.'
    };
  }
  
  // No action needed
  return {};
}
```

**Hook Best Practices:**
- Fast execution (<100ms preferred)
- Fail-safe: Always return {} if no action needed
- No blocking operations
- Proper error handling with try-catch
- Logging for debugging (console.log)

---

## Best Practices

### Integration Decision Tree

**When to use what:**

```
Need to analyze code?
├─ File < 300 LOC? → Read tool OK
└─ File >= 300 LOC? → Use Serena (75-80% token savings)

Need to search codebase?
├─ Know exact name? → grep/find
└─ Semantic search? → claude-context

Need API docs?
├─ Internal project? → Read docs
└─ External library? → context7

Standard workflow needed?
├─ Pre-commit? → pre-commit-validate workflow
├─ Bug investigation? → bug-hunt workflow
├─ Code review? → parallel-review workflow
└─ Feature planning? → feature-design workflow

Custom exploration?
└─ Use MCP tools directly (Serena, claude-context)
```

### Combining Skills and Workflows

**Pattern: Skill suggests, workflow executes**

1. User: "Review this code for security issues"
2. Skill activates: pre-commit-ai-review recognizes intent
3. Skill suggests: "Use parallel-review workflow with focus: security"
4. Workflow executes: Runs Gemini + Rovodev in parallel
5. Hook validates: post-tool-use-tracker checks results

### Token Optimization Strategy

**Automatic optimization via pre-tool-use-enforcer:**

```
User about to Read large code file
  ↓
PreToolUse hook detects
  ↓
Suggests: Use Serena instead (75-80% token savings)
  ↓
User accepts suggestion
  ↓
Metrics recorded (token savings tracked)
```

**Manual optimization:**
- Use Serena for any file >300 LOC
- Use claude-context instead of multiple grep operations
- Use workflows instead of manual tool orchestration

### Error Recovery

**Hook-based error handling:**

```typescript
// PostToolUse hook example
if (result.includes('error')) {
  return {
    systemMessage: 'Tool execution failed. Consider:
      1. Retry with different parameters
      2. Use alternative tool
      3. Check logs for details',
    continue: true
  };
}
```

**Skill-based guidance:**

Skills provide fallback strategies when primary approach fails.

### Memory Integration

**Pattern: Learn from workflows**

```
Workflow succeeds
  ↓
Hook detects success
  ↓
Suggests: "Save this pattern to openmemory"
  ↓
Memory stored: "Used parallel-review for security audit.
               Gemini found X, Rovodev suggested Y.
               Pattern works well for API endpoints."
  ↓
Future sessions: memory-search-reminder suggests similar patterns
```

---

## Troubleshooting

### Skill Not Activating

**Symptoms:** Expected skill doesn't activate on trigger keyword

**Solutions:**
- Check keyword spelling in `.claude/skills/skill-rules.json` (if used)
- Verify SKILL.md is in correct location
- Check skill is not in `.claudeignore`
- Try more explicit trigger phrases

### Hook Not Executing

**Symptoms:** Hook script doesn't run on expected event

**Solutions:**
- Verify hook filename matches event type exactly
- Check file permissions (must be executable for .sh hooks)
- Review `.claude/settings.json` hook configuration
- Check logs: `.claude/tsc-cache/*/hook-name.log`
- Add console.log for debugging

### MCP Server Unavailable

**Symptoms:** External MCP server not responding

**Solutions:**
- Verify server is configured in `claude_desktop_config.json`
- Check server is running (for non-stdio servers)
- Test server with: `mcp__server-name__list-tools`
- Review MCP server logs
- Restart Claude Code

### Unexpected Behavior

**Symptoms:** Skill/hook behaves differently than expected

**Solutions:**
- Enable debug mode: `claude --debug`
- Check execution logs in `.claude/tsc-cache/`
- Verify no conflicting skills/hooks
- Test with minimal skill configuration
- Review skill/hook code for logic errors

---

## Examples

### Example 1: Refactoring with Serena

**Task:** Refactor a large function safely

**Steps:**
1. serena-surgical-editing skill activates (keyword: "refactor")
2. Use Serena to find all references:
   ```
   mcp__serena__find_referencing_symbols("oldFunctionName")
   ```
3. Review impact (9 files use this function)
4. Use Serena to rename safely:
   ```
   mcp__serena__rename_symbol("oldFunctionName", "newFunctionName")
   ```
5. Hook validates: All references updated
6. Workflow runs: pre-commit-validate with thorough depth

### Example 2: Feature Development with Workflows

**Task:** Implement new authentication feature

**Steps:**
1. Pattern detector hook suggests: feature-design workflow
2. Run workflow:
   ```json
   {
     "workflow": "feature-design",
     "params": {
       "featureDescription": "OAuth2 authentication",
       "includeAPI": true,
       "includeDB": true
     }
   }
   ```
3. Review design from ArchitectAgent
4. Follow implementation plan from ImplementerAgent
5. Implement tests from TesterAgent
6. Use parallel-review workflow for validation
7. Hook tracks: memory-search-reminder suggests similar auth patterns

### Example 3: Bug Investigation

**Task:** Find root cause of intermittent error

**Steps:**
1. User describes symptoms
2. Pattern detector suggests: bug-hunt workflow
3. Workflow discovers relevant files with Qwen
4. Gemini analyzes for root cause
5. Rovodev provides fix recommendations
6. Use Serena to implement fix safely (find_referencing_symbols first)
7. Hook validates: post-tool-use-tracker confirms fix

---

## See Also

- [Architecture Overview](./ARCHITECTURE.md) - System design
- [Workflows Guide](./WORKFLOWS.md) - Workflow documentation
- [Token Metrics](./TOKEN_METRICS.md) - Token optimization
- [CLAUDE.MD](../CLAUDE.MD) - Agent rules and guidelines
