/**
 * Workflow Context Memory
 * 
 * Provides temporary memory for workflow execution with support for:
 * - Incremental accumulation of data
 * - Checkpoint/rollback for error recovery
 * - Shared context between workflow steps
 * - Type-safe get/set operations
 */

export class WorkflowContext {
  private data: Map<string, any>;
  private arrays: Map<string, any[]>;
  private checkpoints: Map<string, { data: Map<string, any>, arrays: Map<string, any[]> }>;
  public readonly metadata: {
    workflowId: string;
    workflowName: string;
    startTime: Date;
  };

  constructor(workflowId: string, workflowName: string) {
    this.data = new Map();
    this.arrays = new Map();
    this.checkpoints = new Map();
    this.metadata = {
      workflowId,
      workflowName,
      startTime: new Date()
    };
  }

  /**
   * Sets a value in the context
   */
  set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  /**
   * Gets a value from the context
   */
  get<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  /**
   * Checks if a key exists in the context
   */
  has(key: string): boolean {
    return this.data.has(key) || this.arrays.has(key);
  }

  /**
   * Gets a value or returns default if not found
   */
  getOrDefault<T>(key: string, defaultValue: T): T {
    if (this.data.has(key)) {
      return this.data.get(key) as T;
    }
    return defaultValue;
  }

  /**
   * Appends a value to an array
   */
  append<T>(key: string, value: T): void {
    if (!this.arrays.has(key)) {
      this.arrays.set(key, []);
    }
    this.arrays.get(key)!.push(value);
  }

  /**
   * Gets all values from an array
   */
  getAll<T>(key: string): T[] {
    return (this.arrays.get(key) || []) as T[];
  }

  /**
   * Increments a counter
   */
  increment(key: string, amount: number = 1): number {
    const current = this.data.get(key) || 0;
    const newValue = current + amount;
    this.data.set(key, newValue);
    return newValue;
  }

  /**
   * Decrements a counter
   */
  decrement(key: string, amount: number = 1): number {
    return this.increment(key, -amount);
  }

  /**
   * Merges an object into existing data
   */
  merge(key: string, partial: Record<string, any>): void {
    const existing = this.data.get(key) || {};
    this.data.set(key, { ...existing, ...partial });
  }

  /**
   * Creates a checkpoint for rollback
   */
  checkpoint(name: string): void {
    this.checkpoints.set(name, {
      data: new Map(this.data),
      arrays: new Map(
        Array.from(this.arrays.entries()).map(([k, v]) => [k, [...v]])
      )
    });
  }

  /**
   * Rolls back to a checkpoint
   */
  rollback(name: string): boolean {
    const checkpoint = this.checkpoints.get(name);
    if (!checkpoint) {
      return false;
    }

    this.data = new Map(checkpoint.data);
    this.arrays = new Map(
      Array.from(checkpoint.arrays.entries()).map(([k, v]) => [k, [...v]])
    );

    return true;
  }

  /**
   * Lists all checkpoint names
   */
  listCheckpoints(): string[] {
    return Array.from(this.checkpoints.keys());
  }

  /**
   * Deletes a checkpoint
   */
  deleteCheckpoint(name: string): boolean {
    return this.checkpoints.delete(name);
  }

  /**
   * Exports context to JSON string
   */
  export(): string {
    return JSON.stringify({
      metadata: this.metadata,
      data: Array.from(this.data.entries()),
      arrays: Array.from(this.arrays.entries()),
      checkpoints: Array.from(this.checkpoints.keys())
    });
  }

  /**
   * Imports context from JSON string
   */
  static import(json: string): WorkflowContext {
    const parsed = JSON.parse(json);
    const ctx = new WorkflowContext(
      parsed.metadata.workflowId,
      parsed.metadata.workflowName
    );
    
    ctx.data = new Map(parsed.data);
    ctx.arrays = new Map(parsed.arrays);
    
    return ctx;
  }

  /**
   * Returns a summary of the context for logging
   */
  summary(): Record<string, any> {
    return {
      workflowId: this.metadata.workflowId,
      workflowName: this.metadata.workflowName,
      startTime: this.metadata.startTime,
      dataKeys: Array.from(this.data.keys()),
      arrayKeys: Array.from(this.arrays.keys()),
      arraySizes: Object.fromEntries(
        Array.from(this.arrays.entries()).map(([k, v]) => [k, v.length])
      ),
      checkpointCount: this.checkpoints.size,
      elapsedMs: Date.now() - this.metadata.startTime.getTime()
    };
  }

  /**
   * Clears all data (useful for testing)
   */
  clear(): void {
    this.data.clear();
    this.arrays.clear();
    this.checkpoints.clear();
  }

  /**
   * Returns all data keys
   */
  keys(): string[] {
    return Array.from(new Set([...this.data.keys(), ...this.arrays.keys()]));
  }

  /**
   * Returns size of context
   */
  size(): number {
    return this.data.size + this.arrays.size;
  }
}

/**
 * Context-aware workflow executor
 * Auto-injects context into workflow params
 */
export class ContextualWorkflowExecutor {
  async execute<TParams extends Record<string, any>, TResult>(
    workflowFn: (params: TParams & { __context: WorkflowContext }) => Promise<TResult>,
    params: TParams,
    workflowId: string,
    workflowName: string
  ): Promise<TResult> {
    const ctx = new WorkflowContext(workflowId, workflowName);
    
    const contextualParams = {
      ...params,
      __context: ctx
    } as TParams & { __context: WorkflowContext };
    
    try {
      const result = await workflowFn(contextualParams);
      
      console.log(`[Context Summary] ${workflowName}:`, ctx.summary());
      
      return result;
    } catch (error) {
      console.error(`[Context on Error] ${workflowName}:`, ctx.summary());
      throw error;
    }
  }
}

/**
 * Helper to create a workflow context
 */
export function createWorkflowContext(workflowId: string, workflowName: string): WorkflowContext {
  return new WorkflowContext(workflowId, workflowName);
}
