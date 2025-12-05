#!/usr/bin/env bash
# Workflow Pattern Detector Hook (PostToolUse)
#
# Gently suggests smart-workflows when detecting relevant patterns
# in user's reading/exploration activities.
# Now with smart throttling per workflow type
#
# Hook Type: PostToolUse (Read, Bash, Grep)
# Triggers: After user reads files or runs commands
# Behavior: Non-blocking suggestions only

set -euo pipefail

# Read hook input from stdin (JSON with tool name and arguments)
HOOK_INPUT=$(cat)

# Extract tool name, arguments and session
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool // empty')
TOOL_ARGS=$(echo "$HOOK_INPUT" | jq -r '.arguments // empty')
SESSION_ID=$(echo "$HOOK_INPUT" | jq -r '.session_id // "default"')

# Skip if no tool name
if [ -z "$TOOL_NAME" ]; then
  exit 0
fi

# Setup cache directory
CACHE_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude/tsc-cache/${SESSION_ID}"
mkdir -p "$CACHE_DIR"

# Throttling configuration (10 minutes per workflow type)
COOLDOWN_SECONDS=600

# Function to check if workflow suggestion should be throttled
should_throttle() {
  local workflow=$1
  local timestamp_file="$CACHE_DIR/workflow-${workflow}-last-suggestion"
  
  if [ -f "$timestamp_file" ]; then
    local last_time=$(cat "$timestamp_file")
    local now=$(date +%s)
    local time_since=$((now - last_time))
    
    if [ $time_since -lt $COOLDOWN_SECONDS ]; then
      return 0  # Should throttle
    fi
  fi
  
  return 1  # Should not throttle
}

# Function to suggest workflow
suggest_workflow() {
  local workflow=$1
  local reason=$2
  
  # Check throttling
  if should_throttle "$workflow"; then
    exit 0  # Skip suggestion
  fi
  
  # Update timestamp
  date +%s > "$CACHE_DIR/workflow-${workflow}-last-suggestion"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "💡 WORKFLOW SUGGESTION"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Pattern detected: $reason"
  echo ""
  echo "Consider using smart-workflows:"
  echo "  mcp__unitAI__smart-workflows --workflow \"$workflow\""
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Detect patterns based on tool usage
case "$TOOL_NAME" in
  Read)
    # Extract file path from arguments
    FILE_PATH=$(echo "$TOOL_ARGS" | jq -r '.file_path // empty')

    # Pattern detection based on file path
    case "$FILE_PATH" in
      *test*|*spec*|*.test.*|*.spec.*)
        suggest_workflow "bug-hunt" "Reading test files - consider bug-hunt workflow for comprehensive issue analysis"
        ;;
      *src/workflows/*|*src/tools/*)
        suggest_workflow "feature-design" "Reading workflow/tool implementation - consider feature-design for structured development"
        ;;
      *package.json|*tsconfig.json|*config*)
        suggest_workflow "parallel-review" "Reading configuration files - consider parallel-review for architectural analysis"
        ;;
    esac
    ;;

  Bash)
    # Extract command from arguments
    COMMAND=$(echo "$TOOL_ARGS" | jq -r '.command // empty')

    # Pattern detection based on command
    case "$COMMAND" in
      *"git diff"*|*"git status"*)
        suggest_workflow "pre-commit-validate" "Git changes detected - consider pre-commit-validate before committing"
        ;;
      *"npm test"*|*"npm run test"*|*"vitest"*|*"jest"*)
        suggest_workflow "bug-hunt" "Running tests - consider bug-hunt workflow if issues found"
        ;;
      *"git log"*|*"git show"*)
        suggest_workflow "validate-last-commit" "Reviewing commit history - consider validate-last-commit for analysis"
        ;;
    esac
    ;;

  Grep)
    # Extract pattern from arguments
    PATTERN=$(echo "$TOOL_ARGS" | jq -r '.pattern // empty')

    # Pattern detection based on search terms
    case "$PATTERN" in
      *bug*|*error*|*fix*|*issue*|*fail*)
        suggest_workflow "bug-hunt" "Searching for bugs/errors - consider bug-hunt workflow for comprehensive analysis"
        ;;
      *TODO*|*FIXME*|*HACK*)
        suggest_workflow "feature-design" "Searching for TODOs - consider feature-design workflow to address them systematically"
        ;;
    esac
    ;;
esac

# Always exit successfully (non-blocking)
exit 0
