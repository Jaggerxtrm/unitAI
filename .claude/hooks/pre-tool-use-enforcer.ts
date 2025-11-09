#!/usr/bin/env node
/**
 * PRE-Tool-Use Enforcer Hook
 *
 * This hook intercepts BEFORE Claude uses Read/Bash/Grep tools
 * and suggests more efficient alternatives (Serena, claude-context)
 * based on file size and content type.
 *
 * Enforces token-aware decision making:
 * - Code files → ALWAYS use Serena (75-80% token savings)
 * - Pattern search → Use claude-context semantic search
 * - Bash cat/grep → Block and suggest Serena
 *
 * Hook Type: PreToolUse (experimental - suggestion only for now)
 * Triggers: Before Read, Bash, Grep tool execution
 * 
 * Metrics: Tracks token savings to data/token-metrics.sqlite
 */

import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

// ES modules support for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CLAUDE_PROJECT_DIR is set by Claude Code when running hooks
// Fallback: go up two directories from .claude/hooks/ to project root
const projectDir = process.env.CLAUDE_PROJECT_DIR || join(__dirname, "..", "..");

interface ToolUseEvent {
  tool: string;
  params: Record<string, any>;
}

interface SuggestionResult {
  message: string;
  blockedTool: string;
  recommendedTool: string;
  target: string;
  estimatedSavings: number;
  metadata?: Record<string, any>;
}

/**
 * Parse tool use event from stdin
 */
function parseToolUseEvent(): ToolUseEvent | null {
  try {
    const stdin = readFileSync(0, "utf-8");
    if (!stdin.trim()) {
      return null;
    }

    const event = JSON.parse(stdin);
    return {
      tool: event.tool || "",
      params: event.params || {}
    };
  } catch (error) {
    // Silent fail - hook should not break Claude
    return null;
  }
}

/**
 * Check if file is a code file based on extension
 */
function isCodeFile(filePath: string): boolean {
  const codeExtensions = [
    ".ts", ".tsx", ".js", ".jsx",
    ".py", ".java", ".go", ".rs",
    ".cpp", ".c", ".h", ".hpp",
    ".cs", ".rb", ".php", ".swift",
    ".kt", ".scala", ".clj"
  ];

  return codeExtensions.some(ext => filePath.endsWith(ext));
}

/**
 * Estimate token savings for a suggestion
 */
function estimateTokenSavings(tool: string, target: string): number {
  // Conservative estimates based on common patterns
  if (tool === "Read") {
    // Assume average code file is 400 LOC = ~160 tokens
    // Serena saves 75-80%, so ~120 tokens saved
    return 120;
  } else if (tool === "Grep" || tool === "Bash") {
    // Pattern search typically saves 1500 tokens vs manual grep
    return 1500;
  }
  return 100; // Default conservative estimate
}

/**
 * Generate suggestion message for tool usage
 * Returns structured result with metrics
 */
