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
 * Checkpoint snapshot for rollback
 */
interface Checkpoint {
  name: string;
  timestamp: Date;
  data: Map<string, any>;
  arrays: Map<string, any[]>;
}

/**
 * Workflow Context - temporary memory during workflow execution
 */
export class WorkflowContext {
  private data: Map<string, any>;
  private arrays: Map<string, any[]>;
  private counters: Map<string, number>;
  private checkpoints: Map<string, Checkpoint>;
  public readonly metadata: WorkflowMetadata;

  constructor(workflowId: string, workflowName: string) {
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
  set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  /**
   * Get a value from context
   */
  get<T>(key: string): T | undefined {
    return this.data.get(key);
  }

  /**
   * Check if key exists in context
   */
  has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Get value or default
   */
  getOrDefault<T>(key: string, defaultValue: T): T {
    return this.data.has(key) ? this.data.get(key) : defaultValue;
  }

  /**
   * Delete a key from context
   */
  delete(key: string): boolean {
    this.arrays.delete(key);
    this.counters.delete(key);
    return this.data.delete(key);
  }

  /**
   * Append value to an array
   */
  append<T>(key: string, value: T): void {
    if (!this.arrays.has(key)) {
      this.arrays.set(key, []);
    }
    this.arrays.get(key)!.push(value);
  }

  /**
   * Get all values from an array
   */
  getAll<T>(key: string): T[] {
    return this.arrays.get(key) || [];
  }

  /**
   * Check if array has values
   */
  hasArray(key: string): boolean {
    return this.arrays.has(key) && this.arrays.get(key)!.length > 0;
  }

  /**
   * Clear array
   */
  clearArray(key: string): void {
    this.arrays.delete(key);
  }

  /**
   * Increment counter
   */
  increment(key: string, amount: number = 1): number {
    const current = this.counters.get(key) || 0;
    const newValue = current + amount;
    this.counters.set(key, newValue);
    return newValue;
  }

  /**
   * Decrement counter
   */
  decrement(key: string, amount: number = 1): number {
    return this.increment(key, -amount);
  }

  /**
   * Get counter value
   */
  getCounter(key: string): number {
    return this.counters.get(key) || 0;
  }

  /**
   * Reset counter
   */
  resetCounter(key: string): void {
    this.counters.set(key, 0);
  }

  /**
   * Merge object into existing key
   */
  merge(key: string, partial: Record<string, any>): void {
    const existing = this.data.get(key) || {};
    if (typeof existing !== 'object' || Array.isArray(existing)) {
      throw new Error(`Cannot merge into non-object value at key: ${key}`);
    }
    this.data.set(key, { ...existing, ...partial });
  }

  /**
   * Create checkpoint for rollback
   */
  checkpoint(name: string): void {
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
  rollback(name: string): boolean {
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
  listCheckpoints(): string[] {
    return Array.from(this.checkpoints.keys());
  }

  /**
   * Delete checkpoint
   */
  deleteCheckpoint(name: string): boolean {
    return this.checkpoints.delete(name);
  }

  /**
   * Export context as JSON
   */
  export(): string {
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
  static import(json: string): WorkflowContext {
    const parsed = JSON.parse(json);
    const ctx = new WorkflowContext(
      parsed.metadata.workflowId,
      parsed.metadata.workflowName
    );

    // Restore data
    if (parsed.data) {
      for (const [key, value] of Object.entries(parsed.data)) {
        ctx.data.set(key, value);
      }
    }

    // Restore arrays
    if (parsed.arrays) {
      for (const [key, value] of Object.entries(parsed.arrays)) {
        ctx.arrays.set(key, value as any[]);
      }
    }

    // Restore counters
    if (parsed.counters) {
      for (const [key, value] of Object.entries(parsed.counters)) {
        ctx.counters.set(key, value as number);
      }
    }

    return ctx;
  }

  /**
   * Get summary of context for logging
   */
  summary(): Record<string, any> {
    return {
      workflowId: this.metadata.workflowId,
      workflowName: this.metadata.workflowName,
      startTime: this.metadata.startTime,
      duration: Date.now() - this.metadata.startTime.getTime(),
      dataKeys: Array.from(this.data.keys()),
      arrays: Object.fromEntries(
        Array.from(this.arrays.entries()).map(([key, arr]) => [key, arr.length])
      ),
      counters: Object.fromEntries(this.counters),
      checkpoints: this.listCheckpoints()
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.data.clear();
    this.arrays.clear();
    this.counters.clear();
    this.checkpoints.clear();
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.data.keys());
  }

  /**
   * Get context size (total number of values)
   */
  size(): number {
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
  async execute<TParams extends Record<string, any>, TResult>(
    workflowId: string,
    workflowName: string,
    workflowFn: (params: TParams & { __context: WorkflowContext }) => Promise<TResult>,
    params: TParams
  ): Promise<TResult> {
    const ctx = new WorkflowContext(workflowId, workflowName);

    // Inject context
    const contextualParams = {
      ...params,
      __context: ctx
    } as TParams & { __context: WorkflowContext };

    try {
      const result = await workflowFn(contextualParams);
      return result;
    } finally {
      // Context is automatically garbage collected after execution
      ctx.clear();
    }
  }
}

/**
 * Helper to extract context from workflow params
 */
export function getWorkflowContext(params: any): WorkflowContext | undefined {
  return params.__context;
}

/**
 * Helper to assert context exists
 */
export function assertWorkflowContext(params: any): WorkflowContext {
  const ctx = getWorkflowContext(params);
  if (!ctx) {
    throw new Error('Workflow context not found. Ensure workflow is executed with ContextualWorkflowExecutor.');
  }
  return ctx;
}

/**
 * Decorator to automatically use workflow context
 */
export function withContext<TParams extends { __context?: WorkflowContext }, TResult>(
  fn: (ctx: WorkflowContext, params: TParams) => Promise<TResult>
): (params: TParams) => Promise<TResult> {
  return async (params: TParams) => {
    const ctx = assertWorkflowContext(params);
    return await fn(ctx, params);
  };
}
