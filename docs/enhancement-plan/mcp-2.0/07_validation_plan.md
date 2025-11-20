# Validation & Testing Plan

## Test Scenarios

### Scenario 1: The "Blank Slate" Discovery
**Objective:** Verify an AI with no prior context can discover capabilities.
1.  **Prompt:** "What workflows are available for code review?"
2.  **Expected Action:** AI calls `list_workflows`.
3.  **Expected Result:** List includes `workflow_parallel_review`, `workflow_triangulated_review` with categories/summaries.

### Scenario 2: Detailed Inquiry
**Objective:** Verify documentation is accessible.
1.  **Prompt:** "How does the parallel review workflow work and what are the parameters?"
2.  **Expected Action:** AI calls `describe_workflow({ name: "workflow_parallel_review" })`.
3.  **Expected Result:** Returns full Markdown description, parameters with types, and examples.

### Scenario 3: Execution via New Tool
**Objective:** Verify the wrapper works.
1.  **Prompt:** "Run a parallel review on src/utils/gitHelper.ts focusing on security."
2.  **Expected Action:** AI calls `workflow_parallel_review({ files: ["src/utils/gitHelper.ts"], focus: "security" })`.
3.  **Expected Result:** Workflow executes successfully (logs show backend calls).

### Scenario 4: Invalid Parameters (Validation)
**Objective:** Verify Zod validation works on the tool layer.
1.  **Prompt:** (Simulated) Call `workflow_parallel_review` with missing `files`.
2.  **Expected Result:** Tool returns clear error message about missing required field, not a generic crash.

### Scenario 5: Backward Compatibility
**Objective:** Verify legacy scripts still work.
1.  **Action:** Execute `smart-workflows` with old payload.
2.  **Expected Result:** Workflow executes, but optionally logs a deprecation warning.

### Scenario 6: Documentation Resource Access
**Objective:** Verify MCP Resources.
1.  **Prompt:** "Read the detailed workflow API reference."
2.  **Expected Action:** AI calls `read_resource({ uri: "unified-ai://docs/reference/api-workflows.md" })`.
3.  **Expected Result:** Content of the markdown file is returned.

## Success Metrics

-   **Discovery Time:** < 2 turns to find the right tool.
-   **Parameter Error Rate:** < 5% (thanks to clear schemas).
-   **Tool Availability:** 100% of workflows exposed as tools.

