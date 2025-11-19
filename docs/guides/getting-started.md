# Getting Started Guide

**Version:** 1.0  
**Last Updated:** 2025-11-14

Quick start guide to get up and running with unified-ai-mcp-tool.

---

## Prerequisites

Before installing, ensure you have:

**Required:**
- Node.js 18 or higher
- npm or compatible package manager
- Git (for workflow features)

**AI Backend CLIs** (install only what you need):
- Qwen: `pip install qwen-code-cli`
- Gemini: `npm install -g @google/generative-ai-cli`
- Rovodev: `npm install -g @atlassian/acli`

**API Keys:**
- Gemini API key (if using Gemini backend)

---

## Installation

### Method 1: Claude Desktop (Quickest)

If you use Claude Desktop:

```bash
claude mcp add unified-ai -- npx -y @jaggerxtrm/unified-ai-mcp-tool
```

### Method 2: Global Installation (Recommended)

For system-wide availability:

```bash
npm install -g @jaggerxtrm/unified-ai-mcp-tool
```

Verify installation:

```bash
unified-ai-mcp-tool --version
```

### Method 3: Local Installation

For project-specific use:

```bash
npm install @jaggerxtrm/unified-ai-mcp-tool
```

---

## Configuration

### Claude Desktop Setup

1. Locate your configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Add the MCP server configuration:

```json
{
  "mcpServers": {
    "unified-ai": {
      "command": "unified-ai-mcp-tool"
    }
  }
}
```

3. Restart Claude Desktop

### API Key Configuration

If using Gemini backend:

```bash
export GEMINI_API_KEY="your-api-key-here"
```

Add to your shell profile for persistence:

```bash
# ~/.bashrc or ~/.zshrc
export GEMINI_API_KEY="your-api-key-here"
```

---

## First Workflow

Let's run your first workflow to initialize a development session.

### Step 1: Navigate to Your Project

```bash
cd /path/to/your/project
```

### Step 2: Run init-session

In Claude Desktop, simply say:

```
Initialize my development session
```

Or use the MCP tool directly:

```json
{
  "tool": "smart-workflows",
  "params": {
    "workflow": "init-session"
  }
}
```

### Step 3: Review the Output

The workflow will analyze your git repository and provide:
- Recent commits summary
- Current branch status
- AI analysis of recent work
- Suggested memory queries

Example output:

```markdown
# Session Initialization Report

## Repository Status
Branch: main
Staged files: 0
Modified files: 2

## Recent Commits
- abc123: feat: Add token optimization
- def456: fix: Resolve merge conflict
- ghi789: docs: Update README

## AI Analysis
Recent work focuses on token optimization in the utils/ directory.
Main changes suggest performance improvements and better cost management.

## Suggested Memory Queries
1. Search for: "token optimization strategies"
2. Search for: "2025-11-14 performance improvements"
```

---

## Common Workflows

### Before Committing Changes

Run pre-commit validation:

```
Validate my staged changes
```

Or with specific depth:

```json
{
  "tool": "smart-workflows",
  "params": {
    "workflow": "pre-commit-validate",
    "depth": "thorough"
  }
}
```

**Depth levels:**
- `quick`: 5-10 seconds (security scan only)
- `thorough`: 20-30 seconds (recommended for most commits)
- `paranoid`: 60-90 seconds (for critical changes)

### Code Review

Get AI-powered code review:

```
Review my code for security issues
```

Or specify files:

```json
{
  "tool": "smart-workflows",
  "params": {
    "workflow": "parallel-review",
    "files": ["src/auth.ts", "src/middleware/security.ts"],
    "focus": "security"
  }
}
```

### Investigating Bugs

When you encounter a bug:

```
I have a bug: users are getting 500 errors when uploading large files
```

Or with specifics:

```json
{
  "tool": "smart-workflows",
  "params": {
    "workflow": "bug-hunt",
    "symptoms": "500 error on file upload > 10MB",
    "suspected_files": ["src/api/upload.ts"]
  }
}
```

### Planning Features

Before implementing a new feature:

```
I want to add OAuth2 authentication. Help me design it.
```

Or detailed:

```json
{
  "tool": "smart-workflows",
  "params": {
    "workflow": "feature-design",
    "featureDescription": "OAuth2 with JWT tokens",
    "includeAPI": true,
    "includeDB": true
  }
}
```

