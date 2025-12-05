# OpenSpec Integration Investigation & Implementation Proposal

**Document Type:** Investigation Request & Architecture Proposal
**Status:** Pending Investigation
**Priority:** Medium
**Estimated Complexity:** Medium (16-24 hours implementation)
**Target Branch:** `mcp-2.0-discovery`
**Created:** 2025-11-20

---

## Executive Summary

This document outlines an investigation request for integrating **OpenSpec** (spec-driven development framework) with the unitai ecosystem. The integration aims to provide **optional** structured specification management while preserving the existing high-velocity multi-agent workflow system.

**Recommended Approach:** Option 3 - Middle Ground Integration
- Fix existing OpenSpec tools to work correctly (currently broken)
- Make OpenSpec **optional** in workflows (not mandatory)
- Integrate with existing Serena + OpenMemory + Workflow stack
- Preserve both "flow" iterative development AND spec-driven approaches

---

## Context and Current State

### Current Implementation Issues

The unitai has partial OpenSpec integration, but it's **fundamentally broken**:

1. **Incorrect CLI Usage**
   - `openspec-proposal.tool.ts` calls `npx @fission-ai/openspec proposal` (doesn't exist)
   - `openspec-apply.tool.ts` calls `npx @fission-ai/openspec apply` (doesn't exist)
   - Only valid commands: `init`, `list`, `view`, `show`, `validate`, `archive`, `update`

2. **Misunderstood Design**
   - Current tools expect CLI to create proposal files
   - **Reality:** AI should create `openspec/changes/` files directly
   - CLI is only for viewing/validating/archiving, not creation

3. **Workflow Bypass**
   - `workflow_openspec_driven_development` accidentally works by skipping OpenSpec
   - It delegates to `feature-design` workflow which uses multi-agent system
   - Generated production code but never created actual OpenSpec files

### Existing Stack Capabilities

**Serena MCP:**
- Symbol-level LSP navigation
- Code-aware editing
- Memory system (`.serena/memories/`)
- Architectural understanding

**OpenMemory Cloud:**
- Semantic memory search across sessions
- Long-term decision storage
- Context preservation

**unitAI Workflows:**
- `feature-design`: Architect → Implementer → Tester (3-phase)
- `parallel_review`: Multi-backend validation (Gemini + Cursor + Droid)
- `triangulated_review`: 3-way cross-validation
- `pre_commit_validate`: Pre-commit quality gates
- `init_session`: Contextual session startup

**Current Strengths:**
- Fully automated multi-agent workflows
- Parallel AI validation
- Code-aware spec generation (via Serena LSP)
- Semantic memory integration

**Current Gaps:**
- No persistent task tracking (TodoWrite is session-only)
- No formal approval gates (workflows execute immediately)
- No standardized spec structure
- Limited cross-tool compatibility (Claude Code only)

---

## Investigation Request

### Primary Objective

**Investigate and design an optional OpenSpec integration** that:
1. Fixes the broken tools to work as OpenSpec intends
2. Integrates with Serena, OpenMemory, and existing workflows
3. Provides **choice** between flow-based and spec-driven development
4. Maintains velocity for solo developers
5. Enables structure for team collaboration

### Recommended Approach: Option 3 - Middle Ground

**Core Principles:**
- **Optional, not mandatory:** Users choose workflow style
- **Leverage existing agents:** Don't duplicate what works
- **Dual storage:** Specs in OpenSpec format AND Serena/OpenMemory
- **Code-aware generation:** Use Serena LSP when creating specs
- **Preserve speed:** No overhead for users who skip specs

**Implementation Components:**

#### 1. Fix `openspec-proposal` Tool (8 hours)
**Current:** Tries to call `npx @fission-ai/openspec proposal` (doesn't exist)
**Required:**
```typescript
// Generate files directly with AI assistance
execute: async (args, onProgress) => {
  const { description, changeType } = args;
  const changeName = slugify(description);

  // Create directory structure
  await fs.mkdir(`openspec/changes/${changeName}/specs`, { recursive: true });

  // Use Architect agent to generate proposal.md
  const architect = AgentFactory.createArchitect();
  const proposalContent = await architect.execute({
    task: `Generate OpenSpec proposal for: ${description}`,
    outputFormat: "markdown"
  });

  // Write proposal.md
  await fs.writeFile(`openspec/changes/${changeName}/proposal.md`, proposalContent);

  // Generate tasks.md with checklist
  const tasksContent = await generateImplementationTasks(description);
  await fs.writeFile(`openspec/changes/${changeName}/tasks.md`, tasksContent);

  // Use Serena to understand existing code structure
  const codeContext = await getCodeContextFromSerena(targetFiles);

  // Generate spec deltas (ADDED/MODIFIED/REMOVED)
  const specDeltas = await generateSpecDeltas(description, codeContext);
  await writeSpecDeltas(`openspec/changes/${changeName}/specs/`, specDeltas);

  return { changeName, files: [...] };
}
```

#### 2. Fix `openspec-apply` Tool (4 hours)
**Current:** Tries to call `npx @fission-ai/openspec apply` (doesn't exist)
**Required:**
```typescript
execute: async (args, onProgress) => {
  const { changeId } = args;

  // Read the spec files from openspec/changes/
  const proposal = await fs.readFile(`openspec/changes/${changeId}/proposal.md`, 'utf-8');
  const tasks = await fs.readFile(`openspec/changes/${changeId}/tasks.md`, 'utf-8');
  const specs = await readSpecDeltas(`openspec/changes/${changeId}/specs/`);

  // Extract target files from specs
  const targetFiles = extractTargetFilesFromSpecs(specs);

  // Delegate to existing feature-design workflow
  const result = await executeWorkflow("feature-design", {
    featureDescription: proposal,
    targetFiles,
    context: `Implementing OpenSpec change: ${changeId}\n\nTasks:\n${tasks}\n\nSpecs:\n${specs}`,
    generateSpec: false, // Already have specs
    architecturalFocus: "design",
    implementationApproach: "incremental",
    testType: "unit"
  });

  return result;
}
```

#### 3. Enhance `feature-design` Workflow (6 hours)
**Add optional spec generation:**
```typescript
async function executeFeatureDesign(params, onProgress) {
  const { featureDescription, generateSpec = false, openspecChange = null } = params;

  // OPTIONAL: Generate OpenSpec proposal if requested
  if (generateSpec && !openspecChange) {
    onProgress?.("📋 Generating OpenSpec proposal...");

    const architect = AgentFactory.createArchitect();
    const proposal = await architect.generateProposal({
      description: featureDescription,
      targetFiles: params.targetFiles,
      focus: params.architecturalFocus
    });

    // Save to both OpenSpec AND Serena memory
    const changeName = await saveToOpenSpec(proposal, featureDescription);
    await saveToSerenaMemory(`OpenSpec proposal: ${changeName}`, proposal);

    onProgress?.(`✅ Spec created: openspec/changes/${changeName}/`);
  }

  // Continue with normal 3-phase workflow
  // Phase 1: Architectural Design
  // Phase 2: Code Implementation
  // Phase 3: Test Generation
  ...
}
```

#### 4. Enhance `init_session` Workflow (4 hours)
**Check for active OpenSpec changes:**
```typescript
async function executeInitSession(params, onProgress) {
  // Existing: Git status, recent commits, CLI availability
  ...

  // NEW: Check for active OpenSpec changes
  const activeChanges = await listOpenSpecChanges();
  if (activeChanges.length > 0) {
    onProgress?.(`📋 Active OpenSpec changes: ${activeChanges.length}`);

    // Suggest relevant archived specs from OpenMemory
    for (const change of activeChanges) {
      const relatedMemories = await searchOpenMemory(`openspec ${change.name}`);
      // Display relevant context
    }
  }

  return report;
}
```

#### 5. Dual Storage Integration (2 hours)
**Store specs in both locations:**
```typescript
async function saveProposal(proposal: Proposal) {
  // 1. Save to OpenSpec structure
  await saveToOpenSpec(proposal);

  // 2. Save to Serena memory (for LSP-aware access)
  await serena.writeMemory(`openspec-${proposal.name}`, {
    type: "spec",
    content: proposal.content,
    targetFiles: proposal.files,
    created: new Date()
  });

  // 3. Save to OpenMemory (for semantic search)
  await openmemory.addMemory({
    content: `OpenSpec proposal: ${proposal.name}\n\n${proposal.rationale}`,
    tags: ["openspec", "spec", proposal.changeType]
  });
}
```

**Total Estimated Effort:** 24 hours

---

## Integration Points with Existing Stack

### Serena MCP Integration

**Use Case:** Code-aware spec generation
```typescript
// When generating spec deltas, use Serena to understand existing code
const symbols = await serena.findSymbol("UserController", { depth: 2 });
const references = await serena.findReferencingSymbols("authenticateUser");

// Generate accurate MODIFIED specs showing existing vs. proposed
const specDelta = `
## MODIFIED Requirements: Authentication

### Current Implementation
- \`UserController.authenticateUser()\` uses JWT tokens
- Located in: ${symbols[0].relativePath}:${symbols[0].range.start.line}

### Proposed Changes
- Add two-factor authentication support
- New method: \`UserController.validateTwoFactorCode()\`
`;
```

### OpenMemory Integration

**Use Case:** Semantic search across historical specs
```typescript
// During proposal creation, search for related past decisions
const relatedDecisions = await openmemory.searchMemories(
  "authentication security design decisions"
);

// Include context in proposal
const proposal = `
## Related Past Decisions

${relatedDecisions.map(m => `- ${m.content}`).join('\n')}

## Current Proposal
...
`;
```

### Workflow Integration

**Use Case:** Choose between flow-based and spec-driven
```typescript
// Flow-based (fast iteration)
executeWorkflow("feature-design", {
  featureDescription: "Add 2FA",
  generateSpec: false  // Skip OpenSpec, go straight to code
});

// Spec-driven (formal process)
executeWorkflow("feature-design", {
  featureDescription: "Add 2FA",
  generateSpec: true,  // Create proposal, review, then implement
  validationBackends: ["ask-gemini", "ask-cursor"]  // Multi-agent validation
});
```

---

## Required Analysis

### Phase 1: Documentation Review

**Review OpenSpec Official Documentation:**
- Repository: https://github.com/Fission-AI/OpenSpec
- Official README: https://raw.githubusercontent.com/Fission-AI/OpenSpec/main/README.md
- Understand the intended workflow (not CLI commands, but file creation)
- Identify all supported file formats and structures
- Document the proper `proposal.md`, `tasks.md`, and spec delta formats

**Review Current Implementation:**
- Analyze `src/tools/openspec/*.ts` (all 6 tools)
- Review `src/workflows/openspec-driven-development.workflow.ts`
- Identify all integration points with feature-design workflow
- Map out current vs. intended behavior

### Phase 2: Codebase Context Analysis

**Analyze Current Branch (`mcp-2.0-discovery`):**
```bash
# Review all commits since divergence from master
git log --oneline master..mcp-2.0-discovery

# 20 commits implementing MCP 2.0, including:
# - Workflow exposure as tools
# - Discovery meta-tools
# - OpenSpec integration (broken)
# - Backend naming refactor (ask-* pattern)
```

**Review Enhancement Plans:**
- Read all files in `docs/enhancement-plan/`
- Read all files in `docs/enhancement-plan/mcp-2.0/`
- Understand the MCP 2.0 architecture evolution
- Identify how OpenSpec fits into the roadmap

**Use ask-gemini for Context Analysis:**
```typescript
// Suggested use of ask-gemini (at investigator's discretion)
await askGemini({
  prompt: `Analyze the MCP 2.0 architecture documented in these files:

  @docs/enhancement-plan/mcp-2.0/05_mcp_2_0_architecture.md
  @docs/enhancement-plan/mcp-2.0/06_implementation_roadmap.md

  How does optional OpenSpec integration align with:
  1. The Phase 1 & 2 completion goals
  2. The tool discovery system
  3. The multi-agent orchestration pattern
  4. Future Phase 3 plans

  Provide architectural recommendations for integration.`
});
```

### Phase 3: Gap Analysis

**Identify:**
1. What OpenSpec provides that we lack (persistent tasks, approval gates, standards)
2. What our stack does better (automation, multi-agent, semantic memory)
3. Where overlap exists and how to leverage it
4. Where conflicts exist and how to resolve them

### Phase 4: Alternative Proposals

**The investigator should consider:**
- **Option 1:** Minimal fix (just make tools work, no deep integration) - 8 hours
- **Option 2:** Deep integration (mandatory specs, full workflow replacement) - 60 hours
- **Option 3:** Middle ground (optional specs, integrated with stack) - 24 hours
- **Option 4:** Custom alternative (build our own spec system using existing stack)
- **Option 5:** Skip OpenSpec entirely (focus on other priorities)

**Evaluate trade-offs:**
- Implementation effort vs. value delivered
- Team collaboration value vs. solo dev overhead
- Standardization benefits vs. flexibility loss
- Long-term maintenance cost

---

## Resources and Documentation

### OpenSpec Resources
- **Repository:** https://github.com/Fission-AI/OpenSpec
- **README:** https://raw.githubusercontent.com/Fission-AI/OpenSpec/main/README.md
- **Package:** `@fission-ai/openspec` (npm)

### Current Codebase Locations
- **OpenSpec Tools:** `src/tools/openspec/*.ts`
- **Workflows:** `src/workflows/*.ts`
- **Agents:** `src/agents/*.ts`
- **Enhancement Plans:** `docs/enhancement-plan/`
- **MCP 2.0 Docs:** `docs/enhancement-plan/mcp-2.0/`

### Related Tools
- **Serena MCP:** Symbol-level code navigation (already integrated)
- **OpenMemory Cloud:** Semantic memory (already integrated)
- **Claude Context:** Semantic code search (available via MCP)

### Testing Commands
```bash
# Build
npm run build

# Run tests
npm test

# Test specific tool
npm test -- openspec

# Validate OpenSpec structure
npx @fission-ai/openspec validate <change-name>
```

---

## Deliverables Expected

### 1. Investigation Report

**Required Sections:**
- OpenSpec architecture analysis (how it's supposed to work)
- Current implementation analysis (what's broken and why)
- Integration feasibility assessment
- Recommended approach (Option 1-5 or custom alternative)
- Effort estimation and prioritization

### 2. Technical Specification

**If proceeding with integration:**
- Detailed implementation plan for each component
- API changes required
- Breaking changes (if any)
- Migration strategy (for existing users)
- Testing strategy

### 3. Code Examples

**Demonstrate:**
- How fixed `openspec-proposal` should work
- How `feature-design` with `generateSpec: true` would function
- How Serena integration enhances spec generation
- How OpenMemory integration provides context

### 4. Documentation Updates

**Required:**
- User guide for spec-driven vs. flow-based workflows
- Migration guide from current broken tools
- Integration examples with Serena + OpenMemory
- Decision matrix (when to use which approach)

---

## Open Questions for Investigation

### Architectural Questions

1. **Scope of Integration**
   - Should OpenSpec be optional or mandatory?
   - Should we support both workflows or deprecate one?
   - How do we handle users who want specs without OpenSpec format?

2. **Storage Strategy**
   - Store specs in OpenSpec format only?
   - Dual storage (OpenSpec + Serena memory + OpenMemory)?
   - What's the source of truth during conflicts?

3. **Workflow Changes**
   - Add approval gates to existing workflows?
   - Create separate "spec-driven" variants?
   - Make `generateSpec` parameter in all workflows?

4. **Agent Responsibilities**
   - Should Architect agent always generate proposals?
   - Should Implementer agent read from OpenSpec or get specs as input?
   - Should Tester agent update `tasks.md` checklist?

### Technical Questions

1. **File Format Compatibility**
   - Use OpenSpec delta format exactly or adapt?
   - Support custom spec templates?
   - Validate format with `openspec validate`?

2. **Cross-Tool Support**
   - How do we ensure Cursor/Cline users can use our specs?
   - Should we generate `AGENTS.md` files?
   - Support OpenSpec slash commands (`/openspec:proposal`)?

3. **Performance Impact**
   - Does dual storage slow down workflows?
   - Should spec generation be async/background?
   - Cache parsed specs for repeated access?

4. **Error Handling**
   - What if spec generation fails mid-workflow?
   - How to recover from incomplete proposals?
   - Validate specs before implementation?

### Process Questions

1. **User Experience**
   - How do users opt-in to spec mode?
   - Can they switch mid-project?
   - What's the migration path?

2. **Team Collaboration**
   - How do multiple developers share specs?
   - Git merge strategy for `openspec/` folder?
   - Review process for proposals?

3. **Maintenance**
   - Who maintains spec-to-code alignment?
   - Automated drift detection?
   - Periodic spec refresh workflow?

---

## Investigation Methodology

### Suggested Approach

**Phase 1: Deep Dive (4-6 hours)**
1. Read OpenSpec documentation thoroughly
2. Analyze current tool implementations line-by-line
3. Test actual OpenSpec CLI behavior manually
4. Map intended vs. actual workflow

**Phase 2: Context Gathering (2-3 hours)**
1. Review all commits in `mcp-2.0-discovery` branch
2. Read enhancement plan documents
3. Use `ask-gemini` to analyze MCP 2.0 architecture fit
4. Interview codebase via Serena (search for integration points)

**Phase 3: Design & Proposal (4-6 hours)**
1. Evaluate Options 1-5 against requirements
2. Design integration architecture (if proceeding)
3. Identify breaking changes and migrations
4. Create implementation timeline

**Phase 4: Validation (2-3 hours)**
1. Prototype critical components
2. Test with existing workflows
3. Validate against OpenSpec standards
4. Get feedback from potential users

**Total Investigation:** 12-18 hours

### Tools at Your Disposal

**For Offloading Work (at your discretion):**
- `ask-gemini`: Architecture analysis, document review, design validation
- `ask-cursor`: Code example generation, implementation planning
- `ask-droid`: Low-level implementation details, testing strategies

**For Codebase Analysis:**
- `serena`: Symbol search, code navigation, memory queries
- `claude-context`: Semantic code search across entire codebase
- `openmemory`: Search for past decisions and architectural choices

**For Documentation:**
- `deepwiki`: Check if OpenSpec has detailed wiki/docs beyond README
- `context7`: Look up related spec-driven tools and patterns

**Example Workflow:**
```typescript
// 1. Use Gemini to understand OpenSpec architecture
const architecture = await askGemini({
  prompt: "Analyze OpenSpec's file-based spec-driven development model from this README: <fetch https://raw.githubusercontent.com/Fission-AI/OpenSpec/main/README.md>"
});

// 2. Use Serena to find all OpenSpec integration points
const integrationPoints = await serena.searchForPattern("openspec", {
  paths_include_glob: "src/**/*.ts"
});

// 3. Use OpenMemory to check for past discussions
const pastDecisions = await openmemory.searchMemories("spec-driven development architecture");

// 4. Use ask-gemini to validate integration approach
const validation = await askGemini({
  prompt: `Given our multi-agent workflow system, validate this OpenSpec integration approach: ${proposedDesign}`
});
```

---

## Success Criteria

### Must Have
- ✅ OpenSpec tools work as documented (create files directly, not via CLI)
- ✅ Integration preserves existing workflow velocity
- ✅ Clear documentation on when to use specs vs. flow
- ✅ No breaking changes to current users

### Should Have
- ✅ Serena integration for code-aware spec generation
- ✅ OpenMemory integration for contextual proposals
- ✅ Dual storage strategy (OpenSpec + memory systems)
- ✅ Examples of both workflow styles

### Nice to Have
- ✅ Automated spec-to-code drift detection
- ✅ Cross-tool compatibility (Cursor, Cline users can use specs)
- ✅ Visual dashboard for active specs
- ✅ Template system for common spec types

---

## Alternative Proposals Welcome

**The investigating agent is encouraged to:**
- Challenge the Option 3 recommendation
- Propose entirely different approaches
- Identify risks or issues not considered
- Suggest deprioritization if ROI is low
- Recommend complementary tools or patterns

**This is not a directive to implement Option 3 blindly.**
This is a request for thorough investigation and expert architectural guidance.

---

## Next Steps After Investigation

1. **Review Investigation Report**
   - Evaluate findings and recommendations
   - Decide: Proceed, Modify, or Postpone

2. **If Proceeding:**
   - Break down into implementable tasks
   - Add to unitAI roadmap
   - Assign priorities and timeline

3. **If Not Proceeding:**
   - Document decision rationale
   - Archive investigation for future reference
   - Focus resources on higher-priority work

---

## Contact & Collaboration

**Investigation Lead:** [To be assigned to external agentic tool]
**Stakeholders:** unitAI maintainers, MCP 2.0 team
**Timeline:** Investigation to be completed within 1-2 weeks
**Reporting:** Create follow-up document in `docs/enhancement-plan/mcp-2.0/`

---

**End of Investigation Request**

This document serves as a comprehensive brief for an autonomous investigation into OpenSpec integration. The investigator has full discretion to use available tools (`ask-gemini`, Serena, OpenMemory, etc.) to conduct thorough analysis and deliver actionable recommendations.
