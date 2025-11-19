/**
 * Tool exports and registration
 */
import { registerTool } from "./registry.js";
import { askGeminiTool } from "./ask-gemini.tool.js";
import { smartWorkflowsTool } from "./smart-workflows.tool.js";
import { cursorAgentTool } from "./cursor-agent.tool.js";
import { droidTool } from "./droid.tool.js";
import {
  openspecInitTool,
  openspecProposalTool,
  openspecApplyTool,
  openspecArchiveTool,
  openspecListTool,
  openspecShowTool,
} from "./openspec/index.js";
import { initializeWorkflowRegistry } from "../workflows/index.js";

// Register all tools
registerTool(askGeminiTool);
registerTool(cursorAgentTool);
registerTool(droidTool);
registerTool(smartWorkflowsTool);

// Register OpenSpec tools
registerTool(openspecInitTool);
registerTool(openspecProposalTool);
registerTool(openspecApplyTool);
registerTool(openspecArchiveTool);
registerTool(openspecListTool);
registerTool(openspecShowTool);

// Initialize workflow registry (registers all 6 workflows)
initializeWorkflowRegistry();

// Export everything
export * from "./registry.js";
export { askGeminiTool } from "./ask-gemini.tool.js";
export { smartWorkflowsTool } from "./smart-workflows.tool.js";
export { cursorAgentTool } from "./cursor-agent.tool.js";
export { droidTool } from "./droid.tool.js";

// Export OpenSpec tools
export {
  openspecInitTool,
  openspecProposalTool,
  openspecApplyTool,
  openspecArchiveTool,
  openspecListTool,
  openspecShowTool,
} from "./openspec/index.js";