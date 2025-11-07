/**
 * Unit tests for Workflow Context
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  WorkflowContext,
  ContextualWorkflowExecutor,
  getWorkflowContext,
  assertWorkflowContext,
  withContext
} from '../../src/workflows/workflowContext.js';

describe('WorkflowContext', () => {
  let ctx: WorkflowContext;

  beforeEach(() => {
    ctx = new WorkflowContext('test-wf-123', 'test-workflow');
  });

  describe('Basic operations', () => {
    it('should set and get values', () => {
      ctx.set('key1', 'value1');
      expect(ctx.get('key1')).toBe('value1');
    });

    it('should return undefined for non-existent keys', () => {
      expect(ctx.get('nonexistent')).toBeUndefined();
    });

    it('should check if key exists', () => {
      ctx.set('key1', 'value1');
      expect(ctx.has('key1')).toBe(true);
      expect(ctx.has('key2')).toBe(false);
    });

    it('should get value or default', () => {
      ctx.set('key1', 'value1');
      expect(ctx.getOrDefault('key1', 'default')).toBe('value1');
      expect(ctx.getOrDefault('key2', 'default')).toBe('default');
    });

    it('should delete keys', () => {
      ctx.set('key1', 'value1');
      expect(ctx.delete('key1')).toBe(true);
      expect(ctx.has('key1')).toBe(false);
      expect(ctx.delete('key1')).toBe(false);
    });

    it('should list all keys', () => {
      ctx.set('key1', 'value1');
      ctx.set('key2', 'value2');
      const keys = ctx.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });
  });

  describe('Array operations', () => {
    it('should append values to arrays', () => {
      ctx.append('items', 'item1');
      ctx.append('items', 'item2');
      expect(ctx.getAll('items')).toEqual(['item1', 'item2']);
    });

    it('should return empty array for non-existent arrays', () => {
      expect(ctx.getAll('nonexistent')).toEqual([]);
    });

    it('should check if array has values', () => {
      ctx.append('items', 'item1');
      expect(ctx.hasArray('items')).toBe(true);
      expect(ctx.hasArray('empty')).toBe(false);
    });

    it('should clear arrays', () => {
      ctx.append('items', 'item1');
      ctx.append('items', 'item2');
      ctx.clearArray('items');
      expect(ctx.getAll('items')).toEqual([]);
    });

    it('should handle different types in arrays', () => {
      ctx.append('mixed', 'string');
      ctx.append('mixed', 42);
      ctx.append('mixed', { obj: true });
      expect(ctx.getAll('mixed')).toEqual(['string', 42, { obj: true }]);
    });
  });

  describe('Counter operations', () => {
    it('should increment counters', () => {
      expect(ctx.increment('count')).toBe(1);
      expect(ctx.increment('count')).toBe(2);
      expect(ctx.increment('count', 5)).toBe(7);
    });

    it('should decrement counters', () => {
      ctx.increment('count', 10);
      expect(ctx.decrement('count')).toBe(9);
      expect(ctx.decrement('count', 3)).toBe(6);
    });

    it('should get counter value', () => {
      ctx.increment('count', 5);
      expect(ctx.getCounter('count')).toBe(5);
      expect(ctx.getCounter('nonexistent')).toBe(0);
    });

    it('should reset counters', () => {
      ctx.increment('count', 10);
      ctx.resetCounter('count');
      expect(ctx.getCounter('count')).toBe(0);
    });
  });

  describe('Merge operations', () => {
    it('should merge objects', () => {
      ctx.set('config', { a: 1, b: 2 });
      ctx.merge('config', { b: 3, c: 4 });
      expect(ctx.get('config')).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should throw error when merging into non-object', () => {
      ctx.set('value', 'string');
      expect(() => ctx.merge('value', { a: 1 })).toThrow();
    });

    it('should create object if key does not exist', () => {
      ctx.merge('newConfig', { a: 1 });
      expect(ctx.get('newConfig')).toEqual({ a: 1 });
    });
  });

  describe('Checkpoint and rollback', () => {
    it('should create checkpoints', () => {
      ctx.set('key1', 'value1');
      ctx.checkpoint('cp1');
      expect(ctx.listCheckpoints()).toContain('cp1');
    });

    it('should rollback to checkpoint', () => {
      ctx.set('key1', 'value1');
      ctx.checkpoint('cp1');
      
      ctx.set('key1', 'value2');
      ctx.set('key2', 'value2');
      
      expect(ctx.rollback('cp1')).toBe(true);
      expect(ctx.get('key1')).toBe('value1');
      expect(ctx.has('key2')).toBe(false);
    });

    it('should rollback arrays', () => {
      ctx.append('items', 'item1');
      ctx.checkpoint('cp1');
      
      ctx.append('items', 'item2');
      ctx.append('items', 'item3');
      
      ctx.rollback('cp1');
      expect(ctx.getAll('items')).toEqual(['item1']);
    });

    it('should return false for non-existent checkpoint', () => {
      expect(ctx.rollback('nonexistent')).toBe(false);
    });

    it('should delete checkpoints', () => {
      ctx.checkpoint('cp1');
      expect(ctx.deleteCheckpoint('cp1')).toBe(true);
      expect(ctx.listCheckpoints()).not.toContain('cp1');
    });

    it('should handle multiple checkpoints', () => {
      ctx.set('key', 'v1');
      ctx.checkpoint('cp1');
      
      ctx.set('key', 'v2');
      ctx.checkpoint('cp2');
      
      ctx.set('key', 'v3');
      
      ctx.rollback('cp2');
      expect(ctx.get('key')).toBe('v2');
      
      ctx.rollback('cp1');
      expect(ctx.get('key')).toBe('v1');
    });
  });

  describe('Export and import', () => {
    it('should export context as JSON', () => {
      ctx.set('key1', 'value1');
      ctx.append('items', 'item1');
      ctx.increment('count', 5);
      
      const json = ctx.export();
      const parsed = JSON.parse(json);
      
      expect(parsed.metadata.workflowId).toBe('test-wf-123');
      expect(parsed.data.key1).toBe('value1');
      expect(parsed.arrays.items).toEqual(['item1']);
      expect(parsed.counters.count).toBe(5);
    });

    it('should import context from JSON', () => {
      ctx.set('key1', 'value1');
      ctx.append('items', 'item1');
      const json = ctx.export();
      
      const imported = WorkflowContext.import(json);
      expect(imported.get('key1')).toBe('value1');
      expect(imported.getAll('items')).toEqual(['item1']);
    });

    it('should preserve types on import', () => {
      ctx.set('string', 'text');
      ctx.set('number', 42);
      ctx.set('boolean', true);
      ctx.set('object', { nested: 'value' });
      
      const json = ctx.export();
      const imported = WorkflowContext.import(json);
      
      expect(imported.get('string')).toBe('text');
      expect(imported.get('number')).toBe(42);
      expect(imported.get('boolean')).toBe(true);
      expect(imported.get('object')).toEqual({ nested: 'value' });
    });
  });

  describe('Summary and metadata', () => {
    it('should provide context summary', () => {
      ctx.set('key1', 'value1');
      ctx.append('items', 'item1');
      ctx.append('items', 'item2');
      ctx.increment('count', 5);
      ctx.checkpoint('cp1');
      
      const summary = ctx.summary();
      
      expect(summary.workflowId).toBe('test-wf-123');
      expect(summary.workflowName).toBe('test-workflow');
      expect(summary.dataKeys).toContain('key1');
      expect(summary.arrays.items).toBe(2);
      expect(summary.counters.count).toBe(5);
      expect(summary.checkpoints).toContain('cp1');
      expect(summary.duration).toBeGreaterThanOrEqual(0);
    });

    it('should track metadata', () => {
      expect(ctx.metadata.workflowId).toBe('test-wf-123');
      expect(ctx.metadata.workflowName).toBe('test-workflow');
      expect(ctx.metadata.startTime).toBeInstanceOf(Date);
    });
  });

  describe('Clear and size', () => {
    it('should clear all data', () => {
      ctx.set('key1', 'value1');
      ctx.append('items', 'item1');
      ctx.increment('count');
      ctx.checkpoint('cp1');
      
      ctx.clear();
      
      expect(ctx.keys()).toHaveLength(0);
      expect(ctx.getAll('items')).toHaveLength(0);
      expect(ctx.getCounter('count')).toBe(0);
      expect(ctx.listCheckpoints()).toHaveLength(0);
    });

    it('should calculate context size', () => {
      ctx.set('key1', 'value1');
      ctx.set('key2', 'value2');
      ctx.append('items', 'item1');
      ctx.append('items', 'item2');
      
      expect(ctx.size()).toBe(4); // 2 keys + 2 array items
    });
  });
});

describe('ContextualWorkflowExecutor', () => {
  it('should inject context into workflow', async () => {
    const executor = new ContextualWorkflowExecutor();
    
    const workflow = async (params: { value: string; __context: WorkflowContext }) => {
      params.__context.set('result', params.value.toUpperCase());
      return params.__context.get('result');
    };
    
    const result = await executor.execute(
      'wf-123',
      'test-workflow',
      workflow,
      { value: 'hello' }
    );
    
    expect(result).toBe('HELLO');
  });

  it('should clear context after execution', async () => {
    const executor = new ContextualWorkflowExecutor();
    let capturedContext: WorkflowContext | null = null;
    
    const workflow = async (params: { __context: WorkflowContext }) => {
      capturedContext = params.__context;
      params.__context.set('key', 'value');
      return 'done';
    };
    
    await executor.execute('wf-123', 'test', workflow, {});
    
    // Context should be cleared
    expect(capturedContext!.size()).toBe(0);
  });

  it('should handle workflow errors gracefully', async () => {
    const executor = new ContextualWorkflowExecutor();
    
    const workflow = async (params: { __context: WorkflowContext }) => {
      params.__context.set('key', 'value');
      throw new Error('Workflow failed');
    };
    
    await expect(
      executor.execute('wf-123', 'test', workflow, {})
    ).rejects.toThrow('Workflow failed');
  });
});

describe('Context helpers', () => {
  it('should get workflow context from params', () => {
    const ctx = new WorkflowContext('wf-123', 'test');
    const params = { value: 'test', __context: ctx };
    
    expect(getWorkflowContext(params)).toBe(ctx);
  });

  it('should return undefined for missing context', () => {
    const params = { value: 'test' };
    expect(getWorkflowContext(params)).toBeUndefined();
  });

  it('should assert context exists', () => {
    const ctx = new WorkflowContext('wf-123', 'test');
    const params = { value: 'test', __context: ctx };
    
    expect(() => assertWorkflowContext(params)).not.toThrow();
    expect(assertWorkflowContext(params)).toBe(ctx);
  });

  it('should throw when asserting missing context', () => {
    const params = { value: 'test' };
    expect(() => assertWorkflowContext(params)).toThrow(/context not found/);
  });

  it('should use withContext decorator', async () => {
    const fn = withContext(async (ctx: WorkflowContext, params: any) => {
      ctx.set('processed', params.value.toUpperCase());
      return ctx.get('processed');
    });
    
    const ctx = new WorkflowContext('wf-123', 'test');
    const result = await fn({ value: 'hello', __context: ctx });
    
    expect(result).toBe('HELLO');
  });
});

describe('Real-world usage patterns', () => {
  it('should accumulate analysis results', async () => {
    const ctx = new WorkflowContext('wf-123', 'code-analysis');
    
    // Simulate file analysis
    const files = ['file1.ts', 'file2.ts', 'file3.ts'];
    
    for (const file of files) {
      const analysis = `Analysis of ${file}`;
      ctx.append('analyses', { file, analysis });
      
      if (analysis.includes('issue')) {
        ctx.increment('issuesFound');
      }
    }
    
    expect(ctx.getAll('analyses')).toHaveLength(3);
    expect(ctx.getCounter('issuesFound')).toBe(0);
  });

  it('should handle conditional workflow steps', async () => {
    const ctx = new WorkflowContext('wf-123', 'smart-workflow');
    
    // Step 1: Check for tests
    const hasTests = false;
    ctx.set('hasTests', hasTests);
    
    // Step 2: Conditional test generation
    if (!ctx.get('hasTests')) {
      ctx.set('testsGenerated', true);
      ctx.append('generatedFiles', 'test.spec.ts');
    }
    
    // Step 3: Report
    const report = ctx.get('testsGenerated') 
      ? 'Tests generated' 
      : 'Tests already exist';
    
    expect(report).toBe('Tests generated');
    expect(ctx.hasArray('generatedFiles')).toBe(true);
  });

  it('should handle error recovery with checkpoints', async () => {
    const ctx = new WorkflowContext('wf-123', 'refactoring');
    
    const steps = ['rename', 'extract', 'optimize'];
    
    for (const step of steps) {
      ctx.checkpoint(`before-${step}`);
      
      try {
        // Simulate step execution
        if (step === 'extract') {
          throw new Error('Extract failed');
        }
        
        ctx.append('completedSteps', step);
      } catch (error) {
        ctx.rollback(`before-${step}`);
        ctx.append('failedSteps', step);
      }
    }
    
    expect(ctx.getAll('completedSteps')).toEqual(['rename', 'optimize']);
    expect(ctx.getAll('failedSteps')).toEqual(['extract']);
  });
});
