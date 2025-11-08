#!/bin/bash

# Skip if environment variable is set
if [ -n "$SKIP_SKILL_ACTIVATION" ]; then
    exit 0
fi

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Run the TypeScript script using tsx
npx tsx skill-activation-prompt.ts