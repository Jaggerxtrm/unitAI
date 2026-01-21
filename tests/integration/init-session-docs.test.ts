
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AI_MODELS } from '../../src/constants.js';

// Create hoisted mocks
const { mockFs, executeAIClientSpy } = vi.hoisted(() => {
    return {
        mockFs: {
            existsSync: vi.fn(),
            readdirSync: vi.fn(),
            readFileSync: vi.fn(),
        },
        executeAIClientSpy: vi.fn()
    };
});

// Mock fs
vi.mock('fs', async () => {
    const actual = await vi.importActual<typeof import('fs')>('fs');
    return {
        ...actual,
        default: { ...actual },
        existsSync: mockFs.existsSync,
        readdirSync: mockFs.readdirSync,
        readFileSync: mockFs.readFileSync,
    };
});

// Mock AI Executor
vi.mock('../../src/utils/aiExecutor.js', async () => {
    const actual = await vi.importActual<any>('../../src/utils/aiExecutor.js');
    console.log('Mocking aiExecutor.js, actual keys:', Object.keys(actual));
    return {
        ...actual,
        executeAIClient: (...args: any[]) => {
            console.log('Called mocked executeAIClient with:', JSON.stringify(args, null, 2));
            return executeAIClientSpy(...args);
        }
    };
});

// Import modules
import { AutonomyLevel } from '../../src/utils/permissionManager.js';
import { createMockProgressCallback } from '../utils/testHelpers.js';
import { mockGitCommands, createMockGitDiff, resetMockGitCommands } from '../utils/mockGit.js';

describe('Init Session Workflow - Documentation Search', () => {
    beforeEach(() => {
        vi.resetModules();
        resetMockGitCommands();
        vi.clearAllMocks();

        // Default mocks
        mockFs.existsSync.mockReturnValue(false);
        mockFs.readdirSync.mockReturnValue([]);
        mockFs.readFileSync.mockReturnValue('');
        executeAIClientSpy.mockResolvedValue('Analysis: Test');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should find relevant documentation in docs/ folder based on commit keywords and use FLASH model', async () => {
        // 1. Mock Git Commits
        const mockDiff = createMockGitDiff('src/feature.ts', ['+new feature'], ['-old code']);
        mockGitCommands([
            { command: 'rev-parse --git-dir', output: '.git' },
            { command: 'log --oneline', output: 'abc1234 Commit 1' },
            {
                command: 'show --format=%H|%an|%ad|%s --date=iso abc1234',
                output: 'abc1234|Author|2024-01-15 10:00:00 +0000|Add authentication feature\n' + mockDiff
            },
            { command: 'show --format= abc1234', output: mockDiff },
            { command: 'show --format= --name-only abc1234', output: 'src/feature.ts' }
        ]);

        // 2. Mock AI Spy implementation
        executeAIClientSpy.mockResolvedValue('Analysis: Added authentication.');

        // 3. Mock FS for Docs Search
        mockFs.existsSync.mockImplementation((p: any) => {
            const strPath = String(p);
            if (strPath.endsWith('.serena/memories') || strPath.endsWith('docs')) return true;
            return true;
        });

        mockFs.readdirSync.mockImplementation((p: any, options: any) => {
            const strPath = String(p);
            if (strPath.endsWith('docs')) {
                const entry = {
                    name: 'auth-guide.md',
                    isDirectory: () => false,
                    isFile: () => true
                };
                return options?.withFileTypes ? [entry] : ['auth-guide.md'];
            }
            return [];
        });

        mockFs.readFileSync.mockImplementation((p: any) => {
            const strPath = String(p);
            if (strPath.endsWith('auth-guide.md')) {
                return '# Authentication Guide\n\nThis guide explains how to use authentication keywords.';
            }
            return '';
        });

        const { executeInitSession } = await import('../../src/workflows/init-session.workflow.js');
        const { callback } = createMockProgressCallback();

        console.log('Executing workflow...');
        const result = await executeInitSession({
            autonomyLevel: AutonomyLevel.READ_ONLY,
            commitCount: 1
        }, callback as any);
        console.log('Workflow result:', result);

        // Verify Output
        expect(result).toContain('Relevant Documentation & Memories');

        // Verify Model Selection
        expect(executeAIClientSpy).toHaveBeenCalledWith(expect.objectContaining({
            backend: expect.stringMatching(/gemini/i),
            model: AI_MODELS.GEMINI.FLASH
        }));
    });
});
