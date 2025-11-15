# Skills and Hooks Guide

**Version:** 1.0  
**Last Updated:** 2025-11-14

Simplified guide to Claude Code Skills and Hooks in unified-ai-mcp-tool.

For complete technical details, see [Integrations Guide](../INTEGRATIONS.md).

---

## What Are Skills and Hooks?

**Skills** are instructions that Claude Code reads at startup. They define capabilities and when to use them.

**Hooks** are scripts that run automatically on specific events (like before using a tool or after getting results).

Think of them as:
- **Skills** = "What Claude can do" (declarative)
- **Hooks** = "When Claude should do it" (procedural)

---

## Active Skills

The project includes 9 skills that help Claude work more efficiently:

### 1. unified-ai-orchestration

**What it does:** Enables smart workflow execution

**When it activates:** Keywords like "workflow", "validate", "review"

**Example:**
```
"Review this code" → Suggests parallel-review workflow
```

### 2. serena-surgical-editing

**What it does:** Symbol-level code navigation (saves 75-80% tokens)

**When it activates:** Keywords like "refactor", "edit function", working with code files

**Example:**
```
"Refactor the executeAIClient function" 
→ Suggests using Serena to find all references first
```

### 3. pre-commit-ai-review

**What it does:** Validates changes before commit

**When it activates:** Keywords like "commit", "validate staged changes"

**Example:**
```
"Validate my changes" → Runs pre-commit-validate workflow
```

### 4. token-aware-orchestration

**What it does:** Suggests token-efficient alternatives

**When it activates:** Before reading large code files

**Example:**
```
About to read 500-line file
→ Suggests: "Use Serena instead (75-80% token savings)"
```

### 5. memory-search-reminder

**What it does:** Reminds to search past decisions

**When it activates:** Before implementing new solutions

**Example:**
```
"Implement authentication" 
→ Suggests: "Search memories for past auth implementations"
```

### Other Skills

- **claude-context-usage**: Semantic code search
- **documentation-lookup**: API documentation access
- **second-guessing-verification**: Validate tool results
- **post-stop-resumption**: Session restoration

---

## Active Hooks

### 1. workflow-pattern-detector

**Type:** UserPromptSubmit (before processing your message)

**What it does:** Detects patterns and suggests workflows

**Patterns:**
- "implement/feature" → feature-design workflow
- "bug/error/fix" → bug-hunt workflow
- "review/analyze" → parallel-review workflow
- "commit/validate" → pre-commit-validate workflow

**Example:**
```
You: "I need to implement OAuth authentication"
Hook: Suggests feature-design workflow with includeAPI: true
```

### 2. pre-tool-use-enforcer

**Type:** PreToolUse (before executing tools)

**What it does:** Suggests token-efficient alternatives

**Suggestions:**
- Read on code files → Use Serena (75-80% savings)
- Grep on codebase → Use claude-context (semantic search)
- Multiple file reads → Use claude-context search

**Example:**
```
About to: Read src/utils/tokenEstimator.ts (450 lines)
Hook: "Use Serena get_symbols_overview instead (saves ~360 tokens)"
```

### 3. skill-activation-prompt

**Type:** UserPromptSubmit

**What it does:** Activates relevant skill based on keywords

**Example:**
```
You: "Search the codebase for error handling patterns"
Hook: Activates claude-context-usage skill
```

### 4. post-tool-use-tracker

**Type:** PostToolUse (after tool execution)

**What it does:** Tracks file changes and suggests next actions

**Example:**
```
After: Writing to important file
Hook: "Consider running pre-commit-validate"
```

---

## How They Work Together

### Example 1: Refactoring Workflow

```
1. You: "Refactor the executeAIClient function"
   
2. skill-activation-prompt (hook)
   → Detects "refactor" keyword
   → Activates serena-surgical-editing skill

3. Skill suggests workflow:
   → "Use Serena to find all references first"
   
4. Claude uses Serena:
   → mcp__serena__find_referencing_symbols("executeAIClient")
   → Finds 9 usages across 4 files
   
5. Claude performs safe refactoring
   → Knows impact scope
   → Won't break dependencies

6. post-tool-use-tracker (hook)
   → Suggests: "Run pre-commit-validate to verify changes"
```

### Example 2: Bug Investigation

```
1. You: "Users are getting 500 errors on file upload"

2. workflow-pattern-detector (hook)
   → Detects "error" keyword
   → Suggests: bug-hunt workflow

3. You accept suggestion

4. bug-hunt workflow executes:
   → Uses Qwen to find related files
   → Uses Gemini for root cause analysis
   → Uses Rovodev for fix recommendations

5. memory-search-reminder (hook)
   → "Search memories for similar bug patterns"
```

### Example 3: Feature Development

