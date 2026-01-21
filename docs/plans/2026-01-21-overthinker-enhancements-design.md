# Overthinker Workflow Enhancements Design

**Version:** 1.0
**Created:** 2026-01-21
**Status:** Approved for Implementation

## Executive Summary

This design enhances the Overthinker workflow with an interactive approval system, structured file management, skill-based triggering, and user validation checkpoints. The enhancements make the workflow more collaborative and production-ready by allowing users to validate key decisions and manage approved plans systematically.

## Overview

The enhanced Overthinker workflow adds three key capabilities:

1. **Approval & File Management System**: Draft outputs transition to approved plans with proper status tracking
2. **Skill Integration**: Both slash command and auto-trigger patterns for seamless invocation
3. **Interactive Validation**: AskUserQuestion integration at critical decision points

## Architecture

### Workflow Lifecycle

```
User Input
    ↓
Phase 1: Prompt Refiner (existing)
    ↓
Phase 1.5: Master Prompt Validation (NEW)
    ↓
Phase 2: Initial Reasoning (existing)
    ↓
Phase 3: Review Iterations (existing)
    ↓
Phase 4: Consolidation (existing)
    ↓
Phase 5: Approval & File Management (NEW)
    ↓
Approved Plan in .unitai/plans/
```

### File Structure

```
.unitai/
├── overthinking-{timestamp}.md          # Draft outputs (status: draft)
├── plans/                               # Approved plans directory
│   └── overthinking-{timestamp}.md      # Approved plans (status: approved)
└── rejected/                            # Optional: rejected plans
    └── overthinking-{timestamp}.md      # Rejected plans (status: rejected)
```

### Frontmatter Schema

All overthinking output files will include YAML frontmatter:

```yaml
---
status: draft | approved | rejected
title: <derived from initial prompt>
created: <ISO 8601 timestamp>
approved: <ISO 8601 timestamp or null>
iterations: <number of review cycles>
model: <backend used (e.g., "gemini")>
initial_prompt: <original user request>
context_files: [<array of file paths used as context>]
---
```

**Field Descriptions:**
- `status`: Current state of the plan (draft/approved/rejected)
- `title`: Human-readable title derived from initial prompt
- `created`: When the overthinking workflow started
- `approved`: When the plan was approved (null if not approved)
- `iterations`: Number of review cycles completed
- `model`: AI backend used for reasoning
- `initial_prompt`: Original user request for traceability
- `context_files`: Files included as context during reasoning

## Component Design

### 1. Enhanced Overthinker Workflow

**File:** `src/workflows/overthinker.workflow.ts`

**New Phases:**

#### Phase 1.5: Master Prompt Validation

After Phase 1 (Prompt Refiner), present the master prompt to the user:

```typescript
const validation = await AskUserQuestion({
  questions: [{
    header: "Master Prompt",
    question: "Does this refined master prompt capture your intent correctly?",
    multiSelect: false,
    options: [
      {
        label: "Looks good, proceed",
        description: "The master prompt accurately captures the requirements. Continue with reasoning phases."
      },
      {
        label: "Needs adjustment",
        description: "I'll provide feedback to refine the master prompt before continuing."
      },
      {
        label: "Start over",
        description: "Discard this master prompt and regenerate from scratch with new guidance."
      }
    ]
  }]
});
```

**Behavior:**
- "Looks good, proceed" → Continue to Phase 2
- "Needs adjustment" → Accept user feedback, regenerate master prompt with feedback incorporated
- "Start over" → Restart Phase 1 with user providing new guidance

#### Phase 5: Approval & File Management

After Phase 4 (Consolidation), present the final document:

