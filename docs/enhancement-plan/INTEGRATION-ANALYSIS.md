# Integration Analysis: Cross-Feature Synergies

**Date:** November 19, 2025  
**Status:** Analysis Complete  
**Implementations Reviewed:** All 4 tasks (Hooks/Skills v2.0, MCP Tools, OpenSpec, Slash Commands)

---

## Executive Summary

All 4 implementations are **production-ready** and working independently. This analysis identifies **12 high-value integration opportunities** where features can work together incrementally to provide compounded benefits.

**Key Finding:** The implementations were designed with integration in mind - slash commands reference workflows, skills can trigger tools, hooks can guide OpenSpec usage. All pieces ready to connect.

---

## 1. Implementations Overview

### Task 1: Hooks & Skills System v2.0
**Status:** ✅ Complete (26 files, ~2,500 LOC)

**Key Features:**
- Progressive disclosure (70% context bloat reduction)
- Confidence scoring with behavior flags
- Unified post-tool reminder (3× faster)
- Context-aware complexity thresholds
- User preferences system
- 2 new skills: `quick-exploration`, `token-budget-awareness`

### Task 2: MCP Tools Integration
**Status:** ✅ Complete (58 files, ~3,900 LOC delta)

**Key Features:**
- cursor-agent tool (6 models: GPT-5.1, Sonnet-4.5, Composer-1, etc.)
- droid tool (GLM-4.6 with autonomy levels)
- Removed ask-qwen and ask-rovodev
- Enhanced 6 workflows: bug-hunt, feature-design, refactor-sprint, auto-remediation, triangulated-review, parallel-review
- AI executor utility with fallback handling

### Task 3: OpenSpec Integration
**Status:** Phase 0-2 Complete, Phase 3 Pending

**Key Features:**
- 6 MCP tools: init, add, show, detect, track, apply
- Language-agnostic validation (Python, Go, Rust)
- Change tracking workflow
- Integrated `openspec-driven-development` workflow
- Comprehensive user documentation

### Task 4: Slash Commands
**Status:** ✅ Complete (20 files, ~2,500 LOC)

**Key Features:**
- 5 commands: `/init-session`, `/save-commit`, `/ai-task`, `/create-spec`, `/check-docs`
- Security-first validation
- Workflow integration (references smart-workflows)
- Memory safety guarantees (save only when stable)

---

## 2. Integration Opportunities Matrix

### High-Priority (Implement First)

#### 2.1 OpenSpec + Slash Commands
**Integration Point:** Add `/openspec` command  
**Value:** Simplify OpenSpec workflow invocation  
**Effort:** Low (1-2 hours)

**Implementation:**
```typescript
// .claude/slash-commands/commands/openspec.ts
export async function executeOpenspec(params: string[]) {
  // Map subcommands to MCP tools:
  // /openspec init → openspec-init
  // /openspec add "feature" → openspec-add  
  // /openspec show → openspec-show
  // /openspec track → openspec-track
  // /openspec apply → openspec-apply
}
```

**User Experience:**
```bash
/openspec init
/openspec add "Add OAuth authentication endpoint"
/openspec track
/openspec apply spec-001.md
```

---

#### 2.2 Hooks → OpenSpec Guidance
**Integration Point:** Skill activation for spec-driven development  
**Value:** Remind to create/update specs before implementation  
**Effort:** Low (1 hour)

**Implementation:**
- Add `openspec-workflow` skill to `skill-rules.json`
- Trigger on keywords: "implement", "feature", "new functionality"
- Suggest: "Consider creating OpenSpec first: `/openspec add \"...\"` or `mcp__openspec-init`"

**Hook Enhancement:**
```javascript
// skill-activation-prompt.ts
{
  "openspec-workflow": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "medium",
    "promptTriggers": {
      "keywords": ["implement", "feature", "new", "add functionality"],
      "intentPatterns": ["implement.*new", "add.*feature"]
    },
    "description": "Use OpenSpec for spec-driven development before implementation"
  }
}
```

---

#### 2.3 cursor-agent/droid + Slash Commands
**Integration Point:** Add agentic tools to `/ai-task`  
**Value:** Expose cursor-agent/droid via simple slash command  
**Effort:** Medium (2-3 hours)

**Implementation:**
```typescript
// .claude/slash-commands/commands/ai-task.ts - extend subcommands
case 'cursor':
  return await executeCursor(subParams); // Wrapper for cursor-agent tool

case 'droid':
  return await executeDroid(subParams); // Wrapper for droid tool
```

**User Experience:**
```bash
/ai-task cursor "Fix authentication bug" --model sonnet-4.5
/ai-task droid "Generate remediation plan for 500 errors" --auto medium
```

