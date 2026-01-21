# UnitAI

**One MCP Server. Multiple AI Backends. Intelligent Orchestration.**

[![npm version](https://img.shields.io/npm/v/@jaggerxtrm/unitai.svg)](https://www.npmjs.com/package/@jaggerxtrm/unitai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

UnitAI is a unified **Model Context Protocol** server designed primarily **for AI agents (like Claude) to use autonomously**. It abstracts the complexity of managing distinct AI connections behind a single interface, allowing Claude to offload heavy tasks to specialized backends (Gemini, Droid, Qwen) without user intervention.

**This tool is for Claude, not just for you.** Unlike traditional CLI tools, UnitAI allows you to say *"Claude, refactor this entire module"* and have Claude autonomously orchestrate the compilation, error checking, and implementation using its specialized sub-agents. Think of it as automatically using sub-agents, offloading token usage for repetitive tasks, reading long files or folders... while Claude is still the BOSS.

> **💡 Pro Tip:** See **[CLAUDE.MD](CLAUDE.MD)** in this repository for a comprehensive example of the "Iterative Development Workflow" instructions we use to guide Claude. You can adapt this for your own projects!

## System Architecture

The core philosophy of UnitAI is resilience and specialization. Usage is not limited to a single model; instead, the system dynamically selects the most appropriate backend for the task at hand—whether it is architectural reasoning, surgical code refactoring, or rapid implementation.

### AI Backends

To function correctly, UnitAI requires specific CLI tools to be available in your environment.

> [!IMPORTANT]
> **Mandatory Requirements**
> The following three backends are **essential** for the core operation of UnitAI:
> 1. **Google Gemini**: Acts as the primary Architect. Used for high-level reasoning, system design, and complex documentation analysis.
> 2. **Qwen**: utilized for deep logic analysis and as a robust fallback for architectural tasks.
> 3. **Factory Droid (GLM-4.6)**: The sophisticated "Implementer". Responsible for generating production-ready code, operational checklists, and executing remediation plans.

> [!NOTE]
> **Optional Enhancements**
> The following backends extend the system's capabilities but are not strictly required:
> 4. **Cursor Agent**: Specialized in "surgical" refactoring and existing code modification.
> 5. **Atlassian Rovo Dev**: Defines a "Shadow Mode" for safe experimentation and code generation without immediate side effects.

### Resilience and Fallback Mechanisms

UnitAI is built for reliability. It implements a **Circuit Breaker** pattern combined with an automatic fallback system.

If a primary backend (e.g., Gemini) becomes unresponsive or fails during a workflow, the system does not simply error out. Instead, it instantly triggers a fallback mechanism, retrying the operation with the next most capable available backend (e.g., Qwen or Cursor) based on the task type. This ensures that your coding sessions remain uninterrupted even when external API conditions are unstable.


### Autonomy Levels & Permissions
UnitAI enforces a strict 4-tier permission system (`permissionManager.ts`) to ensure agent safety and control:

- **READ_ONLY**: Safe analysis operations only (Git status, file reads). *Default level.*
- **LOW**: Allows file modifications within the project directory.
- **MEDIUM**: Permits local Git operations (commit, branch) and dependency management.
- **HIGH**: Full autonomy, including external API calls and `git push`.

### Agent Specialization
The system is built on specialized agent roles rather than generic LLM calls:
- **ArchitectAgent (Gemini)**: Operates in specific focus modes (`design`, `security`, `performance`, `refactoring`) to provide high-level system guidance without implementation bias.
- **ImplementerAgent (Droid)**: Focuses purely on code generation using defined approaches (`incremental`, `full-rewrite`, `minimal`) to ensure production-ready output.

### Robust Tool Registry
All tools are defined via a `UnifiedTool` interface with strict **Zod schema validation**. This ensures that every tool invocation—whether from a human or an agent—is type-safe and validated before execution, preventing runtime errors and malformed requests.

### Activity Analytics
A built-in analytics engine (`ActivityAnalytics`) tracks:
- **Token Savings**: Estimated cost reduction vs. manual coding.
- **Tool Usage**: Success rates and frequency of tool invocations.
- **Audit Trail**: A permanent SQLite-backed record of all autonomous actions for compliance and review.

## Core Workflows

UnitAI replaces static tool calls with "Smart Workflows"—multi-step, agentic processes that mimic human engineering practices.

### Session Initialization (`init-session`)
This is the entry point for effective agentic collaboration. Instead of forcing the model to read a generic "summary" file, this workflow actively analyzes the current repository state, git history, and recent commits. It primes the AI's context with exactly what has happened recently, fostering an iterative coding loop where the agent understands *why* changes were made, not just *what* the code looks like.

### Triangulated Review
A rigorous quality assurance process that subjects critical code changes to a 3-way cross-check:
1. **Gemini** analyzes the architectural impact and long-term viability.
2. **Cursor** reviews specific code patterns and suggests refactoring.
3. **Droid** validates the implementation details and operational feasibility.
This triangulation ensures that no single model's hallucination or bias dictates the review outcome.

### Parallel Review
Executes concurrent analysis using multiple backends to provide a comprehensive code review in a fraction of the time. This is particularly useful for large pull requests where different perspectives (security vs. performance) are needed simultaneously.

### Bug Hunt
An autonomous investigation workflow. When provided with symptoms or error logs, it orchestrates agents to explore the codebase, formulate hypotheses, and identify root causes without human intervention.

### Feature Design
Transforms a high-level feature request into a concrete implementation plan. It coordinates the Architect (Gemini) to design the structure and the Implementer (Droid) to draft the necessary code changes.

### Auto Remediation
A self-healing workflow that takes an error condition and autonomously generates and applies a fix, complete with verification steps.

### Overthinker
A deep reasoning loop using multiple AI personas (Refiner, Architect, Reviewers, Synthesizer) to iteratively critique and perfect a concept. It saves a comprehensive analysis to `.unitai/overthinking.md`, ensuring complex decisions are thoroughly vetted before implementation.

## Installation and Setup

### Automatic Setup (Claude CLI)

The easiest way to install UnitAI is using the Claude CLI. This method is particularly recommended for Linux/WSL environments.

**Unix (macOS/Linux)**
```bash
claude mcp add --transport stdio unitAI -- npx -y @jaggerxtrm/unitai
```

**Windows**
```powershell
claude mcp add --transport stdio unitAI -- cmd /c "npx -y @jaggerxtrm/unitai"
```

> [!TIP]
> **Windows Users: Use WSL2**
> For the best experience with AI agentic tools, we strongly recommend running UnitAI within **WSL2** (Windows Subsystem for Linux).
> - **Performance**: Significantly faster filesystem operations for large codebases.
> - **Compatibility**: Native support for standard Unix tools and MCP protocols without shell quirks.
> - **Reliability**: Avoids common Windows-specific pathing and permission issues.

## 🧪 Beta Testing & Feedback

We are currently in **Public Beta**. If you encounter issues or have ideas for improvements, we'd love to hear from you!

👉 **[Read our Beta Testing Guide](beta-testing.md)** to learn how to:
- Report bugs simply and effectively.
- Propose new features or workflows.
- Use GitHub Issues like a pro (even if you're not a developer).

Your feedback is crucial for stabilizing the system before v1.0.

**Option 2: Using Global Install**
First install globally, then add:
```bash
npm install -g @jaggerxtrm/unitai
claude mcp add --transport stdio unitAI -- unitai 
*might not work on windows*
```

### Quick Start (npx)

You can also run the server directly without global installation:

```bash
npx -y @jaggerxtrm/unitai
```

### Global Installation (Recommended)

```bash
npm install -g @jaggerxtrm/unitai
```



> [!TIP]
> Ensure all CLI tools for your active backends (`gemini`, `droid`, `qwen`, etc.) are installed and accessible in your system PATH.



## Extras: Custom Slash Commands 💻

*Note: These commands are optional helpers. The core power of UnitAI lies in Claude's autonomous use of the underlying tools.*

UnitAI includes a set of custom interactive commands (`.claude/commands`) that you can add to your project. Simply copy the `.claude/commands` folder to the root of your project to enable them.

| Command | Description | Example |
|---------|-------------|---------|
| `/ai-task` | Execute standard workflows or specific agents | `/ai-task run parallel-review` |
| `/init-session` | Initialize a dev session (git analysis + memory) | `/init-session` |
| `/check-docs` | Verify functionality against documentation | `/check-docs` |
| `/create-spec` | Generate technical specifications | `/create-spec "New login flow"` |
| `/save-commit` | Generate commit message and save | `/save-commit` |
| `/prompt` | Load specific prompt templates | `/prompt refactor` |

**How to Install:**
Copy the provided `.claude/commands` folder into your project root:
```bash
cp -r .claude/commands /path/to/your/project/
```
These commands will then appear in the slash menu (`/`) of your Claude CLI.
> *(Triggers `init-session` workflow)*

**Example: Deep Code Review**
> `/ai-task run parallel-review`

## Advanced Automation: Hooks & Skills 

UnitAI leverages the experimental **Claude Hooks & Skills** system to create a truly agentic experience.
*ATTENTION: This is still experimental and subject to change. Also i noticed the hooks are not working properly yet, there are some hooks that are "blocking" and others that work kind of a suggestion. In the first case before CC answers or uses a tool, it will first trigger the hook - which can be wrong. In the other case, eg. we have instructed it to use Serena but it still uses glob or read a long file directly, after it used the said tool the hook will act as a reminder to use Serena. Again, it requires more testing and fixing.*

### Hooks (`.claude/hooks`)
Automated scripts triggered by specific events (like user messages) to provide context or enforce rules *before* the AI responds.

| Hook | Function |
|------|----------|
| `smart-tool-enforcer` | Detects inefficient tool usage (e.g., reading a generic file) and suggests better alternatives (e.g., Serena) to save tokens. |
| `workflow-pattern-detector` | Suggests running a Smart Workflow when your request matches a known pattern (e.g., "fix bug" -> `bug-hunt`). |
| `memory-search-reminder` | Reminds the AI to check long-term memory for relevant context before answering. |

### Skills (`.claude/skills`)
Reusable, pre-packaged tool definitions that give the AI specialized capabilities without manual tool calls.

| Skill | Capability |
|-------|------------|
| `unified-ai-orchestration` | The brain behind routing tasks to the right AI backend. |
| `serena-surgical-editing` | Specialized logic for precise code modifications. |
| `code-validation` | Encapsulates the logic for linting, security checks, and test execution. |

**How they work:**
These scripts are located in your `.claude` folder. When you use the Claude CLI, it automatically loads them to enhance the AI's behavior, making it "smarter" and more context-aware without you having to prompt it explicitly.


## Development

To contribute or modify UnitAI:

```bash
git clone https://github.com/jaggerxtrm/unitai.git
cd unitai
npm install
npm run build
```

This project uses **TypeScript** and **Vitest** for testing. Ensure `npm test` passes before submitting changes.