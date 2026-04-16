# Workflow: New Agent

**Roles**: IT Architect · Fullstack Developer

**This workflow covers**: Adding support for a new AI agent tool for one user's local workbench by default, and moving that support into the shared system only when the user explicitly wants to publish it.
**This workflow does NOT cover**: Configuring agent-specific settings or capabilities — only the compatibility stub layer.

---

## Trigger Phrases

- "add [agent] to compatible agents"
- "add support for [agent]"
- "[agent] is not supported yet"
- "make agents-workbench work with [agent]"
- "add [agent] compatibility"
- "we started using [agent]"
- "publish this agent support"
- "share this agent support"
- "release this agent support"

---

## Prime Directive

**One stub file per agent, pointing to AGENTS.md — nothing else.** Stubs must never contain real instructions. All guidance stays in AGENTS.md.

## Default Location and Publishing Model

New agent support is local by default.

- Do not update `shared/core/compatible-agents.md` unless the user explicitly wants to publish the addition
- Local agent support should be recorded under `local/agents/` and applied immediately in the current user's workspace
- Register local agent support in `local/manifest.toml`
- Only when the user explicitly says "publish", "release", or "share" the agent support → merge it into the shared registry, templates, and bootstrap guidance

---

## Local Workflow Area

Use `local/workspaces/new-agent/` as this workflow's private writable area.

- If the folder does not exist yet → create it before writing workflow-owned notes, rollout checklists, or temporary artifacts.
- Treat it as pre-approved writable space for this workflow. Do not ask for extra permission for writes inside it.
- Use it for task scratch files only. The actual private agent record still belongs in `local/agents/`, and shared publication changes still go to the shared files they affect.

---

## Step 1: Identify the Stub Filename

Ask the user:
> "What filename does [AgentName] look for in a project root by default? (e.g. `DEEPSEEK.md`)"

If the user doesn't know → suggest searching the agent's documentation for its default instruction file convention.

---

## Step 2: Create the Private Record

Record the new agent in `local/agents/` so the addition stays local unless the user chooses to publish it.
Register it in `local/manifest.toml`.

Include:
- agent name
- stub filename
- standard stub content
- whether the agent should be added to existing managed projects in this user's workspace

If `local/agents/` does not exist yet → create it when first needed.

## Step 3: Apply the Private Support

For the current user's workspace only:
- create the stub file in the workspace root if needed
- create the stub file in managed projects where the user wants it
- treat those local stubs as fully supported and usable immediately
- do not change shared templates or shared registries yet

## Step 4: Publish Only If Requested

If the user explicitly says to publish, release, or share this agent support:
- add the new agent to `shared/core/compatible-agents.md`
- create `templates/project/[FILENAME].template.md` with the standard stub content
- update `shared/workflows/bootstrap.md`
- update `shared/workflows/new-project.md`
- treat it as part of the shared system from that point on

Standard stub content:

Simply copy the exact contents of `templates/project/agent-stub.template.md`. Do not invent a new stub format.

## Completion Criteria

- A local record exists under `local/agents/`
- Local stub support exists where the user wants it in their workspace
- If published: `shared/core/compatible-agents.md` is updated
- If published: `templates/project/[FILENAME].template.md` exists
- If published: `bootstrap.md` and `new-project.md` are updated to include the new file in checks