```typescript
const approval = await AskUserQuestion({
  questions: [{
    header: "Plan Approval",
    question: "How would you like to proceed with this overthinking output?",
    multiSelect: false,
    options: [
      {
        label: "Approve and save to plans",
        description: "Move to .unitai/plans/ with status: approved. Ready for implementation."
      },
      {
        label: "Request one more iteration",
        description: "Run one additional review cycle to refine specific aspects."
      },
      {
        label: "Save as draft only",
        description: "Keep in .unitai/ with status: draft for later review."
      },
      {
        label: "Discard",
        description: "Mark as rejected and don't save to plans directory."
      }
    ]
  }]
});
```

**Behavior:**
- "Approve and save to plans":
  1. Update frontmatter: `status: approved`, `approved: <timestamp>`
  2. Move file from `.unitai/` to `.unitai/plans/`
  3. Report success to user

- "Request one more iteration":
  1. Run one additional Phase 3 review cycle
  2. Re-run Phase 4 consolidation
  3. Present approval prompt again

- "Save as draft only":
  1. Keep file in `.unitai/` with `status: draft`
  2. User can manually review/approve later

- "Discard":
  1. Update frontmatter: `status: rejected`
  2. Optionally move to `.unitai/rejected/`
  3. Report to user

**File Operations:**

```typescript
// Generate frontmatter
function generateFrontmatter(params: {
  status: 'draft' | 'approved' | 'rejected';
  title: string;
  created: string;
  approved: string | null;
  iterations: number;
  model: string;
  initialPrompt: string;
  contextFiles: string[];
}): string {
  return `---
status: ${params.status}
title: "${params.title}"
created: "${params.created}"
approved: ${params.approved ? `"${params.approved}"` : 'null'}
iterations: ${params.iterations}
model: "${params.model}"
initial_prompt: "${params.initialPrompt}"
context_files: ${JSON.stringify(params.contextFiles)}
---

`;
}

// Move file from draft to approved
function approveAndMove(draftPath: string, planPath: string) {
  const content = readFileSync(draftPath, 'utf-8');
  const updatedContent = updateFrontmatter(content, {
    status: 'approved',
    approved: new Date().toISOString()
  });

  writeFileSync(planPath, updatedContent);
  unlinkSync(draftPath); // Remove draft
}
```

### 2. Skill Integration

#### Slash Command Skill

**File:** `.claude/plugins/unitai/commands/overthink.skill.md`

```markdown
---
name: overthink
description: Deep multi-agent reasoning for complex problems and design challenges
---

# Overthink - Deep Reasoning Workflow

Invoke the Overthinker workflow for complex problems that benefit from iterative multi-agent reasoning.

## When to Use

- Designing new features or systems
- Planning complex refactorings
- Solving architectural challenges
- Brainstorming solutions to open-ended problems

## Usage

/overthink <topic or question>

## Example

/overthink design a scalable API authentication system with OAuth2 and JWT support

## What Happens

1. Your prompt is refined into a master prompt
2. You validate the master prompt
3. Multiple AI agents reason, critique, and improve the solution
4. You approve the final plan
5. The approved plan is saved to .unitai/plans/
```

**Implementation:**

The skill invokes the unitAI MCP tool:

```typescript
await toolInvoke('mcp__unitAI__smart-workflows', {
  workflow: 'overthinker',
  params: {
    initialPrompt: args.trim(),
    iterations: 3,
    contextFiles: detectRelevantFiles() // Auto-detect from context
  }
});
```

#### Auto-Trigger Skill

**File:** `.claude/plugins/unitai/skills/deep-reasoning.skill.md`

```markdown
---
name: deep-reasoning
description: Automatically triggers Overthinker for deep reasoning requests
trigger_patterns:
  - "help me think through"
  - "I need to design"
  - "let's brainstorm"
  - "help me plan"
  - "I need a detailed approach for"
  - "walk me through designing"
auto_trigger: true
---

# Deep Reasoning Auto-Trigger

This skill automatically detects when the user needs deep, structured reasoning and invokes the Overthinker workflow.

## Trigger Patterns

The skill activates when user messages contain:
- "help me think through..."
- "I need to design..."
- "let's brainstorm..."
- "help me plan..."
- "I need a detailed approach for..."
- "walk me through designing..."

## Behavior

When triggered, the skill:
1. Extracts the core question/topic from the user's message
2. Detects relevant files from conversation context
3. Invokes the Overthinker workflow
4. Guides the user through validation and approval steps
```

