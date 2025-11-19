---
name: slash-save-commit
description: Use /save-commit to safely save stable work with automatic validation, memory storage, and commit creation - ensuring code stability before memory preservation.
---

# Slash Save Commit Skill

## Purpose

Guides users to use `/save-commit` when they want to preserve completed work, ensuring that only stable, validated code gets saved to memory and committed to git.

## Safety First Philosophy

**CRITICAL**: This skill enforces the principle that **memory should only be saved when code is STABLE and WORKING**. The command includes mandatory validation steps.

## When to Use

Activates when users want to:
- Commit completed work
- Save progress to memory
- Create stable checkpoints
- Finish development tasks
- Preserve work context for future sessions

## Command Usage

```bash
/save-commit "commit message" [options]
```

### Options
- `--force`: Skip stability validation (use with extreme caution)
- `--no-cloud`: Skip cloud memory storage
- `--tag "tag"`: Add custom tag to memory entry

## Validation Workflow

### Phase 1: Stability Check (Mandatory unless --force)
- Code quality analysis
- Test execution (if available)
- Linting and type checking
- Security scanning

### Phase 2: Memory Preservation
- Save to local openmemory
- Save to openmemory-cloud (remote persistence)
- Link memory to commit hash

### Phase 3: Git Commit
- Create commit with provided message
- Include memory reference

## Example Usage

```bash
/save-commit "feat: Add OAuth support for Google and GitHub"
# Validates code, saves memory, creates commit

/save-commit "fix: Resolve memory leak in workflow executor" --tag "performance"
# Adds performance tag to memory entry

/save-commit "refactor: Simplify command parser" --force
# Skips validation (not recommended)
```

## Error Handling

- **Validation Failure**: Shows specific issues, suggests fixes
- **Memory Save Failure**: Rolls back git commit if memory save fails
- **Partial Success**: Clear indication of what succeeded/failed

## Integration Points

- **Validation**: Uses `pre-commit-validate` workflow
- **Memory**: `openmemory` and `openmemory-cloud` tools
- **Git**: Direct git operations with proper error handling

## Success Metrics

- **Zero Unstable Commits**: 100% validation pass rate (except --force)
- **Memory Completeness**: All commits have associated memory entries
- **Error Recovery**: Clear failure messages with recovery suggestions

---

**Skill Status**: Active
**Safety Level**: Critical (validation mandatory)
**Integration**: MCP validation + memory + git
