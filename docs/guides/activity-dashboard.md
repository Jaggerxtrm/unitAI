# Activity Dashboard Guide

The Activity Dashboard provides comprehensive monitoring of MCP server user activity, tool usage, workflow execution, and agent performance metrics through an intuitive terminal-based interface.

## Overview

The dashboard aggregates data from multiple sources:
- **Audit Trail**: Autonomous operations and decision tracking
- **Token Metrics**: Tool usage efficiency and savings
- **Activity Logs**: Real-time tool and workflow invocations
- **Agent Performance**: Execution times and success rates

## Quick Start

### Basic Usage

```bash
# Show dashboard for last 7 days
npm run activity-dashboard

# Show dashboard for last 30 days
npm run activity-dashboard -- --days 30

# Enable auto-refresh mode (updates every 5 seconds)
npm run activity-dashboard -- --watch

# Compact mode without charts
npm run activity-dashboard -- --compact --no-charts
```

### Command Line Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--help` | `-h` | Show help message | - |
| `--days <n>` | `-d` | Number of days to analyze | 7 |
| `--watch` | `-w` | Enable auto-refresh mode | false |
| `--refresh <n>` | `-r` | Refresh interval in seconds | 5 |
| `--compact` | `-c` | Use compact display mode | false |
| `--no-color` | - | Disable colored output | false |
| `--no-charts` | - | Hide activity charts | false |
| `--export` | `-e` | Export data to file | false |
| `--format <fmt>` | `-f` | Export format (json/csv) | json |

## Dashboard Sections

### 1. Overall Statistics

Displays high-level metrics:
- **Total Operations**: Combined count of all tracked activities
- **Tool Invocations**: Number of MCP tool calls
- **Workflow Executions**: Number of workflow runs
- **Tokens Saved**: Total tokens saved through optimization
- **Success Rate**: Overall success percentage

### 2. Top Tools

Shows most frequently used tools with:
- Tool name
- Invocation count
- Success rate
- Average response time
- Last usage timestamp

### 3. Workflow Executions

Tracks workflow performance:
- Workflow name
- Total executions
- Success/failure counts
- Success rate
- Average duration
- Last execution time

### 4. Token Savings

Monitors optimization efficiency:
- Total suggestions made
- Suggestions followed vs ignored
- Follow rate percentage
- Estimated and actual token savings
- Average savings per suggestion
- Breakdown by blocked tools

### 5. Audit Trail

Shows autonomous operation tracking:
- Total audit entries
- Approved vs denied operations
- Successful vs failed operations
- Operations breakdown by type

### 6. Activity Patterns

Visual charts showing:
- **Activity by Hour**: 24-hour activity distribution
- **Activity by Day**: Daily activity over the period

## Examples

### Monitor Development Activity

```bash
# Watch mode during active development
npm run activity-dashboard -- --watch --refresh 10
```

### Weekly Performance Review

```bash
# Export last 7 days to JSON
npm run activity-dashboard -- --export --format json

# View last 7 days in compact mode
npm run activity-dashboard -- --compact
```

### Monthly Analysis

```bash
# Detailed view of last 30 days
npm run activity-dashboard -- --days 30

# Export monthly data to CSV
npm run activity-dashboard -- --days 30 --export --format csv
```

### CI/CD Integration

```bash
# Simple output without colors or charts (for logs)
npm run activity-dashboard -- --no-color --no-charts --compact
```

## Programmatic Usage

You can also use the dashboard components programmatically:

```typescript
import { getActivityAnalytics } from './src/services/activityAnalytics.js';
import { renderActivityDashboard } from './src/utils/dashboardRenderer.js';

// Get analytics
const analytics = getActivityAnalytics();
const summary = analytics.getActivitySummary(7);

// Render dashboard
const output = renderActivityDashboard(summary, {
  useColors: true,
  compactMode: false,
  showCharts: true
});

console.log(output);
```

### Recording Custom Activities

