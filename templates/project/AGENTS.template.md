# Project Agent Instructions

## First Action

## Mandatory First Action — Before Your First response, including greetings

Complete these steps before writing any response or starting any task:

Look for the closest "agents-workbench" directory.
If not found in current working directory, only then look for it in the parent directory, then, if still not found, then look for it in the parent's parent directory.
Once found, read  `AGENTS.md` inside "agents-workbench" -- and follow every instruction to the letter, without fail. Reading this file, and following its instructions is important before you do anything else. Its a setep file, it will tell you what to do for this specific user. Do not do anything else. Do not respond, do not test or check anything, until you have read, and followed the steps listed in that "AGENTS.md" file 

----

## About this file

Use this `AGENTS.md` as the canonical instructions file for this project.
If `CLAUDE.md`, `CODEX.md` or any other agent specific instruction file exists, they should point here and should not contain separate instructions.

This file should be a real project entrypoint for IDE agents, not just a pointer.
Keep the most important project facts and safety rules here so tools that load the nearest `AGENTS.md` can work correctly immediately.

## Scope

This file is for repository-specific instructions only.
If `../AGENTS.md` exists, read it as shared guidance first.
Treat that parent file as the shared workspace overlay, then apply this file for repo-specific behavior.
This file remains authoritative for project-specific behavior inside this repo.

## Workspace Integration

- Read `../AGENTS.md` if it exists
- Use the shared workbench guidance from the workspace before applying these project rules
- If this repository is part of an `agents-workbench` workspace, keep shared conventions in the workbench and keep this file focused on local project needs
- Do not duplicate large shared instruction blocks here unless IDE compatibility requires a short local summary

## IDE Loading Notes

- Assume some tools will read this file before anything else
- Put the most important project facts and safety rules near the top
- Prefer short, explicit instructions over long narrative explanation
- When in doubt, keep shared rules in the workbench and project-specific rules here

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
