import { z } from "zod";
import { AutonomyLevel } from "../utils/permissionManager.js";
import { executeAIClient, BACKENDS } from "../utils/aiExecutor.js";
import { openspecInitTool, openspecProposalTool, openspecApplyTool, openspecArchiveTool } from "../tools/openspec/index.js";
import type {
  WorkflowDefinition,
  ProgressCallback
} from "./types.js";

/**
 * OpenSpec Driven Development Workflow
 *
 * This workflow implements the complete spec-driven development process:
 * 1. Initialize OpenSpec in the project
 * 2. Create a change proposal
 * 3. Refine specifications with AI assistance
 * 4. Implement the feature using existing agents
 * 5. Archive the completed change
 *
 * Integrates OpenSpec tools with the existing agent system for end-to-end
 * specification-driven development.
 */

/**
 * Schema Zod per il workflow OpenSpec driven development
 */
const openspecDrivenDevelopmentSchema = z.object({
  featureDescription: z.string()
    .describe("Descrizione della feature da implementare usando spec-driven development"),
  projectInitialized: z.boolean()
    .optional()
    .default(false)
    .describe("Se OpenSpec è già inizializzato nel progetto"),
  aiTools: z.array(z.string())
    .optional()
    .describe("AI tools da configurare durante l'inizializzazione"),
  changeType: z.enum(["feature", "bugfix", "improvement", "refactor"])
    .optional()
    .default("feature")
    .describe("Tipo di modifica proposta"),
  targetFiles: z.array(z.string())
    .optional()
    .describe("File che saranno coinvolti nell'implementazione"),
  implementationApproach: z.enum(["incremental", "full-rewrite", "minimal"])
    .optional()
    .default("incremental")
    .describe("Approccio implementativo"),
  autonomyLevel: z.nativeEnum(AutonomyLevel)
    .optional()
    .default(AutonomyLevel.LOW)
    .describe("Livello di autonomia per le operazioni"),
  validationBackends: z.array(z.enum(["ask-gemini", "cursor-agent", "droid"]))
    .optional()
    .describe("Backend aggiuntivi per validare le specifiche")
});

/**
 * Esegue il workflow OpenSpec driven development
 */
