/**
 * General test helper utilities
 */

import { vi } from 'vitest';
import type { AutonomyLevel } from '../../src/utils/permissionManager.js';

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Create a mock progress callback for testing
 */
export function createMockProgressCallback(): {
  callback: (message: string) => void;
  messages: string[];
} {
  const messages: string[] = [];
  const callback = vi.fn((message: string) => {
    messages.push(message);
  });
  
  return { callback, messages };
}

/**
 * Create mock workflow params
 */
export function createMockWorkflowParams(
  overrides: Partial<{
    autonomyLevel: AutonomyLevel;
    [key: string]: any;
  }> = {}
): any {
  return {
    autonomyLevel: 'read-only' as AutonomyLevel,
    ...overrides
  };
}

/**
 * Simulate file system operations
 */
export function mockFileSystem(files: Record<string, string>): void {
  vi.mock('fs', async () => {
    const actual = await vi.importActual('fs');
    return {
      ...actual,
      readFileSync: vi.fn((path: string) => {
        if (files[path]) {
          return files[path];
        }
        throw new Error(`File not found: ${path}`);
      }),
      existsSync: vi.fn((path: string) => path in files),
      promises: {
        readFile: vi.fn(async (path: string) => {
          if (files[path]) {
            return files[path];
          }
          throw new Error(`File not found: ${path}`);
        })
      }
    };
  });
}

/**
 * Create a test timeout promise
 */
export function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Test timeout after ${ms}ms`)), ms);
  });
}

/**
 * Mock console methods to capture output
 */
export function mockConsole(): {
  log: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  restore: () => void;
} {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  const log = vi.fn();
  const error = vi.fn();
  const warn = vi.fn();
  
  console.log = log;
  console.error = error;
  console.warn = warn;
  
  return {
    log,
    error,
    warn,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  };
}

/**
 * Generate a random test ID
 */
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Create mock date for consistent testing
 */
export function mockDate(isoString: string): void {
  const mockDate = new Date(isoString);
  vi.setSystemTime(mockDate);
}

/**
 * Restore real date after mocking
 */
export function restoreDate(): void {
  vi.useRealTimers();
}
