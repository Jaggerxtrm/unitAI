/**
 * Base Agent Implementation
 *
 * Abstract base class providing common functionality for all specialized agents.
 * Implements the Template Method pattern with hooks for agent-specific logic.
 *
 * @module agents/base/BaseAgent
 */
import type { IAgent, AgentConfig, AgentResult } from "../types.js";
/**
 * Abstract base class for all agents
 *
 * Provides:
 * - Execution flow with retry logic
 * - Error handling with fallback backend
 * - Progress reporting
 * - Metadata collection
 * - Input validation
 *
 * Subclasses must implement:
 * - buildPrompt() - Create AI-specific prompt
 * - parseOutput() - Parse AI response into structured output
 * - getDefaultOutput() - Provide default output on failure
 *
 * @template TInput - Input type for the agent
 * @template TOutput - Output type for the agent
 */
export declare abstract class BaseAgent<TInput, TOutput> implements IAgent<TInput, TOutput> {
    /**
     * Unique name for the agent (must be implemented by subclass)
     */
    abstract readonly name: string;
    /**
     * Human-readable description (must be implemented by subclass)
     */
    abstract readonly description: string;
    /**
     * Preferred AI backend (must be implemented by subclass)
     */
    abstract readonly preferredBackend: string;
    /**
     * Optional fallback backend (can be undefined)
     */
    abstract readonly fallbackBackend?: string;
    /**
     * Main execution method - implements retry logic and error handling
     *
     * Flow:
     * 1. Validate input (if validateInput is implemented)
     * 2. Build prompt for AI backend
     * 3. Execute with preferred backend
     * 4. If fails and fallback available, try fallback
     * 5. Parse raw output into structured format
     * 6. Return result with metadata
     *
     * @param input - Task-specific input
     * @param config - Agent configuration
     * @returns Result with success status, output, and metadata
     */
    execute(input: TInput, config: AgentConfig): Promise<AgentResult<TOutput>>;
    /**
     * Execute AI backend with prompt
     *
     * @param backend - Backend to execute (gemini, cursor-agent, droid)
     * @param prompt - Prompt to send to backend
     * @param config - Agent configuration
     * @returns Raw output from AI backend
     * @protected
     */
    protected executeWithBackend(backend: string, prompt: string, config: AgentConfig): Promise<string>;
    /**
     * Build the prompt for the AI backend
     *
     * This method must be implemented by each agent to create
     * domain-specific prompts optimized for their AI backend.
     *
     * @param input - Task input
     * @returns Prompt string for AI backend
     * @protected
     * @abstract
     */
    protected abstract buildPrompt(input: TInput): Promise<string> | string;
    /**
     * Parse raw AI output into structured output type
     *
     * This method must be implemented by each agent to extract
     * structured data from the AI's response.
     *
     * @param rawOutput - Raw output from AI backend
     * @param input - Original input (for context during parsing)
     * @returns Structured output
     * @protected
     * @abstract
     */
    protected abstract parseOutput(rawOutput: string, input: TInput): Promise<TOutput> | TOutput;
    /**
     * Get default output in case of failure
     *
     * This method must be implemented by each agent to provide
     * a sensible default when execution fails.
     *
     * @returns Default output structure
     * @protected
     * @abstract
     */
    protected abstract getDefaultOutput(): TOutput;
    /**
     * Build additional metadata specific to this agent
     *
     * Optional method that can be overridden to add agent-specific
     * metadata to the execution result.
     *
     * @param input - Task input
     * @param output - Task output
     * @returns Additional metadata fields
     * @protected
     */
    protected buildMetadata(input: TInput, output: TOutput): Record<string, any>;
    /**
     * Optional input validation
     *
     * Can be implemented by subclasses to validate input before execution.
     * If validation fails, execution will not proceed.
     *
     * @param input - Input to validate
     * @returns True if valid, false otherwise
     */
    validateInput?(input: TInput): boolean | Promise<boolean>;
}
//# sourceMappingURL=BaseAgent.d.ts.map