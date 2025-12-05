/**
 * Agent Types and Interfaces
 *
 * Defines the core interfaces and types for the specialized agent system.
 * Each agent encapsulates an AI backend and domain-specific strategies.
 *
 * @module agents/types
 */
// =============================================================================
// ERROR TYPES
// =============================================================================
/**
 * Custom error class for agent operations
 */
export class AgentError extends Error {
    agentName;
    cause;
    constructor(message, agentName, cause) {
        super(message);
        this.agentName = agentName;
        this.cause = cause;
        this.name = "AgentError";
        // Maintains proper stack trace for where error was thrown (V8 only)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AgentError);
        }
    }
}
//# sourceMappingURL=types.js.map