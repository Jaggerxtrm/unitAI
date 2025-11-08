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

  describe('executeQwenCLI', () => {
    it('should execute qwen with basic prompt', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Qwen response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeQwenCLI } = await import('../../src/utils/aiExecutor.js');
      const result = await executeQwenCLI({ prompt: 'Test prompt' });

      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(result).toBe('Qwen response');
    });

    it('should include model flag when specified', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeQwenCLI } = await import('../../src/utils/aiExecutor.js');
      await executeQwenCLI({ prompt: 'Test', model: 'qwen-max' });

      const callArgs = mockExecuteCommand.mock.calls[0];
      expect(callArgs[1]).toContain('--model');
      expect(callArgs[1]).toContain('qwen-max');
    });

    it('should include sandbox flag when enabled', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeQwenCLI } = await import('../../src/utils/aiExecutor.js');
      await executeQwenCLI({ prompt: 'Test', sandbox: true });

      const callArgs = mockExecuteCommand.mock.calls[0];
      expect(callArgs[1]).toContain('--sandbox');
    });

    it('should throw error for empty prompt', async () => {
      const { executeQwenCLI } = await import('../../src/utils/aiExecutor.js');
      await expect(executeQwenCLI({ prompt: '' })).rejects.toThrow();
    });

    it('should call onProgress callbacks', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const onProgress = vi.fn();
      const { executeQwenCLI } = await import('../../src/utils/aiExecutor.js');
      await executeQwenCLI({ prompt: 'Test', onProgress });

      expect(onProgress).toHaveBeenCalled();
    });
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
      expect(callArgs[1]).toContain('--model');
      expect(callArgs[1]).toContain('gemini-2.0-flash-exp');
    });

    it('should throw error for empty prompt', async () => {
      const { executeGeminiCLI } = await import('../../src/utils/aiExecutor.js');
      await expect(executeGeminiCLI({ prompt: '' })).rejects.toThrow();
    });
  });

  describe('executeRovodevCLI', () => {
    it('should execute rovodev with basic prompt', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Rovodev response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeRovodevCLI } = await import('../../src/utils/aiExecutor.js');
      const result = await executeRovodevCLI({ prompt: 'Test prompt' });

      expect(mockExecuteCommand).toHaveBeenCalled();
      expect(result).toBe('Rovodev response');
    });

    it('should include yolo flag when enabled', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeRovodevCLI } = await import('../../src/utils/aiExecutor.js');
      await executeRovodevCLI({ prompt: 'Test', yolo: true });

      const callArgs = mockExecuteCommand.mock.calls[0];
      expect(callArgs[1]).toContain('--yolo');
    });

    it('should include shadow flag when enabled', async () => {
      const mockExecuteCommand = vi.fn().mockResolvedValue('Response');
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeRovodevCLI } = await import('../../src/utils/aiExecutor.js');
      await executeRovodevCLI({ prompt: 'Test', shadow: true });

      const callArgs = mockExecuteCommand.mock.calls[0];
      expect(callArgs[1]).toContain('--shadow');
    });

    it('should throw error for empty prompt', async () => {
      const { executeRovodevCLI } = await import('../../src/utils/aiExecutor.js');
      await expect(executeRovodevCLI({ prompt: '' })).rejects.toThrow();
    });
  });

  describe('executeAIClient', () => {
    it('should route to qwen for qwen backend', async () => {
      const mockExecuteQwen = vi.fn().mockResolvedValue('Qwen response');
      vi.doMock('../../src/utils/aiExecutor.js', async () => {
        const actual = await vi.importActual('../../src/utils/aiExecutor.js');
        return {
          ...actual,
          executeQwenCLI: mockExecuteQwen
        };
      });

      const { executeAIClient } = await import('../../src/utils/aiExecutor.js');
      await executeAIClient({ backend: BACKENDS.QWEN, prompt: 'Test' });

      expect(mockExecuteQwen).toHaveBeenCalledWith(
        expect.objectContaining({ prompt: 'Test' })
      );
    });

    it('should throw error for unknown backend', async () => {
      const { executeAIClient } = await import('../../src/utils/aiExecutor.js');
      await expect(
        executeAIClient({ backend: 'unknown', prompt: 'Test' })
      ).rejects.toThrow(/Unknown backend/);
    });

    it('should throw error for empty prompt', async () => {
      const { executeAIClient } = await import('../../src/utils/aiExecutor.js');
      await expect(
        executeAIClient({ backend: BACKENDS.QWEN, prompt: '' })
      ).rejects.toThrow();
    });
  });

  describe('Fallback mechanism', () => {
    it('should fallback to gemini when qwen fails', async () => {
      const mockExecuteQwen = vi.fn().mockRejectedValue(new Error('Qwen failed'));
      const mockExecuteGemini = vi.fn().mockResolvedValue('Gemini fallback response');

      vi.doMock('../../src/utils/aiExecutor.js', async () => {
        const actual = await vi.importActual('../../src/utils/aiExecutor.js');
        return {
          ...actual,
          executeQwenCLI: mockExecuteQwen,
          executeGeminiCLI: mockExecuteGemini
        };
      });

      const { executeAIClient } = await import('../../src/utils/aiExecutor.js');
      const result = await executeAIClient({ 
        backend: BACKENDS.QWEN, 
        prompt: 'Test',
        fallback: BACKENDS.GEMINI
      });

      expect(result).toBe('Gemini fallback response');
    });

    it('should not fallback if fallback is disabled', async () => {
      const mockExecuteQwen = vi.fn().mockRejectedValue(new Error('Qwen failed'));

      vi.doMock('../../src/utils/aiExecutor.js', async () => {
        const actual = await vi.importActual('../../src/utils/aiExecutor.js');
        return {
          ...actual,
          executeQwenCLI: mockExecuteQwen
        };
      });

      const { executeAIClient } = await import('../../src/utils/aiExecutor.js');
      await expect(
        executeAIClient({ backend: BACKENDS.QWEN, prompt: 'Test', fallback: null })
      ).rejects.toThrow('Qwen failed');
    });
  });

  describe('Error handling', () => {
    it('should handle command execution errors', async () => {
      const mockExecuteCommand = vi.fn().mockRejectedValue(new Error('Command failed'));
      vi.doMock('../../src/utils/commandExecutor.js', () => ({
        executeCommand: mockExecuteCommand
      }));

      const { executeQwenCLI } = await import('../../src/utils/aiExecutor.js');
      await expect(executeQwenCLI({ prompt: 'Test' })).rejects.toThrow();
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

      const { executeQwenCLI } = await import('../../src/utils/aiExecutor.js');
      await expect(executeQwenCLI({ prompt: 'Test' })).rejects.toThrow();
    });
  });
});
