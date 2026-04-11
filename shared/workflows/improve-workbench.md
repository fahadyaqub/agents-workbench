# Workflow: Improve the Workbench

**Roles**: (meta — no domain role. Read and follow the steps directly.)

Use this when adding to, improving, or refining the agents-workbench itself.

---

## Purpose of This Repo

This repo is a shared operating layer for AI agents across all projects. It should:
- Eliminate repeated instructions across projects
- Give agents enough context to work well without being told the same thing twice
- Stay lean — load what's needed, not everything at once
- Grow over time as the team learns what works

The measure of a good improvement: does it make agents faster, more correct, or require less prompting?

---

## What Can Be Improved

| Area | When to Improve |
|------|----------------|
| `shared/core/` | Agent behavior is off in a consistent, cross-project way |
| `shared/domains/` | A domain is missing a useful role, or existing roles produce wrong behavior |
| `shared/workflows/` | A process is done repeatedly but not yet encoded, or an existing workflow is too vague |
| `shared/memory/` | A decision was made that agents keep re-litigating |
| `shared/references.md` | A new useful external source was found, or a link is dead |
| `templates/` | A template is missing fields that every new project needs |

---

## When to Add vs When to Edit

**Add a new file when:**
- The topic is genuinely new and doesn't fit in an existing file
- It has enough scope to justify its own file (more than 10 lines of durable guidance)

**Edit an existing file when:**
- The new information refines or extends what's already there
- A role needs a new bullet or a workflow needs a new step

**Do not duplicate.** If guidance already exists, extend it instead of adding a parallel version.

---

## How to Add a New Workflow

Follow `shared/workflows/new-workflow.md`.

---

## How to Add a New Domain

Follow `shared/workflows/new-domain.md`.

---

## How to Capture a Decision

When the team makes a durable architectural or process decision:

1. Add it to `shared/memory/decisions.md`
2. Format: `[YYYY-MM-DD] [scope] [status] — decision statement. Why: reason.`
3. Add what agents should do as a result (not just what was decided)

**When to capture:**
- A pattern was tried, failed, and should not be repeated
- A tool or approach was chosen over alternatives and the reason matters
- A process change affects how agents should behave going forward

---

## How Team Members Contribute

1. Make changes in a branch
2. Changes to `shared/` affect everyone — get a second opinion before merging
3. Changes to `local/` are personal — never commit them (they're gitignored)
4. Changes to `templates/` are low-risk but verify they don't break existing setups
5. Add a note to `shared/memory/decisions.md` for any non-trivial change

There is no formal PR process requirement — use whatever the team uses for other repos.
But for `shared/core/` changes especially: discuss before merging, since these affect all agents in all projects.

---

## What NOT to Do

- Do not add guidance that only applies to one project — put it in that project's `AGENTS.md`
- Do not make core files longer for completeness — length reduces readability and increases load cost
- Do not add a workflow for something an agent would do correctly without guidance
- Do not duplicate guidance already present in another file — link or reference instead

---

## Maintenance

Periodically review:
- Are any workflow files so vague they're not useful? Expand or remove them.
- Are any domain files missing roles the team regularly needs? Add them.
- Are any memory entries stale or resolved? Update their status.
- Are any references in `shared/references.md` dead? Remove them.

There is no set schedule — do this when something feels off or after a sprint where agents produced bad output.
