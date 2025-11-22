import { CommandResult } from './commands/types';
import { featureDesignWorkflow } from '../../src/workflows/feature-design.workflow.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function executeCreateSpec(params: string[]): Promise<CommandResult> {
  try {
    if (params.length === 0) {
      return {
        success: false,
        output: '',
        error: 'Descrizione feature richiesta. Uso: /create-spec "descrizione feature" [opzioni]'
      };
    }

    const options = parseOptions(params);
    const featureDescription = extractFeatureDescription(params);

    if (!featureDescription) {
      return {
        success: false,
        output: '',
        error: 'Descrizione feature non valida. Racchiudila tra virgolette.'
      };
    }

    let output = `# Creazione Specifiche Feature\n\n`;
    output += `**Feature:** ${featureDescription}\n\n`;

    // Generate spec template based on type
    const template = getSpecTemplate(options.template || 'full');

    // Fill template with feature description
    const specContent = populateTemplate(template, {
      featureDescription,
      timestamp: new Date().toISOString(),
      author: 'Claude Code Assistant'
    });

    // Optional: Run feature-design workflow for architectural analysis
    if (options.withDesign) {
      output += '## Analisi Architetturale\n';
      try {
        const designResult = await runFeatureDesign(featureDescription);
        output += `${designResult}\n\n`;
      } catch (error) {
        output += `⚠️ Analisi architetturale fallita: ${error instanceof Error ? error.message : String(error)}\n\n`;
      }
    }

    // Determine output path
    const filename = generateSpecFilename(featureDescription);
    const outputPath = options.output || path.join(process.cwd(), 'docs', 'specs', `${filename}.md`);

    // Save spec file
    output += `## Salvataggio Specifiche\n`;
    try {
      await saveSpecFile(outputPath, specContent);
      output += `✅ Specifiche salvate in: \`${outputPath}\`\n\n`;

      // Show preview
      output += `## Preview Specifiche\n\n`;
      output += '```markdown\n';
      output += specContent.split('\n').slice(0, 20).join('\n'); // First 20 lines
      output += '\n...\n```\n\n';

      output += `**File completo:** ${outputPath}\n`;

    } catch (error) {
      return {
        success: false,
        output,
        error: `Errore durante il salvataggio: ${error instanceof Error ? error.message : String(error)}`
      };
    }

    return {
      success: true,
      output
    };

  } catch (error) {
    return {
      success: false,
      output: '',
      error: `Errore durante la creazione delle specifiche: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

function parseOptions(params: string[]) {
  return {
    template: extractOptionValue(params, '--template'),
    withDesign: params.includes('--with-design'),
    output: extractOptionValue(params, '--output')
  };
}

function extractFeatureDescription(params: string[]): string | null {
  // Find the first quoted string
  const descriptionMatch = params.join(' ').match(/"([^"]+)"/);
  return descriptionMatch ? descriptionMatch[1] : null;
}

function extractOptionValue(params: string[], option: string): string | undefined {
  const optionIndex = params.indexOf(option);
  if (optionIndex !== -1 && optionIndex + 1 < params.length) {
    const value = params[optionIndex + 1];
    const match = value.match(/"([^"]+)"/);
    return match ? match[1] : value;
  }
  return undefined;
}

function getSpecTemplate(type: string): string {
  const templates: Record<string, string> = {
    api: `# API Specification: {featureDescription}

## Overview
**Data:** {timestamp}
**Author:** {author}

### Description
{featureDescription}

## API Endpoints

### [METHOD] /api/path
**Description:** Brief endpoint description

**Request:**
\`\`\`json
{
  "param1": "value1",
  "param2": "value2"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {}
}
\`\`\`

## Implementation Notes
- [ ] Input validation
- [ ] Error handling
- [ ] Authentication/Authorization
- [ ] Rate limiting
- [ ] Documentation
`,

    ui: `# UI Specification: {featureDescription}

## Overview
**Data:** {timestamp}
**Author:** {author}

### Description
{featureDescription}

## User Stories
- As a user, I want to... so that...

## Wireframes/Mockups
[Insert mockups here]

## Components Required
- [ ] Component1
- [ ] Component2
- [ ] Component3

## Interactions
- [ ] Click handler for...
- [ ] Form validation for...
- [ ] State management for...

## Implementation Notes
- [ ] Responsive design
- [ ] Accessibility (WCAG 2.1)
- [ ] Loading states
- [ ] Error states
- [ ] Mobile optimization
`,

    db: `# Database Specification: {featureDescription}

## Overview
**Data:** {timestamp}
**Author:** {author}

### Description
{featureDescription}

## Schema Changes

### New Tables
\`\`\`sql
CREATE TABLE table_name (
  id SERIAL PRIMARY KEY,
  column1 VARCHAR(255) NOT NULL,
  column2 INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Modified Tables
- table_name: [changes]

## Indexes Required
- [ ] Index on column_name for performance

## Migrations
- [ ] Up migration script
- [ ] Down migration script
- [ ] Data seeding if needed

## Implementation Notes
- [ ] Foreign key constraints
- [ ] Data validation
- [ ] Performance considerations
- [ ] Backup strategy
`,

    full: `# Feature Specification: {featureDescription}

## Overview
**Data:** {timestamp}
**Author:** {author}

### Description
{featureDescription}

## Requirements

### Functional Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Non-Functional Requirements
- [ ] Performance: < 2s response time
- [ ] Security: Input validation and sanitization
- [ ] Scalability: Handle X concurrent users
- [ ] Accessibility: WCAG 2.1 AA compliance

## Architecture

### High-Level Design
[Architecture diagram or description]

### Components
- **Frontend:** [Tech stack, components]
- **Backend:** [Tech stack, APIs]
- **Database:** [Schema changes, migrations]

## API Specification

### Endpoints
- \`GET /api/feature\` - Get feature data
- \`POST /api/feature\` - Create feature item
- \`PUT /api/feature/:id\` - Update feature item
- \`DELETE /api/feature/:id\` - Delete feature item

## UI/UX Specification

### User Flows
1. User navigates to feature page
2. User performs action
3. System responds with result

### Wireframes
[Insert wireframes here]

## Testing Strategy

### Unit Tests
- [ ] Component rendering
- [ ] API integration
- [ ] Business logic

### Integration Tests
- [ ] End-to-end user flows
- [ ] API contract testing

### E2E Tests
- [ ] Critical user journeys

## Implementation Plan

### Phase 1: Core Implementation
- [ ] Backend API development
- [ ] Database schema
- [ ] Basic UI components

### Phase 2: Enhancement
- [ ] Advanced features
- [ ] Optimization
- [ ] Testing

### Phase 3: Polish
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Documentation

## Success Criteria
- [ ] All requirements implemented
- [ ] Tests passing (> 80% coverage)
- [ ] Performance benchmarks met
- [ ] Security review passed
- [ ] User acceptance testing passed

## Open Questions
- Question 1?
- Question 2?
`
  };

  return templates[type] || templates.full;
}

function populateTemplate(template: string, data: Record<string, string>): string {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  return result;
}

function generateSpecFilename(description: string): string {
  return description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

async function runFeatureDesign(description: string): Promise<string> {
  // Run feature-design workflow
  return await featureDesignWorkflow.execute({
    featureDescription: description,
    targetFiles: [], // Will be determined by the workflow
    architecturalFocus: 'design',
    implementationApproach: 'incremental'
  });
}

async function saveSpecFile(filePath: string, content: string): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  // Write file
  await fs.writeFile(filePath, content, 'utf-8');
}
