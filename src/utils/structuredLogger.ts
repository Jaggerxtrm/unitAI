import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export enum LogCategory {
  WORKFLOW = 'workflow',
  AI_BACKEND = 'ai-backend',
  PERMISSION = 'permission',
  GIT = 'git',
  MCP = 'mcp',
  SYSTEM = 'system'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  category: LogCategory;
  component: string;
  operation: string;
  message: string;
  metadata?: Record<string, any>;
  duration?: number;
  workflowId?: string;
  parentSpanId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

interface LoggerConfig {
  logDir?: string;
  minLevel?: LogLevel;
  enableConsole?: boolean;
  enableFileLogging?: boolean;
}

export class StructuredLogger {
  private logDir: string;
  private minLevel: LogLevel;
  private enableConsole: boolean;
  private enableFileLogging: boolean;
  private streams: Map<string, fs.WriteStream>;

  constructor(config?: LoggerConfig) {
    this.logDir = config?.logDir || path.join(process.cwd(), 'logs');
    this.minLevel = config?.minLevel ?? LogLevel.INFO;
    this.enableConsole = config?.enableConsole ?? true;
    this.enableFileLogging = config?.enableFileLogging ?? true;
    this.streams = new Map();

    if (this.enableFileLogging) {
      this.ensureLogDir();
    }
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getStream(filename: string): fs.WriteStream {
    if (!this.streams.has(filename)) {
      const filePath = path.join(this.logDir, filename);
      const stream = fs.createWriteStream(filePath, { flags: 'a' });
      this.streams.set(filename, stream);
    }
    return this.streams.get(filename)!;
  }

  private getLevelName(level: LogLevel): string {
    return LogLevel[level];
  }

  private getLogFilename(category: LogCategory): string {
    const categoryMap: Record<LogCategory, string> = {
      [LogCategory.WORKFLOW]: 'workflow-executions.log',
      [LogCategory.AI_BACKEND]: 'ai-backend-calls.log',
      [LogCategory.PERMISSION]: 'permission-checks.log',
      [LogCategory.GIT]: 'git-operations.log',
      [LogCategory.MCP]: 'mcp.log',
      [LogCategory.SYSTEM]: 'system.log'
    };
    return categoryMap[category];
  }

  log(entry: Omit<LogEntry, 'timestamp' | 'levelName'>): void {
    if (entry.level < this.minLevel) {
      return;
    }

    const fullEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      levelName: this.getLevelName(entry.level)
    };

    if (this.enableConsole) {
      this.logToConsole(fullEntry);
    }

    if (this.enableFileLogging) {
      this.logToFile(fullEntry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const color = this.getLogColor(entry.level);
    const reset = '\x1b[0m';
    const formatted = `${color}[${entry.timestamp}] [${entry.levelName}] [${entry.category}] ${entry.component}::${entry.operation} - ${entry.message}${reset}`;
    console.error(formatted);
  }

  private getLogColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '\x1b[36m'; // Cyan
      case LogLevel.INFO:
        return '\x1b[32m'; // Green
      case LogLevel.WARN:
        return '\x1b[33m'; // Yellow
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red
      default:
        return '';
    }
  }

  private logToFile(entry: LogEntry): void {
    try {
      const filename = this.getLogFilename(entry.category);
      const stream = this.getStream(filename);
      const line = JSON.stringify(entry) + '\n';
      stream.write(line);

      if (entry.level >= LogLevel.ERROR) {
        const errorStream = this.getStream('errors.log');
        errorStream.write(line);
      }

      const debugStream = this.getStream('debug.log');
      debugStream.write(line);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

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
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      metadata
    });
  }

  forWorkflow(workflowId: string, workflowName: string): WorkflowLogger {
    return new WorkflowLogger(this, workflowId, workflowName);
  }

  queryLogs(filters: {
    category?: LogCategory;
    level?: LogLevel;
    workflowId?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): LogEntry[] {
    const results: LogEntry[] = [];
    const files = fs.readdirSync(this.logDir).filter(f => f.endsWith('.log'));

    for (const file of files) {
      const filePath = path.join(this.logDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(l => l.trim());

      for (const line of lines) {
        try {
          const entry: LogEntry = JSON.parse(line);

          if (filters.category && entry.category !== filters.category) continue;
          if (filters.level !== undefined && entry.level < filters.level) continue;
          if (filters.workflowId && entry.workflowId !== filters.workflowId) continue;
          if (filters.startTime && new Date(entry.timestamp) < filters.startTime) continue;
          if (filters.endTime && new Date(entry.timestamp) > filters.endTime) continue;

          results.push(entry);

          if (filters.limit && results.length >= filters.limit) {
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (filters.limit && results.length >= filters.limit) {
        break;
      }
    }

    return results.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  exportLogs(category: LogCategory, format: 'json' | 'csv'): string {
    const filename = this.getLogFilename(category);
    const filePath = path.join(this.logDir, filename);

    if (!fs.existsSync(filePath)) {
      return '';
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    if (format === 'json') {
      const entries = lines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(e => e !== null);
      return JSON.stringify(entries, null, 2);
    }

    const entries: LogEntry[] = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter((e): e is LogEntry => e !== null);

    const headers = ['timestamp', 'level', 'category', 'component', 'operation', 'message'];
    const csv = [
      headers.join(','),
      ...entries.map(e => 
        headers.map(h => `"${(e as any)[h] || ''}"`).join(',')
      )
    ].join('\n');

    return csv;
  }

  cleanup(daysToKeep: number): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const files = fs.readdirSync(this.logDir).filter(f => f.endsWith('.log'));

    for (const file of files) {
      const filePath = path.join(this.logDir, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old log file: ${file}`);
      }
    }
  }

  startTimer(workflowId: string, operation: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.info(
        LogCategory.SYSTEM,
        'timer',
        operation,
        `Operation completed`,
        { workflowId, duration }
      );
      return duration;
    };
  }

  close(): void {
    for (const stream of this.streams.values()) {
      stream.end();
    }
    this.streams.clear();
  }
}

export class WorkflowLogger {
  constructor(
    private baseLogger: StructuredLogger,
    private workflowId: string,
    private workflowName: string
  ) {}

  step(stepName: string, message: string, metadata?: any): void {
    this.baseLogger.info(
      LogCategory.WORKFLOW,
      this.workflowName,
      stepName,
      message,
      { ...metadata, workflowId: this.workflowId }
    );
  }

  aiCall(backend: string, prompt: string, metadata?: any): void {
    this.baseLogger.info(
      LogCategory.AI_BACKEND,
      this.workflowName,
      `${backend}-call`,
      `AI call to ${backend}`,
      { 
        ...metadata, 
        workflowId: this.workflowId,
        backend,
        promptLength: prompt.length
      }
    );
  }

  permissionCheck(operation: string, allowed: boolean, metadata?: any): void {
    this.baseLogger.info(
      LogCategory.PERMISSION,
      this.workflowName,
      operation,
      `Permission check: ${allowed ? 'ALLOWED' : 'DENIED'}`,
      { ...metadata, workflowId: this.workflowId, allowed }
    );
  }

  error(operation: string, error: Error, metadata?: any): void {
    this.baseLogger.error(
      LogCategory.WORKFLOW,
      this.workflowName,
      operation,
      `Error in workflow: ${error.message}`,
      error,
      { ...metadata, workflowId: this.workflowId }
    );
  }

  async timing<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.step(operation, `Operation completed successfully`, { duration });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error(operation, error as Error, { duration });
      throw error;
    }
  }
}

function getLogLevelFromEnv(): LogLevel {
  const level = process.env.LOG_LEVEL?.toLowerCase();
  switch (level) {
    case 'debug': return LogLevel.DEBUG;
    case 'info': return LogLevel.INFO;
    case 'warn': return LogLevel.WARN;
    case 'error': return LogLevel.ERROR;
    default: return LogLevel.INFO;
  }
}

export const structuredLogger = new StructuredLogger({
  minLevel: getLogLevelFromEnv(),
  enableConsole: process.env.LOG_TO_CONSOLE !== 'false',
  enableFileLogging: process.env.LOG_TO_FILE !== 'false'
});

process.on('exit', () => {
  structuredLogger.close();
});
