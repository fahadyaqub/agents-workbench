# Agents Workbench

Agents Workbench is a shared set of instructions, workflows, and conventions, and working memory for AI agents. It covers product, engineering, sales, marketing, and finance — anyone on the team using an AI agent can use it.

**Key features:**
- **Agent agnostic** — works with Claude, Gemini, Codex, or any agent that reads markdown instruction files
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
- domain and role files covering engineering, design, QA, architecture, sales, marketing, finance, and product
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
- create `AGENTS.md`, `CLAUDE.md`, and `CODEX.md` as pointer stubs in the workspace root
- initialize `agents-workbench/local/` from templates if needed
- scan for projects in the workspace and bootstrap them

**Bootstrap scan depth**: the bootstrap scans one level into the workspace root and one level deeper for grouped project folders (e.g. `{workspace}/company/repo`). It will not recurse further without asking. This keeps setup fast and predictable.

## Repository Layout

- `AGENTS.md` is the tracked bootstrap entrypoint inside this repo
- teammates clone this repo into their workspace folder alongside their other projects
- setup then creates parent-level pointer files in the workspace root
- `CLAUDE.md` and `CODEX.md` are compatibility stubs
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

| Workflow | What it covers |
|---|---|
| `bootstrap.md` | First-time workspace setup |
| `new-project.md` | Adding a project to the workspace |
| `new-workflow.md` | Creating a new workflow file |
| `new-domain.md` | Creating a new domain file |
| `improve-workbench.md` | Improving the workbench itself |
| `feature-planning.md` | Planning a feature end-to-end |
| `planning.md` | General planning and scoping |
| `research.md` | Technical or product research |
| `code-review.md` | Reviewing code changes |
| `debugging.md` | Investigating a bug or unexpected behavior |
| `debugging-sentry.md` | Debugging from a Sentry error report |
| `debugging-signoz.md` | Debugging from SigNoz traces and latency data |
| `bugfix.md` | Implementing and landing a fix after root cause is known |
| `commit-and-push.md` | Committing and pushing changes safely |
| `add-agent.md` | Adding a new AI agent tool as a compatible stub across all projects |

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

Within projects, prefer:
- `AGENTS.md` as the single source of truth
- `CLAUDE.md` as a compatibility stub
- `CODEX.md` as a compatibility stub

If agent-specific files contain meaningful instructions, merge that guidance into `AGENTS.md` first, then replace them with stubs.

## Protected Branches

Each project's `AGENTS.md` defines which branches agents must never commit or push to directly. If a project doesn't define them explicitly, the workspace defaults apply: `main`, `master`, `production`, `prod`, `release`, and any branch starting with `rd` are protected. All other branches are freely workable.

The bootstrap and new-project workflows will prompt for protected branches when setting up each project.
