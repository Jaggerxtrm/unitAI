/**
 * Structured Logging System for Unified AI MCP Tool
 *
 * Provides file-based JSON logging with categories, levels, and query capabilities.
 */
/**
 * Log levels (ordered from most to least verbose)
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
/**
 * Log categories for organizing logs
 */
export declare enum LogCategory {
    WORKFLOW = "workflow",
    AI_BACKEND = "ai-backend",
    PERMISSION = "permission",
    GIT = "git",
    MCP = "mcp",
    SYSTEM = "system"
}
/**
 * Structured log entry format
 */
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    category: LogCategory;
    component: string;
    operation: string;
    message: string;
    metadata?: Record<string, any>;
    duration?: number;
    workflowId?: string;
    parentSpanId?: string;
}
/**
 * Configuration for StructuredLogger
 */
export interface LoggerConfig {
    logDir?: string;
    minLevel?: LogLevel;
    enableConsole?: boolean;
    maxFileSizeMB?: number;
}
/**
 * Structured Logger with file-based output
 */
export declare class StructuredLogger {
    private logDir;
    private minLevel;
    private enableConsole;
    private streams;
    private maxFileSizeBytes;
    constructor(config?: LoggerConfig);
    /**
     * Ensures log directory exists
     */
    private ensureLogDirectory;
    /**
     * Gets or creates a write stream for a log file
     */
    private getStream;
    /**
     * Rotates a log file when it reaches max size
     */
    private rotateFile;
    /**
     * Log generico - scrive su file appropriati
     */
    log(entry: Omit<LogEntry, 'timestamp'>): void;
    /**
     * Gets ANSI color code for log level
     */
    private getLevelColor;
    /**
     * Resets ANSI color
     */
    private resetColor;
    /**
     * Debug level log
     */
    debug(category: LogCategory, component: string, operation: string, message: string, metadata?: any): void;
    /**
     * Info level log
     */
    info(category: LogCategory, component: string, operation: string, message: string, metadata?: any): void;
    /**
     * Warn level log
     */
    warn(category: LogCategory, component: string, operation: string, message: string, metadata?: any): void;
    /**
     * Error level log
     */
    error(category: LogCategory, component: string, operation: string, message: string, error?: Error, metadata?: any): void;
    /**
     * Crea workflow-scoped logger
     */
    forWorkflow(workflowId: string, workflowName: string): WorkflowLogger;
    /**
     * Query logs per debug post-mortem
     */
    queryLogs(filters: {
        category?: LogCategory;
        level?: LogLevel;
        workflowId?: string;
        component?: string;
        startTime?: Date;
        endTime?: Date;
        limit?: number;
    }): LogEntry[];
    /**
     * Export logs per external analysis
     */
    exportLogs(category: LogCategory, format: 'json' | 'csv'): string;
    /**
     * Cleanup logs vecchi
     */
    cleanup(daysToKeep: number): void;
    /**
     * Timer per operazioni
     */
    startTimer(workflowId: string, operation: string): () => void;
    /**
     * Close all streams
     */
    close(): void;
}
/**
 * Workflow-scoped logger - auto-inject workflowId
 */
export declare class WorkflowLogger {
    private baseLogger;
    private workflowId;
    private workflowName;
    constructor(baseLogger: StructuredLogger, workflowId: string, workflowName: string);
    /**
     * Log workflow step
     */
    step(stepName: string, message: string, metadata?: any): void;
    /**
     * Log AI backend call
     */
    aiCall(backend: string, prompt: string, metadata?: any): void;
    /**
     * Log permission check
     */
    permissionCheck(operation: string, allowed: boolean, metadata?: any): void;
    /**
     * Log error
     */
    error(operation: string, error: Error, metadata?: any): void;
    /**
     * Time operation automatically
     */
    timing<T>(operation: string, fn: () => Promise<T>): Promise<T>;
}
/**
 * Singleton instance
 */
export declare const structuredLogger: StructuredLogger;
/**
 * Helper to generate unique workflow IDs
 */
export declare function generateWorkflowId(): string;
//# sourceMappingURL=structuredLogger.d.ts.map