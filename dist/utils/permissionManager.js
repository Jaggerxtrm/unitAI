/**
 * Permission Manager for Unified AI MCP Tool
 *
 * Implements a granular permission system inspired by Factory Droid's autonomy levels.
 * Allows workflows to execute operations safely based on configured autonomy levels.
 *
 * @module permissionManager
 */
import { auditTrail } from './auditTrail.js';
/**
 * Permission levels for autonomous operations
 *
 * - READ_ONLY: Only read operations (git status, git diff, file reads)
 * - LOW: File modifications within project
 * - MEDIUM: Local Git operations (commit, branch) and dependency management
 * - HIGH: External operations (git push, external APIs)
 */
export var AutonomyLevel;
(function (AutonomyLevel) {
    AutonomyLevel["READ_ONLY"] = "read-only";
    AutonomyLevel["LOW"] = "low";
    AutonomyLevel["MEDIUM"] = "medium";
    AutonomyLevel["HIGH"] = "high";
})(AutonomyLevel || (AutonomyLevel = {}));
/**
 * Operation categories requiring permission checks
 */
export var OperationType;
(function (OperationType) {
    OperationType["READ_FILE"] = "read_file";
    OperationType["WRITE_FILE"] = "write_file";
    OperationType["GIT_READ"] = "git_read";
    OperationType["GIT_COMMIT"] = "git_commit";
    OperationType["GIT_PUSH"] = "git_push";
    OperationType["GIT_BRANCH"] = "git_branch";
    OperationType["INSTALL_DEPENDENCY"] = "install_dependency";
    OperationType["EXECUTE_COMMAND"] = "execute_command";
    OperationType["EXTERNAL_API"] = "external_api";
    OperationType["MCP_CALL"] = "mcp_call";
})(OperationType || (OperationType = {}));
/**
 * Permission matrix mapping operations to required autonomy levels
 */
const PERMISSION_MATRIX = {
    [OperationType.READ_FILE]: AutonomyLevel.READ_ONLY,
    [OperationType.GIT_READ]: AutonomyLevel.READ_ONLY,
    [OperationType.MCP_CALL]: AutonomyLevel.READ_ONLY, // MCP calls default to read-only
    [OperationType.WRITE_FILE]: AutonomyLevel.LOW,
    [OperationType.EXECUTE_COMMAND]: AutonomyLevel.MEDIUM,
    [OperationType.GIT_COMMIT]: AutonomyLevel.MEDIUM,
    [OperationType.GIT_BRANCH]: AutonomyLevel.MEDIUM,
    [OperationType.INSTALL_DEPENDENCY]: AutonomyLevel.MEDIUM,
    [OperationType.GIT_PUSH]: AutonomyLevel.HIGH,
    [OperationType.EXTERNAL_API]: AutonomyLevel.HIGH
};
/**
 * Hierarchy of autonomy levels (ordered from least to most permissive)
 */
const LEVEL_HIERARCHY = [
    AutonomyLevel.READ_ONLY,
    AutonomyLevel.LOW,
    AutonomyLevel.MEDIUM,
    AutonomyLevel.HIGH
];
/**
 * Validates if an operation is allowed at the given autonomy level
 *
 * @param currentLevel - Current autonomy level
 * @param operation - Operation type to validate
 * @returns Permission result with allowed status and reason if denied
 *
 * @example
 * ```typescript
 * const result = checkPermission(AutonomyLevel.LOW, OperationType.GIT_PUSH);
 * if (!result.allowed) {
 *   console.error(result.reason);
 * }
 * ```
 */
export function checkPermission(currentLevel, operation) {
    const requiredLevel = PERMISSION_MATRIX[operation];
    const currentIndex = LEVEL_HIERARCHY.indexOf(currentLevel);
    const requiredIndex = LEVEL_HIERARCHY.indexOf(requiredLevel);
    if (currentIndex >= requiredIndex) {
        return {
            allowed: true,
            currentLevel,
            requiredLevel
        };
    }
    return {
        allowed: false,
        reason: `Operation '${operation}' requires '${requiredLevel}' level but current level is '${currentLevel}'`,
        requiredLevel,
        currentLevel
    };
}
/**
 * Throws an error if permission check fails
 *
 * @param currentLevel - Current autonomy level
 * @param operation - Operation type to validate
 * @param context - Optional context for better error messages
 * @throws {Error} If permission check fails
 *
 * @example
 * ```typescript
 * try {
 *   assertPermission(AutonomyLevel.LOW, OperationType.GIT_PUSH, "pushing to remote");
 * } catch (error) {
 *   console.error("Permission denied:", error.message);
 * }
 * ```
 */
