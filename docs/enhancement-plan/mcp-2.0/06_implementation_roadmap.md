# Implementation Roadmap

## Phase 1: Foundation & Discovery (Days 1-2)

**Goal:** Enable the AI to discover what exists.

1.  **Infrastructure Setup:**
    -   Create `src/tools/meta/` and `src/tools/workflows/` directories.
    -   Create `WorkflowToolDefinition` interface (shared types).

2.  **Meta Tools Implementation:**
    -   Implement `list_workflows` (scans registry).
    -   Implement `describe_workflow` (returns rich docs).
    -   Implement `get_system_instructions` (returns manual).

3.  **Registry Update:**
    -   Update `src/tools/index.ts` to register these new tools.

## Phase 2: Workflow Exposure (Days 2-4)

**Goal:** Expose all 10 workflows as individual tools.

1.  **Batch 1 (Code Review & Validation):**
    -   `workflow_parallel_review`
    -   `workflow_pre_commit_validate`
    -   `workflow_validate_last_commit`
    -   `workflow_triangulated_review`

2.  **Batch 2 (Session & Features):**
    -   `workflow_init_session`
    -   `workflow_feature_design`
    -   `workflow_openspec_driven_development`

3.  **Batch 3 (Maintenance & Debugging):**
    -   `workflow_bug_hunt`
    -   `workflow_auto_remediation`
    -   `workflow_refactor_sprint`

**Task per Workflow:**
-   Create wrapper file in `src/tools/workflows/`.
-   Import Zod schema from `src/workflows/index.ts`.
-   Write enhanced description (Markdown).
-   Add metadata (Best For, Examples).
-   Register in `src/tools/index.ts`.

## Phase 3: Documentation Resources (Day 5)

**Goal:** Make documentation readable via MCP.

1.  **Resource Handler:**
    -   Implement `src/resources/docsHandler.ts`.
    -   Register `ListResourcesRequestSchema` and `ReadResourceRequestSchema`.
    -   Map `unified-ai://docs/*` to local `docs/*` files.

## Phase 4: Clean Up & Deprecation (Day 6)

**Goal:** Tidy up.

1.  **Deprecation:**
    -   Add deprecation notice to `smart-workflows` description.
    -   Rename `cursor-agent` -> `ask_cursor_agent` (alias for backward compat).
    -   Rename `droid` -> `ask_droid` (alias for backward compat).

2.  **Verification:**
    -   Run `list_workflows`.
    -   Run `describe_workflow` for random tools.
    -   Test execution of 2-3 critical workflows via new tool names.

## Estimated Timeline
-   **Start:** Immediate
-   **Completion:** 1 week (approx)

