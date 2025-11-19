/**
 * Smart Model Selection
 * 
 * Rule-based system for selecting the optimal AI backend based on task characteristics.
 * Simpler and more pragmatic than meta-orchestration approaches.
 */

import { BACKENDS } from '../utils/aiExecutor.js';
import { logAudit } from '../utils/auditTrail.js';

export interface TaskCharacteristics {
  complexity: 'low' | 'medium' | 'high';
  tokenBudget: number;
  requiresArchitecturalThinking: boolean;
  requiresCodeGeneration: boolean;
  requiresSpeed: boolean;
  requiresCreativity: boolean;
  domain?: 'security' | 'performance' | 'architecture' | 'debugging' | 'general';
}

export interface BackendMetrics {
  backend: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgResponseTime: number;
  lastUsed: Date;
}

/**
 * Backend selection statistics
 */
class BackendStats {
  private stats = new Map<string, BackendMetrics>();

  /**
   * Record a backend call
   */
  recordCall(backend: string, success: boolean, responseTimeMs: number): void {
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
    } else {
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
  getStats(backend: string): BackendMetrics | undefined {
    return this.stats.get(backend);
  }

  /**
   * Get all statistics
   */
  getAllStats(): BackendMetrics[] {
    return Array.from(this.stats.values());
  }

  /**
   * Get success rate for a backend
   */
  getSuccessRate(backend: string): number {
    const stats = this.stats.get(backend);
    if (!stats || stats.totalCalls === 0) return 1.0; // Assume good if unknown
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
export function selectOptimalBackend(
  task: TaskCharacteristics,
  allowedBackends?: string[]
): string {
  // 1. Architectural tasks -> Gemini
  if (task.requiresArchitecturalThinking || task.domain === 'architecture') {
    logAudit({
      operation: 'model-selection',
      autonomyLevel: 'MEDIUM',
      details: `Selected Gemini for architectural task. Task: ${JSON.stringify(task)}`
    });
    return BACKENDS.GEMINI;
  }

  // 2. Code generation / Implementation -> Droid (GLM-4.6)
  if (task.requiresCodeGeneration && !task.requiresSpeed) {
    logAudit({
      operation: 'model-selection',
      autonomyLevel: 'MEDIUM',
      details: `Selected Droid for implementation task. Task: ${JSON.stringify(task)}`
    });
    return BACKENDS.DROID;
  }

  // 3. Debugging / Testing / Refactoring -> Cursor Agent
  if (task.domain === 'debugging' || task.domain === 'security' || task.requiresSpeed) {
    logAudit({
      operation: 'model-selection',
      autonomyLevel: 'MEDIUM',
      details: `Selected Cursor Agent for debugging/speed. Task: ${JSON.stringify(task)}`
    });
    return BACKENDS.CURSOR;
  }

  // 4. Default fallback -> Cursor Agent
  logAudit({
    operation: 'model-selection',
    autonomyLevel: 'MEDIUM',
    details: `Selected Cursor Agent as default fallback. Task: ${JSON.stringify(task)}`
  });
  return BACKENDS.CURSOR;
}

/**
 * Select multiple backends for parallel analysis
 */
export function selectParallelBackends(
  task: TaskCharacteristics,
  count: number = 2
): string[] {
  const selections: string[] = [];
  const available = [BACKENDS.CURSOR, BACKENDS.GEMINI, BACKENDS.DROID];

  // Strategy: diversify for different strengths
  if (count >= 1) {
    // First choice: optimal backend
    const primary = selectOptimalBackend(task, available);
    selections.push(primary);
  }

  if (count >= 2 && selections.length < count) {
    // Second choice: complementary backend
    const remaining = available.filter(b => !selections.includes(b));

    if (selections[0] === BACKENDS.GEMINI) {
      // Complement Gemini with practical Droid
      selections.push(remaining.includes(BACKENDS.DROID) ? BACKENDS.DROID : remaining[0]);
    } else if (selections[0] === BACKENDS.DROID) {
      // Complement Droid with deep-thinking Gemini
      selections.push(remaining.includes(BACKENDS.GEMINI) ? BACKENDS.GEMINI : remaining[0]);
    } else {
      // Complement Cursor with analytical Gemini
      selections.push(remaining.includes(BACKENDS.GEMINI) ? BACKENDS.GEMINI : remaining[0]);
    }
  }

  if (count >= 3 && selections.length < count) {
    // Third choice: remaining backend
    const remaining = available.filter(b => !selections.includes(b));
    if (remaining.length > 0) {
      selections.push(remaining[0]);
    }
  }

  return selections.slice(0, count);
}

/**
 * Record backend usage for learning
 */
export function recordBackendUsage(
  backend: string,
  task: TaskCharacteristics,
  success: boolean,
  responseTimeMs: number
): void {
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
export function getBackendStats(): BackendMetrics[] {
  return backendStats.getAllStats();
}

/**
 * Get recommendations for backend selection
 */
export function getBackendRecommendations(): string {
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
export function createTaskCharacteristics(
  workflowName: string,
  customOverrides?: Partial<TaskCharacteristics>
): TaskCharacteristics {
  // Default characteristics based on workflow
  const defaults: Record<string, TaskCharacteristics> = {
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
