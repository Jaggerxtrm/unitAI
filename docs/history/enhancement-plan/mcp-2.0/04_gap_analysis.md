# Gap Analysis Report

This document identifies the gaps between the current implementation of `unitai` and the desired state (MCP 2.0).

## Critical Gaps

### 1. Workflow Exposure (Priority: P0)
-   **Current State:** 10 powerful workflows are hidden behind a single `smart-workflows` tool. The AI must "guess" the workflow name and parameters, or rely on internal training data which might be outdated.
-   **Desired State:** Each workflow is a separate, top-level MCP tool (e.g., `workflow_parallel_review`).
-   **Impact:** High cognitive load on the AI, frequent parameter errors, lower discovery rate.

### 2. Discovery Mechanism (Priority: P0)
-   **Current State:** No mechanism for the AI to ask "What can you do?" or "How do I use X?".
-   **Desired State:** Meta-tools `list_workflows` and `describe_workflow` (or `get_tool_docs`) allow the AI to self-onboard and explore capabilities.
-   **Impact:** The AI is blind to new features unless explicitly prompted by the user.

### 3. Documentation Accessibility (Priority: P1)
-   **Current State:** Comprehensive documentation exists in `docs/` (Markdown files), but the AI cannot "read" them unless it uses filesystem tools to grep/cat them, which is inefficient and error-prone.
-   **Desired State:** Documentation is exposed via **MCP Resources** (`unified-ai://docs/...`) or a dedicated documentation tool.
-   **Impact:** The AI cannot reference the official manual or API reference easily.

### 4. Parameter Guidance (Priority: P1)
-   **Current State:** Zod schemas provide basic types, but lack context, examples, and constraints.
-   **Desired State:** Enhanced tool definitions with rich descriptions, "Best For" / "Not For" guidance, and inline examples in the schema description.
-   **Impact:** The AI might choose suboptimal parameters (e.g., wrong `depth` or `focus`).

### 5. Naming Conventions (Priority: P2)
-   **Current State:** Mixed kebab-case (`ask-gemini`) and generic names (`smart-workflows`).
-   **Desired State:** Consistent `snake_case` with verb-first pattern (`workflow_...`, `list_...`) matching the "Serena" best practice.
-   **Impact:** Inconsistent naming makes it harder for the AI to predict tool names.

## Impact Assessment

| Metric | Current | Target (MCP 2.0) |
| :--- | :--- | :--- |
| **Discovery Rate** | < 20% (guessing) | 100% (explicit listing) |
| **Parameter Accuracy** | ~60% | > 95% |
| **Cognitive Load** | High (router logic) | Low (direct tool call) |
| **Documentation Access** | Local FS only | Native MCP Resources |
| **Tool Count** | ~4 generic tools | ~15 specific tools |

## Conclusion

The system has "strong bones" (backend logic is solid) but a "weak interface". The focus of the next phase must be exclusively on the **MCP Interface Layer**: exposing what already exists in a way that is friendly to LLMs.

