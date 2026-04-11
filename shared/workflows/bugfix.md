# Workflow: Bug Fix

**Roles**: Expert Programmer · Reproduction and Regression Tester

> For investigation and root cause analysis, follow `debugging.md` first.
> This workflow covers the fix itself — from confirmed root cause to shipped correction.

---

## Prerequisites

Do not start this workflow until:
- The bug is reproducible
- The root cause is identified (not just hypothesized)
- You can describe the fix in one sentence

If any of these are missing, go back to `debugging.md`.

---

## Step 1: Define the Fix

Write down:
- What is wrong (root cause, one sentence)
- What the correct behavior is
- What code change produces that correct behavior

If the fix is obvious, proceed. If it's not, spend more time in debugging.

---

## Step 2: Make the Smallest Correct Change

- Touch only the code responsible for the root cause
- Do not refactor, clean up, or improve surrounding code in the same change
- Do not add new features, even small ones, in the same change
- Do not improve logging, error handling, or comments beyond what's necessary for the fix

Mixing other changes into a bug fix makes it harder to verify, revert, and understand later.

---

## Step 3: Check for Regressions

Before calling it done:
- Look at other callers of the code you changed
- Check if the same pattern exists elsewhere (and is also broken)
- Run any existing tests that cover the affected path

If a regression risk is found: fix it in the same change only if it's trivially related. Otherwise, log it separately.

---

## Step 4: Remove Debug Code

If any temporary logging or instrumentation was added during investigation:
- Remove it now, before committing
- If some logging should stay permanently, commit it separately with a clear message

A bug fix commit should contain only the fix.

---

## Step 5: Verify Against the Original Symptom

Test the fix against the exact scenario that triggered the bug.
Do not consider the fix complete until the original symptom is gone.

---

## Step 6: Commit With Intent

Commit message should state:
- What was broken
- What the root cause was
- What was changed

Example: `Fix video stall on seek — seek position was not resetting the buffer pointer`

Not: `Fix bug` or `Update VideoPlayer.ts`
