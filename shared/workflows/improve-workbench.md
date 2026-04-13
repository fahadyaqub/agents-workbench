# Workflow: Improve the Workbench

**Roles**: (meta — no domain role. Read and follow the steps directly.)

**This workflow covers**: Adding to, improving, or maintaining the agents-workbench itself.
**This workflow does NOT cover**: Improving a specific project's `AGENTS.md` (do that in the project), creating a new workflow from scratch (use `new-workflow.md`), creating a new domain (use `new-domain.md`).

---

## Trigger Phrases

- "improve the workbench"
- "update the workbench"
- "something in the workbench is wrong"
- "agents keep getting [X] wrong — fix the workbench"
- "add [X] to the shared system"
- "the [workflow/domain/core] file needs updating"

---

## Prime Directive

**Improve the system, not the symptom.**

If an agent did something wrong, the instinct is to add a rule to fix that specific behavior.
But if the rule only prevents that one mistake in that one context, it adds noise without adding value.
Before adding anything, ask: will this help any agent, on any project, do better work?
If the answer is only "it will stop the thing that just went wrong" → the fix may belong in the project's `AGENTS.md`, not here.

---

## What Can Be Improved

| Area | When to Improve |
|---|---|
| `shared/core/` | Agent behavior is consistently wrong across multiple projects — a principle is missing or unclear |
| `shared/domains/` | A domain is missing a useful role, or existing roles are producing consistently wrong behavior |
| `shared/workflows/` | A process is done repeatedly but not encoded, or an existing workflow is too vague to produce consistent results |
| `shared/memory/` | A published decision or principle is missing, stale, or wrong |
| `shared/references.md` | A new useful external source was found, or a dead link needs removing |
| `templates/` | A template is missing fields that every new project needs |

---

## Step 1: Identify What Needs to Change and Why

Before editing anything:

1. State what is wrong or missing in one sentence
2. State which file or section it belongs in
3. Confirm: does this apply across projects, or only to one project?

If it only applies to one project → edit that project's `AGENTS.md` instead. Stop here.
If it applies broadly → proceed.

---

## Step 2: Choose: Add or Edit

**Edit an existing file when:**
- The improvement refines or extends what is already there
- A role needs a new bullet or a workflow needs a new step or a completion criterion

**Add a new file when:**
- The topic is genuinely new and does not fit in any existing file
- It has enough scope to justify its own file (more than 10 lines of durable guidance)

Do not duplicate. If guidance already exists, extend it — do not create a parallel version.

---

## Step 3: Make the Change

For changes to `shared/workflows/` → follow `new-workflow.md` if creating from scratch.
For changes to `shared/domains/` → follow `new-domain.md` if creating from scratch.
For changes to `shared/core/` → edit the specific file directly. Keep additions minimal — core files are read on every task.

If the change affects `shared/core/` or `shared/manifest.md` → these affect all agents across all projects. Get a second opinion before merging.

---

## Step 4: Capture the Decision

After any non-cosmetic change (skip for typo fixes, formatting, and dead link removal):

1. Consider whether the change warrants an entry in `local/memory/` first, and whether it should later be promoted to `shared/memory/decisions.md`.

   Only add an entry if an agent would make the wrong choice without knowing it — a rule that isn't obvious from reading the current files. Do not add changelog entries or things derivable from the files themselves.

   Test: *"If an agent reads all current files and follows them, would it still get this wrong?"* If yes → add the entry. If no → skip it.

   Format: `[YYYY-MM-DD] [scope] [active] — rule. Why: reason. What agents should do: action.`

2. If the change fixes a recurring failure → document the failure pattern so the fix can be understood later

3. Consider whether the change surfaced a new **principle** that should apply beyond this specific fix:
   - If yes → add it to local memory first, and publish it to `shared/memory/global-memory.md` only if it should help other users
   - If it is specific to this decision → local decisions memory is enough unless the decision should be shared

   Ask: *"If a different agent, on a different project, ran into this situation — would this insight help them?"* If yes, it belongs in global-memory.md.

