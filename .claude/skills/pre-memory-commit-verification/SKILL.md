---
name: pre-memory-commit-verification
description: Use this skill before adding memories or making commits to ensure code is functional, plans are completed, and there's explicit confirmation. This skill enforces verification that the implemented solution is working correctly before preserving it in memory or version control. Use before any openmemory-add-memory or git commit operation.
---

# Pre-Memory/Commit Verification Skill

## Purpose

This skill ensures that before adding memories or making commits, Claude verifies that:
1. Code is perfectly functional
2. Planned work is completed
3. There's explicit confirmation of completion
4. All quality standards are met

## When to Use This Skill

- Before running openmemory-add-memory commands
- Before making git commits
- Before finalizing any significant work
- When asked to preserve current state in memory
- Before closing a work session with completed tasks

## Verification Requirements

### 1. Code Functionality Verification
Before adding memories or committing, confirm:

- [ ] Code executes without errors
- [ ] All tests pass (if applicable)
- [ ] Integration with existing components works
- [ ] Performance meets requirements
- [ ] No regressions introduced

### 2. Plan Completion Verification
- [ ] All planned tasks are completed
- [ ] No outstanding issues or bugs
- [ ] Documentation updated if needed
- [ ] Architecture consistency maintained

### 3. Confirmation Requirements
Explicit confirmation must be obtained before proceeding:

**For Code Changes:**
```
# Verify functionality:
"Run basic functionality tests to confirm implementation works"
"Verify the solution addresses the original problem"
"Check for any side effects or unintended consequences"
```

**For Memory Addition:**
```
# Confirm significance:
"Is this information important enough to remember?"
"Does this represent a significant decision or approach?"
"Will this be useful for future reference?"
```

## Pre-Action Checklist

Before adding memory or committing, confirm each item:

- [ ] Code compiles/validates without errors
- [ ] Basic functionality tested and working
- [ ] All planned objectives achieved
- [ ] No remaining tasks or outstanding issues
- [ ] Solution tested against requirements
- [ ] No conflicts with existing code
- [ ] Architectural consistency verified
- [ ] Explicit confirmation: "Code is functional, plan completed, proceeding with [memory/commit]"

## Verification Process

### For Code Implementation:
1. Execute code to verify it runs without errors
2. Test the specific functionality that was implemented
3. Verify it integrates properly with existing components
4. Confirm all planned features are working
5. Explicitly state: "Code is functional and complete"

### For Problem Solving:
1. Verify the original problem is resolved
2. Test edge cases to ensure solution is robust
3. Confirm no new issues were introduced
4. Explicitly state: "Problem is solved and solution verified"

### For Memory Addition:
1. Assess if the information is significant enough to remember
2. Verify the information is accurate and complete
3. Confirm it represents a useful pattern or decision
4. Explicitly state: "Information is significant and accurate for memory"

## Confirmation Statement

Before executing openmemory-add-memory or git commit:
```
"Confirmation: Code is functional, plan completed, all requirements met. Proceeding with [memory/commit]."
```

If any verification fails, do NOT proceed with memory addition or commit until issues are resolved.

## Quality Gates

### Functionality Gate
- All implemented functions must execute without error
- Integration points must work as expected
- Error handling must be appropriate

### Completeness Gate
- All planned features must be implemented
- All related tasks must be completed
- Documentation must be updated if applicable

### Quality Gate
- Code must meet project standards
- Architecture must be consistent
- Performance must meet requirements

## Integration with MCP Tools

Use MCP tools to verify before memory/commit:

```
# Use multiple tools to verify:
"Ask Qwen to review code quality of changes"
"Ask Gemini to check architectural consistency" 
"Use claude-context to verify integration with existing code"
```

## Failure Handling

If verification fails:
1. Do NOT proceed with memory addition or commit
2. Identify specific issues that need resolution
3. Address issues before attempting again
4. Re-verify all requirements

---

**Skill Status**: COMPLETE ✅
**Line Count**: < 500 ✅