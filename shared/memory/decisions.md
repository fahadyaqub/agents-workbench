# Shared Decisions

Track durable team-level decisions that affect how agents should work across projects.

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

- [2026-04-12] README workflow list [active] — The README is not the authoritative workflow list. Never add new workflows to the README table. Register them in shared/manifest.md only. Why: the README list drifted out of sync and became a maintenance trap. The manifest is the single source of truth.

- [2026-04-12] Shared memory over per-agent memory [active] — Write durable insights to shared/memory/, not into per-agent memory tools (Claude's memory, Cursor's memory file, etc.). Why: per-agent memory is siloed to one tool; shared/memory/ is read by every agent that loads the workbench. What agents should do: after any non-cosmetic workbench change, write new principles to global-memory.md and specific decisions to decisions.md.
