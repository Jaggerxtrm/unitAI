#!/usr/bin/env node
/**
 * Activity Dashboard CLI
 *
 * Terminal-based dashboard for monitoring MCP server user activity,
 * tool usage, workflow execution, and agent performance metrics.
 *
 * Usage:
 *   npm run activity-dashboard              # Show current dashboard
 *   npm run activity-dashboard --days 30    # Last 30 days
 *   npm run activity-dashboard --watch      # Auto-refresh mode
 *   npm run activity-dashboard --compact    # Compact mode
 *   npm run activity-dashboard --export     # Export to JSON
 */
/**
 * CLI options
 */
interface CLIOptions {
    days: number;
    watch: boolean;
    compact: boolean;
    noColor: boolean;
    noCharts: boolean;
    export: boolean;
    exportFormat: 'json' | 'csv';
    refreshInterval: number;
    help: boolean;
}
/**
 * Export summary data to file
 */
declare function exportData(summary: any, format: 'json' | 'csv', days: number): void;
/**
 * Render and display dashboard
 */
declare function displayDashboard(options: CLIOptions): void;
export { CLIOptions, displayDashboard, exportData };
//# sourceMappingURL=activityDashboard.d.ts.map