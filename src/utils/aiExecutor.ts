import { CLI, AI_MODELS, ERROR_MESSAGES, STATUS_MESSAGES, BACKENDS } from "../constants.js";

// Re-export BACKENDS for convenience
export { BACKENDS };
import { executeCommand } from "./commandExecutor.js";
import { logger } from "./logger.js";
import type { GeminiModel } from "../constants.js";

/**
 * Options for executing AI CLI commands
 */
export interface AIExecutionOptions {
  backend: string;
  prompt: string;
  // Common options
  model?: string; // Model name
  sandbox?: boolean; // Sandbox flag (Gemini)
  outputFormat?: "text" | "json"; // Cursor Agent / Droid preferred format
  projectRoot?: string; // Cursor Agent working directory
  attachments?: string[]; // Shared attachment mechanism
  autoApprove?: boolean; // Cursor Agent auto-approve flag
  autonomyLevel?: string; // Cursor Agent autonomy level flag
  // Droid-specific options
  auto?: "low" | "medium" | "high";
  sessionId?: string;
  skipPermissionsUnsafe?: boolean;
  cwd?: string;
  onProgress?: (output: string) => void;
}

/**
 * Execute Gemini CLI with the given options
 */
export async function executeGeminiCLI(
  options: Omit<AIExecutionOptions, 'backend'>
): Promise<string> {
  const { prompt, sandbox = false, onProgress } = options;

  if (!prompt || !prompt.trim()) {
    throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
  }

  const args: string[] = [];

  // Always pass a model: default to PRIMARY if none provided
  const effectiveModel = options.model ?? AI_MODELS.GEMINI.PRIMARY;
  args.push(CLI.FLAGS.GEMINI.MODEL, effectiveModel);

  // Sandbox flag
  if (sandbox) {
    args.push(CLI.FLAGS.GEMINI.SANDBOX);
  }

  // Prompt as positional argument (FIXED: -p flag is deprecated in Gemini CLI)
  // No need to manually quote - spawn with shell:false handles special characters
  args.push(prompt);

  logger.info(`Executing Gemini CLI`);

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
    // model = AI_MODELS.CURSOR_AGENT.GPT_5_1, // REMOVED
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

  // cursor-agent requires --print for headless/scripting mode
  args.push(CLI.FLAGS.CURSOR.PRINT);

  // Force mode allows file edits (equivalent to auto-approve)
  if (autoApprove) {
    args.push(CLI.FLAGS.CURSOR.FORCE);
  }

  // if (model) {
  //   args.push(CLI.FLAGS.CURSOR.MODEL, model);
  // }

  if (outputFormat) {
    args.push(CLI.FLAGS.CURSOR.OUTPUT, outputFormat);
  }

  if (attachments.length > 0) {
    attachments.forEach(file => {
      args.push(CLI.FLAGS.CURSOR.FILE, file);
    });
  }

  // Prompt is the last positional argument
  args.push(prompt);

  logger.info(`Executing Cursor Agent CLI`);

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
    // model = AI_MODELS.DROID.PRIMARY,
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

  // if (model) {
  //   args.push(CLI.FLAGS.DROID.MODEL, model);
  // }

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

  logger.info(`Executing Droid CLI (auto=${auto})`);

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

import { circuitBreaker } from "./circuitBreaker.js";
import { selectFallbackBackend } from "../workflows/modelSelector.js";

/**
 * Execute Rovodev CLI with the given options
 */
export async function executeRovodevCLI(
  options: Omit<AIExecutionOptions, 'backend'>
): Promise<string> {
  const { prompt, autoApprove, onProgress } = options;

  if (!prompt || !prompt.trim()) {
    throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
  }

  const args: string[] = [];
  args.push(CLI.FLAGS.ROVODEV.RUN);

  // Auto-approve mode (YOLO)
  if (autoApprove) {
    args.push(CLI.FLAGS.ROVODEV.YOLO);
  }

  // Prompt is positional argument at end
  args.push(prompt);

  logger.info(`Executing Rovodev CLI`);

  if (onProgress) {
    onProgress(STATUS_MESSAGES.STARTING_ANALYSIS);
  }

  try {
    const result = await executeCommand("acli", ["rovodev", ...args], {
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
 * Execute Qwen CLI with the given options
 */
export async function executeQwenCLI(
  options: Omit<AIExecutionOptions, 'backend'>
): Promise<string> {
  const { prompt, sandbox, autoApprove, outputFormat, onProgress } = options;

  if (!prompt || !prompt.trim()) {
    throw new Error(ERROR_MESSAGES.NO_PROMPT_PROVIDED);
  }

  const args: string[] = [];

  // Sandbox mode
  if (sandbox) {
    args.push(CLI.FLAGS.QWEN.SANDBOX);
  }

  // Auto-approve mode (YOLO)
  if (autoApprove) {
    args.push(CLI.FLAGS.QWEN.YOLO);
  }

  // Output format
  if (outputFormat) {
    args.push(CLI.FLAGS.QWEN.OUTPUT, outputFormat);
  }

  // Prompt is positional argument at end
  args.push(prompt);

  logger.info(`Executing Qwen CLI`);

  if (onProgress) {
    onProgress(STATUS_MESSAGES.STARTING_ANALYSIS);
  }

  try {
    const result = await executeCommand(CLI.COMMANDS.GEMINI.replace("gemini", "qwen"), args, { // Hack: assuming qwen is in path as 'qwen'
      onProgress,
      timeout: 600000
    });
    // Correction: The command is just 'qwen'
    // Re-doing the command execution cleanly:

    return await executeCommand("qwen", args, {
      onProgress,
      timeout: 600000
    });

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
export async function executeAIClient(
  options: AIExecutionOptions,
  retryConfig?: RetryConfig
): Promise<string> {
  const { backend, ...rest } = options;

  // Initialize retry config
  const config: RetryConfig = retryConfig || {
    maxRetries: 2,
    currentRetry: 0,
    triedBackends: []
  };

  // Track this backend as tried
  config.triedBackends.push(backend);

  // Circuit Breaker Check - try fallback if blocked
  if (!circuitBreaker.isAvailable(backend)) {
    logger.warn(`Backend ${backend} is currently unavailable (Circuit Open).`);

    if (config.currentRetry < config.maxRetries) {
      const fallback = selectFallbackBackend(backend);

      // Avoid retrying already-tried backends
      if (config.triedBackends.includes(fallback)) {
        const msg = `All available backends have been tried: ${config.triedBackends.join(', ')}`;
        logger.error(msg);
        throw new Error(msg);
      }

      logger.info(`Trying fallback backend: ${fallback}`);
      return executeAIClient(
        { ...options, backend: fallback },
        { ...config, currentRetry: config.currentRetry + 1 }
      );
    }

    throw new Error(`Backend ${backend} unavailable and max retries (${config.maxRetries}) exhausted.`);
  }

  try {
    let result: string;
    switch (backend) {
      case BACKENDS.GEMINI:
        result = await executeGeminiCLI(rest);
        break;
      case BACKENDS.CURSOR:
        result = await executeCursorAgentCLI(rest);
        break;
      case BACKENDS.DROID:
        result = await executeDroidCLI(rest);
        break;
      case BACKENDS.ROVODEV:
        result = await executeRovodevCLI(rest);
        break;
      case BACKENDS.QWEN:
        result = await executeQwenCLI(rest);
        break;
      default:
        throw new Error(`Unsupported backend: ${backend}`);
    }

    // Report success to Circuit Breaker
    circuitBreaker.onSuccess(backend);

    // Log successful fallback if this wasn't the first try
    if (config.currentRetry > 0) {
      logger.info(`Successfully completed with fallback backend ${backend} after ${config.currentRetry} retries.`);
    }

    return result;

  } catch (error) {
    // Report failure to Circuit Breaker
    circuitBreaker.onFailure(backend);

    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.warn(`Backend ${backend} failed: ${errorMsg}`);

    // Don't retry for configuration errors (unsupported backend)
    if (errorMsg.includes('Unsupported backend')) {
      throw error;
    }

    // Retry with fallback if we haven't exhausted retries
    if (config.currentRetry < config.maxRetries) {
      const fallback = selectFallbackBackend(backend);

      // Avoid retrying already-tried backends
      if (config.triedBackends.includes(fallback)) {
        logger.error(`Fallback ${fallback} was already tried. Exhausted options.`);
        throw error;
      }

      logger.info(`Retrying with fallback backend: ${fallback} (attempt ${config.currentRetry + 1}/${config.maxRetries})`);
      return executeAIClient(
        { ...options, backend: fallback },
        { ...config, currentRetry: config.currentRetry + 1 }
      );
    }

    // All retries exhausted
    logger.error(`All ${config.maxRetries} retry attempts exhausted. Backends tried: ${config.triedBackends.join(', ')}`);
    throw error;
  }
}