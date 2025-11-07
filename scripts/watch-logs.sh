#!/bin/bash

# Real-time log monitoring script
# Usage: ./watch-logs.sh [category] [workflowId]

LOGS_DIR="${LOGS_DIR:-logs}"

if [ ! -d "$LOGS_DIR" ]; then
  echo "Error: Logs directory not found: $LOGS_DIR"
  exit 1
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Format log entry with color
format_log() {
  if command -v jq &> /dev/null; then
    jq -r 'if .level == 0 then "'$BLUE'" + . + "'$NC'" elif .level == 1 then "'$GREEN'" + . + "'$NC'" elif .level == 2 then "'$YELLOW'" + . + "'$NC'" elif .level == 3 then "'$RED'" + . + "'$NC'" else . end' | jq '.'
  else
    cat
  fi
}

# Watch specific category
if [ -n "$1" ]; then
  CATEGORY="$1"
  LOG_FILE="$LOGS_DIR/${CATEGORY}.log"
  
  if [ ! -f "$LOG_FILE" ]; then
    echo "Error: Log file not found: $LOG_FILE"
    echo "Available categories:"
    ls "$LOGS_DIR"/*.log 2>/dev/null | xargs -n 1 basename | sed 's/.log$//'
    exit 1
  fi
  
  echo "Watching $CATEGORY logs..."
  
  # Filter by workflowId if provided
  if [ -n "$2" ]; then
    WORKFLOW_ID="$2"
    echo "Filtering by workflowId: $WORKFLOW_ID"
    tail -f "$LOG_FILE" | grep "$WORKFLOW_ID" | format_log
  else
    tail -f "$LOG_FILE" | format_log
  fi
else
  # Watch all logs
  echo "Watching all logs (debug.log)..."
  tail -f "$LOGS_DIR/debug.log" | format_log
fi
