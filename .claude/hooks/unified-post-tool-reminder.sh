#!/bin/bash
# Unified Post-Tool-Use Reminder Hook
#
# Consolidates claude-context-reminder, memory-search-reminder, and workflow-pattern-detector
# into a single efficient hook with coordinated throttling and shared session tracking.
#
# Hook Type: PostToolUse (Read, Bash, Grep)
# Triggers: After tool completion
# Behavior: Context-aware suggestions with smart throttling

set -euo pipefail

# Read tool information from stdin (only once!)
TOOL_INFO=$(cat)

# Extract relevant data
TOOL_NAME=$(echo "$TOOL_INFO" | jq -r '.tool_name // empty')
SESSION_ID=$(echo "$TOOL_INFO" | jq -r '.session_id // empty')

# Skip if no tool name
if [ -z "$TOOL_NAME" ]; then
  exit 0
fi

# Setup cache directory
CACHE_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/tsc-cache/${SESSION_ID:-default}"
mkdir -p "$CACHE_DIR"

# Load user preferences
PREFERENCES_FILE="${CLAUDE_PROJECT_DIR:-.}/.claude/user-preferences.json"
SUPPRESS_CLAUDE_CONTEXT=false
SUPPRESS_MEMORY=false
SUPPRESS_WORKFLOWS=false

if [ -f "$PREFERENCES_FILE" ]; then
    SUPPRESS_CLAUDE_CONTEXT=$(jq -r '.suppressReminders."claude-context" // false' "$PREFERENCES_FILE")
    SUPPRESS_MEMORY=$(jq -r '.suppressReminders."memory-search" // false' "$PREFERENCES_FILE")
    SUPPRESS_WORKFLOWS=$(jq -r '.suppressReminders."workflow-suggestions" // false' "$PREFERENCES_FILE")
fi

# Throttling configuration
CONTEXT_COOLDOWN=300    # 5 minutes
WORKFLOW_COOLDOWN=600   # 10 minutes

# Function to check throttling
should_throttle() {
    local reminder_type=$1
    local cooldown=$2
    local timestamp_file="$CACHE_DIR/${reminder_type}-last-reminder"
    
    if [ -f "$timestamp_file" ]; then
        local last_time=$(cat "$timestamp_file")
        local now=$(date +%s)
        local time_since=$((now - last_time))
        
        if [ $time_since -lt $cooldown ]; then
            return 0  # Should throttle
        fi
    fi
    
    return 1  # Should not throttle
}

# Function to show reminder and update timestamp
show_reminder() {
    local reminder_type=$1
    local message=$2
    
    echo "$message"
    date +%s > "$CACHE_DIR/${reminder_type}-last-reminder"
}

# === CLAUDE-CONTEXT REMINDERS ===
if [ "$SUPPRESS_CLAUDE_CONTEXT" != "true" ] && ! should_throttle "context" $CONTEXT_COOLDOWN; then
    if [[ "$TOOL_NAME" == "Bash" ]]; then
        COMMAND=$(echo "$TOOL_INFO" | jq -r '.tool_input.command // empty')
        
        if [[ "$COMMAND" =~ ^(cat|grep|rg|find).* ]] && [[ ! "$COMMAND" =~ claude-context ]]; then
            echo "$(date): Direct search instead of claude-context: $COMMAND" >> "$CACHE_DIR/context-reminders.log"
            
            show_reminder "context" "$(cat <<EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 TIP: Consider claude-context
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Used: $COMMAND

Consider: mcp__claude-context__search_code for semantic search
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
)"
        fi
        
    elif [[ "$TOOL_NAME" == "Read" ]]; then
        FILE_PATH=$(echo "$TOOL_INFO" | jq -r '.tool_input.absolute_path // empty')
        
        if [[ -n "$FILE_PATH" ]] && [[ "$FILE_PATH" =~ \.(ts|js|tsx|jsx|py|java|go|rs|cpp|c|h)$ ]]; then
            echo "$(date): File read instead of serena/claude-context: $FILE_PATH" >> "$CACHE_DIR/context-reminders.log"
            
            show_reminder "context" "$(cat <<EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 TIP: Consider Serena or claude-context
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Read: $FILE_PATH

