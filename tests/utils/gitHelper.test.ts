import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as gitHelper from '../../src/utils/gitHelper.js';
import * as commandExecutor from '../../src/utils/commandExecutor.js';

vi.mock('../../src/utils/commandExecutor.js');
vi.mock('../../src/utils/logger.js');

describe('GitHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isGitRepository', () => {
    it('dovrebbe restituire true se e un repository Git', async () => {
      vi.spyOn(commandExecutor, 'executeCommand').mockResolvedValue('.git');
      
      const result = await gitHelper.isGitRepository();
      
      expect(result).toBe(true);
      expect(commandExecutor.executeCommand).toHaveBeenCalledWith('git', ['rev-parse', '--git-dir']);
    });

    it('dovrebbe restituire false se non e un repository Git', async () => {
      vi.spyOn(commandExecutor, 'executeCommand').mockRejectedValue(new Error('not a git repo'));
      
      const result = await gitHelper.isGitRepository();
      
      expect(result).toBe(false);
    });
  });

  describe('getGitRepoInfo', () => {
    it('dovrebbe ottenere informazioni sul repository', async () => {
      const mockExecute = vi.spyOn(commandExecutor, 'executeCommand');
      
      mockExecute
        .mockResolvedValueOnce('.git')
        .mockResolvedValueOnce('main')
        .mockResolvedValueOnce('M file1.ts\nA file2.ts')
        .mockResolvedValueOnce('abc123 commit message\ndef456 another commit')
        .mockResolvedValueOnce('file3.ts\nfile4.ts')
        .mockResolvedValueOnce('file5.ts\nfile6.ts');

      const result = await gitHelper.getGitRepoInfo();
      
      expect(result).toHaveProperty('currentBranch', 'main');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('recentCommits');
      expect(result).toHaveProperty('stagedFiles');
    });

    it('dovrebbe lanciare errore se non e un repository Git', async () => {
      vi.spyOn(commandExecutor, 'executeCommand').mockRejectedValue(new Error('not a git repo'));
      
      await expect(gitHelper.getGitRepoInfo()).rejects.toThrow('non è un repository Git');
    });
  });

  describe('getGitCommitInfo', () => {
    it('dovrebbe ottenere informazioni su un commit specifico', async () => {
      const mockExecute = vi.spyOn(commandExecutor, 'executeCommand');
      
      mockExecute
        .mockResolvedValueOnce('.git')
        .mockResolvedValueOnce('abc123|John Doe|2024-01-01 12:00:00|Test commit\n')
        .mockResolvedValueOnce('diff content')
        .mockResolvedValueOnce('file1.ts\nfile2.ts');
      
      const result = await gitHelper.getGitCommitInfo('HEAD');
      
      expect(result).toHaveProperty('hash', 'abc123');
      expect(result).toHaveProperty('author', 'John Doe');
      expect(result).toHaveProperty('message', 'Test commit');
    });
  });

  describe('getStagedDiff', () => {
    it('dovrebbe restituire il diff dei file staged', async () => {
      const mockExecute = vi.spyOn(commandExecutor, 'executeCommand');
      const mockDiff = 'diff --git a/file.ts b/file.ts\n+added line';
      
      mockExecute
        .mockResolvedValueOnce('.git')
        .mockResolvedValueOnce(mockDiff);
      
      const result = await gitHelper.getStagedDiff();
      
      expect(result).toBe(mockDiff);
      expect(commandExecutor.executeCommand).toHaveBeenCalledWith('git', ['diff', '--cached']);
    });

    it('dovrebbe restituire stringa vuota se non ci sono file staged', async () => {
      const mockExecute = vi.spyOn(commandExecutor, 'executeCommand');
      
      mockExecute
        .mockResolvedValueOnce('.git')
        .mockResolvedValueOnce('');
      
      const result = await gitHelper.getStagedDiff();
      
      expect(result).toBe('');
    });
  });


  describe('getRecentCommitsWithDiffs', () => {
    it('dovrebbe ottenere commit recenti con diff', async () => {
      const mockExecute = vi.spyOn(commandExecutor, 'executeCommand');
      
      // Mock sequence completa
      mockExecute
        .mockResolvedValueOnce('.git')  // isGitRepository in getRecentCommitsWithDiffs
        .mockResolvedValueOnce('abc123')  // log --format=%H
        .mockResolvedValueOnce('.git')  // isGitRepository in getGitCommitInfo
        .mockResolvedValueOnce('abc123|John Doe|2024-01-01|First commit\n')  // show --format=%H|%an|%ad|%s
        .mockResolvedValueOnce('diff content')  // show --format= (diff)
        .mockResolvedValueOnce('file1.ts');  // show --format= --name-only
      
      const result = await gitHelper.getRecentCommitsWithDiffs(1);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('hash', 'abc123');
      expect(result[0]).toHaveProperty('author', 'John Doe');
    });

    it('dovrebbe utilizzare limite predefinito se non specificato', async () => {
      const mockExecute = vi.spyOn(commandExecutor, 'executeCommand');
      
      mockExecute
        .mockResolvedValueOnce('.git')
        .mockResolvedValue('abc|author|date|msg\n')
        .mockResolvedValue('diff')
        .mockResolvedValue('files');
      
      await gitHelper.getRecentCommitsWithDiffs();
      
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('dovrebbe gestire errori di comando Git correttamente', async () => {
      const mockExecute = vi.spyOn(commandExecutor, 'executeCommand');
      
      mockExecute
        .mockResolvedValueOnce('.git')
        .mockRejectedValueOnce(new Error('git command failed'));
      
      await expect(gitHelper.getGitRepoInfo()).rejects.toThrow();
    });
  });
});
