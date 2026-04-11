# Shared Decisions

Track durable team-level decisions that affect how agents should work across projects.

Suggested format:
- Date
- Decision
- Why it exists
- What agents should do because of it

- [2026-04-12] Workflow routing [active] — Added `shared/workflows/commit-and-push.md` for pre-commit diff review, branch safety, lightweight validation, and safe push checks. Why: landing code was missing a shared quality gate between implementation and push. What agents should do: when a user asks to prepare, sanity-check, commit, or push a change, load this workflow and apply its branch and validation gates before landing the code.
- [2026-04-12] Workspace usage [active] — Standardized `workspace/` inside the `agents-workbench` repo as the default place for task-specific scratch files and disposable artifacts. Why: agents and users need a shared place for temporary working files without polluting tracked docs. What agents should do: prefer `workspace/` for temporary task files, treat its contents as disposable by default, and do not commit them unless the user explicitly asks.
