# MCP 2.0: The "Discovery" Update

**Status:** Phase 1 & 2 Complete ✅ | Phase 3 & 4 Pending
**Date:** November 19, 2025 (Updated: November 20, 2025)
**Author:** Exploration Agent

## Executive Summary

The `unitai` has matured into a powerful system with 10+ complex workflows and autonomous agents. However, its interface remains opaque: capabilities are hidden behind a single "God Tool" (`smart-workflows`) and documentation is locked in the local filesystem.

This plan proposes **MCP 2.0**, a major architectural shift focused on **Discoverability** and **Granularity**. By exposing workflows as individual tools and treating documentation as a first-class resource, we enable AI assistants to self-onboard, select the right tools with high precision, and operate autonomously without constant user guidance.

## Deliverables

This folder contains the detailed analysis and planning documents:

1.  **[Workflow Inventory](./mcp-2.0/01_workflow_inventory.md)**:
    A complete map of the 10 hidden workflows that need exposure.

2.  **[MCP SDK & Serena Analysis](./mcp-2.0/02_mcp_sdk_serena_analysis.md)**:
    Analysis of best practices (snake_case naming, meta-tools) that we will adopt.

3.  **[Architectural Evolution](./mcp-2.0/03_architectural_evolution.md)**:
    Historical context on how we got here (Backend Tools -> Agents -> Workflows).

4.  **[Gap Analysis](./mcp-2.0/04_gap_analysis.md)**:
    Critical missing pieces: Discovery, Granular Exposure, Documentation.

5.  **[Architecture Proposal](./mcp-2.0/05_mcp_2_0_architecture.md)**:
    The technical design for the new system (`workflow_*` tools, `list_workflows`, `unified-ai://docs/`).

6.  **[Implementation Roadmap](./mcp-2.0/06_implementation_roadmap.md)**:
    Step-by-step plan to build this in ~1 week.

7.  **[Validation Plan](./mcp-2.0/07_validation_plan.md)**:
    How we will prove it works.

## Future Work

### MCP Prompts Integration
While the current focus is on executing workflows via Tools, future updates should consider exposing simpler, reusable interaction patterns as **MCP Prompts**.
*   **Example:** "Explain this code" or "Generate unit tests for this file".
*   **Benefit:** Provides a standardized way for clients (like Claude Desktop) to offer quick actions without complex tool calling.
*   **Reference:** MCP SDK `registerPrompt` capability.

## Implementation Status

### ✅ Phase 1: Foundation & Discovery (COMPLETE)
- All meta-tools implemented: `list_workflows`, `describe_workflow`, `get_system_instructions`
- Discovery system fully operational
- AI assistants can now discover all available workflows

### ✅ Phase 2: Workflow Exposure (COMPLETE)
- **All 10 workflows** exposed as individual MCP tools:
  - Batch 1: `workflow_parallel_review`, `workflow_pre_commit_validate`, `workflow_validate_last_commit`, `workflow_triangulated_review`
  - Batch 2: `workflow_init_session`, `workflow_feature_design`, `workflow_openspec_driven_development`
  - Batch 3: `workflow_bug_hunt`, `workflow_auto_remediation`, `workflow_refactor_sprint`
- All tools registered and functional
- Enhanced descriptions with metadata and examples

### ⏳ Phase 3: Documentation Resources (PENDING)
- Resource handler not yet implemented
- Documentation still filesystem-only

### ⏳ Phase 4: Clean Up & Deprecation (PENDING)
- `smart-workflows` router still active (not deprecated)
- Backward compatibility aliases not created

## Current Capabilities

- **17+ MCP Tools** exposed (4 base + 3 meta + 10 workflows)
- **100% Discovery Rate**: AI can discover all tools via `list_workflows()`
- **Rich Metadata**: All tools include descriptions, examples, and usage guidance
- **Test Coverage**: 258/258 tests passing
- **Backend Naming**: Standardized to `ask-*` convention (ask-gemini, ask-cursor, ask-droid)
- **Circuit Breaker**: Resilience system with ask-qwen/ask-rovodev as fallback backends

## Immediate Next Steps

1.  Implement Phase 3: Documentation Resources (expose `docs/` as MCP resources)
2.  Implement Phase 4: Deprecate `smart-workflows` and add backward compatibility
3.  Validate end-to-end: Test discovery and execution in production MCP client
