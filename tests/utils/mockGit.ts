import { vi } from 'vitest';

export interface MockGitCommand {
  command: string;
  output: string;
  exitCode?: number;
}

export function mockGitCommand(command: string, output: string, exitCode: number = 0): any {
  return vi.fn().mockResolvedValue({
    exitCode,
    stdout: output,
    stderr: ''
  });
}

export function mockGitError(command: string, errorMessage: string): any {
  return vi.fn().mockRejectedValue(new Error(errorMessage));
}

export function createMockGitHelper() {
  return {
    getCurrentBranch: mockGitCommand('git branch --show-current', 'main'),
    getRecentCommits: mockGitCommand('git log', 'commit1\ncommit2\ncommit3'),
    getStagedDiff: mockGitCommand('git diff --cached', 'diff content'),
    getLastCommitInfo: mockGitCommand('git log -1', 'last commit info'),
    getRecentCommitsWithDiffs: mockGitCommand('git log -p', 'commits with diffs')
  };
}
