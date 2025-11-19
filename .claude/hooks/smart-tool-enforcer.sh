#!/usr/bin/env bash
# Smart Tool Enforcer Hook (PreToolUse)
#
# Prevents token waste by enforcing efficient tool usage.
# Blocks massive Read/Grep operations, requires MCP tools (claude-context, serena).
#
# Hook Type: PreToolUse (Read, Bash, Grep)
# Triggers: Before tool execution (can block)
# Behavior: Context-aware blocking with educational messages

set -euo pipefail

# Read hook input from stdin (JSON with tool name and arguments)
HOOK_INPUT=$(cat)

# Extract tool name and arguments
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool // empty')
TOOL_ARGS=$(echo "$HOOK_INPUT" | jq -r '.arguments // empty')

# Configuration
MAX_FILE_SIZE_LINES=500      # Block Read if file >500 LOC
WARN_FILE_SIZE_LINES=200     # Warn if file >200 LOC
MAX_GREP_SCOPE=5             # Block Grep if searching >5 files

# Bypass mechanism
BYPASS=${BYPASS_ENFORCER:-0}
if [ "$BYPASS" = "1" ]; then
  exit 0
fi

# Skip if no tool name
if [ -z "$TOOL_NAME" ]; then
  exit 0
fi

# Function to warn (allow but educate)
warn_with_message() {
  local reason=$1
  local suggestion=$2
  local savings=$3

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "⚡ TOKEN EFFICIENCY WARNING" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "" >&2
  echo "INEFFICIENT: $reason" >&2
  echo "" >&2
  if [ -n "$savings" ]; then
      echo "Potential savings: $savings" >&2
      echo "" >&2
  fi
  echo "SUGGESTION:" >&2
  echo "$suggestion" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2

  exit 0  # Allow but warn
}

# Enforcement logic by tool
case "$TOOL_NAME" in
  Read)
    # Extract file path
    FILE_PATH=$(echo "$TOOL_ARGS" | jq -r '.file_path // empty')

    if [ -z "$FILE_PATH" ]; then
      exit 0
    fi

    # Skip if file doesn't exist
    if [ ! -f "$FILE_PATH" ]; then
      exit 0
    fi

    # Skip certain file types (configs, small files)
    case "$FILE_PATH" in
      *package.json|*tsconfig.json|*.md|*.txt|*.yml|*.yaml|*.json)
        exit 0
        ;;
    esac

    # Count lines in file
    FILE_LINES=$(wc -l < "$FILE_PATH" 2>/dev/null || echo "0")

    # Check if TypeScript/JavaScript (Serena-compatible)
    IS_TS_JS=0
    case "$FILE_PATH" in
      *.ts|*.tsx|*.js|*.jsx)
        IS_TS_JS=1
        ;;
    esac

    # Warn if file is too large (previously blocked)
    if [ "$FILE_LINES" -gt "$MAX_FILE_SIZE_LINES" ]; then
      if [ "$IS_TS_JS" -eq 1 ]; then
        # TypeScript/JavaScript: Use Serena
        warn_with_message \
          "Reading large file ($FILE_LINES LOC): $FILE_PATH" \
          "  mcp__serena__get_symbols_overview --relative_path \"$FILE_PATH\"
  mcp__serena__find_symbol --name_path \"SymbolName\" --relative_path \"$FILE_PATH\" --include_body true

REASON: Serena provides symbol-level navigation (75-80% token savings)" \
          "~$((FILE_LINES * 4)) tokens → ~$((FILE_LINES / 5)) tokens (80% reduction)"
      else
        # Other files: Use claude-context
        warn_with_message \
          "Reading large file ($FILE_LINES LOC): $FILE_PATH" \
          "  mcp__claude-context__search_code \"relevant query\" --path \"$(dirname "$FILE_PATH")\"

REASON: Semantic search finds relevant code without reading entire file" \
          "~$((FILE_LINES * 4)) tokens → ~1000 tokens (75% reduction)"
      fi
    fi

    # Warn if file is moderately large
    if [ "$FILE_LINES" -gt "$WARN_FILE_SIZE_LINES" ]; then
      if [ "$IS_TS_JS" -eq 1 ]; then
        warn_with_message \
          "Reading moderately large file ($FILE_LINES LOC): $FILE_PATH" \
          "  Consider using Serena for symbol-level navigation:
  mcp__serena__get_symbols_overview --relative_path \"$FILE_PATH\"

  Potential savings: ~$((FILE_LINES * 3)) tokens" ""
      else
        warn_with_message \
          "Reading moderately large file ($FILE_LINES LOC): $FILE_PATH" \
          "  Consider using claude-context for semantic search:
  mcp__claude-context__search_code \"query\" --path \"$(dirname "$FILE_PATH")\"

  Potential savings: ~$((FILE_LINES * 3)) tokens" ""
      fi
    fi
    ;;

  Grep)
    # Extract pattern and path
    PATTERN=$(echo "$TOOL_ARGS" | jq -r '.pattern // empty')
    SEARCH_PATH=$(echo "$TOOL_ARGS" | jq -r '.path // "."')

    if [ -z "$PATTERN" ]; then
      exit 0
    fi

    # Estimate number of files to search (rough heuristic)
    # Count TypeScript/JavaScript files in search path
    FILE_COUNT=$(find "$SEARCH_PATH" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null | wc -l)

    # Warn if searching too many files (previously blocked)
    if [ "$FILE_COUNT" -gt "$MAX_GREP_SCOPE" ]; then
      warn_with_message \
        "Grep searching $FILE_COUNT files in: $SEARCH_PATH" \
        "  mcp__claude-context__search_code \"$PATTERN\" --path \"$SEARCH_PATH\"

REASON: claude-context uses hybrid search (BM25 + vectors) for efficient semantic search" \
        "~$((FILE_COUNT * 500)) tokens → ~1000 tokens (>80% reduction)"
    fi
    ;;

  Bash)
    # Extract command
    COMMAND=$(echo "$TOOL_ARGS" | jq -r '.command // empty')

    if [ -z "$COMMAND" ]; then
      exit 0
    fi

    # Warn token-wasteful bash patterns (previously blocked)
    case "$COMMAND" in
      *"cat "*" | "*|*"find "*)
        warn_with_message \
          "Token-wasteful bash command: $COMMAND" \
          "  Use claude-context for semantic search:
  mcp__claude-context__search_code \"query\" --path /project/path

  Or use Serena for symbol navigation:
  mcp__serena__find_symbol --name_path \"SymbolName\" ..." \
          "Thousands of tokens → ~1000 tokens"
        ;;

      *"grep -r"*)
        warn_with_message \
          "Recursive grep detected: $COMMAND" \
          "  mcp__claude-context__search_code \"query\" --path /project/path

REASON: Hybrid search is more efficient than recursive grep" \
          "Variable (potentially >10k tokens) → ~1000 tokens"
        ;;
    esac
    ;;
esac

# Allow by default
exit 0
