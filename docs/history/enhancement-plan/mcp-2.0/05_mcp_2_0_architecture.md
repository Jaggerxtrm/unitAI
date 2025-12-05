# MCP 2.0 Architecture Proposal

## Overview

The MCP 2.0 architecture shifts from a "Router" pattern (one tool dispatching to many) to a "Tool Suite" pattern (many specific tools). This maximizes discoverability and leverages the LLM's native tool selection capabilities.

## 1. Tool Naming & Organization

We will adopt a **`snake_case`** convention with semantic prefixes.

### Workflow Tools (`workflow_*`)
Each workflow becomes a standalone tool.

-   `workflow_parallel_review`
-   `workflow_pre_commit_validate`
-   `workflow_init_session`
-   `workflow_validate_last_commit`
-   `workflow_feature_design`
-   `workflow_bug_hunt`
-   `workflow_triangulated_review`
-   `workflow_auto_remediation`
-   `workflow_refactor_sprint`
-   `workflow_openspec_driven_development`

### Meta/Discovery Tools (`list_*`, `describe_*`)
Tools for the AI to learn about the system.

-   `list_workflows`: Returns a categorized list of all available workflows.
-   `describe_workflow`: Returns detailed documentation (including examples) for a specific workflow.
-   `get_system_instructions`: Returns the high-level manual (like Serena's `initial_instructions`).

### Backend Tools (Renaming recommended for consistency)
-   `ask_gemini` (was `ask-gemini`)
-   `ask_cursor_agent` (was `ask-cursor` - explicit "ask" verb)
-   `ask_droid` (was `droid` - explicit "ask" verb)

## 2. Enhanced Tool Definition Structure

Each tool will use a `WorkflowTool` interface that supports rich metadata.

```typescript
interface WorkflowToolDefinition {
  name: string;          // e.g., "workflow_parallel_review"
  summary: string;       // 1-liner for the tool list
  description: string;   // Full Markdown documentation
  schema: z.ZodSchema;   // Zod schema for validation
  
  // Metadata for "describe_workflow" and formatting
  metadata: {
    category: 'code-review' | 'debugging' | 'planning' | 'validation';
    bestFor: string[];
    notFor: string[];
    cost: 'low' | 'medium' | 'high';
    duration: string;
    backends: string[];
  };
  
  // Inline examples for the AI
  examples: Array<{
    scenario: string;
    params: Record<string, any>;
  }>;
}
```

## 3. Documentation as MCP Resources

We will expose the `docs/` directory as read-only MCP Resources.

**URI Scheme:** `unified-ai://docs/<path>`

**Key Resources:**
-   `unified-ai://docs/reference/api-workflows.md`
-   `unified-ai://docs/guides/cursor-droid-playbook.md`
-   `unified-ai://docs/WORKFLOWS.md`

## 4. Backward Compatibility

To prevent breaking existing clients/prompts:

1.  **Keep `smart-workflows`:** Maintain the `smart-workflows` tool but mark it as **DEPRECATED** in its description.
2.  **Wrappers:** The `smart-workflows` tool will simply call the new `workflow_*` functions internally.

## 5. Directory Structure

```
src/
  tools/
    index.ts              // Main registry
    backends/             // ask_gemini, ask_cursor, etc.
    workflows/            // New wrapper tools
      index.ts
      parallel_review.tool.ts
      bug_hunt.tool.ts
      ...
    meta/                 // Discovery tools
      index.ts
      list_workflows.tool.ts
      describe_workflow.tool.ts
  workflows/              // EXISTING LOGIC (Unchanged)
    parallel-review.workflow.ts
    ...
```

## 6. Migration Strategy

1.  Implement `src/tools/meta/` (Discovery).
2.  Implement `src/tools/workflows/` (Wrappers).
3.  Update `src/tools/index.ts` to register new tools.
4.  Mark `smart-workflows` as deprecated.
5.  Verify with `list_workflows`.

