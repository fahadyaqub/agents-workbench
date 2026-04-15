# Workflow: Debugging with Sentry

**Roles**: Expert Programmer · Reproduction and Regression Tester

**This workflow covers**: Fetching, triaging, tracking, and resolving application errors using Sentry.
**This workflow does NOT cover**: Performance/latency issues (use `debugging-signoz.md`), general debugging without Sentry (use `debugging.md`), fixing a confirmed bug (use `bugfix.md`).

> **Project-specific overrides**: If the project has its own Sentry workflow doc (e.g. `docs/sentry-workflow.md`), read it first. It takes precedence for project-specific commands, scripts, and report paths.

---

## Trigger Phrases

- "fetch sentry issues"
- "check sentry"
- "what's broken in sentry"
- "pull sentry issues from the last X hours"
- "start tracking [ISSUE-ID]"
- "add what we did to [ISSUE-ID] logs"

**Default time window**: 24 hours unless specified.

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
- Check whether a project-specific fetch script exists (`scripts/` directory)

---

## Local Workflow Area

Use `local/workspaces/debugging-sentry/` as this workflow's private writable area.

- If the folder does not exist yet → create it before writing workflow-owned notes, exported issue lists, or temporary artifacts.
- Treat it as pre-approved writable space for this workflow. Do not ask for extra permission for writes inside it.
- Prefer project-native report paths when the project already has them. Use this local workflow area for session notes and as the fallback tracking location when the project does not.

---

## Step 1: Fetch Issues

Run the project's fetch script if one exists. Otherwise use the Sentry CLI or API.

```bash
# If a project script exists:
node scripts/fetch-sentry-issues.js --since-hours <N> --include-seen

# Otherwise:
sentry-cli issues list --org <org-slug> --project <project-slug>
```

Tell the user: `Fetching Sentry issues from the last N hours...`

If the fetch fails → check credentials and project slug before retrying. Do not proceed without data.

---

## Step 2: Triage Issues

Classify each issue by priority:

| Priority | Criteria | Action |
|---|---|---|
| P0 / Fatal | Data loss, auth broken, app unusable | Address immediately |
| P1 / High | Core feature broken, high event count, rising trend | Investigate next |
| P2 / Medium | Degraded experience, moderate count, stable trend | Track |
| P3 / Low | Edge case, low count, flat or no trend | Log and monitor |

**Signals:**
- Level `fatal` → P0. Level `error` → P1 or P2. Level `warning` → P2 or P3.
- Count > 100 events → raise priority one level
- Rapidly rising count → raise priority one level
- Environment `production` → raise priority one level over staging/dev

---

## Step 3: Investigate a P0 or P1 Issue

For each P0/P1:

1. Read the full stack trace — identify the exact file, function, and line
2. Note when it first appeared
3. Run `git log --since="<first-seen-date>" --oneline` — find commits that coincide
4. Check for prior fix attempts: look for commits referencing the issue ID or error keywords
5. Form a root cause hypothesis before touching any code

If root cause is clear → go to Step 5 (fix or track).
If root cause is unclear → go to Step 4 (add instrumentation).

Do not write a fix until the root cause can be stated in one sentence.

---

## Step 4: Add Targeted Instrumentation (Only If Needed)

If the stack trace and existing logs are insufficient:

- Add the minimum breadcrumbs or log statements to test the hypothesis
- Target the specific decision point — do not instrument the whole class
- Use `console.debug()` or `console.trace()` instead of `console.log()` for any added log statements — distinguishes agent-added instrumentation from user-added logs. Not a hard rule, but a useful convention.
- Mark additions with `// DEBUG: remove after fix`

One round → re-deploy → check results.

If results confirm the hypothesis → proceed to Step 5.
If still inconclusive after one round → note this in the tracking file and escalate (see below).

---

## Step 5: Track the Issue

Create a tracking file for any issue you plan to fix or monitor.

Use this order:
1. If the project already has a native Sentry report path → use it.
2. Otherwise use `local/workspaces/debugging-sentry/<ISSUE-ID>.md`.

```
<project>/sentry-reports/issues/<ISSUE-ID>.md
```

Minimum content:

```markdown
# <ISSUE-ID> — <Issue Title>

- **Environment**: rd / rd2 / production
- **Level**: error | fatal | warning
- **First Seen**: YYYY-MM-DD
- **Status**: active | resolved | monitoring

## What the issue is
<Root cause hypothesis. Which component and code path is affected.>

## Timeline

### [YYYY-MM-DD] Sentry Observation
- Count: N (↑ / → / ↓ from previous)
- Notes: <brief context>
```

Update this file after every fix attempt and every subsequent fetch.

---

## Step 6: Fix or Escalate

If root cause is clear → hand off to `bugfix.md`. Note the files changed in the tracking file afterward.
If root cause is unclear → add instrumentation (Step 4), re-fetch in 24h, update the tracking file.
If another team member is needed → leave the tracking file with your full analysis and escalate explicitly.

---

## Step 7: Verify

After a fix is deployed:

- Re-fetch Sentry after sufficient traffic (minimum 1–4 hours)
- If count is dropping → continue monitoring
- If count is stable or rising → the fix did not work. Reopen investigation.
- If count reaches 0 for 3+ consecutive days → mark as resolved in the tracking file

---

## Memory

After triage, update the project's `MEMORY.md`:

```markdown
## Active Sentry Issues
| ID | Title | Env | Status | Count | Updated |
|----|-------|-----|--------|-------|---------|
| PROJ-123 | crash on seek | prod | active | 47↑ | YYYY-MM-DD |
```

Keep only P0/P1. Remove resolved issues.

---

## When to Stop and Escalate

Stop and tell the user if:
- Two rounds of instrumentation and the root cause is still unknown
- The Sentry issue count keeps rising despite a deployed fix
- The tracking file is growing without meaningful progress toward a fix
- The instrumentation added is now more complex than the original problem

---

## Completion Criteria

A Sentry session is complete when:
- All P0/P1 issues are either fixed, tracked with a clear hypothesis, or explicitly escalated
- Tracking files are up to date
- `MEMORY.md` reflects current active issues
- All temporary instrumentation is either removed or scheduled for removal
