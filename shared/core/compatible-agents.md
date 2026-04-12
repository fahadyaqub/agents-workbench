# Compatible Agents

This file is the registry of all AI agent tools supported by agents-workbench.

For each supported agent, a compatibility stub file is created in every project folder and the workspace root. The stub does nothing except redirect the agent to `AGENTS.md`, which is the single source of truth. This is what makes the system agent-agnostic.

## Currently Supported Agents

| Agent | Stub filename | Reads by default |
|---|---|---|
| Claude (Anthropic) | `CLAUDE.md` | Yes — reads `CLAUDE.md` in project root |
| Codex (OpenAI) | `CODEX.md` | Yes — reads `CODEX.md` in project root |
| Gemini (Google) | `GEMINI.md` | Yes — reads `GEMINI.md` in project root |

## Stub Content

All stubs use the same content (from `templates/project/CLAUDE.template.md` or equivalent):

```markdown
# Compatibility Stub

Do not add or modify agent instructions in this file.

Use `AGENTS.md` as the single source of truth for all agent guidance in this project.

If this file needs changes, update `AGENTS.md` instead.
```

## Adding a New Agent

When the user says "add [AgentName] to compatible agents":

1. Ask: "What filename does [AgentName] read by default in a project root?" (e.g. `DEEPSEEK.md`)
2. Create `templates/project/[FILENAME].template.md` using the stub content above
3. Add the agent to the table in this file
4. Create the stub file in the workspace root pointing to `agents-workbench/AGENTS.md`
5. Create the stub file in every managed project folder (listed in `local/setup.toml`)
6. Update `shared/workflows/bootstrap.md` Step 1 and Step 4 to include the new filename in its checks
7. Update `shared/workflows/new-project.md` Step 3 to include the new filename
8. Tell the user what was created and confirm the agent is now fully supported
