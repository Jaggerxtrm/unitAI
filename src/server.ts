/**
 * UnitAI MCP Server Wrapper
 * 
 * Standardized server entry point that handles:
 * - Dependency Injection
 * - Transport connection
 * - Tool registration
 * - Error handling
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MCP_CONFIG } from "./constants.js";
import { logger } from "./utils/logger.js";
import { AppDependencies, initializeDependencies, closeDependencies } from "./dependencies.js";
import { getToolDefinitions, executeTool, toolExists } from "./tools/index.js";

export class UnitAIServer {
    private server: Server;
    private dependencies: AppDependencies;

    constructor() {
        this.dependencies = initializeDependencies();

        this.server = new Server(
            {
                name: MCP_CONFIG.SERVER_NAME,
                version: MCP_CONFIG.VERSION,
            },
            {
                capabilities: MCP_CONFIG.CAPABILITIES,
            }
        );

        this.setupHandlers();
    }

    /**
     * Setup MCP Request Handlers
     */
    private setupHandlers(): void {
        // List Tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            logger.debug("Received ListTools request");
            const tools = getToolDefinitions();
            logger.debug(`Returning ${tools.length} tools`);
            return { tools };
        });

        // Call Tool
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name: toolName, arguments: args = {} } = request.params;

            logger.info(`Tool call: ${toolName}`);

            if (!toolExists(toolName)) {
                logger.error(`Tool not found: ${toolName}`);
                throw new Error(`Tool '${toolName}' not found`);
                // Note: SDK handles errors and returns isError: true
            }

            // TODO: Add proper progress reporting hook if SDK supports it in this handler context
            // For now, simple execution
            const onProgress = (msg: string) => logger.progress(msg);

            try {
                const result = await executeTool(toolName, args, onProgress);
                return {
                    content: [
                        {
                            type: "text",
                            text: typeof result === 'string' ? result : JSON.stringify(result),
                        },
                    ],
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.error(`Tool ${toolName} failed: ${errorMessage}`);
                throw error; // Let SDK wrap it
            }
        });
    }

    /**
     * Start the server
     */
    async start(): Promise<void> {
        try {
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            logger.info("UnitAI MCP Server started (Stdio)");
        } catch (error) {
            logger.error("Failed to start server", error);
            closeDependencies();
            process.exit(1);
        }
    }

    /**
     * Graceful shutdown
     */
    async stop(): Promise<void> {
        logger.info("Stopping server...");
        closeDependencies();
    }
}
