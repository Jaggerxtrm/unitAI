---
name: slash-init-session
description: Use /init-session to initialize a development session with project context, recent changes analysis, and suggested memory queries for efficient workflow resumption.
---

# Slash Init Session Skill

## Purpose

Automatically suggests the `/init-session` command when users want to start or resume work, providing immediate context about recent project changes and suggesting relevant memory searches.

## When to Use

This skill activates when users express intent to:
- Start a new work session
- Resume interrupted work
- Get project status overview
- Understand recent changes
- Catch up on project progress

## Command Usage

```bash
/init-session [options]
```

### Options
- `--deep`: Enable deeper analysis (uses Gemini primarily)
- `--no-memory`: Skip automatic memory query suggestions

## What It Does

1. **Repository Analysis**: Examines git status, recent commits, and staged changes
2. **AI Context Synthesis**: Uses Gemini + Qwen to analyze recent work patterns
3. **Memory Suggestions**: Generates 3 targeted memory queries based on recent activity
4. **Next Steps**: Suggests relevant follow-up actions based on project state

## Example Output

```markdown
# Session Initialization Report

## Repository Status
Branch: feature/slash-commands
Staged files: 3
Modified files: 2

## Recent Commits (Last 10)
- abc123: feat: Add slash commands infrastructure
- def456: docs: Update workflow documentation

## AI Analysis
Recent work focuses on implementing custom slash commands for workflow optimization.

## Suggested Memory Queries
1. Search for: "slash commands implementation patterns"
2. Search for: "workflow automation approaches"
3. Search for: "session initialization best practices"
```

## Integration Points

- **Workflows**: Calls `init-session` workflow automatically
- **Memory**: Suggests targeted `openmemory-search-memories` queries
- **Git**: Analyzes repository state and commit history

## Success Metrics

- **Context Provided**: Users get comprehensive project overview in <30 seconds
- **Memory Queries**: 80%+ of suggested queries are relevant to user's current work
- **Workflow Efficiency**: Reduces time-to-context from 5-10 minutes to <1 minute

---

**Skill Status**: Active
**Trigger Priority**: High
**Integration**: MCP workflows + memory search
