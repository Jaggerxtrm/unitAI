/**
 * Dashboard Renderer Utility
 * 
 * Provides terminal-based rendering for the activity dashboard.
 * Supports real-time updates, charts, and formatted output.
 */

import type { 
  UserActivitySummary, 
  ToolUsageStats, 
  WorkflowStats 
} from '../services/activityAnalytics.js';

/**
 * Color codes for terminal output
 */
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

/**
 * Dashboard rendering options
 */
export interface DashboardOptions {
  useColors: boolean;
  compactMode: boolean;
  showCharts: boolean;
  refreshInterval?: number;
}

/**
 * Dashboard Renderer
 * 
 * Renders activity data in a user-friendly terminal dashboard format
 */
export class DashboardRenderer {
  private options: DashboardOptions;

  constructor(options: Partial<DashboardOptions> = {}) {
    this.options = {
      useColors: true,
      compactMode: false,
      showCharts: true,
      ...options
    };
  }

  /**
   * Render complete activity dashboard
   */
  renderDashboard(summary: UserActivitySummary): string {
    let output = '';

    // Clear screen for refresh
    if (this.options.refreshInterval) {
      output += '\x1b[2J\x1b[H'; // Clear screen and move cursor to top
    }

    output += this.renderHeader(summary);
    output += this.renderOverallStats(summary);
    output += this.renderToolUsage(summary.topTools);
    output += this.renderWorkflowStats(summary.topWorkflows);
    output += this.renderTokenSavings(summary);
    output += this.renderAuditSummary(summary);
    
    if (this.options.showCharts) {
      output += this.renderActivityCharts(summary);
    }

    output += this.renderFooter();

    return output;
  }

  /**
   * Render dashboard header
   */
  private renderHeader(summary: UserActivitySummary): string {
    const timestamp = new Date().toLocaleString();
    const separator = '═'.repeat(80);

    let output = '';
    output += this.color(separator, 'cyan') + '\n';
    output += this.color('  🎯 MCP SERVER ACTIVITY DASHBOARD', 'bright', 'cyan') + '\n';
    output += this.color(`  ${summary.period}`, 'dim') + '\n';
    output += this.color(`  Last updated: ${timestamp}`, 'dim') + '\n';
    output += this.color(separator, 'cyan') + '\n\n';

    return output;
  }

  /**
   * Render overall statistics
   */
  private renderOverallStats(summary: UserActivitySummary): string {
    let output = this.color('📊 OVERALL STATISTICS', 'bright', 'blue') + '\n';
    output += this.color('─'.repeat(80), 'blue') + '\n\n';

    const stats = [
      { label: 'Total Operations', value: summary.totalOperations.toLocaleString(), icon: '🔢' },
      { label: 'Tool Invocations', value: summary.toolInvocations.toLocaleString(), icon: '🔧' },
      { label: 'Workflow Executions', value: summary.workflowExecutions.toLocaleString(), icon: '⚙️' },
      { label: 'Tokens Saved', value: summary.tokensSaved.toLocaleString(), icon: '💰' },
      { label: 'Success Rate', value: `${(summary.successRate * 100).toFixed(1)}%`, icon: '✅' }
    ];

    // Render in two columns
    for (let i = 0; i < stats.length; i += 2) {
      const left = stats[i];
      const right = stats[i + 1];

      const leftStr = `  ${left.icon} ${left.label}: ${this.color(left.value, 'bright', 'green')}`;
      const rightStr = right 
        ? `${right.icon} ${right.label}: ${this.color(right.value, 'bright', 'green')}`
        : '';

      output += leftStr.padEnd(50) + rightStr + '\n';
    }

    output += '\n';
    return output;
  }

