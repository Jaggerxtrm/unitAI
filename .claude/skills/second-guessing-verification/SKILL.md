---
name: second-guessing-verification
description: Use this skill when Claude proposes solutions, plans, or implementations that require deeper verification. This skill reminds Claude to use MCP tools for thorough validation and second-guessing before proceeding with important changes. Use when planning complex implementations, architectural changes, bug fixes, or before committing significant code changes.
---

# Second-Guessing Verification Skill

## Purpose

This skill guides Claude to use MCP tools for thorough validation and second-guessing of plans and solutions, ensuring deeper verification before proceeding with important changes.

## When to Use This Skill

- Before implementing complex solutions or architectural changes
- When proposing plans for bug fixes or refactoring
- Before making significant code changes
- When designing new features or components
- After initial solution is proposed but before implementation
- When solving complex problems that might have subtle implications

## Core Principle

**Always verify critical decisions with MCP tools before finalizing approach.**

## Verification Workflow

### 1. Plan Review with MCP Tools
```
# Before finalizing any plan:
"Use rovodev to analyze this plan for potential issues and improvements"
"Ask Qwen about potential edge cases in this approach"
"Ask Gemini for alternative implementations or improvements"
```

### 2. Implementation Verification
```
# After proposing solution:
"Run through potential failure scenarios"
"Verify compatibility with existing system components"
"Check for performance implications"
"Review security considerations"
```

### 3. Quality Assurance Steps
1. **Use multiple MCP tools** for cross-validation
2. **Consider alternative approaches** before finalizing
3. **Think through edge cases** and error scenarios
4. **Verify against project constraints** and patterns

## MCP Tool Integration

### For Code Implementation Plans:
- Use Rovodev to analyze the proposed approach
- Use Qwen to identify potential issues or edge cases
- Use Gemini to suggest improvements or alternatives

### For Architectural Decisions:
- Use claude-context to understand existing patterns
- Use multiple AI tools to validate approach against best practices
- Check for consistency with project architecture

### For Complex Problem Solving:
- Break down the problem using multiple MCP tools
- Validate the solution approach with different AI models
- Consider multiple perspectives before finalizing

## Checklist: Before Finalizing Any Plan

- [ ] Verified with at least one MCP tool
- [ ] Considered edge cases and error scenarios
- [ ] Checked compatibility with existing codebase
- [ ] Validated approach against project patterns
- [ ] Considered performance implications
- [ ] Reviewed security considerations

## Reminder Phrases

When second-guessing is needed, Claude should ask:
- "What could go wrong with this approach?"
- "Have I considered all alternatives?"
- "Should I validate this with MCP tools?"
- "What are the potential side effects?"
- "Is this approach consistent with project patterns?"

## Integration with Workflow

This skill should be triggered:
- After proposing solutions but before implementation
- When plans involve significant changes
- When working on critical system components
- Before committing to a specific approach

---

**Skill Status**: COMPLETE ✅
**Line Count**: < 500 ✅