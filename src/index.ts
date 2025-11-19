#!/usr/bin/env node

/**
 * Unified AI MCP Tool - Model Context Protocol server for multiple AI clients
 *
 * This server enables AI assistants like Claude to interact with multiple 
 * AI coding assistants (Gemini, Cursor Agent, Droid) through the Model Context Protocol.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MCP_CONFIG, STATUS_MESSAGES } from "./constants.js";
import { logger } from "./utils/logger.js";
import {
  getToolDefinitions,
  executeTool,
  toolExists,
} from "./tools/index.js";

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: MCP_CONFIG.SERVER_NAME,
    version: MCP_CONFIG.VERSION,
  },
  {
    capabilities: MCP_CONFIG.CAPABILITIES,
  }
);

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug("Received ListTools request");
  const tools = getToolDefinitions();
  logger.debug(`Returning ${tools.length} tools`);
  return { tools };
});

/**
 * Handler for calling a tool
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name: toolName, arguments: args = {} } = request.params;

  logger.info(`Tool call: ${toolName}`);

  // Check if tool exists
  if (!toolExists(toolName)) {
    logger.error(`Tool not found: ${toolName}`);
    return {
      content: [
        {
          type: "text",
          text: `Error: Tool '${toolName}' not found`,
        },
      ],
      isError: true,
    };
  }

  // Progress tracking
  let progressInterval: NodeJS.Timeout | null = null;
  const progressMessages = [
    STATUS_MESSAGES.THINKING,
    STATUS_MESSAGES.PROCESSING,
    STATUS_MESSAGES.SEARCHING,
  ];
  let progressIndex = 0;

  const onProgress = (message: string) => {
    logger.progress(message);
  };

  try {
    // Start keep-alive progress updates
    progressInterval = setInterval(() => {
      const message = progressMessages[progressIndex % progressMessages.length];
      progressIndex++;
      logger.progress(`${message} (elapsed: ${progressIndex * 25}s)`);
    }, MCP_CONFIG.KEEP_ALIVE_INTERVAL);

    // Execute the tool
    const result = await executeTool(toolName, args, onProgress);

    // Clear progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    logger.info(`Tool ${toolName} completed successfully`);

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  } catch (error) {
    // Clear progress interval
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Tool ${toolName} failed: ${errorMessage}`);

    return {
      content: [
        {
          type: "text",
          text: `Error executing ${toolName}: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  logger.info("Starting Unified AI MCP Tool server...");

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info("Server connected and ready");
  logger.info(`Available tools: ${getToolDefinitions().length}`);
}

// Run the server
main().catch((error) => {
  logger.error(`Fatal error: ${error}`);
  process.exit(1);
});