import { vi } from 'vitest';

export interface MockAIResponse {
  success: boolean;
  output: string;
  error?: string;
}

export function mockQwenResponse(response: string): any {
  return vi.fn().mockResolvedValue({
    success: true,
    output: response
  });
}

export function mockGeminiResponse(response: string): any {
  return vi.fn().mockResolvedValue({
    success: true,
    output: response
  });
}

export function mockRovodevResponse(response: string): any {
  return vi.fn().mockResolvedValue({
    success: true,
    output: response
  });
}

export function mockAIError(errorMessage: string): any {
  return vi.fn().mockRejectedValue(new Error(errorMessage));
}

export function mockAITimeout(): any {
  return vi.fn().mockImplementation(() => 
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 1000)
    )
  );
}

export function createMockAIExecutor(defaultResponse: string = 'Mock AI response') {
  return {
    executeQwenCLI: mockQwenResponse(defaultResponse),
    executeGeminiCLI: mockGeminiResponse(defaultResponse),
    executeRovodevCLI: mockRovodevResponse(defaultResponse)
  };
}
