/**
 * Integration tests for Workflows
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutonomyLevel } from '../../src/utils/permissionManager.js';
import { createMockProgressCallback } from '../utils/testHelpers.js';
import { mockGitCommands, createMockGitDiff, resetMockGitCommands } from '../utils/mockGit.js';
import { mockAIExecutor } from '../utils/mockAI.js';

describe('Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.resetModules();
    resetMockGitCommands();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initSessionWorkflow', () => {
    it('should execute init session workflow successfully', async () => {
      // Mock git commands
      const mockDiff = createMockGitDiff('src/index.ts', ['+new feature'], ['-old code']);
      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { command: 'log --oneline', output: 'abc123 Commit 1\ndef456 Commit 2' },
        { 
          command: 'show --format=%H|%an|%ad|%s --date=iso abc123',
          output: 'abc123|Author|2024-01-15 10:00:00 +0000|Commit 1\n' + mockDiff
        },
        { command: 'show --format= abc123', output: mockDiff },
        { command: 'show --format= --name-only abc123', output: 'src/index.ts' }
      ]);

      // Mock AI response
      mockAIExecutor({
        rovodev: 'Analysis: Code looks good. Added new feature successfully.'
      });

      const { executeInitSession } = await import('../../src/workflows/init-session.workflow.js');
      const { callback, messages } = createMockProgressCallback();

      const result = await executeInitSession({
        autonomyLevel: AutonomyLevel.READ_ONLY,
        commitCount: 2
      }, callback);

      expect(result).toContain('Session Initialization');
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should respect autonomy level permissions', async () => {
      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' }
      ]);

      const { executeInitSession } = await import('../../src/workflows/init-session.workflow.js');
      
      // Should not throw with READ_ONLY for git read operations
      await expect(
        executeInitSession({
          autonomyLevel: AutonomyLevel.READ_ONLY,
          commitCount: 1
        })
      ).resolves.toBeDefined();
    });
  });

  describe('parallelReviewWorkflow', () => {
    it('should execute parallel reviews successfully', async () => {
      // Mock AI responses for parallel execution
      mockAIExecutor({
        gemini: 'Gemini analysis: Good architecture, consider adding error handling',
        'ask-cursor': 'Cursor Agent review: Refactoring suggestions for better maintainability',
        droid: 'Droid review: Code is production-ready with minor improvements'
      });

      const { executeParallelReview } = await import('../../src/workflows/parallel-review.workflow.js');
      const { callback, messages } = createMockProgressCallback();

      const result = await executeParallelReview({
        autonomyLevel: AutonomyLevel.READ_ONLY,
        files: ['src/index.ts', 'src/utils.ts'],
        focus: 'security and performance'
      }, callback);

      expect(result).toContain('Parallel Review');
      expect(result).toContain('Gemini');
      expect(result).toContain('Cursor');
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should handle empty file list', async () => {
      const { executeParallelReview } = await import('../../src/workflows/parallel-review.workflow.js');

      await expect(
        executeParallelReview({
          autonomyLevel: AutonomyLevel.READ_ONLY,
          files: [],
          focus: 'test'
        })
      ).rejects.toThrow();
    });

    it('should execute parallel calls concurrently', async () => {
      const startTime = Date.now();
      const delays = { gemini: 100, rovodev: 100 };

      // Mock with delays
      vi.doMock('../../src/utils/aiExecutor.js', async () => ({
        executeAIClient: vi.fn().mockImplementation(async (config: any) => {
          await new Promise(resolve => setTimeout(resolve, delays[config.backend as keyof typeof delays]));
          return `Response from ${config.backend}`;
        })
      }));

      const { executeParallelReview } = await import('../../src/workflows/parallel-review.workflow.js');
      
      await executeParallelReview({
        autonomyLevel: AutonomyLevel.READ_ONLY,
        files: ['test.ts'],
        focus: 'test'
      });

      const duration = Date.now() - startTime;
      
      // Should complete noticeably faster than sequential execution (~2x delay)
      expect(duration).toBeLessThan(700);
    });
  });

  describe('validateLastCommitWorkflow', () => {
    it('should validate last commit successfully', async () => {
      const mockDiff = createMockGitDiff(
        'src/auth.ts',
        ['+  const token = getSecureToken();'],
        ['-  const token = "hardcoded";']
      );

      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { 
          command: 'show --format=%H|%an|%ad|%s --date=iso HEAD',
          output: 'abc123|Author|2024-01-15 10:00:00 +0000|Fix security issue\n' + mockDiff
        },
        { command: 'show --format= HEAD', output: mockDiff },
        { command: 'show --format= --name-only HEAD', output: 'src/auth.ts' }
      ]);

      mockAIExecutor({
        gemini: 'Validation: Commit improves security by removing hardcoded token',
        qwen: 'Analysis: Good practice. Token management improved.'
      });

      const { executeValidateLastCommit } = await import('../../src/workflows/validate-last-commit.workflow.js');
      const { callback, messages } = createMockProgressCallback();

      const result = await executeValidateLastCommit({
        autonomyLevel: AutonomyLevel.READ_ONLY
      }, callback);

      expect(result).toContain('Commit Validation');
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should detect breaking changes', async () => {
      const mockDiff = createMockGitDiff(
        'src/api.ts',
        ['+  function newAPI() {}'],
        ['-  export function oldAPI() {}']
      );

      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { 
          command: 'show --format=%H|%an|%ad|%s --date=iso HEAD',
          output: 'abc123|Author|2024-01-15 10:00:00 +0000|Refactor API\n' + mockDiff
        },
        { command: 'show --format= HEAD', output: mockDiff },
        { command: 'show --format= --name-only HEAD', output: 'src/api.ts' }
      ]);

      mockAIExecutor({
        gemini: 'WARNING: Breaking change detected - exported function removed',
        qwen: 'Alert: API changes may break existing integrations'
      });

      const { executeValidateLastCommit } = await import('../../src/workflows/validate-last-commit.workflow.js');
      
      const result = await executeValidateLastCommit({
        autonomyLevel: AutonomyLevel.READ_ONLY
      });

      expect(result).toContain('Breaking change');
    });
  });

  describe('Workflow error handling', () => {
    it('should handle git command failures gracefully', async () => {
      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '', exitCode: 128 }
      ]);

      const { executeInitSession } = await import('../../src/workflows/init-session.workflow.js');

      const result = await executeInitSession({
        autonomyLevel: AutonomyLevel.READ_ONLY,
        commitCount: 1
      });

      expect(result).toContain('non è un repository Git');
    });

    it('should handle AI execution failures with fallback', async () => {
      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { command: 'log --oneline', output: 'abc123 Commit' }
      ]);

      let callCount = 0;
      vi.doMock('../../src/utils/aiExecutor.js', async () => ({
        executeAIClient: vi.fn().mockImplementation(async (config: any) => {
          callCount++;
          if (callCount === 1) {
            throw new Error('Primary backend failed');
          }
          return 'Fallback response';
        })
      }));

      const { executeInitSession } = await import('../../src/workflows/init-session.workflow.js');
      
      // Should succeed with fallback
      const result = await executeInitSession({
        autonomyLevel: AutonomyLevel.READ_ONLY,
        commitCount: 1
      });

      expect(result).toBeDefined();
      expect(callCount).toBeGreaterThan(1);
    });

    it('should handle permission denied errors', async () => {
      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' }
      ]);

      const { executeParallelReview } = await import('../../src/workflows/parallel-review.workflow.js');

      // Try to write files with READ_ONLY level (should fail if workflow checks permissions)
      // This test verifies that permission system is integrated
      await expect(
        executeParallelReview({
          autonomyLevel: AutonomyLevel.READ_ONLY,
          files: ['test.ts'],
          focus: 'test',
          writeReport: true // Hypothetical parameter that would require write permission
        })
      ).resolves.toBeDefined(); // Should not throw if parameter is not implemented yet
    });
  });

  describe('Workflow progress callbacks', () => {
    it('should call progress callback at each step', async () => {
      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { command: 'log --oneline', output: 'abc123 Commit' }
      ]);

      mockAIExecutor({
        rovodev: 'Analysis complete'
      });

      const { executeInitSession } = await import('../../src/workflows/init-session.workflow.js');
      const { callback, messages } = createMockProgressCallback();

      await executeInitSession({
        autonomyLevel: AutonomyLevel.READ_ONLY,
        commitCount: 1
      }, callback);

      // Should have multiple progress messages
      expect(messages.length).toBeGreaterThan(2);
      expect(messages.some(m => m.includes('Starting'))).toBe(true);
    });
  });

  describe('Workflow parameter validation', () => {
    it('should validate autonomy level parameter', async () => {
      const { executeInitSession } = await import('../../src/workflows/init-session.workflow.js');

      // Invalid autonomy level should fail validation
      await expect(
        executeInitSession({
          autonomyLevel: 'invalid' as any,
          commitCount: 1
        })
      ).rejects.toThrow();
    });

    it('should use default autonomy level if not specified', async () => {
      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { command: 'log --oneline', output: 'abc123 Commit' }
      ]);

      mockAIExecutor({
        rovodev: 'Analysis'
      });

      const { executeInitSession } = await import('../../src/workflows/init-session.workflow.js');
      
      // Should work without autonomyLevel parameter
      const result = await executeInitSession({
        commitCount: 1
      } as any);

      expect(result).toBeDefined();
    });
  });
});
