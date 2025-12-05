---
description: Enhance prompts with project context using AI backends
argument-hint: <gemini|droid> "your prompt"
allowed-tools: mcp__unitAI__ask-gemini, mcp__unitAI__droid, mcp__openmemory__*, mcp__openmemory-cloud__*, mcp__serena__*, Bash(git:*)
---

Enhance a user prompt with project context using AI backends for better, more detailed instructions.

**Arguments:** $ARGUMENTS

Extract:
- **Backend**: First argument (gemini or droid)
- **User prompt**: The quoted string after the backend

## Instructions

### Step 1: Gather Context

Collect relevant project context:

1. **Git History**: Get recent commits
   ```
   !git log --oneline -5
   ```

2. **Project Memories**: List available Serena memories
   - Use `mcp__serena__list_memories` to see available memories
   - Read relevant ones based on the prompt topic

3. **OpenMemory Search**: Search for related past decisions
   - Use `mcp__openmemory-cloud__search-memories` with query related to the user's prompt

### Step 2: Construct Meta-Prompt

Build an enhancement prompt that includes:

```
You are a Senior Developer and Prompt Engineer. Your goal is to enhance the user's raw prompt into a detailed, technical, and context-aware instruction for an AI Agent.

**User's Raw Prompt:**
"[user prompt]"

**Context Sources Available:**
1. **Recent Git History:**
[commit history]

2. **Project Memories:**
[list of relevant memories]

3. **Past Decisions (from OpenMemory):**
[search results]

**Instructions:**
1. Analyze the user's prompt and the context to understand intent
2. Synthesize all gathered information into a highly detailed, technical prompt
3. Reference relevant files or patterns from history/memory
4. Include constraints or conventions discovered in memories
5. Output ONLY the enhanced prompt - do not execute the task

**The Enhanced Prompt should:**
- Be specific and actionable
- Reference relevant files or patterns
- Include project-specific constraints
- Be written in a clear, professional tone
```

### Step 3: Execute Enhancement

Based on backend selection:

**If "gemini":**
Use `mcp__unitAI__ask-gemini` with:
- `prompt`: the constructed meta-prompt
- `model`: "gemini-2.5-pro"

**If "droid":**
Use `mcp__unitAI__droid` with:
- `prompt`: the constructed meta-prompt
- `auto`: "low"

### Step 4: Output Result

Present the enhanced prompt in a clear format:

```
# Enhanced Prompt (via [backend])

[The AI-enhanced prompt]

---
*Use this enhanced prompt for better AI assistance.*
```

## Example Usage
- `/prompt gemini "add caching to the API"`
- `/prompt droid "refactor the authentication module"`
