# Enhancement Plan

This directory contains structured tasks for enhancing the unitai project. Each task is self-contained and includes comprehensive documentation requirements, phased implementation instructions, and progress tracking.

## 📋 Review Status: COMPLETED

**Review Date**: November 19, 2025
**Status**: All tasks reviewed and approved (1 conditional)

**📄 [Read the Approval Summary →](APPROVAL_SUMMARY.md)**

### Quick Status
- ✅ Task 1 (Hooks & Skills): **Approved**
- ✅ Task 2 (MCP Tools): **Approved**
- ⚠️ Task 3 (OpenSpec): **Conditionally Approved** (Phase 0 validation required)
- ✅ Task 4 (Slash Commands): **Approved**

---

## Tasks Overview

### [Task 1: Hooks & Skills System Optimization](file:///home/dawid/Projects/unitai/docs/enhancement-plan/01-hooks-and-skills-optimization.md)
**Objective**: Optimize the Claude Code hooks and skills system to be less restrictive while maintaining guidance effectiveness.

**Key Areas**:
- Make hooks advisory rather than blocking
- Improve skill activation patterns
- Guide toward efficient tool usage (serena, claude-context, etc.)

**Status**: ✅ Approved - Ready for implementation
**Review Note**: No modifications needed. Framework-internal optimizations are language-agnostic.

---

### [Task 2: MCP Tools Integration & Documentation](file:///home/dawid/Projects/unitai/docs/enhancement-plan/02-mcp-tools-integration.md)
**Objective**: Integrate new tools (ask-cursor, ask-droid), retain ask-qwen/ask-rovodev as fallback backends, and enhance smart-workflows with MCP 2.0 Discovery.

**Key Areas**:
- Integrate ask-cursor for bug fixing and refactoring
- Integrate ask-droid (GLM-4.6) for agentic tasks
- Retain ask-qwen and ask-rovodev as non-exposed fallback backends (circuit breaker resilience)
- Enhance smart-workflows with MCP 2.0 Discovery architecture

**Status**: ✅ Complete
**Implementation Note**: All backends integrated with circuit breaker pattern for automatic failover.

---

### [Task 3: Advanced Features Exploration](file:///home/dawid/Projects/unitai/docs/enhancement-plan/03-advanced-features-exploration.md)
**Objective**: Research and evaluate moai-adk and OpenSpec for potential integration.

**Key Areas**:
- Deep research on moai-adk capabilities
- Deep research on OpenSpec capabilities
- Compatibility and value analysis
- Integration proposal (if beneficial)

**Status**: ⚠️ Conditionally Approved - Phase 0 validation required
**Review Note**: Must validate OpenSpec with Python, Go, and Rust projects before integration. See updated proposal v2.0.

---

### [Task 4: Custom Slash Commands for Repetitive Workflows](file:///home/dawid/Projects/unitai/docs/enhancement-plan/04-custom-slash-commands.md)
**Objective**: Create custom slash commands for frequently used tasks: session init, memory+commit, AI task execution, spec creation, docs lookup.

**Key Areas**:
- `/init-session` - Initialize work session
- `/save-commit` - Memory + commit workflow
- `/ai-task` - Execute unitAI workflows
- `/create-spec` - Specification document creation
- `/check-docs` - Quick documentation lookup

**Status**: ✅ Approved - Ready for implementation
**Review Note**: Conceptually language-agnostic. `/save-commit` should detect project type for validation commands.

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
  └─ Depends on → Task 2 (needs unitAI workflows)
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
