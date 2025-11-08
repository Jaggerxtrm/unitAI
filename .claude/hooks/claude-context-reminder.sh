#!/bin/bash

# Post-tool-use hook that reminds Claude to use claude-context semantic search
# This runs after Claude's response to check if semantic search should have been used

# Set project directory to current working directory if not set
if [ -z "$CLAUDE_PROJECT_DIR" ]; then
    CLAUDE_PROJECT_DIR="/home/dawid/Projects/py_backend"
fi

# Read tool information from stdin
tool_info=$(cat)

# Extract relevant data
tool_name=$(echo "$tool_info" | jq -r '.tool_name // empty')
session_id=$(echo "$tool_info" | jq -r '.session_id // empty')

# Only process for Claude's responses (when tool is completed)
if [[ "$tool_name" == "Bash" ]]; then
    # Check if Claude used direct file reading when claude-context would be better
    command_used=$(echo "$tool_info" | jq -r '.tool_input.command // empty')
    
    # If Claude used direct file reading tools that suggest they should have used claude-context first
    if [[ "$command_used" =~ ^(cat|grep|rg|find).* ]] && [[ ! "$command_used" =~ claude-context ]]; then
        # This suggests Claude might have used direct file search instead of semantic search
        # In a real implementation, this would output a reminder to use claude-context
        # For now, we just log this for analysis
        cache_dir="$CLAUDE_PROJECT_DIR/.claude/tsc-cache/${session_id:-default}"
        mkdir -p "$cache_dir"
        echo "$(date): Claude used direct search instead of claude-context: $command_used" >> "$cache_dir/context-reminders.log"
    fi
elif [[ "$tool_name" == "Read" ]]; then
    # If Claude used direct file reading, log it as a potential case where claude-context should be used first
    file_path=$(echo "$tool_info" | jq -r '.tool_input.absolute_path // empty')
    if [[ -n "$file_path" ]]; then
        cache_dir="$CLAUDE_PROJECT_DIR/.claude/tsc-cache/${session_id:-default}"
        mkdir -p "$cache_dir"
        echo "$(date): Claude read file directly instead of using claude-context: $file_path" >> "$cache_dir/context-reminders.log"
    fi
fi

exit 0