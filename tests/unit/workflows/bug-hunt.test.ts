/**
 * Tests for bug-hunt workflow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bugHuntWorkflow } from '../../../src/workflows/bug-hunt.workflow.js';
import * as aiExecutor from '../../../src/utils/aiExecutor.js';
import * as auditTrail from '../../../src/utils/auditTrail.js';
import * as fs from 'fs';

vi.mock('../../../src/utils/aiExecutor.js');
vi.mock('../../../src/utils/auditTrail.js');
vi.mock('fs');

describe('bug-hunt workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auditTrail.logAudit).mockResolvedValue(undefined);
  });

  it('should analyze provided files', async () => {
    const testFile = 'src/test.ts';
    const testContent = 'export function broken() { return null.toString(); }';

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(testContent);
    
    vi.mocked(aiExecutor.executeAIClient)
      .mockResolvedValueOnce('Root cause: null pointer dereference')
      .mockResolvedValueOnce('Fix: Add null check before calling toString()');

    const result = await bugHuntWorkflow.execute({
      symptoms: 'Cannot read property toString of null',
      suspected_files: [testFile]
    });

    expect(result).toContain('Bug Hunt Report');
    expect(result).toContain('Root cause');
    expect(aiExecutor.executeAIClient).toHaveBeenCalledTimes(4); // Gemini + Cursor + Droid + verification
  });

  it('should discover files when not provided', async () => {
    vi.mocked(aiExecutor.executeAIClient)
      .mockResolvedValueOnce('src/auth.ts\nsrc/middleware.ts') // File discovery
      .mockResolvedValueOnce('Analysis results')
      .mockResolvedValueOnce('Fix recommendations');

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('code content');

    const result = await bugHuntWorkflow.execute({
      symptoms: 'Authentication fails randomly'
    });

    expect(result).toContain('Bug Hunt Report');
    expect(aiExecutor.executeAIClient).toHaveBeenCalled();
  });

  it('should handle case when no files found', async () => {
    vi.mocked(aiExecutor.executeAIClient)
      .mockResolvedValueOnce('No specific files mentioned');

    const result = await bugHuntWorkflow.execute({
      symptoms: 'Random error'
    });

    expect(result).toContain('Unable to identify relevant files');
  });

  it('should analyze related files when issues found', async () => {
    const testFile = 'src/buggy.ts';
    const testContent = `
import { helper } from './helper.js';
export function buggy() { helper(); }
`;

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(testContent);
    
    vi.mocked(aiExecutor.executeAIClient)
      .mockResolvedValueOnce('Found bug in this file')
      .mockResolvedValueOnce('Fix: update the code');

    const result = await bugHuntWorkflow.execute({
      symptoms: 'Function crashes',
      suspected_files: [testFile]
    });

    expect(result).toContain('Bug Hunt Report');
  });
});
