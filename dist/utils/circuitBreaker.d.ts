/**
 * Circuit Breaker for AI Backends
 *
 * Implements a state machine to track backend health and prevent cascading failures.
 * States:
 * - CLOSED: Normal operation, requests allowed.
 * - OPEN: Backend failed too many times, requests blocked.
 * - HALF_OPEN: Testing backend recovery, limited requests allowed.
 */
export declare enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
export declare class CircuitBreaker {
    private static instance;
    private states;
    private config;
    private constructor();
    static getInstance(): CircuitBreaker;
    /**
     * Check if a backend is available
     */
    isAvailable(backend: string): boolean;
    /**
     * Record a successful execution
     */
    onSuccess(backend: string): void;
    /**
     * Record a failed execution
     */
    onFailure(backend: string): void;
    /**
     * Get current state for a backend
     */
    private getState;
    /**
     * Transition backend to a new state
     */
    private transitionTo;
    /**
     * Reset all states (for testing)
     */
    reset(): void;
}
export declare const circuitBreaker: CircuitBreaker;
//# sourceMappingURL=circuitBreaker.d.ts.map