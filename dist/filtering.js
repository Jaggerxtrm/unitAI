export const FIELD_SCHEMAS = {
// To be populated by modules
};
/**
 * Validate that requested fields are allowed for the endpoint
 */
export function validateFields(endpoint, fields) {
    // If no schema defined for endpoint, allow all (or strict fail depending on policy)
    // For now, we'll warn or pass.
    // Ideally, we check against a set of allowed keys.
    return;
}
/**
 * Helper to extract specific allowed keys from a Zod schema if possible,
 * or just a simple string array registry.
 */
export const ALLOWED_FIELDS = {
// Example: 'get_activity': new Set(['timestamp', 'tool', 'model'])
};
export function checkFieldsAllowed(endpoint, fields) {
    const allowed = ALLOWED_FIELDS[endpoint];
    if (!allowed)
        return; // No restriction defined
    const invalid = fields.filter(f => !allowed.has(f));
    if (invalid.length > 0) {
        throw new Error(`Invalid fields for ${endpoint}: ${invalid.join(", ")}`);
    }
}
//# sourceMappingURL=filtering.js.map