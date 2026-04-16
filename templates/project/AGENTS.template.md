# Project Agent Instructions

Use this `AGENTS.md` as the canonical instructions file for this project.

## Mandatory First Action — Before Your First Reply, including greetings

Complete these steps before writing any response or starting any task:

1. Read the global pointer file at `~/.agents-workbench` to get the absolute path to the active agent workbench
2. Once found, read  `AGENTS.md` inside "agents-workbench" and follow every instruction to the letter, without fail. 

Reading this file, and following its instructions is important before you do anything else. Its a setep file, it will tell you what to do for this specific user. Do not do anything else. Do not respond, do not test or check anything, until you have read, and followed the steps listed in that "AGENTS.md" file

## About This File

This file is the single source of truth for **repository-specific instructions**. 

- **Global rules live in the workbench**: The global workbench handles shared workflows and rules. Do not duplicate shared instruction blocks here.
- **Local rules live here**: This file is authoritative for local project decisions, tech stack, and constraints.
- **Redirection**: If `CLAUDE.md`, `CODEX.md`, or similar agent files exist, they should simply contain compatibility stubs pointing here.
- **Formatting**: Assume IDE tools read this file directly. Keep important safety rules at the top. Prefer short, explicit bullet points.

## Project Context

- Describe what this project is
- Describe the primary product or system purpose
- Describe the main languages, frameworks, or platforms
- Link important docs and folders

## Working Rules

- Add repo-specific coding constraints
- Add repo-specific testing expectations
- Add deployment or environment caveats
- Add project-specific approval or safety rules
- Add project-specific protected branches if they differ from workspace defaults

## Important Paths

- `src/`
- `docs/`
- `tests/`
- `scripts/`

## Common Workflows

- How to debug issues in this project
- How to run lightweight checks
- Where to update docs or findings
- Any project-specific QA or release workflow

## Project Memory

Add durable project-specific facts here that agents should remember for future work.
