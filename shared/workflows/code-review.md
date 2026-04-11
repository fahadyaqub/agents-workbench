# Workflow: Code Review

**Roles**: Code Reviewer · Red Team / Evaluation Expert

---

## What a Good Review Does

It finds things that will cause problems — not things that could be done differently.
The goal is correctness, safety, and maintainability. Not taste.

---

## Step 1: Understand the Change First

Before commenting:
- Read the full diff in context
- Understand what the change is trying to do
- Check if there's a ticket, spec, or prior discussion that defines the intent

Do not review code you don't understand. Ask first.

---

## Step 2: Lead With Findings

Structure feedback as findings, not as a tour of the diff.

For each finding, state:
- **What**: the specific issue
- **Where**: file and line
- **Why it matters**: the failure mode, risk, or user impact
- **Severity**: blocker / important / minor

Do not bury critical findings in a list of style notes.

---

## Severity Definitions

| Level | Meaning | Action |
|-------|---------|--------|
| **Blocker** | Will cause a bug, data loss, security issue, or regression | Must be fixed before merge |
| **Important** | Increases fragility, reduces maintainability, or masks future bugs | Should be fixed; can be a follow-up if tracked |
| **Minor** | Style, naming, readability — no correctness impact | Optional; mention once, don't dwell |

---

## Step 3: Check in Priority Order

1. **Correctness** — does it do what it's supposed to do? Edge cases? Off-by-ones? Null paths?
2. **Security** — auth checks, input validation, data exposure, injection risks
3. **Regressions** — does it break existing behavior? Any callers affected?
4. **Performance** — N+1 queries, unnecessary re-renders, large allocations in hot paths
5. **Missing tests** — is the new behavior testable and tested?
6. **Readability** — only if it materially affects future maintainability

Stop at step 1 if there are blockers. Don't spend time on style if the logic is broken.

---

## Step 4: Be Specific

Bad: "This could be improved."
Good: "Line 47 — if `user` is null here, `user.id` throws. Add a null check or assert non-null earlier."

If you're unsure about something, say so explicitly: "Not sure if this is intentional — does X case need handling here?"

---

## Step 5: Approve or Block Clearly

End the review with a clear verdict:
- **Approve** — ready to merge
- **Approve with minor notes** — merge after addressing (or noting) the minor items
- **Changes requested** — specific blockers that must be resolved before merge
- **Needs discussion** — architectural concern that needs alignment before proceeding
