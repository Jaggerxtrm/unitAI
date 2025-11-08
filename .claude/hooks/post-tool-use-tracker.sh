#!/bin/bash
set -e

# Post-tool-use hook that tracks edited files and their repos
# This runs after Edit, MultiEdit, or Write tools complete successfully

# Read tool information from stdin
tool_info=$(cat)

# Extract relevant data
tool_name=$(echo "$tool_info" | jq -r '.tool_name // empty')
file_path=$(echo "$tool_info" | jq -r '.tool_input.file_path // empty')
session_id=$(echo "$tool_info" | jq -r '.session_id // empty')

# Skip if not an edit tool or no file path
if [[ ! "$tool_name" =~ ^(Edit|MultiEdit|Write)$ ]] || [[ -z "$file_path" ]]; then
    exit 0  # Exit 0 for skip conditions
fi

# Skip markdown files
if [[ "$file_path" =~ \.(md|markdown)$ ]]; then
    exit 0  # Exit 0 for skip conditions
fi

# Create cache directory in project
cache_dir="$CLAUDE_PROJECT_DIR/.claude/tsc-cache/${session_id:-default}"
mkdir -p "$cache_dir"

# Function to detect repo from file path
detect_repo() {
    local file="$1"
    local project_root="$CLAUDE_PROJECT_DIR"

    # Remove project root from path
    local relative_path="${file#$project_root/}"

    # Extract first directory component
    local repo=$(echo "$relative_path" | cut -d'/' -f1)

    # Common project directory patterns
    case "$repo" in
        # Backend variations
        external-ingestion-pipeline|research-papers-pipeline|mercury-api|psql-db|shared)
            echo "$repo"
            ;;
        # Docker/infrastructure
        docker|infra|infrastructure)
            echo "$repo"
            ;;
        # Root level files
        *)
            # Check if it's a source file in root
            if [[ ! "$relative_path" =~ / ]]; then
                echo "root"
            else
                echo "unknown"
            fi
            ;;
    esac
}

# Detect repo
repo=$(detect_repo "$file_path")

# Skip if unknown repo
if [[ "$repo" == "unknown" ]] || [[ -z "$repo" ]]; then
    exit 0  # Exit 0 for skip conditions
fi

# Log edited file
echo "$(date +%s):$file_path:$repo" >> "$cache_dir/edited-files.log"

# Update affected repos list
if ! grep -q "^$repo$" "$cache_dir/affected-repos.txt" 2>/dev/null; then
    echo "$repo" >> "$cache_dir/affected-repos.txt"
fi

# Exit cleanly
exit 0