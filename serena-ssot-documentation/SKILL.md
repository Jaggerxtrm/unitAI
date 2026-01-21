---
name: Serena SSOT Documentation
description: This skill should be used when the user asks to "update SSOT", "create memory", "document this", "validate SSOT", "check metadata", or "list memories". It helps maintain the Single Source of Truth documentation system.
version: 1.0.0
---

# Serena SSOT Documentation Skill

This skill provides workflows and tools for maintaining the Serena Single Source of Truth (SSOT) documentation system/memories.

## Core Capabilities

1. **Create Memories**: Generate new SSOT documents with correct metadata and structure.
2. **Update Memories**: Bump versions and maintain changelogs.
3. **Validate Compliance**: Ensure files follow naming conventions and metadata schemas.
4. **Navigate**: List and find memories by category.

## When to Use This Skill

- User asks to "create a new memory" or "document this feature".
- User asks to "update the SSOT" or "bump version".
- User asks to "validate my documentation" or "check frontmatter".
- User asks to "list all SSOTs" or "show me the patterns".

## Workflows

### 1. Creating a New Memory

To create a new documentation file:

1. **Choose a Category**:
   - `ssot`: For system components (Single Source of Truth)
   - `pattern`: For reusable design patterns
   - `plan`: For implementation plans
   - `reference`: For cheat sheets and API docs

2. **Generate Template**:
   Use the `generate_template.py` script to create a file with the correct boilerplate.

   ```bash
   # Example: Create a new SSOT
   python3 scripts/generate_template.py ssot ssot_analytics_newcomponent_2026-01-20.md \
     title="New Component SSOT" domain="analytics"
   ```

3. **Fill Content**:
   Edit the generated markdown file to add your content.

### 2. Updating an Existing Memory

When modifying an existing memory:

1. **Edit Content**: Make your changes to the markdown body.
2. **Bump Version**: Use the `bump_version.sh` helper to determine the next version.

   ```bash
   # Check current version
   grep "version:" my_file.md

   # Calculate next version
   bash scripts/bump_version.sh 1.0.0 patch
   ```

3. **Update Frontmatter**:
   - Update `version` field
   - Update `updated` timestamp
   - Add entry to `changelog`

### 3. Validating Compliance

Ensure your files meet the standards:

```bash
# Validate a specific file
python3 scripts/validate_metadata.py my_file.md
```

### 4. Listing Memories

Find memories by category:

```bash
# List all SSOTs
bash scripts/list_by_category.sh ssot

# List all Patterns
bash scripts/list_by_category.sh pattern
```

## Naming Conventions

Files must follow: `[category]_[domain]_[subdomain]_[date].md`

- **ssot**: `ssot_analytics_volatility_2026-01-14.md`
- **pattern**: `pattern_refactoring_security_2025-12.md`
- **plan**: `plan_implementation_feature.md`

See `references/taxonomy.md` for full details.

## Additional Resources

### Reference Files
- **`references/taxonomy.md`**: Detailed naming conventions and domain hierarchy.
- **`references/metadata-schema.md`**: Required YAML frontmatter fields.
- **`references/versioning-rules.md`**: Semantic versioning guidelines.

### Examples
- **`examples/example_ssot_analytics.md`**: Complete SSOT example.
- **`examples/example_pattern.md`**: Design pattern example.
- **`examples/example_reference.md`**: Reference doc example.

### Scripts
- **`scripts/generate_template.py`**: Template generator.
- **`scripts/validate_metadata.py`**: Metadata validator.
- **`scripts/bump_version.sh`**: Version bumping utility.
- **`scripts/list_by_category.sh`**: Category listing utility.
