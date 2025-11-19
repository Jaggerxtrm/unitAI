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
let registeredCommands: MockGitCommand[] = [];

function updateCommandMock(): void {
  const commandsSnapshot = [...registeredCommands];
  vi.doMock('../../src/utils/commandExecutor.js', () => ({
    executeCommand: vi.fn().mockImplementation(async (cmd: string, args: string[] = []) => {
      const invoked = [cmd, ...args].join(' ').trim();
      for (const mock of commandsSnapshot) {
        if (invoked.includes(mock.command)) {
          if (mock.exitCode && mock.exitCode !== 0) {
            throw new Error(`Command failed with exit code ${mock.exitCode}`);
          }
          return mock.output;
        }
      }
      return '';
    })
  }));
}

function registerMockCommand(mock: MockGitCommand): void {
  registeredCommands = registeredCommands.filter(entry => entry.command !== mock.command);
  registeredCommands.push(mock);
  updateCommandMock();
}

export function resetMockGitCommands(): void {
  registeredCommands = [];
  updateCommandMock();
}

export function mockGitCommand(command: string, output: string, exitCode = 0): void {
  registerMockCommand({ command, output, exitCode });
}

/**
 * Mock multiple git commands
 */
export function mockGitCommands(commands: MockGitCommand[]): void {
  for (const mock of commands) {
    registerMockCommand(mock);
  }
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
  // Store the overrides in a local variable to ensure proper closure
  const overridesRef = { ...overrides };

  vi.doMock('../../src/utils/gitHelper.js', async () => {
    const actual = await vi.importActual('../../src/utils/gitHelper.js');
    return {
      ...actual,
      getRecentCommitsWithDiffs: vi.fn().mockResolvedValue(overridesRef.getRecentCommitsWithDiffs || []),
      getStagedDiff: vi.fn().mockResolvedValue(overridesRef.getStagedDiff || ''),
      getCurrentBranch: vi.fn().mockResolvedValue(overridesRef.getCurrentBranch || 'main'),
      getGitStatus: vi.fn().mockResolvedValue(overridesRef.getGitStatus || { clean: true, files: [] })
    };
  });
}
