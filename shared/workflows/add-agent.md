# Workflow: Add Compatible Agent

**Roles**: IT Architect · Fullstack Developer

**This workflow covers**: Adding support for a new AI agent tool so it works seamlessly with agents-workbench across all projects.
**This workflow does NOT cover**: Configuring agent-specific settings or capabilities — only the compatibility stub layer.

---

## Trigger Phrases

- "add [agent] to compatible agents"
- "add support for [agent]"
- "[agent] is not supported yet"
- "make agents-workbench work with [agent]"
- "add [agent] compatibility"
- "we started using [agent]"

---

## Prime Directive

**One stub file per agent, pointing to AGENTS.md — nothing else.** Stubs must never contain real instructions. All guidance stays in AGENTS.md.

---

## Step 1: Identify the Stub Filename

Ask the user:
> "What filename does [AgentName] look for in a project root by default? (e.g. `DEEPSEEK.md`)"

If the user doesn't know → suggest searching the agent's documentation for its default instruction file convention.

---

## Step 2: Create the Template

Create `templates/project/[FILENAME].template.md` with the standard stub content:

```markdown
# Compatibility Stub

Do not add or modify agent instructions in this file.

Use `AGENTS.md` as the single source of truth for all agent guidance in this project.

If this file needs changes, update `AGENTS.md` instead.
```

---

## Step 3: Update the Registry

Add the new agent to the table in `shared/core/compatible-agents.md`.

---

## Step 4: Create Stub in Workspace Root

Create `[FILENAME]` in the workspace root. Content:

```markdown
# Compatibility Stub

Do not add or modify agent instructions in this file.

See `agents-workbench/AGENTS.md` for all shared agent guidance.
```

---

## Step 5: Create Stubs in All Managed Projects

Read `local/setup.toml` to get the list of managed projects.

For each managed project:
- Check if the stub file already exists → skip if so
- If missing → create it using the template content from Step 2
- If the project is nested (inside a group folder) → the path resolves correctly since the stub content is relative-path-free

---

## Step 6: Update Bootstrap and New-Project Workflows

In `shared/workflows/bootstrap.md`:
- Add the new filename to Step 1 (workspace root check) and Step 4 (project scan check)

In `shared/workflows/new-project.md`:
- Add the new filename to Step 3 (create missing files)

---

## Completion Criteria

- `templates/project/[FILENAME].template.md` exists
- Agent is listed in `shared/core/compatible-agents.md`
- Stub exists in workspace root
- Stub exists in every managed project folder
- `bootstrap.md` and `new-project.md` updated to include the new file in checks
