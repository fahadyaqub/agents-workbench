# Workflow: New Project

**Roles**: Fullstack Developer · IT Architect · Product Manager

**This workflow covers**: Setting up agent-friendly structure for a new or existing project being added to the workspace.
**This workflow does NOT cover**: Initializing the workspace itself (use `bootstrap.md`), planning what to build (use `feature-planning.md`).

---

## Trigger Phrases

- "set up this project"
- "add [project] to the workspace"
- "initialize agent files for [project]"
- "bootstrap [project]"
- "this project is missing AGENTS.md"

---

## Prime Directive

**Never overwrite existing project docs without reading them first.**

Existing `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, and workflow files may contain decisions, constraints, and context that took time to build.
The default action is always merge-and-augment, never replace-and-rewrite.
If content conflicts → stop and ask the user before changing it.

---

## Prerequisites

Before starting:
- The project folder exists under the workspace root (or inside a project group folder)
- You have read access to the project directory

---

## Step 1: Classify the Project

Determine what kind of folder this is:

- **Direct project repository** — has `.git/`, `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, or clear source directories with a `README.md`
- **Project group folder** — contains multiple subfolders that each look like project repositories (e.g. a company or client folder)
- **Non-project folder** — docs, assets, backups, or other non-repo content

If it is a project group folder → identify the individual repos inside it and apply this workflow to each one separately.
If it is a non-project folder → stop. Do not create agent files for non-project folders.

---

## Step 2: Check What Already Exists

Before creating anything:

1. Check for existing `AGENTS.md` — read it fully if present
2. Check for existing `CLAUDE.md` and `CODEX.md` — read them fully if present
3. Check for existing workflow docs or instruction files in any subdirectory
4. Check for existing project documentation (`README.md`, `docs/`)

If all files are missing → proceed to Step 3.
If files exist → proceed to Step 4 (merge and augment, not replace).

---

## Step 3: Create Missing Files (New Project)

If `AGENTS.md` is missing:
- Create it from `templates/project/AGENTS.template.md`
- Fill in what can be inferred from the project structure (purpose, stack, important paths)

If `CLAUDE.md` is missing:
- Create it from `templates/project/CLAUDE.template.md` as a stub pointing to `AGENTS.md`

If `CODEX.md` is missing:
- Create it from `templates/project/CODEX.template.md` as a stub pointing to `AGENTS.md`

---

## Step 4: Add Workbench Reference

Ensure `AGENTS.md` contains a reference to the workspace-level `AGENTS.md` at the very top of the file — before any project-specific content.

The reference path depends on where the project lives in the workspace:
- Project is a direct child of the workspace root → `../AGENTS.md`
- Project is inside a group folder (one level deeper) → `../../AGENTS.md`

The line to add:

```markdown
> Always read `../AGENTS.md` (or `../../AGENTS.md` if nested) before starting any task in this project. It contains shared instructions, workflows, and conventions that apply across all projects.
```

If the line already exists → skip. Do not add it twice.

---

## Step 5: Migrate Existing Content (Existing Project)

If `CLAUDE.md` or `CODEX.md` contain real instructions (not already a stub):
1. Read the full content
2. Identify useful content that is not already in `AGENTS.md`
3. Merge it into `AGENTS.md` — preserve the project's wording and intent
4. Only after the content is safely in `AGENTS.md` → replace the source file with a stub

Do not replace with a stub before the content is migrated.
If the content conflicts with something in `AGENTS.md` → stop and ask the user.

---

## Step 6: Fill in Project Basics

In `AGENTS.md`, ensure the following are present:
- Project purpose (one paragraph — what does this project do?)
- Stack and languages
- Important file paths and entry points
- Project-specific working rules (anything agents must know that isn't obvious from the code)
- References to any existing workflow docs in the project

Keep it portable:
- Do not hardcode personal machine paths
- Do not require another teammate's private workspace setup

---

## Step 7: Define Protected Branches

Ask the user: "Which branches are protected in this project? I'll add them to AGENTS.md so agents never commit or push to them directly."

If the user provides a list → add it to `AGENTS.md` under a `## Protected Branches` section:

```markdown
## Protected Branches

Agents must never commit or push directly to these branches without explicit user instruction:
- `main`
- `prod`
- `release`

All other branches are safe to work on freely.
```

If the user says "use the defaults" or doesn't know → apply the workspace default rule from `shared/core/permissions.md`:
- Protected: `main`, `master`, `production`, `prod`, `release`, and any branch starting with `rd`
- Add this to `AGENTS.md` with a note that it follows workspace defaults

If the user says to skip it → note it in `AGENTS.md` as "protected branches: not defined — workspace defaults apply".

---

## Step 8: Update the Workspace Setup

After creating or updating the project files:

1. Add the project to `local/setup.toml` under `managed_projects` if it is not already there
2. If the project was previously in `ignored_projects` → ask the user before moving it

---

## Reflection Check

Before finishing, verify:
- Can a new team member clone this repo and immediately understand what it is and how agents should work in it?
- Are all existing instructions preserved (nothing was overwritten without migrating)?
- Are the files portable (no personal paths or private dependencies)?
- Are protected branches defined (or workspace defaults explicitly acknowledged)?

---

## When to Stop and Escalate

Stop and ask the user if:
- Existing files contain conflicting instructions that cannot be merged cleanly
- The project's purpose or stack is unclear after reading all available docs
- The project folder structure is unusual and the classification from Step 1 is ambiguous

---

## Completion Criteria

New project setup is complete when:
- `AGENTS.md` exists and contains project purpose, stack, important paths, and working rules
- `AGENTS.md` defines protected branches (or explicitly states workspace defaults apply)
- `CLAUDE.md` and `CODEX.md` exist as stubs (or are confirmed not needed)
- No existing useful content was lost
- The project is listed in `local/setup.toml`
