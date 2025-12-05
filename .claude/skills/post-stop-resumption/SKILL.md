---
name: post-stop-resumption
description: Resume work after interruptions via MCP tools assistance. Use when restarting after stop, error, or mid-task interruption. Assesses situation and seeks guidance to continue.
---

# Post-Stop Resumption Skill

## Purpose

Help Claude effectively resume work after interruptions by assessing the situation, understanding what occurred, and seeking appropriate MCP tool assistance to continue.

## When to Use This Skill

- Resuming work after interruption or stop
- Returning to a task after a break
- Uncertainty about current state
- Encountering problems that caused previous stop
- Asked to continue previously interrupted work

## Resumption Process

### 1. Assess Current Situation
```bash
# Check current state
git status
git log --oneline -5

# Understand context:
# - What was the last action taken?
# - What problem was being solved?
# - What is the desired end state?
```

### 2. Seek MCP Tool Assistance

**For technical issues**:
```bash
# Quick issue resolution
mcp__unitAI__ask-qwen --prompt "I was working on [task] and encountered [problem]. How should I proceed?"

# Deep problem analysis
mcp__unitAI__ask-gemini --prompt "Help me resume work on [task]. I encountered [issue] and need guidance."
```

**For code context**:
```bash
# Find relevant code
mcp__claude-context__search_code "[key component]" --path /project/path

# Navigate symbols (TypeScript/JavaScript)
mcp__serena__get_symbols_overview --relative_path "src/file.ts"
```

### 3. Continue Work

Based on MCP tool guidance:
1. Resolve the blocking issue
2. Verify the solution works
3. Continue with original task
4. Validate progress

## Key Questions to Ask

**Understanding the Problem:**
- "How do I resolve [specific issue]?"
- "What should I do differently to continue?"
- "Why did [problem] occur and how to fix it?"

**Seeking Guidance:**
- "What's the best way to continue after [issue]?"
- "How should I approach [task] given [problem]?"

**Confirming Approach:**
- "Is this the best way to continue [task]?"
- "Let me verify my approach to resolving [issue]..."

## Handling Common Scenarios

**Technical errors**: Use Qwen/Rovodev for debugging, verify solution before continuing

**Architectural decisions**: Get multiple AI perspectives (Gemini + Qwen), validate approach

**Unclear requirements**: Ask AI tools to clarify, find similar implementations with claude-context

## Autonomous Decision Making

Let Claude judge the appropriate level of assistance needed:
- Simple resumptions may only need quick status check
- Complex issues benefit from comprehensive MCP tool guidance
- Critical stops should use multiple AI perspectives

Trust your judgment on which tools are needed for the specific context.

---

**Skill Status**: Active
**Best Practice**: Assess first, seek assistance, then continue
