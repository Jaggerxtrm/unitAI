# Unified AI MCP Tool

Model Context Protocol server for multiple AI clients (Qwen, Rovo Dev, etc.). This tool enables AI assistants like Claude to leverage multiple powerful AI coding assistants through a single MCP interface.

## Features

- **Multiple AI Backends**: Support for both Qwen and Rovo Dev AI clients with automatic switching
- **Large Context Windows**: Leverage either AI's massive token capacity for analyzing large files and entire codebases
- **File Analysis**: Use `@filename` or `#filename` syntax to include file contents in your queries
- **Sandbox Mode**: Safely execute code and run tests in isolated environments (Qwen specific)
- **Shadow Mode**: Rovo Dev specific safe changes with temporary workspace copies
- **Multiple Models**: Support for various models in each backend
- **Flexible Approval Modes**: Control tool execution with plan/default/auto-edit/yolo modes
- **MCP Protocol**: Seamless integration with MCP-compatible AI assistants

## Strengths by Backend

### Qwen CLI Strengths:
- Exceptional large context windows (handles very large files)
- Advanced multi-language code generation
- Cost-effective model options
- Built-in sandbox mode for safe code execution
- Strong code analysis capabilities

### Rovo Dev CLI Strengths:
- Access to Claude Sonnet and GPT-5 models for advanced reasoning
- Pre-configured with premium Anthropic models (Sonnet 4, Opus)
- Atlassian ecosystem integration
- Built-in project awareness and workspace management
- Shadow mode for safe changes
- MCP support built into the tool itself
- Advanced session management

## Prerequisites

- Node.js v16 or higher
- For Qwen: `npm install -g @qwen/cli`
- For Rovo Dev: Install and configure `acli rovodev`

## Installation

### Quick Setup (Easiest - Recommended)

Use Claude Code's built-in MCP installer:

```bash
claude mcp add unified-ai-mcp -- npx -y @jaggerxtrm/unified-ai-mcp-tool
```

This single command configures everything automatically!

### Via Global Install

Install via npm:

```bash
npm install -g @jaggerxtrm/unified-ai-mcp-tool
```

Then add to Claude Code MCP settings (`~/.config/claude/mcp_settings.json`):

```json
{
  "mcpServers": {
    "unified-ai-mcp": {
      "command": "unified-ai-mcp-tool"
    }
  }
}
```

### Via npx (Manual Configuration)

Manually configure to use npx without installing:

```json
{
  "mcpServers": {
    "unified-ai-mcp": {
      "command": "npx",
      "args": ["-y", "@jaggerxtrm/unified-ai-mcp-tool"]
    }
  }
}
```

## Available Tools

### ask-qwen

The main tool for interacting with Qwen AI.

**Parameters:**
- `prompt` (required): Your question or instruction
  - Use `@filename` or `#filename` to include a file's contents
  - Use `@directory` to include all files in a directory
- `model` (optional): Model to use (qwen3-coder-plus, qwen3-coder-turbo, etc.)
- `sandbox` (optional): Enable sandbox mode for safe code execution
- `approvalMode` (optional): Control tool execution approval
  - `plan`: Analyze tool calls without executing
  - `default`: Prompt for approval (default behavior)
  - `auto-edit`: Auto-approve file edits
  - `yolo`: Auto-approve all tool calls
- `yolo` (optional): Shortcut for approvalMode='yolo'
- `allFiles` (optional): Include all files in current directory as context
- `debug` (optional): Enable debug mode

**Examples:**
```javascript
// Analyze a specific file with Qwen
{
  "prompt": "@src/main.ts Explain what this code does",
  "model": "qwen3-coder-plus",
  "approvalMode": "auto-edit"
}

// Use Qwen with sandbox mode
{
  "prompt": "Fix the bug in this function",
  "sandbox": true,
  "model": "qwen3-coder-turbo"
}
```

### ask-rovodev

The main tool for interacting with Rovo Dev AI.

**Parameters:**
- `prompt` (required): Your question or instruction
  - Use `@filename` or `#filename` to include a file's contents
  - Use `@directory` to include all files in a directory
- `model` (optional): Model to use (configured in Rovo Dev)
- `approvalMode` (optional): Control tool execution approval
  - `plan`: Analyze tool calls without executing
  - `default`: Prompt for approval (default behavior)
  - `auto-edit`: Auto-approve file edits
  - `yolo`: Auto-approve all tool calls
