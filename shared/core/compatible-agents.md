# Compatible Agents

This file is the shared registry of AI agent tools supported by agents-workbench.

For each supported agent, a compatibility stub file is created in every project folder and the workspace root. The stub should do one thing clearly: redirect the agent to `AGENTS.md` and instruct it to keep following the bootstrap chain there. This is what makes the system agent-agnostic.

In some environments, the workspace-root `AGENTS.md` is the first and only file injected automatically. Treat that root pointer as a bootstrap bridge, not a passive note.

## Currently Supported Agents

| Agent | Stub filename | Reads by default |
|---|---|---|
| Claude (Anthropic) | `CLAUDE.md` | Yes — reads `CLAUDE.md` in project root |
| Codex (OpenAI) | `CODEX.md` | Yes — reads `CODEX.md` in project root |
| Gemini (Google) | `GEMINI.md` | Yes — reads `GEMINI.md` in project root |

## Universal Agent Stub

To create any compatibility stub (whether for a project root, workspace root, or project group bridge), simply copy the exact contents of:
`templates/project/agent-stub.template.md`

All agents and structural layers now use this single, universal entry point structure.

## Adding a New Agent

When the user says "add [AgentName] to compatible agents":

1. Follow `shared/workflows/new-agent.md`
2. Create the local record in `local/agents/` and register it in `local/manifest.toml`
3. Create the stub file in the workspace root and in managed projects immediately so the new agent support is usable right away for that user
4. Only if the user explicitly says to publish it:
   - add the agent to the table in this file
   - make the support discoverable to every user, not just the current one
   - update `shared/workflows/bootstrap.md` Step 1 and Step 4 to include the new filename in its checks
   - update `shared/workflows/new-project.md` Step 3 so brand-new projects created by any user get the shared stub automatically
5. Tell the user what was created and whether it remains local-only or is now shared
