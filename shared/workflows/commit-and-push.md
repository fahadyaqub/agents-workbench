# Workflow: Commit And Push

**Roles**: Expert Programmer · Code Reviewer · Reproduction And Regression Tester

**This workflow covers**: Preparing an already-implemented change for commit and push — from diff inspection to lightweight validation to a safe push.
**This workflow does NOT cover**: Deciding what to build (use `feature-planning.md`), finding a root cause (use `debugging.md`), making the actual fix or feature change (use the relevant implementation workflow first), emergency production hotfix policy (follow the project's release process).

---

## Trigger Phrases

- "commit and push this"
- "prepare this for commit"
- "sanity check this before commit"
- "do a pre-commit review"
- "help me push this safely"
- "is this ready to commit"
- "land this change"

---

## Prime Directive

**Do not treat commit and push as a mechanical git step. Treat it as the last quality gate.**

The failure mode for this workflow is not "git failed." The failure mode is shipping a change that obviously should not have landed: debug code, noisy logs, accidental branch targeting, or a clear regression risk that was visible in the diff.
This workflow should stay lightweight, but it must still catch the obvious mistakes before they become history.

---

## Prerequisites

Before starting:
- The code change already exists locally
- The current project is a git repository
- The user has asked to land the change, or the task clearly requires a commit-ready result

If the code is not written yet → do the implementation first.
If the repo is not initialized with git → stop and tell the user.

---

## Step 1: Read the Actual Change Set

Inspect the branch and diff before forming an opinion.

Read:
- `git branch --show-current`
- `git status --short`
- `git diff --stat`
- `git diff --cached` if anything is staged
- `git diff` if anything is unstaged

Output for this step:
- Current branch
- Files intended for this commit
- Whether staged and unstaged changes are mixed

If unrelated files are present → stop and ask whether they belong in this change.
Do not commit a change you have not read.

---

## Step 2: Apply the Branch Safety Gate

Check whether the current branch is a protected or production branch.

Check the project's `AGENTS.md` for a list of protected branches. Common patterns:
- `main`, `master`, `production`, `prod`
- environment branches like `staging`, `release`, or any branch the project treats as a deploy target

If on a protected branch and the user did not explicitly say this is a hotfix → stop and warn.
Tell the user this change should land on a feature or development branch first, then be promoted through the normal flow.

If on a protected branch and the user explicitly said `hotfix` → proceed, but call out the elevated risk.

---

## Step 3: Verify the Diff Is a Valid Change

Read the full diff and ask four questions:
1. Does every changed file belong to the stated task?
2. Is any temporary debugging or verification code still present?
3. Did the change introduce noisy logging that should not ship?
4. Is there any obviously accidental file churn?

Look specifically for:
- `console.log`, `console.debug`, `console.trace`, `print`, ad-hoc logger calls
- `debugger`
- temporary flags, mock paths, fake data, commented-out old code, manual test helpers
- screenshots, scratch files, copied notes, or accidental lockfile churn

If debug-only or unrelated code is present and removal is straightforward → remove it before continuing.
If ownership is unclear or removal is risky → stop and ask.

---

## Step 4: Run a Lightweight Risk Scan

Do a fast review for obvious correctness, memory, and performance risks in the changed code.

Look specifically for:
- event listeners, subscriptions, timers, intervals, observers, or sockets added without cleanup
- React effects or state updates that can loop, thrash, or trigger repeated reloads
- duplicated fetching or selection when the needed data already exists locally
- obviously repeated expensive work inside render paths or tight loops
- async work that can outlive the component or caller without cancellation or guardrails

This is not a deep audit.
If a problem is obvious and cheap to fix → fix it now.
If a risk is plausible but not proven and needs real investigation → warn the user and stop rather than pretending it is cleared.

---

## Step 5: Check for Obvious Simpler Alternatives

Ask one narrow question:
Is there a clearly simpler, clearer, or more native way to do this same task without changing scope?

Examples:
- data already comes from props, but the component fetches or selects it again
- a new helper duplicates an existing utility
- state is copied unnecessarily instead of derived
- branching can be reduced without changing behavior

Do not turn this into a refactor session.
If the better option is obvious and small → apply it before committing.
If it would broaden the scope → note it and continue.

---

## Step 6: Run the Lightest Meaningful Validation

Find the cheapest trustworthy validation that fits the changed area.

Check available commands from the local project first:
- `package.json`
- `Makefile`
- `justfile`
- Gradle or Xcode targets
- existing test or lint scripts

Then choose the narrowest useful validation:
- targeted unit test if one exists for the changed area
- targeted lint or typecheck for touched files or package
- compile/build check for the touched module
- project-specific `--dry-run`, `--check`, or smoke-test command if available

If no unit tests exist yet, do not block on inventing a test harness.
Instead, run a basic dry-run style check that proves the change still parses, builds, lint-checks, or exercises the narrow path without side effects.

If no automated validation exists at all → say so explicitly and do the smallest manual smoke check you can describe concretely.

---

## Step 7: Stage Intentionally

Stage only the files and hunks that belong to this task.

Before proceeding, verify:
- no unrelated files are staged
- no debug logs or temp code remain in staged hunks
- generated artifacts are included only if the project expects them

If staged and unstaged changes are mixed in the same file → review carefully before committing.
Do not create a "mostly right" commit.

---

## Step 8: Write a Commit Message With Intent

Write a commit message that states:
- what changed
- why it changed

Prefer a message a teammate can understand without opening the diff.

Bad:
- `wip`
- `fix stuff`
- `updates`

Good:
- `Avoid duplicate profile fetch when user data already comes from props`
- `Clean up upload retry listener and remove debug logging`

---

## Step 9: Dry-Run the Push, Then Push

Before pushing:
- confirm the remote branch you intend to update
- run `git push --dry-run` when available

If the dry run shows the wrong destination, a rejected push, or an unexpected branch mapping → stop and fix that first.

Then push normally.
If this is a new branch, set upstream explicitly.

---

## Step 10: Report the Landing Status

Tell the user:
- what was committed
- which validation was run
- whether any warnings remain
- which branch was pushed

If validation was partial because the project lacks tests or scripts, say that plainly.

---

## When to Stop and Escalate

Stop and tell the user if:
- the current branch is `rd` or `prod` and the user did not explicitly authorize a hotfix
- the diff includes unrelated or suspicious files and ownership is unclear
- the change shows an obvious performance or memory risk that is not trivial to fix
- no trustworthy validation can be run and the change is risky enough that a blind commit would be irresponsible

---

## Completion Criteria

Commit and push is complete when:
- the full intended diff was reviewed
- obvious debug code and noisy logs were removed
- branch safety was checked
- an appropriate lightweight validation or dry run was performed and reported honestly
- only the intended change was staged
- the commit message explains the change clearly
- the change was pushed to the intended branch

---

## Cross-References

- **Before this workflow**: implementation must already be done — use `feature-planning.md` + the relevant implementation workflow first
- **If the diff has bugs**: stop and use `debugging.md` or `bugfix.md` before returning here
- **If the diff needs a deeper review**: use `code-review.md` for a thorough audit; this workflow is lightweight by design
