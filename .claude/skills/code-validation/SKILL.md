---
name: code-validation
description: Pre-commit validation workflow using Serena, claude-context, and AI review. Use before git commits, after significant changes, or before adding memories. Ensures quality and completeness.
relatedSkills:
  - name: serena-surgical-editing
    when: During validation
    reason: Check impact with find_referencing_symbols
  - name: unified-ai-orchestration
    when: For comprehensive review
    reason: Get multiple AI perspectives (Gemini + Qwen)
---

# Code Validation Skill

## Purpose

Guide verification and validation workflows to ensure code quality, architectural consistency, and plan completion before commits or memory preservation.

## When to Use This Skill

Consider this skill when:
- Before making git commits (especially significant changes)
- Before adding important memories with openmemory-add-memory
- After implementing features or fixes
- Before finalizing complex implementation plans
- When making architectural changes
- After refactoring multiple components

## Validation Approaches (Choose What Fits)

### Impact Analysis
Understand change scope before committing:

**Symbol-level (TypeScript/JavaScript)**:
```bash
# Find all references to modified symbols
mcp__serena__find_referencing_symbols --name_path "ModifiedFunction" --relative_path "src/file.ts"
mcp__serena__get_symbols_overview --relative_path "src/modified-file.ts"
```

**Architectural scope**:
```bash
# Find dependent code and similar implementations
mcp__claude-context__search_code "code depending on my changes" --path /project/path
mcp__claude-context__search_code "similar implementations for consistency" --path /project/path
```

### Quality Review
Get multiple perspectives on changes:

**Parallel AI review** (for comprehensive validation):
```bash
mcp__unitAI__ask-gemini --prompt "@file.ts Validate architecture, security, performance"
mcp__unitAI__ask-qwen --prompt "@file.ts Check quality, edge cases, bugs"
```

**Single tool review** (for quick checks):
```bash
mcp__unitAI__ask-qwen --prompt "@file.ts Quick review: any obvious issues?"
```

### Plan Verification
Before implementing, second-guess the approach:

**Questions to consider**:
- What could go wrong with this approach?
- Have I considered all alternatives?
- What are the potential side effects?
- Is this consistent with project patterns?

**MCP tool validation**:
```bash
# Get different perspectives on the plan
mcp__unitAI__ask-gemini --prompt "Review this implementation plan: [details]"
mcp__unitAI__ask-qwen --prompt "Identify edge cases in this approach: [details]"
```

### Functionality Verification
Before committing or adding memory:

**Check that**:
- Code executes without errors
- Solution addresses the original problem
- Integration with existing components works
- No regressions introduced
- Tests pass (if applicable)

## Validation Checklist (Suggestive, Not Mandatory)

Consider these steps based on change scope:

**For Small Changes** (~1-2 files, simple logic):
- [ ] Code runs without errors
- [ ] Quick quality check (1 AI tool)
- [ ] No obvious breaking changes

**For Medium Changes** (multiple files, some complexity):
- [ ] Impact analysis (Serena or claude-context)
- [ ] Parallel AI review (Gemini + Qwen)
- [ ] Integration verified
- [ ] Related tests updated

**For Large Changes** (architectural, broad impact):
- [ ] Symbol-level impact (Serena find_referencing_symbols)
- [ ] Architectural impact (claude-context)
- [ ] Parallel AI review (Gemini + Qwen)
- [ ] Breaking change verification
- [ ] Comprehensive testing
- [ ] Documentation updated

## Quality Standards (Guidelines)

**Architecture**:
- Consistent with project patterns
- Proper error handling
- Security considerations addressed

**Code Quality**:
- No redundancy or obvious bugs
- Edge cases considered
- Performance implications reviewed

**Completeness**:
- All planned tasks completed
- No outstanding issues
- Integration points verified

## Commit & Memory Guidelines

**Before git commit**:
- Verify code is functional
- Review with appropriate tools based on scope
- Ensure architectural consistency

**Before openmemory-add-memory**:
- Confirm information is significant and accurate
- Verify solution is working correctly
- Ensure it represents a useful pattern or decision

**Commit message best practice**:
```
feat: Update connection pooling

- Validated with Gemini + Qwen parallel review
- Verified consistency with claude-context
- All tests passing
```

## Autonomous Decision Making

Let Claude judge the appropriate validation level:
- Simple changes may need only quick verification
- Complex changes benefit from comprehensive validation
- Critical changes should use multiple validation approaches

Trust your judgment on which tools and steps are needed for the specific context.

---

**Skill Status**: Active
**Validation Philosophy**: Suggestive guidance, not rigid enforcement