---

### Medium-Priority (Implement After First Wave)

#### 2.4 Workflows → OpenSpec Integration
**Integration Point:** Embed OpenSpec checks in workflows  
**Value:** Enforce spec-driven development in automated workflows  
**Effort:** Medium (3-4 hours per workflow)

**Workflows to Enhance:**
1. **feature-design.workflow.ts**
   - Check if OpenSpec exists for feature
   - If not, prompt to create one
   - Validate implementation against spec

2. **pre-commit-validate.workflow.ts**
   - Check if changed code has corresponding specs
   - Validate spec compliance
   - Warn ifSpec → implementation drift detected

**Implementation Pattern:**
```typescript
// feature-design.workflow.ts
const hasSpec = await executeOpenspecShow({ filter: featureName });
if (!hasSpec.found) {
  onProgress?.(`⚠️ No OpenSpec found. Create one first.`);
  // Optionally auto-create basic spec
  await executeOpenspecAdd({ description: featureName });
}
```

---

#### 2.5 Skills → cursor-agent/droid Recommendations
**Integration Point:** Guide users to appropriate AI tool based on context  
**Value:** Smart backend selection for different task types  
**Effort:** Medium (2 hours)

**Skill Logic:**
- **Bug fixing** → Suggest cursor-agent (best for surgical fixes)
- **Refactoring** → Suggest cursor-agent (multi-model analysis)
- **Incident response** → Suggest droid (autonomous remediation planning)
- **Complex architecture** → Suggest ask-gemini (deep reasoning)

**Implementation:**
```json
// skill-rules.json - add relatedTools property
{
  "quick-exploration": {
    "relatedTools": ["cursor-agent", "serena"],
    "toolGuidance": "After exploration, use cursor-agent for surgical edits or serena for symbol-level navigation"
  }
}
```

---

#### 2.6 `/save-commit` → Enhanced Validation
**Integration Point:** Use cursor-agent/droid for pre-commit validation  
**Value:** AI-powered code review before commit  
**Effort:** Medium (3 hours)

**Implementation:**
```typescript
// save-commit.ts - enhance validateCodeStability()
async function validateCodeStability() {
  // 1. Run pre-commit-validate workflow (existing)
  const basicValidation = await runPreCommitValidate();
  
  // 2. Run cursor-agent review (if enabled in preferences)
  if (userPrefs.enableAIReview) {
    const cursorReview = await executeCursorAgent({
      prompt: "Review staged changes for quality and security",
      model: "sonnet-4.5"
    });
    // Parse and integrate findings
  }
  
  return combined Results;
}
```

---

### Low-Priority (Nice-to-Have)

#### 2.7 Skills → Workflow Chaining
**Integration Point:** Show complete workflow chains in skill output  
**Value:** End-to-end guidance for complex tasks  
**Effort:** Low (1 hour)

**Example:**
```
🎯 SKILL: serena-surgical-editing

Then: cursor-agent (for applying changes)
Then: pre-commit-validate (before committing)
Then: save-commit (to finalize)

Complete workflow: serena → cursor-agent → validate → commit
```

---

#### 2.8 `/check-docs` → Tool-Specific Help
**Integration Point:** Add tool documentation lookups  
**Value:** Quick reference for MCP tool usage  
**Effort:** Low (1-2 hours)

**Implementation:**
```bash
/check-docs cursor-agent        # Show cursor-agent usage
/check-docs droid              # Show droid usage
/check-docs openspec           # Show OpenSpec user guide
/check-docs workflows          # List all workflows
```

---

#### 2.9 OpenSpec + Workflow Progress Tracking
**Integration Point:** Track implemented specs via workflow metrics  
**Value:** Visibility into spec → implementation coverage  
**Effort:** Medium (4 hours)

**Features:**
- Dashboard showing specs: To Do / In Progress / Implemented
- Map commits to specs automatically
- Alert when spec drifts from implementation

---

#### 2.10 Hooks → Workflow Suggestions
**Integration Point:** Context-aware workflow recommendations  
**Value:** Proactive guidance on which workflow to run  
**Effort:** Medium (2-3 hours)

**Scenarios:**
- Detect large PR → Suggest `/ai-task run parallel-review`
- Detect error logs → Suggest `/ai-task droid "auto-remediation"`
- Detect new feature branch → Suggest `/openspec init`

---

#### 2.11 cursor-agent + OpenSpec Synergy
**Integration Point:** Use OpenSpec as context for cursor-agent  
**Value:** Spec-aware code generation  
**Effort:** Medium (3 hours)

