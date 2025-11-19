/**
 * Agent Types and Interfaces
 *
 * Defines the core interfaces and types for the specialized agent system.
 * Each agent encapsulates an AI backend and domain-specific strategies.
 *
 * @module agents/types
 */

import { AutonomyLevel } from "../utils/permissionManager.js";

/**
 * Configuration for agent execution
 */
export interface AgentConfig {
  /**
   * Autonomy level for operations (affects permissions)
   */
  autonomyLevel: AutonomyLevel;

  /**
   * Optional callback for progress updates
   */
  onProgress?: (message: string) => void;

  /**
   * Optional timeout in milliseconds
   */
  timeout?: number;
}

/**
 * Metadata about agent execution
 */
export interface AgentMetadata {
  /**
   * AI backend used for execution (e.g., "gemini", "cursor-agent", "droid")
   */
  backend: string;

  /**
   * Model used (if applicable)
   */
  model?: string;

  /**
   * Execution time in milliseconds
   */
  executionTime: number;

  /**
   * Tokens used (if available from backend)
   */
  tokensUsed?: number;

  /**
   * Autonomy level used during execution
   */
  autonomyLevel: AutonomyLevel;

  /**
   * Additional metadata specific to agent type
   */
  [key: string]: any;
}

/**
 * Result of agent execution
 *
 * @template TOutput - The output type specific to the agent
 */
export interface AgentResult<TOutput = any> {
  /**
   * Whether execution was successful
   */
  success: boolean;

  /**
   * Structured output from the agent
   */
  output: TOutput;

  /**
   * Execution metadata
   */
  metadata: AgentMetadata;

  /**
   * Error message (if execution failed)
   */
  error?: string;
}

/**
 * Base interface for all specialized agents
 *
 * Generic parameters:
 * - TInput: The input type for the agent
 * - TOutput: The output type for the agent
 */
export interface IAgent<TInput = any, TOutput = any> {
  /**
   * Unique name for the agent (e.g., "ArchitectAgent")
   */
  readonly name: string;

  /**
   * Human-readable description of agent capabilities
   */
  readonly description: string;

  /**
   * Preferred AI backend for this agent
   */
  readonly preferredBackend: string;

  /**
   * Optional fallback backend if preferred fails
   */
  readonly fallbackBackend?: string;

  /**
   * Execute the agent's task
   *
   * @param input - Task-specific input data
   * @param config - Agent configuration including autonomy level
   * @returns Result with success status, output, and metadata
   */
  execute(input: TInput, config: AgentConfig): Promise<AgentResult<TOutput>>;

  /**
   * Validate input before execution (optional)
   *
   * @param input - Input to validate
   * @returns True if valid, false otherwise
   */
  validateInput?(input: TInput): boolean | Promise<boolean>;
}

// =============================================================================
// ARCHITECT AGENT TYPES
// =============================================================================

/**
 * Focus areas for architectural analysis
 */
export type ArchitectFocus = "design" | "refactoring" | "optimization" | "security" | "scalability";

/**
 * Complexity estimate levels
 */
export type ComplexityLevel = "low" | "medium" | "high";

/**
 * Input for ArchitectAgent
 */
export interface ArchitectInput {
  /**
   * Description of the architectural task
   */
  task: string;

  /**
   * Additional context about the system
   */
  context?: string;

  /**
   * Files to consider in the analysis
   */
  files?: string[];

  /**
   * Focus area for the analysis
   * @default "design"
   */
  focus?: ArchitectFocus;
}

/**
 * Output from ArchitectAgent
 */
export interface ArchitectOutput {
  /**
   * Detailed architectural analysis
   */
  analysis: string;

  /**
   * List of specific, actionable recommendations
   */
  recommendations: string[];

  /**
   * Step-by-step implementation plan
   */
  implementationPlan?: string;

  /**
   * Identified risks and mitigation strategies
   */
  risks?: string[];

  /**
   * Estimated complexity level
   */
  estimatedComplexity?: ComplexityLevel;
}

// =============================================================================
// IMPLEMENTER AGENT TYPES
// =============================================================================

/**
 * Implementation approach strategies
 */
export type ImplementationApproach = "incremental" | "full-rewrite" | "minimal";

/**
 * Input for ImplementerAgent
 */
export interface ImplementerInput {
  /**
   * Description of what to implement
   */
  task: string;

  /**
   * Files that will be modified
   */
  targetFiles: string[];

  /**
   * Existing code context
   */
  codeContext?: string;

  /**
   * Implementation approach to use
   * @default "incremental"
   */
  approach?: ImplementationApproach;

  /**
   * Implementation constraints
   */
  constraints?: string[];
}

/**
 * Code snippet from ImplementerAgent
 */
export interface CodeSnippet {
  /**
   * File path
   */
  file: string;

  /**
   * Description of the change
   */
  description: string;

  /**
   * Code implementation
   */
  code: string;
}

/**
 * Output from ImplementerAgent
 */
export interface ImplementerOutput {
  /**
   * Brief summary of implementation
   */
  summary: string;

  /**
   * List of files that were changed
   */
  changedFiles: string[];

  /**
   * Code snippets with implementations
   */
  codeSnippets: CodeSnippet[];

  /**
   * Suggestions for testing
   */
  testSuggestions?: string[];

  /**
   * Next steps after implementation
   */
  nextSteps?: string[];
}

// =============================================================================
// TESTER AGENT TYPES
// =============================================================================

/**
 * Types of tests to generate
 */
export type TestType = "unit" | "integration" | "e2e";

/**
 * Input for TesterAgent
 */
export interface TesterInput {
  /**
   * Code to generate tests for
   */
  targetCode: string;

  /**
   * Type of tests to generate
   * @default "unit"
   */
  testType?: TestType;

  /**
   * Testing framework to use
   * @default "jest"
   */
  framework?: string;

  /**
   * Target coverage percentage
   * @default 80
   */
  coverageGoal?: number;

  /**
   * Existing tests (for reference)
   */
  existingTests?: string;
}

/**
 * Output from TesterAgent
 */
export interface TesterOutput {
  /**
   * Generated test code
   */
  testCode: string;

  /**
   * Number of test cases generated
   */
  testCount: number;

  /**
   * Estimated code coverage percentage
   */
  estimatedCoverage: number;

  /**
   * Testing framework used
   */
  framework: string;

  /**
   * Recommendations for additional tests
   */
  recommendations: string[];
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Custom error class for agent operations
 */
export class AgentError extends Error {
  constructor(
    message: string,
    public readonly agentName: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "AgentError";

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentError);
    }
  }
}
