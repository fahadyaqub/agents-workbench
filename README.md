# Agents Workbench

Agents Workbench is a reusable operating layer for AI agents across projects, teams, and workflows.

It packages:
- shared core instructions
- domain files
- workflow files
- shared memory
- project templates
- setup and bootstrap guidance

## Repository Layout

- `AGENTS.md` is the root bootstrap entrypoint
- `CLAUDE.md` and `CODEX.md` are compatibility stubs that point to `AGENTS.md`
- `AGENTS/shared/` contains the shared system
- `AGENTS/templates/` contains starter files for local setup and project bootstrap
- `AGENTS/local/` is reserved for per-user local files and is intentionally not committed

## Shared Areas

- `AGENTS/shared/core/` holds general behavior, communication, and permission rules
- `AGENTS/shared/domains/` holds domain-specific operating modes
- `AGENTS/shared/workflows/` holds reusable task workflows
- `AGENTS/shared/memory/` holds durable shared memory

## Local Files

Users should create their own local files in `AGENTS/local/`, such as:
- `setup.toml`
- `who-i-am.md`
- `personal-memory.md`

These should not be committed to the shared repo.

## Canonical File Policy

Within projects, prefer:
- `AGENTS.md` as the single source of truth
- `CLAUDE.md` as a compatibility stub
- `CODEX.md` as a compatibility stub

If agent-specific files contain meaningful instructions, merge that guidance into `AGENTS.md` first, then replace them with stubs.
