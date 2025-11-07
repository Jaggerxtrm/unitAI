# Gemini CLI Known Issue

## Problem Description

The Gemini CLI (version 0.13.0) has a critical bug that prevents it from working correctly in non-IDE environments.

## Symptoms

```
[ERROR] [IDEClient] Failed to connect to IDE companion extension in VS Code
API Error: Request contains an invalid argument (400)
INVALID_ARGUMENT
```

## Root Cause

Analysis of error logs (`/tmp/gemini-client-error-*.json`) reveals:

1. **Prompt Duplication**: Gemini CLI sends the same user prompt twice in the conversation context
   ```json
   {
     "context": [
       {"role": "user", "parts": [{"text": "Ciao! Come stai?"}]},
       {"role": "user", "parts": [{"text": "Ciao! Come stai?"}]}  // DUPLICATE
     ]
   }
   ```

2. **IDE Dependency**: The CLI attempts to connect to VS Code IDE extension even when not needed

3. **API Validation Failure**: The duplicated prompt causes Google's API to reject the request with 400 error

## Reproduction

The issue occurs even when calling Gemini CLI directly:

```bash
gemini -m gemini-2.5-flash -p "Ciao! Come stai?"
# Result: 400 error with duplicate prompts
```

## Impact on unified-ai-mcp-tool

- **ArchitectAgent**: Cannot use Gemini (primary backend)
- **ImplementerAgent**: Falls back to Rovodev (working)
- **Workflows**: validate-last-commit and parallel-review partially functional

## Attempted Solutions

### ❌ Environment Variables
```bash
GEMINI_NO_IDE=1 GEMINI_DISABLE_IDE=1 gemini -p "test"
# Still fails - environment variables ignored
```

### ❌ Configuration Changes
No configuration options available to disable IDE integration or prevent prompt duplication.

## Workarounds

### Option 1: Use Qwen as Fallback for ArchitectAgent
Temporarily configure ArchitectAgent to use Qwen instead of Gemini:

```typescript
// src/agents/ArchitectAgent.ts
readonly preferredBackend = BACKENDS.QWEN;  // Instead of GEMINI
readonly fallbackBackend = undefined;
```

### Option 2: Implement Direct API Integration
Bypass Gemini CLI entirely and use `@google/generative-ai` package directly:

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
```

### Option 3: Wait for CLI Fix
Monitor Gemini CLI releases for fix: https://www.npmjs.com/package/@google/gemini-cli

## Current Status

- **Gemini CLI Version**: 0.13.0 (as of 2025-11-07)
- **Issue Status**: Under investigation by user
- **Temporary Solution**: System operational with Qwen + Rovodev (2/3 backends working)

## Related Files

- Error logs: `/tmp/gemini-client-error-Turn.run-sendMessageStream-*.json`
- Gemini settings: `~/.gemini/settings.json`
- Our executor: `src/utils/aiExecutor.ts` (not the cause)

## Next Steps

1. User investigating Gemini configuration fix
2. Consider implementing Option 2 (Direct API) for production robustness
3. Monitor Gemini CLI updates

---

**Last Updated**: 2025-11-07
**Reported By**: Phase 2 Agent System Testing
