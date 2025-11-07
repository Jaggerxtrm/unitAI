#!/bin/bash

LOG_DIR="${LOG_DIR:-./logs}"

function show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -w, --workflow      Watch workflow executions"
    echo "  -a, --ai            Watch AI backend calls"
    echo "  -e, --errors        Watch errors only"
    echo "  -p, --permissions   Watch permission checks"
    echo "  -g, --git           Watch git operations"
    echo "  -i, --id ID         Filter by workflow ID"
    echo "  -c, --category CAT  Watch specific category log"
    echo "  -h, --help          Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 -w                   # Watch workflow executions"
    echo "  $0 -e                   # Watch errors"
    echo "  $0 -i abc-123           # Watch specific workflow"
    echo "  $0 -c workflow          # Watch workflow category"
}

if [ ! -d "$LOG_DIR" ]; then
    echo "Error: Log directory $LOG_DIR does not exist"
    exit 1
fi

case "$1" in
    -w|--workflow)
        echo "Watching workflow executions..."
        tail -f "$LOG_DIR/workflow-executions.log" | jq '.'
        ;;
    -a|--ai)
        echo "Watching AI backend calls..."
        tail -f "$LOG_DIR/ai-backend-calls.log" | jq '.'
        ;;
    -e|--errors)
        echo "Watching errors..."
        tail -f "$LOG_DIR/errors.log" | jq '.'
        ;;
    -p|--permissions)
        echo "Watching permission checks..."
        tail -f "$LOG_DIR/permission-checks.log" | jq '.'
        ;;
    -g|--git)
        echo "Watching git operations..."
        tail -f "$LOG_DIR/git-operations.log" | jq '.'
        ;;
    -i|--id)
        if [ -z "$2" ]; then
            echo "Error: Workflow ID required"
            exit 1
        fi
        echo "Watching workflow ID: $2"
        tail -f "$LOG_DIR/debug.log" | jq "select(.workflowId == \"$2\")"
        ;;
    -c|--category)
        if [ -z "$2" ]; then
            echo "Error: Category required"
            exit 1
        fi
        echo "Watching category: $2"
        tail -f "$LOG_DIR/debug.log" | jq "select(.category == \"$2\")"
        ;;
    -h|--help|*)
        show_help
        ;;
esac
