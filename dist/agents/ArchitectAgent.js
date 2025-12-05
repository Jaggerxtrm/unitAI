/**
 * ArchitectAgent - High-level system design and architecture
 *
 * Uses Gemini for:
 * - Architectural analysis and design patterns
 * - Security and scalability assessment
 * - Refactoring strategies
 * - Long-term impact analysis
 *
 * @module agents/ArchitectAgent
 */
import { BaseAgent } from "./base/BaseAgent.js";
import { BACKENDS } from "../constants.js";
/**
 * ArchitectAgent specializes in architectural design and analysis
 *
 * Backend: Gemini (no fallback - architectural work requires deep reasoning)
 * Specialization: System design, security, scalability, refactoring strategies
 */
export class ArchitectAgent extends BaseAgent {
    name = "ArchitectAgent";
    description = "High-level system design, architecture analysis, and strategic planning using Gemini";
    preferredBackend = BACKENDS.GEMINI;
    fallbackBackend = undefined; // Gemini-only for architectural reasoning
    /**
     * Build specialized prompt for architectural analysis
     */
    buildPrompt(input) {
        const { task, context, files, focus = "design" } = input;
        let prompt = `You are an expert Software Architect with deep knowledge of design patterns, system architecture, and software engineering best practices.\n\n`;
        prompt += `## Task\n${task}\n\n`;
        if (context) {
            prompt += `## Context\n${context}\n\n`;
        }
        if (files && files.length > 0) {
            prompt += `## Files to Consider\n${files.map(f => `- ${f}`).join("\n")}\n\n`;
        }
        // Focus-specific instructions
        const focusInstructions = this.getFocusInstructions(focus);
        prompt += `## Focus Area: ${focus}\n${focusInstructions}\n\n`;
        prompt += `## Required Output Format

Please provide your analysis in the following structure:

### 1. Architectural Analysis
[Detailed analysis of the current or proposed architecture]

### 2. Recommendations
[List of specific, actionable recommendations]
1. [Recommendation 1]
2. [Recommendation 2]
...

### 3. Implementation Plan
[Step-by-step plan for implementing recommendations]
1. [Step 1]
2. [Step 2]
...

### 4. Risks and Mitigations
[Potential risks and how to mitigate them]
- Risk: [Description]
  Mitigation: [Strategy]

### 5. Complexity Estimate
[Overall complexity: LOW/MEDIUM/HIGH]

Be specific, provide examples, and think about long-term implications.`;
        return prompt;
    }
    /**
     * Get focus-specific instructions
     */
    getFocusInstructions(focus) {
        const instructions = {
            design: `Focus on:
- System architecture and component design
- Design patterns and best practices
- Component boundaries and responsibilities
- API design and contracts
- Data flow and state management
- Separation of concerns
- SOLID principles application`,
            refactoring: `Focus on:
- Code structure improvements
- Pattern application opportunities
- Coupling and cohesion analysis
- Maintainability enhancements
- Technical debt reduction
- Code smells identification
- Refactoring strategies and priorities`,
            optimization: `Focus on:
- Performance bottlenecks identification
- Algorithmic efficiency improvements
- Resource utilization optimization
- Caching strategies
- Database query optimization
- Scalability improvements
- Load testing considerations`,
            security: `Focus on:
- Security vulnerabilities (OWASP Top 10)
- Authentication and authorization mechanisms
- Data protection and encryption
- Input validation and sanitization
- Secure communication protocols
- Security best practices
- Threat modeling`,
            scalability: `Focus on:
- Horizontal and vertical scaling strategies
- Load distribution and balancing
- Database scalability patterns
- Caching and CDN usage
- Microservices architecture considerations
- Queue systems and async processing
- Performance under load`
        };
        return instructions[focus];
    }
    /**
     * Parse Gemini output into structured ArchitectOutput
     */
    parseOutput(rawOutput, input) {
        return {
            analysis: this.extractSection(rawOutput, "Architectural Analysis", "Recommendations") || rawOutput,
            recommendations: this.extractList(rawOutput, "Recommendations", "Implementation Plan"),
            implementationPlan: this.extractSection(rawOutput, "Implementation Plan", "Risks"),
            risks: this.extractList(rawOutput, "Risks", "Complexity"),
            estimatedComplexity: this.extractComplexity(rawOutput)
        };
    }
    /**
     * Provide default output on failure
     */
    getDefaultOutput() {
        return {
            analysis: "",
            recommendations: [],
            implementationPlan: undefined,
            risks: undefined,
            estimatedComplexity: undefined
        };
    }
    /**
     * Build agent-specific metadata
     */
    buildMetadata(input, output) {
        return {
            focus: input.focus || "design",
            filesAnalyzed: input.files?.length ?? 0,
            recommendationCount: output.recommendations.length,
            complexity: output.estimatedComplexity,
            hasImplementationPlan: !!output.implementationPlan,
            hasRisks: !!output.risks && output.risks.length > 0
        };
    }
    /**
     * Validate input before execution
     */
    validateInput(input) {
        if (!input.task || input.task.trim().length === 0) {
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
    extractSection(text, startMarker, endMarker) {
        const regex = endMarker
            ? new RegExp(`###?\\s*\\d*\\.?\\s*${startMarker}([\\s\\S]*?)(?=###?\\s*\\d*\\.?\\s*${endMarker}|$)`, 'i')
            : new RegExp(`###?\\s*\\d*\\.?\\s*${startMarker}([\\s\\S]*)$`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : undefined;
    }
    /**
     * Extract a numbered or bulleted list from a section
     */
    extractList(text, startMarker, endMarker) {
        const section = this.extractSection(text, startMarker, endMarker);
        if (!section)
            return [];
        const lines = section.split('\n');
        const items = [];
        for (const line of lines) {
            const trimmed = line.trim();
            // Match numbered lists (1., 2.) or bullet points (-, *)
            const match = trimmed.match(/^(?:[\d]+\.|[-*])\s+(.+)$/);
            if (match) {
                items.push(match[1].trim());
            }
        }
        return items;
    }
    /**
     * Extract complexity estimate from output
     */
    extractComplexity(text) {
        const complexityMatch = text.match(/complexity[:\s]+(low|medium|high)/i);
        if (complexityMatch) {
            return complexityMatch[1].toLowerCase();
        }
        return undefined;
    }
}
//# sourceMappingURL=ArchitectAgent.js.map