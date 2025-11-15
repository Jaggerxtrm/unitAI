# Error Codes Reference

**Version:** 1.0  
**Last Updated:** 2025-11-14  
**Status:** Production Ready

Complete reference for error codes and error handling in unified-ai-mcp-tool.

---

## Error Response Format

All tools and workflows return errors in this standardized format:

```typescript
{
  success: false,
  error: {
    type: string,           // Error category
    code: string,           // Specific error code
    message: string,        // Human-readable message
    details?: any,          // Additional context
    recoverable: boolean    // Can retry?
  }
}
```

---

## Error Categories

### PERMISSION

Operations blocked by permission system.

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| PERMISSION_DENIED | Operation not allowed at current autonomy level | Autonomy level too restrictive | Increase autonomy level or use read-only operation |
| PERMISSION_READ_ONLY | Write operation attempted in read-only mode | autonomyLevel: read-only | Set autonomyLevel to 'low' or higher |
| PERMISSION_GIT_COMMIT | Commit operation not allowed | autonomyLevel < medium | Set autonomyLevel to 'medium' or 'high' |
| PERMISSION_GIT_PUSH | Push operation not allowed | autonomyLevel < high | Set autonomyLevel to 'high' |

**Recovery:** Increase autonomy level in workflow parameters.

---

### NOT_FOUND

Requested resources don't exist.

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| FILE_NOT_FOUND | Referenced file does not exist | File path incorrect or file deleted | Verify file path, check if file exists |
| COMMIT_NOT_FOUND | Git commit not found | Invalid commit reference | Use 'git log' to find valid commit hash |
| WORKFLOW_NOT_FOUND | Workflow does not exist | Typo in workflow name | Check workflow name: init-session, parallel-review, etc. |
| BACKEND_NOT_FOUND | AI backend CLI not found | CLI not installed | Install required CLI (qwen, gemini, acli) |

**Recovery:** Verify resource exists before calling.

---

### VALIDATION

Invalid parameters or input.

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| VALIDATION_MISSING_PARAM | Required parameter missing | Omitted required param | Add required parameter to request |
| VALIDATION_INVALID_TYPE | Parameter has wrong type | Type mismatch | Check parameter type in API docs |
| VALIDATION_INVALID_VALUE | Parameter value not allowed | Value out of range/enum | Use allowed values from API docs |
| VALIDATION_FILE_TOO_LARGE | File exceeds size limit | File > context limit | Reduce file size or split analysis |
| VALIDATION_EMPTY_DIFF | No changes to validate | git diff is empty | Make changes before running validation |

**Recovery:** Fix parameters according to API specification.

---

### BACKEND

AI backend failures.

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| BACKEND_TIMEOUT | AI backend did not respond in time | Network slow or large request | Retry with smaller scope |
| BACKEND_ERROR | AI backend returned error | Various (see details) | Check backend logs, retry |
| BACKEND_UNAVAILABLE | AI backend not responding | Service down or CLI not installed | Verify CLI installation, check network |
| BACKEND_API_KEY | API key invalid or missing | Missing/wrong API key | Set correct API key in environment |
| BACKEND_RATE_LIMIT | Rate limit exceeded | Too many requests | Wait and retry with exponential backoff |
| BACKEND_CONTEXT_LIMIT | Context window exceeded | Too many/large files | Reduce file count or size |

**Recovery:** Automatic retry with exponential backoff (3 attempts).

---

### TIMEOUT

Operations exceeded time limit.

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| TIMEOUT_WORKFLOW | Workflow execution timeout | Long-running operation | Reduce scope, simplify task |
| TIMEOUT_AI_CALL | AI backend call timeout | Large context or slow response | Reduce file count |
| TIMEOUT_GIT_OPERATION | Git command timeout | Large repository or slow disk | Check repository health |

**Recovery:** Automatic retry once, then fail with timeout error.

**Default Timeouts:**
- Workflow execution: 300s (5 minutes)
- AI backend calls: 120s (2 minutes)
- Git operations: 30s

---

### GIT

Git-related errors.

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| GIT_NOT_REPOSITORY | Not a git repository | Current directory not in git repo | Initialize git or navigate to git repo |
| GIT_COMMAND_FAILED | Git command failed | Various git errors | Check git error details in message |
| GIT_MERGE_CONFLICT | Merge conflict detected | Conflicting changes | Resolve conflicts manually |
| GIT_DIRTY_WORKING_TREE | Working tree has uncommitted changes | Staged/modified files present | Commit or stash changes |

**Recovery:** Depends on specific git issue, manual intervention often required.

---

### INTERNAL

Internal system errors.

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| INTERNAL_ERROR | Unexpected internal error | Bug in code | Report issue with logs |
| INTERNAL_DATABASE | Database operation failed | SQLite error | Check database permissions |
| INTERNAL_FILESYSTEM | Filesystem operation failed | Permission or disk space | Check disk space and permissions |
| INTERNAL_PARSE_ERROR | Failed to parse output | Unexpected AI response format | Retry, may work with different prompt |

**Recovery:** Retry once, log details for debugging.

---

## Error Recovery Strategies

### Automatic Retry

The system automatically retries on these error types:

