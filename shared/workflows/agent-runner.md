# Workflow: Agent Runner

**Roles**: All

**Input model**: per-run

**This workflow covers**: The orchestrator-worker pre-flight for execution-heavy tasks — the orchestrator checks whether work can be decomposed and delegated to free/cheap provider models running in parallel. The orchestrator writes self-contained task specs, invokes workers through local adapters, reviews results, captures learnings, and integrates accepted output.

**This workflow does NOT cover**:
- Tasks that require deep reasoning, multi-file architectural decisions, or tight back-and-forth with the user (these bypass to inline execution)
- Long-running agentic workers that need tool use, browsing, or filesystem access
- Result merging or code integration (orchestrator-only, never re-delegated)
- Questions, advisory reviews, setup checks, and conversational tasks unless the user explicitly asks for parallel critiques

---

## This Workflow Runs by Default for Execution Tasks

**Do not wait for a trigger phrase when the task is execution-heavy.** Run the pre-flight check before implementation, bulk edits, migrations, fixture generation, broad audits, repetitive transforms, or other work that may split into independent subtasks.

Skip immediately for simple questions, advisory reviews, clarification, setup checks, and tasks that are obviously faster inline. The user can also explicitly skip it ("do this inline", "just do it", "don't delegate").

### Trigger Phrases (explicit invocation)

- "spawn free agents for this"
- "delegate to free models"
- "use agent runner"
- "batch this out to cheap models"
- "run these tasks in parallel with OpenRouter"
- "orchestrate free workers for this"
- "hermes pattern"
- "openclaw this"
- "I want to be the orchestrator"

### Bypass Phrases (skip delegation, do inline)

- "just do it"
- "do this yourself"
- "don't delegate"
- "skip the agent runner"
- "inline"

---

## User Visibility — Required at Every Step

**The user must be able to see exactly what is happening.** Do not run silently. At each step below, output a progress update in chat before and after acting.

### Pre-flight result (after Step 0)
```
Agent Runner — pre-flight
  Decision:   delegating | bypassing
  Reason:     <why — e.g. "4 independent subtasks found" or "task < 5 min inline">
  Tasks:      N
  Models:     <provider: model>
```
For a bypass, just:
```
Agent Runner — bypassing (<reason>)
```

### Task dispatch (start of Step 4, once per task)

Before firing any requests, create a background task entry for each worker using `TaskCreate` when that tool is available:
- **title**: `[agent-runner] task-NNN — <one-line scope>`
- **status**: `in_progress`

If task-panel tools are unavailable, use the run folder `README.md` checklist and chat updates as the visibility surface.

Then print the dispatch list in chat:
```
→ task-001  <one-line scope>  [groq · llama-3.3-70b-versatile]
→ task-002  <one-line scope>  [openrouter · mistral-7b-instruct:free]
...
```
Fire all requests concurrently. The task panel now shows each worker running.

### Per-result (as each worker responds, Step 6)

As each result comes in, immediately call `TaskUpdate` on the matching task when that tool is available:
- accepted → `status: completed`
- rejected / needs retry → `status: in_progress` (keep visible during retry)
- escalated → `status: completed`, append `(escalated)` to title
- permanently failed → `status: completed`, append `(failed)` to title

If task-panel tools are unavailable, update `README.md` and print in chat as results arrive:
```
✓ task-001  accepted          2 341ms
✗ task-002  rejected          4 102ms  → format wrong, retrying
↑ task-003  escalated         1 889ms  → too complex for free model
```

### Run summary (end of Step 8, before Step 9)
```
  Agent Run complete
  Accepted:    8 / 10
  Escalated:   1 / 10  (doing inline)
  Rejected:    1 / 10  (skipped)
  Time saved:  faster
  Worth it:    yes
```

Then continue with integration, eval, and learnings as normal.

---

## Prime Directive

**Free models are fast and cheap, but context-blind.**

Every task spec must be fully self-contained — the worker reads only its spec and nothing else. The orchestrator's job is to write specs tight enough that a mid-tier model cannot misunderstand them.

The leverage is in decomposition quality, not model quality.

---

## Step 0: Pre-flight Check (runs for execution-heavy tasks)

Before starting substantial execution work, run this check. It takes under a minute. Skip immediately for questions, advisory reviews, clarification, or setup checks.

### 0a. Check setup

