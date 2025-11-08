#!/bin/bash

# Post-tool-use hook that reminds Claude to search memories before starting new work
# This runs after Claude's response to check if memory search was performed when appropriate

# Set project directory to current working directory if not set
if [ -z "$CLAUDE_PROJECT_DIR" ]; then
    CLAUDE_PROJECT_DIR="$(pwd)"
fi

# Read tool information from stdin
tool_info=$(cat)

# Extract relevant data
tool_name=$(echo "$tool_info" | jq -r '.tool_name // empty')
session_id=$(echo "$tool_info" | jq -r '.session_id // empty')

# Track if memory search has been performed in this session
cache_dir="$CLAUDE_PROJECT_DIR/.claude/tsc-cache/${session_id:-default}"
mkdir -p "$cache_dir"

# Check if this is the beginning of a session or if memory search should be done
if [[ "$tool_name" == "Bash" ]]; then
    # Check if Claude ran memory search commands
    command_used=$(echo "$tool_info" | jq -r '.tool_input.command // empty')
    
    if [[ "$command_used" =~ openmemory-search-memories ]]; then
        # Memory search was performed, mark it
        touch "$cache_dir/memory-search-performed.flag"
    elif [[ ! -f "$cache_dir/memory-search-performed.flag" ]]; then
        # Check if Claude is starting work on something that should trigger memory search
        if [[ "$command_used" =~ ^(git|cd|ls|cat|claude-context).* ]] && [[ ! "$command_used" =~ session\ init ]]; then
            # Log this for later analysis
            echo "$(date): Claude started work without searching memories first: $command_used" >> "$cache_dir/memory-search-reminders.log"

            # Output reminder to Claude (stdout)
            cat <<EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 REMINDER: Search memories before starting work
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Consider using mcp__openmemory__search-memories to:
- Check for recent work on this topic
- Find past decisions and approaches
- Avoid repeating mistakes
- Maintain consistency

Example:
mcp__openmemory__search-memories("recent work on [topic]")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
        fi
    fi
elif [[ "$tool_name" == "Read" ]]; then
    # If Claude read a file and memory search wasn't performed yet
    if [[ ! -f "$cache_dir/memory-search-performed.flag" ]]; then
        file_path=$(echo "$tool_info" | jq -r '.tool_input.absolute_path // empty')
        if [[ -n "$file_path" ]] && [[ "$file_path" =~ src/ ]]; then
            # Log that Claude is reading files without searching memories first
            echo "$(date): Claude read file without searching memories first: $file_path" >> "$cache_dir/memory-search-reminders.log"

            # Output reminder to Claude (stdout)
            cat <<EOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 TIP: Search memories first when exploring code
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before diving into code, check if there's relevant context:

mcp__openmemory__search-memories("work related to this file")
mcp__openmemory__search-memories("past decisions about this component")

This helps maintain consistency and avoid repeating work.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
        fi
    fi
fi

exit 0