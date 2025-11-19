import { CLI, AI_MODELS, ERROR_MESSAGES, STATUS_MESSAGES, BACKENDS } from "../constants.js";

// Re-export BACKENDS for convenience
export { BACKENDS };
import { executeCommand } from "./commandExecutor.js";
import { logger } from "./logger.js";
import type { QwenModel, RovodevModel, ApprovalMode, GeminiModel } from "../constants.js";

/**
 * Options for executing AI CLI commands
 */
export interface AIExecutionOptions {
  backend: string;
  prompt: string;
  // Qwen-specific options
  model?: string; // Qwen or Gemini model name
  sandbox?: boolean; // Qwen or Gemini sandbox flag
  approvalMode?: ApprovalMode; // Only for Qwen
  yolo?: boolean; // Qwen and Rovodev support this
  allFiles?: boolean; // Only for Qwen
  debug?: boolean; // Only for Qwen
  outputFormat?: "text" | "json"; // Cursor Agent / Droid preferred format
  projectRoot?: string; // Cursor Agent working directory
  attachments?: string[]; // Shared attachment mechanism
  autoApprove?: boolean; // Cursor Agent auto-approve flag
  autonomyLevel?: string; // Cursor Agent autonomy level flag
  // Rovodev-specific options (based on acli rovodev run --help)
  shadow?: boolean; // Rovodev only
  verbose?: boolean; // Rovodev only
  restore?: boolean; // Rovodev only
  // Droid-specific options
  auto?: "low" | "medium" | "high";
  sessionId?: string;
  skipPermissionsUnsafe?: boolean;
  cwd?: string;
  onProgress?: (output: string) => void;
}

/**
 * Execute Qwen CLI with the given options
 */
export async function executeQwenCLI(
  options: Omit<AIExecutionOptions, 'backend'>
): Promise<string> {
  const {
    prompt,
    model,
    sandbox = false,
    approvalMode,
    yolo = false,
    allFiles = false,
    debug = false,
    onProgress
  } = options;

  if (!prompt || !prompt.trim()) {
    throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
  }

  // Build command arguments
  const args: string[] = [];

  // Add model flag if specified
  if (model) {
    args.push(CLI.FLAGS.QWEN.MODEL, model);
  }

  // Add sandbox flag if enabled
  if (sandbox) {
    args.push(CLI.FLAGS.QWEN.SANDBOX);
  }

  // Add approval mode if specified
  if (approvalMode) {
    args.push(CLI.FLAGS.QWEN.APPROVAL_MODE, approvalMode);
  }

  // Add yolo flag if enabled
  if (yolo) {
    args.push(CLI.FLAGS.QWEN.YOLO);
  }

  // Add all-files flag if enabled
  if (allFiles) {
    args.push(CLI.FLAGS.QWEN.ALL_FILES);
  }

  // Add debug flag if enabled
  if (debug) {
    args.push(CLI.FLAGS.QWEN.DEBUG);
  }

  // Prompt as positional argument (FIXED: -p flag is deprecated in Qwen CLI)
  // No need to manually quote - spawn with shell:false handles special characters
  args.push(prompt);

  logger.info(`Executing Qwen CLI with model: ${model || "default"}`);

  if (onProgress) {
    onProgress(STATUS_MESSAGES.STARTING_ANALYSIS);
  }

  try {
    const result = await executeCommand(CLI.COMMANDS.QWEN, args, {
      onProgress,
      timeout: 600000 // 10 minutes
    });

    if (onProgress) {
      onProgress(STATUS_MESSAGES.COMPLETED);
    }

    return result;
  } catch (error) {
    // Check if this is a quota/rate limit error and we used the primary model
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isQuotaError = errorMsg.toLowerCase().includes("quota") ||
                         errorMsg.toLowerCase().includes("rate limit");

    // If quota error with primary model, try fallback
    if (isQuotaError && model === AI_MODELS.QWEN.PRIMARY) {
      logger.warn(STATUS_MESSAGES.SWITCHING_MODEL);

      if (onProgress) {
        onProgress(STATUS_MESSAGES.SWITCHING_MODEL);
      }

      // Retry with fallback model
      const fallbackArgs = [...args];
      const modelIndex = fallbackArgs.indexOf(CLI.FLAGS.QWEN.MODEL);
      if (modelIndex !== -1 && modelIndex + 1 < fallbackArgs.length) {
        fallbackArgs[modelIndex + 1] = AI_MODELS.QWEN.FALLBACK;
      } else {
        // Model wasn't specified, add it
        fallbackArgs.unshift(CLI.FLAGS.QWEN.MODEL, AI_MODELS.QWEN.FALLBACK);
      }

      try {
        const fallbackResult = await executeCommand(CLI.COMMANDS.QWEN, fallbackArgs, {
          onProgress,
          timeout: 600000
        });

        if (onProgress) {
          onProgress(STATUS_MESSAGES.COMPLETED);
        }

        return fallbackResult;
      } catch (fallbackError) {
        const fallbackErrorMsg = fallbackError instanceof Error ?
          fallbackError.message : String(fallbackError);
        throw new Error(
          `Both primary and fallback models failed:\n` +
          `Primary: ${errorMsg}\n` +
          `Fallback: ${fallbackErrorMsg}`
        );
      }
    }

    // Not a quota error or already tried fallback
    if (onProgress) {
      onProgress(STATUS_MESSAGES.FAILED);
    }

    throw error;
  }
}

