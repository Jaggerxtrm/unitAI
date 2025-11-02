/**
 * Constants and configuration for Unified AI MCP Tool
 */
export declare const LOG_PREFIX = "[UAI-MCP]";
export declare const AI_MODELS: {
    readonly QWEN: {
        readonly PRIMARY: "qwen3-coder-plus";
        readonly FALLBACK: "qwen3-coder-turbo";
        readonly PLUS: "qwen3-coder-plus";
        readonly TURBO: "qwen3-coder-turbo";
        readonly PRO: "qwen3-coder-pro";
    };
    readonly ROVODEV: {
        readonly PRIMARY: "default";
        readonly FALLBACK: "basic";
    };
    readonly GEMINI: {
        readonly PRIMARY: "gemini-2.5-flash";
        readonly PRO: "gemini-2.5-pro";
        readonly FLASH: "gemini-2.5-flash";
    };
};
export declare const CLI: {
    readonly COMMANDS: {
        readonly QWEN: "qwen";
        readonly ROVODEV: "acli";
        readonly ROVODEV_SUBCOMMAND: "rovodev";
        readonly GEMINI: "gemini";
        readonly ECHO: "echo";
    };
    readonly FLAGS: {
        readonly QWEN: {
            readonly PROMPT: "-p";
            readonly MODEL: "--model";
            readonly SANDBOX: "--sandbox";
            readonly APPROVAL_MODE: "--approval-mode";
            readonly YOLO: "--yolo";
            readonly ALL_FILES: "--all-files";
            readonly DEBUG: "--debug";
        };
        readonly ROVODEV: {
            readonly SHADOW: "--shadow";
            readonly VERBOSE: "--verbose";
            readonly RESTORE: "--restore";
            readonly YOLO: "--yolo";
            readonly CONFIG_FILE: "--config-file";
        };
        readonly GEMINI: {
            readonly PROMPT: "-p";
            readonly SANDBOX: "-s";
            readonly HELP: "-help";
            readonly MODEL: "--model";
        };
    };
};
export declare const ERROR_MESSAGES: {
    readonly NO_PROMPT_PROVIDED: "No prompt provided. Please include a prompt in your request.";
    readonly QWEN_CLI_NOT_FOUND: "Qwen CLI not found. Please install it first: npm install -g @qwen/cli";
    readonly ROVODEV_CLI_NOT_FOUND: "acli rovodev command not found. Please ensure it's installed and available in your PATH";
    readonly TOOL_NOT_FOUND: "Tool not found in registry";
    readonly INVALID_ARGUMENTS: "Invalid tool arguments";
    readonly EXECUTION_FAILED: "Tool execution failed";
    readonly QUOTA_EXCEEDED: "Quota exceeded for primary model, attempting fallback...";
    readonly VALIDATION_FAILED: "Tool response validation failed";
};
export declare const STATUS_MESSAGES: {
    readonly STARTING_ANALYSIS: "🔍 Starting analysis (may take time for large files)...";
    readonly PROCESSING: "📊 Processing your request...";
    readonly THINKING: "🧠 Analyzing...";
    readonly SEARCHING: "🔎 Searching codebase...";
    readonly SWITCHING_MODEL: "⚡ Switching to fallback model...";
    readonly COMPLETED: "✅ Analysis complete";
    readonly FAILED: "❌ Analysis failed";
};
export declare const MCP_CONFIG: {
    readonly SERVER_NAME: "unified-ai-mcp";
    readonly VERSION: "1.0.0";
    readonly CAPABILITIES: {
        readonly tools: {};
        readonly prompts: {};
        readonly logging: {};
    };
    readonly KEEP_ALIVE_INTERVAL: 25000;
};
export declare const APPROVAL_MODES: {
    readonly PLAN: "plan";
    readonly DEFAULT: "default";
    readonly AUTO_EDIT: "auto-edit";
    readonly YOLO: "yolo";
};
export declare const BACKENDS: {
    readonly QWEN: "qwen";
    readonly ROVODEV: "rovodev";
    readonly GEMINI: "gemini";
};
export type QwenModel = typeof AI_MODELS.QWEN[keyof typeof AI_MODELS.QWEN];
export type RovodevModel = typeof AI_MODELS.ROVODEV[keyof typeof AI_MODELS.ROVODEV];
export type GeminiModel = typeof AI_MODELS.GEMINI[keyof typeof AI_MODELS.GEMINI];
export type ApprovalMode = typeof APPROVAL_MODES[keyof typeof APPROVAL_MODES];
export type BackendType = typeof BACKENDS[keyof typeof BACKENDS];
//# sourceMappingURL=constants.d.ts.map