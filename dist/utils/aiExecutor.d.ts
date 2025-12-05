import { BACKENDS } from "../constants.js";
export { BACKENDS };
/**
 * Options for executing AI CLI commands
 */
export interface AIExecutionOptions {
    backend: string;
    prompt: string;
    model?: string;
    sandbox?: boolean;
    outputFormat?: "text" | "json";
    projectRoot?: string;
    attachments?: string[];
    autoApprove?: boolean;
    autonomyLevel?: string;
    auto?: "low" | "medium" | "high";
    sessionId?: string;
    skipPermissionsUnsafe?: boolean;
    cwd?: string;
    onProgress?: (output: string) => void;
}
/**
 * Execute Gemini CLI with the given options
 */
export declare function executeGeminiCLI(options: Omit<AIExecutionOptions, 'backend'>): Promise<string>;
/**
 * Execute Cursor Agent CLI with the given options
 */
export declare function executeCursorAgentCLI(options: Omit<AIExecutionOptions, 'backend'>): Promise<string>;
/**
 * Execute Droid CLI (Factory Droid) with the given options
 */
export declare function executeDroidCLI(options: Omit<AIExecutionOptions, 'backend'>): Promise<string>;
/**
 * Execute Rovodev CLI with the given options
 */
export declare function executeRovodevCLI(options: Omit<AIExecutionOptions, 'backend'>): Promise<string>;
/**
 * Execute Qwen CLI with the given options
 */
export declare function executeQwenCLI(options: Omit<AIExecutionOptions, 'backend'>): Promise<string>;
/**
 * Execute a simple command (like echo or help)
 */
export declare function executeSimpleCommand(command: string, args?: string[]): Promise<string>;
/**
 * Configuration for retry-with-fallback behavior
 */
export interface RetryConfig {
    maxRetries: number;
    currentRetry: number;
    triedBackends: string[];
}
/**
 * Main function to execute an AI command based on backend
 * Includes automatic retry-with-fallback when a backend fails
 */
export declare function executeAIClient(options: AIExecutionOptions, retryConfig?: RetryConfig): Promise<string>;
//# sourceMappingURL=aiExecutor.d.ts.map