/**
 * Execute Rovodev CLI with the given options
 * Note: Rovodev CLI only supports: --shadow, --verbose, --restore, --yolo flags
 * The prompt is passed as a positional argument (not with -p flag)
 */
export async function executeRovodevCLI(
  options: Omit<AIExecutionOptions, 'backend'>
): Promise<string> {
  const {
    prompt,
    yolo = false,
    shadow = false,
    verbose = false,
    restore = false,
    onProgress
  } = options;

  if (!prompt || !prompt.trim()) {
    throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
  }

  // Build command arguments for acli rovodev run [OPTIONS] [MESSAGE]
  const args: string[] = [];

  // Add subcommand 'run'
  args.push(CLI.COMMANDS.ROVODEV_SUBCOMMAND);

  // Add only supported rovodev-specific flags
  if (shadow) {
    args.push(CLI.FLAGS.ROVODEV.SHADOW);
  }

  if (verbose) {
    args.push(CLI.FLAGS.ROVODEV.VERBOSE);
  }

  if (restore) {
    args.push(CLI.FLAGS.ROVODEV.RESTORE);
  }

  if (yolo) {
    args.push(CLI.FLAGS.ROVODEV.YOLO);
  }

  // Add prompt as POSITIONAL argument (not with a flag)
  // Rovodev CLI expects: acli rovodev run [OPTIONS] [MESSAGE]
  args.push(prompt);

  logger.info(`Executing Rovodev CLI`);

  if (onProgress) {
    onProgress(STATUS_MESSAGES.STARTING_ANALYSIS);
  }

  try {
    const result = await executeCommand(CLI.COMMANDS.ROVODEV, args, {
      onProgress,
      timeout: 600000 // 10 minutes
    });

    if (onProgress) {
      onProgress(STATUS_MESSAGES.COMPLETED);
    }

    return result;
  } catch (error) {
    if (onProgress) {
      onProgress(STATUS_MESSAGES.FAILED);
    }

    throw error;
  }
}

/**
 * Execute Gemini CLI with the given options
 */
export async function executeGeminiCLI(
  options: Omit<AIExecutionOptions, 'backend'>
): Promise<string> {
  const { prompt, model, sandbox = false, onProgress } = options;

  if (!prompt || !prompt.trim()) {
    throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
  }

  const args: string[] = [];

  // Always pass a model: default to PRIMARY if none provided
  const effectiveModel = model ?? AI_MODELS.GEMINI.PRIMARY;
  args.push(CLI.FLAGS.GEMINI.MODEL, effectiveModel);

  // Sandbox flag
  if (sandbox) {
    args.push(CLI.FLAGS.GEMINI.SANDBOX);
  }

  // Prompt as positional argument (FIXED: -p flag is deprecated in Gemini CLI)
  // No need to manually quote - spawn with shell:false handles special characters
  args.push(prompt);

  logger.info(`Executing Gemini CLI with model: ${effectiveModel}`);

  if (onProgress) {
    onProgress(STATUS_MESSAGES.STARTING_ANALYSIS);
  }

  try {
    const result = await executeCommand(CLI.COMMANDS.GEMINI, args, {
      onProgress,
      timeout: 600000
    });

    if (onProgress) onProgress(STATUS_MESSAGES.COMPLETED);
    return result;
  } catch (error) {
    if (onProgress) onProgress(STATUS_MESSAGES.FAILED);
    throw error;
  }
}

/**
 * Execute Cursor Agent CLI with the given options
 */
