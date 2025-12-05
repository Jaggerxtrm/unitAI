#!/bin/bash
# Track Recent Files Hook (PreToolUse)
#
# Tracks recently read/edited files for context-aware skill activation
#
# Hook Type: PreToolUse (Read, Edit, Write)
# Triggers: Before file operations
# Behavior: Silent tracking, no output

set -euo pipefail

# Read hook input from stdin
HOOK_INPUT=$(cat)

# Extract tool info
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$HOOK_INPUT" | jq -r '.tool_input.file_path // .tool_input.absolute_path // empty')
SESSION_ID=$(echo "$HOOK_INPUT" | jq -r '.session_id // "default"')

# Skip if no file path or not a file operation
if [ -z "$FILE_PATH" ] || [ -z "$TOOL_NAME" ]; then
  exit 0
fi

# Setup cache directory
CACHE_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/tsc-cache/${SESSION_ID}"
mkdir -p "$CACHE_DIR"

# Recent files tracking file
RECENT_FILES="$CACHE_DIR/recent-files.log"

# Add file to recent list (with timestamp)
echo "$(date +%s):$TOOL_NAME:$FILE_PATH" >> "$RECENT_FILES"

# Keep only last 20 entries to avoid bloat
tail -n 20 "$RECENT_FILES" > "$RECENT_FILES.tmp" 2>/dev/null && mv "$RECENT_FILES.tmp" "$RECENT_FILES"

# Exit silently
exit 0

