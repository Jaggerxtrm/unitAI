# Task 4: Custom Slash Commands for Repetitive Workflows

## Objective
Create custom slash commands for frequently used, repetitive tasks to streamline common workflows: session initialization, memory management, commits, documentation checks, and unitAI task execution.

## Status
- [x] Slash commands documentation reviewed
- [x] Current workflow analysis completed
- [x] Use cases identified and prioritized
- [x] Proposal created
- [x] Implementation plan approved
- [x] Commands implemented
- [x] Documentation created
- [ ] Testing completed

## Implementation Summary

### ✅ Completed Features

**5 Comandi Slash Implementati:**
1. **`/init-session`** - Inizializzazione sessione con analisi repository e suggerimenti memoria
2. **`/save-commit`** - Salvataggio sicuro con validazione, memoria e commit
3. **`/ai-task`** - Esecuzione workflow MCP semplificata (list/run/status)
4. **`/create-spec`** - Generazione specifiche feature con template strutturati
5. **`/check-docs`** - Ricerca documentazione multi-sorgente (local/context7/deepwiki)

**Architettura Implementata:**
- Sistema parser slash commands in `.claude/slash-commands/`
- Hook per intercettazione comandi (`slash-command-parser.ts`)
- Skills individuali per suggerimenti automatici
- Integrazione completa con workflow esistenti
- Sistema di validazione e sicurezza

**Sicurezza Garantita:**
- Validazione obbligatoria prima del salvataggio memoria
- Error recovery con rollback automatici
- Parametri sanitizzati e validati

### 📚 Documentation
- **Guida Utente**: `docs/guides/slash-commands.md` - Documentazione completa con esempi
- **Skill Documentation**: File SKILL.md individuali per ogni comando
- **Technical Docs**: Codice commentato con TypeScript types

### 🔄 Next Steps
- **Testing**: Eseguire test end-to-end dei comandi
- **Integration**: Verificare funzionamento con MCP server
- **Performance**: Ottimizzare tempi esecuzione
- **User Training**: Sessione training per il team

## Proposal Document
[Proposal: Custom Slash Commands Implementation](04-proposal-slash-commands.md)

## Required Documentation Review
**You MUST read and understand these resources before proposing any changes:**

### Context
- Review existing workflows in `dist/workflows` and `docs/WORKFLOWS.md`
- Understand how slash commands work in Claude Code
- Study the current `.claude/` configuration

## Required Slash Commands

### 1. Session Initialization
**Command**: `/init-session` or similar
**Purpose**: Initialize a new work session with proper context
**Should include**:
- Load relevant memories
- Check current branch
- Display recent changes
- Set up environment
- Suggest next steps based on project state

### 2. Memory & Commit
**Command**: `/save-commit` or similar  
**Purpose**: Save work to memory and commit changes
**Requirements**:
- Only save memory AFTER confirming code works and is stable
- Use both openmemory (local) and openmemory-cloud (remote)
- Create meaningful commit message
- Link memory to commit
**Workflow**:
1. Verify code stability (tests pass, runs correctly)
2. Create memory entry with context
3. Save to openmemory-cloud (remote persistence)
4. Save to openmemory (local, with reinforcement option)
5. Create git commit with descriptive message
6. Optionally tag commit in memory system

### 3. unitAI Task Execution
**Command**: `/ai-task [workflow-name]` or similar
**Purpose**: Execute predefined unitAI workflows
**Should support**:
- List available workflows: `/ai-task list`
- Execute specific workflow: `/ai-task [name]`
- Pass parameters to workflows
- Monitor workflow progress
**Workflows to support** (from `dist/workflows`):
- Review existing workflows and integrate them
- Allow custom workflow selection

### 4. Spec Creation
**Command**: `/create-spec` or similar
**Purpose**: Create specification document for new feature/module
**Should include**:
- Template generation
- Guided questions for requirements
- Integration with OpenSpec (if Task 3 recommends it)
- Save spec to appropriate location

### 5. Documentation Check
**Command**: `/check-docs [topic]` or similar
**Purpose**: Quick documentation lookup
**Should support**:
- context7: Library/package documentation lookup
- deepwiki: GitHub/project documentation search  
- Local docs: Search project documentation
**Examples**:
- `/check-docs react hooks` → search context7
- `/check-docs mcp-setup` → search local + deepwiki

## Instructions for Implementation

### Phase 1: Research & Analysis
1. Study how slash commands are created in Claude Code
2. Analyze current workflows in `dist/workflows`
3. Review documentation about command creation
4. Identify common patterns in repetitive tasks
5. Map out user workflows and pain points

### Phase 2: Design
Create a design document covering:
1. **Command Syntax**: Exact command names and parameters
2. **Implementation Approach**: How commands will be structured
3. **Workflow Integration**: How to leverage existing workflows
4. **Error Handling**: What happens when things go wrong
5. **User Feedback**: How to communicate progress/results
6. **Configuration**: Any needed settings/preferences

### Phase 3: Proposal Creation
**DO NOT IMPLEMENT YET. Create a proposal document that includes:**
1. List of all slash commands with specifications:
   - Command syntax
   - Purpose and use case
   - Implementation details
   - Dependencies on other tools/systems
2. Code structure and organization
3. Integration points with:
   - openmemory / openmemory-cloud
   - serena memories
   - unitAI workflows
   - git commands
4. Documentation plan (how users will learn about commands)
5. Testing strategy

### Phase 4: Update This Task
After creating your proposal:
1. Check off "Slash commands documentation reviewed"
2. Check off "Current workflow analysis completed"
3. Check off "Use cases identified and prioritized"
4. Check off "Proposal created"
5. Link your proposal document here: `[Proposal](file://path/to/proposal.md)`

## Success Criteria
- [ ] All required commands are implemented and functional
- [ ] Commands integrate smoothly with existing tools
- [ ] Memory saving only happens after code verification
- [ ] Documentation is clear and includes examples
- [ ] Error messages are helpful
- [ ] Commands save significant time on repetitive tasks
- [ ] User experience is intuitive

## Notes
- Remember: memories should only be saved when code is STABLE and WORKING
- Consider command aliases for frequently used variations
- Think about command discoverability (help system)
- Plan for future extensibility (easy to add new commands)
- Consider parameter validation and user-friendly error messages

## Example Usage Scenarios

### Scenario 1: Starting a new feature
```
/init-session
> Loading memories for current project...
> Current branch: feature/new-auth
> Recent changes: Authentication module refactored
> Suggested next steps: Implement OAuth provider integration
```

### Scenario 2: Completing a task
```
/save-commit
> Running tests... ✓ All tests passing
> Code appears stable. Create memory entry? (y/n)
> Memory context: "Implemented OAuth provider with Google and GitHub support"
> Saving to openmemory-cloud... ✓
> Saving to openmemory (local)... ✓
> Creating commit... ✓
> Commit: "feat: Add OAuth provider support for Google and GitHub"
```

### Scenario 3: Checking documentation
```
/check-docs react useCallback
> Searching context7...
> [Results with up-to-date React documentation]
```
