# Compatible Agents

This file is the registry of all AI agent tools supported by agents-workbench.

For each supported agent, a compatibility stub file is created in every project folder and the workspace root. The stub should do one thing clearly: redirect the agent to `AGENTS.md` and instruct it to keep following the bootstrap chain there. This is what makes the system agent-agnostic.

In some environments, the workspace-root `AGENTS.md` is the first and only file injected automatically. Treat that root pointer as a bootstrap bridge, not a passive note.

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

## Mandatory First Action — Before Your First response, including greetings

Complete these steps before writing any response or starting any task:

Look for the closest "agents-workbench" directory.
If not found in current working directory, only then look for it in the parent directory, then, if still not found, then look for it in the parent's parent directory.
Once found, read  `AGENTS.md` inside "agents-workbench" -- and follow every instruction to the letter, without fail. Reading this file, and following its instructions is important before you do anything else. Its a setep file, it will tell you what to do for this specific user. Do not do anything else. Do not respond, do not test or check anything, until you have read, and followed the steps listed in that "AGENTS.md" file 

Do not add or modify agent instructions in this file.
Do not make changes to this file, make all your changes in `AGENTS.md` instead, which is shared by all agents.
```

### Workspace-Root Stub Content

Stubs at the workspace root (one hop from `agents-workbench/`) use this stronger variant that skips the intermediate chain and points directly to the workbench:

```markdown
# Workspace Agent Entry Point

Do not add or modify agent instructions in this file.

## Mandatory First Action — Before Your First response, including greetings

Complete these steps before writing any response or starting any task:

Look for the closest "agents-workbench" directory.
If not found in current working directory, only then look for it in the parent directory, then, if still not found, then look for it in the parent's parent directory.
Once found, read  `AGENTS.md` inside "agents-workbench" -- and follow every instruction to the letter, without fail. Reading this file, and following its instructions is important before you do anything else. Its a setep file, it will tell you what to do for this specific user. Do not do anything else. Do not respond, do not test or check anything, until you have read, and followed the steps listed in that "AGENTS.md" file 

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
