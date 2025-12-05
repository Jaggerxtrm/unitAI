/**
 * Error Recovery Framework
 *
 * Provides error classification, retry logic, circuit breakers, and recovery strategies
 * for resilient autonomous operations.
 */
import { structuredLogger, LogCategory } from './structuredLogger.js';
/**
 * Error types for classification
 */
export var ErrorType;
(function (ErrorType) {
    ErrorType["TRANSIENT"] = "transient";
    ErrorType["PERMANENT"] = "permanent";
    ErrorType["QUOTA"] = "quota";
    ErrorType["PERMISSION"] = "permission"; // Escalation a utente
})(ErrorType || (ErrorType = {}));
/**
 * Default recovery strategies per error type
 */
export const RECOVERY_STRATEGIES = {
    [ErrorType.TRANSIENT]: {
        maxRetries: 3,
        backoffMs: [1000, 5000, 15000],
        escalateToUser: false
    },
    [ErrorType.QUOTA]: {
        maxRetries: 1,
        backoffMs: [0],
        escalateToUser: false
    },
    [ErrorType.PERMISSION]: {
        maxRetries: 0,
        backoffMs: [],
        escalateToUser: true
    },
    [ErrorType.PERMANENT]: {
        maxRetries: 0,
        backoffMs: [],
        escalateToUser: true
    }
};
/**
 * Default error classifier based on error message patterns
 */
export function defaultErrorClassifier(error) {
    const message = error.message.toLowerCase();
    // Permission errors
    if (message.includes('permission denied') ||
        message.includes('access denied') ||
        message.includes('unauthorized')) {
        return ErrorType.PERMISSION;
    }
    // Quota/rate limit errors
    if (message.includes('quota exceeded') ||
        message.includes('rate limit') ||
        message.includes('too many requests')) {
        return ErrorType.QUOTA;
    }
    // Transient errors
    if (message.includes('timeout') ||
        message.includes('connection') ||
        message.includes('network') ||
        message.includes('econnrefused') ||
        message.includes('enotfound')) {
        return ErrorType.TRANSIENT;
    }
    // Permanent errors
    if (message.includes('not found') ||
        message.includes('invalid') ||
        message.includes('syntax error') ||
        message.includes('does not exist')) {
        return ErrorType.PERMANENT;
    }
    // Default to transient for unknown errors
    return ErrorType.TRANSIENT;
}
/**
 * Execute operation with retry logic and recovery
 */
export async function executeWithRecovery(operation, options = {}) {
    const classifier = options.classifier || defaultErrorClassifier;
    const operationName = options.operationName || 'unknown-operation';
    let lastError = null;
    let attempt = 0;
    while (true) {
        try {
            attempt++;
            if (attempt > 1) {
                structuredLogger.info(LogCategory.SYSTEM, 'error-recovery', operationName, `Retry attempt ${attempt}`, { attempt });
            }
            return await operation();
        }
        catch (error) {
            lastError = error;
            const errorType = classifier(lastError);
            const strategy = {
                ...RECOVERY_STRATEGIES[errorType],
                ...options.strategy
            };
            structuredLogger.warn(LogCategory.SYSTEM, 'error-recovery', operationName, `Operation failed: ${lastError.message}`, {
                attempt,
                errorType,
                strategy: {
                    maxRetries: strategy.maxRetries,
                    willRetry: attempt <= strategy.maxRetries
                }
            });
            // Check if we should retry
            if (attempt > strategy.maxRetries) {
                structuredLogger.error(LogCategory.SYSTEM, 'error-recovery', operationName, `Max retries (${strategy.maxRetries}) exceeded`, lastError, { errorType, totalAttempts: attempt });
                throw lastError;
            }
            // Call retry callback
            if (options.onRetry) {
                options.onRetry(attempt, lastError);
            }
            // Wait before retry with exponential backoff
            const backoffIndex = Math.min(attempt - 1, strategy.backoffMs.length - 1);
            const backoffMs = strategy.backoffMs[backoffIndex];
            if (backoffMs > 0) {
                structuredLogger.debug(LogCategory.SYSTEM, 'error-recovery', operationName, `Waiting ${backoffMs}ms before retry`, { backoffMs, attempt });
                await sleep(backoffMs);
            }
            // Execute fallback action if defined
            if (strategy.fallbackAction) {
                try {
                    await strategy.fallbackAction();
                }
                catch (fallbackError) {
                    structuredLogger.error(LogCategory.SYSTEM, 'error-recovery', operationName, 'Fallback action failed', fallbackError);
                }
            }
        }
    }
}
/**
 * Circuit breaker states
 */
