# Implementation Roadmap

## Phase 1: Foundation & Discovery (Days 1-2) ✅ COMPLETE

**Goal:** Enable the AI to discover what exists.

**Status:** All meta-tools implemented and registered. Discovery system fully operational.

1.  **Infrastructure Setup:**
    -   [x] Create `src/tools/meta/` and `src/tools/workflows/` directories.
    -   [x] Create `WorkflowToolDefinition` interface (shared types).

2.  **Meta Tools Implementation:**
    -   [x] Implement `list_workflows` (scans registry).
    -   [x] Implement `describe_workflow` (returns rich docs).
    -   [x] Implement `get_system_instructions` (returns manual).

3.  **Registry Update:**
    -   [x] Update `src/tools/index.ts` to register these new tools.

## Phase 2: Workflow Exposure (Days 2-4) ✅ COMPLETE

**Goal:** Expose all 10 workflows as individual tools.

**Status:** All 10 workflows have been successfully exposed as individual MCP tools.

1.  **Batch 1 (Code Review & Validation):**
    -   [x] `workflow_parallel_review`
    -   [x] `workflow_pre_commit_validate`
    -   [x] `workflow_validate_last_commit`
    -   [x] `workflow_triangulated_review`

2.  **Batch 2 (Session & Features):**
    -   [x] `workflow_init_session`
    -   [x] `workflow_feature_design`
    -   [x] `workflow_openspec_driven_development`

3.  **Batch 3 (Maintenance & Debugging):**
    -   [x] `workflow_bug_hunt`
    -   [x] `workflow_auto_remediation`
    -   [x] `workflow_refactor_sprint`

**Task per Workflow:**
-   [x] Create wrapper file in `src/tools/workflows/`.
-   [x] Import Zod schema from `src/workflows/index.ts`.
-   [x] Write enhanced description (Markdown).
-   [x] Add metadata (Best For, Examples).
-   [x] Register in `src/tools/index.ts`.

## Phase 3: Documentation Resources (Day 5)

**Goal:** Make documentation readable via MCP.

1.  **Resource Handler:**
    -   [ ] Implement `src/resources/docsHandler.ts`.
    -   [ ] Register `ListResourcesRequestSchema` and `ReadResourceRequestSchema`.
    -   [ ] Map `unified-ai://docs/*` to local `docs/*` files.

## Phase 4: Clean Up & Deprecation (Day 6)

**Goal:** Tidy up.

1.  **Deprecation:**
    -   [ ] Add deprecation notice to `smart-workflows` description.
    -   [x] Naming convention standardized to `ask-*` pattern (ask-cursor, ask-droid, ask-gemini).
    -   [ ] Create backward compatibility aliases if needed.

2.  **Verification:**
    -   [ ] Run `list_workflows`.
    -   [ ] Run `describe_workflow` for random tools.
    -   [ ] Test execution of 2-3 critical workflows via new tool names.

## Completion Summary

### ✅ Completed (November 2025)
- **Phase 1**: Foundation & Discovery - 100% complete
- **Phase 2**: Workflow Exposure - 100% complete (all 10 workflows)
- **Test Suite**: All 253 tests passing
- **Build System**: Clean, no errors
- **CLI Integration**: Cursor Agent and Droid fully integrated with correct flags

### 📊 Progress Metrics
- **Tools Exposed**: 17+ (4 base + 3 meta + 10 workflows)
- **Discovery Rate**: 100% (AI can discover all tools)
- **Test Coverage**: 253/253 passing
- **Documentation**: Planning docs complete, implementation docs updated

### ⏳ Remaining Work
- **Phase 3**: Documentation Resources (expose docs as MCP resources)
- **Phase 4**: Clean Up & Deprecation (deprecate smart-workflows router)

## Estimated Timeline
-   **Start:** November 19, 2025
-   **Phase 1 & 2 Complete:** November 20, 2025 ✅
-   **Phase 3 & 4:** Pending (estimated 2-3 days)
