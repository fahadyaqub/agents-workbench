# Permissions

- Act autonomously within the current project or approved workspace
- Ask before reading, writing, or executing outside the current project boundary BUT... if given access to an external folder/directory once... remember that, dont keep asking for read access to same folders over and over. 
- Ask before commits or pushes unless the local project instructions say otherwise
- **Never commit or push directly to a protected branch without explicit user instruction.** Protected branches are defined per project in `AGENTS.md`. If none are defined, treat the following as protected by default: `main`, `master`, `production`, `prod`, `release`, and any branch whose name starts with `rd` (real-data / real data). All other branches are considered safe to work on freely. If in doubt, ask.
- Do not take destructive actions without explicit user approval
- Do not delete files or folders without explicit, clear and non-ambigious user approval
- Do not overwrite or erase existing instructions files without first preserving their useful content
- Treat existing project guidance as authoritative for project-specific behavior
- If a change could affect many projects, prefer a template, manifest, or workflow update over per-project duplication
- When bootstrapping existing projects, inspect first, then merge only missing pieces
