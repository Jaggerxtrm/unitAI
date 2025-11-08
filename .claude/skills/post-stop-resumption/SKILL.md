---
name: post-stop-resumption
description: Use this skill when restarting work after a stop or interruption. This skill guides Claude to assess the current situation, understand what happened before the stop, and seek assistance from MCP tools to understand how to proceed. Use when resuming work after an interruption, error, or when Claude was stopped mid-task.
---

# Post-Stop Resumption Skill

## Purpose

This skill helps Claude effectively resume work after an interruption or stop by:
1. Assessing the current situation
2. Understanding what occurred before the stop
3. Seeking appropriate assistance to continue
4. Determining the best path forward

## When to Use This Skill

- When resuming work after an interruption
- After Claude was stopped mid-task
- When returning to a task after a break
- When there's uncertainty about current state
- When encountering problems that caused a previous stop
- When asked to continue work that was previously interrupted

## Assessment Process

### 1. Situation Assessment
When resuming work, first assess:

```
# Determine current state:
"What was the last action taken?"
"What was the problem being solved?"
"What stage was the process at before stopping?"
"What is the desired end state?"
```

### 2. Current State Verification
```
# Check current environment:
git status
git log --oneline -5
# Check for any system changes since stopping
# Verify that necessary services are running
```

### 3. Problem Understanding
```
# Understand the issue that caused the stop:
"What problem was encountered?"
"What error occurred?"
"What was blocking progress?"
```

## MCP Tool Integration for Resumption

### 1. Seek Guidance from AI Tools
When resuming after a stop, ask for help:

```
# For Qwen:
"I was working on [brief description of task] and encountered [problem/issue]. How should I proceed to resolve this and continue with the original task?"

# For Gemini:
"Help me resume work on [task]. I encountered [issue] and need guidance on how to resolve it and continue effectively."

# For Rovodev:
"Analyze the current state of [task/implementation] and suggest how to resolve [issue] to continue with [original goal]."
```

### 2. Use claude-context for Context
```
# If continuing work on code:
mcp__claude-context__search_code "[key component or function name]" --path /home/dawid/Projects/unified-ai-mcp-tool
# To understand where to resume in the codebase
```

## Resumption Workflow

### Step 1: Self-Assessment
1. Determine the original task
2. Identify where work stopped
3. Understand the problem or interruption
4. Assess current state of code/files

### Step 2: Seek Assistance
1. Ask AI tools for guidance on resolving the issue
2. Clarify the best approach to continue
3. Verify understanding of the problem
4. Get suggestions for moving forward

### Step 3: Plan Next Steps
1. Based on AI guidance, create a plan to resolve the issue
2. Determine if the original approach needs modification
3. Identify any new information that affects the task
4. Plan verification steps for the solution

### Step 4: Execute and Verify
1. Implement the solution to overcome the stopping point
2. Verify the issue is resolved
3. Continue with the original task
4. Validate progress

## Key Phrases for Resumption

When resuming work, use these approaches:

**Understanding the problem:**
- "How do I resolve [specific issue]?"
- "What should I do differently to continue?"
- "Help me understand why [problem] occurred and how to fix it."

**Seeking guidance:**
- "I need assistance with resuming [task]."
- "What's the best way to continue after [issue]?"
- "How should I approach [task] given [problem that occurred]?"

**Confirming understanding:**
- "Let me confirm my approach to resolving [issue]..."
- "Is this the best way to continue [task]?"

## Handling Different Types of Stops

### Technical Issues
- Focus on resolving the technical problem first
- Use appropriate MCP tools for debugging (Qwen, Rovodev)
- Verify the solution before continuing original task

### Design/Architecture Decisions
- Seek guidance on the best approach
- Use multiple AI tools to get different perspectives
- Validate the chosen approach before proceeding

### Unclear Requirements
- Ask AI tools to clarify or provide suggestions
- Use claude-context to find similar implementations for guidance
- Establish clear requirements before continuing

## Integration with Workflow

This skill should be used immediately when:
- Returning to a stopped task
- Uncertainty exists about current state
- Encountering the same issue that caused a previous stop
- Needing guidance on how to proceed after an interruption

The skill emphasizes seeking assistance from MCP tools to understand the best way forward rather than assuming what to do next.

---

**Skill Status**: COMPLETE ✅
**Line Count**: < 500 ✅