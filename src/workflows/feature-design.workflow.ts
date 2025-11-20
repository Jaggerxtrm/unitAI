import { z } from "zod";
import { AgentFactory } from "../agents/index.js";
import { createAgentConfig, formatAgentResults, formatWorkflowOutput } from "./utils.js";
import { AutonomyLevel } from "../utils/permissionManager.js";
import { executeAIClient, BACKENDS } from "../utils/aiExecutor.js";
import type {
  WorkflowDefinition,
  ProgressCallback
} from "./types.js";

/**
 * Feature Design Workflow - Orchestration Example
 *
 * This workflow demonstrates the orchestration of all three specialized agents:
 * 1. ArchitectAgent - Designs the architecture and approach
 * 2. ImplementerAgent - Generates production-ready code
 * 3. TesterAgent - Creates comprehensive tests
 *
 * Use Case: End-to-end feature development from design to tests
 */

/**
 * Schema Zod per il workflow feature-design
 */
const featureDesignSchema = z.object({
  featureDescription: z.string()
    .describe("Descrizione della feature da implementare"),
  targetFiles: z.array(z.string())
    .describe("File da creare o modificare"),
  context: z.string().optional()
    .describe("Contesto addizionale sul progetto"),
  architecturalFocus: z.enum(["design", "refactoring", "optimization", "security", "scalability"])
    .optional().default("design")
    .describe("Focus dell'analisi architetturale"),
  implementationApproach: z.enum(["incremental", "full-rewrite", "minimal"])
    .optional().default("incremental")
    .describe("Approccio implementativo"),
  testType: z.enum(["unit", "integration", "e2e"])
    .optional().default("unit")
    .describe("Tipo di test da generare"),
  autonomyLevel: z.nativeEnum(AutonomyLevel)
    .optional().describe("Livello di autonomia per le operazioni del workflow (default: read-only)"),
  validationBackends: z.array(z.enum(["ask-gemini", "cursor-agent", "droid"]))
    .optional()
    .describe("Backend aggiuntivi per validare il piano generato"),
  attachments: z.array(z.string())
    .optional()
    .describe("File di supporto (es. specifiche, log) da allegare ai backend aggiuntivi")
});

export type FeatureDesignParams = z.infer<typeof featureDesignSchema>;

/**
 * Esegue il workflow di feature design
 *
 * Orchestration Flow:
 * 1. Architecture Phase - ArchitectAgent analyzes and designs
 * 2. Implementation Phase - ImplementerAgent generates code
 * 3. Testing Phase - TesterAgent creates tests
 */
