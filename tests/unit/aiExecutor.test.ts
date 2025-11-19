/**
 * Unit tests for AI Executor
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BACKENDS } from '../../src/constants.js';

describe('AIExecutor', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('executeGeminiCLI', () => {
    it('should execute gemini with basic prompt', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Gemini response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeGeminiCLI } = await import('../../src/utils/aiExecutor.js');
      const result = await executeGeminiCLI({ prompt: 'Test prompt' });

      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(result).toBe('Gemini response');
    });

    it('should include model flag when specified', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeGeminiCLI } = await import('../../src/utils/aiExecutor.js');
      await executeGeminiCLI({ prompt: 'Test', model: 'gemini-2.0-flash-exp' });

      const callArgs = mockExecuteCommand.mock.calls[0];
      expect(callArgs[1]).toContain('-m');
      expect(callArgs[1]).toContain('gemini-2.0-flash-exp');
    });

    it('should throw error for empty prompt', async () => {
      const { executeGeminiCLI } = await import('../../src/utils/aiExecutor.js');
      await expect(executeGeminiCLI({ prompt: '' })).rejects.toThrow();
    });
  });

  describe('executeCursorAgentCLI', () => {
    it('should execute cursor agent with default options', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Cursor response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeCursorAgentCLI } = await import('../../src/utils/aiExecutor.js');
      const result = await executeCursorAgentCLI({ prompt: 'Fix bug' });

      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(result).toBe('Cursor response');
    });

    it('should include attachments, cwd and auto-approve flags', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Cursor response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeCursorAgentCLI } = await import('../../src/utils/aiExecutor.js');
      await executeCursorAgentCLI({
        prompt: 'Plan refactor',
        attachments: ['/repo/src/file.ts'],
        projectRoot: '/repo',
        autoApprove: true,
        outputFormat: 'json'
      });

      const args = mockExecuteCommand.mock.calls[0][1];
      expect(args).toContain('--file');
      expect(args).toContain('/repo/src/file.ts');
      expect(args).toContain('--cwd');
      expect(args).toContain('/repo');
      expect(args).toContain('--auto-approve');
      expect(args).toContain('--output-format');
      expect(args).toContain('json');
    });
  });

  describe('executeDroidCLI', () => {
    it('should execute droid with exec subcommand', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Droid response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeDroidCLI } = await import('../../src/utils/aiExecutor.js');
      const result = await executeDroidCLI({ prompt: 'Investigate issue' });

      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(mockExecuteCommand.mock.calls[0][1][0]).toBe('exec');
      expect(result).toBe('Droid response');
    });

    it('should include auto level, session id and attachments', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Droid response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeDroidCLI } = await import('../../src/utils/aiExecutor.js');
      await executeDroidCLI({
        prompt: 'Generate checklist',
        auto: 'medium',
        sessionId: 'session-123',
        skipPermissionsUnsafe: true,
        attachments: ['/repo/log.txt'],
        cwd: '/repo',
        outputFormat: 'json'
      });

      const args = mockExecuteCommand.mock.calls[0][1];
      expect(args).toContain('--auto');
      expect(args).toContain('medium');
      expect(args).toContain('--session-id');
      expect(args).toContain('session-123');
      expect(args).toContain('--skip-permissions-unsafe');
      expect(args).toContain('--file');
      expect(args).toContain('/repo/log.txt');
      expect(args).toContain('--cwd');
      expect(args).toContain('/repo');
      expect(args).toContain('--output-format');
      expect(args).toContain('json');
    });
  });

  describe('executeAIClient', () => {
    it('should route to cursor backend', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Cursor response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeAIClient } = await import('../../src/utils/aiExecutor.js');
      await executeAIClient({ backend: BACKENDS.CURSOR, prompt: 'Cursor prompt' });

      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(mockExecuteCommand.mock.calls[0][0]).toBe('cursor-agent');
    });

    it('should route to droid backend', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Droid response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeAIClient } = await import('../../src/utils/aiExecutor.js');
      await executeAIClient({ backend: BACKENDS.DROID, prompt: 'Droid prompt' });

      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(mockExecuteCommand.mock.calls[0][0]).toBe('droid');
    });

    it('should throw error for unknown backend', async () => {
      const { executeAIClient } = await import('../../src/utils/aiExecutor.js');
      await expect(
        executeAIClient({ backend: 'unknown', prompt: 'Test' })
      ).rejects.toThrow(/Unsupported backend/);
    });

    it('should throw error for empty prompt', async () => {
      const { executeAIClient } = await import('../../src/utils/aiExecutor.js');
      await expect(
        executeAIClient({ backend: BACKENDS.CURSOR, prompt: '' })
      ).rejects.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should handle command execution errors', async () => {
      const mockExecuteCommand = vi.fn().mockRejectedValue(new Error('Command failed'));
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeGeminiCLI } = await import('../../src/utils/aiExecutor.js');
      await expect(executeGeminiCLI({ prompt: 'Test' })).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      const mockExecuteCommand = vi.fn().mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeGeminiCLI } = await import('../../src/utils/aiExecutor.js');
      await expect(executeGeminiCLI({ prompt: 'Test' })).rejects.toThrow();
    });
  });
});
