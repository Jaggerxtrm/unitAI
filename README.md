```
   _   _       _  __ _          _      _    _   __  __  ____  ____  
  | | | |_ __ (_)/ _(_) ___  __| |    / \  (_)  |  \/  |/ ___||  _ \ 
  | | | | '_ \| | |_| |/ _ \/ _` |   / _ \ | |  | |\/| | |    | |_) |
  | |_| | | | | |  _| |  __/ (_| |  / ___ \| |  | |  | | |___ |  __/ 
   \___/|_| |_|_|_| |_|\___|\__,_| /_/   \_\_|  |_|  |_|\____||_|    
                                                                      
```

<div align="center">

**🚀 One MCP Server. Three AI Powerhouses. Infinite Possibilities.**

[![npm version](https://img.shields.io/npm/v/@jaggerxtrm/unified-ai-mcp-tool.svg)](https://www.npmjs.com/package/@jaggerxtrm/unified-ai-mcp-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A unified [Model Context Protocol](https://modelcontextprotocol.io) server that provides seamless access to **Qwen Code**, **Atlassian Rovo Dev**, and **Google Gemini** through a single, elegant interface.

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Tools](#-available-tools) • [Configuration](#-configuration)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 **Unified Interface**
Single MCP server for multiple AI backends - no need to manage separate connections

### 📁 **Smart File References**  
Use `@filename` syntax to include files in your prompts automatically

### 🛡️ **Safety First**
Sandbox and shadow modes for safe code execution and testing

</td>
<td width="50%">

### 🔄 **Session Management**
Restore previous conversations and maintain context across sessions

### ⚡ **Optimized Performance**
~50% token reduction through intelligent optimization

### 🎨 **Rich Progress Tracking**
Real-time feedback on long-running operations

</td>
</tr>
</table>

---

## 🚀 Installation

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

## 🎯 Quick Start

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
# Query Qwen about your codebase
@src/ Explain the architecture of this project

# Ask Rovo Dev to refactor code safely
@utils/helper.ts Refactor this with shadow mode

# Get Gemini to review documentation
@README.md Is this documentation clear and complete?
```

---

## 🛠️ Available Tools

### 🤖 ask-qwen

Query Qwen AI with support for file analysis, codebase exploration, and large context windows.

<details>
<summary><b>Parameters & Examples</b></summary>

**Parameters:**
- `prompt` *(required)*: Query for Qwen. Use `@filename` or `#filename` to include files
- `model` *(optional)*: Model to use (default: `qwen3-coder-plus`)
  - `qwen3-coder-plus` - Best balance
  - `qwen3-coder-turbo` - Faster
  - `qwen3-coder-pro` - Highest quality
  - `qwen3-coder` - Base model
  - `qwen3-coder-fallback` - Fallback
- `sandbox` *(optional)*: Use sandbox mode for safe code execution
- `approvalMode` *(optional)*: Approval mode: `plan`/`default`/`auto-edit`/`yolo`
- `yolo` *(optional)*: Auto-approve all operations

**Examples:**

```json
{
  "prompt": "@src/ Explain this codebase structure",
  "model": "qwen3-coder-plus"
}
```

```json
{
  "prompt": "Create a sorting algorithm and test it",
  "sandbox": true,
  "yolo": true
}
```

</details>

---

### 🏢 ask-rovodev

Query Atlassian Rovo Dev AI with shadow mode and session management.

<details>
<summary><b>Parameters & Examples</b></summary>

**Parameters:**
- `prompt` *(required)*: Query for Rovodev. Use `@filename` to reference files
- `yolo` *(optional)*: Auto-approve all operations
- `shadow` *(optional)*: Shadow mode for safe changes
- `verbose` *(optional)*: Verbose output
- `restore` *(optional)*: Continue last session

**Examples:**

```json
{
  "prompt": "@package.json Analyze dependencies",
  "verbose": true
}
```

```json
{
  "prompt": "@src/utils/ Refactor these utilities",
  "shadow": true,
  "yolo": true
}
```

</details>

---

### 🌟 ask-gemini

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

### 🔄 smart-workflows

Intelligent workflows that orchestrate multiple AI backends for complex tasks like parallel code review, pre-commit validation, and bug hunting.

<details>
<summary><b>Parameters & Examples</b></summary>

**Parameters:**
- `workflow` *(required)*: Workflow to execute
  - `init-session` - AI-powered session initialization with commit analysis
  - `parallel-review` - Parallel code review with Gemini + Rovodev
  - `validate-last-commit` - Validate commits with Gemini + Qwen analysis
- `params` *(optional)*: Workflow-specific parameters

**Available Workflows:** 3 implemented (init-session, parallel-review, validate-last-commit)
**Coming Soon:** pre-commit-validate, bug-hunt

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
  "workflow": "validate-last-commit",
  "params": {
    "commit_ref": "HEAD~1"
  }
}
```

</details>

---

## 🔄 Smart Workflows

### 🚀 init-session

**AI-powered session initialization** that analyzes your Git repository and provides an intelligent summary of recent work.

**What it does:**
- Collects last **10 commits** with full diffs
- **AI analysis with Rovodev** to synthesize:
  - Feature changes and new functionality
  - Bug fixes and their root causes
  - Refactoring and architectural improvements
  - Current work status (in-progress, completed, next steps)
- **Generates semantic memory search queries** based on AI analysis
- Suggests 2-3 targeted searches for relevant past work
- Shows current branch, staged and modified files
- Verifies availability of Qwen, Gemini, and Rovo Dev CLIs
- Provides session information (timestamp, timezone, working directory)

**No parameters required** - fully automated.

**Example:**
```json
{
  "workflow": "init-session"
}
```

**Output includes:**
- Repository info and recent commits summary
- **AI Analysis of Recent Work** (synthesized by Rovodev)
- **Relevant Memories** section with 2-3 semantic search queries
- Detailed repository status and branch info
- CLI availability check
- Session metadata

### 👥 parallel-review

Run parallel code analysis using Gemini and Rovodev for comprehensive code review.

**What it does:**
- Analyzes specified files with multiple AI backends simultaneously
- Provides specialized analysis based on focus area
- Synthesizes results from different perspectives
- Offers combined recommendations

**Parameters:**
- `files` *(required)*: Array of files or directories to analyze
- `focus` *(optional)*: Analysis focus - "architecture", "security", "performance", "quality", or "all" (default)

**Example:**
```json
{
  "workflow": "parallel-review",
  "params": {
    "files": ["src/components/", "src/utils/"],
    "focus": "security"
  }
}
```

### ✅ validate-last-commit

Validate a specific Git commit using parallel analysis with Gemini and Qwen.

**What it does:**
- Retrieves commit information and diff
- Analyzes changes for breaking changes and issues
- Provides architectural and technical perspectives
- Returns verdict with recommendations

**Parameters:**
- `commit_ref` *(optional)*: Git reference to validate (default: "HEAD")

**Example:**
```json
{
  "workflow": "validate-last-commit",
  "params": {
    "commit_ref": "HEAD~1"
  }
}
```

---

## 📚 File Reference Syntax

All `ask-*` tools support powerful file references:

| Syntax | Description | Example |
|--------|-------------|---------|
| `@filename` | Include specific file | `@src/index.ts` |
| `#filename` | Alternative syntax | `#package.json` |
| `@directory/` | Include directory | `@src/utils/` |
| Multiple refs | Reference many files | `@file1.ts @file2.ts` |

