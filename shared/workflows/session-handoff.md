# Workflow: Session Handoff

**Roles**: Product Manager · Product Owner / Delivery PM

**Input model**: per-run

**This workflow covers**: Splitting one broad task into one parent chat plus 2 to 5 focused child chat windows or tabs, each with its own short handoff file and launch prompt.

**This workflow does NOT cover:**
- Solving the underlying bug or feature itself (use the domain-specific workflow inside each child session)
- Running multiple agents inside one chat window
- Automatically opening new chat tabs or windows
- Publishing a local workflow to the shared system (use `improve-workbench.md` after the workflow proves useful)

---

## Trigger Phrases

- "delegate this"
- "split this into separate windows"
- "make handoff files for separate chats"
- "create a session handoff"
- "break this into focused AI sessions"
- "split this into multiple codex tabs"
- "make separate chat tabs for this"

---

## Prime Directive

**Split by thinking lane, not by file count.**

A handoff is only useful when each child session can ignore the other streams without losing important context. If two streams still need the same back-and-forth reasoning, they do not belong in separate windows yet.

---

## Prerequisites

Before starting:

- The parent task must contain at least **two distinct workstreams** with different reasoning paths.
- There must be a durable on-disk source of truth the child sessions can read.

If the work is small enough for one session, or the streams are too tightly coupled to separate cleanly, tell the user and stop. Do not force delegation for its own sake.

---

## Local Workflow Area

Use `local/workspaces/session-handoff/` as this workflow's private writable area.

- If the folder does not exist yet → create it before writing workflow-owned notes, handoff packages, or temporary artifacts.
- Treat it as pre-approved writable space for this workflow. Do not ask for extra permission for writes inside it.
- Create each run-specific handoff package as a subfolder inside this base area.

---

## Step 1: Confirm Delegation Is Warranted

Write one sentence explaining:
- what the parent task is
- why one session is too broad
- what the likely split is

If the split is still fuzzy after this sentence, do not create handoff files yet. Clarify the workstreams first.

Output: a one-line split thesis.

---

## Step 2: Identify the Workstreams

Group the parent task into **2 to 5** streams.

Prefer grouping by:
- bug family
- subsystem
- ownership boundary
- investigation path

Do **not** group by arbitrary size ("frontend half", "backend half") unless the reasoning really separates that way.

For each stream, write:
- name
- scope
- explicit exclusions
- likely next workflow inside the child session

Output: a stream list with clean boundaries.

---

## Step 3: Choose the Handoff Folder

Create one folder for this delegation package.

Use this order:
1. Use `agents-workbench/local/workspaces/session-handoff/<slug>/`.
2. If the folder does not exist yet, create it.

Name the folder with the task and date, for example:
- `local/workspaces/session-handoff/2026-04-15-sentry/`
- `local/workspaces/session-handoff/2026-04-15-auth-cleanup/`

Output: one folder path for all handoff artifacts.

---

## Step 4: Create the Parent Brief

Write `README.md` in the handoff folder.

It must contain:
- parent task summary
- why the work was split
- the stream list
- shared source-of-truth files
- a short note that the **parent chat stays open** for general discussion
- a short note that **child chats are separate tabs the user opens manually**

Output: one parent brief that explains the whole package.

---

## Step 5: Create One Handoff File Per Stream

Create one Markdown file per stream, for example:
- `auth.md`
- `media-stall.md`
- `other.md`

Each handoff file must contain:
- scope
- explicit non-goals
- current status
- relevant issue IDs or task IDs
- source files and report files to read first
- known history or prior fix attempts
- open questions
- recommended first 3 actions
- completion criteria for that stream

Do not duplicate the entire parent context. Include only what that child session needs.

Output: one self-sufficient handoff file per stream.

---

## Step 6: Create Launch Prompts

Create `launch-prompts.md` in the same folder.

For each stream, write a copy-paste prompt that:
- tells the child session which handoff file to read
- tells it what to ignore
- tells it which workflow to load next if obvious

Each prompt should be short enough to paste directly into a new AI chat window.

Format each prompt as its own clearly labeled fenced code block so the UI shows a copy button by default. Do not hide the useful text inside prose paragraphs.

Example shape:

> Read `<path>/auth.md`. Work only on the auth issue family. Ignore media stall and unrelated issues. Use the Sentry debugging workflow where relevant.

Output: one launch prompt per stream.

---

## Step 7: Explain the Launch Mechanism

State this explicitly in the parent brief and launch prompts:

- This workflow is **tool agnostic**. It should work in Codex, Claude, or any similar chat tool.
- If the current tool supports opening new windows or tabs programmatically, use that capability.
- If the current tool does **not** support opening new windows or tabs programmatically, stop at the prepared prompts.
- The workflow prepares the split package only.
- The user opens each new tool window or tab manually and pastes the matching launch prompt.
- The parent chat remains open for broad discussion, triage changes, or creating more handoffs.

Output: a clear manual launch instruction.

---

## Step 8: Launch the Child Sessions

Start one new chat window or tab per stream.

If the current tool cannot do that automatically, tell the user to open the new windows or tabs manually and paste the prompts from `launch-prompts.md`.

Each child session should:
- read only its handoff file first
- ignore unrelated streams
- stay focused on that one stream

Keep the parent session open as a general discussion and coordination tab. It does not need to collect results from the child tabs unless the user asks for that later.

Output: active child sessions with clear scope.

---

## Step 9: Stop at the Split

Once the handoff files and launch prompts exist, the workflow is done.

Do not add result-collection, merge-back, or coordination overhead unless the user explicitly asks for it later.

Output: a finished split package ready for manual tab launch.

---

## When to Stop and Escalate

Stop and tell the user if:
- the task cannot be split into cleanly independent streams
- a child session would still need most of the parent context to proceed
- the handoff package is becoming more complex than the task itself
- the split would create multiple tabs that all need to edit the same files heavily in parallel

---

## Completion Criteria

Session handoff is complete when:
- the parent brief exists
- each stream has its own handoff file
- launch prompts exist for each stream as clearly copyable code blocks
- a new AI chat window can start from a handoff file without re-reading the full parent thread

---

## Output Template

### Parent brief

```markdown
# Session Handoff: <task name>

## Why This Was Split
<one paragraph>

## Streams
- <stream 1>: <scope>
- <stream 2>: <scope>

## Shared Source of Truth
- <file/path>
- <file/path>

## How To Use This
- Parent chat stays open for broad discussion.
- Open one new AI chat window or tab per stream.
- Paste the matching prompt from `launch-prompts.md` into each new tab.
```

### Launch prompts

````markdown
# Launch Prompts

## Auth

```text
Read <path>/auth.md. Work only on the auth stream. Ignore media-stall and unrelated issues. Load the relevant workflow next.
```

## Media Stall

```text
Read <path>/media-stall.md. Work only on the media-stall stream. Ignore auth and unrelated issues. Load the relevant workflow next.
```
````

### Stream handoff

```markdown
# <Stream Name>

## Scope
<what this child session owns>

## Do Not Touch
- <excluded area>

## Read First
- <file/path>
- <file/path>

## Current State
<high-signal summary only>

## Open Questions
- <question>

## First 3 Actions
1. <action>
2. <action>
3. <action>

## Completion Criteria
- <condition>
- <condition>
```

---

## Recommended Next Workflows

- [ ] `debugging-sentry.md` — use inside a child session when the stream is a Sentry investigation
- [ ] `bugfix.md` — use after a child session confirms root cause
- [ ] `planning.md` — use if the split reveals a larger redesign instead of a quick fix
