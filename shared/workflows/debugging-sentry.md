# Workflow: Debugging with Sentry

**Roles**: Expert Programmer · Reproduction and Regression Tester

Use this workflow when investigating, triaging, or tracking errors using Sentry.

> **Project-specific overrides**: If the project has its own Sentry workflow doc (e.g. `docs/sentry-workflow.md`), read it first. It takes precedence over this file for project-specific commands, scripts, and report paths.

---

## Setup Prerequisites

Before running this workflow, confirm:
- Sentry project slug and organization are known (check project `AGENTS.md` or `.env`)
- Access to Sentry is available (API token or CLI auth)
- Any project-specific fetch scripts exist (check `scripts/` directory)

---

## Trigger Phrases

- "fetch sentry issues"
- "check sentry"
- "what's broken in sentry"
- "pull sentry issues from the last X hours" → use X as the time window
- "start tracking [ISSUE-ID]"
- "add what we did to [ISSUE-ID] logs"

**Default time window**: 24 hours unless specified.

---

## Step 1: Fetch Issues

Run the project's fetch script if one exists. Otherwise use the Sentry CLI or API.

```bash
# If a project script exists:
node scripts/fetch-sentry-issues.js --since-hours <N> --include-seen

# Otherwise use Sentry CLI:
sentry-cli issues list --org <org-slug> --project <project-slug>
```

Print to the user: `Fetching Sentry issues from the last N hours...`

Save or note the output location for the next steps.

---

## Step 2: Triage Issues

Classify each issue:
- **P0 / Fatal** — data loss, auth broken, app unusable → address immediately
- **P1 / High** — core feature broken, high event count, rising trend → investigate next
- **P2 / Medium** — degraded experience, moderate count, stable trend → track
- **P3 / Low** — edge case, low count, no trend → log and monitor

**Signals for priority:**
- Level: `fatal` → P0, `error` → P1/P2, `warning` → P2/P3
- Count: > 100 events → raise priority
- Trend: rapidly rising count → raise priority
- Affected environment: `production` → raise priority over staging/dev

---

## Step 3: Investigate an Issue

For each P0/P1 issue:

1. Read the full stack trace — identify the exact file, function, and line
2. Check when it first appeared — correlate with recent deploys or changes
3. Run `git log --since="<first-seen-date>" --oneline` to find relevant commits
4. Check if a fix was already attempted: look for commits referencing the issue ID or error type
5. Form a hypothesis about root cause before touching code

Do not write a fix until you can explain the root cause in one sentence.

---

## Step 4: Track the Issue

Create a tracking file for any issue you plan to fix or monitor:

```
<project>/sentry-reports/issues/<ISSUE-ID>.md
```

Minimum content:
- Issue metadata (ID, title, environment, level, first seen)
- What the issue is (root cause hypothesis, affected code path)
- Timeline entry with today's count and trend

Update this file after each fix attempt and each subsequent fetch.

---

## Step 5: Fix or Escalate

- **If root cause is clear**: fix it, note the files changed in the tracking file
- **If root cause is unclear**: add logging/breadcrumbs to narrow it down, re-fetch in 24h
- **If it needs another team member**: leave the tracking file with your analysis and escalate

After any fix, append a `Fix Attempt` entry to the tracking file with:
- Files changed
- What was done
- New Sentry instrumentation added (if any)

---

## Step 6: Verify

After a fix is deployed:
- Re-fetch Sentry issues after sufficient traffic (minimum 1–4 hours)
- Check whether the count is dropping, stable, or regressing
- Update the tracking file with the new observation
- If count drops to 0 for 3+ consecutive days, mark as resolved

---

## Memory

After triage, update the project's `MEMORY.md` with the current P0/P1 issue table:

```markdown
## Active Sentry Issues
| ID | Title | Env | Status | Count | Updated |
|----|-------|-----|--------|-------|---------|
| PROJ-123 | crash on seek | prod | active | 47↑ | YYYY-MM-DD |
```

Remove resolved issues. Keep only P0/P1.
