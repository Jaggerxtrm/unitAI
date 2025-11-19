/**
 * TesterAgent - Fast test generation and validation
 *
 * Uses Cursor Agent for:
 * - Unit test generation
 * - Integration test generation
 * - Test coverage analysis
 * - Fast iteration on test cases
 *
 * @module agents/TesterAgent
 */

import { BaseAgent } from "./base/BaseAgent.js";
import { BACKENDS } from "../constants.js";
import type {
  TesterInput,
  TesterOutput,
  TestType
} from "./types.js";

/**
 * TesterAgent specializes in fast test generation
 *
 * Backend: Cursor Agent (no fallback - optimized for speed)
 * Specialization: Test generation, coverage analysis, edge case detection
 */
export class TesterAgent extends BaseAgent<TesterInput, TesterOutput> {
  readonly name = "TesterAgent";
  readonly description = "Fast test generation and coverage analysis using Cursor Agent";
  readonly preferredBackend = BACKENDS.CURSOR;
  readonly fallbackBackend = undefined; // Cursor-only for speed

  /**
   * Build specialized prompt for test generation
   */
  protected buildPrompt(input: TesterInput): string {
    const {
      targetCode,
      testType = "unit",
      framework = "jest",
      coverageGoal = 80,
      existingTests
    } = input;

    let prompt = `You are an expert Test Engineer specializing in comprehensive test generation.\n\n`;

    prompt += `## Target Code\n\`\`\`typescript\n${targetCode}\n\`\`\`\n\n`;

    prompt += `## Test Requirements\n`;
    prompt += `- Test Type: ${testType}\n`;
    prompt += `- Framework: ${framework}\n`;
    prompt += `- Coverage Goal: ${coverageGoal}%\n\n`;

    if (existingTests) {
      prompt += `## Existing Tests (for reference)\n\`\`\`typescript\n${existingTests}\n\`\`\`\n\n`;
    }

    // Test type specific instructions
    const testTypeInstructions = this.getTestTypeInstructions(testType);
    prompt += `## Test Focus\n${testTypeInstructions}\n\n`;

    prompt += `## Output Format

Please provide your test implementation in this structure:

### Test Code

\`\`\`${framework === 'jest' ? 'typescript' : 'javascript'}
[Complete test code with imports and proper ${framework} syntax]
\`\`\`

### Test Coverage Analysis
- Estimated Coverage: [percentage]%
- Test Count: [number]
- Covered Scenarios:
  1. [Scenario 1]
  2. [Scenario 2]
  ...

### Recommendations
[Suggestions for additional tests or improvements]
1. [Recommendation 1]
2. [Recommendation 2]
...

## Requirements

Your tests MUST include:
1. **Happy path tests** - Normal expected behavior
2. **Edge case tests** - Boundary conditions
3. **Error handling tests** - Invalid inputs and failures
4. **Descriptive test names** - Clear what is being tested
5. **Proper assertions** - Verify expected outcomes
6. **Setup/teardown** - If needed for test isolation

Write idiomatic ${framework} tests with clear arrange-act-assert pattern.`;

    return prompt;
  }

  /**
   * Get test-type specific instructions
   */
  private getTestTypeInstructions(testType: TestType): string {
    const instructions = {
      unit: `**Unit Test Focus:**
- Test individual functions/methods in isolation
- Mock external dependencies and modules
- Cover all code paths and branches
- Test return values and side effects
- Verify error handling and edge cases
- Use descriptive test names (describe/it structure)
- Keep tests fast and independent`,

      integration: `**Integration Test Focus:**
- Test component interactions
- Use real dependencies where practical
- Test data flow between components
- Verify API contracts and interfaces
- Test error propagation between layers
- Include realistic scenarios
- May be slower than unit tests`,

      "e2e": `**End-to-End Test Focus:**
- Test complete user flows
- Use realistic user scenarios
- Test from user perspective (UI to database)
- Verify business requirements
- Include setup and cleanup
- May require test data fixtures
- Focus on critical user paths`
    };

    return instructions[testType];
  }

