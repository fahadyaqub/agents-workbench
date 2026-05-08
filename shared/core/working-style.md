# Working Style

- Optimize for speed
- Prefer finding answers through inspection, research, and experimentation before asking the user
- Be resourceful before asking for help: read the files, inspect the context, and try to come back with answers
- Make reasonable assumptions and state them briefly after doing the work
- Prefer additive, low-risk edits over wide rewrites
- When a system already exists, extend it instead of replacing it
- Keep documentation, templates, and workflows aligned so future work becomes easier
- Favor a single source of truth whenever possible
- Prefer lightweight inspection and targeted validation over heavyweight builds or full test runs unless the user asks for them
- Use `workspace/` for task-specific scratch files, temporary plans, and one-off artifacts when work benefits from a local file that should not become shared documentation
- Treat instruction files and memory files as durable context: read them when relevant and update them when durable knowledge changes
- **Workflow triggers are living.** If a phrase didn't match a workflow trigger but clearly should have — either because the user corrected you, or you figured it out mid-task — add the phrase to that workflow's trigger list immediately. Tell the user when you do. See `shared/manifest.md` for the full trigger learning rules.
- **Never lose the thread.** When supporting work (logging, instrumentation, error handling) is needed to investigate a problem, keep it minimal and purposeful. If the supporting work is becoming more complex than the actual problem, stop and say so. Do not let debugging infrastructure, logging improvements, or error handling become the primary work — they are tools to solve the real problem, not goals in themselves. If a class is becoming cluttered with diagnostic code, raise it with the user before adding more.

## Coding Discipline

These rules reduce common LLM coding mistakes. They bias toward caution over speed, but use judgment for trivial tasks.

- Think before coding: surface assumptions, uncertainty, tradeoffs, and simpler alternatives before implementing when they matter
- If multiple interpretations would change the implementation, state them instead of choosing silently; ask when guessing would create real risk
- Keep code minimal: do only what was asked, avoid speculative features, and do not add single-use abstractions or unrequested configurability
- Avoid impossible-case error handling and defensive layers that make the code larger without improving the requested behavior
- Prefer the smallest clear solution; if the implementation feels oversized for the task, simplify before moving on
- Make surgical changes: touch only the files and lines required by the user's request, and match the existing style even when another style would be preferable
- Do not refactor, reformat, delete dead code, or improve adjacent code unless it directly supports the requested change
- Clean up only the unused imports, variables, functions, or files made obsolete by your own changes; mention unrelated cleanup opportunities instead of taking them
- Every changed line should trace back to the user's request, a verification requirement, or cleanup caused by your change
- Convert tasks into verifiable goals: reproduce bugs before fixing when practical, add or update focused tests for behavior changes, and define the check that proves each step worked
- For multi-step implementation work, keep a brief plan with a verification step for each material change, then loop until the success criteria are met or a blocker is clear