**Transient Errors:**
- BACKEND_TIMEOUT (3 retries)
- BACKEND_ERROR (3 retries)
- BACKEND_UNAVAILABLE (2 retries)
- TIMEOUT_AI_CALL (1 retry)

**Retry Strategy:**
- Exponential backoff: 1s, 2s, 4s
- Maximum 3 retry attempts
- Circuit breaker: Disable backend after 5 consecutive failures

### Fallback Backends

Some workflows use fallback backends:

**init-session:**
- Primary: Gemini
- Fallback: Qwen
- Last resort: Basic git info only

**ImplementerAgent:**
- Primary: Rovodev
- Fallback: Gemini

### Graceful Degradation

When errors occur, workflows return partial results when possible:

**parallel-review:**
- If Gemini fails: Return Rovodev analysis only
- If Rovodev fails: Return Gemini analysis only
- If both fail: Return error

**pre-commit-validate:**
- If one backend fails: Continue with remaining backends
- Verdict based on available results

---

## Logging

All errors are logged to structured log files:

**Error Log:**
- Location: `logs/errors.log`
- Format: JSON for machine parsing
- Rotation: Daily
- Retention: 7 days

**Log Entry Format:**
```json
{
  "timestamp": "2025-11-14T10:30:45.123Z",
  "level": "error",
  "type": "BACKEND_TIMEOUT",
  "code": "BACKEND_TIMEOUT",
  "message": "AI backend did not respond in time",
  "details": {
    "backend": "gemini",
    "timeout": 120000,
    "workflow": "parallel-review"
  },
  "recoverable": true
}
```

**Querying Logs:**
```bash
# View recent errors
tail -f logs/errors.log

# Find specific error type
grep "BACKEND_TIMEOUT" logs/errors.log

# JSON parsing
cat logs/errors.log | jq '.[] | select(.type == "PERMISSION")'
```

---

## Debugging Guide

### Step 1: Check Error Type

Identify error category from response:

```typescript
if (!result.success) {
  console.log('Error type:', result.error.type);
  console.log('Error code:', result.error.code);
}
```

### Step 2: Review Error Details

Examine details field for context:

```typescript
console.log('Error details:', result.error.details);
```

### Step 3: Check Logs

Review relevant log files:

```bash
# Workflow errors
tail -20 logs/workflow-executions.log

# Backend errors
tail -20 logs/ai-backend-calls.log

# Permission errors
tail -20 logs/permission-checks.log
```

### Step 4: Verify Configuration

Common configuration issues:

**CLI Installation:**
```bash
qwen --version
gemini --version
acli --version
```

**API Keys:**
```bash
echo $GEMINI_API_KEY
```

**File Paths:**
```bash
ls -la [file-path]
```

### Step 5: Try Recovery

Based on error type:

**PERMISSION:** Increase autonomy level
**NOT_FOUND:** Verify resource exists
**VALIDATION:** Fix parameters
**BACKEND:** Check CLI installation and network
**TIMEOUT:** Reduce scope
**GIT:** Fix git issues manually
**INTERNAL:** Retry or report issue

---

## Common Scenarios

### Scenario 1: "File not found" Error

**Error:**
```json
{
  "type": "NOT_FOUND",
  "code": "FILE_NOT_FOUND",
  "message": "Referenced file does not exist: src/missing.ts"
}
```

**Diagnosis:**
- File path incorrect
- File was moved/deleted
- Working directory wrong

**Solution:**
1. Verify file exists: `ls src/missing.ts`
2. Check working directory: `pwd`
3. Use relative paths from workspace root

### Scenario 2: Backend Timeout

**Error:**
```json
{
  "type": "BACKEND",
  "code": "BACKEND_TIMEOUT",
  "message": "AI backend did not respond in time"
}
```

**Diagnosis:**
- Request too large
- Network slow
- Backend overloaded

**Solution:**
1. Reduce file count
2. Split large analysis into smaller chunks
3. Check network connection
4. Retry after a moment

### Scenario 3: Permission Denied

**Error:**
```json
{
  "type": "PERMISSION",
  "code": "PERMISSION_DENIED",
  "message": "Write operation not allowed at read-only autonomy level"
}
```

**Diagnosis:**
- Autonomy level too restrictive
- Operation requires higher permissions

**Solution:**
1. Increase autonomy level:
   ```json
   {
     "workflow": "parallel-review",
     "params": {
       "files": [...],
       "autonomyLevel": "low"
     }
   }
   ```
2. Or use read-only operation if possible

### Scenario 4: Context Limit Exceeded

**Error:**
```json
{
  "type": "BACKEND",
  "code": "BACKEND_CONTEXT_LIMIT",
  "message": "Context window exceeded: 150000 tokens (max: 128000)"
}
```

**Diagnosis:**
- Too many files referenced
- Files too large
- Backend has context limit

**Solution:**
1. Reduce file count
2. Use more specific file references
3. Split analysis into multiple calls
4. Use Gemini (2M tokens) instead of Qwen (128K tokens)

---

## See Also

- [Base Tools API](./api-tools.md) - Tool specifications
- [Workflow API](./api-workflows.md) - Workflow specifications
- [Architecture](../ARCHITECTURE.md) - Error recovery framework
