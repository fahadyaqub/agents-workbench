# Workflow: Planning

**Roles**: Expert Programmer · IT Architect · System Design Reviewer · Product Manager · Product Owner / Delivery PM

**This workflow covers**: Technical direction decisions, architectural changes, sprint or milestone planning, and cross-team alignment.
**This workflow does NOT cover**: Planning a specific new feature (use `feature-planning.md`), research before a decision (use `research.md`), bootstrapping a new project (use `new-project.md`).

---

## Trigger Phrases

- "let's plan [X]"
- "how should we approach [X]"
- "what's the plan for [X]"
- "we need to make a decision on [X]"
- "plan the next sprint / milestone / phase"
- "how do we tackle [technical problem]"

---

## Prime Directive

**Read the current state before proposing anything.**

Plans that contradict existing architecture, ignore prior decisions, or assume things that aren't true waste everyone's time and create re-work.
Before making any recommendation, read the relevant code, the project `AGENTS.md`, and `shared/memory/decisions.md`.
A plan built on assumptions is a guess with structure.

---

## Prerequisites

Before starting, establish:
- What decision needs to be made, or what outcome needs to be achieved
- What constraints exist (timeline, team size, dependencies, existing system)
- What "done" looks like for this plan

If any of these are unclear → ask before proceeding.

---

## Step 1: Read the Current State

Before proposing anything:

1. Read the relevant code, architecture, and project `AGENTS.md`
2. Check `shared/memory/decisions.md` for prior decisions on the same topic
3. Note what already exists that can be extended vs what needs to be built from scratch

If this is a feature plan → use `feature-planning.md` instead. This workflow is for broader technical and strategic planning.

---

## Step 2: Clarify the Outcome

Get explicit agreement on:
- What does success look like at the end of this plan?
- What is explicitly out of scope?
- What hard constraints cannot change?

If agreement is not possible before step 3 → surface the disagreement. Do not plan around an unresolved conflict.

---

## Step 3: Define Phases

Break the work into phases where:
- Each phase has a clear, testable output
- Each phase can be reviewed independently
- Dependencies between phases are explicit

Prefer phases that can ship independently over phases that only combine at the end.

If a phase can't be made independently shippable → document why and what the minimum viable milestone is.

---

## Step 4: Surface the Non-Obvious

A plan that lists only happy-path steps is incomplete. State explicitly:
- Hidden dependencies ("Phase 2 can't start until the backend returns X")
- Tradeoffs that were considered and rejected, and why
- Open questions that must be answered before execution starts
- Risks that could derail the plan and how they would be detected early

---

## Step 5: Make It Executable

A good plan is one someone can act on without re-reading the whole codebase.

- Use concrete actions: "add retry logic to `UploadService.upload()`" not "improve reliability"
- Name specific files, services, or systems where relevant
- Keep it short enough that people actually read it

---

## Step 6: Get Alignment

Present the plan before anyone starts executing.

If confirmed → proceed.
If scope changes → update the plan, then proceed.
If a blocker is uncovered (missing API, unresolved dependency, unclear ownership) → resolve it before execution starts.

Do not start execution on an unconfirmed plan.

---

## Step 7: Store and Maintain the Plan

Store the plan where the team can reference it (project `AGENTS.md`, a tracking ticket, or a doc).
Update it when reality changes.

If a significant architectural decision was made during planning → record it in `shared/memory/decisions.md`.

---

## When to Stop and Escalate

Stop and raise with the user if:
- The plan requires decisions that are outside your scope (budget, team structure, business strategy)
- Two iterations in and there is still no agreement on what success looks like
- The plan keeps growing to cover more than one major initiative — split it

---

## Completion Criteria

Planning is complete when:
- The outcome and constraints are agreed
- Phases are defined with explicit dependencies
- Non-obvious risks and open questions are documented
- The plan is confirmed by the user and stored somewhere accessible
