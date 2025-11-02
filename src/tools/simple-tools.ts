import { z } from "zod";
import { CLI } from "../constants.js";
import { executeSimpleCommand } from "../utils/aiExecutor.js";
import type { UnifiedTool } from "./registry.js";

/**
 * Ping tool - simple echo test
 */
export const pingTool: UnifiedTool = {
  name: "ping",
  description: "Echo a message to test the connection",
  category: "simple",
  zodSchema: z.object({
    prompt: z.string().optional().default("Unified AI Pong!").describe("Message to echo")
  }),
  execute: async (args) => {
    const message = args.prompt || "Unified AI Pong!";
    return executeSimpleCommand(CLI.COMMANDS.ECHO, [message]);
  },
  prompt: {
    name: "ping",
    description: "Test the connection with a simple echo",
    arguments: [
      {
        name: "prompt",
        description: "Optional message to echo (defaults to 'Unified AI Pong!')",
        required: false
      }
    ]
  }
};

/**
 * Qwen Help tool - show Qwen CLI help
 */
export const qwenHelpTool: UnifiedTool = {
  name: "qwen-help",
  description: "Display Qwen CLI help information",
  category: "simple",
  zodSchema: z.object({}),
  execute: async () => {
    return executeSimpleCommand(CLI.COMMANDS.QWEN, ["--help"]);
  },
  prompt: {
    name: "qwen-help",
    description: "Show Qwen CLI help and available options",
    arguments: []
  }
};

/**
 * Rovodev Help tool - show Rovodev CLI help
 */
export const rovodevHelpTool: UnifiedTool = {
  name: "rovodev-help",
  description: "Display Rovodev CLI help information",
  category: "simple",
  zodSchema: z.object({}),
  execute: async () => {
    return executeSimpleCommand(CLI.COMMANDS.ROVODEV, [CLI.COMMANDS.ROVODEV_SUBCOMMAND, "--help"]);
  },
  prompt: {
    name: "rovodev-help",
    description: "Show Rovodev CLI help and available options",
    arguments: []
  }
};

/**
 * Gemini Help tool - show Gemini CLI help
 */
export const geminiHelpTool: UnifiedTool = {
  name: "gemini-help",
  description: "Display Gemini CLI help information",
  category: "simple",
  zodSchema: z.object({}),
  execute: async () => {
    return executeSimpleCommand(CLI.COMMANDS.GEMINI, [CLI.FLAGS.GEMINI.HELP]);
  },
  prompt: {
    name: "gemini-help",
    description: "Show Gemini CLI help and available options",
    arguments: []
  }
};