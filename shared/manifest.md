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
- New repository setup or project creation: `shared/workflows/new-project.md`
- Creating or expanding a domain file: `shared/workflows/new-domain.md`
- Creating a new workflow: `shared/workflows/new-workflow.md`
- Improving or maintaining the workbench itself: `shared/workflows/improve-workbench.md`

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
