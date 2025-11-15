# API Reference: Base Tools

**Version:** 1.1  
**Last Updated:** 2025-11-14  
**Status:** Production Ready

This document provides the complete API reference for the three base MCP tools provided by unified-ai-mcp-tool.

---

## Table of Contents

- [ask-gemini](#ask-gemini)
- [ask-qwen](#ask-qwen)
- [ask-rovodev](#ask-rovodev)
- [File Reference Syntax](#file-reference-syntax)

---

## ask-gemini

Query Google Gemini AI with support for file analysis and large context windows.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| prompt | string | Yes | - | Query for Gemini. Use @filename or #filename to reference files |
| model | string | No | gemini-2.5-pro | Model to use |
| sandbox | boolean | No | false | Use sandbox mode for safe code execution |

### Models

| Model | Context Window | Speed | Best For |
|-------|---------------|-------|----------|
| gemini-2.5-pro | 2M+ tokens | Medium-Slow | Deep reasoning, architecture, complex analysis |
| gemini-2.5-flash | 1M tokens | Fast | Quick analysis, cost-effective operations |

### Return Value

```typescript
{
  output: string,      // AI response
  success: boolean,    // Whether execution succeeded
  error?: string       // Error message if failed
}
```

### Examples

**Example 1: Architecture Analysis**

```json
{
  "prompt": "@src/workflows/parallel-review.workflow.ts Analyze the architecture of this workflow. What patterns are used? What are the trade-offs?",
  "model": "gemini-2.5-pro"
}
```

**Example 2: Quick Documentation Review**

```json
{
  "prompt": "@README.md Is this documentation clear and complete? Suggest improvements.",
  "model": "gemini-2.5-flash"
}
```

**Example 3: Multiple File Analysis**

```json
{
  "prompt": "@src/utils/aiExecutor.ts @src/utils/tokenEstimator.ts How do these two modules interact? Are there any potential issues?",
  "model": "gemini-2.5-pro"
}
```

**Example 4: Sandbox Mode**

```json
{
  "prompt": "Create a script that analyzes log files for errors and test it in sandbox",
  "sandbox": true
}
```

### Best Practices

**Use gemini-2.5-pro when:**
- Architectural analysis needed
- Complex reasoning required
- Security analysis important
- Large context window needed (>1M tokens)

**Use gemini-2.5-flash when:**
- Quick feedback needed
- Cost is a concern
- Simple analysis sufficient
- Multiple iterations expected

**File References:**
- Use @filename for files in workspace
- Can reference multiple files in single prompt
- Large files may be truncated (check context limits)

### Error Cases

| Error | Cause | Solution |
|-------|-------|----------|
| FILE_NOT_FOUND | Referenced file doesn't exist | Check file path, use relative to workspace root |
| CONTEXT_LIMIT_EXCEEDED | Too many/large files | Reduce number of files or use smaller files |
| API_KEY_INVALID | Gemini API key not configured | Set GEMINI_API_KEY environment variable |
| TIMEOUT | Long-running operation | Reduce file count or simplify query |

---

## ask-qwen

Query Qwen AI with support for codebase exploration and multiple approval modes.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| prompt | string | Yes | - | Query for Qwen. Use @filename or #filename to reference files |
| model | string | No | qwen3-coder-plus | Model to use |
| approvalMode | string | No | default | Approval mode for operations |
| sandbox | boolean | No | false | Use sandbox mode for safe code execution |
| yolo | boolean | No | false | Auto-approve all operations (use with caution) |

### Models

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| qwen3-coder-plus | Medium | High | Balanced performance (recommended) |
| qwen3-coder-turbo | Fast | Medium | Quick iterations, simple tasks |
| qwen3-coder-pro | Slow | Highest | Complex code generation, highest quality |
| qwen3-coder | Fast | Medium | Base model, general purpose |
| qwen3-coder-fallback | Fast | Low | Emergency fallback only |

### Approval Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| plan | Analysis only, no execution | Understanding code, planning changes |
| default | Prompt for each operation | Safe exploration, learning |
| auto-edit | Auto-approve file edits only | Rapid development with review |
| yolo | Auto-approve all operations | Trusted automation (caution advised) |

### Return Value

```typescript
{
  output: string,      // AI response
  success: boolean,    // Whether execution succeeded
  error?: string       // Error message if failed
}
```

### Examples

**Example 1: Code Generation**

```json
{
  "prompt": "@tests/unit/tokenEstimator.test.ts Generate additional test cases covering edge cases for token estimation",
  "model": "qwen3-coder-plus",
  "approvalMode": "auto-edit"
}
```

**Example 2: Security Scan**

```json
{
  "prompt": "@src/**/*.ts Scan all TypeScript files for security vulnerabilities: SQL injection, XSS, hardcoded secrets, path traversal",
  "model": "qwen3-coder-turbo",
  "approvalMode": "plan"
}
```

**Example 3: Quick Fix with Auto-Approve**

```json
{
  "prompt": "@src/utils/logger.ts Fix the missing error handler in the file write operation",
  "model": "qwen3-coder-plus",
  "yolo": true
}
```

**Example 4: Codebase Exploration**

```json
{
  "prompt": "@src/ Explain the overall structure of this codebase. What are the main components and how do they interact?",
  "model": "qwen3-coder-plus",
  "approvalMode": "plan"
}
```

**Example 5: Sandbox Testing**

```json
{
  "prompt": "Create a sorting algorithm and test it with various input sizes",
  "sandbox": true,
  "yolo": true
}
```

### Best Practices

**Model Selection:**
- Use qwen3-coder-plus for most tasks (best balance)
- Use qwen3-coder-turbo for rapid iteration
- Use qwen3-coder-pro only when highest quality essential

**Approval Modes:**
- Start with "plan" to understand what will happen
- Use "default" when learning or exploring
- Use "auto-edit" when confident in changes
- Use "yolo" only in automation with proper error handling

**File References:**
- @src/**/*.ts references all TypeScript files in src/
- Can use glob patterns for multiple files
- Be cautious with large file sets (may exceed context)

### Error Cases

| Error | Cause | Solution |
|-------|-------|----------|
| FILE_NOT_FOUND | Referenced file doesn't exist | Verify file path exists |
| APPROVAL_REJECTED | User rejected proposed operation | Review operation, adjust prompt |
| CONTEXT_LIMIT_EXCEEDED | Too many files referenced | Reduce scope, use more specific paths |
| CLI_NOT_FOUND | qwen CLI not installed | Install: pip install qwen-code-cli |
| TIMEOUT | Long-running operation | Reduce file count or simplify task |

---

## ask-rovodev

Query Atlassian Rovo Dev AI with shadow mode support and session management.

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| prompt | string | Yes | - | Query for Rovodev. Use @filename to reference files |
| yolo | boolean | No | false | Auto-approve all operations |
| shadow | boolean | No | false | Work on temporary workspace copy (safe mode) |
| restore | boolean | No | false | Continue last session |
| verbose | boolean | No | false | Detailed output |

### Shadow Mode

Shadow mode creates a temporary copy of your workspace, allowing Rovodev to make changes without affecting the original files. Review changes before applying.

**Benefits:**
- Safe experimentation
- Review all changes before applying
- Easy rollback
- No risk to working directory

**Usage:**
```json
{
  "prompt": "@src/utils/ Refactor these utility functions to use async/await",
  "shadow": true
}
```

### Session Management

Rovodev maintains session state, allowing you to continue previous conversations.

**Restore Session:**
```json
{
  "prompt": "Continue with the refactoring we discussed",
  "restore": true
}
```

### Return Value

```typescript
{
  output: string,      // AI response
  success: boolean,    // Whether execution succeeded
  error?: string       // Error message if failed
}
```

### Examples

**Example 1: Safe Refactoring**

```json
{
  "prompt": "@src/workflows/bug-hunt.workflow.ts Refactor this workflow to use the Strategy pattern for backend selection. Make it more modular and testable.",
  "shadow": true,
  "verbose": true
}
```

**Example 2: Bug Fix**

```json
{
  "prompt": "@src/utils/aiExecutor.ts Fix the race condition in the retry logic at line 145. The retry counter is not thread-safe.",
  "yolo": false
}
```

**Example 3: Code Review with Suggestions**

```json
{
  "prompt": "@src/agents/ArchitectAgent.ts Review this code for production readiness. Suggest improvements for error handling and logging.",
  "verbose": true
}
```

**Example 4: Fast Automation**

```json
{
  "prompt": "@package.json Update all dependencies to latest stable versions",
  "yolo": true
}
```

**Example 5: Continue Session**

```json
{
  "prompt": "Apply the changes we discussed to the ImplementerAgent as well",
  "restore": true
}
```

### Best Practices

**Shadow Mode:**
- Always use shadow mode for large refactorings
- Review shadow changes before applying
- Use for experimental changes

**Session Management:**
- Use restore for multi-step operations
- Sessions persist across Claude Code restarts
- Clear session when switching tasks

**Yolo Mode:**
- Only use in trusted automation
- Always have git backup
- Review changes after execution

**File References:**
- Can reference directories: @src/utils/
- Can reference multiple files: @file1.ts @file2.ts
- Workspace-relative paths preferred

### Error Cases

| Error | Cause | Solution |
|-------|-------|----------|
| FILE_NOT_FOUND | Referenced file doesn't exist | Check file path |
| SHADOW_FAILED | Shadow workspace creation failed | Check disk space, permissions |
| CLI_NOT_FOUND | acli (Rovodev CLI) not installed | Install: npm install -g @atlassian/acli |
| SESSION_NOT_FOUND | Restore requested but no session | Start new session without restore |
| TIMEOUT | Long-running operation | Reduce scope or split into smaller tasks |

---

## File Reference Syntax

All three tools support powerful file reference syntax for including files in prompts.

### Syntax Options

| Syntax | Description | Example |
|--------|-------------|---------|
| @filename | Include specific file | @src/index.ts |
| #filename | Alternative syntax (qwen, rovodev) | #package.json |
| @directory/ | Include entire directory | @src/utils/ |
| @glob | Glob pattern (qwen only) | @src/**/*.test.ts |

### Examples

**Single File:**
```
@src/index.ts
```

**Multiple Files:**
```
@src/index.ts @src/utils/logger.ts @package.json
```

**Directory:**
```
@src/workflows/
```

**Glob Pattern (qwen only):**
```
@src/**/*.workflow.ts
```

### Best Practices

**File Selection:**
- Be specific with file paths to avoid context bloat
- Use directories for related files
- Limit to 10-15 files per query for best results

**Path Format:**
- Use forward slashes (/) even on Windows
- Paths relative to workspace root
- Absolute paths not recommended

**Context Management:**
- Large files may be truncated
- Multiple large files may exceed context limit
- Use specific file references instead of directory-wide includes

---

## Tool Comparison

| Feature | ask-gemini | ask-qwen | ask-rovodev |
|---------|------------|----------|-------------|
| Primary Strength | Deep reasoning, architecture | Code generation, security | Production code, practical fixes |
| Context Window | 2M+ tokens | 128K tokens | 200K tokens |
| Speed | Medium-Slow | Fast | Medium |
| Cost | Medium-High | Low | Medium |
| File Syntax | @ | @ or # | @ |
| Safe Mode | sandbox | sandbox + approvalMode | shadow |
| Session Management | No | No | Yes (restore) |
| Best For | Architecture, review | Quick fixes, iteration | Enterprise refactoring |

### Decision Tree

```
Need deep architectural analysis? → ask-gemini (gemini-2.5-pro)
Need quick code fixes? → ask-qwen (qwen3-coder-turbo)
Need production-ready code? → ask-rovodev (with shadow mode)
Need to iterate rapidly? → ask-qwen (qwen3-coder-plus)
Need large context? → ask-gemini (2M+ tokens)
Need safe refactoring? → ask-rovodev (shadow mode)
Need security scan? → ask-qwen (plan mode)
```

---

## See Also

- [Workflow API Reference](./api-workflows.md) - Smart workflows documentation
- [Error Codes Reference](./error-codes.md) - Complete error reference
- [Workflows Guide](../WORKFLOWS.md) - Workflow usage guide
- [Integration Guide](../INTEGRATIONS.md) - MCP servers, skills, hooks
