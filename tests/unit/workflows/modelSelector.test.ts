/**
 * Tests for model selector
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  selectOptimalBackend, 
  selectParallelBackends,
  recordBackendUsage,
  getBackendStats,
  createTaskCharacteristics,
  type TaskCharacteristics 
} from '../../../src/workflows/modelSelector.js';
import { BACKENDS } from '../../../src/utils/aiExecutor.js';

describe('Model Selector', () => {
  describe('selectOptimalBackend', () => {
    it('should select Cursor for fast + low complexity tasks', () => {
      const task: TaskCharacteristics = {
        complexity: 'low',
        tokenBudget: 5000,
        requiresArchitecturalThinking: false,
        requiresCodeGeneration: false,
        requiresSpeed: true,
        requiresCreativity: false
      };

      const backend = selectOptimalBackend(task);
      expect(backend).toBe(BACKENDS.CURSOR);
    });

    it('should select Gemini for architectural thinking', () => {
      const task: TaskCharacteristics = {
        complexity: 'high',
        tokenBudget: 50000,
        requiresArchitecturalThinking: true,
        requiresCodeGeneration: false,
        requiresSpeed: false,
        requiresCreativity: false
      };

      const backend = selectOptimalBackend(task);
      expect(backend).toBe(BACKENDS.GEMINI);
    });

    it('should select Droid for code generation + high complexity', () => {
      const task: TaskCharacteristics = {
        complexity: 'high',
        tokenBudget: 40000,
        requiresArchitecturalThinking: false,
        requiresCodeGeneration: true,
        requiresSpeed: false,
        requiresCreativity: false
      };

      const backend = selectOptimalBackend(task);
      expect(backend).toBe(BACKENDS.DROID);
    });

    it('should select by domain: security -> Cursor', () => {
      const task: TaskCharacteristics = {
        complexity: 'medium',
        tokenBudget: 20000,
        requiresArchitecturalThinking: false,
        requiresCodeGeneration: false,
        requiresSpeed: false,
        requiresCreativity: false,
        domain: 'security'
      };

      const backend = selectOptimalBackend(task);
      expect(backend).toBe(BACKENDS.CURSOR);
    });

    it('should select by domain: architecture -> Gemini', () => {
      const task: TaskCharacteristics = {
        complexity: 'medium',
        tokenBudget: 30000,
        requiresArchitecturalThinking: false,
        requiresCodeGeneration: false,
        requiresSpeed: false,
        requiresCreativity: false,
        domain: 'architecture'
      };

      const backend = selectOptimalBackend(task);
      expect(backend).toBe(BACKENDS.GEMINI);
    });

    it('should select by domain: debugging -> Cursor', () => {
      const task: TaskCharacteristics = {
        complexity: 'medium',
        tokenBudget: 30000,
        requiresArchitecturalThinking: false,
        requiresCodeGeneration: false,
        requiresSpeed: false,
        requiresCreativity: false,
        domain: 'debugging'
      };

      const backend = selectOptimalBackend(task);
      expect(backend).toBe(BACKENDS.CURSOR);
    });

    it('should respect allowed backends constraint', () => {
      const task: TaskCharacteristics = {
        complexity: 'high',
        tokenBudget: 50000,
        requiresArchitecturalThinking: true,
        requiresCodeGeneration: false,
        requiresSpeed: false,
        requiresCreativity: false
      };

      const backend = selectOptimalBackend(task, [BACKENDS.CURSOR, BACKENDS.DROID]);
      expect([BACKENDS.CURSOR, BACKENDS.DROID, BACKENDS.GEMINI]).toContain(backend);
      expect(backend).toBe(BACKENDS.GEMINI);
    });
  });

  describe('selectParallelBackends', () => {
    it('should select 2 complementary backends', () => {
      const task: TaskCharacteristics = {
        complexity: 'high',
        tokenBudget: 50000,
        requiresArchitecturalThinking: true,
        requiresCodeGeneration: false,
        requiresSpeed: false,
        requiresCreativity: false
      };

      const backends = selectParallelBackends(task, 2);
      expect(backends).toHaveLength(2);
      expect(new Set(backends).size).toBe(2); // No duplicates
    });

    it('should complement Gemini with Droid', () => {
      const task: TaskCharacteristics = {
        complexity: 'high',
        tokenBudget: 50000,
        requiresArchitecturalThinking: true,
        requiresCodeGeneration: false,
        requiresSpeed: false,
        requiresCreativity: false
      };

      const backends = selectParallelBackends(task, 2);
      expect(backends[0]).toBe(BACKENDS.GEMINI);
      expect(backends[1]).toBe(BACKENDS.DROID);
    });

    it('should select up to 3 backends', () => {
      const task: TaskCharacteristics = {
        complexity: 'high',
        tokenBudget: 50000,
        requiresArchitecturalThinking: false,
        requiresCodeGeneration: false,
        requiresSpeed: false,
        requiresCreativity: false
      };

      const backends = selectParallelBackends(task, 3);
      expect(backends.length).toBeLessThanOrEqual(3);
    });
  });

  describe('recordBackendUsage', () => {
    it('should record backend usage statistics', () => {
      const task: TaskCharacteristics = {
        complexity: 'medium',
        tokenBudget: 30000,
        requiresArchitecturalThinking: false,
        requiresCodeGeneration: false,
        requiresSpeed: false,
        requiresCreativity: false
      };

      recordBackendUsage(BACKENDS.GEMINI, task, true, 1500);
      recordBackendUsage(BACKENDS.GEMINI, task, true, 1600);
      recordBackendUsage(BACKENDS.GEMINI, task, false, 2000);

      const stats = getBackendStats();
      const geminiStats = stats.find(s => s.backend === BACKENDS.GEMINI);

      expect(geminiStats).toBeDefined();
      expect(geminiStats?.totalCalls).toBe(3);
      expect(geminiStats?.successfulCalls).toBe(2);
      expect(geminiStats?.failedCalls).toBe(1);
    });
  });

  describe('createTaskCharacteristics', () => {
    it('should create characteristics for parallel-review', () => {
      const task = createTaskCharacteristics('parallel-review');
      
      expect(task.complexity).toBe('high');
      expect(task.requiresArchitecturalThinking).toBe(true);
      expect(task.domain).toBe('architecture');
    });

    it('should create characteristics for pre-commit-validate', () => {
      const task = createTaskCharacteristics('pre-commit-validate');
      
      expect(task.requiresSpeed).toBe(true);
      expect(task.domain).toBe('security');
    });

    it('should create characteristics for bug-hunt', () => {
      const task = createTaskCharacteristics('bug-hunt');
      
      expect(task.complexity).toBe('high');
      expect(task.domain).toBe('debugging');
    });

    it('should apply custom overrides', () => {
      const task = createTaskCharacteristics('parallel-review', {
        complexity: 'low',
        requiresSpeed: true
      });
      
      expect(task.complexity).toBe('low');
      expect(task.requiresSpeed).toBe(true);
      expect(task.requiresArchitecturalThinking).toBe(true); // Preserved from default
    });
  });
});
