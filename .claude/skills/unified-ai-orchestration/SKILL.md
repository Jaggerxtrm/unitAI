---
name: unified-ai-orchestration
description: Use unified-ai-mcp for multi-model AI analysis when complexity requires different perspectives. Run ask-gemini + ask-qwen in parallel for comprehensive validation. Add ask-rovodev for production-ready code generation. Choose the right model(s) based on task complexity and iteration speed.
---

# Unified AI Orchestration Skill

## Purpose

Leverage multiple AI backends through unified-ai-mcp MCP server for robust analysis, implementation, and validation. This skill helps you choose the right AI model(s) for the task and orchestrate them effectively.

## When to Use

Consider this skill when:
- Complex architectural decisions requiring deep analysis
- Pre-commit validation needing multiple perspectives
- Production code generation with quality requirements
- Need for parallel validation (Gemini + Qwen)
- Fast iteration cycles (Qwen for speed)
- Critical security or performance analysis (Gemini for depth)

## Core Principle

**Guideline**: Match AI model strengths to task requirements. Use parallel execution for comprehensive validation. Choose depth vs speed based on context.

## Model Selection Guide (Dynamic, NOT Prescriptive)

### ask-gemini - Deep Reasoning Engine

**Best for**:
- Architectural design and patterns
- Security analysis and threat modeling
- Performance optimization strategies
- Best practices and code quality
- Comprehensive pre-commit reviews
- Complex refactoring plans

**Strengths**:
- Deep reasoning and analysis
- Strong architectural understanding
- Excellent security awareness
- Detailed explanations
- Structured suggestions

**When to use**:
- High-stakes changes
- Architectural decisions
- Security-critical code
- Learning/understanding complex patterns

**Example queries**:
```bash
mcp__unified-ai-mcp__ask-gemini --prompt "@src/auth.ts Analyze: 1) Security vulnerabilities 2) Best practices violations 3) Performance improvements"

mcp__unified-ai-mcp__ask-gemini --prompt "Design approach: How should we implement OAuth2 flow for this API? Consider security, scalability, and maintainability."

mcp__unified-ai-mcp__ask-gemini --prompt "@src/workflow.ts Comprehensive architectural review: patterns, anti-patterns, refactoring opportunities"
```

### ask-qwen - Fast Iteration Partner

**Best for**:
- Quick code quality checks
- Edge case detection
- Pattern recognition
- Redundancy identification
- Fast feedback loops
- Performance bottleneck spotting

**Strengths**:
- Fast response times
- Good quality detection
- Catches edge cases
- Practical insights
- Complementary to Gemini

**When to use**:
- Rapid iteration
- Second opinion needed
- Quick quality check
- Parallel validation with Gemini

**Example queries**:
```bash
mcp__unified-ai-mcp__ask-qwen --prompt "@src/utils.ts Check: 1) Code quality issues 2) Redundant patterns 3) Potential bugs 4) Edge cases"

mcp__unified-ai-mcp__ask-qwen --prompt "Quick analysis: Is this implementation redundant with existing code? Any obvious issues?"

mcp__unified-ai-mcp__ask-qwen --prompt "@src/handler.ts Fast review: edge cases, error handling, performance concerns"
```

### ask-rovodev - Production Code Generator

**Best for**:
- Production-ready code generation
- Bug fixes with proper error handling
- Feature implementation
- Detailed implementations
- Working code prototypes

**Strengths**:
- Generates working code
- Good error handling
- Production quality
- Practical implementations

**When to use**:
- Need working code fast
- Implementing well-defined features
- Fixing critical bugs
- Prototyping solutions

**Example queries**:
```bash
mcp__unified-ai-mcp__ask-rovodev --prompt "Implement OAuth2 authentication flow with proper error handling, token refresh, and security best practices"

mcp__unified-ai-mcp__ask-rovodev --prompt "Fix bug in @src/parser.ts: handle edge case when input is empty array, add proper validation"

mcp__unified-ai-mcp__ask-rovodev --prompt "Generate production-ready CRUD API endpoints for User model with validation, error handling, and logging"
```

## Orchestration Patterns

### Pattern 1: Parallel Validation (High-Stakes Changes)

Use when you need comprehensive validation from multiple perspectives.

