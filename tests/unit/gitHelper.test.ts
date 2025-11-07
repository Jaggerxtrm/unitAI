/**
 * Unit tests for Git Helper
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockGitCommand, mockGitCommands, createMockGitDiff } from '../utils/mockGit.js';

describe('GitHelper', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isGitRepository', () => {
    it('should return true when in git repository', async () => {
      mockGitCommand('rev-parse --git-dir', '.git');
      const { isGitRepository } = await import('../../src/utils/gitHelper.js');
      const result = await isGitRepository();
      expect(result).toBe(true);
    });

    it('should return false when not in git repository', async () => {
      mockGitCommand('rev-parse --git-dir', '', 128);
      const { isGitRepository } = await import('../../src/utils/gitHelper.js');
      const result = await isGitRepository();
      expect(result).toBe(false);
    });
  });

  describe('getGitRepoInfo', () => {
    it('should return complete repository information', async () => {
      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { command: 'branch --show-current', output: 'main' },
        { command: 'status --porcelain', output: '' },
        { command: 'log --oneline -5', output: 'abc123 Commit message\ndef456 Another commit' },
        { command: 'diff --cached --name-only', output: 'src/index.ts' },
        { command: 'diff --name-only', output: 'README.md' }
      ]);

      const { getGitRepoInfo } = await import('../../src/utils/gitHelper.js');
      const info = await getGitRepoInfo();

      expect(info.currentBranch).toBe('main');
      expect(info.recentCommits).toHaveLength(2);
      expect(info.stagedFiles).toContain('src/index.ts');
      expect(info.modifiedFiles).toContain('README.md');
    });

    it('should throw error when not in git repository', async () => {
      mockGitCommand('rev-parse --git-dir', '', 128);
      
      const { getGitRepoInfo } = await import('../../src/utils/gitHelper.js');
      await expect(getGitRepoInfo()).rejects.toThrow('non è un repository Git');
    });

    it('should handle empty staged and modified files', async () => {
      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { command: 'branch --show-current', output: 'main' },
        { command: 'status --porcelain', output: '' },
        { command: 'log --oneline -5', output: 'abc123 Commit' },
        { command: 'diff --cached --name-only', output: '' },
        { command: 'diff --name-only', output: '' }
      ]);

      const { getGitRepoInfo } = await import('../../src/utils/gitHelper.js');
      const info = await getGitRepoInfo();

      expect(info.stagedFiles).toEqual([]);
      expect(info.modifiedFiles).toEqual([]);
    });
  });

  describe('getGitCommitInfo', () => {
    it('should return commit information for HEAD', async () => {
      const mockDiff = createMockGitDiff(
        'src/index.ts',
        ['+  console.log("hello");'],
        ['-  console.log("goodbye");']
      );

      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { 
          command: 'show --format=%H|%an|%ad|%s --date=iso HEAD',
          output: 'abc123|John Doe|2024-01-15 10:30:00 +0000|Fix bug\n' + mockDiff
        },
        { command: 'show --format= HEAD', output: mockDiff },
        { command: 'show --format= --name-only HEAD', output: 'src/index.ts' }
      ]);

      const { getGitCommitInfo } = await import('../../src/utils/gitHelper.js');
      const info = await getGitCommitInfo('HEAD');

      expect(info.hash).toBe('abc123');
      expect(info.author).toBe('John Doe');
      expect(info.message).toBe('Fix bug');
      expect(info.files).toContain('src/index.ts');
      expect(info.diff).toContain('+  console.log("hello");');
    });

    it('should throw error when not in git repository', async () => {
      mockGitCommand('rev-parse --git-dir', '', 128);
      
      const { getGitCommitInfo } = await import('../../src/utils/gitHelper.js');
      await expect(getGitCommitInfo()).rejects.toThrow('non è un repository Git');
    });
  });

  describe('getRecentCommitsWithDiffs', () => {
    it('should return multiple commits with diffs', async () => {
      const mockDiff1 = createMockGitDiff('file1.ts', ['+line1'], ['-line0']);
      const mockDiff2 = createMockGitDiff('file2.ts', ['+line2'], ['-line1']);

      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { command: 'log --oneline', output: 'abc123 Commit 1\ndef456 Commit 2' },
        { 
          command: 'show --format=%H|%an|%ad|%s --date=iso abc123',
          output: 'abc123|Author1|2024-01-15 10:00:00 +0000|Commit 1\n' + mockDiff1
        },
        { command: 'show --format= abc123', output: mockDiff1 },
        { command: 'show --format= --name-only abc123', output: 'file1.ts' },
        {
          command: 'show --format=%H|%an|%ad|%s --date=iso def456',
          output: 'def456|Author2|2024-01-14 10:00:00 +0000|Commit 2\n' + mockDiff2
        },
        { command: 'show --format= def456', output: mockDiff2 },
        { command: 'show --format= --name-only def456', output: 'file2.ts' }
      ]);

      const { getRecentCommitsWithDiffs } = await import('../../src/utils/gitHelper.js');
      const commits = await getRecentCommitsWithDiffs(2);

      expect(commits).toHaveLength(2);
      expect(commits[0].hash).toBe('abc123');
      expect(commits[1].hash).toBe('def456');
    });
  });

  describe('getStagedDiff', () => {
    it('should return staged changes diff', async () => {
      const mockDiff = createMockGitDiff('src/test.ts', ['+new code'], ['-old code']);
      
      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { command: 'diff --cached', output: mockDiff }
      ]);

      const { getStagedDiff } = await import('../../src/utils/gitHelper.js');
      const diff = await getStagedDiff();

      expect(diff).toContain('+new code');
      expect(diff).toContain('-old code');
    });

    it('should return empty string when no staged changes', async () => {
      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { command: 'diff --cached', output: '' }
      ]);

      const { getStagedDiff } = await import('../../src/utils/gitHelper.js');
      const diff = await getStagedDiff();

      expect(diff).toBe('');
    });
  });

  describe('getCurrentBranch', () => {
    it('should return current branch name', async () => {
      mockGitCommands([
        { command: 'rev-parse --git-dir', output: '.git' },
        { command: 'branch --show-current', output: 'feature/new-feature' }
      ]);

      const { getCurrentBranch } = await import('../../src/utils/gitHelper.js');
      const branch = await getCurrentBranch();

      expect(branch).toBe('feature/new-feature');
    });
  });

  describe('checkCLIAvailability', () => {
    it('should detect available git command', async () => {
      mockGitCommand('--version', 'git version 2.40.0');

      const { checkCLIAvailability } = await import('../../src/utils/gitHelper.js');
      const available = await checkCLIAvailability();

      expect(available).toBe(true);
    });

    it('should detect unavailable git command', async () => {
      mockGitCommand('--version', '', 127);

      const { checkCLIAvailability } = await import('../../src/utils/gitHelper.js');
      const available = await checkCLIAvailability();

      expect(available).toBe(false);
    });
  });
});