```typescript
import { getActivityAnalytics } from './src/services/activityAnalytics.js';

const analytics = getActivityAnalytics();

// Record a tool invocation
analytics.recordActivity({
  activityType: 'tool_invocation',
  toolName: 'ask-gemini',
  success: true,
  duration: 1500,
  metadata: { prompt: 'Analyze code' }
});

// Record a workflow execution
analytics.recordActivity({
  activityType: 'workflow_execution',
  workflowName: 'bug-hunt',
  success: true,
  duration: 5000,
  metadata: { filesAnalyzed: 10 }
});
```

### Querying Activity Data

```typescript
import { getActivityAnalytics } from './src/services/activityAnalytics.js';

const analytics = getActivityAnalytics();

// Get recent activities
const recent = analytics.getRecentActivities(50);

// Get tool-specific stats
const geminiStats = analytics.getToolStats('ask-gemini', 7);

// Get workflow-specific stats
const bugHuntStats = analytics.getWorkflowStats('bug-hunt', 7);

// Query with filters
const failedActivities = analytics.queryActivities({
  success: false,
  startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
});
```

## Data Storage

Activity data is stored in SQLite databases in the `data/` directory:

- `data/activity.sqlite` - MCP activity records
- `data/audit.sqlite` - Audit trail entries
- `data/token-metrics.sqlite` - Token savings metrics

Exported files are saved to `data/exports/` with timestamps:
- `activity-dashboard-7d-YYYY-MM-DD-HHmmss.json`
- `activity-dashboard-7d-YYYY-MM-DD-HHmmss.csv`

## Maintenance

### Cleanup Old Data

The analytics service includes automatic cleanup functionality:

```typescript
import { getActivityAnalytics } from './src/services/activityAnalytics.js';

const analytics = getActivityAnalytics();

// Remove activities older than 30 days
const removed = analytics.cleanup(30);
console.log(`Removed ${removed} old records`);
```

### Database Management

To manually manage the database:

```bash
# View database contents
sqlite3 data/activity.sqlite "SELECT * FROM mcp_activities LIMIT 10;"

# Check database size
du -h data/*.sqlite

# Backup databases
cp data/*.sqlite backups/
```

## Integration with Existing Systems

The dashboard integrates seamlessly with:

1. **Audit Trail System** (`src/utils/auditTrail.ts`)
   - Tracks autonomous operations
   - Provides approval/denial statistics

2. **Token Metrics** (`src/utils/tokenEstimator.ts`)
   - Monitors token savings
   - Tracks optimization suggestions

3. **Agent Performance** (`scripts/monitor-agent-performance.ts`)
   - Agent-specific metrics
   - Performance baselines

## Best Practices

1. **Regular Monitoring**
   - Check dashboard daily during active development
   - Review weekly for performance trends
   - Export monthly for historical analysis

2. **Watch Mode Usage**
   - Use during debugging to see real-time activity
   - Set appropriate refresh intervals (5-10 seconds)
   - Exit gracefully with Ctrl+C

3. **Data Export**
   - Export before major changes for comparison
   - Use CSV for spreadsheet analysis
   - Use JSON for programmatic processing

4. **Performance Optimization**
   - Monitor success rates to identify problematic tools
   - Track token savings to validate optimizations
   - Review workflow durations for bottlenecks

## Troubleshooting

### Dashboard Not Showing Data

```bash
# Check if databases exist
ls -lh data/*.sqlite

# Verify recent activity
sqlite3 data/activity.sqlite "SELECT COUNT(*) FROM mcp_activities;"
```

### Performance Issues

If the dashboard is slow:
- Reduce the number of days: `--days 7`
- Use compact mode: `--compact`
- Disable charts: `--no-charts`
- Clean up old data regularly

### Export Failures

Ensure the export directory exists:
```bash
mkdir -p data/exports
```

## See Also

- [Token Metrics Guide](../docs/TOKEN_METRICS.md)
- [Audit Trail Documentation](../docs/ARCHITECTURE.md#audit-trail)
- [Agent Performance Monitoring](../docs/AGENT_PERFORMANCE_REPORT.md)
- [Workflows Documentation](../docs/WORKFLOWS.md)
