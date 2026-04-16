# Workflow: New Workflow

**Roles**: Research Specialist · Content Designer · Product Manager

> These are the default roles for creating a workflow. Step 1 covers how to determine and confirm the right roles for the specific workflow being created. Roles should match the domain of the workflow being built — not default to software engineering unless that is the actual domain.

---

## Trigger Phrases

**To create a new workflow:**
- "create a new workflow"
- "add a workflow for [X]"
- "we need a workflow for [X]"
- "there's no workflow for [X]"
- "build a workflow for [X]"
- "write a workflow for [X]"

**To publish an existing local workflow:**
- "publish this workflow"
- "share this workflow"
- "release this workflow"

*(Note: If the user asks you to "publish" or "share" an existing workflow, do not try to build a new one from scratch! Skip directly to **Phase 4, Step 20** and follow the instructions to move it to the shared folder).*

---

## Scope Boundary

**This workflow covers:** Creating a workflow in `local/workflows/` by default for private use, creating a companion working folder for that workflow in `local/workspaces/`, and moving the workflow to `shared/workflows/` only when the user explicitly wants to publish it. Includes creating or extending domain files when the required domain or role does not exist yet.

**This workflow does NOT cover:**
- Editing an existing workflow (edit the file directly, optionally using `improve-workbench.md`)
- Standalone domain creation with no associated workflow (use `new-domain.md`)
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

1. Check `local/manifest.toml` — is there already a private registry entry for this workflow?
1. Check `local/workflows/` — does the user already have a private workflow for this?
2. Check `shared/workflows/` — does a published workflow already cover this task?
3. Check `shared/manifest.md` — is there a routing entry that would already handle it?

If a workflow already exists for this task → extend it instead of creating a new one. Stop here.
If the task is genuinely new and recurring → proceed.

---

## Scope & Location

New workflows are private by default. Create them in `local/workflows/` alongside a private temp space (`local/workspaces/<workflow-slug>/`). Only move to `shared/workflows/` if explicitly told to publish.

---

## Phase 1: Research and Planning

### Step 1: Determine the Domain and Roles

Do not start by vaguely matching against the existing domain list. Determine what is correct first, then check if it exists:

