/**
 * Tool exports and registration
 */
import { registerTool } from "./registry.js";
import { askQwenTool } from "./ask-qwen.tool.js";
import { askRovodevTool } from "./ask-rovodev.tool.js";
import { askGeminiTool } from "./ask-gemini.tool.js";
import { smartWorkflowsTool } from "./smart-workflows.tool.js";
import { initializeWorkflowRegistry } from "../workflows/index.js";

// Register all tools
registerTool(askQwenTool);
registerTool(askRovodevTool);
registerTool(askGeminiTool);
registerTool(smartWorkflowsTool);

// Initialize workflow registry (registers all 6 workflows)
initializeWorkflowRegistry();

// Export everything
export * from "./registry.js";
export { askQwenTool } from "./ask-qwen.tool.js";
export { askRovodevTool } from "./ask-rovodev.tool.js";
export { askGeminiTool } from "./ask-gemini.tool.js";
export { smartWorkflowsTool } from "./smart-workflows.tool.js";