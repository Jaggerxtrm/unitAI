#!/usr/bin/env node

/**
 * Unified AI MCP Tool - Model Context Protocol server for multiple AI clients
 *
 * This server enables AI assistants like Claude to interact with multiple 
 * AI coding assistants (Gemini, Cursor Agent, Droid) through the Model Context Protocol.
 */

import { UnitAIServer } from "./server.js";
import { logger } from "./utils/logger.js";

/**
 * Start the server
 */
async function main() {
  logger.info("Starting Unified AI MCP Tool server...");

  const server = new UnitAIServer();
  await server.start();
}

// Run the server
main().catch((error) => {
  logger.error(`Fatal error: ${error}`);
  process.exit(1);
});