---
description: Generate structured specification documents for new features
argument-hint: "feature description" [--template api|ui|db|full] [--with-design] [--output path]
allowed-tools: mcp__unitAI__workflow_feature_design, Write, Read, Bash(mkdir:*)
---

Generate structured specification documents for new features with optional architectural analysis.

**Arguments:** $ARGUMENTS

Extract from arguments:
- **Feature description**: The quoted string (required)
- **--template**: Spec template type (api, ui, db, full) - default: full
- **--with-design**: Run feature-design workflow for AI architectural analysis
- **--output**: Custom output path for the spec file

## Instructions

### Step 1: Parse Feature Description

Extract the quoted feature description from arguments. This is the main input for spec generation.

### Step 2: Generate Spec Content

Based on the template type, create a specification document:

**Template: api**
- API endpoints specification
- Request/response schemas
- Authentication requirements
- Error handling

**Template: ui**
- User stories
- Component hierarchy
- Interaction flows
- Accessibility requirements

**Template: db**
- Schema design
- Table definitions
- Index strategy
- Migration plan

**Template: full** (default)
- All of the above combined
- Requirements (functional + non-functional)
- Architecture overview
- Testing strategy
- Implementation phases

### Step 3: Run Architectural Analysis (if --with-design)

If --with-design flag is present:
1. Use `mcp__unitAI__workflow_feature_design` with:
   - `featureDescription`: the parsed description
   - `targetFiles`: [] (workflow will determine)
   - `architecturalFocus`: "design"
   - `implementationApproach`: "incremental"
2. Include the analysis results in the spec document

### Step 4: Save Spec File

1. Generate filename from feature description (slugified, max 50 chars)
2. Determine output path:
   - If --output provided: use that path
   - Default: `docs/specs/[filename].md`
3. Create directory if needed
4. Write the spec file using the Write tool

### Step 5: Report Result

Output:
- Confirmation of spec creation
- Full path to the created file
- Preview of first 20 lines
- Suggested next steps (review, refine, implement)

## Example Usage
- `/create-spec "User authentication with OAuth2"`
- `/create-spec "Shopping cart functionality" --template ui`
- `/create-spec "Analytics database schema" --template db --with-design`
