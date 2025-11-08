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
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Log categories for organizing logs
 */
export enum LogCategory {
  WORKFLOW = 'workflow',
  AI_BACKEND = 'ai-backend',
  PERMISSION = 'permission',
  GIT = 'git',
  MCP = 'mcp',
  SYSTEM = 'system'
}

/**
 * Structured log entry format
 */
export interface LogEntry {
  timestamp: string;              // ISO 8601
  level: LogLevel;
  category: LogCategory;
  component: string;              // Nome workflow o modulo
  operation: string;              // Nome operazione specifica
  message: string;
  metadata?: Record<string, any>;
  duration?: number;              // Millisecondi (per timing)
  workflowId?: string;            // Per correlare log stesso workflow
  parentSpanId?: string;          // Per distributed tracing (future)
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
export class StructuredLogger {
  private logDir: string;
  private minLevel: LogLevel;
  private enableConsole: boolean;
  private streams: Map<string, fs.WriteStream>;
  private maxFileSizeBytes: number;

  constructor(config?: LoggerConfig) {
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
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Gets or creates a write stream for a log file
   */
  private getStream(filename: string): fs.WriteStream {
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

    return this.streams.get(filename)!;
  }

  /**
   * Rotates a log file when it reaches max size
   */
  private rotateFile(filename: string): void {
    const filePath = path.join(this.logDir, filename);
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const rotatedPath = path.join(
      this.logDir,
      `${filename}.${timestamp}.old`
    );

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
  log(entry: Omit<LogEntry, 'timestamp'>): void {
    // Check minimum level
    if (entry.level < this.minLevel) {
      return;
    }

    // Add timestamp
    const fullEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    // Determine log files to write to
    const files: string[] = [];

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
      } catch (error) {
        // Fallback to stderr if file write fails
        console.error('Failed to write log:', error);
      }
    }

    // Console output if enabled
    if (this.enableConsole) {
      const levelName = LogLevel[entry.level];
      const color = this.getLevelColor(entry.level);
      console.error(
        `${color}[${levelName}] ${entry.category}/${entry.component}/${entry.operation}${this.resetColor()}: ${entry.message}`
      );
    }
  }

  /**
   * Gets ANSI color code for log level
   */
  private getLevelColor(level: LogLevel): string {
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
  private resetColor(): string {
    return '\x1b[0m';
  }

  /**
   * Debug level log
   */
  debug(
    category: LogCategory,
    component: string,
    operation: string,
    message: string,
    metadata?: any
  ): void {
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
  info(
    category: LogCategory,
    component: string,
    operation: string,
    message: string,
    metadata?: any
  ): void {
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
  warn(
    category: LogCategory,
    component: string,
    operation: string,
    message: string,
    metadata?: any
  ): void {
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
  error(
    category: LogCategory,
    component: string,
    operation: string,
    message: string,
    error?: Error,
    metadata?: any
  ): void {
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
  forWorkflow(workflowId: string, workflowName: string): WorkflowLogger {
    return new WorkflowLogger(this, workflowId, workflowName);
  }

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
  }): LogEntry[] {
    const results: LogEntry[] = [];
    const files: string[] = [];

    // Determine which files to query
    if (filters.category) {
      files.push(`${filters.category}.log`);
    } else {
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
          const entry: LogEntry = JSON.parse(line);

          // Apply filters
          if (filters.level !== undefined && entry.level !== filters.level) {
            continue;
          }

          if (filters.workflowId && entry.workflowId !== filters.workflowId) {
            continue;
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
        } catch (error) {
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
  exportLogs(category: LogCategory, format: 'json' | 'csv'): string {
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
  cleanup(daysToKeep: number): void {
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
  startTimer(workflowId: string, operation: string): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.info(
        LogCategory.SYSTEM,
        'timer',
        operation,
        `Operation completed in ${duration}ms`,
        { workflowId, duration }
      );
      return duration;
    };
  }

  /**
   * Close all streams
   */
  close(): void {
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
  constructor(
    private baseLogger: StructuredLogger,
    private workflowId: string,
    private workflowName: string
  ) {}

  /**
   * Log workflow step
   */
  step(stepName: string, message: string, metadata?: any): void {
    this.baseLogger.info(
      LogCategory.WORKFLOW,
      this.workflowName,
      stepName,
      message,
      {
        ...metadata,
        workflowId: this.workflowId
      }
    );
  }

  /**
   * Log AI backend call
   */
  aiCall(backend: string, prompt: string, metadata?: any): void {
    this.baseLogger.info(
      LogCategory.AI_BACKEND,
      this.workflowName,
      `call-${backend}`,
      `Calling ${backend} backend`,
      {
        ...metadata,
        workflowId: this.workflowId,
        backend,
        promptLength: prompt.length
      }
    );
  }

  /**
   * Log permission check
   */
  permissionCheck(operation: string, allowed: boolean, metadata?: any): void {
    this.baseLogger.info(
      LogCategory.PERMISSION,
      this.workflowName,
      operation,
      `Permission check: ${allowed ? 'ALLOWED' : 'DENIED'}`,
      {
        ...metadata,
        workflowId: this.workflowId,
        allowed
      }
    );
  }

  /**
   * Log error
   */
  error(operation: string, error: Error, metadata?: any): void {
    this.baseLogger.error(
      LogCategory.WORKFLOW,
      this.workflowName,
      operation,
      `Error in workflow: ${error.message}`,
      error,
      {
        ...metadata,
        workflowId: this.workflowId
      }
    );
  }

  /**
   * Time operation automatically
   */
  async timing<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      this.baseLogger.info(
        LogCategory.WORKFLOW,
        this.workflowName,
        operation,
        `Operation completed in ${duration}ms`,
        {
          workflowId: this.workflowId,
          duration,
          success: true
        }
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.baseLogger.error(
        LogCategory.WORKFLOW,
        this.workflowName,
        operation,
        `Operation failed after ${duration}ms`,
        error as Error,
        {
          workflowId: this.workflowId,
          duration,
          success: false
        }
      );

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
export function generateWorkflowId(): string {
  return `wf-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
