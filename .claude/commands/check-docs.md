---
description: Search documentation across multiple sources with optional AI backend analysis
argument-hint: <topic> [--source auto|local|context7|deepwiki|all] [--backend gemini|cursor|droid]
allowed-tools: mcp__context7__*, mcp__deepwiki__*, mcp__unitAI__ask-gemini, mcp__unitAI__ask-cursor, mcp__unitAI__droid, Grep, Glob, Read
---

Search and analyze documentation from local or external sources.

**Input:** $ARGUMENTS

## Argument Parsing

Parse the arguments to extract:
- **topic**: The search topic, path, or library name (required)
- **source**: `--source <value>` where value is `auto|local|context7|deepwiki|all` (default: "auto")
- **backend**: `--backend <value>` where value is `gemini|cursor|droid` (optional, default: none/claude)

## Execution Modes

### Mode 1: Claude Execution (no --backend specified)

You (Claude) perform the search and analysis directly using the tools below.

### Mode 2: Backend Execution (--backend specified)

Delegate the entire task to the specified AI backend. The backend will:
1. Receive the gathered documentation content
2. Perform deep analysis based on the topic
3. Return comprehensive insights

**Backend Selection:**
- `gemini`: Best for large context analysis, architectural insights
- `cursor`: Best for code-focused analysis, refactoring suggestions
- `droid`: Best for implementation guidance, operational checklists

## Source Selection Logic

**If source is "auto" or not specified:**
- If topic looks like a local path (starts with `.`, `/`, or contains `src/`, `docs/`): use local
- If topic looks like `owner/repo` (contains `/` without spaces, no path indicators): use deepwiki
- If topic matches common libraries (react, node, typescript, nextjs, express, etc.): use context7
- Otherwise: use local

**If source is "local":** Search only local documentation
**If source is "context7":** Search only external library docs via Context7
**If source is "deepwiki":** Search only GitHub repository docs via DeepWiki
**If source is "all":** Search all sources in sequence

## Search Methods by Source

### Local Documentation

1. If topic is a path, read files directly from that path
2. Otherwise, use Grep to search for the topic in:
   - `docs/` directory
   - `.claude/docs/` directory
   - `README.md`
   - `*.md` files in project root
3. Collect content from matching files

### Context7 (External Libraries)

1. Use `mcp__context7__resolve-library-id` with the topic to find the library ID
2. If found, use `mcp__context7__get-library-docs` with:
   - `context7CompatibleLibraryID`: the resolved ID
   - `topic`: the search topic (if specific subtopic provided)
3. Collect the documentation content

### DeepWiki (GitHub Repositories)

1. If topic is `owner/repo` format, use it directly
2. Use `mcp__deepwiki__ask_question` with:
   - `repoName`: the repository
   - `question`: "Documentation and usage for [topic]"
3. Alternatively, use `mcp__deepwiki__read_wiki_structure` to explore available topics

## Backend Delegation

If `--backend` is specified, after gathering documentation content:

**For Gemini:**
```
mcp__unitAI__ask-gemini with prompt:
"Analyze the following documentation about [topic]. Provide insights on:
- Key concepts and patterns
- Best practices
- Common pitfalls
- Usage recommendations

Documentation:
[gathered content]"
```

**For Cursor:**
```
mcp__unitAI__ask-cursor with prompt:
"Review the following documentation about [topic]. Focus on:
- Code patterns and examples
- Implementation suggestions
- Potential improvements
- Integration approaches

Documentation:
[gathered content]"
```

**For Droid:**
```
mcp__unitAI__droid with prompt:
"Based on the following documentation about [topic], create:
- Step-by-step implementation guide
- Operational checklist
- Verification steps

Documentation:
[gathered content]"
```

## Output Format

### Without Backend
Present results organized by source with:
- Source name as header
- Relevant excerpts or summaries
- Links to full documentation when available

### With Backend
Present:
- Brief summary of sources searched
- Full AI backend analysis
- Source attribution

## Examples

```
/check-docs react hooks
→ Claude searches context7 for React hooks documentation

/check-docs docs/architecture --backend gemini
→ Gemini analyzes the local architecture documentation

/check-docs express middleware --backend cursor --source context7
→ Cursor analyzes Express middleware docs from context7

/check-docs anthropics/claude-code
→ Claude queries DeepWiki for Claude Code repository docs

/check-docs anthropics/claude-code --backend gemini
→ Gemini provides deep analysis of Claude Code repo docs
```
