/**
 * ImplementerAgent - Precise code implementation with production quality
 *
 * Uses Droid (GLM-4.6) for:
 * - Production-ready code generation
 * - Bug fixing and code modifications
 * - Incremental implementation
 * - Code quality and best practices
 *
 * Future: Will integrate with Serena for surgical edits (Task 2.4)
 *
 * @module agents/ImplementerAgent
 */
import { BaseAgent } from "./base/BaseAgent.js";
import type { ImplementerInput, ImplementerOutput } from "./types.js";
/**
 * ImplementerAgent specializes in code implementation and modification
 *
 * Backend: Droid (GLM-4.6)
 * Specialization: Production code generation, bug fixes, incremental changes
 */
export declare class ImplementerAgent extends BaseAgent<ImplementerInput, ImplementerOutput> {
    readonly name = "ImplementerAgent";
    readonly description = "Precise code implementation with production-quality standards using Droid (GLM-4.6)";
    readonly preferredBackend: "ask-droid";
    readonly fallbackBackend: undefined;
    /**
     * Build specialized prompt for code implementation
     */
    protected buildPrompt(input: ImplementerInput): string;
    /**
     * Get approach-specific instructions
     */
    private getApproachInstructions;
    /**
     * Parse Droid/Gemini output into structured ImplementerOutput
     */
    protected parseOutput(rawOutput: string, input: ImplementerInput): ImplementerOutput;
    /**
     * Provide default output on failure
     */
    protected getDefaultOutput(): ImplementerOutput;
    /**
     * Build agent-specific metadata
     */
    protected buildMetadata(input: ImplementerInput, output: ImplementerOutput): Record<string, any>;
    /**
     * Validate input before execution
     */
    validateInput(input: ImplementerInput): boolean;
    /**
     * Extract a section from markdown-formatted output
     */
    private extractSection;
    /**
     * Extract a numbered or bulleted list from a section
     */
    private extractList;
    /**
     * Extract code snippets from output
     *
     * Looks for patterns like:
     * - File: `filename.ts`
     * - ```typescript ... ```
     */
    private extractCodeSnippets;
}
//# sourceMappingURL=ImplementerAgent.d.ts.map