/**
 * Mock utilities for Git operations testing
 */

import { vi } from 'vitest';

export interface MockGitCommand {
  command: string;
  output: string;
  exitCode?: number;
}

/**
 * Mock git command with custom output
 */
export function mockGitCommand(command: string, output: string, exitCode = 0): void {
  vi.mock('../../src/utils/commandExecutor.js', async () => {
    const actual = await vi.importActual('../../src/utils/commandExecutor.js');
    return {
      ...actual,
      executeCommand: vi.fn().mockImplementation(async (cmd: string) => {
        if (cmd.includes(command)) {
          return { output, exitCode };
        }
        return { output: '', exitCode: 0 };
      })
    };
  });
}

/**
 * Mock multiple git commands
 */
export function mockGitCommands(commands: MockGitCommand[]): void {
  vi.mock('../../src/utils/commandExecutor.js', async () => {
    const actual = await vi.importActual('../../src/utils/commandExecutor.js');
    return {
      ...actual,
      executeCommand: vi.fn().mockImplementation(async (cmd: string) => {
        for (const mock of commands) {
          if (cmd.includes(mock.command)) {
            return { output: mock.output, exitCode: mock.exitCode || 0 };
          }
        }
        return { output: '', exitCode: 0 };
      })
    };
  });
}

/**
 * Mock git status output
 */
export function mockGitStatus(status: 'clean' | 'dirty' | 'untracked'): void {
  const outputs: Record<string, string> = {
    clean: 'nothing to commit, working tree clean',
    dirty: 'Changes not staged for commit:\n\tmodified:   src/index.ts',
    untracked: 'Untracked files:\n\tsrc/newfile.ts'
  };
  
  mockGitCommand('git status', outputs[status]);
}

/**
 * Mock git log output
 */
export function mockGitLog(commits: Array<{ hash: string; message: string; author: string }>): void {
  const output = commits.map(c => `${c.hash} ${c.message} (${c.author})`).join('\n');
  mockGitCommand('git log', output);
}

/**
 * Mock git diff output
 */
export function mockGitDiff(diff: string): void {
  mockGitCommand('git diff', diff);
}

/**
 * Mock git branch output
 */
export function mockGitBranch(branches: Array<{ name: string; current: boolean }>): void {
  const output = branches.map(b => `${b.current ? '* ' : '  '}${b.name}`).join('\n');
  mockGitCommand('git branch', output);
}

/**
 * Create a realistic git diff
 */
export function createMockGitDiff(file: string, additions: string[], deletions: string[]): string {
  const diff = [
    `diff --git a/${file} b/${file}`,
    `index abc1234..def5678 100644`,
    `--- a/${file}`,
    `+++ b/${file}`,
    '@@ -1,10 +1,12 @@',
    ...deletions.map(line => `-${line}`),
    ...additions.map(line => `+${line}`)
  ];
  return diff.join('\n');
}

/**
 * Mock git helper functions
 */
export function mockGitHelper(overrides: Partial<Record<string, any>> = {}): void {
  vi.mock('../../src/utils/gitHelper.js', async () => {
    const actual = await vi.importActual('../../src/utils/gitHelper.js');
    return {
      ...actual,
      getRecentCommitsWithDiffs: vi.fn().mockResolvedValue(overrides.getRecentCommitsWithDiffs || []),
      getStagedDiff: vi.fn().mockResolvedValue(overrides.getStagedDiff || ''),
      getCurrentBranch: vi.fn().mockResolvedValue(overrides.getCurrentBranch || 'main'),
      getGitStatus: vi.fn().mockResolvedValue(overrides.getGitStatus || { clean: true, files: [] })
    };
  });
}
