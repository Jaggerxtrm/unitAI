# Enhancement Plan

This directory contains structured tasks for enhancing the unified-ai-mcp-tool project. Each task is self-contained and includes comprehensive documentation requirements, phased implementation instructions, and progress tracking.

## Tasks Overview

### [Task 1: Hooks & Skills System Optimization](file:///home/dawid/Projects/unified-ai-mcp-tool/docs/enhancement-plan/01-hooks-and-skills-optimization.md)
**Objective**: Optimize the Claude Code hooks and skills system to be less restrictive while maintaining guidance effectiveness.

**Key Areas**:
- Make hooks advisory rather than blocking
- Improve skill activation patterns
- Guide toward efficient tool usage (serena, claude-context, etc.)

**Status**: Not started

---

### [Task 2: MCP Tools Integration & Documentation](file:///home/dawid/Projects/unified-ai-mcp-tool/docs/enhancement-plan/02-mcp-tools-integration.md)
**Objective**: Integrate missing tools (cursor-agent, droid), remove deprecated ones (ask-qwen, ask-rovodev), and enhance smart-workflows.

**Key Areas**:
- Integrate cursor-agent for bug fixing and refactoring
- Integrate droid (GLM-4.6) for agentic tasks
- Remove ask-qwen and ask-rovodev
- Enhance and adapt smart-workflows

**Status**: Not started

---

### [Task 3: Advanced Features Exploration](file:///home/dawid/Projects/unified-ai-mcp-tool/docs/enhancement-plan/03-advanced-features-exploration.md)
**Objective**: Research and evaluate moai-adk and OpenSpec for potential integration.

**Key Areas**:
- Deep research on moai-adk capabilities
- Deep research on OpenSpec capabilities
- Compatibility and value analysis
- Integration proposal (if beneficial)

**Status**: Not started

---

### [Task 4: Custom Slash Commands for Repetitive Workflows](file:///home/dawid/Projects/unified-ai-mcp-tool/docs/enhancement-plan/04-custom-slash-commands.md)
**Objective**: Create custom slash commands for frequently used tasks: session init, memory+commit, AI task execution, spec creation, docs lookup.

**Key Areas**:
- `/init-session` - Initialize work session
- `/save-commit` - Memory + commit workflow
- `/ai-task` - Execute unified-ai-mcp workflows
- `/create-spec` - Specification document creation
- `/check-docs` - Quick documentation lookup

**Status**: Not started

---

## How to Use These Tasks

### For Implementers

1. **Read Documentation First**: Each task has a "Required Documentation Review" section. You MUST read these before proposing changes.

2. **Follow the Phases**: Tasks are structured in phases:
   - **Research & Analysis**: Understand the problem space
   - **Proposal Creation**: Design your solution (DO NOT implement yet)
   - **Update Task**: Mark progress and link your proposal
   - **Implementation**: Only after proposal approval

3. **Update Progress**: Each task has a checklist. Update it as you complete milestones.

4. **Link Deliverables**: When you create proposals or analysis documents, link them in the task file.

### For Reviewers

- Each task includes "Success Criteria" for evaluation
- Proposals should be reviewed before implementation begins
- Check that documentation requirements were actually reviewed

---

## Task Dependencies

```
Task 1 (Hooks & Skills)
  └─ Should inform → Task 2 (MCP Tools)
                     └─ May use → Task 3 findings (moai-adk/OpenSpec)
  └─ May inform → Task 4 (Slash Commands)

Task 3 (Advanced Features)
  └─ May influence → All other tasks

Task 4 (Slash Commands)
  └─ Depends on → Task 2 (needs unified-ai-mcp workflows)
```

**Recommended Order**:
1. Task 3 (Exploration) - Can run in parallel, informs others
2. Task 1 (Hooks & Skills) - Foundation for guidance system
3. Task 2 (MCP Tools) - Provides tools for slash commands
4. Task 4 (Slash Commands) - Ties everything together

---

## Notes

- All tasks require **documentation review before implementation**
- All tasks require **proposal creation before implementation**
- Progress tracking is built into each task file
- Tasks are designed to be worked on by different people concurrently (with awareness of dependencies)
