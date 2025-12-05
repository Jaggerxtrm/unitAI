---
name: slash-create-spec
description: Use /create-spec to generate structured specification documents for new features, including API, UI, and database designs with optional architectural analysis.
---

# Slash Create Spec Skill

## Purpose

Automates the creation of comprehensive specification documents for new features, ensuring consistent documentation standards and reducing specification writing time from hours to minutes.

## When to Use

Activates when users need to:
- Document new feature requirements
- Create API specifications
- Design UI components
- Plan database schema changes
- Generate implementation roadmaps

## Command Usage

```bash
/create-spec "feature description" [options]
```

### Options
- `--template "type"`: Specification template (api, ui, db, full)
- `--with-design`: Include architectural analysis via feature-design workflow
- `--output "path"`: Custom output path (default: docs/specs/)

## Available Templates

### API Template (`--template api`)
- Endpoint definitions
- Request/response schemas
- Authentication requirements
- Error handling specifications

### UI Template (`--template ui`)
- User story definitions
- Component hierarchies
- Interaction patterns
- Responsive design requirements

### Database Template (`--template db`)
- Schema definitions
- Migration scripts
- Index requirements
- Data validation rules

### Full Template (`--template full`) - Default
- Complete feature specification
- Requirements (functional + non-functional)
- Architecture overview
- API + UI + DB specifications
- Testing strategy
- Implementation roadmap

## Example Usage

```bash
/create-spec "Add user authentication with OAuth"
/create-spec "Implement payment processing" --template api --with-design
/create-spec "Design admin dashboard" --template ui --output "docs/features/"
```

## Generated Content Structure

### Header Information
- Creation date and author
- Feature description
- Complexity assessment

### Requirements Section
- Functional requirements checklist
- Non-functional requirements (performance, security, etc.)
- Acceptance criteria

### Technical Specifications
- Architecture diagrams (text-based)
- Component breakdown
- Integration points

### Implementation Plan
- Phase-based approach
- Success criteria
- Risk mitigation strategies

## Architectural Analysis Integration

When `--with-design` is used:
- Executes `feature-design` workflow
- Includes AI-generated architectural recommendations
- Provides implementation complexity assessment
- Suggests technology choices and patterns

## File Organization

Generated files follow naming convention:
```
docs/specs/YYYY-MM-DD-feature-name.md
```

Example: `docs/specs/2025-11-19-add-user-authentication.md`

## Quality Assurance

- **Template Validation**: Ensures all required sections are populated
- **Path Safety**: Validates output directories exist
- **Content Completeness**: Checks for mandatory fields based on template type

## Integration Points

- **Workflows**: Optional `feature-design` workflow integration
- **File System**: Direct file creation in project structure
- **Templates**: Configurable specification templates

## Success Metrics

- **Creation Speed**: Specifications generated in <2 minutes vs hours manually
- **Completeness**: 100% of template sections populated
- **Consistency**: Standardized format across all specifications
- **Usability**: 90%+ specifications approved without major revisions

---

**Skill Status**: Active
**Templates**: 4 specification types
**Integration**: File system + optional AI design workflow