Read `local/setup.toml`. If `[agent_runner_setup]` is missing or `status = "pending"` → run `agent-runner-setup.md` first, then return here.

If `mode = "off"` → bypass unless the user explicitly asked to use agent runner.
If `mode = "suggest"` → if the delegate-only-if gate passes, tell the user delegation looks useful before invoking workers.
If `mode = "auto"` → if the delegate-only-if gate passes, invoke workers automatically.

### 0b. Read learnings

Read in order:
1. `shared/memory/agent-runner/seed.md` — structural rules and model guidance (always)
2. All other `shared/memory/agent-runner/<username>.md` files — teammates' promoted lessons (skim for patterns relevant to this task type)
3. `local/memory/agent-runner-learnings.md` — your own run history (skip if it doesn't exist yet)

Look for:
- Task patterns that have failed repeatedly → avoid delegating those
- Fast-path rules that match this task → bypass immediately if one applies
- Model notes → which free models handle this task type well

### 0c. Apply the delegate-only-if gate

Delegate only if ALL of the following are true:

| Condition | Why |
|---|---|
| The task is execution-heavy rather than conversational | Runner overhead must buy real leverage |
| Expected inline time is > ~10 minutes | Short tasks are faster inline |
| There are 3+ independent subtasks after decomposition | Parallelism has to pay for spec-writing |
| Each subtask has a binary completion criterion | Results must be reviewable |
| Task specs can be written without live file/tool access by the worker | Workers are one-shot prompts |
| No secrets or sensitive proprietary context need to be sent to providers | Do not leak private material |
| The task type does not have a logged failure rate > 50% in learnings | Past data says whether to bother |
| The user has not asked to skip delegation | Explicit override wins |

Bypass and execute inline if ANY of the following are true:

| Condition | Why |
|---|---|
| The whole task takes < ~5 minutes inline | Writing specs costs more than the task itself |
| Fewer than 3 subtasks after decomposition | Not enough parallelism to pay off |
| Task requires tool use, browsing, or real-time file access | Free models can't do these |
| Task is a single tightly-coupled reasoning chain | Can't be split without losing context |
| Task type has a logged failure rate > 50% in learnings | Past data says don't bother |
| User said "just do it" or similar | Explicit override |
| Task is a clarifying conversation or question | Not an execution task |
| Task is an advisory workflow/design review | Value is in integrated judgment unless the user asks for parallel critiques |
| Required context contains secrets or sensitive proprietary material | Do not send it to providers |

If bypassing: skip to the normal workflow for this task type. Record the bypass in learnings only when you actually evaluated the runner gate; do not log every trivial conversation.

### 0d. Decompose

If not bypassing, list the atomic subtasks. Each must be:
- **Atomic** — one clear input, one clear output
- **Independent** — does not depend on another subtask's result
- **Bounded** — a competent developer could do it in under 10 minutes
- **Specifiable** — you can write a binary completion criterion for it

If you cannot produce 3+ clean atomic subtasks, bypass and do it inline.

Output: a numbered subtask list. Then continue to Step 1.

---

## Step 1: Create the Run Folder

Use `local/workspaces/agent-runner/` as this workflow's private writable area.

Create `local/workspaces/agent-runner/<run-id>/` with subfolders:
```
<run-id>/
  README.md       — run brief and live status
  tasks/          — one spec file per task
  results/        — one result file per task
  eval.md         — post-run eval (written in Step 9)
```

Name the folder with date and context: `2026-05-29-eval-cleanup/`, `2026-05-29-segment-fixes/`, etc.

Write `README.md`:

```markdown
# Agent Run: <name>

**Date**: <date>
**Orchestrator**: <Claude / Codex / etc.>
**Worker model**: <model>
**Task count**: <N>

## Goal
<one paragraph>

## Tasks
- [ ] task-001 — <scope>
- [ ] task-002 — <scope>
...

## Status
pending
```

---

## Step 2: Write Task Spec Files

Create `tasks/task-NNN.md` for each subtask. This is the worker's entire world — include everything it needs inline.

```markdown
# Task <NNN>: <short name>

## Context
<Everything the worker needs. Paste relevant code inline. Include file path, function name, line range.
Do NOT reference other tasks or the orchestrator's reasoning.>

## Input
<Inline content: code snippet, JSON, list, etc.>

## Instructions
1. <explicit imperative>
2. <explicit imperative>
3. Return only the Output Format below.

## Output Format
<Exact format: a TypeScript function / a JSON object / a markdown list / a single sentence>

## Completion Criterion
<One binary sentence: "Complete when output contains X and does not contain Y.">

## Do Not
- <pitfall 1>
- <pitfall 2>
```

### Spec quality checklist

Before proceeding, verify each spec:

- [ ] Context is fully inline — no external file references
- [ ] Context contains no API keys, credentials, private tokens, raw customer data, or sensitive proprietary material
- [ ] Instructions are numbered imperatives
- [ ] Output Format is unambiguous — one correct shape
- [ ] Completion Criterion is binary
- [ ] "Do Not" has at least one realistic pitfall

---

## Step 3: Select Provider and Worker Models

Read `local/setup.toml` to get configured provider names. Read `local/personal-memory.md` only at invocation time to retrieve the specific key needed by the selected adapter. If no provider is configured → run `agent-runner-setup.md` first.

**Default strategy**: use Groq first (faster, higher throughput), fall back to OpenRouter if Groq rate limits are hit mid-run.

### Groq (free tier — prefer for speed)

| Task type | Model |
|-----------|-------|
| Simple transforms, low latency priority | `llama-3.1-8b-instant` |
| Moderate reasoning | `gemma2-9b-it` |
| Higher quality | `llama-3.3-70b-versatile` |
| Long context | `mixtral-8x7b-32768` |

### OpenRouter (free tier — fallback or when Groq rate-limited)

| Task type | Model |
|-----------|-------|
| Simple transforms, boilerplate | `mistralai/mistral-7b-instruct:free` |
| Moderate reasoning | `meta-llama/llama-3.1-8b-instruct:free` |
| Code quality matters | `mistralai/mistral-small-3.1-24b-instruct:free` |
| Deep reasoning, complex rewrites | `deepseek/deepseek-r1:free` |

Override with fast-path rules from `shared/memory/agent-runner/<username>.md` and `local/memory/agent-runner-learnings.md` — if a model has a bad track record for this task type, use a better one.

---

## Step 4: Invoke Workers in Parallel

**System prompt** (same for all workers in a run):
```
You are a precise code assistant. You will receive a task spec. Follow the Instructions exactly. Produce only the Output Format described. Do not explain your reasoning unless the Output Format requires it.
```

**User prompt**: full contents of `task-NNN.md`.

Use the local provider adapters:

```bash
scripts/agent-runner/groq.sh <model> <tasks/task-NNN.md>
scripts/agent-runner/openrouter.sh <model> <tasks/task-NNN.md>
```

The adapters expect `GROQ_API_KEY` or `OPENROUTER_API_KEY` in the environment. If keys are only stored in `local/personal-memory.md`, retrieve and export the selected key immediately before invocation, then unset it after the run. Do not print keys.

Fire all requests concurrently — they are independent by design. Use a per-task timeout of 60 seconds for simple transforms and 180 seconds for moderate reasoning. If a provider rate-limits, retry once with the fallback provider or mark the task escalated.

---

## Step 5: Write Raw Results

Immediately after each worker responds, write `results/result-NNN.md`:

```markdown
# Result <NNN>: <task name>

**Model**: <model>
**Latency**: <ms or s>
**Status**: raw

## Raw Output
<exact model response, unedited>
```

Preserve raw output before reviewing — this is the eval record.

---

## Step 6: Review Results

For each result, check against its spec:

1. Does it satisfy the Completion Criterion?
2. Is the Output Format correct?
3. Would applying this break anything?

Update the result file:

```markdown
**Status**: accepted | rejected | needs-fix

## Review Notes
<one or two sentences>

## Final Output
<accepted output, or blank if rejected>
```

Update the task checklist in `README.md`.

---

## Step 7: Handle Failures

| Situation | Action |
|---|---|
| Worker misunderstood spec | Rewrite spec (be more explicit) → retry same model |
| Wrong output format | Tighten Output Format section → retry |
| Task too complex for free model | Escalate: retry with better model or do inline |
| Task turned out dependent | Resequence → redo after dependency resolves |
| > 30% of tasks fail | Stop. Decomposition was wrong. Redo Step 0c. |

Mark escalated tasks: `Status: escalated-to-orchestrator`.

---

## Step 8: Apply Accepted Results

Integrate accepted outputs. This step is orchestrator-only — never re-delegate integration.

Update `README.md` status to `complete`.

---

## Step 9: Eval Harness (runs after every run, including fast-path bypasses)

Write `eval.md` in the run folder (or append to `local/memory/agent-runner-learnings.md` directly for bypass records).

```markdown
# Eval: <run-id>

**Date**: <date>
**Task count**: <N> (or 0 for bypass)
**Bypass reason**: <if bypassed>
**Models used**: <list>

## Metrics
- Accept rate: <accepted / total>%
- Escalation rate: <escalated / total>%
- Estimated time saved vs. inline: faster / neutral / slower
- Worth delegating: yes / no

## Per-task Notes
| Task | Model | Status | Latency | Notes |
|------|-------|--------|---------|-------|
| 001 | mistral-7b | accepted | 2s | — |
| 002 | llama-3.1-8b | rejected | 4s | format wrong |

## Run Verdict
<1-2 sentences: was this worth doing? what would you do differently?>
```

---

## Step 10: Capture Learnings and Post to Community

After writing `eval.md`, run three passes in order.

### Pass 1 — Write to local log (always)

Append every run's lessons to `local/memory/agent-runner-learnings.md`. Write freely — even small observations are useful here.

```markdown
## <date> — <short title>

**Pattern**: <task type or category>
**Model**: <model used, or n/a>
**Outcome**: accepted | rejected | escalated | bypassed
**Lesson**: <one sentence>
**Fast-path rule**: <new bypass condition, or "none">
```

If a lesson contradicts an existing entry, update the old entry instead of appending.

### Pass 2 — Promote to shared contributions (when worth it)

For each local entry, ask: *"Would this help a teammate on a different project?"*

If yes → append to `shared/memory/agent-runner/<your-username>.md` (read username from `local/personal-memory.md`).

Only promote if the lesson is repeatable, specific, and actionable beyond this project. If it only makes sense in your project context → keep it local.

### Pass 3 — Post to community Supabase (only if enabled)

Read `local/setup.toml`. If `[agent_runner_setup].post_remote_evals` is not `true`, write `remote_post: skipped_disabled` in `eval.md` and stop.

If remote posting is enabled, read connection details from `shared/memory/agent-runner/config.md`.

Build the payload from `eval.md`:

```json
{
  "user_hash":        "<from local/personal-memory.md — agent_runner user_hash>",
  "run_id":           "<run folder name>",
  "orchestrator":     "claude",
  "task_type":        "<inferred from the task — e.g. 'code-refactor', 'boilerplate', 'data-transform'>",
  "task_count":       0,
  "bypass":           false,
  "bypass_reason":    null,
  "provider":         "<groq | openrouter>",
  "model":            "<exact model string>",
  "accept_rate":      0.0,
  "escalation_rate":  0.0,
  "avg_latency_ms":   0,
  "time_saved":       "<faster | neutral | slower>",
  "worth_delegating": true,
  "verdict":          "<one sentence from eval.md>"
}
```

For bypass runs: set `bypass: true`, `bypass_reason: "<reason>"`, leave model/rate fields null.

**POST with retry:**

```
POST {SUPABASE_URL}/rest/v1/evals
apikey: {SUPABASE_ANON_KEY}
Authorization: Bearer {SUPABASE_ANON_KEY}
Content-Type: application/json
Prefer: return=minimal

{payload}
```

- If `2xx` → done
- If `503` (project paused, auto-restoring) → wait 30 seconds → retry once
- If retry also fails → note `remote_post: failed` in `eval.md`, continue silently
- **Never block or fail a task run because of a Supabase issue**

---

## Completion Criteria

A run is complete when:
- Every task has a result with status `accepted`, `rejected`, or `escalated-to-orchestrator`
- `eval.md` is written
- Any durable lessons are appended to `local/memory/agent-runner-learnings.md`
- `README.md` status is `complete`

---

## Orchestrator Mental Model

Think of yourself as a **staff engineer with a team of interns and a judgment that compounds over time**:

- You write the design doc (task spec)
- Interns (free models) implement in parallel
- You review for correctness, not style
- You escalate only what needs real judgment
- You never delegate integration
- **After every run, you update your mental model so next time is faster**

The learning loop is what makes this compound. A workflow that doesn't learn degrades into overhead.

---

## Recommended Next Workflows

- `session-handoff.md` — tasks too large for specs, need separate reasoning sessions
- `code-review.md` — after integrating accepted results, before committing
- `commit-and-push.md` — to land the integrated batch
