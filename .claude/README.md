# Claude Code Skills & Hooks System

This directory contains an auto-activation system for Claude Code skills that enhances workflow with automated reminders and best practices enforcement.

## System Overview

The system implements 7 key skills and several hooks to ensure Claude follows best practices when working on the project.

### Skills
Defined in `skills/skill-rules.json`:

1.  **claude-context-usage** - Ensures usage of semantic search (`claude-context`) before other search methods.
2.  **documentation-lookup** - Efficient access to project documentation using AI tools.
3.  **code-validation** - Guides verification workflows before commits or memory additions.
4.  **serena-surgical-editing** - Enforces symbol-level code surgery for safer edits in TS/JS.
5.  **unified-ai-orchestration** - Manages multi-model AI analysis (Gemini, Qwen) for complex tasks.
6.  **memory-search-reminder** - Reminds to check past memories before starting new implementations.
7.  **post-stop-resumption** - Assists in resuming work effectively after interruptions.

### Hooks
Configured in `settings.json` and located in `hooks/`:

1.  **skill-activation-prompt** (UserPromptSubmit) - Analyzes prompts to auto-suggest relevant skills.
2.  **smart-tool-enforcer** (PreToolUse) - Enforces tool usage rules (e.g., preventing `grep` when `claude-context` should be used).
3.  **post-tool-use-tracker** (PostToolUse) - Tracks file changes and tool usage.
4.  **claude-context-reminder** (PostToolUse) - Reminds to use context search if missed.
5.  **memory-search-reminder** (PostToolUse) - Reinforces memory checks.
6.  **workflow-pattern-detector** (PostToolUse) - Detects patterns to suggest workflows.

## Key Features

- **Auto-activation**: Skills are suggested automatically based on keywords, intent, and file context.
- **Guardrails**: `smart-tool-enforcer` prevents suboptimal tool usage.
- **Context Awareness**: Specialized skills for editing, searching, and validation.
- **Multi-Model Support**: Integration with other AI models for comprehensive reviews.

## Quick Start

Skills activate automatically based on:
- **Keywords** in your prompts (e.g., "refactor", "search", "commit")
- **File types** you are working on (e.g., `.ts` triggers surgical editing)
- **Actions** you perform (e.g., using `bash` triggers context reminders)

For configuration details, check `skills/skill-rules.json`.