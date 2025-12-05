/**
 * Tool exports and registration
 */
import { registerTool } from "./registry.js";
import { askGeminiTool } from "./ask-gemini.tool.js";
import { smartWorkflowsTool } from "./smart-workflows.tool.js";
import { cursorAgentTool } from "./ask-cursor.tool.js";
import { droidTool } from "./droid.tool.js";
import { listWorkflowsTool, describeWorkflowTool, getSystemInstructionsTool } from "./meta/index.js";
import { workflowParallelReviewTool, workflowPreCommitValidateTool, workflowValidateLastCommitTool, workflowTriangulatedReviewTool, workflowInitSessionTool, workflowFeatureDesignTool, workflowBugHuntTool, workflowAutoRemediationTool, workflowRefactorSprintTool } from "./workflows/index.js";
import { initializeWorkflowRegistry } from "../workflows/index.js";
// Register all tools
registerTool(askGeminiTool);
registerTool(cursorAgentTool);
registerTool(droidTool);
registerTool(smartWorkflowsTool);
// Register Meta tools
registerTool(listWorkflowsTool);
registerTool(describeWorkflowTool);
registerTool(getSystemInstructionsTool);
// Register Workflow tools (Phase 2 Batch 1)
registerTool(workflowParallelReviewTool);
registerTool(workflowPreCommitValidateTool);
registerTool(workflowValidateLastCommitTool);
registerTool(workflowTriangulatedReviewTool);
// Register Workflow tools (Phase 2 Batch 2)
registerTool(workflowInitSessionTool);
registerTool(workflowFeatureDesignTool);
// Register Workflow tools (Phase 2 Batch 3)
registerTool(workflowBugHuntTool);
registerTool(workflowAutoRemediationTool);
registerTool(workflowRefactorSprintTool);
// Initialize workflow registry (registers all 6 workflows)
initializeWorkflowRegistry();
// Export everything
export * from "./registry.js";
export { askGeminiTool } from "./ask-gemini.tool.js";
export { smartWorkflowsTool } from "./smart-workflows.tool.js";
export { cursorAgentTool } from "./ask-cursor.tool.js";
export { droidTool } from "./droid.tool.js";
// Export Meta tools
export { listWorkflowsTool, describeWorkflowTool, getSystemInstructionsTool } from "./meta/index.js";
// Export Workflow tools
export { workflowParallelReviewTool, workflowPreCommitValidateTool, workflowValidateLastCommitTool, workflowTriangulatedReviewTool, workflowInitSessionTool, workflowFeatureDesignTool, workflowBugHuntTool, workflowAutoRemediationTool, workflowRefactorSprintTool } from "./workflows/index.js";
//# sourceMappingURL=index.js.map