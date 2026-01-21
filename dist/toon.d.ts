/**
 * Token-Oriented Object Notation (TOON) Serializer
 *
 * A compact, token-efficient format for LLM data ingestion.
 * Format: type_name[count]{field1|field2}:
 *         |val1|val2
 *         |val1|val2
 */
/**
 * Serialize a list of objects to TOON format
 */
export declare function toToon<T extends Record<string, any>>(data: T[], typeName: string, fields?: string[]): string;
/**
 * Serialize a single object to TOON format
 */
export declare function singleToToon<T extends Record<string, any>>(data: T, typeName: string, fields?: string[]): string;
/**
 * Bundle structure for complex responses
 */
export interface ToonBundle {
    [key: string]: {
        data: any[];
        typeName: string;
        fields?: string[];
    };
}
/**
 * Serialize multiple datasets into a single TOON response
 */
export declare function bundleToToon(bundle: ToonBundle): string;
//# sourceMappingURL=toon.d.ts.map