# Agents Workbench

Agents Workbench is a shared set of instructions, workflows, and conventions, and working memory for AI agents. It covers product, engineering, sales, marketing, and finance — anyone on the team using an AI agent can use it.

## Setup

Your **workspace folder** is wherever you keep all your project repositories — it could be `~/work`, `~/projects`, `~/code`, or anything else. Clone this repo in the root of your workspace folder:

```sh
git clone https://github.com/fahadyaqub/agents-workbench.git
```

After cloing, just ask any agent to:, 

```text
setup the workbench in {your workspace path}
```
And you are done.

That setup will:
- create `AGENTS.md` plus a stub file for every supported agent (`CLAUDE.md`, `GEMINI.md`, `CODEX.md`, etc.) in the workspace root. 
- initialize setup in `agents-workbench/local/`
- scan for projects in the workspace and bootstrap them

Once setup, all ai agents, working on any of the projects in this directory, now have a shared knowledge base. This includes, agent personalities, personas, how to communicate, what not do to, permissions, and a shared knowledge of your workspace. 

All agents now share the same memory as well, so mistakes and improvements made by one agent, are also known to others.

**IMPORTANT:** Bootstrap scan depth: the bootstrap scans one level into the workspace root and one level deeper for grouped project folders (e.g. `{workspace}/company/repo`). It will not recurse further without asking. This keeps setup fast and predictable.

## How to use
Other than the shared knowledgebase and active memory, you can ask agents to perform repeated tasks using simple text phrases.

For example:

```text
prepare a PR for this change
```

This will trigger the `commit-and-push.md` workflow, which will:
1. Review the changes
2. Cleanup any debug code or logs
3. Run unit tests (if setup)
4. Warn if you are not in a protected branch (pause for explicit approval).
5. Create the commit
6. Push the changes to the remote repository

There are several predefined "workflows" that this system can do out of the box, but you can always add your own to the list.

## Workflows

This system runs on trigger phrases, not commands. Instead of memorizing a command vocabulary, you say what you mean and the agent routes to the right workflow:

| Instead of a command... | Just say... |
|---|---|
| `/debug` | "debug X", "something is wrong with X", "figure out why X is broken" |
| `/plan` | "how should we approach X", "let's plan X" |
| `/research` | "research X", "Evaluate X", "compare X vs Y", "what are the options for X",  | 

If a phrase isn't recognized, the agent infers the closest match, tells you, and adds the phrase to the trigger list so it works automatically next time. The vocabulary grows from real usage. You can also add triggers manually to any workflow file under `## Trigger Phrases`.

## Creating a Workflow

Ask your agent to "create workflow". 
The full spec is in `shared/workflows/new-workflow.md`. Key things the system handles during creation:

- **Roles and domain** — determined from first principles based on the type of work. New domain and role files are created if needed.
- **Output folder** — configurable. Defaults to `workspace/` with date and topic-named subfolders if not specified.
- **Scheduling** — workflows can run daily, weekly, or on a custom schedule. The schedule can be set at creation time.
- **Run modes** — drip (one item per run), burst (N items per run), batch (all at once), or drip with approval (one per run, waits for sign-off before advancing).
- **Tool and credential setup** — external dependencies are identified, researched, and set up once. Credentials are stored in `local/personal-memory.md` and reused on every subsequent run.

The complete and always up-to-date workflow list lives in `shared/manifest.md` under **Workflow Inference**.

## Core Workflows

A few workflows are central to how the workbench itself grows and is maintained:

| Workflow | What it does |
|---|---|
| `bootstrap.md` | First-time setup — scans the workspace, creates stub files for every project, initializes local config |
| `new-project.md` | Adds a new project to the workspace — creates the project's `AGENTS.md` and all agent stubs, and makes sure agents working on the project have automatic access to this workbench and knowledgebase |
| `new-workflow.md` | Creates a new workflow — handles domain/role setup, platform research, scheduling, tooling, and end-to-end process mapping |
| `new-agent.md` | Adds support for a new AI agent tool across all projects in the workspace with one command |
| `improve-workbench.md` | Improves or maintains the workbench itself — adding guidance, fixing gaps, updating memory |

These are the starting points for extending the system. Everything else in `shared/workflows/` covers day-to-day tasks (debugging, research, planning, code review, etc.) and user-created workflows built on top.

## Domains

Domains define what kind of work is being done and what roles are responsible for it. When a task comes in, the agent infers the domain and loads the matching file — which tells it how to think, what judgment to apply, and which roles to adopt.

Domains examples:

| Domain | Covers |
|---|---|
| `software-engineering.md` | Implementation, debugging, refactoring, code quality |
| `software-qa.md` | Test planning, verification, release checks |
| `product-management.md` | Strategy, roadmap, prioritization, requirements |
| `marketing.md` | Positioning, campaigns, channel execution |
| `sales.md` | Commercial writing, outreach, revenue work |
| `finance.md` | Budgets, pricing, forecasting, unit economics |
| `research-academic.md` | Research, knowledge synthesis, teaching, curriculum design |
| `creative-arts.md` | Generative AI creation, digital art, short-form video, content production |

New domains are created automatically when a workflow requires one that doesn't exist yet. You can also create one explicitly:

```text
create a domain for [X]
```

This triggers `new-domain` workflow, which determines the right roles, sources reference material, and registers the domain in the manifest.

---

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

## Local/Private work areas

These are user- or task-specific files and are not be committed to the shared repo.

`local/` for per-user setup and memory:
- `setup.toml`
- `who-i-am.md`
- `personal-memory.md`

`workspace/` for task-specific working files created by agents or users during active work:
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
