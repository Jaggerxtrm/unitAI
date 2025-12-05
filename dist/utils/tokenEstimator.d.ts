/**
 * Token Estimator Utility
 *
 * Provides token cost estimation for files and tool operations
 * to enable intelligent, token-aware decision making.
 */
/**
 * Token estimate result
 */
export interface TokenEstimate {
    /** Lines of code in file */
    loc: number;
    /** Estimated tokens (LOC × average tokens per line) */
    estimatedTokens: number;
    /** File size classification */
    classification: "small" | "medium" | "large" | "xlarge";
    /** File path analyzed */
    filePath: string;
    /** File size in bytes */
    sizeBytes: number;
}
/**
 * Tool suggestion based on context
 */
export interface ToolSuggestion {
    /** Recommended tool to use */
    recommended: "serena" | "claude-context" | "workflow" | "read";
    /** Human-readable reason for suggestion */
    reason: string;
    /** Tool that should be blocked (if any) */
    blockedTool?: string;
    /** Specific tool commands to use */
    suggestedCommands?: string[];
    /** Estimated token savings if suggestion followed */
    estimatedSavings?: number;
}
/**
 * Context for tool selection decision
 */
export interface ToolContext {
    /** Tool being considered */
    tool: "Read" | "Bash" | "Grep" | "Glob";
    /** File path (for Read) or command (for Bash) */
    target: string;
    /** Additional context (e.g., grep pattern) */
    additionalContext?: Record<string, any>;
}
/**
 * Metrics entry for token savings tracking
 */
export interface TokenSavingsMetric {
    id: string;
    timestamp: Date;
    source: 'enforcer-hook' | 'workflow' | 'manual';
    blockedTool: string;
    recommendedTool: string;
    target: string;
    estimatedSavings: number;
    actualTokensAvoided?: number;
    suggestionFollowed: boolean;
    metadata: Record<string, any>;
}
/**
 * Query filters for metrics
 */
export interface MetricsQueryFilters {
    source?: 'enforcer-hook' | 'workflow' | 'manual';
    blockedTool?: string;
    recommendedTool?: string;
    suggestionFollowed?: boolean;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
}
/**
 * Aggregate statistics for token savings
 */
export interface TokenSavingsStats {
    totalSuggestions: number;
    suggestionsFollowed: number;
    suggestionsIgnored: number;
    totalEstimatedSavings: number;
    totalActualSavings: number;
    byBlockedTool: Record<string, {
        count: number;
        savings: number;
    }>;
    byRecommendedTool: Record<string, {
        count: number;
        savings: number;
    }>;
    averageSavingsPerSuggestion: number;
    followRate: number;
}
/**
 * Estimate tokens for a file based on LOC and file type
 */
export declare function estimateFileTokens(filePath: string): Promise<TokenEstimate>;
/**
 * Estimate output size for tool operations
 */
export declare function estimateToolOutput(tool: string, args: any): number;
/**
 * Suggest optimal tool based on context
 *
 * Core decision logic:
 * - Code files → ALWAYS Serena (75-80% token savings)
 * - Pattern search → claude-context semantic search
 * - Multi-file operations → workflow orchestration
 * - Small non-code files → Read ok
 */
export declare function suggestOptimalTool(context: ToolContext): Promise<ToolSuggestion>;
/**
 * Format tool suggestion as human-readable message
 */
export declare function formatToolSuggestion(suggestion: ToolSuggestion): string;
/**
 * Token Savings Metrics Collector
 *
 * Tracks and aggregates token savings from enforcer hooks and workflows.
 * Stores metrics in SQLite database for analysis and reporting.
 */
export declare class TokenSavingsMetrics {
    private db;
    private dbPath;
    constructor(dbPath?: string);
    /**
     * Initialize database schema for metrics
     */
    private initializeSchema;
    /**
     * Generate unique ID for metric entry
     */
    private generateId;
    /**
     * Record a token savings metric
     */
    record(metric: Omit<TokenSavingsMetric, 'id' | 'timestamp'>): string;
    /**
     * Query metrics with filters
     */
    query(filters?: MetricsQueryFilters): TokenSavingsMetric[];
    /**
     * Get aggregate statistics
     */
    getStats(filters?: Pick<MetricsQueryFilters, 'source' | 'startTime' | 'endTime'>): TokenSavingsStats;
    /**
     * Convert database row to metric object
     */
    private rowToMetric;
    /**
     * Update a metric with actual token savings (when available)
     */
    updateActualSavings(metricId: string, actualTokensAvoided: number): void;
    /**
     * Get metrics summary for reporting
     */
    getSummaryReport(days?: number): string;
    /**
     * Close database connection
     */
    close(): void;
}
/**
 * Get or create the global metrics instance
 */
export declare function getMetricsCollector(): TokenSavingsMetrics;
//# sourceMappingURL=tokenEstimator.d.ts.map