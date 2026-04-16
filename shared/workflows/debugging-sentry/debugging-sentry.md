# Workflow: Debugging with Sentry

**Roles**: Expert Programmer · Reproduction and Regression Tester

**This workflow covers**: Fetching, triaging, tracking, and resolving application errors using Sentry.
**This workflow does NOT cover**: Performance/latency issues (use `debugging-signoz.md`), general debugging without Sentry (use `debugging.md`), fixing a confirmed bug (use `bugfix.md`).

---

## Reminder (always print this first)

Before doing anything else, always print this to the user:

```
📋 Sentry commands:
  • "fetch sentry issues" / "fetch sentry issues from the last X hours"
  • "check [issue/group name]" — reviews diagnostic logging, determines if fix worked, gives final verdict
  • "start tracking [ISSUE-ID]"  OR  "start tracking [group name]"  OR  "group all [Media Stall] issues"
  • "add what we did to [ISSUE-ID] logs"  OR  "add what we did to [group name] logs"
```

---

## Trigger Phrases

When the user says any of the following, run the Sentry analysis workflow:

- "fetch sentry issues"
- "run sentry analysis"
- "check sentry"
- "what's broken in sentry"
- "pull sentry issues"
- "fetch sentry issues from the last X hours" → use X as the `--since-hours` value
- "check [issue/group]" / "review [issue/group]" / "check [issue] with history" → see **Issue Review** section below

**Default window**: 24 hours. If the user specifies a time (e.g. "last 10 hours", "since the deploy"), use that value. If ambiguous, use 24h.

---

## Prime Directive

**Sentry is a signal, not a solution.**

Fetching issues, adding breadcrumbs, and improving logging are tools to find bugs — they are not the work.
If instrumentation is growing faster than fixes, stop. Raise it with the user.
Each Sentry session should produce either a fix, a tracked hypothesis, or a confirmed escalation — not just more logging.

---

## Prerequisites

Before starting:
- Sentry project slug and organization are known (check project `AGENTS.md` or `.env`)
- Access to Sentry is available (API token or CLI auth)

---

## Local Workflow Area

Use `local/workspaces/sentry-issues/` as this workflow's private writable area.

- If the folder does not exist yet → create it before writing workflow-owned notes, exported issue lists, or temporary artifacts.
- Treat it as pre-approved writable space for this workflow. Do not ask for extra permission for writes inside it.
- This area includes subdirectories like `issues/` (for tracking files) and `daily-analysis/` (for daily reports).

---

## Step 1: Fetch Issues

Run **once, no environment filter** — all environments (rd, rd2, rd3, production) are returned in a single call:

```bash
node scripts/fetch-sentry-issues.js --since-hours <N> --include-seen
# (Note: path is relative to this workflow file directory)
```

The `--include-seen` flag ensures all active issues in the window are returned with full data (counts, levels, metadata) — not just new ones since the last fetch.

Print to the user: `"Fetching Sentry issues from the last N hours across all environments..."`

Output is saved automatically to `local/workspaces/sentry-issues/latest-issues.json`.

---

## Step 2: Load Tracked Issues

Read all files in `local/workspaces/sentry-issues/issues/` to get the history of currently tracked issues.

---

## Step 3: Generate Daily Report

Create `local/workspaces/sentry-issues/daily-analysis/YYYY-MM-DD.md` with this structure:

```markdown
# Sentry Daily Analysis — YYYY-MM-DD

## Summary
- Tracked issues: X (individual + groups)
- New/untracked issues: Y
- Issues with exact fix ready: Z

---

## 1. Tracked Issues

For each tracked issue or group (files in `local/workspaces/sentry-issues/issues/`), show the latest
observation from that file alongside the fresh counts from today's fetch.
Keep groups together — show all members of a group under one heading.

### [GROUP: Media Stall] — Total: 1010 events ↑
> Latest from tracking file: <paste most recent Timeline entry from the group file>

| Member | Title | Count | Trend |
|--------|-------|-------|-------|
| APP-E | ... | 588 | ↑ |
| APP-G | ... | 350 | ↑ |

**Today's update**: <one line — is this improving, stable, regressing, or spiking?>

---

### [APP-123] Title — Env: rd2 — Count: 47 ↑
> Latest from tracking file: <paste most recent Timeline entry>

**Today's update**: <one line — stable / improving / regressing / new spike>

---

## 2. New / Untracked Issues — Need Investigation

Issues from the fetch that are NOT in any tracking file. These need triage.
Sorted by count descending.

### [APP-456] Title — Env: rd — Count: 23 ↑
**What's happening**: <concise description>
**Likely cause**: <root cause hypothesis from stack trace / metadata>
**Suggested next step**: start tracking? investigate first? ignore?

---

## 3. Issues with an Exact Fix Ready

Issues (tracked or new) where the root cause is known and the code fix is unambiguous.
List these at the bottom. **Do not fix any of these without explicit user approval.**
After displaying this section, ask: "Want me to apply any of these fixes?"

### [APP-789] Title — Env: rd — Count: 12
**Root cause**: <specific cause>
**Exact fix**: <precise change — file path, what to change, one-sentence description>
**Risk**: low | medium | high — <why>

---

## All Issues (brief table)
| Short ID | Title | Env | Count | Trend | Tracked | Exact Fix |
|----------|-------|-----|-------|-------|---------|-----------|
| APP-123 | ... | rd2 | 47 | ↑ | yes | no |
| APP-789 | ... | rd | 12 | → | no | yes |
```