**Implementation:**

```typescript
// Detect trigger patterns
const triggerPatterns = [
  /help me think through/i,
  /I need to design/i,
  /let's brainstorm/i,
  /help me plan/i,
  /I need a detailed approach for/i,
  /walk me through designing/i
];

function shouldTrigger(userMessage: string): boolean {
  return triggerPatterns.some(pattern => pattern.test(userMessage));
}

// Extract topic from user message
function extractTopic(userMessage: string): string {
  // Remove trigger phrases, extract core topic
  let topic = userMessage;
  for (const pattern of triggerPatterns) {
    topic = topic.replace(pattern, '').trim();
  }
  return topic;
}
```

### 3. Helper Functions

**File:** `src/workflows/overthinker-utils.ts`

```typescript
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

export interface OverthinkerFrontmatter {
  status: 'draft' | 'approved' | 'rejected';
  title: string;
  created: string;
  approved: string | null;
  iterations: number;
  model: string;
  initial_prompt: string;
  context_files: string[];
}

export function generateFrontmatter(meta: OverthinkerFrontmatter): string {
  return `---
status: ${meta.status}
title: "${meta.title}"
created: "${meta.created}"
approved: ${meta.approved ? `"${meta.approved}"` : 'null'}
iterations: ${meta.iterations}
model: "${meta.model}"
initial_prompt: "${meta.initial_prompt.replace(/"/g, '\\"')}"
context_files: ${JSON.stringify(meta.context_files)}
---

`;
}

export function updateFrontmatter(
  content: string,
  updates: Partial<OverthinkerFrontmatter>
): string {
  // Parse existing frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error('No frontmatter found in content');
  }

  // Parse YAML frontmatter (simple parsing for our use case)
  const existingMeta = parseYAMLFrontmatter(match[1]);
  const updatedMeta = { ...existingMeta, ...updates };

  // Replace frontmatter
  const newFrontmatter = generateFrontmatter(updatedMeta);
  const bodyContent = content.replace(frontmatterRegex, '');

  return newFrontmatter + bodyContent;
}

export function parseYAMLFrontmatter(yaml: string): OverthinkerFrontmatter {
  // Simple YAML parser for our specific frontmatter structure
  const lines = yaml.split('\n');
  const meta: any = {};

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (!key || !valueParts.length) continue;

    const value = valueParts.join(':').trim();
    const cleanKey = key.trim();

    if (value === 'null') {
      meta[cleanKey] = null;
    } else if (value.startsWith('"') && value.endsWith('"')) {
      meta[cleanKey] = value.slice(1, -1);
    } else if (value.startsWith('[')) {
      meta[cleanKey] = JSON.parse(value);
    } else if (!isNaN(Number(value))) {
      meta[cleanKey] = Number(value);
    } else {
      meta[cleanKey] = value;
    }
  }

  return meta as OverthinkerFrontmatter;
}

export function approveAndMovePlan(
  draftPath: string,
  plansDir: string
): string {
  const content = readFileSync(draftPath, 'utf-8');
  const timestamp = new Date().toISOString();

  const updatedContent = updateFrontmatter(content, {
    status: 'approved',
    approved: timestamp
  });

  const filename = basename(draftPath);
  const planPath = join(plansDir, filename);

  writeFileSync(planPath, updatedContent);
  unlinkSync(draftPath);

  return planPath;
}

export function deriveTitle(initialPrompt: string): string {
  // Create a title from the initial prompt
  // Capitalize first letter, limit length
  let title = initialPrompt.trim();

  if (title.length > 60) {
    title = title.slice(0, 57) + '...';
  }

  return title.charAt(0).toUpperCase() + title.slice(1);
}
```

## Implementation Steps

