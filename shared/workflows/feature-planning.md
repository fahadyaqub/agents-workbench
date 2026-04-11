# Workflow: Feature Planning

**Roles**: Fullstack Developer · IT Architect · Product Manager · Product Owner / Delivery PM

Use this workflow when planning a new feature before writing any code.

---

## Goal

Produce a clear, agreed plan that an agent or engineer can execute without re-asking the same questions.

A good plan answers: what, why, where, how, and what could go wrong.

---

## Trigger Phrases

- "plan this feature"
- "how should we build [X]"
- "design [feature]"
- "let's spec out [X]"
- "I want to add [X] to the project"

---

## Step 1: Clarify the Outcome

Before designing anything, get agreement on:

1. **What is the user trying to accomplish?** (not what they're asking to build)
2. **What does "done" look like?** (observable behavior, not implementation)
3. **What is explicitly out of scope?** (prevents scope creep mid-build)
4. **What constraints exist?** (timeline, existing architecture, dependencies, team size)

If any of these are unclear, ask. Do not proceed to Step 2 with ambiguous answers.

---

## Step 2: Read the Affected System

Before proposing anything:

1. Read the relevant parts of the codebase — don't design blind
2. Identify which files, services, or components will be touched
3. Check for existing patterns that should be followed
4. Check for existing abstractions that can be reused
5. Note anything that looks fragile or risky in the area

Document what you found. The plan should reflect actual code, not assumptions.

---

## Step 3: Write the Plan

Structure the plan as:

### What
One-paragraph description of the feature and its user-facing behavior.

### Why
The business or user reason this feature matters. If this is unclear, stop and ask.

### Approach
Concrete description of the implementation:
- Which files/components change
- What new code is introduced
- What existing code is modified
- Data model changes (if any)
- API changes (if any)

Keep this specific. "Refactor the service layer" is not a plan. "Add a `retryUpload()` method to `UploadService` that..." is a plan.

### Phases (if needed)
Break large features into phases where:
- Each phase ships independently
- Each phase is testable
- Dependencies between phases are explicit

### Risks and Open Questions
- What could go wrong
- What decisions are deferred or unclear
- What assumptions the plan makes that need validation

---

## Step 4: Get Alignment

Present the plan before writing code.

If the user confirms: proceed.
If the user changes scope: update the plan, then proceed.
If the plan exposes a blocker (missing API, unclear requirement): resolve it before coding.

Do not start implementation on an unconfirmed plan.

---

## Step 5: Execute Against the Plan

- Work phase by phase if the feature is staged
- If you discover something that changes the plan mid-implementation, stop and state it clearly
- Small deviations from the plan are fine — inform the user after. Large deviations need re-alignment first.

---

## What Makes a Good Plan

- It can be handed to a different agent and they'd build the same thing
- It doesn't require re-reading the whole codebase to understand
- It identifies the risky parts explicitly
- It respects the existing architecture instead of redesigning around it
