/**
 * Workflow Context Memory System
 *
 * Provides temporary memory for workflow execution to avoid parameter drilling
 * and enable incremental accumulation, checkpoints, and shared context.
 */
/**
 * Workflow Context - temporary memory during workflow execution
 */
export class WorkflowContext {
    data;
    arrays;
    counters;
    checkpoints;
    metadata;
    constructor(workflowId, workflowName) {
        this.data = new Map();
        this.arrays = new Map();
        this.counters = new Map();
        this.checkpoints = new Map();
        this.metadata = {
            workflowId,
            workflowName,
            startTime: new Date()
        };
    }
    /**
     * Set a value in context
     */
    set(key, value) {
        this.data.set(key, value);
    }
    /**
     * Get a value from context
     */
    get(key) {
        return this.data.get(key);
    }
    /**
     * Check if key exists in context
     */
    has(key) {
        return this.data.has(key);
    }
    /**
     * Get value or default
     */
    getOrDefault(key, defaultValue) {
        return this.data.has(key) ? this.data.get(key) : defaultValue;
    }
    /**
     * Delete a key from context
     */
    delete(key) {
        this.arrays.delete(key);
        this.counters.delete(key);
        return this.data.delete(key);
    }
    /**
     * Append value to an array
     */
    append(key, value) {
        if (!this.arrays.has(key)) {
            this.arrays.set(key, []);
        }
        this.arrays.get(key).push(value);
    }
    /**
     * Get all values from an array
     */
    getAll(key) {
        return this.arrays.get(key) || [];
    }
    /**
     * Check if array has values
     */
    hasArray(key) {
        return this.arrays.has(key) && this.arrays.get(key).length > 0;
    }
    /**
     * Clear array
     */
    clearArray(key) {
        this.arrays.delete(key);
    }
    /**
     * Increment counter
     */
    increment(key, amount = 1) {
        const current = this.counters.get(key) || 0;
        const newValue = current + amount;
        this.counters.set(key, newValue);
        return newValue;
    }
    /**
     * Decrement counter
     */
    decrement(key, amount = 1) {
        return this.increment(key, -amount);
    }
    /**
     * Get counter value
     */
    getCounter(key) {
        return this.counters.get(key) || 0;
    }
    /**
     * Reset counter
     */
    resetCounter(key) {
        this.counters.set(key, 0);
    }
    /**
     * Merge object into existing key
     */
    merge(key, partial) {
        const existing = this.data.get(key) || {};
        if (typeof existing !== 'object' || Array.isArray(existing)) {
            throw new Error(`Cannot merge into non-object value at key: ${key}`);
        }
        this.data.set(key, { ...existing, ...partial });
    }
    /**
     * Create checkpoint for rollback
     */
    checkpoint(name) {
        // Deep clone maps
        const dataClone = new Map(this.data);
        const arraysClone = new Map();
        for (const [key, value] of this.arrays) {
            arraysClone.set(key, [...value]);
        }
        this.checkpoints.set(name, {
            name,
            timestamp: new Date(),
            data: dataClone,
            arrays: arraysClone
        });
    }
    /**
     * Rollback to checkpoint
     */
    rollback(name) {
        const checkpoint = this.checkpoints.get(name);
        if (!checkpoint) {
            return false;
        }
        // Restore from checkpoint
        this.data = new Map(checkpoint.data);
        this.arrays = new Map();
        for (const [key, value] of checkpoint.arrays) {
            this.arrays.set(key, [...value]);
        }
        return true;
    }
    /**
     * List available checkpoints
     */
    listCheckpoints() {
        return Array.from(this.checkpoints.keys());
    }
    /**
     * Delete checkpoint
     */
    deleteCheckpoint(name) {
        return this.checkpoints.delete(name);
    }
    /**
     * Export context as JSON
     */
    export() {
        const exportData = {
            metadata: this.metadata,
            data: Object.fromEntries(this.data),
            arrays: Object.fromEntries(this.arrays),
            counters: Object.fromEntries(this.counters),
            checkpoints: Array.from(this.checkpoints.keys())
        };
        return JSON.stringify(exportData, null, 2);
    }
    /**
     * Import context from JSON
     */
    static import(json) {
        const parsed = JSON.parse(json);
        const ctx = new WorkflowContext(parsed.metadata.workflowId, parsed.metadata.workflowName);
        // Restore data
        if (parsed.data) {
            for (const [key, value] of Object.entries(parsed.data)) {
                ctx.data.set(key, value);
            }
        }
        // Restore arrays
        if (parsed.arrays) {
            for (const [key, value] of Object.entries(parsed.arrays)) {
                ctx.arrays.set(key, value);
            }
        }
        // Restore counters
        if (parsed.counters) {
            for (const [key, value] of Object.entries(parsed.counters)) {
                ctx.counters.set(key, value);
            }
        }
        return ctx;
    }
    /**
     * Get summary of context for logging
     */
    summary() {
        return {
            workflowId: this.metadata.workflowId,
            workflowName: this.metadata.workflowName,
            startTime: this.metadata.startTime,
            duration: Date.now() - this.metadata.startTime.getTime(),
            dataKeys: Array.from(this.data.keys()),
            arrays: Object.fromEntries(Array.from(this.arrays.entries()).map(([key, arr]) => [key, arr.length])),
            counters: Object.fromEntries(this.counters),
            checkpoints: this.listCheckpoints()
        };
    }
    /**
     * Clear all data
     */
    clear() {
        this.data.clear();
        this.arrays.clear();
        this.counters.clear();
        this.checkpoints.clear();
    }
    /**
     * Get all keys
     */
    keys() {
        return Array.from(this.data.keys());
    }
    /**
     * Get context size (total number of values)
     */
    size() {
        let total = this.data.size;
        for (const arr of this.arrays.values()) {
            total += arr.length;
        }
        return total;
    }
}
/**
 * Context-aware workflow executor
 */
export class ContextualWorkflowExecutor {
    /**
     * Execute workflow with automatic context injection
     */
    async execute(workflowId, workflowName, workflowFn, params) {
        const ctx = new WorkflowContext(workflowId, workflowName);
        // Inject context
        const contextualParams = {
            ...params,
            __context: ctx
        };
        try {
            const result = await workflowFn(contextualParams);
            return result;
        }
        finally {
            // Context is automatically garbage collected after execution
            ctx.clear();
        }
    }
}
/**
 * Helper to extract context from workflow params
 */
export function getWorkflowContext(params) {
    return params.__context;
}
/**
 * Helper to assert context exists
 */
export function assertWorkflowContext(params) {
    const ctx = getWorkflowContext(params);
    if (!ctx) {
        throw new Error('Workflow context not found. Ensure workflow is executed with ContextualWorkflowExecutor.');
    }
    return ctx;
}
/**
 * Decorator to automatically use workflow context
 */
export function withContext(fn) {
    return async (params) => {
        const ctx = assertWorkflowContext(params);
        return await fn(ctx, params);
    };
}
//# sourceMappingURL=workflowContext.js.map