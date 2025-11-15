# Project Documentation

**Version:** 3.0  
**Last Updated:** 2025-11-14  
**Status:** Active

This directory contains all documentation for unified-ai-mcp-tool.

---

## Quick Navigation

### Getting Started

New to unified-ai-mcp-tool? Start here:

- **[Getting Started Guide](./guides/getting-started.md)** - Installation, configuration, first workflow
- **[README.md](../README.md)** - Project overview and features

### Core Documentation

Main documentation organized by topic:

- **[Architecture Overview](./ARCHITECTURE.md)** - System design, components, implementation status
- **[Workflows Guide](./WORKFLOWS.md)** - Complete guide to all 6 workflows
- **[Integrations Guide](./INTEGRATIONS.md)** - MCP servers, skills, and hooks
- **[Token Metrics](./TOKEN_METRICS.md)** - Token optimization and metrics

### API Reference

Complete API specifications:

- **[Base Tools API](./reference/api-tools.md)** - ask-gemini, ask-qwen, ask-rovodev
- **[Workflows API](./reference/api-workflows.md)** - All 6 workflow specifications
- **[Error Codes](./reference/error-codes.md)** - Complete error reference

### Guides

Step-by-step tutorials:

- **[Getting Started](./guides/getting-started.md)** - Quick start guide
- **[Skills and Hooks](./guides/skills-hooks.md)** - Simplified skills/hooks guide
- **[Advanced Patterns](./guides/advanced-patterns.md)** - Power user techniques

### Contributing

Want to contribute?

- **[Contributing Guide](./CONTRIBUTING.md)** - Development setup, coding standards, PR process
- **[CHANGELOG.md](../CHANGELOG.md)** - Release history

---

## Documentation Organization

### By User Type

**New Users:**
1. [Getting Started Guide](./guides/getting-started.md)
2. [Workflows Guide](./WORKFLOWS.md)
3. [Skills and Hooks Guide](./guides/skills-hooks.md)

**Developers:**
1. [Architecture Overview](./ARCHITECTURE.md)
2. [API Reference](./reference/)
3. [Contributing Guide](./CONTRIBUTING.md)

**Power Users:**
1. [Advanced Patterns](./guides/advanced-patterns.md)
2. [Integrations Guide](./INTEGRATIONS.md)
3. [Token Metrics](./TOKEN_METRICS.md)

### By Task

**Installing and Setup:**
- [Getting Started Guide](./guides/getting-started.md)

**Using Workflows:**
- [Workflows Guide](./WORKFLOWS.md) - Usage guide with examples
- [Workflows API Reference](./reference/api-workflows.md) - Complete specifications

**Using Base Tools:**
- [Base Tools API](./reference/api-tools.md) - ask-gemini, ask-qwen, ask-rovodev

**Understanding Skills and Hooks:**
- [Skills and Hooks Guide](./guides/skills-hooks.md) - Simplified overview
- [Integrations Guide](./INTEGRATIONS.md) - Complete technical details

**Token Optimization:**
- [Token Metrics](./TOKEN_METRICS.md) - Optimization strategies and metrics

**Troubleshooting:**
- [Error Codes Reference](./reference/error-codes.md) - Error handling guide
- [Getting Started Guide](./guides/getting-started.md#troubleshooting) - Common issues

**Contributing:**
- [Contributing Guide](./CONTRIBUTING.md) - Development and PR process

---

## Documentation Standards

### Single Source of Truth (SSOT)

Each topic has one authoritative document:

| Topic | SSOT Document | Purpose |
|-------|---------------|---------|
| System Architecture | ARCHITECTURE.md | Design, components, status |
| Workflow Usage | WORKFLOWS.md | Usage guide with examples |
| Workflow API | reference/api-workflows.md | Complete specifications |
| Tool API | reference/api-tools.md | Base tools reference |
| Integrations | INTEGRATIONS.md | MCP, skills, hooks |
| Getting Started | guides/getting-started.md | Quick start tutorial |
| Token Optimization | TOKEN_METRICS.md | Metrics and strategies |
| Error Handling | reference/error-codes.md | Error codes and recovery |
| Contributing | CONTRIBUTING.md | Development guide |

### Documentation Types

**Reference Documentation** (Deterministic):
- `docs/reference/` - API specifications, error codes
- Structured tables, parameters, return values
- Minimal prose, maximum precision

**User Guides** (Prose):
- `docs/guides/` - Tutorials, how-to guides
- Step-by-step instructions
- Practical examples and scenarios

**Overview Documentation** (Mixed):
- Architecture, workflows, integrations
- Balanced between explanation and specification

### No Emoji Policy

All documentation follows project standards:
- No emoji in technical documentation
- Professional, clear language
- Focus on content, not decoration

---

## Historical Documentation

### History (Completed Phases)

Archived completion reports:

- [PHASE_1_COMPLETED.md](./history/PHASE_1_COMPLETED.md) - Phase 1 implementation
- [FASE_0_COMPLETATA.md](./history/FASE_0_COMPLETATA.md) - Phase 0 foundation
- [IMPLEMENTATION_ANALYSIS.md](./history/IMPLEMENTATION_ANALYSIS.md) - Implementation analysis

### Deprecated Documentation

Superseded documents:

- [deprecated/](./deprecated/) - Old plans, redundant docs, archived notes

These are kept for historical reference but are no longer maintained.

---

## External Resources

**Project Links:**
- GitHub Repository: https://github.com/jaggerxtrm/unified-ai-mcp-tool
- npm Package: https://www.npmjs.com/package/@jaggerxtrm/unified-ai-mcp-tool
- Model Context Protocol: https://modelcontextprotocol.io

**AI Backend Documentation:**
- Qwen Code: https://github.com/QwenLM/qwen-code
- Atlassian Rovo Dev: https://developer.atlassian.com/rovodev/
- Google Gemini: https://ai.google.dev/

---

## Keeping Documentation Updated

When making changes to the project:

1. **Update relevant SSOT document** first
2. Check for cross-references that need updating
3. Verify examples still work
4. Update version and date in document header
5. Add entry to CHANGELOG.md if applicable

**Documentation PR checklist:**
- [ ] SSOT document updated
- [ ] Cross-references checked
- [ ] Examples tested
- [ ] Version and date updated
- [ ] No emoji added
- [ ] Clear, concise language

---

## Questions or Feedback?

For documentation issues or suggestions:

1. Check if topic has SSOT document
2. Search existing GitHub issues
3. Create new issue with "documentation" label

Thank you for reading the documentation!
