_   _       _  __ _          _      _    _   __  __  ____  ____  
  | | | |_ __ (_)/ _(_) ___  __| |    / \  (_)  |  \/  |/ ___||  _ \ 
  | | | | '_ \| | |_| |/ _ \/ _` |   / _ \ | |  | |\/| | |    | |_) |
  | |_| | | | | |  _| |  __/ (_| |  / ___ \| |  | |  | | |___ |  __/ 
   \___/|_| |_|_|_| |_|\___|\__,_| /_/   \_\_|  |_|  |_|\____||_|    
                                                                      
<div align="center">

**One MCP Server. Three AI Powerhouses. Infinite Possibilities.**

[![npm version](https://img.shields.io/npm/v/@jaggerxtrm/unified-ai-mcp-tool.svg)](https://www.npmjs.com/package/@jaggerxtrm/unified-ai-mcp-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A unified [Model Context Protocol](https://modelcontextprotocol.io) server that provides seamless access to **Qwen Code**, **Atlassian Rovo Dev**, and **Google Gemini** through a single, elegant interface.

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Tools](#-available-tools) • [Configuration](#-configuration)

</div>

---

## Features

<table>
<tr>
<td width="50%">

### Unified Interface
Single MCP server for multiple AI backends - no need to manage separate connections

### Agent System
Specialized agents (Architect, Implementer, Tester) for domain-focused tasks.

### Smart Workflows
6 powerful, pre-built workflows for common development tasks like pre-commit validation and bug hunting.

### Safety First
Sandbox and shadow modes for safe code execution and testing.

</td>
<td width="50%">

### Token-Aware Efficiency
Autonomous system suggests optimal, token-saving tools (like Serena for code analysis) and workflows, reducing costs by 75-80%.

### Session Management
Restore previous conversations and maintain context across sessions.

### Optimized Performance
~50% token reduction through intelligent optimization and workflow caching.

### Rich Progress Tracking
Real-time feedback on long-running operations.

</td>
</tr>
</table>

---

## Installation

### Claude Desktop (Quickest)

```bash
claude mcp add unified-ai -- npx -y @jaggerxtrm/unified-ai-mcp-tool
```

### Global Installation (Recommended)

```bash
npm install -g @jaggerxtrm/unified-ai-mcp-tool
```

### Local Installation

```bash
npm install @jaggerxtrm/unified-ai-mcp-tool
```

### From Source

```bash
git clone https://github.com/jaggerxtrm/unified-ai-mcp-tool.git
cd unified-ai-mcp-tool
npm install
npm run build
```

### UPDATING
```bash
npm update -g @jaggerxtrm/unified-ai-mcp-tool
```

---

## Quick Start

### 1. Add to MCP Configuration

**For Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "unified-ai": {
      "command": "unified-ai-mcp-tool"
    }
  }
}
```

**For Custom MCP Clients:**

```json
{
  "mcpServers": {
    "unified-ai": {
      "command": "node",
      "args": ["/path/to/unified-ai-mcp-tool/dist/index.js"]
    }
  }
}
```

### 2. Start Using

Once configured, you can use any of the three AI tools through your MCP client:

```
# Ask Gemini to review documentation
@README.md Is this documentation clear and complete?

# Run Cursor Agent for a refactor plan
@src/utils/aiExecutor.ts Proponi un refactor modulare per gestire i backend

# Chiedi a Droid una checklist di remediation
symptoms: Upload 50MB → 500 error  
maxActions: 5
```

---

## Available Tools

### cursor-agent

Cursor Agent headless CLI per refactor, bug fixing e patch chirurgiche multi-modello (GPT-5.x/Sonnet/Composer).

<details>
<summary><b>Parameters & Examples</b></summary>

**Parameters:**
- `prompt` *(required)*: Richiesta principale (`@file` per allegare file)
- `model` *(optional)*: Uno tra `gpt-5.1`, `gpt-5`, `composer-1`, `sonnet-4.5`, `haiku-5`, `deepseek-v3`
- `outputFormat` *(optional)*: `text` (default) o `json`
- `projectRoot` *(optional)*: Passato a `--cwd`
- `files` *(optional)*: Array di percorsi da passare come `--file`
- `autoApprove` *(optional)*: Abilita `--auto-approve`

**Examples:**

```json
{
  "prompt": "@src/workflows/parallel-review.workflow.ts Proponi un refactor modulare",
  "model": "sonnet-4.5",
  "files": ["src/workflows/parallel-review.workflow.ts"],
  "projectRoot": "/home/dawid/Projects/unified-ai-mcp-tool"
}
```

```json
{
  "prompt": "Genera una checklist di test per il modulo aiExecutor",
  "model": "composer-1",
  "outputFormat": "json",
  "autoApprove": true
}
```

</details>

---

### droid

Factory Droid CLI (`droid exec`) basato su GLM-4.6 per generare checklist operative e remediation plan autonomi.

<details>
<summary><b>Parameters & Examples</b></summary>

**Parameters:**
- `prompt` *(required)*: Descrizione del task/sintomi
- `auto` *(optional)*: `low`, `medium`, `high` (default `low`)
- `outputFormat` *(optional)*: `text` o `json`
- `sessionId` *(optional)*: Continua una sessione esistente
- `skipPermissionsUnsafe` *(optional)*: Consente `--skip-permissions-unsafe` (solo autonomia HIGH)
- `files` *(optional)*: Allegati passati con `--file`
- `cwd` *(optional)*: Working directory

**Examples:**

```json
{
  "prompt": "Sintomi: errori 500 su upload >50MB. Genera un piano di fix in 5 step.",
  "auto": "medium",
  "files": ["logs/upload-error.log"],
  "outputFormat": "text"
}
```

```json
{
  "prompt": "Continua la sessione precedente e verifica i nuovi log",
  "sessionId": "session-42",
  "auto": "low",
  "cwd": "/home/dawid/Projects/unified-ai-mcp-tool"
}
```

</details>

---

### ask-gemini

Query Google Gemini with file analysis support.

<details>
<summary><b>Parameters & Examples</b></summary>

**Parameters:**
- `prompt` *(required)*: Query. Use `@filename` to reference files
- `model` *(optional)*: Model (default: `gemini-2.5-pro`)
  - `gemini-2.5-pro` - Most capable
  - `gemini-2.5-flash` - Faster, cost-effective
- `sandbox` *(optional)*: Sandbox mode

**Examples:**

```json
{
  "prompt": "@README.md Improve this documentation",
  "model": "gemini-2.5-flash"
}
```

```json
{
  "prompt": "@tests/ Review test coverage",
  "model": "gemini-2.5-pro"
}
```

</details>

---

### smart-workflows

Intelligent workflows that orchestrate multiple AI backends for complex tasks like parallel code review, pre-commit validation, and bug hunting.

<details>
<summary><b>Parameters & Examples</b></summary>

**Parameters:**
- `workflow` *(required)*: Workflow to execute
- `params` *(optional)*: Workflow-specific parameters

**Available Workflows:**
- `init-session`: AI-powered session initialization with commit analysis.
- `parallel-review`: Parallel code review with Gemini + Rovodev.
- `validate-last-commit`: Validate commits with Gemini + Qwen analysis.
- `pre-commit-validate`: Multi-stage validation for staged files.
- `bug-hunt`: AI-powered bug discovery and root cause analysis.
- `feature-design`: End-to-end feature development with all three agents.

**Examples:**

```json
{
  "workflow": "init-session"
}
```

```json
{
  "workflow": "parallel-review",
  "params": {
    "files": ["src/index.ts", "src/utils/"],
    "focus": "security"
  }
}
```

```json
{
  "workflow": "pre-commit-validate",
  "params": {
    "depth": "thorough"
  }
}
```

</details>

---

## Agent System

The Unified AI MCP Tool now includes a powerful **Agent System** that provides specialized, domain-focused AI agents for common development tasks. Each agent encapsulates a specific AI backend optimized for its purpose.

### ArchitectAgent

**High-level system design and architecture analysis using Gemini**

Specializes in:
- System architecture design and patterns
- Security analysis (OWASP, threat modeling)
- Refactoring strategies
- Performance optimization
- Scalability planning

### ImplementerAgent

**Production-ready code generation using Rovodev with Gemini fallback**

Specializes in:
- Production-quality code generation
- Bug fixing and modifications
- Incremental implementation
- Code quality and best practices

### TesterAgent

**Fast test generation and validation using Qwen**

Specializes in:
- Unit test generation
- Integration test creation
- Test coverage analysis
- Edge case detection

### AgentFactory

Create agents dynamically:

```typescript
import { AgentFactory, AgentType } from "unified-ai-mcp-tool";

// Specific agent creation
const architect = AgentFactory.createArchitect();
const implementer = AgentFactory.createImplementer();
const tester = AgentFactory.createTester();

// Dynamic creation by type
const agent = AgentFactory.createAgent(AgentType.ARCHITECT);
```

---

## Smart Workflows

This tool comes with 6 powerful, pre-built workflows to automate common development tasks.

### init-session

**AI-powered session initialization** that analyzes your Git repository and provides an intelligent summary of recent work.

### parallel-review

Run parallel code analysis using Gemini and Rovodev for comprehensive code review.

### validate-last-commit

Validate a specific Git commit using parallel analysis with Gemini and Qwen.

### pre-commit-validate

Validate staged changes before committing with configurable depth levels (`quick`, `thorough`, `paranoid`).

### bug-hunt

AI-powered bug discovery and analysis with automatic file discovery and root cause analysis.

### feature-design

Design new features with architectural planning and implementation guidance using multi-agent collaboration.

---

## File Reference Syntax

All `ask-*` tools support powerful file references:

| Syntax | Description | Example |
|--------|-------------|---------|
| `@filename` | Include specific file | `@src/index.ts` |
| `#filename` | Alternative syntax | `#package.json` |
| `@directory/` | Include directory | `@src/utils/` |
| Multiple refs | Reference many files | `@file1.ts @file2.ts` |

---

## Configuration

### Execution Modes

#### Sandbox Mode (Qwen, Gemini)
Safe environment for code execution:
```json
{
  "prompt": "Create and test a new feature",
  "sandbox": true
}
```

#### Shadow Mode (Rovo Dev)
Work on temporary workspace copy:
```json
{
  "prompt": "Refactor this module",
  "shadow": true
}
```

#### Approval Modes (Qwen)
Control operation approval:
- `plan` - Analysis only
- `default` - Prompt each time
- `auto-edit` - Auto-approve edits
- `yolo` - Auto-approve all

---

## Prerequisites

### Required CLIs

<table>
<tr>
<th>AI Tool</th>
<th>CLI Installation</th>
<th>Verification</th>
</tr>
<tr>
<td><strong>Qwen Code</strong></td>
<td>

```bash
pip install qwen-code-cli
```

</td>
<td>

```bash
qwen --version
```

</td>
</tr>
<tr>
<td><strong>Rovo Dev</strong></td>
<td>

```bash
npm install -g @atlassian/acli
```

</td>
<td>

```bash
acli rovodev --help
```

</td>
</tr>
<tr>
<td><strong>Gemini</strong></td>
<td>

```bash
npm install -g @google/generative-ai-cli
```

</td>
<td>

```bash
gemini --version
```

</td>
</tr>
</table>

> **Note:** You only need to install the CLIs for the AI tools you plan to use.

---

## Development

```bash
# Clone repository
git clone https://github.com/jaggerxtrm/unified-ai-mcp-tool.git
cd unified-ai-mcp-tool

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development
npm run dev

# Type checking
npm run lint

# Production start
npm start
```

### Project Structure

```
unified-ai-mcp-tool/
├── src/
│   ├── agents/             # Agent implementations
│   │   ├── ArchitectAgent.ts
│   │   ├── ImplementerAgent.ts
│   │   └── TesterAgent.ts
│   ├── tools/              # Tool definitions
│   │   ├── cursor-agent.tool.ts
│   │   ├── droid.tool.ts
│   │   ├── ask-gemini.tool.ts
│   │   └── smart-workflows.tool.ts
│   ├── workflows/          # Workflow implementations
│   │   ├── init-session.workflow.ts
│   │   ├── parallel-review.workflow.ts
│   │   ├── validate-last-commit.workflow.ts
│   │   ├── pre-commit-validate.workflow.ts
│   │   ├── bug-hunt.workflow.ts
│   │   └── feature-design.workflow.ts
│   ├── utils/              # Utilities
│   │   ├── aiExecutor.ts
│   │   ├── gitHelper.ts
│   │   ├── structuredLogger.ts
│   │   ├── permissionManager.ts
│   │   └── tokenEstimator.ts
│   ├── constants.ts        # Configuration
│   └── index.ts            # MCP server
├── dist/                   # Compiled output
├── package.json
└── tsconfig.json
```

---

## Testing

This project uses `vitest` for testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Performance

### Autonomous Token-Aware System

This tool features a sophisticated system to optimize token usage and reduce costs.

- **Token Estimation**: Before executing a tool, the system estimates the token cost.
- **Tool Suggestion**: For large files or inefficient operations (like reading a whole file), it suggests more efficient alternatives like using the **Serena** tool for symbol-based navigation, saving 75-80% of tokens.
- **Workflow Automation**: It detects patterns in user prompts to suggest and orchestrate the most appropriate workflow for the task.

See [docs/TOKEN_METRICS.md](./docs/TOKEN_METRICS.md) for detailed optimization information.

---

## Future Developments

Based on the [v3.0 Plan](./docs/PLAN.md), future developments may include:

- **External MCP Integrations**: Deeper integration with tools like Serena and claude-context.
- **Learning & Adaptation**: A workflow memory system to learn from past executions and adapt its behavior.
- **Adaptive Backend Selection**: Automatically select the best AI backend for a given task based on historical performance.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Links

- 📦 [npm Package](https://www.npmjs.com/package/@jaggerxtrm/unified-ai-mcp-tool)
- 🐙 [GitHub Repository](https://github.com/jaggerxtrm/unified-ai-mcp-tool)
- 📖 [Model Context Protocol](https://modelcontextprotocol.io)
- 🤖 [Qwen Code](https://github.com/QwenLM/qwen-code)
- 🏢 [Atlassian Rovo Dev](https://developer.atlassian.com/rovodev/)
- 🌟 [Google Gemini](https://ai.google.dev/)

---

<div align="center">

Star this repo if you find it useful!

</div>