import { z } from "zod";
export const getSystemInstructionsTool = {
    name: "get_system_instructions",
    description: "Get the 'System Instructions Manual', which provides essential information on how to use the Unified-AI tools effectively.",
    zodSchema: z.object({}),
    category: "meta",
    execute: async () => {
        return `
# Unified-AI System Instructions

You are operating within the Unified-AI environment. Your goal is to use the provided tools to solve complex software engineering tasks.

## Core Philosophy
1.  **Discover First:** Don't guess tool names or parameters. Use \`list_workflows\` and \`describe_workflow\` to understand what tools are available.
2.  **Be Specific:** Prefer granular tools (e.g., \`workflow_parallel_review\`) over generic ones.
3.  **Read Context:** Use \`read_resource\` (if available) or file operations to read documentation in \`docs/\` if you are unsure.

## Discovery Workflow
1.  **List:** Call \`list_workflows\` to see what capabilities are installed.
2.  **Learn:** Call \`describe_workflow({ name: "..." })\` to get detailed usage instructions and examples.
3.  **Execute:** Call the specific workflow tool with the correct parameters.

## Available Tool Categories
-   **Meta:** Discovery and system information (\`list_workflows\`, \`describe_workflow\`).
-   **Workflows:** High-level multi-step processes (Review, Debugging, Planning).
-   **Agents:** Direct access to AI models (\`ask_gemini\`, \`ask_cursor\`, \`ask_droid\`).

## Documentation
Extensive documentation is available in the \`docs/\` directory.
    `.trim();
    }
};
//# sourceMappingURL=get_system_instructions.tool.js.map