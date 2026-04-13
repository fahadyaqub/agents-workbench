# Workflow: New Workflow

**Roles**: Research Specialist · Content Designer · Product Manager

> These are the default roles for creating a workflow. Step 1 covers how to determine and confirm the right roles for the specific workflow being created. Roles should match the domain of the workflow being built — not default to software engineering unless that is the actual domain.

---

## Trigger Phrases

- "create a new workflow"
- "add a workflow for [X]"
- "we need a workflow for [X]"
- "there's no workflow for [X]"
- "build a workflow for [X]"
- "write a workflow for [X]"
- "publish this workflow"
- "share this workflow"
- "release this workflow"

---

## Scope Boundary

**This workflow covers:** Creating a workflow in `local/workflows/` by default for private use, and moving it to `shared/workflows/` only when the user explicitly wants to publish it. Includes creating or extending domain files when the required domain or role does not exist yet.

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

## Default Location and Publishing Model

New workflows are local by default.

- Create new workflows in `local/workflows/`
- If `local/workflows/` does not exist yet → create it when the workflow is first written
- Register new local workflows in `local/manifest.toml`
- Do not add local-only workflows to `shared/manifest.md`
- Only when the user explicitly says "publish", "release", or "share" a workflow → move it to `shared/workflows/`, register it in `shared/manifest.md`, and treat it as part of the shared system

Local-first workflow creation is the default because local scope and shared scope should behave the same way for the user; the only difference is who receives the workflow

---

## Step 1: Determine the Domain and Roles

**Do not start from the existing domain list.** Determine what is correct first, then check if it exists.

### 1a — Identify the domain independently

Describe the task in plain language: *who does this work in the real world, and what field do they belong to?*

Examples:
- "A teacher preparing lesson material" → domain: Education / Academic
- "A creator making AI-generated videos for social media" → domain: Creative Arts / Digital Media
- "A developer debugging a production bug" → domain: Software Engineering

Name the domain without looking at `shared/domains/` yet.

### 1b — Identify the roles independently

List the specific real-world roles that would perform this work. Think in terms of job titles, not agent names:

- What expertise does this person need?
- What judgment calls are theirs to make?
- Are there 2–3 distinct specialists, or is this one person's job?

Write these down before opening any domain file.

### 1c — Resolve the domain

Check `shared/domains/` for the domain you named.

**If the domain file exists:** proceed to 1d.

**If the domain file does not exist:**
1. Follow `new-domain.md` to create it — or create it inline if it is simple enough (under 60 lines)
2. Seed it with the roles identified in 1b
3. Register it in `shared/manifest.md` under Domain Inference
4. Continue with this workflow

### 1d — Resolve the roles

Check whether each role from 1b exists in the domain file.

**If the role exists:** use it as-is.

**If the role is missing from the domain file:**
1. Check `shared/references.md` for source material relevant to this role or domain
2. If a reference exists → read it, extract the role's key behaviors, add the role to the domain file
3. If no reference exists:
   - Search the web for: *"[role name] prompt guidelines"*, *"[role name] AI agent instructions"*, or *"[domain] expert behavior for AI"*
   - If useful sources are found → add them to `shared/references.md` under a matching heading, then extract the role
   - If nothing reliable is found → define the role from first principles: what would a human expert in this role do, and what judgment do they apply?
4. Add the new role to the domain file before continuing

### 1e — Propose to the user

Present the resolved domain and roles with a one-line reason for each:

> "For this workflow the domain is **Creative Arts / Digital Media**, and I'd suggest:
> - **Generative AI Visual Creator** — owns the creative concept and AI generation step
> - **Social Media Manager** — owns platform-specific formatting and posting
>
> I've added **Generative AI Visual Creator** as a new role to `creative-arts.md` since it didn't exist. Does this look right, or should we adjust?"

Wait for confirmation before writing the workflow file.

Once confirmed → add the `**Roles**:` line at the top of the new workflow file.

---

## Step 1.5: Research and Recommend Platforms

Before writing a single step, determine which platforms are optimal for this workflow's output — independently of what the user mentioned.

This step applies whenever the workflow publishes, distributes, or reaches an audience through any channel (social media, email, marketplaces, messaging apps, etc.).

### Research first