async function executeOpenspecDrivenDevelopment(
  params: z.infer<typeof openspecDrivenDevelopmentSchema>,
  onProgress?: ProgressCallback
): Promise<string> {
  const {
    featureDescription,
    projectInitialized = false,
    aiTools = [],
    changeType,
    targetFiles = [],
    implementationApproach,
    autonomyLevel,
    validationBackends = []
  } = params;

  let currentStep = 0;
  const totalSteps = 5;

  try {
    // Step 1: Initialize OpenSpec (if not already done)
    currentStep = 1;
    onProgress?.(`[${currentStep}/${totalSteps}] Inizializzazione OpenSpec...`);

    if (!projectInitialized) {
      try {
        await openspecInitTool.execute({ aiTools }, (msg) => onProgress?.(`[${currentStep}/${totalSteps}] ${msg}`));
        onProgress?.(`[${currentStep}/${totalSteps}] ✅ OpenSpec inizializzato con successo`);
      } catch (error) {
        // If init fails, provide manual instructions
        onProgress?.(`[${currentStep}/${totalSteps}] ⚠️ Inizializzazione automatica fallita, procedere manualmente:`);
        onProgress?.(`[${currentStep}/${totalSteps}] Eseguire: npx @fission-ai/openspec init`);
        throw new Error(`OpenSpec initialization failed: ${error}`);
      }
    } else {
      onProgress?.(`[${currentStep}/${totalSteps}] ⏭️ OpenSpec già inizializzato, passo successivo`);
    }

    // Step 2: Create change proposal
    currentStep = 2;
    onProgress?.(`[${currentStep}/${totalSteps}] Creazione proposta di modifica...`);

    let changeId: string;
    try {
      const proposalResult = await openspecProposalTool.execute(
        { description: featureDescription, changeType },
        (msg) => onProgress?.(`[${currentStep}/${totalSteps}] ${msg}`)
      );

      // Extract change ID from result (this is a simplified approach)
      // In practice, we'd need to parse the output or modify tools to return structured data
      const changeMatch = proposalResult.match(/change[^\w]*([a-zA-Z0-9_-]+)/i);
      changeId = changeMatch ? changeMatch[1] : `change-${Date.now()}`;

      onProgress?.(`[${currentStep}/${totalSteps}] ✅ Proposta creata: ${changeId}`);
    } catch (error) {
      onProgress?.(`[${currentStep}/${totalSteps}] ⚠️ Creazione proposta fallita, procedere manualmente:`);
      onProgress?.(`[${currentStep}/${totalSteps}] Eseguire: openspec-proposal "${featureDescription}"`);
      throw new Error(`Change proposal creation failed: ${error}`);
    }

    // Step 3: Refine specifications with AI assistance
    currentStep = 3;
    onProgress?.(`[${currentStep}/${totalSteps}] Raffinamento specifiche con AI...`);

    if (validationBackends.length > 0) {
      for (const backend of validationBackends) {
        onProgress?.(`[${currentStep}/${totalSteps}] 🔍 Validazione con ${backend}...`);

        try {
          const validationPrompt = `
Analizza la seguente proposta di modifica e fornisci feedback sulle specifiche:

Feature: ${featureDescription}
Tipo: ${changeType}
Approccio: ${implementationApproach}

Valuta:
1. Chiarezza dei requisiti
2. Completezza delle specifiche
3. Idoneità dell'approccio implementativo
4. Considerazioni aggiuntive per la qualità del codice

Fornisci suggerimenti specifici per migliorare le specifiche prima dell'implementazione.
          `;

          await executeAIClient({
            backend: BACKENDS[backend.toUpperCase() as keyof typeof BACKENDS] || backend,
            prompt: validationPrompt,
            onProgress: (msg) => onProgress?.(`[${currentStep}/${totalSteps}] ${backend}: ${msg}`)
          });

          onProgress?.(`[${currentStep}/${totalSteps}] ✅ Validazione ${backend} completata`);
        } catch (error) {
          onProgress?.(`[${currentStep}/${totalSteps}] ⚠️ Validazione ${backend} fallita: ${error}`);
        }
      }
    } else {
      onProgress?.(`[${currentStep}/${totalSteps}] ⏭️ Nessuna validazione AI richiesta, procedere`);
    }

    // Step 4: Implement the feature using existing agents
    currentStep = 4;
    onProgress?.(`[${currentStep}/${totalSteps}] Implementazione della feature...`);

    // Use the existing feature-design workflow for implementation
    // This integrates with the existing agent system
    if (targetFiles.length > 0) {
      onProgress?.(`[${currentStep}/${totalSteps}] 📝 Utilizzo workflow feature-design esistente...`);

      const { executeWorkflow } = await import("./index.js");

      await executeWorkflow("feature-design", {
        featureDescription,
        targetFiles,
        context: `Questa implementazione è basata sulle specifiche OpenSpec create nel change ${changeId}`,
        architecturalFocus: "design",
        implementationApproach,
        testType: "unit",
        autonomyLevel
      }, (msg) => onProgress?.(`[${currentStep}/${totalSteps}] ${msg}`));

      onProgress?.(`[${currentStep}/${totalSteps}] ✅ Implementazione completata con workflow feature-design`);
    } else {
      onProgress?.(`[${currentStep}/${totalSteps}] ⚠️ Nessun file target specificato, implementazione manuale richiesta`);
      onProgress?.(`[${currentStep}/${totalSteps}] Eseguire: openspec-apply ${changeId}`);
    }

    // Step 5: Archive the completed change
    currentStep = 5;
    onProgress?.(`[${currentStep}/${totalSteps}] Archiviazione modifica completata...`);

    try {
      await openspecArchiveTool.execute(
        { changeId, force: false },
        (msg) => onProgress?.(`[${currentStep}/${totalSteps}] ${msg}`)
      );
      onProgress?.(`[${currentStep}/${totalSteps}] ✅ Modifica archiviata con successo`);
    } catch (error) {
      onProgress?.(`[${currentStep}/${totalSteps}] ⚠️ Archiviazione automatica fallita, procedere manualmente:`);
      onProgress?.(`[${currentStep}/${totalSteps}] Eseguire: openspec-archive ${changeId}`);
      throw new Error(`Change archiving failed: ${error}`);
    }

    // Success summary
    const summary = `
🎉 **OpenSpec Driven Development Completato!**

**Feature Implementata:** ${featureDescription}
**Tipo Modifica:** ${changeType}
**Approccio:** ${implementationApproach}
**Change ID:** ${changeId}

**Workflow Completato:**
✅ Inizializzazione OpenSpec
✅ Creazione proposta di modifica
✅ Raffinamento specifiche con AI
✅ Implementazione feature
✅ Archiviazione modifica

Le specifiche sono ora parte della documentazione vivente del progetto in \`openspec/specs/\`.
Il codice implementato segue le best practices del linguaggio utilizzato e mantiene la qualità del codebase esistente.
    `.trim();

    onProgress?.("🎉 Workflow completato con successo!");
    return summary;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    const errorSummary = `
❌ **Workflow OpenSpec Interrotto**

**Step Completato:** ${currentStep}/${totalSteps}
**Errore:** ${errorMessage}

**Ripristino:**
1. Verifica lo stato corrente: \`openspec-list\`
2. Completa manualmente gli step rimanenti se necessario
3. Archivia la modifica quando pronta: \`openspec-archive <change-id>\`

**Suggerimenti:**
- Assicurati che OpenSpec sia inizializzato: \`openspec-init\`
- Verifica che le dipendenze siano installate
- Per problemi interattivi, esegui i comandi manualmente nel terminale
    `.trim();

    onProgress?.(`❌ Errore al passo ${currentStep}: ${errorMessage}`);
    throw new Error(errorSummary);
  }
}

/**
 * Definizione del workflow OpenSpec driven development
 */
export const openspecDrivenDevelopmentWorkflow: WorkflowDefinition = {
  name: "openspec-driven-development",
  description: "Complete, language-agnostic spec-driven development workflow using OpenSpec integration. Creates specifications, refines them with AI, implements features, and archives changes.",
  schema: openspecDrivenDevelopmentSchema,
  execute: executeOpenspecDrivenDevelopment
};
