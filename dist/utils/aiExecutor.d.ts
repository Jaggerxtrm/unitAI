import type { ApprovalMode } from "../constants.js";
/**
 * Options for executing AI CLI commands
 */
export interface AIExecutionOptions {
    backend: string;
    prompt: string;
    model?: string;
    sandbox?: boolean;
    approvalMode?: ApprovalMode;
    yolo?: boolean;
    allFiles?: boolean;
    debug?: boolean;
    shadow?: boolean;
    verbose?: boolean;
    restore?: boolean;
    onProgress?: (output: string) => void;
}
/**
 * Execute Qwen CLI with the given options
 */
export declare function executeQwenCLI(options: Omit<AIExecutionOptions, 'backend'>): Promise<string>;
/**
 * Execute Rovodev CLI with the given options
 * Note: Rovodev CLI only supports: --shadow, --verbose, --restore, --yolo flags
 * The prompt is passed as a positional argument (not with -p flag)
 */
export declare function executeRovodevCLI(options: Omit<AIExecutionOptions, 'backend'>): Promise<string>;
/**
 * Execute a simple command (like echo or help)
 */
export declare function executeSimpleCommand(command: string, args?: string[]): Promise<string>;
/**
 * Main function to execute an AI command based on backend
 */
export declare function executeAIClient(options: AIExecutionOptions): Promise<string>;
//# sourceMappingURL=aiExecutor.d.ts.map