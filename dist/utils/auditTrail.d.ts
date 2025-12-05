/**
 * Audit Trail System for Autonomous Operations
 *
 * Tracks all autonomous decisions and operations for accountability and debugging.
 */
import type { AutonomyLevel, OperationType } from './permissionManager.js';
/**
 * Audit entry for tracking autonomous operations
 */
export interface AuditEntry {
    id: string;
    timestamp: Date;
    workflowName: string;
    workflowId?: string;
    autonomyLevel: AutonomyLevel;
    operation: OperationType;
    target: string;
    approved: boolean;
    executedBy: 'system' | 'user';
    outcome: 'success' | 'failure' | 'pending';
    errorMessage?: string;
    metadata: Record<string, any>;
}
/**
 * Query filters for audit entries
 */
export interface AuditQueryFilters {
    workflowName?: string;
    workflowId?: string;
    autonomyLevel?: AutonomyLevel;
    operation?: OperationType;
    approved?: boolean;
    outcome?: 'success' | 'failure' | 'pending';
    startTime?: Date;
    endTime?: Date;
    limit?: number;
}
/**
 * Audit statistics
 */
export interface AuditStats {
    totalEntries: number;
    approvedOperations: number;
    deniedOperations: number;
    successfulOperations: number;
    failedOperations: number;
    byAutonomyLevel: Record<string, number>;
    byOperation: Record<string, number>;
}
/**
 * Audit Trail for tracking autonomous decisions
 */
export declare class AuditTrail {
    private db;
    private dbPath;
    constructor(dbPath?: string);
    /**
     * Initialize database schema
     */
    private initializeSchema;
    /**
     * Record an audit entry
     */
    record(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void;
    /**
     * Query audit entries
     */
    query(filters?: AuditQueryFilters): AuditEntry[];
    /**
     * Get audit statistics
     */
    getStats(filters?: Pick<AuditQueryFilters, 'workflowName' | 'startTime' | 'endTime'>): AuditStats;
    /**
     * Export report in various formats
     */
    exportReport(format: 'json' | 'csv' | 'html', filters?: AuditQueryFilters): string;
    /**
     * Delete old entries
     */
    cleanup(daysToKeep: number): number;
    /**
     * Close database connection
     */
    close(): void;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Convert database row to AuditEntry
     */
    private rowToEntry;
}
/**
 * Singleton instance
 */
export declare const auditTrail: AuditTrail;
/**
 * Helper function to log audit entries
 */
export declare function logAudit(params: {
    operation: string;
    autonomyLevel: string;
    details: string;
    target?: string;
    workflowName?: string;
    workflowId?: string;
}): Promise<void>;
//# sourceMappingURL=auditTrail.d.ts.map