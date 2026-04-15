# Workflow: Code Review

**Roles**: Code Reviewer · Red Team / Evaluation Expert

**This workflow covers**: Reviewing a diff or PR for correctness, safety, regressions, and maintainability.
**This workflow does NOT cover**: Debugging a bug found in review (use `debugging.md`), planning what to build (use `feature-planning.md`), broad architectural evaluation (use `planning.md`).

---

## Trigger Phrases

- "review this code"
- "review this PR"
- "review this diff"
- "what do you think of this change"
- "is this safe to merge"

---

## Prime Directive

**Find things that will cause problems — not things that could be done differently.**

A review exists to catch correctness issues, regressions, and risk — not to impose preferences.
Style, naming, and structure comments are secondary. If the logic is broken, that matters more than the variable name.
Lead with findings. Do not summarize what the code does before listing what is wrong with it.

---

## Prerequisites

Before reviewing:
- Read the PR description or task intent — understand what the change is supposed to do
- If there is no description and the intent is unclear → ask before reviewing. Reviewing code you don't understand produces noise, not signal.

---

## Local Workflow Area

Use `local/workspaces/code-review/` as this workflow's private writable area.

- If the folder does not exist yet → create it before writing workflow-owned notes, scratch files, or temporary artifacts.
- Treat it as pre-approved writable space for this workflow. Do not ask for extra permission for writes inside it.
- Use it for review notes, finding drafts, and copied diff context that should not live in the project or PR permanently.

---

## Step 1: Understand the Change

Read the full diff in context — not just the changed lines.

Ask: what is this change trying to accomplish?

If the answer is unclear after reading → ask. Do not review blind.

---

## Step 2: Check in Priority Order

Work through these in order. Stop and report blockers before continuing to lower-priority checks.

1. **Correctness** — does it do what it's supposed to? Edge cases, null paths, off-by-ones, boundary conditions?
2. **Security** — auth checks, input validation, data exposure, injection risks, secrets in code?
3. **Regressions** — does it break existing behavior? Are other callers of changed code affected?
4. **Performance** — N+1 queries, unnecessary re-renders, unbounded loops, large allocations in hot paths?
5. **Missing tests** — is new behavior tested? Could existing behavior silently regress without a test?
6. **Readability** — only if it materially affects future maintainability, not personal preference

If blockers are found in step 1 or 2 → report them immediately. Do not spend time on steps 3–6 if the logic is fundamentally broken.

---

## Step 3: Write Each Finding Specifically

For each finding, state:
- **What**: the specific issue
- **Where**: file and line number
- **Why it matters**: the failure mode, risk, or user impact
- **Severity**: Blocker / Important / Minor

| Severity | Meaning | Required action |
|---|---|---|
| **Blocker** | Will cause a bug, data loss, security issue, or regression | Must fix before merge |
| **Important** | Increases fragility or masks future bugs | Should fix; tracked follow-up acceptable |
| **Minor** | Style, naming, readability — no correctness impact | Optional; mention once, don't repeat |

**Bad finding:** "This could be improved."
**Good finding:** "Line 47 — `user.id` will throw if `user` is null here. The null path exists when the session has expired. Add a null check or assert non-null earlier."

If you are unsure whether something is a bug → say so explicitly: "Not sure if this is intentional — does the X case need handling here?"

---

## Step 4: Apply the Red Team Check

After the standard review, briefly apply adversarial thinking:
- What is the worst realistic input this code could receive?
- What happens if a dependency returns null, throws, or times out unexpectedly?
- What does an attacker or a misbehaving client do to this endpoint?

This step surfaces issues the happy-path review misses.

---

## Step 5: Deliver a Clear Verdict

End with one of:
- **Approve** — ready to merge
- **Approve with minor notes** — merge after addressing (or consciously ignoring) the minor items
- **Changes requested** — specific blockers must be resolved before merge; list them
- **Needs discussion** — architectural concern that requires alignment before proceeding

Do not leave the review without a verdict. "Some thoughts..." is not a verdict.

---

## When to Stop and Escalate

Stop and raise with the user if:
- The change is so large or intertwined that a meaningful review is not possible in one pass — suggest splitting it
- The intent of the change is unclear and cannot be inferred from code alone
- You find a blocker that requires a design decision, not just a code fix

---

## Completion Criteria

The review is complete when:
- All priority checks have been run
- Every finding is stated with what, where, why, and severity
- The red team check has been applied
- A clear verdict has been delivered
