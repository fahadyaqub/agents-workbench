# Workflow: Workbench Doctor

**Roles**: IT Architect · Fullstack Software Developer · System Design Reviewer

**This workflow covers**: Auditing and repairing workbench drift after updates, template changes, bootstrap changes, and workflow-schema changes.
**This workflow does NOT cover**: Inventing new workbench rules without updating their source files, or rewriting project-specific guidance that needs human judgment.

---

## Trigger Phrases

- "run doctor"
- "workbench doctor"
- "check workbench health"
- "fix workbench drift"
- "repair workbench setup"
- "sync the workbench"
- "check bootstrap drift"

---

## Prime Directive

**Repair only the mechanical drift automatically.**

If the doctor can prove the correct content from templates, registries, or current shared rules, it should fix it.
If the change requires interpreting project-specific intent, it should report the drift clearly and stop short of rewriting user-authored content.

---

## Local Workflow Area

Use `local/workspaces/workbench-doctor/` as this workflow's private writable area.

- If the folder does not exist yet → create it before writing audit notes or generated reports.
- Treat it as pre-approved writable space for this workflow. Do not ask for extra permission for writes inside it.
- Use it for temporary audit output only. Real fixes belong in the actual shared, local, or project files being checked.

---

## Step 1: Load the Current Contracts

Before running anything, read the current source-of-truth files:

- `shared/manifest.md`
- `local/manifest.toml`
- `local/setup.toml`
- `shared/workflows/bootstrap.md`
- `shared/workflows/new-project.md`
- `shared/workflows/new-workflow.md`
- `shared/core/compatible-agents.md`
- `templates/project/AGENTS.template.md`
- `templates/project/CLAUDE.template.md`
- `templates/project/CODEX.template.md`
- `templates/project/GEMINI.template.md`

The doctor compares the workspace against the current files above, not against historical behavior.

---

## Step 2: Audit the Workbench Manually

Inspect the workspace against the contracts from Step 1 and build a short report in `local/workspaces/workbench-doctor/`.

Check these areas explicitly:

- workspace-root entrypoint files
- project-group bridge files
- managed-project compatibility stubs
- managed-project `AGENTS.md` workbench handoff block from `templates/project/AGENTS.template.md`
- managed-project `AGENTS.md` protected-branch basics
- `local/manifest.toml` against the actual contents of `local/memory/`, `local/domains/`, `local/agents/`, and `local/workflows/`
- `local/setup.toml` against the current managed and ignored project list
- `shared/manifest.md` against the actual shared workflow and domain files
- shared and local workflows against the current workflow structure contract

Use the audit to separate issues into two groups:

- **Mechanical drift** — stubs, bridge files, registry entries, or other content the doctor can derive exactly
- **Manual drift** — project `AGENTS.md` content, workflow prose, or manifest descriptions that need judgment

If the audit is already clean → stop and tell the user no drift was found.

---

## Step 3: Apply Safe Fixes

If the audit contains mechanical drift, fix only the safe, derivable items such as:

- workspace-root entrypoint stubs
- project-group bridge files
- project compatibility stubs
- the missing template handoff block at the top of a project `AGENTS.md`
- local manifest registry entries
- stale managed/ignored project lists in `local/setup.toml`

Do not let the doctor silently rewrite project-specific guidance just because it is incomplete.

---

## Step 4: Review Remaining Manual Drift

For anything still reported after `--apply`:

1. Read the affected file
2. Compare it with the current source-of-truth rule that triggered the warning
3. Make the smallest coherent edit that brings it into line without overwriting project-specific knowledge

Typical manual follow-up:

- project `AGENTS.md` exists but is missing protected branches or needs a non-trivial handoff merge
- a shared workflow is missing sections required by the current workflow contract
- `shared/manifest.md` references do not match the actual shared workflow or domain files

---

## Step 5: Re-Run Until Clean

Re-run the same audit checklist from Step 2 after any fixes.

Do not call the maintenance complete until the audit is clean or the remaining items have been explicitly deferred to the user with a reason.

---

## Step 6: Special Rule After Workbench Updates

If the task changed any of these files:

- `shared/manifest.md`
- `shared/workflows/bootstrap.md`
- `shared/workflows/new-project.md`

then the doctor must also re-check all managed projects in `local/setup.toml` before finishing.

This is not optional. It is how drift from workbench updates gets caught and repaired.

---

## Completion Criteria

Workbench doctor is complete when:

- the doctor ran against the current workspace
- safe mechanical drift was repaired
- any remaining manual drift was either fixed or clearly reported
- the workspace was re-checked after any material bootstrap or new-project change
