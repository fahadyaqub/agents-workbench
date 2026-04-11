# Agents Workbench Bootstrap

This file is the tracked bootstrap for Agents Workbench.
In a real workspace, the parent `AGENTS.md` should point to this file.

Use `AGENTS.md` as the canonical agent instructions file.
Project-level `AGENTS.md` files remain authoritative for project-specific context and constraints.

## Load Order

1. Read `shared/manifest.md`
2. Read `local/setup.toml` if it exists
3. If local setup is incomplete, follow `shared/workflows/bootstrap.md`
4. Read these local overlays if they exist:
   - `local/who-i-am.md`
   - `local/personal-memory.md`
5. Infer the relevant domain and workflow from the user's request and load matching files from:
   - `shared/domains/`
   - `shared/workflows/`
6. If the current project has its own `AGENTS.md`, treat that file as the project-specific overlay

## Priority

When multiple instructions apply, use this priority order:
1. Explicit user request
2. Project-level `AGENTS.md`
3. Matching shared domain and workflow docs
4. Shared core docs
5. Local overlays

## Canonical Files

Within projects, prefer one shared agent instructions file:
- `AGENTS.md` is the canonical file
- `CLAUDE.md` and `CODEX.md` should be compatibility stubs that point to `AGENTS.md`
- Do not keep separate conflicting instructions across these files