export async function executeFeatureDesign(
  params: FeatureDesignParams,
  onProgress?: ProgressCallback
): Promise<string> {
  const {
    featureDescription,
    targetFiles,
    context,
    architecturalFocus,
    implementationApproach,
    testType,
    validationBackends = [],
    attachments = []
  } = params;

  onProgress?.(`🎯 Starting feature design workflow for: ${featureDescription}`);

  // Create agent config from workflow params
  const agentConfig = createAgentConfig(params, onProgress);

  let finalOutput = "";
  const metadata: Record<string, any> = {
    featureDescription,
    targetFiles,
    timestamp: new Date().toISOString(),
    phases: [],
    validationBackends,
    attachments
  };

  // ============================================================================
  // PHASE 1: Architectural Design (ArchitectAgent)
  // ============================================================================

  try {
    onProgress?.("📐 Phase 1: Architectural Analysis and Design");

    const architect = AgentFactory.createArchitect();
    const architectResult = await architect.execute(
      {
        task: `Design the architecture for the following feature:\n\n${featureDescription}`,
        context,
        files: targetFiles,
        focus: architecturalFocus
      },
      agentConfig
    );

    // Format and append architect results
    finalOutput += formatAgentResults(architectResult, "ArchitectAgent");
    finalOutput += "\n\n---\n\n";

    metadata.phases.push({
      phase: "architecture",
      success: architectResult.success,
      backend: architectResult.metadata?.backend,
      executionTime: architectResult.metadata?.executionTime
    });

    // Check if architecture phase succeeded
    if (!architectResult.success) {
      onProgress?.("⚠️ Architecture phase failed, continuing with implementation...");
    } else {
      onProgress?.("✅ Architecture phase completed successfully");
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    onProgress?.(`❌ Architecture phase error: ${errorMsg}`);
    finalOutput += `## ⚠️ Architecture Phase Error\n\n${errorMsg}\n\n---\n\n`;
  }

  // ============================================================================
  // PHASE 2: Code Implementation (ImplementerAgent)
  // ============================================================================

  try {
    onProgress?.("💻 Phase 2: Code Implementation");

    const implementer = AgentFactory.createImplementer();
    let implementerResult = await implementer.execute(
      {
        task: featureDescription,
        targetFiles,
        codeContext: context,
        approach: implementationApproach
      },
      agentConfig
    );

    // Format and append implementer results
    finalOutput += formatAgentResults(implementerResult, "ImplementerAgent");
    finalOutput += "\n\n---\n\n";

    metadata.phases.push({
      phase: "implementation",
      success: implementerResult.success,
      backend: implementerResult.metadata?.backend,
      executionTime: implementerResult.metadata?.executionTime,
      changedFiles: implementerResult.output.changedFiles?.length || 0
    });

    if (!implementerResult.success) {
      onProgress?.("⚠️ Implementation phase failed, continuing with tests...");
    } else {
      onProgress?.("✅ Implementation phase completed successfully");
    }
    if (!implementerResult.success) {
      onProgress?.("🛠️ Cursor Agent fallback per suggerimenti di implementazione...");
      try {
        const cursorPlan = await executeAIClient({
          backend: BACKENDS.CURSOR,
          prompt: `Feature: ${featureDescription}

Target files: ${targetFiles.join(", ")}

Context (se disponibile):
${context || "N/A"}

Genera suggerimenti concreti di implementazione (patch outline, rischi, test consigliati).`,
          attachments: attachments.length ? attachments : targetFiles.slice(0, 3),
          outputFormat: "text",
          autoApprove: false
        });
        finalOutput += `\n## Cursor Agent Fallback Suggestions\n\n${cursorPlan}\n\n---\n\n`;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        finalOutput += `\n## Cursor Agent Fallback Suggestions\n\nImpossibile generare suggerimenti: ${errorMsg}\n\n---\n\n`;
      }
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    onProgress?.(`❌ Implementation phase error: ${errorMsg}`);
    finalOutput += `## ⚠️ Implementation Phase Error\n\n${errorMsg}\n\n---\n\n`;
  }

  // ============================================================================
  // PHASE 3: Test Generation (TesterAgent)
  // ============================================================================

  try {
    onProgress?.("🧪 Phase 3: Test Generation");

    const tester = AgentFactory.createTester();
    const testerResult = await tester.execute(
      {
        targetCode: `// Feature: ${featureDescription}\n// Files: ${targetFiles.join(", ")}`,
        testType,
        framework: "jest",
        coverageGoal: 80
      },
      agentConfig
    );

    // Format and append tester results
    finalOutput += formatAgentResults(testerResult, "TesterAgent");
    finalOutput += "\n\n---\n\n";

    metadata.phases.push({
      phase: "testing",
      success: testerResult.success,
      backend: testerResult.metadata?.backend,
      executionTime: testerResult.metadata?.executionTime,
      testCount: testerResult.output.testCount,
      coverage: testerResult.output.estimatedCoverage
    });

    if (!testerResult.success) {
      onProgress?.("⚠️ Test generation phase failed");
    } else {
      onProgress?.("✅ Test generation phase completed successfully");
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    onProgress?.(`❌ Test generation phase error: ${errorMsg}`);
    finalOutput += `## ⚠️ Test Generation Phase Error\n\n${errorMsg}\n\n---\n\n`;
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================

  const successfulPhases = metadata.phases.filter((p: any) => p.success).length;
  const totalPhases = metadata.phases.length;
  const overallSuccess = successfulPhases === totalPhases;

  finalOutput += `## 📊 Workflow Summary\n\n`;
  finalOutput += `**Overall Status:** ${overallSuccess ? "✅ SUCCESS" : "⚠️ PARTIAL SUCCESS"}\n\n`;
  finalOutput += `**Phases Completed:** ${successfulPhases}/${totalPhases}\n\n`;

  finalOutput += `### Phase Results\n\n`;
  metadata.phases.forEach((phase: any) => {
    const statusIcon = phase.success ? "✅" : "❌";
    finalOutput += `- ${statusIcon} **${phase.phase}**: ${phase.backend} (${phase.executionTime}ms)\n`;
  });

  finalOutput += `\n### Next Steps\n\n`;
  if (overallSuccess) {
    finalOutput += `1. Review the architectural design and implementation plan\n`;
    finalOutput += `2. Implement the suggested code changes\n`;
    finalOutput += `3. Add the generated tests to your test suite\n`;
    finalOutput += `4. Run tests and validate coverage\n`;
    finalOutput += `5. Commit changes with proper documentation\n`;
  } else {
    finalOutput += `1. Review the failed phases and error messages\n`;
    finalOutput += `2. Address any blocking issues\n`;
    finalOutput += `3. Re-run the workflow or execute failed phases individually\n`;
  }

  if (validationBackends.length > 0) {
    onProgress?.("🔎 Validazione addizionale con backend selezionati...");
    const validationOutputs: string[] = [];

    for (const backendName of validationBackends) {
      let label = "";
      let output = "";
      try {
        switch (backendName) {
          case "ask-gemini":
            label = "Gemini Validation";
            output = await executeAIClient({
              backend: BACKENDS.GEMINI,
              prompt: `Validate the following feature plan and highlight risks.

Feature: ${featureDescription}
Target files: ${targetFiles.join(", ")}

Plan:
${finalOutput}`
            });
            break;
          case "cursor-agent":
            label = "Cursor Agent Validation";
            output = await executeAIClient({
              backend: BACKENDS.CURSOR,
              prompt: `Review this feature plan and suggest improvements or missing steps.

Feature: ${featureDescription}
Plan:
${finalOutput}`,
              attachments,
              outputFormat: "text"
            });
            break;
          case "droid":
            label = "Droid Validation";
            output = await executeAIClient({
              backend: BACKENDS.DROID,
              prompt: `Validate the following feature implementation plan. Highlight operational risks and propose mitigation.

Feature: ${featureDescription}

Plan:
${finalOutput}`,
              auto: "low",
              attachments,
              outputFormat: "text"
            });
            break;
          default:
            continue;
        }
        validationOutputs.push(`### ${label}\n${output}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        validationOutputs.push(`### ${label || backendName}\nImpossibile completare la validazione: ${errorMsg}`);
      }
    }

    if (validationOutputs.length > 0) {
      finalOutput += `\n## Additional Validation Backends\n\n${validationOutputs.join("\n\n")}\n`;
    }
  }

  onProgress?.(`✨ Feature design workflow completed: ${successfulPhases}/${totalPhases} phases successful`);

  return formatWorkflowOutput(
    `Feature Design: ${featureDescription}`,
    finalOutput,
    metadata
  );
}

/**
 * Definizione del workflow feature-design
 */
export const featureDesignWorkflow: WorkflowDefinition = {
  name: 'feature-design',
  description: "Orchestrates ArchitectAgent, ImplementerAgent, and TesterAgent to design, implement, and test a new feature end-to-end",
  schema: featureDesignSchema,
  execute: executeFeatureDesign
};
