#!/bin/bash

# Post-tool-use hook that reminds Claude to use claude-context semantic search
# This runs after Claude's response to check if semantic search should have been used
# Now with smart throttling to reduce noise

# Set project directory to current working directory if not set
if [ -z "$CLAUDE_PROJECT_DIR" ]; then
    CLAUDE_PROJECT_DIR="$(pwd)"
fi

# Read tool information from stdin
tool_info=$(cat)

# Extract relevant data
tool_name=$(echo "$tool_info" | jq -r '.tool_name // empty')
session_id=$(echo "$tool_info" | jq -r '.session_id // empty')

# Setup cache directory
cache_dir="$CLAUDE_PROJECT_DIR/.claude/tsc-cache/${session_id:-default}"
mkdir -p "$cache_dir"

# Throttling configuration
COOLDOWN_SECONDS=300  # 5 minutes cooldown
LAST_REMINDER_FILE="$cache_dir/last-context-reminder-timestamp"

# Check if we should throttle
if [ -f "$LAST_REMINDER_FILE" ]; then
    LAST_REMINDER=$(cat "$LAST_REMINDER_FILE")
    NOW=$(date +%s)
    TIME_SINCE=$((NOW - LAST_REMINDER))
    
    if [ $TIME_SINCE -lt $COOLDOWN_SECONDS ]; then
        # Too soon, skip reminder
        exit 0
    fi
fi

# Function to show reminder and update timestamp
show_reminder() {
    local message="$1"
    echo "$message"
    date +%s > "$LAST_REMINDER_FILE"
}

# Only process for Claude's responses (when tool is completed)
if [[ "$tool_name" == "Bash" ]]; then
    # Check if Claude used direct file reading when claude-context would be better
    command_used=$(echo "$tool_info" | jq -r '.tool_input.command // empty')
    
    # If Claude used direct file reading tools that suggest they should have used claude-context first
    if [[ "$command_used" =~ ^(cat|grep|rg|find).* ]] && [[ ! "$command_used" =~ claude-context ]]; then
        # Log to file for analytics
        echo "$(date): Claude used direct search instead of claude-context: $command_used" >> "$cache_dir/context-reminders.log"

        # Output reminder to Claude (stdout) and update timestamp
        show_reminder "$(cat <<EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 REMINDER: Consider claude-context semantic search
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You used: $command_used

Consider using mcp__claude-context__search_code for:
- Semantic search across codebase
- Finding related code patterns
- Hybrid BM25 + vector search

This can be more effective than direct file commands.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
)"
    fi
elif [[ "$tool_name" == "Read" ]]; then
    # If Claude used direct file reading for code files
    file_path=$(echo "$tool_info" | jq -r '.tool_input.absolute_path // empty')
    if [[ -n "$file_path" ]] && [[ "$file_path" =~ \.(ts|js|tsx|jsx|py|java|go|rs|cpp|c|h)$ ]]; then
        # Log to file
        echo "$(date): Claude read file directly instead of using claude-context: $file_path" >> "$cache_dir/context-reminders.log"

        # Output reminder to Claude (stdout) and update timestamp
        show_reminder "$(cat <<EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 TIP: Consider Serena or claude-context first
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You read: $file_path

For code files, consider:
1. mcp__serena__get_symbols_overview - Get file structure (75-80% token savings)
2. mcp__serena__find_symbol - Find specific symbols
3. mcp__claude-context__search_code - Semantic search

These are more efficient than reading entire files.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
)"
    fi
fi

exit 0