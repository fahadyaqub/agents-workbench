# Workflow: New Workflow

**Roles**: Expert Programmer · System Design Reviewer · Product Manager

> These are the default roles for creating a workflow. But the right roles depend on what the workflow is *about*.
> Step 1 below covers how to determine and confirm the correct roles for the specific workflow being created.

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

## Step 1: Determine the Roles

Before writing anything, identify which roles will execute this workflow.

1. Read the available domain files in `shared/domains/` to understand what roles exist
2. Match the workflow's task type to the roles that best fit it:
   - Who would be doing this work in practice?
   - Which roles have the right judgment for the decisions this workflow involves?
   - Are there roles from multiple domains that each cover a distinct part of the workflow?
3. Propose the roles to the user with a brief reason for each

**Example proposal format:**
> "For a `deploy-checklist` workflow I'd suggest: **Expert Programmer** (owns the technical steps), **Reproduction and Regression Tester** (owns the verification steps). Does that match how you'd use it, or should we add/swap a role?"

4. Wait for confirmation or correction before proceeding
5. If the user is unsure, suggest the closest match and proceed — roles can be revised later

Once confirmed, add the roles as the `**Roles**:` line at the top of the new file.

---

## Step 2: Name It

The filename should match a natural trigger phrase — what would someone say to invoke this workflow?

- `debugging-sentry.md` → "debug sentry", "check sentry"
- `feature-planning.md` → "plan a feature", "design this feature"
- `deploy-checklist.md` → "run deploy checklist", "prep for deploy"

Use lowercase, hyphen-separated words. One concept per file.

---

## Step 3: Write the Goal

One sentence. What does this workflow produce when complete?

---

## Step 4: Write the Steps

Each step should specify:
- What to do
- What to look at, read, or run
- What to decide or produce before moving to the next step

Steps should be specific enough that two different agents would produce the same result.
Avoid vague steps like "investigate the issue" — say what to read, run, or inspect.

---

## Step 5: Add Decision Rules

Where the path branches, state explicitly which branch to take and why.
Don't leave branching implicit — agents will guess wrong.

---

## Step 6: Add a Completion Rule

When is the workflow done? What does "complete" look like?
A workflow without a completion condition runs forever.

---

## Step 7: Add It to the Manifest

In `shared/manifest.md`, add the new workflow under **Workflow Inference** with:
- The filename
- The trigger phrases that should load it

---

## Quality Rules

- If a step depends on external tools, name them explicitly (Sentry, SigNoz, git, etc.)
- Keep the workflow focused on one task type — split into two files if scope creeps
- Do not duplicate guidance already in a domain file — reference the role behavior instead

## Length Guidelines

- Simple, linear workflows: 15–30 lines
- Multi-step workflows with branching: 50–100 lines
- Complex workflows with sub-steps: up to 150 lines, consider splitting

---

## After Creating the Workflow

- Walk through it mentally with a real task — does each step produce a clear output?
- If it replaces a process previously scattered across project-level docs, link back from those docs
- Add an entry to `shared/memory/decisions.md` noting why this process was formalized
