# SSOT Taxonomy & Naming Conventions

This reference defines the standard naming conventions and categorization hierarchy for Serena memories and SSOT documentation.

## Naming Convention

All memory files must follow the pattern:
`[category]_[domain]_[subdomain]_[date].md`

### Components

- **category**: The type of document (see Category Prefixes below)
- **domain**: The primary system or area (e.g., `analytics`, `infra`, `data`)
- **subdomain**: The specific component or topic (e.g., `volatility`, `docker_ops`)
- **date**: ISO date (YYYY-MM-DD) or Year-Month (YYYY-MM) for broader documents

### Category Prefixes

| Category | Prefix | Purpose | Example |
|----------|--------|---------|---------|
| **SSOT** | `ssot_` | Single Source of Truth for a component/system | `ssot_analytics_stir_2026-01-14.md` |
| **Pattern** | `pattern_` | Reusable design pattern or standard | `pattern_refactoring_security_2025-12.md` |
| **Plan** | `plan_` | Implementation plan or roadmap | `plan_implementation_curve_feed.md` |
| **Reference** | `reference_` | Look-up tables, cheat sheets, API docs | `reference_database_query_patterns.md` |
| **Troubleshoot** | `troubleshoot_` | Guide for resolving specific issues | `troubleshoot_docker_port_config_2025-12-08.md` |
| **Archive** | `archive_` | Deprecated documentation (kept for history) | `archive_ssot_meta_project_overview_2025-12-08.md` |

## Domain Hierarchy

Use these standard domains to group documentation:

### Analytics (`analytics_*`)
- `volatility`: Volatility surface and modeling
- `curve`: Yield curve construction
- `stir`: Short Term Interest Rates
- `reporting`: End-of-day and ad-hoc reporting
- `correlation`: Asset correlation matrices
- `amt`: Automated Market Trading components
- `path`: Path-dependent option pricing
- `snapshot_feed`: Real-time data snapshots

### Data (`data_*`)
- `config`: Instrument and system configuration
- `ingestion_reliability`: Data pipeline health and monitoring
- `ingestion_sr3`: SR3 specific ingestion
- `ingestion_tick`: Tick data capture

### Infrastructure (`infra_*`)
- `docker_ops`: Container orchestration and operations
- `security_migrations`: Security updates and user migration
- `mcp_server`: Model Context Protocol server configuration
- `api_architecture`: FastAPI/Backend architecture

### Meta (`meta_*`)
- `update_guidelines`: Documentation standards (this document)
- `project_overview`: High-level project goals and status
- `project_structure`: Codebase organization

### Testing (`testing_*`)
- `qa`: Quality Assurance processes
- `integration`: Integration test patterns

## Tagging Strategy

Use the `domain` frontmatter field (array) for cross-cutting concerns.

**Common Tags:**
- `fastapi`
- `docker`
- `security`
- `performance`
- `database`
- `refactoring`
- `deprecation`

## Directory Structure

While all memories currently reside in a flat structure in `.serena/memories/`, the naming convention allows for virtual folder organization.

Future agents may implement physical subdirectories if the flat list exceeds manageable limits (e.g., >200 active SSOTs).
