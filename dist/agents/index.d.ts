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
export declare enum AgentType {
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
export declare class AgentFactory {
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
    static createArchitect(): ArchitectAgent;
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
    static createImplementer(): ImplementerAgent;
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
    static createTester(): TesterAgent;
    /**
     * Create an agent dynamically by type
     *
     * @param type - Agent type to create
     * @returns Agent instance
     * @throws Error if agent type is unknown
     */
    static createAgent(type: AgentType): IAgent;
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
    static getAvailableAgents(): AgentInfo[];
    /**
     * Get agent by name (case-insensitive)
     *
     * @param name - Agent name to search for
     * @returns Agent instance or undefined if not found
     */
    static getAgentByName(name: string): IAgent | undefined;
}
export { ArchitectAgent } from "./ArchitectAgent.js";
export { ImplementerAgent } from "./ImplementerAgent.js";
export { TesterAgent } from "./TesterAgent.js";
export { BaseAgent } from "./base/BaseAgent.js";
export * from "./types.js";
//# sourceMappingURL=index.d.ts.map