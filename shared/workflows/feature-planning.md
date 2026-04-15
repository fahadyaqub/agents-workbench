# Workflow: Feature Planning

**Roles**: Fullstack Developer · IT Architect · Product Manager · Product Owner / Delivery PM

**This workflow covers**: Planning a specific new feature from intent to confirmed, executable implementation plan.
**This workflow does NOT cover**: Broad technical direction or architectural decisions (use `planning.md`), research needed before a decision (use `research.md`), executing the implementation (use the plan produced here).

---

## Trigger Phrases

- "plan this feature"
- "how should we build [X]"
- "design [feature]"
- "let's spec out [X]"
- "I want to add [X] to the project"
- "what would it take to build [X]"

---

## Prime Directive

**Do not start designing until you understand the user problem, not just the requested feature.**

The request "add a retry button" is not a feature spec. The problem "users lose uploads when the connection drops and have no way to recover" is.
Design the solution to the problem, not the surface of the request.
If the user problem is not clear → ask before proceeding.

---

## Prerequisites

Before starting:
- There is a clear user-facing behavior or outcome that needs to exist
- The project codebase is accessible for reading

---

## Local Workflow Area

Use `local/workspaces/feature-planning/` as this workflow's private writable area.

- If the folder does not exist yet → create it before writing workflow-owned notes, plan drafts, or temporary artifacts.
- Treat it as pre-approved writable space for this workflow. Do not ask for extra permission for writes inside it.
- Use it for draft plans and working notes until the plan is promoted into a project doc, ticket, or other team-visible location.

---

## Step 1: Clarify the Outcome

Get explicit answers to:
1. What problem does this feature solve for the user? (Not what it does — why it matters)
2. What does "done" look like? (Observable behavior, not implementation)
3. What is explicitly out of scope? (Say it now to prevent scope creep mid-build)
4. What constraints exist? (Timeline, existing architecture, dependencies, team size)

If any of these are unclear → ask before proceeding to Step 2.
Do not design a feature before the problem is defined.

---

## Step 2: Read the Affected System

Before proposing any implementation:

1. Read the relevant parts of the codebase — the files, services, and components this feature will touch
2. Identify existing patterns that should be followed
3. Identify existing abstractions that can be reused
4. Note anything that looks fragile or risky in the area

The plan must reflect actual code, not assumptions. If this step reveals unexpected complexity → surface it before proceeding.

---

## Step 3: Write the Plan

Structure the plan with these sections:

**What**
One paragraph: what does this feature do from the user's perspective?

**Why**
The user problem or business reason. If this is unclear → stop and ask.

**Approach**
Concrete implementation description:
- Which files or components change
- What new code is introduced
- What existing code is modified
- Data model or schema changes (if any)
- API changes (if any)

Specific is better than vague. "Add a `retryUpload()` method to `UploadService`" is a plan. "Improve the upload flow" is not.

**Phases** (if the feature is large)
Break into phases where each:
- Ships independently
- Is testable on its own
- Has explicit dependencies on other phases

**Risks and Open Questions**
- What could go wrong
- What decisions are deferred or need validation
- What assumptions the plan makes that could be wrong

Draft the first version in `local/workspaces/feature-planning/` unless the user already named a specific project doc or ticket as the destination.

---

## Step 4: Reflection Check

Before presenting the plan, verify:
- Can a different agent or engineer follow this plan and build the same thing?
- Does it respect the existing architecture instead of redesigning around it?
- Are the risky parts identified explicitly?
- Is anything in the plan actually an assumption rather than a confirmed fact?

If any answer is no → revise before presenting.

---

## Step 5: Get Alignment

Present the plan. Do not start implementation without confirmation.

If confirmed → proceed to implementation.
If scope changes → update the plan, then proceed.
If a blocker is found (missing API, unclear requirement, unresolved dependency) → resolve it before building.

---

## Step 6: Execute Against the Plan

- Work phase by phase if the feature is staged
- If you discover something mid-implementation that materially changes the plan → stop and state it. Do not silently diverge.
- Small deviations are fine — inform the user after. Large deviations need re-alignment first.

---

## When to Stop and Escalate

Stop and raise with the user if:
- Step 2 reveals the affected area is significantly more complex than expected
- The plan keeps expanding — this may be two features, not one
- A risk identified in Step 3 has no clear mitigation

---

## Completion Criteria

Feature planning is complete when:
- The user problem is clearly stated
- The implementation plan is specific enough to execute without re-asking questions
- Risks and open questions are documented
- The plan is confirmed by the user

After confirmation: switch to implementation. Return to this plan if scope needs to be re-evaluated.
