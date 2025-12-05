/**
 * Workflow Context Memory System
 *
 * Provides temporary memory for workflow execution to avoid parameter drilling
 * and enable incremental accumulation, checkpoints, and shared context.
 */
/**
 * Workflow context metadata
 */
export interface WorkflowMetadata {
    workflowId: string;
    workflowName: string;
    startTime: Date;
}
/**
 * Workflow Context - temporary memory during workflow execution
 */
export declare class WorkflowContext {
    private data;
    private arrays;
    private counters;
    private checkpoints;
    readonly metadata: WorkflowMetadata;
    constructor(workflowId: string, workflowName: string);
    /**
     * Set a value in context
     */
    set<T>(key: string, value: T): void;
    /**
     * Get a value from context
     */
    get<T>(key: string): T | undefined;
    /**
     * Check if key exists in context
     */
    has(key: string): boolean;
    /**
     * Get value or default
     */
    getOrDefault<T>(key: string, defaultValue: T): T;
    /**
     * Delete a key from context
     */
    delete(key: string): boolean;
    /**
     * Append value to an array
     */
    append<T>(key: string, value: T): void;
    /**
     * Get all values from an array
     */
    getAll<T>(key: string): T[];
    /**
     * Check if array has values
     */
    hasArray(key: string): boolean;
    /**
     * Clear array
     */
    clearArray(key: string): void;
    /**
     * Increment counter
     */
    increment(key: string, amount?: number): number;
    /**
     * Decrement counter
     */
    decrement(key: string, amount?: number): number;
    /**
     * Get counter value
     */
    getCounter(key: string): number;
    /**
     * Reset counter
     */
    resetCounter(key: string): void;
    /**
     * Merge object into existing key
     */
    merge(key: string, partial: Record<string, any>): void;
    /**
     * Create checkpoint for rollback
     */
    checkpoint(name: string): void;
    /**
     * Rollback to checkpoint
     */
    rollback(name: string): boolean;
    /**
     * List available checkpoints
     */
    listCheckpoints(): string[];
    /**
     * Delete checkpoint
     */
    deleteCheckpoint(name: string): boolean;
    /**
     * Export context as JSON
     */
    export(): string;
    /**
     * Import context from JSON
     */
    static import(json: string): WorkflowContext;
    /**
     * Get summary of context for logging
     */
    summary(): Record<string, any>;
    /**
     * Clear all data
     */
    clear(): void;
    /**
     * Get all keys
     */
    keys(): string[];
    /**
     * Get context size (total number of values)
     */
    size(): number;
}
/**
 * Context-aware workflow executor
 */
export declare class ContextualWorkflowExecutor {
    /**
     * Execute workflow with automatic context injection
     */
    execute<TParams extends Record<string, any>, TResult>(workflowId: string, workflowName: string, workflowFn: (params: TParams & {
        __context: WorkflowContext;
    }) => Promise<TResult>, params: TParams): Promise<TResult>;
}
/**
 * Helper to extract context from workflow params
 */
export declare function getWorkflowContext(params: any): WorkflowContext | undefined;
/**
 * Helper to assert context exists
 */
export declare function assertWorkflowContext(params: any): WorkflowContext;
/**
 * Decorator to automatically use workflow context
 */
export declare function withContext<TParams extends {
    __context?: WorkflowContext;
}, TResult>(fn: (ctx: WorkflowContext, params: TParams) => Promise<TResult>): (params: TParams) => Promise<TResult>;
//# sourceMappingURL=workflowContext.d.ts.map