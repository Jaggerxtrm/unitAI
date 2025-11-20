# Architectural Evolution

This document traces the evolution of the `unified-ai-mcp-tool` architecture based on commit history.

## Timeline & Major Milestones

### Phase 1: Foundation & Tool Consolidation (Early Nov 2025)
-   **Commit `dfdf8d8`**: Migrated agents to MCP tools.
-   **Commit `546f234`**: Big integration step.
    -   Removed specific backend tools: `ask-qwen.tool.ts`, `ask-rovodev.tool.ts`.
    -   Added functional agent tools: `cursor-agent.tool.ts`, `droid.tool.ts`.
    -   Introduced the concept of "Workflows" as first-class citizens (`src/workflows/`).
    -   Added `auto-remediation`, `refactor-sprint`, `triangulated-review`.

### Phase 2: OpenSpec & Advanced Features (Mid Nov 2025)
-   **Commit `43bda43`**: Implemented OpenSpec integration.
    -   Added `src/tools/openspec/` suite.
    -   Added `openspec-driven-development.workflow.ts`.
-   **Commit `69021ab`**: Custom Slash Commands.
    -   Moved logic to `.claude/slash-commands/`.

### Phase 3: Activity Dashboard & MCP 2.0 Prep (Current - Nov 19, 2025)
-   **Commit `b67e964`**: Migration to Cursor Agent & Droid complete.
    -   Added Activity Dashboard (`src/cli/activityDashboard.ts`).
    -   Refactored `modelSelector.ts` and `aiExecutor.ts`.
-   **Commit `f703ffb`**: Version bump to 2.0.0.
    -   Added `docs/TOOL_DESCRIPTIONS_ENHANCED.md` outlining the plan for Enhanced Tool Descriptions.

## Key Architectural Decisions

1.  **From Backends to Agents:**
    The system moved from exposing raw model access (`ask-qwen`) to exposing "Agents" (`cursor-agent`, `droid`) that encapsulate behavior and tools. This raises the abstraction level.

2.  **Workflows as Logic Units:**
    Complex multi-step logic was moved from the tool definition itself into `src/workflows/`. This separates the "what" (workflow logic) from the "how" (MCP tool exposure).
    *Currently, these are all exposed via a single router tool (`smart-workflows`), which is the bottleneck we are addressing.*

3.  **Standardization via OpenSpec:**
    Adoption of OpenSpec shows a move towards standardized, specification-driven development.

4.  **Self-Monitoring:**
    The addition of `Activity Dashboard` and `structuredLogger` indicates a focus on observability and performance tracking.

## Emerging Patterns

-   **Workflow Definition:** Workflows are defined as objects with a Zod schema and an execute function.
-   **Model Selection:** Centralized `modelSelector` to choose the best backend for a task.
-   **Structured Logging:** Heavy use of `structuredLogger` to track workflow steps.

## Conclusion

The architecture is mature on the "backend" (workflows, agents, logging) but the "frontend" (MCP interface) is lagging behind. It uses a "God Tool" pattern (`smart-workflows`) which hides the complexity and capabilities from the AI. The next logical step (MCP 2.0) is to "unbundle" this God Tool into granular, discoverable tools.

