/**
 * Workflow Cache System
 *
 * Provides caching for workflow results to avoid redundant AI calls.
 * Uses content-based hashing for cache keys and TTL-based expiration.
 */
import { createHash } from 'crypto';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
/**
 * Workflow cache implementation
 */
export class WorkflowCache {
    cache = new Map();
    stats = { hits: 0, misses: 0 };
    cacheDir;
    constructor(cacheDir = join(process.cwd(), '.cache', 'workflows')) {
        this.cacheDir = cacheDir;
        if (!existsSync(this.cacheDir)) {
            mkdirSync(this.cacheDir, { recursive: true });
        }
        this.loadFromDisk();
    }
    /**
     * Compute cache key from workflow name, params, and file contents
     */
    computeCacheKey(workflowName, params, fileContents) {
        // Create a deterministic representation
        const normalizedData = {
            workflow: workflowName,
            params: this.sortObject(params),
            contents: fileContents ? this.sortObject(fileContents) : undefined
        };
        const json = JSON.stringify(normalizedData);
        return createHash('sha256').update(json).digest('hex');
    }
    /**
     * Recursively sort object keys for deterministic serialization
     */
    sortObject(obj) {
        if (obj === null || obj === undefined)
            return obj;
        if (typeof obj !== 'object')
            return obj;
        if (Array.isArray(obj))
            return obj.map(item => this.sortObject(item));
        const sorted = {};
        Object.keys(obj).sort().forEach(key => {
            sorted[key] = this.sortObject(obj[key]);
        });
        return sorted;
    }
    /**
     * Get cached result if valid
     */
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            return null;
        }
        const age = Date.now() - entry.timestamp;
        if (age > entry.ttlSeconds * 1000) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }
        this.stats.hits++;
        return entry.result;
    }
    /**
     * Set cache entry
     */
    async set(key, result, workflowName, ttlSeconds, metadata) {
        const entry = {
            key,
            result,
            timestamp: Date.now(),
            ttlSeconds,
            workflowName,
            metadata
        };
        this.cache.set(key, entry);
        await this.saveToDisk();
    }
    /**
     * Clear expired entries
     */
    cleanup() {
        const now = Date.now();
        let removed = 0;
        for (const [key, entry] of this.cache.entries()) {
            const age = now - entry.timestamp;
            if (age > entry.ttlSeconds * 1000) {
                this.cache.delete(key);
                removed++;
            }
        }
        if (removed > 0) {
            this.saveToDisk();
        }
        return removed;
    }
    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0 };
        this.saveToDisk();
    }
    /**
     * Get cache statistics
     */
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            entries: this.cache.size,
            hitRate: total > 0 ? this.stats.hits / total : 0
        };
    }
    /**
     * Load cache from disk
     */
    loadFromDisk() {
        const cacheFile = join(this.cacheDir, 'cache.json');
        if (existsSync(cacheFile)) {
            try {
                const data = JSON.parse(readFileSync(cacheFile, 'utf-8'));
                if (data.entries) {
                    for (const entry of data.entries) {
                        this.cache.set(entry.key, entry);
                    }
                }
                if (data.stats) {
                    this.stats = data.stats;
                }
            }
            catch (error) {
                console.warn('Failed to load cache from disk:', error);
            }
        }
    }
    /**
     * Save cache to disk
     */
    saveToDisk() {
        const cacheFile = join(this.cacheDir, 'cache.json');
        try {
            const data = {
                entries: Array.from(this.cache.values()),
                stats: this.stats,
                savedAt: new Date().toISOString()
            };
            writeFileSync(cacheFile, JSON.stringify(data, null, 2), 'utf-8');
        }
        catch (error) {
            console.warn('Failed to save cache to disk:', error);
        }
    }
}
/**
 * Default TTL configurations for different workflows (in seconds)
 */
export const DEFAULT_TTL = {
    'parallel-review': 3600, // 1 hour
    'pre-commit-validate': 1800, // 30 minutes
    'validate-last-commit': 3600, // 1 hour
    'bug-hunt': 1800, // 30 minutes
    'feature-design': 7200, // 2 hours
    'init-session': 300 // 5 minutes
};
/**
 * Singleton cache instance
 */
export const workflowCache = new WorkflowCache();
/**
 * Cleanup expired cache entries periodically
 * Runs every hour
 */
setInterval(() => {
    const removed = workflowCache.cleanup();
    if (removed > 0) {
        console.log(`Cache cleanup: removed ${removed} expired entries`);
    }
}, 60 * 60 * 1000);
//# sourceMappingURL=cache.js.map