**Example:**
```
@src/index.ts @src/tools/ Explain how the tool registration works
```

---

## 🔧 Configuration

### Execution Modes

#### 🛡️ Sandbox Mode (Qwen, Gemini)
Safe environment for code execution:
```json
{
  "prompt": "Create and test a new feature",
  "sandbox": true
}
```

#### 👻 Shadow Mode (Rovo Dev)
Work on temporary workspace copy:
```json
{
  "prompt": "Refactor this module",
  "shadow": true
}
```

#### ✅ Approval Modes (Qwen)
Control operation approval:
- `plan` - Analysis only
- `default` - Prompt each time
- `auto-edit` - Auto-approve edits
- `yolo` - Auto-approve all

---

## 📋 Prerequisites

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

## 🏗️ Development

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
│   ├── tools/              # Tool definitions
│   │   ├── ask-qwen.tool.ts
│   │   ├── ask-rovodev.tool.ts
│   │   ├── ask-gemini.tool.ts
│   │   ├── smart-workflows.tool.ts  # NEW: Workflow router
│   │   ├── registry.ts     # Tool registry
│   │   └── index.ts
│   ├── workflows/          # NEW: Workflow implementations
│   │   ├── types.ts       # Shared types
│   │   ├── utils.ts       # Common utilities
│   │   ├── index.ts       # Workflow registry
│   │   ├── init-session.workflow.ts
│   │   ├── parallel-review.workflow.ts
│   │   └── validate-last-commit.workflow.ts
│   ├── utils/              # Utilities
│   │   ├── aiExecutor.ts   # CLI execution
│   │   ├── commandExecutor.ts
│   │   ├── gitHelper.ts    # NEW: Git operations
│   │   └── logger.ts
│   ├── constants.ts        # Configuration
│   └── index.ts            # MCP server
├── dist/                   # Compiled output
├── package.json
└── tsconfig.json
```

---

## 🧪 Testing

### Local Testing with Claude Desktop

To test your local changes with Claude Desktop:

1. **Build the project**:
```bash
npm run build
```

2. **Configure Claude Desktop**:
Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or equivalent on Windows/Linux:

```json
{
  "mcpServers": {
    "unified-ai-local": {
      "command": "node",
      "args": ["/path/to/unified-ai-mcp-tool/dist/index.js"]
    }
  }
}
```

3. **Restart Claude Desktop** to load the new configuration

4. **Test workflows**:
```
Per favore, esegui il workflow init-session
```

### Quick Testing with Test Script

We've included a test script for rapid workflow testing:

```bash
# Make the test script executable
chmod +x test-workflows.js

