import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  executeQwenCLI,
  executeGeminiCLI,
  executeRovodevCLI,
  executeAIClient
} from '../../src/utils/aiExecutor.js';
import * as commandExecutor from '../../src/utils/commandExecutor.js';
import { BACKENDS } from '../../src/constants.js';

vi.mock('../../src/utils/commandExecutor.js');
vi.mock('../../src/utils/logger.js');

describe('AIExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('executeQwenCLI', () => {
    it('dovrebbe eseguire comando Qwen con parametri base', async () => {
      const mockOutput = 'Qwen response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      const result = await executeQwenCLI({
        prompt: 'test prompt'
      });

      expect(result).toBe(mockOutput);
      expect(commandExecutor.executeCommand).toHaveBeenCalledWith(
        'qwen',
        expect.arrayContaining(['test prompt']),
        expect.any(Object)
      );
    });

    it('dovrebbe lanciare errore se prompt vuoto', async () => {
      await expect(executeQwenCLI({ prompt: '' })).rejects.toThrow(/prompt/i);
      await expect(executeQwenCLI({ prompt: '   ' })).rejects.toThrow(/prompt/i);
    });

    it('dovrebbe includere flag sandbox se specificato', async () => {
      const mockOutput = 'Qwen response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      await executeQwenCLI({
        prompt: 'test prompt',
        sandbox: true
      });

      const callArgs = vi.mocked(commandExecutor.executeCommand).mock.calls[0];
      expect(callArgs[1]).toContain('--sandbox');
    });

    it('dovrebbe includere flag yolo se specificato', async () => {
      const mockOutput = 'Qwen response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      await executeQwenCLI({
        prompt: 'test prompt',
        yolo: true
      });

      const callArgs = vi.mocked(commandExecutor.executeCommand).mock.calls[0];
      expect(callArgs[1]).toContain('--yolo');
    });

    it('dovrebbe includere model se specificato', async () => {
      const mockOutput = 'Qwen response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      await executeQwenCLI({
        prompt: 'test prompt',
        model: 'qwen-max'
      });

      const callArgs = vi.mocked(commandExecutor.executeCommand).mock.calls[0];
      expect(callArgs[1]).toContain('--model');
      expect(callArgs[1]).toContain('qwen-max');
    });
  });

  describe('executeGeminiCLI', () => {
    it('dovrebbe eseguire comando Gemini con parametri base', async () => {
      const mockOutput = 'Gemini response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      const result = await executeGeminiCLI({
        prompt: 'test prompt'
      });

      expect(result).toBe(mockOutput);
      expect(commandExecutor.executeCommand).toHaveBeenCalledWith(
        'gemini',
        expect.arrayContaining(['test prompt']),
        expect.any(Object)
      );
    });

    it('dovrebbe lanciare errore se prompt vuoto', async () => {
      await expect(executeGeminiCLI({ prompt: '' })).rejects.toThrow(/prompt/i);
    });

    it('dovrebbe includere model se specificato', async () => {
      const mockOutput = 'Gemini response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      await executeGeminiCLI({
        prompt: 'test prompt',
        model: 'gemini-2.0-flash-thinking-exp-01-21'
      });

      const callArgs = vi.mocked(commandExecutor.executeCommand).mock.calls[0];
      expect(callArgs[1]).toContain('-m');
      expect(callArgs[1]).toContain('gemini-2.0-flash-thinking-exp-01-21');
    });
  });

  describe('executeRovodevCLI', () => {
    it('dovrebbe eseguire comando Rovodev con parametri base', async () => {
      const mockOutput = 'Rovodev response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      const result = await executeRovodevCLI({
        prompt: 'test prompt'
      });

      expect(result).toBe(mockOutput);
      expect(commandExecutor.executeCommand).toHaveBeenCalledWith(
        'acli',
        expect.arrayContaining(['rovodev', 'test prompt']),
        expect.any(Object)
      );
    });

    it('dovrebbe lanciare errore se prompt vuoto', async () => {
      await expect(executeRovodevCLI({ prompt: '' })).rejects.toThrow(/prompt/i);
    });

    it('dovrebbe includere flag yolo se specificato', async () => {
      const mockOutput = 'Rovodev response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      await executeRovodevCLI({
        prompt: 'test prompt',
        yolo: true
      });

      const callArgs = vi.mocked(commandExecutor.executeCommand).mock.calls[0];
      expect(callArgs[1]).toContain('--yolo');
    });

    it('dovrebbe includere flag shadow se specificato', async () => {
      const mockOutput = 'Rovodev response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      await executeRovodevCLI({
        prompt: 'test prompt',
        shadow: true
      });

      const callArgs = vi.mocked(commandExecutor.executeCommand).mock.calls[0];
      expect(callArgs[1]).toContain('--shadow');
    });

    it('dovrebbe includere flag verbose se specificato', async () => {
      const mockOutput = 'Rovodev response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      await executeRovodevCLI({
        prompt: 'test prompt',
        verbose: true
      });

      const callArgs = vi.mocked(commandExecutor.executeCommand).mock.calls[0];
      expect(callArgs[1]).toContain('--verbose');
    });
  });

  describe('executeAIClient', () => {
    it('dovrebbe utilizzare Qwen backend', async () => {
      const mockOutput = 'Qwen response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      const result = await executeAIClient({
        backend: BACKENDS.QWEN,
        prompt: 'test prompt'
      });

      expect(result).toBe(mockOutput);
      expect(commandExecutor.executeCommand).toHaveBeenCalledWith(
        'qwen',
        expect.any(Array),
        expect.any(Object)
      );
    });

    it('dovrebbe utilizzare Gemini backend', async () => {
      const mockOutput = 'Gemini response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      const result = await executeAIClient({
        backend: BACKENDS.GEMINI,
        prompt: 'test prompt'
      });

      expect(result).toBe(mockOutput);
      expect(commandExecutor.executeCommand).toHaveBeenCalledWith(
        'gemini',
        expect.any(Array),
        expect.any(Object)
      );
    });

    it('dovrebbe utilizzare Rovodev backend', async () => {
      const mockOutput = 'Rovodev response';
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      const result = await executeAIClient({
        backend: BACKENDS.ROVODEV,
        prompt: 'test prompt'
      });

      expect(result).toBe(mockOutput);
      expect(commandExecutor.executeCommand).toHaveBeenCalledWith(
        'acli',
        expect.any(Array),
        expect.any(Object)
      );
    });

    it('dovrebbe lanciare errore per backend sconosciuto', async () => {
      await expect(
        executeAIClient({
          backend: 'unknown-backend',
          prompt: 'test prompt'
        })
      ).rejects.toThrow(/backend/i);
    });

    it('dovrebbe gestire errori di esecuzione', async () => {
      vi.spyOn(commandExecutor, 'executeCommand').mockRejectedValue(
        new Error('Command execution failed')
      );

      await expect(
        executeAIClient({
          backend: BACKENDS.QWEN,
          prompt: 'test prompt'
        })
      ).rejects.toThrow('Command execution failed');
    });
  });

  describe('Progress Callbacks', () => {
    it('dovrebbe chiamare onProgress durante esecuzione', async () => {
      const mockOutput = 'AI response';
      const progressCallback = vi.fn();
      
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue(mockOutput);

      await executeQwenCLI({
        prompt: 'test prompt',
        onProgress: progressCallback
      });

      expect(progressCallback).toHaveBeenCalled();
      expect(progressCallback).toHaveBeenCalledWith(expect.stringContaining('analysis'));
    });
  });
});
