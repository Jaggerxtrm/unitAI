/**
 * Mock utilities for AI backend testing
 */

import { vi } from 'vitest';

export interface MockAIResponse {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * Mock Qwen CLI response
 */
export function mockQwenResponse(response: string, shouldFail = false): void {
  const responseRef = response;
  const shouldFailRef = shouldFail;

  vi.doMock('../../src/utils/aiExecutor.js', async () => {
    const actual = await vi.importActual('../../src/utils/aiExecutor.js');
    return {
      ...actual,
      executeQwenCLI: vi.fn().mockResolvedValue(shouldFailRef ? '' : responseRef)
    };
  });
}

/**
 * Mock Gemini CLI response
 */
export function mockGeminiResponse(response: string, shouldFail = false): void {
  const responseRef = response;
  const shouldFailRef = shouldFail;

  vi.doMock('../../src/utils/aiExecutor.js', async () => {
    const actual = await vi.importActual('../../src/utils/aiExecutor.js');
    return {
      ...actual,
      executeGeminiCLI: vi.fn().mockResolvedValue(shouldFailRef ? '' : responseRef)
    };
  });
}

/**
 * Mock Rovodev CLI response
 */
export function mockRovodevResponse(response: string, shouldFail = false): void {
  const responseRef = response;
  const shouldFailRef = shouldFail;

  vi.doMock('../../src/utils/aiExecutor.js', async () => {
    const actual = await vi.importActual('../../src/utils/aiExecutor.js');
    return {
      ...actual,
      executeRovodevCLI: vi.fn().mockResolvedValue(shouldFailRef ? '' : responseRef)
    };
  });
}

/**
 * Mock AI executor with custom backend responses
 */
export function mockAIExecutor(responses: Record<string, string>): void {
  const responsesRef = { ...responses };

  vi.doMock('../../src/utils/aiExecutor.js', async () => {
    const actual = await vi.importActual('../../src/utils/aiExecutor.js');
    return {
      ...actual,
      executeAIClient: vi.fn().mockImplementation(async (config: any) => {
        const backend = config.backend;
        if (responsesRef[backend]) {
          return responsesRef[backend];
        }
        throw new Error(`No mock response for backend: ${backend}`);
      })
    };
  });
}

/**
 * Create a mock AI response with realistic formatting
 */
export function createMockAIResponse(content: string, metadata?: Record<string, any>): string {
  const response = {
    content,
    timestamp: new Date().toISOString(),
    metadata: metadata || {}
  };
  return JSON.stringify(response, null, 2);
}

/**
 * Mock AI executor that simulates delays
 */
export function mockAIExecutorWithDelay(responses: Record<string, string>, delayMs = 100): void {
  const responsesRef = { ...responses };
  const delayMsRef = delayMs;

  vi.doMock('../../src/utils/aiExecutor.js', async () => {
    const actual = await vi.importActual('../../src/utils/aiExecutor.js');
    return {
      ...actual,
      executeAIClient: vi.fn().mockImplementation(async (config: any) => {
        await new Promise(resolve => setTimeout(resolve, delayMsRef));
        const backend = config.backend;
        if (responsesRef[backend]) {
          return responsesRef[backend];
        }
        throw new Error(`No mock response for backend: ${backend}`);
      })
    };
  });
}

/**
 * Mock AI executor that fails after N calls
 */
export function mockAIExecutorWithFailure(
  successResponse: string,
  failAfterCalls: number
): void {
  const successResponseRef = successResponse;
  const failAfterCallsRef = failAfterCalls;
  let callCount = 0;

  vi.doMock('../../src/utils/aiExecutor.js', async () => {
    const actual = await vi.importActual('../../src/utils/aiExecutor.js');
    return {
      ...actual,
      executeAIClient: vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount > failAfterCallsRef) {
          throw new Error('AI backend failure (simulated)');
        }
        return successResponseRef;
      })
    };
  });
}
