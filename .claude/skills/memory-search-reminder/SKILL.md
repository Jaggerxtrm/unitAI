---
name: memory-search-reminder
description: Search past solutions and decisions via openmemory before new work. Use at session start, before implementations, or when solving familiar problems. Maintains consistency with previous approaches.
relatedSkills:
  - name: claude-context-usage
    when: After checking memories
    reason: Search codebase for current implementations
  - name: code-validation
    when: Before adding new memories
    reason: Validate solution works before memorizing
---

# Memory Search Reminder Skill

## Purpose

This skill ensures Claude searches for past decisions and solutions before starting new work, maintaining consistency with previous approaches and leveraging existing knowledge. It reinforces the workflow from CLAUDE.md to always check memories at the start of sessions.

## When to Use This Skill

- Before implementing new features or changes
- When solving problems that might have been encountered before
- Before making design decisions or architectural choices
- At the start of new sessions or when resuming work
- When working on similar problems to previous implementations
- Before creating new documentation or changing existing patterns

## Memory Search Workflow

### 1. Session Initialization (from CLAUDE.md)
```
# Always search memories first:
openmemory-search-memories "recent work on darth_feedor"
openmemory-search-memories "<YYYY-MM-DD> <topic>" (e.g., "2025-10-29 refactoring")
openmemory-search-memories "similar implementation or pattern"
```

### 2. Problem-Specific Search Patterns
```
# When working on specific components:
openmemory-search-memories "previous approach for [component/functionality]"
openmemory-search-memories "past decisions about [feature/implementation]"
openmemory-search-memories "how did we handle [similar situation]"
```

### 3. Decision Integration
- Check if similar problems were solved before
- Verify that current approach aligns with past decisions
- Look for patterns that should be consistent across the codebase
- Consider previous lessons learned

## Memory Search Commands

### Basic Memory Search:
```
openmemory-search-memories "recent work on [topic/component]"
```

### Date-Specific Search:
```
openmemory-search-memories "YYYY-MM-DD [topic]" (e.g., "2025-10-29 authentication")
```

### Pattern/Decision Search:
```
openmemory-search-memories "decision about [implementation approach]"
openmemory-search-memories "[problem type] solution"
openmemory-search-memories "similar [feature/component] implementation"
```

## Quality Assurance

### Before starting any significant work, ensure:
1. Checked recent memories for similar work
2. Verified consistency with previous decisions
3. Identified reusable approaches or solutions
4. Considered lessons learned from past implementations

### Memory Search Checklist:
- [ ] Searched for recent work on this topic
- [ ] Looked for past decisions about approach
- [ ] Verified consistency with existing patterns
- [ ] Identified reusable components or solutions
- [ ] Considered previous problems and solutions

## Integration with Workflow

### Before Feature Implementation:
1. Search memories for similar features: `openmemory-search-memories "similar [feature type] implementation"`
2. Review past approaches and decisions
3. Determine if existing patterns should be followed or improved
4. Proceed with implementation that aligns with previous decisions

### Before Problem Solving:
1. Search for past solutions: `openmemory-search-memories "how did we solve [similar problem]"`
2. Review the previous approach and its outcomes
3. Apply or adapt the solution as appropriate
4. Update memories with new findings if different approach is needed

## Trigger Phrases

Claude should prompt to search memories when:
- Starting work on a new component or feature
- Encountering a problem that might be familiar
- Making architectural or design decisions
- Working on a recurring task or pattern
- Implementing functionality similar to existing code

## Benefits

- Maintains consistency with previous decisions and patterns
- Avoids repeating past mistakes
- Leverages proven solutions and approaches
- Ensures architectural consistency
- Saves time by building on existing knowledge

---

**Skill Status**: COMPLETE ✅
**Line Count**: < 500 ✅