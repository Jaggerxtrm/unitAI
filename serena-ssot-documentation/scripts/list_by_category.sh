#!/bin/bash
# List Serena memories filtered by category prefix
#
# Usage: list_by_category.sh [category]
# category: ssot | pattern | plan | reference | archive | troubleshoot | all
#
# Examples:
#   list_by_category.sh ssot       -> List all SSOT memories
#   list_by_category.sh archive    -> List all archived memories
#   list_by_category.sh all        -> List all memories grouped by category

set -e

CATEGORY="${1:-all}"
MEMORIES_DIR="${SERENA_MEMORIES_DIR:-.serena/memories}"

if [ ! -d "$MEMORIES_DIR" ]; then
    echo "ERROR: Memories directory not found: $MEMORIES_DIR"
    echo "Set SERENA_MEMORIES_DIR environment variable or run from project root"
    exit 1
fi

# Function to list files with a given prefix
list_prefix() {
    local prefix=$1
    local label=$2
    local files

    files=$(find "$MEMORIES_DIR" -maxdepth 1 -name "${prefix}_*.md" -type f 2>/dev/null | sort)

    if [ -n "$files" ]; then
        echo ""
        echo "=== ${label} ==="
        echo "$files" | while read -r file; do
            basename "$file"
        done
    fi
}

# List by category
case "$CATEGORY" in
    ssot)
        list_prefix "ssot" "SSOT Memories"
        ;;
    pattern)
        list_prefix "pattern" "Pattern Memories"
        ;;
    plan)
        list_prefix "plan" "Plan Memories"
        ;;
    reference)
        list_prefix "reference" "Reference Memories"
        ;;
    archive)
        list_prefix "archive" "Archived Memories"
        ;;
    troubleshoot)
        list_prefix "troubleshoot" "Troubleshooting Guides"
        ;;
    all)
        echo "Memories in: $MEMORIES_DIR"
        list_prefix "ssot" "SSOT Memories"
        list_prefix "pattern" "Pattern Memories"
        list_prefix "plan" "Plan Memories"
        list_prefix "reference" "Reference Memories"
        list_prefix "troubleshoot" "Troubleshooting Guides"
        list_prefix "archive" "Archived Memories (Deprecated)"

        # Count special files
        commit_logs=$(find "$MEMORIES_DIR" -maxdepth 1 -name "commit_log*.md" -type f 2>/dev/null | wc -l)
        if [ "$commit_logs" -gt 0 ]; then
            echo ""
            echo "=== Commit Logs ==="
            find "$MEMORIES_DIR" -maxdepth 1 -name "commit_log*.md" -type f | sort | while read -r file; do
                basename "$file"
            done
        fi
        ;;
    *)
        echo "ERROR: Invalid category: $CATEGORY"
        echo "Valid categories: ssot, pattern, plan, reference, archive, troubleshoot, all"
        exit 1
        ;;
esac
