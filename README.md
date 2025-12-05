# UnitAI

**One MCP Server. Multiple AI Backends. Intelligent Orchestration.**

[![npm version](https://img.shields.io/npm/v/@jaggerxtrm/unitai.svg)](https://www.npmjs.com/package/@jaggerxtrm/unitai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

UnitAI is a unified **Model Context Protocol** server designed to orchestrate a multi-agent AI environment. It abstracts the complexity of managing distinct AI connections behind a single interface, allowing for seamless switching, fallback, and parallel execution across five powerful AI backends.

Unlike traditional tools that rely on static documentation or rigid rule-based systems, UnitAI promotes **iterative agentic coding**. By leveraging intelligent session initialization and context-aware workflows, it transforms the development lifecycle into a collaborative process between the human developer and a specialized team of AI agents.

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

**Option 2: Using Global Install**
First install globally, then add:
```bash
npm install -g @jaggerxtrm/unitai
claude mcp add --transport stdio unitAI -- unitai
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

## Usage

Once installed, UnitAI exposes its capabilities to your MCP client (like Claude Desktop or plain terminals). You can invoke workflows directly using natural language or structured commands.

**Example: Starting a new session**
> "Initialize the session and check what we worked on yesterday."
> *(Triggers `init-session` workflow)*

**Example: Deep Code Review**
> "Run a triangulated review on `src/utils/aiExecutor.ts` to check for concurrency issues."
> *(Triggers `triangulated-review` workflow)*

## Development

To contribute or modify UnitAI:

```bash
git clone https://github.com/jaggerxtrm/unitai.git
cd unitai
npm install
npm run build
```

This project uses **TypeScript** and **Vitest** for testing. Ensure `npm test` passes before submitting changes.