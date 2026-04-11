# Workflow: Debugging

**Roles**: Expert Programmer · Reproduction and Regression Tester

---

## The Prime Directive

**Never lose the original problem.**

Logging, instrumentation, and error handling are tools to find the bug — they are not the work.
If adding logging is becoming its own project, stop. Raise it with the user.
Do not let a class accumulate layers of diagnostic code across multiple debug sessions.
Keep every piece of added instrumentation minimal, targeted, and removable.

If you are three steps deep into "why isn't the logging working" instead of "why is the feature broken", you have lost the thread. Stop, re-read the original problem, and reset.

---

## Step 1: Restate the Problem

Before doing anything, write down in one sentence:
- What is broken
- What the expected behavior is
- What the actual behavior is

If you can't write this clearly, ask the user before proceeding. Starting without a clear problem statement is the fastest way to drift.

---

## Step 2: Reproduce It

Get the bug to happen reliably before investigating why.

- Find the smallest input or action that triggers it
- If you can't reproduce it, say so — don't investigate a ghost
- Reproduction is done when you can trigger the failure on demand

---

## Step 3: Read Before Touching

Before changing anything:

1. Read the affected code — understand what it's supposed to do
2. Check recent git history — did this break after a specific commit?
3. Look at error messages, stack traces, and logs that already exist
4. Form a hypothesis before adding any new instrumentation

**Use what's already there first.** Only add logging if the existing signals are genuinely insufficient.

---

## Step 4: Add Targeted Instrumentation (Only If Needed)

If existing signals aren't enough to locate the bug:

- Add the minimum number of log statements to test your hypothesis
- Put them at the specific decision point you're investigating — not scattered throughout the class
- Use a comment like `// DEBUG: remove after fix` so it's obvious they're temporary
- Do not refactor error handling, restructure logging infrastructure, or add new monitoring while debugging — that's a separate task

**One hypothesis → one round of targeted logging → re-deploy → check results.**

If the logs don't tell you what you need after one round, form a new hypothesis and repeat — don't keep layering more logging on top.

---

## Step 5: Isolate the Cause

Work from the outside in:
1. Is the problem in the input (bad data coming in)?
2. Is the problem in the logic (wrong processing)?
3. Is the problem in the output (wrong result produced, right logic)?
4. Is the problem in a dependency (service, DB, external API misbehaving)?

For each, eliminate it as quickly as possible. Move to the next when ruled out.

---

## Step 6: Fix It

Once the root cause is clear:
- Change the smallest surface area that fixes the root cause
- Do not clean up surrounding code, improve logging, or refactor while fixing
- Those are separate tasks — mixing them obscures what fixed the bug

---

## Step 7: Verify and Clean Up

- Verify the fix resolves the original problem
- Remove all temporary debug logging added during investigation
- If any logging should stay permanently (it's genuinely useful), move it to a proper place as a separate, deliberate commit — not mixed into the bug fix

---

## When to Stop and Escalate

Stop and tell the user if:
- You've added two rounds of instrumentation and still can't locate the cause
- The investigation is requiring changes to more than 3 files with no clear fix in sight
- Supporting work (logging, error handling) is now more complex than the original bug
- You've lost confidence in what the original bug actually was

These are signals the problem is bigger than a single debug session. Reset with the user rather than going deeper.
