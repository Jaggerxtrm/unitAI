---
name: slash-check-docs
description: Use /check-docs to search documentation across multiple sources - local project docs, external libraries via context7, and GitHub repositories via deepwiki with intelligent source selection.
---

# Slash Check Docs Skill

## Purpose

Provides unified documentation search across multiple sources with intelligent source selection, eliminating the need to remember which tool to use for different types of documentation.

## Available Sources

### Local (`local`)
- Project documentation in `docs/`
- README files
- Implementation guides
- Architecture documentation

### Context7 (`context7`)
- External library documentation
- Framework APIs (React, Node.js, etc.)
- Package documentation
- Language references (TypeScript, Python, etc.)

### DeepWiki (`deepwiki`)
- GitHub repository documentation
- Wiki pages
- Contributing guides
- API documentation for projects

### Auto (`auto`) - Default
- Intelligent source selection based on query
- Combines multiple sources when appropriate

## Command Usage

```bash
/check-docs <topic> [source]
```

### Examples
```bash
/check-docs react useCallback
/check-docs mcp-setup local
/check-docs typescript generics context7
/check-docs facebook/react deepwiki
/check-docs workflow-api all
```

## Intelligent Source Selection

### Automatic Detection
- **Library APIs**: Routes to `context7` (react, vue, node, express, etc.)
- **GitHub Repos**: Routes to `deepwiki` (owner/repo format)
- **Project Terms**: Routes to `local` (workflow, agent, mcp, etc.)
- **Ambiguous**: Searches `local` first, then suggests other sources

### Manual Override
Specify source explicitly for precise control:
- `/check-docs topic context7` - External libraries only
- `/check-docs topic deepwiki` - GitHub repos only
- `/check-docs topic local` - Project docs only
- `/check-docs topic all` - Search all sources

## Result Formatting

### Unified Display
- Consistent formatting across all sources
- Clear source attribution
- Relevance ranking
- Usage examples where available

### Context Preservation
- Maintains original documentation context
- Includes code examples
- Preserves formatting and links

## Performance Optimizations

- **Caching**: Results cached for 1 hour
- **Parallel Search**: Multiple sources searched simultaneously
- **Smart Filtering**: Relevance-based result ranking
- **Timeout Protection**: 30-second timeout per source

## Error Handling

### No Results Found
- Suggests alternative search terms
- Recommends different sources
- Provides search syntax help

### Source Unavailable
- Graceful fallback to available sources
- Clear error messaging
- Alternative suggestions

## Integration Points

- **Context7**: External library documentation via MCP
- **DeepWiki**: GitHub repository documentation via MCP
- **Local Search**: Project documentation indexing
- **Caching**: Intelligent result caching system

## Success Metrics

- **Query Success**: >85% of searches return relevant results
- **Source Accuracy**: >90% automatic source selection accuracy
- **Response Time**: <5 seconds for cached results, <15 seconds for fresh searches
- **User Satisfaction**: 95%+ users find needed information

## Usage Patterns

### Development Research
```bash
/check-docs react hooks context7
/check-docs typescript utility-types
/check-docs express middleware
```

### Project Documentation
```bash
/check-docs workflow-api local
/check-docs agent-migration
/check-docs mcp-integration
```

### Repository Investigation
```bash
/check-docs facebook/react deepwiki
/check-docs microsoft/vscode
/check-docs vercel/next.js
```

### Comprehensive Search
```bash
/check-docs authentication all
```
Searches local project docs, external auth libraries, and related repos.

---

**Skill Status**: Active
**Sources**: 3 documentation sources + auto-selection
**Performance**: Cached results <5s, fresh <15s
