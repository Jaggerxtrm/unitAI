# Autonomous Token-Aware Decision Making System

**Implemented:** 2025-11-09
**Commit:** 42eedc9

## Components Created

### 1. Token Estimator Utility
- **File:** `src/utils/tokenEstimator.ts` (350 LOC)
- **Functions:**
  - `estimateFileTokens(filePath)`: LOC counting + token calculation
  - `estimateToolOutput(tool, args)`: Tool output prediction
  - `suggestOptimalTool(context)`: Intelligent tool selection
  - `formatToolSuggestion(suggestion)`: Human-readable output
- **Token Rates:** .ts=0.4, .js=0.35, .py=0.38, .md=0.25, .json=0.15
- **Tests:** 19/19 passing (100%)

### 2. Pre-Tool-Use Enforcer Hook
- **File:** `.claude/hooks/pre-tool-use-enforcer.ts` (220 LOC)
- **Triggers:** BEFORE Read, Bash, Grep execution
- **Enforcement:**
  - Code files → BLOCK Read, suggest Serena (75-80% savings)
  - Grep on codebase → BLOCK, suggest claude-context
  - Bash cat/grep → BLOCK, suggest Serena/claude-context
- **Mode:** SUGGESTIVE (shows alternatives, doesn't hard-block)

### 3. Workflow Pattern Detector Hook
- **File:** `.claude/hooks/workflow-pattern-detector.ts` (280 LOC)
- **Patterns Detected:**
  - Feature implementation (implement|add feature|create)
  - Bug hunting (bug|error|fix|debug)
  - Refactoring (refactor|rename|reorganize)
  - Code review (review|analyze|validate)
  - Pre-commit (commit|ready to commit)
- **Confidence Scoring:** 0.3 per match, ×1.5 if multiple patterns
- **File Count Detection:** Complexity based on files mentioned

### 4. Token-Aware Orchestration Skill
- **File:** `.claude/skills/token-aware-orchestration/SKILL.md` (350 LOC)
- **Decision Trees:**
  - File size: <300 (Read ok), 300-600 (Serena), >600 (workflow)
  - Complexity: single file (Serena), 2-5 files (Serena+context), >5 (workflow)
- **Tool Selection Matrix:**
  - Code reading → Serena (get_symbols_overview)
  - Pattern search → claude-context (search_code)
  - Multi-file → Workflow orchestration
  - Refactoring → Serena (find_referencing_symbols)

## CLAUDE.MD Section 13

Added complete autonomous enforcement documentation:
- PRE-Tool Decision System (table)
- Pattern-Based Workflow Triggering (table)
- Token Estimation process (4 steps)
- File Size Enforcement Rules
- Autonomous Decision Flow diagram
- Skill Integration
- Decision Confidence levels (>80%, 60-80%, 50-60%, <50%)
- Token Budget Awareness
- Enforcement Level (suggestive vs enforce)

## Decision Logic

**Always Serena for Code:**
- ANY code file (.ts/.js/.py/etc) → Use Serena, not Read
- Reason: Symbol-level navigation, 75-80% token savings

**Semantic Search:**
- Pattern search in codebase → claude-context, not Grep
- Reason: BM25+vectors, finds related code

**Workflow Orchestration:**
- >3 files OR complex task → Auto-suggest workflow
- Feature: claude-context → Serena → ask-gemini+qwen → ask-rovodev
- Bug: claude-context → Serena → ask-gemini+qwen → fix
- Refactor: Serena find_referencing_symbols → validate → rename

## Test Results

- Total tests: 208
- Passing: 180 (86%)
- New tests: 19/19 (tokenEstimator, 100%)
- Build: ✅ Successful

## Expected Behavior

**Scenario 1: Read code file**
```
❌ BLOCKED: Read tool not recommended
✅ SUGGEST: mcp__serena__get_symbols_overview
💰 Savings: ~300 tokens (75%)
```

**Scenario 2: Implement feature**
```
🎯 PATTERN: feature-design (85% confidence)
📋 WORKFLOW: claude-context → Serena → ask-gemini+qwen
```

**Scenario 3: Grep codebase**
```
❌ BLOCKED: Grep not optimal
✅ SUGGEST: mcp__claude-context__search_code
```

## Files Changed

New files:
- src/utils/tokenEstimator.ts
- tests/unit/tokenEstimator.test.ts
- .claude/hooks/pre-tool-use-enforcer.ts
- .claude/hooks/workflow-pattern-detector.ts
- .claude/skills/token-aware-orchestration/SKILL.md

Modified:
- CLAUDE.MD (Section 13 added)
- .claude/hooks/skill-activation-prompt.ts (chmod +x)

Reorganized:
- docs/PLAN.md (renamed from UNIFIED_AUTONOMOUS_SYSTEM_PLAN_V3.md)
- docs/deprecated/ (moved old docs)
- docs/history/ (moved completion docs)

## Integration Points

**Hooks:**
- PostToolUse: claude-context-reminder, memory-search-reminder
- UserPromptSubmit: skill-activation-prompt, workflow-pattern-detector (NEW)
- PreToolUse: pre-tool-use-enforcer (NEW, experimental)

**Skills:**
- 9 existing skills + token-aware-orchestration (NEW)
- Auto-activation on inefficient tool usage

**Workflows:**
- All 6 workflows (feature-design, bug-hunt, parallel-review, etc)
- Auto-triggering based on pattern detection

## Next Steps

1. Monitor pattern detection accuracy
2. Collect token savings metrics
3. Tune confidence thresholds
4. Add hard-blocking mode (configurable)
5. Expand to more file types
6. Fix OpenMemory OpenAI API key issue (401 error)