export var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "closed";
    CircuitState["OPEN"] = "open";
    CircuitState["HALF_OPEN"] = "half-open"; // Testing if service recovered
})(CircuitState || (CircuitState = {}));
/**
 * Circuit Breaker implementation
 */
export class CircuitBreaker {
    state = CircuitState.CLOSED;
    failureCount = 0;
    successCount = 0;
    lastFailureTime = 0;
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Execute function with circuit breaker protection
     */
    async execute(fn) {
        // Check if circuit is open
        if (this.state === CircuitState.OPEN) {
            // Check if timeout has passed to move to half-open
            if (Date.now() - this.lastFailureTime >= this.config.timeout) {
                structuredLogger.info(LogCategory.SYSTEM, 'circuit-breaker', this.config.name, 'Circuit moving to HALF_OPEN', { previousState: CircuitState.OPEN });
                this.state = CircuitState.HALF_OPEN;
                this.successCount = 0;
            }
            else {
                const error = new Error(`Circuit breaker is OPEN for ${this.config.name}`);
                structuredLogger.warn(LogCategory.SYSTEM, 'circuit-breaker', this.config.name, 'Request rejected: circuit is OPEN', {
                    state: this.state,
                    failureCount: this.failureCount,
                    timeUntilHalfOpen: this.config.timeout - (Date.now() - this.lastFailureTime)
                });
                throw error;
            }
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure(error);
            throw error;
        }
    }
    /**
     * Handle successful execution
     */
    onSuccess() {
        this.failureCount = 0;
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= this.config.successThreshold) {
                structuredLogger.info(LogCategory.SYSTEM, 'circuit-breaker', this.config.name, 'Circuit CLOSED: service recovered', {
                    successCount: this.successCount,
                    successThreshold: this.config.successThreshold
                });
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
            }
        }
    }
    /**
     * Handle failed execution
     */
    onFailure(error) {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.state === CircuitState.HALF_OPEN) {
            structuredLogger.warn(LogCategory.SYSTEM, 'circuit-breaker', this.config.name, 'Circuit OPEN: test failed during HALF_OPEN', { error: error.message });
            this.state = CircuitState.OPEN;
            this.successCount = 0;
        }
        else if (this.failureCount >= this.config.failureThreshold) {
            structuredLogger.error(LogCategory.SYSTEM, 'circuit-breaker', this.config.name, 'Circuit OPEN: failure threshold exceeded', error, {
                failureCount: this.failureCount,
                failureThreshold: this.config.failureThreshold
            });
            this.state = CircuitState.OPEN;
        }
    }
    /**
     * Get current circuit state
     */
    getState() {
        return this.state;
    }
    /**
     * Reset circuit breaker
     */
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = 0;
        structuredLogger.info(LogCategory.SYSTEM, 'circuit-breaker', this.config.name, 'Circuit breaker reset');
    }
    /**
     * Get circuit breaker stats
     */
    getStats() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime
        };
    }
}
/**
 * Circuit breaker registry for managing multiple breakers
 */
export class CircuitBreakerRegistry {
    breakers = new Map();
    /**
     * Get or create circuit breaker
     */
    get(name, config) {
        if (!this.breakers.has(name)) {
            const defaultConfig = {
                name,
                failureThreshold: 5,
                successThreshold: 2,
                timeout: 60000, // 1 minute
                ...config
            };
            this.breakers.set(name, new CircuitBreaker(defaultConfig));
        }
        return this.breakers.get(name);
    }
    /**
     * Reset all circuit breakers
     */
    resetAll() {
        for (const breaker of this.breakers.values()) {
            breaker.reset();
        }
    }
    /**
     * Get all breaker stats
     */
    getAllStats() {
        const stats = {};
        for (const [name, breaker] of this.breakers.entries()) {
            stats[name] = breaker.getStats();
        }
        return stats;
    }
}
/**
 * Global circuit breaker registry
 */
export const circuitBreakers = new CircuitBreakerRegistry();
/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=errorRecovery.js.map