### Step 1: Add Helper Functions
- Create `src/workflows/overthinker-utils.ts`
- Implement frontmatter generation, parsing, and file operations
- Add unit tests for frontmatter utilities

### Step 2: Enhance Overthinker Workflow
- Modify `src/workflows/overthinker.workflow.ts`
- Add Phase 1.5: Master Prompt Validation with AskUserQuestion
- Add Phase 5: Approval & File Management with AskUserQuestion
- Integrate frontmatter generation in all file writes
- Add file movement logic for approval

### Step 3: Create Directory Structure
- Ensure `.unitai/plans/` directory exists
- Optionally create `.unitai/rejected/` directory
- Update `.gitignore` if needed

### Step 4: Create Slash Command Skill
- Create `.claude/plugins/unitai/commands/overthink.skill.md`
- Implement skill logic to invoke overthinker workflow
- Test slash command invocation

### Step 5: Create Auto-Trigger Skill
- Create `.claude/plugins/unitai/skills/deep-reasoning.skill.md`
- Implement pattern detection and topic extraction
- Test auto-trigger with various user messages

### Step 6: Update Documentation
- Update `docs/WORKFLOWS.md` with new Overthinker features
- Add examples of approval flow
- Document skill usage and trigger patterns

### Step 7: Testing & Validation
- Test full workflow with approval at each checkpoint
- Test "Request one more iteration" flow
- Test file movement and frontmatter updates
- Verify skill triggers work correctly

## Technical Considerations

### AskUserQuestion Integration

The workflow needs access to the AskUserQuestion function. This depends on the execution context:

**Option A: CLI Context**
- If running in Claude Code CLI, AskUserQuestion is available directly
- Use it as shown in the design

**Option B: MCP Tool Context**
- If running as MCP tool, need to pass interaction callback
- May need to surface questions through tool response format

**Recommendation:** Support both contexts by detecting execution environment and using appropriate interaction mechanism.

### Error Handling

- If user abandons during validation/approval, save current state as draft
- If AskUserQuestion fails, default to saving as draft
- Ensure file operations are atomic (write to temp, then move)

### Performance

- Master prompt validation is optional (can be disabled via parameter)
- Approval step is required unless `autoApprove: true` parameter is set
- Consider timeout for user responses (default: no timeout, wait indefinitely)

## Future Enhancements

### Phase 2: Enhanced Features
1. **Plan Management Commands**
   - `/list-plans` - List all approved plans
   - `/review-plan <name>` - Re-open a plan for editing
   - `/archive-plan <name>` - Move plan to archive

2. **Plan Templates**
   - Save approved plans as templates
   - Reuse successful reasoning patterns

3. **Collaboration Features**
   - Share plans with team members
   - Comment and feedback system

4. **Implementation Tracking**
   - Link plans to implementation branches
   - Track progress against approved plans

## Success Criteria

- Users can validate master prompt before reasoning begins
- Users can approve/reject/iterate on final overthinking output
- Approved plans are systematically organized in `.unitai/plans/`
- Frontmatter correctly tracks status, timestamps, and metadata
- Slash command `/overthink` works reliably
- Auto-trigger detects deep reasoning requests accurately
- Documentation clearly explains the enhanced workflow

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| AskUserQuestion not available in MCP context | Implement fallback to parameter-based configuration |
| User abandons workflow mid-execution | Always save intermediate state as draft |
| Frontmatter parsing breaks on edge cases | Use robust YAML parsing library (js-yaml) |
| File operations fail (permissions, disk space) | Comprehensive error handling and user notifications |
| Auto-trigger activates on false positives | Conservative trigger patterns, easy to disable |

## Conclusion

These enhancements transform the Overthinker workflow from a fully autonomous process into a collaborative, interactive reasoning tool. Users gain control over critical decision points while maintaining the power of multi-agent reasoning. The skill integration makes the workflow accessible and the file management system ensures approved plans are well-organized for future reference and implementation.
