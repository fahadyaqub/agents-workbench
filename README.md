# Agents Workbench

Agents Workbench is a zero-install, markdown-native operating layer for AI agents. It acts as a single, unified brain—including instructions, memory, and workflows—that all your agents share across all your projects.

Instead of endlessly restating your rules, scattering memory across chat logs, or fighting setup friction every time you start a new task, you explain it once. Every agent you use instantly derives its behavior from this shared knowledge base.

## How to Set It Up

Your **workspace folder** is wherever you keep your projects (e.g., `~/work` or `~/projects`). Clone this repository into the root of your workspace:

```sh
git clone https://github.com/fahadyaqub/agents-workbench.git
```

Open your AI agent, and say:
> *"Setup the workbench in {your workspace path}"*

The agent will automatically scan your directories, plant lightweight compatibility stubs in your projects, and initialize your private configuration. You're done.

## What It Does

- **Agent Agnostic:** Works flawlessly with Claude, Gemini, ChatGPT, or any future agent tool. It dictates the behavior, not the platform.
- **Single Source of Truth:** Eliminates scattered `.md` files by replacing them with global pointers. Your instructions and memories live in one place.
- **Natural Language Routing:** No rigid vocabulary or slash commands. Say what you need (e.g., "design social media campaign around this" or "design a software product feature"), and the agent autonomously routes to the correct automated workflow.
- **Private-First:** Experimental workflows, memory, and scratchpads live in a private local sandbox. Only proven workflows are promoted to the shared team repository.
- **Safe by Default:** Configures global safety guardrails (like protected branches or read-only folders) so agents never blindly overwrite production files.

## How Domains Work

Domains define the *mindset* and *rules* an agent should adopt for a specific kind of work. When a task comes in, the agent infers the domain and loads the matching file.

For example, the workbench might contain domains like:
- `product-management.md` (Strategy, roadmaps, requirement gathering)
- `marketing.md` (Positioning, campaigns, copywriting)
- `finance.md` (Budgets, pricing, unit economics)
- `software-engineering.md` (Implementation, debugging, code quality)
- `creative-arts.md` (Digital art, video, content production)

An agent uses these domains to know exactly how to think and what judgment to apply without you having to prompt it from scratch.

## Examples

Because the system runs on natural language triggers instead of strict terminal commands, you can just speak plainly:

| Instead of... | Just tell your agent... |
|---|---|
| `/debug` | "Figure out why the site is down" or "Debug the login issue" |
| `/plan` | "Let's plan the Q3 roadmap" or "How should we approach this launch?" |
| `/research` | "Compare X vs Y" or "What are the market options for X?" |

If a phrase isn't recognized, the agent finds the closest workflow, executes it, and saves your phrase to its trigger list so it understands you perfectly next time.

## How to Use It

Beyond asking agents to perform regular tasks using the shared intelligence of the workbench, you can directly ask them to expand the workbench's capabilities:

### 1. Create a New Workflow
> *"Create a new workflow for [Task]"*

The agent will scaffold the exact roles needed, determine execution steps, set up tools, and drop a fully runnable workflow directly into your private `local/workflows/` directory.

### 2. Add Support for a New Agent
> *"Add [Agent Name] to compatible agents"*

Instantly generates the compatibility stubs that tie your new agent tool to the global instruction set across all the projects in your workspace.

### 3. Run Doctor (Update the Workbench)
> *"Run the workbench doctor"*

If you move files around, install a fresh project, or change folder structures, the doctor audits the workspace drift and safely repairs all the global pointers so your agents never get lost.

### 4. Share and Publish Workflows
> *"Publish the local workflow [Name]"*

All new workflows, domains, and memory default to private isolation. Once you prove that a local workflow is powerful, tell the agent to publish it. It will promote the asset to the `shared/` directory, exposing it to the rest of the team.
