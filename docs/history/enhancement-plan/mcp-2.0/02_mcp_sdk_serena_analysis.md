# MCP SDK & Serena Analysis Report

This document analyzes the capabilities of the MCP TypeScript SDK and the best practices demonstrated by the Serena MCP implementation.

## Serena MCP Tool Inventory & Patterns

Based on the analysis of the installed Serena tools and its instruction manual.

### Tool Categories

Serena organizes its ~20 tools into logical groups (though flattened in the MCP list):

1.  **Symbolic Tools (Code Navigation & Editing)**
    -   `find_symbol`: Find symbols by name path (key tool).
    -   `find_referencing_symbols`: Find usages.
    -   `get_symbols_overview`: High-level file view.
    -   `replace_symbol_body`: Surgical editing.
    -   `insert_after_symbol` / `insert_before_symbol`: Surgical insertion.
    -   `rename_symbol`: Refactoring.

2.  **File Operations**
    -   `list_dir`: Directory listing.
    -   `find_file`: File search by mask.
    -   `search_for_pattern`: Regex content search.

3.  **Memory Management**
    -   `write_memory`, `read_memory`, `list_memories`, `delete_memory`, `edit_memory`.

4.  **Meta / Discovery Tools**
    -   `initial_instructions`: Provides the "Manual".
    -   `check_onboarding_performed` / `onboarding`: Setup lifecycle.
    -   `think_about_*`: Cognitive steps (reflection).

### Key Patterns Identified

1.  **Naming Convention:**
    -   **Style:** `snake_case` (e.g., `find_symbol`, `list_memories`).
    -   **Structure:** Verb-first (`find_`, `get_`, `write_`). This makes actions clear and predictable.
    -   **Prefixes:** While Serena uses `serena_` prefix for the package, the internal tool names are clean.

2.  **Rich Documentation:**
    -   **Descriptions:** Multi-paragraph descriptions are used effectively. They contain:
        -   What the tool does.
        -   How to use parameters (with mini-examples/explanations).
        -   When to use it (context).
    -   **Manual:** The `initial_instructions` tool acts as a comprehensive manual, explaining the philosophy ("read only necessary code") and workflow.

3.  **Discovery & Onboarding:**
    -   Serena doesn't assume the AI knows everything. It provides a "Manual" (`initial_instructions`) and checks if onboarding is done (`check_onboarding_performed`).
    -   This allows the AI to "learn" the system dynamically.

4.  **Parameter Design:**
    -   Parameters have clear, descriptive names (`name_path`, `relative_path`).
    -   Complex concepts (like "name path") are explained in the tool description.

## MCP SDK Capabilities Analysis

### Description Support
-   **Markdown:** The SDK supports Markdown in `description` fields. This allows for headers, lists, and code blocks within the tool description tooltip/context.
-   **Length:** Long descriptions are supported and useful for LLMs.

### Schema Design
-   **Zod Integration:** The SDK uses Zod for schema definition, which allows for:
    -   `describe()`: Adding descriptions to individual parameters.
    -   `default()`: Setting default values.
    -   `optional()`: Marking parameters as optional.
-   **Validation:** Runtime validation ensures the AI sends correct data types.

### Resources vs. Tools
-   **Tools:** Best for executable actions (running a workflow, editing a file).
-   **Resources:** Best for static content (reading documentation, logs).
-   **Prompts:** Best for reusable prompt templates (less applicable for complex workflows with many params).

## Recommendations for Unified-AI MCP 2.0

1.  **Adopt `snake_case` & Verb-First Naming:**
    -   `workflow_parallel_review`, `workflow_bug_hunt`.
    -   `list_workflows`, `describe_workflow`.

2.  **Implement "Meta-Tools" for Discovery:**
    -   Create `list_workflows` to expose the catalogue.
    -   Create `describe_workflow` to give detailed docs on demand.
    -   Consider a `get_system_instructions` tool similar to Serena's `initial_instructions`.

3.  **Expose Documentation as Resources:**
    -   Use MCP Resources to serve the Markdown files in `docs/`.
    -   URI scheme: `unified-ai://docs/reference/api-workflows`.

4.  **Rich Descriptions:**
    -   Enhance tool descriptions to include "Best For", "Not For", and "Examples" sections (as proposed in `TOOL_DESCRIPTIONS_ENHANCED.md`).

5.  **Explicit Workflow Tools:**
    -   Move away from the single routing tool (`smart-workflows`) to individual tools for each workflow. This reduces cognitive load on the AI and makes parameter validation stricter and clearer.

