import { z } from "zod";
import { UnifiedTool, toolRegistry } from "../registry.js";

export const describeWorkflowTool: UnifiedTool = {
  name: "describe_workflow",
  description: "Get detailed documentation for a specific workflow, including parameters, usage examples, and best practices.",
  zodSchema: z.object({
    name: z.string().describe("The name of the workflow tool (e.g., 'workflow_parallel_review')")
  }),
  category: "meta",
  execute: async ({ name }) => {
    const tool = toolRegistry.find(t => t.name === name);
    
    if (!tool) {
      return `Error: Workflow '${name}' not found. Use 'list_workflows' to see available options.`;
    }

    // Build documentation
    let doc = `# ${tool.name}\n\n`;
    doc += `${tool.description}\n\n`;

    if (tool.metadata) {
      doc += `## Characteristics\n`;
      if (tool.metadata.category) doc += `- **Category**: ${tool.metadata.category}\n`;
      if (tool.metadata.cost) doc += `- **Cost**: ${tool.metadata.cost}\n`;
      if (tool.metadata.duration) doc += `- **Estimated Duration**: ${tool.metadata.duration}\n`;
      if (tool.metadata.backends) doc += `- **Backends**: ${tool.metadata.backends.join(', ')}\n`;
      
      if (tool.metadata.bestFor && tool.metadata.bestFor.length > 0) {
        doc += `\n## Best For\n`;
        tool.metadata.bestFor.forEach(item => doc += `- ${item}\n`);
      }

      if (tool.metadata.notFor && tool.metadata.notFor.length > 0) {
        doc += `\n## Not Recommended For\n`;
        tool.metadata.notFor.forEach(item => doc += `- ${item}\n`);
      }
    }

    if (tool.examples && tool.examples.length > 0) {
      doc += `\n## Examples\n`;
      tool.examples.forEach(ex => {
        doc += `### ${ex.scenario}\n`;
        doc += "```json\n";
        doc += JSON.stringify(ex.params, null, 2);
        doc += "\n```\n";
      });
    }

    return doc;
  }
};

