/**
 * Smart Model Selection
 *
 * Rule-based system for selecting the optimal AI backend based on task characteristics.
 * Simpler and more pragmatic than meta-orchestration approaches.
 */
import { BACKENDS } from '../utils/aiExecutor.js';
import { logAudit } from '../utils/auditTrail.js';
/**
 * Backend selection statistics
 */
class BackendStats {
    stats = new Map();
    /**
     * Record a backend call
     */
    recordCall(backend, success, responseTimeMs) {
        const current = this.stats.get(backend) || {
            backend,
            totalCalls: 0,
            successfulCalls: 0,
            failedCalls: 0,
            avgResponseTime: 0,
            lastUsed: new Date()
        };
        current.totalCalls++;
        if (success) {
            current.successfulCalls++;
        }
        else {
            current.failedCalls++;
        }
        // Update average response time
        current.avgResponseTime =
            (current.avgResponseTime * (current.totalCalls - 1) + responseTimeMs) / current.totalCalls;
        current.lastUsed = new Date();
        this.stats.set(backend, current);
    }
    /**
     * Get statistics for a backend
     */
    getStats(backend) {
        return this.stats.get(backend);
    }
    /**
     * Get all statistics
     */
    getAllStats() {
        return Array.from(this.stats.values());
    }
    /**
     * Get success rate for a backend
     */
    getSuccessRate(backend) {
        const stats = this.stats.get(backend);
        if (!stats || stats.totalCalls === 0)
            return 1.0; // Assume good if unknown
        return stats.successfulCalls / stats.totalCalls;
    }
}
/**
 * Global backend statistics
 */
const backendStats = new BackendStats();
/**
 * Select optimal backend based on task characteristics
 */
import { circuitBreaker } from '../utils/circuitBreaker.js';
/**
 * Select optimal backend based on task characteristics
 */
export function selectOptimalBackend(task, allowedBackends) {
    const candidates = allowedBackends || Object.values(BACKENDS);
    // Filter out unavailable backends
    const availableCandidates = candidates.filter(b => circuitBreaker.isAvailable(b));
    if (availableCandidates.length === 0) {
        // If all are down, return a default (likely Cursor) and let the circuit breaker throw the error
        // or return the "least failed" one. For now, return primary fallback.
        return BACKENDS.CURSOR;
    }
    // Helper to check if a backend is available
    const isAvailable = (b) => availableCandidates.includes(b);
    // 1. Architectural tasks -> Gemini > Qwen > Cursor
    if (task.requiresArchitecturalThinking || task.domain === 'architecture') {
        if (isAvailable(BACKENDS.GEMINI))
            return BACKENDS.GEMINI;
        if (isAvailable(BACKENDS.QWEN))
            return BACKENDS.QWEN;
        return availableCandidates[0];
    }
    // 2. Code generation / Implementation -> Droid > Rovodev > Cursor
    if (task.requiresCodeGeneration && !task.requiresSpeed) {
        if (isAvailable(BACKENDS.DROID))
            return BACKENDS.DROID;
        if (isAvailable(BACKENDS.ROVODEV))
            return BACKENDS.ROVODEV;
        return availableCandidates[0];
    }
    // 3. Debugging / Testing / Refactoring -> Cursor Agent > Qwen
    if (task.domain === 'debugging' || task.domain === 'security' || task.requiresSpeed) {
        if (isAvailable(BACKENDS.CURSOR))
            return BACKENDS.CURSOR;
        if (isAvailable(BACKENDS.QWEN))
            return BACKENDS.QWEN;
        return availableCandidates[0];
    }
    // 4. Default fallback
    return availableCandidates[0];
}
/**
 * Select multiple backends for parallel analysis
 */
export function selectParallelBackends(task, count = 2) {
    const selections = [];
    const allBackends = [BACKENDS.CURSOR, BACKENDS.GEMINI, BACKENDS.DROID, BACKENDS.QWEN, BACKENDS.ROVODEV];
    const available = allBackends.filter(b => circuitBreaker.isAvailable(b));
    if (available.length === 0)
        return [BACKENDS.CURSOR]; // Fallback
    // Strategy: diversify for different strengths
    if (count >= 1) {
        // First choice: optimal backend
        const primary = selectOptimalBackend(task, available);
        selections.push(primary);
    }
    if (count >= 2 && selections.length < count) {
        // Second choice: complementary backend
        const remaining = available.filter(b => !selections.includes(b));
        if (remaining.length > 0) {
            // Simple diversification logic
            if (selections[0] === BACKENDS.GEMINI || selections[0] === BACKENDS.QWEN) {
                // If primary is "thinker", add "doer"
                const doer = remaining.find(b => b === BACKENDS.DROID || b === BACKENDS.ROVODEV);
                selections.push(doer || remaining[0]);
            }
            else {
                // If primary is "doer", add "thinker"
                const thinker = remaining.find(b => b === BACKENDS.GEMINI || b === BACKENDS.QWEN);
                selections.push(thinker || remaining[0]);
            }
        }
    }
    if (count >= 3 && selections.length < count) {
        // Fill remaining slots
        const remaining = available.filter(b => !selections.includes(b));
        selections.push(...remaining.slice(0, count - selections.length));
    }
    return selections.slice(0, count);
}
/**
 * Record backend usage for learning
 */
