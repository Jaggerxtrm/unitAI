# Memory Orchestration Design


# ATTENZIONE:
SERVIREBBE UN SISTEMA DI SPEC SIMILE A MOAI PER UNA SSOT PER I WALKTHROUGH E PIANI CHE I BACKEND POSSONO REFERENZIARE 
## Overview

This document outlines the design for intelligent memory orchestration across multiple memory systems in the unitAI ecosystem.

## Current State: Three Memory Systems

| System | Storage | Retrieval | Best For |
|--------|---------|-----------|----------|
| **Serena** | `.md` files in project | Filename-based | Codebase architecture, technical decisions, reference docs |
| **OpenMemory Local** | Vector store | Semantic search + reinforcement | Working memory, session context, fluid discovery |
| **OpenMemory Cloud** | Cloud storage | Semantic search | Cross-project preferences, user patterns |

## Problem Statement

### Friction Points

1. **Decision fatigue** - Every memory operation requires choosing a system
2. **Context loss** - Wrong choice means future sessions might not find the info
3. **Duplication risk** - Same info in multiple places leads to staleness
4. **No unified search** - Cannot query "everything you know about X"
5. **No conventions** - Serena memories lack structure/naming guidelines

### Observations

- Serena's `.md` files are durable, human-readable, and git-trackable, but discovery relies on knowing filenames
- OpenMemory's semantic search finds things by meaning, not naming conventions
- OpenMemory's reinforcement mechanism naturally surfaces frequently-useful memories
- The system complexity is growing, requiring better organization

## Proposed Architecture

### Cognitive Function Mapping

```
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│   OpenMemory (Working Memory)   │    │   Serena (Reference Knowledge)  │
├─────────────────────────────────┤    ├─────────────────────────────────┤
│ - Semantic + reinforced         │    │ - Structured .md files          │
│ - "What did we learn?"          │    │ - "How does X work?"            │
│ - Fluid, discovery-based        │    │ - Authoritative, curated        │
│ - Reinforced by usage           │    │ - Manually maintained           │
│ - Captures everything           │    │ - Canonical knowledge base      │
└─────────────────────────────────┘    └─────────────────────────────────┘
                │                                      ▲
                │         Consolidation Process        │
                └──────────────────────────────────────┘
```

### Memory Consolidation Workflow

Inspired by human cognition where working memories get consolidated into long-term structured knowledge:

1. **Capture Phase** (Continuous)
   - OpenMemory captures learnings, decisions, context fluidly
   - Reinforcement naturally boosts important memories
   - No strict conventions needed - semantic search handles discovery

2. **Consolidation Phase** (On-demand or periodic)
   - Query OpenMemory for high-salience memories
   - AI proposes consolidation into structured Serena docs
   - Human reviews and approves the consolidation
   - Consolidated memories optionally archived or tagged in OpenMemory

3. **Reference Phase** (During work)
   - Serena provides authoritative, structured documentation
   - OpenMemory provides fluid context and recent learnings
   - Both queried as needed based on question type

## Implementation Plan

### Phase 1: Conventions & Guidelines

- [ ] Define Serena memory naming conventions
- [ ] Define categories for memory routing guidance
- [ ] Document when to use each system

### Phase 2: Consolidation Slash Command

Create `/consolidate-memories` command that:

```typescript
// Pseudocode
async function consolidateMemories() {
  // 1. Query high-salience memories from OpenMemory
  const memories = await openmemory.query({ min_salience: 0.7 });

  // 2. Group by topic/theme using AI
  const grouped = await ai.groupMemories(memories);

  // 3. Generate proposed Serena docs
  const proposals = await ai.generateDocs(grouped);

  // 4. Present to user for approval
  return proposals;
}
```

### Phase 3: Unified Query Layer

- Fan out searches to all memory systems
- Merge and deduplicate results
- Rank by relevance and salience

### Phase 4: Intent-Based Routing (Optional)

Lightweight classifier for automatic routing:
- Contains file paths, function names → Serena
- Contains "I prefer", "always do X" → OpenMemory Cloud
- Temporal/session context → OpenMemory Local

## Related Pattern: Optional Backend Delegation

A similar orchestration pattern was implemented in slash commands like `/check-docs`:

```
/check-docs <topic> [--source auto|local|context7|deepwiki] [--backend gemini|cursor|droid]
```

**Design Principle:** Claude executes by default, but can delegate to AI backends when:
- Large context analysis needed (Gemini)
- Code-focused review required (Cursor)
- Implementation guidance needed (Droid)

This pattern applies broadly:
- **Without `--backend`**: Claude handles directly (fast, lightweight)
- **With `--backend`**: Delegate to specialized AI (deep analysis)

The same principle could apply to memory operations:
- Quick lookups → Claude queries directly
- Deep analysis of memory patterns → Delegate to backend

## Open Questions

1. **Consolidation triggers** - Time-based? Memory count threshold? Manual only?
2. **Archive strategy** - What happens to OpenMemory items after consolidation?
3. **Conflict resolution** - How to handle contradictions between systems?
4. **Cross-project knowledge** - Should some Serena docs be shareable?
5. **Backend delegation for memories** - Should `/consolidate-memories` support `--backend` for AI-assisted grouping?

## Related Documents

- [05_mcp_2_0_architecture.md](./05_mcp_2_0_architecture.md) - Overall MCP 2.0 architecture
- [08_openspec_integration_investigation.md](./08_openspec_integration_investigation.md) - Spec-driven development

## Status

**Phase**: Design / Investigation
**Priority**: Medium
**Dependencies**: None (can be implemented independently)
