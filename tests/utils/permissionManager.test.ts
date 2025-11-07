import { describe, it, expect } from 'vitest';
import {
  AutonomyLevel,
  OperationType,
  checkPermission,
  assertPermission,
  FileOperations,
  GitOperations,
  createPermissionManager
} from '../../src/utils/permissionManager.js';

describe('PermissionManager', () => {
  describe('checkPermission', () => {
    it('dovrebbe permettere READ_FILE con READ_ONLY', () => {
      const result = checkPermission(AutonomyLevel.READ_ONLY, OperationType.READ_FILE);
      expect(result.allowed).toBe(true);
    });

    it('dovrebbe negare WRITE_FILE con READ_ONLY', () => {
      const result = checkPermission(AutonomyLevel.READ_ONLY, OperationType.WRITE_FILE);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('requires');
      expect(result.reason).toContain('low');
    });

    it('dovrebbe permettere WRITE_FILE con LOW', () => {
      const result = checkPermission(AutonomyLevel.LOW, OperationType.WRITE_FILE);
      expect(result.allowed).toBe(true);
    });

    it('dovrebbe negare GIT_COMMIT con LOW', () => {
      const result = checkPermission(AutonomyLevel.LOW, OperationType.GIT_COMMIT);
      expect(result.allowed).toBe(false);
    });

    it('dovrebbe permettere GIT_COMMIT con MEDIUM', () => {
      const result = checkPermission(AutonomyLevel.MEDIUM, OperationType.GIT_COMMIT);
      expect(result.allowed).toBe(true);
    });

    it('dovrebbe negare GIT_PUSH con MEDIUM', () => {
      const result = checkPermission(AutonomyLevel.MEDIUM, OperationType.GIT_PUSH);
      expect(result.allowed).toBe(false);
    });

    it('dovrebbe permettere GIT_PUSH con HIGH', () => {
      const result = checkPermission(AutonomyLevel.HIGH, OperationType.GIT_PUSH);
      expect(result.allowed).toBe(true);
    });

    it('dovrebbe permettere tutte le operazioni con HIGH', () => {
      const operations = Object.values(OperationType);
      operations.forEach(op => {
        const result = checkPermission(AutonomyLevel.HIGH, op);
        expect(result.allowed).toBe(true);
      });
    });
  });

  describe('assertPermission', () => {
    it('non dovrebbe lanciare errore se permesso concesso', () => {
      expect(() => {
        assertPermission(AutonomyLevel.READ_ONLY, OperationType.READ_FILE);
      }).not.toThrow();
    });

    it('dovrebbe lanciare errore se permesso negato', () => {
      expect(() => {
        assertPermission(AutonomyLevel.READ_ONLY, OperationType.WRITE_FILE);
      }).toThrow(/requires.*low/);
    });

    it('dovrebbe includere contesto nel messaggio di errore', () => {
      expect(() => {
        assertPermission(AutonomyLevel.READ_ONLY, OperationType.WRITE_FILE, 'test-file.txt');
      }).toThrow(/test-file\.txt/);
    });
  });

  describe('FileOperations', () => {
    it('dovrebbe permettere canRead con READ_ONLY', () => {
      const ops = new FileOperations(AutonomyLevel.READ_ONLY);
      expect(ops.canRead()).toBe(true);
    });

    it('dovrebbe negare canWrite con READ_ONLY', () => {
      const ops = new FileOperations(AutonomyLevel.READ_ONLY);
      expect(ops.canWrite()).toBe(false);
    });

    it('dovrebbe permettere canWrite con LOW', () => {
      const ops = new FileOperations(AutonomyLevel.LOW);
      expect(ops.canWrite()).toBe(true);
    });

    it('assertWrite dovrebbe lanciare con READ_ONLY', () => {
      const ops = new FileOperations(AutonomyLevel.READ_ONLY);
      expect(() => ops.assertWrite('test.txt')).toThrow();
    });
  });

  describe('GitOperations', () => {
    it('dovrebbe permettere canRead con READ_ONLY', () => {
      const ops = new GitOperations(AutonomyLevel.READ_ONLY);
      expect(ops.canRead()).toBe(true);
    });

    it('dovrebbe negare canCommit con READ_ONLY', () => {
      const ops = new GitOperations(AutonomyLevel.READ_ONLY);
      expect(ops.canCommit()).toBe(false);
    });

    it('dovrebbe negare canCommit con LOW', () => {
      const ops = new GitOperations(AutonomyLevel.LOW);
      expect(ops.canCommit()).toBe(false);
    });

    it('dovrebbe permettere canCommit con MEDIUM', () => {
      const ops = new GitOperations(AutonomyLevel.MEDIUM);
      expect(ops.canCommit()).toBe(true);
    });

    it('dovrebbe negare canPush con MEDIUM', () => {
      const ops = new GitOperations(AutonomyLevel.MEDIUM);
      expect(ops.canPush()).toBe(false);
    });

    it('dovrebbe permettere canPush con HIGH', () => {
      const ops = new GitOperations(AutonomyLevel.HIGH);
      expect(ops.canPush()).toBe(true);
    });
  });

  describe('createPermissionManager', () => {
    it('dovrebbe creare manager con livello di default READ_ONLY', () => {
      const manager = createPermissionManager();
      expect(manager.file.canRead()).toBe(true);
      expect(manager.file.canWrite()).toBe(false);
    });

    it('dovrebbe creare manager con livello specificato', () => {
      const manager = createPermissionManager(AutonomyLevel.MEDIUM);
      expect(manager.git.canCommit()).toBe(true);
      expect(manager.git.canPush()).toBe(false);
    });

    it('dovrebbe creare manager con HIGH e permettere tutto', () => {
      const manager = createPermissionManager(AutonomyLevel.HIGH);
      expect(manager.file.canRead()).toBe(true);
      expect(manager.file.canWrite()).toBe(true);
      expect(manager.git.canRead()).toBe(true);
      expect(manager.git.canCommit()).toBe(true);
      expect(manager.git.canPush()).toBe(true);
    });
  });

  describe('Permission Escalation', () => {
    it('livello superiore dovrebbe includere tutti i permessi inferiori', () => {
      const levels = [
        AutonomyLevel.READ_ONLY,
        AutonomyLevel.LOW,
        AutonomyLevel.MEDIUM,
        AutonomyLevel.HIGH
      ];

      for (let i = 1; i < levels.length; i++) {
        const lowerLevel = levels[i - 1];
        const higherLevel = levels[i];

        Object.values(OperationType).forEach(op => {
          const lowerResult = checkPermission(lowerLevel, op);
          const higherResult = checkPermission(higherLevel, op);

          if (lowerResult.allowed) {
            expect(higherResult.allowed).toBe(true);
          }
        });
      }
    });
  });
});