# Run the tests
node test-workflows.js
```

This will test:
- `init-session` workflow
- `validate-last-commit` workflow
- Server startup and tool registration

### Development Mode

For continuous testing during development:

```bash
npm run dev
```

This starts the MCP server in development mode with automatic reloading.

---

## 📊 Performance

### Token Optimization

The Unified AI MCP has been optimized to reduce token waste:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Tools** | 7 | 3 | 57% reduction |
| **Token Usage** | ~10k | ~5k | 50% reduction |
| **Context Saved** | - | ~10-15 files | Per conversation |

See [improvements.md](./improvements.md) for detailed optimization information.

---

## 🚀 Future Developments

### Recent Enhancements (v1.1.0)

-   **`init-session`**: Enhanced with AI analysis! Now uses Rovodev to analyze the last 10 commits and provide an intelligent summary of recent work, including feature changes, bug fixes, and refactoring efforts.

### Additional Smart Workflows (Planned)

We're planning to expand with additional workflow capabilities:

-   **`pre-commit-validate`**: Multi-stage validation pipeline for staged files, checking for common issues, secrets, and test coverage
-   **`bug-hunt`**: Comprehensive bug analysis workflow that combines error pattern analysis with codebase similarity search
-   **`search-library`**: A powerful tool that leverages external knowledge bases like Context7 or DeepWiki to find up-to-date libraries, best practices, and documentation for any given task.

### Workflow Enhancements

Future improvements to the workflow system:
- Workflow chaining capabilities
- Custom workflow definitions via configuration
- Caching for repeated analyses
- Webhook integration for Git hooks
- Export workflow results as markdown/HTML

*Note: For workflows requiring shell access or file system modifications, tools like `ask-qwen` and `ask-gemini` would likely require `--yolo` parameter to grant necessary permissions.*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- 📦 [npm Package](https://www.npmjs.com/package/@jaggerxtrm/unified-ai-mcp-tool)
- 🐙 [GitHub Repository](https://github.com/jaggerxtrm/unified-ai-mcp-tool)
- 📖 [Model Context Protocol](https://modelcontextprotocol.io)
- 🤖 [Qwen Code](https://github.com/QwenLM/qwen-code)
- 🏢 [Atlassian Rovo Dev](https://developer.atlassian.com/rovodev/)
- 🌟 [Google Gemini](https://ai.google.dev/)

---

<div align="center">

⭐ Star this repo if you find it useful!

</div>
