/**
 * Structured Logging System for Unified AI MCP Tool
 *
 * Provides file-based JSON logging with categories, levels, and query capabilities.
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Log levels (ordered from most to least verbose)
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (LogLevel = {}));
/**
 * Log categories for organizing logs
 */
export var LogCategory;
(function (LogCategory) {
    LogCategory["WORKFLOW"] = "workflow";
    LogCategory["AI_BACKEND"] = "ai-backend";
    LogCategory["PERMISSION"] = "permission";
    LogCategory["GIT"] = "git";
    LogCategory["MCP"] = "mcp";
    LogCategory["SYSTEM"] = "system";
})(LogCategory || (LogCategory = {}));
/**
 * Structured Logger with file-based output
 */
export class StructuredLogger {
    logDir;
    minLevel;
    enableConsole;
    streams;
    maxFileSizeBytes;
    constructor(config) {
        this.logDir = config?.logDir || path.join(process.cwd(), 'logs');
        this.minLevel = config?.minLevel ?? LogLevel.INFO;
        this.enableConsole = config?.enableConsole ?? false;
        this.maxFileSizeBytes = (config?.maxFileSizeMB || 10) * 1024 * 1024;
        this.streams = new Map();
        // Create log directory if it doesn't exist
        this.ensureLogDirectory();
    }
    /**
     * Ensures log directory exists
     */
    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }
    /**
     * Gets or creates a write stream for a log file
     */
    getStream(filename) {
        const filePath = path.join(this.logDir, filename);
        // Check if file needs rotation
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size >= this.maxFileSizeBytes) {
                this.rotateFile(filename);
            }
        }
        if (!this.streams.has(filename)) {
            const stream = fs.createWriteStream(filePath, { flags: 'a' });
            this.streams.set(filename, stream);
        }
        return this.streams.get(filename);
    }
    /**
     * Rotates a log file when it reaches max size
     */
    rotateFile(filename) {
        const filePath = path.join(this.logDir, filename);
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const rotatedPath = path.join(this.logDir, `${filename}.${timestamp}.old`);
        // Close existing stream
        const stream = this.streams.get(filename);
        if (stream) {
            stream.end();
            this.streams.delete(filename);
        }
        // Rename file
        if (fs.existsSync(filePath)) {
            fs.renameSync(filePath, rotatedPath);
        }
    }
    /**
     * Log generico - scrive su file appropriati
     */
    log(entry) {
        // Check minimum level
        if (entry.level < this.minLevel) {
            return;
        }
        // Add timestamp
        const fullEntry = {
            ...entry,
            timestamp: new Date().toISOString()
        };
        // Determine log files to write to
        const files = [];
        // Category-specific file
        files.push(`${entry.category}.log`);
        // Level-specific files
        if (entry.level === LogLevel.ERROR) {
            files.push('errors.log');
        }
        // All logs go to debug.log
        files.push('debug.log');
        // Write to files
        const logLine = JSON.stringify(fullEntry) + '\n';
        for (const file of files) {
            try {
                const stream = this.getStream(file);
                stream.write(logLine);
            }
            catch (error) {
                // Fallback to stderr if file write fails
                console.error('Failed to write log:', error);
            }
        }
        // Console output if enabled
        if (this.enableConsole) {
            const levelName = LogLevel[entry.level];
            const color = this.getLevelColor(entry.level);
            console.error(`${color}[${levelName}] ${entry.category}/${entry.component}/${entry.operation}${this.resetColor()}: ${entry.message}`);
        }
    }
    /**
     * Gets ANSI color code for log level
     */
    getLevelColor(level) {
        switch (level) {
            case LogLevel.DEBUG: return '\x1b[36m'; // Cyan
            case LogLevel.INFO: return '\x1b[32m'; // Green
            case LogLevel.WARN: return '\x1b[33m'; // Yellow
            case LogLevel.ERROR: return '\x1b[31m'; // Red
            default: return '';
        }
    }
    /**
     * Resets ANSI color
     */
    resetColor() {
        return '\x1b[0m';
    }
    /**
     * Debug level log
     */
    debug(category, component, operation, message, metadata) {
        this.log({
            level: LogLevel.DEBUG,
            category,
            component,
            operation,
            message,
            metadata
        });
    }
    /**
     * Info level log
     */
    info(category, component, operation, message, metadata) {
        this.log({
            level: LogLevel.INFO,
            category,
            component,
            operation,
            message,
            metadata
        });
    }
    /**
     * Warn level log
     */
    warn(category, component, operation, message, metadata) {
        this.log({
            level: LogLevel.WARN,
            category,
            component,
            operation,
            message,
            metadata
        });
    }
    /**
     * Error level log
     */
    error(category, component, operation, message, error, metadata) {
        this.log({
            level: LogLevel.ERROR,
            category,
            component,
            operation,
            message,
            metadata: {
                ...metadata,
                error: error ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                } : undefined
            }
        });
    }
    /**
     * Crea workflow-scoped logger
     */
    forWorkflow(workflowId, workflowName) {
        return new WorkflowLogger(this, workflowId, workflowName);
    }
    /**
     * Query logs per debug post-mortem
     */
    queryLogs(filters) {
        const results = [];
        const files = [];
        // Determine which files to query
        if (filters.category) {
            files.push(`${filters.category}.log`);
        }
        else {
            files.push('debug.log');
        }
        // Read and parse logs
        for (const file of files) {
            const filePath = path.join(this.logDir, file);
            if (!fs.existsSync(filePath)) {
                continue;
            }
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n').filter(line => line.trim());
            for (const line of lines) {
                try {
                    const entry = JSON.parse(line);
                    // Apply filters
                    if (filters.level !== undefined && entry.level !== filters.level) {
                        continue;
                    }
                    if (filters.workflowId) {
                        const entryWorkflowId = entry.workflowId || entry.metadata?.workflowId;
                        if (entryWorkflowId !== filters.workflowId) {
                            continue;
                        }
                    }
                    if (filters.component && entry.component !== filters.component) {
                        continue;
                    }
                    if (filters.startTime && new Date(entry.timestamp) < filters.startTime) {
                        continue;
                    }
                    if (filters.endTime && new Date(entry.timestamp) > filters.endTime) {
                        continue;
                    }
                    results.push(entry);
                    // Apply limit
                    if (filters.limit && results.length >= filters.limit) {
                        break;
                    }
                }
                catch (error) {
                    // Skip malformed log lines
                    continue;
                }
            }
            if (filters.limit && results.length >= filters.limit) {
                break;
            }
        }
        return results;
    }
    /**
     * Export logs per external analysis
     */
    exportLogs(category, format) {
        const entries = this.queryLogs({ category });
        if (format === 'json') {
            return JSON.stringify(entries, null, 2);
        }
        // CSV format
        const headers = ['timestamp', 'level', 'component', 'operation', 'message'];
        const rows = entries.map(entry => [
            entry.timestamp,
            LogLevel[entry.level],
            entry.component,
            entry.operation,
            entry.message.replace(/,/g, ';') // Escape commas
        ]);
        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        return csv;
    }
    /**
     * Cleanup logs vecchi
     */
    cleanup(daysToKeep) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const files = fs.readdirSync(this.logDir);
        for (const file of files) {
            const filePath = path.join(this.logDir, file);
            const stats = fs.statSync(filePath);
            if (stats.mtime < cutoffDate) {
                fs.unlinkSync(filePath);
            }
        }
    }
    /**
     * Timer per operazioni
     */
    startTimer(workflowId, operation) {
        const startTime = Date.now();
        return () => {
            const duration = Date.now() - startTime;
            this.info(LogCategory.SYSTEM, 'timer', operation, `Operation completed in ${duration}ms`, { workflowId, duration });
            return duration;
        };
    }
    /**
     * Close all streams
     */
    close() {
        for (const stream of this.streams.values()) {
            stream.end();
        }
        this.streams.clear();
    }
}
/**
 * Workflow-scoped logger - auto-inject workflowId
 */
