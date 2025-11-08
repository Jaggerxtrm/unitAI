#!/bin/bash

# Log analysis script
# Usage: ./analyze-logs.sh [command] [options]

LOGS_DIR="${LOGS_DIR:-logs}"

if [ ! -d "$LOGS_DIR" ]; then
  echo "Error: Logs directory not found: $LOGS_DIR"
  exit 1
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed"
  echo "Install with: sudo apt install jq (Ubuntu) or brew install jq (macOS)"
  exit 1
fi

# Show workflow summary
workflow_summary() {
  echo "=== Workflow Execution Summary ==="
  cat "$LOGS_DIR/workflow.log" 2>/dev/null | jq -s '
    group_by(.component) | 
    map({
      workflow: .[0].component,
      executions: length,
      avgDuration: (map(.duration // 0) | add / length | floor),
      errors: map(select(.level == 3)) | length
    })
  ' | jq -r '.[] | "\(.workflow): \(.executions) executions, avg \(.avgDuration)ms, \(.errors) errors"'
}

# Show error distribution
error_summary() {
  echo "=== Error Distribution ==="
  cat "$LOGS_DIR/errors.log" 2>/dev/null | jq -s '
    group_by(.component) | 
    map({
      component: .[0].component,
      errorCount: length,
      lastError: .[0].timestamp
    })
  ' | jq -r '.[] | "\(.component): \(.errorCount) errors (last: \(.lastError))"'
}

# Show AI backend usage
ai_backend_summary() {
  echo "=== AI Backend Usage ==="
  cat "$LOGS_DIR/ai-backend.log" 2>/dev/null | jq -s '
    group_by(.metadata.backend) | 
    map({
      backend: .[0].metadata.backend,
      calls: length,
      avgDuration: (map(.duration // 0) | add / length | floor)
    })
  ' | jq -r '.[] | "\(.backend): \(.calls) calls, avg \(.avgDuration)ms"'
}

# Show permission checks
permission_summary() {
  echo "=== Permission Checks ==="
  cat "$LOGS_DIR/permission.log" 2>/dev/null | jq -s '
    {
      total: length,
      allowed: map(select(.metadata.allowed == true)) | length,
      denied: map(select(.metadata.allowed == false)) | length
    }
  ' | jq -r '"Total: \(.total), Allowed: \(.allowed), Denied: \(.denied)"'
}

# Show recent errors
recent_errors() {
  local COUNT="${1:-10}"
  echo "=== Last $COUNT Errors ==="
  cat "$LOGS_DIR/errors.log" 2>/dev/null | tail -n "$COUNT" | jq -r '
    "\(.timestamp) [\(.component)/\(.operation)] \(.message)"
  '
}

# Search logs
search_logs() {
  local PATTERN="$1"
  local CATEGORY="${2:-debug}"
  
  echo "=== Searching for: $PATTERN in $CATEGORY logs ==="
  grep -i "$PATTERN" "$LOGS_DIR/${CATEGORY}.log" 2>/dev/null | jq -r '
    "\(.timestamp) [\(.level)] \(.component)/\(.operation): \(.message)"
  '
}

# Show workflow execution timeline
workflow_timeline() {
  local WORKFLOW_ID="$1"
  
  if [ -z "$WORKFLOW_ID" ]; then
    echo "Error: workflowId required"
    echo "Usage: ./analyze-logs.sh timeline <workflowId>"
    exit 1
  fi
  
  echo "=== Timeline for workflow: $WORKFLOW_ID ==="
  grep "$WORKFLOW_ID" "$LOGS_DIR/debug.log" 2>/dev/null | jq -r '
    "\(.timestamp) \(.operation): \(.message) (duration: \(.duration // 0)ms)"
  '
}

# Show usage statistics
usage_stats() {
  echo "=== Log Statistics ==="
  echo ""
  
  for LOG_FILE in "$LOGS_DIR"/*.log; do
    if [ -f "$LOG_FILE" ]; then
      BASENAME=$(basename "$LOG_FILE")
      LINES=$(wc -l < "$LOG_FILE")
      SIZE=$(du -h "$LOG_FILE" | cut -f1)
      echo "$BASENAME: $LINES lines, $SIZE"
    fi
  done
}

# Main command router
case "${1:-summary}" in
  summary)
    workflow_summary
    echo ""
    error_summary
    echo ""
    ai_backend_summary
    echo ""
    permission_summary
    ;;
  errors)
    recent_errors "${2:-10}"
    ;;
  search)
    search_logs "$2" "${3:-debug}"
    ;;
  timeline)
    workflow_timeline "$2"
    ;;
  stats)
    usage_stats
    ;;
  workflows)
    workflow_summary
    ;;
  ai)
    ai_backend_summary
    ;;
  permissions)
    permission_summary
    ;;
  help|--help|-h)
    echo "Usage: ./analyze-logs.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  summary              Show all summaries (default)"
    echo "  workflows            Show workflow execution summary"
    echo "  errors [N]           Show last N errors (default: 10)"
    echo "  search <pattern> [category]  Search logs for pattern"
    echo "  timeline <workflowId>        Show execution timeline for workflow"
    echo "  stats                Show log file statistics"
    echo "  ai                   Show AI backend usage"
    echo "  permissions          Show permission check summary"
    echo "  help                 Show this help message"
    echo ""
    echo "Environment:"
    echo "  LOGS_DIR             Log directory (default: logs)"
    ;;
  *)
    echo "Error: Unknown command: $1"
    echo "Run './analyze-logs.sh help' for usage"
    exit 1
    ;;
esac
