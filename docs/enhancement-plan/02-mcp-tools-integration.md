# Task 2: MCP Tools Integration & Documentation

## Objective
Ensure all MCP tools are properly integrated, documented, and optimally configured. Add missing tools (cursor-agent, droid) and remove deprecated ones (ask-qwen, ask-rovodev).

## Status
- [ ] Documentation review completed
- [ ] Current MCP configuration analyzed
- [ ] Missing tools identified
- [ ] Proposal created
- [ ] Implementation plan approved
- [ ] Integration completed
- [ ] Documentation updated
- [ ] Testing completed

## Required Documentation Review
**You MUST read and understand these resources before proposing any changes:**

### Tool-Specific Documentation
- [Serena](https://github.com/oraios/serena) - Symbol-level code navigation
- [Claude Context](https://github.com/zilliztech/claude-context) - Semantic codebase search
- [Cursor Agent - Headless CLI](https://cursor.com/docs/cli/headless) - Multi-model agent (NOT YET INTEGRATED)
- [Factory Droid CLI](https://docs.factory.ai/cli/droid-exec/overview#droid-exec-headless-cli) - GLM-4.6 agent (NOT YET INTEGRATED)
- [Smart Workflows](https://github.com/unified-ai/mcp-tool/blob/main/docs/workflows.md) - Predefined workflow tools

### Current Configuration
- Review `.mcp.json` for current server configurations
- Review `src/` directory for MCP server implementations

## Requirements

### Tools to Integrate
1. **cursor-agent** (NEW)
   - Multi-function agent with multiple models
   - Excellent for bug fixing and refactoring proposals
   - Documentation: https://cursor.com/docs/cli/headless

2. **droid** (NEW)
   - Uses GLM-4.6 via Factory Droid CLI
   - Agentic task execution
   - Documentation: https://docs.factory.ai/cli/droid-exec/overview#droid-exec-headless-cli

### Tools to Remove
1. **ask-qwen** - To be deprecated
2. **ask-rovodev** - To be deprecated

### Tools to Enhance
1. **smart-workflows**
   - Already integrated but needs modification
   - Adapt to current project needs
   - Located at `dist/workflows`

### Tool Usage Patterns to Document

#### unified-ai-mcp tools
- **ask-gemini**: For reading long files, folders, entire codebases. Use for second opinions on complex tasks, over-engineering detection
- **cursor-agent**: Bug fixing, refactoring proposals
- **droid**: Agentic task execution
- **smart-workflows**: Predefined complex agentic tasks

#### Other Essential Tools
- **deepwiki**: GitHub documentation access, semantic search
- **context7**: Library/package/framework documentation (always up-to-date)
- **openmemory-cloud**: Remote/cloud memories for cross-session persistence
- **openmemory**: Local memories with reinforcement capabilities
- **serena**: Memories + code navigation

## Instructions for Implementation

### Phase 1: Research & Analysis
1. Read ALL documentation links above
2. Analyze current `.mcp.json` configuration
3. Review `src/` for existing MCP server implementations
4. Check `dist/workflows` for current workflow definitions
5. Identify integration points for new tools

### Phase 2: Proposal Creation
**DO NOT IMPLEMENT YET. Create a proposal document that includes:**
1. Integration approach for cursor-agent:
   - Installation requirements
   - MCP server wrapper design
   - Configuration schema
2. Integration approach for droid:
   - CLI setup and authentication
   - MCP server wrapper design
   - Usage patterns
3. Deprecation plan for ask-qwen and ask-rovodev:
   - Migration path for existing workflows
   - Cleanup checklist
4. Enhancement plan for smart-workflows:
   - Current workflow analysis
   - Proposed modifications
   - New workflow ideas
5. Documentation structure:
   - Where each tool should be documented
   - Usage examples
   - Best practices

### Phase 3: Update This Task
After creating your proposal:
1. Check off "Documentation review completed"
2. Check off "Current MCP configuration analyzed"
3. Check off "Missing tools identified"
4. Check off "Proposal created"
5. Link your proposal document here: `[Proposal](file://path/to/proposal.md)`

## Success Criteria
- [ ] cursor-agent and droid are fully integrated and functional
- [ ] ask-qwen and ask-rovodev are cleanly removed
- [ ] smart-workflows are enhanced and project-specific
- [ ] All tools are documented with clear usage patterns
- [ ] Tool selection guidance is clear (when to use which tool)
- [ ] `.mcp.json` is properly configured
- [ ] Integration tests pass

## Notes
- Consider tool activation patterns in hooks/skills
- Document token efficiency trade-offs
- Ensure error handling for external CLI tools
- Consider offline/fallback scenarios
