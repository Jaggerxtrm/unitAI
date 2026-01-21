/**
 * Field filtering and schema validation
 */
import { z } from "zod";
export declare const FIELD_SCHEMAS: Record<string, z.ZodType<any>>;
/**
 * Validate that requested fields are allowed for the endpoint
 */
export declare function validateFields(endpoint: string, fields: string[]): void;
/**
 * Helper to extract specific allowed keys from a Zod schema if possible,
 * or just a simple string array registry.
 */
export declare const ALLOWED_FIELDS: Record<string, Set<string>>;
export declare function checkFieldsAllowed(endpoint: string, fields: string[]): void;
//# sourceMappingURL=filtering.d.ts.map