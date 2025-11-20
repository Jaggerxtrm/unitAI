# MCP 2.0: The "Discovery" Update

**Status:** In Progress
**Date:** November 19, 2025
**Author:** Exploration Agent

## Executive Summary

The `unified-ai-mcp-tool` has matured into a powerful system with 10+ complex workflows and autonomous agents. However, its interface remains opaque: capabilities are hidden behind a single "God Tool" (`smart-workflows`) and documentation is locked in the local filesystem.

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

## Immediate Next Steps

1.  Review and approve the [Architecture Proposal](./mcp-2.0/05_mcp_2_0_architecture.md).
2.  Create the `src/tools/meta/` directory and implement the discovery tools.
3.  Begin the migration of the first batch of workflows (`parallel-review`, etc.).
