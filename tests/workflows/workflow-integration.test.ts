import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as commandExecutor from '../../src/utils/commandExecutor.js';
import { AutonomyLevel } from '../../src/utils/permissionManager.js';

vi.mock('../../src/utils/commandExecutor.js');
vi.mock('../../src/utils/logger.js');

describe('Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Permission Integration', () => {
    it('dovrebbe permettere workflow con READ_ONLY di leggere file', async () => {
      const { createWorkflowPermissionManager } = await import('../../src/workflows/utils.js');
      
      const manager = createWorkflowPermissionManager({
        autonomyLevel: AutonomyLevel.READ_ONLY
      });

      expect(manager.file.canRead()).toBe(true);
    });

    it('dovrebbe bloccare workflow con READ_ONLY dal fare commit', async () => {
      const { createWorkflowPermissionManager } = await import('../../src/workflows/utils.js');
      
      const manager = createWorkflowPermissionManager({
        autonomyLevel: AutonomyLevel.READ_ONLY
      });

      expect(() => manager.git.assertCommit('test commit')).toThrow();
    });

    it('dovrebbe permettere workflow con MEDIUM di fare commit', async () => {
      const { createWorkflowPermissionManager } = await import('../../src/workflows/utils.js');
      
      const manager = createWorkflowPermissionManager({
        autonomyLevel: AutonomyLevel.MEDIUM
      });

      expect(() => manager.git.assertCommit('test commit')).not.toThrow();
    });
  });

  describe('Git + Permission Integration', () => {
    it('dovrebbe verificare repository prima di operazioni Git', async () => {
      const mockExecute = vi.spyOn(commandExecutor, 'executeCommand');
      mockExecute.mockResolvedValue('.git');

      const { isGitRepository } = await import('../../src/utils/gitHelper.js');
      const isRepo = await isGitRepository();

      expect(isRepo).toBe(true);
      expect(commandExecutor.executeCommand).toHaveBeenCalledWith(
        'git',
        ['rev-parse', '--git-dir']
      );
    });

    it('dovrebbe gestire gracefully se non e un repository Git', async () => {
      const mockExecute = vi.spyOn(commandExecutor, 'executeCommand');
      mockExecute.mockRejectedValue(new Error('not a git repo'));

      const { isGitRepository } = await import('../../src/utils/gitHelper.js');
      const isRepo = await isGitRepository();

      expect(isRepo).toBe(false);
    });
  });

  describe('AI + Permission Integration', () => {
    it('dovrebbe eseguire AI backend con permessi appropriati', async () => {
      const mockOutput = 'AI analysis result';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      const { executeAIClient } = await import('../../src/utils/aiExecutor.js');
      const { createWorkflowPermissionManager } = await import('../../src/workflows/utils.js');

      const manager = createWorkflowPermissionManager({
        autonomyLevel: AutonomyLevel.READ_ONLY
      });

      expect(manager.file.canRead()).toBe(true);

      const result = await executeAIClient({
        backend: 'qwen',
        prompt: 'analyze this file'
      });

      expect(result).toBe(mockOutput);
    });
  });

  describe('Workflow Utils Integration', () => {
    it('dovrebbe formattare output workflow correttamente', async () => {
      const { formatWorkflowOutput } = await import('../../src/workflows/utils.js');
      
      const output = formatWorkflowOutput(
        'Test Workflow',
        'Test result content',
        { executionTime: 1000 }
      );

      expect(output).toContain('Test Workflow');
      expect(output).toContain('Test result content');
      expect(output).toContain('executionTime');
    });
  });

  describe('Error Handling Integration', () => {
    it('dovrebbe propagare errori correttamente attraverso i layer', async () => {
      vi.spyOn(commandExecutor, 'executeCommand').mockRejectedValue(
        new Error('Command failed')
      );

      const { executeQwenCLI } = await import('../../src/utils/aiExecutor.js');

      await expect(
        executeQwenCLI({ prompt: 'test' })
      ).rejects.toThrow('Command failed');
    });

    it('dovrebbe gestire timeout nei comandi AI', async () => {
      vi.spyOn(commandExecutor, 'executeCommand').mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const { executeGeminiCLI } = await import('../../src/utils/aiExecutor.js');

      await expect(
        executeGeminiCLI({ prompt: 'test' })
      ).rejects.toThrow('Timeout');
    });
  });
});
