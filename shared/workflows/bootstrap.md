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

## Local Workflow Area

Use `local/workspaces/bootstrap/` as this workflow's private writable area.

- If the folder does not exist yet → create it before writing workflow-owned notes, checklists, or temporary artifacts.
- Treat it as pre-approved writable space for this workflow. Do not ask for extra permission for writes inside it.
- Use it for workspace scan notes and bootstrap checklists only. Real initialized files still go to their actual paths in `local/`, `templates/`, or project folders.

---

## Step 1: Verify Global Workbench Pointer (Singleton Check)

Before scanning the workspace, the doctor must verify the system global pointer.

Check the contents of the file `~/.agents-workbench` (using an absolute path in the user's home directory).

- If the file **does not exist**:
  → Create it and write the absolute path of this current `agents-workbench` directory inside it. (e.g. `/Users/name/work/agents-workbench`)
- If the file **exists but points to a different path**:
  → **HALT AND ESCALATE.** Tell the user:
  > *"CONFLICT: Another agents-workbench is actively registered at [Path]. You cannot run two workbenches simultaneously on one machine. To hijack the path and make this current workbench the active one, you must manually update `~/.agents-workbench` to point here."*

Do not proceed with any other bootstrap steps until the pointer matches the current directory.

---

## Step 2: Check Workspace Root Pointers

Read `shared/core/compatible-agents.md` to get the shared list of supported agent stub filenames.
Then read `local/manifest.toml` to get any local-only agent additions for this user.

Verify the workspace root contains `AGENTS.md` plus a stub file for every shared or local agent supported in this workspace.

If any are missing → create them by copying the exact contents of `templates/project/agent-stub.template.md`.

If any exist with real content → read them before doing anything. Migrate useful content before replacing.

If any exist as pointer stubs but are missing the mandatory first-action block → update them to match `templates/project/agent-stub.template.md`.

---

## Step 3: Initialize Local Files

Check whether `local/manifest.toml` and `local/setup.toml` exist.

If missing → initialize all four local files from templates:
- `local/manifest.toml` from `templates/local/manifest.template.toml`
- `local/setup.toml` from `templates/local/setup.template.toml`
- `local/who-i-am.md` from `templates/local/who-i-am.template.md`
- `local/personal-memory.md` from `templates/local/personal-memory.template.md`

If `local/setup.toml` exists → read it and check the status of each setup item.
If `local/manifest.toml` is missing → initialize it from `templates/local/manifest.template.toml` before continuing.

---

## Step 4: Work Through Pending Setup Items

For each item in `local/setup.toml` with `status = "pending"`:

**`who_i_am` is pending:**

First, read `local/who-i-am.md` if it exists. Check for the following required fields:

- **Name** — a personal name (first name is enough); not a role or title
- **Role/title** — what they do professionally
- **Daily tasks** — what they spend their time on

A field is present only if it contains a real value. Do not infer name from role. Do not assume the file is complete because it has content — check each field explicitly.

For each required field that is missing or empty, ask the corresponding question below. Do not ask for fields that are already present. If all required fields are present, mark `who_i_am` as `complete` in `local/setup.toml` and skip to the next pending item.

Do not ask a vague opt-in question. Ask these things, one at a time, only for what is missing:

**Q1 — Name:**
*"What's your name?"*
Used to address you directly. First name is enough.

**Q2 — Role/title:**
*"What's your role or title?"*
This is the single most informative thing an agent can know. One line is enough.

**Q3 — Daily tasks:**
*"What are your main day-to-day tasks?"*
A few lines or a short bullet list. What do you actually spend your time doing?

**Q4 — Anything else? (optional, guided)**
Do not ask an open-ended question here — most people won't know what to say. Instead, offer a few concrete prompts and let them pick what applies:

*"Anything else you'd like agents to know? A few starting points if helpful:*
- *Brief or detailed answers?*
- *Explain things as you go, or just do the work?*
- *Always ask before making changes, or use your judgment?*
- *Any tools, workflows, or habits you already use with AI?*
- *Biggest frustration with AI agents so far?*
*You can answer any of these, add your own, or skip entirely."*

Infer anything you can from Q1 and Q2 before asking Q3 — if their role and tasks make their preferences obvious, note those inferences in the profile rather than asking the user to state them explicitly.

After getting answers, write the profile to `local/who-i-am.md` in plain prose — not a form, not a list of headers. Write it as a short brief an agent would read before starting work.

Example:
> Senior software Engineer, 10+ years across the full stack. Day-to-day: architecture decisions, code reviews, shipping features, team management. Prefers brief, direct answers — no filler. Wants agents to use judgment rather than ask for approval on every step.

If the user skips → mark `ignored` and do not prompt again.

**`project_bootstrap` is pending:**
Proceed to Step 4 (project scan).

**`unified_agent_entrypoint` is pending:**
Proceed to Step 5 (entrypoint audit).

**`local_manifest` is pending:**
If `local/manifest.toml` is missing → create it from `templates/local/manifest.template.toml`.
If it exists → confirm it defines private sections for memory, domains, agents, and workflows.
Then mark `local_manifest` as `complete` in `local/setup.toml`.

Once a setup item is marked `complete` or `ignored` → do not prompt for it again unless the user resets it manually in `local/setup.toml`.

---

## Step 5: Scan Projects (if `project_bootstrap` is pending)

Scan each immediate child of the workspace root. Classify each as:

**Direct project repository** — signals: `.git/`, `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `README.md` with source directories, or existing `AGENTS.md`/`CLAUDE.md`

**Project group folder** — signals: contains multiple subfolders that each look like project repositories; top-level folder is organizational, not a single runnable repo

**Non-project folder** — assets, backups, general docs, or similar content without project signals

For project group folders → scan one level deeper and apply the same classification to each nested folder.
Do not recurse beyond two levels without asking the user.

For each project group folder that contains managed projects:
- ensure the group folder itself contains an `AGENTS.md` bridge file
- the bridge should instruct reading `~/.agents-workbench` rather than relative paths
- keep it as a bridge only, not a place for project-specific rules

For each identified project:
- Check whether `AGENTS.md` exists
- Check whether `AGENTS.md` contains a reference to `~/.agents-workbench` at the top (the global pointer)
- Check whether `AGENTS.md` contains an explicit startup gate near the top that tells agents to read `~/.agents-workbench` before any reply, teleport into the workbench, and follow any shared setup gate before normal task work
- Check whether a stub file exists for every agent listed in `shared/core/compatible-agents.md` plus any local-only agent additions registered in `local/manifest.toml`
- Check whether each stub file contains the mandatory first-action block (a numbered checklist under a heading like "Mandatory First Action") — if missing, update the stub from `templates/project/agent-stub.template.md` without touching any other project files
- Check whether `AGENTS.md` contains a `## Protected Branches` section
- Check whether `AGENTS.md` contains real project guidance or is only a thin pointer
- Note any existing workflow or instruction docs

If projects are missing `AGENTS.md` → ask: "Some projects are missing AGENTS.md. Do you want me to add project-level entrypoints where missing?"

If a project group folder is missing its bridge `AGENTS.md` → create one that points via `~/.agents-workbench`.

If projects have `AGENTS.md` but are missing the global pointer link line → add it near the top of the file without touching any other content. The line should instruct reading `~/.agents-workbench`.

`templates/project/AGENTS.template.md` is the source of truth for the standardized project handoff block at the top of each project `AGENTS.md`.
When adding or refreshing the parent link, startup gate, or nearby canonical-entrypoint wording in an existing project, copy and merge that top-of-file block from the template. Do not copy wording from another project and do not invent an alternate version.

If projects have `AGENTS.md` but are missing the explicit startup gate → add it near the top of the file without removing local project guidance. The gate should require agents to read `~/.agents-workbench` before replying, teleport into the workbench, and follow any shared setup gate before normal task work.

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

## Step 6: Audit Entrypoints (if `unified_agent_entrypoint` is pending)

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
- `local/manifest.toml`, `local/setup.toml`, `local/who-i-am.md`, and `local/personal-memory.md` exist
- All setup items in `local/setup.toml` are marked `complete` or `ignored`
- The scan date and project lists are recorded in `local/setup.toml`
- Every project group folder that contains managed projects has an `AGENTS.md` bridge to the global pointer
- Every managed project's `AGENTS.md` contains a reference to `~/.agents-workbench` at the top
- Every managed project's `AGENTS.md` defines protected branches (or explicitly states workspace defaults apply)
- Every managed project's shared and local agent stub files contain the mandatory first-action block
- The workspace root shared and local stub files contain the mandatory first-action block using the workspace-root format