  /**
   * Parse Cursor Agent output into structured TesterOutput
   */
  protected parseOutput(rawOutput: string, input: TesterInput): TesterOutput {
    const testCode = this.extractCodeBlock(rawOutput);
    const testCount = this.countTests(testCode);
    const estimatedCoverage = this.extractCoverage(rawOutput) ?? this.estimateCoverage(testCount);
    const recommendations = this.extractRecommendations(rawOutput);

    return {
      testCode,
      testCount,
      estimatedCoverage,
      framework: input.framework || "jest",
      recommendations
    };
  }

  /**
   * Provide default output on failure
   */
  protected getDefaultOutput(): TesterOutput {
    return {
      testCode: "",
      testCount: 0,
      estimatedCoverage: 0,
      framework: "jest",
      recommendations: []
    };
  }

  /**
   * Build agent-specific metadata
   */
  protected buildMetadata(input: TesterInput, output: TesterOutput): Record<string, any> {
    return {
      testType: input.testType || "unit",
      framework: output.framework,
      testCount: output.testCount,
      coverage: output.estimatedCoverage,
      coverageGoal: input.coverageGoal || 80,
      meetsGoal: output.estimatedCoverage >= (input.coverageGoal || 80),
      recommendationCount: output.recommendations.length
    };
  }

  /**
   * Validate input before execution
   */
  validateInput(input: TesterInput): boolean {
    if (!input.targetCode || input.targetCode.trim().length === 0) {
      return false;
    }
    return true;
  }

  // ============================================================================
  // Private parsing helpers
  // ============================================================================

  /**
   * Extract code block from output
   */
  private extractCodeBlock(text: string): string {
    const codeBlockMatch = text.match(/```[\w]*\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    // Fallback: look for test patterns in raw text
    return text;
  }

  /**
   * Count test cases in generated code
   */
  private countTests(testCode: string): number {
    // Count using common test patterns across frameworks
    const patterns = [
      /\b(?:test|it)\s*\(/g,         // Jest/Mocha: test(), it()
      /@Test\b/g,                     // JUnit style
      /\bdef\s+test_/g,               // Python pytest
      /\bfn\s+test_/g,                // Rust
      /\bfunc\s+Test/g                // Go
    ];

    let count = 0;
    for (const pattern of patterns) {
      const matches = testCode.match(pattern);
      if (matches) {
        count += matches.length;
      }
    }

    return count;
  }

  /**
   * Extract coverage percentage from output
   */
  private extractCoverage(text: string): number | undefined {
    const patterns = [
      /(?:estimated\s+)?coverage[:\s]+([\d]+)%?/i,
      /coverage[:\s]+approximately\s+([\d]+)%/i,
      /([\d]+)%\s+coverage/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const coverage = parseInt(match[1], 10);
        if (coverage >= 0 && coverage <= 100) {
          return coverage;
        }
      }
    }

    return undefined;
  }

  /**
   * Estimate coverage based on test count (heuristic)
   */
  private estimateCoverage(testCount: number): number {
    // Heuristic: more tests generally mean higher coverage
    // But cap at 95% to be conservative (hard to reach 100%)
    if (testCount === 0) return 0;
    if (testCount === 1) return 30;
    if (testCount === 2) return 50;
    if (testCount === 3) return 65;
    if (testCount === 4) return 75;
    if (testCount >= 5) return Math.min(75 + (testCount - 4) * 5, 95);
    return 50; // fallback
  }

  /**
   * Extract recommendations from output
   */
  private extractRecommendations(text: string): string[] {
    const section = this.extractSection(text, "Recommendations");
    if (!section) return [];

    const lines = section.split('\n');
    const recommendations: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const match = trimmed.match(/^(?:[\d]+\.|[-*])\s+(.+)$/);
      if (match) {
        recommendations.push(match[1].trim());
      }
    }

    return recommendations;
  }

  /**
   * Extract a section from markdown-formatted output
   */
  private extractSection(text: string, marker: string): string | undefined {
    const regex = new RegExp(`###?\\s*${marker}([\\s\\S]*?)(?=###|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : undefined;
  }
}
