import { z } from "zod";
import type { UnifiedTool } from "./registry.js";
import { AutonomyLevel } from "../utils/permissionManager.js";
declare const droidSchema: z.ZodObject<{
    prompt: z.ZodString;
    model: z.ZodOptional<z.ZodEnum<["glm-4.6"]>>;
    auto: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    outputFormat: z.ZodDefault<z.ZodEnum<["text", "json"]>>;
    sessionId: z.ZodOptional<z.ZodString>;
    skipPermissionsUnsafe: z.ZodDefault<z.ZodBoolean>;
    files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cwd: z.ZodOptional<z.ZodString>;
    autonomyLevel: z.ZodOptional<z.ZodNativeEnum<typeof AutonomyLevel>>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    outputFormat: "json" | "text";
    auto: "low" | "medium" | "high";
    skipPermissionsUnsafe: boolean;
    autonomyLevel?: AutonomyLevel | undefined;
    model?: "glm-4.6" | undefined;
    sessionId?: string | undefined;
    cwd?: string | undefined;
    files?: string[] | undefined;
}, {
    prompt: string;
    autonomyLevel?: AutonomyLevel | undefined;
    model?: "glm-4.6" | undefined;
    outputFormat?: "json" | "text" | undefined;
    auto?: "low" | "medium" | "high" | undefined;
    sessionId?: string | undefined;
    skipPermissionsUnsafe?: boolean | undefined;
    cwd?: string | undefined;
    files?: string[] | undefined;
}>;
export type DroidToolParams = z.infer<typeof droidSchema>;
export declare const droidTool: UnifiedTool;
export {};
//# sourceMappingURL=droid.tool.d.ts.map