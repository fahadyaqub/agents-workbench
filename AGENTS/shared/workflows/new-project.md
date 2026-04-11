# Workflow: New Project

Use this workflow whenever a new project is created inside the workspace root.

## Goals

- Ensure every new project starts with agent-friendly structure
- Keep project-specific guidance in the project
- Reuse the shared workspace system instead of duplicating domain guidance across repos
- Standardize on `AGENTS.md` as the canonical agent instructions file
- Support projects created either directly under the workspace root or inside a project group folder

## Required Steps

1. Confirm the project lives under the workspace root or inside a workspace project group folder
2. Check whether `AGENTS.md` already exists
3. If missing, create it from `templates/project/AGENTS.template.md`
4. Detect whether `CLAUDE.md` or `CODEX.md` exist
5. If they do not exist, create compatibility stubs that point to `AGENTS.md`
6. If they do exist and contain useful content, migrate that content into `AGENTS.md` before replacing them with stubs
7. Inspect the repo for existing workflow docs and reference them instead of duplicating them
8. Fill in detected basics in `AGENTS.md`:
   - project purpose
   - stack and languages
   - important paths
   - project-specific working rules
9. Keep the project file portable:
   - do not hardcode personal machine paths
   - do not require another teammate's private workspace setup

## Project Group Support

If the new project is inside a project group folder:
- treat the nested repository as the actual project target
- do not place project-specific instructions only on the group folder unless that folder is also a real repo
- keep company- or org-level guidance separate from repo-specific guidance when both exist

## Existing Project Rule

If the project already has agent or workflow docs, preserve them.
The default action is merge-and-augment, not replace-and-rewrite.

## Future Expansion

Add future new-project standards here as the team develops better project bootstrap patterns.