**Implementation:**
```typescript
// When running cursor-agent, auto-attach related specs
const relatedSpecs = await detectRelatedSpecs(files);
const cursorResult = await executeCursorAgent({
  prompt,
  files: [...files, ...relatedSpecs] // Attach specs as context
});
```

---

#### 2.12 Memory Integration Across All Systems
**Integration Point:** Unified memory access from all entry points  
**Value:** Cross-workflow learning and context  
**Effort:** Medium-High (5+ hours)

**Features:**
- `/save-commit` saves to memory (already implemented)
- Workflows can query past memories for similar tasks
- Skills can suggest memories to review
- OpenSpec specs auto-archived to memory

---

## 3. Recommended Implementation Order

### Phase 1: Quick Wins (Week 1)
**Total Effort:** ~6 hours

1. **OpenSpec Slash Command** (1-2h) - Immediate UX improvement
2. **OpenSpec Skill** (1h) - Guidance integration
3. **cursor/droid in /ai-task** (2-3h) - Tool accessibility

### Phase 2: Workflow Integration (Week 2-3)
**Total Effort:** ~12 hours

4. **feature-design + OpenSpec** (3-4h) - Enforce spec-driven development
5. **pre-commit + OpenSpec** (3-4h) - Validate against specs
6. **save-commit + AI validation** (3h) - Enhanced quality checks
7. **Skills → Tool recommendations** (2h) - Smart backend selection

### Phase 3: Advanced Features (Week 4+)
**Total Effort:** ~15+ hours

8. **Workflow chaining in skills** (1h)
9. **check-docs extensions** (1-2h)
10. **OpenSpec progress tracking** (4h)
11. **Hook → Workflow suggestions** (2-3h)
12. **cursor-agent + OpenSpec context** (3h)
13. **Unified memory system** (5+h)

---

## 4. Technical Implementation Notes

### Integration Patterns

#### Pattern 1: Slash Command → MCP Tool Wrapper
```typescript
// Simple delegation pattern
async function executeOpenspecCommand(subcommand, params) {
  const toolMap = {
    'init': 'openspec-init',
    'add': 'openspec-add',
    'show': 'openspec-show'
  };
  
  return await mcpExecutor.execute(toolMap[subcommand], params);
}
```

#### Pattern 2: Skill → Tool Suggestion
```typescript
// In skill output, include relatedTools
if (matchedSkill.relatedTools) {
  output += `\n💡 Consider using: ${matchedSkill.relatedTools.join(', ')}`;
  output += `\n   ${matchedSkill.toolGuidance}`;
}
```

#### Pattern 3: Workflow → Spec Validation
```typescript
// Pre-workflow check
async function validateAgainstSpec(context) {
  if (context.featureName) {
    const spec = await openspecShow({ filter: context.featureName });
    if (spec.found) {
      // Validate implementation aligns with spec
      return validateAlignment(context.files, spec);
    }
  }
}
```

###Dependencies to Watch

1. **.claude/slash-commands** needs access to:
   - MCP tool executor
   - Workflow registry
   - OpenSpec tools

2. **skill-activation-prompt.ts** needs to know about:
   - Available MCP tools (cursor-agent, droid, openspec)
   - Workflow capabilities

3. **Workflows** need to import:
   - OpenSpec tool functions
   - cursor-agent/droid executors

---

## 5. Risks & Mitigations

### Risk 1: Over-integration Complexity
**Mitigation:** Implement incrementally, one integration at a time. Keep integrations loosely coupled.

### Risk 2: User Confusion from Too Many Options
**Mitigation:** Progressive disclosure - show advanced integrations only when relevant based on context.

### Risk 3: Performance Degradation
**Mitigation:** All integrations should be opt-in via flags/preferences. Cache results where possible.

### Risk 4: Breaking Changes
**Mitigation:** Maintain backward compatibility. Add integrations as enhancements, not replacements.

---

## 6. Success Metrics

Track these metrics after integration:

1. **Adoption Rate:** % of users using integrated features
2. **Workflow Completion:** Time saved using integrated vs separate features
3. **Code Quality:** Defect rate for spec-driven vs ad-hoc development
4. **User Satisfaction:** Feedback on integration helpfulness
5. **Tool Selection Accuracy:** Did skill suggestions lead to correct tool usage?

---

## Conclusion

All 4 implementations are **ready for cross-integration**. The recommended approach is **phased integration starting with quick wins** (OpenSpec slash command, agentic tools in /ai-task) to deliver immediate value, then progressively deepening integrations in workflows and hooks.

**Estimated total integration effort:** 33+ hours across 3 phases  
**Expected value:** Compound benefits - each integration makes other features more useful  
**Risk level:** Low (integrations are additive, not breaking changes)

**Next Step:** Approve Phase 1 integrations and begin implementation.