  /**
   * Render tool usage statistics
   */
  private renderToolUsage(tools: ToolUsageStats[]): string {
    if (tools.length === 0) {
      return '';
    }

    let output = this.color('🔧 TOP TOOLS', 'bright', 'magenta') + '\n';
    output += this.color('─'.repeat(80), 'magenta') + '\n\n';

    if (this.options.compactMode) {
      // Compact view: one line per tool
      tools.slice(0, 5).forEach((tool, index) => {
        const successRate = (tool.successRate * 100).toFixed(1);
        const successColor = tool.successRate > 0.9 ? 'green' : tool.successRate > 0.7 ? 'yellow' : 'red';
        
        output += `  ${index + 1}. ${tool.toolName.padEnd(25)} `;
        output += `Calls: ${String(tool.invocations).padStart(5)} `;
        output += `Success: ${this.color(successRate + '%', successColor)} `;
        output += `Last: ${this.formatRelativeTime(tool.lastUsed)}\n`;
      });
    } else {
      // Detailed view
      tools.slice(0, 10).forEach((tool, index) => {
        output += `  ${this.color(`${index + 1}. ${tool.toolName}`, 'bright')}\n`;
        output += `     Invocations: ${this.color(tool.invocations.toString(), 'cyan')}\n`;
        
        const successRate = (tool.successRate * 100).toFixed(1);
        const successColor = tool.successRate > 0.9 ? 'green' : tool.successRate > 0.7 ? 'yellow' : 'red';
        output += `     Success Rate: ${this.color(successRate + '%', successColor)}\n`;
        
        if (tool.avgResponseTime) {
          output += `     Avg Response: ${tool.avgResponseTime.toFixed(0)}ms\n`;
        }
        
        output += `     Last Used: ${this.formatRelativeTime(tool.lastUsed)}\n\n`;
      });
    }

    output += '\n';
    return output;
  }

  /**
   * Render workflow statistics
   */
  private renderWorkflowStats(workflows: WorkflowStats[]): string {
    if (workflows.length === 0) {
      return '';
    }

    let output = this.color('⚙️  WORKFLOW EXECUTIONS', 'bright', 'yellow') + '\n';
    output += this.color('─'.repeat(80), 'yellow') + '\n\n';

    workflows.slice(0, 10).forEach((workflow, index) => {
      const successRate = workflow.executions > 0
        ? (workflow.successCount / workflow.executions * 100).toFixed(1)
        : '0.0';
      
      const successColor = parseFloat(successRate) > 90 ? 'green' : parseFloat(successRate) > 70 ? 'yellow' : 'red';

      output += `  ${this.color(`${index + 1}. ${workflow.workflowName}`, 'bright')}\n`;
      output += `     Executions: ${this.color(workflow.executions.toString(), 'cyan')} `;
      output += `(${this.color('✓ ' + workflow.successCount, 'green')} / `;
      output += `${this.color('✗ ' + workflow.failureCount, 'red')})\n`;
      output += `     Success Rate: ${this.color(successRate + '%', successColor)}\n`;
      
      if (workflow.avgDuration) {
        output += `     Avg Duration: ${this.formatDuration(workflow.avgDuration)}\n`;
      }
      
      output += `     Last Run: ${this.formatRelativeTime(workflow.lastExecuted)}\n\n`;
    });

    output += '\n';
    return output;
  }

  /**
   * Render token savings statistics
   */
  private renderTokenSavings(summary: UserActivitySummary): string {
    const stats = summary.tokenStats;

    let output = this.color('💰 TOKEN SAVINGS', 'bright', 'green') + '\n';
    output += this.color('─'.repeat(80), 'green') + '\n\n';

    output += `  Total Suggestions: ${this.color(stats.totalSuggestions.toString(), 'cyan')}\n`;
    output += `  Followed: ${this.color(stats.suggestionsFollowed.toString(), 'green')} `;
    output += `(${this.color(stats.followRate + '%', 'green')})\n`;
    output += `  Ignored: ${this.color(stats.suggestionsIgnored.toString(), 'yellow')}\n`;
    output += `  Estimated Savings: ${this.color(stats.totalEstimatedSavings.toLocaleString() + ' tokens', 'bright', 'green')}\n`;
    
    if (stats.totalActualSavings > 0) {
      output += `  Actual Savings: ${this.color(stats.totalActualSavings.toLocaleString() + ' tokens', 'bright', 'green')}\n`;
    }
    
    output += `  Avg per Suggestion: ${this.color(stats.averageSavingsPerSuggestion.toString() + ' tokens', 'cyan')}\n\n`;

    // Show top blocked tools
    if (Object.keys(stats.byBlockedTool).length > 0) {
      output += `  ${this.color('Top Blocked Tools:', 'dim')}\n`;
      const sortedTools = Object.entries(stats.byBlockedTool)
        .sort((a, b) => b[1].savings - a[1].savings)
        .slice(0, 3);

      sortedTools.forEach(([tool, data]) => {
        output += `    • ${tool}: ${data.count} suggestions, ${data.savings.toLocaleString()} tokens saved\n`;
      });
    }

    output += '\n';
    return output;
  }