```bash
# Run BOTH in parallel (not sequential!)
mcp__unified-ai-mcp__ask-gemini --prompt "@src/core.ts Validate: 1) Architecture 2) Security 3) Performance 4) Best practices"

mcp__unified-ai-mcp__ask-qwen --prompt "@src/core.ts Check: 1) Quality issues 2) Edge cases 3) Redundancy 4) Bugs"

# Then: Compare outputs, synthesize findings, address concerns
```

**When to choose**:
- Pre-commit review for critical code
- Architectural changes
- Security-sensitive modifications
- Refactoring with broad impact

**Why parallel**: Different AI models catch different issues. Gemini focuses on architecture/security, Qwen catches edge cases and quality issues.

### Pattern 2: Sequential Depth (Learning & Understanding)

Use when exploring unfamiliar code or learning architectural patterns.

```bash
# 1. Start broad (Qwen for quick overview)
mcp__unified-ai-mcp__ask-qwen --prompt "@src/module.ts Quick analysis: what does this module do and how?"

# 2. Then deep (Gemini for detailed analysis)
mcp__unified-ai-mcp__ask-gemini --prompt "@src/module.ts Detailed architectural review: patterns used, design decisions, improvement opportunities"
```

**When to choose**:
- New codebase area
- Understanding complex patterns
- Learning architectural decisions
- Preparing for refactoring

### Pattern 3: Implementation Flow (Feature Development)

Use for end-to-end feature development with quality checks.

```bash
# 1. Design (Gemini for approach)
mcp__unified-ai-mcp__ask-gemini --prompt "Best approach for implementing feature X? Consider architecture, scalability, maintainability"

# 2. Implement (Rovodev for production code)
mcp__unified-ai-mcp__ask-rovodev --prompt "Implement feature X using approach Y from previous analysis. Include error handling, validation, logging"

# 3. Validate (Qwen for quick review)
mcp__unified-ai-mcp__ask-qwen --prompt "@src/newFeature.ts Quick review: any edge cases, quality issues, or bugs?"
```

**When to choose**:
- Implementing new features
- Need both design and implementation
- Want quality assurance built in

### Pattern 4: Fast Iteration (Experimental Development)

Use when experimenting or prototyping rapidly.

```bash
# Quick iterations with Qwen
mcp__unified-ai-mcp__ask-qwen --prompt "@src/experiment.ts Is this approach viable? Quick feedback"
# [Make changes based on feedback]
mcp__unified-ai-mcp__ask-qwen --prompt "@src/experiment.ts Updated approach - better?"
# [Iterate]

# Once stable, validate with Gemini
mcp__unified-ai-mcp__ask-gemini --prompt "@src/experiment.ts Now stable - comprehensive review before committing"
```

**When to choose**:
- Rapid prototyping
- Experimental features
- Trying different approaches
- Learning and exploration

## Decision Framework

### When to Use Single Model

**Gemini Only**:
- Complex architectural decision
- Security-critical analysis
- Learning/understanding needed
- High-stakes change

**Qwen Only**:
- Quick quality check
- Fast iteration needed
- Simple refactoring
- Edge case validation

**Rovodev Only**:
- Clear implementation requirements
- Production code needed fast
- Well-defined bug fix
- Standard CRUD operations

### When to Use Multiple Models

**Gemini + Qwen (Parallel)**:
- Pre-commit validation
- Critical code changes
- Comprehensive review needed
- Want multiple perspectives

**Gemini → Rovodev → Qwen (Sequential)**:
- Feature implementation flow
- Design → implement → validate
- Learning then building
- Quality-focused development

## Integration with Other Skills

### With serena-surgical-editing
1. Ask-gemini: Design refactoring approach
2. Serena: Navigate symbols, find references
3. Serena: Implement surgical changes
4. Ask-qwen: Quick validation of changes

### With claude-context-usage
1. Claude-context: Discover related code
2. Ask-gemini: Analyze architectural patterns
3. Ask-qwen: Validate consistency
4. Implement with insights from both

### With pre-commit-ai-review
1. Serena: find_referencing_symbols → Impact map
2. **Ask-gemini + Ask-qwen (PARALLEL)** → Comprehensive review
3. Address findings
4. Commit with confidence

