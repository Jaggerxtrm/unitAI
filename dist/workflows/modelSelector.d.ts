/**
 * Smart Model Selection
 *
 * Rule-based system for selecting the optimal AI backend based on task characteristics.
 * Simpler and more pragmatic than meta-orchestration approaches.
 */
export interface TaskCharacteristics {
    complexity: 'low' | 'medium' | 'high';
    tokenBudget: number;
    requiresArchitecturalThinking: boolean;
    requiresCodeGeneration: boolean;
    requiresSpeed: boolean;
    requiresCreativity: boolean;
    domain?: 'security' | 'performance' | 'architecture' | 'debugging' | 'general';
}
export interface BackendMetrics {
    backend: string;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    avgResponseTime: number;
    lastUsed: Date;
}
/**
 * Select optimal backend based on task characteristics
 */
export declare function selectOptimalBackend(task: TaskCharacteristics, allowedBackends?: string[]): string;
/**
 * Select multiple backends for parallel analysis
 */
export declare function selectParallelBackends(task: TaskCharacteristics, count?: number): string[];
/**
 * Record backend usage for learning
 */
export declare function recordBackendUsage(backend: string, task: TaskCharacteristics, success: boolean, responseTimeMs: number): void;
/**
 * Get backend statistics
 */
export declare function getBackendStats(): BackendMetrics[];
/**
 * Select a fallback backend when the primary fails
 * Returns a different backend from the failed one, prioritizing by reliability
 */
export declare function selectFallbackBackend(failedBackend: string): string;
/**
 * Get recommendations for backend selection
 */
export declare function getBackendRecommendations(): string;
/**
 * Helper to create task characteristics from workflow context
 */
export declare function createTaskCharacteristics(workflowName: string, customOverrides?: Partial<TaskCharacteristics>): TaskCharacteristics;
//# sourceMappingURL=modelSelector.d.ts.map