export function assertPermission(currentLevel, operation, context, workflowName, workflowId) {
    const result = checkPermission(currentLevel, operation);
    // Record audit entry
    try {
        auditTrail.record({
            workflowName: workflowName || 'unknown',
            workflowId,
            autonomyLevel: currentLevel,
            operation,
            target: context || 'unknown',
            approved: result.allowed,
            executedBy: 'system',
            outcome: 'pending',
            metadata: {
                requiredLevel: result.requiredLevel,
                currentLevel: result.currentLevel
            }
        });
    }
    catch (error) {
        // Don't fail the operation if audit logging fails
        console.error('Failed to record audit entry:', error);
    }
    if (!result.allowed) {
        const contextMsg = context ? ` (${context})` : "";
        throw new Error(`Permission denied${contextMsg}: ${result.reason}. ` +
            `Increase autonomy level to '${result.requiredLevel}' or higher.`);
    }
}
/**
 * Gets the default autonomy level for workflows
 *
 * @returns Default autonomy level (READ_ONLY)
 */
export function getDefaultAutonomyLevel() {
    return AutonomyLevel.READ_ONLY;
}
/**
 * Validates if a string is a valid AutonomyLevel
 *
 * @param level - String to validate
 * @returns True if valid autonomy level
 */
export function isValidAutonomyLevel(level) {
    return Object.values(AutonomyLevel).includes(level);
}
/**
 * Gets all operations allowed at a given autonomy level
 *
 * @param level - Autonomy level to query
 * @returns Array of allowed operation types
 */
export function getAllowedOperations(level) {
    return Object.entries(PERMISSION_MATRIX)
        .filter(([_, requiredLevel]) => {
        const currentIndex = LEVEL_HIERARCHY.indexOf(level);
        const requiredIndex = LEVEL_HIERARCHY.indexOf(requiredLevel);
        return currentIndex >= requiredIndex;
    })
        .map(([operation, _]) => operation);
}
/**
 * Permission-aware Git operation wrapper
 */
export class GitOperations {
    autonomyLevel;
    constructor(autonomyLevel) {
        this.autonomyLevel = autonomyLevel;
    }
    /**
     * Checks if Git read operations are allowed
     */
    canRead() {
        return checkPermission(this.autonomyLevel, OperationType.GIT_READ).allowed;
    }
    /**
     * Checks if Git commit operations are allowed
     */
    canCommit() {
        return checkPermission(this.autonomyLevel, OperationType.GIT_COMMIT).allowed;
    }
    /**
     * Checks if Git push operations are allowed
     */
    canPush() {
        return checkPermission(this.autonomyLevel, OperationType.GIT_PUSH).allowed;
    }
    /**
     * Asserts Git commit permission or throws
     */
    assertCommit(context, workflowName, workflowId) {
        assertPermission(this.autonomyLevel, OperationType.GIT_COMMIT, context, workflowName, workflowId);
    }
    /**
     * Asserts Git push permission or throws
     */
    assertPush(context, workflowName, workflowId) {
        assertPermission(this.autonomyLevel, OperationType.GIT_PUSH, context, workflowName, workflowId);
    }
}
/**
 * Permission-aware file operation wrapper
 */
export class FileOperations {
    autonomyLevel;
    constructor(autonomyLevel) {
        this.autonomyLevel = autonomyLevel;
    }
    /**
     * Checks if file read operations are allowed
     */
    canRead() {
        return checkPermission(this.autonomyLevel, OperationType.READ_FILE).allowed;
    }
    /**
     * Checks if file write operations are allowed
     */
    canWrite() {
        return checkPermission(this.autonomyLevel, OperationType.WRITE_FILE).allowed;
    }
    /**
     * Asserts file write permission or throws
     */
    assertWrite(context, workflowName, workflowId) {
        assertPermission(this.autonomyLevel, OperationType.WRITE_FILE, context, workflowName, workflowId);
    }
}
/**
 * Creates a PermissionManager instance for a given autonomy level
 */
export class PermissionManager {
    autonomyLevel;
    git;
    file;
    constructor(autonomyLevel = AutonomyLevel.READ_ONLY) {
        this.autonomyLevel = autonomyLevel;
        this.git = new GitOperations(autonomyLevel);
        this.file = new FileOperations(autonomyLevel);
    }
    /**
     * Gets current autonomy level
     */
    getLevel() {
        return this.autonomyLevel;
    }
    /**
     * Checks if an operation is allowed
     */
    check(operation) {
        return checkPermission(this.autonomyLevel, operation);
    }
    /**
     * Asserts an operation is allowed or throws
     */
    assert(operation, context, workflowName, workflowId) {
        assertPermission(this.autonomyLevel, operation, context, workflowName, workflowId);
    }
    /**
     * Gets all allowed operations at current level
     */
    getAllowedOperations() {
        return getAllowedOperations(this.autonomyLevel);
    }
}
/**
 * Factory function to create PermissionManager instances
 *
 * @param level - Autonomy level (defaults to READ_ONLY)
 * @returns PermissionManager instance
 */
export function createPermissionManager(level) {
    return new PermissionManager(level || getDefaultAutonomyLevel());
}
//# sourceMappingURL=permissionManager.js.map