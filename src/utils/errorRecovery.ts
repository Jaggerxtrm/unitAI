/**
 * Error Recovery Framework
 * 
 * Provides error classification, retry logic, circuit breakers, and recovery strategies
 * for resilient autonomous operations.
 */

import { structuredLogger, LogCategory, LogLevel } from './structuredLogger.js';

/**
 * Error types for classification
 */
export enum ErrorType {
  TRANSIENT = 'transient',      // Retry possibile (network, timeout)
  PERMANENT = 'permanent',       // No retry (invalid syntax, missing file)
  QUOTA = 'quota',              // Fallback a modello alternativo
  PERMISSION = 'permission'      // Escalation a utente
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
export const RECOVERY_STRATEGIES: Record<ErrorType, RecoveryStrategy> = {
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
 * Error classifier function type
 */
export type ErrorClassifier = (error: Error) => ErrorType;

/**
 * Default error classifier based on error message patterns
 */
export function defaultErrorClassifier(error: Error): ErrorType {
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
export async function executeWithRecovery<T>(
  operation: () => Promise<T>,
  options: {
    classifier?: ErrorClassifier;
    strategy?: Partial<RecoveryStrategy>;
    operationName?: string;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const classifier = options.classifier || defaultErrorClassifier;
  const operationName = options.operationName || 'unknown-operation';

  let lastError: Error | null = null;
  let attempt = 0;

  while (true) {
    try {
      attempt++;
      
      if (attempt > 1) {
        structuredLogger.info(
          LogCategory.SYSTEM,
          'error-recovery',
          operationName,
          `Retry attempt ${attempt}`,
          { attempt }
        );
      }

      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      const errorType = classifier(lastError);
      const strategy = {
        ...RECOVERY_STRATEGIES[errorType],
        ...options.strategy
      };

      structuredLogger.warn(
        LogCategory.SYSTEM,
        'error-recovery',
        operationName,
        `Operation failed: ${lastError.message}`,
        {
          attempt,
          errorType,
          strategy: {
            maxRetries: strategy.maxRetries,
            willRetry: attempt <= strategy.maxRetries
          }
        }
      );

      // Check if we should retry
      if (attempt > strategy.maxRetries) {
        structuredLogger.error(
          LogCategory.SYSTEM,
          'error-recovery',
          operationName,
          `Max retries (${strategy.maxRetries}) exceeded`,
          lastError,
          { errorType, totalAttempts: attempt }
        );
        
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
        structuredLogger.debug(
          LogCategory.SYSTEM,
          'error-recovery',
          operationName,
          `Waiting ${backoffMs}ms before retry`,
          { backoffMs, attempt }
        );
        
        await sleep(backoffMs);
      }

      // Execute fallback action if defined
      if (strategy.fallbackAction) {
        try {
          await strategy.fallbackAction();
        } catch (fallbackError) {
          structuredLogger.error(
            LogCategory.SYSTEM,
            'error-recovery',
            operationName,
            'Fallback action failed',
            fallbackError as Error
          );
        }
      }
    }
  }
}

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'closed',     // Normal operation
  OPEN = 'open',         // Circuit broken, fail fast
  HALF_OPEN = 'half-open' // Testing if service recovered
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;     // Number of failures before opening
  successThreshold: number;     // Number of successes to close from half-open
  timeout: number;              // Time to wait before half-open (ms)
  name: string;
}

/**
 * Circuit Breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      // Check if timeout has passed to move to half-open
      if (Date.now() - this.lastFailureTime >= this.config.timeout) {
        structuredLogger.info(
          LogCategory.SYSTEM,
          'circuit-breaker',
          this.config.name,
          'Circuit moving to HALF_OPEN',
          { previousState: CircuitState.OPEN }
        );
        
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        const error = new Error(`Circuit breaker is OPEN for ${this.config.name}`);
        
        structuredLogger.warn(
          LogCategory.SYSTEM,
          'circuit-breaker',
          this.config.name,
          'Request rejected: circuit is OPEN',
          {
            state: this.state,
            failureCount: this.failureCount,
            timeUntilHalfOpen: this.config.timeout - (Date.now() - this.lastFailureTime)
          }
        );
        
        throw error;
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        structuredLogger.info(
          LogCategory.SYSTEM,
          'circuit-breaker',
          this.config.name,
          'Circuit CLOSED: service recovered',
          {
            successCount: this.successCount,
            successThreshold: this.config.successThreshold
          }
        );
        
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(error: Error): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      structuredLogger.warn(
        LogCategory.SYSTEM,
        'circuit-breaker',
        this.config.name,
        'Circuit OPEN: test failed during HALF_OPEN',
        { error: error.message }
      );
      
      this.state = CircuitState.OPEN;
      this.successCount = 0;
    } else if (this.failureCount >= this.config.failureThreshold) {
      structuredLogger.error(
        LogCategory.SYSTEM,
        'circuit-breaker',
        this.config.name,
        'Circuit OPEN: failure threshold exceeded',
        error,
        {
          failureCount: this.failureCount,
          failureThreshold: this.config.failureThreshold
        }
      );
      
      this.state = CircuitState.OPEN;
    }
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;

    structuredLogger.info(
      LogCategory.SYSTEM,
      'circuit-breaker',
      this.config.name,
      'Circuit breaker reset'
    );
  }

  /**
   * Get circuit breaker stats
   */
  getStats(): {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
  } {
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
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create circuit breaker
   */
  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const defaultConfig: CircuitBreakerConfig = {
        name,
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000, // 1 minute
        ...config
      };

      this.breakers.set(name, new CircuitBreaker(defaultConfig));
    }

    return this.breakers.get(name)!;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Get all breaker stats
   */
  getAllStats(): Record<string, ReturnType<CircuitBreaker['getStats']>> {
    const stats: Record<string, ReturnType<CircuitBreaker['getStats']>> = {};

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
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
