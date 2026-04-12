# Shared Agent Manifest

This file defines how the shared agent system should be loaded and used.

## Always Load

Read these files for all work:
- `shared/core/personality.md`
- `shared/core/working-style.md`
- `shared/core/permissions.md`
- `shared/core/communication.md`

Then read:
- `local/setup.toml` if present
- `local/who-i-am.md` if present
- `local/personal-memory.md` if present

## Setup Gate

If `local/setup.toml` is missing, initialize local files from `templates/local/`.

If any setup item in `local/setup.toml` is `pending`, follow `shared/workflows/bootstrap.md`.

Setup items may be marked:
- `pending`
- `complete`
- `ignored`

If a user explicitly ignores a setup step, stop prompting for it unless the setup state is reset manually.

## Domain Inference

Infer the domain from the task before asking the user.

Suggested domain routing:
- Coding, debugging, implementation, refactors, code review: `domains/software-engineering.md`
- Product strategy, roadmap, prioritization, requirement shaping, and execution planning: `domains/product-management.md`
- Product flows, UX structure, interaction design, and design systems: `domains/software-designer.md`
- UI design, frontend implementation, product interaction work: `domains/frontend-uiux.md`
- Test planning, verification, reproduction, release checks: `domains/software-qa.md`
- Architecture, systems design, interfaces, tradeoff analysis: `domains/software-architect.md`
- Commercial writing, positioning, funnel work: `domains/sales.md` or `domains/marketing.md`
- Budgets, pricing, forecasting, unit economics: `domains/finance.md`

## Workflow Inference

Load relevant workflow docs based on the task:
- Debugging and bug triage (general): `shared/workflows/debugging.md`
- Debugging with Sentry: `shared/workflows/debugging-sentry.md`
- Debugging with SigNoz (performance, traces, latency): `shared/workflows/debugging-signoz.md`
- Bug fixes: `shared/workflows/bugfix.md`
- Reviews and audit work: `shared/workflows/code-review.md`
- Planning and architecture: `shared/workflows/planning.md`
- Planning a new feature: `shared/workflows/feature-planning.md`
- Research tasks: `shared/workflows/research.md`
- Preparing, validating, committing, and pushing a change: `shared/workflows/commit-and-push.md`
- New repository setup or project creation: `shared/workflows/new-project.md`
- Creating or expanding a domain file: `shared/workflows/new-domain.md`
- Creating a new workflow: `shared/workflows/new-workflow.md`
- Improving or maintaining the workbench itself: `shared/workflows/improve-workbench.md`
- Adding support for a new AI agent tool: `shared/workflows/add-agent.md`

## Trigger Learning

Workflow trigger phrases are not fixed. They grow over time as new natural phrases are discovered.

### When no trigger phrase matches

Default assumption: it is a regular task. Do not force a workflow match.

Most user messages are one-off instructions — "fix this", "add a button", "what does this do", "make this faster". These are not workflow triggers even if the topic overlaps with a workflow.

Only consider routing to a workflow if the message contains a strong process signal — a word or phrase that suggests the user wants to start a structured, multi-step operation rather than just get something done inline:

- **Investigation**: "debug", "figure out why", "investigate", "trace this", "something is wrong with"
- **Review**: "review this", "audit this", "check this before committing"
- **Planning**: "plan", "spec out", "design", "how should we approach", "what's the architecture for"
- **Research**: "research", "compare", "evaluate options", "what are the options for"
- **Setup**: "set up", "bootstrap", "initialize", "add to the workspace"
- **Commit / push**: "commit", "push", "land this change", "is this ready to commit"
- **Workbench**: "create a workflow", "add a domain", "improve the workbench"

If a signal is present and the message clearly describes starting a process, infer the closest workflow, apply it, and tell the user briefly: *"Treating this as a [workflow name] task."*

If still ambiguous after checking for signals — just do the task. Do not ask the user to pick a workflow.

### When to remove a trigger phrase

If the user says the workflow was not what they intended — "I didn't mean to trigger a workflow", "I just wanted to do X", "that was overkill", "I meant this as a simple task" — remove the phrase that caused the match from that workflow's `## Trigger Phrases` list immediately. Tell the user: *"Removed '[phrase]' from [workflow].md triggers."*

### When to add a new trigger phrase

Add the unmatched phrase to the relevant workflow's `## Trigger Phrases` section when any of these are true:

- **User corrects the workflow**: the user says "I meant the [X] workflow" or "you should have used [X] for that" → add the phrase they used to that workflow's triggers
- **Self-identification mid-task**: mid-task you realize the request clearly maps to a specific workflow that wasn't loaded → note the original phrase and add it
- **Pattern repeat**: the same phrase or close variant has been used twice without triggering → add it proactively

### How to add or remove a trigger phrase

1. Open the relevant workflow file
2. Add or remove the phrase in its `## Trigger Phrases` list
3. Tell the user what changed and show the full updated trigger list for that workflow

Keep added phrases natural — match how the user actually said it, not a formal rephrasing of it.

## Memory Rules

- Shared durable knowledge belongs in `shared/memory/`
- Personal preferences that should not become team defaults belong in `local/personal-memory.md`
- Project-specific durable knowledge belongs in that project's `AGENTS.md` or related project docs
- New memory entries should be concise, dated, and durable

## Workspace Structure

The workspace root may contain either:
- direct project folders
- project group folders that contain multiple project repositories

Examples of project group folders:
- a company folder that contains several apps or services
- a client folder that contains multiple related repos

Bootstrap and new-project setup should handle both structures.
Do not assume every immediate child of the workspace root is itself a project repository.

Within the `agents-workbench` repository itself, `workspace/` is the standard task-working area for agents and users:
- use it for scratch notes, temporary plans, one-off reports, and task-specific artifacts
- treat its contents as disposable working files unless the user explicitly asks to promote something into tracked docs
- do not commit `workspace/` contents unless the user explicitly asks for that