## Common Anti-Patterns (Avoid These)

### ❌ Sequential When Parallel Would Be Better
```bash
# BAD: Sequential execution loses time
ask-gemini "review this code"
# wait for response...
ask-qwen "review this code"
# Total time: 2-4 minutes

# GOOD: Parallel execution
ask-gemini "review this code"
ask-qwen "review this code"
# Total time: Same as single call (1-2 minutes)
```

### ❌ Using Gemini for Simple Tasks
```bash
# BAD: Overkill for simple check
ask-gemini "does this function have any obvious bugs?"

# GOOD: Qwen is faster for simple checks
ask-qwen "quick bug check"
```

### ❌ Using Qwen for Deep Architecture
```bash
# BAD: Qwen not optimized for deep analysis
ask-qwen "comprehensive architectural review with security analysis"

# GOOD: Gemini excels at architecture
ask-gemini "comprehensive architectural review with security analysis"
```

### ❌ Skipping Validation After Code Generation
```bash
# BAD: Trust but verify
ask-rovodev "generate feature X"
# [Use generated code without review]

# GOOD: Generate then validate
ask-rovodev "generate feature X"
ask-qwen "@generated-code.ts quick review for issues"
```

## Model Selection Decision Tree

```
Need production code fast?
  YES → ask-rovodev
  NO ↓

Need deep analysis/architecture?
  YES → ask-gemini
  NO ↓

Need quick feedback/iteration?
  YES → ask-qwen
  NO ↓

High-stakes change/pre-commit?
  YES → ask-gemini + ask-qwen (PARALLEL)
```

## Memory Integration

After successful multi-model workflow, save the pattern:

```bash
openmemory-add-memory "Used ask-gemini + ask-qwen parallel validation for [feature]. Gemini caught [X], Qwen caught [Y]. Pattern: parallel for comprehensive review works well."
```

## Performance Considerations

**Response Times** (approximate):
- ask-qwen: 5-15 seconds (fastest)
- ask-gemini: 10-30 seconds (thorough)
- ask-rovodev: 15-45 seconds (generates code)

**Parallel Benefit**:
- Sequential: 10s + 30s + 15s = 55s total
- Parallel: max(10s, 30s, 15s) = 30s total
- Savings: ~45% faster for parallel execution

## Examples in Context

### Example 1: Pre-commit Review
```bash
# File: src/auth/oauth.ts (modified)

# Parallel comprehensive review
mcp__unified-ai-mcp__ask-gemini --prompt "@src/auth/oauth.ts Pre-commit review: 1) Security issues 2) Architecture consistency 3) Best practices 4) Performance"

mcp__unified-ai-mcp__ask-qwen --prompt "@src/auth/oauth.ts Pre-commit check: 1) Code quality 2) Edge cases 3) Potential bugs 4) Error handling"

# Results:
# - Gemini: Identified security issue with token storage
# - Qwen: Caught edge case with empty redirect_uri
# - Both: Complementary findings, comprehensive coverage
```

### Example 2: Feature Implementation
```bash
# Design phase
mcp__unified-ai-mcp__ask-gemini --prompt "Design: Webhook handling system with retry logic, dead letter queue, and monitoring. What's the best approach?"

# Implementation phase
mcp__unified-ai-mcp__ask-rovodev --prompt "Implement webhook handler based on design: retry with exponential backoff, DLQ for failures, Prometheus metrics"

# Validation phase
mcp__unified-ai-mcp__ask-qwen --prompt "@src/webhooks/handler.ts Quick review: edge cases, error handling, potential issues?"
```

### Example 3: Bug Hunt
```bash
# Quick check first
mcp__unified-ai-mcp__ask-qwen --prompt "@src/parser.ts Bug: fails with empty input. Quick analysis?"

# If complex, escalate to Gemini
mcp__unified-ai-mcp__ask-gemini --prompt "@src/parser.ts Deep analysis: why does this fail with empty input? Root cause and comprehensive fix"
```

---

**Skill Status**: Active
**Models Available**: ask-gemini, ask-qwen, ask-rovodev
**Best Practice**: Parallel execution for validation, sequential for learning
**Line Count**: 355 lines
