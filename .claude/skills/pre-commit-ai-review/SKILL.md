---
name: pre-commit-ai-review
description: Use this skill before making important commits to ensure code quality, architecture consistency, and best practices. This skill reminds Claude to use AI tools (Qwen and Gemini in parallel) for comprehensive code review before committing significant changes. Use before any commit that affects core functionality, architecture, or has broad impact on the system.
---

# Pre-Commit AI Review Skill

## Purpose

This skill ensures high code quality and architectural consistency by requiring AI-powered code review before committing important changes. It implements the advanced validation workflow documented in your CLAUDE.md.

## When to Use This Skill

- Before committing significant code changes
- When modifying core system components
- Before committing architectural changes
- After implementing new features
- When fixing critical bugs
- Before committing refactoring changes
- Any time changes affect multiple files or components

## Pre-Commit Validation Workflow (UPDATED with Serena Stage 0)

### Stage 0: Symbol-Level Impact Analysis with Serena (NEW)

**CRITICAL FIRST STEP** for TypeScript/JavaScript files: Use Serena to identify ALL references before changes.

```bash
# For each modified symbol, find ALL usages
mcp__serena__find_referencing_symbols --name_path "ModifiedFunction" --relative_path "src/file.ts"
mcp__serena__find_referencing_symbols --name_path "ModifiedClass" --relative_path "src/file.ts"

# Map structural changes
mcp__serena__get_symbols_overview --relative_path "src/modified-file.ts"
```

**Why Stage 0**: Serena provides LSP-based, 100% accurate call graph. This prevents breaking changes by revealing ALL dependencies before commit.

**Output**: Complete impact map showing:
- All files referencing modified symbols
- Call sites with code snippets
- Breaking change detection

### Stage 1: Architectural Impact with claude-context
```
# Determine broader scope of changes:
"mcp__claude-context__search_code 'what code depends on my changes?' --path /home/dawid/Projects/unified-ai-mcp-tool"
"mcp__claude-context__search_code 'find all files importing modified module' --path /home/dawid/Projects/unified-ai-mcp-tool"
"mcp__claude-context__search_code 'identify similar implementations that should be consistent' --path /home/dawid/Projects/unified-ai-mcp-tool"
```

### Stage 2: Parallel AI Review with ask-gemini + ask-qwen
Run both tools in parallel for comprehensive analysis:

```
# Gemini with change mode for structured suggestions:
mcp__unified-ai-mcp__ask-gemini --changeMode true --prompt "@modified_file.py Validate: 1) Architecture 2) Error handling 3) Performance 4) Security"

# Qwen to catch what Gemini might miss:
mcp__unified-ai-mcp__ask-qwen --prompt "@modified_file.py Check: 1) Code quality issues 2) Redundant logic 3) Potential bugs 4) Edge cases"
```

### Stage 3: Dependency Verification with Serena + claude-context
```bash
# Serena: Find ALL callers (LSP-based, 100% accurate)
mcp__serena__find_referencing_symbols --name_path "ModifiedFunction" --relative_path "src/file.ts"

# claude-context: Verify broader compatibility
"mcp__claude-context__search_code 'verify changes compatible with call sites' --path /home/dawid/Projects/unified-ai-mcp-tool"
"mcp__claude-context__search_code 'find tests related to modified code' --path /home/dawid/Projects/unified-ai-mcp-tool"
```

## Commit Readiness Checklist (UPDATED)

Before committing, ensure ALL of the following are completed:

- [ ] **Stage 0**: Serena find_referencing_symbols completed for ALL modified symbols
- [ ] **Stage 0**: Structural changes mapped with get_symbols_overview
- [ ] **Stage 1**: claude-context analysis completed for architectural impact
- [ ] **Stage 2**: ask-gemini review completed for architecture/security/performance
- [ ] **Stage 2**: ask-qwen review completed for quality/edge cases
- [ ] **Stage 2**: Parallel AI outputs synthesized and addressed
- [ ] **Stage 3**: Serena verification for ALL call sites (breaking change check)
- [ ] **Stage 3**: claude-context verification for broader compatibility
- [ ] Changes are consistent with project architecture

## Quality Standards

### Architecture Validation (from Gemini)
- Proper adherence to project architectural patterns
- Correct use of shared components and utilities
- Appropriate error handling and resilience patterns
- Security considerations addressed

### Quality Validation (from Qwen)
- Code quality without redundancy
- Identification of potential bugs or edge cases
- Performance considerations
- Consistency with existing patterns

### Consistency Validation (from claude-context)
- Changes align with similar implementations in codebase
- No breaking changes to public interfaces without proper handling
- Proper testing coverage for changes

## Commit Message Requirements

After completing AI review, ensure commit messages include:
- Brief summary of changes
- Reference to AI validation performed
- Impact scope if significant

Example: 
```
feat: Update connection pooling in db_manager

- Validated with claude-context, Gemini, and Qwen
- Ensures consistency with existing patterns
- Addresses performance considerations identified by AI review
```

## MCP Tool Integration (UPDATED)

This skill integrates multiple MCP tools as per your CLAUDE.md:
- **Serena** for symbol-level impact analysis and breaking change detection (Stage 0)
- **claude-context** for architectural impact and consistency checks (Stage 1)
- **ask-gemini** for architectural and security review (Stage 2)
- **ask-qwen** for quality and edge case detection (Stage 2, parallel with Gemini)
- **Serena** for call site verification (Stage 3)
- **openmemory** to store validation outcomes and patterns

---

**Skill Status**: COMPLETE ✅
**Line Count**: < 500 ✅