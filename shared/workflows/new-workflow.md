# Workflow: New Workflow

**Roles**: Expert Programmer · System Design Reviewer · Product Manager

> These are the default roles for creating a workflow. Step 1 covers how to determine and confirm the right roles for the specific workflow being created.

---

## Trigger Phrases

- "create a new workflow"
- "add a workflow for [X]"
- "we need a workflow for [X]"
- "there's no workflow for [X]"
- "build a workflow for [X]"
- "write a workflow for [X]"

---

## Scope Boundary

**This workflow covers:** Creating a new file in `shared/workflows/` from scratch — from identifying the need to registering it in the manifest.

**This workflow does NOT cover:**
- Editing an existing workflow (edit the file directly, optionally using `improve-workbench.md`)
- Creating a new domain file (use `new-domain.md`)
- Project-specific instructions (those belong in the project's `AGENTS.md`)

---

## Prime Directive

**Write for execution, not documentation.**

A workflow that reads like a list of good intentions but leaves agents to figure out the specifics has failed.
The test: can two different agents follow this workflow independently and produce the same result?
If the answer is no — the steps are too vague, the branches are implicit, or the completion criteria are missing.

---

## Prerequisites

Before creating a new workflow file:

1. Check `shared/workflows/` — does a workflow already cover this task?
2. Check `shared/manifest.md` — is there a routing entry that would already handle it?

If a workflow already exists for this task → extend it instead of creating a new one. Stop here.
If the task is genuinely new and recurring → proceed.

---

## Step 1: Determine the Roles

1. Read `shared/domains/` to understand what roles exist
2. Ask: who would do this work in practice, and what judgment do they need?
3. Match the workflow's task type to the roles that best fit:
   - A debugging workflow needs someone who reads code deeply (Expert Programmer) and someone who verifies nothing regressed (Reproduction Tester)
   - A planning workflow needs someone who assesses architecture (IT Architect) and someone who keeps work tied to outcomes (Product Manager)
4. Propose the roles to the user with a brief reason for each, then wait for confirmation

**Example proposal:**
> "For a `deploy-checklist` workflow I'd suggest Expert Programmer (owns the technical steps) and Reproduction and Regression Tester (owns the verification steps). Does that fit, or should we adjust?"

If the user is unsure → suggest the closest match and proceed. Roles can be updated later.

Once confirmed → add the `**Roles**:` line at the top of the file.

---

## Step 2: Write It as a Human SOP First

Before structuring anything, describe how a human would do this task from start to finish.
Write it conversationally — what would you tell a new team member?

This step surfaces the real decision points, tools, and sequence before you formalize anything.
Discard this draft after Step 3. It is thinking material, not the final file.

---

## Step 3: Write the Scope Boundary

Write two short lists at the top of the file:

```
**This workflow covers:** [what it starts from, what it produces, what task type]

**This workflow does NOT cover:**
- [adjacent task] (use [other-workflow.md] instead)
- [out-of-scope edge case]
```

If you cannot define a clear scope boundary → the workflow may not be ready to write yet. Surface this to the user.

---

## Step 4: Write the Prime Directive (If a Common Failure Mode Exists)

A Prime Directive is the one rule that, if ignored, causes the whole workflow to fail.
Place it before the steps.

Use it only when there is a known, recurring failure mode for this task type.
Not every workflow needs one. If you can't name the failure mode specifically → skip it.

---

## Step 5: Write the Trigger Phrases

List natural phrases a user would say to invoke this workflow.

```
- "check sentry"
- "fetch sentry issues"
```

Keep them natural — match how the team actually talks.
After creating the file → add it to `shared/manifest.md` under **Workflow Inference**.

Trigger lists are living. Start with the phrases you know. New ones are added over time via the trigger learning mechanism in `shared/manifest.md`.

---

## Step 6: Write the Prerequisites / Entry Gate

State what must be true before the workflow starts.
If prerequisites aren't met → the agent stops and says so, not improvises.

Add a prerequisites section only when starting mid-workflow causes real damage or wasted work.

---

## Step 7: Write the Steps

**One directive per step.** If a step says "do X and Y" → split it.

**Use if-then format for every branch:**

Bad: "Check if the issue is reproducible."
Good:
> If the issue reproduces reliably → proceed to Step 3.
> If you cannot reproduce it → tell the user and stop.

**Name what each step produces** before the next step begins: a hypothesis, a confirmed file, a written plan.

**State what to read, run, or inspect** — not just what to think about:

Bad: "Investigate the root cause."
Good: "Read the stack trace. Run `git log --since='<date>' --oneline`. Check for prior fix attempts."

**Add anti-patterns** where the common mistake is obvious.

**Add reflection checkpoints** before high-risk steps:
> Before proceeding: confirm X. If you can't → return to Step N.

---

## Step 8: Add Cross-References

- **Before this workflow**: if another workflow must run first, say so at the top
- **After this workflow**: if another typically follows, say so at the end
- **Instead of this workflow**: if a more specific workflow handles a sub-case, redirect there

---

## Step 9: Write the Escalation / Stop Conditions

When should the agent stop and surface to the user rather than continuing?

Conditions must be concrete and observable — not vague ("if things feel unclear").

For this workflow specifically, escalate if:
- The scope boundary cannot be defined after two attempts — the need may not be clear enough yet
- The workflow keeps growing past 200 lines — it may be two workflows
- The steps require so much project-specific context they can't be written generically — this belongs in the project's `AGENTS.md`, not here

---

## Step 10: Write the Completion Criteria

What does "done" look like? The agent should be able to check this list and know whether to stop.

---

## Step 11: Add an Output Template (If the Workflow Produces a Document)

If the workflow produces a structured file, show a skeleton. See `debugging-sentry.md` for an example.

---

## Output Template

Every workflow file produced by this workflow should follow this skeleton:

```markdown
# Workflow: [Name]

**Roles**: [Role 1] · [Role 2]

**This workflow covers:** [scope]
**This workflow does NOT cover:** [out-of-scope, with redirects]

---

## Trigger Phrases

- "[phrase 1]"
- "[phrase 2]"

---

## Prime Directive (if applicable)

**[One sentence governing rule.]**

[2–3 sentences explaining the failure mode it prevents.]

---

## Prerequisites (if applicable)

[What must be true before starting. If-then gates.]

---

## Step 1: [Name]

[Single directive. If-then for branches. Names the output produced.]

---

## Step N: ...

---

## When to Stop and Escalate

Stop and tell the user if:
- [concrete observable condition]
- [concrete observable condition]

---

## Completion Criteria

[This workflow] is complete when:
- [checkable condition]
- [checkable condition]
```

---

## Length Guidelines

| Workflow type | Target length |
|---|---|
| Simple, linear, few tools | 20–40 lines |
| Multi-step with branching | 60–120 lines |
| Complex with sub-steps and templates | Up to 200 lines — consider splitting |

---

## Quality Check

Walk through it with a real task before publishing:
- Can you follow each step without re-reading the task description?
- Does each step produce a clear output before the next begins?
- Are branch conditions explicit enough that two agents make the same choice?
- Are escalation conditions concrete enough to trigger reliably?
- Would a human expert do anything this doesn't capture?

If any answer is no → fix it before publishing.

---

## After Creating the Workflow

1. Add it to `shared/manifest.md` under **Workflow Inference** with trigger phrases
2. If it replaces a scattered process in project-level docs → link back from those docs
3. Add an entry to `shared/memory/decisions.md` noting why this process was formalized and what problem it solves

---

## Cross-References

- **Related**: `new-domain.md` — same process, different artifact
- **For editing existing workflows**: use `improve-workbench.md` instead
- **For project-specific instructions**: add to the project's `AGENTS.md`, not here
