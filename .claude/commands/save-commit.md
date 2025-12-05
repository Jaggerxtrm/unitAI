---
description: Validate code stability, save to memory, and create git commit
argument-hint: "commit message" [--force] [--no-cloud] [--tag "tag-name"]
allowed-tools: mcp__unitAI__workflow_pre_commit_validate, mcp__openmemory__*, mcp__openmemory-cloud__*, Bash(git:*)
---

Safely save stable work with automatic validation, memory storage, and commit creation.

**Arguments:** $ARGUMENTS

Extract from arguments:
- **Commit message**: The quoted string (required)
- **--force**: Skip validation (optional)
- **--no-cloud**: Skip cloud memory save (optional)
- **--tag**: Tag name for memory categorization (optional)

## Instructions

### Step 1: Validate Code Stability (unless --force)

If --force is NOT present:
1. Use `mcp__unitAI__workflow_pre_commit_validate` with:
   - `depth`: "thorough"
   - `autonomyLevel`: "MEDIUM"
2. Check the result for:
   - "FAIL" status: Stop and report issues
   - "WARNINGS" status: Continue with caution note
   - "PASS" status: Proceed normally

If validation fails, report the issues and suggest using `--force` to override.

### Step 2: Save to Memory

1. **Local memory**: Note the commit in local context
2. **Cloud memory** (unless --no-cloud):
   - Use `mcp__openmemory-cloud__add-memory` with content:
     ```
     Commit: [message]
     Timestamp: [ISO timestamp]
     Tag: [tag if provided]
     ```

### Step 3: Create Git Commit

1. Check if there are staged changes: `!git status --porcelain`
2. If no staged changes, inform user to stage files first
3. Create commit: Use Bash to run `git commit -m "[message]"`
4. Get the commit hash: `!git rev-parse --short HEAD`

### Step 4: Report Summary

Output:
```
# Commit Saved

## Validation
[PASSED|WARNINGS|SKIPPED]

## Memory
- Local: Saved
- Cloud: [Saved|Skipped]

## Git Commit
- Hash: [short hash]
- Message: [commit message]

## Next Steps
- Push with: git push
- Continue development
```

## Example Usage
- `/save-commit "feat: add user authentication"`
- `/save-commit "fix: resolve memory leak" --tag "bugfix"`
- `/save-commit "wip: experimental changes" --force --no-cloud`
