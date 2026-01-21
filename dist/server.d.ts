export declare class UnitAIServer {
    private server;
    private dependencies;
    constructor();
    /**
     * Setup MCP Request Handlers
     */
    private setupHandlers;
    /**
     * Start the server
     */
    start(): Promise<void>;
    /**
     * Graceful shutdown
     */
    stop(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map