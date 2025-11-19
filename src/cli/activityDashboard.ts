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

import { getActivityAnalytics } from '../services/activityAnalytics.js';
import { DashboardRenderer } from '../utils/dashboardRenderer.js';
import * as fs from 'fs';
import * as path from 'path';

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
 * Parse command line arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    days: 7,
    watch: false,
    compact: false,
    noColor: false,
    noCharts: false,
    export: false,
    exportFormat: 'json',
    refreshInterval: 5000,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;

      case '--days':
      case '-d':
        options.days = parseInt(args[++i], 10) || 7;
        break;

      case '--watch':
      case '-w':
        options.watch = true;
        break;

      case '--compact':
      case '-c':
        options.compact = true;
        break;

      case '--no-color':
        options.noColor = true;
        break;

      case '--no-charts':
        options.noCharts = true;
        break;

      case '--export':
      case '-e':
        options.export = true;
        break;

      case '--format':
      case '-f':
        const format = args[++i];
        if (format === 'json' || format === 'csv') {
          options.exportFormat = format;
        }
        break;

      case '--refresh':
      case '-r':
        options.refreshInterval = parseInt(args[++i], 10) * 1000 || 5000;
        break;
    }
  }

  return options;
}

/**
 * Display help message
 */
function showHelp(): void {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    MCP Server Activity Dashboard                           ║
╚════════════════════════════════════════════════════════════════════════════╝

Monitor user activity, tool usage, workflow execution, and performance metrics.

USAGE:
  activity-dashboard [options]

OPTIONS:
  -h, --help              Show this help message
  -d, --days <number>     Number of days to analyze (default: 7)
  -w, --watch             Enable auto-refresh mode
  -r, --refresh <seconds> Refresh interval for watch mode (default: 5)
  -c, --compact           Use compact display mode
  --no-color              Disable colored output
  --no-charts             Hide activity charts
  -e, --export            Export data to file
  -f, --format <format>   Export format: json or csv (default: json)

EXAMPLES:
  activity-dashboard                          # Show last 7 days
  activity-dashboard --days 30                # Show last 30 days
  activity-dashboard --watch                  # Auto-refresh every 5 seconds
  activity-dashboard --watch --refresh 10     # Auto-refresh every 10 seconds
  activity-dashboard --compact --no-charts    # Minimal view
  activity-dashboard --export --format json   # Export to JSON file
  activity-dashboard --export --format csv    # Export to CSV file

METRICS TRACKED:
  • Tool invocations and success rates
  • Workflow executions and performance
  • Token savings from optimization
  • Audit trail of autonomous operations
  • Activity patterns by hour and day
  • Agent performance metrics

NOTES:
  • Data is aggregated from audit trail, token metrics, and activity logs
  • Watch mode clears the screen and updates in real-time
  • Export files are saved to ./data/exports/ directory
  `);
}

/**
 * Export summary data to file
 */
function exportData(summary: any, format: 'json' | 'csv', days: number): void {
  const exportDir = path.join(process.cwd(), 'data', 'exports');
  
  // Ensure export directory exists
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `activity-dashboard-${days}d-${timestamp}.${format}`;
  const filepath = path.join(exportDir, filename);

  try {
    if (format === 'json') {
      fs.writeFileSync(filepath, JSON.stringify(summary, null, 2), 'utf8');
    } else if (format === 'csv') {
      const csv = convertToCSV(summary);
      fs.writeFileSync(filepath, csv, 'utf8');
    }

    console.log(`\n✅ Data exported successfully to: ${filepath}\n`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Failed to export data: ${errorMsg}\n`);
    process.exit(1);
  }
}

/**
 * Convert summary data to CSV format
 */
function convertToCSV(summary: any): string {
  let csv = '';

  // Overall stats
  csv += 'OVERALL STATISTICS\n';
  csv += 'Metric,Value\n';
  csv += `Period,${summary.period}\n`;
  csv += `Total Operations,${summary.totalOperations}\n`;
  csv += `Tool Invocations,${summary.toolInvocations}\n`;
  csv += `Workflow Executions,${summary.workflowExecutions}\n`;
  csv += `Tokens Saved,${summary.tokensSaved}\n`;
  csv += `Success Rate,${(summary.successRate * 100).toFixed(2)}%\n\n`;

  // Top tools
  csv += 'TOP TOOLS\n';
  csv += 'Tool Name,Invocations,Success Rate,Last Used\n';
  summary.topTools.forEach((tool: any) => {
    csv += `${tool.toolName},${tool.invocations},${(tool.successRate * 100).toFixed(2)}%,${tool.lastUsed}\n`;
  });
  csv += '\n';

  // Top workflows
  csv += 'TOP WORKFLOWS\n';
  csv += 'Workflow Name,Executions,Success Count,Failure Count,Last Executed\n';
  summary.topWorkflows.forEach((workflow: any) => {
    csv += `${workflow.workflowName},${workflow.executions},${workflow.successCount},${workflow.failureCount},${workflow.lastExecuted}\n`;
  });
  csv += '\n';

  // Activity by day
  csv += 'ACTIVITY BY DAY\n';
  csv += 'Date,Count\n';
  summary.activityByDay.forEach((day: any) => {
    csv += `${day.date},${day.count}\n`;
  });

  return csv;
}

/**
 * Render and display dashboard
 */
function displayDashboard(options: CLIOptions): void {
  try {
    const analytics = getActivityAnalytics();
    const summary = analytics.getActivitySummary(options.days);

    const renderer = new DashboardRenderer({
      useColors: !options.noColor,
      compactMode: options.compact,
      showCharts: !options.noCharts,
      refreshInterval: options.watch ? options.refreshInterval : undefined
    });

    const output = renderer.renderDashboard(summary);
    console.log(output);

    // Export if requested
    if (options.export) {
      exportData(summary, options.exportFormat, options.days);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Error generating dashboard: ${errorMsg}\n`);
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const options = parseArgs();

  // Show help
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Display dashboard
  if (options.watch) {
    // Watch mode: continuous updates
    console.log('Starting activity dashboard in watch mode...\n');
    
    // Initial display
    displayDashboard(options);

    // Set up interval for updates
    const intervalId = setInterval(() => {
      displayDashboard(options);
    }, options.refreshInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      clearInterval(intervalId);
      console.log('\n\n👋 Dashboard stopped.\n');
      process.exit(0);
    });
  } else {
    // Single display
    displayDashboard(options);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for programmatic use
export { CLIOptions, displayDashboard, exportData };
