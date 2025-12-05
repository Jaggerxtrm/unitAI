/**
 * Workflow Cache System
 *
 * Provides caching for workflow results to avoid redundant AI calls.
 * Uses content-based hashing for cache keys and TTL-based expiration.
 */
export interface CacheEntry {
    key: string;
    result: string;
    timestamp: number;
    ttlSeconds: number;
    workflowName: string;
    metadata?: Record<string, any>;
}
export interface CacheStats {
    hits: number;
    misses: number;
    entries: number;
    hitRate: number;
}
/**
 * Workflow cache implementation
 */
export declare class WorkflowCache {
    private cache;
    private stats;
    private cacheDir;
    constructor(cacheDir?: string);
    /**
     * Compute cache key from workflow name, params, and file contents
     */
    computeCacheKey(workflowName: string, params: Record<string, any>, fileContents?: Record<string, string>): string;
    /**
     * Recursively sort object keys for deterministic serialization
     */
    private sortObject;
    /**
     * Get cached result if valid
     */
    get(key: string): Promise<string | null>;
    /**
     * Set cache entry
     */
    set(key: string, result: string, workflowName: string, ttlSeconds: number, metadata?: Record<string, any>): Promise<void>;
    /**
     * Clear expired entries
     */
    cleanup(): number;
    /**
     * Clear all cache entries
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Load cache from disk
     */
    private loadFromDisk;
    /**
     * Save cache to disk
     */
    private saveToDisk;
}
/**
 * Default TTL configurations for different workflows (in seconds)
 */
export declare const DEFAULT_TTL: {
    readonly 'parallel-review': 3600;
    readonly 'pre-commit-validate': 1800;
    readonly 'validate-last-commit': 3600;
    readonly 'bug-hunt': 1800;
    readonly 'feature-design': 7200;
    readonly 'init-session': 300;
};
/**
 * Singleton cache instance
 */
export declare const workflowCache: WorkflowCache;
//# sourceMappingURL=cache.d.ts.map