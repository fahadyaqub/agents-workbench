# Workflow: Debugging

**Roles**: Expert Programmer · Reproduction and Regression Tester

**This workflow covers**: Investigating an unknown bug from symptom to root cause.
**This workflow does NOT cover**: Fixing the bug (use `bugfix.md`), Sentry-specific triage (use `debugging-sentry.md`), performance/latency issues (use `debugging-signoz.md`).

---

## Trigger Phrases

- "debug this"
- "figure out why [X] is broken"
- "something is wrong with [X]"
- "investigate [issue]"
- "why is [X] happening"

---

## Prime Directive

**Never lose the original problem.**

Logging, instrumentation, and error handling are tools to find the bug — they are not the work.
If adding logging is becoming its own project, stop. Raise it with the user.
Do not let a class accumulate layers of diagnostic code across multiple debug sessions.
Keep every piece of added instrumentation minimal, targeted, and removable.

If you are three steps deep into "why isn't the logging working" instead of "why is the feature broken", you have lost the thread. Stop, re-read the original problem, and reset.

---

## Prerequisites

Before starting, you must have:
- A description of the broken behavior (what is happening)
- A description of the expected behavior (what should happen)

If neither is clear, ask the user before proceeding.

---

## Step 1: Restate the Problem

Write down in one sentence:
- What is broken
- What the expected behavior is
- What the actual behavior is

If you can't write this clearly → ask the user. Do not proceed with a fuzzy problem statement.

---

## Step 2: Reproduce It

Find the smallest input or action that triggers the bug reliably.

- If you can reproduce it → proceed to Step 3.
- If you cannot reproduce it → tell the user. Do not investigate a bug you can't trigger.

Reproduction is done when you can trigger the failure on demand.

---

## Step 3: Read Before Touching

Before changing or adding anything:

1. Read the affected code — understand what it is supposed to do
2. Run `git log --oneline -20` on the affected files — did this break after a specific commit?
3. Check what error messages, stack traces, and logs already exist
4. Form a hypothesis about the root cause

If existing signals are sufficient to form a hypothesis → proceed to Step 5.
If they are not → proceed to Step 4.

---

## Step 4: Add Targeted Instrumentation (Only If Needed)

Add the minimum number of log statements needed to test the hypothesis.

- Place them at the specific decision point being investigated — not scattered throughout the class
- Use `console.debug()` or `console.trace()` instead of `console.log()` — this distinguishes agent-added instrumentation from user-added logs, which are typically `console.log`. Not a hard rule, but a useful convention.
- Mark each one with `// DEBUG: remove after fix`
- Do not refactor error handling, restructure logging infrastructure, or improve monitoring while debugging — that is a separate task

**One hypothesis → one round of targeted logging → re-deploy → check results.**

If results confirm the hypothesis → proceed to Step 5.
If results are inconclusive → form a new hypothesis and repeat Step 4 once more.
If after two rounds the cause is still unclear → escalate (see below).

---

## Step 5: Isolate the Cause

Work from the outside in. For each layer, eliminate it before moving to the next:

1. **Input** — is the problem bad data coming in?
2. **Logic** — is the processing producing a wrong result?
3. **Output** — is the result right but being presented or stored incorrectly?
4. **Dependency** — is a service, DB, or external API misbehaving?

When you can state the root cause in one sentence → proceed to `bugfix.md`.

---

## Step 6: Hand Off to Bug Fix

Once root cause is confirmed, switch to `bugfix.md`.

Do not start fixing inside this workflow. Keep investigation and fixing separate — mixing them makes both harder to verify.

---

## When to Stop and Escalate

Stop and tell the user if any of these are true:
- Two rounds of instrumentation and the cause is still unknown
- The investigation requires changes to more than 3 files with no root cause in sight
- Supporting work (logging, error handling) is now more complex than the original bug
- You've lost confidence in what the original bug actually was

These are signals the problem is bigger than a single debug session. Reset with the user rather than going deeper.

---

## Completion Criteria

Debugging is complete when:
- The root cause can be stated in one sentence
- The root cause has been confirmed (not just hypothesized) — reproducing it at the identified location is sufficient
- You are ready to hand off to `bugfix.md`