function generateSuggestion(tool: string, params: Record<string, any>): SuggestionResult | null {
  // Case 1: Read tool on code files
  if (tool === "Read" && params.file_path && isCodeFile(params.file_path)) {
    const estimatedSavings = estimateTokenSavings(tool, params.file_path);
    const message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  TOKEN-AWARE SUGGESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're about to use Read on a code file: ${params.file_path}

❌ NOT RECOMMENDED: Read tool for code files
✅ BETTER ALTERNATIVE: Serena (75-80% token savings)

Serena provides symbol-level navigation:
  mcp__serena__get_symbols_overview("${params.file_path}")
  mcp__serena__find_symbol("SymbolName", "${params.file_path}")

Why Serena?
- Only reads symbols you need, not entire file
- Structured output (classes, functions, types)
- Can find references across codebase
- 75-80% token savings on average

💰 Estimated savings: ~${estimatedSavings} tokens

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    return {
      message,
      blockedTool: "Read",
      recommendedTool: "serena",
      target: params.file_path,
      estimatedSavings,
      metadata: { fileType: "code" }
    };
  }

  // Case 2: Grep on codebase
  if (tool === "Grep" && params.pattern) {
    const estimatedSavings = estimateTokenSavings(tool, params.pattern);
    const message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  TOKEN-AWARE SUGGESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're about to use Grep for pattern: "${params.pattern}"

❌ NOT RECOMMENDED: Grep for semantic code search
✅ BETTER ALTERNATIVE: claude-context

claude-context provides semantic search:
  mcp__claude-context__search_code(
    "${params.pattern}",
    "${projectDir}"
  )

Why claude-context?
- Hybrid BM25 + vector search
- Finds semantically related code, not just literal matches
- Better results for "find functions that do X"
- Indexed for fast search

💰 Estimated savings: ~${estimatedSavings} tokens

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    return {
      message,
      blockedTool: "Grep",
      recommendedTool: "claude-context",
      target: params.pattern,
      estimatedSavings,
      metadata: { pattern: params.pattern }
    };
  }

  // Case 3: Bash cat/grep/find commands on code
  if (tool === "Bash" && params.command) {
    const cmd = params.command;

    if (cmd.match(/^cat\s+.*\.(ts|js|py|java|go|rs|cpp|c|h)/)) {
      const fileMatch = cmd.match(/cat\s+([^\s]+)/);
      const file = fileMatch ? fileMatch[1] : "file";
      const estimatedSavings = estimateTokenSavings(tool, file);

      const message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  TOKEN-AWARE SUGGESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're about to use: ${cmd}

❌ NOT RECOMMENDED: Bash cat for code files
✅ BETTER ALTERNATIVE: Serena

Use Serena for symbol-level access:
  mcp__serena__get_symbols_overview("${file}")

Avoid reading entire files via Bash when
symbol-level navigation is available.

💰 Estimated savings: ~${estimatedSavings} tokens

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      return {
        message,
        blockedTool: "Bash",
        recommendedTool: "serena",
        target: file,
        estimatedSavings,
        metadata: { command: cmd }
      };
    }

    if (cmd.match(/grep|rg/)) {
      const estimatedSavings = estimateTokenSavings(tool, cmd);
      const message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  TOKEN-AWARE SUGGESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You're about to use: ${cmd}

❌ NOT RECOMMENDED: Bash grep for code search
✅ BETTER ALTERNATIVE: claude-context or Serena

For semantic search:
  mcp__claude-context__search_code("query", "${projectDir}")

For symbol search:
  mcp__serena__search_for_pattern("pattern")

💰 Estimated savings: ~${estimatedSavings} tokens

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      return {
        message,
        blockedTool: "Bash",
        recommendedTool: "claude-context",
        target: cmd,
        estimatedSavings,
        metadata: { command: cmd }
      };
    }
  }

  return null;
}

/**
 * Record metrics to database
 */
async function recordMetrics(suggestion: SuggestionResult): Promise<void> {
  try {
    // Dynamic import to handle ES modules
    const { getMetricsCollector } = await import(join(projectDir, "src/utils/tokenEstimator.js"));
    const metrics = getMetricsCollector();
    
    metrics.record({
      source: "enforcer-hook",
      blockedTool: suggestion.blockedTool,
      recommendedTool: suggestion.recommendedTool,
      target: suggestion.target,
      estimatedSavings: suggestion.estimatedSavings,
      suggestionFollowed: false, // Default to false, can be updated later
      metadata: suggestion.metadata || {}
    });
  } catch (error) {
    // Silent fail - metrics should not break the hook
    // Error will be logged but won't prevent suggestion from showing
  }
}

/**
 * Main hook execution
 */
async function main() {
  const event = parseToolUseEvent();

  if (!event) {
    // No event to process
    process.exit(0);
  }

  const suggestion = generateSuggestion(event.tool, event.params);

  if (suggestion) {
    // Output suggestion to Claude (stdout)
    console.log(suggestion.message);

    // Record metrics asynchronously (non-blocking)
    recordMetrics(suggestion).catch(() => {
      // Silent fail - metrics should not break hook
    });

    // Also log to file for debugging
    const logPath = join(projectDir, ".claude", "tsc-cache", "pre-tool-enforcer.log");
    try {
      const { appendFileSync } = await import("fs");
      const timestamp = new Date().toISOString();
      appendFileSync(
        logPath,
        `[${timestamp}] Tool: ${event.tool}, Params: ${JSON.stringify(event.params)}\n` +
        `Savings: ${suggestion.estimatedSavings} tokens\n${suggestion.message}\n\n`
      );
    } catch {
      // Silent fail on log write
    }
  }

  // Exit with 0 - suggestions only, don't block
  process.exit(0);
}

main().catch((error) => {
  console.error("Pre-tool enforcer hook error:", error);
  process.exit(0); // Don't break Claude on hook error
});
