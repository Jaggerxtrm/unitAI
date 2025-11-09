# Token Savings Metrics System

**Created:** 2025-01-XX  
**Status:** Active  
**Version:** 1.0

## Overview

The Token Savings Metrics system tracks and quantifies token savings achieved through the enforcer hook and token-aware decision making. It provides visibility into how much the system is saving by suggesting efficient alternatives to token-heavy operations.

## Architecture

### Components

1. **TokenSavingsMetrics Class** (`src/utils/tokenEstimator.ts`)
   - SQLite-based metrics storage
   - Query and aggregation capabilities
   - Report generation

2. **Pre-Tool-Use Enforcer Hook** (`.claude/hooks/pre-tool-use-enforcer.ts`)
   - Intercepts tool usage before execution
   - Records metrics for each suggestion
   - Non-blocking, fail-safe design

3. **CLI Viewer** (`scripts/view-token-metrics.ts`)
   - View summary reports
   - Query detailed metrics
   - Filter by source, tool, time range

### Database Schema

```sql
CREATE TABLE token_savings_metrics (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  source TEXT NOT NULL,              -- 'enforcer-hook' | 'workflow' | 'manual'
  blocked_tool TEXT NOT NULL,        -- Tool that was discouraged (Read, Grep, Bash)
  recommended_tool TEXT NOT NULL,    -- Suggested alternative (serena, claude-context)
  target TEXT NOT NULL,              -- File path or command target
  estimated_savings INTEGER NOT NULL,-- Estimated tokens saved
  actual_tokens_avoided INTEGER,     -- Actual savings (optional)
  suggestion_followed INTEGER NOT NULL, -- Whether suggestion was followed
  metadata TEXT                      -- JSON metadata
);
```

## Usage

### Recording Metrics (Automatic)

The enforcer hook automatically records metrics when it suggests alternatives:

```typescript
// Automatic recording in pre-tool-use-enforcer.ts
recordMetrics({
  source: "enforcer-hook",
  blockedTool: "Read",
  recommendedTool: "serena",
  target: "src/utils/tokenEstimator.ts",
  estimatedSavings: 120,
  suggestionFollowed: false,
  metadata: { fileType: "code" }
});
```

### Recording Metrics (Manual)

From workflows or other code:

```typescript
import { getMetricsCollector } from './src/utils/tokenEstimator.js';

const metrics = getMetricsCollector();

// Record a suggestion
const metricId = metrics.record({
  source: 'workflow',
  blockedTool: 'Read',
  recommendedTool: 'serena',
  target: 'large-file.ts',
  estimatedSavings: 500,
  suggestionFollowed: true,
  metadata: { workflow: 'pre-commit-validate' }
});

// Update with actual savings later
metrics.updateActualSavings(metricId, 480);
```

### Viewing Metrics

#### Summary Report (Last 7 Days)

```bash
npm run view-metrics
```

