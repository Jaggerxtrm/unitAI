/**
 * Unit tests for Permission Manager
 */

import { describe, it, expect } from 'vitest';
import {
  AutonomyLevel,
  OperationType,
  checkPermission,
  assertPermission,
  getDefaultAutonomyLevel,
  isValidAutonomyLevel,
  getAllowedOperations,
  GitOperations,
  FileOperations,
  PermissionManager,
  createPermissionManager
} from '../../src/utils/permissionManager.js';

describe('PermissionManager', () => {
  describe('checkPermission', () => {
    it('should allow READ_FILE at READ_ONLY level', () => {
      const result = checkPermission(AutonomyLevel.READ_ONLY, OperationType.READ_FILE);
      expect(result.allowed).toBe(true);
      expect(result.currentLevel).toBe(AutonomyLevel.READ_ONLY);
      expect(result.requiredLevel).toBe(AutonomyLevel.READ_ONLY);
    });

    it('should allow GIT_READ at READ_ONLY level', () => {
      const result = checkPermission(AutonomyLevel.READ_ONLY, OperationType.GIT_READ);
      expect(result.allowed).toBe(true);
    });

    it('should deny WRITE_FILE at READ_ONLY level', () => {
      const result = checkPermission(AutonomyLevel.READ_ONLY, OperationType.WRITE_FILE);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("requires 'low'");
      expect(result.requiredLevel).toBe(AutonomyLevel.LOW);
    });

    it('should allow WRITE_FILE at LOW level', () => {
      const result = checkPermission(AutonomyLevel.LOW, OperationType.WRITE_FILE);
      expect(result.allowed).toBe(true);
    });

    it('should deny GIT_COMMIT at LOW level', () => {
      const result = checkPermission(AutonomyLevel.LOW, OperationType.GIT_COMMIT);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("requires 'medium'");
    });

    it('should allow GIT_COMMIT at MEDIUM level', () => {
      const result = checkPermission(AutonomyLevel.MEDIUM, OperationType.GIT_COMMIT);
      expect(result.allowed).toBe(true);
    });

    it('should allow GIT_BRANCH at MEDIUM level', () => {
      const result = checkPermission(AutonomyLevel.MEDIUM, OperationType.GIT_BRANCH);
      expect(result.allowed).toBe(true);
    });

    it('should deny GIT_PUSH at MEDIUM level', () => {
      const result = checkPermission(AutonomyLevel.MEDIUM, OperationType.GIT_PUSH);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("requires 'high'");
    });

    it('should allow GIT_PUSH at HIGH level', () => {
      const result = checkPermission(AutonomyLevel.HIGH, OperationType.GIT_PUSH);
      expect(result.allowed).toBe(true);
    });

    it('should allow EXTERNAL_API at HIGH level', () => {
      const result = checkPermission(AutonomyLevel.HIGH, OperationType.EXTERNAL_API);
      expect(result.allowed).toBe(true);
    });

    it('should deny EXTERNAL_API at MEDIUM level', () => {
      const result = checkPermission(AutonomyLevel.MEDIUM, OperationType.EXTERNAL_API);
      expect(result.allowed).toBe(false);
    });
  });

  describe('assertPermission', () => {
    it('should not throw when permission is granted', () => {
      expect(() => {
        assertPermission(AutonomyLevel.HIGH, OperationType.GIT_PUSH);
      }).not.toThrow();
    });

    it('should throw when permission is denied', () => {
      expect(() => {
        assertPermission(AutonomyLevel.LOW, OperationType.GIT_PUSH);
      }).toThrow(/Permission denied/);
    });

    it('should include context in error message', () => {
      expect(() => {
        assertPermission(AutonomyLevel.LOW, OperationType.GIT_PUSH, 'pushing to remote');
      }).toThrow(/pushing to remote/);
    });

    it('should suggest required level in error', () => {
      expect(() => {
        assertPermission(AutonomyLevel.LOW, OperationType.GIT_PUSH);
      }).toThrow(/Increase autonomy level to 'high'/);
    });
  });

  describe('getDefaultAutonomyLevel', () => {
    it('should return READ_ONLY as default', () => {
      expect(getDefaultAutonomyLevel()).toBe(AutonomyLevel.READ_ONLY);
    });
  });

  describe('isValidAutonomyLevel', () => {
    it('should return true for valid levels', () => {
      expect(isValidAutonomyLevel('read-only')).toBe(true);
      expect(isValidAutonomyLevel('low')).toBe(true);
      expect(isValidAutonomyLevel('medium')).toBe(true);
      expect(isValidAutonomyLevel('high')).toBe(true);
    });

    it('should return false for invalid levels', () => {
      expect(isValidAutonomyLevel('invalid')).toBe(false);
      expect(isValidAutonomyLevel('super-high')).toBe(false);
      expect(isValidAutonomyLevel('')).toBe(false);
    });
  });

  describe('getAllowedOperations', () => {
    it('should return only read operations for READ_ONLY', () => {
      const allowed = getAllowedOperations(AutonomyLevel.READ_ONLY);
      expect(allowed).toContain(OperationType.READ_FILE);
      expect(allowed).toContain(OperationType.GIT_READ);
      expect(allowed).toContain(OperationType.MCP_CALL);
      expect(allowed).not.toContain(OperationType.WRITE_FILE);
      expect(allowed).not.toContain(OperationType.GIT_COMMIT);
    });

    it('should include write operations for LOW', () => {
      const allowed = getAllowedOperations(AutonomyLevel.LOW);
      expect(allowed).toContain(OperationType.READ_FILE);
      expect(allowed).toContain(OperationType.WRITE_FILE);
      expect(allowed).not.toContain(OperationType.GIT_COMMIT);
    });

    it('should include git operations for MEDIUM', () => {
      const allowed = getAllowedOperations(AutonomyLevel.MEDIUM);
      expect(allowed).toContain(OperationType.GIT_COMMIT);
      expect(allowed).toContain(OperationType.GIT_BRANCH);
      expect(allowed).toContain(OperationType.INSTALL_DEPENDENCY);
      expect(allowed).not.toContain(OperationType.GIT_PUSH);
    });

    it('should include all operations for HIGH', () => {
      const allowed = getAllowedOperations(AutonomyLevel.HIGH);
      expect(allowed).toContain(OperationType.GIT_PUSH);
      expect(allowed).toContain(OperationType.EXTERNAL_API);
      expect(allowed.length).toBe(Object.keys(OperationType).length);
    });
  });

  describe('GitOperations', () => {
    it('should allow read at READ_ONLY level', () => {
      const git = new GitOperations(AutonomyLevel.READ_ONLY);
      expect(git.canRead()).toBe(true);
    });

    it('should deny commit at READ_ONLY level', () => {
      const git = new GitOperations(AutonomyLevel.READ_ONLY);
      expect(git.canCommit()).toBe(false);
    });

    it('should allow commit at MEDIUM level', () => {
      const git = new GitOperations(AutonomyLevel.MEDIUM);
      expect(git.canCommit()).toBe(true);
    });

    it('should deny push at MEDIUM level', () => {
      const git = new GitOperations(AutonomyLevel.MEDIUM);
      expect(git.canPush()).toBe(false);
    });

    it('should allow push at HIGH level', () => {
      const git = new GitOperations(AutonomyLevel.HIGH);
      expect(git.canPush()).toBe(true);
    });

    it('should throw on assertCommit when denied', () => {
      const git = new GitOperations(AutonomyLevel.LOW);
      expect(() => git.assertCommit()).toThrow(/Permission denied/);
    });

    it('should not throw on assertCommit when allowed', () => {
      const git = new GitOperations(AutonomyLevel.MEDIUM);
      expect(() => git.assertCommit()).not.toThrow();
    });

    it('should include context in assertPush error', () => {
      const git = new GitOperations(AutonomyLevel.MEDIUM);
      expect(() => git.assertPush('deploying to production')).toThrow(/deploying to production/);
    });
  });

  describe('FileOperations', () => {
    it('should allow read at READ_ONLY level', () => {
      const file = new FileOperations(AutonomyLevel.READ_ONLY);
      expect(file.canRead()).toBe(true);
    });

    it('should deny write at READ_ONLY level', () => {
      const file = new FileOperations(AutonomyLevel.READ_ONLY);
      expect(file.canWrite()).toBe(false);
    });

    it('should allow write at LOW level', () => {
      const file = new FileOperations(AutonomyLevel.LOW);
      expect(file.canWrite()).toBe(true);
    });

    it('should throw on assertWrite when denied', () => {
      const file = new FileOperations(AutonomyLevel.READ_ONLY);
      expect(() => file.assertWrite()).toThrow(/Permission denied/);
    });

    it('should not throw on assertWrite when allowed', () => {
      const file = new FileOperations(AutonomyLevel.LOW);
      expect(() => file.assertWrite()).not.toThrow();
    });
  });

  describe('PermissionManager', () => {
    it('should initialize with READ_ONLY by default', () => {
      const pm = new PermissionManager();
      expect(pm.getLevel()).toBe(AutonomyLevel.READ_ONLY);
    });

    it('should initialize with specified level', () => {
      const pm = new PermissionManager(AutonomyLevel.MEDIUM);
      expect(pm.getLevel()).toBe(AutonomyLevel.MEDIUM);
    });

    it('should provide git operations', () => {
      const pm = new PermissionManager(AutonomyLevel.MEDIUM);
      expect(pm.git).toBeInstanceOf(GitOperations);
      expect(pm.git.canCommit()).toBe(true);
    });

    it('should provide file operations', () => {
      const pm = new PermissionManager(AutonomyLevel.LOW);
      expect(pm.file).toBeInstanceOf(FileOperations);
      expect(pm.file.canWrite()).toBe(true);
    });

    it('should check permissions correctly', () => {
      const pm = new PermissionManager(AutonomyLevel.MEDIUM);
      const result = pm.check(OperationType.GIT_COMMIT);
      expect(result.allowed).toBe(true);
    });

    it('should assert permissions correctly', () => {
      const pm = new PermissionManager(AutonomyLevel.MEDIUM);
      expect(() => pm.assert(OperationType.GIT_COMMIT)).not.toThrow();
      expect(() => pm.assert(OperationType.GIT_PUSH)).toThrow();
    });

    it('should return correct allowed operations', () => {
      const pm = new PermissionManager(AutonomyLevel.LOW);
      const allowed = pm.getAllowedOperations();
      expect(allowed).toContain(OperationType.WRITE_FILE);
      expect(allowed).not.toContain(OperationType.GIT_COMMIT);
    });
  });

  describe('createPermissionManager', () => {
    it('should create manager with default level', () => {
      const pm = createPermissionManager();
      expect(pm.getLevel()).toBe(AutonomyLevel.READ_ONLY);
    });

    it('should create manager with specified level', () => {
      const pm = createPermissionManager(AutonomyLevel.HIGH);
      expect(pm.getLevel()).toBe(AutonomyLevel.HIGH);
    });
  });

  describe('Permission hierarchy', () => {
    it('should respect level hierarchy for all operations', () => {
      const levels = [
        AutonomyLevel.READ_ONLY,
        AutonomyLevel.LOW,
        AutonomyLevel.MEDIUM,
        AutonomyLevel.HIGH
      ];

      for (let i = 0; i < levels.length; i++) {
        const currentLevel = levels[i];
        const operations = getAllowedOperations(currentLevel);

        // Higher levels should have all permissions of lower levels
        for (let j = 0; j < i; j++) {
          const lowerLevelOps = getAllowedOperations(levels[j]);
          lowerLevelOps.forEach(op => {
            expect(operations).toContain(op);
          });
        }
      }
    });
  });
});
