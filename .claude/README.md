# Claude Code Skills & Hooks System

This directory contains an auto-activation system for Claude Code skills that enhances workflow with automated reminders and best practices enforcement.

## System Overview

The system implements 6 key skills and 3 hooks to ensure Claude follows best practices when working on the py_backend project:

### Skills:
1. **claude-context-usage** - Always use semantic search first
2. **documentation-lookup** - Efficient documentation access  
3. **second-guessing-verification** - MCP tool validation
4. **pre-commit-ai-review** - AI-powered code review
5. **pre-memory-commit-verification** - Quality checks before commits
6. **post-stop-resumption** - Proper session resumption

### Hooks:
1. **skill-activation** - Auto-suggests relevant skills
2. **post-tool-use-tracker** - Tracks file changes
3. **claude-context-reminder** - Logs direct file search usage

## Key Features

- Auto-activation of relevant skills based on context
- Claude-context semantic search as primary search method
- MCP tool integration for validation and review
- Session continuity and interruption handling
- Quality assurance before commits/memories

## Quick Start

Skills activate automatically based on:
- Keywords in prompts
- File types and content being worked on
- Actions being performed
- Context of the conversation

For more details, see IMPLEMENTATION_SUMMARY.md