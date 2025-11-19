/**
 * Agent Factory - Centralized agent creation and management
 *
 * Provides:
 * - Factory methods for creating specific agents
 * - Dynamic agent creation by type
 * - Agent registry and metadata
 * - Type-safe agent instantiation
 *
 * @module agents/index
 */

import { ArchitectAgent } from "./ArchitectAgent.js";
import { ImplementerAgent } from "./ImplementerAgent.js";
import { TesterAgent } from "./TesterAgent.js";
import type { IAgent } from "./types.js";

/**
 * Agent types supported by the factory
 */
export enum AgentType {
  ARCHITECT = "architect",
  IMPLEMENTER = "implementer",
  TESTER = "tester"
}

/**
 * Agent metadata for registry
 */
export interface AgentInfo {
  type: AgentType;
  name: string;
  description: string;
  preferredBackend: string;
  fallbackBackend?: string;
  specialization: string;
}

/**
 * AgentFactory - Factory pattern for creating agents
 *
 * Usage:
 * ```typescript
 * // Create specific agent
 * const architect = AgentFactory.createArchitect();
 * const implementer = AgentFactory.createImplementer();
 *
 * // Create agent by type
 * const agent = AgentFactory.createAgent(AgentType.ARCHITECT);
 *
 * // Get available agents
 * const agents = AgentFactory.getAvailableAgents();
 * ```
 */
export class AgentFactory {
  /**
   * Create an ArchitectAgent instance
   *
   * Specializes in:
   * - System design and architecture
   * - Security analysis
   * - Refactoring strategies
   * - Performance optimization
   *
   * Backend: Gemini (no fallback)
   *
   * @returns New ArchitectAgent instance
   */
  static createArchitect(): ArchitectAgent {
    return new ArchitectAgent();
  }

  /**
   * Create an ImplementerAgent instance
   *
   * Specializes in:
   * - Production-ready code generation
   * - Bug fixing
   * - Incremental implementation
   * - Code quality and best practices
   *
   * Backend: Droid (GLM-4.6)
   *
   * @returns New ImplementerAgent instance
   */
  static createImplementer(): ImplementerAgent {
    return new ImplementerAgent();
  }

  /**
   * Create a TesterAgent instance
   *
   * Specializes in:
   * - Unit test generation
   * - Integration test generation
   * - Test coverage analysis
   * - Fast iteration on test cases
   *
   * Backend: Cursor Agent (no fallback - optimized for speed)
   *
   * @returns New TesterAgent instance
   */
  static createTester(): TesterAgent {
    return new TesterAgent();
  }

  /**
   * Create an agent dynamically by type
   *
   * @param type - Agent type to create
   * @returns Agent instance
   * @throws Error if agent type is unknown
   */
  static createAgent(type: AgentType): IAgent {
    switch (type) {
      case AgentType.ARCHITECT:
        return this.createArchitect();
      case AgentType.IMPLEMENTER:
        return this.createImplementer();
      case AgentType.TESTER:
        return this.createTester();
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }

  /**
   * Get metadata for all available agents
   *
   * Useful for:
   * - UI selection menus
   * - Documentation generation
   * - Runtime discovery
   *
   * @returns Array of agent metadata
   */
  static getAvailableAgents(): AgentInfo[] {
    const architect = new ArchitectAgent();
    const implementer = new ImplementerAgent();
    const tester = new TesterAgent();

    return [
      {
        type: AgentType.ARCHITECT,
        name: architect.name,
        description: architect.description,
        preferredBackend: architect.preferredBackend,
        fallbackBackend: architect.fallbackBackend,
        specialization: "High-level system design, architecture analysis, and strategic planning"
      },
      {
        type: AgentType.IMPLEMENTER,
        name: implementer.name,
        description: implementer.description,
        preferredBackend: implementer.preferredBackend,
        fallbackBackend: implementer.fallbackBackend,
        specialization: "Precise code implementation with production-quality standards"
      },
      {
        type: AgentType.TESTER,
        name: tester.name,
        description: tester.description,
        preferredBackend: tester.preferredBackend,
        fallbackBackend: tester.fallbackBackend,
        specialization: "Fast test generation and validation"
      }
    ];
  }

  /**
   * Get agent by name (case-insensitive)
   *
   * @param name - Agent name to search for
   * @returns Agent instance or undefined if not found
   */
  static getAgentByName(name: string): IAgent | undefined {
    const normalizedName = name.toLowerCase();
    const agents = this.getAvailableAgents();

    const agentInfo = agents.find(
      a => a.name.toLowerCase() === normalizedName ||
        a.type.toLowerCase() === normalizedName
    );

    return agentInfo ? this.createAgent(agentInfo.type) : undefined;
  }
}

// Re-export types and classes for convenience
export { ArchitectAgent } from "./ArchitectAgent.js";
export { ImplementerAgent } from "./ImplementerAgent.js";
export { TesterAgent } from "./TesterAgent.js";
export { BaseAgent } from "./base/BaseAgent.js";
export * from "./types.js";
