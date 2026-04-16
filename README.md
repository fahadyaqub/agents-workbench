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

The agent will automatically scan your directories, plant lightweight compatibility stubs in your projects, and initialize your private configuration.

## Key Features

- **Agent Agnostic:** Works flawlessly with Claude, Gemini, ChatGPT, or any future tool.
- **Single Source of Truth:** Eliminates scattered `.md` files by replacing them with global pointers.
- **Explain Once, Execute Everywhere:** Instead of writing out a complex, multi-step prompt every time you start a new task, you define that workflow once. Every agent immediately knows how to perform that exact sequence across all of your projects.

## Key Components

**1. Workflows (Task Execution)**
The workbench relies on automated workflows triggered via plain conversational language instead of strict slash commands:

| Instead of... | Just tell your agent... |
|---|---|
| `/debug` | "Figure out why the site is down" or "Debug the login issue" |
| `/plan` | "Let's plan the Q3 roadmap" or "How should we approach this launch?" |
| `/design` | "Design a social media campaign" or "Design a software product feature" |

If a phrase isn't recognized, the agent routes to the closest workflow and saves your exact wording so it understands you perfectly next time.

**2. Domains (Agent Mindsets)**
Behind the scenes, agents dynamically load domain files (e.g., `finance.md`, `marketing.md`, `software-engineering.md`) to adopt the correct mindset before acting. This prevents you from writing massive prompts every time you switch disciplines.

**3. Local vs. Shared Scopes**
Everything starts private. Experimental workflows, memories, and scratchpads live in your `local/` sandbox. Tools are only published to the `shared/` team repository once they are proven.

**4. Compatibility Stubs**
Agents don't wander. A tiny pointer file in every project continuously redirects any compatible agent back to this global instruction base.

## How to Expand It

Beyond performing regular tasks, you can directly instruct your agent to upgrade the workbench itself:

### 1. Create a New Workflow
> *"Create a new workflow for [Task]"*

The agent scaffolds the execution steps, sets up tools, and drops a runnable workflow directly into your private `local/` folder.

### 2. Add Support for a New Agent
> *"Add [Agent Name] to compatible agents"*

Instantly generates the compatibility stubs that tie your new agent software to the global registry.

### 3. Run Doctor (Update the Workbench)
> *"Run the workbench doctor"*

If you move files around or install fresh repositories, the doctor audits and safely repairs all your global project pointers.

### 4. Share and Publish Workflows
> *"Publish the local workflow [Name]"*

Promotes a local workflow from your private sandbox into the `shared/` directory, surfacing it for the rest of your team.
