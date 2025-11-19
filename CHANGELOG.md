# Changelog

All notable changes to the Unified AI MCP Tool project.

# Changelog

All notable changes to the Unified AI MCP Tool project.

## [1.3.0] - 2025-11-19

### ✨ Added
- **New tools:** `cursor-agent` e `droid` completamente integrati (CLI wrapper, registry, test unitari).
- **Workflow estesi:** aggiunti `triangulated-review`, `refactor-sprint`, `auto-remediation` e potenziati `parallel-review`, `pre-commit-validate`, `bug-hunt`.
- **AI Executor:** supporto completo per Cursor/Droid (attachments, projectRoot, autonomy flags) + opzioni extra nei workflow utils.
- **Documentazione aggiornata:** `docs/mcp_tools_documentations.md`, `docs/WORKFLOWS.md`, `docs/INTEGRATIONS.md`, `docs/reference/api-tools.md`, `docs/reference/api-workflows.md`, `README.md`, `CLAUDE.MD`, guide/CONTRIBUTING.
- **Nuova guida:** `docs/guides/cursor-droid-playbook.md` (pattern operativi e snippet).
- **Config:** `.mcp.json` ora espone `CURSOR_AGENT_TOKEN` e `DROID_API_KEY`.

### 🔧 Changed
- `ImplementerAgent` ora usa Droid come fallback primario.
- `smart-workflows` supporta `strategy`, `backendOverrides`, `attachments` dove richiesto.
- Rimosse tutte le occorrenze dei tool deprecati `ask-qwen`/`ask-rovodev` dal codice e dai documenti attivi.

### ✅ Tests
- Aggiornato `tests/unit/aiExecutor.test.ts` con casi per Cursor/Droid e routing dei backend.
- Nuove suite `tests/unit/tools/cursor-agent.tool.test.ts` e `tests/unit/tools/droid.tool.test.ts`.

---

## [1.1.1] - 2025-11-07

### 🚀 Phase 2: Specialized Agent Interfaces (UNIFIED_AUTONOMOUS_SYSTEM_PLAN)

#### ✨ Added - Agent System
- **BaseAgent**: Abstract base class with Template Method pattern
  - Execution flow with retry logic and fallback backend support
  - Progress reporting and metadata collection
  - Input validation hooks

- **ArchitectAgent**: High-level system design and architecture analysis
  - Backend: Gemini (no fallback - deep reasoning required)
  - Focus areas: design, refactoring, optimization, security, scalability
  - Outputs: analysis, recommendations, implementation plan, risks, complexity estimates

- **ImplementerAgent**: Production-ready code generation
  - Backend: Rovodev (fallback: Gemini)
  - Approaches: incremental, full-rewrite, minimal
  - Outputs: summary, changed files, code snippets, test suggestions, next steps

- **TesterAgent**: Fast test generation and validation
  - Backend: Qwen (no fallback - optimized for speed)
  - Test types: unit, integration, e2e
  - Outputs: test code, test count, estimated coverage, recommendations

#### 🏭 Added - Agent Factory
- **AgentFactory**: Centralized agent creation and management
  - Factory methods: `createArchitect()`, `createImplementer()`, `createTester()`
  - Dynamic creation: `createAgent(AgentType)`
  - Metadata registry: `getAvailableAgents()`, `getAgentByName()`

#### 🔧 Added - Workflow Integration
- **Agent Helpers** in `src/workflows/utils.ts`:
  - `createAgentConfig()`: Convert workflow params to AgentConfig
  - `formatAgentResults()`: Format agent output for display

- **Feature Design Workflow**: End-to-end orchestration example
  - Phase 1: Architectural design (ArchitectAgent)
  - Phase 2: Code implementation (ImplementerAgent)
  - Phase 3: Test generation (TesterAgent)
  - Comprehensive error handling and progress reporting

#### ✅ Added - Integration Testing
- Created `scripts/test-agents.ts`: Comprehensive smoke tests
  - Factory instantiation tests (5 tests)
  - Agent registry tests (4 tests)
  - Agent configuration tests (2 tests)
  - Input validation tests (3 tests)
  - Backend configuration tests (3 tests)
  - **Result**: 17/17 tests passed (100% success rate)

#### 📝 Technical Implementation
- Agent types defined in `src/agents/types.ts` (340 lines)
- Base agent in `src/agents/base/BaseAgent.ts` (255 lines)
- Three specialized agents (260-300 lines each)
- Factory with dynamic creation in `src/agents/index.ts` (160 lines)
- Feature design workflow in `src/workflows/feature-design.workflow.ts` (200+ lines)

#### 🎯 Architecture Highlights
- Template Method pattern for consistent agent behavior
- Retry logic with backend fallback
- Type-safe generic interfaces: `IAgent<TInput, TOutput>`
- Structured output parsing with fallback to raw output
- Progress callback system for real-time updates
- Comprehensive metadata collection

#### 🔗 Integration with Phase 1
- Agents receive `autonomyLevel` through `AgentConfig`
- Ready for permission checks via `PermissionManager`
- Workflow parameters support `autonomyLevel` field

### 📚 Previous Changes

## [0.2.1] - 2024-11-02

### 🎉 Major Optimization Release

#### ✨ Added
- Beautiful new README with ASCII art header
- Comprehensive tool documentation with collapsible sections
- Performance metrics table showing 50% token reduction
- Enhanced project structure documentation
- Badge indicators for npm, license, and TypeScript

#### 🚀 Optimized
- **Phase 1: Removed Unnecessary Tools** (~2.7k tokens saved)
  - Removed `ping` tool (echo test)
  - Removed `qwen-help` tool
  - Removed `rovodev-help` tool
  - Removed `gemini-help` tool
  
- **Phase 2: Slimmed Tool Descriptions** (~1.5k tokens saved)
  - Reduced all tool descriptions by ~50%
  - Shortened parameter descriptions across all tools
  - Simplified prompt interface descriptions
  
- **Phase 3: Removed Rarely-Used Parameters** (~800 tokens saved)
  - Removed `allFiles` parameter from ask-qwen
  - Removed `debug` parameter from ask-qwen

#### 📊 Performance Improvements
- Total token savings: ~5k tokens (~50% reduction)
- Tool count reduced from 7 to 3 essential tools
- Equivalent to 10-15 additional source files per conversation
- Cleaner, more focused tool interface

#### 📝 Documentation
- Updated README.md with modern design
- Added improvements.md tracking optimization phases
- Created comprehensive tool examples
- Added file reference syntax guide
- Included execution mode documentation

#### 🔧 Technical
- Cleaned up `src/tools/simple-tools.ts`
- Updated `src/tools/index.ts` to remove helper tools
- Optimized all three main tool files
- Maintained backward compatibility for essential features
- All TypeScript compilation successful

### 🐛 Fixed
- No breaking changes for 99% of use cases
- Maintained all core functionality

### 📚 Changed
- README structure completely redesigned
- Tool descriptions now concise but clear
- Parameter documentation streamlined

## [0.2.0] - Previous

### Added
- Initial Gemini support
- Unified interface for multiple AI backends
- File reference syntax support

## [0.1.0] - Initial Release

### Added
- Qwen Code CLI integration
- Rovo Dev CLI integration
- Basic MCP server functionality
