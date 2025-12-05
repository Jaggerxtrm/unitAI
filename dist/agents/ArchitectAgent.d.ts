/**
 * ArchitectAgent - High-level system design and architecture
 *
 * Uses Gemini for:
 * - Architectural analysis and design patterns
 * - Security and scalability assessment
 * - Refactoring strategies
 * - Long-term impact analysis
 *
 * @module agents/ArchitectAgent
 */
import { BaseAgent } from "./base/BaseAgent.js";
import type { ArchitectInput, ArchitectOutput } from "./types.js";
/**
 * ArchitectAgent specializes in architectural design and analysis
 *
 * Backend: Gemini (no fallback - architectural work requires deep reasoning)
 * Specialization: System design, security, scalability, refactoring strategies
 */
export declare class ArchitectAgent extends BaseAgent<ArchitectInput, ArchitectOutput> {
    readonly name = "ArchitectAgent";
    readonly description = "High-level system design, architecture analysis, and strategic planning using Gemini";
    readonly preferredBackend: "ask-gemini";
    readonly fallbackBackend: undefined;
    /**
     * Build specialized prompt for architectural analysis
     */
    protected buildPrompt(input: ArchitectInput): string;
    /**
     * Get focus-specific instructions
     */
    private getFocusInstructions;
    /**
     * Parse Gemini output into structured ArchitectOutput
     */
    protected parseOutput(rawOutput: string, input: ArchitectInput): ArchitectOutput;
    /**
     * Provide default output on failure
     */
    protected getDefaultOutput(): ArchitectOutput;
    /**
     * Build agent-specific metadata
     */
    protected buildMetadata(input: ArchitectInput, output: ArchitectOutput): Record<string, any>;
    /**
     * Validate input before execution
     */
    validateInput(input: ArchitectInput): boolean;
    /**
     * Extract a section from markdown-formatted output
     */
    private extractSection;
    /**
     * Extract a numbered or bulleted list from a section
     */
    private extractList;
    /**
     * Extract complexity estimate from output
     */
    private extractComplexity;
}
//# sourceMappingURL=ArchitectAgent.d.ts.map