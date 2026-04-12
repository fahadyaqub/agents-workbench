# Workflow: Bootstrap

**Roles**: Fullstack Developer · IT Architect · Product Manager

**This workflow covers**: Initializing the agents-workbench system in a workspace for the first time, and maintaining it when setup items are pending.
**This workflow does NOT cover**: Setting up an individual project (use `new-project.md`), creating new workflows or domains (use `new-workflow.md` or `new-domain.md`).

---

## Trigger Phrases

- "set up the workbench"
- "initialize the workspace"
- "run bootstrap"
- "setup is pending"
- "agents-workbench is not set up yet"

---

## Prime Directive

**Never overwrite existing files without reading them first.**

Projects may contain agent instructions, workflow docs, and memory that represent significant prior work.
The bootstrap process is additive. It fills gaps — it does not replace what is already there.
If any file conflicts → stop and ask the user before changing it.

---

## Prerequisites

- The `agents-workbench/` directory exists in the workspace root
- `shared/manifest.md` is readable

---

## Step 1: Check Workspace Root Pointers

Read `shared/core/compatible-agents.md` to get the current list of supported agent stub filenames.

Verify the workspace root contains `AGENTS.md` plus a stub file for every supported agent.

If any are missing → create them as pointer stubs (content: "See `agents-workbench/AGENTS.md`").
If any exist with real content → read them before doing anything. Migrate useful content before replacing.

---

## Step 2: Initialize Local Files

Check whether `local/setup.toml` exists.

If missing → initialize all three local files from templates:
- `local/setup.toml` from `templates/local/setup.template.toml`
- `local/who-i-am.md` from `templates/local/who-i-am.template.md`
- `local/personal-memory.md` from `templates/local/personal-memory.template.md`

If `local/setup.toml` exists → read it and check the status of each setup item.

---

## Step 3: Work Through Pending Setup Items

For each item in `local/setup.toml` with `status = "pending"`:

**`who_i_am` is pending:**
Ask the user: "Set up your local who-I-am profile now, or skip it for now?"
If they complete it → mark `complete`.
If they skip it → mark `ignored`.

**`project_bootstrap` is pending:**
Proceed to Step 4 (project scan).

**`unified_agent_entrypoint` is pending:**
Proceed to Step 5 (entrypoint audit).

Once a setup item is marked `complete` or `ignored` → do not prompt for it again unless the user resets it manually in `local/setup.toml`.

---

## Step 4: Scan Projects (if `project_bootstrap` is pending)

Scan each immediate child of the workspace root. Classify each as:

**Direct project repository** — signals: `.git/`, `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `README.md` with source directories, or existing `AGENTS.md`/`CLAUDE.md`

**Project group folder** — signals: contains multiple subfolders that each look like project repositories; top-level folder is organizational, not a single runnable repo

**Non-project folder** — assets, backups, general docs, or similar content without project signals

For project group folders → scan one level deeper and apply the same classification to each nested folder.
Do not recurse beyond two levels without asking the user.

For each identified project:
- Check whether `AGENTS.md` exists
- Check whether `AGENTS.md` contains a reference to the workspace-level `AGENTS.md` at the top (the workbench link)
- Check whether a stub file exists for every agent listed in `shared/core/compatible-agents.md`
- Check whether `AGENTS.md` contains a `## Protected Branches` section
- Check whether `AGENTS.md` contains real project guidance or is only a thin pointer
- Note any existing workflow or instruction docs

If projects are missing `AGENTS.md` → ask: "Some projects are missing AGENTS.md. Do you want me to add project-level entrypoints where missing?"

If projects have `AGENTS.md` but are missing the workbench reference line → add it near the top of the file without touching any other content. Use `../AGENTS.md` for direct projects, `../../AGENTS.md` for group-nested projects.

If projects have `AGENTS.md` but it is only a thin pointer:
- expand it into a short project-level adapter
- keep shared guidance in the parent workbench
- keep project-specific facts, paths, and safety rules in the local file so IDE agents can use it as the nearest reliable entrypoint

If projects have `AGENTS.md` but no protected branches defined → ask once, collectively:
"The following projects don't have protected branches defined: [list]. What are the protected branches for each? Or should I apply workspace defaults (main, master, prod, production, release, rd*)?"

If the user provides specifics → add a `## Protected Branches` section to each project's `AGENTS.md`.
If the user says use defaults → add the default list to each project's `AGENTS.md` with a note it follows workspace defaults.
If the user skips → add a note to each `AGENTS.md`: "Protected branches: not defined — workspace defaults apply."

If yes → run `new-project.md` for each missing project.
If no → mark `project_bootstrap` as `ignored`.

After completing or skipping → mark `project_bootstrap` as `complete` in `local/setup.toml` and record the scan date and lists of managed/ignored projects.

---

## Step 5: Audit Entrypoints (if `unified_agent_entrypoint` is pending)

For each project with both `AGENTS.md` and `CLAUDE.md` or `CODEX.md`:
1. Read all three files
2. Check whether `CLAUDE.md` or `CODEX.md` contain real instructions (not already a stub)

If they contain real instructions → ask: "Make `AGENTS.md` the single source of truth? I can migrate content from `CLAUDE.md`/`CODEX.md` and replace them with stubs."

If yes → migrate and replace.
If no → mark `unified_agent_entrypoint` as `ignored`.

After completing or skipping → mark `unified_agent_entrypoint` as `complete`.

---

## Merge Policy

When merging content into `AGENTS.md`:
- Preserve the project's original wording and intent
- Add missing integration notes; do not rewrite what already works
- If content conflicts → stop and ask the user. Do not resolve conflicts silently.

---

## When to Stop and Escalate

Stop and ask the user if:
- A file conflict cannot be resolved by reading both versions
- The workspace structure is unusual (deeply nested, symlinks, or unusual organization)
- An existing project has instructions that contradict the workspace-level guidance

---

## Completion Criteria

Bootstrap is complete when:
- All three workspace root pointer files exist
- `local/setup.toml`, `local/who-i-am.md`, and `local/personal-memory.md` exist
- All setup items in `local/setup.toml` are marked `complete` or `ignored`
- The scan date and project lists are recorded in `local/setup.toml`
- Every managed project's `AGENTS.md` contains a reference to the workspace-level `AGENTS.md` at the top
- Every managed project's `AGENTS.md` defines protected branches (or explicitly states workspace defaults apply)
