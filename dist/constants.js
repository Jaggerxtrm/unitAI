/**
 * Constants and configuration for Unified AI MCP Tool
 */
export const LOG_PREFIX = "[UAI-MCP]";
export const AI_MODELS = {
    QWEN: {
        PRIMARY: "qwen3-coder-plus",
        FALLBACK: "qwen3-coder-turbo",
        PLUS: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
        TURBO: "qwen/qwen3-coder:free",
        PRO: "qwen3-coder-pro"
    },
    ROVODEV: {
        PRIMARY: "default", // This will use the model configured in rovodev
        FALLBACK: "basic"
    },
    GEMINI: {
        PRIMARY: "gemini-2.5-pro",
        FLASH: "gemini-2.5-flash"
    }
};
export const CLI = {
    COMMANDS: {
        QWEN: "qwen",
        ROVODEV: "acli",
        ROVODEV_SUBCOMMAND: "rovodev",
        GEMINI: "gemini",
        ECHO: "echo"
    },
    FLAGS: {
        // Qwen specific flags
        QWEN: {
            PROMPT: "-p",
            MODEL: "--model",
            SANDBOX: "--sandbox",
            APPROVAL_MODE: "--approval-mode",
            YOLO: "--yolo",
            ALL_FILES: "--all-files",
            DEBUG: "--debug"
        },
        // Rovodev specific flags (based on actual acli rovodev run --help)
        ROVODEV: {
            // Only flags that actually exist in acli rovodev CLI
            SHADOW: "--shadow",
            VERBOSE: "--verbose",
            RESTORE: "--restore",
            YOLO: "--yolo",
            CONFIG_FILE: "--config-file"
        },
        // Gemini specific flags (based on gemini CLI help)
        GEMINI: {
            PROMPT: "-p",
            SANDBOX: "-s",
            HELP: "-help",
            MODEL: "-m"
        }
    }
};
export const ERROR_MESSAGES = {
    NO_PROMPT_PROVIDED: "No prompt provided. Please include a prompt in your request.",
    QWEN_CLI_NOT_FOUND: "Qwen CLI not found. Please install it first: npm install -g @qwen/cli",
    ROVODEV_CLI_NOT_FOUND: "acli rovodev command not found. Please ensure it's installed and available in your PATH",
    TOOL_NOT_FOUND: "Tool not found in registry",
    INVALID_ARGUMENTS: "Invalid tool arguments",
    EXECUTION_FAILED: "Tool execution failed",
    QUOTA_EXCEEDED: "Quota exceeded for primary model, attempting fallback...",
    VALIDATION_FAILED: "Tool response validation failed"
};
export const STATUS_MESSAGES = {
    STARTING_ANALYSIS: "🔍 Starting analysis (may take time for large files)...",
    PROCESSING: "📊 Processing your request...",
    THINKING: "🧠 Analyzing...",
    SEARCHING: "🔎 Searching codebase...",
    SWITCHING_MODEL: "⚡ Switching to fallback model...",
    COMPLETED: "✅ Analysis complete",
    FAILED: "❌ Analysis failed"
};
export const MCP_CONFIG = {
    SERVER_NAME: "unified-ai-mcp",
    VERSION: "1.0.0",
    CAPABILITIES: {
        tools: {},
        prompts: {},
        logging: {}
    },
    KEEP_ALIVE_INTERVAL: 25000 // 25 seconds
};
export const APPROVAL_MODES = {
    PLAN: "plan",
    DEFAULT: "default",
    AUTO_EDIT: "auto-edit",
    YOLO: "yolo"
};
export const BACKENDS = {
    QWEN: "qwen",
    ROVODEV: "rovodev",
    GEMINI: "gemini"
};
// Export BACKENDS values for easier importing
export { BACKENDS as default };
/**
 * Agent role descriptions and configurations
 *
 * Defines the specialization and preferred backend for each agent type
 */
export const AGENT_ROLES = {
    ARCHITECT: {
        name: "ArchitectAgent",
        backend: BACKENDS.GEMINI,
        specialization: "High-level system design, architecture analysis, and strategic planning",
        description: "Uses Gemini for deep architectural reasoning, security analysis, and long-term design decisions"
    },
    IMPLEMENTER: {
        name: "ImplementerAgent",
        backend: BACKENDS.ROVODEV,
        fallbackBackend: BACKENDS.GEMINI,
        specialization: "Precise code implementation with production-quality standards",
        description: "Uses Rovodev for generating production-ready code with proper error handling and best practices"
    },
    TESTER: {
        name: "TesterAgent",
        backend: BACKENDS.QWEN,
        specialization: "Fast test generation and validation",
        description: "Uses Qwen for rapid test case generation with high coverage and edge case detection"
    }
};
//# sourceMappingURL=constants.js.map