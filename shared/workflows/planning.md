# Workflow: Planning

**Roles**: Expert Programmer · IT Architect · System Design Reviewer · Product Manager · Product Owner / Delivery PM

> For planning a specific new feature, use `feature-planning.md` instead.
> This workflow covers broader planning: technical direction, sprint/milestone planning, architectural decisions.

---

## Step 1: Clarify What You're Planning

Planning without a clear goal produces a plan nobody follows.

First, establish:
- **What decision needs to be made** (or what outcome needs to be achieved)
- **What constraints exist** — timeline, team size, existing system, hard dependencies
- **What "done" looks like** — what does a completed plan produce?

If you're planning a feature: use `feature-planning.md`.
If you're planning a technical direction or architectural change: continue here.

---

## Step 2: Understand Current State

Before proposing anything, read what exists:
- Relevant code, architecture docs, or existing AGENTS.md files
- Recent decisions in `shared/memory/decisions.md`
- Any prior plans or specs that were made for this area

Do not plan on top of assumptions. Plans that contradict current reality waste everyone's time.

---

## Step 3: Define Phases

Break the work into phases where:
- Each phase has a clear, testable output
- Phases can be reviewed independently
- Dependencies between phases are explicit

Prefer phases that can ship independently over phases that only combine at the end.

---

## Step 4: Surface the Non-Obvious

A plan that lists only happy-path steps is incomplete. Include:
- Hidden dependencies ("Phase 2 can't start until the backend returns X")
- Tradeoffs that were considered and rejected, and why
- Open questions that need answers before execution starts
- Risks that could derail the plan

---

## Step 5: Keep It Executable

A good plan is one someone can pick up and act on without re-asking questions.

- Use concrete actions, not vague intentions ("add retry logic to UploadService" vs "improve reliability")
- Name specific files, services, or systems where relevant
- Keep it short enough that people actually read it

---

## What to Do With the Plan

- Get explicit agreement before executing it
- Store it where the team can reference it (project AGENTS.md, a doc, or a tracking ticket)
- Update it when reality changes — a stale plan is worse than no plan
