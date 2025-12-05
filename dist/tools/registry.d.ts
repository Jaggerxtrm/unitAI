import { z } from "zod";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
/**
 * Tool execution function type
 */
export type ToolExecuteFunction = (args: Record<string, any>, onProgress?: (message: string) => void) => Promise<string>;
/**
 * Unified tool definition
 */
export interface UnifiedTool {
    name: string;
    description: string;
    zodSchema: z.ZodObject<any>;
    execute: ToolExecuteFunction;
    category?: string;
    metadata?: {
        category?: string;
        bestFor?: string[];
        notFor?: string[];
        cost?: 'low' | 'medium' | 'high';
        duration?: string;
        backends?: string[];
        relatedTools?: string[];
    };
    examples?: Array<{
        scenario: string;
        params: Record<string, any>;
    }>;
    prompt?: {
        name: string;
        description: string;
        arguments?: Array<{
            name: string;
            description: string;
            required: boolean;
        }>;
    };
}
/**
 * Global tool registry
 */
export declare const toolRegistry: UnifiedTool[];
/**
 * Register a tool
 */
export declare function registerTool(tool: UnifiedTool): void;
/**
 * Check if a tool exists
 */
export declare function toolExists(name: string): boolean;
/**
 * Get all tool definitions in MCP format
 */
export declare function getToolDefinitions(): Tool[];
/**
 * Execute a tool by name
 */
export declare function executeTool(name: string, args: Record<string, any>, onProgress?: (message: string) => void): Promise<string>;
/**
 * Get prompt definitions for tools that have prompts
 */
export declare function getPromptDefinitions(): {
    name: string;
    description: string;
    arguments: {
        name: string;
        description: string;
        required: boolean;
    }[];
}[];
/**
 * Get a specific tool
 */
export declare function getTool(name: string): UnifiedTool | undefined;
/**
 * Get all tools
 */
export declare function getAllTools(): UnifiedTool[];
//# sourceMappingURL=registry.d.ts.map