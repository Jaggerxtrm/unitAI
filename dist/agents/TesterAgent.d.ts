/**
 * TesterAgent - Fast test generation and validation
 *
 * Uses Cursor Agent for:
 * - Unit test generation
 * - Integration test generation
 * - Test coverage analysis
 * - Fast iteration on test cases
 *
 * @module agents/TesterAgent
 */
import { BaseAgent } from "./base/BaseAgent.js";
import type { TesterInput, TesterOutput } from "./types.js";
/**
 * TesterAgent specializes in fast test generation
 *
 * Backend: Cursor Agent (no fallback - optimized for speed)
 * Specialization: Test generation, coverage analysis, edge case detection
 */
export declare class TesterAgent extends BaseAgent<TesterInput, TesterOutput> {
    readonly name = "TesterAgent";
    readonly description = "Fast test generation and coverage analysis using Cursor Agent";
    readonly preferredBackend: "ask-cursor";
    readonly fallbackBackend: undefined;
    /**
     * Build specialized prompt for test generation
     */
    protected buildPrompt(input: TesterInput): string;
    /**
     * Get test-type specific instructions
     */
    private getTestTypeInstructions;
    /**
     * Parse Cursor Agent output into structured TesterOutput
     */
    protected parseOutput(rawOutput: string, input: TesterInput): TesterOutput;
    /**
     * Provide default output on failure
     */
    protected getDefaultOutput(): TesterOutput;
    /**
     * Build agent-specific metadata
     */
    protected buildMetadata(input: TesterInput, output: TesterOutput): Record<string, any>;
    /**
     * Validate input before execution
     */
    validateInput(input: TesterInput): boolean;
    /**
     * Extract code block from output
     */
    private extractCodeBlock;
    /**
     * Count test cases in generated code
     */
    private countTests;
    /**
     * Extract coverage percentage from output
     */
    private extractCoverage;
    /**
     * Estimate coverage based on test count (heuristic)
     */
    private estimateCoverage;
    /**
     * Extract recommendations from output
     */
    private extractRecommendations;
    /**
     * Extract a section from markdown-formatted output
     */
    private extractSection;
}
//# sourceMappingURL=TesterAgent.d.ts.map