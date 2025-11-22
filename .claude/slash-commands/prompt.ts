import { CommandResult } from './commands/types';
import { executeAIClient, AIExecutionOptions, BACKENDS } from '../../src/utils/aiExecutor.js';
import { getRecentCommitsWithDiffs } from '../../src/utils/gitHelper.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Execute the /prompt command to enhance user prompts with context
 */
export async function executePrompt(params: string[]): Promise<CommandResult> {
    try {
        if (params.length < 2) {
            return {
                success: false,
                output: '',
                error: 'Parametri mancanti. Uso: /prompt <backend> <prompt>'
            };
        }

        const backendParam = params[0].toLowerCase();
        const userPrompt = params.slice(1).join(' ').replace(/^["']|["']$/g, '');

        // Map backend parameter to internal backend constants
        let backend: string;
        if (backendParam === 'gemini') {
            backend = BACKENDS.GEMINI;
        } else if (backendParam === 'droid') {
            backend = BACKENDS.DROID;
        } else {
            return {
                success: false,
                output: '',
                error: `Backend non supportato: ${backendParam}. Usa 'gemini' o 'droid'.`
            };
        }

        // 1. Context Gathering
        // Fetch last 5 commits
        let commitContext = '';
        try {
            const commits = await getRecentCommitsWithDiffs(5);
            commitContext = commits.map(c =>
                `- [${c.hash.substring(0, 7)}] ${c.message} (Author: ${c.author}, Date: ${c.date})`
            ).join('\n');
        } catch (error) {
            console.warn('Failed to fetch commits:', error);
            commitContext = 'Unable to fetch git history.';
        }

        // List .serena/memories files
        let memoriesList = '';
        try {
            const memoriesDir = path.join(process.cwd(), '.serena', 'memories');
            const files = await fs.readdir(memoriesDir);
            memoriesList = files.filter(f => f.endsWith('.md')).join('\n');
        } catch (error) {
            console.warn('Failed to list memories:', error);
            memoriesList = 'No memories found or unable to access directory.';
        }

        // 2. Construct Meta-Prompt
        const metaPrompt = `
You are a Senior Developer and Prompt Engineer. Your goal is to enhance the user's raw prompt into a detailed, technical, and context-aware instruction for an AI Agent.

**User's Raw Prompt:**
"${userPrompt}"

**Context Sources Available:**
1. **Recent Git History:**
${commitContext}

2. **Project Memories (.serena/memories):**
The following memory files are available:
${memoriesList}

**Instructions:**
1. **Analyze the User's Prompt** and the **Recent Git History** to understand the current state and intent.
2. **Use your 'openmemory' MCP tool** to search for relevant short-form memories or past decisions related to this task. (e.g., \`mcp__openmemory__search-memories "query"\`)
3. **Review the list of .serena/memories files**. If any seem relevant to the user's request (e.g., coding conventions, workflows), you MUST read them using your file reading tools.
4. **Synthesize all gathered information** to create a highly detailed, technical prompt.
5. **Output ONLY the enhanced prompt**. Do not execute the task yourself, just provide the improved prompt that I can send to the agent.

**The Enhanced Prompt should:**
- Be specific and actionable.
- Reference relevant files or patterns found in history/memory.
- Include constraints or conventions discovered in .serena/memories.
- Be written in a clear, professional tone.
`;

        // 3. Execution
        const options: AIExecutionOptions = {
            backend: backend,
            prompt: metaPrompt,
            outputFormat: 'text'
        };

        const enhancedPrompt = await executeAIClient(options);

        return {
            success: true,
            output: `# Enhanced Prompt (${backendParam})\n\n${enhancedPrompt}`
        };

    } catch (error) {
        const err = error as Error;
        return {
            success: false,
            output: '',
            error: `Errore durante l'esecuzione di /prompt: ${err.message}`
        };
    }
}
