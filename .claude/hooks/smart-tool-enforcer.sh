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

# Configuration (can be overridden by user-preferences.json)
DEFAULT_MAX_FILE_SIZE_LINES=500
DEFAULT_WARN_FILE_SIZE_LINES=200
DEFAULT_COMPLEXITY_MULTIPLIER=1.0
MAX_GREP_SCOPE=5             # Block Grep if searching >5 files

# Load user preferences if available
PREFERENCES_FILE="${CLAUDE_PROJECT_DIR:-.}/.claude/user-preferences.json"
if [ -f "$PREFERENCES_FILE" ]; then
    MAX_FILE_SIZE_LINES=$(jq -r '.thresholds.maxFileSizeLines // 500' "$PREFERENCES_FILE")
    WARN_FILE_SIZE_LINES=$(jq -r '.thresholds.warnFileSizeLines // 200' "$PREFERENCES_FILE")
    COMPLEXITY_MULTIPLIER=$(jq -r '.thresholds.complexityMultiplier // 1.0' "$PREFERENCES_FILE")
else
    MAX_FILE_SIZE_LINES=$DEFAULT_MAX_FILE_SIZE_LINES
    WARN_FILE_SIZE_LINES=$DEFAULT_WARN_FILE_SIZE_LINES
    COMPLEXITY_MULTIPLIER=$DEFAULT_COMPLEXITY_MULTIPLIER
fi

# Bypass mechanism
BYPASS=${BYPASS_ENFORCER:-0}
if [ "$BYPASS" = "1" ]; then
  exit 0
fi

# Function to calculate file complexity score
calculate_complexity_score() {
    local file=$1
    local lines=$(wc -l < "$file" 2>/dev/null || echo "0")
    
    # Count complexity indicators
    local functions=$(grep -c "function\|def \|class \|interface \|type \|enum " "$file" 2>/dev/null || echo "0")
    local imports=$(grep -c "import\|require\|from.*import\|include" "$file" 2>/dev/null || echo "0")
    local conditionals=$(grep -c "if \|else\|switch\|case\|while\|for " "$file" 2>/dev/null || echo "0")
    
    # Complexity formula:
    # Base: lines
    # +20% for each function/class
    # +10% for each import (dependencies)
    # +5% for each conditional (logic complexity)
    # * complexity_multiplier (user preference)
    
    local complexity_factor=$(echo "1 + ($functions * 0.2) + ($imports * 0.1) + ($conditionals * 0.05)" | bc -l)
    local complexity=$(echo "$lines * $complexity_factor * $COMPLEXITY_MULTIPLIER" | bc -l | cut -d'.' -f1)
    
    echo $complexity
}

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
    
    # Calculate complexity score
    COMPLEXITY=$(calculate_complexity_score "$FILE_PATH")

    # Check if TypeScript/JavaScript (Serena-compatible)
    IS_TS_JS=0
    case "$FILE_PATH" in
      *.ts|*.tsx|*.js|*.jsx)
        IS_TS_JS=1
        ;;
    esac

    # Warn if file complexity is too high (context-aware threshold)
    COMPLEXITY_THRESHOLD=$((MAX_FILE_SIZE_LINES * 150 / 100))  # 50% higher than line count for complex files
    
    if [ "$COMPLEXITY" -gt "$COMPLEXITY_THRESHOLD" ]; then
      # Determine file type for suggestion
      if [ "$IS_TS_JS" -eq 1 ]; then
        # TypeScript/JavaScript: Use Serena
        warn_with_message \
          "Reading complex file ($FILE_LINES LOC, complexity: HIGH)" \
          "  mcp__serena__get_symbols_overview --relative_path \"$FILE_PATH\"
  mcp__serena__find_symbol --name_path \"SymbolName\" --relative_path \"$FILE_PATH\" --include_body true

REASON: High complexity detected (many functions/imports). Serena saves 75-80% tokens." \
          "~$((FILE_LINES * 4)) tokens → ~$((FILE_LINES / 5)) tokens (80% reduction)"
      else
        # Other files: Use claude-context
        warn_with_message \
          "Reading complex file ($FILE_LINES LOC, complexity: HIGH)" \
          "  mcp__claude-context__search_code \"relevant query\" --path \"$(dirname "$FILE_PATH")\"

REASON: High complexity detected. Semantic search finds relevant code efficiently." \
          "~$((FILE_LINES * 4)) tokens → ~1000 tokens (75% reduction)"
      fi
    
    # Check moderate complexity threshold
    elif [ "$COMPLEXITY" -gt "$((WARN_FILE_SIZE_LINES * 150 / 100))" ]; then
      # Moderate complexity suggestions
      if [ "$IS_TS_JS" -eq 1 ]; then
        warn_with_message \
          "Reading file with moderate complexity ($FILE_LINES LOC)" \
          "  Consider Serena for symbol-level navigation:
  mcp__serena__get_symbols_overview --relative_path \"$FILE_PATH\"

Potential savings: ~$((FILE_LINES * 3)) tokens" ""
      else
        warn_with_message \
          "Reading file with moderate complexity ($FILE_LINES LOC)" \
          "  Consider claude-context for semantic search:
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