For code files, consider:
1. mcp__serena__get_symbols_overview (75-80% token savings)
2. mcp__claude-context__search_code (semantic search)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
)"
        fi
    fi
fi

# === MEMORY SEARCH REMINDERS ===
if [ "$SUPPRESS_MEMORY" != "true" ]; then
    MEMORY_FLAG="$CACHE_DIR/memory-search-performed.flag"
    
    if [[ "$TOOL_NAME" == "Bash" ]]; then
        COMMAND=$(echo "$TOOL_INFO" | jq -r '.tool_input.command // empty')
        
        # Mark if memory search performed
        if [[ "$COMMAND" =~ openmemory-search-memories ]]; then
            touch "$MEMORY_FLAG"
        
        # Suggest if not performed yet and doing work
        elif [[ ! -f "$MEMORY_FLAG" ]]; then
            if [[ "$COMMAND" =~ ^(git|cd|ls|cat|claude-context).* ]] && [[ ! "$COMMAND" =~ session\ init ]]; then
                echo "$(date): Work started without memory search: $COMMAND" >> "$CACHE_DIR/memory-search-reminders.log"
                
                # Show reminder only once per session
                if [ ! -f "$CACHE_DIR/memory-reminder-shown" ]; then
                    touch "$CACHE_DIR/memory-reminder-shown"
                    
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "💡 TIP: Search memories before starting"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo ""
                    echo "Consider: mcp__openmemory__search-memories(\"recent work on [topic]\")"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                fi
            fi
        fi
    fi
fi

# === WORKFLOW SUGGESTIONS ===
if [ "$SUPPRESS_WORKFLOWS" != "true" ]; then
    # Function to suggest workflow with throttling
    suggest_workflow() {
        local workflow=$1
        local reason=$2
        
        if should_throttle "workflow-$workflow" $WORKFLOW_COOLDOWN; then
            return
        fi
        
        date +%s > "$CACHE_DIR/workflow-${workflow}-last-suggestion"
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "💡 WORKFLOW SUGGESTION"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Pattern: $reason"
        echo ""
        echo "Consider: mcp__unitAI__smart-workflows --workflow \"$workflow\""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    }
    
    # Detect workflow patterns
    if [[ "$TOOL_NAME" == "Read" ]]; then
        FILE_PATH=$(echo "$TOOL_INFO" | jq -r '.tool_input.absolute_path // empty')
        
        case "$FILE_PATH" in
            *test*|*spec*|*.test.*|*.spec.*)
                suggest_workflow "bug-hunt" "Reading test files"
                ;;
            *src/workflows/*|*src/tools/*)
                suggest_workflow "feature-design" "Reading workflow implementation"
                ;;
            *package.json|*tsconfig.json|*config*)
                suggest_workflow "parallel-review" "Reading configuration files"
                ;;
        esac
        
    elif [[ "$TOOL_NAME" == "Bash" ]]; then
        COMMAND=$(echo "$TOOL_INFO" | jq -r '.tool_input.command // empty')
        
        case "$COMMAND" in
            *"git diff"*|*"git status"*)
                suggest_workflow "pre-commit-validate" "Git changes detected"
                ;;
            *"npm test"*|*"npm run test"*|*"vitest"*|*"jest"*)
                suggest_workflow "bug-hunt" "Running tests"
                ;;
            *"git log"*|*"git show"*)
                suggest_workflow "validate-last-commit" "Reviewing commit history"
                ;;
        esac
        
    elif [[ "$TOOL_NAME" == "Grep" ]]; then
        PATTERN=$(echo "$TOOL_INFO" | jq -r '.tool_input.pattern // empty')
        
        case "$PATTERN" in
            *bug*|*error*|*fix*|*issue*|*fail*)
                suggest_workflow "bug-hunt" "Searching for bugs/errors"
                ;;
            *TODO*|*FIXME*|*HACK*)
                suggest_workflow "feature-design" "Searching for TODOs"
                ;;
        esac
    fi
fi

# Exit successfully (non-blocking)
exit 0

