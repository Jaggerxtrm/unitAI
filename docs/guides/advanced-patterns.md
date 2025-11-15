# Advanced Patterns Guide

**Version:** 1.0  
**Last Updated:** 2025-11-14

Advanced usage patterns and techniques for power users of unified-ai-mcp-tool.

---

## Table of Contents

- [Recursive MCP Architecture](#recursive-mcp-architecture)
- [Parallel Execution](#parallel-execution)
- [Token Optimization Strategies](#token-optimization-strategies)
- [Custom Workflow Composition](#custom-workflow-composition)
- [Error Recovery](#error-recovery)
- [Performance Tuning](#performance-tuning)

---

## Recursive MCP Architecture

The unified-ai-mcp tool can invoke other MCP servers from within workflows, creating powerful composition patterns.

### Pattern: Workflow Calls External MCP

```typescript
// Workflow implementation can call other MCP servers
async function advancedCodeAnalysis(file: string) {
  // 1. Use claude-context for semantic search
  const relatedCode = await claudeContext.search(
    `Find code related to ${file}`
  );
  
  // 2. Use Serena for symbol analysis
  const symbols = await serena.get_symbols_overview(file);
  
  // 3. Combine results and analyze with AI
  const analysis = await gemini.analyze({
    file: file,
    related: relatedCode,
    symbols: symbols
  });
  
  // 4. Store insights in openmemory
  await openmemory.add_memory({
    content: `Analysis of ${file}: ${analysis.insights}`,
    tags: ['analysis', 'architecture']
  });
  
  return analysis;
}
```

### Pattern: Serena + claude-context Combo

Best for large-scale refactoring:

```typescript
// Step 1: Semantic search for related code
const results = await claudeContext.search(
  "authentication middleware implementations"
);

// Step 2: For each result, use Serena for precise analysis
for (const file of results.files) {
  const symbols = await serena.get_symbols_overview(file);
  const refs = await serena.find_referencing_symbols(symbols.main);
  
  // Now you have: semantic context + precise symbol relationships
}
```

### Pattern: Multi-Source Documentation Lookup

Combine context7 and deepwiki for comprehensive understanding:

```typescript
// 1. Get API docs from context7
const apiDocs = await context7.get_library_docs("/typescript/express");

// 2. Get real-world examples from deepwiki
const examples = await deepwiki.ask_question(
  "expressjs/express",
  "How to implement custom middleware?"
);

// 3. Synthesize with AI
const guide = await gemini.synthesize(apiDocs, examples);
```

---

## Parallel Execution

Leverage parallel execution for faster results.

### Pattern: Multi-Backend Analysis

Run multiple AI backends in parallel for comprehensive review:

```typescript
// Execute in parallel
const [geminiResult, qwenResult, rovodevResult] = await Promise.all([
  executeAI('gemini', {
    prompt: '@file.ts Analyze architecture',
    model: 'gemini-2.5-pro'
  }),
  executeAI('qwen', {
    prompt: '@file.ts Find code quality issues',
    model: 'qwen3-coder-plus'
  }),
  executeAI('rovodev', {
    prompt: '@file.ts Suggest practical improvements',
    shadow: true
  })
]);

// Synthesize results
const synthesis = synthesizeAnalyses([
  geminiResult,
  qwenResult,
  rovodevResult
]);
```

### Pattern: Parallel File Analysis

Analyze multiple files simultaneously:

```typescript
// Instead of sequential:
for (const file of files) {
  await analyzeFile(file);  // Slow
}

// Use parallel:
await Promise.all(
  files.map(file => analyzeFile(file))
);  // Fast
```

### Pattern: Parallel Workflow Stages

When stages are independent:

```typescript
async function featureDesignParallel(feature: string) {
  // These can run in parallel - no dependencies
  const [architecture, tests, api] = await Promise.all([
    architectAgent.design(feature),
    testerAgent.generateTestStrategy(feature),
    designAPIEndpoints(feature)
  ]);
  
  // Then sequential for dependent stage
  const implementation = await implementerAgent.implement({
    architecture,
    tests,
    api
  });
  
  return { architecture, tests, api, implementation };
}
```

---

## Token Optimization Strategies

Advanced techniques to minimize token usage.

### Pattern: Selective File Loading

Load only necessary parts:

```typescript
// Instead of: @entire-directory/
// Use selective approach:

// 1. Use claude-context to find relevant files
const relevant = await claudeContext.search("error handling logic");

// 2. Use Serena to get only needed symbols
for (const file of relevant.files.slice(0, 3)) {  // Top 3 only
  const symbols = await serena.get_symbols_overview(file);
  const needed = symbols.filter(s => s.type === 'function');
  // Analyze only needed symbols
}
```

### Pattern: Progressive Detail

Start broad, then zoom in:

```typescript
// 1. High-level overview (cheap)
const overview = await gemini.analyze({
  prompt: "Summarize architecture of @src/",
  model: "gemini-2.5-flash"  // Fast, cheap
});

// 2. Identify areas of interest from overview
const areasOfInterest = overview.match(/mentions (.+\.ts)/g);

// 3. Deep dive only on relevant areas (expensive)
for (const area of areasOfInterest.slice(0, 2)) {
  const deepAnalysis = await gemini.analyze({
    prompt: `Detailed analysis of ${area}`,
    model: "gemini-2.5-pro"  // Slow, expensive, but targeted
  });
}
```

### Pattern: Caching Strategy

Leverage workflow caching:

```typescript
// Cache persists for 1 hour
// First call: Full analysis
await executeWorkflow('parallel-review', {
  files: ['file1.ts', 'file2.ts'],
  focus: 'security'
});

// Within 1 hour, same parameters: Instant (cached)
await executeWorkflow('parallel-review', {
  files: ['file1.ts', 'file2.ts'],
  focus: 'security'
});  // Returns cached result

// Different focus: New analysis (cache miss)
await executeWorkflow('parallel-review', {
  files: ['file1.ts', 'file2.ts'],
  focus: 'performance'  // Not cached
});
```

### Pattern: Serena-First Approach

Always use Serena for code files:

```typescript
// Rule: If file > 300 LOC, use Serena

const fileLOC = await getLineCount(file);

if (fileLOC > 300) {
  // Token-efficient approach (75-80% savings)
  const symbols = await serena.get_symbols_overview(file);
  const target = await serena.find_symbol(symbolName, file);
  // Work with symbols only
} else {
  // Direct read OK for small files
  const content = await readFile(file);
}
```

---

## Custom Workflow Composition

Build custom workflows by composing existing ones.

### Pattern: Sequential Workflow Chain

```typescript
async function completeFeatureCycle(feature: string) {
  // 1. Design
  const design = await executeWorkflow('feature-design', {
    featureDescription: feature,
    includeTests: true
  });
  
  // 2. Implement (manually or with AI)
  // ... implementation happens ...
  
  // 3. Review
  const review = await executeWorkflow('parallel-review', {
    files: design.targetFiles,
    focus: 'all'
  });
  
  // 4. Validate before commit
  const validation = await executeWorkflow('pre-commit-validate', {
    depth: 'thorough'
  });
  
  if (validation.verdict.level === 'PASS') {
    // 5. Commit
    await gitCommit(feature);
    
    // 6. Post-commit validation
    await executeWorkflow('validate-last-commit');
  }
  
  return { design, review, validation };
}
```

### Pattern: Conditional Workflow

Execute workflows based on conditions:

```typescript
async function smartValidation(files: string[]) {
  const totalLOC = await getTotalLOC(files);
  
  if (totalLOC < 100) {
    // Small change: Quick validation
    return executeWorkflow('pre-commit-validate', {
      depth: 'quick'
    });
  } else if (totalLOC < 500) {
    // Medium change: Thorough
    return executeWorkflow('pre-commit-validate', {
      depth: 'thorough'
    });
  } else {
    // Large change: Paranoid + parallel review
    const [validation, review] = await Promise.all([
      executeWorkflow('pre-commit-validate', { depth: 'paranoid' }),
      executeWorkflow('parallel-review', { files, focus: 'all' })
    ]);
    return { validation, review };
  }
}
```

### Pattern: Retry with Fallback

```typescript
async function robustWorkflowExecution(
  workflow: string,
  params: any,
  maxRetries: number = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await executeWorkflow(workflow, params);
      if (result.success) return result;
    } catch (error) {
      if (i === maxRetries - 1) {
        // Last retry failed, use fallback workflow
        console.log('Primary workflow failed, using fallback');
        return await executeFallbackWorkflow(workflow, params);
      }
      // Exponential backoff
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

---

## Error Recovery

Advanced error handling patterns.

### Pattern: Graceful Degradation

```typescript
async function robustCodeReview(files: string[]) {
  const results = [];
  
  // Try parallel review (best quality)
  try {
    const review = await executeWorkflow('parallel-review', {
      files,
      focus: 'all'
    });
    return review;
  } catch (error) {
    console.log('Parallel review failed, falling back to single backend');
  }
  
  // Fallback: Single backend review
  try {
    const geminiReview = await executeAI('gemini', {
      prompt: `Review ${files.join(', ')}`,
      model: 'gemini-2.5-pro'
    });
    return geminiReview;
  } catch (error) {
    console.log('Gemini failed, trying Qwen');
  }
  
  // Last resort: Qwen only
  return await executeAI('qwen', {
    prompt: `Quick review of ${files.join(', ')}`,
    model: 'qwen3-coder-turbo'
  });
}
```

### Pattern: Partial Results

Return what succeeded:

```typescript
async function analyzeMultipleFiles(files: string[]) {
  const results = await Promise.allSettled(
    files.map(file => analyzeFile(file))
  );
  
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  
  const failed = results
    .filter(r => r.status === 'rejected')
    .map((r, i) => ({ file: files[i], error: r.reason }));
  
  return {
    successful,
    failed,
    successRate: successful.length / files.length
  };
}
```

### Pattern: Circuit Breaker

Prevent cascading failures:

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async execute(fn: Function) {
    if (this.state === 'open') {
      // Check if cool-down period passed
      if (Date.now() - this.lastFailTime > 60000) {  // 1 minute
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailTime = Date.now();
      
      if (this.failures >= 5) {
        this.state = 'open';
      }
      
      throw error;
    }
  }
}

// Usage
const breaker = new CircuitBreaker();
await breaker.execute(() => executeWorkflow('parallel-review', params));
```

---

## Performance Tuning

Optimize workflow execution for your specific needs.

### Pattern: Lazy Loading

Load resources only when needed:

```typescript
class LazyWorkflowContext {
  private _git: GitHelper | null = null;
  private _ai: AIExecutor | null = null;
  
  get git() {
    if (!this._git) {
      this._git = new GitHelper();
    }
    return this._git;
  }
  
  get ai() {
    if (!this._ai) {
      this._ai = new AIExecutor();
    }
    return this._ai;
  }
}
```

### Pattern: Batch Processing

Process items in optimal batch sizes:

```typescript
async function analyzeLargeCodebase(files: string[]) {
  const BATCH_SIZE = 10;  // Optimal for context window
  const results = [];
  
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    
    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(file => analyzeFile(file))
    );
    
    results.push(...batchResults);
    
    // Optional: Progress reporting
    console.log(`Processed ${i + batch.length}/${files.length} files`);
  }
  
  return results;
}
```

### Pattern: Streaming Results

For long-running operations:

```typescript
async function* streamingAnalysis(files: string[]) {
  for (const file of files) {
    const result = await analyzeFile(file);
    yield result;  // Emit as soon as available
  }
}

// Usage
for await (const result of streamingAnalysis(files)) {
  console.log('Got result:', result);
  // Process incrementally
}
```

### Pattern: Memoization

Cache expensive computations:

```typescript
const memo = new Map();

async function memoizedAnalysis(file: string) {
  const key = `analysis:${file}`;
  
  if (memo.has(key)) {
    return memo.get(key);
  }
  
  const result = await expensiveAnalysis(file);
  memo.set(key, result);
  
  return result;
}
```

---

## See Also

- [Architecture Overview](../ARCHITECTURE.md) - System design
- [Workflows Guide](../WORKFLOWS.md) - Workflow documentation
- [Integrations Guide](../INTEGRATIONS.md) - MCP servers and integrations
- [API Reference](../reference/) - Complete API specifications
