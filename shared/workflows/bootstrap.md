# Workflow: Bootstrap

Use this workflow to initialize and maintain the workspace-level agent system.

## Goals

- Ensure the workspace root has parent-level pointer files into `agents-workbench/`
- Set up personal local overlays
- Detect missing project-level agent entrypoints
- Preserve existing project agent and workflow docs
- Standardize on `AGENTS.md` as the canonical instructions file where appropriate

## Local Setup

1. Ensure the workspace root contains these pointer files:
   - `AGENTS.md` -> points to `agents-workbench/AGENTS.md`
   - `CLAUDE.md` -> points to `agents-workbench/AGENTS.md`
   - `CODEX.md` -> points to `agents-workbench/AGENTS.md`
2. If `local/setup.toml` is missing, initialize:
   - `local/setup.toml`
   - `local/who-i-am.md`
   - `local/personal-memory.md`
3. If `who_i_am.status` is `pending`, ask the user to complete or ignore it
4. If `project_bootstrap.status` is `pending`, inspect immediate child folders of the workspace root
5. If `unified_agent_entrypoint.status` is `pending`, inspect `AGENTS.md`, `CLAUDE.md`, and `CODEX.md` usage in each project

Recommended setup prompts:
- For personal profile: `Set up your local "who I am" profile now, or ignore it for now?`
- For workspace pointers: `Create the parent AGENTS.md, CLAUDE.md, and CODEX.md pointer files for this workspace now?`
- For missing project entrypoints: `Some projects in this workspace are missing AGENTS.md. Do you want to add a project-level AGENTS.md entrypoint where missing?`
- For unified project files: `Make AGENTS.md the single source of truth in this project? I can merge useful content from CLAUDE.md and CODEX.md into it, then replace those files with short pointers.`

## Project Scan Rules

When scanning projects in the workspace root:
- First classify each immediate child folder as either:
  - a direct project repository
  - a project group folder that contains multiple project repositories
  - a non-project folder that should be ignored
- For direct project repositories:
  - Check for existing `AGENTS.md`
  - Check for existing `CLAUDE.md` and `CODEX.md`
  - Check for relevant workflow or instruction docs already present
- For project group folders:
  - Scan one level deeper for likely project repositories
  - Apply the same checks to each nested project repository
- Never overwrite existing docs blindly

Suggested signals for detecting a project repository:
- `.git/`
- `package.json`
- `pyproject.toml`
- `Cargo.toml`
- `go.mod`
- `README.md` plus clear source directories
- existing `AGENTS.md`, `CLAUDE.md`, or `CODEX.md`

Suggested signals for detecting a project group folder:
- contains multiple subfolders that each look like project repositories
- top-level folder appears organizational rather than a single runnable repo
- may contain a mix of docs, infra, and multiple app or service folders

## Merge Policy

- Existing project `AGENTS.md` files are authoritative for project-specific context
- Preserve all useful content from existing `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, and workflow docs
- If a project already has strong instructions, add only missing integration notes
- If files conflict, stop and ask the user before changing them
- Prefer additive sections and compatibility stubs over rewrites

## Canonical File Policy

The preferred standard inside projects is:
- `AGENTS.md` is the canonical instructions file
- `CLAUDE.md` is a short compatibility stub that points to `AGENTS.md`
- `CODEX.md` is a short compatibility stub that points to `AGENTS.md`

If `CLAUDE.md` or `CODEX.md` contain meaningful instructions:
1. Merge unique, useful content into `AGENTS.md`
2. Preserve the project's intent and wording where possible
3. Replace the agent-specific file with a short pointer stub only after migration is complete

## Completion Rules

- Once a setup item is marked `complete` or `ignored`, stop prompting for it
- Do not rescan all projects on every run after `project_bootstrap` has been resolved
- If the user later wants to revisit setup, they can reset the relevant status in `local/setup.toml`

## Nested Workspace Rule

Support nested repositories inside project group folders, but keep the scan bounded.

- Default scan depth:
  - workspace root direct children
  - one nested level inside folders identified as project groups
- Do not recurse indefinitely by default
- If the workspace contains unusually deep nesting, ask the user before broadening the scan
