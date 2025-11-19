/**
 * Base Agent Implementation
 *
 * Abstract base class providing common functionality for all specialized agents.
 * Implements the Template Method pattern with hooks for agent-specific logic.
 *
 * @module agents/base/BaseAgent
 */

import { executeAIClient } from "../../utils/aiExecutor.js";
import { logger } from "../../utils/logger.js";
import type {
  IAgent,
  AgentConfig,
  AgentResult,
  AgentMetadata,
  AgentError
} from "../types.js";

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
export abstract class BaseAgent<TInput, TOutput> implements IAgent<TInput, TOutput> {
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
  async execute(input: TInput, config: AgentConfig): Promise<AgentResult<TOutput>> {
    const startTime = Date.now();
    const { onProgress } = config;

    try {
      // Step 1: Validate input if validation method exists
      if (this.validateInput) {
        const isValid = await this.validateInput(input);
        if (!isValid) {
          throw new Error("Input validation failed");
        }
      }

      onProgress?.(`${this.name} starting execution...`);
      logger.info(`[${this.name}] Executing with backend: ${this.preferredBackend}`);

      // Step 2: Build prompt for AI backend
      const prompt = await this.buildPrompt(input);

      // Step 3: Execute with preferred backend
      let rawOutput: string;
      let backendUsed: string;

      try {
        rawOutput = await this.executeWithBackend(
          this.preferredBackend,
          prompt,
          config
        );
        backendUsed = this.preferredBackend;
        logger.info(`[${this.name}] Primary backend succeeded`);
      } catch (error) {
        // Try fallback backend if available
        if (this.fallbackBackend) {
          logger.warn(
            `[${this.name}] Primary backend failed, trying fallback: ${this.fallbackBackend}`,
            error
          );
          onProgress?.(`Switching to fallback backend: ${this.fallbackBackend}`);

          rawOutput = await this.executeWithBackend(
            this.fallbackBackend,
            prompt,
            config
          );
          backendUsed = this.fallbackBackend;
          logger.info(`[${this.name}] Fallback backend succeeded`);
        } else {
          // No fallback available, rethrow error
          throw error;
        }
      }

      // Step 4: Parse raw output into structured format
      const output = await this.parseOutput(rawOutput, input);

      // Step 5: Build metadata
      const metadata: AgentMetadata = {
        backend: backendUsed,
        executionTime: Date.now() - startTime,
        autonomyLevel: config.autonomyLevel,
        ...this.buildMetadata(input, output)
      };

      onProgress?.(`${this.name} completed successfully`);
      logger.info(`[${this.name}] Success in ${metadata.executionTime}ms`);

      return {
        success: true,
        output,
        metadata
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[${this.name}] Failed: ${errorMsg}`, error);

      return {
        success: false,
        output: this.getDefaultOutput(),
        metadata: {
          backend: this.preferredBackend,
          executionTime: Date.now() - startTime,
          autonomyLevel: config.autonomyLevel
        },
        error: errorMsg
      };
    }
  }

  /**
   * Execute AI backend with prompt
   *
   * @param backend - Backend to execute (gemini, cursor-agent, droid)
   * @param prompt - Prompt to send to backend
   * @param config - Agent configuration
   * @returns Raw output from AI backend
   * @protected
   */
  protected async executeWithBackend(
    backend: string,
    prompt: string,
    config: AgentConfig
  ): Promise<string> {
    const { onProgress } = config;

    return executeAIClient({
      backend,
      prompt,
      onProgress: (msg) => onProgress?.(`[${backend}] ${msg}`)
    });
  }

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
  protected abstract parseOutput(
    rawOutput: string,
    input: TInput
  ): Promise<TOutput> | TOutput;

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
  protected buildMetadata(input: TInput, output: TOutput): Record<string, any> {
    return {};
  }

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