---

## Using Individual AI Backends

You can also query AI backends directly without workflows.

### Gemini (Deep Analysis)

```
@src/utils/auth.ts Analyze this module for security vulnerabilities
```

Or via MCP:

```json
{
  "tool": "ask-gemini",
  "params": {
    "prompt": "@src/utils/auth.ts Analyze for security vulnerabilities",
    "model": "gemini-2.5-pro"
  }
}
```

### Cursor Agent (Refactor & Bug Fix)

```
@tests/auth.test.ts Add test cases for edge cases
```

Or via MCP:

```json
{
  "tool": "cursor-agent",
  "params": {
    "prompt": "@tests/auth.test.ts Proponi nuovi test edge case",
    "model": "composer-1",
    "projectRoot": "/home/dawid/Projects/unified-ai-mcp-tool"
  }
}
```

### Droid (Remediation Plan)

```
@src/api/ Refactor these API endpoints to use async/await
```

Or via MCP:

```json
{
  "tool": "droid",
  "params": {
    "prompt": "Sintomi: API upload 50MB → 500 error. Genera piano remediation.",
    "auto": "medium",
    "files": ["logs/upload-error.log"]
  }
}
```

---

## File Reference Syntax

All tools support referencing files:

**Single file:**
```
@src/index.ts
```

**Multiple files:**
```
@src/index.ts @src/utils/helper.ts
```

**Directory:**
```
@src/workflows/
```

**Glob pattern** (qwen only):
```
@src/**/*.test.ts
```

---

## Best Practices

### Start Each Session with init-session

Get context on recent work:

```
Initialize session
```

### Use Appropriate Validation Depth

- Quick validation for minor fixes
- Thorough validation for feature work (recommended)
- Paranoid validation for production releases

### Review Before Committing

Always run validation before commit:

```
1. Make changes
2. Run: Validate my staged changes
3. Review feedback
4. Commit if PASS
```

### Leverage Parallel Review

Get multiple perspectives:

```
Review these files for architecture and performance issues
```

### Document Decisions

After workflows complete:

```
Save this pattern to memory for future reference
```

---

## Troubleshooting

### "Backend not found" Error

**Solution:** Install the required CLI:

```bash
# Qwen
pip install qwen-code-cli

# Gemini  
npm install -g @google/generative-ai-cli

# Rovodev
npm install -g @atlassian/acli
```

### "Permission denied" Error

**Solution:** Increase autonomy level:

```json
{
  "workflow": "parallel-review",
  "params": {
    "files": ["..."],
    "autonomyLevel": "low"
  }
}
```

### "Workflow timeout" Error

**Solution:** Reduce scope:

- Analyze fewer files
- Use `quick` validation depth
- Split large analysis into smaller chunks

### API Key Issues

**Solution:** Set environment variable:

```bash
export GEMINI_API_KEY="your-key"
```

---

## Next Steps

Now that you are set up:

1. Read the [Workflows Guide](../WORKFLOWS.md) for detailed workflow documentation
2. Explore [Integrations Guide](../INTEGRATIONS.md) for skills and hooks
3. Check [API Reference](../reference/api-workflows.md) for complete specifications
4. Review [Best Practices](./advanced-patterns.md) for advanced usage

---

## Getting Help

**Documentation:**
- [Architecture Overview](../ARCHITECTURE.md)
- [Workflows Guide](../WORKFLOWS.md)
- [API Reference](../reference/)

**Logs:**
- Workflow logs: `logs/workflow-executions.log`
- Error logs: `logs/errors.log`
- Backend logs: `logs/ai-backend-calls.log`

**Issue Reporting:**
- GitHub: https://github.com/jaggerxtrm/unified-ai-mcp-tool/issues
- Include: Error message, workflow used, logs

---

## Quick Reference Card

```
SESSION START
  → Initialize session

BEFORE COMMIT
  → Validate my staged changes (thorough)

CODE REVIEW
  → Review [files] for [focus: security/performance/all]

BUG INVESTIGATION
  → I have a bug: [symptoms]

FEATURE PLANNING
  → Design feature: [description]

DIRECT AI QUERY
  → Gemini: @file Analyze architecture
  → Qwen: @file Fix bugs quickly
  → Rovodev: @file Refactor safely (shadow mode)
```