**Classification rules:**
- **Tracked**: the issue ID (or any of a group's member IDs) appears in a file under `local/workspaces/sentry-issues/issues/`
- **Exact fix**: you can point to a specific file + change that definitively resolves it — no investigation needed, no ambiguity
- An issue can be both tracked AND have an exact fix — it appears in section 1 with its history AND in section 3 with the fix
- If a tracked issue also has an exact fix, show it in both sections

---

## Step 4: Update Tracked Issue Files

For each file in `local/workspaces/sentry-issues/issues/`:
- If the issue appears in today's fresh data → append a `### [YYYY-MM-DD] Sentry Observation` entry
- If the issue is NOT in today's fresh data → append a note: "Not seen in fetch on YYYY-MM-DD — may be resolved or rate dropped below threshold"

---

## Step 5: Update Memory

Update the `## Active Sentry Issues` table in `local/memory/debugging-sentry.md` with the latest P0/P1 issues (high count or fatal level).

---

## Tracking Issue Files Format & Guide

### Location
`local/workspaces/sentry-issues/issues/APP-123.md` (one file per tracked issue)

### Format Definition
```markdown
# APP-123 — <Issue Title>

- **Sentry URL**: https://sentry.io/organizations/<org-slug>/issues/<id>/
- **Short ID**: APP-123
- **Environment**: rd2 / production / etc.
- **Level**: error | fatal | warning
- **First Seen**: YYYY-MM-DD
- **Tracking Started**: YYYY-MM-DD
- **Status**: active | resolved | monitoring

## What the issue is
<Written once when tracking starts. Describe what's happening, relevant stack trace
context, and the likely root cause. Be specific about which component / code path is involved.>

## Timeline

### [YYYY-MM-DD] Sentry Observation
- Count: 47 (↑ from 31 previous)
- Substatus: ongoing
- Notes: <any notable context from the latest event data>

### [YYYY-MM-DD] Fix Attempt 1
- **Files changed**: <list of files from git diff>
- **What was done**: <summary of the change — what was fixed or what logging was added>
- **Sentry logging added**: <any new captureException / addBreadcrumb / captureMessage calls>
```

---

## Grouping Issues

When the user says any of:
- **"group all Media Stall issues"** → match by title keyword
- **"group all [Auth] issues"** → match by title prefix/tag
- **"group APP-V, APP-H, APP-W"** → match by explicit IDs
- **"track all Media Stall issues together"** → same as group

**Step 1: Resolve members**
- Match issues from `local/workspaces/sentry-issues/latest-issues.json` using explicit ID or keyword matches. List them to the user before creating the file.
- Derive the group name from the keyword: "Media Stall" → `group-media-stall.md`.

**Step 2: Create Group Tracking File**
1. Slugify the name: e.g. "auth failures" → `group-auth-failures.md`
2. **Scan git history** (`git log --since="2 weeks ago"`) for commits relevant to any member issues.
3. Create `local/workspaces/sentry-issues/issues/group-<name>.md`:

```markdown
# Group: Auth Failures

- **Members**: APP-V, APP-H, APP-W, APP-1T
- **Tracking Started**: YYYY-MM-DD
- **Status**: active | resolved | monitoring

## What this group is
<Describe the shared root cause or theme. What do these issues have in common?
What is the underlying problem being investigated?>

## Member Issues
| Short ID | Title | Count | Last Seen |
|----------|-------|-------|-----------|
| APP-V | firebase_session_bootstrap_incomplete | 46 | 2026-04-06 |
| APP-H | firebase_auto_login_failed_retrying | 35 | 2026-04-06 |

## Timeline

### [YYYY-MM-DD] Sentry Observation
- APP-V: 46 events | APP-H: 35 | APP-W: 33 | APP-1T: 4
- Total: 118 events across group
- Notes: <overall assessment — are counts rising, stable, falling?>

### [YYYY-MM-DD] Fix Attempt 1
- **Files changed**: ...
- **What was done**: ...
- **Sentry logging added**: ...
```

4. Update `local/memory/debugging-sentry.md` — add a single row for the group instead of individual rows.
5. Individual member issue files are NOT needed — the group file is the tracking unit.

---

## "Start tracking APP-123"

When the user says "start tracking APP-123":

1. Look up the issue in `latest-issues.json`.
2. **Scan git history for prior fix attempts**:
   ```bash
   git log --since="2 weeks ago" --oneline
   ```
   For relevant commits, read `git show <hash> --stat` and `git show <hash>`. Find what was done.
3. Create `local/workspaces/sentry-issues/issues/APP-123.md`.
4. Include prior fix attempts as `### [commit-date] Fix Attempt N` entries **before** the first Sentry Observation.
5. Update `local/memory/debugging-sentry.md`'s Active Sentry Issues section.

---

## Issue Review — "check [issue]" / "review [issue]" / "check [issue] with history"

When the user asks to check, review, or investigate a tracked issue, do ALL of the following without asking:

### Step 1: Load context
- Read the tracking file(s): `local/workspaces/sentry-issues/issues/*.md`
- Read `local/workspaces/sentry-issues/latest-issues.json` for current counts
- The tracking file is the source of truth for what was tried. **Do not check git unless** the user references something (e.g. "the audio logging we added") that has no corresponding entry in the tracking file. Only then, check git to find what changed and understand it.

### Step 2: Evaluate every piece of instrumentation from the last tracking entry
For each tag, event, or log added in the last entry:
- Check `latest-issues.json` — does **latestEvent.tags** for the affected issues contain those tags?
- **YES** → interpret the values and draw a conclusion
- **NO** → conclude the condition was not triggered (rules out that hypothesis), OR compare event timestamps to commit timestamps to check if the app was redeployed — if events postdate the commit and the tags are still absent, the hypothesis is ruled out

Do this for every piece of instrumentation logged. Don't ask whether to check — just check and report the result.

### Step 3: Answer these questions directly, for every item in the last tracking entry
1. **Did it fire / produce signal in Sentry?**
2. **What does that tell us?** (confirms cause, rules out hypothesis, or inconclusive)
3. **Can we fix it now?** If yes — what exactly needs to change (file, function, specific fix)
4. **If not fixable yet** — what specific additional signal is needed and where to add it

### Step 4: Update the tracking file
Append a `### [YYYY-MM-DD] Diagnostic Review` entry with the findings.

### Step 5: Output to user
- Lead with the last update and whether it worked — **not** a chronological list of everything tried
- The full history in the tracking file is for the agent's reference, not for the user's reading
- Be specific: "the auth_failure tag never fired → auth is ruled out" not "we may want to investigate auth further"
- End with a concrete next step or verdict, not open questions

---

## "Add what we did to APP-123 logs"

When the user says "add what we did to APP-123 logs":

1. Read `local/workspaces/sentry-issues/issues/APP-123.md` — find date of the last entry.
2. Run `git log --since="<last-entry-date>" --oneline`.
3. Run `git diff <oldest-relevant-commit>^..HEAD -- <relevant files>`. Look for `captureException`, `addBreadcrumb`, etc., and fixes to the code path.
4. Append a `### [YYYY-MM-DD] Fix Attempt N` entry summarizing files changed, work done, and Sentry logging.

---

## Add Targeted Instrumentation (Only If Needed)

If the stack trace and existing logs are insufficient:
- Add the minimum breadcrumbs or log statements to test the hypothesis. Target the specific decision point.
- Use `console.debug()` or `console.trace()` instead of `console.log()` for added statements (useful convention to distinguish agent logs).
- Mark additions with `// DEBUG: remove after fix`.

One round → re-deploy → check results. If still inconclusive after one round, note this in the tracking file and escalate.

---

## When to Stop and Escalate

Stop and tell the user if:
- Two rounds of instrumentation and the root cause is still unknown.
- The Sentry issue count keeps rising despite a deployed fix.
- The tracking file is growing without meaningful progress.

---

## Completion Criteria

A Sentry session is complete when:
- All P0/P1 issues are fixed, tracked, or escalated.
- Tracking files and Daily Report are up to date.
- `local/memory/debugging-sentry.md` reflects current active issues.
- All temporary debugging info is organized.
