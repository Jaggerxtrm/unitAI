/**
 * Circuit Breaker for AI Backends
 *
 * Implements a state machine to track backend health and prevent cascading failures.
 * States:
 * - CLOSED: Normal operation, requests allowed.
 * - OPEN: Backend failed too many times, requests blocked.
 * - HALF_OPEN: Testing backend recovery, limited requests allowed.
 */
import { logger } from "./logger.js";
export var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (CircuitState = {}));
export class CircuitBreaker {
    static instance;
    states = new Map();
    config = {
        failureThreshold: 3,
        resetTimeoutMs: 5 * 60 * 1000 // 5 minutes
    };
    constructor() { }
    static getInstance() {
        if (!CircuitBreaker.instance) {
            CircuitBreaker.instance = new CircuitBreaker();
        }
        return CircuitBreaker.instance;
    }
    /**
     * Check if a backend is available
     */
    isAvailable(backend) {
        const state = this.getState(backend);
        if (state.state === CircuitState.OPEN) {
            const now = Date.now();
            if (now - state.lastFailureTime > this.config.resetTimeoutMs) {
                this.transitionTo(backend, CircuitState.HALF_OPEN);
                return true; // Allow one trial request
            }
            return false;
        }
        return true;
    }
    /**
     * Record a successful execution
     */
    onSuccess(backend) {
        const state = this.getState(backend);
        if (state.state === CircuitState.HALF_OPEN) {
            this.transitionTo(backend, CircuitState.CLOSED);
            logger.info(`[CircuitBreaker] Backend ${backend} recovered. Circuit CLOSED.`);
        }
        else if (state.failures > 0) {
            // Reset failures on success in CLOSED state
            state.failures = 0;
            this.states.set(backend, state);
        }
    }
    /**
     * Record a failed execution
     */
    onFailure(backend) {
        const state = this.getState(backend);
        state.failures++;
        state.lastFailureTime = Date.now();
        if (state.state === CircuitState.HALF_OPEN) {
            this.transitionTo(backend, CircuitState.OPEN);
            logger.warn(`[CircuitBreaker] Backend ${backend} failed recovery check. Circuit OPEN.`);
        }
        else if (state.state === CircuitState.CLOSED && state.failures >= this.config.failureThreshold) {
            this.transitionTo(backend, CircuitState.OPEN);
            logger.error(`[CircuitBreaker] Backend ${backend} reached failure threshold. Circuit OPEN.`);
        }
        else {
            this.states.set(backend, state);
        }
    }
    /**
     * Get current state for a backend
     */
    getState(backend) {
        if (!this.states.has(backend)) {
            this.states.set(backend, {
                state: CircuitState.CLOSED,
                failures: 0,
                lastFailureTime: 0
            });
        }
        return this.states.get(backend);
    }
    /**
     * Transition backend to a new state
     */
    transitionTo(backend, newState) {
        const state = this.getState(backend);
        state.state = newState;
        if (newState === CircuitState.CLOSED) {
            state.failures = 0;
        }
        this.states.set(backend, state);
    }
    /**
     * Reset all states (for testing)
     */
    reset() {
        this.states.clear();
    }
}
export const circuitBreaker = CircuitBreaker.getInstance();
//# sourceMappingURL=circuitBreaker.js.map