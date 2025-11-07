#!/bin/bash

LOG_DIR="${LOG_DIR:-./logs}"

function show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  summary              Show workflow execution summary"
    echo "  errors               Show error distribution"
    echo "  performance          Show performance metrics"
    echo "  ai-usage             Show AI backend usage"
    echo "  permissions          Show permission check stats"
    echo ""
    echo "Examples:"
    echo "  $0 summary          # Show overall summary"
    echo "  $0 errors           # Show error distribution"
    echo "  $0 performance      # Show performance metrics"
}

if [ ! -d "$LOG_DIR" ]; then
    echo "Error: Log directory $LOG_DIR does not exist"
    exit 1
fi

case "$1" in
    summary)
        echo "=== Workflow Execution Summary ==="
        echo ""
        if [ -f "$LOG_DIR/workflow-executions.log" ]; then
            cat "$LOG_DIR/workflow-executions.log" | jq -s '
                group_by(.component) | 
                map({
                    workflow: .[0].component,
                    count: length,
                    avgDuration: (map(.duration // 0) | add / length | round)
                }) |
                sort_by(-.count)
            '
        else
            echo "No workflow executions log found"
        fi
        ;;
    
    errors)
        echo "=== Error Distribution ==="
        echo ""
        if [ -f "$LOG_DIR/errors.log" ]; then
            cat "$LOG_DIR/errors.log" | jq -s '
                group_by(.component) | 
                map({
                    component: .[0].component, 
                    count: length,
                    lastError: .[0].timestamp
                }) |
                sort_by(-.count)
            '
        else
            echo "No errors log found"
        fi
        ;;
    
    performance)
        echo "=== Performance Metrics ==="
        echo ""
        if [ -f "$LOG_DIR/workflow-executions.log" ]; then
            cat "$LOG_DIR/workflow-executions.log" | jq -s '
                map(select(.duration != null)) |
                group_by(.component) |
                map({
                    workflow: .[0].component,
                    executions: length,
                    avgDuration: (map(.duration) | add / length | round),
                    minDuration: (map(.duration) | min),
                    maxDuration: (map(.duration) | max)
                }) |
                sort_by(.avgDuration) |
                reverse
            '
        else
            echo "No workflow executions log found"
        fi
        ;;
    
    ai-usage)
        echo "=== AI Backend Usage ==="
        echo ""
        if [ -f "$LOG_DIR/ai-backend-calls.log" ]; then
            cat "$LOG_DIR/ai-backend-calls.log" | jq -s '
                group_by(.metadata.backend) |
                map({
                    backend: .[0].metadata.backend,
                    calls: length,
                    workflows: ([.[].component] | unique | length)
                }) |
                sort_by(-.calls)
            '
        else
            echo "No AI backend calls log found"
        fi
        ;;
    
    permissions)
        echo "=== Permission Check Statistics ==="
        echo ""
        if [ -f "$LOG_DIR/permission-checks.log" ]; then
            cat "$LOG_DIR/permission-checks.log" | jq -s '
                {
                    total: length,
                    allowed: ([.[] | select(.metadata.allowed == true)] | length),
                    denied: ([.[] | select(.metadata.allowed == false)] | length),
                    byOperation: (group_by(.operation) | map({
                        operation: .[0].operation,
                        count: length,
                        allowed: ([.[] | select(.metadata.allowed == true)] | length),
                        denied: ([.[] | select(.metadata.allowed == false)] | length)
                    }))
                }
            '
        else
            echo "No permission checks log found"
        fi
        ;;
    
    *)
        show_help
        ;;
esac
