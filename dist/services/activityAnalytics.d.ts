/**
 * Activity Analytics Service
 *
 * Aggregates and analyzes user activity data from multiple sources:
 * - Audit trail (autonomous operations)
 * - Token metrics (tool usage efficiency)
 * - Workflow executions
 * - Agent performance
 */
import { AuditStats } from '../utils/auditTrail.js';
import { TokenSavingsStats } from '../utils/tokenEstimator.js';
/**
 * Time range for activity queries
 */
export interface TimeRange {
    startTime: Date;
    endTime: Date;
}
/**
 * Tool usage statistics
 */
export interface ToolUsageStats {
    toolName: string;
    invocations: number;
    successRate: number;
    avgResponseTime?: number;
    lastUsed: Date;
}
/**
 * Workflow execution statistics
 */
export interface WorkflowStats {
    workflowName: string;
    executions: number;
    successCount: number;
    failureCount: number;
    avgDuration?: number;
    lastExecuted: Date;
}
/**
 * User activity summary
 */
export interface UserActivitySummary {
    period: string;
    totalOperations: number;
    toolInvocations: number;
    workflowExecutions: number;
    tokensSaved: number;
    successRate: number;
    topTools: ToolUsageStats[];
    topWorkflows: WorkflowStats[];
    auditStats: AuditStats;
    tokenStats: TokenSavingsStats;
    activityByHour: {
        hour: number;
        count: number;
    }[];
    activityByDay: {
        date: string;
        count: number;
    }[];
}
/**
 * MCP Server activity record
 */
export interface MCPActivity {
    id: string;
    timestamp: Date;
    activityType: 'tool_invocation' | 'workflow_execution' | 'agent_action';
    toolName?: string;
    workflowName?: string;
    agentName?: string;
    duration?: number;
    success: boolean;
    errorMessage?: string;
    metadata: Record<string, any>;
}
/**
 * Activity Analytics Service
 *
 * Provides comprehensive analytics across all MCP server activities
 */
export declare class ActivityAnalytics {
    private auditTrail;
    private tokenMetrics;
    private activityDb;
    private activityDbPath;
    constructor(auditDbPath?: string, tokenDbPath?: string, activityDbPath?: string);
    /**
     * Ensure data directory exists
     */
    private ensureDataDirectory;
    /**
     * Initialize activity tracking schema
     */
    private initializeActivitySchema;
    /**
     * Record an MCP activity
     */
    recordActivity(activity: Omit<MCPActivity, 'id' | 'timestamp'>): string;
    /**
     * Query MCP activities
     */
    queryActivities(filters?: {
        activityType?: string;
        toolName?: string;
        workflowName?: string;
        startTime?: Date;
        endTime?: Date;
        success?: boolean;
        limit?: number;
    }): MCPActivity[];
    /**
     * Get comprehensive user activity summary
     */
    getActivitySummary(days?: number): UserActivitySummary;
    /**
     * Calculate activity distribution by hour of day
     */
    private calculateActivityByHour;
    /**
     * Calculate activity distribution by day
     */
    private calculateActivityByDay;
    /**
     * Get tool usage statistics for a specific tool
     */
    getToolStats(toolName: string, days?: number): ToolUsageStats | null;
    /**
     * Get workflow execution statistics
     */
    getWorkflowStats(workflowName: string, days?: number): WorkflowStats | null;
    /**
     * Get real-time activity feed
     */
    getRecentActivities(limit?: number): MCPActivity[];
    /**
     * Cleanup old activity records
     */
    cleanup(daysToKeep?: number): number;
    /**
     * Close all database connections
     */
    close(): void;
    /**
     * Generate unique ID for activity
     */
    private generateId;
    /**
     * Convert database row to MCPActivity
     */
    private rowToActivity;
}
/**
 * Get or create the global analytics instance
 */
export declare function getActivityAnalytics(): ActivityAnalytics;
//# sourceMappingURL=activityAnalytics.d.ts.map