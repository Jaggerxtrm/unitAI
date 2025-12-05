---
name: documentation-lookup
description: Efficient documentation access via claude-context and AI tools. Use for container configs, connection methods, or implementation patterns. Avoids full-file reads for specific information.
---

# Documentation Lookup Skill

## Purpose

This skill guides Claude to efficiently access project documentation using targeted search tools and AI models instead of reading entire files, saving tokens and providing specific information.

## When to Use This Skill

- Searching for container connection methods or Docker configurations
- Looking for specific implementation details in documentation
- Needing information about project-specific configurations
- Working with database connection patterns
- Looking up API endpoints or integration methods
- Finding specific code patterns or architectural decisions

## Primary Pattern

### 1. Use claude-context for semantic search in documentation

```
# Search for documentation files first
mcp__claude-context__search_code "connection methods" --path /home/dawid/Projects/unitai
# Look specifically for .md files: "where is container connection documented?"
```

### 2. Targeted AI queries on specific documentation

Once relevant documentation is identified:

```
# For Gemini or Qwen
"Review the documentation found in [specific_file.md] and provide specific information on how [X] was implemented, focusing on the configuration patterns and connection methods used."
```

### 3. Token-saving approach

- Use claude-context first to find relevant .md files
- Reference only specific files to AI models
- Ask for specific information rather than general summaries
- Focus on implementation details rather than overview

## Documentation Search Patterns

### For Container Connections
- Search terms: "container", "connection", "docker", "compose", "network"
- Target files: docker-compose*.yml, *.md with "setup" in title

### For Database Connections
- Search terms: "database", "connection", "pool", "psql", "pgvector"
- Target files: config files, connection managers, environment setup

### For API Endpoints
- Search terms: "endpoint", "route", "API", "fastapi"
- Target files: route definitions, API documentation

## Quality Assurance

### Before requesting information from AI:
1. Check if claude-context can find relevant documentation first
2. Verify the documentation file is actually relevant
3. Focus the AI query on specific information needed
4. Limit scope to specific sections if possible

### After receiving information:
1. Verify information matches project patterns
2. Cross-reference with other project components if needed
3. Update memory with new findings using openmemory-add-memory

## Related Tools

- **claude-context**: For semantic search of documentation files
- **Gemini/Qwen**: For detailed analysis of specific documentation
- **openmemory**: For storing important documentation findings

## Quick Reference

```
# 1. Find relevant docs
mcp__claude-context__search_code "connection" --path /home/dawid/Projects/unitai

# 2. Ask AI about specific documentation
"Based on [specific_file.md], explain how container connections are configured, specifically focusing on the [X] pattern."

# 3. Store key findings
openmemory-add-memory "Connection pattern: [summary of implementation]"
```

---

**Skill Status**: COMPLETE ✅
**Line Count**: < 500 ✅