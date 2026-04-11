# Agents Workbench

Agents Workbench is a reusable operating layer for AI agents across projects, teams, and workflows.

It packages:
- shared core instructions
- domain files
- workflow files
- shared memory
- project templates
- setup and bootstrap guidance

## Repository Layout

- `AGENTS.md` is the tracked bootstrap entrypoint inside this repo
- teammates clone this repo into their workspace folder alongside their other projects
- setup then creates parent-level pointer files in the workspace root
- `CLAUDE.md` and `CODEX.md` are compatibility stubs
- `shared/` contains the shared system
- `templates/` contains starter files for local setup and project bootstrap
- `local/` is reserved for per-user local files and is intentionally not committed

## Teammate Setup

Your **workspace folder** is wherever you keep all your project repositories — it could be `~/work`, `~/projects`, `~/code`, or anything else. Clone this repo directly into it:

```sh
git clone <repo-url> ~/work/agents-workbench
```

Then ask an agent to:

```text
setup the workbench in ~/work
```

Replace `~/work` with your actual workspace path. That setup will:
- create `AGENTS.md`, `CLAUDE.md`, and `CODEX.md` as pointer stubs in the workspace root
- initialize `agents-workbench/local/` from templates if needed
- scan for projects in the workspace and bootstrap them

**Bootstrap scan depth**: the bootstrap scans one level into the workspace root and one level deeper for grouped project folders (e.g. `~/work/company/repo`). It will not recurse further without asking. This keeps setup fast and predictable.

## Shared Areas

- `shared/core/` holds general behavior, communication, and permission rules
- `shared/domains/` holds domain-specific operating modes
- `shared/workflows/` holds reusable task workflows
- `shared/memory/` holds durable shared memory

## Workflows

Agents recognize natural trigger phrases for each workflow. Say what you want to do — the agent will route to the right workflow automatically. If a phrase isn't recognized, the agent will infer the closest match and tell you, then add the phrase to the trigger list for next time.

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

## Local Files

Users should create their own local files in `local/`, such as:
- `setup.toml`
- `who-i-am.md`
- `personal-memory.md`

These should not be committed to the shared repo.

## Canonical File Policy

Within projects, prefer:
- `AGENTS.md` as the single source of truth
- `CLAUDE.md` as a compatibility stub
- `CODEX.md` as a compatibility stub

If agent-specific files contain meaningful instructions, merge that guidance into `AGENTS.md` first, then replace them with stubs.

## Protected Branches

Each project's `AGENTS.md` defines which branches agents must never commit or push to directly. If a project doesn't define them explicitly, the workspace defaults apply: `main`, `master`, `production`, `prod`, `release`, and any branch starting with `rd` are protected. All other branches are freely workable.

The bootstrap and new-project workflows will prompt for protected branches when setting up each project.
