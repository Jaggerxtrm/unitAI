#!/usr/bin/env node
/**
 * CLI utility to view token savings metrics
 * 
 * Usage:
 *   npm run view-metrics              # Show last 7 days summary
 *   npm run view-metrics --days 30    # Show last 30 days
 *   npm run view-metrics --detailed   # Show detailed list
 */

import { getMetricsCollector, TokenSavingsMetrics } from '../src/utils/tokenEstimator.js';

interface CLIOptions {
  days: number;
  detailed: boolean;
  source?: 'enforcer-hook' | 'workflow' | 'manual';
  blockedTool?: string;
  help: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    days: 7,
    detailed: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--days' || arg === '-d') {
      options.days = parseInt(args[++i], 10) || 7;
    } else if (arg === '--detailed') {
      options.detailed = true;
    } else if (arg === '--source') {
      options.source = args[++i] as any;
    } else if (arg === '--blocked-tool') {
      options.blockedTool = args[++i];
    }
  }

  return options;
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
Token Savings Metrics Viewer

Usage:
  npm run view-metrics [options]

Options:
  --help, -h              Show this help message
  --days, -d <number>     Number of days to include (default: 7)
  --detailed              Show detailed list of all metrics
  --source <source>       Filter by source (enforcer-hook, workflow, manual)
  --blocked-tool <tool>   Filter by blocked tool (Read, Grep, Bash)

Examples:
  npm run view-metrics                    # Show summary for last 7 days
  npm run view-metrics --days 30          # Show summary for last 30 days
  npm run view-metrics --detailed         # Show detailed list
  npm run view-metrics --source enforcer-hook  # Show only enforcer hook metrics
  `);
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date: Date): string {
  return date.toLocaleString();
}

/**
 * Display detailed metrics list
 */
function showDetailedMetrics(metrics: TokenSavingsMetrics, options: CLIOptions) {
  const startTime = new Date(Date.now() - options.days * 24 * 60 * 60 * 1000);
  
  const results = metrics.query({
    startTime,
    source: options.source,
    blockedTool: options.blockedTool
  });

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📋 Detailed Metrics (${results.length} entries)`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (results.length === 0) {
    console.log('No metrics found for the specified criteria.\n');
    return;
  }

  results.forEach((metric, index) => {
    console.log(`${index + 1}. ${formatTimestamp(metric.timestamp)}`);
    console.log(`   Source: ${metric.source}`);
    console.log(`   Blocked: ${metric.blockedTool} → Recommended: ${metric.recommendedTool}`);
    console.log(`   Target: ${metric.target}`);
    console.log(`   Estimated Savings: ${metric.estimatedSavings} tokens`);
    if (metric.actualTokensAvoided) {
      console.log(`   Actual Savings: ${metric.actualTokensAvoided} tokens`);
    }
    console.log(`   Followed: ${metric.suggestionFollowed ? '✅ Yes' : '❌ No'}`);
    console.log('');
  });
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  try {
    const metrics = getMetricsCollector();

    if (options.detailed) {
      showDetailedMetrics(metrics, options);
    } else {
      // Show summary report
      const report = metrics.getSummaryReport(options.days);
      console.log(report);
    }

    // Show filter info if filters are applied
    if (options.source || options.blockedTool) {
      console.log('\n📌 Filters applied:');
      if (options.source) {
        console.log(`   Source: ${options.source}`);
      }
      if (options.blockedTool) {
        console.log(`   Blocked Tool: ${options.blockedTool}`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('Error reading metrics:', error);
    process.exit(1);
  }
}

main();