4. Do not write durable insights into per-agent memory tools (Claude's memory, Cursor's memory file, etc.). Those are siloed. Use `local/memory/` for local workbench memory, and publish entries into `shared/memory/` only when they should guide other users too.

---

## Step 4a: Validate Downstream Files

After making any change to the workbench, run through this checklist before calling the work done.
Not every item will apply — skip those that clearly don't. But check each one explicitly rather than assuming.

### manifest.md
- Was a new workflow file created? → Add it under **Workflow Inference** with trigger phrases.
- Was a new domain file created? → Add it under **Domain Inference** with routing signals.
- Was an existing workflow renamed, split, or removed? → Update or remove its manifest entry.

### AGENTS.md
- Did the load order change? (new file types, new directories, new reading sequence) → Update the Load Order section.
- Did the priority rules change? → Update the Priority section.
- Was a new canonical file introduced? → Add it to the Canonical Files section.

If none of these changed → AGENTS.md does not need updating.

### README.md
- Was a new domain added? → Add it to the domain list in the intro paragraph.
- Did the system's core capability change in a way a new user would need to know? → Update the relevant section.
- Were existing features described inaccurately? → Correct them.

Do NOT update the README for individual workflow additions — the complete workflow list lives in `shared/manifest.md`. The README links there and stays stable.

If the change was internal (a refinement to an existing file with no new user-facing capability) → README does not need updating.

### references.md
- Was a new domain created without reference sources? → Add a section under the domain name with at least one useful external link.
- Was a role created using web research? → Add the source to references.md.
- Are any existing links in the new or edited section dead? → Remove them.

### templates/
- Was a new local file introduced that future users will need? → Add a template for it under `templates/local/`.
- Was the format of an existing local file changed? → Update the corresponding template to match.

### Project refresh
- Did you make a material change to `shared/manifest.md`, `shared/workflows/bootstrap.md`, or `shared/workflows/new-project.md`? → Re-check all managed projects in `local/setup.toml`
- Make sure those managed projects still satisfy the current project-level requirements defined by `bootstrap.md` and `new-project.md`
- If any managed project is now out of sync, update it before finishing the task

### personal-memory.md and template
- Was a new category of persistent data introduced (new tool type, new credential format)? → Add the format to both `local/personal-memory.md` and `templates/local/personal-memory.template.md`.

---

## Step 5: Verify the Change Doesn't Break Anything

For workflow changes:
- Walk through the updated workflow with a real task — does it still produce the right result?

For domain changes:
- Check that existing roles haven't been contradicted or made redundant

For core changes:
- Consider whether the new rule could conflict with existing rules. If it could → resolve the conflict explicitly.

---

## Team Contribution Rules

- Changes to `shared/` affect all agents across all projects — communicate before merging
- Changes to `local/` are personal — never commit them (gitignored)
- Changes to `templates/` are low-risk but verify they don't break existing setups
- Use whatever PR process the team uses for other repos

---

## When to Stop and Escalate

Stop and discuss with the team if:
- The change would modify `shared/core/` — these rules run on every task
- The change would significantly restructure how workflows or domains are organized
- There is disagreement about whether something belongs in shared vs project-level

---

## Maintenance Triggers

Do a maintenance pass when:
- Agents are producing consistently wrong output in a domain
- A workflow was used and the agent went off-track mid-execution
- A team member reports that existing guidance is confusing or contradictory
- A sprint or project is complete and new patterns emerged that should be encoded

Check during maintenance:
- Are any workflow files so vague they add no value? Expand or remove them.
- Are any domain files missing roles the team regularly needs? Add them.
- Are any memory entries stale or resolved? Update their status.
- Are any links in `shared/references.md` dead? Remove them.
- Run the Step 4a downstream validation checklist — even if no deliberate changes were made, drift accumulates.

---

## Completion Criteria

An improvement is complete when:
- The change is made and the affected file is coherent
- The decision is recorded in `shared/memory/decisions.md`
- The change has been verified not to contradict existing guidance
- Team members who need to know have been informed