export function recordBackendUsage(backend, task, success, responseTimeMs) {
    backendStats.recordCall(backend, success, responseTimeMs);
    // Audit log
    logAudit({
        operation: 'backend-selection',
        autonomyLevel: 'MEDIUM',
        details: `Backend: ${backend}, Success: ${success}, Time: ${responseTimeMs}ms, Task: ${JSON.stringify(task)}`
    }).catch(err => console.warn('Failed to log backend usage:', err));
}
/**
 * Get backend statistics
 */
export function getBackendStats() {
    return backendStats.getAllStats();
}
/**
 * Select a fallback backend when the primary fails
 * Returns a different backend from the failed one, prioritizing by reliability
 */
export function selectFallbackBackend(failedBackend) {
    // Priority order for fallbacks (most reliable first)
    const fallbackOrder = [
        BACKENDS.GEMINI,
        BACKENDS.CURSOR,
        BACKENDS.DROID,
        BACKENDS.QWEN,
        BACKENDS.ROVODEV
    ];
    // Filter out the failed backend and unavailable ones
    const available = fallbackOrder.filter(b => b !== failedBackend && circuitBreaker.isAvailable(b));
    if (available.length > 0) {
        return available[0];
    }
    // If all are unavailable, return first that's not the failed one
    // (let circuit breaker handle the error)
    const anyOther = fallbackOrder.find(b => b !== failedBackend);
    return anyOther || BACKENDS.GEMINI;
}
/**
 * Get recommendations for backend selection
 */
export function getBackendRecommendations() {
    const stats = backendStats.getAllStats();
    if (stats.length === 0) {
        return 'No backend usage data available yet.';
    }
    const sorted = stats.sort((a, b) => b.successfulCalls - a.successfulCalls);
    let report = '# Backend Usage Statistics\n\n';
    for (const stat of sorted) {
        const successRate = (stat.successfulCalls / stat.totalCalls * 100).toFixed(1);
        report += `## ${stat.backend}\n`;
        report += `- Total Calls: ${stat.totalCalls}\n`;
        report += `- Success Rate: ${successRate}%\n`;
        report += `- Avg Response Time: ${stat.avgResponseTime.toFixed(0)}ms\n`;
        report += `- Last Used: ${stat.lastUsed.toISOString()}\n\n`;
    }
    return report;
}
/**
 * Helper to create task characteristics from workflow context
 */
export function createTaskCharacteristics(workflowName, customOverrides) {
    // Default characteristics based on workflow
    const defaults = {
        'parallel-review': {
            complexity: 'high',
            tokenBudget: 50000,
            requiresArchitecturalThinking: true,
            requiresCodeGeneration: false,
            requiresSpeed: false,
            requiresCreativity: false,
            domain: 'architecture'
        },
        'pre-commit-validate': {
            complexity: 'medium',
            tokenBudget: 30000,
            requiresArchitecturalThinking: false,
            requiresCodeGeneration: false,
            requiresSpeed: true,
            requiresCreativity: false,
            domain: 'security'
        },
        'bug-hunt': {
            complexity: 'high',
            tokenBudget: 40000,
            requiresArchitecturalThinking: false,
            requiresCodeGeneration: false,
            requiresSpeed: false,
            requiresCreativity: false,
            domain: 'debugging'
        },
        'feature-design': {
            complexity: 'high',
            tokenBudget: 60000,
            requiresArchitecturalThinking: true,
            requiresCodeGeneration: true,
            requiresSpeed: false,
            requiresCreativity: true,
            domain: 'architecture'
        },
        'validate-last-commit': {
            complexity: 'medium',
            tokenBudget: 25000,
            requiresArchitecturalThinking: false,
            requiresCodeGeneration: false,
            requiresSpeed: true,
            requiresCreativity: false,
            domain: 'general'
        }
    };
    const base = defaults[workflowName] || {
        complexity: 'medium',
        tokenBudget: 30000,
        requiresArchitecturalThinking: false,
        requiresCodeGeneration: false,
        requiresSpeed: false,
        requiresCreativity: false,
        domain: 'general'
    };
    return { ...base, ...customOverrides };
}
//# sourceMappingURL=modelSelector.js.map