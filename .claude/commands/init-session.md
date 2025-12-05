---
description: Initialize development session with context and memory queries
argument-hint: [--deep] [--no-memory]
allowed-tools: mcp__unitAI__workflow_init_session, mcp__openmemory__*, mcp__openmemory-cloud__*, Bash(git:*)
---

Initialize a development session by analyzing the current repository state and suggesting relevant context.

**Options:** $ARGUMENTS
- `--deep`: Analyze more commits (20 instead of 10) and use lower autonomy level
- `--no-memory`: Skip memory query suggestions

## Instructions

### Step 1: Execute Init Session Workflow

Use `mcp__unitAI__workflow_init_session` with:
- `autonomyLevel`: "low" if --deep flag is present, otherwise "read-only"
- `commitCount`: 20 if --deep flag is present, otherwise 10

### Step 2: Process Workflow Results

The workflow will return:
- Git branch and status information
- Analysis of recent commits
- CLI tools availability check
- Suggested memory queries

### Step 3: Execute Memory Queries (unless --no-memory)

If memory suggestions are provided and --no-memory is NOT set:
1. Use `mcp__openmemory-cloud__search-memories` to search for relevant past context
2. Query topics related to:
   - Recent commit subjects
   - Current branch name
   - Modified file patterns

### Step 4: Present Summary

Output a formatted summary including:
- Current branch and git status
- Recent work summary (from commit analysis)
- Relevant memories found
- Suggested next actions based on context

## Example Output Structure

```
# Session Initialized

## Git Status
- Branch: feature/new-feature
- Status: 3 files modified, 1 untracked

## Recent Work Summary
[Analysis from workflow]

## Relevant Context
[Memory search results]

## Suggested Actions
- Continue work on [feature]
- Review pending changes in [file]
```
