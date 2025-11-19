/**
 * ImplementerAgent - Precise code implementation with production quality
 *
 * Uses Rovodev (fallback: Droid) for:
 * - Production-ready code generation
 * - Bug fixing and code modifications
 * - Incremental implementation
 * - Code quality and best practices
 *
 * Future: Will integrate with Serena for surgical edits (Task 2.4)
 *
 * @module agents/ImplementerAgent
 */

import { BaseAgent } from "./base/BaseAgent.js";
import { BACKENDS } from "../constants.js";
import type {
  ImplementerInput,
  ImplementerOutput,
  CodeSnippet,
  ImplementationApproach
} from "./types.js";

/**
 * ImplementerAgent specializes in code implementation and modification
 *
 * Backend: Rovodev (primary), Droid (fallback)
 * Specialization: Production code generation, bug fixes, incremental changes
 */
export class ImplementerAgent extends BaseAgent<ImplementerInput, ImplementerOutput> {
  readonly name = "ImplementerAgent";
  readonly description = "Precise code implementation with production-quality standards using Rovodev";
  readonly preferredBackend = BACKENDS.ROVODEV;
  readonly fallbackBackend = BACKENDS.DROID;

  /**
   * Build specialized prompt for code implementation
   */
  protected buildPrompt(input: ImplementerInput): string {
    const { task, targetFiles, codeContext, approach = "incremental", constraints } = input;

    let prompt = `You are an expert Code Implementer. Your task is to generate production-ready code with proper error handling, documentation, and best practices.\n\n`;

    prompt += `## Task\n${task}\n\n`;

    prompt += `## Target Files\n${targetFiles.map(f => `- ${f}`).join("\n")}\n\n`;

    if (codeContext) {
      prompt += `## Code Context\n\`\`\`\n${codeContext}\n\`\`\`\n\n`;
    }

    // Approach-specific instructions
    const approachInstructions = this.getApproachInstructions(approach);
    prompt += `## Implementation Approach\n${approachInstructions}\n\n`;

    if (constraints && constraints.length > 0) {
      prompt += `## Constraints\n${constraints.map(c => `- ${c}`).join("\n")}\n\n`;
    }

    prompt += `## Requirements

Your implementation MUST:
1. Be production-ready and follow best practices
2. Include comprehensive error handling
3. Be well-documented with clear comments
4. Be testable and maintainable
5. Handle edge cases appropriately
6. Follow the project's coding style and conventions

## Output Format

Please provide your implementation in this structure:

### Summary
[Brief description of what was implemented and why]

### Changed Files

For each file that needs modification:

**File: \`filename.ts\`**
Description: [What changes were made]

\`\`\`typescript
[Complete code implementation or snippet]
\`\`\`

### Test Suggestions
[How to test this implementation]
1. [Test case 1]
2. [Test case 2]
...

### Next Steps
[What should be done after this implementation]
1. [Step 1]
2. [Step 2]
...`;

    return prompt;
  }

  /**
   * Get approach-specific instructions
   */
  private getApproachInstructions(approach: ImplementationApproach): string {
    const instructions = {
      incremental: `**Incremental Implementation**
- Make small, testable changes
- Preserve existing functionality
- Add features step-by-step
- Ensure backward compatibility
- Allow for easy rollback if needed`,

      "full-rewrite": `**Full Rewrite**
- Start from scratch with new implementation
- Apply modern best practices and patterns
- Improve architecture and design
- Ensure feature parity with existing code
- Document breaking changes clearly`,

      minimal: `**Minimal Changes**
- Make only necessary modifications
- Preserve existing code structure
- Focus on the specific issue only
- Minimize code churn and side effects
- Keep changes localized and focused`
    };

    return instructions[approach];
  }

  /**
   * Parse Rovodev/Gemini output into structured ImplementerOutput
   */
  protected parseOutput(rawOutput: string, input: ImplementerInput): ImplementerOutput {
    const summary = this.extractSection(rawOutput, "Summary", "Changed Files") || "Implementation completed";
    const codeSnippets = this.extractCodeSnippets(rawOutput);
    const testSuggestions = this.extractList(rawOutput, "Test Suggestions", "Next Steps");
    const nextSteps = this.extractList(rawOutput, "Next Steps");

    // Extract unique file names from code snippets
    const changedFiles = [...new Set(codeSnippets.map(s => s.file))];

    return {
      summary,
      changedFiles,
      codeSnippets,
      testSuggestions: testSuggestions.length > 0 ? testSuggestions : undefined,
      nextSteps: nextSteps.length > 0 ? nextSteps : undefined
    };
  }

