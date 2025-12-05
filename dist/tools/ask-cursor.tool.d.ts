import { z } from "zod";
import type { UnifiedTool } from "./registry.js";
declare const cursorAgentSchema: z.ZodObject<{
    prompt: z.ZodString;
    model: z.ZodOptional<z.ZodEnum<["gpt-5.1", "gpt-5", "composer-1", "sonnet-4.5", "haiku-5", "deepseek-v3"]>>;
    outputFormat: z.ZodDefault<z.ZodEnum<["text", "json"]>>;
    files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    autoApprove: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    outputFormat: "json" | "text";
    autoApprove: boolean;
    model?: "gpt-5.1" | "gpt-5" | "composer-1" | "sonnet-4.5" | "haiku-5" | "deepseek-v3" | undefined;
    files?: string[] | undefined;
}, {
    prompt: string;
    model?: "gpt-5.1" | "gpt-5" | "composer-1" | "sonnet-4.5" | "haiku-5" | "deepseek-v3" | undefined;
    outputFormat?: "json" | "text" | undefined;
    autoApprove?: boolean | undefined;
    files?: string[] | undefined;
}>;
export type CursorAgentParams = z.infer<typeof cursorAgentSchema>;
export declare const cursorAgentTool: UnifiedTool;
export {};
//# sourceMappingURL=ask-cursor.tool.d.ts.map