export class WorkflowLogger {
    baseLogger;
    workflowId;
    workflowName;
    constructor(baseLogger, workflowId, workflowName) {
        this.baseLogger = baseLogger;
        this.workflowId = workflowId;
        this.workflowName = workflowName;
    }
    /**
     * Log workflow step
     */
    step(stepName, message, metadata) {
        this.baseLogger.info(LogCategory.WORKFLOW, this.workflowName, stepName, message, {
            ...metadata,
            workflowId: this.workflowId
        });
    }
    /**
     * Log AI backend call
     */
    aiCall(backend, prompt, metadata) {
        this.baseLogger.info(LogCategory.AI_BACKEND, this.workflowName, `call-${backend}`, `Calling ${backend} backend`, {
            ...metadata,
            workflowId: this.workflowId,
            backend,
            promptLength: prompt.length
        });
    }
    /**
     * Log permission check
     */
    permissionCheck(operation, allowed, metadata) {
        this.baseLogger.info(LogCategory.PERMISSION, this.workflowName, operation, `Permission check: ${allowed ? 'ALLOWED' : 'DENIED'}`, {
            ...metadata,
            workflowId: this.workflowId,
            allowed
        });
    }
    /**
     * Log error
     */
    error(operation, error, metadata) {
        this.baseLogger.error(LogCategory.WORKFLOW, this.workflowName, operation, `Error in workflow: ${error.message}`, error, {
            ...metadata,
            workflowId: this.workflowId
        });
    }
    /**
     * Time operation automatically
     */
    async timing(operation, fn) {
        const startTime = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - startTime;
            this.baseLogger.info(LogCategory.WORKFLOW, this.workflowName, operation, `Operation completed in ${duration}ms`, {
                workflowId: this.workflowId,
                duration,
                success: true
            });
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.baseLogger.error(LogCategory.WORKFLOW, this.workflowName, operation, `Operation failed after ${duration}ms`, error, {
                workflowId: this.workflowId,
                duration,
                success: false
            });
            throw error;
        }
    }
}
/**
 * Singleton instance
 */
export const structuredLogger = new StructuredLogger({
    minLevel: process.env.LOG_LEVEL === 'debug' ? LogLevel.DEBUG : LogLevel.INFO,
    enableConsole: process.env.LOG_TO_CONSOLE === 'true'
});
/**
 * Helper to generate unique workflow IDs
 */
export function generateWorkflowId() {
    return `wf-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
//# sourceMappingURL=structuredLogger.js.map