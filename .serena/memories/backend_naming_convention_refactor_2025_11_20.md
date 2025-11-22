# Backend Naming Convention Refactoring (November 20, 2025)

## Overview
Completed a comprehensive refactoring to unify all AI backend names to use the `ask-*` convention for consistency and improved developer experience.

## Changes Made

### Backend Name Standardization
- `"gemini"` → `"ask-gemini"`
- `"cursor-agent"` → `"ask-cursor"`
- `"droid"` → `"ask-droid"`

### Files Modified
1. **Core Constants**: `src/constants.ts` - Updated BACKENDS constant
2. **Tool Renaming**: `src/tools/cursor-agent.tool.ts` → `src/tools/ask-cursor.tool.ts`
3. **Workflow Updates**: All files in `src/tools/workflows/` and `src/workflows/`
4. **Tests**: All test files in `tests/` directory
5. **Scripts**: Script files updated with new naming

### Implementation Approach
Used efficient tools for the refactor:
- **Serena MCP**: Symbol-level navigation and editing for precise changes
- **Bash sed**: Batch replacements across multiple files
- **Git mv**: Proper file renaming with history preservation

## Results
- ✅ TypeScript build successful
- ✅ All 258 tests passing (100%)
- ✅ Two commits created:
  - `ff19931`: Main refactoring commit
  - `777a606`: Test validation commit

## Breaking Changes
This is a **breaking change** for external MCP consumers. Tool names have changed and require updates in client code.

## Follow-up Fix (November 22, 2025)

### Bug: CLI Availability Check Broken
The `checkCLIAvailability()` function in `src/utils/gitHelper.ts` was incorrectly updated during the refactor:

**Issues Found:**
1. **Key mismatch**: Function returned `ask-*` keys but `init-session` display code expected old keys (`gemini`, `cursor-agent`, `droid`)
2. **Wrong command**: `ask-cursor` mapped to `cursor-agent` but the actual CLI command is `cursor`

**Fix Applied:**
- Reverted keys to display-friendly names for the availability check (this function is only used for display purposes in init-session)
- Corrected cursor command from `cursor-agent` to `cursor`
- Commit: `4004d19`

## Rationale
The `ask-*` convention makes it immediately clear that these tools are query/request interfaces to AI backends, improving code readability and consistency throughout the codebase.