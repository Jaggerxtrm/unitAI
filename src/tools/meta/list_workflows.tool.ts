import { z } from "zod";
import { UnifiedTool, toolRegistry } from "../registry.js";

export const listWorkflowsTool: UnifiedTool = {
  name: "list_workflows",
  description: "List all available workflows in the system. Returns a categorized list of tools that can be used for high-level tasks.",
  zodSchema: z.object({
    category: z.enum(['all', 'code-review', 'debugging', 'planning', 'validation'])
      .optional()
      .default('all')
      .describe("Filter by category")
  }),
  category: "meta",
  execute: async ({ category }) => {
    const workflows = toolRegistry.filter(t =>
      (t.name.startsWith('workflow_') || t.category === 'workflow') &&
      (category === 'all' || t.metadata?.category === category)
    );

    if (workflows.length === 0) {
      return "No workflows found. (Note: Workflows are being migrated to tools in Phase 2)";
    }

    const lines = workflows.map(w => {
      // Use first line of description as summary if available
      const summary = w.description.split('\n')[0];
      const cat = w.metadata?.category ? `[${w.metadata.category}]` : '';
      return `- **${w.name}** ${cat}: ${summary}`;
    });

    return `# Available Workflows\n\n${lines.join('\n')}`;
  }
};