For the content type this workflow produces, answer:
- Which platforms have the highest organic reach for this content type right now?
- Which platforms have the most relevant audience for this specific user?
- Which platforms are easiest to get started on (algorithm friendliness for new accounts, free vs. paid reach, posting friction)?
- Are there non-obvious platforms the user likely hasn't considered?

Base this on what is actually true about platform dynamics — not generic advice. A short funny cat video and a farmer's produce post have different optimal platforms.

### Validate and expand what the user said

If the user named specific platforms → validate that choice:
- If it's a good fit → confirm it and explain briefly why
- If there's a clearly better option they missed → say so directly with a concrete reason

Do not passively accept a suboptimal choice. If the user said "YouTube" for short cat videos, say:

> *"YouTube is solid for building a long-term library, but for short funny cat clips, Instagram Reels and TikTok have 3–5x higher organic reach for new accounts — the algorithm actively pushes content to non-followers. I'd strongly recommend adding both. Here's what that changes in the workflow..."*

If the user said nothing about platforms → propose the best 2–3 options and explain the tradeoff between them. Let the user choose, but make a clear recommendation.

### Confirm before proceeding

Present the final platform list with a one-line reason for each. Wait for confirmation. The platform decision affects roles, tools, and credentials — settle it before writing any steps.

---

## Step 1.6: Map the Full Process and Recommend Adjacent Workflows

Before writing the workflow, think one level wider: **what happens before this workflow starts, and what happens after it finishes?**

A workflow that generates great content but leaves the user with no way to handle what comes next has only done half the job.

### Map the full user journey

Sketch the end-to-end flow in plain language:

- **Before:** What does the user need to have in place for this workflow to work? (inventory, source material, a storefront, a way to take payment)
- **During:** What this workflow does (the part you're building)
- **After:** What happens when this workflow succeeds? (someone buys, someone DMs, someone signs up, a class shows up)

Identify any gaps — steps in the journey that have no workflow, no tool, and no plan.

### Ask about critical gaps before proceeding

If a gap is critical — meaning the workflow cannot fulfill its purpose without it — surface it to the user before writing anything:

> *"Creating posts to sell your produce is great, but when someone sees the post and wants to buy — what happens? Do you have a way for them to place an order, or does everything come through DMs?"*

Based on the answer, take one of these paths:

**If the user has it covered** → note it in the scope boundary ("order handling is out of scope — handled separately") and proceed.

**If the user doesn't have it covered but it's not blocking** → flag it and offer to create an adjacent workflow after this one:
> *"You don't have an order-handling workflow yet. I'd recommend creating one after this — it would handle incoming DMs and turn them into confirmed orders. Want me to add that to the list?"*

**If the user doesn't have it covered and it IS blocking** (e.g., no storefront, no checkout, no way to take money):
> *"Before we build a marketing workflow, you need somewhere to actually send buyers. A few options: a simple WhatsApp Business catalog, a free Shopify store, a link-in-bio page with a form. Each takes a different amount of setup. Which direction fits you best — or would you like me to recommend one?"*

Do not proceed to build a marketing workflow for a product that has no sales path. The marketing will work and produce nothing.

### Log recommended adjacent workflows

After resolving gaps, create a short list of workflows to recommend or create next:

```
## Adjacent Workflows (recommended)
- [ ] order-handling.md — responds to DMs and pings, confirms orders, tracks them
- [ ] storefront-setup.md — one-time setup of a simple sales channel
- [ ] inventory-update.md — updates the seasonal queue when availability changes
```

Add this list to the bottom of the workflow file under a `## Recommended Next Workflows` section. It is a living list — the user can trigger any of these by name when ready.

---

## Step 2: Write It as a Human SOP First

Before structuring anything, describe how a human would do this task from start to finish.
Write it conversationally — what would you tell a new team member?

This step surfaces the real decision points, tools, and sequence before you formalize anything.
Discard this draft after Step 3. It is thinking material, not the final file.

---

## Step 2a: Ask About Output Storage (If the Workflow Produces Files)

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

## Step 2c: Identify External Tools and Integrations

Determine whether the workflow depends on any external tool, API, service, or credential that must be configured before the workflow can run.

This includes **both** the tools used to create content (AI generation tools, editing tools, data sources) **and** the tools used to distribute or publish it (social platforms, CMS, email, storage).

If there are no external dependencies → skip this step.

---

### Check personal memory first

Before asking the user anything: read `local/personal-memory.md` under `## Tools & Integrations`.

- If the tool preference and credentials are already recorded → use them. Ask nothing.
- If anything is missing → follow the steps below for each missing item only.

---

### Research the platform before asking the user

For each tool or platform not already in memory:

1. **Research it first.** Before asking the user for any credential or account detail, look up:
   - What authentication model does this platform use? (API key, OAuth, bearer token, etc.)
   - What specific permissions or scopes does posting/uploading require?
   - What is the exact step-by-step process to obtain those credentials?
   - Are there any free tier limits or approval requirements?

2. Only after you understand the platform completely — ask the user for the minimum information needed. Give them specific, plain-language instructions: *"Go to [exact URL], click [X], copy the value labeled [Y]."* Never ask "do you have an API key?" without first knowing what that key is and how to get it.

---

### Set up credentials (one time only)

For each tool or platform that requires authentication:

1. Walk the user through obtaining the credential with step-by-step instructions
2. If the platform uses OAuth (e.g., YouTube, Twitter/X):
   - Complete the OAuth flow once
   - Store the resulting **access token and refresh token** in `local/personal-memory.md`
   - On every subsequent run: check if the access token is still valid before doing anything else
   - If expired: use the refresh token to get a new access token silently — do not ask the user to re-authenticate
   - Only re-run the full OAuth flow if the refresh token itself is revoked or expired
3. If the platform uses a static API key:
   - Ask the user to paste it once
   - Store it in `local/personal-memory.md`

All credentials are stored directly in `local/personal-memory.md`. This file is gitignored — it will never be committed to version control.

Format:
```
## Tools & Integrations

- AI video generator: Runway Gen-3 — generates the daily video
- YouTube channel: Cat Kingdom (UC...)
- YouTube access_token: ya29.xxxx
- YouTube refresh_token: 1//xxxx
- Twitter/X account: @catkingdom
- Twitter/X bearer_token: AAAAAxxxx
```

---

### User-provided media and AI enhancement

Some workflows depend on media (photos, videos, audio) that the user produces themselves — not AI-generated content. This is common for farmers, local businesses, creators who want authenticity, or anyone whose audience expects real content over generated imagery.

**Detect this pattern** when the user mentions: "I have photos", "I'll take pictures", "I'll record it myself", "I don't want fake images", or when the domain clearly implies real-world visual content (food, products, places, people).

**Ask: "Will you be providing your own photos/videos, or would you prefer generated ones?"**

If the user provides their own media:

1. **Never substitute AI-generated content for user-provided media.** The user's own photos are the point — they carry authenticity that generated imagery cannot replicate. If a photo is missing, stop and ask for it. Do not generate a replacement silently.

2. **Ask about enhancement:** *"Your photos will be used as-is. Would you like me to enhance them first — improving lighting, sharpness, color, and composition — to make them more social-media ready? The photo still looks like your actual produce/product, just at its best."*

3. If the user wants enhancement:
   - Research the best AI photo enhancement tool available (e.g., Adobe Firefly, Lightroom AI, Luminar Neo, Topaz Photo AI) — one that enhances without replacing
   - Add it to the tools list and set it up in `local/personal-memory.md`
   - Add an enhancement step in the workflow: run the photo through the enhancement tool before writing the post, save both originals and enhanced versions to the dated folder
   - The enhanced version is what gets posted; the original is kept

4. Add to the workflow's Prerequisites and first step: a check that the user has placed their photo(s) in the expected folder location before the workflow proceeds. If no photo is found → stop and tell the user exactly where to put it.

**Anti-pattern:** Generating a polished AI image because the user's photo was "not good enough." The user's photo, enhanced, is always preferable to a generated one for content where authenticity matters.

---

### Write the Prerequisites section into the workflow file

Add a **Prerequisites** section with a concrete check for each tool:

```
## Prerequisites

- Runway configured: access token present in local/personal-memory.md under Tools & Integrations
- YouTube configured: access token and refresh token present; channel set to Cat Kingdom
- Twitter/X configured: bearer token present; account set to @catkingdom
```

Add as the first step of the generated workflow:

> Check `local/personal-memory.md` for all required credentials. If any are missing → stop and tell the user which tool needs to be set up, then run setup before proceeding.

Anti-pattern: asking the user for credentials on every run, or failing mid-workflow because a tool wasn't checked upfront.

---

## Step 2d: Identify Irreversible Actions

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

## Step 2b: Ask About Recurrence and Input Model

### Recurrence

Determine whether the workflow is meant to run on a repeating schedule.

Signals that suggest recurrence: the user said "daily", "weekly", "every morning", "each week", "before every class", or the SOP draft in Step 2 implies the task happens regularly.

If there is no recurrence signal → skip this entire step.

If recurrence is likely:

1. Ask: *"How often should this run — every day, every weekday (Mon–Fri), once a week, or something else?"*

   Common patterns:
   - **Daily** — every day at a fixed time
   - **Weekday** — Mon–Fri, or Sun–Thu depending on the user's week
   - **Weekly** — once a week on a specific day (e.g., every Sunday morning)
   - **Season-triggered** — runs when something changes (new produce available, new semester starts), not on a fixed clock. If the user describes this pattern → propose checking a trigger condition on a weekly cadence rather than forcing a daily schedule.
   - **Event-based** — tied to an external signal ("before each class", "when a new batch is ready")

2. Once confirmed, determine the best trigger:
   - For daily or weekday patterns → propose a specific time (e.g., *"I'd suggest 8:00 AM on scheduled days — does that work?"*)
   - For weekly → propose the most natural day and time for the use case (e.g., Sunday morning for a farmer's weekly post, Monday morning for a weekly lesson)
   - For season-triggered or event-based → ask what signal starts it; schedule a lightweight weekly check that looks for the condition rather than running the full workflow blindly
3. Confirm with the user, then add a **Recurrence** block to the top of the workflow file:

```
**Recurrence**: [e.g., Every weekday (Sun–Thu) at 08:00]
**Input model**: [per-run / queue — resolved below]
```

---

### Input model

A recurring workflow can receive its inputs in two ways. Determine which applies before writing any steps.

**Per-run input** — the user provides the input each time the workflow runs (e.g., "today's topic"). Simple, but requires user action every run. Use this when inputs are unpredictable or time-sensitive.

**Batch queue** — the user provides all inputs upfront once (a book, a topic list, a content calendar). The workflow auto-advances through them on each run without asking. Use this when the user said "here's everything, just work through it."

Ask: *"Will you tell me what to work on each time, or would you like to give me everything upfront and let me work through it automatically?"*

---

**If per-run input:**

Add as the first step of the workflow: prompt the user for today's input. Define exactly what to ask and what format to accept. No queue needed.

---

**If batch queue:**

1. **Accept the input upfront.** Ask: *"Share your content set — paste a topic list, give me a file path, or drop a link (URL, Google Doc, PDF, digital book). I'll read it and build the queue automatically."*

   Accept any of:
   - **URL or shareable link** (Google Doc, online PDF, webpage, digital textbook) — fetch and parse the content, extract structure (chapters, sections, topics) into queue items automatically. Do not ask the user to manually list chapters if the document already contains them.
   - **Local file path** (PDF, Word doc, text file) — read and parse the same way
   - **Pasted text** — parse directly
   - **Verbal description** — ask follow-up questions to build the list

   Process whatever is given into a flat, ordered list of items. Show the extracted list to the user and ask: *"I found these [N] items — does this order look right, or would you like to adjust before I start?"*

2. **Determine the queue type.**

   **Ordered queue** — items are processed in sequence, one after another. Use this when order matters (book chapters, a ranked content list).

   **Time-windowed queue** — each item has an availability window (start date → end date). The workflow picks whichever item is currently in-window, not the next in a list. Use this when items are only relevant during specific periods (seasonal produce, a topic that's only timely for a few weeks, a lesson that must be taught before the next one).

   If the user's inputs naturally have dates or seasons attached → use a time-windowed queue.

   Ask: *"Do these items have specific dates or seasons when they're relevant, or should I just work through them in order?"*

3. **Create the queue file.** Write a `queue.md` into the base output folder.

   For an **ordered queue:**
   ```markdown
   # Queue

   ## Pending
   - [ ] Item 1: [title or description]
   - [ ] Item 2: [title or description]

   ## Done
   <!-- moved here as items complete -->
   ```

   For a **time-windowed queue:**
   ```markdown
   # Queue — [Season / Period]

   ## April
   - [ ] Asparagus — available Apr 15 – May 15
   - [ ] Rhubarb — available Apr 20 – Jun 1

   ## May
   - [ ] Strawberries — available May 10 – Jun 20

   ## Done
   <!-- moved here as items complete, with date -->
   ```

   For time-windowed queues, add to the workflow's "pick next item" step:
   - Find all items where today's date falls within the availability window and status is `[ ]`
   - If multiple items are in-window → pick the one whose window ends soonest (most urgent)
   - If no items are in-window → tell the user and stop. Do not pick the next item out of sequence.

   Status markers (both queue types):
   - `[ ]` — not yet started
   - `[~]` — created, awaiting user approval before advancing
   - `[x]` — done (include date: `[x] 2026-04-10`)
   - `[-]` — skipped by user

3. **Ask the user to choose a run mode:**

   | Mode | What happens each run |
   |---|---|
   | **Drip** | One item processed per run, auto-advances when done |
   | **Burst** | X items per run (ask how many) |
   | **Batch** | All items processed in one run |
   | **Drip + Approval** | One item per run, marked `[~]` when done, only advances after user approves |

   Propose the most natural mode given the workflow's purpose:
   - Daily content creation with review → Drip + Approval
   - Teaching material, one topic per class → Drip
   - A one-time bulk generation → Batch

4. **Add as the first two steps of the generated workflow:**
   - Step 1: Read `queue.md`. Find the first `[ ]` item. If none → tell the user the queue is empty and ask if they want to add more. Stop.
   - Step 2: Process that item. On completion, mark it `[x]` (Drip/Burst/Batch) or `[~]` (Drip + Approval) with today's date.

5. **For Drip + Approval mode**, the final step of the generated workflow is a **refinement loop**, not a binary gate.

   Present the output, then open a collaborative session:

   > *"Here's today's [lesson / video concept / post]. What would you like to change, or is this ready to go?"*

   The user can:
   - Request specific edits ("make this section shorter", "add a real-world example", "change the tone")
   - Ask for a full regeneration ("start over with a different angle")
   - Ask for alternatives on a specific part ("give me 3 different hooks for this")
   - Approve as-is and trigger the delivery step

   The agent applies each requested change, shows the updated result, and loops until the user explicitly approves. There is no limit on the number of refinement rounds. The agent must never interpret silence or a vague positive as approval — it must receive an explicit confirmation before executing any irreversible action.

   On explicit approval → execute the publishing/delivery step, mark the queue item `[x]`, advance to next.
   On explicit skip → mark `[-]` (skipped), advance to next.
   On "start over" → regenerate from scratch, re-enter the refinement loop.

6. **For workflows that generate multiple variations** (e.g., 3 versions of a social media post):
   - Generate all variations into the date folder: `v1/`, `v2/`, `v3/`
   - Present them side by side: *"Here are 3 versions — which one is closest to what you want, or what would you change in any of them?"*
   - The user can pick one as-is, pick one and request edits, or ask for a new variation based on combining elements
   - The refinement loop applies to whichever version the user is working on
   - Only the final chosen and approved version gets uploaded

Workflows with a batch queue must be idempotent: re-running on the same day must detect the `[~]` or `[x]` status and not regenerate unless the user explicitly asks.

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
If the workflow remains in `local/workflows/` → keep the trigger phrases in the file, but do not add it to `shared/manifest.md`.
If the workflow is published to `shared/workflows/` → add it to `shared/manifest.md` under **Workflow Inference**.

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

**Recurrence**: [e.g., Every weekday (Sun–Thu) at 08:00 — omit if not recurring]
**Input model**: [per-run / queue:drip / queue:drip+approval / queue:burst(N) / queue:batch — omit if not recurring]
**Output folder**: [e.g., workspace/ or /path/to/folder — omit if no file output]

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

1. Save the new workflow in `local/workflows/` by default
2. Register it in `local/manifest.toml`
3. If it replaces a scattered process in project-level docs → link back from those docs
4. If the user later says to publish, release, or share it:
   - move it to `shared/workflows/`
   - update `local/manifest.toml` to remove the local-only entry or mark it as shared
   - add it to `shared/manifest.md` under **Workflow Inference** with trigger phrases
   - add an entry to `shared/memory/decisions.md` noting why this process was formalized and what problem it solves

---

## Cross-References

- **Related**: `new-domain.md` — same process, different artifact
- **For editing existing workflows**: use `improve-workbench.md` instead
- **For project-specific instructions**: add to the project's `AGENTS.md`, not here
