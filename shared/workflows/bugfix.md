# Workflow: Bug Fix

**Roles**: Expert Programmer · Reproduction and Regression Tester

**This workflow covers**: Making the fix once the root cause is confirmed — from identified cause to verified, committed correction.
**This workflow does NOT cover**: Finding the root cause (use `debugging.md` first), Sentry triage (use `debugging-sentry.md`), performance issues (use `debugging-signoz.md`).

---

## Trigger Phrases

- "fix this bug"
- "apply the fix"
- "the root cause is [X], fix it"
- (typically invoked after `debugging.md` completes)

---

## Prime Directive

**Do not start fixing until the root cause is confirmed — not just hypothesized.**

A fix applied to the wrong root cause adds code, changes behavior, and leaves the real bug intact.
If you are not certain of the root cause, go back to `debugging.md`.

---

## Prerequisites

Do not start until all three are true:
- The bug reproduces reliably
- The root cause is identified and confirmed (not just guessed)
- You can describe the fix in one sentence

If any of these are missing → return to `debugging.md`.

---

## Step 1: State the Fix

Write down before touching any code:
- Root cause (one sentence)
- What the correct behavior is
- What specific code change produces that correct behavior

If you cannot write this clearly → the root cause is not confirmed yet. Return to `debugging.md`.

---

## Step 2: Make the Smallest Correct Change

Change only the code responsible for the root cause.

Do NOT, in the same change:
- Refactor or clean up surrounding code
- Add new features or improvements
- Improve logging or error handling beyond what the fix requires
- Rename variables, reorganize files, or update comments elsewhere

Mixing other changes into a bug fix makes it harder to verify, revert, and understand in git history.

---

## Step 3: Check for Regressions

Before committing:
1. Check other callers of the code you changed — will they behave differently?
2. Check if the same broken pattern exists elsewhere in the codebase

If a regression risk is found and it is trivially related → fix it in the same commit.
If a regression risk is found and it requires real investigation → log it as a separate issue, do not fix it here.

---

## Step 4: Remove All Debug Code

Before committing, remove every `// DEBUG` log statement or temporary instrumentation added during investigation.

Look specifically for `console.debug()` and `console.trace()` calls — these are the convention for agent-added instrumentation and should all be removed unless explicitly kept. Also check for any `console.log()` that was added during the debug session.

If some logging should stay permanently → commit it separately with a distinct commit message. Do not mix it with the bug fix.

A bug fix commit contains only the fix.

---

## Step 5: Verify Against the Original Symptom

Test the fix against the exact scenario that originally triggered the bug.

If the original symptom is gone → proceed to Step 6.
If the original symptom persists → the fix did not address the root cause. Return to `debugging.md`.

---

## Step 6: Commit With Intent

The commit message must state:
- What was broken
- What the root cause was
- What was changed

**Good:** `Fix video stall on seek — buffer pointer was not reset when seeking to a new position`
**Bad:** `Fix bug` / `Update VideoPlayer.ts` / `WIP fix`

---

## When to Stop and Escalate

Stop and tell the user if:
- The fix introduces a new regression that requires more investigation
- The "smallest correct change" turns out to require touching more than 3–4 files
- The fix reveals a deeper architectural issue that can't be resolved with a targeted change

These are signals the scope has expanded beyond a single bug fix.

---

## Completion Criteria

The bug fix is complete when:
- The original symptom no longer occurs
- No new regressions were introduced
- All debug code is removed
- The fix is committed with a clear message
- If Sentry or SigNoz was involved: the tracking file is updated with the fix details