export async function executeCursorAgentCLI(
  options: Omit<AIExecutionOptions, 'backend'>
): Promise<string> {
  const {
    prompt,
    model = AI_MODELS.CURSOR_AGENT.GPT_5_1,
    outputFormat = "text",
    projectRoot,
    attachments = [],
    autoApprove = false,
    autonomyLevel,
    onProgress
  } = options;

  if (!prompt || !prompt.trim()) {
    throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
  }

  const args: string[] = [];

  args.push(CLI.FLAGS.CURSOR.PROMPT, prompt);

  if (model) {
    args.push(CLI.FLAGS.CURSOR.MODEL, model);
  }

  if (outputFormat) {
    args.push(CLI.FLAGS.CURSOR.OUTPUT, outputFormat);
  }

  const cwd = projectRoot || process.cwd();
  if (cwd) {
    args.push(CLI.FLAGS.CURSOR.CWD, cwd);
  }

  if (autoApprove) {
    args.push(CLI.FLAGS.CURSOR.AUTO_APPROVE);
  }

  if (autonomyLevel) {
    args.push(CLI.FLAGS.CURSOR.AUTONOMY, autonomyLevel);
  }

  if (attachments.length > 0) {
    attachments.forEach(file => {
      args.push(CLI.FLAGS.CURSOR.FILE, file);
    });
  }

  logger.info(`Executing Cursor Agent CLI with model: ${model}`);

  if (onProgress) {
    onProgress(STATUS_MESSAGES.STARTING_ANALYSIS);
  }

  try {
    const result = await executeCommand(CLI.COMMANDS.CURSOR_AGENT, args, {
      onProgress,
      timeout: 600000
    });

    if (onProgress) {
      onProgress(STATUS_MESSAGES.COMPLETED);
    }

    return result;
  } catch (error) {
    if (onProgress) {
      onProgress(STATUS_MESSAGES.FAILED);
    }
    throw error;
  }
}

/**
 * Execute Droid CLI (Factory Droid) with the given options
 */
export async function executeDroidCLI(
  options: Omit<AIExecutionOptions, 'backend'>
): Promise<string> {
  const {
    prompt,
    model = AI_MODELS.DROID.PRIMARY,
    outputFormat = "text",
    auto = "low",
    sessionId,
    skipPermissionsUnsafe = false,
    attachments = [],
    cwd,
    onProgress
  } = options;

  if (!prompt || !prompt.trim()) {
    throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
  }

  const args: string[] = [];
  args.push(CLI.FLAGS.DROID.EXEC);

  if (outputFormat) {
    args.push(CLI.FLAGS.DROID.OUTPUT, outputFormat);
  }

  if (model) {
    args.push(CLI.FLAGS.DROID.MODEL, model);
  }

  if (auto) {
    args.push(CLI.FLAGS.DROID.AUTO, auto);
  }

  if (sessionId) {
    args.push(CLI.FLAGS.DROID.SESSION, sessionId);
  }

  if (skipPermissionsUnsafe) {
    args.push(CLI.FLAGS.DROID.SKIP_PERMISSIONS);
  }

  if (cwd) {
    args.push(CLI.FLAGS.DROID.CWD, cwd);
  }

  if (attachments.length > 0) {
    attachments.forEach(file => {
      args.push(CLI.FLAGS.DROID.FILE, file);
    });
  }

  // Prompt is positional argument at end
  args.push(prompt);

  logger.info(`Executing Droid CLI with model: ${model} (auto=${auto})`);

  if (onProgress) {
    onProgress(STATUS_MESSAGES.STARTING_ANALYSIS);
  }

  try {
    const result = await executeCommand(CLI.COMMANDS.DROID, args, {
      onProgress,
      timeout: 900000
    });

    if (onProgress) {
      onProgress(STATUS_MESSAGES.COMPLETED);
    }

    return result;
  } catch (error) {
    if (onProgress) {
      onProgress(STATUS_MESSAGES.FAILED);
    }
    throw error;
  }
}

/**
 * Execute a simple command (like echo or help)
 */
export async function executeSimpleCommand(
  command: string,
  args: string[] = []
): Promise<string> {
  logger.debug(`Executing simple command: ${command} ${args.join(" ")}`);
  return executeCommand(command, args);
}

/**
 * Main function to execute an AI command based on backend
 */
export async function executeAIClient(options: AIExecutionOptions): Promise<string> {
  const { backend, ...rest } = options;
  
  switch (backend) {
    case BACKENDS.QWEN:
      return executeQwenCLI(rest);
    case BACKENDS.ROVODEV:
      return executeRovodevCLI(rest);
    case BACKENDS.GEMINI:
      return executeGeminiCLI(rest);
    case BACKENDS.CURSOR:
      return executeCursorAgentCLI(rest);
    case BACKENDS.DROID:
      return executeDroidCLI(rest);
    default:
      throw new Error(`Unsupported backend: ${backend}`);
  }
}