Output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Token Savings Report (Last 7 days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Overall Statistics:
  • Total suggestions: 45
  • Suggestions followed: 34 (76%)
  • Suggestions ignored: 11
  • Total estimated savings: 25,340 tokens
  • Average savings per suggestion: 563 tokens

🚫 By Blocked Tool:
  • Read: 30 suggestions, 3,600 tokens saved
  • Grep: 10 suggestions, 15,000 tokens saved
  • Bash: 5 suggestions, 6,740 tokens saved

✅ By Recommended Tool:
  • serena: 35 recommendations, 10,340 tokens saved
  • claude-context: 10 recommendations, 15,000 tokens saved

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Custom Time Range

```bash
npm run view-metrics -- --days 30
```

#### Detailed List

```bash
npm run view-metrics -- --detailed
```

#### Filter by Source

```bash
npm run view-metrics -- --source enforcer-hook
```

#### Filter by Blocked Tool

```bash
npm run view-metrics -- --blocked-tool Read
```

### Querying Programmatically

```typescript
import { getMetricsCollector } from './src/utils/tokenEstimator.js';

const metrics = getMetricsCollector();

// Query with filters
const results = metrics.query({
  source: 'enforcer-hook',
  blockedTool: 'Read',
  suggestionFollowed: true,
  startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  limit: 100
});

// Get statistics
const stats = metrics.getStats({
  source: 'enforcer-hook',
  startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
});

console.log(`Total savings: ${stats.totalEstimatedSavings} tokens`);
console.log(`Follow rate: ${stats.followRate}%`);

// Generate report
const report = metrics.getSummaryReport(30);
console.log(report);
```

## Metrics Types

### Source Types

- **`enforcer-hook`**: Suggestions from pre-tool-use enforcer
- **`workflow`**: Suggestions from smart workflows
- **`manual`**: Manually tracked suggestions

### Blocked Tools

- **`Read`**: File reading operations
- **`Grep`**: Pattern search operations
- **`Bash`**: Shell commands (cat, grep, find)
- **`Glob`**: File globbing operations

### Recommended Tools

- **`serena`**: Symbol-level code navigation (75-80% token savings)
- **`claude-context`**: Semantic search (hybrid BM25 + vector)
- **`workflow`**: Smart workflow orchestration
- **`read`**: Read tool is appropriate (small files)

## Estimation Methodology

### Conservative Estimates

The system uses conservative estimates to avoid over-promising:

1. **Code File (Read → Serena)**: ~120 tokens
   - Assumes 400 LOC average file
   - 75-80% savings with symbol-level navigation

2. **Pattern Search (Grep → claude-context)**: ~1500 tokens
   - Semantic search is much more targeted
   - Avoids reading many unrelated matches

3. **Bash Commands**: ~100-1500 tokens depending on operation

### Actual Savings Tracking

When possible, workflows can track actual token usage and update metrics:

```typescript
const beforeTokens = estimateCurrentUsage();
// ... perform operation with suggested tool
const afterTokens = estimateCurrentUsage();
const actualSavings = beforeTokens - afterTokens;

metrics.updateActualSavings(metricId, actualSavings);
```

## Integration Points

### 1. Enforcer Hook

Automatically records every suggestion made to Claude:

- Triggered before Read, Bash, Grep tool usage
- Non-blocking (doesn't slow down Claude)
- Fail-safe (errors don't break suggestions)

### 2. Workflows

Smart workflows can record their own metrics:

```typescript
// In pre-commit-validate.workflow.ts
if (shouldUseSerenanInsteadOfRead(file)) {
  metrics.record({
    source: 'workflow',
    blockedTool: 'Read',
    recommendedTool: 'serena',
    target: file,
    estimatedSavings: calculateSavings(file),
    suggestionFollowed: true,
    metadata: { workflow: 'pre-commit-validate' }
  });
}
```

### 3. Manual Tracking

Developers can manually record decisions:

```typescript
// When implementing a new feature
metrics.record({
  source: 'manual',
  blockedTool: 'Read',
  recommendedTool: 'serena',
  target: 'large-module.ts',
  estimatedSavings: 800,
  suggestionFollowed: true,
  metadata: { reason: 'refactoring large module' }
});
```

## Statistics & Reports

### Available Statistics

- **Total Suggestions**: Count of all suggestions made
- **Follow Rate**: Percentage of suggestions followed
- **Total Savings**: Sum of estimated token savings
- **Average Savings**: Average tokens saved per suggestion
- **By Tool**: Breakdown by blocked/recommended tools

### Report Formats

1. **Summary Report**: High-level overview with key metrics
2. **Detailed List**: All metrics with full details
3. **Filtered Views**: Filter by source, tool, time range

## Best Practices

### 1. Record Immediately

Record metrics as soon as a suggestion is made:

```typescript
const suggestion = generateSuggestion(tool, params);
if (suggestion) {
  recordMetrics(suggestion); // Non-blocking
  console.log(suggestion.message);
}
```

### 2. Update Actual Savings When Possible

If you can measure actual token usage, update the metric:

```typescript
const metricId = metrics.record({ ... });
// ... later, after operation completes
metrics.updateActualSavings(metricId, actualTokens);
```

### 3. Use Metadata for Context

Store relevant context in metadata:

```typescript
metadata: {
  workflow: 'pre-commit-validate',
  fileType: 'typescript',
  loc: 450,
  reason: 'large file optimization'
}
```

### 4. Regular Monitoring

Check metrics regularly to understand patterns:

```bash
# Weekly check
npm run view-metrics -- --days 7

# Monthly review
npm run view-metrics -- --days 30 --detailed
```

## Database Maintenance

### Location

- **Production**: `data/token-metrics.sqlite`
- **Test**: `data/token-metrics-test.sqlite`

### Backup

```bash
cp data/token-metrics.sqlite data/token-metrics-backup-$(date +%Y%m%d).sqlite
```

### Cleanup Old Data

```typescript
// Remove metrics older than 90 days
const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
db.exec(`DELETE FROM token_savings_metrics WHERE timestamp < ${ninetyDaysAgo.getTime()}`);
```

## Future Enhancements

1. **Real-time Dashboard**: Web UI for visualizing metrics
2. **Alerting**: Notify when follow rate drops below threshold
3. **A/B Testing**: Compare different suggestion strategies
4. **Integration with CI/CD**: Report savings in PR comments
5. **Cost Analysis**: Convert token savings to dollar amounts

## Troubleshooting

### Metrics Not Recording

1. Check database permissions: `ls -la data/token-metrics.sqlite`
2. Check logs: `.claude/tsc-cache/pre-tool-enforcer.log`
3. Verify hook is enabled: Check `.claude/hooks/` setup

### Query Performance

- Database has indexes on all filterable columns
- Use `limit` parameter for large datasets
- Consider archiving old data (>90 days)

### Missing Data

- Enforcer hook fails silently to not break Claude
- Check for errors in: `.claude/tsc-cache/pre-tool-enforcer.log`
- Verify `src/utils/tokenEstimator.js` is built and accessible

## See Also

- [Token Estimator Utility](../src/utils/tokenEstimator.ts)
- [Pre-Tool-Use Enforcer Hook](../.claude/hooks/pre-tool-use-enforcer.ts)
- [CLAUDE.md](../CLAUDE.MD) - Token-aware decision making guidelines