1. **Identify the Domain:** Based on the task, what field or industry does this naturally belong to? Check `shared/domains/`. If a highly similar domain exists, use it. If not, follow `new-domain.md` to create one (or build it inline if it's simple enough).
2. **Identify the Roles:** What specific real-world expertise is required (think distinct job titles)? Check your chosen domain file. If the roles already exist, use them. If they are missing, define them from first-principles or brief research and inject them into the domain file before continuing.
3. **Propose to the User:** Before writing the workflow, confirm the domain and roles with the user, providing a one-line reason for your selections.

Once approved, add the `**Roles**:` line at the top of the new workflow file.

---

### Step 2: Recommend Platforms (If Distributing Content)

If the workflow involves publishing material to an audience (social media, newsletters, marketplaces), determine the optimal platform independently of the user's initial assumptions.

- **Research First:** Identify platforms with the highest organic reach and highest audience relevance for the specific content.
- **Validate:** If the user named a suboptimal platform, suggest a superior alternative with concrete rationale. If no platform was named, propose 2-3 options and state the tradeoffs.
- **Confirm:** Ask the user to confirm the final platform strategy before proceeding.

---

### Step 3: Map the Full User Journey

Before writing the workflow, zoom out. What happens *before* this workflow starts, and what happens *after* it succeeds? Identify any missing steps (e.g., building a marketing workflow when there is no checkout system in place).

- **If covered externally:** Document it in the boundary scope and proceed.
- **If missing but non-blocking:** Offer to build an adjacent workflow next.
- **If missing and blocking:** Pause building. You must recommend setups to resolve the blocker first.

At the bottom of the generated workflow, include an `## Adjacent Workflows (recommended)` list of the non-blocking gaps you identified.

Add this list to the bottom of the workflow file under a `## Recommended Next Workflows` section. It is a living list — the user can trigger any of these by name when ready.

---

## Phase 2: Architecture and Setup

### Step 4: Write It as a Human SOP First

Before structuring anything, describe how a human would do this task from start to finish.
Write it conversationally — what would you tell a new team member?

This step surfaces the real decision points, tools, and sequence before you formalize anything.
Discard this draft after Step 10. It is thinking material, not the final file.

---

### Step 5: Ask About Output Storage (If the Workflow Produces Files)

Determine whether the workflow generates any output artifact — a document, report, lesson, summary, or other exported file.

If the workflow does NOT produce files → skip this step.

If it does:

1. Ask: *"Should the output be saved to a specific folder, or use the default workspace folder?"*
2. If the user specifies a folder → use it as the base output path. Build into the workflow steps that output goes there.
3. If the user does not specify → default to `workspace/` and note it in the workflow so the user can be told where to find output when asked.
4. If output is recurring (see Step 2b), the folder structure must be: `<base-folder>/<YYYY-MM-DD>-<topic-slug>/`
   - Example: `workspace/2026-04-12-photosynthesis/`
   - The workflow steps must include: check if today's folder already exists before running. If it does → skip or confirm with user before overwriting.

Embed the resolved output path and folder-naming convention directly into the workflow's steps.

---

### Step 6: Identify External Tools and Media Assets

Determine if the workflow depends on any external tool, API, or media content that must be configured before running.

- **Check memory first:** Read `local/personal-memory.md`. If a required tool and credential already exist, use them. Do not ask for them again.
- **Set up missing credentials:** If a new tool is needed, research its exact authentication process (OAuth, API Key) before asking the user. Provide exact click-by-click instructions, then save the resulting token permanently in `local/personal-memory.md`.
- **User-provided media:** If the workflow relies on the user providing their own real-world photos or videos (e.g., product photography), **never** substitute them with AI-generated alternatives. Use their authentic media, but ask if they would like you to add an AI enhancement step to improve lighting/sharpness.

---

### Step 7: Identify Irreversible Actions

Scan the SOP draft (Step 2) for any action that cannot be undone once taken.

Common irreversible actions:
- Posting to a public platform (social media, email, blog)
- Uploading or publishing files externally
- Deleting or overwriting content
- Sending notifications or messages
- Making a payment or triggering a billing event

If the workflow has no irreversible actions → skip this step.

If it does:

1. Mark each irreversible action in the SOP draft
2. Add a **Review Gate** step immediately before each irreversible action in the workflow:
   - Present the user with what is about to happen
   - Ask for explicit confirmation ("yes" / "no")
   - If no confirmation → stop. Do not proceed.

3. Add to the Prime Directive (or create one): *"[Action] is irreversible. This workflow does not [post/publish/delete] without explicit user confirmation."*

Irreversible actions must never be automated away silently, even in scheduled runs.

---

### Step 8: Define Recurrence Strategy

Determine whether the workflow runs on a repeating schedule or is triggered manually.

- **Check for signals:** Does the task imply "daily", "weekly", or "before every class"? If no recurrence is needed, skip this and Step 9.
- **Clock-based vs Event-based:** If it repeats, ask if it runs on a fixed clock (e.g., Every Monday at 8 AM) or in response to an event/season (e.g., when new inventory arrives).
- **Update the header:** Add the `**Recurrence**:` line to the workflow output template. If it's event-based, schedule a lightweight weekly check to trigger it.

---

### Step 9: Define Input Model and Queues

If the workflow is recurring, determine how it receives its data.

- **No Input Needed (Autonomous):** The workflow inherently knows what to do without external data (e.g., running a daily weather check, or executing a static cleanup script).
- **Per-Run Input:** The user must be explicitly prompted for data each time the workflow runs. Add a block asking for input as Step 1 of the generated workflow.
- **Batch Queue:** The user provides all inputs upfront once (e.g., a list of 50 topics, a URL, or a pasted document).
  - The workflow automatically establishes a `queue.md` in the working folder.
  - The queue can be **Ordered** (sequential list) or **Time-Windowed** (items have start/end availability dates).
  - Define the **Run Mode**: Drip (one per run), Burst (N per run), Batch (all at once), or Drip + Approval (advances only after user says yes).
  - Add standard `[ ]` (pending), `[~]` (awaiting review), and `[x]` (done) markers to track queue state.

## Phase 3: Implementation

### Step 10: Write the Scope Boundary

Write two short lists at the top of the file:

```
**This workflow covers:** [what it starts from, what it produces, what task type]

**This workflow does NOT cover:**
- [adjacent task] (use [other-workflow.md] instead)
- [out-of-scope edge case]
```

If you cannot define a clear scope boundary → the workflow may not be ready to write yet. Surface this to the user.


---

### Step 11: Write the Prime Directive (If a Common Failure Mode Exists)

A Prime Directive is the one rule that, if ignored, causes the whole workflow to fail.
Place it before the steps.

Use it only when there is a known, recurring failure mode for this task type.
Not every workflow needs one. If you can't name the failure mode specifically → skip it.

---

### Step 12: Write the Trigger Phrases

List natural phrases a user would say to invoke this workflow.

```
- "check sentry"
- "fetch sentry issues"
```

Keep them natural — match how the team actually talks.
If the workflow remains in `local/workflows/` → keep the trigger phrases in the file, but do not add it to `shared/manifest.md`.
If the workflow is published to `shared/workflows/` → add it to `shared/manifest.md` under **Workflow Inference**.

Trigger lists are living. Start with the phrases you know. New ones are added over time via the trigger learning mechanism in `shared/manifest.md`.

---

### Step 13: Write the Prerequisites / Entry Gate

State what must be true before the workflow starts.
If prerequisites aren't met → the agent stops and says so, not improvises.

- **Tool Checks:** Always include a prerequisite check for required API keys or tokens in `local/personal-memory.md`. If missing, the agent stops and runs setup.
- **Media Checks:** If the workflow needs user-provided media, add a prerequisite verifying the files exist in the working directory before proceeding.

---

### Step 14: Write the Steps

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

### Step 15: Enforce Workbench Conventions (Paths & Memory)

When writing the workflow, adhere strictly to these two rules:

1. **Relative Paths**: All paths to scripts, other workflows, or local resources MUST be relative — never absolute. For instance, if a workflow executes a script located alongside it, specify the execution path relative to the workflow directory (e.g., `node scripts/fetch-script.js` instead of `/Users/name/work/.../scripts/fetch-script.js`).
2. **Local Memory Isolation**: Workflows should not write their active state or generated tracking data into a target project's `MEMORY.md` file. Active workflows must maintain their state in the workbench's `local` memory area against the workflow itself: `local/memory/<workflow-slug>.md` (e.g., `local/memory/debugging-sentry.md`).

---

### Step 16: Add Cross-References

- **Before this workflow**: if another workflow must run first, say so at the top
- **After this workflow**: if another typically follows, say so at the end
- **Instead of this workflow**: if a more specific workflow handles a sub-case, redirect there

---

### Step 17: Write the Escalation / Stop Conditions

When should the agent stop and surface to the user rather than continuing?

Conditions must be concrete and observable — not vague ("if things feel unclear").

For this workflow specifically, escalate if:
- The scope boundary cannot be defined after two attempts — the need may not be clear enough yet
- The workflow keeps growing past 200 lines — it may be two workflows
- The steps require so much project-specific context they can't be written generically — this belongs in the project's `AGENTS.md`, not here

---

### Step 18: Write the Completion Criteria

What does "done" look like? The agent should be able to check this list and know whether to stop.

---

### Step 19: Add an Output Template (If the Workflow Produces a Document)

If the workflow produces a structured file, show a skeleton. See `debugging-sentry.md` for an example.

---

## Output Template

Every workflow file produced by this workflow should follow this skeleton:

```markdown
# Workflow: [Name]

**Roles**: [Role 1] · [Role 2]

**Recurrence**: [e.g., Every weekday (Sun–Thu) at 08:00 — omit if not recurring]
**Input model**: [per-run / queue:drip / queue:drip+approval / queue:burst(N) / queue:batch — omit if not recurring]
**Output folder**: [e.g., workspace/ or /path/to/folder — omit if no file output]
**Working folder**: [e.g., local/workspaces/<workflow-slug>/ — default writable area for workflow-specific temp files and assets; no extra per-write permission prompt]

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

---

## Recommended Next Workflows

- [ ] [workflow-name.md] — [one line: what gap it fills and why it matters]
```



---

## Phase 4: Verification and Deployment

### Step 20: Quality Check

Walk through it with a real task before publishing:
- Can you follow each step without re-reading the task description?
- Does each step produce a clear output before the next begins?
- Are branch conditions explicit enough that two agents make the same choice?
- Are escalation conditions concrete enough to trigger reliably?
- Would a human expert do anything this doesn't capture?

If any answer is no → fix it before publishing.

---

### Step 21: Post-Creation Checklist

1. Save the new workflow in `local/workflows/` by default
2. Create the companion working folder in `local/workspaces/<workflow-slug>/` and treat it as pre-approved writable space for that workflow
3. Register it in `local/manifest.toml`
4. If it replaces a scattered process in project-level docs → link back from those docs
5. If the user later says to publish, release, or share it:
   - move it to `shared/workflows/`
   - update `local/manifest.toml` to remove the local-only entry or mark it as shared
   - add it to `shared/manifest.md` under **Workflow Inference** with trigger phrases
   - add an entry to `shared/memory/decisions.md` noting why this process was formalized and what problem it solves

---

### Step 22: Cross-References

- **Related**: `new-domain.md` — same process, different artifact
- **For editing existing workflows**: use `improve-workbench.md` instead
- **For project-specific instructions**: add to the project's `AGENTS.md`, not here
