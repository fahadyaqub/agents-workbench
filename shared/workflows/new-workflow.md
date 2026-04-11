# Workflow: New Workflow

**Roles**: (meta — no domain role. Read and follow the steps directly.)

Use this when creating a new file in `shared/workflows/`.

---

## When to Create a New Workflow

Create a workflow when:
- A task type is done repeatedly and the process is non-obvious
- Agents need to follow a specific sequence to avoid mistakes
- The steps involve multiple tools, files, or external systems
- The team has learned from failures and wants to encode the right approach

Do NOT create a workflow just to document something obvious.
If an agent would do the right thing without guidance, the workflow adds noise.

---

## Steps

1. **Name it clearly** — the filename should match a natural trigger phrase
   - `debugging-sentry.md` → triggered by "debug sentry" or "check sentry"
   - `feature-planning.md` → triggered by "plan a feature" or "design this feature"

2. **Write the goal first** — one sentence. What does this workflow produce?

3. **Write the steps** — ordered, concrete, actionable. Each step should say:
   - what to do
   - what to look at or run
   - what to decide or produce before moving on

4. **Add decision rules** — where the path branches, say explicitly which branch to take and why

5. **Add a "When to stop" rule** — when is the workflow done? What does "complete" look like?

6. **Add it to the manifest** — in `shared/manifest.md`, add the new workflow under **Workflow Inference** with a trigger description

---

## Quality Rules

- Steps should be specific enough that two different agents would produce the same result
- Avoid vague steps like "investigate the issue" — say what to read, run, or inspect
- If a step depends on external tools, name them explicitly (Sentry, SigNoz, git, etc.)
- Keep the workflow focused on one task type — split into two files if scope creeps

## Length Guidelines

- Simple, linear workflows: 15–30 lines
- Multi-step workflows with branching: 50–100 lines
- Complex workflows with sub-steps: up to 150 lines, consider splitting

---

## After Creating the Workflow

- Test it mentally: walk through it with a real task and check that each step produces a clear output
- If the workflow replaces a process that was previously scattered across project-level docs, link back to it from those docs
- Add the workflow to `shared/memory/decisions.md` with a note on why this process was formalized
