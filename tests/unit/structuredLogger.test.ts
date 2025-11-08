/**
 * Unit tests for Structured Logger
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  StructuredLogger,
  WorkflowLogger,
  LogLevel,
  LogCategory,
  generateWorkflowId
} from '../../src/utils/structuredLogger.js';

describe('StructuredLogger', () => {
  const testLogDir = path.join(process.cwd(), 'test-logs');
  let logger: StructuredLogger;

  beforeEach(() => {
    // Create test log directory
    if (!fs.existsSync(testLogDir)) {
      fs.mkdirSync(testLogDir, { recursive: true });
    }

    logger = new StructuredLogger({
      logDir: testLogDir,
      minLevel: LogLevel.DEBUG,
      enableConsole: false
    });
  });

  afterEach(() => {
    // Close logger streams
    logger.close();

    // Clean up test log directory
    if (fs.existsSync(testLogDir)) {
      const files = fs.readdirSync(testLogDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testLogDir, file));
      }
      fs.rmdirSync(testLogDir);
    }
  });

  describe('Basic logging', () => {
    it('should create log directory if it does not exist', () => {
      expect(fs.existsSync(testLogDir)).toBe(true);
    });

    it('should log info messages', async () => {
      logger.info(
        LogCategory.SYSTEM,
        'test-component',
        'test-operation',
        'Test message'
      );

      // Wait for file to be written
      await new Promise(resolve => setTimeout(resolve, 100));

      const logPath = path.join(testLogDir, 'system.log');
      expect(fs.existsSync(logPath)).toBe(true);

      const content = fs.readFileSync(logPath, 'utf-8');
      expect(content).toContain('Test message');
      expect(content).toContain('test-component');
    });

    it('should log with metadata', async () => {
      logger.info(
        LogCategory.WORKFLOW,
        'my-workflow',
        'step-1',
        'Step completed',
        { data: 'test-data' }
      );

      const logPath = path.join(testLogDir, 'workflow.log');

      // Wait for the file to be created to avoid race conditions with async I/O
      await new Promise(resolve => setTimeout(resolve, 100));

      const content = fs.readFileSync(logPath, 'utf-8');

      expect(content).toContain('test-data');
    });

    it('should log errors with stack trace', async () => {
      const testError = new Error('Test error');

      logger.error(
        LogCategory.SYSTEM,
        'test-component',
        'test-operation',
        'An error occurred',
        testError
      );

      // Wait for file to be written
      await new Promise(resolve => setTimeout(resolve, 100));

      const logPath = path.join(testLogDir, 'errors.log');
      expect(fs.existsSync(logPath)).toBe(true);

      const content = fs.readFileSync(logPath, 'utf-8');
      expect(content).toContain('Test error');
      expect(content).toContain('stack');
    });
  });

  describe('Log levels', () => {
    it('should respect minimum log level', async () => {
      const restrictiveLogger = new StructuredLogger({
        logDir: testLogDir,
        minLevel: LogLevel.WARN,
        enableConsole: false
      });

      restrictiveLogger.debug(
        LogCategory.SYSTEM,
        'test',
        'debug-op',
        'Debug message'
      );

      restrictiveLogger.info(
        LogCategory.SYSTEM,
        'test',
        'info-op',
        'Info message'
      );

      restrictiveLogger.warn(
        LogCategory.SYSTEM,
        'test',
        'warn-op',
        'Warn message'
      );

      restrictiveLogger.close();

      // Wait for file to be written
      await new Promise(resolve => setTimeout(resolve, 100));

      const logPath = path.join(testLogDir, 'system.log');
      const content = fs.readFileSync(logPath, 'utf-8');

      expect(content).not.toContain('Debug message');
      expect(content).not.toContain('Info message');
      expect(content).toContain('Warn message');
    });

    it('should write errors to errors.log', async () => {
      logger.error(
        LogCategory.WORKFLOW,
        'test-workflow',
        'failed-step',
        'Workflow failed',
        new Error('Test failure')
      );

      // Wait for file to be written
      await new Promise(resolve => setTimeout(resolve, 100));

      const errorsPath = path.join(testLogDir, 'errors.log');
      expect(fs.existsSync(errorsPath)).toBe(true);

      const content = fs.readFileSync(errorsPath, 'utf-8');
      expect(content).toContain('Workflow failed');
    });

    it('should write all logs to debug.log', async () => {
      logger.debug(LogCategory.SYSTEM, 'test', 'debug', 'Debug');
      logger.info(LogCategory.SYSTEM, 'test', 'info', 'Info');
      logger.warn(LogCategory.SYSTEM, 'test', 'warn', 'Warn');
      logger.error(LogCategory.SYSTEM, 'test', 'error', 'Error');

      // Wait for files to be written
      await new Promise(resolve => setTimeout(resolve, 100));

      const debugPath = path.join(testLogDir, 'debug.log');
      const content = fs.readFileSync(debugPath, 'utf-8');

      expect(content).toContain('Debug');
      expect(content).toContain('Info');
      expect(content).toContain('Warn');
      expect(content).toContain('Error');
    });
  });

  describe('Query API', () => {
    beforeEach(async () => {
      // Add some test logs
      logger.info(LogCategory.WORKFLOW, 'wf1', 'step1', 'Message 1', { workflowId: 'wf-1' });
      logger.info(LogCategory.WORKFLOW, 'wf2', 'step2', 'Message 2', { workflowId: 'wf-2' });
      logger.error(LogCategory.WORKFLOW, 'wf1', 'step3', 'Error 1', undefined, { workflowId: 'wf-1' });

      // Wait for logs to be written to files
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should query logs by category', () => {
      const results = logger.queryLogs({ category: LogCategory.WORKFLOW });
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.category === LogCategory.WORKFLOW)).toBe(true);
    });

    it('should query logs by level', () => {
      const results = logger.queryLogs({ 
        category: LogCategory.WORKFLOW,
        level: LogLevel.ERROR 
      });
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.level === LogLevel.ERROR)).toBe(true);
    });

    it('should query logs by workflowId', () => {
      const results = logger.queryLogs({ workflowId: 'wf-1' });
      
      expect(results.length).toBe(2); // info + error for wf-1
      expect(results.every(r => r.metadata?.workflowId === 'wf-1')).toBe(true);
    });

    it('should query logs by component', () => {
      const results = logger.queryLogs({ 
        category: LogCategory.WORKFLOW,
        component: 'wf1' 
      });
      
      expect(results.length).toBe(2); // step1 + step3
      expect(results.every(r => r.component === 'wf1')).toBe(true);
    });

    it('should limit query results', () => {
      const results = logger.queryLogs({ 
        category: LogCategory.WORKFLOW,
        limit: 1 
      });
      
      expect(results.length).toBe(1);
    });
  });

  describe('Export functionality', () => {
    beforeEach(async () => {
      logger.info(LogCategory.SYSTEM, 'comp1', 'op1', 'Test 1');
      logger.info(LogCategory.SYSTEM, 'comp2', 'op2', 'Test 2');

      // Wait for logs to be written
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should export logs as JSON', () => {
      const json = logger.exportLogs(LogCategory.SYSTEM, 'json');
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    });

    it('should export logs as CSV', () => {
      const csv = logger.exportLogs(LogCategory.SYSTEM, 'csv');
      
      expect(csv).toContain('timestamp,level,component,operation,message');
      expect(csv).toContain('Test 1');
      expect(csv).toContain('Test 2');
    });
  });

  describe('Timer functionality', () => {
    it('should measure operation duration', async () => {
      const stopTimer = logger.startTimer('test-wf', 'test-operation');

      await new Promise(resolve => setTimeout(resolve, 100));

      const duration = stopTimer();

      expect(duration).toBeGreaterThanOrEqual(100);

      // Wait for log to be written
      await new Promise(resolve => setTimeout(resolve, 100));

      const logs = logger.queryLogs({ category: LogCategory.SYSTEM });
      expect(logs.some(l => l.message.includes('completed in'))).toBe(true);
    });
  });

  describe('Cleanup functionality', () => {
    it('should remove old log files', () => {
      // Create an old log file
      const oldLogPath = path.join(testLogDir, 'old.log');
      fs.writeFileSync(oldLogPath, 'old content');
      
      // Set file modification time to 10 days ago
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);
      fs.utimesSync(oldLogPath, oldDate, oldDate);
      
      logger.cleanup(7); // Keep logs from last 7 days
      
      expect(fs.existsSync(oldLogPath)).toBe(false);
    });

    it('should keep recent log files', async () => {
      logger.info(LogCategory.SYSTEM, 'test', 'op', 'Recent log');

      // Wait for file to be written
      await new Promise(resolve => setTimeout(resolve, 100));

      logger.cleanup(7);

      const recentLogPath = path.join(testLogDir, 'system.log');
      expect(fs.existsSync(recentLogPath)).toBe(true);
    });
  });
});

describe('WorkflowLogger', () => {
  const testLogDir = path.join(process.cwd(), 'test-logs-workflow');
  let baseLogger: StructuredLogger;
  let workflowLogger: WorkflowLogger;

  beforeEach(() => {
    if (!fs.existsSync(testLogDir)) {
      fs.mkdirSync(testLogDir, { recursive: true });
    }

    baseLogger = new StructuredLogger({
      logDir: testLogDir,
      minLevel: LogLevel.DEBUG,
      enableConsole: false
    });

    workflowLogger = baseLogger.forWorkflow('test-wf-123', 'test-workflow');
  });

  afterEach(() => {
    baseLogger.close();

    if (fs.existsSync(testLogDir)) {
      const files = fs.readdirSync(testLogDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testLogDir, file));
      }
      fs.rmdirSync(testLogDir);
    }
  });

  it('should auto-inject workflowId in step logs', async () => {
    workflowLogger.step('initialization', 'Workflow started');

    // Wait for log to be written
    await new Promise(resolve => setTimeout(resolve, 100));

    const logs = baseLogger.queryLogs({ workflowId: 'test-wf-123' });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].metadata?.workflowId).toBe('test-wf-123');
  });

  it('should log AI backend calls', async () => {
    workflowLogger.aiCall('gemini', 'Test prompt', { model: 'gemini-2.0' });

    // Wait for log to be written
    await new Promise(resolve => setTimeout(resolve, 100));

    const logs = baseLogger.queryLogs({ category: LogCategory.AI_BACKEND });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].metadata?.backend).toBe('gemini');
  });

  it('should log permission checks', async () => {
    workflowLogger.permissionCheck('git-commit', true);

    // Wait for log to be written
    await new Promise(resolve => setTimeout(resolve, 100));

    const logs = baseLogger.queryLogs({ category: LogCategory.PERMISSION });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].metadata?.allowed).toBe(true);
  });

  it('should log errors with context', async () => {
    const testError = new Error('Workflow failed');
    workflowLogger.error('execution', testError);

    // Wait for log to be written
    await new Promise(resolve => setTimeout(resolve, 100));

    const logs = baseLogger.queryLogs({ level: LogLevel.ERROR });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].metadata?.workflowId).toBe('test-wf-123');
  });

  it('should measure operation timing', async () => {
    const result = await workflowLogger.timing('test-operation', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return 'success';
    });

    expect(result).toBe('success');

    // Wait for log to be written
    await new Promise(resolve => setTimeout(resolve, 100));

    const logs = baseLogger.queryLogs({ workflowId: 'test-wf-123' });
    const timingLog = logs.find(l => l.operation === 'test-operation');

    expect(timingLog).toBeDefined();
    expect(timingLog?.metadata?.duration).toBeGreaterThanOrEqual(50);
  });

  it('should log timing even on operation failure', async () => {
    await expect(
      workflowLogger.timing('failing-operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        throw new Error('Operation failed');
      })
    ).rejects.toThrow('Operation failed');

    // Wait for log to be written
    await new Promise(resolve => setTimeout(resolve, 100));

    const logs = baseLogger.queryLogs({
      workflowId: 'test-wf-123',
      level: LogLevel.ERROR
    });

    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].metadata?.success).toBe(false);
  });
});

describe('generateWorkflowId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateWorkflowId();
    const id2 = generateWorkflowId();

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^wf-\d+-[a-z0-9]+$/);
  });

  it('should start with wf- prefix', () => {
    const id = generateWorkflowId();
    expect(id).toMatch(/^wf-/);
  });
});