  /**
   * Render audit trail summary
   */
  private renderAuditSummary(summary: UserActivitySummary): string {
    const stats = summary.auditStats;

    let output = this.color('📝 AUDIT TRAIL', 'bright', 'cyan') + '\n';
    output += this.color('─'.repeat(80), 'cyan') + '\n\n';

    output += `  Total Entries: ${this.color(stats.totalEntries.toString(), 'cyan')}\n`;
    output += `  Approved: ${this.color(stats.approvedOperations.toString(), 'green')} `;
    output += `Denied: ${this.color(stats.deniedOperations.toString(), 'red')}\n`;
    output += `  Successful: ${this.color(stats.successfulOperations.toString(), 'green')} `;
    output += `Failed: ${this.color(stats.failedOperations.toString(), 'red')}\n\n`;

    // Show operations breakdown
    if (Object.keys(stats.byOperation).length > 0) {
      output += `  ${this.color('Operations:', 'dim')}\n`;
      const sortedOps = Object.entries(stats.byOperation)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      sortedOps.forEach(([op, count]) => {
        output += `    • ${op}: ${count}\n`;
      });
    }

    output += '\n';
    return output;
  }

  /**
   * Render activity charts
   */
  private renderActivityCharts(summary: UserActivitySummary): string {
    let output = this.color('📈 ACTIVITY PATTERNS', 'bright', 'blue') + '\n';
    output += this.color('─'.repeat(80), 'blue') + '\n\n';

    // Activity by hour chart
    output += this.color('  Activity by Hour of Day:', 'dim') + '\n';
    output += this.renderBarChart(
      summary.activityByHour.map(h => ({ label: h.hour.toString().padStart(2, '0'), value: h.count })),
      40
    );
    output += '\n';

    // Activity by day chart (last 7 days)
    const recentDays = summary.activityByDay.slice(-7);
    output += this.color('  Activity by Day (Last 7 Days):', 'dim') + '\n';
    output += this.renderBarChart(
      recentDays.map(d => ({ 
        label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        value: d.count 
      })),
      40
    );
    output += '\n';

    return output;
  }

  /**
   * Render a simple horizontal bar chart
   */
  private renderBarChart(data: { label: string; value: number }[], maxWidth: number = 40): string {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    let output = '';

    data.forEach(item => {
      const barWidth = Math.round((item.value / maxValue) * maxWidth);
      const bar = '█'.repeat(barWidth);
      const valueStr = item.value.toString().padStart(5);
      
      output += `    ${item.label.padEnd(10)} ${this.color(bar, 'cyan')} ${this.color(valueStr, 'dim')}\n`;
    });

    return output;
  }

  /**
   * Render dashboard footer
   */
  private renderFooter(): string {
    const separator = '═'.repeat(80);
    let output = '';

    output += this.color(separator, 'cyan') + '\n';
    
    if (this.options.refreshInterval) {
      output += this.color(`  🔄 Auto-refreshing every ${this.options.refreshInterval / 1000}s. Press Ctrl+C to exit.`, 'dim') + '\n';
    } else {
      output += this.color('  💡 Run with --watch to enable auto-refresh', 'dim') + '\n';
    }
    
    output += this.color(separator, 'cyan') + '\n';

    return output;
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      return `${(ms / 60000).toFixed(1)}m`;
    }
  }

  /**
   * Format relative time
   */
  private formatRelativeTime(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Apply color to text
   */
  private color(text: string, ...colors: string[]): string {
    if (!this.options.useColors) {
      return text;
    }

    let colorCodes = '';
    colors.forEach(color => {
      if (color in COLORS) {
        colorCodes += (COLORS as any)[color];
      }
    });

    return colorCodes + text + COLORS.reset;
  }
}

/**
 * Export a simple function for quick dashboard rendering
 */
export function renderActivityDashboard(
  summary: UserActivitySummary,
  options?: Partial<DashboardOptions>
): string {
  const renderer = new DashboardRenderer(options);
  return renderer.renderDashboard(summary);
}
