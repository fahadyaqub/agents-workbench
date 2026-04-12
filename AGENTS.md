# Agents Workbench Bootstrap

This file is the tracked bootstrap for Agents Workbench.
In a real workspace, the parent `AGENTS.md` should point to this file.

Use `AGENTS.md` as the canonical agent instructions file.
Project-level `AGENTS.md` files remain authoritative for project-specific context and constraints.

## Mandatory First Action — Before Your First Reply

Complete these steps before writing any response or starting any task:

If you were sent here by a workspace pointer or compatibility stub, do not stop at the redirect.
Treat this file as active instructions and immediately inspect `local/setup.toml`.

If `local/setup.toml` is missing, or any setup item is marked `pending`, pause normal task work and follow `shared/workflows/bootstrap.md` before continuing.

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

## Protected Branches

Protected branches are not defined locally for the `agents-workbench` repository. Workspace defaults apply: `main`, `master`, `production`, `prod`, `release`, and any branch starting with `rd`.

## Memory

Durable knowledge belongs in `shared/memory/`, not in per-agent memory tools.

Per-agent memory (e.g. Claude's native memory, Cursor's memory file) is siloed to one tool. `shared/memory/` is read by every agent that loads this workbench — it is the only memory that is truly shared.

- `shared/memory/global-memory.md` — broad principles and confirmed behaviors that apply across all domains and projects
- `shared/memory/decisions.md` — specific team-level decisions: what changed, why, and what agents should do differently as a result

When you learn something durable during a task — a principle that should apply everywhere, a decision that was made and should not be re-litigated — write it to the appropriate file in `shared/memory/` before the session ends.

Do not write to per-agent memory for anything that other agents or team members should also know.

## Project Refresh Rule

This rule applies only when a task makes a material change to:
- `shared/manifest.md`
- `shared/workflows/bootstrap.md`
- `shared/workflows/new-project.md`

If any of those files change, before ending the task, re-check all managed projects in `local/setup.toml` and make sure they still satisfy the current project-level requirements defined by `shared/workflows/bootstrap.md` and `shared/workflows/new-project.md`.

If any managed project is out of sync with those current instructions, update it before finishing the task.
