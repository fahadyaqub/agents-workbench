# Agents Workbench

Agents Workbench is a shared set of instructions, workflows, and conventions, and working memory for AI agents. It covers product, engineering, sales, marketing, and finance — anyone on the team using an AI agent can use it.

**Key features:**
- **Agent agnostic** — works with Claude, Gemini, Codex, or any agent tool; each agent reads its own native file (`CLAUDE.md`, `GEMINI.md`, `CODEX.md`, etc.) which redirects to `AGENTS.md`; adding support for a new agent takes one command
- **Token efficient** — shared context so agents start sharp and keep responses focused and on-topic
- **Explain once** — project stack, functionality, your style, and your rules; the workbench carries that context automatically
- **Fewer mistakes** — lessons, corrections, and conventions are written down once and applied everywhere
- **Less clutter** — one shared system replaces scattered `.md` files duplicated across every project for every agent
- **Layered** — shared conventions apply to everyone; personal preferences and overrides live in `local/` and never pollute the shared repo
- **Safe by default** — protected branches are defined per project and enforced by every agent before any commit or push, with sane workspace-level defaults
- **No commands** — say what you mean and the agent routes to the right workflow; unrecognized phrases get added to the trigger list automatically
- **Ready on day one** — clone it and you're ready to go; predefined workflows, roles, and instructions mean agents are productive without any customization
- **Evolving** — This is a living system — it grows and improves as the team uses it.

It packages:
- shared core instructions
- domain and role files covering engineering, design, QA, architecture, sales, marketing, finance, product, research & academic, and creative arts & digital media
- workflows for common tasks across all functions
- shared memory
- project templates
- setup and bootstrap guidance

## Setup

Your **workspace folder** is wherever you keep all your project repositories — it could be `~/work`, `~/projects`, `~/code`, or anything else. Clone this repo in the root of your workspace folder:

```sh
git clone https://github.com/fahadyaqub/agents-workbench.git
```

Then ask an agent to:

```text
setup the workbench in {your workspace path}
```

That setup will:
- create `AGENTS.md` plus a stub file for every supported agent (`CLAUDE.md`, `GEMINI.md`, `CODEX.md`, etc.) in the workspace root
- create the same stub files in every project folder, each pointing to the project's own `AGENTS.md`
- initialize `agents-workbench/local/` from templates if needed
- scan for projects in the workspace and bootstrap them

**Bootstrap scan depth**: the bootstrap scans one level into the workspace root and one level deeper for grouped project folders (e.g. `{workspace}/company/repo`). It will not recurse further without asking. This keeps setup fast and predictable.

## Repository Layout

- `AGENTS.md` is the single source of truth — all agents ultimately read this
- `CLAUDE.md`, `GEMINI.md`, `CODEX.md` are compatibility stubs — each agent reads its native file, which redirects here
- teammates clone this repo into their workspace folder alongside their other projects
- setup creates the same stub files in the workspace root and every project folder
- `shared/` contains the shared system
- `templates/` contains starter files for local setup and project bootstrap
- `local/` is reserved for per-user local files and is intentionally not committed

## Shared Areas

- `shared/core/` holds general behavior, communication, and permission rules
- `shared/domains/` holds domain-specific operating modes
- `shared/workflows/` holds reusable task workflows
- `shared/memory/` holds durable shared memory

## Workflows

This system runs on trigger phrases, not commands. Instead of memorizing a command vocabulary, you say what you mean and the agent routes to the right workflow:

| Instead of a command... | Just say... |
|---|---|
| `/debug` | "debug X", "something is wrong with X", "figure out why X is broken" |
| `/commit` | "commit", or "commit code", "land this change", "is this ready to commit" |
| `/plan` | "how should we approach X", "let's plan X" |
| `/research` | "research X", "Evaluate X", "compare X vs Y", "what are the options for X",  | 

If a phrase isn't recognized, the agent infers the closest match, tells you, and adds the phrase to the trigger list so it works automatically next time. The vocabulary grows from real usage. You can also add triggers manually to any workflow file under `## Trigger Phrases`.

No command vocabulary to memorize. Say what you mean.

The complete and always up-to-date workflow list lives in `shared/manifest.md` under **Workflow Inference**. A few examples:

| Workflow | What it covers |
|---|---|
| `new-workflow.md` | Creating a new workflow — domain/role creation, platform research, end-to-end process mapping, adjacent workflow recommendations |
| `research.md` | Technical or product research, with a decision-ready conclusion |
| `debugging.md` | Investigating a bug or unexpected behavior |
| `improve-workbench.md` | Improving the workbench itself |

New workflows are added to `shared/manifest.md` automatically when created. The README is not updated for individual workflow additions.

## Local Files

These are user- or task-specific files and should not be committed to the shared repo.

Use `local/` for per-user setup and memory:
- `setup.toml`
- `who-i-am.md`
- `personal-memory.md`

Use `workspace/` for task-specific working files created by agents or users during active work:
- scratch notes
- task plans
- temporary reports
- one-off artifacts that help complete a task but should not live in the shared system

## Canonical File Policy

`AGENTS.md` is the single source of truth in every project. All other agent files (`CLAUDE.md`, `GEMINI.md`, `CODEX.md`, and any future additions) are compatibility stubs — they exist only to redirect the agent to `AGENTS.md`.

If any stub file contains real instructions, merge them into `AGENTS.md` first, then replace the stub.

To add support for a new agent tool, say: `"add [AgentName] to compatible agents"` — the `new-agent.md` workflow handles the rest.

## Protected Branches

Each project's `AGENTS.md` defines which branches agents must never commit or push to directly. If a project doesn't define them explicitly, the workspace defaults apply: `main`, `master`, `production`, `prod`, `release`, and any branch starting with `rd` are protected. All other branches are freely workable.

The bootstrap and new-project workflows will prompt for protected branches when setting up each project.
