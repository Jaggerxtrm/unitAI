/**
 * Permission Manager for Unified AI MCP Tool
 *
 * Implements a granular permission system inspired by Factory Droid's autonomy levels.
 * Allows workflows to execute operations safely based on configured autonomy levels.
 *
 * @module permissionManager
 */
/**
 * Permission levels for autonomous operations
 *
 * - READ_ONLY: Only read operations (git status, git diff, file reads)
 * - LOW: File modifications within project
 * - MEDIUM: Local Git operations (commit, branch) and dependency management
 * - HIGH: External operations (git push, external APIs)
 */
export declare enum AutonomyLevel {
    READ_ONLY = "read-only",
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}
/**
 * Operation categories requiring permission checks
 */
export declare enum OperationType {
    READ_FILE = "read_file",
    WRITE_FILE = "write_file",
    GIT_READ = "git_read",
    GIT_COMMIT = "git_commit",
    GIT_PUSH = "git_push",
    GIT_BRANCH = "git_branch",
    INSTALL_DEPENDENCY = "install_dependency",
    EXECUTE_COMMAND = "execute_command",
    EXTERNAL_API = "external_api",
    MCP_CALL = "mcp_call"
}
/**
 * Permission validation result
 */
export interface PermissionResult {
    allowed: boolean;
    reason?: string;
    requiredLevel?: AutonomyLevel;
    currentLevel?: AutonomyLevel;
}
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
export declare function checkPermission(currentLevel: AutonomyLevel, operation: OperationType): PermissionResult;
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
export declare function assertPermission(currentLevel: AutonomyLevel, operation: OperationType, context?: string, workflowName?: string, workflowId?: string): void;
/**
 * Gets the default autonomy level for workflows
 *
 * @returns Default autonomy level (READ_ONLY)
 */
export declare function getDefaultAutonomyLevel(): AutonomyLevel;
/**
 * Validates if a string is a valid AutonomyLevel
 *
 * @param level - String to validate
 * @returns True if valid autonomy level
 */
export declare function isValidAutonomyLevel(level: string): level is AutonomyLevel;
/**
 * Gets all operations allowed at a given autonomy level
 *
 * @param level - Autonomy level to query
 * @returns Array of allowed operation types
 */
export declare function getAllowedOperations(level: AutonomyLevel): OperationType[];
/**
 * Permission-aware Git operation wrapper
 */
export declare class GitOperations {
    private autonomyLevel;
    constructor(autonomyLevel: AutonomyLevel);
    /**
     * Checks if Git read operations are allowed
     */
    canRead(): boolean;
    /**
     * Checks if Git commit operations are allowed
     */
    canCommit(): boolean;
    /**
     * Checks if Git push operations are allowed
     */
    canPush(): boolean;
    /**
     * Asserts Git commit permission or throws
     */
    assertCommit(context?: string, workflowName?: string, workflowId?: string): void;
    /**
     * Asserts Git push permission or throws
     */
    assertPush(context?: string, workflowName?: string, workflowId?: string): void;
}
/**
 * Permission-aware file operation wrapper
 */
export declare class FileOperations {
    private autonomyLevel;
    constructor(autonomyLevel: AutonomyLevel);
    /**
     * Checks if file read operations are allowed
     */
    canRead(): boolean;
    /**
     * Checks if file write operations are allowed
     */
    canWrite(): boolean;
    /**
     * Asserts file write permission or throws
     */
    assertWrite(context?: string, workflowName?: string, workflowId?: string): void;
}
/**
 * Creates a PermissionManager instance for a given autonomy level
 */
export declare class PermissionManager {
    private autonomyLevel;
    git: GitOperations;
    file: FileOperations;
    constructor(autonomyLevel?: AutonomyLevel);
    /**
     * Gets current autonomy level
     */
    getLevel(): AutonomyLevel;
    /**
     * Checks if an operation is allowed
     */
    check(operation: OperationType): PermissionResult;
    /**
     * Asserts an operation is allowed or throws
     */
    assert(operation: OperationType, context?: string, workflowName?: string, workflowId?: string): void;
    /**
     * Gets all allowed operations at current level
     */
    getAllowedOperations(): OperationType[];
}
/**
 * Factory function to create PermissionManager instances
 *
 * @param level - Autonomy level (defaults to READ_ONLY)
 * @returns PermissionManager instance
 */
export declare function createPermissionManager(level?: AutonomyLevel): PermissionManager;
//# sourceMappingURL=permissionManager.d.ts.map