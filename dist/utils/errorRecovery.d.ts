/**
 * Error Recovery Framework
 *
 * Provides error classification, retry logic, circuit breakers, and recovery strategies
 * for resilient autonomous operations.
 */
/**
 * Error types for classification
 */
export declare enum ErrorType {
    TRANSIENT = "transient",// Retry possibile (network, timeout)
    PERMANENT = "permanent",// No retry (invalid syntax, missing file)
    QUOTA = "quota",// Fallback a modello alternativo
    PERMISSION = "permission"
}
/**
 * Recovery strategy configuration
 */
export interface RecoveryStrategy {
    maxRetries: number;
    backoffMs: number[];
    fallbackAction?: () => Promise<void>;
    escalateToUser: boolean;
}
/**
 * Default recovery strategies per error type
 */
export declare const RECOVERY_STRATEGIES: Record<ErrorType, RecoveryStrategy>;
/**
 * Error classifier function type
 */
export type ErrorClassifier = (error: Error) => ErrorType;
/**
 * Default error classifier based on error message patterns
 */
export declare function defaultErrorClassifier(error: Error): ErrorType;
/**
 * Execute operation with retry logic and recovery
 */
export declare function executeWithRecovery<T>(operation: () => Promise<T>, options?: {
    classifier?: ErrorClassifier;
    strategy?: Partial<RecoveryStrategy>;
    operationName?: string;
    onRetry?: (attempt: number, error: Error) => void;
}): Promise<T>;
/**
 * Circuit breaker states
 */
export declare enum CircuitState {
    CLOSED = "closed",// Normal operation
    OPEN = "open",// Circuit broken, fail fast
    HALF_OPEN = "half-open"
}
/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
    name: string;
}
/**
 * Circuit Breaker implementation
 */
export declare class CircuitBreaker {
    private state;
    private failureCount;
    private successCount;
    private lastFailureTime;
    private config;
    constructor(config: CircuitBreakerConfig);
    /**
     * Execute function with circuit breaker protection
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Handle successful execution
     */
    private onSuccess;
    /**
     * Handle failed execution
     */
    private onFailure;
    /**
     * Get current circuit state
     */
    getState(): CircuitState;
    /**
     * Reset circuit breaker
     */
    reset(): void;
    /**
     * Get circuit breaker stats
     */
    getStats(): {
        state: CircuitState;
        failureCount: number;
        successCount: number;
        lastFailureTime: number;
    };
}
/**
 * Circuit breaker registry for managing multiple breakers
 */
export declare class CircuitBreakerRegistry {
    private breakers;
    /**
     * Get or create circuit breaker
     */
    get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker;
    /**
     * Reset all circuit breakers
     */
    resetAll(): void;
    /**
     * Get all breaker stats
     */
    getAllStats(): Record<string, ReturnType<CircuitBreaker['getStats']>>;
}
/**
 * Global circuit breaker registry
 */
export declare const circuitBreakers: CircuitBreakerRegistry;
//# sourceMappingURL=errorRecovery.d.ts.map