# Shared Decisions

Track shared durable team-level decisions that affect how agents should work across projects.
Default new decisions to `local/memory/` first. Publish them here only when they should guide other users too.

## What belongs here

Only add an entry if an agent would make the wrong choice without knowing it.

**Add to decisions.md:** a rule that isn't obvious from reading the current files — something an agent would get wrong, re-litigate, or miss entirely without this entry.

**Do not add to decisions.md:** changelog ("we added X"), things derivable from reading the files ("new-workflow.md now has Step 1.5"), or anything already enforced by the file structure itself.

Test before writing: *"If an agent reads all the current files and follows them, would it still get this wrong?"* If yes → add it. If no → skip it.

## Format

- `[YYYY-MM-DD] [scope] [active/superseded] — rule. Why: reason. What agents should do: action.`

- [2026-04-12] Workflow routing [active] — Added `shared/workflows/commit-and-push.md` for pre-commit diff review, branch safety, lightweight validation, and safe push checks. Why: landing code was missing a shared quality gate between implementation and push. What agents should do: when a user asks to prepare, sanity-check, commit, or push a change, load this workflow and apply its branch and validation gates before landing the code.
- [2026-04-12] Workspace usage [active] — Standardized `workspace/` inside the `agents-workbench` repo as the default place for task-specific scratch files and disposable artifacts. Why: agents and users need a shared place for temporary working files without polluting tracked docs. What agents should do: prefer `workspace/` for temporary task files, treat its contents as disposable by default, and do not commit them unless the user explicitly asks.
- [2026-04-12] Project entrypoints [active] — Project-level `AGENTS.md` files should be short real adapters for IDE agents, not bare pointers. Why: tools often load the nearest `AGENTS.md` first, so every project needs a reliable local entrypoint even when shared guidance lives in `agents-workbench`. What agents should do: keep shared rules in the workbench, but ensure each project `AGENTS.md` contains enough local context and an explicit parent-workspace handoff to work well in IDE-native agent flows.
- [2026-04-12] Project startup gate [active] — Every project-level `AGENTS.md` should include an explicit first-action startup gate near the top, not just a parent pointer line. Why: agents can reply to simple prompts before following the full workbench chain unless the local entrypoint itself forces the parent handoff and setup check. What agents should do: before any reply or task work, read the parent `AGENTS.md`, continue the instruction chain into the workbench, and inspect `local/setup.toml` before normal task routing.
- [2026-04-12] Parent-hop chain [active] — Project files should not hardcode `../../AGENTS.md` or other depth-specific paths. Why: project depth varies across the workspace, and hardcoded depth makes entrypoints brittle. What agents should do: project `AGENTS.md` files should always hand off to `../AGENTS.md`, and project-group folders should carry bridge `AGENTS.md` files that continue the chain upward one level at a time.
- [2026-04-12] Project refresh after workbench changes [active] — Material changes to `shared/manifest.md`, `shared/workflows/bootstrap.md`, or `shared/workflows/new-project.md` can leave managed projects out of sync with the current workbench requirements. Why: those three files define how project entrypoints should look and behave, so changing them without re-checking managed projects creates drift. What agents should do: after materially changing any of those files, re-check all managed projects in `local/setup.toml` and update any project that no longer satisfies the current instructions in `bootstrap.md` and `new-project.md`.

- [2026-04-12] README workflow list [active] — The README is not the authoritative workflow list. Never add new workflows to the README table. Register them in shared/manifest.md only. Why: the README list drifted out of sync and became a maintenance trap. The manifest is the single source of truth.

- [2026-04-12] Shared memory over per-agent memory [active] — Write durable insights into workbench-managed memory, not into per-agent memory tools (Claude's memory, Cursor's memory file, etc.). Why: per-agent memory is siloed to one tool; workbench memory is inspectable and can be published intentionally. What agents should do: write new memory to `local/memory/` first, and publish only the entries that should guide other users.
- [2026-04-13] Workflow lifecycle [active] — New workflows start in `local/workflows/` and only move to `shared/workflows/` when the user explicitly publishes, releases, or shares them. Why: local and shared are scope boundaries, not readiness levels. What agents should do: treat local workflows as fully usable, keep local-only workflows out of `shared/manifest.md`, and register them as shared only after explicit publication.
- [2026-04-13] Artifact lifecycle [active] — New domains, agent support, and memory should follow the same local-versus-shared lifecycle as workflows. Why: local items are private scope for one user, shared items are published scope for everyone else. What agents should do: treat local artifacts as fully usable, keep them out of shared registries until explicitly published, and never describe local scope as draft quality.
