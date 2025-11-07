/**
 * Tool exports and registration
 */
import { registerTool } from "./registry.js";
import { askQwenTool } from "./ask-qwen.tool.js";
import { askRovodevTool } from "./ask-rovodev.tool.js";
import { askGeminiTool } from "./ask-gemini.tool.js";
import { smartWorkflowsTool } from "./smart-workflows.tool.js";

// Import dei workflow
import { initSessionWorkflow } from "../workflows/init-session.workflow.js";
import { parallelReviewWorkflow } from "../workflows/parallel-review.workflow.js";
import { validateLastCommitWorkflow } from "../workflows/validate-last-commit.workflow.js";
import { registerWorkflow, initializeWorkflowRegistry } from "../workflows/index.js";

// Register all tools
registerTool(askQwenTool);
registerTool(askRovodevTool);
registerTool(askGeminiTool);
registerTool(smartWorkflowsTool);

// Register all workflows
registerWorkflow("init-session", initSessionWorkflow);
registerWorkflow("parallel-review", parallelReviewWorkflow);
registerWorkflow("validate-last-commit", validateLastCommitWorkflow);

// Initialize workflow registry
initializeWorkflowRegistry();

// Export everything
export * from "./registry.js";
export { askQwenTool } from "./ask-qwen.tool.js";
export { askRovodevTool } from "./ask-rovodev.tool.js";
export { askGeminiTool } from "./ask-gemini.tool.js";
export { smartWorkflowsTool } from "./smart-workflows.tool.js";