  /**
   * Provide default output on failure
   */
  protected getDefaultOutput(): ImplementerOutput {
    return {
      summary: "",
      changedFiles: [],
      codeSnippets: [],
      testSuggestions: undefined,
      nextSteps: undefined
    };
  }

  /**
   * Build agent-specific metadata
   */
  protected buildMetadata(input: ImplementerInput, output: ImplementerOutput): Record<string, any> {
    return {
      approach: input.approach || "incremental",
      targetFilesCount: input.targetFiles.length,
      changedFilesCount: output.changedFiles.length,
      codeSnippetsCount: output.codeSnippets.length,
      hasTests: !!output.testSuggestions && output.testSuggestions.length > 0,
      hasNextSteps: !!output.nextSteps && output.nextSteps.length > 0
    };
  }

  /**
   * Validate input before execution
   */
  validateInput(input: ImplementerInput): boolean {
    if (!input.task || input.task.trim().length === 0) {
      return false;
    }
    if (!input.targetFiles || input.targetFiles.length === 0) {
      return false;
    }
    return true;
  }

  // ============================================================================
  // Private parsing helpers
  // ============================================================================

  /**
   * Extract a section from markdown-formatted output
   */
  private extractSection(text: string, startMarker: string, endMarker?: string): string | undefined {
    const regex = endMarker
      ? new RegExp(`###?\\s*${startMarker}([\\s\\S]*?)(?=###?\\s*${endMarker}|$)`, 'i')
      : new RegExp(`###?\\s*${startMarker}([\\s\\S]*)$`, 'i');

    const match = text.match(regex);
    return match ? match[1].trim() : undefined;
  }

  /**
   * Extract a numbered or bulleted list from a section
   */
  private extractList(text: string, startMarker: string, endMarker?: string): string[] {
    const section = this.extractSection(text, startMarker, endMarker);
    if (!section) return [];

    const lines = section.split('\n');
    const items: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/^(?:[\d]+\.|[-*])\s+(.+)$/);
      if (match) {
        items.push(match[1].trim());
      }
    }

    return items;
  }

  /**
   * Extract code snippets from output
   *
   * Looks for patterns like:
   * - File: `filename.ts`
   * - ```typescript ... ```
   */
  private extractCodeSnippets(text: string): CodeSnippet[] {
    const snippets: CodeSnippet[] = [];

    // Find all file mentions
    const filePattern = /(?:file|File|FILE):\s*`?([^\n`]+)`?/gi;
    const fileMatches: Array<{ index: number; file: string }> = [];

    let fileMatch;
    while ((fileMatch = filePattern.exec(text)) !== null) {
      fileMatches.push({
        index: fileMatch.index,
        file: fileMatch[1].trim()
      });
    }

    // Find all code blocks
    const codeBlockPattern = /```[\w]*\n([\s\S]*?)```/g;
    const codeBlocks: Array<{ index: number; code: string }> = [];

    let codeMatch;
    while ((codeMatch = codeBlockPattern.exec(text)) !== null) {
      codeBlocks.push({
        index: codeMatch.index,
        code: codeMatch[1].trim()
      });
    }

    // Match code blocks to files
    for (const codeBlock of codeBlocks) {
      // Find closest preceding file mention
      let matchedFile = "unknown";
      let minDistance = Infinity;

      for (const fileMatch of fileMatches) {
        if (fileMatch.index < codeBlock.index) {
          const distance = codeBlock.index - fileMatch.index;
          if (distance < minDistance) {
            minDistance = distance;
            matchedFile = fileMatch.file;
          }
        }
      }

      // Extract description (text between file name and code block)
      let description = "Code modification";
      const textBetween = text.substring(
        Math.max(0, codeBlock.index - 300),
        codeBlock.index
      );
      const descMatch = textBetween.match(/description:\s*([^\n]+)/i);
      if (descMatch) {
        description = descMatch[1].trim();
      } else {
        // Try to extract from preceding text
        const lines = textBetween.split('\n');
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (line && !line.startsWith('```') && !line.match(/^file:/i)) {
            description = line;
            break;
          }
        }
      }

      snippets.push({
        file: matchedFile,
        description,
        code: codeBlock.code
      });
    }

    return snippets;
  }
}
