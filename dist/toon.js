/**
 * Token-Oriented Object Notation (TOON) Serializer
 *
 * A compact, token-efficient format for LLM data ingestion.
 * Format: type_name[count]{field1|field2}:
 *         |val1|val2
 *         |val1|val2
 */
/**
 * Format a single value according to TOON specs
 */
function formatValue(val) {
    if (val === null || val === undefined) {
        return "";
    }
    if (typeof val === "number") {
        // Round floats to 4 decimal places, keep integers as is if they are integers
        if (Number.isInteger(val)) {
            return val.toString();
        }
        return val.toFixed(4).replace(/\.?0+$/, "");
    }
    if (val instanceof Date) {
        return val.toISOString();
    }
    if (typeof val === "object") {
        return JSON.stringify(val);
    }
    // Escape pipes in strings if necessary (though TOON spec doesn't strictly specify escaping, 
    // it's safer to just return the string. Complexity of escaping depends on strictness.)
    // For now, simple string conversion.
    return String(val);
}
/**
 * Serialize a list of objects to TOON format
 */
export function toToon(data, typeName, fields) {
    if (!data || data.length === 0) {
        return `${typeName}[0]:`;
    }
    // Determine fields from the first object if not provided
    const targetFields = fields || Object.keys(data[0]);
    const header = `${typeName}[${data.length}]{${targetFields.join("|")}}:`;
    const rows = data.map(item => {
        const values = targetFields.map(field => formatValue(item[field]));
        return `    |${values.join("|")}`;
    });
    return [header, ...rows].join("\n");
}
/**
 * Serialize a single object to TOON format
 */
export function singleToToon(data, typeName, fields) {
    return toToon([data], typeName, fields);
}
/**
 * Serialize multiple datasets into a single TOON response
 */
export function bundleToToon(bundle) {
    return Object.values(bundle)
        .map(section => toToon(section.data, section.typeName, section.fields))
        .join("\n\n");
}
//# sourceMappingURL=toon.js.map