```
1. You: "Implement user authentication with OAuth2"

2. workflow-pattern-detector (hook)
   → Detects "implement" keyword
   → Suggests: feature-design workflow

3. feature-design workflow runs:
   → ArchitectAgent (Gemini): Designs architecture
   → ImplementerAgent (Rovodev): Creates implementation plan
   → TesterAgent (Qwen): Generates test strategy

4. During implementation:
   → pre-tool-use-enforcer suggests Serena for code edits
   → memory-search-reminder suggests checking past auth patterns

5. Before commit:
   → pre-commit-ai-review skill triggers validation
```

---

## Customization

Skills and hooks are configured but you don't need to modify them. They work automatically based on your actions and keywords.

### If You Want to Customize

**Skills location:**
```
.claude/skills/[skill-name]/SKILL.md
```

**Hooks location:**
```
.claude/hooks/[hook-name].ts
```

**Note:** The current configuration is optimized for unified-ai-mcp-tool. Customization is optional and advanced.

---

## Best Practices

### Trust the Suggestions

Skills and hooks are designed to save you tokens and time. When they suggest alternatives:

```
Suggestion: "Use Serena instead of Read (75-80% token savings)"
→ Usually better to follow
```

### Keywords Matter

Use clear keywords to trigger the right skills:

**Good:**
- "Refactor the auth module" (triggers serena-surgical-editing)
- "Validate my commit" (triggers pre-commit-ai-review)
- "Search codebase for error handling" (triggers claude-context-usage)

**Less specific:**
- "Fix this" (unclear what needs fixing)
- "Do something with the code" (too vague)

### Progressive Workflow

Let skills and hooks guide you through best practices:

```
1. Start: "Initialize session" (init-session)
2. Work: Make changes
3. Review: "Review my changes" (parallel-review)
4. Validate: "Validate staged changes" (pre-commit-validate)
5. Commit: git commit
6. Verify: "Validate last commit" (validate-last-commit)
```

---

## Common Patterns

### Pattern: Token Optimization

```
Scenario: Need to analyze large code file

Without skills/hooks:
→ Read entire file (500 tokens)
→ Expensive for simple queries

With skills/hooks:
→ pre-tool-use-enforcer suggests Serena
→ Use get_symbols_overview (80 tokens, 84% savings)
→ More efficient
```

### Pattern: Safe Refactoring

```
Scenario: Rename function used in many places

Without skills/hooks:
→ Manual search for usages
→ Risk missing some references
→ Potential breaking changes

With skills/hooks:
→ serena-surgical-editing activates
→ Suggests find_referencing_symbols first
→ Shows ALL usages (LSP-based, 100% accurate)
→ Safe rename across codebase
```

### Pattern: Workflow Auto-Selection

```
Scenario: User describes a problem

Without skills/hooks:
→ You choose tool manually
→ Might choose suboptimal approach

With skills/hooks:
→ workflow-pattern-detector analyzes intent
→ Suggests best workflow for the task
→ Optimal tool selection
```

---

## Troubleshooting

### Skill Not Activating

**Check keywords:**
- Use explicit terms ("refactor", "validate", "search")
- Be specific about what you want

**Verify skill exists:**
```bash
ls .claude/skills/
```

### Hook Not Running

**Hooks run silently:**
- Look for suggestions in Claude's response
- Check logs: `.claude/tsc-cache/*/hook-name.log`

**Enable debug mode:**
```bash
claude --debug
```

### Unexpected Suggestions

**Hooks are suggestive, not mandatory:**
- You can ignore suggestions
- They're optimized for common cases
- Use your judgment

---

## Advanced Topics

For advanced usage:

- **Creating Custom Skills:** See [Integrations Guide](../INTEGRATIONS.md)
- **Writing Hooks:** See [Integrations Guide](../INTEGRATIONS.md)
- **MCP Server Integration:** See [Integrations Guide](../INTEGRATIONS.md)

---

## Quick Reference

```
SKILLS (What Claude can do)
  unified-ai-orchestration    → Smart workflows
  serena-surgical-editing     → Token-efficient code editing
  pre-commit-ai-review        → Pre-commit validation
  token-aware-orchestration   → Token optimization suggestions
  memory-search-reminder      → Check past decisions

HOOKS (When Claude does it)
  workflow-pattern-detector   → Auto-suggest workflows
  pre-tool-use-enforcer       → Suggest token-efficient tools
  skill-activation-prompt     → Activate relevant skills
  post-tool-use-tracker       → Suggest next actions

KEY PATTERNS
  Refactor → serena-surgical-editing → find references first
  Commit → pre-commit-ai-review → validate before commit
  Large file → token-aware → use Serena instead of Read
  Bug → workflow-pattern-detector → suggests bug-hunt
  Feature → workflow-pattern-detector → suggests feature-design
```

---

## See Also

- [Integrations Guide](../INTEGRATIONS.md) - Complete technical details
- [Workflows Guide](../WORKFLOWS.md) - Workflow documentation
- [Getting Started](./getting-started.md) - Installation and setup
