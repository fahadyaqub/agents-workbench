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

- `AGENTS.md` is the tracked bootstrap entrypoint inside this repo
- teammates clone this repo into their main workspace, typically as `work/agents-workbench`
- setup then creates parent-level pointer files in the workspace root
- `CLAUDE.md` and `CODEX.md` are compatibility stubs
- `shared/` contains the shared system
- `templates/` contains starter files for local setup and project bootstrap
- `local/` is reserved for per-user local files and is intentionally not committed

## Teammate Setup

Clone the repo into the workspace root:

```sh
git clone <repo-url> ~/work/agents-workbench
```

Then ask an agent to:

```text
setup the workbench in ~/work
```

That setup should:
- create `~/work/AGENTS.md` as a pointer to `~/work/agents-workbench/AGENTS.md`
- create `~/work/CLAUDE.md` as a pointer to `~/work/agents-workbench/CLAUDE.md`
- create `~/work/CODEX.md` as a pointer to `~/work/agents-workbench/CODEX.md`
- initialize `~/work/agents-workbench/local/` from templates if needed

## Shared Areas

- `shared/core/` holds general behavior, communication, and permission rules
- `shared/domains/` holds domain-specific operating modes
- `shared/workflows/` holds reusable task workflows
- `shared/memory/` holds durable shared memory

## Local Files

Users should create their own local files in `local/`, such as:
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
