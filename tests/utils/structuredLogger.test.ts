import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StructuredLogger, LogLevel, LogCategory, WorkflowLogger } from '../../src/utils/structuredLogger.js';
import * as fs from 'fs';
import * as path from 'path';

const TEST_LOG_DIR = path.join(process.cwd(), 'logs-test');

describe('StructuredLogger', () => {
  let logger: StructuredLogger;

  beforeEach(() => {
    if (fs.existsSync(TEST_LOG_DIR)) {
      fs.rmSync(TEST_LOG_DIR, { recursive: true });
    }
    logger = new StructuredLogger({
      logDir: TEST_LOG_DIR,
      minLevel: LogLevel.DEBUG,
      enableConsole: false,
      enableFileLogging: true
    });
  });

  afterEach(() => {
    logger.close();
    if (fs.existsSync(TEST_LOG_DIR)) {
      fs.rmSync(TEST_LOG_DIR, { recursive: true });
    }
  });

  describe('Log Levels', () => {
    it('dovrebbe loggare messaggio DEBUG', async () => {
      logger.debug(LogCategory.SYSTEM, 'test-component', 'test-op', 'Debug message');
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const debugLog = path.join(TEST_LOG_DIR, 'debug.log');
      expect(fs.existsSync(debugLog)).toBe(true);
      
      const content = fs.readFileSync(debugLog, 'utf-8');
      expect(content).toContain('Debug message');
      expect(content).toContain('DEBUG');
    });

    it('dovrebbe loggare messaggio INFO', async () => {
      logger.info(LogCategory.WORKFLOW, 'test-workflow', 'start', 'Info message');
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const workflowLog = path.join(TEST_LOG_DIR, 'workflow-executions.log');
      expect(fs.existsSync(workflowLog)).toBe(true);
      
      const content = fs.readFileSync(workflowLog, 'utf-8');
      expect(content).toContain('Info message');
      expect(content).toContain('INFO');
    });

    it('dovrebbe loggare messaggio WARNING', async () => {
      logger.warn(LogCategory.SYSTEM, 'test-component', 'warning-op', 'Warning message');
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const systemLog = path.join(TEST_LOG_DIR, 'system.log');
      expect(fs.existsSync(systemLog)).toBe(true);
      
      const content = fs.readFileSync(systemLog, 'utf-8');
      expect(content).toContain('Warning message');
      expect(content).toContain('WARN');
    });

    it('dovrebbe loggare messaggio ERROR', async () => {
      const error = new Error('Test error');
      logger.error(LogCategory.WORKFLOW, 'test-workflow', 'error-op', 'Error message', error);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const errorLog = path.join(TEST_LOG_DIR, 'errors.log');
      expect(fs.existsSync(errorLog)).toBe(true);
      
      const content = fs.readFileSync(errorLog, 'utf-8');
      expect(content).toContain('Error message');
      expect(content).toContain('ERROR');
      expect(content).toContain('Test error');
    });
  });

  describe('Log Categories', () => {
    it('dovrebbe creare file per categoria WORKFLOW', async () => {
      logger.info(LogCategory.WORKFLOW, 'test', 'op', 'message');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const workflowLog = path.join(TEST_LOG_DIR, 'workflow-executions.log');
      expect(fs.existsSync(workflowLog)).toBe(true);
    });

    it('dovrebbe creare file per categoria AI_BACKEND', async () => {
      logger.info(LogCategory.AI_BACKEND, 'test', 'op', 'message');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const aiLog = path.join(TEST_LOG_DIR, 'ai-backend-calls.log');
      expect(fs.existsSync(aiLog)).toBe(true);
    });

    it('dovrebbe creare file per categoria PERMISSION', async () => {
      logger.info(LogCategory.PERMISSION, 'test', 'op', 'message');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const permLog = path.join(TEST_LOG_DIR, 'permission-checks.log');
      expect(fs.existsSync(permLog)).toBe(true);
    });

    it('dovrebbe creare file per categoria GIT', async () => {
      logger.info(LogCategory.GIT, 'test', 'op', 'message');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const gitLog = path.join(TEST_LOG_DIR, 'git-operations.log');
      expect(fs.existsSync(gitLog)).toBe(true);
    });
  });

  describe('Log Filtering', () => {
    it('non dovrebbe loggare se sotto minLevel', () => {
      const logger2 = new StructuredLogger({
        logDir: TEST_LOG_DIR,
        minLevel: LogLevel.ERROR,
        enableConsole: false,
        enableFileLogging: true
      });

      logger2.debug(LogCategory.SYSTEM, 'test', 'op', 'Debug message');
      logger2.info(LogCategory.SYSTEM, 'test', 'op', 'Info message');
      logger2.warn(LogCategory.SYSTEM, 'test', 'op', 'Warn message');

      const systemLog = path.join(TEST_LOG_DIR, 'system.log');
      
      if (fs.existsSync(systemLog)) {
        const content = fs.readFileSync(systemLog, 'utf-8');
        expect(content).not.toContain('Debug message');
        expect(content).not.toContain('Info message');
        expect(content).not.toContain('Warn message');
      }

      logger2.close();
    });
  });

  describe('Metadata', () => {
    it('dovrebbe includere metadata nei log', async () => {
      logger.info(LogCategory.WORKFLOW, 'test', 'op', 'message', { 
        key1: 'value1', 
        key2: 42 
      });
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const workflowLog = path.join(TEST_LOG_DIR, 'workflow-executions.log');
      const content = fs.readFileSync(workflowLog, 'utf-8');
      const parsed = JSON.parse(content.trim());
      
      expect(parsed.metadata).toHaveProperty('key1', 'value1');
      expect(parsed.metadata).toHaveProperty('key2', 42);
    });
  });

  describe('Query Logs', () => {
    beforeEach(async () => {
      logger.info(LogCategory.WORKFLOW, 'workflow1', 'step1', 'Message 1', { workflowId: 'abc' });
      logger.info(LogCategory.WORKFLOW, 'workflow1', 'step2', 'Message 2', { workflowId: 'abc' });
      logger.info(LogCategory.WORKFLOW, 'workflow2', 'step1', 'Message 3', { workflowId: 'def' });
      logger.error(LogCategory.WORKFLOW, 'workflow1', 'step3', 'Error message', new Error('test'));
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('dovrebbe filtrare per workflowId', () => {
      const results = logger.queryLogs({ workflowId: 'abc' });
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(entry => {
        expect(entry.metadata?.workflowId).toBe('abc');
      });
    });

    it('dovrebbe filtrare per category', () => {
      const results = logger.queryLogs({ category: LogCategory.WORKFLOW });
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(entry => {
        expect(entry.category).toBe(LogCategory.WORKFLOW);
      });
    });

    it('dovrebbe filtrare per level', () => {
      const results = logger.queryLogs({ level: LogLevel.ERROR });
      
      expect(results.length).toBeGreaterThan(0);
      results.forEach(entry => {
        expect(entry.level).toBeGreaterThanOrEqual(LogLevel.ERROR);
      });
    });

    it('dovrebbe rispettare limit', () => {
      const results = logger.queryLogs({ limit: 2 });
      
      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Export Logs', () => {
    beforeEach(async () => {
      logger.info(LogCategory.WORKFLOW, 'test', 'op1', 'Message 1');
      logger.info(LogCategory.WORKFLOW, 'test', 'op2', 'Message 2');
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('dovrebbe esportare in formato JSON', () => {
      const exported = logger.exportLogs(LogCategory.WORKFLOW, 'json');
      
      expect(exported).toBeTruthy();
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    });

    it('dovrebbe esportare in formato CSV', () => {
      const exported = logger.exportLogs(LogCategory.WORKFLOW, 'csv');
      
      expect(exported).toBeTruthy();
      expect(exported).toContain('timestamp,level,category,component,operation,message');
      expect(exported.split('\n').length).toBeGreaterThan(1);
    });
  });
});

describe('WorkflowLogger', () => {
  let baseLogger: StructuredLogger;
  let workflowLogger: WorkflowLogger;

  beforeEach(() => {
    if (fs.existsSync(TEST_LOG_DIR)) {
      fs.rmSync(TEST_LOG_DIR, { recursive: true });
    }
    baseLogger = new StructuredLogger({
      logDir: TEST_LOG_DIR,
      minLevel: LogLevel.DEBUG,
      enableConsole: false,
      enableFileLogging: true
    });
    workflowLogger = baseLogger.forWorkflow('test-workflow-id', 'test-workflow');
  });

  afterEach(() => {
    baseLogger.close();
    if (fs.existsSync(TEST_LOG_DIR)) {
      fs.rmSync(TEST_LOG_DIR, { recursive: true });
    }
  });

  it('dovrebbe auto-inject workflowId', async () => {
    workflowLogger.step('test-step', 'Test message');
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const workflowLog = path.join(TEST_LOG_DIR, 'workflow-executions.log');
    const content = fs.readFileSync(workflowLog, 'utf-8');
    const parsed = JSON.parse(content.trim());
    
    expect(parsed.metadata.workflowId).toBe('test-workflow-id');
  });

  it('dovrebbe loggare AI calls', async () => {
    workflowLogger.aiCall('qwen', 'test prompt', { model: 'qwen-max' });
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const aiLog = path.join(TEST_LOG_DIR, 'ai-backend-calls.log');
    const content = fs.readFileSync(aiLog, 'utf-8');
    const parsed = JSON.parse(content.trim());
    
    expect(parsed.metadata.backend).toBe('qwen');
    expect(parsed.metadata.workflowId).toBe('test-workflow-id');
  });

  it('dovrebbe loggare permission checks', async () => {
    workflowLogger.permissionCheck('write-file', true, { file: 'test.txt' });
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const permLog = path.join(TEST_LOG_DIR, 'permission-checks.log');
    const content = fs.readFileSync(permLog, 'utf-8');
    const parsed = JSON.parse(content.trim());
    
    expect(parsed.metadata.allowed).toBe(true);
    expect(parsed.metadata.workflowId).toBe('test-workflow-id');
  });

  it('dovrebbe misurare timing delle operazioni', async () => {
    const result = await workflowLogger.timing('test-op', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'test-result';
    });
    
    expect(result).toBe('test-result');
    
    const workflowLog = path.join(TEST_LOG_DIR, 'workflow-executions.log');
    const content = fs.readFileSync(workflowLog, 'utf-8');
    const parsed = JSON.parse(content.trim());
    
    expect(parsed.metadata.duration).toBeGreaterThanOrEqual(90);
  });

  it('dovrebbe loggare errori con stack trace', async () => {
    const error = new Error('Test error');
    workflowLogger.error('test-operation', error);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const workflowLog = path.join(TEST_LOG_DIR, 'workflow-executions.log');
    const content = fs.readFileSync(workflowLog, 'utf-8');
    const parsed = JSON.parse(content.trim());
    
    expect(parsed.error).toBeDefined();
    expect(parsed.error.message).toBe('Test error');
    expect(parsed.error.stack).toBeDefined();
  });
});
