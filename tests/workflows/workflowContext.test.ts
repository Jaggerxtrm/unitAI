import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowContext, ContextualWorkflowExecutor, createWorkflowContext } from '../../src/workflows/workflowContext.js';

describe('WorkflowContext', () => {
  let ctx: WorkflowContext;

  beforeEach(() => {
    ctx = new WorkflowContext('test-id', 'test-workflow');
  });

  describe('Basic Operations', () => {
    it('dovrebbe impostare e recuperare valori', () => {
      ctx.set('key1', 'value1');
      expect(ctx.get('key1')).toBe('value1');
    });

    it('dovrebbe restituire undefined per chiave inesistente', () => {
      expect(ctx.get('nonexistent')).toBeUndefined();
    });

    it('dovrebbe verificare esistenza chiave', () => {
      ctx.set('key1', 'value1');
      expect(ctx.has('key1')).toBe(true);
      expect(ctx.has('key2')).toBe(false);
    });

    it('dovrebbe restituire valore default se chiave non esiste', () => {
      expect(ctx.getOrDefault('missing', 'default')).toBe('default');
      ctx.set('existing', 'value');
      expect(ctx.getOrDefault('existing', 'default')).toBe('value');
    });

    it('dovrebbe supportare tipi diversi', () => {
      ctx.set('string', 'text');
      ctx.set('number', 42);
      ctx.set('boolean', true);
      ctx.set('object', { nested: 'value' });
      ctx.set('array', [1, 2, 3]);

      expect(ctx.get<string>('string')).toBe('text');
      expect(ctx.get<number>('number')).toBe(42);
      expect(ctx.get<boolean>('boolean')).toBe(true);
      expect(ctx.get<any>('object')).toEqual({ nested: 'value' });
      expect(ctx.get<number[]>('array')).toEqual([1, 2, 3]);
    });
  });

  describe('Array Operations', () => {
    it('dovrebbe appendere valori a un array', () => {
      ctx.append('items', 'item1');
      ctx.append('items', 'item2');
      ctx.append('items', 'item3');

      expect(ctx.getAll('items')).toEqual(['item1', 'item2', 'item3']);
    });

    it('dovrebbe restituire array vuoto per chiave inesistente', () => {
      expect(ctx.getAll('nonexistent')).toEqual([]);
    });

    it('dovrebbe supportare array di tipi diversi', () => {
      ctx.append('strings', 'a');
      ctx.append('strings', 'b');
      ctx.append<number>('numbers', 1);
      ctx.append<number>('numbers', 2);

      expect(ctx.getAll<string>('strings')).toEqual(['a', 'b']);
      expect(ctx.getAll<number>('numbers')).toEqual([1, 2]);
    });
  });

  describe('Counter Operations', () => {
    it('dovrebbe incrementare contatore', () => {
      expect(ctx.increment('count')).toBe(1);
      expect(ctx.increment('count')).toBe(2);
      expect(ctx.increment('count')).toBe(3);
    });

    it('dovrebbe incrementare con amount personalizzato', () => {
      expect(ctx.increment('count', 5)).toBe(5);
      expect(ctx.increment('count', 3)).toBe(8);
    });

    it('dovrebbe decrementare contatore', () => {
      ctx.set('count', 10);
      expect(ctx.decrement('count')).toBe(9);
      expect(ctx.decrement('count', 5)).toBe(4);
    });

    it('dovrebbe gestire contatore non inizializzato', () => {
      expect(ctx.increment('new')).toBe(1);
      expect(ctx.get('new')).toBe(1);
    });
  });

  describe('Merge Operations', () => {
    it('dovrebbe fare merge di oggetto parziale', () => {
      ctx.set('config', { a: 1, b: 2 });
      ctx.merge('config', { b: 3, c: 4 });

      expect(ctx.get('config')).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('dovrebbe creare oggetto se non esiste', () => {
      ctx.merge('newObj', { x: 1, y: 2 });
      expect(ctx.get('newObj')).toEqual({ x: 1, y: 2 });
    });
  });

  describe('Checkpoint & Rollback', () => {
    it('dovrebbe creare checkpoint e fare rollback', () => {
      ctx.set('key1', 'value1');
      ctx.set('key2', 'value2');
      ctx.checkpoint('checkpoint1');

      ctx.set('key1', 'changed');
      ctx.set('key3', 'new');

      expect(ctx.get('key1')).toBe('changed');
      expect(ctx.get('key3')).toBe('new');

      const success = ctx.rollback('checkpoint1');
      expect(success).toBe(true);
      expect(ctx.get('key1')).toBe('value1');
      expect(ctx.get('key2')).toBe('value2');
      expect(ctx.has('key3')).toBe(false);
    });

    it('dovrebbe gestire checkpoint di array', () => {
      ctx.append('items', 'item1');
      ctx.append('items', 'item2');
      ctx.checkpoint('cp1');

      ctx.append('items', 'item3');
      ctx.append('items', 'item4');

      expect(ctx.getAll('items')).toEqual(['item1', 'item2', 'item3', 'item4']);

      ctx.rollback('cp1');
      expect(ctx.getAll('items')).toEqual(['item1', 'item2']);
    });

    it('dovrebbe restituire false per checkpoint inesistente', () => {
      const success = ctx.rollback('nonexistent');
      expect(success).toBe(false);
    });

    it('dovrebbe supportare checkpoint multipli', () => {
      ctx.set('value', 1);
      ctx.checkpoint('cp1');

      ctx.set('value', 2);
      ctx.checkpoint('cp2');

      ctx.set('value', 3);
      ctx.checkpoint('cp3');

      ctx.set('value', 4);

      ctx.rollback('cp2');
      expect(ctx.get('value')).toBe(2);

      ctx.rollback('cp1');
      expect(ctx.get('value')).toBe(1);
    });

    it('dovrebbe listare checkpoint', () => {
      ctx.checkpoint('cp1');
      ctx.checkpoint('cp2');
      ctx.checkpoint('cp3');

      const checkpoints = ctx.listCheckpoints();
      expect(checkpoints).toContain('cp1');
      expect(checkpoints).toContain('cp2');
      expect(checkpoints).toContain('cp3');
      expect(checkpoints.length).toBe(3);
    });

    it('dovrebbe eliminare checkpoint', () => {
      ctx.checkpoint('cp1');
      ctx.checkpoint('cp2');

      expect(ctx.listCheckpoints()).toContain('cp1');
      
      const deleted = ctx.deleteCheckpoint('cp1');
      expect(deleted).toBe(true);
      expect(ctx.listCheckpoints()).not.toContain('cp1');
      expect(ctx.listCheckpoints()).toContain('cp2');
    });
  });

  describe('Export & Import', () => {
    it('dovrebbe esportare e importare context', () => {
      ctx.set('key1', 'value1');
      ctx.set('key2', 42);
      ctx.append('items', 'a');
      ctx.append('items', 'b');
      ctx.increment('count', 5);

      const exported = ctx.export();
      expect(exported).toBeTruthy();

      const imported = WorkflowContext.import(exported);
      expect(imported.get('key1')).toBe('value1');
      expect(imported.get('key2')).toBe(42);
      expect(imported.getAll('items')).toEqual(['a', 'b']);
      expect(imported.get('count')).toBe(5);
    });
  });

  describe('Summary & Metadata', () => {
    it('dovrebbe generare summary', () => {
      ctx.set('key1', 'value1');
      ctx.append('items', 'a');
      ctx.append('items', 'b');
      ctx.checkpoint('cp1');

      const summary = ctx.summary();
      
      expect(summary.workflowId).toBe('test-id');
      expect(summary.workflowName).toBe('test-workflow');
      expect(summary.dataKeys).toContain('key1');
      expect(summary.arrayKeys).toContain('items');
      expect(summary.arraySizes.items).toBe(2);
      expect(summary.checkpointCount).toBe(1);
      expect(summary.elapsedMs).toBeGreaterThanOrEqual(0);
    });

    it('dovrebbe avere metadata corretti', () => {
      expect(ctx.metadata.workflowId).toBe('test-id');
      expect(ctx.metadata.workflowName).toBe('test-workflow');
      expect(ctx.metadata.startTime).toBeInstanceOf(Date);
    });
  });

  describe('Utility Methods', () => {
    it('dovrebbe restituire tutte le chiavi', () => {
      ctx.set('key1', 'value1');
      ctx.set('key2', 'value2');
      ctx.append('items', 'a');

      const keys = ctx.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('items');
      expect(keys.length).toBe(3);
    });

    it('dovrebbe restituire size del context', () => {
      ctx.set('key1', 'value1');
      ctx.set('key2', 'value2');
      ctx.append('items', 'a');

      expect(ctx.size()).toBe(3);
    });

    it('dovrebbe pulire tutti i dati', () => {
      ctx.set('key1', 'value1');
      ctx.append('items', 'a');
      ctx.checkpoint('cp1');

      ctx.clear();

      expect(ctx.size()).toBe(0);
      expect(ctx.keys()).toEqual([]);
      expect(ctx.listCheckpoints()).toEqual([]);
    });
  });
});

describe('ContextualWorkflowExecutor', () => {
  it('dovrebbe iniettare context nel workflow', async () => {
    const executor = new ContextualWorkflowExecutor();
    
    const workflow = async (params: { value: string, __context: WorkflowContext }) => {
      params.__context.set('processed', true);
      params.__context.increment('steps');
      return `Result: ${params.value}`;
    };

    const result = await executor.execute(
      workflow,
      { value: 'test' },
      'test-id',
      'test-workflow'
    );

    expect(result).toBe('Result: test');
  });

  it('dovrebbe gestire errori e loggare context', async () => {
    const executor = new ContextualWorkflowExecutor();
    
    const workflow = async (params: { __context: WorkflowContext }) => {
      params.__context.set('step', 'before-error');
      throw new Error('Test error');
    };

    await expect(executor.execute(
      workflow,
      {},
      'test-id',
      'test-workflow'
    )).rejects.toThrow('Test error');
  });
});

describe('createWorkflowContext', () => {
  it('dovrebbe creare context con factory', () => {
    const ctx = createWorkflowContext('id-1', 'workflow-1');
    
    expect(ctx).toBeInstanceOf(WorkflowContext);
    expect(ctx.metadata.workflowId).toBe('id-1');
    expect(ctx.metadata.workflowName).toBe('workflow-1');
  });
});
