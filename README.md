# Agents Workbench

Agents Workbench is a zero-install, markdown-native operating layer for AI agents. It acts as a single, unified brain — instructions, memory, and workflows — that all your agents share across all your projects.

Instead of restating your rules, scattering memory across chat logs, or fighting setup friction every time you start a new task, you explain it once. Every agent you use derives its behavior from this shared knowledge base.

## How to Set It Up

Your **workspace folder** is wherever you keep your projects (e.g., `~/work` or `~/projects`). Clone this repository into the root of your workspace:

```sh
git clone https://github.com/fahadyaqub/agents-workbench.git
```

Open any AI agent (Claude Code, Cursor, Codex, etc.) inside that workspace and say:
> *"Setup the workbench in {your workspace path}"*

The agent scans your projects, plants lightweight compatibility stubs in each one, and walks you through a short setup that captures who you are and how you like to work. Everything stays on your machine in `local/`.

## Repository Layout

```
agents-workbench/
├── shared/      # Versioned, team-safe instructions, workflows, and domains
├── local/       # Your private sandbox — memory, personal workflows, who-i-am
├── templates/   # Used by setup; rarely touched directly
└── workspace/   # Scratch area for one-off task artifacts
```

Anything new lives in `local/` first. Promote it to `shared/` only when it's worth others running.

## Key Features

- **Agent Agnostic:** Works with Claude, Gemini, Codex, Cursor, or any future tool that reads markdown.
- **Single Source of Truth:** One memory pool, one instruction set — across every agent and every project.
- **Explain Once, Execute Everywhere:** Define a workflow once. Trigger it from anywhere with a natural sentence.
- **Personalized by Default:** A short `who-i-am.md` plus `personal-memory.md` shape every agent's tone, autonomy level, and tooling without you re-stating preferences each session.

## Key Components

### 1. Workflows (Task Execution)
Workflows are multi-step, repetitive tasks you perform regularly — codified once so agents execute them consistently every time.

The workbench ships with a useful default set — debugging, code review, planning, bugfix, commit-and-push, research, session-handoff, and more. See `shared/workflows/` for the full list.

If no workflow fits, create one with a single phrase:
> *"Create a new workflow for [Task]"*

The agent scaffolds the steps, sets up tools, and drops a runnable workflow directly into your private `local/workflows/` folder. Next time you need it, just describe the task — the agent picks the right workflow and runs it.

> **Note:** Workflows are invoked in plain conversational language, not strict slash commands:
>
> | Instead of... | Just tell your agent... |
> |---|---|
> | `/debug` | "Figure out why the site is down" |
> | `/plan` | "Let's plan the Q3 roadmap" |
> | `/review` | "Review this PR before I push it" |

### 2. Domains (Agent Mindsets)
Domains are reusable expertise profiles — one per discipline — that tell an agent how a professional in that field thinks and works. Behind the scenes, agents dynamically load the matching domain file (e.g., `finance.md`, `marketing.md`, `software-engineering.md`) to adopt the correct mindset before acting. This prevents you from writing massive prompts every time you switch disciplines.

### 3. Local vs. Shared Scopes
Scopes separate your private experiments from the proven, team-safe knowledge base — so you can iterate freely without polluting what others depend on. Everything starts private: experimental workflows, memories, and scratchpads live in your `local/` sandbox. Tools are only published to the `shared/` team repository once they are proven:
> *"Publish the local workflow [Name]"*

This promotes a local workflow from your private sandbox into the `shared/` directory, surfacing it for the rest of your team.

### 4. Compatibility Stubs & Agents
Compatibility stubs are tiny pointer files (`CLAUDE.md`, `CODEX.md`, `GEMINI.md`, etc.) dropped into every project so each agent knows where the real instructions live. Agents don't wander — every stub redirects any compatible agent back to this global instruction base. If you want to use a brand new AI tool across your projects:
> *"Add [Agent Name] to compatible agents"*

This instantly generates the compatibility stubs that tie your new agent software to the global registry across all your projects.

### 5. System Health
The workbench includes a built-in audit-and-repair routine — the "doctor" — that keeps the workspace consistent as you move things around. If you move files around, install fresh repositories, or change folder structures, the global workspace pointers could drift. You can fix this instantly:
> *"Run the workbench doctor"*

The doctor audits the workspace drift and safely repairs all your global project pointers so your agents never get lost.