- `yolo` (optional): Shortcut for approvalMode='yolo'
- `allFiles` (optional): Include all files in current directory as context
- `debug` (optional): Enable debug mode
- `shadow` (optional): Enable shadow mode for safe changes
- `verbose` (optional): Enable verbose tool output
- `restore` (optional): Continue last session instead of starting new
- `codeMode` (optional): Enable code-specific analysis
- `reviewMode` (optional): Enable detailed code review
- `optimize` (optional): Request optimization suggestions
- `explain` (optional): Request detailed explanations

**Examples:**
```javascript
// Analyze with Rovo Dev and shadow mode
{
  "prompt": "@src/main.ts Review this code for security issues",
  "shadow": true,
  "reviewMode": true
}

// Use Rovo Dev with optimization suggestions
{
  "prompt": "How can I optimize this algorithm?",
  "optimize": true,
  "explain": true,
  "verbose": true
}
```

### ping

Simple echo test to verify the connection.

**Parameters:**
- `prompt` (optional): Message to echo (defaults to "Unified AI Pong!")

### qwen-help

Display Qwen CLI help information.

**Parameters:** None

### rovodev-help

Display Rovodev CLI help information.

**Parameters:** None

## Configuration

Each backend uses its own configuration:
- **Qwen models**: Primary: qwen3-coder-plus, Fallback: qwen3-coder-turbo (used if primary hits quota limits)
- **Rovo Dev models**: Uses model configured in ~/.rovodev/config.yml (typically Claude models)

## Usage with Claude Code

Once installed as an MCP server, Claude Code will automatically discover and make available all the tools provided by this unified tool:

- `ask-qwen`: Direct access to Qwen AI with parameters optimized for its strengths
- `ask-rovodev`: Direct access to Rovo Dev AI with parameters optimized for its strengths
- `qwen-help` and `rovodev-help`: Get help for either backend
- `ping`: Test the connection

You can use these tools directly in Claude by referencing the specific tool names and parameters as documented above. For example:
- Use `ask-qwen` when you need large context windows or sandbox mode
- Use `ask-rovodev` when you need Atlassian integration or shadow mode

## Project Structure

```
unified-ai-mcp-tool/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── constants.ts          # Configuration and constants
│   ├── tools/
│   │   ├── registry.ts       # Tool registration system
│   │   ├── ask-qwen.tool.ts  # Qwen AI interaction tool
│   │   ├── ask-rovodev.tool.ts # Rovo Dev interaction tool
│   │   ├── simple-tools.ts   # Utility tools (ping, help)
│   │   └── index.ts          # Tool exports
│   └── utils/
│       ├── commandExecutor.ts # Command execution utility
│       ├── aiExecutor.ts      # Unified AI CLI wrapper
│       └── logger.ts          # Logging utility
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. The MCP server listens for tool calls via stdio transport
2. When a tool is called, the server validates the arguments using Zod schemas
3. For backend-specific tools, prompts are passed to the appropriate CLI with appropriate flags
4. File references (`@filename` or `#filename`) are handled by the respective AI tool's built-in file processing
5. Output is captured and returned to the MCP client
6. If quota limits are hit for Qwen, the server automatically falls back to the turbo model

## Troubleshooting

### "Qwen CLI not found"

Make sure the Qwen CLI is installed and available in your PATH:
```bash
npm install -g @qwen/cli
# or follow instructions at https://github.com/QwenLM/qwen-code
```

### "acli rovodev not found"

Make sure the Rovo Dev CLI is installed and available in your PATH:
```bash
# Follow Rovo Dev installation instructions
```

### "Command timed out"

For very large files or codebases, the analysis may take longer than the default 10-minute timeout. Consider:
- Using `.gitignore` to exclude unnecessary files
- Breaking down large queries into smaller chunks
- Using `approvalMode: "plan"` to analyze without executing

### "Invalid tool arguments"

Check that your arguments match the tool schema. Use the `qwen-help` or `rovodev-help` tools to see available options.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Credits

Based on architectural patterns from [qwen-mcp-tool](https://github.com/QwenLM/qwen-code) and extended for multiple AI backends.
Built for use with both [Qwen Code](https://github.com/QwenLM/qwen-code) and [Atlassian Rovo Dev](https://developer.atlassian.com/rovodev/).